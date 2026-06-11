// ==UserScript==
// @author        BZHDeveloper
// @name          [BlueSky] image
// @version       0.0.1
// @namespace     bsky.app
// @description   Affichage des images dans les MP
// @icon          https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Bluesky_Logo.svg/3840px-Bluesky_Logo.svg.png
// @downloadURL   https://github.com/BZHDeveloper1986/hfr/raw/refs/heads/main/bluesky-image.user.js
// @updateURL     https://github.com/BZHDeveloper1986/hfr/raw/refs/heads/main/bluesky-image.user.js
// @require       https://unpkg.com/video.js/dist/video.min.js
// @include       https://bsky.app/messages*
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
	document.querySelectorAll("div > div > div > div > div > div > div > div > a").forEach(a => {
		if (a.href.indexOf ("https://i.imgur.com/") == 0) {
			var img = document.createElement ("img");
			img.setAttribute ("src",a.href);
			img.width = 200;
			var parent = a.parentElement;
			parent.removeChild (a);
			parent.appendChild (img);
		}
	});
});
observer.observe(document, {attributes: false, childList: true, characterData: false, subtree: true});
