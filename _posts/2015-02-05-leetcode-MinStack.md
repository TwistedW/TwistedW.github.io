---
layout: post
title: leetcode之MinStack
category: 技术
tags:  [leetcode,算法]
description: 
---


>关于这一题的详细描述请看 [https://oj.leetcode.com/problems/min-stack/](https://oj.leetcode.com/problems/min-stack/)

实际上就是实现一个栈，与一般的栈不同的是，这个栈中要能返回当前栈中最小的数。因此需要使用额外的结构去存储栈中最小的数字。

java中的LinkedList是一个双向链表，用来实现栈或者队列等数据结构再好不过。

先看代码：

	class MinStack {    
	    private  LinkedList<Integer> list = new LinkedList<Integer>(); //存储压入栈中的所有值
	    private  LinkedList<Integer> mins = new LinkedList<Integer>(); //存储当前栈中的最小值
	        
	    public void push(int x) {   //栈中压入值
	        this.list.add(x);        
	        if(this.mins.size() < 1 || this.mins.getLast() >= x)
	            this.mins.add(x);       
	    }
	    
	    
	    public void pop() {         //从栈中，pop出当前栈顶的值
	        if(list.getLast().equals(mins.getLast())){
	           this.mins.removeLast(); 
	        }
	        this.list.removeLast();
	    }
	
	    public int top() {			//返回当前栈中，栈顶的值
	        return this.list.getLast();
	    }
	    
	    public int getMin() {    	//返回当前栈中的最小值
	        return this.mins.getLast();
	    }
	}

最大的问题就是，pop的时候，有可能pop出的是当前栈中的最小值。因此在pop函数操作时，需同时操作维护最小值的linkedlist。

还有一点就是，你可能会认为，push(5),push(1)后再，push(3)。3不能压入最小值的栈。这样当1 pop出之后，再pop时就是5而不是3，实际上，由于这是一个栈，在pop(1)之前，3就已经pop出了。




**坚持不懈刷完leetcode**