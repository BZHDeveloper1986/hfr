// ==UserScript==
// @author        BZHDeveloper
// @name          [YT] Lire toutes les vidéos
// @version       0.4
// @namespace     www.youtube.com
// @description   lire les dernières vidéos mises en ligne.
// @include       https://www.youtube.com/*
// @noframes
// @grant         GM.info
// @grant         GM.xmlHttpRequest
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @grant         GM_xmlhttpRequest
// ==/UserScript==

function getPlaylistId() {
	var meta = document.querySelector("meta[property='og:url']");
	if (meta == null)
		return null;
	var attr = meta.getAttribute ("content");
	var cid = attr.split("/")[attr.split("/").length - 1];
	return "UU" + cid.substring (2);
}

var obs = new MutationObserver(function (mutations, observer) {
	var plid = getPlaylistId();
	if (plid == null)
		return;
	var span = document.querySelector (".page-header-view-model-wiz__page-header-title span");
	span.onclick = e => {
		window.location.href = "https://www.youtube.com/playlist?list=" + plid;
	};
});
obs.observe (document, {attributes: false, childList: true, characterData: false, subtree: true});
