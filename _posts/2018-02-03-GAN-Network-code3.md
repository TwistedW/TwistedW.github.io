---
layout: post
title: GAN代码的搭建(4)
category: 技术
tags: [code,GAN]
description: 
---

>前面的文章已经将GAN的数据处理，GAN的网络搭建以及损失函数的设计都完成了，就差训练和出结果这一步了，本文将对GAN模型进行训练。

前面已经将繁琐的部分解决了，接下来就差训练了。训练GAN模型其实很简单，就是开启tensorflow数据流让网络参数随着训练步数更新优化即可。我们先
贴上代码再分析。

    def train(self):

        # initialize all variables初始化各个变量
        tf.global_variables_initializer().run()

        # graph inputs for visualize training results
        #创造噪声z,GAN中应用的为均值分布，创造(64,62)大小的-1到1之间的
        self.sample_z = np.random.uniform(-1, 1, size=(self.batch_size, self.z_dim))

        # saver to save model 将训练好的模型参数保存起来
        self.saver = tf.train.Saver()

        # summary writer 将训练记录在log下
        self.writer = tf.summary.FileWriter(self.log_dir + '/' + self.model_name,
                                            self.sess.graph)

        # restore check-point if it exits
        could_load, checkpoint_counter = self.load(self.checkpoint_dir)
        if could_load:
            start_epoch = int(checkpoint_counter / self.num_batches)
            start_batch_id = checkpoint_counter - start_epoch * self.num_batches
            counter = checkpoint_counter
            print(" [*] Load SUCCESS")
        else:
            start_epoch = 0
            start_batch_id = 0
            counter = 1
            print(" [!] Load failed...")

        # loop for epoch
        start_time = time.time()
        for epoch in range(start_epoch, self.epoch):

            # get batch data
            # 由于batchsize为64，遍历70000张图片需要1093次
            for idx in range(start_batch_id, self.num_batches):
                #提取处理好的固定位置图片，data_X的按批次处理后的图片位置，一个批次64张图片
                batch_z = np.random.uniform(-1, 1, [self.batch_size, self.z_dim]) \
                                            .astype(np.float32)
                batch_images = self.data_X[idx * self.batch_size:(idx + 1) \
                                            * self.batch_size]

                # update D network sess.run喂入数据优化更新D网络，并在tensorboard中更新
                _, summary_str, d_loss = self.sess.run([self.d_optim, self.d_sum, self.d_loss],
                                        feed_dict={self.inputs: batch_images, self.z: batch_z})
                self.writer.add_summary(summary_str, counter)

                # update G network sess.run喂入数据优化更新G网络，并在tensorboard中更新
                _, summary_str, g_loss = self.sess.run([self.g_optim, self.g_sum, self.g_loss],
                                                        feed_dict={self.z: batch_z})
                self.writer.add_summary(summary_str, counter)

                # display training status
                counter += 1
                #训练一个batchsize打印一下loss，一个epoch打印1093次我认为没这个必要,
                #50次batchsize后打印一下
                if np.mod(counter, 50) == 0:
                    print("Epoch: [%2d] [%4d/%4d] time: %4.4f, d_loss= %.8f, g_loss= %.8f" \
                          % (epoch, idx, self.num_batches, time.time() - start_time,
                           d_loss, g_loss))

                # save training results for every 300 steps 训练300步保存一张图片
                if np.mod(counter, 300) == 0:
                    #生成一张该阶段下的由生成器生成的“假图片”
                    samples = self.sess.run(self.fake_images, feed_dict={self.z: self.sample_z})
                    #此处计算生成图片的小框图片的排布，本处为8×8排布
                    tot_num_samples = min(self.sample_num, self.batch_size)
                    manifold_h = int(np.floor(np.sqrt(tot_num_samples)))
                    manifold_w = int(np.floor(np.sqrt(tot_num_samples)))
                    save_images(samples[:manifold_h * manifold_w, :, :, :],
                                [manifold_h, manifold_w],'./' + check_folder(self.result_dir
                                + '/' + self.model_dir) + '/' + self.model_name +
                                '_train_{:02d}_{:04d}.png'.format(epoch, idx))

            # After an epoch, start_batch_id is set to zero 经过一个epoch后start_batch_id置为0
            # non-zero value is only for the first epoch after loading pre-trained model
            start_batch_id = 0

            # save model
            self.save(self.checkpoint_dir, counter)

            # show temporal results 经过一个epoch后输出一张全类别的图片，用于比较epoch后的差别
            self.visualize_results(epoch)

        # save model for final step 当epoch全部训练完后保存checkpoint
        self.save(self.checkpoint_dir, counter)

上述代码描述了：
- 首先初始化变量
- 创造噪声z用于输入G中产生fake图片
- 加载checkpoint用于检查训练网络
- 开始循环训练
- 按批次加载数据和标签
- 更新D网络，更新G网络
- 可视化结果处理
- 保存网络参数

具体的代码我就不一行行的去解释了，其中涉及到一些地址保存和tensorboard的内容我就不详细展开了，详细的就看看我的github的完整代码吧。至于可
视化这一部分我可能会出一篇文章单独说说。

我的GANs的完整代码：

[tensorflow-GANs](https://github.com/TwistedW/tensorflow-GANs)

[pytorch-GANs](https://github.com/TwistedW/pytorch-GANs)

大家感觉可以就在github项目上点一下关注，哈哈

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！