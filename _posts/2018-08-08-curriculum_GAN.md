---
layout: post
title: Curriculum GANs（WGAN-C）论文解读
category: 技术
tags: [GAN]
description: 
---

> [Improved Training with Curriculum GANs](https://arxiv.org/pdf/1807.09295.pdf)是来自斯坦福斯大学的一篇在WGAN基础上为GAN设计了课程，
通过不断地增强判别器的判别能力（增加课程难度），让生成器学习任务更困难，在越来越难的课程下不断进步自己的生成能力，从而实现高质量图像的生成。
虽然是在WGAN的基础上开展的工作但是Curriculum GAN的思想的普适性是有的，所以具有一定的指导意义。

# 论文引入 #

让GAN的训练更稳定生成的样本更加多样性一直是GAN发展的主要动力，[WGAN](https://arxiv.org/abs/1701.07875)、[LSGAN](https://arxiv.org/abs/1611.04076)、
[WGAN-GP](https://arxiv.org/abs/1704.00028)都是在GAN的损失函数上采取改进，将衡量真实和生成样本的分布的JS距离换为更加优越的衡量标准。
WGAN就是在GAN的基础上改进的比较成功的一种。WGAN利用Wasserstein距离代替JS距离，从而避免了一定的梯度消失问题，这也为很多GAN模型的扩展提供了指导。
详细的关于WGAN的知识，可以参看我之前的[博客](http://www.twistedwg.com/2018/01/31/WGAN.html)。

WGAN-GP是在WGAN的基础上改进的，WGAN在保证Lipschitz限制条件时，作者是采用将限制判别器神经网络的所有参数 (这里指权重w)不超过某个范围[-c,c]。
这样做带来了参数上的两极化，为了改进WGAN，WGAN-GP提出了梯度惩罚概念用于满足Lipschitz限制条件。具体展开描述，可以参看我之前的[博客](http://www.twistedwg.com/2018/02/02/WGAN-GP.html)。
Curriculum GANs其是在WGAN-GP的基础上改进的，但是思路是沿袭WGAN所以也称之为WGAN-C。

在训练GAN上有很多trick，比如如何衡量生成器和判别器的强弱从而控制一方的能力；在判别器中加入minibatch，用于衡量更多的样本，从而丰富生成的多样性；
合理的设计网络深度和参数等等。这些trick确实提高了GAN的训练稳定性和生成上的多样但是仍无法避免GAN的问题。为GAN设计课程，从而让生成器逐步的进步。
这在逻辑上是行得通的。WGAN-C就是定义一个越来越严苛的判别器，用于发现生成器的问题，生成器为了欺骗住判别器则要在越来越难的课程任务下不断进步。
由于生成器已经有了先前学习的基础，在最小化真实和生成样本分布上逐渐的进步，有了学习基础增大难度使得生成器的能力越来越强，从而生成质量更高的图像。

总结一下WGAN-C的优势：

- 为GAN设计了一个课程，通过不断提高判别器的判别能力从而增强生成器的能力。
- Curriculum GANs的思想不仅仅适用于WGAN还适用于其它的GAN模型，不仅仅是在图像的生成，在文本到图像，图像到图像都有指导意义。

# WGAN-C思想 #

WGAN-C不考虑固定一个判别器$f_{\omega}$，而是考虑预定义的一组判别器的凸组合，定义$\lambda \in R_+^d$表示，使得$1^T \lambda = 1$。
判别器的组合可以写为$f_{\omega} = \sum_{i=1}^d \lambda_i f_i(x)$。其中的$\lambda$可以被视为是判别器的能力，$\lambda$值越大也就是意味着
判别器的区分能力越强。

这里面是有着一套严格的数学证明的，整体的思路就是随着$\lambda$的增加，越大的$\lambda$可以支配前面的$\lambda$，越大的$\lambda$可以满足
之前的要求同时也增强了现有的能力，从而实现了判别能力的逐步增强。根据难度程度对训练样本进行排序，形成判别器的凸组合。

我们通过文中的图来进一步分析：

<p align="center">
    <img src="/assets/img/GAN/WGAN-C1.png">
</p>

从图中可以看到随着$\lambda_1$到$\lambda_3$逐渐的增大，生成的图像的质量也是越来越好。

# WGAN-C实现 #

我们先来对比一下WGAN-C和WGAN-GP在实现算法上的不同，先上WGAN-GP的实现算法框图：

<p align="center">
    <img src="/assets/img/WGAN/GPal.png">
</p>

我们再来看看WGAN-C的实现算法框图：

<p align="center">
    <img src="/assets/img/GAN/WGAN-C2.png">
</p>

通过对比我们发现，整体上两个是相似的，WGAN-C要多了些操作，那就是多了$\lambda$的选取和相应的判别器的选取，通过不断的提高判别器的判别能力
从而实现生成器的生成能力的不断提高，此处控制梯度惩罚的参数用$\beta$表示了。

# WGAN-C实验 #

WGAN-C的实验主要在正弦曲线的生成和人脸的生成上，在正弦曲线生成上，实验对比了有无课程指导的GAN的生成效果，从下图可以看出来在相同网络下加入
课程指导的GAN生成的正弦曲线更加的真实。

<p align="center">
    <img src="/assets/img/GAN/WGAN-C3.png">
</p>

在生成正弦曲线的定量上也对比了有无课程指导的效果，测量了生成的波与数据集中最接近的正弦波的平均$l-2$误差（通过离散生成数据集的正弦波的范围）。
在训练结束时，渐进式延长策略产生的正弦曲线的平均误差降低了33.6％ - 训练数据集的平均最小距离$l-2$在课程指导下产生的正弦曲线为$1.13±0.01$，
并且没有课程指导生成的误差为$1.51±0.06$。

在人脸生成上，也对比了有无课程指导下的生成效果。

<p align="center">
    <img src="/assets/img/GAN/WGAN-C4.png">
</p>

<p align="center">
    <img src="/assets/img/GAN/WGAN-C5.png">
</p>

# 总结 #

WGAN-C在WGAN的基础上为GAN设计了课程，通过不断增加判别器的判别能力来提高课程的难度，相对应的作为学生的生成器在高难度的课程下不断提高生成能力
从而实现匹配课程难度的生成能力。WGAN-C为GAN设计课程的思路适用于各种GAN模型，同时不仅仅是在图像生成上，在其他GAN的生成上也可以发挥作用。

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！