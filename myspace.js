function cleanPassword() {
	localStorage.removeItem("u");
	localStorage.removeItem("p");
	localStorage.removeItem("k");
}


$("a.setting").bind("click",cleanPassword);

if (localStorage.getItem("u") && localStorage.getItem("p")){
	localStorage.setItem("k","true");
}
