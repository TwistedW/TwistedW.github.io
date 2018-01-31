---
layout: post
title: 我对java中Serializable接口的理解
category: 技术
tags:  Java
description: 
---

>最近在阅读JDK源码中的集合，看到很多集合类实现了Serializable接口,Cloneable接口。在阅读了很多关于Serializable接口的博客后，浅谈下我对Serializable接口的理解。


## 序列化

查看 [官方文档](http://docs.oracle.com/javase/8/docs/api/java/io/Serializable.html) 就会发现 Serializable接口中一个成员函数或者成员变量也没有。那么这个接口的作用是什么呢。网上找了一些博客看过之后，知道这个接口的作用是实现序列化。

序列化：对象的寿命通常随着生成该对象的程序的终止而终止，有时候需要把在内存中的各种对象的状态（也就是实例变量，不是方法）保存下来，并且可以在需要时再将对象恢复。虽然你可以用你自己的各种各样的方法来保存对象的状态，但是Java给你提供一种应该比你自己的好的保存对象状态的机制，那就是序列化。

总结：Java 序列化技术可以使你将一个对象的状态写入一个Byte 流里（系列化），并且可以从其它地方把该Byte 流里的数据读出来（反序列化）。

## 系列化的用途

- 想把的内存中的对象状态保存到一个文件中或者数据库中时候
- 想把对象通过网络进行传播的时候

## 如何序列化

只要一个类实现Serializable接口，那么这个类就可以序列化了。

例如有一个 Person类，实现了Serializable接口，那么这个类就可以被序列化了。

	class Person implements Serializable{	
	
		private static final long serialVersionUID = 1L; //一会就说这个是做什么的
	
		String name;
		int age;
	
		public Person(String name,int age){
			this.name = name;
			this.age = age;
		}	
	
		public String toString(){
			return "name:"+name+"\tage:"+age;
		}
	}


通过ObjectOutputStream 的writeObject()方法把这个类的对象写到一个地方（文件），再通过ObjectInputStream 的readObject()方法把这个对象读出来。

	    File file = new File("file"+File.separator+"out.txt");
		
		FileOutputStream fos = null;
		try {
			fos = new FileOutputStream(file);
			ObjectOutputStream oos = null;
			try {
				oos = new ObjectOutputStream(fos);
				Person person = new Person("tom", 22);
				System.out.println(person);
				oos.writeObject(person);			//写入对象
				oos.flush();
			} catch (IOException e) {
				e.printStackTrace();
			}finally{
				try {
					oos.close();
				} catch (IOException e) {
					System.out.println("oos关闭失败："+e.getMessage());
				}
			}
		} catch (FileNotFoundException e) {
			System.out.println("找不到文件："+e.getMessage());
		} finally{
			try {
				fos.close();
			} catch (IOException e) {
				System.out.println("fos关闭失败："+e.getMessage());
			}
		}
								
		FileInputStream fis = null;
		try {
			fis = new FileInputStream(file);
			ObjectInputStream ois = null;
			try {
				ois = new ObjectInputStream(fis);
				try {
					Person person = (Person)ois.readObject();	//读出对象
					System.out.println(person);
				} catch (ClassNotFoundException e) {
					e.printStackTrace();
				} 
			} catch (IOException e) {
				e.printStackTrace();
			}finally{
				try {
					ois.close();
				} catch (IOException e) {
					System.out.println("ois关闭失败："+e.getMessage());
				}
			}
		} catch (FileNotFoundException e) {
			System.out.println("找不到文件："+e.getMessage());
		} finally{
			try {
				fis.close();
			} catch (IOException e) {
				System.out.println("fis关闭失败："+e.getMessage());
			}
		}

输出结果为：

	name:tom	age:22
	name:tom	age:22

结果完全一样。如果我把Person类中的implements Serializable 去掉，Person类就不能序列化了。此时再运行上述程序，就会报java.io.NotSerializableException异常。


### serialVersionUID

注意到上面程序中有一个 serialVersionUID ，实现了Serializable接口之后，Eclipse就会提示你增加一个 serialVersionUID，虽然不加的话上述程序依然能够正常运行。

序列化 ID 在 Eclipse 下提供了两种生成策略

- 一个是固定的 1L
- 一个是随机生成一个不重复的 long 类型数据（实际上是使用 JDK 工具，根据类名、接口名、成员方法及属性等来生成）

上面程序中，输出对象和读入对象使用的是同一个Person类。

如果是通过网络传输的话，如果Person类的serialVersionUID不一致，那么反序列化就不能正常进行。例如在客户端A中Person类的serialVersionUID=1L，而在客户端B中Person类的serialVersionUID=2L 那么就不能重构这个Person对象。

客户端A中的Person类：

	class Person implements Serializable{	
		
		private static final long serialVersionUID = 1L;
		
		String name;
		int age;
		
		public Person(String name,int age){
			this.name = name;
			this.age = age;
		}	
		public String toString(){
			return "name:"+name+"\tage:"+age;
		}
	}


客户端B中的Person类：

	class Person implements Serializable{	
		
		private static final long serialVersionUID = 2L;
		
		String name;
		int age;
		
		public Person(String name,int age){
			this.name = name;
			this.age = age;
		}	
		public String toString(){
			return "name:"+name+"\tage:"+age;
		}
	}

试图重构就会报java.io.InvalidClassException异常，因为这两个类的版本不一致，local class incompatible，重构就会出现错误。

如果没有特殊需求的话，使用用默认的 1L 就可以，这样可以确保代码一致时反序列化成功。那么随机生成的序列化 ID 有什么作用呢，有些时候，通过改变序列化 ID 可以用来限制某些用户的使用。


### 静态变量序列化

串行化只能保存对象的非静态成员交量，不能保存任何的成员方法和静态的成员变量，而且串行化保存的只是变量的值，对于变量的任何修饰符都不能保存。 

如果把Person类中的name定义为static类型的话，试图重构，就不能得到原来的值，只能得到null。说明对静态成员变量值是不保存的。这其实比较容易理解，序列化保存的是对象的状态，静态变量属于类的状态，因此 序列化并不保存静态变量。


### transient关键字

经常在实现了 Serializable接口的类中能看见transient关键字。这个关键字并不常见。
transient关键字的作用是：阻止实例中那些用此关键字声明的变量持久化；当对象被反序列化时（从源文件读取字节序列进行重构），这样的实例变量值不会被持久化和恢复。

当某些变量不想被序列化，同是又不适合使用static关键字声明，那么此时就需要用transient关键字来声明该变量。

例如用 transient关键字 修饰name变量

	class Person implements Serializable{	
		
		private static final long serialVersionUID = 1L;
		
		transient String name;
		int age;
		
		public Person(String name,int age){
			this.name = name;
			this.age = age;
		}	
		public String toString(){
			return "name:"+name+"\tage:"+age;
		}
	}

在反序列化视图重构对象的时候，作用与static变量一样：
输出结果为： 
 
	name:null	age:22

在被反序列化后，transient 变量的值被设为初始值，如 int 型的是 0，对象型的是 null。

**注**：对于某些类型的属性，其状态是瞬时的，这样的属性是无法保存其状态的。例如一个线程属性或需要访问IO、本地资源、网络资源等的属性，对于这些字段，我们必须用transient关键字标明，否则编译器将报措。


### 序列化中的继承问题

- 当一个父类实现序列化，子类自动实现序列化，不需要显式实现Serializable接口。
- 一个子类实现了 Serializable 接口，它的父类都没有实现 Serializable 接口，要想将父类对象也序列化，就需要让父类也实现Serializable 接口。

第二种情况中：如果父类不实现 Serializable接口的话，就需要有默认的无参的构造函数。这是因为一个 Java 对象的构造必须先有父对象，才有子对象，反序列化也不例外。在反序列化时，为了构造父对象，只能调用父类的无参构造函数作为默认的父对象。因此当我们取父对象的变量值时，它的值是调用父类无参构造函数后的值。在这种情况下，在序列化时根据需要在父类无参构造函数中对变量进行初始化，否则的话，父类变量值都是默认声明的值，如 int 型的默认是 0，string 型的默认是 null。


例如：

	class People{
		int num;
		public People(){}  			//默认的无参构造函数，没有进行初始化
		public People(int num){		//有参构造函数
			this.num = num;
		}
		public String toString(){
			return "num:"+num;
		}
	}
	
	class Person extends People implements Serializable{	
		
		private static final long serialVersionUID = 1L;
		
		String name;
		int age;
		
		public Person(int num,String name,int age){
			super(num);				//调用父类中的构造函数
			this.name = name;
			this.age = age;
		}
		public String toString(){
			return super.toString()+"\tname:"+name+"\tage:"+age;
		}
	}


在一端写出对象的时候

		Person person = new Person(10,"tom", 22); //调用带参数的构造函数num=10,name = "tim",age =22
		System.out.println(person);
		oos.writeObject(person);			      //写出对象

在另一端读出对象的时候
	
		Person person = (Person)ois.readObject(); //反序列化，调用父类中的无参构函数。
		System.out.println(person);

输出为 

		num:0	name:tom	age:22

发现由于父类中无参构造函数并没有对num初始化，所以num使用默认值为0。 


## 总结

序列化给我们提供了一种技术，用于保存对象的变量。以便于传输。虽然也可以使用别的一些方法实现同样的功能，但是java给我们提供的方法使用起来是非常方便的。以上仅仅是我的一些理解，由于本人水平有限，不足之处还请指正。下篇学习Cloneable接口的用途。