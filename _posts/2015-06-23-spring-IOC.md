---
layout: post
title: Spring中的依赖注入
category: 技术
tags:  [spring]
description: 
---

>一般的java程序中，如果某个类中需要依赖其它类的方法，则通常是new一个依赖类再调用这个类实例的方法，这种方法存在的问题是new的类实例不好统一管理。spring对此提出了依赖注入的思想，即依赖类不由程序员实例化，而是通过spring容器帮我们new指定实例并且将实例注入到需要该对象的类中。依赖注入DI(Dependency Injection)又称作控制翻转IOC（Inversion Of Control），通俗的理解是：平常我们new一个实例，这个实例的控制权是我们，而控制反转是指new实例工作不由我们来做而是交给spring容器来做。

虽然有很多种依赖注入的方式，下面只说一下最简单的一种依赖注入的方式，这里最主要的是了解依赖注入的这种思想。

看一下代码：LoginAction类中需要使用LoginService类中的方法，可以在LoginAction类中private声明LoginService类的对象，这里不是new的，而一般情况下想要使用其他类的方法，需要先new这个类的对象，LoginAction类的set方法就是IOC的入口，spring容器帮我们创建LoginService类的对象再通过set方法注入到当前类中

	public class LoginAction extends ActionSupport {
		
		private LoginService loginService;
	
		public LoginService getLoginService() {
			return loginService;
		}
		public void setLoginService(LoginService loginService) {   //IOC的入口
			this.loginService = loginService;
		}

		public String execute() throws Exception {
			Boolean b = loginService.isLogin();
			if (b) {
				return SUCCESS;
			} else {
				return ERROR;
			}
		}
		
	}

看一下配置文件： bean 中的name属性（即loginAction）是class属性的一个别名，class属性指类的全名。在LoginAction类中有一个公共属性loginService，因此下面配置property，name="loginService"， 这个name对应了与LoginAction类中set方法setLoginService的一致。而ref指下面<bean id="loginService" ...>,这样其实就是spring将LoginServiceImpl对象实例化并且调用LoginAction的setLoginService方法将loginService注入：

		<!--配置bean,配置后该类由spring管理-->
		<bean id="loginAction" class="com.iip.actions.LoginAction" scope="prototype">  
			<property name="loginService" ref="loginService"></property>  
		</bean>

		<!-- 业务逻辑层 -->    
		<bean id="loginService" class="com.service.LoginServiceImpl></bean>	


另外：
spring 默认scope 是单例模式，这样只会创建一个Action对象，每次访问都是同一个Action对象，数据不安全，scope="prototype" 可以保证 当有请求的时候 都创建一个Action对象