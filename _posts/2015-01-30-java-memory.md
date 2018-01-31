---
layout: post
title:  深入了解Java内存中的对象
category: 技术
tags:  Java
description: 
---



>在学习Cloneable接口的clone()方法前，有必要深入了解一下Java中的对象在内存中是如何创建的。


## equals 和 ==

相信大家都会知道这两个的不同，== 是比较两个对象的引用是否指向同一个对象，说白了就是直接比较内存中的地址。而equals是比较两个对象的内容（）。觉得这样说还是比较笼统。下面就来看看内存中的对象和基本数据类型是如何创建的把。

## 基本数据类型

Java中有八种基本数据类型。

- byte
- int
- short
- long
- float
- double
- char
- boolean

由于Java是完全面向对象的语言，因此Java为每一个基本数据类型都提供了一个包装类，并在JDK1.5之后，提供了自动装箱和拆箱功能。

这八种针对基本数据类型的包装类分别是

- Byte		(byte)
- Integer	(int)
- Short		(short)
- Long		(Long)
- Float		(float)
- Double	(double)
- Character	(char)
- Boolean	(boolean)

所谓的自动装箱：

	Integer i = 1000;


系统就会调用 Integer i = Integer.valueOf(i);自动装箱。

这里不得不再说说Java中的常量池。因为基本数据类型的使用量是很大的，Java常量池，在节省内存方面是一个很好的机制，相同的数据，在常量池中只要保留一份即可。Java的8种基本类型,除Float和Double以外, 其它六种都实现了常量池, 但是它们只在大于等于-128并且小于等于127时才使用常量池。

查看Integer中valueOf(int i)方法的源代码：
	
	public static Integer valueOf(int i) {  
        return  i >= 128 || i < -128 ? new Integer(i) : SMALL_VALUES[i + 128];
    }

	private static final Integer[] SMALL_VALUES = new Integer[256];

	static {
        for (int i = -128; i < 128; i++) {
            SMALL_VALUES[i + 128] = new Integer(i);
        }
    }
	
发现Integer类中有一个 static final类型的Integer数组SMALL_VALUES，数组大小是256，再看下面的static代码块，这是一个静态代码块，在加载该类的时候就首先执行静态代码块。在这个静态代码块中，对这个数组进行初始化。当调用value(int i)方法时，首先判断这个i的大小，如果大于等于-128,小于等于127,那么直接放回数组中定义好的Integer对象，否则才为我们创建新对象。

我们用一个简单的例子来看看， 用“==”运算符比较对象的地址。
	
		Integer i1 = 100;
		Integer i2 = 100;		
		System.out.println( i1 == i2);  //true ，-128=< 100 <= 127 返回 同一个对象，地址一样
		
		Integer i3 = 1000;
		Integer i4 = 1000;		
		System.out.println( i3 == i4);  //false，创建新的对象，地址不一样
		
		Integer i5 = new Integer(100);
		Integer i6 = new Integer(100);	
		System.out.println( i5 == i6);	//false，使用new ，必定创建新对象，地址不一样

注：装箱是Integer.valueOf(int i)，拆箱是 i1.intValue()。当然你拆箱时候可以指定返回的数据类型。

JDK源码Integer类中，提供的方法有

	@Override
    public short shortValue() {
        return (short) value;
    }

	@Override
    public long longValue() {
        return value;
    }

等等。根据需要调用。

其他几个类中的自动装箱拆箱就不再一一列出。类似Integer类。


## String类。

### String的不可变性

String类是Java中常用的类，我们大家都知道String对象是不可变的，那么这种不可变体现在哪呢。当我们使用

	String str = "abc";

这种定义方法时，“abc”会放入常量池中，以后如果再有定义

	String str2 = "abc";

时，其实str和str2指向的是常量池中同一个对象。
	
	System.out.println(str == str2);  //true,指向同一个 "abc"串


不可变其实指的是串"abc"不可变。
如果对str2做如下改变

	str2 = str2 + "de";

系统会在字符串常量池中创建新串 "abcde"，然后str2指向这个新串，而原来的str仍然指向原来的 "abc"。


### 深入探究String

打开String的JDK源码，能看到很多关于String的具体实现。

- String类是final的，不可被继承。
- String类是的本质是字符数组，final char[] value;

创建字符串的方式很多，归纳起来有三类：

- 使用new关键字创建字符串，比如	String s1 = new String("abc");
- 直接指定。比如	String s2 = "abc";
- 使用串联生成新的字符串。比如	String s3 = "ab" + "c"; 


String对象的创建也有很多门道，这里把我遇到的困惑列出来。

**1、String s1 = new String("abc"); 创建了几个对象？**


实例如下：
	
	String s1=  new String("abc");
	String ss1 = "abc";
	String s2 = new String("abc");
	String ss2 ="abc";
		
	System.out.println(s1 == s2);   //false
	System.out.println(ss1 == ss2); //true


对于s1，对其定义时String pool中没有"abc"，String s1=new String("abc")会先后在pool中和heap中定义"abc"，所以它创建了**两个**对象；而对于s2，它只在heap中定义了一个"abc"，所以它创建了**一个**对象；而对于ss1和ss2，他们定义的时候pool中已经有了"abc"，所以此时定义了 **零** 个对象。


**2、用"+"串联字符串**

先看例子：

	String str  = "abc";		
	String str1  = "ab" + "c";
				
	String str2 = "ab";		
	String str3 = str2 + "c";
		
		
	final String str4 = "ab";		
	String str5 = str4 + "c";
		
	System.out.println(str == str1);	//true
	System.out.println(str == str3); 	//false
	System.out.println(str == str5); 	//true

这个刚开始着实让我很费解。

后来经过不断实验和阅读很多博客后，得出如下结论。


	String str1  = "abc";	
和  

	String str1  = "ab" + "c"; 
的效果是相同的。因此定义

	String str1  = "ab" + "c";
就相当于定义了

	String str1  = "abc";

因此指向String pool中同一个对象。输出为true。



而对于

	String str3 = str2 + "c";
在JVM中java底层会先创建一个StringBuilder对象，封装str2, 接着再加上“c”，而StringBuilder的toString()方法还原一个新的String对象，在堆中开辟一块空间存放此对象。即在堆中重新开辟一块空间存放"abc"，而str3指向这个堆中的对象。输出为false。



第三个

	final String str4 = "ab";		
	String str5 = str4 + "c";  //相当于 String str5  = "ab" + "c"; 

当用final修饰后，str4就变为了常量，在常量池中创建"ab"，当执行到String str5 = str4 + "c";时，编译器直接就把str4当成了"ab"，str5此时就已是"abc"，它指向常量池中的"abc"，所以str和str5指向的是同一个对象，输出为true。



## 函数调用中对象传参问题

请看下面的例子。

	class Sdudent{
		String name;
		int age;
		
		public Sdudent(String name,int age){
			this.name = name;
			this.age  = age;
		}
	}

	public class Test {
		public static void main(String[] args) {		 
			 int i = 10;
			 String str = "java";
			 StringBuffer sb = new StringBuffer("java");
			 Sdudent s = new Sdudent("tom",20); 
			 
			 System.out.println("======改变前========");
			 System.out.println("i = " + i );
			 System.out.println("str = " + str);
			 System.out.println("sb  = "+sb);
			 System.out.println("s.name = "+s.name);
			 System.out.println("s.age = "+s.age );
			 
			 test(i,str,sb,s);

			 System.out.println();
			 System.out.println("======改变后========");
			 System.out.println("i = " + i );
			 System.out.println("str = " + str);
			 System.out.println("sb  = "+sb);
			 System.out.println("s.name = "+s.name);
			 System.out.println("s.age = "+s.age );
			 
		}
		
		public static void test(int i, String str, StringBuffer sb, Sdudent s){				
			i = 5;		
			str += " change";		
			sb.append(" change");		
			s.name +=" change";		
			s.age = 30;		
		}
		
	}


输出结果为：

	======改变前========
	i = 10
	str = java
	sb  = java
	s.name = tom
	s.age = 20
	
	======改变后========
	i = 10
	str = java
	sb  = java change
	s.name = tom change
	s.age = 30


可以看到由于int是基本数据类型，在函数中改变它的值，并不会影响它原来的值。
你可能认为str传递的是引用，返回后应该会改变才对，其实这里也体现了String对象的不可变性质，函数中str += " change"; 实质上这个函数中的str已经指向了别的对象，而函数外原来的str仍然指向原来的对象。

StringBuffer和Sdudent类的传递都是引用传递，函数中对它的改变，就会体现在函数外。


## 总结

比较深入的学习了java中的对象的引用问题。对于以前模糊的不可变，装箱等拆箱概念，有了更深一步的认识。下一篇开始Cloneable接口中，对对象clone的问题。