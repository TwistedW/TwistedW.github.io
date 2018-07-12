---
layout: post
title: 朴素贝叶斯算法实例说明
category: 技术
tags: [Math,Bayesian]
description: 
---

> 之前的博客已经将朴素贝叶斯的数学概念和物理含义都基本上说明清楚了，本篇博客我们对之前做一个小小的总结就是利用已有的算法知识去解决生活中的例子。
贝叶斯一系列的数学表达已经有[zhusuan](https://github.com/thu-ml/zhusuan)这个支持tensorflow的模块使用，这也是研究贝叶斯需要去掌握的。

　　今天我们说的朴素贝叶斯的应用是在离散朴素贝叶斯的基础上展开的，其实在机器学习下大部分的数据处理都是离散模型，这不妨碍我们写程序和思想的实现。

# 离散型朴素贝叶斯实例 #

　　首先我们来看看我们所知道的数据集数据我们称之为气球数据集1.0。

<table class="table table-striped">
<thead>
<tr>
    <th>颜色</th>
    <th>大小</th>
    <th>测试人员</th>
    <th>测试动作</th>
    <th>结果</th>
</tr>
</thead>
<tbody>
<tr>
    <td>  黄色</td>
    <td>小</td>
    <td>成人</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>小</td>
    <td>成人</td>
    <td>用脚踩</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>小</td>
    <td>小孩</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>小</td>
    <td>小孩</td>
    <td>用脚踩</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>大</td>
    <td>成人</td>
    <td>用手打</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>大</td>
    <td>成人</td>
    <td>用脚踩</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>大</td>
    <td>小孩</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>大</td>
    <td>小孩</td>
    <td>用脚踩</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  紫色</td>
    <td>小</td>
    <td>成人</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  紫色</td>
    <td>小</td>
    <td>小孩</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  紫色</td>
    <td>大</td>
    <td>成人</td>
    <td>用脚踩</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  紫色</td>
    <td>大</td>
    <td>小孩</td>
    <td>用脚踩</td>
    <td>爆炸</td>
</tr>
</tbody>
</table>


　　我们想预测的样本为：

<table class="table table-striped">
<thead>
<tr>
    <th>颜色</th>
    <th>大小</th>
    <th>测试人员</th>
    <th>测试动作</th>
</tr>
</thead>
<tbody>
<tr>
    <td>  紫色</td>
    <td>小</td>
    <td>小孩</td>
    <td>用脚踩</td>
</tr>
</tbody>
</table>


　　拿到这个样本我们要判断这些行为是否会导致气球爆炸，我们这时候就需要借助贝叶斯思想了。通过简单分析我们拿到的数据集容易观察到的是气球的颜色对结果不起丝毫影响，
所以在算法中该项特征可以直接去掉。因此从直观上来说，该样本所导致的结果应该是“不爆炸”，我们用离散型朴素贝叶斯算法来看看是否确实如此。

　　首先我们需要计算类别的先验概率，易得：

$$p\left( 不爆炸\right) = p\left( 爆炸\right) = 0.5$$

　　这个先验概率对我们做判断没有任何的指导意义，继而我们需要依次求出第2、3、4个特征（大小、测试人员、测试动作）的条件概率，它们才是决定新样本所属类别的关键。易得：

$$p\left( 小气球\middle| 不爆炸\right) = \frac{5}{6},\ \ p\left( 大气球\middle| 不爆炸\right) = \frac{1}{6}$$

$$p\left( 小气球\middle| 爆炸\right) = \frac{1}{6},\ \ p\left( 大气球\middle| 爆炸\right) = \frac{5}{6}$$

$$p\left( 成人\middle| 不爆炸\right) = \frac{1}{3},\ \ p\left( 小孩\middle| 不爆炸\right) = \frac{2}{3}$$

$$p\left( 成人\middle| 爆炸\right) = \frac{2}{3},\ \ p\left( 小孩\middle| 爆炸\right) = \frac{1}{3}$$

$$p\left( 用手打\middle| 不爆炸\right) = \frac{5}{6},\ \ p\left( 用脚踩\middle| 不爆炸\right) = \frac{1}{6}$$

$$p\left( 用手打\middle| 爆炸\right) = \frac{1}{6},\ \ p\left( 用脚踩\middle| 爆炸\right) = \frac{5}{6}$$

那么在条件“紫色小气球、小孩用脚踩”下，知（注意我们可以忽略颜色和先验概率）：

$$\hat{p}\left( 不爆炸\right) = p\left( 小气球\middle| 不爆炸\right) \times p\left( 小孩\middle| 不爆炸\right) \times p\left( 用脚踩\middle| 不爆炸\right) = \frac{5}{54}$$

$$\hat{p}\left( 爆炸\right) = p\left( 小气球\middle| 爆炸\right) \times p\left( 小孩\middle| 爆炸\right) \times p\left( 用脚踩\middle| 爆炸\right) = \frac{5}{108}$$

　　所以我们由结果$$\hat{p}\left( 不爆炸\right) > \hat{p}\left( 爆炸\right)$$我们确实应该认为给定样本所导致的结果是“不爆炸”。

# 不足与改进 #

　　需要指出的是，目前为止的算法存在一个问题：如果训练集中某个类别$$c_{k}$$的数据没有涵盖第 j 维特征的第 l 个取值的话、相应估计的条件概率
$$\hat{p}\left( X^{\left( j \right)} = a_{jl} \middle| y = c_{k} \right)$$就是 0、从而导致模型可能会在测试集上的分类产生误差。
解决这个问题的办法是在各个估计中加入平滑项（也有这种做法就叫贝叶斯估计的说法）：

　　**具体操作：**

　　计算先验概率$$p_{\lambda}(y = c_{k})$$：

$$p_{\lambda}\left( y = c_{k} \right) = \frac{\sum_{i = 1}^{N}{I\left( y_{i} = c_{k} \right) + \lambda}}{N + K\lambda},\ k = 1,2,\ldots,K$$

　　计算条件概率$$p_{\lambda}(X^{\left( j \right)} = a_{jl} \vert y = c_{k})$$：

$$
p_{\lambda}\left( X^{\left( j \right)} = a_{jl} \middle| y = c_{k} \right) = \frac{\sum_{i = 1}^{N}{I\left( x_{i}^{\left( j \right)} = a_{jl},y_{i} = c_{k} \right) + \lambda}}{\sum_{i = 1}^{N}{I(y_{i} = c_{k})} + S_{j}\lambda}
$$

　　可见当$$\lambda = 0$$时就是极大似然估计，而当$$\lambda = 1$$一般可以称之为拉普拉斯平滑（Laplace Smoothing）。拉普拉斯平滑是常见的做法、
我们的实现中也会默认使用它。可以将气球数据集 1.0 稍作变动以彰显加入平滑项的重要性（新数据集如下表所示，不妨称之为气球数据集 1.5）：

<table class="table table-striped">
<thead>
<tr>
    <th>颜色</th>
    <th>大小</th>
    <th>测试人员</th>
    <th>测试动作</th>
    <th>结果</th>
</tr>
</thead>
<tbody>
<tr>
    <td>  黄色</td>
    <td>小</td>
    <td>成人</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>小</td>
    <td>成人</td>
    <td>用脚踩</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>小</td>
    <td>小孩</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>小</td>
    <td>小孩</td>
    <td>用脚踩</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>小</td>
    <td>小孩</td>
    <td>用脚踩</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>小</td>
    <td>小孩</td>
    <td>用脚踩</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>大</td>
    <td>成人</td>
    <td>用手打</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>大</td>
    <td>成人</td>
    <td>用脚踩</td>
    <td>爆炸</td>
</tr>
<tr>
    <td>  黄色</td>
    <td>大</td>
    <td>小孩</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  紫色</td>
    <td>小</td>
    <td>成人</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  紫色</td>
    <td>小</td>
    <td>小孩</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
<tr>
    <td>  紫色</td>
    <td>大</td>
    <td>小孩</td>
    <td>用手打</td>
    <td>不爆炸</td>
</tr>
</tbody>
</table>

　　可以看到这个数据集是“不太均衡”的：它对样本“黄色小气球，小孩用脚踩”重复进行了三次实验、而对所有紫色气球样本实验的结果都是“不爆炸”。
如果我们此时想预测“紫色小气球，小孩用脚踩”的结果，虽然从直观上来说应该是“爆炸”，但我们会发现、此时由于

$$p\left( 用脚踩| 不爆炸\right) = p\left( 紫色| 爆炸\right) = 0$$

　　所以会直接导致

$$\hat{p}\left( 不爆炸\right) = \hat{p}\left( 爆炸\right) = 0$$

　　从而我们只能随机进行决策，这不是一个令人满意的结果。此时加入平滑项就显得比较重要了，我们以拉普拉斯平滑为例、知（注意类别的先验概率仍然不造成影响）：

$$p\left( 黄色\middle| 不爆炸\right) = \frac{3 + 1}{6 + 2},\ \ p\left( 紫色\middle| 不爆炸\right) = \frac{3 + 1}{6 + 2}$$

$$p\left( 黄色\middle| 爆炸\right) = \frac{6 + 1}{6 + 2},\ \ p\left( 紫色\middle| 爆炸\right) = \frac{0 + 1}{6 + 2}$$

$$p\left( 小气球\middle| 不爆炸\right) = \frac{4 + 1}{6 + 2},\ \ p\left( 大气球\middle| 不爆炸不爆炸\right) = \frac{2 + 1}{6 + 2}$$

$$p\left( 小气球\middle| 爆炸\right) = \frac{4 + 1}{6 + 2},\ \ p\left( 大气球\middle| 爆炸\right) = \frac{2 + 1}{6 + 2}$$

$$p\left( 成人\middle| 不爆炸\right) = \frac{2 + 1}{6 + 2},\ \ p\left( 小孩\middle| 不爆炸\right) = \frac{4 + 1}{6 + 2}$$

$$p\left( 成人\middle| 爆炸\right) = \frac{3 + 1}{6 + 2},\ \ p\left( 小孩\middle| 爆炸\right) = \frac{3 + 1}{6 + 2}$$

$$p\left( 用手打\middle| 不爆炸\right) = \frac{6 + 1}{6 + 2},\ \ p\left( 用脚踩\middle| 不爆炸\right) = \frac{0 + 1}{6 + 2}$$

$$p\left( 用手打\middle| 爆炸\right) = \frac{1 + 1}{6 + 2},\ \ p\left( 用脚踩\middle| 爆炸\right) = \frac{5 + 1}{6 + 2}$$

　　从而可算得：

$$\hat{p}\left( 不爆炸\right) = \frac{25}{1024},\ \ \hat{p}\left( 爆炸\right) = \frac{15}{512}$$

　　因此我们确实应该认为给定样本所导致的结果是“爆炸”

　　这就是最简单的朴素贝叶斯解决生活中问题的小小的实例，只要合理的使用了贝叶斯思想可以在数据分析上有很大的帮助。

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！