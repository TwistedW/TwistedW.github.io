---
layout: post
title: Jekyll 语法简单笔记
category: 技术
tags:  [Jekyll,github]
description: 
---

>前言:具体官方文档地址请参考[官方文档](http://jekyllrb.com/docs/home/).这里记录下关于 jekyll 的一些配置信息所代表的意义。

先上图片

![](/assets/img/blogimg/Jekyll-grammer.png)


## Jekyll 是什么?

jekyll 是一个静态网站生成器.
jekyll 通过 标记语言 markdown 或 textile 和 模板引擎 liquid 转换生成网页.
github 为我们提供了这个一个地方, 可以使用 jekyll 做一个我们自己的网站.

jekyll 依赖于 ruby 


## 文件介绍

### _config.yml

jekyll 的全局配置在 _config.yml 文件中配置.
比如网站的名字, 网站的域名, 网站的链接格式等等.

### _includes

对于网站的头部, 底部, 侧栏等公共部分, 为了维护方便, 我们可能想提取出来单独编写, 然后使用的时候包含进去即可.这时我们可以把那些公共部分放在这个目录下.使用时只需要引入即可.

	{ % include filename % }

### _layouts

这里面存放的是布局文件，在发布新内容是，指定使用的模板即可。


### _posts

这里就是你要发布的博客内容，在头部使用

	---
	layout: post
	---

指定需用的模板。


### index.html

就是你的默认主页，第一次访问的时候，默认打开的页面


## 全局变量

关于 jekyllrb 的变量文档，可以参考 [官方文档](http://jekyllrb.com/docs/variables/)


- site _config.yml 中配置的信息
- page 页面的配置信息
- content 模板中,用于引入子节点的内容
- paginator 分页信息


**site 下的变量**

- site.time 运行 jekyll 的时间
- site.pages 所有页面
- site.posts 所有文章
- site.related_posts 类似的10篇文章,默认最新的10篇文章,指定lsi为相似的文章
- site.static_files 没有被 jekyll 处理的文章,有属性path,modified_time 和 extname
- site.html_pages 所有的 html 页面
- site.collections 新功能,没使用过
- site.data _data 目录下的数据
- site.documents 所有 collections 里面的文档
- site.categories 所有的 categorie
- site.tags 所有的 tag
- site.[CONFIGURATION_DATA] 自定义变量

**page 下的变量**

- page.content 页面的内容
- page.title 标题
- page.excerpt 摘要
- page.url 链接
- page.date 时间
- page.id 唯一标示
- page.categories 分类
- page.tags 标签
- page.path 源代码位置
- page.next 下一篇文章
- page.previous 上一篇文章