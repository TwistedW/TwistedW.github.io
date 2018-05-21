---
layout: post
title: 朴素贝叶斯算法
category: 技术
tags: [数学,朴素贝叶斯]
description: 
---

> 上周一直忙着手头的事没来得及更新，现在一切归于正常，在之前的一系列铺垫后我们对贝叶斯有了一定的认识，其中既有含义上的也有数学推证下的，
今天我们一起来看看朴素贝叶斯算法的实现和一个小例子。

# 朴素贝叶斯算法流程 #

　　朴素贝叶斯在实现过程中有一个基础假设，这个我们在概念推导那一篇博客中也有所讲到，我们再稍微重复一下。

**独立性假设：** $$X_i$$假设单一样本的 n 个维度$$X_i^{(1)},...,X_i^{(n)}$$彼此之间在各种意义上相互独立。

**基本思想：** 后验概率最大化、然后通过贝叶斯公式转换成先验概率乘条件概率最大化

**整体公式**（假设输入有 N 个、单个样本是 n 维的、一共有 K 类：$$c_1,...,c_K$$）

　　计算先验概率的极大似然估计：

$$\hat p(y=c_k)=\frac{\sum_{i=1}^NI(y_i=c_k)}{N},k=1,2,...,K$$

　　计算条件概率的极大似然估计： 

$$\hat p(x^{(j)}=a_{jl}|y=c_k)=\frac{\sum_{i=1}^NI(x_i^{(j)}=a_{jl},y_i=c_k)}{\sum_{i=1}^NI(y_i=c_k)}$$

其中样本$$x_i$$第 j 维$$x_i^{(j)}$$的取值集合为$$\{a_{j1},...,a_{jS_j}\}$$

**最终的分类器：** 

$$y=f(x^*)=\arg\max_{c_k}\hat p(y=c_k)\prod_{i=1}^n\hat p(x^{(i)}=x^{*(i)}|y=c_k)$$

　　上述的这些公式都有在上一篇博客中推到过，详细请看[这里](https://twistedw.github.io/2018/05/09/Bayesian-Derivation.html)。

　　在整体朴素贝叶斯下一般来说会衍生出以下三种不同的模型：

- 离散型朴素贝叶斯（MultinomialNB）：所有维度的特征都是离散型随机变量
- 连续型朴素贝叶斯（GaussianNB）：所有维度的特征都是连续型随机变量
- 混合型朴素贝叶斯（MergedNB）：各个维度的特征有离散型也有连续型

　　在接下来的讨论中我们只来说明离散朴素贝叶斯的相关应用。

# 朴素贝叶斯与贝叶斯决策论的联系 #

　　朴素贝叶斯的模型参数即是类别的选择空间：

$$\Theta = \left\{ y = c_{1},{y = c}_{2},\ldots,{y = c}_{K} \right\}$$

　　朴素贝叶斯总的参数空间$$\tilde{\Theta}$$本应包括模型参数的先验概率$$p\left( \theta_{k} \right) = p(y = c_{k})$$、样本空间在模型参数下的条件概率
$$p\left( X \middle \vert \theta_{k} \right) = p(X \vert y = c_{k})$$和样本空间本身的概率$$p(X)$$；但由于我们采取样本空间的子集
$$\tilde{X}$$作为训练集，所以在给定的$$\tilde{X}$$下$$p\left( X \right) = p(\tilde{X})$$是常数，因此可以把它从参数空间中删去。
换句话说，我们关心的东西只有模型参数的先验概率和样本空间在模型参数下的条件概率:

$$\tilde{\Theta} = \left\{ p\left( \theta \right),p\left( X \middle| \theta \right):\theta \in \Theta \right\}$$

　　行动空间A就是朴素贝叶斯总的参数空间$$\tilde{\Theta}$$

　　决策就是后验概率最大化

$$\delta\left( \tilde{X} \right) = \hat{\theta} = \arg{\max_{\tilde\theta\in\tilde\Theta}{p\left( \tilde{\theta} \middle| \tilde{X} \right)}}$$

　　在$$\hat{\theta}$$ 确定后，模型的决策就可以具体写成（这一步用到了独立性假设）

$$
\begin{eqnarray}
  f\left( x^{*} \right) &=& \arg{\max_{c_k}{\hat{p}\left( c_{k} \middle| X = x^{*} \right)}} \\
  &=& \arg{\max_{c_k}{\hat{p}\left( y = c_{k} \right)\prod_{j = 1}^{n}{\hat{p}\left( X^{\left( j \right)} = {x^{*}}^{\left( j \right)} \middle| y = c_{k} \right)}}}
\end{eqnarray}
$$

　　损失函数会随模型的不同而不同。在离散型朴素贝叶斯中，损失函数就是比较简单的 0-1 损失函数

$$
L\left( \theta,\delta\left( \tilde{X} \right) \right) = \sum_{i = 1}^{N}{\tilde{L}\left( y_{i},f\left( x_{i} \right) \right) =}\sum_{i = 1}^{N}{I(}y_{i} \neq f\left( x_{i} \right))
$$

# 朴素贝叶斯算法的实现 #

1.输入：训练数据集$$D = \{\left( x_{1},y_{1} \right),\ldots,(x_{N},y_{N})\}$$

2.处理（利用 ML 估计导出模型的具体参数）：

　　计算先验概率$$p(y = c_{k})$$的极大似然估计：

$$
\hat{p}\left( y = c_{k} \right) = \frac{\sum_{i = 1}^{N}{I(y_{i} = c_{k})}}{N},\ k = 1,2,\ldots,K
$$

　　计算条件概率$$p(X^{\left( j \right)} = a_{jl}|y = c_{k})$$的极大似然估计（设每一个单独输入的 n 维向量$$x_i$$的第 j 维特征$$x^{\left( j \right)}$$
可能的取值集合为$$\{ a_{j1},\ldots,a_{jS_{j}}\}$$:

$$
\hat{p}\left( X^{\left( j \right)} = a_{jl} \middle| y = c_{k} \right) = \frac{\sum_{i = 1}^{N}{I(x_{i}^{\left( j \right)} = a_{jl},y_{i} = c_{k})}}{\sum_{i = 1}^{N}{I(y_{i} = c_{k})}}
$$

3.输出（利用 MAP 估计进行决策）：朴素贝叶斯模型，能够估计数据$$x^{*} = \left( {x^{*}}^{\left( 1 \right)},\ldots,{x^{*}}^{\left( n \right)} \right)^{T}$$的类别：

$$
y = f(x^{*}) = \arg{\max_{c_k}{\hat{p}\left( y = c_{k} \right)\prod_{j = 1}^{n}{\hat{p}(X^{\left( j \right)} = {x^{*}}^{\left( j \right)}|y = c_{k})}}}
$$

　　综上，朴素贝叶斯算法可以概括为：

- 使用极大似然估计导出模型的具体参数（先验概率、条件概率）
- 使用极大后验概率估计作为模型的决策（输出使得数据后验概率最大化的类别）

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！