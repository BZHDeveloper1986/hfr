// ==UserScript==
// @author        BZHDeveloper
// @name          [YT] Lire toutes les vidéos
// @version       0.3
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

function getChannelId() {
	var prop = document.querySelector ("meta[itemprop='channelId']");
	if (prop != null)
		return prop.getAttribute ("content");
	var prms = ytInitialData.responseContext.serviceTrackingParams;
	for (var i = 0; i < prms.length; i++)
		if (prms[i].service == "GFEEDBACK")
			for (var j = 0; j < prms[i].params.length; j++)
				if (prms[i].params[j].key == "browse_id")
					return prms[i].params[j].value;
	return null;
}

var obs = new MutationObserver(function (mutations, observer) {
	var hypl = document.querySelector ("#hfr-yt-play-list");
	if (hypl != null)
		return;
	var id = getChannelId();
	if (id != null) {
		if (id.indexOf ("VL") == 0)
			id = id.substring (2);
		if (id.indexOf ("UC") == 0)
			id = "UU" + id.substring (2);
		var elem = document.querySelector("#trigger > #label > #label-text");
		if (elem != null) {
			console.log ("prout");
			var div = document.createElement ("div");
			div.setAttribute ("id", "hfr-yt-play-list");
			div.appendChild (document.createTextNode (" ➡ "));
			var link = document.createElement ("a");
			link.setAttribute ("href", "/playlist?list=" + id);
			link.textContent = "Tout regarder";
			div.appendChild (link);
			elem.parentElement.parentElement.parentElement.parentElement.parentElement.appendChild (div);
		}
	}
});
obs.observe (document, {attributes: false, childList: true, characterData: false, subtree: true});
