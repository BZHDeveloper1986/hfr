// ==UserScript==
// @author        BZHDeveloper, roger21
// @name          Skuebly
// @version       0.0.1
// @namespace     bsky.app
// @description   test BlueSky
// @require       https://vjs.zencdn.net/8.0.4/video.js
// @include       https://bsky.app
// @include       https://bsky.app/*
// @noframes
// @grant         GM.info
// @grant         GM.xmlHttpRequest
// @grant         GM.registerMenuCommand
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @grant         GM_xmlhttpRequest
// ==/UserScript==

var observer = new MutationObserver ((mutations, observer) => {
	document.querySelectorAll ("a").forEach (link => {
		if (link != null && link.getAttribute ("href") != null && link.getAttribute ("role") == "link") {
			if (link.getAttribute ("href").indexOf ("https://www.youtube.com/watch?v=") == 0) {
				var id = link.getAttribute ("href").split ("https://www.youtube.com/watch?v=")[1];
				var frame = document.createElement ("iframe");
				frame.setAttribute ("src", "https://www.youtube.com/embed/" + id);
				frame.setAttribute ("frameborder", "0");
				frame.setAttribute ("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
				var p = link.parentElement;
				p.removeChild (link);
				p.appendChild (frame);
			}
			else if (link.getAttribute ("href").indexOf ("https://streamable.com/") == 0) {
				var id = link.getAttribute ("href").split ("https://streamable.com/")[1];
				var frame = document.createElement ("iframe");
				frame.setAttribute ("src", "https://streamable.com/t/" + id);
				frame.setAttribute ("frameborder", "0");
				var p = link.parentElement;
				p.removeChild (link);
				p.appendChild (frame);
			}
		}
	});
});
observer.observe(document, {attributes: false, childList: true, characterData: false, subtree: true}); 
