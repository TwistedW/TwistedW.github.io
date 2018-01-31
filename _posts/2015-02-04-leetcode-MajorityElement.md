---
layout: post
title: leetcode之寻找数组中出现次数超过一半的数字
category: 技术
tags:  [leetcode,算法]
description: 
---

>leetcode中有一题是寻找一个整形数组中，出现次数超过⌊n/2⌋的数字，这一题也出现在了百度的面试题中。

## 思路一

暴力解决，统计数组中每一个数字的出现次数，找出出现次数超过⌊n/2⌋的数字，无疑空间复杂度会比较大，因为需要统计每一个数字的出现次数。

## 思路二

遍历数组，每次删除两个不同的数，最后剩下的一定是出现次数超过⌊n/2⌋的数字。在实现的时候，这里的删除不是真正的物理上的删除。使用两个变量来辅助。

- 一个是current 用来临时存储数组中的数据
- 一个是count 用来存储某个数字出现的次数

开始时current存储数组中的第一个数,count为0，遍历数组，如果数组出现的数与current相等，则count加1，否则就减1，如果count为0，就把当前数组中的数赋给current,因为指定的数出现的次数大于数组长度的一半，count++与count--相抵消之后，最后count的值是大于等于1的，current中存的那个数就是出现最多的那个数。


代码如下：

	public class Solution {
	    public int majorityElement(int[] num) {
	        
	        int current = 0; //初始值0
	        int count = 0;   //初始值0
	        
	        for(int i=0;i<num.length;i++){   //遍历数组
	            if(count==0)       //如果count为0，代表前面的数字正好全部抵消了
 	             {  
	                current = num[i];  //current重新设定为当前遍历到的值
	                count = 1;  
	             }  
	            else  
	            {  
	                if(num[i]==current)  //current等于当前遍历到的值 count++
	                    count++;  
	                else  				//current不等于当前遍历到的值 抵消 count--
	                    count--;  
	            }  
	            
	        }
	        	        
	        return current;   //最后current中存储的就是出现次数超过⌊n/2⌋的数字
	        
	    }
	}
