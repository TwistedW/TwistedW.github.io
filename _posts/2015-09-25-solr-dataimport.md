---
layout: post
title: solr的自动增量索引
category: 技术
tags: [Solr]
description: 
---

> Solr官方提供了很强大的 [Data Import Request Handler](http://wiki.apache.org/solr/DataImportHandler)，并且提供了一个简单的schedule,我们基于此可以做自动增量索引。

1、将solr-dataimporthandler-x.x.x.jar、solr-dataimporthandler-extras-x.x.x.jar和solr-dataimportscheduler-modified.jar包放到solr的lib目录下。
其中：由于官方提供的apache-solr-dataimportscheduler-1.0.jar有一个bug，增量索引的post请求无法正常发送，网上找到了solr-dataimportscheduler-modified.jar修复了这个bug，可以到我的网盘[http://pan.baidu.com/s/1mhl1StM](http://pan.baidu.com/s/1mhl1StM)下载。

2、修改solr.war中WEB-INF/web.xml, 在servlet节点前面增加: 

	<listener>
		<listener-class>
			org.apache.solr.handler.dataimport.scheduler.ApplicationListener
		</listener-class>
	</listener>

3、将solr-dataimportscheduler-modified.jar中 dataimport.properties 取出并根据实际情况修改,然后放到 solrhome/conf里。注意不是自己创建的solrhome/oollection1/conf目录下。

4.data-config.xml配置

	<dataConfig>
	    <dataSource name="slave1"
             type="JdbcDataSource" 
             driver="com.mysql.jdbc.Driver"  
             url="jdbc:mysql://localhost:3306/test?useUnicode=true&amp;characterEncoding=UTF-8"
             user="test" 
             password="test"
             batchSize="-1"/>

	    <document name="products">
	        <entity name="item" pk="ID" dataSource="slave1"
	                query="select * from item"
	                deltaImportQuery="select * from item where ID='${dataimporter.delta.id}'"
	                deltaQuery="select id from item where inputtime > '${dataimporter.item.last_index_time}">
            	
				<field column="ID" name="id" />           
				<field column="CATEGORY" name="category" /> 
				<field column="SOURCE" name="source" /> 

				<entity name="feature" pk="ID"
						query="select description from feature where ID='${item.ID}'">
					<field column="DESCRIPTION" name="description" />
				</entity>

	        </entity>
	    </document>
	</dataConfig>

其中：
- query是获取全部数据的SQL
- deltaImportQuery是根据增量数据ID获取增量数据时使用的SQL
- deltaQuery是获取增量数据ID的SQL

5.dataimport.properties 配置项，对应上面的data-config.xml

	#################################################
	#                                               #
	#       dataimport scheduler properties         #
	#                                               #
	#################################################
	
	#  to sync or not to sync
	#  1 - active; anything else - inactive
	syncEnabled=1
	
	#  which cores to schedule
	#  in a multi-core environment you can decide which cores you want syncronized
	#  leave empty or comment it out if using single-core deployment
	syncCores=collection1
	
	#  solr server name or IP address
	#  [defaults to localhost if empty]
	server=127.0.0.1
	
	#  solr server port
	#  [defaults to 80 if empty]
	port=8080
	
	#  application name/context
	#  [defaults to current ServletContextListener's context (app) name]
	webapp=solr
	
	#  URL params [mandatory]
	#  remainder of URL
	params=/dataimport?command=delta-import&clean=false&commit=true&entity=item
	
	#  schedule interval
	#  number of minutes between two runs
	#  [defaults to 30 if empty]
	interval=30


6、重启tomcat，当有新数据的时候，发现会自动更新。

完










	







