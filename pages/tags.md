---
layout: default
title: 标签
permalink: /pages/tags.html
---

<div class="home">
	<div class="page-tag">
		{% for tag in site.tags %}
			<a class="pjaxlink"  href="#{{tag[0]}}" name="{{tag[0]}}">{{ tag[0] }}({{tag[1].size}})</a>
		{% endfor %}
	</div>

	<div class="clear"></div>

	<div>
		{% for tag in site.tags %}
		<div class="target-fix" id = "{{tag[0]}}" name="{{tag[0]}}">
			<h1 class="tag-name" >{{tag[0]}}</h1>
			<ul class="tags">
				{% for post in tag[1] %}
					<li class="article">					
						<a  class="pjaxlink"  href="{{ post.url }}"><span class="datetime">{{ post.date | date:"%Y-%m-%d" }} </span>&raquo; {{ post.title }}</a>
					</li>
				{% endfor %}	
			</ul>
		</div>	
		{% endfor %}
	</div>	
</div>	