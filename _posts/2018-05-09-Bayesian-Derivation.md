---
layout: post
title: 贝叶斯篇之概念推导
category: 技术
tags: [Math,Bayesian]
description: 
---

> 在正式开启朴素贝叶斯分析之前，我们还有一些公式要进行推证，如果稀里糊涂的直接去理解可能很快就会忘了，虽然受限于数学的能力，
但是这篇博客将尽可能的把朴素贝叶斯中遇到的公式做一个梳理。

# 朴素贝叶斯算法的基本假设 #

**独立性假设：** $$X_i$$假设单一样本的 n 个维度$$X_i^{(1)},...,X_i^{(n)}$$彼此之间在各种意义上相互独立。（我们之后的很多推证都是建立在这个假设上的）

　　这当然是很强的假设，在现实任务中也大多无法满足该假设。由此会衍生出所谓的半朴素贝叶斯和贝叶斯网，我们暂时先不说。我们主要说的是朴素贝叶斯算法，
朴素贝叶斯算法得到的模型所做的决策就是 0-1 损失函数下的贝叶斯决策。

　　从直观上分析：在损失函数为 0-1 损失函数的情况下，决策风险、亦即训练集的损失的期望就是示性函数某种线性组合的期望、从而就是相对应的概率；
朴素贝叶斯本身就是运用相应的概率做决策，此时可以认为朴素贝叶斯和贝叶斯决策在0-1损失函数上是等价的。

　　在进入正题前，我们先说一个定理：

　　令$$\rho(x_1,...,x_n)$$满足：

$$\rho\left( x_{1},\ldots,x_{n} \right) = \inf_{a\in A}{\int_{\Theta}^{}{L\left( \theta,a \right)\xi\left( \theta \middle| x_{1},\ldots,x_{n} \right)\text{d}\theta}}$$

　　也就是$$\rho(x_1,...,x_n)$$是已知训练集\tilde X=(x_1,...,x_n)的最小后验期望损失。那么如果一个决策$$\delta^*(x_1,...,x_n)$$能使任意一个含有
n 个样本的训练集的后验期望损失达到最小，即：

$$
\int_{\Theta}^{}{L\left( \theta,\delta^{*}\left( x_{1},\ldots,x_{n} \right) \right)\xi\left( \theta \middle| x_{1},\ldots,x_{n} \right)d\theta = \rho\left( x_{1},\ldots,x_{n} \right)}\ (\forall x_{1},\ldots,x_{n})
$$

　　满足这个条件的话，那么$$\delta^*$$就是贝叶斯决策。这个定理我是证明不来的，里面涉及了泛函甚至是图论的知识，不过从真实的含以上我们是可以理解的。

　　有了这个定理以后，如果我们想证明朴素贝叶斯算法能导出贝叶斯决策、我们只需证明它能使任一个训练集$$\tilde X$$上的后验期望损失$$R\left( \theta,\delta(\tilde X)\right)$$最小即可。
所以，我们需要先计算$$R\left( \theta,\delta(\tilde X)\right)$$：

$$
R\left( \theta,\delta(\tilde{X}) \right) = EL\left( \theta,\delta\left( \tilde{X} \right) \right) = E_{X}\sum_{k = 1}^{K}{\tilde{L}(c_{k},f\left( X \right))p(c_{k} \vert X)}
$$

　　这里的期望是对联合分布取的，所以可以做后面的条件期望。

　　我们讨论的朴素贝叶斯多为离散的，在损失函数为0-1的情况下，可以有下面变换：

$$
L\left( \theta,\delta\left( \tilde{X} \right) \right) = \sum_{i = 1}^{N}{\tilde{L}\left( y_{i},f\left( x_{i} \right) \right) =}\sum_{i = 1}^{N}{I(}y_{i} \neq f\left( x_{i} \right))
$$

　　因为我的损失要么为0要么为1，此时$$I$$是示性函数，它满足：

$$
I\left( y_{i} \neq f\left( x_{i} \right) \right) = \left\{ \begin{matrix}
1,\ if\ y_{i} \neq f\left( x_{i} \right) \\
0,if\ y_{i} = f\left( x_{i} \right) \\
\end{matrix} \right.\
$$

　　有了上述的描述，为了使后验期望损失$$R\left( \theta,\delta(\tilde X)\right)$$最小，我们只需逐个对$$X=x$$最小化，从而有：

$$
\begin{eqnarray}
  f\left( x \right) &=& \arg{\min_{y\in S}{\sum_{k = 1}^{K}{\tilde{L}\left( c_{k},y \right)p\left( c_{k} \middle \vert X = x \right)}}} \\
  &=& \arg{\min_{y\in S}{\sum_{k = 1}^{K}{p\left( y \neq c_{k} \middle \vert X = x \right)}}} \\
  &=& \arg{\min_{c_k}\left\lbrack 1 - p\left( c_{k} \middle \vert X = x \right) \right\rbrack} \\
  &=& \arg{\max_{c_k}{p\left( c_{k} \middle \vert X = x \right)}}
\end{eqnarray}
$$

　　上面公式的第一步到第二步就是利用了0-1损失达到的，这个假设还是很重要的。有了上述的推导，我们可以看出，最小化后验期望损失其实是对后验概率最大化，
也就是朴素贝叶斯所采用的原理。

# 离散型朴素贝叶斯算法的推导 #

　　离散型朴素贝叶斯算法的推导相对简单但是我感觉也是蛮繁琐的，核心的思想是利用示性函数将对数似然函数写成比较“整齐”的形式、再运用拉格朗日方法进行求解。

　　在正式推导前，我们先说明一下符号约定：

记已有的数据为，也就是训练集$$\tilde X=(x_1,x_2,...,x_N)$$,其中：

$$
x_{i} = \left( x_{i}^{\left( 1 \right)},x_{i}^{\left( 2 \right)},\cdots,x_{i}^{\left( n \right)} \right)^{T}\ (i = 1,2,\cdots,N)
$$

- $$X^{\left( j \right)}$$表示生成数据$$x^{\left( j \right)}$$的随机变量

- 随机变量$$X^{\left( j \right)}$$的取值限制在集合$$K_{j} = \{ a_{j1},a_{j2},\ldots,a_{jS_j}\}\ (j = 1,2,\cdots,n)$$中

- 类别$$Y$$的可能取值集合为$$S = \{ c_{1},c_{2},\ldots,c_{K}\}$$

- 用$$\theta^{c_{k}}(k = 1,2,\ldots,K)$$表示先验概率$$p(Y = c_{k})$$

- 用$$\theta_{j,a_{jl}}^{c_{k}}$$表示条件概率$$p(X^{\left( j \right)} = a_{jl} \vert Y = c_{k})\ (j \in \left\{ 1,\ldots,n \right\},l \in \{ 1,\ldots,S_{j}\},k \in \{ 1,\ldots,K\}$$

　　有了上述约定，我们就可以来推导公式了：

**计算对数似然函数**

$$
\begin{eqnarray}
  \ln L &=& \ln p(c_k \vert X=x) \\  
  &=& \ln p(y = c_k)p(X = x \vert y = c_k) \\  
  &=& \ln{\prod_{i = 1}^{N}\left( \theta^{y_{i}} \cdot \prod_{j = 1}^{n}{\theta_{j,x_{i}^{\left( j \right)}}^{y_{i}}\ } \right)} \\
  &=& \sum_{k = 1}^{K}{n_{k}\ln{\theta^{k} + \sum_{j = 1}^{n}{\sum_{k = 1}^{K}{\sum_{l = 1}^{S_{j}}{n_{j,l}^{k}\ln\theta_{j,a_{jl}}^{c_{k}}}\ }}}}
\end{eqnarray}
$$

　　其中

$$
\begin{eqnarray}
  n_{s} &=& \sum_{i = 1}^{N}{I\left( y_{i} = c_{s} \right)} \\
  n_{j,l}^{k} &=& \sum_{i = 1}^{N}{I\left( x_{i}^{\left( j \right)} = a_{jl}{,y}_{i} = c_{k} \right)}
\end{eqnarray}
$$

**极大化似然函数**

　　有了上式，最大化对数似然只需分别最大化

$$f_{1} = \sum_{k = 1}^{K}{n_{k}\ln\theta^{k}}$$

和

$$f_{2} = \sum_{j = 1}^{n}{\sum_{k = 1}^{K}{\sum_{l = 1}^{S_{j}}{n_{j,l}^{k}\ln\theta_{j,a_{jl}}^{c_{k}}}\ }}$$

　　对于后者，由条件独立性假设可知、我们只需要对$$j=1,2,...,n$$分别最大化：

$$f_{2}^{\left( j \right)} = \sum_{k = 1}^{K}{\sum_{l = 1}^{S_{j}}{n_{j,l}^{k}\ln\theta_{j,a_{jl}}^{c_{k}}}\ }$$

　　具体求解极大值时，我们采用拉格朗日方法求解，用到的约束条件是：

$$
\begin{eqnarray}
  \sum_{k = 1}^{K}\theta^{k} &=& \sum_{k = 1}^{K}{p\left( Y = c_{k} \right)} = 1 \\
  \sum_{l = 1}^{S_{j}}{\theta_{j,l}^{k}} &=& \sum_{l = 1}^{S_{j}}{p\left( X^{\left( j \right)} = a_{jl} \middle \vert Y = c_{k} \right) = 1\ \left( \forall k \in \left\{ 1,\ldots,K \right\},j \in \left\{ 1,\ldots,n \right\} \right)}
\end{eqnarray}
$$

　　对于$$f_{1}$$计算最大值时，有

$$L_{1} = \sum_{k = 1}^{K}{n_{k}\ln{\theta^{k} + \alpha\left( \sum_{k = 1}^{K}{\theta^{k} - 1} \right)}}$$

　　由一阶条件

$$\frac{\partial L_{1}}{\partial\theta_{k}} = \frac{\partial L_{1}}{\partial\alpha} = 0$$

　　可以解得

$$
\begin{eqnarray}
  p\left( Y = c_{k} \right) = \theta^{k} &=& \frac{n_{k}}{N} = \frac{\sum_{i = 1}^{N}{I(y_{i} = c_{k})}}{N} \\
  \alpha &=& - \frac{N}{K}
\end{eqnarray}
$$

　　同理，对$$f_2^{(j)}$$应用拉格朗日方法，可以得到

$$
p\left( X^{\left( j \right)} = a_{jl} \middle \vert Y = c_{k} \right) = \theta_{j,l}^{k} = \frac{n_{j,l}^{k}}{\sum_{i = 1}^{N}{I(y_{i} = c_{k})}} = \frac{\sum_{i = 1}^{N}{I(x_{i}^{\left( j \right)} = a_{jl},y_{i} = c_{k})}}{\sum_{i = 1}^{N}{I(y_{i} = c_{k})}}
$$

　　自此，离散型朴素贝叶斯算法的推导就结束了，对于半朴素贝叶斯和贝叶斯网我们之后再去分析，接下来我们就将正真进入朴素贝叶斯算法的学习了。

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！