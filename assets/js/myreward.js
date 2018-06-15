$(function(){
	$(".pay_item").click(function(){
		$(this).addClass('checked').siblings('.pay_item').removeClass('checked');
		var dataid=$(this).attr('data-id');
		$(".shang_payimg img").attr("src", "/assets/img/social/"+dataid+"speed.png");
		$("#shang_pay_txt").text(dataid=="Wechat"?"微信":"支付宝");
	});
});

function dashangToggle(){
	$(".hide_box").fadeToggle();
	$(".shang_box").fadeToggle();
}