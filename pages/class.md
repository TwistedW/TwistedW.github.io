---
layout: default
title: 分类
permalink: /pages/class.html
---
<div class="home">

	{% for category in site.categories %} 
	      		<div class="panel panel-primary">
	        			<div class="panel-heading center" id="{{ category[0] }}" name="{{ category[0] }}">{{ category[0] }}</div>
			              {% for post in category[1] %}
			                 <a  href='{{ post.url }}'  class="list-group-item clearfix pjaxlink">
				            {{post.title}}
				            <span class="badge">{{ post.date | date:"%Y年%m月%d日" }}</span>
				     </a>
			               {% endfor %}
			</div>
	{% endfor %}
	
</div>