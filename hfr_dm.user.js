// ==UserScript==
// @author        BZHDeveloper
// @name          [HFR] Délit mots chiants
// @version       0.0.1
// @namespace     lequipe.fr
// @description   test dailymotion
// @icon          https://gitlab.gnome.org/BZHDeveloper/HFR/raw/main/hfr-logo.png
// @downloadURL   https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr_dm.user.js
// @updateURL     https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr_dm.user.js
// @include       https://www.lequipe.fr/tv/videos/live/*
// @noframes
// @grant         GM.info
// @grant         GM.xmlHttpRequest
// @grant         GM.registerMenuCommand
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @grant         GM_xmlhttpRequest
// ==/UserScript==

function isGM4() {
	return typeof (GM) === "object" && typeof (GM.info) === "object" && GM.info.scriptHandler == "Greasemonkey" && parseFloat(GM.info.version) >= 4;
}

function makeRequest (obj) {
	if (isGM4())
		return GM.xmlHttpRequest (obj);
	else
		return GM_xmlhttpRequest (obj);
}

function getLiveURL() {
	var parts = document.URL.split("/");
	var id = parts[parts.length - 1];
	makeRequest ({
		method : "GET",
		responseType : "json",
		url : "https://www.dailymotion.com/player/metadata/video/" + id + "?embedder=" + encodeURIComponent(document.URL),
		onload : function (response) {
			prompt ("URL du direct :", response.response.qualities.auto[0].url);
		}
	});
}

var currentUrl = document.URL;

setInterval(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
	getLiveURL();
  }
}, 500);

getLiveURL();
