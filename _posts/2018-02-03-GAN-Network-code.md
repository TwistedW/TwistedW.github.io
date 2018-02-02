---
layout: post
title: GAN代码的搭建(1)
category: 技术
tags: [code,GAN]
description: 
---

>生成对抗网络的理论知识很漂亮，如何将论文思想实现呢？我将出一系列文章描述GAN代码的搭建流程。今天就来说说搭建神经网络中最为关键的喂入数据
和如何处理数据集让GAN实现对抗。

踏入机器学习领域除了基本的知识点要知道还有一个很重要的基础就是如何处理数据集。大数据时代我们也要好好利用一下强大的计算机的计算能力，本文的
搭建环境是在tensorflow上实现的。当然我也将代码实现到了pytorch上，我将在文末附上详细的代码地址。

好了，废话不多说，我们进入正题。首先介绍一下我的硬件软件配置：

1.显卡：GTX1080，CPU：i5，固态硬盘：4T

2.cuda：8.0，cudnn：6.0

3.python 3.5.2，tensorflow-gpu 1.4.0

有了这些环境配置你就可以入坑机器学习了，当然当前pytorch正在疯狂崛起，也要快速掌握起来。

tensorflow的运行环境中是利用tensor作为数据流，所以在数据喂入前要定义好变量。tensorflow中提供的变量定义有几种，但是我们比较常用的是tf.placeholder
先把我们要feed的数据hold住，到传入的时候再feed给合适的数据就OK了。比如我们先定义输入数据变量，标签变量（做有监督时必备），噪声变量

    # some parameters
    image_dims = [self.output_height, self.output_width, self.c_dim]
    bs = self.batch_size

    """ Graph Input """
    # images
    self.inputs = tf.placeholder(tf.float32, [bs] + image_dims, name='real_images')
    # labels
    self.y = tf.placeholder(tf.float32, [bs, self.y_dim], name='y')
    # noises
    self.z = tf.placeholder(tf.float32, [bs, self.z_dim], name='z')

在训练网络的时候feed合适数据就好了，那feed什么数据呢？这就是我们今天要说的数据处理。首先说一下数据的选择，数据的选择当然要是我们需要训练
的。在做图像处理方面入门级的数据集就是mnist数据集，mnist数据集是由60000张训练集和10000张测试集组成，包含了七万张手写数字图片，图片是28x28
的灰色图片。也就是mnist的RGB的channel=1.

当我们下载好mnist数据集后，就可以拿来使用了。我先贴如何load数据的代码：
    def load_mnist(dataset_name):
        data_dir = os.path.join("./data", dataset_name)

        def extract_data(filename, num_data, head_size, data_size):
            with gzip.open(filename) as bytestream:
                bytestream.read(head_size)
                buf = bytestream.read(data_size * num_data)
                data = np.frombuffer(buf, dtype=np.uint8).astype(np.float)
            return data

        data = extract_data(data_dir + '/train-images-idx3-ubyte.gz', 60000, 16, 28 * 28)
        trX = data.reshape((60000, 28, 28, 1))

        data = extract_data(data_dir + '/train-labels-idx1-ubyte.gz', 60000, 8, 1)
        trY = data.reshape(60000)

        data = extract_data(data_dir + '/t10k-images-idx3-ubyte.gz', 10000, 16, 28 * 28)
        teX = data.reshape((10000, 28, 28, 1))

        data = extract_data(data_dir + '/t10k-labels-idx1-ubyte.gz', 10000, 8, 1)
        teY = data.reshape(10000)

        trY = np.asarray(trY) #将训练标签用数据保留
        teY = np.asarray(teY) #将测试标签用数据保留

        X = np.concatenate((trX, teX), axis=0) #将训练数据和测试数据拼接 (70000, 28, 28, 1)
        y = np.concatenate((trY, teY), axis=0).astype(np.int) #将训练标签和测试标签拼接 (70000)

        seed = 547
        np.random.seed(seed) #确保每次生成的随机数相同
        np.random.shuffle(X) #将mnist数据集中数据的位置打乱
        np.random.seed(seed)
        np.random.shuffle(y)

        y_vec = np.zeros((len(y), 10), dtype=np.float)
        #创建了(70000,10)的标签记录，并且根据mnist已有标签记录相应的10维数组
        for i, label in enumerate(y):
            y_vec[i, y[i]] = 1.0

        #返回归一化的数据和标签数组
        return X / 255., y_vec

上述代码的作用是load mnist数据集先对数据做解压，然后将数据转换为数组形式，由于GAN是做图像生成的所以不需要测试集验证，所以我们直接将训练
集和测试集合并作为整体送入GAN中训练。处理标签数据时，由于mnist包含的是0~9所以只需要10类就可以表示类别了，我们将标签转换为one-hot形式。
再对整体数据乱序，这样可以保证训练的时候更加随机。最后返回训练数据，训练标签就处理好mnist数据集了。

处理完mnist数据集后，我们就可以直接拿来用了。

    if dataset_name == 'mnist' or dataset_name == 'fashion-mnist':
        # parameters
        self.input_height = 28
        self.input_width = 28
        self.output_height = 28
        self.output_width = 28

        self.z_dim = z_dim         # dimension of noise-vector
        self.y_dim = 10         # dimension of code-vector (label)
        self.c_dim = 1

        # train
        self.learning_rate = 0.0001
        self.beta1 = 0.5

        # test
        self.sample_num = 64  # number of generated images to be saved

        # load mnist
        self.data_X, self.data_y = load_mnist(self.dataset_name)

        # get number of batches for a single epoch
        self.num_batches = len(self.data_X) // self.batch_size

这样处理完后就可以在训练GAN的时候直接feed就好了，我们先展示一下如何feed，具体的我们下期再说。

    _, summary_str, d_loss = self.sess.run([self.d_optim, self.d_sum, self.d_loss],
                                                        feed_dict={self.inputs: batch_images, self.z: batch_z})

好，初步的数据处理已经完成了。接下来就是搭建GAN的网络了，这是一个重要的环节，我们下次再说。

我的GANs的完整代码：

[tensorflow-GANs](https://github.com/TwistedW/tensorflow-GANs)
[pytorch-GANs](https://github.com/TwistedW/pytorch-GANs)

大家感觉可以就在github项目上点一下关注，哈哈

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！