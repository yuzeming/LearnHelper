如果你希望页面改造的效果能够持久的保留。可以通过开发一个Chrome扩展程序来实现。

##扩展程序结构
一个扩展程序其实是压缩在一起的一组文件，包括HTML，CSS，Javascript脚本，图片文件，还有其它任何需要的文件。
 扩展本质上来说就是web页面，它们可以使用所有的浏览器提供的API，从XMLHttpRequest到JSON到HTML5全都有。

每个扩展程序都应该包含下面的文件：

* 一个manifest文件（必须）
* 若干个html文件（可选）
* 若干个javascript文件（可选）
* 其他文件，例如图片（可选）

##程序demo

以改造网络学堂的应用为例。我为网络学堂添加了自动登录功能。先来分析一下如何实现。

1. 为登录页面添加自动登录的选项。
2. 当登录时在本地保存用户名密码。
3. 当在首页检测到用户名密码的时候自动登录（填写表单，触发登录函数）。
4. 为登录后的界面上的退出按钮新绑定一个函数，用于清除登录信息。
5. 另外，要验证登录信息有效的情况下才进行自动登录，以避免一不小心输错密码导致，自动登录-登录失败-返回-再自动登录-再失败 的循环。

先简单介绍一下保存数据使用的API localStorage 是一个HTML5中用来存储本地数据的API。每一个网站有独立的存储空间。


* localStorage.getItem("a") 返回保存的值，如果没有保存返回null
* localStorage.setItem("b","test") 为某个属性设置一个新值，*值只能是字符串*。
* localStorage.removeItem("c") 清除属性

###manifest.json
文件包含了扩展程序的基本信息，例如最重要的文件列表，扩展程序所需要的权限等。

```
{
	"name":"网络学堂自动登陆",
	"version":"1.0",
	"manifest_version":2,
	"web_accessible_resources":[
		"jquery-1.11.1.min.js",
		"index.js",
		"myspace.js",
		"click.js"
	],
	"permissions": [
  		"http://learn.cic.tsinghua.edu.cn/*"
	],
	"content_scripts": [
	    {
	      "matches": ["http://learn.cic.tsinghua.edu.cn/index"],
	      "js": ["jquery-1.11.1.min.js","index.js"]
	    },
	    {
	      "matches": ["http://learn.cic.tsinghua.edu.cn/f/*"],
	      "js": ["jquery-1.11.1.min.js","myspace.js"]
	    }
  	]
}
```

每一个项目分别是，扩展名称，版本，描述文件本身的版本（必须设为2），可以通过Web访问的文件列表，扩展程序的权限（这里申请了网络学堂网站的权限）和内容脚本（用于向特定页面注入脚本，CSS，可以指定多个文件，依次注入）。文件为JSON格式。即在JS内表示一个Obj。

当代码成功进行注入。你的JS脚本就能共享的页面DOM，除此之外，扩展的脚本运行在一个隔离的环境内，以避免和原页面上的脚本冲突。需要在扩展中引入自己的jqery函数库，这并不与原页面共享。

###index.js
用于向首页添加保存选项，并添加登录按钮的绑定，由于共享了DOM，所以这很容易实现。

```
//用于保存密码
function savePassword(){
	if ($("#_keeplogin")[0].checked ) {
		var u = $("#i_user")[0].value; //获得某个输入框的值。
		var p = $("#passwd")[0].value;
		localStorage.setItem("u",u); //保存到localStorage中
		localStorage.setItem("p",p);
	}
	return true;
}

//如果页面上没有添加复选框就进行改造。
if ($("#_keeplogin").length == 0) {
	var logintab = $(".login-tab");
	logintab.append('<tr><td></td><td></td><td><input type="checkbox" id="_keeplogin">保持登陆</td></tr>');
	$("#login").bind("click",savePassword); //为登录按钮添加一个新的函数绑定。
}

//如果 有登录信息 且 有效（k值不为空），就进行自动登录。
if (localStorage.getItem("u") && localStorage.getItem("p") && localStorage.getItem("k")){
	$("#i_user")[0].value = localStorage.getItem("u"); 
	$("#passwd")[0].value = localStorage.getItem("p");
	$("body").append('<script type="text/javascript" src='+chrome.extension.getURL("click.js")+'></script>');
}
```

解释一下最后一行代码，由于两个环境是隔离的，所以在这个扩展脚本里面执行 `$("#login").click()`; 并不会触发页面脚本里的提交函数。
事件触发必须通过修改DOM，向Body注入一个远程脚本来实现。
chrome.extension.getURL("click.js") 通过这个函数来获取扩展里文件的URL。可以像使用其它url一样使用。
这个文件必须在web_accessible_resources中被列出。

###click.js
用来触发提交函数

```
$("#login").click();
```

###myspace.js
用来提供退出函数。

```
//清除登录信息
function cleanPassword() {
	localStorage.removeItem("u");
	localStorage.removeItem("p");
	localStorage.removeItem("k");
}

$("a.setting").bind("click",cleanPassword); //绑定退出函数

//当保存了登录信息又进入了登录后的页面，说明登录信息是有效的。
if (localStorage.getItem("u") && localStorage.getItem("p")){ 
	localStorage.setItem("k","true"); 
}
```

##载入扩展程序
将这些文件保存到LearnHelper目录。
在扩展程序页面选中开发者模式，选择加载正在开发的扩展程序，选择LearnHelper目录进行加载。
如果你的manifest.json有错误会在加载的时候提示，通常都是少一个逗号之类的问题。

##调试扩展程序
扩展程序的代码也可以在开发者工具中调试，在Sources标签下，左边的文件列表上方，有一个标签页，切换到Content Script。就可以看到代码。可以像页面脚本那样进行调试。

扩展脚本的错误也可以在控制台看到。

##打包程序
选择打包扩展程序，并选中LearnHelper目录，会在上级目录生成LearnHelper.crx文件和一个LearnHelper.pem私钥。私钥用来更新程序，以证明旧版本的程序和新版本的程序来自同一个作者。

由于chrome的安全策略，不能双击安装。打开chrome的扩展程序页面。将crx文件拖入页面内即可安装。

##GetHub
可以在这里找到源代码和打包好的程序。
https://github.com/yuzeming/LearnHelper

##更多资料
扩展程序还有更强的能力。比如后台脚本，弹出对话框等。有了HTML5的支持，和桌面程序已经不相上下。

原版

https://developer.chrome.com/extensions

中文翻译版。

http://open.chrome.360.cn/extension_dev/overview.html


这次写的有点多。
Coding && have fun.

