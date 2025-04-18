// ==UserScript==
// @author        BZHDeveloper, roger21
// @name          [HFR] Copié/Collé v2
// @version       1.4.62
// @namespace     forum.hardware.fr
// @description   Colle les données du presse-papiers et les traite si elles sont reconnues.
// @icon          https://github.com/BZHDeveloper1986/hfr/blob/main/hfr-logo.png?raw=true
// @downloadURL   https://github.com/BZHDeveloper1986/hfr/raw/refs/heads/main/hfr_cc_2.user.js
// @updateURL     https://github.com/BZHDeveloper1986/hfr/raw/refs/heads/main/hfr_cc_2.user.js
// @require       https://vjs.zencdn.net/8.0.4/video.js
// @include       https://forum.hardware.fr/*
// @noframes
// @grant         GM.info
// @grant         GM.xmlHttpRequest
// @grant         GM.registerMenuCommand
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @grant         GM_xmlhttpRequest
// ==/UserScript==

// Historique
// 1.4.62         Correction du contrôle image GDoc
// 1.4.61         Collage des images Google Docs.
// 1.4.60         Gitlab s'emmerdifie, on va tenter Github.
// 1.4.58         Choix du service d'envoi d'images.
// 1.4.56         BlueSky : normalisation du texte enrichi
// 1.4.55         tant pis pour les GIF sous Fofox.
// 1.4.54         Nouvelle URL pour les emojis.
// 1.4.53         le dev est un idiot.
// 1.4.52         correction d'URL.
// 1.4.50         Normalisation des chaînes de caractères.
// 1.4.49         BlueSky : souci avec les images.
// 1.4.48         BlueSky : les GIF sont là.
// 1.4.46         BlueSky : compte le texte en octets, pas en caractères...
// 1.4.45         BlueSky : c'est un *** leur gestion des données.
// 1.4.44         BlueSky : Correction du profil.
// 1.4.43         BlueSky : description du lien externe.
// 1.4.42         BlueSky : ajout du profil (en travaux :o)
// 1.4.41         BlueSky : ajout du logo.
// 1.4.40         BlueSky : miniature des liens, si existe.
// 1.4.39         BlueSky : ajout des images & video.
// 1.4.38         alerte firefox sur une fonctionnalité désactivée.
// 1.4.37         Taille limite pour imgur (*** alors eux).
// 1.4.35         Twitter : correction affichage emojis dans le texte.
// 1.4.34         Mastodon : emojis dans le nom de l'utilisateur.
// 1.4.33         Instagram ne fonctionne plus
// 1.4.28         Firefox : affichage de l'activation dans une alerte.
// 1.4.27         ajout d'un contrôle de compatibilité :o
// 1.4.26         BS : citations
// 1.4.25         BS : affichage de miniature si possible
// 1.4.24         BS : possibilité de voir le message pour les non connectés/inscrits.
// 1.4.23         BlueSky
// 1.4.19         Twitter/X : ajout du nouveau logo.
// 1.4.18         Ajout d'un caractère par défaut si la zone de texte ne contient pas de texte.
// 1.4.17         Twitter : mise à jour des URL.
// 1.4.16         Twitter : mélange des medias (photo/gif/video).
// 1.4.15         Tentative de correction de la partie Twitter.
// 1.4.14         Correction YouTube.
// 1.4.13         Correction de l'analyse des URL.
// 1.4.12         Gestion des différentes certifications.
// 1.4.11         Correction dans les caractères spéciaux des textes Twitter.
// 1.4.10         Gestion du glisser/déposer de plusieurs fichiers.
// 1.4.9          Effacement des images, amélioration de la fenêtre
// 1.4.8          Compatibilité MacOS
// 1.4.7          test effacement des images
// 1.4.6          Erreur dans le collage des "card" twitter
// 1.4.4          Correction de l'affichage des emojis
// 1.4.3          la zone texte perdait le focus
// 1.4.2          fix possible pour firefox ?
// 1.4.1          reddit : passage au lecteur video.js
// 1.4            ajout de reddit.
// 1.3            fenêtre de visualisation de l'image avant collage.
// 1.2            on repart de la v1.

class Expr {
	#patt;
	
	constructor (str) {
		this.#patt = str;
		var reg = new RegExp (str);
	}
	
	exec (str) {
		return new RegExp (this.#patt).exec (str);
	}
	
	match (str) {
		return this.exec (str) != null;
	}
	
	get pattern() {
		return this.#patt;
	}
	
	static get twitter() {
		return new Expr ("^((https|http)://(mobile\\.)?(twitter|x)\\.com/\\w+/status/(?<id>\\d+)(\\?s=\\d+)?\\??.*)$");
	}
	
	static get mastodon() {
		return new Expr ("^(https://(?<instance>[a-z\\.]+)/@\\w+(@[a-z\\.]+)?/(?<tid>\\d+))$");
	}
	
	static get zippy() {
		return new Expr ("^(https://www41\\.zippyshare\\.com/downloadAudioHQ\\?key=\\w+)$");
	}
	
	static get reddit() {
		return new Expr ("^https://www\\.reddit\\.com/r/\\w+/comments/\\w+/[àáâãäåçèéêëìíîïðòóôõöùúûüýÿ\\w%]+/$");
	}
	
	static get bluesky() {
		return new Expr ("^(https://(?<instance>[\\w\\.]+)/profile/(?<id>[\\w\\.:-]+)/post/(?<hash>\\w+))$");
	}
}

class Widget {
	#list;
	#type;
	#data;
	
	constructor (type) {
		this.#type = type;
		this.element = document.createElement (type);
		this.#list = [];
		this.#data = {};
	}
	
	set (key, value) {
		this.element.setAttribute (key, value);
	}
	
	get (key) {
		return this.element.getAttribute (key);
	}
	
	setData (key, val) {
		this.#data[key] = val;
	}
	
	getData (key) {
		return this.#data[key];
	}
	
	get type() {
		return this.#type;
	}
	
	attach (widget) {
		var elmt = null;
		if (widget instanceof Widget)
			elmt = widget.element;
		else
			elmt = widget;
		elmt.parentElement.insertBefore (this.element, elmt);
	}
	
	destroy() {
		this.element.parentElement.removeChild (this.element);
	}
	
	connect (name, fct) {
		this.element.addEventListener (name, fct);
	}
	
	disconnect (name, fct) {
		this.element.removeEventListener (name, fct);
	}
	
	get children() { return this.#list; }
	
	add (widget) {
		for (var i = 0; i < this.#list.length; i++)
			if (this.#list[i] == widget)
				return false;
		this.element.appendChild (widget.element);
		this.#list.push (widget);
		return true;
	}
	
	remove (widget) {
		for (var i = 0; i < this.#list.length; i++)
			if (this.#list[i] == widget) {
				this.element.removeChild (widget.element);
				this.#list.splice (i, 1);
				return true;
			}
		return false;
	}
}

class Box extends Widget {
	constructor() {
		super ("div");
	}
	
	clear() {
		while (this.children.length > 0)
			this.remove (this.children[0]);
	}
}

class ScrolledWindow extends Widget {
	constructor() {
		super ("div");
		this.set ("style", "overflow-y : scroll; height : 150px; width : 200px");
	}
	
	get child() {
		return this.children[0];
	}
	
	set child (widget) {
		while (this.children.length > 0)
			this.remove (this.children[0]);
		this.add (widget);
	}
}

class Video extends Widget {
	#player;
	
	constructor() {
		super ("video");
		this.set ("class", "video-js");
	}
	
	get controls() { return this.element.hasAttribute ("controls"); }
	
	set controls (b) {
		if (b)
			this.set ("controls", "");
		else
			this.element.removeAttribute ("controls");
	}
	
	get id() {
		return this.element.getAttribute ("id");
	}
	
	set id (i) {
		this.set ("id", i);
		this.#player = videojs (i);
	}
	
	setSource (source, type) {
		this.#player.src ({
			type : type,
			src : source
		});
	}
}

class Picture extends Widget {
	constructor (source) {
		super ("img");
		this.set ("src", source);
	}
	
	get source() {
		return this.get ("src");
	}
	
	set source (src) {
		this.set ("src", src);
	}
	
	get height() {
		return this.get ("height");
	}
	
	set height (n) {
		this.set ("height", n);
	}
	
	get width() {
		return this.get ("width");
	}
	
	set width (n) {
		this.set ("width", n);
	}
	
	loaded (callback) {
		this.element.addEventListener ("load", e => {
			callback(e.target.width, e.target.height);
		});
	}
}

class Label extends Widget {
	constructor (lbl) {
		super("label");
		this.text = lbl;
	}
	
	get text() {
		return this.element.textContent;
	}
	
	set text (val) {
		this.element.textContent = val;
	}
	
	for (id) {
		this.set ("for", id);
	}
}

class Input extends Widget {
	constructor (type) {
		super ("input");
		this.set ("type", type);
	}
}

class TextButton extends Widget {
	constructor (txt) {
		super ("button");
		this.text = txt;
	}
	
	get text() {
		return this.element.textContent;
	}
	
	set text (txt) {
		this.element.textContent = txt;
	}
	
	clicked (callback) {
		this.element.addEventListener ("click", e => { callback (this); });
	}
}

class Button extends Widget {
	#img;
	#lbl;
	#ipt;
	
	constructor (title) {
		super ("span");
		
		this.#img = new Picture ("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEg0lEQVR42mKAgVFgYmLyxtjY+D+l2MzM7ApZDgBq/rtx48b/s2fPBhu0/uRNYjFY/fz58/9v3rwZQHo1wMiWBdE14rVtc2zbtm3btm0b0dqKs+HaCr7tX1unkq9pvZ5JclqvcAq3bjU+X9w1gZSUFAJgsGb1S8WAfFZWFmVnZxPsaPJhYGBwPz+3YbhZW1vfpEJgdXWVhoaGdkUAmdvc3BQCb7755gsMH/5cwk7Xubw/ME4ZGRmdtLKyOmxubn6Mfx9UIZCbm0s5OTl6ESibeU/kHRwcyMzMTD6bmJgctbOzO+Lm5nYuMDCQYmNjKT09nVJTUykyMpL4d2IC+1UIzM3NUV9fnxipXPpcEew9fMnV1ZVCQkIoPj6eMjIyxFlycrI4Dg8PJ39/f/Lw8LgEkeeMHFAhUFZWRsXFxUKgdP4TRXjbwIDy8vLEkZ+fHxxogAICExMT1NXVJQQKZz5SAhAAaRhWBHd3d80EGhoaqKqqSgjkTn2gBCAAHRUnzs7OZG9vTzY2NhfQdNyAh9npae6P0yiTWgI4Ae3t7UIga/xdRTAwNKTKykriY0WWlpYwDP2z3GS/8+f3+b2ZT0Q0v5syXmICJ1EytQQ6OjqosbFR38lH5eXlxBESekjbHGCZ+7QS6O7upqamJjE8+dG3inDJMRum4eFhmYS7JjAwMEBtbW1CIL5vWxEMmUBpaakQQBPrImBqaqqZQGtrK9XV1QmB6O5NRTAyNhYCxvze29uriEB+fr7mY9jT0yMEwjvWFQEESkpKJAMLCwt7I4DoLx3D4NYVRTBmx5gDyEBnZ+feCCCCwcFBIRDQtKQIJqamVFRUJBnY2NjYGwEcJ9QTBHzqFxTB1NSMCgsLJQPNzc06CfCFpZkAIri0kHjWzinCJQIcmdqFhB29wZjgIfQ9v//KU/GURgIFBQUEKCXgUTUlBKCDDFRXV19N4Hp20s+OT/j6+l6Ijo6moKAgcnFxwaWlQuBmKCKC6elprQRcC3vIwj2IR7AR3wOGvAOYEyJCBj744APRhT120MLpPo5TNTk5ifkizRoXFyf7wNUEbmc8y4o/6xi7UMIiQd7e3nLnJyQkIBrc93h2Sea/e++914zfT2BCrq2t0fz8PGaEnLC0tDToqCwkNzLuZDzCeFIdnnjiCU82ehJGYBSnBSnHluPj4wPnx6APO2+88UakhYXF0ZqaGsgJMOTQ4Ng5uSQg8LdeSysrfMCKFzGsEBGMYm5gGcU2xOQOX9VPKXwNy8itra0VOZwwLK0xMTG4ps+z/Iy+/xuOIVrUEnVFRDDKpbhUgj8vyfL1+xbfksfQeJmZmXAMOdRfokd5WOZpfdf2s9jx0Ei4/5FOGIZRW1vb02y0awfhLW7CE1hKsa4FBweTk5PTRTjnbAZBRt8SfMab7zk0HjKBpRPp5A0IRg+9+uqr914t/9JLL93CpJvQN6x7nN+xpHyD7IjALgg8wjjItT3t5eVFnp6exDv+Kfymw+j13JT/TwrYYuLAJklqNIgALZwJxLeA+DyQ3wisA4QYhjIAACqkfZkBRe3AAAAAAElFTkSuQmCC");
		this.#img.set ("title", title);
		this.#img.set ("height", 20);
		this.#img.set ("class", "hfr-cc-button");
		this.#img.set ("style", "vertical-align : middle");
		
		this.#lbl = new Label ("");
		this.#lbl.add (this.#img);
		
		this.#ipt = new Input ("file");
		this.#ipt.set ("multiple", true);
		this.#ipt.set ("accept", "image/png,image/jpeg,image/bmp,image/gif,audio/*");
		this.#ipt.set ("style", "display : none");
		
		this.add (this.#lbl);
		this.add (this.#ipt);
	}
	
	for (id, area_id) {
		this.#lbl.for (id);
		this.#ipt.set ("id", id);
		this.#ipt.set ("data-textarea", area_id);
	}
	
	get image() { return this.#img; }
	
	changed (callback) {
		this.#ipt.connect ("change", evt => {
			var arr = [];
			for (var file of evt.target.files)
				arr.push (file);
			callback (arr); 
		});
	}
}

class Loading extends Picture {
	constructor() {
		super ("data:image/png;base64,R0lGODdhEAAQAHcAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgAAACwAAAAAEAAQAMIAAAAAAABmZmbMzMyZmZkAAAAAAAAAAAADIwi63EzEjeGAECAEMCvrXiiOH7WAZKoq2niVFSSZ68xRaK0nACH5BAkKAAAALAMAAwAKAAoAwgAAAGZmZpmZmQAAAMzMzAAAAAAAAAAAAAMcCAoRq4SAOCV9FQjxxsCgxjWAFz4XaklLCrFKAgAh+QQJCgAAACwDAAMACgAKAMIAAACZmZnMzMxmZmYAAAAAAAAAAAAAAAADGwgKEatCgDglfYCQ+sbAINcAXvhcj8YtKCQtCQAh+QQJCgAAACwDAAMACgAKAMIAAADMzMyZmZlmZmYAAAAAAAAAAAAAAAADGggKEauNOULkU2PYJcT9VtSBT3Rlm0JdppIAACH5BAkKAAAALAMAAwAKAAoAwgAAAMzMzJmZmWZmZgAAAAAAAAAAAAAAAAMbCAoRqw0QAsZg7gEh8ItaGI1ZuIAP5y2WNj0JACH5BAkKAAAALAMAAwAKAAoAwgAAAMzMzAAAAJmZmWZmZgAAAAAAAAAAAAMaCAoRq0IAQsAYzL3MV9sg932hpz1f9Fwb9SQAIfkECQoAAAAsAwADAAoACgDCAAAAzMzMAAAAZmZmmZmZAAAAAAAAAAAAAxoIChGrYwBCmBPiqWYf1yAnOuCDhU7kkQv1JAAh+QQJCgAAACwDAAMACgAKAMIAAADMzMwAAABmZmaZmZkAAAAAAAAAAAADGggKEauEMNfAGE9VIV7NIDeN4HOBVeQ565MAADs=");
	}
}

class Dialog extends Widget {
	#cnt;
	#ptit;
	#box;
	#span;
	#cbs;
	
	constructor () {
		super ("div");
		this.#cbs = [];
		var style = document.createElement ("style");
		style.textContent = `.modal {
			  display: none; /* Hidden by default */
			  position: fixed; /* Stay in place */
			  z-index: 1; /* Sit on top */
			  padding-top: 100px; /* Location of the box */
			  left: 0;
			  top: 0;
			  width: 100%; /* Full width */
			  height: 100%; /* Full height */
			  overflow: auto; /* Enable scroll if needed */
			  background-color: rgb(0,0,0); /* Fallback color */
			  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
			  text-align : center;
			}
			
			.modal-content {
			  background-color: #fefefe;
			  margin: auto;
			  padding: 20px;
			  border: 1px solid #888;
			  width: auto;
			  display: inline-block;
			  text-align : center;
			}

			.close {
			  color: #aaaaaa;
			  float: right;
			  font-size: 28px;
			  font-weight: bold;
			}

			.close:hover,
			.close:focus {
			  color: #000;
			  text-decoration: none;
			  cursor: pointer;
			}`;
		document.head.appendChild (style);
		
		this.set ("class", "modal");
		
		var div = document.createElement ("div");
		div.setAttribute ("class", "modal-content");
		this.#span = document.createElement ("span");
		this.#span.setAttribute ("class", "close");
		var i = document.createElement ("img");
		i.setAttribute ("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAb1BMVEUAAAAaGhobGxsaGhoaGhobGxsZGRkbGxsaGhoaGhobGxsbGxsbGxsaGhoaGhoZGRkaGhocHBxSUlIaGhpTU1MaGhoaGhoaGhobGxsaGhpMTExJSUm5ubmvr6+urq63t7e2tra0tLSysrKxsbH+/v6zSTvuAAAAJHRSTlMAHSYnbXCChomKjo+QkpOXm5ubn5+kp6issLK1zc7Q0NHT1ddW0iqYAAAAcklEQVR42o3IVQLDIBCE4bi7ewLM/c/Y7VSe+dH9HJvcIPoWuIQw/hcSkjTt0pRXQsiyAUeWHRiyjFBV1Y1btnwItXQCz/slNNIFqFZeQt/3Glq2fAjjuMGMo8E2joRpnvd55jURiuVfTvCr9VvpORa9APAYCpORESOKAAAAAElFTkSuQmCC");
		this.#span.appendChild (i);
		div.appendChild (this.#span);
		
		this.#ptit = new Widget ("p");
		this.#ptit.set ("class", "title");
		div.appendChild (this.#ptit.element);
		
		div.appendChild (document.createElement ("br"));
		
		this.#cnt = new Widget ("div");
		div.appendChild (this.#cnt.element);
		
		div.appendChild (document.createElement ("br"));
		
		this.#box = new Widget ("div");
		div.appendChild (this.#box.element);
		
		this.element.appendChild (div);
		document.body.appendChild (this.element);
	}
	
	get title() {
		return this.#ptit.element.textContent;
	}
	
	set title (text) {
		this.#ptit.element.textContent = text;
	}
	
	get content() {
		return this.#cnt.children[0];
	}
	
	set content (widget) {
		if (this.#cnt.children.length > 0)
			this.#cnt.remove (this.#cnt.children[0]);
		this.#cnt.add (widget);
	}
	
	addButton (button) {
		this.#box.add (button);
	}
	
	display() {
		this.element.style.display = "block";
		for (var i = 0; i < this.#cbs.length; i++)
			this.#cbs[i](this);
	}
	
	hide() {
		this.element.style.display = "none";
	}
	
	get displayed() { return this.element.style.display == "block"; }
	
	shown (cb) {
		this.#cbs.push (cb);
	}
	
	closed (cb) {
		this.#span.addEventListener ("click", (e) => {
			cb (this);
		});
		window.addEventListener ("click", (e) => {
			if (e.target == this.element)
				cb (this);
		});
	}
}

class Builder {
	#txt
	
	constructor (init) {
		this.#txt = "";
		if (typeof (init) === "string")
			this.#txt = init;
	}
	
	append (str) {
		if (typeof (str) !== "string")
			return false;
		this.#txt += str;
		return true;
	}
	
	prepend (str) {
		if (typeof (str) !== "string")
			return false;
		this.#txt = str + this.#txt;
		return true;
	}
	
	toString() {
		return this.#txt;
	}
}

class BuilderAsync {
	#table
	
	constructor () {
		this.#table = [];
	}
	
	append (action) {
		if (typeof (action) == "string")
			this.#table.push (Promise.resolve (action));
		else
			this.#table.push (action);
	}
	
	toString() {
		return Promise.all(this.#table)
	}
}

class SkeetProfile {
	#did
	#handle;
	#name;

	constructor (d, h, n) {
		this.#did = d;
		this.#handle = h;
		this.#name = Utils.normalizeText (n);
	}

	get did() { return this.#did; }

	get name() { return this.#name; }

	get handle() { return this.#handle; }

	toString() {
		return `${this.#name} (${this.#handle})`;
	}

	static fetch (str) {
		var prout = 0;
		console.log ("prout " + prout++);
		return new Promise ((resolve, reject) => {
			var url = "https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=" + str;
			console.log (url);
			Utils.request({
				method : "GET",
				url : url,
				onabort : function() { reject (str); },
				onerror : function() { reject (str); },
				ontimeout : function() { reject (str); },
				headers : { "Cookie" : "" },
				anonymous : true,
				onload : function (response) {
					console.log ("prout " + prout++);
					try {
						var json = JSON.parse (response.responseText);
						var prf = new SkeetProfile (json.did, json.handle, json.displayName);
						resolve (prf);
					}
					catch (e) {
						console.log (e);
						reject (str);
					}
				}
			});
		});
	}
}

class Skeet {
	#uri
	#quote
	#txt
	#pfl

	constructor (lnk) {
		this.#uri = lnk;
	}

	set uri (lnk) { this.#uri = lnk; }
	get uri() { return this.#uri; }
	
	set subquote (q) { this.#quote = q; }
	get subquote() { return this.#quote; }
	
	set text (str) { this.#txt = str; }
	get text() { return this.#txt; }

	set profile (p) { this.#pfl = p; }
	get profile() { return this.#pfl; }

	toString() {
		return new Promise ((resolve, reject) => {
			var pms = [];
			if (this.#quote != null)
				pms.push (this.#quote);
			pms.push (Promise.resolve ("[:teepodavignon:8][citation=1,1,1][nom][url=" + this.#uri + "][img]https://rehost.diberie.com/Picture/Get/f/327943[/img] "));
			pms.push (Promise.resolve (this.#pfl.toString()));
			pms.push (Promise.resolve ("[/url][/nom]" + this.#txt + "[/citation]"));
			Promise.all (pms).then (values => {
				resolve (values.join(""));
			}).catch (e => {
				console.log (e);
				reject (this.#uri);
			});
		});
	}
}

class Quote {
	#name
	#uri
	#quote
	#txt
	
	constructor (link) { this.#uri = link; }
	
	set uri (str) { this.#uri = str; }
	get uri() { return this.#uri; }
	
	set author (str) { this.#name = str; }
	get author() { return this.#name; }
	
	set subquote (q) { this.#quote = q; }
	get subquote() { return this.#quote; }
	
	set text (str) { this.#txt = str; }
	get text() { return this.#txt; }
	
	toString() {
		return new Promise ((resolve, reject) => {
			var pms = [
				Promise.resolve ("[citation=1,1,1][nom][url=" + this.#uri + "][img]https://rehost.diberie.com/Picture/Get/f/327943[/img] " + this.#name + "[/url][/nom]" + this.#txt)
			];
			if (Quote.isQuote (this.#quote))
				pms.push (this.#quote.toString());
			pms.push (Promise.resolve ("[/citation]"));
			Promise.all (pms).then (values => {
				resolve (values.join(""));
			}).catch (e => {
				console.log (e);
				reject (this.#uri);
			});
		});
	}
	
	static isQuote (obj) {
		if (typeof (obj) != "object")
			return false;
		return obj.hasOwnProperty ("uri") && obj.hasOwnProperty ("author");
	}
}

class UploadService {
	isInvalid (file) {
		return file.size > 20000000;
	}
	
	static getService (service) {
		if (service == "rehost")
			return new Rehost();
		return new Imgur();
	}
}

class Rehost extends UploadService {
	upload (file, resolve, reject) {
		var form = new FormData();
		form.append ("image", file);
		Utils.request ({
			method : "POST",
			data : form,
			url : "https://rehost.diberie.com/Host/UploadFiles?SelectedAlbumId=undefined&PrivateMode=false&SendMail=false&KeepTags=&Comment=&SelectedExpiryType=0",
			onabort : function() { reject ("envoi annulé"); }, 
			ontimeout : function() { reject ("délai dépassé"); },
			onerror : function (response) {
				reject ("erreur lors de l'envoi d'image");
			},
			onload : function (response) {
				var object = JSON.parse (response.responseText);
				var res = {
					gif : object.isGIF == true ? true : false,
					url : object.picURL,
					images : [{
						url : object.picURL,
						id : "image"
					}]
				};
				if (!res.gif) {
					res.images.push ({
						id : "réduite",
						url : object.resizedURL
					});
					res.images.push ({
						id : "miniature",
						url : object.thumbURL
					});
					res.thumb = object.thumbURL;
				}
				resolve (res);
			}
		});
	}
}

class Imgur extends UploadService {
	upload (file, resolve, reject) {
		var form = new FormData();
		form.append ("image", file);
		Utils.request ({
			method : "POST",
			data : form,
			headers : {		
				"Authorization" : "Client-ID d1619618d2ac442"
			},
			url : "https://api.imgur.com/3/image",
			onabort : function() { reject ("envoi annulé"); }, 
			ontimeout : function() { reject ("délai dépassé"); },
			onerror : function (response) {
				reject ("erreur lors de l'envoi d'image");
			},
			onload : function (response) {
				var object = JSON.parse (response.responseText);
				console.log (object);
				if (!object.success)
					reject (object);
				var res = {
					hash : object.data.deletehash,
					delete : function (callback) {
						Utils.request ({
							method : "DELETE",
							headers : {		
								"Authorization" : "Client-ID d1619618d2ac442"
							},
							url : "https://api.imgur.com/3/image/" + this.hash,
							onerror : function (response) {
								console.log (response);
							},
							onload : function (response) {
								var result = JSON.parse (response.responseText);
								if (result.success) {
									callback();
								}
							}
						});
					},
					gif : object.data.type == "image/gif",
					url : object.data.link,
					images : [{
						url : object.data.link,
						id : "image"
					}]
				};
				if (!res.gif) {
					res.images.push ({
						id : "petit carré",
						url : object.data.link.replace (object.data.id, object.data.id + "s")
					});
					res.images.push ({
						id : "grand carré",
						url : object.data.link.replace (object.data.id, object.data.id + "b")
					});
					res.images.push ({
						id : "petite miniature",
						url : object.data.link.replace (object.data.id, object.data.id + "t")
					});
					res.images.push ({
						id : "moyenne miniature",
						url : object.data.link.replace (object.data.id, object.data.id + "m")
					});
					res.images.push ({
						id : "large miniature",
						url : object.data.link.replace (object.data.id, object.data.id + "l")
					});
					res.images.push ({
						id : "grosse miniature",
						url : object.data.link.replace (object.data.id, object.data.id + "h")
					});
					res.thumb = object.data.link.replace (object.data.id, object.data.id + "l");
				}
				resolve (res);
			}
		});
	}
}

class Utils {
	static #oit;
	static #table_;
	static #hdialog;
	
	static set unicodeTable (table) {
		Utils.#table_ = table;
	}
	
	static get unicodeTable() {
		return Utils.#table_;
	}
	
	static set hashDialog (dialog) { Utils.#hdialog = dialog; }
	
	static get hashDialog() { return Utils.#hdialog; }
	
	static isMac() {
		const userAgent = window.navigator.userAgent;
		const platform = window.navigator?.userAgentData?.platform || window.navigator.platform;
	}
	
	static addCss (url) {
		var head = document.getElementsByTagName('head')[0];
		if (!head) { return; }
		var link = document.createElement ("link");
		link.setAttribute ("rel", "stylesheet");
		link.setAttribute ("href", url);
		head.appendChild (link);
	}
	
	static addJs (url) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement ("script");
		script.setAttribute ("src", url);
		head.appendChild (script);
	}
	
	static processFiles (area, files) {
		if (files == null || files.length == 0)
			return;
		Utils.processFile (area, files[0]).then (() => {
			files.shift();
			Utils.processFiles (area, files);
		}).catch (e => { console.log (e); });
	}
	
	static processFile (area, file) {
		return new Promise ((resolve, reject) => {
			var loading = new Loading();
			loading.attach (area);
			if (file.type.indexOf ("audio/") == 0) {
				area.disabled = true;
				Utils.dropGofile (item).then (url => {
					Utils.insertText (area, "[url]" + url + "[/url]");
					loading.destroy();
					area.disabled = false;
					resolve();
				}).catch (e => {
					loading.destroy();
					area.disabled = false;
					reject (e);
				});
			}
			else if (file.type.indexOf ("image/") == 0) {
				area.disabled = true;
				Utils.dropImage (file).then (upload => {
					var src = upload.url;
					if (!upload.gif)
						src = upload.thumb;
					Utils.insertText (area, "[url=" + upload.url + "][img]" + src + "[/img][/url]");
					loading.destroy();
					area.disabled = false;
					resolve();
				}).catch (e => {
					loading.destroy();
					area.disabled = false;
					reject (e);
				});
			}
		});
	}
	
	static addButtonToTextarea (event) {
		var num = -1;
		if (event.target.id.indexOf ("rep_editin_") == 0) {
			num = parseInt(event.target.id.split ("rep_editin_")[1]);
		}
		var file_id = "hfr-cc-file" + (num == -1 ? "" : "-" + num);
		var form = event.target.form;
		if (form == null)
			form = event.target.parentElement;
		var btn = form.querySelector("input[type=\"button\"], input[type=\"submit\"]");
		if (btn.parentElement.querySelector (".hfr-cc-button"))
			return;
		var button = new Button ("Sélectionnez une image");
		button.for (file_id, event.target.id);
		button.changed (files => {
			Utils.processFiles (event.target, files);
		});
		button.attach (btn);
	}
	
	static isGM4() {
		return typeof (GM) === "object" && typeof (GM.info) === "object" && GM.info.scriptHandler == "Greasemonkey" && parseFloat(GM.info.version) >= 4;
	}
	
	static insertText (textarea, text) {
		var start = textarea.selectionStart;
		var end = textarea.selectionEnd;
		textarea.value = textarea.value.substr (0, start) + text + textarea.value.substr (end);
		textarea.setSelectionRange (start + text.length, start + text.length);
	}
	
	static request (object) {
		if (Utils.isGM4())
			return GM.xmlHttpRequest (object);
		else
			return GM_xmlhttpRequest (object);
	}
	
	static setValue (key, data) {
		if (!Utils.isGM4()) {
			GM_setValue (key, data);
			return;
		}
		if (typeof (data) === "object")
			localStorage.setItem (GM.info.script.name + " :: " + key, JSON.stringify (data));
		else
			localStorage.setItem (GM.info.script.name + " :: " + key, data);
	}
	
	static getValue (key, default_value) {
		if (!Utils.isGM4())
			return GM_getValue (key, default_value);
		var rk = GM.info.script.name + " :: " + key;
		if (!localStorage.hasOwnProperty (rk))
			return default_value;
		var data = localStorage.getItem (rk);
		try {
			var obj = JSON.parse (data);
			return obj;
		}
		catch(e) {}
		return data;	
	}
	
	static registerCommand (title, callback) {
		if (Utils.isGM4())
			GM.registerMenuCommand (title, callback);
		else
			GM_registerMenuCommand (title, callback);
	}
	
	static init (callback) {
		var data = null;
		try {
			var json = localStorage.getItem ("hfr-cc-data");
			data = JSON.parse (json);
		}
		catch {}
		if (!(data instanceof Object))
			data = {};
		// mise à jour si vieille version Unicode
		if (!(data.unicode_table instanceof Array) || !data.hasOwnProperty ("version") || Number(data.version) === data.version && data.version < 15.1) {
			Utils.request({
				method : "GET",
				responseType : "json",
				url : "https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/emojis-data.json",
				onload : function (response) {
					localStorage.setItem ("hfr-cc-data", JSON.stringify (response.response));
					callback (response.response.unicode_table);
				}
			});
		}
		else
			callback (data.unicode_table);
	}
	
	static isFormattable (text) {
		var array = Array.from (text);
		var uarray = [];
		for (var i = 0; i < array.length; i++) {
			uarray.push (array[i].codePointAt (0).toString (16));
		}
		var tmp = uarray.join ("-");
		var found = false;
		for (var i = 0; i < Utils.unicodeTable.length; i++) {
			if (tmp.indexOf (Utils.unicodeTable[i]) > -1) {
				found = true;
				break;
			}
		}
		return found;
	}
	
	static normalizeText (str) {
		var strn = str.normalize ("NFKD");
		var arr = [...strn];
		var res_arr = [];
		for (var i = 0; i < arr.length; i++) {
			var code = arr[i].codePointAt (0);
			if (code >= 127312 && code <= 127363)
				code -= 127247;
			else if (code >= 9398 && code <= 9449)
				code -= 9333;
			else if (code >= 127248 && code <= 127273)
				code -= 127183;
			else if (code >= 9372 && code <= 9397)
				code -= 9307;
			else if (code >= 127462 && code <= 127487)
				code -= 127397;
			else if (code >= 120406 && code <= 120457)
				code -= 120335;
			res_arr.push (String.fromCodePoint (code));
		}
		return res_arr.join("");
	}
	
	static feofConvert (code) {
		var fe0f = code.lastIndexOf ("-fe0f") + 5 == code.length;
		for (var i = 0; i < Utils.unicodeTable.length; i++) {
			if (Utils.unicodeTable[i] == code)
				return code;
			if (!fe0f && Utils.unicodeTable[i] == (code + "-fe0f"))
				return code + "-fe0f";
		}
		return code;
	}
	
	static formatText (text) {
		if (!Utils.isFormattable (text))
			return text;
		var array = Array.from (text);
		var uarray = [];
		for (var i = 0; i < array.length; i++) {
			uarray.push (array[i].codePointAt (0).toString (16));
		}
		var tmp = uarray.join ("-");
		var result = ""; 
		while (tmp.length > 0) {
			var found = false;
			for (var i = 0; i < Utils.unicodeTable.length; i++) {
				if (tmp.indexOf (Utils.unicodeTable[i]) == 0) {
					result  = result + "[img]https://github.com/BZHDeveloper1986/hfr/blob/main/emojis-micro/" + Utils.feofConvert (Utils.unicodeTable[i]) + ".png?raw=true[/img]";
					tmp = tmp.substring (1 + Utils.unicodeTable[i].length);
					found = true;
					break;
				}
			}
			if (!found) {
				var code_str = tmp.substring (0, (tmp.indexOf ("-") < 0 ? tmp.length : tmp.indexOf ("-")));
				tmp = (tmp.indexOf ("-") < 0 ? "" : tmp.substring (1 + tmp.indexOf ("-")));
				var code = parseInt ("0x" + code_str);
				result += String.fromCodePoint (code);
			}
		}
		return result;
	}
	
	static tweetVideoUrl (info) {
		var list = [];
		for (var i = 0; i < info.variants.length; i++) {
			var v = info.variants[i];
			if (info.variants[i].content_type == "application/x-mpegURL")
				v.bitrate = 0;
			list.push (info.variants[i]);
		}
		list.sort ((a,b) => { return b.bitrate - a.bitrate; });
		if (list.length > 0)
			return list[0];
		return { url : "" };
	}
	
	static tweetToQuote (tweet) {
		var builder = new Builder();
		var obj = {
			"Government" : "[img]https://i.imgur.com/AYsrHeC.png[/img]",
			"Business" : "[img]https://i.imgur.com/6C4thzC.png[/img]"
		};
		builder.append ("[:teepodavignon:8][citation=1,1,1][nom][url=https://x.com/i/status/" + tweet.id_str + "][:salami dubongout:4] " + Utils.normalizeText (Utils.formatText (tweet.user.name)));
		if (tweet.user.verified_type == "Government" || tweet.user.verified_type == "Business")
			builder.append (" " + obj[tweet.user.verified_type]);
		else if (tweet.user.is_blue_verified || tweet.user.verified)
			builder.append (" [:yoann riou:9]");
		builder.append (" (@" + tweet.user.screen_name + ")[/url][/nom]");
		var array = [...(tweet.text)];
		for (var i = 0; i < array.length; i++) {
			var _mention = null, _hashtag = null, _url = null, _media = null;
			if (tweet.entities.user_mentions)
				for (var mention of tweet.entities.user_mentions)
					if (mention.indices[0] == i) {
						_mention = mention;
						break;
					}
			if (tweet.entities.hashtags)
				for (var hashtag of tweet.entities.hashtags)
					if (hashtag.indices[0] == i) {
						_hashtag = hashtag;
						break;
					}
			if (tweet.entities.urls)
				for (var url of tweet.entities.urls)
					if (url.indices[0] == i) {
						_url = url;
						break;
					}
			if (tweet.entities.media)
				for (var media of tweet.entities.media)
					if (media.indices[0] == i) {
						_media = media;
						break;
					}
			if (_mention) {
				builder.append ("[url=https://x.com/" + _mention.screen_name + "][b]@" + _mention.screen_name + "[/b][/url]");
				i += _mention.indices[1] - _mention.indices[0] - 1;
			}
			else if (_hashtag) {
				builder.append ("[url=https://x.com/hashtag/" + _hashtag.text + "][b]#" + _hashtag.text + "[/b][/url]");
				i += _hashtag.indices[1] - _hashtag.indices[0] - 1;
			}
			else if (_url) {
				builder.append ("[url=" + _url.expanded_url + "][b]" + _url.display_url + "[/b][/url]");
				i += _url.indices[1] - _url.indices[0] - 1;
			}
			else if (_media) {
				i += _media.indices[1] - _media.indices[0] - 1;
			}
			else 
				builder.append (array[i]);
		}
		if (tweet.mediaDetails && tweet.mediaDetails.length > 0) {
			builder.append ("\n");
			for (var i = 0; i < tweet.mediaDetails.length; i++) {
				var md = tweet.mediaDetails[i];
				if (md.type == "video") {
					var v = Utils.tweetVideoUrl (md.video_info);
					var url_data = (v.url == "") ? "" : "&hfr-url-data=" + encodeURIComponent (v.url) + "&hfr-media-type=" + encodeURIComponent (v.content_type);
					builder.append ("[url=https://x.com/i/status/" + tweet.id_str + "][img]https://rehost.diberie.com/Rehost?size=min&url=" + md.media_url_https + url_data + "[/img][/url]\n");
				}
				else if (md.type == "animated_gif") {
					var video_src = md.video_info.variants[0].url;
					var url_data = "&gif=true&hfr-url-data=" + encodeURIComponent (video_src);
					builder.append ("[url=https://x.com/i/status/" + tweet.id_str + "][img]https://rehost.diberie.com/Rehost?size=min&url=" + md.media_url_https + url_data + "[/img][/url]\n");
				}
				else if (md.type == "photo")
					builder.append ("[url=https://rehost.diberie.com/Rehost?url=" + md.media_url_https + "][img]https://rehost.diberie.com/Rehost?size=min&url=" + md.media_url_https + "[/img][/url]");
			}
		}
		/*
		else if (tweet.video) {
			builder.append ("\n");
			var video_src = "";
			for (var i = 0; i < tweet.video.variants.length; i++)
				if (tweet.video.variants[i].type == "video/mp4")
					video_src = tweet.video.variants[i].src;
			var url_data = (video_src == "") ? "" : "&hfr-url-data=" + encodeURIComponent (video_src);
			url_data += (tweet.video.contentType == "gif") ? "&gif=true" : "";
			builder.append ("[url=https://x.com/i/status/" + tweet.id_str + "][img]https://rehost.diberie.com/Rehost?size=min&url=" + tweet.video.poster + url_data + "[/img][/url]");
		}
		else if (tweet.photos) {
			builder.append ("\n");
			for (var photo of tweet.photos) {
				builder.append ("[url=https://rehost.diberie.com/Rehost?url=" + photo.url + "][img]https://rehost.diberie.com/Rehost?size=min&url=" + photo.url + "[/img][/url]");
			}
		}
		*/
		else if (tweet.card) {
			var regex = /^poll(?<count>\d)choice_text_only$/;
			var res = regex.exec (tweet.card.name);
			if (res) {
				builder.append ("\n");
				var count = parseInt (res.groups.count);
				var arr = [];
				var total = 0;
				for (var i = 1; i < count + 1; i++) {
					var obj = {};
					obj.label = tweet.card.binding_values["choice" + i + "_label"].string_value;
					obj.count = parseInt (tweet.card.binding_values["choice" + i + "_count"].string_value);
					total += obj.count;
					arr.push (obj);
				}
				for (var i = 0; i < arr.length; i++) {
					arr[i].pct = (arr[i].count * 100 / total).toFixed(2) + " %";
					builder.append ("[*] " + arr[i].label + " (" + arr[i].pct + ")\n");
				}
			}
			else if (tweet.card.name == "summary_large_image") {
				builder.append ("\n");
				builder.append ("[url=" + tweet.card.url + "][img]" + tweet.card.binding_values.thumbnail_image.image_value.url + "[/img][/url]");
				builder.append ("[quote]" + tweet.card.binding_values.title.string_value + "[/quote]");
			}
		}
		builder.append ("[/citation]");		
		
		if (tweet.quoted_tweet) {
			builder.prepend ("\n");
			builder.prepend (Utils.tweetToQuote (tweet.quoted_tweet));
		}
		return Utils.normalizeText (Utils.formatText (builder.toString()));
	}
	
	static pasteTwitter (link) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var res = Expr.twitter.exec (link);
				Utils.request({
					method : "GET",
					url : "https://cdn.syndication.twimg.com/tweet-result?token=43l77nyjhwo&id=" + res.groups.id,
					onabort : function() { reject (link); },
					onerror : function() { reject (link); },
					ontimeout : function() { reject (link); },
					onload : function (response) {
						try {
							var json = JSON.parse (response.responseText);
							resolve (Utils.tweetToQuote (json));
						}
						catch (e) {
							console.log (e);
							reject (link);
						}
					}
				});
			})();
		});
	}
	
	static jsonToPouet (json, uri) {
		return new Promise ((resolve, reject) => {
			try {
				var builder = new Builder();
				var data = JSON.parse (json);
				var doc = new DOMParser().parseFromString (data.content, "text/html");
				var id = data.account.acct;
				var instance = new URL (data.account.url).host;
				var name = Utils.formatText (data.account.display_name);
				builder.append (`[:teepodavignon:8][citation=1,1,1][nom][url=${uri}][img]https://rehost.diberie.com/Picture/Get/f/110911[/img] ${name} (@${id}@${instance})[/url][/nom]`);
				var p = doc.querySelector ("p");
				while (p != null) {
					var c = p.firstChild;
					while (c != null) {
						if (c.nodeType == 3) {
							var text = Utils.formatText (c.textContent);
							builder.append (text);
						}
						else if (c.nodeType == 1) {
							if (c.nodeName.toLowerCase() == "br")
								builder.append ("\n");
							else if (c.classList.contains ("h-card") && c.querySelector (".u-url.mention") != null) {
								var a = c.querySelector ("a");
								var id = a.textContent;
								var lnk = a.getAttribute ("href");
								builder.append (`[b][url=${lnk}]${id}[/url][/b]`);
							}
							else if (c.classList.contains ("hashtag")) {
								var tag = c.querySelector ("span").textContent;
								var lnk = c.getAttribute ("href");
								builder.append (`[b][url=${lnk}]#${tag}[/url][/b]`);
							}
							else if (c.nodeName.toLowerCase() == "a") {
								var lnk = c.getAttribute ("href");
								builder.append (`[b][url]${lnk}[/url][/b]`);
							}
						}
						c = c.nextSibling;
					}
					builder.append ("\n");
					p = p.nextElementSibling;
				}
				if (data.poll != null)
					data.poll.options.forEach (opt => {
						var tit = opt.title;
						var pct = opt.votes_count * 100 / data.poll.votes_count;
						builder.append (`[*] ${tit} : ${pct} %\n`);
					});
				else if (data.media_attachments != null)
					data.media_attachments.forEach (media => {
						if (media.type == "image")
							builder.append (`[url=${media.url}][img]${media.preview_url}[/img][/url]`);
						else if (media.type == "gifv") {
							var src = media.url + "?hfr-url-type=mastodon-gif";
							var preview = media.preview_url;
							builder.append (`[url=${src}][img]https://rehost.diberie.com/Rehost?size=min&url=${preview}[/img][/url]`);
						}
						else if (media.type == "video") {
							var src = media.url + "?hfr-url-type=mastodon";
							var preview = media.preview_url;
							builder.append (`[url=${src}][img]https://rehost.diberie.com/Rehost?size=min&url=${preview}[/img][/url]`);
						}
					});
				builder.append (`[/citation]`);
				resolve (builder.toString());
			}
			catch (e) {
				console.log (e);
				reject (uri);
			}
		});
	}
	
	static pasteMastodon (link) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var res = Expr.mastodon.exec (link);
				var tid = res.groups.tid;
				var instance = res.groups.instance;
				var url = `https://${instance}/api/v1/statuses/${tid}`;
				Utils.request({
					method : "GET",
					url : url,
					onabort : function() { reject (link); },
					onerror : function() { reject (link); },
					ontimeout : function() { reject (link); },
					headers : { "Cookie" : "" },
					anonymous : true,
					onload : function (response) {
						Utils.jsonToPouet (response.responseText, link).then (text => {
							resolve (text);
						}).catch (err => {
							console.log (err);
							reject (link);
						});
					}
				});
			})();
		});
	}
	
	static jsonToSkeet (data, profile, link, sub) {
		console.log (data);
		var did_plc = data.uri.split ("at://")[1].split ("/")[0];
		var quote = new Skeet (link);
		quote.profile = profile;
		var text = data.value.text;
		var arr = new TextEncoder().encode (text);
		if (data.value.facets)
			for (var i = data.value.facets.length - 1; i >= 0; i--) {
				var facet = data.value.facets[i];
				if (facet.features[0]["$type"] == "app.bsky.richtext.facet#mention") {
					var mid = facet.features[0].did;
					var mh = new TextDecoder().decode (arr.slice (facet.index.byteStart, facet.index.byteEnd));
					var mention = `[url=https://bsky.app/profile/${mid}][b]${mh}[/b][/url]`;
					arr = new TextEncoder().encode (new TextDecoder().decode (arr.slice (0, facet.index.byteStart)) + mention + new TextDecoder().decode (arr.slice (facet.index.byteEnd)));
				}
				else if (facet.features[0]["$type"] == "app.bsky.richtext.facet#link") {
					var txt = new TextDecoder().decode (arr.slice (facet.index.byteStart, facet.index.byteEnd));
					var url = `[url=${facet.features[0].uri}][b]${txt}[/b][/url]`;
					arr = new TextEncoder().encode (new TextDecoder().decode (arr.slice (0, facet.index.byteStart)) + url + new TextDecoder().decode (arr.slice (facet.index.byteEnd)));
				}
			}
		text = new TextDecoder().decode (arr);
		if (data.value.embed) {
			text += "\n";
			if (data.value.embed.images) {
				var imgs = data.value.embed.images;
				for (var i = 0; i < imgs.length; i++) {
					var lnk = imgs[i].image.ref["$link"];
					text += `[url=https://cdn.bsky.app/img/feed_thumbnail/plain/${did_plc}/${lnk}][img]https://rehost.diberie.com/Rehost?size=min&url=https://cdn.bsky.app/img/feed_thumbnail/plain/${did_plc}/${lnk}[/img][/url]`;
				}
			}
			if (data.value.embed.video) {
				var lnk = data.value.embed.video.ref["$link"];
				var url = `https://video.bsky.app/watch/${did_plc}/${lnk}`;
				var url_data = "?vdata=" + encodeURIComponent (url + "/playlist.m3u8");
				text += `[url=${link}][img]${url}/thumbnail.jpg${url_data}[/img][/url]`;
			}
			if (data.value.embed.external && (data.value.embed.images == null || data.value.embed.images.length == 0)) {
				var lnk = data.value.embed.external.uri;
				var img = "";
				var u = new URL(lnk);
				if (u.pathname.substring (u.pathname.lastIndexOf (".")) == ".gif")
					img = `[url=${lnk}][img]${lnk}[/img][/url]`;
				else if (data.value.embed.external.thumb)
					img = `[url=${lnk}][img]https://rehost.diberie.com/Rehost?size=min&url=https://cdn.bsky.app/img/feed_thumbnail/plain/${did_plc}/${data.value.embed.external.thumb.ref["$link"]}[/img][/url]`;
				var qte = data.value.embed.external.title + ((data.value.embed.external.description != null) ? (" - " + data.value.embed.external.description) : "");
				text += `[url=${lnk}][b]${lnk}[/b][/url]\n${img}[quote]${qte}[/quote]`;
			}
			if (data.value.embed.media) {
				var med = data.value.embed.media;
				if (med.images) {
					var imgs = med.images;
					for (var i = 0; i < imgs.length; i++) {
						var lnk = imgs[i].image.ref["$link"];
						text += `[url=https://cdn.bsky.app/img/feed_thumbnail/plain/${did_plc}/${lnk}][img]https://rehost.diberie.com/Rehost?size=min&url=https://cdn.bsky.app/img/feed_thumbnail/plain/${did_plc}/${lnk}[/img][/url]`;
					}
				}
				if (med.video) {
					var lnk = med.video.ref["$link"];
					var url = `https://video.bsky.app/watch/${did_plc}/${lnk}`;
					var url_data = "?vdata=" + encodeURIComponent (url + "/playlist.m3u8");
					text += `[url=${link}][img]${url}/thumbnail.jpg${url_data}[/img][/url]`;
				}
				if (med.external && (med.images == null || med.images.length == 0)) {
					var lnk = med.external.uri;
					var u = new URL(lnk);
					var img = "";
					if (u.pathname.substring (u.pathname.lastIndexOf (".")) == ".gif")
						img = `[url=${lnk}][img]${lnk}[/img][/url]`;
					else if (med.external.thumb)
						img = `[url=${lnk}][img]https://rehost.diberie.com/Rehost?size=min&url=https://cdn.bsky.app/img/feed_thumbnail/plain/${did_plc}/${med.external.thumb.ref["$link"]}[/img][/url]`;
					var qte = med.external.title + ((med.external.description != null) ? (" - " + med.external.description) : "");
					text += `[url=${lnk}][b]${lnk}[/b][/url]\n${img}[quote]${qte}[/quote]`;
				}
			}
			if (data.value.embed.record && sub == false) {
				var rec = data.value.embed.record;
				if (rec.record)
					rec = rec.record;
				console.log ("log");
				console.log (rec);
				var subdid = rec.uri.split ("at://")[1].split ("/")[0];
				var subp = rec.uri.split ("app.bsky.feed.post/")[1];
				quote.subquote = Utils.getSkeet (`https://bsky.app/profile/${subdid}/post/${subp}`, subdid, subp, true);
			}
		}
		quote.text = Utils.normalizeText (text);
		return quote.toString();
	}
	
	static getSkeet (link, id, hash, sub) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var res = Expr.bluesky.exec (link);
				SkeetProfile.fetch (id).then (profile => {
					var url = `https://bsky.social/xrpc/com.atproto.repo.getRecord?repo=${profile.did}&collection=app.bsky.feed.post&rkey=${hash}`;
					console.log (url);
					Utils.request({
						method : "GET",
						url : url,
						onabort : function() { reject (link); },
						onerror : function() { reject (link); },
						ontimeout : function() { reject (link); },
						headers : { "Cookie" : "" },
						anonymous : true,
						onload : function (response) {
							try {
								var json = JSON.parse (response.responseText);
								Utils.jsonToSkeet (json, profile, link, sub).then (text => {
									resolve (text);
								}).catch (e => {
									console.log (e);
									reject (link);
								});
							}
							catch (e) {
								console.log (e);
								reject (link);
							}
						}
					});
				}).catch (e => {
					console.log (e);
					reject (link);
				});
			})();
		});
	}
	
	static pasteBluesky (link) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var res = Expr.bluesky.exec (link);
				SkeetProfile.fetch (res.groups.id).then (profile => {
					var url = `https://bsky.social/xrpc/com.atproto.repo.getRecord?repo=${profile.did}&collection=app.bsky.feed.post&rkey=${res.groups.hash}`;
					Utils.request({
						method : "GET",
						url : url,
						onabort : function() { reject (link); },
						onerror : function() { reject (link); },
						ontimeout : function() { reject (link); },
						headers : { "Cookie" : "" },
						anonymous : true,
						onload : function (response) {
							try {
								var json = JSON.parse (response.responseText);
								Utils.jsonToSkeet (json, profile, link, false).then (text => {
									resolve (text);
								}).catch (e => {
									console.log (e);
									reject (link);
								});
							}
							catch (e) {
								console.log (e);
								reject (link);
							}
						}
					});
				}).catch (e => {
					console.log (e);
					reject (link);
				});
			})();
		});
	}
	
	static pasteYoutube (link, id) {
		return new Promise ((resolve, reject) => {
			(async () => {
				Utils.request({
					method : "GET",
					url : link,
					onabort : function() { reject (link); },
					ontimeout : function() { reject (link); },
					onerror : function() { reject (link); },
					headers : { "Cookie" : "" },
					anonymous : true,
					onload : function (response) {
						var json = response.responseText.split ("var ytInitialPlayerResponse = ")[1].split ("};")[0] + "}";
						try {
							var obj = JSON.parse (json);
							var lnk = "https://youtu.be/" + id;
							var img = "https://i.ytimg.com/vi/" + id + "/mqdefault.jpg";
							var desc = Utils.formatText (obj.videoDetails.shortDescription);
							var title = Utils.formatText (obj.videoDetails.title);
							var txt = `[url=${link}][b]${title}[/b][/url]\n[url=${link}][img]${img}[/img][/url]`;
							resolve (txt);
						} catch (e) {
							console.log (e);
							reject (link);
						}
					}
				});
			})();
		});
	}
	
	static formatReddit (text) {
		return new Promise ((resolve, reject) => {
			var doc = new DOMParser().parseFromString (text, "text/html");
			var data = doc.querySelector ("#data").textContent;
			data = data.split ("window.___r = ")[1];
			data = data.substring (0, data.lastIndexOf (";"));
			try {
				var json = JSON.parse (data);
				var model = json.posts.models[Object.keys (json.posts.models)[0]];
				
				var tn = null;
				if (model.thumbnail != null && model.thumbnail.url != null)
					tn = model.thumbnail.url;
					
				var lnk = model.permalink;
				
				var image = null;
				if (model.media != null && model.media.type == "image")
					image = model.media.content;
				
				var video = null;
				if (model.media != null && model.media.type == "video") {
					video = model.media.hlsUrl;
					var url = new URL (tn);
					url.searchParams.append ("hfr-reddit-video", encodeURIComponent(video));
					tn = url.toString();
				}
				
				var gif = null;
				if (model.media != null && model.media.type == "gifvideo") {
					gif = model.media.content;
					var url = new URL (tn);
					url.searchParams.append ("hfr-reddit-gif", encodeURIComponent(gif));
					tn = url.toString();
				}
				
				var builder = new Builder();
				builder.append (`[:teepodavignon:8][citation=1,1,1][nom][url=${model.permalink}][:jean robin:10] ${model.author} a publié[/url][/nom]`);
				builder.append (`${model.title}`);
				if (model.media != null) {
					builder.append ("\n");
					if (image != null)
						builder.append (`[url=${lnk}][img]${tn}[/img][/url]`);
					else if (video != null)
						builder.append (`[url=${lnk}][img]${tn}[/img][/url]`);
					else if (gif != null)
						builder.append (`[url=${lnk}][img]${tn}[/img][/url]`);
				}
				builder.append ("[/citation]");
				resolve (builder.toString());
			}
			catch (e) { console.log (e); }
			reject (link);
		});
	}
	
	static pasteReddit (link) {
		return new Promise ((resolve, reject) => {
			(async () => {
				Utils.request({
					method : "GET",
					url : link,
					onabort : function() { reject (link); },
					onerror : function() { reject (link); },
					ontimeout : function() { reject (link); },
					headers : { "Cookie" : "" },
					anonymous : true,
					onload : function (response) {
						Utils.formatReddit (response.responseText).then (text => {
							resolve (text);
						}).catch (err => {
							console.log (err);
							reject (link);
						});
					}
				});
			})();
		});
	}
	
	static dropText (text) {
		return new Promise ((resolve, reject) => {
			(async () => {
				if (Expr.twitter.match (text)) {
					Utils.pasteTwitter (text).then (txt => {
						resolve (txt);
					}).catch (e => {
						console.log (e);
						reject (text);
					});
				}
				else if (Expr.mastodon.match (text)) {
					Utils.pasteMastodon (text).then (txt => {
						resolve (txt);
					}).catch (e => {
						console.log (e);
						reject (text);
					});
				}
				else {
					try {
						var url = new URL (text);
						var id = null;
						if (url.host == "youtube.com" || url.host == "www.youtube.com")
							id = url.searchParams.get ("v");
						else if (url.host == "youtu.be") {
							id = url.pathname;
							if (id != null)
								id = id.substring (1);
						}
						if (id != null)
							Utils.pasteYoutube (text, id).then (txt => {
								resolve (txt);
							}).catch (e => {
								console.log (e);
								reject (text);
							});
						else
							reject (text);
					}
					catch (e) { console.log (e); reject (text); }
				}
			})();
		});
	}
	
	static pasteHtml (item) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var blob = await item.getType ("text/html");
				var text = await blob.text();
				var doc = new DOMParser().parseFromString (text, "text/html");
				var sel = doc.querySelectorAll ("b > span > span > img");
				console.log (sel);
				if (sel.length == 1) {
					var url = sel.item (0).getAttribute ("src");
					var bbcode = "[url=https://rehost.diberie.com/Rehost?url=" + url + "][img]https://rehost.diberie.com/Rehost?size=min&url=" + url + "[/img][/url]";
					resolve (bbcode);
				}
				else
					reject (text);
			})();
		});
	}
	
	static pasteText (item) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var blob = await item.getType ("text/plain");
				var text = await blob.text();
				if (Expr.reddit.match (text)) {
					Utils.pasteReddit (text).then (txt => {
						resolve (txt);
					}).catch (e => {
						console.log (e);
						reject (text);
					});
				}
				else if (Expr.twitter.match (text)) {
					Utils.pasteTwitter (text).then (txt => {
						resolve (txt);
					}).catch (e => {
						console.log (e);
						reject (text);
					});
				}
				else if (Expr.mastodon.match (text)) {
					Utils.pasteMastodon (text).then (txt => {
						resolve (txt);
					}).catch (e => {
						console.log (e);
						reject (text);
					});
				}
				else if (Expr.bluesky.match (text)) {
					Utils.pasteBluesky (text).then (txt => {
						resolve (txt);
					}).catch (e => {
						console.log (e);
						reject (text);
					});
				}
				else {
					try {
						var url = new URL (text);
						var id = null;
						if (url.host == "youtube.com" || url.host == "www.youtube.com")
							id = url.searchParams.get ("v");
						else if (url.host == "youtu.be") {
							id = url.pathname;
							if (id != null)
								id = id.substring (1);
						}
						if (id != null)
							Utils.pasteYoutube (text, id).then (txt => {
								resolve (txt);
							}).catch (e => {
								console.log (e);
								reject (text);
							});
						else
							reject (text);
					}
					catch (e) { console.log (e); reject (text); }
				}
			})();
		});
	}
	
	static uploadGofile (file, resolve, reject) {
		if (file.size > 20000000) {
			reject("fichier trop gros");
			return;
		}
		var form = new FormData();
		console.log (file);
		form.append ("file", file);
		Utils.request ({
			method : "POST",
			url : "https://fastupload.io/upload",
			data : form,
			onabort : function() { reject(""); }, 
			ontimeout : function() { reject(""); },
			onerror : function() { reject(""); },
			onload : function (rep) {
				console.log (rep.responseText);
				resolve ("ok");
			}
		});
	}
	
	static pasteGofile (item, type) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var blob = await item.getType (type);
				Utils.uploadGofile (blob, resolve, reject);
			})();
		});
	}
	
	static dropGofile (file) {
		return new Promise ((resolve, reject) => {
			(async () => {
				Utils.uploadGofile (file, resolve, reject);
			})();
		});
	}
	
	static uploadImage (file, res, rej) {
		var svc = Utils.getValue ("hfr-copie-colle-service");
		var service = UploadService.getService (svc);
		if (service.isInvalid (file)) {
			rej ("fichier invalid pour ls service " + svc);
			return;
		}
		service.upload (file, res, rej);
	}
	
	static pasteImage (item, type) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var blob = await item.getType (type);
				Utils.uploadImage (blob, resolve, reject);
			})();
		});
	}
	
	static dropImage (file) {
		return new Promise ((resolve, reject) => {
			(async () => {
				Utils.uploadImage (file, resolve, reject);
			})();
		});
	}
	
	static registerImage (data) {
		var images = {};
		if (localStorage.hasOwnProperty ("hfr-cc-images")) {
			try {
				images = JSON.parse (localStorage.getItem ("hfr-cc-images"));
				if (Array.isArray (images))
					images = {};
			}
			catch (e) {
				console.log(e);
				images = {};
			}
		}
		images[data.deletehash] = data;
		localStorage.setItem ("hfr-cc-images", JSON.stringify (images));
	}
	
	static unregisterImage (hash) {
		var images = {};
		if (localStorage.hasOwnProperty ("hfr-cc-images")) {
			try {
				images = JSON.parse (localStorage.getItem ("hfr-cc-images"));
				if (Array.isArray (images))
					images = {};
			}
			catch (e) {
				console.log(e);
				images = {};
			}
		}
		if (images.hasOwnProperty (hash))
			delete images[hash];
		localStorage.setItem ("hfr-cc-images", JSON.stringify (images));
	}
	
	static listImages() {
		var images = {};
		if (localStorage.hasOwnProperty ("hfr-cc-images")) {
			try {
				images = JSON.parse (localStorage.getItem ("hfr-cc-images"));
				if (Array.isArray (images))
					images = {};
			}
			catch (e) {
				console.log(e);
				images = {};
			}
		}
		var l = [];
		for (var k of Object.keys (images))
			l.push (images[k]);
		return l;
	}
	
	static bstroke (event) {
		console.log ("crotte");
		console.log (event);
		if (event.code == "KeyD" && event.ctrlKey && event.altKey) {
			// a refaire
		}
	}
	
	static isGDoc (item) {
		if (item.types.length != 1)
			return false;
		return item.types[0] == "text/html";
	}
	
	static stroke (event) {
		console.log (event);
		var loading = new Loading();
		if (event.code == "KeyD" && event.ctrlKey && event.altKey) {
			// a refaire
		}
		else if (event.code == "KeyV" && (event.ctrlKey && navigator.platform.indexOf ("Mac") != 0 || event.metaKey && navigator.platform.indexOf ("Mac") == 0)) {
			console.log (navigator);
			console.log (navigator.clipboard);
			if (!navigator?.clipboard?.read)
				alert ("navigator.clipboard.read : fonction non présente ou non activée.\nVous êtes sur Firefox : suivre ce lien https://forum.hardware.fr/hfr/Discussions/Viepratique/scripts-infos-news-sujet_116015_240.htm#t67904757")
			else
				navigator.clipboard.read().then(array => {
					for (var item of array) {
						if (Utils.isGDoc (item)) {
							console.log ("caca");
							event.target.disabled = true;
							loading.attach (event.target);
							Utils.pasteHtml (item).then (bbcode => {
								Utils.insertText (event.target, bbcode);
								loading.destroy();
								event.target.disabled = false;
								event.target.focus();
							}).catch (e => {
								Utils.insertText (event.target, e);
								loading.destroy();
								event.target.disabled = false;
								event.target.focus();
							});
						}
						else if (item.types.indexOf ("text/plain") >= 0) {
							event.target.disabled = true;
							loading.attach (event.target);
							Utils.pasteText (item).then (text => {
								console.log ("prout");
								Utils.insertText (event.target, Utils.formatText (text));
								loading.destroy();
								event.target.disabled = false;
								event.target.focus();
							}).catch (e => {
								Utils.insertText (event.target, Utils.formatText (e));
								loading.destroy();
								event.target.disabled = false;
								event.target.focus();
							});
						}
						else
							for (var type of item.types) {
								if (type.indexOf ("audio/") == 0) {
									event.target.disabled = true;
									loading.attach (event.target);
									Utils.uploadGofile (item, type).then (url => {
										Utils.insertText (event.target, "[url]" + url + "[/url]");
										loading.destroy();
										event.target.disabled = false;
										event.target.focus();
									}).catch (e => {
										loading.destroy();
										event.target.disabled = false;
										event.target.focus();
										console.log (e);
									});
									break;
								}
								else if (type.indexOf ("image/") == 0) {
									event.target.disabled = true;
									loading.attach (event.target);
									Utils.pasteImage (item, type).then (upload => {
										if (event.altKey) {
											var src = upload.url;
											if (!upload.gif)
												src = upload.thumb;
											Utils.insertText (event.target, "[url=" + upload.url + "][img]" + src + "[/img][/url]");	
										}
										else {
											var dialog = new Dialog();
											dialog.closed (d => { d.destroy(); });
											dialog.title = "prévisualisation de l'image";
											var src = upload.url;
											if (!upload.gif)
												src = upload.thumb;
											var img = new Picture (src);
											img.loaded ((w,h) => {
												if (w > 400) {
													img.height = 400 * h / w;
													img.width = 400;
												}
												if (h > 400) {
													img.width = 400 * w / h;
													img.height = 400;
												}
											});
											dialog.content = img;
											if (upload.gif) {
												var button = new TextButton ("gif");
												button.set ("bbcode", "[url=" + upload.url + "][img]" + upload.url + "[/img][/url]");
												button.clicked (self => { Utils.insertText (event.target, self.get ("bbcode")); dialog.destroy(); });
												dialog.addButton (button);
											}
											else
												upload.images.forEach (img => {
													var button = new TextButton (img.id);
													button.set ("bbcode", "[url=" + upload.url + "][img]" + img.url + "[/img][/url]");
													button.clicked (self => { Utils.insertText (event.target, self.get ("bbcode")); dialog.destroy(); });
													dialog.addButton (button);
												});
											dialog.display();
										}
										loading.destroy();
										event.target.disabled = false;
										event.target.focus();
									}).catch (e => {
										loading.destroy();
										event.target.disabled = false;
										event.target.focus();
										console.log (e);
									});
									break;
								}
							}
					}
				}).catch(e => {
					console.log (e);
				});
			event.preventDefault();
		}
	}

	static allowDrop (event) {
		event.preventDefault();
	}
	
	static stringIsGIF (str) {
		try {
			var url = new URL (str);
			return url.pathname.endsWith(".gif");
		}
		catch {}
		return false;
	}
	
	static drop (event) {
		console.log ("drop event");
		console.log (event.dataTransfer);
		event.preventDefault();
		var loading = new Loading();
		var dt = event.dataTransfer;
		if (dt.items.length == 0)
			return;
		var hf = false, hu = false;
		for (var i = 0; i < dt.items.length; i++)
			if (dt.items[i].kind == "file")
				hf = true;
		var uri = event.dataTransfer.getData ("text/uri-list");
		if (uri != null)
			hu = true;
		if (hu && Utils.stringIsGIF (uri)) {
			Utils.insertText (event.target, "[url=" + uri + "][img]https://rehost.diberie.com/Rehost?url=" + uri + "[/img][/url]");	
			
		}
		else if (hf) {
			for (var i = 0; i < dt.items.length; i++) {
				var item = dt.items[i];
				console.log (item);
				if (item.type == "application/x-moz-nativeimage") {
					alert ("Vous êtes sur Firefox et la fonctionnalité de glisser des images entre les onglets n'est pas activée\nsuivre ce lien https://forum.hardware.fr/hfr/Discussions/Viepratique/scripts-infos-news-sujet_116015_265.htm#t71266097");
				}
				if (item.type.indexOf ("audio/") == 0) {
					event.target.disabled = true;
					loading.attach (event.target);
					Utils.dropGofile (item.getAsFile()).then (url => {
						Utils.insertText (event.target, "[url]" + url + "[/url]");
						loading.destroy();
						event.target.disabled = false;
					}).catch (e => {
						loading.destroy();
						event.target.disabled = false;
						console.log (e);
					});
				}
				else if (item.type.indexOf ("image/") == 0) {
					event.target.disabled = true;
					loading.attach (event.target);
					Utils.dropImage (item.getAsFile()).then (upload => {
						if (event.altKey) {
							var src = upload.url;
							if (!upload.gif)
								src = upload.thumb;
							Utils.insertText (event.target, "[url=" + upload.url + "][img]" + src + "[/img][/url]");	
						}
						else {
							var dialog = new Dialog();
							dialog.closed (d => { d.destroy(); });
							dialog.title = "prévisualisation de l'image";
							var src = upload.url;
							if (!upload.gif)
								src = upload.thumb;
							var img = new Picture (src);
							img.loaded ((w,h) => {
								if (w > 400) {
									img.height = 400 * h / w;
									img.width = 400;
								}
								if (h > 400) {
									img.width = 400 * w / h;
									img.height = 400;
								}
							});
							dialog.content = img;
							if (upload.gif) {
								var button = new TextButton ("gif");
								button.set ("bbcode", "[url=" + upload.url + "][img]" + upload.url + "[/img][/url]");
								button.clicked (self => { Utils.insertText (event.target, self.get ("bbcode")); dialog.destroy(); });
								dialog.addButton (button);
							}
							else
								upload.images.forEach (img => {
									var button = new TextButton (img.id);
									button.set ("bbcode", "[url=" + upload.url + "][img]" + img.url + "[/img][/url]");
									button.clicked (self => { Utils.insertText (event.target, self.get ("bbcode")); dialog.destroy(); });
									dialog.addButton (button);
								});
							dialog.display();
						}
						loading.destroy();
						event.target.disabled = false;
					}).catch (e => {
						loading.destroy();
						event.target.disabled = false;
						console.log (e);
					});
				}
			}
		} 
		else
			for (var i = 0; i < dt.items.length; i++) {
				var item = dt.items[i];
				console.log (item);
				 if (item.kind == "string") {
					event.target.disabled = true;
					loading.attach (event.target);
					item.getAsString (str => {
						Utils.dropText (str).then (text => {
							Utils.insertText (event.target, text);
							loading.destroy();
							event.target.disabled = false;
						}).catch (e => {
							console.log (e);
							Utils.insertText (event.target, e);
							loading.destroy();
							event.target.disabled = false;
						});
					});
				}
			}
	}
}

Utils.registerCommand ("Copie/Colle -> choix du service", () => {
	var service = prompt ("Entrez ici le service d'image désiré (imgur, ou rehost)", Utils.getValue ("hfr-copie-colle-service", ""));
	if (service == "imgur" || service == "rehost")
		Utils.setValue ("hfr-copie-colle-service", service);
});

Utils.init (table => {
	Utils.unicodeTable = table;
	Utils.addCss ("https://vjs.zencdn.net/8.0.4/video-js.css");
	Utils.addJs ("https://vjs.zencdn.net/8.0.4/video.js");
	
	document.addEventListener ("keydown", Utils.bstroke);	
	
	var index = 0;
	
	for (var textarea of document.querySelectorAll ("textarea")) {
		textarea.addEventListener('keydown', Utils.stroke);
		textarea.addEventListener('drop', Utils.drop);
		textarea.addEventListener('dragover', Utils.allowDrop);
		textarea.addEventListener('focus', Utils.addButtonToTextarea);
	}
	
	var observer = new MutationObserver ((mutations, observer) => {
		for (var textarea of document.querySelectorAll("textarea")) {
			textarea.removeEventListener('keydown', Utils.stroke, false); 
			textarea.addEventListener('keydown', Utils.stroke, false);
			textarea.removeEventListener('drop', Utils.drop, false); 
			textarea.addEventListener('drop', Utils.drop, false); 
			textarea.removeEventListener('dragover', Utils.allowDrop, false); 
			textarea.addEventListener('dragover', Utils.allowDrop, false); 
			textarea.removeEventListener('focus', Utils.addButtonToTextarea, false);
			textarea.addEventListener('focus', Utils.addButtonToTextarea, false);
		}
		
		document.querySelectorAll (".cLink").forEach (function (link) {
			if (typeof (link.getAttribute ("href")) !== "string")
				return;
			var href = link.getAttribute ("href");
			if (href[0] == '/')
				href = "https://forum.hardware.fr" + href;
			var u = new URL (href);
			if (u.hostname == "store10.gofile.io" && u.pathname.indexOf ("/download") == 0 && u.searchParams.get("isAudio") == "true") {
				var audio = document.createElement ("audio");
				audio.setAttribute ("src", href);
				audio.setAttribute ("controls", "controls");
				link.parentNode.replaceChild (audio, link);
			}
			if (link.firstElementChild == null || link.firstElementChild.nodeName.toLowerCase() != "img")
				return;
			if (Expr.reddit.match (href)) {
				var src = new URL (link.firstElementChild.getAttribute ("src"));
				if (src.searchParams.get ("hfr-reddit-gif") != null) {
					var gif = decodeURIComponent (src.searchParams.get ("hfr-reddit-gif"));
					var video = document.createElement ("video");
					video.setAttribute ("loop", "");
					video.setAttribute ("oncanplaythrough", "this.muted=true; this.play()");
					video.setAttribute ("src", gif);
					video.setAttribute ("height", "200");
					link.parentNode.replaceChild(video, link);
				}
				else if (src.searchParams.get ("hfr-reddit-video") != null) {
					var v = decodeURIComponent (src.searchParams.get ("hfr-reddit-video"));
					var video = document.createElement ("video");
					video.setAttribute ("id", "hfr-video-" + index);
					video.setAttribute ("class", "video-js");
					video.setAttribute ("controls", "");
					video.setAttribute ("height", "400");
					link.parentNode.replaceChild(video, link);
					var player = videojs ("hfr-video-" + index, {controlBar: {fullscreenToggle: true}});
					player.src ({
						type : "application/x-mpegURL",
						src : v
					});
					index++;
				}
			}
			else if (href.indexOf ("https://x.com/i/status/") == 0) {
				var src = new URL (link.firstElementChild.getAttribute ("src"));
				var url = src.searchParams.get("hfr-url-data");
				if (url != null) {
					var video = document.createElement ("video");
					if (src.searchParams.get("gif") == "true") {
						video.setAttribute ("loop", "");
						video.setAttribute ("oncanplaythrough", "this.muted=true; this.play()");
					}
					else
						video.setAttribute ("controls", "");
					video.setAttribute ("src", url);
					video.setAttribute ("height", "200");
					link.parentNode.replaceChild(video, link);
				}
			}
		});
	});
	observer.observe(document, {attributes: false, childList: true, characterData: false, subtree: true}); 
		
	document.querySelectorAll (".cLink").forEach (function (link) {
		if (typeof (link.getAttribute ("href")) !== "string")
			return;
		var href = link.getAttribute ("href");
		if (href[0] == '/')
			href = "https://forum.hardware.fr" + href;
		var u = new URL (href);
		if (u.hostname == "store10.gofile.io" && u.pathname.indexOf ("/download") == 0 && u.searchParams.get("isAudio") == "true") {
			var audio = document.createElement ("audio");
			audio.setAttribute ("src", href);
			audio.setAttribute ("controls", "controls");
			link.parentNode.replaceChild (audio, link);
		}
		if (link.firstElementChild == null || link.firstElementChild.nodeName.toLowerCase() != "img")
			return;
		if (Expr.reddit.match (href)) {
			var src = new URL (link.firstElementChild.getAttribute ("src"));
			if (src.searchParams.get ("hfr-reddit-gif") != null) {
				var gif = decodeURIComponent (src.searchParams.get ("hfr-reddit-gif"));
				var video = document.createElement ("video");
				video.setAttribute ("loop", "");
				video.setAttribute ("oncanplaythrough", "this.muted=true; this.play()");
				video.setAttribute ("src", gif);
				video.setAttribute ("height", "200");
				link.parentNode.replaceChild(video, link);
			}
			else if (src.searchParams.get ("hfr-reddit-video") != null) {
				var v = decodeURIComponent (src.searchParams.get ("hfr-reddit-video"));
				var video = document.createElement ("video");
				video.setAttribute ("id", "hfr-video-" + index);
				video.setAttribute ("class", "video-js");
				video.setAttribute ("controls", "");
				video.setAttribute ("height", "400");
				link.parentNode.replaceChild(video, link);
				var player = videojs ("hfr-video-" + index, {controlBar: {fullscreenToggle: true}});
				player.src ({
					type : "application/x-mpegURL",
					src : v
				});
				index++;
			}
		}
		else if (Expr.bluesky.match (href)) {
			var img = link.firstElementChild;
			if (img != null && img.hasAttribute ("src")) {
				var src = new URL (img.getAttribute ("src"));
				var url = src.searchParams.get("vdata");
				if (url != null) {
					var video = document.createElement ("video");
					video.setAttribute ("id", "hfr-video-" + index);
					video.setAttribute ("class", "video-js");
					video.setAttribute ("controls", "");
					video.setAttribute ("height", "400");
					link.parentNode.replaceChild(video, link);
					var player = videojs ("hfr-video-" + index, {controlBar: {fullscreenToggle: true}});
					player.src ({
						type : "application/x-mpegURL",
						src : url
					});
					index++;
				}
			}
		}
		else if (href.indexOf ("https://x.com/i/status/") == 0) {
			var src = new URL (link.firstElementChild.getAttribute ("src"));
			var url = src.searchParams.get("hfr-url-data");
			var ct = src.searchParams.get("hfr-media-type");
			if (url != null) {
				var video = document.createElement ("video");
				video.setAttribute ("id", "hfr-video-" + index);
				video.setAttribute ("class", "video-js");
				if (src.searchParams.get("gif") == "true") {
					video.setAttribute ("loop", "");
					video.setAttribute ("oncanplaythrough", "this.muted=true; this.play()");
				}
				else
					video.setAttribute ("controls", "");
				video.setAttribute ("height", "400");
				link.parentNode.replaceChild(video, link);
				var player = videojs ("hfr-video-" + index, {controlBar: {fullscreenToggle: true}});
				player.src ({
					type : ct,
					src : url
				});
				index++;
			}
		}
	});
});
