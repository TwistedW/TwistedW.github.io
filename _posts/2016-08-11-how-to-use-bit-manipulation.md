---
layout: post
title: 使用位运算来提交解决问题的效率
category: 技术
tags: [算法]
description: 
---

>位运算，包括四种基本运算，AND、OR、XOR、NOT，还有位的移位操作，如果可以巧妙的使用位运算，那么解决某些问题不仅简单而且高效。

**例**

1.给定一个数，计算这个数的二进制表示中有多少个1

	int count_one(int n) {
	    while(n) {
	        n = n&(n-1);
	        count++;
	    }
	    return count;
	}

2.两个整数的和

使用^和&来计算

	int getSum(int a, int b) {
	    return b==0? a:getSum(a^b, (a&b)<<1); 
	}


3.第一个miss的整数

给定一组不重复的数，包含 0,1,2……n，求出，第一个miss的整数，比如[0,1,3]返回2，[0,1,2]返回3.

	int missingNumber(int[] nums) {
	    int ret = 0;
	    for(int i = 0; i < nums.length; ++i) {
	        ret ^= i;
	        ret ^= nums[i];
	    }
	    return ret^=nums.length;
	}


4.判断一个数是否是2的n次方

	boolean is2Power(int num){
		return (num & (num -1)) == 0;
	}


5.求两个数的平均数

	int getAverage(int m,int n){  
	    return ((m ^ n) >> 1) + (m & n);  
	}  


