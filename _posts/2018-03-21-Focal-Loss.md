---
layout: post
title: Focal Loss简析(转)
category: 技术
tags: [Objective]
description: 
---

> 这篇[论文](https://arxiv.org/abs/1708.02002)中介绍了一个用于物体识别的新系统。它和现有顶尖的物体识别方案采用了不同的技术路径。目前多数其它系统都由多个阶段组成，
每个阶段都由不同的模型实现，这篇论文中设计了一个模型在一个阶段中解决整个物体识别问题。今天我们一起来看看这篇文章,原博客在[这里](https://zhuanlan.zhihu.com/p/28873248)

# 1.简介 #

现在最高精度的目标识别方法是从R-CNN推广的two-stages的方法。它是在candidate object locations的稀疏集合上面用了分类器。与之相反的，
one-stage的方法是用在可能的object locations上面做常规、密集采样，它具有更快速、更简单的特点，但是精度没有two stages的方法高。
这篇文章主要探究这种情况发生的原因。作者发现 在训练时候出现前景背景（foreground-background）类别的不平衡（imbalance）是中心原因。
作者提出通过reshape标准交叉熵损失解决类别不均衡（class imbalance）,这样它就能降低容易分类的样例的比重（well-classified examples）。
这个方法专注训练在hard example的稀疏集合上，能够防止大量的easy negatives在训练中压倒训练器。（overwhelming the detector）为了评估作者的loss的效率，
作者设计了一个简单的密集检测器（dense detector），名叫RetinaNet。结果显示当RetinaNet在focal loss上训练之后，它能够匹配之前的one-stage detector的速度，
并且优于已有的state-of-the-art的two-stage detector。

现在的state-of-the-art的object detector都是基于one-stage，proposal-driven机理的。像R-CNN框架一样，第一步，生成候选物体定位（candidate object location）的稀疏集合；
第二步，利用卷积神经网络构造分类器将第一步的集合分为前景和背景。这种方法在COCO的benchmark上面达到top准确率。
引出的一个问题是：一个简单的one-stage detector能够达到相似的精度么？One stage detector用于对于物体位置（object location）、比例（scale）、
宽高比（aspect ratio）上面的常规、密集采样。最近的YOLO和SSD显示出有前途的结果，它们更快而且 有10%-40% 在state-of-the-art的two stage方法精准度上面。

这篇文章把性能极限提高了：展示了一个one-stage object第一次达到state-of-art COCO AP（一般是复杂的two-stage方法达到，像Feature Pyramid Network FPN或Mask R-CNN）。
为了达到这个结果，作者在训练时把类别不均衡作为主要的障碍，它阻碍了one stage方法达到state-of-the-art的精度。并且作者提出了新的loss function消除这些屏障。

类别不均衡在类R-CNN方法（两步级联two-stage cascade、采样探索sampling heuristics）中，在proposal stage（像Selective Search、EdgeBoxes、DeepMask、RPN）
能快速地减少candidate object location的数量（1-2k），可以过滤大多数的背景采样。在second classification stage，采样探索，
像固定前景背景率（foreground-to-background ratio）或在线难分样本挖掘（online hard example mining,OHEM），用来保证前景背景之间的平衡。

与之相反，one-stage方法产生candidate object locations更大的集合。实际上常常是枚举到100k的location，密集地包括空间位置、尺度、长宽比。
当相似的sampling heuristic也被应用，它们是低效率的，因为易分背景样本始终在训练产生中占据主要位置。
(They are inefficient as the training procedure is still dominated by easily classified background examples.) 这种低效率是在目标识别的典型问题，
一般通过bootstrapping、hard example mining解决。

这篇论文提出一个新的loss function作为之前解决class imbalance的更高效的替代方法。它能动态地缩放交叉熵，随着正确类别的置信度（confidence in correct class）增加， 
其中的尺度因子衰减到零。直观感受，这个缩放因子可以自动降低训练时easy example贡献的比重，快速地focus hard examples的模型。实验表明Focal Loss可以训练一个高精度、one-stage方法，
它能显著地胜过用sample heuristic或hard example mining训练one-stage的方法（之前的state-of-the-art方法）。最后作者说focal loss的确切形式不是非常重要，其他的样例也可以达到相似的结果。

![](/assets/img/Objective/Floss1.jpg)

为了确定focal loss的高效性，作者设计了简单点的one-stage目标检测方法。RetinaNet,取这个名字的原因是dense sampling object locations。
它通过 in-network feature pyramid和anchor boxes来设计特征。RetinaNet高效而且准确度。基于ResNet-101-FPN backbone，达到COCO test-dev ( 39.1 AP 5fps)

![](/assets/img/Objective/Floss2.jpg)

# 2.相关工作 #

**Classic Object Detectors**：滑动窗口。HOG(方向梯度直方图，Histogram of oriented gradient)。DPMs。

**Two-stage Detectors**： Selective Search，R-CNN，RPN(Region Proposal Networks)。Faster R-CNN。

**One-stage Detectors**： OverFeat， SSD， YOLO。 SSD在 AP上低了10-20%。最近two-stage方法通过减少输入图片的分辨率和proposal的数量增加速度，
one-stage方法训练用更大的计算budget。本文的目的是理解one-stage方法可以匹配或者超过two-stage的精度同时标尺相似或者更快的速度。RetinaNet与之前方法有很多相似，
像RPN的anchor和在SSD和FPN中的feature pyramid。

**Class Imbalance**:之前的one-stage方法训练时都面临类别不平衡问题。要评估10^4-10^5候选定位，但是只有很少包含对象。类别不平衡导致两个问题：

（1）训练不高效，大多数位置都是easy negtive，贡献很少的有用学习信号（useful learning signal）。

（2）easy negative 会overwhelm主导训练，导致退化的模型（degenerate models）。

常用的解决思路是用hard negative mining。难分类负样本挖掘。在训练时采样难分样本，或者更复杂的采样、重新分配权重计划。Focal loss不用sample，也不会让easy negative主导损失和梯度。

Robust Estimation：Focal loss是通过降低inliers（easy examples）的权值，这样它们对总的loss的贡献很小（即使它的值很大）。换句话说，focal loss有robust loss的对立作用，
它将训练集中在hard example的稀疏集合上面。（it focuses training on a sparse set of hard examples）

**解释inliers**:

![](/assets/img/Objective/Floss3.jpg)

如图所示，给定一些点（红+绿+黑）要求用这些数据点拟合椭圆以ransac拟合椭圆为例，可以看出，黄色椭圆为拟合结果，
红色点是由ransac随机选择用来拟合的数据点黑色点是除红色点外距离椭圆距离小于某一阈值的点，而绿色点是距离椭圆距离大于这一阈值的点那么，红色+黑色点即为内点，而绿色点为外点。

# 3.Focal Loss #

Focal Loss是被设计来针对one-stage object detection方案的，其中在训练中有在前景和背景类别之间的完全不平衡存在（1:1000）。
先从对于binary classification的交叉熵（CE,cross entropy）损失来介绍Focal Loss。

![](/assets/img/Objective/Floss4.jpg)

移除y∈{-1,1}是ground truth class，p∈[0,1]是模型对于标签y=1的估计概率。

为了方便标记，记Pt:

![](/assets/img/Objective/Floss5.jpg)

重写

![](/assets/img/Objective/Floss6.jpg)

当大量的easy examples叠加，这些小的损失值可以主导那些稀少的类。

## 3.1.Balanced Cross Entropy

针对class imbalance的常用方法是用一个权重参数α∈[0,1]对于类1，1-α对于类-1。实际应用上，α一般被设定为类频率的逆或者作为超参数，通过交叉验证设定。
为了标记方便，定义αt，相似的定义Pt。α-balanced CE loss:

![](/assets/img/Objective/Floss7.jpg)

## 3.2.Focal Loss Definition

训练时遇到很大的类别不平衡会主导交叉熵损失。易分负样本在梯度和损失中占据主导地位。而α平衡了正负样本的重要性，它不会区别易分样本和难分样本。
与之不同，作者将损失函数变形降低易分样本的权重，专注于训练难分负样本。

更加形式化地来说，作者加了(1-Pt)^γ到交叉熵上。γ是可以可以调节的专注参数γ>0。这样，Focal loss定义为：

![](/assets/img/Objective/Floss8.jpg)

![](/assets/img/Objective/Floss9.jpg)

说一下Focal loss的属性：

（1）当一个样例被误分类，那么Pt很小，那么调制因子（1-Pt）接近1，损失不被影响；当Pt→1，因子（1-Pt）接近0，那么分的比较好的（well-classified）样本的权值就被调低了。

（2）专注参数γ平滑地调节了易分样本调低权值的比例。γ增大能增强调制因子的影响，实验发现γ取2最好。

直觉上来说，调制因子减少了易分样本的损失贡献，拓宽了样例接收到低损失的范围。举例来说，当γ=2时，一个样本被分类的Pt=0.9的损失比CE小1000多倍。
这样就增加了那些误分类的重要性（它们损失被缩了4倍多，当Pt<0.5且γ=2）

作者用了α-balanced的Focal Loss的变体。作者发现它能提升一点点精度。

![](/assets/img/Objective/Floss10.jpg)

作者也提到，在利用损失层时候，结合sigmoid计算p，然后算损失，能增加数值稳定性。

## 3.3.Class Imbalance and Model Initialization

Binary分类模型是默认初始化为对于y=-1和y=1有相同的概率的。在这样的初始化之下，由于类不平衡，出现频率高的类会主导总的损失，在训练早期导致不稳定。
为了对抗这个，作者提出“优先”的概念，在训练初期对于模型对于低频率的类（背景）估计的p给予“优先”。作者把这个“优先”（prior）记做![](/assets/img/Objective/Flossbase1.png),
设定它，以至于模型对于低频率类别（rare class）的样本的估计p很低，比如说0.001。这是模型初始化的改变，而不是损失函数的改变。
作者发现这点能改进训练的稳定性（对于在类极不平衡的情况下的交叉熵和focal loss都有效）。

3.4.Class Imbalance and Two-stage Detectors

Two-stage detectors常用交叉熵损失，而不用![](/assets/img/Objective/Flossbase2.png)或者作者的方法。它们用两种途径解决这个问题：

- two-stage cascade （双阶段级联）
- biased minibatch sampling（有偏批量采样）

第一个stage是一个object proposal机理，将几乎无穷个可能的object locations减少到一两千个。重要的是，这种方法的选择不是随机的，
是跟true object locations（标签的框）相关的，能够除掉大部分的easy negative。

第二个stage的训练中，biased sampling是一种典型的构建minibatch的方法，比如说1:3的正负样本比例。这个比例就像在采样时使用了![](/assets/img/Objective/Flossbase2.png)项。
作者的方法focal loss是用来在one-stage的检测中通过损失函数来解决这个问题。

# 4.RetinaNet Detector #

RetinaNet是单个、统一化的网络，由backbone网络和task-specific任务相关的子网络组成。Backbone是负责计算卷积的feature map的，是一个现存的卷积网络。
第一个子网络是在Backbone输出上面进行object classification目标分类的；第二个子网络是在产生bounding box regression的。网络结构给出：

![](/assets/img/Objective/Floss11.jpg)

**Feature Pyramid Network Backbone**:

作者用了Feature Pyramid Network，FPN作为Retina的Backbone。FPN提出标准的有top-down pathway上下通道和lateral connections横向连接的卷积网络，
所以网络从单分辨率的图像中构建了一个丰富、多尺度特征金字塔。从上图的(a)(b)可以看出来。

作者在ResNet的顶部构建FPN,用P3到P7层构建了金字塔。（第 l 层分辨率是第一层的![](/assets/img/Objective/Flossbase3.png)）。只用最后一层的特征的话AP很低。

**Anchors**:

作者用了translation-invariant anchor boxes 平移不变锚与RPN的变体相似。这个anchor在金字塔层P3到P7有相应的 32^2 到 512^2 的区域。
在每个金字塔层，作者用的长宽比是{ 1:2，1:1,2:1 }。在每层，对于三个长宽比的anchor，加了anchor的形状的{ 2^0,2^{1/3}，2^{2/3} }的anchor。
这能够增加AP。对于每层，有A=9个anchor，穿过这些层，它们可以覆盖32-813个输入图片中的像素。每个Anchor都是K个分类目标的one-hot向量（K是目标类别数）和4个box regression目标。
作者设定anchor的方式是与ground-truth 的intersection-over-union (IoU) 阈值0.5，与背景IOU [0,0.4) 。所有的anchor都被设定为一个box，
在预测向量的对应的类位置设1，其他的设为0。如果没有被设定，那么![](/assets/img/Objective/Flossbase4.png),它是在训练时候被忽略的。
Box regression targets是计算出来的每个anchor和它设定的object box的偏移量，如果没有设定那么忽略。

**Classification Subnet**:

分类子网络在每个空间位置，为A个anchor和K个类别，预测object presence的概率。这个子网络是小的FCN（全卷积网络），与FPN中的每层相接；这个子网络的参数在整个金字塔的层间共享。
设计方法是：如果一个从金字塔某个层里来的feature map是C个通道，子网络使用 四个3x3 的卷积层，C个滤波器，每个都接着ReLU激活函数；
接下来用 3x3 的卷积层，有 KA 个滤波器。最后用sigmoid激活函数对于每个空间位置，输出 KA 个binary预测。作者用实验中 C=256 A=9 。

![](/assets/img/Objective/Floss12.jpg)

与RPN对比，作者的object classification子网络更深，只用 3x3 卷积，且不和box regression子网络共享参数。作者发现这种higer-level设计决定比超参数的特定值要重要。

**Box Regression Subnet**:

与object classification子网络平行，作者在金字塔每个层都接到一个小的FCN上，意图回归每个anchor box对邻近ground truth object的偏移量。
回归子网络的设计和分类相同，不同的是它为每个空间位置输出4A个线性输出。对于每个空间位置的A个anchor，4个输出预测anchor和ground-truth box的相对偏移。
与现在大多数工作不同的是，作者用了一个class-agnostic bounding box regressor，这样能用更少的参数更高效。
Object classification和bounding box regression两个网络共享一个网络结构，但是分别用不同的参数。

**Inference**:

RetinaNet的inference涉及把图片简单地在网络中前向传播。为了提升速度，作者只在每个FPN，从1k个top-scoring预测中提取box预测（在置信度阈值0.05处理之后）。
多个层来的Top prediction聚在一起然后用NMS（非极大值抑制）以0.5为阈值。

![](/assets/img/Objective/Floss13.jpg)

**Focal loss**:

作者在分类子网络输出的地方用了focal loss。发现在![](/assets/img/Objective/Flossbase5.png)为2的时候效果比较好。
同时RetinaNet在![](/assets/img/Objective/Flossbase5.png)[0.5,5] 有相对的鲁棒性。作者重点指出训练Retina时候，在每个采样图片里面，
focal loss被加到所有的100K个anchor上面的。这与通常的heuristic sampling(RPN)或者 hard example mining（OHEM,SSD）选择anchor的一小部分集合（对于每个minibatch大概256）不同。
作者用了特定的anchor（不是全部的anchor，因为大部分的anchor是easy negative在focal loss中有微小的作用）来归一化。
最后![](/assets/img/Objective/Flossbase6.png)是用在设定在出现频率低的类别，有一个稳定的范围，它也和![](/assets/img/Objective/Flossbase5.png)一起。 
这样能把两者融合，调两个参数。一般来说，当![](/assets/img/Objective/Flossbase5.png)增大 ，![](/assets/img/Objective/Flossbase6.png)应该稍微减小
（![](/assets/img/Objective/Flossbase5.png)=2 和 ![](/assets/img/Objective/Flossbase6.png)=0.25 效果最好）。

**Initialization**:

作者在ResNet-50-FPN和ResNet-101-FPN的backbone上面做实验。基础模型是在ImageNet1K上面预训练的。除了最后一层，RetinaNet的子网络都是初始化为bias b=0和权值weight用高斯初始化 \sigma=0.01 。
classification子网络的最后一层的conv层，作者的bias初始化为 b=-log((1-\pi)/\pi) 其中![](/assets/img/Objective/Flossbase1.png)表示每个anchor在开始训练的时候应该被标记为背景的置信度![](/assets/img/Objective/Flossbase1.png)。
作者用![](/assets/img/Objective/Flossbase1.png)=.01 在所有的实验中。这样初始化能够防止大的数量的背景anchor在第一次迭代的时候产生大的不稳定的损失值。

**Optimization**:

RetinaNet是用SGD训练的。作者用了同步的SGD在8个GPU上面，每个minibatch16张图，每个GPU2张图。所有的模型都是训练90K迭代的，初始学习率是0.01（会在60k被除以10，以及在80K除以10）。
作者只用图像的横向翻转作为唯一的数据增广方式。权值衰减0.0001以及动量0.9。训练的损失是focal loss和标准的smooth L1 loss作为box回归。

# 5.Experiments #

主要说了怎么训练Dense Detection，包括initialization,balanced cross entropy,focal loss,分析focal loss,OHEM，Hinge loss,还有Model Architecture Design(模型的设计)。

模型设计主要讲了anchor的设定，Speed与Accuracy的平衡和与state-of-the-art的比较。

# 6.Conclusion #

作者将类别不平衡作为阻碍one-stage方法超过top-performing的two-stage方法的主要原因。为了解决这个问题，作者提出了focal loss，在交叉熵里面用一个调整项，
为了将学习专注于hard examples上面，并且降低大量的easy negatives的权值。作者的方法简单高效。并且设计了一个全卷积的one-stage的方法来验证它的高效性。
在具有挑战性的COCO数据集上面也达到了state-of-the-art的精度和运行时间。

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！