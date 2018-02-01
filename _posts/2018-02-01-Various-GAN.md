---
layout: post
title: 各类GAN综述
category: 技术
tags: [机器学习,GAN]
description: 
---

>对传统GAN了解后，各类GAN的改进层出不穷，大量paper诞生，本文对近几年GAN的文章作一个简单的综述。

生成对抗网络GAN兴起后，随之而来的GAN自身存在的问题也是在各位学者的严谨证明下展露出来。有问题就有改进，大量围绕着GAN的文章也是爆发式的发表
但是其中不乏存在一些质量很高的文章。本文将对目前比较好的GAN模型做一个汇总和简单的比较，篇幅问题就不详细扩展，在以后的文章中将对其中的一部
分GAN模型做详细的解读。

github上开源的GAN项目代码很多，我总结了一下，用tensorflow和pytorch写了部分GAN模型的代码。tensorflow版本在[这里](https://github.com/TwistedW/tensorflow-GANs),
pytorch版本在[这里](https://github.com/TwistedW/pytorch-GANs).这里主要将GAN按照模型和发表时间分为了[GAN](https://arxiv.org/abs/1406.2661)，
[LSGAN](https://arxiv.org/abs/1611.04076)，[WGAN](https://arxiv.org/abs/1701.07875)，[WGAN-GP](https://arxiv.org/abs/1704.00028)，
[DRAGAN](https://arxiv.org/abs/1705.07215)，[CGAN](https://arxiv.org/abs/1411.1784)，[infoGAN](https://arxiv.org/abs/1606.03657)，
[ACGAN](https://arxiv.org/abs/1610.09585)，[EBGAN](https://arxiv.org/abs/1609.03126)，[BEGAN](https://arxiv.org/abs/1702.08431)，
[DCGAN](https://arxiv.org/abs/1511.06434)。当然了还有很多其他模型下的GAN例如[CycleGAN](https://arxiv.org/abs/1703.10593)，
[DiscoGAN](https://arxiv.org/abs/1703.05192)，[DialGAN](https://arxiv.org/abs/1704.02510v1)等等。我目前只对上述的GAN的模型做
了一定的了解，接下来我将简单参数一下各类GAN的优缺点。

最早GAN的提出是为了通过生成模型和鉴别模型对抗来达到对生成图片最大相似度的伪装，比起VAE的话生成的图片会相对清晰一点。但是GAN的诞生无形带
来了一些问题，主要的问题有两块：

i.判别器越好，生成器的梯度消失越严重，这样就会导致在网络训练上很多时候的weight是基本上不改变的，这个也就是我们认为GAN的理论依据不足的一
个问题。具体的理论公式的推导在WGAN和其作者前期发表的论文中有详细的推导，这里不阐述了。

ii.由于网络是对抗式的，常常会造成训练时模型的崩溃，这样的话在训练时往往需要权衡训练的生成器与鉴别器的参数来防止崩溃的发生。这样在实际的应
用上也带了一些不便。

为了解决GAN的问题，研究者们不断推成出新。LSGAN也称为损失敏感GAN的模型通过限定的GAN的建模能力来试图解决梯度消失问题。LSGAN的核心在于其损
失函数上的改进让模型在训练的过程中更多的关注真实度不高的样本，对于那些训练较好的样本则是花较小的关注度。

WGAN的提出是旨在解决GAN存在的问题，其在GAN的基础上做了些许的变动，论文证明了GAN的梯度消失和不稳定的问题。改进是对生成样本和真实样本加噪
声，直观上说，使得原本的两个低维流形“弥散”到整个高维空间，强行让它们产生不可忽略的重叠；用Wasserstein距离代替JS散度，Wasserstein距离相
比KL散度、JS散度的优越性在于，即便两个分布没有重叠，Wasserstein距离仍然能够反映它们的远近。WGAN的实验结果上确实是得到了不小的提高。每次
迭代更新权重后做weight clipping，把权重限制到一个范围内（例如限定范围[-0.1,+0.1]，则超出这个范围的权重都会被修剪到-0.1或+0.1）。

WGAN-GP对WGAN的weight clipping做出了改进，根据D的输入后向计算出权重梯度，并针对梯度的范数进行惩罚，也就是自适应的对weight做出相应的
调整。

DRAGAN的提出是结合了WGAN和LSGAN两部分，也只是在损失函数上做了一定的改进，通过不断的更新后项系数来控制损失训练上的稳定，基本上的思想通过
繁琐的数学推导证明下来，这篇论文我看的不是特别的清晰。不过实验结果确实是蛮不错的。

CGAN在GAN原有的模型上在生成器和鉴别器上都加入额外的条件信息（additional information）来指导GAN两个模型的训练。条件化（conditional）
GAN做法就是直接把额外的信息（y）直接添加到生成器G和判别器D的目标函数中，与输入Z和X中构成条件概率。

infoGAN在CGAN的基础上又做了创新。本文从disentangled representation角度出发，把信息理论与GAN相结合提出InfoGAN，采用无监督的方式学习
到输入样本X的可解释且有意义的表示（representation）。训练上通过最大化隐变量（latent variable）的一个子集与observation之间的互信息。

ACGAN是比较新的一种GAN的模型，在D的输出部分添加一个辅助的分类器来提高条件GAN的性能，提出 Inception Accuracy 这种新的用于评判图像合成
模型的标准，引进MS-SSIM用于判断模型生成图片的多样性。类标签的提出时文章的一大特色，用于更新和改进损失函数，最后会对上述模型给一张总图。

EBGAN将能量的概念和方法引入到了GAN中，EBGAN的改变在鉴别器上。把D看作是一个energy function，对real image赋予低能量，fake image赋予
高能量。用GAN原理来解释，可以看作generator的outputs输入到discriminator中，我们为达到以假乱真，那么mse向较小的方向更新，即此时G的分布
应该趋近Data的分布。

BEGAN是在EBGAN的基础上改进提出的，模型上两者相似。让生成图像的重构误差分布逼近真实图像的重构误差分布的做法，而传统的GAN的做法是让生成图
像的分布逼近真实图像的分布。文中不断更新kt的比例控制理论的提出在EBGAN上的损失函数上得到提高。

DCGAN是将把CNN与GAN结合，DCGAN的原理和GAN是一样的，把经典GAN中的G和D换成了两个卷积神经网络。去掉了G网络D网络的pooling layer。在G网络
D网络中使用Batch Normalization。

由于不想大篇幅的陈述所以在对每一部分只是写了我的一些总体的体会，一些细节这里不再大篇幅的展开，图1展示了各大GAN模型的框架图。

![](/assets/img/GAN/VarGAN.png)

图1.各类GAN框架

小结一下：GAN的种类发展的相当的快，一些存在的问题也在不断的解决和完善。当然还存在其他GAN模型，在以后的学习过程中将不断的学习。GAN的发展
和创新离不开对结构和损失函数的改进，数学是一个相当重要的环节。所以大家还是把数学好好学起来，打好坚实的基础。

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！