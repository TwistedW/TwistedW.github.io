---
layout: post
title: 贝叶斯公式入门理解
category: 技术
tags: [数学]
description: 
---

> 贝叶斯入门介绍

L : 神经网络的层数
$$n^l$$ : 第$$l$$层神经元的个数
$$f_l(\cdot)$$ : 第$$l$$层神经元的激活函数
$$\omega^l \epsilon \mathbb{R} ^{n^l*n^{l-1}}$$ : 表示$$l-1$$层到$$l$$层的权重矩阵
$$b^l\epsilon \mathbb{R} ^{n^l}$$ : 表示$$l-1$$层到$$l$$层的偏置
$$z^l\epsilon \mathbb{R} ^{n^l}$$ : 表示$$l$$层神经元的状态
$$a^l\epsilon \mathbb{R} ^{n^l}$$ : 表示$$l$$层神经元的活性值

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！