---
layout: post
title: 如何在java中使用ConcurrentHashMap
category: 技术
tags: [Java]
description: 
---

>ConcurrentHashMap(简称CHM)是在Java 1.5作为Hashtable的替代选择新引入的，是concurrent包的重要成员。在Java 1.5之前，如果想要实现一个可以在多线程和并发的程序中安全使用的Map,只能在HashTable和synchronized Map中选择，因为HashMap并不是线程安全的。但再引入了CHM之后，我们有了更好的选择。CHM不但是线程安全的，而且比HashTable和synchronizedMap的性能要好。相对于HashTable和synchronizedMap锁住了整个Map，CHM只锁住部分Map。CHM允许并发的读操作，同时通过同步锁在写操作时保持数据完整性,在这篇博客中我将介绍以下几点：


- CHM在Java中如何实现的
- 什么情况下应该使用CHM
- 在Java中使用CHM的例子
- CHM的一些重要特性



**Java中ConcurrentHashMap的实现**

CHM引入了分割，并提供了HashTable支持的所有的功能。在CHM中，支持多线程对Map做读操作，并且不需要任何的blocking。这得益于CHM将Map分割成了不同的部分，在执行更新操作时只锁住一部分。根据默认的并发级别(concurrency level)，Map被分割成16个部分，并且由不同的锁控制。这意味着，同时最多可以有16个写线程操作Map。试想一下，由只能一个线程进入变成同时可由16个写线程同时进入(读线程几乎不受限制)，性能的提升是显而易见的。但由于一些更新操作，如put(),remove(),putAll(),clear()只锁住操作的部分，所以在检索操作不能保证返回的是最新的结果。

另一个重要点是在迭代遍历CHM时，keySet返回的iterator是弱一致和fail-safe的，可能不会返回某些最近的改变，并且在遍历过程中，如果已经遍历的数组上的内容变化了，不会抛出ConcurrentModificationExceptoin的异常。

CHM默认的并发级别是16，但可以在创建CHM时通过构造函数改变。毫无疑问，并发级别代表着并发执行更新操作的数目，所以如果只有很少的线程会更新Map，那么建议设置一个低的并发级别。另外，CHM还使用了ReentrantLock来对segments加锁。


**Java中ConcurrentHashMap putifAbsent方法的例子**

很多时候我们希望在元素不存在时插入元素，我们一般会像下面那样写代码
	
	synchronized(map){
	  if (map.get(key) == null){
	      return map.put(key, value);
	  } else{
	      return map.get(key);
	  }
	}
	
上面这段代码在HashMap和HashTable中是好用的，但在CHM中是有出错的风险的。这是因为CHM在put操作时并没有对整个Map加锁，所以一个线程正在put(k,v)的时候，另一个线程调用get(k)会得到null，这就会造成一个线程put的值会被另一个线程put的值所覆盖。当然，你可以将代码封装到synchronized代码块中，这样虽然线程安全了，但会使你的代码变成了单线程。CHM提供的putIfAbsent(key,value)方法原子性的实现了同样的功能，同时避免了上面的线程竞争的风险。


**什么时候使用ConcurrentHashMap**

CHM适用于读者数量超过写者时，当写者数量大于等于读者时，CHM的性能是低于Hashtable和synchronized Map的。这是因为当锁住了整个Map时，读操作要等待对同一部分执行写操作的线程结束。CHM适用于做cache,在程序启动时初始化，之后可以被多个请求线程访问。正如Javadoc说明的那样，CHM是HashTable一个很好的替代，但要记住，CHM的比HashTable的同步性稍弱

                             
**总结**

现在我们知道了什么是ConcurrentHashMap和什么时候该用ConcurrentHashMap，下面我们来复习一下CHM的一些关键点。

- CHM允许并发的读和线程安全的更新操作
- 在执行写操作时，CHM只锁住部分的Map
- 并发的更新是通过内部根据并发级别将Map分割成小部分实现的
- 高的并发级别会造成时间和空间的浪费，低的并发级别在写线程多时会引起线程间的竞争
- CHM的所有操作都是线程安全
- CHM返回的迭代器是弱一致性，fail-safe并且不会抛出ConcurrentModificationException异常
- CHM不允许null的键值
- 可以使用CHM代替HashTable，但要记住CHM不会锁住整个Map

以上就是Java中CHM的实现和使用场景。

