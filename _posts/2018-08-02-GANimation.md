---
layout: post
title: GANimation论文解读
category: 技术
tags: [GAN]
description: 
---

> GAN在面部生成上已经取得了很大的成果，[StarGAN](https://arxiv.org/abs/1711.09020)已经可以实现人脸面部的高清和多属性的生成，但是这类生成是基于数据集的，往往在两幅属性不一的图像上做插值生成是实现不了的。当然将VAE或AE和GAN结合可以实现较好的插值生成，但是如何合理的插值仍然是一个困难的过程。[GANimation](https://arxiv.org/pdf/1807.09251.pdf)介绍了一种基于动作单元（Action Units）为条件的新型GAN模型，可以根据ActionUnits（简称AC）的大小调节面部表情生成的幅度，从而实现面部表情不同幅度过程的生成。

# 论文引入 #

从单张人脸面部图像生成出表情变化的多幅图像将为不同领域带来不一样的灵感，比如可以根据单幅照片做不同人物表情变化的图像，这可以用在电影电视的创作中。想象一下让特别严肃的人设做滑稽的表情变化是不是很有意思的一件事。GAN已经可以在人脸面部属性上做很多变换的生成，StarGAN是属性生成上比较好的模型，可以同时生成多属性的人脸图像。但是StarGAN受限于数据集，因为StarGAN的生成是在属性标签的基础上完成的，所以StarGAN不能做插值的渐进生成，虽然VAE和GAN的结合可以实现插值生成，但是合理的插值仍然是一个待解决和优化的过程。GANimation将Action Units（AU）和GAN结合，利用动作单元（AU）来描述面部表情，这些动作单元在解剖学上与特定面部肌肉的收缩相关。

尽管动作单元的数量相对较少（发现30个AU在解剖学上与特定面部肌肉的收缩相关），但已观察到超过7,000种不同的AU组合[30]。例如，恐惧的面部表情通常通过激活产生：Inner Brow Raiser（AU1），Outer Brow Raiser（AU2），Brow Lowerer（AU4），Upper Lid Raiser（AU5），Lid Tightener（AU7），Lip Stretcher（ AU20）和Jaw Drop（AU26）[5]。 根据每个AU的大小，将在表情程度上传递情绪幅度。

为了说明AU的作用，我们一起来看看通过调节特定AU的大小实现的面部表情渐变的效果：

<p align="center">
    <img src="/assets/img/GAN/GANimation1.png">
</p>

由上图我们可以看出来，在AU设置为微笑表情的动作时，随着AU的大小逐渐增大途中人物微笑表情的力度也越来越大，对比度最强的是$AU=0$和$AU=1$的情况下，可以清楚的看到人物面部嘴角和笑脸的变化，当然中间随着AU的增大微笑也是越来越灿烂。

总结一下GANimation的贡献：

- 将动作单元（AU）引入到GAN中实现了人物面部表情渐变生成。
- 将Attention引入到模型中用于克服生成中背景和光照的影响。
- 模型可应用于非数据集中人物面部表情的生成。

# GANimation模型 #

我们一起来看看实现GANimation的模型结构：

<p align="center">
    <img src="/assets/img/GAN/GANimation2.png">
</p>

先把图中的变量交代一下，真实图像记为$I_{y_r}$与它对应的生成的图像记为$I_{y_g}$，$y_g$是动作信息它是属于$N$种动作单元$y_r = (y_1,...,y_N)^T$，由于存在两组生成器（另一组为了让生成的图像还原为原始图像，做循环误差优化网络），将生成器的输入统一记为$I_{y_o}$，动作单元记为$y_o$，输出记为$I_{y_f}$。$G_A$为Attention生成器，$G_A$生成的是一维的图像包含了图像中Attention的位置。$G_I$则是像素图像生成器，$G_I$用于生成包含图像像素的三维图像。最后将$G_A$的输出和$G_I$的输出结合形成完整的图像输出，其中$G_A$的输出是为了指示像素图像的每个像素在哪个范围内对最终的输出作用力度。对应的判别器也由两部分组成，$D_I$用于区分真实图像和生成图像，而$D_y$则是用来区分图像的条件信息也就是图像的AU信息用来让生成的图像的AU特性更加的好。

$G_A$和$G_I$的结合方式由下图所示：

<p align="center">
    <img src="/assets/img/GAN/GANimation3.png">
</p>

最终的生成器的输出就是：

$$I_{y_f} = A \cdot C + (1-A) \cdot I_{y_o}$$

有了以上的分析，我们再来捋一遍模型框架。将真实图像$I_{y_o}$输入到生成器和动作单元$y_o$结合生成具有动作单元信息的图像$I_{y_f}$，为了区分真实图像和生成图像将生成图像和真是图像送入判别器去判别，$D_I$区分真假图像，$D_y$区分AU信息，不断优化生成器和判别器达到共同进步。为了实现循环优化网络，做了一个重构的循环生成，将生成的图像进一步根据原始图像的AU还原回去生成$\hat{I}_{y_r}$。

整个模型框架就是这样，接下来就是损失函数的设计了。

# GANimation损失函数 #

GANimation采用的GAN模型是[WGAN-GP](https://arxiv.org/pdf/1704.00028.pdf)（利用Earth Mover Distance代替GAN中的Jensen-Shannon divergence）当然优点是训练会更加的稳定。所以接下来的分析是在WGAN-GP的基础上展开的。GANimation模型的损失函数细分的话有4个，分别为$Image Adversarial Loss，Attention Loss，Condition Expression Loss，Identity Loss$。

**Image Adversarial Loss**

这就是传统的图像对抗损失，用于优化生成器和判别器，需要考虑Earth Mover Distance中的梯度惩罚：

$$E_{I_{y_p} \sim P_o}[D_I(G(I_{y_o} \vert y_f))] - E_{I_{y_p} \sim P_o}[D_I(I_{y_o})] + \lambda_{gp}E_{\tilde{I} \sim P_{\tilde{I}}}[(\Vert \bigtriangledown_{\tilde{I}}D_I(\tilde{I})\Vert_2 - 1)^2]$$

这部分的损失函数没必要细说，就是比较传统概念上的GAN的损失。

**Attention Loss**

这部分是Attention的损失函数，主要是Attention的知识，考虑图像的前后对应关系。由于Attention优化后得到的$A$很容易饱和到1，对应上面的公式$I_{y_f} = A \cdot C + (1-A) \cdot I_{y_o}$中的$I_{y_o}$则没了意义，所以为了防止这种情况，将$A$做$l2$损失。得到损失函数：

$$\lambda_{TV}E_{I_{y_o} \sim P_o}\big[\sum_{i,j}^{H,W}[(A_{i+1,j} - A_{i,j})^2 + (A_{i,j+1} - A_{i,j})^2]\big] + E_{I_{y_o} \sim P_o}[\Vert A \Vert_2]$$

**Condition Expression Loss**

这部分损失还是蛮重要的，它的作用是让AU作用下生成的图像更具有AU的动作特性，整体的思路是优化生成器和判别器，通过对抗实现共进步。

$$ E_{I_{y_o} \sim P_o}[\Vert D_y(G(I_{y_o} \vert y_f)) - y_f \Vert_2^2] + E_{I_{y_o} \sim P_o}[\Vert D_y(I_{y_o}) - y_o \Vert_2^2]$$

**Identity Loss**

最后一个损失就是循环损失了，也可以说为重构损失，这一块也没什么说的：

$$L_{idt}(G,I_{y_o},y_o,y_f) = E_{I_{y_o} \sim P_o}[\Vert G(G(I_{y_o} \vert y_f )\vert y_o) - I_{y_o} \Vert_1]$$

最后将损失函数统一一下：

$$L = L_I(G,D_I,I_{y_r},y_g) + \lambda_yL_y(G,D_y,I_{y_r},y_r,y_g) + \lambda_A(L_A(G,I_{y_r},y_g)) + \lambda_{idt}L_{idt}(G,I_{y_r},y_r,y_g)$$

# GANimation实验 #

实验先对单AU进行编辑，在不同强度下激活AU的能力，同时保留人的身份。下图显示了用四个强度级别（0,0.33,0.66,1）单独转换的9个AU的子集。对于0强度的情况，不改变相应的AU。

<p align="center">
    <img src="/assets/img/GAN/GANimation4.png">
</p>

对于非零情况，可以观察每个AU如何逐渐加强，注意强度为0和1的生成图像之间的差异。相对于眼睛和面部的半上部（AU1,2,4,5,45）的AU不会影响口腔的肌肉。同样地，口腔相关的变形（AU10,12,15,25）不会影响眼睛和眉毛肌肉。

对于相同的实验，下图显示了产生最终结果的注意力A和颜色C掩模。注意模型是如何学会将其注意力（较暗区域）以无人监督的方式聚焦到相应的AU上的。

<p align="center">
    <img src="/assets/img/GAN/GANimation5.png">
</p>

多AU编辑的实验结果就是正文的第一张图，非真实世界的数据上也显示了出了较好的结果（阿凡达的那张）。

实验还将GANimation与基线DIAT，CycleGAN，IcGAN和StarGAN进行比较。

<p align="center">
    <img src="/assets/img/GAN/GANimation6.png">
</p>

最后，实验展示了在非数据集上的实验效果，图片选自加勒比海盗影片。

<p align="center">
    <img src="/assets/img/GAN/GANimation7.png">
</p>

当然，实验也展示了不足的地方。

<p align="center">
    <img src="/assets/img/GAN/GANimation8.png">
</p>

# 总结 #

GANimation提出了一种新颖的GAN模型，用于脸部表情渐紧生成，可以实现无监督训练。模型通过AU参数化的与解剖学面部变形是一致的。在这些AU上调整GAN模型允许生成器通过简单插值来渲染各种表情幅度。此外，在网络中嵌入了一个注意模型，对背景和光照有一定的补充。

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！