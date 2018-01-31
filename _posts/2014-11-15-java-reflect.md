---
layout: post
title: 关于Java中的反射（一些概念与简单用法）
category: 技术
tags:  Java
description: 
---

## 一、反射是什么

Reflection 是 Java 程序开发语言的特征之一，它允许运行中的 Java 程序对自身进行检查，或者说“自审”，并能直接操作程序的内部属性和方法。Java 的这一能力在实际应用中用得不是很多，但是在其它的程序设计语言中根本就不存在这一特性。例如，Pascal、C 或者 C++ 中就没有办法在程序中获得函数定义相关的信息。

Reflection 是 Java 被视为动态（或准动态）语言的关键，允许程序于执行期 Reflection APIs 取得任何已知名称之 class 的內部信息。类中有什么信息，他就能获得什么信息。

在用jdbc连接数据库的时候，用到一句话  Class.forName("com.mysql.jdbc.Driver.class").newInstance(); 那时候还不知道这就是反射，不知道他的具体含义。现在很多开发框架都用到反射机制，hibernate、struts，Spring的依赖注入，都用到了反射机制。另外在Eclipse中，有随笔提示功能，实际上用到的也是java中的反射机制实现的。



## 二、Java中的Class类

Class has no public constructor. Instead Class objects are constructed automatically by the Java Virtual Machine as classes are loaded and by calls to the defineClassmethod in the class loader.

Java文档中明确说了Class没有公用构造器，这个类是由JVM来创建的，所以我们就不用麻烦了。


```java
package com.iip;

class Person {
    private String name ;        // name属性
    private int age ;            // age属性
    public void setName(String name){
        this.name = name ;
    }
    public void setAge(int age){
        this.age = age ;
    }
    public String getName(){
        return this.name ;
    }
    public int getAge(){
        return this.age ;
    }
    public String toString(){                // 覆写toString()方法
        return "姓名：" + this.name + "，年龄：" + this.age  ;
    }
};

public class Reflection {
    public  static void main(String[] args){
        Class<?> c1 = null ;    
        Class<?> c2 = null ;
        Class<?> c3 = null ;        // 声明Class对象
        //三种方法 
        try{
            c1 = Class.forName("com.iip.Person") ; //1、Class.forName(包名+类名) 需要捕获ClassNotFoundException异常
        }catch(ClassNotFoundException e){
            e.printStackTrace() ;
        }
        c2 = Person.class;                            //2、通过类名.class实例化class对象
        c3 =  new Person().getClass();                //3、通过对象.getClass()实例化class对象
        
        
        Person per = null ;                        // 声明Person对象
        try{
            per = (Person)c1.newInstance() ;    // 通过 newInstance()实例化对象
        }catch(InstantiationException e){
            e.printStackTrace() ;
        }catch(IllegalAccessException e){
　　　　　　　e.printStackTrace() ;
　　　　 }
        per.setName("test") ;        // 设置姓名
        per.setAge(30) ;            // 设置年龄
        System.out.println(per) ;    // 内容输出，调用toString()
    }
}

```
class1,class2,class3便是Class类的对象。可通过这些对象获得X类的所有信息。包括Fields(代表类的成员变量),Methods(代表类的方法),Constructor(代表类的构造方法)


### 在Class类中的方法


- getName()：获得类的完整名字，包名+类名
- getFields()：获得类的public类型的属性
- getDeclaredFields()：获得类的所有属性。
- getMethods()：获得类的public类型的方法。
- getDeclaredMethods()：获得类的所有方法。
- getMethod(String name, Class[] parameterTypes)：获得类的特定方法，name参数指定方法的名字，parameterTypes 参数指定方法的参数类型。
- getConstructors()：获得类的public类型的构造方法。
- getConstructor(Class[] parameterTypes)：获得类的特定构造方法，parameterTypes 参数指定构造方法的参数类型。
- getDeclaredConstructors() ：返回类中所有的构造器，包括私有
- newInstance()：通过类的不带参数的构造方法创建这个类的一个对象。


#### newInstance()

之后，我们便可以通过Class类的对象c1的newInstance()方法直接实例化Person类的对象。
`public T newInstance() throws InstantiationException,IllegalAccessException`

newInstance返回的是一个泛型，因此我们需要强制转换成Person类型。
注：
- 这种方法必须要求Person类中存在无参构造方法，因为Class的newInstance是不接受参数的，如果我在Person中加入构造方法

```java
	public Person(String name,int age){
	　　this.setName(name) ;
	　　this.setAge(age);
	}

```
类中就只有这一个构造方法，将没有默认提供的无参构造方法，再运行时就会报错。
- 如果类的构造函数是private的，比如Class，我们仍旧不能实例化其对象。
因此，如果想使用可接受参数的newInstance，需要明确指定要调用的构造方法，并传递参数，但在实际的开发中，一般使用反射实例化的时候，都最好存在一个无参构造函数，这样比较合理些。


#### 使用带参数的构造器

获取Person类的构造器 `Constructor<?> cons[] = c1.getConstructors() ;`
使用但参数的构造器，生成对象。

```java
	Constructor<?> cons[] = c1.getConstructors() ;        
        Person per = null ;                                    // 声明Person对象
        try{            
            per = (Person)cons[0].newInstance("test",30) ;    // 实例化对象            
        }catch (IllegalArgumentException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }catch(InstantiationException e){
            e.printStackTrace();
        }catch(IllegalAccessException e){
            e.printStackTrace();
        }
```



#### getDeclaredFields()

想要获得Person类的所有域

```java
	Field [] f = c1.getDeclaredFields();
        for (int i = 0; i < f.length; i++) {
            Class<?> r = f[i].getType() ;    // 得到属性类型
            int mo = f[i].getModifiers() ;    // 得到修饰符的数字
            String priv = Modifier.toString(mo) ; // 还原修饰符
            System.out.print(priv + " ") ;    
            System.out.print(r.getName() + " ") ;    // 得到属性类型
            System.out.print(f[i].getName()) ;    // 输出属性名称
            System.out.println(" ;") ;
        }
```
如果只想得到公共属性，调用getFields()方法。

其中在 JAVA 反射机制中，Field的getModifiers()方法返回int类型值表示该字段的修饰符。

该修饰符是java.lang.reflect.Modifier的静态属性。

对应表如下：

- PUBLIC: 1
- PRIVATE: 2
- PROTECTED: 4
- STATIC: 8
- FINAL: 16
- SYNCHRONIZED: 32
- VOLATILE: 64
- TRANSIENT: 128
- NATIVE: 256
- INTERFACE: 512
- ABSTRACT: 1024
- STRICT: 2048




#### getDeclaredMethods()

下面获得Person类中的方法

```java
	Method m[] = c1.getDeclaredMethods() ;    // 取得全部方法
        for(int i=0;i<m.length;i++){
            Class<?> r = m[i].getReturnType() ;    // 得到返回值类型
            Class<?> p[] = m[i].getParameterTypes() ;    // 取得全部参数的类型
            int xx = m[i].getModifiers() ;    // 得到修饰符
            System.out.print(Modifier.toString(xx) + " ") ;    // 输出修饰符
            System.out.print(r + " ") ;
            System.out.print(m[i].getName()) ;
            System.out.print("(") ;
            for(int j=0;j<p.length;j++){
                System.out.print(p[j].getName() + " " + "arg" + j) ;
                if(j<p.length-1){
                    System.out.print(",") ;
                }
            }
            Class<?> ex[] = m[i].getExceptionTypes() ;    // 取出异常
            if(ex.length>0){
                System.out.print(") throws ") ;
            }else{
                System.out.print(")") ;
            }
            for(int j=0;j<ex.length;j++){
                System.out.print(ex[j].getName()) ;
                if(j<p.length-1){
                    System.out.print(",") ;
                }
            }
            System.out.println() ;
        }

```

打印输出结果为

```java
	public class java.lang.String toString()
	public class java.lang.String getName()
	public void setName(java.lang.String arg0)
	public void setAge(int arg0)
	public int getAge()

```

java文档中，Class类中还有很多方法。

## 三、总结

这里只是简要学习了Class类中的一些简单方法的使用，并没有太多的技术含量。我们在这里只需要知道能够在程序运行时，能够动态获得某一个对象的类的所有信息。并能利用它做很多事情，比如Spring中的ioc（inverse of control）都是利用的Java的反射。







