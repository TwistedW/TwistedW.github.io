---
layout: post
title: SolrCloud的单机伪分布式环境搭建
category: 技术
tags: Solr
description: 
---


> 在项目中，我主要负责Solr这一块，为了便于在单机上进行调试，今天在我的电脑上搭建一个SolrCloud单机伪分布式环境。

## 用到的软件

>本文中是根据如下软件搭建的。

- apache-tomcat-8.0.14.tar.gz
- solr-4.10.1.zip
- zookeeper-3.4.6.tar.gz

网盘下载地址 [点这里](http://pan.baidu.com/s/1dDB4mop)



## 搭建过程

在/usr/local下新建目录 SolrCloud

	mkdir SolrCloud
	cd SolrCloud

### 多tomcat

> 由于是用不同的端口号模拟不同的机器，因此需要多个tomcat

将apache-tomcat-8.0.14.tar.gz拷贝到SolrCloud目录下，并解压

	tar zxvf apache-tomcat-8.0.14.tar.gz

重命名为 tomcat_server_8080

	mv apache-tomcat-8.0.14 tomcat_server_8080

把 tomcat_server_8080复制三份，分别命名为tomcat_server_8081、tomcat_server_8082、tomcat_server_8083，后面的8080，8081，8082，8083是我准备用的tomcat的端口号。

	cp -r tomcat_server_8080 tomcat_server_8081
	cp -r tomcat_server_8080 tomcat_server_8082
	cp -r tomcat_server_8080 tomcat_server_8083

配置端口：

	    tomcat           http端口   https端口   关闭指令端口   Ajp端口
	tomcat_server_8080	  8080        8443        8005         8009
	tomcat_server_8081	  8081        8444        8006         8010
	tomcat_server_8082	  8082        8445        8007         8011
	tomcat_server_8083	  8083        8446        8008         8012

修改 tomcat-server_*/conf/server.xml 进行配置，以tomcat_server_8080/conf/server.xml为例，其它按照此配置进行配置即可。

	<Server port="8005" shutdown="SHUTDOWN">  //接受服务器关闭指令的端口号，关闭指令端口.


	<Connector port="8080" protocol="HTTP/1.1"

      connectionTimeout="20000"

      redirectPort="8443" />
	//http请求处理端口，我们在网页上输入的普通url地址包含的端口就是他 .这个端口叫http端口.


	<Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />

	//接收AJP协议的处理端口.这个端口叫ajp端口.

	redirectPort="8443" //https请求的处理端口.这个端口叫https端口.

	

### 多solrhome

将 solr-4.10.1.zip 拷贝到SolrCloud目录下，并解压

	unzip solr-4.10.1.zip

将 solr-4.10.1 中/example/solr 拷贝到SolrCloud目录下，并重命名为solr_home_1

把solr_home_1复制三份，分别命名为 solr_home_2、solr_home_3、solr_home_4

此时SolrCloud下文件形式如下：

	drwxr-xr-x  4 gaoyang gaoyang      4096 Apr 18 10:12 solr_home_1
	drwxr-xr-x  4 gaoyang gaoyang      4096 Apr 18 10:11 solr_home_2
	drwxr-xr-x  4 gaoyang gaoyang      4096 Apr 18 10:12 solr_home_3
	drwxr-xr-x  4 gaoyang gaoyang      4096 Apr 18 10:12 solr_home_4
	drwxr-xr-x  9 gaoyang gaoyang      4096 Apr 18 09:59 tomcat_server_8080
	drwxr-xr-x  9 gaoyang gaoyang      4096 Apr 18 10:04 tomcat_server_8081
	drwxr-xr-x  9 gaoyang gaoyang      4096 Apr 18 10:04 tomcat_server_8082
	drwxr-xr-x  9 gaoyang gaoyang      4096 Apr 18 10:04 tomcat_server_8083

把solr-4.10.1/example/webapps/solr.war复制到tomcat-server_*（8080-8083）/webapps目录下。

1、配置 solrhome:

在tomcat-server_*（8080-8083）/conf/Catalina/localhost 下创建文件solr.xml，并填入以下内容：（以tomcat-server_8080为例，其余类推）

	<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
	<Context docBase="/usr/local/SolrCloud/tomcat_server_8080/webapps/solr.war" debug="0" crossContext="true" >
	  <Environment name="solr/home" type="java.lang.String" value="/usr/local/SolrCloud/solr_home_1" override="true" />
	</Context>

2、配置datadir:

以solr_home_1为例，其余类推。

首先在solr_home_1下创建data文件夹。此data就是存储索引的文件夹。

编辑 /usr/local/SolrCloud/solr_home_1/collection1/conf/solrconfig.xml 中的 dataDir 配置项。

	<dataDir>${solr.data.dir:/usr/local/SolrCloud/solr_home_1/data}</dataDir>

3、将solr-4.10.1/example/lib/ext下的jar包放到tomcat-server_*（8080-8083）/webapps/solr/WEB-INF/lib下。

4、启动四个tomcat 

tomcat-server_*（8080-8083）/bin下 

	./startup.sh

在浏览中中分别打开

	http://localhost:8080/solr
	http://localhost:8081/solr
	http://localhost:8082/solr
	http://localhost:8083/solr

如果都能正常访问到solr的admin页面，那么说明配置是成功的。否则就需要检查哪里错了或者遗漏了。（这四个是独立的，此时没有cloud）





### zookeeper配置

将 zookeeper-3.4.6.tar.gz 拷贝到SolrCloud目录下，解压

	tar zxvf zookeeper-3.4.6.tar.gz

并重命名为 zookeeper_server_1,把 zookeeper_server_1复制两份，分别命名为zookeeper_server_2、zookeeper_server_3。（这类需要注意的是zookeeper必须配置为奇数个，否则在选举算法中无法选出leader）

在 /usr/local/SolrCloud/zookeeper_server_* 下建立文件夹data和logs
（下面仅以zookeeper_server_1为例，其余类推）

1、将zookeeper_server_1/conf下zoo_sample.cfg文件名改为zoo.cfg 并修改zoo.cfg文件.

	tickTime=2000
	initLimit=10
	syncLimit=5
	dataDir=/usr/local/SolrCloud/zookeeper_server_1/data
	dataLogDir=/usr/local/SolrCloud/zookeeper_server_1/logs
	clientPort=2181

	server.1=127.0.0.1:2888:3888
	server.2=127.0.0.1:2889:3889
	server.3=127.0.0.1:2890:3890

在 /usr/local/SolrCloud/zookeeper_server_1 下

clientPort对应如下：

	zookeeper_server_1      2181
	zookeeper_server_2      2182
	zookeeper_server_3      2183

- tickTime：这个时间是作为 Zookeeper 服务器之间或客户端与服务器之间维持心跳的时间间隔，也就是每个 tickTime 时间就会发送一个心跳。
- initLimit：这个配置项是用来配置 Zookeeper 接受客户端（这里所说的客户端不是用户连接 Zookeeper 服务器的客户端，而是 Zookeeper服务器集群中连接到 Leader 的 
- Follower 服务器）初始化连接时最长能忍受多少个心跳时间间隔数。当已经超过 10 个心跳的时间（也就是tickTime）长度后 Zookeeper 服务器还没有收到客户端的返回信息，那么表明这个客户端连接失败。总的时间长度就是5*2000=10秒。
- syncLimit：这个配置项标识 Leader 与 Follower 之间发送消息，请求和应答时间长度，最长不能超过多少个 tickTime 的时间长度，总的时间长度就是 2*2000=4 秒
- dataDir：顾名思义就是 Zookeeper 保存数据的目录，默认情况下，Zookeeper 将写数据的日志文件也保存在这个目录里。
- dataLogDir： Zookeeper的日志文件位置。
- server.A=B：C：D：其中 A 是一个数字，表示这个是第几号服务器；B是这个服务器的 ip 地址；C 表示的是这个服务器与集群中的 Leader服务器交换信息的端口；D 表示的是万一集群中的 Leader 服务器挂了，需要一个端口来重新进行选举，选出一个新的 Leader，而这个端口就是用来执行选举时服务器相互通信的端口。如果是伪集群的配置方式，由于 B 都是一样，所以不同的 Zookeeper 实例通信端口号不能一样，所以要给它们分配不同的端口号。
- clientPort：这个端口就是客户端连接 Zookeeper 服务器的端口，Zookeeper 会监听这个端口，接受客户端的访问请求。


在三个data目录下的新建myid文件（没有后缀），修改其中的内容。zookeeper_server_1是1， zookeeper_server_2是2，zookeeper_server_3是3 。只有一行。

配置完成后依次启动：依次输入如下指令（以zookeeper_server_1为例）

	gaoyang@master:cd /usr/local/SolrCloud/zookeeper_server_1/bin
	gaoyang@master:/usr/local/SolrCloud/zookeeper_server_1/bin$ ./zkServer.sh 
	JMX enabled by default
	Using config: /usr/local/SolrCloud/zookeeper_server_1/bin/../conf/zoo.cfg
	Usage: ./zkServer.sh {start|start-foreground|stop|restart|status|upgrade|print-cmd}
	gaoyang@master:/usr/local/SolrCloud/zookeeper_server_2/bin$ ./zkServer.sh start
	JMX enabled by default
	Using config: /usr/local/SolrCloud/zookeeper_server_2/bin/../conf/zoo.cfg
	Starting zookeeper ... STARTED
	gaoyang@master:/usr/local/SolrCloud/zookeeper_server_2/bin$ ./zkServer.sh status
	JMX enabled by default
	Using config: /usr/local/SolrCloud/zookeeper_server_2/bin/../conf/zoo.cfg
	Mode: leader


可以看到zookeeper_server_1被选为leader 其它两个为follower。

另外，可以通过客户端脚本，连接到ZooKeeper集群上。对于客户端来说，ZooKeeper是一个整体（ensemble），
连接到ZooKeeper集群实际上感觉在独享整个集群的服务，所以，你可以在任何一个结点上建立到服务集群的连接。

## Tomcat+solr+zookeeper集群

以上都没问题之后，需要把tomcat+solr+zookeeper集成起来。


1、修改tomcat/bin/cataina.sh，在最上方加入
	
	JAVA_OPTS="-DzkHost=127.0.0.1:2181,127.0.0.1:2182,127.0.0.1:2183"


加入以上内容其实就是指明了zookeeper集群所在位置。

2、 在/usr/local/SolrCloud目录下创建 solrConfig-files目录和solrLib-Files目录。

3、 在/usr/local/SolrCloud/solrConfig-files目录下放置solr-4.10.1/example/solr/collection1/conf 下的所有文件。

4、 在目录/usr/local/SolrCloud/solrLib-Files目录下放置tomcat_server_1/webapps/solr/WEB-INF/lib下的所有jar包。



5、 SolrCloud是通过ZooKeeper集群来保证配置文件的变更及时同步到各个节点上，所以，需要将配置文件上传到ZooKeeper集群中：执行如下操作
	
	java -classpath .:/usr/local/SolrCloud/solrLib-Files/* org.apache.solr.cloud.ZkCLI -cmd upconfig -zkhost 127.0.0.1:2181,127.0.0.1:2182,127.0.0.1:2183 -confdir /usr/local/SolrCloud/solrConfig-files/ -confname myconf

接下来把collection中的内容链接到zookeeper中的配置：
	
	java -classpath .:/usr/local/SolrCloud/solrLib-Files/* org.apache.solr.cloud.ZkCLI -cmd linkconfig -collection collection1 -confname myconf -zkhost 127.0.0.1:2181,127.0.0.1:2182,127.0.0.1:2183  

5、配置solr_home_1下的solr.xml（其余类推，solr_home_2修改为8081，solr_home_3修改为8082，solr_home_4修改为8083）
	
	<int name="hostPort">${jetty.port:8983}</int>

将8983修改为8080 

	<int name="hostPort">${jetty.port:8080}</int>


6、依次启动三个zookeeper_server和四个tomcat_server

	http://localhost:8080/solr/#/~cloud
	http://localhost:8081/solr/#/~cloud
	http://localhost:8082/solr/#/~cloud
	http://localhost:8083/solr/#/~cloud

得到的页面都是一样的。一个collection有一个分片，这个分片有四个备份。

![](/assets/img/blogimg/SolrCloud.png)


## 创建Collection、Shard和Replication

创建Collection及初始Shard，可以通过REST接口来创建Collection

curl 'http://127.0.0.1:8080/solr/admin/collections?action=CREATE&name=mycollection&numShards=2&replicationFactor=2' 

也可在浏览器中直接输入，效果是一样的

- name 就是	collection的名字
- numShards 是分片的个数
- replicationFactor  是每个分片的备份数

至此，一个简单的solrcloud集群就搭建完毕了。













