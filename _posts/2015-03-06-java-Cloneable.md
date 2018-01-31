---
layout: post
title: Java中对象的克隆
category: 技术
tags: [Java]
description: 
---

> 在Java中有时需要通过一个对象object1的值来构造另一个对象object2,同时希望在使用oject2的时候不影响object1.这时候就需要对象的克隆技术，这里介绍我知道的两种对象的深拷贝的方法。

## 浅拷贝与深拷贝

所谓的浅拷贝就是，把一个对象的引用给了另一个对象，在堆中实际上还是同一个对象，只不过在栈中给他起了两个另一个名字。

比如有一个object1,通过 object = object1;对象object得到了对象object1的引用，但是对object的修改将会影响object1的值。

深拷贝就是从一个object1得到另一个与其值完全一样的object，但对object的使用不会影响原来的object1的值。

## 实现Cloneable接口

在java中有一个Cloneable接口

要让一个对象进行克隆，其实就是两个步骤：

1.让该类实现java.lang.Cloneable接口；
2.重写（override）Object类的clone()方法。


	class Person implements Cloneable{
		
		String name;
		int age;
		
		public Person(String name,int age){
			this.name = name;
			this.age = age;
		}
			
		@Override
		public Person clone() {  //重写clone()方法
			Person p = null;		
			try {
				 p = (Person)super.clone();
			} catch (CloneNotSupportedException e) {
				e.printStackTrace();
			}
			return p;
		}
		
		@Override
		public int hashCode(){
			return this.name.hashCode() + age;
		}
		
		
		@Override
		public boolean equals(Object obj) {		
			Person p = (Person)obj;		
			if(this.name.equals(p.name)&& this.age == p.age)
				return true;			
			return false;		
		}
		
		public void print(){
			System.out.println("name\t" + this.name);
			System.out.println("age\t" + this.age);
			System.out.println();
		}		
	}




在main方法中，通过如下方式调用

	public class CloneTest {
	
		public static void main(String[] args) {
			
			Person p1 = new Person("tom", 22);
			Person p2 = p1;		
			Person p3 = p1.clone();

			p1.age = 23;

			p1.print();		
			p2.print();		
			p3.print();

		}
	}

打印结果如下

	name	tom
	age		23
	
	name	tom
	age		23
	
	name	tom
	age		22

p2是通过p1直接 p2 = p1 直接赋值的，这样的话只是把p1的引用给了p2。其实就是p1和p2指向同一个对象。而p3是通过p1.clone()方法得到的，得到的是p1的深拷贝。因此修改p1的age时候会影响p2的age，而不会影响p3的age。

好。如果此时以为已经回了对象的克隆那就大错特错了。因为string和int类型在拷贝的时候自动的实现深拷贝，而如果对象中的私有域是一个引用，比如一个数组、另一个对象、一个list等除了基本类型的域，那么克隆的依然是一个引用。

比如

	class Phone {	
		String grand;	
		Phone(String grand){
			this.grand = grand;
		}
		
	}


	class Person implements Cloneable{
	
		String name;
		int age;
		ArrayList<String> list ;
		String [] str = new String[2];
		Phone phone = null;
		
		public Person(String name,int age,List<String> list,String string){
			this.name = name;
			this.age = age;
			this.list = new ArrayList<String>(list);
			this.phone = new Phone(string);
			str [0] = "str1";
			str [1] = "str2";
		}
		
	
	
		@SuppressWarnings("unchecked")
		@Override
		public Person clone() {
			Person p = null;		
			try {
				 p = (Person)super.clone();	
			} catch (CloneNotSupportedException e) {
				e.printStackTrace();
			}
			return p;
		}
		
		@Override
		public int hashCode(){
			return this.name.hashCode() + age;
		}
					
		public void print(){
			System.out.println("name\t" + this.name);
			System.out.println("age\t" + this.age);
			System.out.println("list\t" + this.list);
			System.out.println("str\t"+str[0] + " " + str[1]);
			System.out.println("phone\t"+this.phone.grand);
			System.out.println();
		}
		
	}


main方法中调用如下：

	public class CloneTest {

		public static void main(String[] args) {
	
			List<String> list = new ArrayList<String>();
			list.add("test1");
			list.add("test2");
			
			Person p1 = new Person("tom", 22,list,"NOKIA");
			
			Person p2 = p1;
			
			Person p3 = p1.clone();
			
			
			p1.age = 23;   	//修改p1.age
			
			p1.name = "jack";	//修改p1.name
			
			p1.list.set(0, "test"); //修改p1.list
			
			p1.str[0] = "str";		//修改p1.str数组
			
			p1.phone.grand = "APPLE"; //修改p1中phone对象的值
			
			p1.print();
			
			p2.print();
			
			p3.print();
		}

	}

打印结果如下：

	name	jack
	age		23
	list	[test, test2]
	str		str str2
	phone	APPLE
	
	name	jack
	age		23
	list	[test, test2]
	str		str str2
	phone	APPLE
	
	name	tom
	age		22
	list	[test, test2]
	str		str str2
	phone	APPLE

你会发现引用对象并没有实现克隆，而如果想真正实现克隆，必须在Person类中这样定义clone方法。

	@SuppressWarnings("unchecked")
	@Override
	public Person clone() {
		Person p = null;		
		try {
			 p = (Person)super.clone();
			 p.list =  (ArrayList<String>) this.list.clone();
			 p.str  =  this.str.clone();
			 p.phone = this.phone.clone();
		} catch (CloneNotSupportedException e) {
			e.printStackTrace();
		}
		return p;
	}


同时对于Phone类，也需要实现Cloneable接口并重写clone方法。

	class Phone implements Cloneable{	
		String grand;	
		Phone(String grand){
			this.grand = grand;
		}
		
		public Phone clone() {
			Phone p = null;
			try {
				p = (Phone)super.clone();
			} catch (CloneNotSupportedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			return p;
		}
	}


重新运行程序，输出如下：
	
	name	jack
	age		23
	list	[test, test2]
	str		str str2
	phone	APPLE
	
	name	jack
	age		23
	list	[test, test2]
	str		str str2
	phone	APPLE
	
	name	tom
	age		22
	list	[test1, test2]
	str		str1 str2
	phone	NOKIA

发现此时对p1的修改将不会影响到p3只会影响到p2。

至于深克隆的层次，由具体的需求决定，也有“N层克隆”一说。所有的基本（primitive）类型数据，无论是浅克隆还是深克隆，都会进行原值克隆。毕竟他们都不是对象，不是存储在堆中。注意：基本数据类型并不包括他们对应的包装类。


缺点：如果有N多个持有的对象，那就要写N多的方法，突然改变了类的结构，还要重新修改clone()方法。

## 通过序列化实现深度克隆


	public Person deepClone() {
		
		ByteArrayOutputStream byteOut = null;   
        ObjectOutputStream objOut = null;   
        ByteArrayInputStream byteIn = null;   
        ObjectInputStream objIn = null;   
           
        try {   
            byteOut = new ByteArrayOutputStream();    
            objOut = new ObjectOutputStream(byteOut);    
            objOut.writeObject(this);   
  
            byteIn = new ByteArrayInputStream(byteOut.toByteArray());   
            objIn = new ObjectInputStream(byteIn);   
               
            return (Person) objIn.readObject();   
        } catch (IOException e) {   
            throw new RuntimeException("Clone Object failed in IO.",e);      
        } catch (ClassNotFoundException e) {   
            throw new RuntimeException("Class not found.",e);      
        } finally{   
            try{   
                byteIn = null;   
                byteOut = null;   
                if(objOut != null) objOut.close();      
                if(objIn != null) objIn.close();      
            }catch(IOException e){    
            	e.printStackTrace();
            }      
        } 
	}

通过序列化能轻松构造一个对象的深克隆，不过也需要注意一些问题。比如曾经序列化了一个对象，可由于某种原因，该类做了一点点改动，然后重新被编译，那么这时反序列化刚才的对象，将会出现异常。 你可以通过添加serialVersionUID属性来解决这个问题。如果你的类是个单例（Singleton）类，是否允许用户通过序列化机制复制该类，如果不允许你需要谨慎对待该类的实现。

## 总结

目前可有如上两种方法，得到一个对象的深克隆。比重新new一个，并一个个赋值快多了。因为上述方法都是直接操作内存中的二进制流，所以非常迅速。

下面开始学习多线程。
