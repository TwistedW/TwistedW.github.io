---
layout: post
title: solr界面上的一些查询参数
category: 技术
tags: [Solr]
description: 
---

> solr安装完成后，给我们提供了一个管理界面，一般是localhost:8080/solr。也提供了一个检索界面，一般是http://localhost:8081/solr/#/collection1/query，其中collection1是你的solrcore的名字，在这个界面上提供了很多查询参数。

## 1、常用参数 ##

q：query查询字符串，是必须的，如果是*：*代表查询所有数据

fq：filter query 过虑查询，作用：在q查询符合结果中同时是fq查询符合的，例如：q=文化部&fq=positive:[0.5 TO 0.9]，找关键字文化部，并且positive是0.5到0.9之间的

sort：排序，格式：sort=<field name>+<desc|asc>[,<field name>+<desc|asc>],示例
positive desc ，表示按照positive降序展示

start：返回第一条记录在完整找到结果中的偏移位置，一般分页用。
  
rows：指定返回结果最多有多少条记录，配合start来实现分页。

fl：指定返回那些字段内容，用逗号或空格分隔多个。   

wt：writer type指定输出格式，可以有 xml, json, php, ruby,python，csv等。

indent：返回的结果是否缩进，默认关闭，用indent=true|on 开启，一般调试json,php,phps,ruby输出才有必要用这个参数。 

## 2、高级参数 ##

hl：highlight，hl=true，表示采用高亮。可以用hl.fl=field1,field2 来设定高亮显示的字段。

- hl.fl: 用空格或逗号隔开的字段列表。要启用某个字段的highlight功能，就得保证该字段在schema中是stored的。
- hl.requireFieldMatch:如果置为true，那么只在该字段的查询结果中匹配query才高亮，如果置为false，那么在所有字段中只要匹配query就高亮。
- hl.usePhraseHighlighter:如果一个查询中含有短语（引号框起来的）那么会保证一定要完全匹配短语的才会被高亮。
- hl.highlightMultiTerm：如果使用通配符和模糊搜索，那么会确保与通配符匹配的term会高亮。默认为false，同时hl.usePhraseHighlighter要为true。







  



