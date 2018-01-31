---
layout: post
title: web前端规范（转载未完）
category: 技术
tags: [前端]
description: 
---

> Web前端开发规范文档。目的是在写前端的时候更加规范化。


# 1、通用规范 # 

- TAB键用两个空格代替（WINDOWS下TAB键占四个空格，LINUX下TAB键占八个空格）。
- CSS样式属性或者JAVASCRIPT代码后加“;”方便压缩工具“断句”。
- 文件内容编码均统一为UTF-8。
- CSS、JAVASCRIPT中的非注释类中文字符须转换成unicode编码使用,以避免编码错误时乱码显示。

# 2、html书写规范 #

2.1 为每个HTML页面的第一行添加标准模式（standard mode）的声明，确保在每个浏览器中拥有一致的展现。

	<!DOCTYPE html>

2.2 文档类型声明统一为HTML5声明类型，编码统一为UTF-8。

	<meta charset="UTF-8">

2.3 <HEAD>中添加信息。

	<meta name="author" content="smile@kang.cool">//作者
	<meta name="description" content="hello">//网页描述
	<meta name="keywords" content="a,b,c">//关键字,“，”分隔
	<meta http-equiv="expires" content="Wed, 26 Feb 1997 08：21：57 GMT">//设定网页的到期时间。一旦网页过期，必须到服务器上重新调阅
	<meta http-equiv="Pragma" content="no-cache">//禁止浏览器从本地机的缓存中调阅页面内容
	<meta http-equiv="Window-target" content="_top">//用来防止别人在框架里调用你的页面
	<meta http-equiv="Refresh" content="5;URL=http://kahn1990.com/">//跳转页面，5指时间停留5秒 网页搜索机器人向导。用来告诉搜索机器人哪些页面需要索引，哪些页面不需要索引
	<meta name="robots" content="none">//content的参数有all,none,index,noindex,follow,nofollow，默认是all
	<link rel="Shortcut Icon" href="favicon.ico">//收藏图标
	<meta http-equiv="Cache-Control" content="no-cache, must-revalidate">//网页不会被缓存

2.4 非特殊情况下CSS样式文件外链至HEAD之间，JAVASCRIPT文件外链至页面底部

	<!DOCTYPE html>
	<html>
	<head>
	    <link rel="stylesheet" href="css/main.css">
	</head>
	<body>
	    <!-- 逻辑代码 -->
	    <!-- 逻辑代码底部 -->
	    <script src="lib/jquery/jquery-2.1.1.min.js"></script>
	</body>
	</html>

2.5 引入JAVASCRIPT库文件，文件名须包含库名称及版本号及是否为压缩版。

	jQuery-1.8.3.min.js

2.6 引入JAVASCRIPT插件, 文件名格式为库名称+.+插件名称

	jQuery.cookie.js

2.7 HTML属性应当按照以下给出的顺序依次排列，来确保代码的易读性。

	class
	id 、 name
	data-*
	src、for、 type、 href
	title、alt
	aria-*、 role

2.8 书写链接地址时避免重定向。

	href="http://www.kahn1990.com/" //即在URL地址后面加“/”

编码均遵循XHTML标准,
标签、属性、属性命名由小写英文、数字和_组成，且所有标签必须闭合，属性值必须用双引号"",
避免使用中文拼音尽量简易并要求语义化。

	CLASS --> nHeadTitle --> CLASS遵循小驼峰命名法（little camel-case）
	ID --> n_head_title --> ID遵循名称+_
	NAME --> N_Head_Title --> NAME属性命名遵循首个字母大写+_
	<div class="nHeadTitle" id="n_head_title" name="N_Head_Title"></div>

多用无兼容性问题的HTML内置标签,
比如SPAN、EM、STRONG、OPTGROUP、LABEL等,需要自定义HTML标签属性时，首先考虑是否存在已有的合适标签可替换，如果没有,
可使用须以“data-”为前缀来添加自定义属性，避免使用其他命名方式。

# 3、css书写规范 #

3.1 为了欺骗W3C的验证工具,可将代码分为两个文件，一个是针对所有浏览器,一个只针对IE。即将所有符合W3C的代码写到一个文件中,而一些IE中必须而又不能通过W3C验证的代码（如:
cursor:hand;）放到另一个文件中，再用下面的方法导入。

	<!-- 放置所有浏览器样式-->
	<link rel="stylesheet" type="text/css" href="">
	<!-- 只放置IE必须，而不能通过w3c的-->
	<!--[if IE]
	    <link rel="stylesheet" href="">
	<![endif]-->

3.2 CSS样式新建或修改尽量遵循以下原则。

	根据新建样式的适用范围分为三级：全站级、产品级、页面级。
	尽量通过继承和层叠重用已有样式。
	不要轻易改动全站级CSS。改动后，要经过全面测试。

3.3 CSS属性显示顺序。

	显示属性
	元素位置
	元素属性
	元素内容属性

3.4 CSS书写顺序。

	.header {
		/* 显示属性 */
	    display || visibility
	    list-style
	    position top || right || bottom || left
	    z-index
	    clear
	    float
		/* 自身属性 */
	    width max-width || min-width
	    height max-height || min-height
	    overflow || clip
	    margin
	    padding
	    outline
	    border
	    background
		/* 文本属性 */
	    color
	    font
	    text-overflow
	    text-align
	    text-indent
	    line-height
	    white-space
	    vertical-align
	    cursor
	    content
	};

3.5 兼容多个浏览器时，将标准属性写在底部。

	-moz-border-radius: 15px; /* Firefox */
	-webkit-border-radius: 15px; /* Safari和Chrome */
	border-radius: 15px; /* Opera 10.5+, 以及使用了IE-CSS3的IE浏览器 *//标准属性

3.6 使用选择器时，命名比较短的词汇或者缩写的不允许直接定义样式。

	.hd,.bd,.td{};//如这些命名

可用上级节点进行限定。

	.recommend-mod .hd

多选择器规则之间换行，即当样式针对多个选择器时每个选择器占一行。

	button.btn,
	input.btn,
	input[type="button"] {…};

优化CSS选择器。
	#header a { color: #444; };/*CSS选择器是从右边到左边进行匹配*/









	







