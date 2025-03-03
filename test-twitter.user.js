// ==UserScript==
// @author        BZHDeveloper, roger21
// @name          [HFR] Test Twitter
// @version       0.0.1
// @namespace     forum.hardware.fr
// @description   Colle les données du presse-papiers et les traite si elles sont reconnues.
// @icon          https://gitlab.com/BZHDeveloper/HFR/raw/master/hfr-logo.png
// @downloadURL   https://gitlab.com/BZHDeveloper/HFR/raw/master/hfr_cc.user.js
// @updateURL     https://gitlab.com/BZHDeveloper/HFR/raw/master/hfr_cc.user.js
// @include       https://forum.hardware.fr/*
// @noframes
// @grant         GM.info
// @grant         GM.xmlHttpRequest
// @grant         GM_getValue
// @grant         GM_setValue
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

function Stack() {
	var counter = -1;
	this.objects = {};
	this.add = function (data) {
		counter++;
		this.objects[counter.toString()] = data;
		return counter;
	};
	this.getData = function (index) {
		return this.objects[index.toString()];
	}
}

let HFR = {
	request : function (object) {
		if (isGM4())
			return GM.xmlHttpRequest (object);
		else
			return GM_xmlhttpRequest (object);
	},
	setValue : function (key, data) {
		if (!isGM4()) {
			GM_setValue (key, data);
			return;
		}
		if (typeof (data) === "object")
			localStorage.setItem (GM.info.script.name + " :: " + key, JSON.stringify (data));
		else
			localStorage.setItem (GM.info.script.name + " :: " + key, data);
	},
	getValue : function (key, default_value) {
		if (!isGM4())
			return GM_getValue (key, default_value);
		var rk = GM.info.script.name + " :: " + key;
		if (!localStorage.hasOwnProperty(rk))
			return default_value;
		var data = localStorage.getItem (rk);
		try {
			var obj = JSON.parse (data);
			return obj;
		}
		catch(e) {
			return default_value;
		}
		return data;	
	}
};

HFR.request ({
	method : "GET",
	url : "https://twitter.com/DrEricDing/status/1273047315121606661",
	headers : { 
		"Referer" : "https://twitter.com",
		"User-Agent" : "Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)"
	},
	onload : function (response) {
		var doc = new DOMParser().parseFromString (response.responseText, "text/html");
		var ct = doc.querySelector ("#main-content");
		if (ct != null)
			console.log (ct.getAttribute ("class"));
	}
});
