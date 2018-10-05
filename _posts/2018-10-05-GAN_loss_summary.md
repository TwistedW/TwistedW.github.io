---
layout: post
title: GAN各类Loss整理
category: 技术
tags: [GAN,code]
description: 
---

> [GAN](https://arxiv.org/abs/1406.2661)自2014年提出到现在已经有4年了，这4年来非常多围绕GAN的论文相继诞生，其中在改进GAN损失函数上的论文就有好多篇，
今天我们一起来梳理一下知名的在GAN的损失函数上改进的Loss函数，并在tensorflow上进行汇总实现。

# GAN存在的问题

GAN固有的问题有两个，其中一个是训练时容易梯度消失，另一个就是模型生成上多样性不足。针对这两个问题，改进的文章也是相继诞生，可谓百花争放。
WGAN的[前作](https://arxiv.org/abs/1701.04862)和[后作](https://arxiv.org/abs/1701.07875)将GAN本身的问题进行了详细的分析。

文章指出GAN之所以会出现梯度消失是因为GAN的损失函数中的JS散度项在判别器优化很好的时候为$log2$时将会导致生成器的梯度消失，而JS散度在生成和真实分布流行上不重叠时，
是衡为$log2$的。文章也证实了生成和真实的分布很难有交叠，这样就会导致梯度消失的发生。另一个多样性不足的问题是由于GAN展开的KL项在生成和真实分布之间的惩罚不同，
导致生成器更倾向于生成已经骗过判别器的样本。详细的可参看我之间的博客分析：[GAN存在的问题](http://www.twistedwg.com/2018/01/30/GAN-problem.html)。

正是由于导致GAN的两个问题的罪魁祸首是它的损失函数的设计，所以一批论文就此诞生。

# 百花争放的GAN的Loss改进

[WGAN](https://arxiv.org/abs/1701.07875)利用Earth Move代替JS散度去拉近生成和真实分布；[WGAN-GP](https://arxiv.org/abs/1704.00028)
是针对WGAN在满足Lipschitz限制条件时直接采用了weight clipping，这会导权重都集中在Clipping的附近，为了自适应满足Lipschitz限制，
WGAN-GP提出了梯度惩罚;[WGAN-LP](https://arxiv.org/abs/1712.05882)也是将WGAN上加上梯度惩罚，我们放在一起说；
同样的[DRAGAN](https://arxiv.org/abs/1705.07215)同样对在GAN的基础上加上梯度惩罚，不过是在原始GAN的基础上；
[LSGAN](https://arxiv.org/abs/1611.04076)中利用最小二乘的思想去设计损失函数，展开后可以通过参数控制凑出皮尔森卡方散度也是代替了原始GAN中的JS散度；
最后来说的就是利用Hinge Loss改进GAN的原始Loss，Hinge Loss首度使用在GAN下是[Geometric GAN](https://arxiv.org/abs/1705.02894)，
[Hinge Loss](https://en.wikipedia.org/wiki/Hinge_loss)在支持向量机下应用很广，在GAN训练上依旧展示了很好的效果，目前最新的
[SAGAN](https://arxiv.org/abs/1805.08318)、[BigGAN](https://arxiv.org/abs/1809.11096)都采用这个损失函数。

我们展示一下各类GAN损失的数学表达式：

<p align="center">
    <img src="/assets/img/GAN/GAN_Loss1.png">
</p>

<p align="center">
    <img src="/assets/img/GAN/GAN_Loss2.png">
</p>

我们只对其中的无条件和可直接移至到GAN下的损失做tensorflow代码分析。

# 损失函数代码分析

我们将GAN的损失分开写为判别器Discriminator的损失、生成器Generator的损失和梯度惩罚三块。

**Discriminator损失**

```python
def discriminator_loss(loss_func, real, fake):
    real_loss = 0
    fake_loss = 0

    if loss_func.__contains__('wgan'):
        real_loss = -tf.reduce_mean(real)
        fake_loss = tf.reduce_mean(fake)

    if loss_func == 'lsgan':
        real_loss = tf.reduce_mean(tf.squared_difference(real, 1.0))
        fake_loss = tf.reduce_mean(tf.square(fake))

    if loss_func == 'gan' or loss_func == 'dragan':
        real_loss = tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(labels=tf.ones_like(real), logits=real))
        fake_loss = tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(labels=tf.zeros_like(fake), logits=fake))

    if loss_func == 'hinge':
        real_loss = tf.reduce_mean(relu(1.0 - real))
        fake_loss = tf.reduce_mean(relu(1.0 + fake))

    loss = real_loss + fake_loss

    return loss
```

这里的loss_func就是你需要用到的损失为什么类型的，比如想利用最原始GAN的损失，直接另loss_fuc = 'gan'即可。real和fake分别表示判别器返回
真实图像和生成图像的判别值，这里的返回值是没有经过Sigmoid层的。

这里的wgan类型的损失，可以选择为wgan、wgan-gp、wgan-lp，在梯度惩罚函数下再说

**Generator损失**

```python
def generator_loss(loss_func, fake):
    fake_loss = 0

    if loss_func.__contains__('wgan'):
        fake_loss = -tf.reduce_mean(fake)

    if loss_func == 'lsgan':
        fake_loss = tf.reduce_mean(tf.squared_difference(fake, 1.0))

    if loss_func == 'gan' or loss_func == 'dragan':
        fake_loss = tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(labels=tf.ones_like(fake), logits=fake))

    if loss_func == 'hinge':
        fake_loss = -tf.reduce_mean(fake)

    loss = fake_loss

    return loss
```

与判别器的定义类似。

**梯度惩罚损失**

```python
def gradient_penalty(real, fake):
    if gan_type == 'dragan':
        shape = tf.shape(real)
        eps = tf.random_uniform(shape=shape, minval=0., maxval=1.)
        x_mean, x_var = tf.nn.moments(real, axes=[0, 1, 2, 3])
        x_std = tf.sqrt(x_var)  # magnitude of noise decides the size of local region
        noise = 0.5 * x_std * eps  # delta in paper

        # Author suggested U[0,1] in original paper, but he admitted it is bug in github
        # (https://github.com/kodalinaveen3/DRAGAN). It should be two-sided.

        alpha = tf.random_uniform(shape=[shape[0], 1, 1, 1], minval=-1., maxval=1.)
        interpolated = tf.clip_by_value(real + alpha * noise, -1., 1.)  # x_hat should be in the space of X

    else:
        alpha = tf.random_uniform(shape=[self.batch_size, 1, 1, 1], minval=0., maxval=1.)
        interpolated = alpha * real + (1. - alpha) * fake

    logit = self.discriminator(interpolated, reuse=True)

    grad = tf.gradients(logit, interpolated)[0]  # gradient of D(interpolated)
    grad_norm = tf.norm(flatten(grad), axis=1)  # l2 norm

    GP = 0

    # WGAN - LP
    if gan_type == 'wgan-lp':
        GP = self.ld * tf.reduce_mean(tf.square(tf.maximum(0.0, grad_norm - 1.)))

    elif gan_type == 'wgan-gp' or self.gan_type == 'dragan':
        GP = self.ld * tf.reduce_mean(tf.square(grad_norm - 1.))

    return GP
```

这里的wgan是可以选择的，根据实际需求，在具体使用的时候，只需要给予gan_type即可。

```python
if self.gan_type.__contains__('wgan') or self.gan_type == 'dragan':
    GP = self.gradient_penalty(real=self.inputs, fake=fake_images)
else:
    GP = 0

# get loss for discriminator
self.d_loss = discriminator_loss(self.gan_type, real=real_logits, fake=fake_logits) + GP

# get loss for generator
self.g_loss = generator_loss(self.gan_type, fake=fake_logits)
```

这里的GP在梯度惩罚下的返回值，只要加在判别器损失后即可。

详细代码可参看：[tf-GANs-Loss](https://github.com/TwistedW/tf-GANs-Loss)

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！