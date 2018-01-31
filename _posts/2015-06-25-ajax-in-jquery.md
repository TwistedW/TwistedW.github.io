---
layout: post
title: jquery对ajax的支持
category: 技术
tags: [前端,jquery]
description: 
---

>一些简单笔记，高手请忽略

**AJAX是什么**

AJAX = 异步 JavaScript 和 XML（Asynchronous JavaScript and XML）

**AJAX有什么用**

AJAX 是与服务器交换数据的艺术，简短地说，在不重载整个网页的情况下，AJAX 通过后台加载数据，并在网页上进行显示。不使用 AJAX的网页如果需要更新内容，必需重载整个网页面。

**jQuery是什么**

jQuery 是一个 JavaScript 库，可以极大地简化 JavaScript 编程。                                   

**jQuery对ajax的支持**

jquery封装了XMLHttpRequest（AJAX与服务器异步交互的核心）的底层实现，直接调用提供的方法即可。同时因为不同的浏览器对 AJAX 的实现并不相同，这意味着需要编写额外的代码对浏览器进行测试。不过，jQuery 为我们解决了这个难题，我们只需要简单的代码，就可以实现 AJAX 功能。


**jQuery中ajax方法**

**$.ajax(options)方法**

这个方法是jQuery对于ajax最为全面的支持，$.ajax(options)既可以发送GET请求，也可以发送POST请求等等，因此我们通过这个方法可以获得ajax交互的所有控制权。$.ajax() 返回其创建的 XMLHttpRequest 对象。

该方法中包含了一个参数options，它是配置Ajax请求的键值对集合，该参数的形式为{key1:val1,key2:val2,key3:val3....}，如：

	$.ajax({
      type: "GET",
      url: "http://static.duoshuo.com/embed.js",
      dataType: "script",
      cache: true
    });


常用参数有：

1. async
类型：Boolean
默认值: true。默认设置下，所有请求均为异步请求。发送同步请求，设置为 false。

2. beforeSend(XHR)
类型：Function
指定发送请求之前将触发指定的函数，通过该函数我们可以在请求前加一些自定义的请求头或者是请求状态条等
XMLHttpRequest 对象是唯一的参数。
这是一个 Ajax 事件。如果返回 false 可以取消本次 ajax 请求。

3. cache
类型：Boolean
是否从浏览器中读取缓存，默认为true(读取缓存)
默认值: true，dataType 为 script 和 jsonp 时默认为 false。设置为 false 将不缓存此页面。


4. complete(XHR, TS)
类型：Function
请求完成后回调函数 (请求成功或失败之后均调用)。
参数： XHR是XMLHttpRequest 对象，TS（TextStatus）表示服务器端相应状态的描述。
这是一个 Ajax 事件。

5. contentType
类型：String
默认值: "application/x-www-form-urlencoded"。发送信息至服务器时内容编码类型。
默认值适合大多数情况。如果你明确地传递了一个 content-type 给 $.ajax() 那么它必定会发送给服务器（即使没有数据要发送）。

6. context
类型：Object
这个对象用于设置 Ajax 相关回调函数的上下文。也就是说，让回调函数内 this 指向这个对象（如果不设定这个参数，那么 this 就指向调用本次 AJAX 请求时传递的 options 参数）。比如指定一个 DOM 元素作为 context 参数，这样就设置了 success 回调函数的上下文为这个 DOM 元素。
就像这样：
	  $.ajax({ url: "test.html", context: document.body, success: function(){
        $(this).addClass("done");
      }});

7. data
类型：String
发送到服务器的数据。将自动转换为请求字符串格式。GET 请求中将附加在 URL 后。查看 processData 选项说明以禁止此自动转换。必须为 Key/Value 格式。如果为数组，jQuery 将自动为不同值对应同一个名称。如 {foo:["bar1", "bar2"]} 转换为 '&foo=bar1&foo=bar2'。

8. dataFilter
类型：Function
给 Ajax 返回的原始数据的进行预处理的函数。提供 data 和 type 两个参数：data 是 Ajax 返回的原始数据，type 是调用 jQuery.ajax 时提供的 dataType 参数。函数返回的值将由 jQuery 进一步处理。

9. dataType
类型：String
预期服务器返回的数据类型。如果不指定，jQuery 将自动根据 HTTP 包 MIME 信息来智能判断，比如 XML MIME 类型就被识别为 XML。随后服务器端返回的数据会根据这个值解析后，传递给回调函数。可用值:
"xml": 返回 XML 文档，可用 jQuery 处理。
"html": 返回纯文本 HTML 信息；包含的 script 标签会在插入 dom 时执行。
"script": 返回纯文本 JavaScript 代码。不会自动缓存结果。除非设置了 "cache" 参数。注意：在远程请求时(不在同一个域下)，所有 POST 请求都将转为 GET 请求。（因为将使用 DOM 的 script标签来加载）
"json": 返回 JSON 数据 。
"jsonp": 指定使用jsonp加载json块。使用 JSONP 形式调用函数时，如 "myurl?callback=?" jQuery 将自动替换 ? 为正确的函数名，以执行回调函数。
"text": 返回纯文本字符串

10. error
类型：Function
指定服务器响应出现错误的回调函数
有以下三个参数：XMLHttpRequest 对象、错误信息、（可选）捕获的异常对象。
如果发生了错误，错误信息（第二个参数）除了得到 null 之外，还可能是 "timeout", "error", "notmodified" 和 "parsererror"。
这是一个 Ajax 事件。

11. global
类型：Boolean
是否触发全局 AJAX 事件。默认值: true。设置为 false 将不会触发全局 AJAX 事件，如 ajaxStart 或 ajaxStop 可用于控制不同的 Ajax 事件。

12. ifModified
类型：Boolean
仅在服务器数据改变时获取新数据。默认值: false。

13. jsonp
类型：String
在一个 jsonp 请求中重写回调函数的名字。这个值用来替代在 "callback=?" 这种 GET 或 POST 请求中 URL 参数里的 "callback" 部分，比如 {jsonp:'onJsonPLoad'} 会导致将 "onJsonPLoad=?" 传给服务器。

14. jsonpCallback
类型：String
为 jsonp 请求指定一个回调函数名。这个值将用来取代 jQuery 自动生成的随机函数名。这主要用来让 jQuery 生成度独特的函数名，这样管理请求更容易，也能方便地提供回调函数和错误处理。你也可以在想让浏览器缓存 GET 请求的时候，指定这个回调函数名。

15. password
类型：String
用于响应 HTTP 访问认证请求的密码

16. processData
类型：Boolean
默认值: true。指定是否需要处理请求数据，默认为true(需要处理)。默认情况下，通过data选项传递进来的数据，如果是一个对象(技术上讲只要不是字符串)，都会处理转化成一个查询字符串，以配合默认内容类型 "application/x-www-form-urlencoded"。如果要发送 DOM 树信息或其它不希望转换的信息，请设置为 false。

17. scriptCharset
类型：String
只有当请求时 dataType 为 "jsonp" 或 "script"，并且 type 是 "GET" 才会用于强制修改 charset。通常只在本地和远程的内容编码不同时使用。

18. success
类型：Function
请求成功后的回调函数。
参数：由服务器返回，并根据 dataType 参数进行处理后的数据；TextStatus描述状态的字符串。
这是一个 Ajax 事件。

19. traditional
类型：Boolean
如果你想要用传统的方式来序列化数据，那么就设置为 true。请参考工具分类下面的 jQuery.param 方法。

20. timeout
类型：Number
设置请求超时时间（毫秒）。此设置将覆盖全局设置。

21. type
类型：String
默认值: "GET")。请求方式 ("POST" 或 "GET")， 默认为 "GET"。注意：其它 HTTP 请求方法，如 PUT 和 DELETE 也可以使用，但仅部分浏览器支持。

22. url
类型：String
默认值: 当前页地址。发送请求的地址。

23. username
类型：String
用于响应 HTTP 访问认证请求的用户名。

24. xhr
类型：Function
需要返回一个 XMLHttpRequest 对象。默认在 IE 下是 ActiveXObject 而其他情况下是 XMLHttpRequest 。使用自己的方式来创建XMLHttpRequest对象

**一些简单易用的高级方法**

上面介绍的$.ajax(options)为我们提供了全面控制ajax的请求细节，但另一个方面就会显得比较的复杂，因此jquery提供了几个简单的方法来发送请求

1. $.ajaxStart（）
ajaxStart() 方法在 AJAX 请求发送前执行函数。它是一个 Ajax 事件。

2. $.ajaxComplete（）
ajaxComplete() 方法在 AJAX 请求完成时执行函数。它是一个 Ajax 事件。与 ajaxSuccess() 不同，通过ajaxComplete()方法规定的函数会在请求完成时运行，即使请求并未成功。

3. $.ajaxSuccess
ajaxSuccess() 方法在 AJAX 请求成功时执行函数。它是一个 Ajax 事件。


4. $.ajaxSetup()
ajaxSetup() 方法设置全局 AJAX 默认选项，语法：  .ajaxSetup(name:value, name:value, ...)

5. $.get()
get() 方法通过远程 HTTP GET 请求载入信息。
$.get(url, [data], [callback], [type]):向服务器端发送GET请求，参数表示分别是：url：访问的服务器的地址；data:一个js对象，同于指定请求参数；callback:指服务器响应成功后的回调函数，该函数形如：function(data, statusText){...}函数，其中data表示服务器端的响应，statusText表示服务器端响应类型的描述信息；type:表示服务器端响应的数据类型
简单的 GET 请求功能以取代复杂 $.ajax 。请求成功时可调用回调函数。如果需要在出错时执行函数，还需使用 $.ajax

6. $.post()
post() 方法通过 HTTP POST 请求从服务器载入数据。
语法与get()方法一样

7. $.getJSON()
通过 HTTP GET 请求载入 JSON 数据。与$.get()一样，只是默认指定type方式为json

8. $.getScript()
通过 HTTP GET 请求载入 JSON 数据。与$.get()一样，只是默认指定type方式为script

9. $.load()
load() 方法通过 AJAX 请求从服务器加载数据，并把返回的数据放置到指定的元素中。
语法：load(url,data,callback),data是一个形如{key1:val2,key2:val2,key3:val3...}的js对象，callback为回调函数，两个参数都是可选的