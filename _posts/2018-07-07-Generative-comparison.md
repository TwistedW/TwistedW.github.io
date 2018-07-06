---
layout: post
title: Performance Comparison of deep leaning model for Image Compression论文解读
category: 技术
tags: [Generative]
description: 
---

> 图像压缩在计算机视觉领域占据着比较重要的位置，随着GAN，VAE和超分辨率图像让生成模型得到了很大的进步。不同的模型
有着不同的性能优势，[Performance Comparison of Convolutional AutoEncoders, Generative Adversarial Networks and Super-Resolution for Image Compression](https://arxiv.org/abs/1807.00270)
一文用精炼的语言加上较为严谨的实验对比了GAN，CAE和super-resolution在图像压缩性能上的优势。

# 论文引入 #

图像压缩一直是图像处理领域的一个基础和重要的研究课题。传统的图像压缩算法，如JPEG，JPEG2000和BPG，依赖于手工制作的编码器。
深度学习方法的发展提高了图像压缩的性能，其中比较有突破的图像压缩是在Autoencoder，GAN和超分辨率方面。这篇论文提出了三种架构，
分别使用卷积自动编码器（CAE），GAN和超分辨率（SR）进行有损图像压缩。此外，还对它们的编码性能并进行了全面的比较。 实验结果表明，
由于Autoencoder可以紧凑表示特性，CAE可以实现比JPEG更高的编码效率；GAN显示出在大压缩比和高主观质量重建方面的潜在优势；
超分辨率在三种方法中实现了最佳的速率失真（RD）性能。

总结一下论文的贡献：

- 基于CAE，GAN，SR提出了三种整体压缩体系结构
- 对这三种框架做了全面的性能比较

# CAE用于图像压缩 #

文中将图像压缩中的DCT和小波变换换成了CAE（卷积自编码器），整体架构如下图所示：

<p align="center">
    <img src="/assets/img/GAN/Generative_model1.png">
</p>

上图比较符合传统的图像压缩的流程，不过主要的框架是在CAE的基础上建立的。连续的下采样操作会破坏重建图像的质量，所以Autoencoder采用卷积滤波器执行上下采样，
CAE的内部结构如下图：

<p align="center">
    <img src="/assets/img/GAN/Generative_model2.png">
</p>

内部卷积层之后的激活函数采用的是参数整流线性单元（PReLU）函数，而不是相关工作中常用的ReLU，因为我们发现PReLU可以与ReLU相比时，
提高了重建图像的质量，尤其是在高比特率。整体的损失函数定义为：

$$
\begin{align}
J(\theta,\phi;x) &=& \Vert x - \hat{x} \Vert^2 + \lambda \cdot \Vert y \Vert^2\\
&=& \Vert x - g_{\phi}(f_{\theta}(x)+\mu)\Vert^2 + \lambda \cdot \Vert f_{\theta}(x) \Vert^2
\end{align}
$$

其中$$\Vert x - \hat{x} \Vert^2$$为MSE损失，$$x$$是原始图像$$\hat{x}$$是重构图像，$$\mu$$是均值噪声，$$f_{\theta}(x)$$是$$x$$
经过encoder得到的编码函数，$$g_{\phi}(y)$$为解码得到的解码函数。

# GAN用于图像压缩 #

我们都知道GAN多用于图像的生成，图像的压缩也需要在GAN的基础上做一些小小的改变，那就是在生成器前面加上一个编码器，这样就可以把图像encode到适合
G生成即可，这个编码器的结构和判别器类似，GAN做图像压缩的整体框架如下：

<p align="center">
    <img src="/assets/img/GAN/Generative_model3.png">
</p>

这个模型框架结构很清晰，不需要太多的解释，判别器可以提高输出图像的真实性，损失函数为：

$$J_G(x) = \Vert x - \hat{x} \Vert^2 + \beta \sum_{i \in [0,4]}\Vert D_{hi}(x) - D_{hi}(\hat{x}) \Vert^2$$

这里只写非对抗损失函数部分，对抗损失函数和原始GAN是一致的。$$J_G(x)$$包含两部分，前半部分是MSE损失，后半部分是减小特征层的损失可有利于图像的高质量重建。
基于GAN的体系结构与基于CAE的体系结构在图像压缩中有三个不同之处。首先，直接输入RGB分量，因此不应用从RGB到YCbCr的色彩空间转换；其次，
不在训练过程中添加统一的噪音，因为GAN会从噪音中继承重建图像。第三，使用范围编码器，而不是JPEG2000熵编码器。

# SR用于图像压缩 #

超分辨率压缩结构如下图所示：

<p align="center">
    <img src="/assets/img/GAN/Generative_model4.png">
</p>

对于具有复杂纹理或小分辨率的图像，SR将成为高质量重建的瓶颈。因此，在编码器中构建重建循环且为自适应策略，该循环计算仅由SR引起的失真，即上图中的Pre PSNR。
当Pre PSNR大于预定阈值时，图像被下采样到（0.5W，0.5H）并且在解码之后进行SRCNN滤波。否则，将图像下采样到（0.7W，0.7H），自适应策略的效果如下表。
实验中阈值设置为33.0 dB，并且选择约30％的图像以使用[SRCNN](http://mmlab.ie.cuhk.edu.hk/projects/SRCNN.html)滤波器。

<p align="center">
    <img src="/assets/img/GAN/Generative_model5.png">
</p>

# 性能比较 #

为了测量编码效率，通过每像素比特（bpp）来测量速率。PSNR（dB）和MS-SSIM分别用于测量客观和主观质量。

**CAE**

由于CAE生成的特征图不是能量紧凑的，所以还要用PCA进一步去相关特征图。PCA生成的特征映射和旋转特征映射的示例如下图所示。

<p align="center">
    <img src="/assets/img/GAN/Generative_model6.png">
</p>

可以看到，在右下角生成了更多的零，在旋转的特征映射中，大值居中于左上角，这有利于熵编码器降低速率。与JPEG2000相比，基于CAE的方法优于JPEG，
并且在Kodak数据集图像上实现了13.7％的BD率减少。

**GAN**

GAN的图像压缩在CLIC验证数据集上进行了性能比较实验：

<p align="center">
    <img src="/assets/img/GAN/Generative_model7.png">
</p>

其中bpp越小越好，PSNR越大越好，MS-SSIM越大越好！可以看出GAN的一定优势。

**对比结果**

实验早CLIC验证数据集进行公平评估。具有MS-SSIM和PSNR的RD曲线如下图。超分辨率的RD曲线很短，因为它是通过用BPG编解码器中的固定量化参数（QP）
值改变自适应策略中的阈值来进行的。通过改变QP，超分辨率还可以实现广泛的RD曲线。

<p align="center">
    <img src="/assets/img/GAN/Generative_model8.png">
</p>

从RD曲线总结了几个观察结果。
- 由于自动编码器的固有特性，在有损压缩的情况下，CAE优于JPEG。自动编码器可以减少尺寸以从图像中提取压缩的演示文稿，因此CAE优于JPEG和JPEG2000。
- GAN在低比特率下比在高比特率下表现更好，因此GAN倾向于实现大的压缩比。同时，GAN在MS-SSIM上的性能优于PSNR，因为GAN的重建是基于图像数据的分布，肉眼更加认同。特别是对于MS-SSIM，GAN具有从0.2bpp到0.8bpp的稳定性能。
- SR在这三种方法中实现了最佳性能，因为它具有新兴算法BPG和基于机器学习的超分辨率滤波器的优点。如果可以提供更多的计算资源，那么通过添加更好的超分辨率滤波器，可以预期有希望的结果将超过BPG。

下表是在速率约为0.15bpp的三种方法的比较：

<p align="center">
    <img src="/assets/img/GAN/Generative_model9.png">
</p>

可以看出基于SR的方法与BPG非常接近，基于GAN和CAE的体系结构优于JPEG，特别是GAN和CAE具有相似的PSNR，但就相对主观的MS-SSIM而言，GAN比CAE更好。

# 总结 #

论文提出了三种使用CAE，GAN和SR进行压缩的体系结构，并讨论了它们的性能。结果表明1）CAE比传统的有限压缩变换更好，并且有望用作特征提取器。
2）GAN显示出对大压缩比和主观质量重建的潜在优势。3）基于SR的压缩实现了其中最佳的编码性能。

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！