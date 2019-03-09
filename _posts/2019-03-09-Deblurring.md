---
layout: post
title: 无监督下图像去模糊（论文解读）
category: 技术
tags: [GAN]
description: 
---

> 图像模糊是影响图像质量的重要因素，显着降低了许多计算机视觉应用的性能，例如物体检测和人脸识别。随着深度神经网络的发展，计算机视觉领域的难题被一个个解决，单纯依靠先验核去实现图像去模糊的技术已经渐渐被淘汰。本文将针对CVPR2019 [Unsupervised Domain-Specific Deblurring via Disentangled Representations](https://arxiv.org/abs/1903.01594)一文进行分析，梳理一下基于深度神经网络下图像去模糊的实现方法。

# 论文引入

图像的模糊严重影响图像的本身质量，同时在进行图像的识别和图像中物体识别都会产生影响。图像去模糊旨在从相应的模糊图像中恢复潜在的清晰图像。大多数传统方法将图像去模糊任务公式化为模糊核估计问题，在过去的十年中，已经开发了各种自然图像和先验核来规范潜在锐利图像的解空间，包括重尾梯度先验，稀疏核先验，$l_0$梯度先验，归一化稀疏性和暗通道。然而，这些先验是通过有限的观察来估计的，并且不够准确。结果，去模糊的图像通常欠去模糊（图像仍然模糊）或过度去模糊（图像包含许多伪像）。

近年来深度神经网络和GAN的巨大成功，已经提出了一些基于CNN的方法用于图像去模糊，例如Nimisha在ECCV2018 发表的[Unsupervised Class-Specific Deblurring](http://openaccess.thecvf.com/content_ECCV_2018/papers/Nimisha_T_M_Unsupervised_Class-Specific_Deblurring_ECCV_2018_paper.pdf)[1]是一种基于GAN的无监督图像去模糊方法，在模型上增加了重复损失和多尺度梯度损失。虽然它们在合成数据集上取得了良好的性能，但它们对一些真实模糊图像的结果并不令人满意。另一类方法是基于现有的图像到图像的模型，例如CycleGAN[2]这类无监督端到端的模型，然而，这些通用方法通常编码其他因素（例如，颜色，纹理）而不是将信息模糊到发生器中，因此不会产生良好的去模糊图像。文章对这些方法进行了一个可视化结果比对，同时也是展示了自己模型的优越性：

<p align="center">
    <img src="/assets/img/GAN/Deblurring1.png">
</p>

上图最右侧就是这篇文章的实验效果，可以看出对比已有的基于深度神经网络的去模糊模型还是展示了不错的实现效果的。这些效果的实现得益于文章提出了一种基于解缠表示的无监督域特定图像去模糊方，通过将模糊图像中的内容和模糊特征解开，以将模糊信息准确地编码到去模糊框架中。我们后续再详细分析，这里总结一下文章的创新和优势所在：

- 内容编码器和模糊编码器将模糊图像的内容和模糊特征区分开，实现了高质量的图像去模糊。
- 对模糊编码器添加KL散度损失以阻止模糊特征对内容信息进行编码。
- 为了保留原始图像的内容结构，在框架中添加了模糊图像构造和循环一致性损失，同时添加的感知损失有助于模糊图像去除不切实际的伪像。

# 模型详解

我们还是先通过模型框架图去理解文章设计的思路：

<p align="center">
    <img src="/assets/img/GAN/Deblurring2.png">
</p>

我们先把模型中的组间简绍清楚，由于模型的循环一致性设计，网络的左右是基本对称的，我们对左侧组间交代下。$s$代表清晰的真实图像，$b$代表模糊的真实图像，$E_S^c$是清晰图像的内容编码器（可以理解为图像颜色、纹理、像素的编码器），对应的$E_B^c$是模糊图像的内容编码器，$E^b$是模糊图像的模糊编码器（仅用来提取图像的模糊信息），$G_B$是模糊图像生成器，$G_S$是清晰图像生成器，$b_s$是生成的模糊图像，$s_b$是生成的清晰图像。经过循环的转换，$\hat{s}$是循环生成的清晰图像，$\hat{b}$是循环生成的模糊图像。结合上下标和模型结构，这些组间的名称还是很好区别的。

看了这个模型，大家是不是有一些疑问，我们的目的是实现图像的去模糊，为什么要添加模糊编码器？为什么还要主动去生成模糊的图像？怎么保证模糊图像的内容编码器真的提取到图像的内容信息？为什么模糊编码器要同时作用在$G_B$和$G_S$上？

这些问题正是这篇文章区别于已有模型的关键，我们按照文章思路一步步去分析。

文章的一大创新就是模糊编码器的设计，它主要的作用是用来捕获模糊图像的模糊特征，如何去保证这个模糊编码器是真的提取到模糊图像的模糊特征了呢？作者就采用了迂回的思路，既然清晰的图像是不含模糊信息的，如果清晰的图像通过结合模糊编码器模糊特征去生成出模糊图像，是不是可以说，模糊编码器是在对清晰图像做模糊化处理，这个模糊化的前提是什么？那就是模糊编码器确实提取到了图像的模糊特征，所以说由清晰图像生成模糊图像也保证了模糊编码器是对图像的模糊信息进行编码的作用。

同时，由清晰图像到模糊图像的生成过程中，清晰图像的内容编码器我们是有理由相信它是提取到了清晰图像的内容信息（因为清晰图像并不包含模糊信息）。文章为了保证模糊图像的内容编码器$E_B^c$是对模糊图像的内容进行编码，文章将清晰图像内容编码器$E_S^c$和模糊图像内容编码器$E_B^c$强制执行最后一层共享权重，以指导$E_B^c$学习如何从模糊图像中有效地提取内容信息。

为了进一步尽可能多地抑制模糊编码器$E^b$对内容信息的编码，通过添加一个KL散度损失来规范模糊特征$z_b=E^b(b)$的分布，使其接近正态分布$p(z) \sim N(0,1)$。这个思路和VAE中的限制数据编码的潜在空间的分布思路是相近的，这里将模糊编码器的编码向量限制住，旨在控制模糊编码器仅对图像的模糊信息进行编码。

理清了上面的设计思路，这篇文章的实现就已经基本介绍完毕了。由模糊图像去模糊到清晰图像的过程中，将模糊图像内容编码$E_B^c$和模糊编码$E^b$送入清晰图像生成器$G_S$重构得到去模糊的清晰图像，清晰图像到模糊图像是为了优化模糊编码$E^b$和模糊图像的内容编码$E_B^c$的作用。通过循环一致性，进行进一步的还原保证模型的鲁棒性。核心的损失是图像生成在GAN的对抗损失，结合感知损失达到图像下一些伪影的优化。

# 模型损失函数

本部分是对模型实现的补充，在上一小节中，也是大致上分析了各类损失的作用，这里做一个简短的展开。

首先是对模糊编码的隐空间分布进行约束，这个约束通过KL散度去实现，这个过程和VAE的思路是一致的：

$$
KL(q(z_b)\Vert p(z)) = - \int q(z_b)log \frac{p(z)}{q(z_b)}dz
$$

这里的$p(z) \sim N(0,1)$，具体的损失可进一步写为：

$$
\mathcal L_{KL} = \frac{1}{2} \sum_{i=1}^N(\mu_i^2 + \sigma_i^2 - log(\sigma_i^2) -1)
$$

此时，$z_b$可表示为$z_b = \mu + z \circ \sigma$。

接下来就是GAN的那一套对抗损失，这里写一下清晰图像生成的判别器损失，模糊图像的是一致的：

$$
\mathcal L_{D_s} = \mathbb E_{s \sim p(s)}[logD_s(s)] + \mathbb E_{b \sim p(b)}[log(1-D_s(G_s(E_B^c(b),z_b)))]
$$

循环一致损失参考的是CycleGAN[2]：

$$
\mathcal L_{cc} = \mathbb E_{s \sim p(s)}[\Vert s - \hat{s} \Vert_1] + \mathbb E_{b \sim p(b)}[\Vert b - \hat{b} \Vert_1]
$$

感知损失的加入，作者是加在预训练CNN的第1层的特征，实验中加在ImageNet上预训练的VGG-19的conv3,3。

$$
\mathcal L_{p} = \Vert \phi_l(s_b) - \phi_l(b) \Vert_2^2
$$

感知损失中使用模糊图像$b$而不是锐利图像作为参考图像有两个主要原因。首先，假设$b$的内容信息可以由预训练的CNN提取。其次，由于$s$和$b$未配对，因此在$s$和$s_b$之间应用感知损失将迫使$s_b$对$s$中的无关内容信息进行编码。值得一提的是，$b_s$和$s$上没有添加感知损失。这是因为在训练期间没有在$b_s$中发现明显的伪像。

整个模型总的损失可写为：

$$
\mathcal L = \lambda_{adv} \mathcal L_{adv} + \lambda_{KL} \mathcal L_{KL} + \lambda_{cc} \mathcal L_{cc} + \lambda_{p} \mathcal L_{p}
$$

# 实验

文章的网络的设计结构参考了[Diverse image-to-image translation via disentangled representations](https://arxiv.org/abs/1808.00948)[3]。内容编码器由三个卷积层和四个残差块组成。模糊编码器包含四个卷积层和一个完全连接的层。对于发生器，该架构与内容编码器对称，具有四个残差块，后面是三个转置的卷积层。判别器采用多尺度结构，其中每个尺度的特征图经过五个卷积层，然后被馈送到sigmoid输出。采用Adam优化损失，对于前40个时期，学习速率最初设置为0.0002，然后在接下来的40个时期使用指数衰减。超参上$\lambda_{adv}=1,\lambda_{KL}=0.01, \lambda_{cc} =10,\lambda_{p}=0.1$。

实验数据集采用三种数据集：CelebA数据集，BMVC文本数据集和CFP数据集。CelebA数据集包含超过202,000个面部图像，文章设置了清晰图像100k，模糊图像100k，测试图像2137。BMVC文本数据集由66,000个文本图像组成，分配方式类似于CelebA数据集。CFP数据集由来自500个主题的7,000个静止图像组成，并且对于每个主题，它具有正面姿势的10个图像和具有专业姿势的4个图像。

对于CelebA和BMVC Text数据集，我们使用标准的debluring指标（PSNR，SSIM）进行评估。文章还使用去模糊图像和真实图像之间的特征距离（即来自某些深层网络的输出的$L_2$距离）作为语义相似性的度量，因为实验发现它是比PSNR和SSIM更好的感知度量。对于CelebA数据集，使用来自VGG-Face 的pool5层的输出，对于文本数据集，使用来自VGG-19网络的pool5层的输出。对于文本去模糊，另一个有意义的度量是去模糊文本的OCR识别率。在可视化模型和定量对比上，文章对比了各类模型的去模糊的效果：

<p align="center">
    <img src="/assets/img/GAN/Deblurring3.png">
</p>

<p align="center">
    <img src="/assets/img/GAN/Deblurring4.png">
</p>

实验也对比了各个组间的有无对实验结果的影响：

<p align="center">
    <img src="/assets/img/GAN/Deblurring5.png">
</p>

<p align="center">
    <img src="/assets/img/GAN/Deblurring6.png">
</p>

不仅仅在人脸图像去模糊上，在文本去模糊上也展示了不错的实验效果：

<p align="center">
    <img src="/assets/img/GAN/Deblurring7.png">
</p>

# 总结

文章提出了一种无监督的领域特定单图像去模糊方法。通过解开模糊图像中的内容和模糊特征，并添加KL散度损失以阻止模糊特征对内容信息进行编码。为了保留原始图像的内容结构，在框架中添加了模糊分支和循环一致性损失，同时添加的感知损失有助于模糊图像去除不切实际的伪像。每个组件的消融研究显示了不同模块的有效性。

文章的创新之处正是内容编码器和模糊编码器的设计和应用，尝试将内容和模糊信息分离，这对图像到图像的工作具有一定的指导意义。

# 参考文献

[1] T. Madam Nimisha, K. Sunil, and A. Rajagopalan. Unsupervised class-specific deblurring. In Proceedings of the European Conference on Computer Vision (ECCV), pages 353–369, 2018.

[2] J.-Y. Zhu, T. Park, P. Isola, and A. A. Efros. Unpaired image-to-image translation using cycle-consistent adversarial networks. In Proceedings of International Conference on Computer Vision (ICCV), 2017.

[3] H.-Y. Lee, H.-Y. Tseng, J.-B. Huang, M. Singh, and M.-H.Yang. Diverse image-to-image translation via disentangled representations. In Proceedings of European Conference on Computer Vision (ECCV), pages 36–52. Springer, 2018.