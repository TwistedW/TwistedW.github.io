---
layout: post
title: jekyll博客下添加打赏功能
category: 技术
tags: [jekyll]
description: 
---

>最近系统整理了一下博客，这几天增加了评论模块和数学公式编辑功能，看到好多小伙伴的博客都自带打赏功能。我也在犹豫要不要加打赏功能，
我想一旦我加了打赏那么我的博客是不是不单纯了，毕竟我不是为了利益而写的博客。但是（此处肯定有转折）为了让大家在jekyll上搭建打赏方便些，
我出于做个教程的心态给大家安利这个功能在jekyll下怎么实现。

　　一开始我以为jekyll静态网站加上打赏在技术上是很好实现的，但是我在网上找了一些资料都是在Hexo下的打赏，
jekyll下这个功能倒是不能直接拿来用，这就激发了我的兴趣了，想着自己整理一个css文件来实现在jekyll下打赏功能的实现。
声明一下，这个工作是我熬夜做的，所以并没有耽误我的正常学习时间，今天这篇博客也是周日休息的时间写的，我这也不能说是不务正业了。

　　先给大家看看最总实现的打赏的效果，当你在网站最下方加入打赏时你会看到这样的效果：

<p align="center">
    <img src = '/assets/img/social/reward1.png'>                
</p>

　　当你把鼠标移至打赏这个按钮上的时候效果是这样的：

<p align="center">
    <img src = '/assets/img/social/reward2.png'>                 
</p>

　　好的，效果看到了，如果你感觉这个风格比较适合你，你就继续看看如何实现这个功能。

　　首先，我们是不能直接用jekyll自带的css来实现的，所以你需要自己写这个打赏的css文件，我也是参考了网上的一些资料写了这个css文件，
具体的下载地址可以在[这里得到](https://github.com/TwistedW/TwistedW.github.io/blob/master/assets/css/myreward.css)。

　　接着我们说说这个css主要包含哪些class，主要的就是reward，接着是打赏的这个button的实现，最后就是鼠标移至下打赏图片的展示。
整体这个css还是很简单的，如果你有一定基础的话一定能看的懂的，我就不展看详细的说这个css文件的细节了。
接下来我说说如何利用这个css文件实现打赏功能。

　　想必大家对这篇博文感兴趣的话多少也对jekyll网站搭建有了一定的了解，将下载好的css文件放在你的css文件夹下，
我是将这个css文件命名为了myrewanrd.css将它放在assets下的css文件夹下。接着就需要在你的head.html下对这个css文件指定路径了,
在head.html下仅需要加入以下语句即可,这里的href的地址是你的打赏css文件所在的地址。

```html
<link  href="/assets/css/myreward.css" rel="stylesheet"  type="text/css">   
```

　　接着，就需要在我们的post.html下来调用这个css实现打赏的功能了，我们在合适的地方，基本上是在博客的最下面加上打赏功能。
你可以像下面这样调用打赏的功能了。

```html
    <div class="reward">
		<div class="reward-button">赏 <span class="reward-code">
			<span class="alipay-code"> <img class="alipay-img wdp-appear" src="/assets/img/social/Alipyspeed.png"><b>支付宝打赏</b> </span>
			<span class="wechat-code"> <img class="wechat-img wdp-appear" src="/assets/img/social/Wechatspeed.png"><b>微信打赏</b> </span> </span>
		</div>
		<p class="reward-notice">您的打赏是对我最大的鼓励！</p>
	</div>
```

　　这里的src的地址就是你的支付宝和微信的打赏二维码放的地址了，这样操作完就可以同步到服务器上来测试打赏功能有没有实现，
我的博客是搭建在github上的，所以我只需要将文件同步到github服务器上就可以实现我们的打赏功能了。

　　好了，如果你按照上述操作完后你的jekyll网站上的打赏功能就可以实现了，如果你有任何的疑问可以在下面的评论区和我交流！

谢谢观看，希望对您有所帮助，欢迎指正错误，欢迎一起讨论！！！
