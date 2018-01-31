---
layout: post
title: Java中的集合类了解
category: 技术
tags: Java
description: 
---


> 容器是Java语言学习中重要的一部分，很多优秀的算法都需要借助特定的容器类来实现。因此容器类其实就是java中的数据结构。先上一张图（原图地址：[点这里](http://www.cnblogs.com/xwdreamer/archive/2012/05/30/2526822.html)）

![](/assets/img/blogimg/java_collections.png)


其中

- 实线和空心三角形表示继承关系
- 虚线和空心三角形表示接口实现关系
- 虚线和实心三角形表示依赖关系（一个类的方法操作另一个类的对象）


上述类图中，实线边框的是实现类，比如ArrayList，LinkedList，HashMap等，折线边框的是抽象类，比如AbstractCollection，AbstractList，AbstractMap等，而点线边框的是接口，比如Collection，Iterator，List等。

由上图可以很清楚的看到Java的容器类主要由两个接口派生而出：**Collection**和**Map**。


## Collections和Arrays

 Collection是容器层次结构中根接口。而Collections和Arrays是一个提供一些处理容器类静态方法的类。例如常用的Arrays.sort()    	Arrays.copy();方法等。

## Collection体系 -- Set,List,Queue (三个Interface)

**Set**：

一个不包括重复元素（包括可变对象）的Collection，是一种无序的集合。如果a.equals(b),那么set里是不能同时包含a和b的，并且set里最多只能有一个null。

实现Set的有：

- HashSet ： 内部采用HashMap实现的
- LinkedHashSet ： 采用LinkedHashMap实现
- TreeSet ： 采用TreeMap实现


**List**:

一个有序的Collection（也称序列），元素可以重复。确切的讲，列表通常允许满足 e1.equals(e2) 的元素对 e1 和 e2，并且如果列表本身允许 null 元素的话，通常它们允许多个 null 元素。

实现List的有：

- ArrayList : 采用数组实现，适合随机查找，但不适合频繁增删
- LinkedList ： 链表实现，适合频繁增删，但不适合随机查找
- Vector ： 历史遗留产物，同步版的ArrayList（使用了synchronized方法）
- Stack ： 继承自Vector。Java里其实没有纯粹的Stack，可自己实现一个，封装一下LinkedList即可。

**Queue**：

一种队列是双端队列，支持在头、尾两端插入和移除元素，主要包括：ArrayDeque、LinkedBlockingDeque、LinkedList。另一种是阻塞式队列，队列满了以后再插入元素则会抛出异常，主要包括ArrayBlockQueue、PriorityBlockingQueue、LinkedBlockingQueue。虽然接口并未定义阻塞方法，但是实现类扩展了此接口。


## Map体系

Map：是一个键值对的集合。也就是说，一个映射不能包含重复的键，每个键最多映射到一个值。该接口取代了Dictionary抽象类。

实现map的有：

- HashMap/HashTable ： 和ArrayList一样采用数组实现，超过初始容量会对性能有损耗。
- TreeMap ： TreeMap中所有的元素都保持着某种固定的顺序 
- Properties ： 继承的HashTable （用于配置文件）



## 一些异同点

**Vector和ArrayList：**

1，vector是线程同步的，所以它也是线程安全的，而arraylist不是线程异步的，是不安全的。如果不考虑到线程的安全因素，一般用arraylist效率比较高。
2，如果集合中的元素的数目大于目前集合数组的长度时，vector增长率为目前数组长度的100%,而arraylist增长率为目前数组长度的50%.如过在集合中使用数据量比较大的数据，用vector有一定的优势。

**ArrayList和LinkedList：**

1.ArrayList是实现了基于动态数组的数据结构，LinkedList基于链表的数据结构。
2.对于随机访问get和set，ArrayList优于LinkedList，因为LinkedList要移动指针。
3.对于新增和删除操作add和remove，LinedList比较占优势，因为ArrayList要移动数据。


**HashTable与HashMap：**

1.HashMap允许key和value为null，而HashTable不允许。
2.HashTable是同步的，而HashMap不是。所以HashMap适合单线程环境，HashTable适合多线程环境。
3.HashTable被认为是个遗留的类，如果你寻求在迭代的时候修改Map，你应该使用CocurrentHashMap。



## 一些问题

**在Java中，HashMap是如何工作的？**

HashMap在Map.Entry静态内部类实现中存储<key，value>对。
	
	static class HashMapEntry<K, V> implements Entry<K, V> {
        final K key;
        V value;
        final int hash;
        HashMapEntry<K, V> next;   //从这可以看到HashMapEntry是一个链表

		//...还有一堆代码
	}

    transient HashMapEntry<K, V>[] table;   //存储key,value的数组。

HashMap使用哈希算法，在put和get方法中，它使用hashCode()和equals()方法。

	public V put(K key, V value) {
        if (key == null) {
            return putValueForNullKey(value);
        }

        int hash = Collections.secondaryHash(key);
        HashMapEntry<K, V>[] tab = table;
        int index = hash & (tab.length - 1);
        for (HashMapEntry<K, V> e = tab[index]; e != null; e = e.next) {  //已经存在
            if (e.hash == hash && key.equals(e.key)) {
                preModify(e);
                V oldValue = e.value;
                e.value = value;
                return oldValue;
            }
        }

        // No entry for (non-null) key is present; create one
        modCount++;
        if (size++ > threshold) {
            tab = doubleCapacity();
            index = hash & (tab.length - 1);
        }
        addNewEntry(key, value, hash, index);    //新的entry，增加进去
        return null;
    }

在HashMap中我们的key可以为null，所以第一步就处理了key为null的情况。

当我们通过传递<key，value>对调用put方法的时候，HashMap使用Key hashCode()和哈希算法来找出存储key-value对的索引。当找到key所对应的位置的时候，对对应位置的Entry的链表进行遍历，如果以及存在key的话，就更新对应的value，并返回老的value。如果是新的key的话，就将其增加进去。

当我们通过传递key调用get方法时，其实就是将key以put时相同的方法算出在table的所在位置，然后对所在位置的链表进行遍历，找到hash值和key都相等的Entry并将value返回。

HashMap默认的初始容量是32，负荷系数是0.75。阀值是为负荷系数乘以容量，无论何时我们尝试添加一个entry，如果map的大小比阀值大的时候，HashMap会对map的内容进行重新哈希，且使用更大的容量。容量总是2的幂，所以如果你知道你需要存储大量的<key，value>对，比如缓存从数据库里面拉取的数据，使用正确的容量和负荷系数对HashMap进行初始化是个不错的做法。



**hashCode()和equals()方法?**


HashMap使用Key对象的hashCode()和equals()方法去决定<key，value>对的索引.

1.如果o1.equals(o2)，那么o1.hashCode() == o2.hashCode()总是为true的。
2.如果o1.hashCode() == o2.hashCode()，并不意味着o1.equals(o2)会为true。

我们可以使用任何类作为Map的key，然而在使用它们之前，需要考虑以下几点：

1.如果类重写了equals()方法，它也应该重写hashCode()方法。
2.类的所有实例需要遵循与equals()和hashCode()相关的规则。请参考之前提到的这些规则。
3.如果一个类没有使用equals()，你不应该在hashCode()中使用它。

**equals()方法的写法**

例如有一个Date类：

	Class Date{
		int year;
		int monthl
		int day;
	
		public boolean equals(Object x){  //一定是与一个Object比较
			if(this == x) return true; //地址相同，同一个对象
			if(x == null) return false; //x为null
			if(this.getClass() != x.getClass()) return false;	//不同的类对象
			Date that = (Date)x;

			if(this.year != that.year) return false;
			if(this.month != that.month) return false;
			if(this.day != that.day) return false;
			
			return true;
		}

	}	


**哪些集合类是线程安全的**

Vector、HashTable、Properties和Stack是同步类，所以它们是线程安全的，可以在多线程环境下使用。