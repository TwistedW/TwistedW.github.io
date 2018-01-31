---
layout: post
title: Linux常用命令总结
category: 技术
tags: [Linux]
description: 
---

> 一些日常使用linux，会用到的命令。做一个简单的总结，也方便忘记的时候查看。

# 1.目录和文件处理 #

1.mkdir
建立目录
用法：mkdir [OPTION] DIRECTORY...
例：mkdir test

2.ls
列出目录下的内容
用法: ls [OPTION]... [FILE]...
例：ls ­-l test

3.cd
更换工作目录
用法：cd [DIRECTORY]
例：cd test

4.pwd
显示当前工作目录
用法：pwd

5.vim
文本编辑器
用法：vim [OPTION] [file]
例：vim helloworld.c

6.cp
拷贝文件及其目录
用法：cp [OPTION]... SOURCE DEST  
例：cp  test1.txt test2.txt

7.mv
移动（重命名）文件
用法：mv [OPTION]... SOURCE DEST
例：mv old new

8.rm
删除文件或目录
用法：rm [OPTION]... FILE...
例：rm ­rf test

9.find
在目录及其子目录查找文件
用法：find [OPTION] [path] [pattern]
例：find ­name test*.txt

10.history
显示最近使用过的命令
用法：history


# 2.文本处理 #

1.cat
显示文件内容
用法：cat [OPTION] [FILE]...
例：cat /etc/hosts

2.echo 
显示一行文本
用法：echo [OPTION] [string]
例：echo $JAVA_HOME

3.grep
搜索特定的内容并将含有这些内容的行标准输出
用法：grep [OPTION] PATTERN [FILE]
例：搜索有the的行,并输出行号 
   $grep -n 'the' regular_express.txt 

4.wc
统计指定文件中的字节数、字数、行数,并将统计结果显示输出。
用法：wc [OPTION]... [FILE]
例：wc -L magicLinux.txt

5.sort
对文件中的各行进行排序
用法：sort [OPTION]... [FILE]
例：sort ­r magicLinux.txt


# 3.系统管理 #

1.chmod
控制用户对文件的权限
用法：chmod [OPTION] [MODE] [FILE]
例：chmod 777 file.sh

2.chown
改变档案的拥有者
用法：chown [OPTION]... OWNER[:[GROUP]] FILE
例：chown master magicLinux.txt

3.su
su 是切换到其他用户，但是不切换环境变量
su - 是完整的切换到一个用户环境
用法：su [OPTION] [LOGIN]
例：su master


# 4.进程管理 #

1.ps
强悍的进程查看命令
用法：ps [OPTION]
例：ps ef |grep java

2.kill
删除执行中的程序或工作
用法：kill [OPTION]
例：kill ­9 3154 (9是强制杀死，3154是某进程号)

3.jobs
通过jobs命令查到后台正在执行的命令的序号(非进程号pid)
用法：jobs


# 5.档案 #

1.tar
压缩和解压
用法：tar [OPTION] DEST SOURCE
例：tar ­cvf /home/archive.tar （压缩）
tar ­xvf /home/archive.tar （解压）

2.zip
打包压缩
用法：zip [OPTION] DEST SOURSE
例：zip original.zip original

3.unzip
解压缩zip文件
用法：unzip filename
例：unzip original.zip

# 6.网络 #

1.ssh
远程登录的客户端
用法：ssh [options] [user]@hostname
例：ssh ­ master@114.212.82.189

2.scp
基于ssh登陆进行安全的远程文件拷贝命令
用法：scp [options] [[user]@host1:file1] [[user]@host2:file2]
例：scp file1.txt master@114.212.82.189:/home/file1.txt


# 7.扩展 #

1.reboot
重启系统
用法：reboot [OPTION]
例：reboot

2.poweroff
关闭系统
用法：poweroff [OPTION]
例：poweroff








	







