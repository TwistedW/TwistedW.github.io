---
layout: post
title: 机器学习中常用的分类算法
category: 技术
tags: [数学,机器学习]
description: 
---

> 分类在机器学习中的应用非常重要，因为计算机其实无法深层次地理解文字图片目标的意思，只能回答是或者不是。所以让计算机知道
数据的含义是很重要的。今天我们一起来看看机器学习中常用的分类算法。

# 朴素贝叶斯 #

说到朴素贝叶斯，先说一下贝叶斯定理，首先要解释的就是条件概率，非常简单，![](/assets/img/Classifier/base1.png)表示事件B发生
的情况下，事件A发生的概率

<img src = '/assets/img/Classifier/equation1.png' height = '50px'>

贝叶斯定理之所以有用，是因为我们在生活中经常遇到这种情况：我们可以很容易直接得出![](/assets/img/Classifier/base1.png)，
![](/assets/img/Classifier/base2.png)则很难直接得出，但我们更关心![](/assets/img/Classifier/base2.png)，贝叶斯定理就为
我们打通从![](/assets/img/Classifier/base1.png)获得![](/assets/img/Classifier/base1.png)的道路。 

直接给出贝叶斯定理：

<img src = '/assets/img/Classifier/equation2.png' height = '50px'>

**朴素贝叶斯的原理和流程**

先通俗地解释一下原理，对于给出的待分类项，求解在此项出现的条件下各个类别出现的概率，哪个最大，就认为此待分类项属于哪个类别。

朴素贝叶斯的定义如下：
 
1.设x={a1,a2,a3,a4,a5,....am}为一个代分类项，而每个a为x的一个属性
 
2.类别集合C={y1,y2,y3,y4,...yn}
 
3.计算<img src = '/assets/img/Classifier/equation3.png' height = '25px'>

4.如果<img src = '/assets/img/Classifier/equation3.png' height = '25px'>那么x就属于<img src = '/assets/img/Classifier/base3.png' height = '25px'> 


谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！



