function savePassword(){
	if ($("#_keeplogin")[0].checked ) {
		var u = $("#i_user")[0].value;
		var p = $("#passwd")[0].value;
		localStorage.setItem("u",u);
		localStorage.setItem("p",p);
	}
	return true;
}

if (localStorage.getItem("u") && localStorage.getItem("p") && localStorage.getItem("k")){
	$("#i_user")[0].value = localStorage.getItem("u");
	$("#passwd")[0].value = localStorage.getItem("p");
	$("body").append('<script type="text/javascript" src='+chrome.extension.getURL("click.js")+'></script>');
}

if ($("#_keeplogin").length == 0) {
	var logintab = $(".login-tab");
	logintab.append('<tr><td></td><td></td><td><input type="checkbox" id="_keeplogin">保持登陆</td></tr>');
	$("#login").bind("click",savePassword);
}
