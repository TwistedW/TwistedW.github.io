---
layout: post
title: JDK动态代理与spring中的AOP
category: 技术
tags:  [spring]
description: 
---

>spring有两大核心，一个是依赖注入，一个是AOP。AOP是什么呢，Aspect-OrientedProgramming，面向切面编程。AOP是对OOP（Object-Oriented Programing）面向对象编程的一种很好的补充和完善。传统的OOP为我们建立了一种对象的层次结构，子类继承父类。但是如果对于不同的类有一些公共的行为，而这些类类不能从同一个类继承而来。那么势必要在这些不同的类中造成代码的重复。例如，日志功能，异常处理功能。在OOP设计中，它导致了大量代码的重复，而不利于各个模块的重用。spring很好的为我们提供了这样一种面且切面编程的能力，今天学习下AOP。以及它的实现方式——采用JDK动态代理。



**JDK动态代理**

在java中实现jdk的动态代理要依靠一个接口和一个类

1、`java.lang.reflect.InvocationHandler` 接口，这个接口下只有一个方法

	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable;

2、`java.lang.reflect.Proxy` 类，这个类中都是静态方法，主要使用一个方法

	public static Object newProxyInstance(ClassLoader loader, Class<?>[] interfaces,InvocationHandler invocationHandler throws IllegalArgumentException


动态代理完整示例：

- 有一个People接口
- Student类实现了这个接口
- 动态代理创建Student对象的代理

代码： 

	package com.iip;  
	 
	import java.lang.reflect.InvocationHandler;
	import java.lang.reflect.Method;
	
	interface People{
		public  void say();
		public  void run();
	}
	
	
	class Student implements People{ 		//真实的实现类
	
		public Student(){		
		}	
		
		@Override
		public void say() {
			//check()；	
			System.out.println("-----say-----");
		}	
		
	
		@Override
		public void run() {
			//check()；		
			System.out.println("-----run-----");
		}
		
		/*
		public void check(){        				 //安全性检查
			System.out.println("-----check-----");   //判断是否是people
		}	
		*/
	}	
	
	
	
	class myInvocationgHandler implements InvocationHandler{		//使用动态代理
		
		private Object obj;
				
		public Object getProxy(Object obj){								//绑定真实主题类		
			this.obj = obj;	 
			return java.lang.reflect.Proxy.newProxyInstance(			//取得代理对象
									obj.getClass().getClassLoader(),    //生成代理类的字节码加载器
									obj.getClass().getInterfaces(),     //需要代理的接口，被代理类实现的多个接口都必须在这里定义
									this);								
		}
		
		@Override
		public Object invoke(Object proxy, Method method, Object[] args) //动态调用方法
				throws Throwable {
			check();
			System.out.println("代理类名    ： "+ proxy.getClass().getName());
			System.out.println("调用方法名： "+ method.getName());	
			
			Object object = method.invoke(this.obj, args);
			return object;
		}

		public void check(){        				 //安全性检查
			System.out.println("-----check-----");   //判断是否是people
		}
		
	}
	
	public class Proxy {

		public static void main(String[] args ){
			
			People student = new Student();	
			
			myInvocationgHandler p =  new myInvocationgHandler(); //绑定到动态代理中
			
			People proxy = (People)p.getProxy(student);
			
			proxy.say();
			proxy.run();		
		}
		
	}


结果输出：
	
		代理类名    ： com.iip.$Proxy0
		调用方法名： say
		-----say-----
		代理类名    ： com.iip.$Proxy0
		调用方法名： run
		-----run-----


通过代理类调用student对象的方法，都会调用 invoke()方法。com.iip.$Proxy0是JVM虚拟机为我们创建的代理类的类名。

**动态代理模式的好处**

例如：要把一段文本发送给另一个人，普通方法是 void send(File file)，现在我们弄出个特性，就像 Spring AOP 那样，在 send 之前给这个 file 压缩一下。原来的程序没有压缩功能，现在我们需要添加的话而不改变原来所有的代码的话就得用类似 AOP 这样的代码来处理。
一般一个无法再继承的类和方法，要用代理，而能够继承的类和方法可以在内在中直接生成一个新的 java 类继承它然后覆盖掉那个 send 方法。

简单的说就是为了：要在原来的方法的功能基础上再添加一些功能，而不用改变这个方法的签名，原来调用这个方法的类依然能正常工作。

比如：我在Student类中，每个方法运行前，想进行检查。传统的写法就是写个check()函数，然后再每个方法第一行加入这个check()函数，势必对引用这些方法的类造成影响。

而在动态代理中：只需要在invoke()里进行检查，而不需要修改被代理的类。同时我们还可以在invoke()方法里对当前的调用方法进行判断，通过method.getName()知道是哪个函数，从而针对特定的方法进行check()。




**Spring AOP**


AOP中的一些术语，用上面的JDK动态代理的程序来说明：

- cross cutting concern 横切性关注点 : 就是要在所有的方法中进行一个检查，这个检查就叫做横切性关注点，再比如，想在每个函数中加入日志，这也是一个横切性关注点，横切性的问题跟我们的核心业务没有任何关系。
- aspect 切面 ：一个关注点的模块化，就是上面中myInvocationgHandler类，这个类就是切面。AOP的核心就是切面，它将多个类的通用行为封装为可重用的模块。该模块含有一组API提供 cross-cutting功能。在Spring AOP中，切面通过带有@Aspect注解的类实现。
- Join point 连接点 ： 连接点代表应用程序中插入AOP切面的地点。它实际上是Spring AOP框架在应用程序中执行动作的地点。
- Advice 通知： 通知表示在方法执行前后需要执行的动作。实际上它是Spring AOP框架在程序执行过程中触发的一些代码。
   Spring切面可以执行一下五种类型的通知:
   before(前置通知)：在一个方法之前执行的通知。
   after(最终通知)：当某连接点退出的时候执行的通知（不论是正常返回还是异常退出）。
   after-returning(后置通知)：在某连接点正常完成后执行的通知。
   after-throwing(异常通知)：在方法抛出异常退出时执行的通知。
   around(环绕通知)：在方法调用前后触发的通知。
- Pointcut 切入点 ： 切入点是一个或一组连接点，通知将在这些位置执行。可以通过使用正则表达式或匹配的方式指明切入点。 
- Introduction 引入 ： 添加方法或字段到被通知的类。 Spring允许引入新的接口到任何被通知的对象。
- Target Object 目标对象 ： 被代理的对象，也被称做被通知（advised）对象。
- weave 织入 : 是将切面和其他应用类型或对象连接起来创建一个通知对象的过程。织入可以在编译、加载或运行时完成。
- proxy 代理 ： 是将通知应用到目标对象后创建的对象。从客户端的角度看，代理对象和目标对象是一样的。

spring中通过注解实现AOP的方式：

切面类：

	import org.aspectj.lang.annotation.Aspect;
	import org.aspectj.lang.annotation.Before;
	import org.aspectj.lang.annotation.Pointcut;
	
	
	/**
	 * 定义Aspect 切面类
	 * @author mayday
	 *
	 */
	
	@Aspect 
	public class MyInvocationgHandler {		
		
		/**
		 * 定义Pointcut,Pointcut的名称就是method，此方法不能有返回值和参数，同时该方法也不会执行
		 * 该方法只是一个标识
		 * Pointcut的内容是一个表达式，描述那些对象的那些方法（订阅Joinpoint，即设置哪个函数起作用）
		 */
		@Pointcut("execution(* say*(..)) || execution(* run*(..))")
		private void method(){
			
			System.out.println("-----method-----");  //该函数将不会执行，method方法只是一个标识
		}
		
		/**
		 * 定义Advice，标识在那个切入点何处织入此方法
		 */
		@Before("method()")  
		private void check() {
			System.out.println("-----check-----");
		}
		
	}

通过配置织入@Aspectj切面
applicationContext.xml文件，放在src目录下。

	<?xml version="1.0" encoding="UTF-8"?>

	<beans xmlns="http://www.springframework.org/schema/beans"
		     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		     xmlns:aop="http://www.springframework.org/schema/aop"
		     xmlns:tx="http://www.springframework.org/schema/tx"
		     xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.0.xsd
	           http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-2.0.xsd
	           http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-2.0.xsd">
		<aop:aspectj-autoproxy/>
		<bean id="myInvocationgHandler" class="com.spring.MyInvocationgHandler"/>           
		<bean id="people" class="com.spring.Student"/>
	</beans>

通过aop命名空间的<aop:aspectj-autoproxy/>声明自动为spring容器中那些配置@aspectJ切面的bean创建代理，织入切面。
<aop:aspectj-autoproxy/>有一个proxy-target-class属性，默认为false，表示使用jdk动态代理织入增强，当配为<aop:aspectj-autoproxy  
poxy-target-class="true"/>时，表示使用CGLib动态代理技术织入增强。 不过即使proxy-target-class设置为false，如果目标类没有声明接口，则spring将自动使用CGLib动态代理。

比较： 

- 如果目标对象实现了接口，默认情况下会采用JDK的动态代理实现AOP
- 如果目标对象实现了接口，可以强制使用CGLIB实现AOP
- 如果目标对象没有实现了接口，必须采用CGLIB库，spring会自动在JDK动态代理和CGLIB之间转换

JDK动态代理和CGLIB字节码生成的区别？

- JDK动态代理只能对实现了接口的类生成代理，而不能针对类
- CGLIB是针对类实现代理，主要是对指定的类生成一个子类，覆盖其中的方法，因为是继承，所以该类或方法最好不要声明成final	


客户端调用：

	import org.springframework.beans.factory.BeanFactory;
	import org.springframework.context.support.ClassPathXmlApplicationContext;
			
	public class Client {
			
		public static void main(String[] args) {
			
			BeanFactory factory = new ClassPathXmlApplicationContext("applicationContext.xml");
			
			People people = (People)factory.getBean("people");		
			
			people.say();	
			
			people.run();      		 
		}	
	}


最终输出：

			-----check-----
			-----say-----
			-----check-----
			-----run-----


当然使用spring还需导入相关jar包



上面是通过注解的方式，也可通过静态配置的方式，applicationContext.xml文件作如下改动。

	<!--  <aop:aspectj-autoproxy/>  -->
	<bean id="myInvocationgHandler" class="com.spring.MyInvocationgHandler"/>           
	<bean id="people" class="com.spring.Student"/>

	<aop:config>
		<aop:aspect id="security" ref="myInvocationgHandler">        <!-- 配置切面  -->
			<aop:pointcut id="method" expression="execution(* say*(..)) || execution(* run*(..))"/>
			<aop:before method="check" pointcut-ref="method"/>
		</aop:aspect>
	</aop:config>


而作为切面的类

	import org.aspectj.lang.JoinPoint;

	public class MyInvocationgHandler {		
		
		private void check(JoinPoint joinPoint) {    // 客户端调用代理类方法的时候，调用的参数这里都能拿到
			Object[] args = joinPoint.getArgs();
			for (int i=0; i<args.length; i++) {
				System.out.println(args[i]);
			}
			
			System.out.println(joinPoint.getSignature().getName());   //方法名也都能拿到
			System.out.println("-----check-----");
		}
		
	}

从这里也可以看到基于注解的实现中的，method()只是一个标识。


**spring aop 如何利用jdk动态代理的**

参考这篇：  [http://blog.csdn.net/moreevan/article/details/11977115](http://blog.csdn.net/moreevan/article/details/11977115)









