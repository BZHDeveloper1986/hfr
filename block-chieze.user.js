// ==UserScript==
// @author        BZHDeveloper, roger21
// @name          [YouTube] Block Chièze
// @version       0.0.1
// @namespace     youtube.com
// @description   sans commentaire
// @include       https://www.youtube.com/*
// @downloadURL   https://gitlab.com/BZHDeveloper/HFR/raw/master/block-chieze.user.js
// @updateURL     https://gitlab.com/BZHDeveloper/HFR/raw/master/block-chieze.user.js
// @noframes
// @grant         GM.info
// @grant         GM.xmlHttpRequest
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @grant         GM_xmlhttpRequest
// ==/UserScript==

var videos = document.querySelectorAll (".yt-lockup-video");
for (var i = videos.length - 1; i >= 0; i--) {
	var video = videos.item (i);
	var anchor = video.querySelector (".yt-lockup-byline a");
	if (anchor != null && anchor.getAttribute ("href") == "/channel/UCRXcryyD7dzNQzd0Zkbj3ug") {
		video.parentElement.removeChild (video);
		continue;
	}
	var title = video.querySelector (".yt-lockup-title a").textContent.toLowerCase();
	if (title.indexOf ("julien chièze") >= 0 || title.indexOf ("julien chieze") >= 0)
		video.parentElement.removeChild (video);
}

var channels = document.querySelectorAll (".yt-lockup-channel");
for (var i = channels.length - 1; i >= 0; i--) {
	var channel = channels.item (i);
	var anchor = channel.querySelector (".yt-lockup-title a");
	if (anchor != null && anchor.getAttribute ("href") == "/channel/UCRXcryyD7dzNQzd0Zkbj3ug")
		channel.parentElement.removeChild (channel);
}

var obs = new MutationObserver (function (mutations, observer) {
	var items = document.querySelectorAll ("ytd-video-renderer");
	for (var i = items.length - 1; i >= 0; i--) {
		var item = items.item (i);
		var anchor = item.querySelector (".ytd-channel-name .yt-simple-endpoint");
		if (anchor != null && anchor.getAttribute ("href") == "/channel/UCRXcryyD7dzNQzd0Zkbj3ug") {
			item.parentElement.removeChild (item);
			continue;
		}
		var title = item.querySelector ("#video-title yt-formatted-string").textContent.toLowerCase();
		if (title.indexOf ("julien chièze") >= 0 || title.indexOf ("julien chieze") >= 0)
			item.parentElement.removeChild (item);
	}

	items = document.querySelectorAll ("ytd-search-refinement-card-renderer");
	for (var i = items.length - 1; i >= 0; i--) {
		var item = items.item (i);
		var title = item.querySelector ("#card-title div").textContent.toLowerCase();
		if (title.indexOf ("julien chièze") >= 0 || title.indexOf ("julien chieze") >= 0)
			item.parentElement.removeChild (item);
	}
	
	items = document.querySelectorAll ("ytd-channel-renderer");
	for (var i = items.length - 1; i >= 0; i--) {
		var item = items.item (i);
		var title = item.querySelector ("#text-container  yt-formatted-string").textContent.toLowerCase();
		if (title.indexOf ("julien chièze") >= 0 || title.indexOf ("julien chieze") >= 0)
			item.parentElement.removeChild (item);
	}
}); 
obs.observe (document, {attributes: false, childList: true, characterData: false, subtree: true});
