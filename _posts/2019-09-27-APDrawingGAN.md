---
layout: post
title: APDrawingGAN由人脸到高质量肖像图转换
category: 技术
tags: [GAN]
description: 
---

> 固定的应用场景对于泛化的图像翻译模型来说存在着一定的局限性，往往需要根据实际的需求对网络和细节进行设计以达到特定的效果。图像转换模型中[CycleGAN](https://arxiv.org/abs/1703.10593)、[Pix2Pix](https://arxiv.org/abs/1611.07004)、[StarGAN](https://arxiv.org/abs/1711.09020)、[FUNIT](https://arxiv.org/abs/1905.01723)都是泛化较好的模型，然而对于特定需求还是需要更为细致的设计。本篇的目的是为了解读在人脸到肖像画的图像翻译任务下，如何做到这种固定需求的高质量图像转换。本篇的主角是[APDrawingGAN]([http://openaccess.thecvf.com/content_CVPR_2019/papers/Yi_APDrawingGAN_Generating_Artistic_Portrait_Drawings_From_Face_Photos_With_Hierarchical_CVPR_2019_paper.pdf](http://openaccess.thecvf.com/content_CVPR_2019/papers/Yi_APDrawingGAN_Generating_Artistic_Portrait_Drawings_From_Face_Photos_With_Hierarchical_CVPR_2019_paper.pdf))，同时也是CVPR2019 oral，实现了高质量的人脸到肖像图的转换。

# 论文引入

肖像画是一种艺术表现形式，可以简单的通过线条去捕捉人的独特外观，并且可以做到高相似度的描述。这类素描图往往需要艺术家在人或他们的照片面前绘制，且依赖于整体的观察、分析和经验去创作。一副好的肖像画可以形象的表征人的个性和神气，这往往需要一个受过好的培训的艺术家几个小时的时间去创作。

这种耗时的工作当然可以交给计算机去实现了，但是在实现之前还是要分析一下这项任务的难点。艺术肖像画（APDrawings）是高度抽象的，包含少量稀疏但连续的图形元素（线条）。同时，APDrawings涉及数千个不同大小和形状的笔画的密集集合，面部特征下一些小的伪像也能被清楚的看到，面部特征不能有错位、移位出现。不同人物的肖像结构是变化的，没有固定的精确位置，再者为了体现发型的流动性，往往APDrawings会有一些指示头发流动的线条。综合这些难点，想实现一个高质量的人脸到肖像画的转换是难度很大的，上述的特点都要在考虑范围内。

为了解决上述挑战，提出了APDrawingGAN，一种新颖的Hierarchical GAN架构，专门用于面部结构和APDrawing样式，用于将面部照片转换为高质量的APDrawings。为了有效地学习不同面部区域的不同绘图风格，GAN架构涉及专门用于面部特征区域的几个局部网络，以及用于捕获整体特征的全局网络。为了进一步应对艺术家绘画中基于线条笔划的风格和不精确定位的元素，还提出了一种新的距离变换（DT）损失来学习APDrawings中的笔划线。总结一下APDrawingGAN的优势：

- 提出了一种Hierarchical GAN架构，用于从面部照片中进行艺术人像合成，可以生成高质量和富有表现力的艺术肖像画。特别是，可以用细腻的白线学习复杂的发型。

- 为了最好地模拟艺术家，模型将GAN的渲染输出分成多个层，每个层由分离的损失函数控制。
- 从10个面部数据集中收集的6,655张正面照片预训练模型，并构建适合训练和测试的APDrawing数据集（包含140张专业艺术家的高分辨率面部照片和相应的肖像画）。 

# 模型结构

先从整体上看一下APDrawingGAN模型结构：

<p align="center">
    <img src="/assets/img/GAN/APDrawingGAN1.png">
</p>

整体结构是比较直观理解的，整个网络是基于GAN建立的，左边为分层生成器，右边为分层判别器，输入的原始人脸图记为$p_i \in P$。分层生成器的上部分为全局生成器它的输出为全局人脸肖像$I_{global}$，下部分为分别对应着左眼、右眼、鼻子、嘴巴、头发、背景的六个局部生成器，这六个生成器得到的肖像局部图结合在一起便得到了$I_{local}$，通过融合生成器便得到最终的输出结果$G(p_i)$。对于判别器则整体上采用的是条件GAN的判别器设计，对于真实的肖像图给定的标签为True，对于合成的肖像图给定的标签是False，这个标签是人为构建的。同时也是采用全局判别器和六个局部判别器组成，最终确定真假以优化生成器。

接下来，我们对各个部分详细的进行梳理。

**全局生成器**

这里说的全局生成器和局部生成器并不是我们在感受野中定义的全局和局部，这里的全局和局部就是全局得到的人脸肖像和局部得到的眼睛、鼻子、嘴巴和头发。对于全局生成器采用的是U-Net的设计思路，通过下采样结合特征复用的上采样最终得到全局的输出。

**局部生成器**

局部生成器的前提是要把人脸的各个部位提取出来，将人脸图取出左眼、右眼、鼻子、嘴巴出来，扣除掉这些部位后得到的就是头发部分，对人脸图取掩码得到背景图。将这六个部分分别进行小尺度下的U-Net的重构得到对应的局部肖像图，通过partCombiner2_bg网络将这六个部分组合组合成一副完整的人脸肖像图，partCombiner2_bg主要通过在重叠区域使用最小池化来将所有局部生成器的输出混合到聚合图形。其实从扣出局部的部位到再次将每一个部位整合在一起，这中间还是比较繁琐的，同时这块也是APDrawingGAN的主要创新之处，在源码中作者通过固定各个部位的尺度大小，然后通过对每一幅图像的各个部位进行标注（主要是嘴巴和中心位置，保存在txt中的5行2列的坐标），在训练阶段进行截取局部位置时调用。

**融合生成器**

融合生成器就是将全局生成器得到的全局图和局部生成器得到的局部整合图进行channel维度的concat后送入到combine网络再次经过一些卷积处理最终得到最后的输出$G(p_i)$。

**全局判别器和局部判别器**

全局判别器和局部判别器就和条件GAN的判别器类似，定义真实部分的label为真，合成部分的label为假，然后通过条件判别器进行优化，整个网络的架构就是堆叠的下采样。

## 损失函数

整个模型的损失函数由四部分组成，大家熟知的生成对抗损失、像素层面损失、距离变换损失以及局部像素损失。对于生成对抗损失，主要分为两部分一个是全局性的生成对抗损失和局部性六个部位的生成对抗损失；像素层面损失主要是采用$\mathcal L_1$损失$L_{\mathcal L_1}=\mathbb E_{(p_i,a_i) \sim S_{data}}[\Vert G(p_i)-a_i] \Vert_1$，其中$a_i$就是真实肖像画的数据；局部像素损失就是对各个部位的合成和真实进行$\mathcal L_1$损失优化，比如对鼻子的局部损失$L_{local_{nose}}=\mathbb E_{(p_i,a_i) \sim S_{data}}[\Vert G_{l\_nose}(Ns(p_i)-Ns(a_i)] \Vert_1$；我们重点分析一下距离变换损失。

**距离变换损失**

距离变换指的是对于一张图像中的每一个像素点的值用距离来代替，其实得到的就是一副类似于二值图的图像，$I_{DT}(x)$用于表示肖像图的黑线分布，$I^{'}_{DT}(x)$用于表示肖像图白线的分布，由肖像图计算黑线与白线可以用卷积层去检测到，从而确定确定对应的$I_{DT}(x)$和$I^{'}_{DT}(x)$。我们可以用下图进一步理解距离变换的定义。

<p align="center">
    <img src="/assets/img/GAN/APDrawingGAN2.png">
</p>

距离变换损失就是衡量真实肖像图与生成肖像图的$I_{DT}(x)$与$I^{'}_{DT}(x)$的差值：

$$
d_{CM}(a_i,G(p_i))=\sum_{(j,k) \in \Theta_b(a_i)}I_{DT}(G(p_i))(j,k) + \sum_{(j,k) \in \Theta_\omega(a_i)}I^{'}_{DT}(G(p_i))(j,k)
$$

其中像素$(j,k)$在真实和生成肖像图下$I_{DT}(x)$与$I^{'}_{DT}(x)$的距离，得到的最终的损失表示为：

$$
L_{DT}(G,D) = \mathbb E_{(p_i,a_i) \sim S_{data}}[d_{CM}(a_i,G(p_i))+d_{CM}(G(p_i),a_i)]
$$

这种对肖像图中的黑线和白线的距离控制是为了尽可能还原肖像图中的发型流动性和光泽度，让肖像图更加地逼真。

**整体损失**

最终得到的损失函数为：

$$
\min_G \max_D L(G,D) = L_{adv}(G,D)+\lambda_1 L_{\mathcal L_1}(G,D)+\lambda_2 L_{DT}(G,D)+\lambda_3 L_{local}(G,D)
$$

# 实验

**数据集处理**

由于由艺术家手绘的肖像图的成本过高，实验组是收集了140对面部照片和相应的肖像画的数据集（由专业人员手绘的肖像图），为了实现少量图像对下的训练，从10个面部数据集中收集了6,655张正面照片，对每张图片使用双色调NPR算法[1]生成肖像图纸，这个阶段得到的结果通常会产生没有明确下颚线的结果（由于这些位置的图像中的对比度低），再使用OpenFace [2]中的面部模型来检测颌骨上的标记，然后将下颌线添加到NPR结果中。对于这种处理得到的数据，主要用于预训练，预训练阶段为前10个epoch，由于NPR生成的绘图（与艺术家的绘图不同）与照片准确对齐，因此在预训练中不去优化距离变换损失。预训练结束后，将数据集换为由专业人员手绘的肖像图进一步训练得到最后的结果，这个过程解释可看下图。

<p align="center">
    <img src="/assets/img/GAN/APDrawingGAN3.png">
</p>

**消融对比**

文章在定性上做了消融性对比，包括有无局部生成器、距离变换损失、预训练和完整结果。

<p align="center">
    <img src="/assets/img/GAN/APDrawingGAN4.png">
</p>

**实验对比**

和已有的方法，APDrawingGAN也与时下的模型进行了定性和定量上的对比。

<p align="center">
    <img src="/assets/img/GAN/APDrawingGAN5.png">
</p>

<p align="center">
    <img src="/assets/img/GAN/APDrawingGAN6.png">
</p>

# 总结

文章提出了APDrawingGAN，一种用于将面部照片转换为APDrawing的分层GAN模型。实验致力于特定的人脸和APDrawing风格的转换，特别是旨在完成这种特定的转换工作。通过全局生成器和局部生成器对人脸进行肖像图重构，利用距离变换损失加强肖像图的逼真度，从实验结果上可以实现成功的艺术肖像风格转移，并且取得了一定的优势。

这也启发了我们在通用型的图像翻译工作下，具体的模型设计还需要根据具体的目的需求去设计，在特定的任务下实现合理而且高质量的结果。

# 参考文献

[1] Paul L. Rosin and Yu-Kun Lai. Towards artistic minimal rendering. In International Symposium on Non-Photorealistic Animation and Rendering, NPAR ’10, pages 119–127, 2010. 5, 6

[2] Brandon Amos, Bartosz Ludwiczuk, and Mahadev Satyanarayanan. OpenFace: A general-purpose face recognition library with mobile applications. Technical report, CMUCS-16-118, CMU School of Computer Science, 2016. 6