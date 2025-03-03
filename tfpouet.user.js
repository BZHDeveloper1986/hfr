// ==UserScript==
// @author        BZHDeveloper
// @name          TFPouet
// @version       0.0.2
// @namespace     tf1.fr
// @description   vous savez.
// @icon          https://gitlab.com/BZHDeveloper/HFR/raw/master/hfr-logo.png
// @downloadURL   https://gitlab.com/BZHDeveloper/hfr/-/raw/master/tfpouet.user.js
// @updateURL     https://gitlab.com/BZHDeveloper/hfr/-/raw/master/tfpouet.user.js
// @include       https://www.tf1.fr/*/direct
// @include       https://www.tf1.fr/stream/*
// @noframes
// @grant         GM.info
// @grant         GM.xmlHttpRequest
// @grant         GM.registerMenuCommand
// @grant         GM_registerMenuCommand
// @grant         GM_xmlhttpRequest
// ==/UserScript==

function isGM4() {
	if (typeof (GM) !== "object")
		return false;
	if (typeof (GM.info) !== "object")
		return false;
	return GM.info.scriptHandler == "Greasemonkey" && parseFloat(GM.info.version) >= 4;
}

let Utils = {
	request : function (object) {
		if (isGM4())
			return GM.xmlHttpRequest (object);
		else
			return GM_xmlhttpRequest (object);
	}
};

var regex = /^(https:\/\/www\.tf1\.fr\/(?<id>[\w-]+)\/direct)$/;
var res = regex.exec (document.URL);
if (res != null) {
	var id = res.groups.id.toUpperCase();
	var url = `https://mediainfo.tf1.fr/mediainfocombo/L_${id}?context=MYTF1&pver=4001000`;
	Utils.request({
				method : "GET",
				url : url,
				onload : function (response) {
					var data = JSON.parse (response.responseText);
					prompt ("copie l'adresse et colle la dans ton lecteur vidéo", data.delivery.url);
				}
			});
}
else {
	var regex = /^(https:\/\/www\.tf1\.fr\/stream\/(?<id>[\w-]+))$/;
	var res = regex.exec (document.URL);
	if (res != null) {
		var id = res.groups.id;
		var url = `https://mediainfo.tf1.fr/mediainfocombo/L_FAST_v2l-${id}?context=MYTF1&pver=4001000`;
		Utils.request({
					method : "GET",
					url : url,
					headers : {
						"User-Agent" : "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25"
					},
					onload : function (response) {
						var data = JSON.parse (response.responseText);
						console.log (data);
						prompt ("copie l'adresse et colle la dans ton lecteur vidéo", data.delivery.url);
					}
				});
	}
}
