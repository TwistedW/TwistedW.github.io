---
layout: post
title: Faster R-CNN简析（基本上都是引用）
category: 技术
tags: [Objective]
description: 
---

> 既然前面说了RCNN和Fast-RCNN了，今天我们来看看可以做到实时显示目标检测的方法Faster-RCNN,本篇博文主要来自[这里](http://www.cnblogs.com/EstherLjy/p/6774848.html)

# 一、基础引入 #

在之前介绍的Fast-R-CNN中，第一步需要先使用Selective Search方法提取图像中的proposals。基于CPU实现的Selective Search提取一幅图像的所有Proposals需要约2s的时间。
在不计入proposal提取情况下，Fast-R-CNN基本可以实时进行目标检测。但是，如果从端到端的角度考虑，显然proposal提取成为影响端到端算法性能的瓶颈。
目前最新的EdgeBoxes算法虽然在一定程度提高了候选框提取的准确率和效率，但是处理一幅图像仍然需要0.2s。因此，Ren Shaoqing提出新的Faster-R-CNN算法，该
算法引入了RPN网络（Region Proposal Network）提取proposals。RPN网络是一个全卷积神经网络，通过共享卷积层特征可以实现proposal的提取，
RPN提取一幅像的proposal只需要10ms.

Faster-R-CNN算法由两大模块组成：1.PRN候选框提取模块 2.Fast R-CNN检测模块。其中，RPN是全卷积神经网络，用于提取候选框；
Fast R-CNN基于RPN提取的proposal检测并识别proposal中的目标。

![](/assets/img/Objective/FerRCNN1.png)

# 二、Region Proposal Network (RPN) #

RPN网络的输入可以是任意大小（但还是有最小分辨率要求的，例如VGG是228*228）的图片。如果用VGG16进行特征提取，那么RPN网络的组成形式可以表示为VGG16+RPN。

**VGG16**：可以参考[这里](https://github.com/rbgirshick/py-faster-rcnn/blob/master/models/pascal_voc/VGG16/faster_rcnn_end2end/train.prototxt)，
可以看出VGG16中用于特征提取的部分是13个卷积层（conv1_1---->conv5.3），不包括pool5及pool5后的网络层次结构。

**RPN**：RPN是作者重点介绍的一种网络，如下图所示。RPN的实现方式：在conv5-3的卷积feature map上用一个nxn的滑窗（论文中作者选用了n=3，即3x3的滑窗）
生成一个长度为256（对应于ZF网络）或512（对应于VGG网络）维长度的全连接特征。然后在这个256维或512维的特征后产生两个分支的全连接层：

1.reg-layer,用于预测proposal的中心锚点对应的proposal的坐标x，y和宽高w，h；

2.cls-layer，用于判定该proposal是前景还是背景。sliding window的处理方式保证reg-layer和cls-layer关联了conv5-3的全部特征空间。

事实上，作者用全连接层实现方式介绍RPN层实现容易帮助我们理解这一过程，但在实现时作者选用了卷积层实现全连接层的功能。个人理解：全连接层本来就是特殊的卷积层，
如果产生256或512维的fc特征，事实上可以用Num_out=256或512, kernel_size=3x3, stride=1的卷积层实现conv5-3到第一个全连接特征的映射。
然后再用两个Num_out分别为2x9=18和4x9=36，kernel_size=1x1，stride=1的卷积层实现上一层特征到两个分支cls层和reg层的特征映射。
注意：这里2x9中的2指cls层的分类结果包括前后背景两类，4x9的4表示一个Proposal的中心点坐标x，y和宽高w，h四个参数。
采用卷积的方式实现全连接处理并不会减少参数的数量，但是使得输入图像的尺寸可以更加灵活。在RPN网络中，我们需要重点理解其中的anchors概念，
Loss fucntions计算方式和RPN层训练数据生成的具体细节。

![](/assets/img/Objective/FerRCNN2.jpg)

**Anchors**:字面上可以理解为锚点，位于之前提到的nxn的sliding window的中心处。对于一个sliding window,我们可以同时预测多个proposal，
假定有k个。k个proposal即k个reference boxes，每一个reference box又可以用一个scale，一个aspect_ratio和sliding window中的锚点唯一确定。
所以，我们在后面说一个anchor,你就理解成一个anchor box 或一个reference box.作者在论文中定义k=9，
即3种scales和3种aspect_ratio确定出当前sliding window位置处对应的9个reference boxes， 4xk个reg-layer的输出和2xk个cls-layer的score输出。
对于一幅WxH的feature map,对应WxHxk个锚点。所有的锚点都具有尺度不变性。

**Loss functions**:在计算Loss值之前，作者设置了anchors的标定方法。正样本标定规则：

1.如果Anchor对应的reference box与ground truth的IoU值最大，标记为正样本；

2.如果Anchor对应的reference box与ground truth的IoU>0.7，标记为正样本。

事实上，采用第2个规则基本上可以找到足够的正样本，但是对于一些极端情况，例如所有的Anchor对应的reference box与groud truth的IoU不大于0.7,
可以采用第一种规则生成。负样本标定规则：如果Anchor对应的reference box与ground truth的IoU<0.3，标记为负样本。剩下的既不是正样本也不是负样本，
不用于最终训练。训练RPN的Loss是有classification loss （即softmax loss）和regression loss （即L1 loss）按一定比重组成的。
计算softmax loss需要的是anchors对应的groundtruth标定结果和预测结果，计算regression loss需要三组信息：

1.预测框，即RPN网络预测出的proposal的中心位置坐标x,y和宽高w,h；

2.锚点reference box:之前的9个锚点对应9个不同scale和aspect_ratio的reference boxes，每一个reference boxes都有一个中心点位置坐标x_a,y_a和宽高w_a,h_a。

3.ground truth:标定的框也对应一个中心点位置坐标xx,yx和宽高wx,hx。

因此计算regression loss和总Loss方式如下：

![](/assets/img/Objective/FerRCNN3.jpg)

**RPN训练设置**：在训练RPN时，一个Mini-batch是由一幅图像中任意选取的256个proposal组成的，其中正负样本的比例为1：1。如果正样本不足128，
则多用一些负样本以满足有256个Proposal可以用于训练，反之亦然。训练RPN时，与VGG共有的层参数可以直接拷贝经ImageNet训练得到的模型中的参数；
剩下没有的层参数用标准差=0.01的高斯分布初始化。

# 三、RPN与Faster-R-CNN特征共享 #

RPN在提取得到proposals后，作者选择使用Fast-R-CNN实现最终目标的检测和识别。RPN和Fast-R-CNN共用了13个VGG的卷积层，
显然将这两个网络完全孤立训练不是明智的选择，作者采用交替训练阶段卷积层特征共享：

交替训练（Alternating training）: 

Step1:训练RPN;

Step2:用RPN提取得到的proposal训练Fast R-CNN;

Step3:用Faster R-CNN初始化RPN网络中共用的卷积层。迭代执行Step1,2,3，直到训练结束为止。

论文中采用的就是这种训练方式，注意：第一次迭代时，用ImageNet得到的模型初始化RPN和Fast-R-CNN中卷积层的参数；从第二次迭代开始，训练RPN时，
用Fast-R-CNN的共享卷积层参数初始化RPN中的共享卷积层参数，然后只Fine-tune不共享的卷积层和其他层的相应参数。训练Fast-RCNN时，
保持其与RPN共享的卷积层参数不变，只Fine-tune不共享的层对应的参数。这样就可以实现两个网络卷积层特征共享训练。
相应的网络模型请参考[这里](https://github.com/rbgirshick/py-faster-rcnn/tree/master/models/pascal_voc/VGG16/faster_rcnn_alt_opt)

# 四、深度挖掘 #

1.由于Selective Search提取得到的Proposal尺度不一，因此Fast-RCNN或SPP-Net生成的RoI也是尺度不一，最后分别用RoI Pooling Layer或SPP-Layer处理得到固定尺寸金字塔特征，
在这一过程中，回归最终proposal的坐标网络的权重事实上共享了整个FeatureMap，因此其训练的网络精度也会更高。但是，RPN方式提取的ROI由k个锚点生成，
具有k种不同分辨率，因此在训练过程中学习到了k种独立的回归方式。这种方式并没有共享整个FeatureMap，但其训练得到的网络精度也很高。这，我竟然无言以对。有什么问题，请找Anchors同学。

2.采用不同分辨率图像在一定程度可以提高准确率，但是也会导致训练速度下降。采用VGG16训练RPN虽然使得第13个卷积层特征尺寸至少缩小到原图尺寸的1/16（事实上，考虑到kernel_size作用，会更小一些），
然并卵，最终的检测和识别效果仍然好到令我无言以对。

3.三种scale(128x128，256x256，512x512),三种宽高比（1：2，1：1，2：1）,虽然scale区间很大，总感觉这样会很奇怪，但最终结果依然表现的很出色。

4.训练时（例如600x1000的输入图像），如果reference box （即anchor box）的边界超过了图像边界，这样的anchors对训练Loss不产生影响，
即忽略掉这样的Loss.一幅600x1000的图经过VGG16大约为40x60，那么anchors的数量大约为40x60x9，约等于20000个anchor boxes.
去除掉与图像边界相交的anchor boxes后，剩下约6000个anchor boxes,这么多数量的anchor boxes之间会有很多重叠区域，
因此使用非极值抑制方法将IoU>0.7的区域全部合并，剩下2000个anchor boxes（同理，在最终检测端，可以设置规则将概率大于某阈值P且IoU大于某阈值T的预测框
（注意，和前面不同，不是anchor boxes）采用非极大抑制方法合并）。在每一个epoch训练过程中，随机从一幅图最终剩余的这些anchors采样256个anchor box作为一个Mini-batch训练RPN网络。

# 五、实验 #

1.PASCAL VOC 2007：使用ZF-Net训练RPN和Fast-R-CNN,那么SelectiveSearch+Fast-R-CNN, EdgeBox+Fast-R-CNN, 
RPN+Fast-R-CNN的准确率分别为：58.7%，58.6%，59.9%. SeletiveSeach和EdgeBox方法提取2000个proposal，RPN最多提取300个proposal,
因此卷积特征共享方式提取特征的RPN显然在效率是更具有优势。

2.采用VGG以特征不共享方式和特征共享方式训练RPN+Fast-R-CNN,可以分别得到68.5%和69.9%的准确率（VOC2007）。此外，采用VGG训练RCNN时，
需要花320ms提取2000个proposal，加入SVD优化后需要223ms，而Faster-RCNN整个前向过程（包括RPN+Fast-R-CNN）总共只要198ms.

3.Anchors的scales和aspect_ratio的数量虽然不会对结果产生明显影响，但是为了算法稳定性，建议两个参数都设置为合适的数值。

4.当Selective Search和EdgeBox提取的proposal数目由2000减少到300时，Faste-R-CNN的Recall vs. IoU overlap ratio图中recall值会明显下降；
但RPN提取的proposal数目由2000减少到300时，Recall vs. IoU overlap ratio图中recall值会比较稳定。

# 六、总结 #

特征共享方式训练RPN+Fast-R-CNN能够实现极佳的检测效果，特征共享训练实现了买一送一，RPN在提取Proposal时不仅没有时间成本，还提高了proposal质量。
因此Faster-R-CNN中交替训练RPN+Fast-R-CNN方式比原来的SlectiveSeach+Fast-R-CNN更上一层楼。

我创建了一个机器学习方面的交流群，目的是交流机器学习的前景应用、日常code过程中的收获和学习生活中的困难。QQ群号：701451028

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！