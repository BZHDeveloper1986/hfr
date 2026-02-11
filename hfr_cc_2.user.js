// ==UserScript==
// @author        BZHDeveloper, roger21
// @name          [HFR] Copié/Collé v2
// @version       1.5.18
// @namespace     forum.hardware.fr
// @description   Colle les données du presse-papiers et les traite si elles sont reconnues.
// @icon          https://github.com/BZHDeveloper1986/hfr/blob/main/hfr-logo.png?raw=true
// @downloadURL   https://github.com/BZHDeveloper1986/hfr/raw/refs/heads/main/hfr_cc_2.user.js
// @updateURL     https://github.com/BZHDeveloper1986/hfr/raw/refs/heads/main/hfr_cc_2.user.js
// @require       https://unpkg.com/video.js/dist/video.min.js
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
// 1.5.15         Simplification du code
// 1.5.13         Merci pour tout Marc
// 1.5.10         Modification de la taille de l'image avant collage
// 1.5.8          Threads + correction instagram
// 1.5.7          Correction emoji
// 1.5.6          Taille de l'image de prévisualisation.
// 1.5.4          Correction Instagram
// 1.5.3          Affichage des liens si HTML avec description.
// 1.5.1          Correctif vidéo reddit pour firefox
// 1.5            Refonte complète du code : utilisation de classes, promesses, etc.
// 1.4.75         Correction d'un bug avec les vidéos Reddit.
// 1.4.73         Twitter : nique-toi Elon
// 1.4.70         ajoute d'une boîte text 
// 1.4.68         édition casse-bonbons
// 1.4.67         vidéos Mastodon
// 1.4.66         ajout de Truth Social (instance mastodon)
// 1.4.65         Unicode 16.0
// 1.4.63         modification des # chez Bluesky.
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

var banner = document.querySelector ("tbody > tr > td > span > a > a > img");
if (banner != null) {
	banner.src = "https://i.imgur.com/AYX3Pde.png";
	console.log ("RIP Marc");
}

class Headers {
	#obj;

	constructor() {
		this.#obj = {};
	}

	setHeader (name, value) {
		if (!(name in this.#obj))
			this.#obj[name] = [];
		this.#obj[name].push (value);
	}

	getHeader (name) {
		if (name in this.#obj)
			return this.#obj[name];
		return [];
	}

	get contentType() {
		var a = this.getHeader ("content-type");
		if (a.length == 0)
			return "application/octet-stream";
		return a[0];
	}

	static parse (str) {
		var headers = new Headers();
		var p = str.split ("\n");
		p.forEach (line => {
			var l = line;
			var k = l.substring (0, l.indexOf (":")).trim().toLowerCase();
			l.substring (l.indexOf (":") + 1).split (";").forEach (v => {
				headers.setHeader (k, v.trim());
			});
		});
		return headers;
	}
}

class Expr {
	#patt;
	
	constructor (str) {
		this.#patt = str;
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
	
	static get truthsocial() {
		return new Expr ("^(https://(?<instance>[a-z\\.]+)/@\\w+(@[a-z\\.]+)?/posts/(?<tid>\\d+))$");
	}
	
	static get zippy() {
		return new Expr ("^(https://www41\\.zippyshare\\.com/downloadAudioHQ\\?key=\\w+)$");
	}
	
	static get reddit() {
		return new Expr ("^(https://www\\.reddit\\.com/r/\\w+/comments/\\w+/[àáâãäåçèéêëìíîïðòóôõöùúûüýÿ\\w%]+/)$");
	}

	static get shreddit() {
		return new Expr ("^(https://www\\.reddit\\.com/r/\\w+/s/\\w+)$");
	}
	
	static get bluesky() {
		return new Expr ("^(https://(?<instance>[\\w\\.\\-]+)/profile/(?<handle>[\\w\\.\\-]+)/post/(?<hash>\\w+))$");
	}

	static get instagram() {
		return new Expr ("^(https://(www\\.)?instagram\\.com/(\\w+/)?(p|reel)/(?<shortcode>[-_a-zA-Z0-9]+)/?)");
	}

	static get threads() {
		return new Expr ("^(https://www\\.threads\\.com/@[\\w\\.]+/post/[\\w\\-]+(\\?[\\w\\+\\-\\=\\&]+)?)$");
	}
}

let Hfr = {
	fetch : function (url) {
		return new Promise ((resolve, reject) => {
			Utils.request({
				method : "GET",
				url : url,
				onabort : function() { reject (url); },
				onerror : function() { reject (url); },
				ontimeout : function() { reject (url); },
				headers : { "Cookie" : "" },
				anonymous : true,
				responseType : "blob",
				onload : function (response) {
					var headers = Headers.parse (response.responseHeaders);
					resolve (response.response.slice (0, response.response.size, headers.contentType));
				}
			});
		});
	},
	Image : class {
		#uri;
		#w;
		#h;
		#filled;
		#src;

		constructor (u) {
			this.#uri = u;
		}

		get height() { return this.#h; }

		get width() { return this.#w; }

		get thumbHeight() {
			return 200;
		}

		get thumbWidth() {
			return Math.floor (this.width * 200 / this.height);
		}

		get url() { return this.#uri; }
		set url (u) { this.#uri = u; }

		toString() {
			return `[url=${this.url}][img=${this.thumbWidth},${this.thumbHeight}]${this.#src}[/img][/url]`;
		}

		build() {
			return new Promise ((resolve, reject) => {
				if (this.#filled == true)
					return Promise.resolve (this.toString());
				Hfr.fetch (this.url).then (file => {
					UploadService.getDefault().uploadAsync (file).then (o => {
						console.log (o);
						this.#h = o.height;
						this.#w = o.width;
						this.#src = o.url;
						this.#filled = true;
						resolve (this.toString());
					}).catch (reject);
				}).catch (reject);
			});
		}

		static load (url) {
			
		}
 	}
};

class Video {
	#pst;
	#uri;
	#ctn;
	#gif;

	get poster() { return this.#pst; }
	set poster (p) { this.#pst = p; }

	get url() { return this.#uri; }
	set url (u) { this.#uri = u; }

	get contentType() { return this.#ctn; }
	set contentType (c) { this.#ctn = c; }

	get isGif() { return this.#gif; }
	set isGif (g) { this.#gif = g; }

	toString() {
		var u = new URL (this.url);
		if (this.isGif)
			u.searchParams.append ("gif", "true");
		return `[url=${u}][img]${this.poster}[/img][/url]\n`;
	}

	build() {
		return Promise.resolve (this.toString());
	}
}

Element.prototype.createPlayer = function (is_gif) {
	var video = document.createElement ("video");
	if (is_gif) {
		video.setAttribute ("loop", "");
		video.setAttribute ("oncanplaythrough", "this.muted=true; this.play()");
	}
	else
		video.setAttribute ("controls", "");
	video.setAttribute ("height", "400");
	video.setAttribute ("class", "video-js");
	this.parentNode.replaceChild (video, this);
	video.player = videojs (video);
	return video;
};

class Social {
	static match (url) {
		console.log (Expr.threads.match (url));
		return Expr.twitter.match (url) || Expr.bluesky.match (url) || Expr.mastodon.match (url) || Expr.truthsocial.match (url) || 
			Expr.reddit.match (url) || Expr.shreddit.match (url) || Expr.instagram.match (url) || Expr.threads.match (url);
	}

	static load (url) {
		if (Expr.twitter.match (url))
			return Twitter.load (url);
		if (Expr.bluesky.match (url))
			return BlueSky.load (url);
		if (Expr.reddit.match (url) || Expr.shreddit.match (url))
			return Reddit.load (url);
		if (Expr.mastodon.match (url) || Expr.truthsocial.match (url))
			return Mastodon.load (url);
		if (Expr.instagram.match (url))
			return Instagram.load (url);
		if (Expr.threads.match (url))
			return Threads.load (url);
		return Promise.reject (url);
	}

	#lnk;
	#usr;
	#inf;
	#icn;
	#txt;
	#qut;
	#imgs;
	#vids;

	constructor () {
		this.#imgs = [];
		this.#vids = [];
	}

	set link (l) { this.#lnk = l; }
	get link() { return this.#lnk; }

	set user (u) { this.#usr = u; }
	get user() { return this.#usr; }

	set info (i) { this.#inf = i; }
	get info() { return this.#inf; }

	set icon (i) { this.#icn = i; }
	get icon() { return this.#icn; }

	set text (t) { this.#txt = t; }
	get text() { return this.#txt; }

	set quote (q) { this.#qut = q; }
	get quote() { return this.#qut; }

	get images() { return this.#imgs; }

	get videos() { return this.#vids; }

	toString() {
		var builder = new Builder();
		if (this.quote)
			builder.append (`${this.quote}\n`);
		builder.append (`[quote][b][url=${this.link}]${this.icon} ${this.user} ${this.info}[/url][/b]\n\n`);
		builder.append (`${this.text}\n`);
		this.videos.forEach (v => builder.append (v.toString()));
		this.images.forEach (i => builder.append (i.toString()));
		builder.append ("[/quote]\n");
		return builder.toString();
	}

	build() {
		var arr = [];
		if (this.quote)
			arr.push (this.quote.build());
		arr.push (`[quote][b][url=${this.link}]${this.icon} ${this.user} ${this.info}[/url][/b]\n\n`);
		arr.push (`${this.text}\n`);
		this.images.forEach (i => arr.push (i.build()));
		this.videos.forEach (v => arr.push (v.build()));
		arr.push ("[/quote]\n");
		return new Promise ((resolve, reject) => {
			Promise.all (arr).then (values => {
				resolve (values.join(""));
			}).catch (e => {
				console.log (e);
				reject();
			});
		});
	}
}

class Threads extends Social {
	static elementToBBCode (element) {
		var builder = new Builder();
		element.childNodes.forEach (node => {
			if (node.nodeType == Node.TEXT_NODE)
				builder.append (Utils.normalizeText (node.textContent)
					.replaceAll (/#\w+/g, match => { return "[url=https://www.threads.com/search?q=%23" + match.substring (1) + "][b]" + match + "[/b][/url]"; })
					.replaceAll (/@\w+/g, match => { return "[url=https://www.threads.com/" + match + "][b]" + match + "[/b][/url]"; }));
			else if (node.nodeType == Node.ELEMENT_NODE && node.tagName.toLowerCase() == "br")
				builder.append ("\n");
			else if (node.nodeType == Node.ELEMENT_NODE && node.tagName.toLowerCase() == "a")
				builder.append (`[b][url=${node.getAttribute ("href")}]${node.textContent}[/url][/b]`);
			else if (node.nodeType == Node.ELEMENT_NODE)
				builder.append (Instagram.elementToBBCode (node));
		});
		return builder.toString();
	}

	constructor (doc, url) {
		super();

		this.icon = "[img]https://i.imgur.com/wk7vohW.png[/img]";
		this.link = url;
		this.user = doc.querySelector (".NameContainer .HeaderLink").textContent;
		var tw = doc.querySelector (".TopicTagWrapper");
		this.info = "";
		if (tw != null) {
			this.info = " > " + doc.querySelector (".HeaderLink span").textContent;
		}
		this.text = Threads.elementToBBCode (doc.querySelector (".BodyTextContainer"));
		doc.querySelectorAll (".MediaScrollImageContainer, .SingleInnerMediaContainer").forEach (media => {
			var img = media.querySelector ("img");
			if (img == null)
				return;
			var url = img.getAttribute ("src");
			this.images.push (new Hfr.Image (url));
		});
		var cnt = doc.querySelector (".SingleInnerMediaContainerVideo");
		if (cnt != null) {
			var vid = cnt.querySelector ("video");
			var v = new Video();
			var u = new URL(vid.querySelector ("source").getAttribute ("src"));
			u.searchParams.append ("hfr-cc-insta", "true");
			v.url = u.toString();
			v.contentType = "video/mp4";
			v.poster = "https://rehost.diberie.com/Rehost?size=min&url=" + encodeURIComponent ("https://i.imgur.com/juJpPUD.png");
			this.videos.push (v);
		}
	}

	static load (url) {
		return new Promise ((resolve, reject) => {
			(async () => {
				Utils.request({
					method : "GET",
					url : `${url}/embed`,
					onabort : function() { reject (link); },
					onerror : function() { reject (link); },
					ontimeout : function() { reject (link); },
					headers : { "Cookie" : "" },
					anonymous : true,
					onload : function (response) {
						try {
							var doc = new DOMParser().parseFromString (response.responseText, "text/html");
							resolve (new Threads (doc, url));
						}
						catch (e) {
							console.log (e);
							reject (url);
						}
					}
				});
			})();
		});
	}
}

class Instagram extends Social {
	constructor (doc, code) {
		super();

		this.icon = "[img]https://i.imgur.com/bhHTaFv.png[/img]";
		this.link = `https://www.instagram.com/p/${code}/`;
		this.user = Utils.normalizeText (doc.querySelector (".usermeta > .fullname h1").textContent.trim());
		this.info = ((doc.querySelector (".usermeta svg.Zi--BadgeCert") != null) ? "[:yoann riou:9]" : "") + doc.querySelector (".usermeta > .username h2").textContent.trim();
		this.text = Instagram.elementToBBCode (doc.querySelector ("div.desc"));

		doc.querySelectorAll ("div.show .media-wrap").forEach (media => {
			var img = media.querySelector ("img");
			if (img != null) {
			console.log ("image width : " +  img.width);
				var src = img.getAttribute ("data-src");
				if (src == null)
					src = img.getAttribute ("src");
				var url = encodeURIComponent (src);
				console.log ("instagram : " + url);
				this.images.push (new Hfr.Image (url));
			}
			if (media.classList.contains ("proxy-video")) {
				var video = media.querySelector ("video");
				var vid = new Video();
				vid.poster = "https://rehost.diberie.com/Rehost?url=" + encodeURIComponent (video.getAttribute ("poster"));
				var u = new URL (video.getAttribute ("src"));
				u.searchParams.append ("hfr-cc-insta", "true");
				vid.url = u.toString();
				vid.contentType = "video/mp4";
				this.videos.push (vid);
			}
		});
	}

	static elementToBBCode (element) {
		var builder = new Builder();
		element.childNodes.forEach (node => {
			if (node.nodeType == Node.TEXT_NODE)
				builder.append (Utils.normalizeText (node.textContent)
					.replaceAll (/#\w+/g, match => { return "[url=https://www.instagram.com/explore/tags/" + match.substring (1) + "][b]" + match + "[/b][/url]"; })
					.replaceAll (/@\w+/g, match => { return "[url=https://www.instagram.com/" + match.substring (1) + "][b]" + match + "[/b][/url]"; }));
			else if (node.nodeType == Node.ELEMENT_NODE && node.tagName.toLowerCase() == "br")
				builder.append ("\n");
			else if (node.nodeType == Node.ELEMENT_NODE && node.tagName.toLowerCase() == "a") {
				var href = "https://www.instagram.com" + node.getAttribute ("href");
				builder.append (`[b][url=${href}]${node.textContent}[/url][/b]`);
			}
			else if (node.nodeType == Node.ELEMENT_NODE)
				builder.append (Instagram.elementToBBCode (node));
		});
		return builder.toString();
	}

	static load (url) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var res = Expr.instagram.exec (url);
				var code = res.groups.shortcode;
				Utils.request({
					method : "GET",
					url : `https://imginn.com/p/${code}/`,
					onabort : function() { reject (link); },
					onerror : function() { reject (link); },
					ontimeout : function() { reject (link); },
					headers : { "Cookie" : "" },
					anonymous : true,
					onload : function (response) {
						try {
							var doc = new DOMParser().parseFromString (response.responseText, "text/html");
							resolve (new Instagram (doc, code));
						}
						catch (e) {
							console.log (e);
							reject (url);
						}
					}
				});
			})();
		});
	}
}

class Reddit extends Social {
	constructor() {
		super();

		this.icon = "[:jean robin:10]";
	}

	static format (url, text) {
		return new Promise ((resolve, reject) => {
			try {
				var doc = new DOMParser().parseFromString (text, "text/html");
				var post = doc.querySelector ("shreddit-post");
				var title = post.querySelector ("[slot='title']").textContent.trim();
				var t = post.querySelector ("[slot='text-body'] div[id]");
				var ctn = post.querySelector ("[slot='post-media-container']");
				var red = new Reddit();
				red.link = url;
				red.user = post.querySelector (".author-name").textContent;
				red.info = "a publié sur " + post.querySelector ("a.subreddit-name").textContent.trim();
				var txt = `[b]${title}[/b]\n`;
				if (ctn != null) {
					var sub = ctn.querySelector ("[property='schema:articleBody']");
					if (sub != null)
						t = sub;
				}
				if (t != null)
					txt += Utils.normalizeText (t.textContent.trim());
				red.text = txt;
				if (ctn != null) {
					var img = ctn.querySelector ("img");
					var carousel = ctn.querySelector ("gallery-carousel");
					var player = ctn.querySelector ("shreddit-player");
					if (player != null) {
						if (player.getAttribute ("post-type") == "gif") {
							red.images.push (new Hfr.Image (post.getAttribute ("content-href")));
						} else {
							var data = JSON.parse (player.getAttribute ("packaged-media-json"));
							var perms = data.playbackMp4s.permutations;
							perms.sort ((a, b) => b.source.dimensions.width - a.source.dimensions.width);
							var src = perms[0].source.url;

							var vid = new Video();
							vid.url = src;
							vid.poster = player.querySelector (".preview-image").getAttribute ("src");
							red.videos.push (vid);
						}
					}
					else if (carousel != null) {
						carousel.querySelectorAll ("li > img").forEach (image => {
							var src = image.getAttribute ("src");
							if (src == null)
								src = image.getAttribute ("data-lazy-src");
							var preview = src;
							red.images.push ({
								url : src,
								toString : () => { return `[url=${src}][img]${preview}[/img][/url]`; }
							});
						});
					}
					else if (img != null) {
						var src = img.getAttribute ("src");
						var preview = "https://rehost.diberie.com/Rehost?size=min&url=" + encodeURIComponent (img.getAttribute ("src"));
						red.images.push ({
							url : src,
							toString : () => { return `[url=${src}][img]${preview}[/img][/url]`; }
						});
					}
				}
				resolve (red);
			}
			catch (e) {
				console.log (e);
				reject (url);
			}
		});
	}

	static load (url) {
		return new Promise ((resolve, reject) => {
			(async () => {
				Utils.request({
					method : "GET",
					url : url,
					onabort : function() { reject (link); },
					onerror : function() { reject (link); },
					ontimeout : function() { reject (link); },
					headers : { "Cookie" : "" },
					anonymous : true,
					onload : function (response) {
						Reddit.format (url, response.responseText).then (red => resolve (red)).catch (err => {
							console.log (err);
							reject (url);
						});
					}
				});
			})();
		});
	}
}

class Twitter extends Social {
	static normalize (str) {
		return Utils.normalizeText (str
			.replaceAll (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, "[url=$&][b]$&[/b][/url]")
			.replaceAll (/#\w+/g, match => { return "[url=https://x.com/hashtag/" + match.substring (1) + "][b]" + match + "[/b][/url]"; })
			.replaceAll (/@\w+/g, match => { return "[url=https://x.com/" + match.substring (1) + "][b]" + match + "[/b][/url]"; }));
	}

	static tweetVideoUrl (media) {
		for (var i = 0; i < media.video_info.variants.length; i++) {
			var vid = new Video();
			var v = media.video_info.variants[i];
			if (v.content_type == "application/x-mpegURL")
				continue;
			var url = new URL (v.url);
			url.searchParams.delete ("tag");
			vid.url = url.toString();
			vid.contentType = v.content_type;
			vid.poster = media.media_url_https;
			return vid;
		}
		return { url : "" };
	}

	constructor (data) {
		super();
		
		this.icon = "[img]https://i.imgur.com/pd0aoXr.png[/img]";
		this.link = "https://twitter.com/i/status/" + data.id_str;
		this.user = Utils.normalizeText (Utils.formatText (data.user.name));
		var obj = {
			"Basic" : "[:yoann riou:9]",
			"Government" : "[img]https://i.imgur.com/AYsrHeC.png[/img]",
			"Business" : "[img]https://i.imgur.com/6C4thzC.png[/img]"
		};
		if (data.user.is_blue_verified || data.user.verified) {
			data.user.verified = true;
			data.user.verified_type = "Basic";
		}
		this.info = `@${data.user.screen_name} ${data.user.verified ? obj[data.user.verified_type] + " " : ""}`;
		this.text = Twitter.normalize (data.text);
		if (data.mediaDetails && data.mediaDetails.length > 0) {
			data.mediaDetails.forEach (media => {
				if (media.type == "video") {
					this.videos.push (Twitter.tweetVideoUrl (media));
				}
				if (media.type == "animated_gif") {
					var gif = new Video();
					gif.url = media.video_info.variants[0].url;
					gif.contentType = media.video_info.variants[0].content_type;
					gif.poster = media.media_url_https;
					gif.isGif = true;
					this.videos.push (gif);
				}
				if (media.type == "photo") {
					this.images.push (new Hfr.Image (media.media_url_https));
				}
			});
		}
		if (data.quoted_tweet)
			this.quote = new Twitter (data.quoted_tweet);
	}

	static load (link) {
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
							resolve (new Twitter (json));
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
}

class BlueSky extends Social {
	static load (url) {
		var toto = 0;
		return new Promise ((resolve, reject) => {
			(async () => {
				var res = Expr.bluesky.exec (url);
				Utils.request({
					method : "GET",
					url : "https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=" + res.groups.handle,
					onabort : function() { reject (url); },
					onerror : function() { reject (url); },
					ontimeout : function() { reject (url); },
					onload : function (response) {
						try {
							var json = JSON.parse (response.responseText);
							var u = `at://${json.did}/app.bsky.feed.post/${res.groups.hash}`;
							var uri = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent (u)}`;
							Utils.request({
								method : "GET",
								url : uri,
								onabort : function() { reject (url); },
								onerror : function() { reject (url); },
								ontimeout : function() { reject (url); },
								onload : function (response) {
									try {
										var data = JSON.parse (response.responseText);
										resolve (new BlueSky (data.thread.post, json.did, res.groups.hash));
									}
									catch (e) {
										console.log (e);
										reject (url);
									}
								}
							});
						}
						catch (e) {
							console.log (e);
							reject (url);
						}
					}
				});
			})();
		});
	}

	constructor (data) {
		super();
		this.icon = "[img]https://rehost.diberie.com/Picture/Get/f/327943[/img]";
		var did = data.uri.split ("at://")[1].split ("/")[0];
		var hash = data.uri.split ("app.bsky.feed.post/")[1];
		this.link = `https://bsky.app/profile/${did}/post/${hash}`;
		this.user = Utils.normalizeText (Utils.formatText (data.author.displayName));
		this.info = `@${data.author.handle}${data.author.verification != null ? " [:yoann riou:9]" : ""}`;
		var record = (data.record != null) ? data.record : data.value;
		var txt = record.text;
		var arr = new TextEncoder().encode (txt);
		if (record.facets != null)
			for (var i = record.facets.length - 1; i >= 0; i--) {
				var facet = record.facets[i];
				if (facet.features[0]["$type"] == "app.bsky.richtext.facet#tag") {
					var htag = facet.features[0].tag;
					var tag = `[url=https://bsky.app/hashtag/${htag}][b]#${htag}[/b][/url]`;
					arr = new TextEncoder().encode (new TextDecoder().decode (arr.slice (0, facet.index.byteStart)) + tag + new TextDecoder().decode (arr.slice (facet.index.byteEnd)));
				}
				else if (facet.features[0]["$type"] == "app.bsky.richtext.facet#mention") {
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
		txt = new TextDecoder().decode (arr);
		this.text = Utils.normalizeText (txt);
		if (data.embed != null) {
			var med = (data.embed.media != null) ? data.embed.media : data.embed;
			if (med["$type"] == "app.bsky.embed.video#view") {
				var vid = new Video();
				vid.contentType = "application/x-mpegURL";
				vid.url = med.playlist;
				vid.poster = med.thumbnail;
				this.videos.push (vid);
			}
			var imgs = Array.isArray (data.embed.images) ? data.embed.images : (Array.isArray (data.embed.media?.images) ? data.embed.media.images : []);
			imgs.forEach (img => {
				this.images.push (new Hfr.Image (img.fullsize));
			});
			if (data.embed.external != null && imgs.length == 0) {
				var u = new URL (data.embed.external.uri);
				if (u.pathname.substring (u.pathname.lastIndexOf (".")) == ".gif")
					this.images.push (new Hfr.Image (data.embed.external.uri));
			}
			if (data.embed.record?.record != null)
				this.quote = new BlueSky (data.embed.record.record);
		}
		if (Array.isArray (data.embeds))
			data.embeds.forEach (embed => {
				if (embed["$type"] == "app.bsky.embed.video#view") {
					var vid = new Video();
					vid.contentType = "application/x-mpegURL";
					vid.url = embed.playlist;
					vid.poster = embed.thumbnail;
					this.videos.push (vid);
				}
				if (embed.images)
					embed.images.forEach (img => {
						this.images.push ({
							url : img.fullsize,
							toString : () => { return "[url=https://rehost.diberie.com/Rehost?url=" + img.fullsize + "][img]https://rehost.diberie.com/Rehost?size=min&url=" + img.fullsize + "[/img][/url]" }
						});
					});
			});
	}
}

class Mastodon extends Social {
	static load (url) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var match = Expr.mastodon.exec (url);
				if (match == null)
					match = Expr.truthsocial.exec (url);
				var uri = `https://${match.groups.instance}/api/v1/statuses/${match.groups.tid}`;
				Utils.request({
					method : "GET",
					url : uri,
					onabort : function() { reject (url); },
					onerror : function() { reject (url); },
					ontimeout : function() { reject (url); },
					headers : { "Cookie" : "" },
					anonymous : true,
					onload : function (response) {
						try {
							var data = JSON.parse (response.responseText);
							resolve (new Mastodon (data));
						}
						catch (e) {
							console.log (e);
							reject (url);
						}
					}
				});
			})();
		});
	}

	constructor (data) {
		super();

		var doc = new DOMParser().parseFromString (data.content, "text/html");
		var builder = new Builder();
		doc.querySelectorAll ("p").forEach (p => {
			p.childNodes.forEach (node => {
				if (node.nodeType == Node.TEXT_NODE)
					builder.append (Utils.normalizeText (node.textContent));
				else if (node.nodeType == Node.ELEMENT_NODE) {
					if (node.tagName.toLowerCase() == "br")
						builder.append ("\n");
					else if (node.classList.contains ("hashtag")) {
						var tag = node.textContent;
						var lnk = node.getAttribute ("href");
						builder.append (`[b][url=${lnk}]${tag}[/url][/b]`);
					}
					else if (node.classList.contains ("h-card") && node.querySelector ("a.u-url") != null) {
						var id = node.textContent;
						var lnk = node.querySelector ("a.u-url").getAttribute ("href");
						builder.append (`[b][url=${lnk}]${id}[/url][/b]`);
					}
					else if (node.tagName.toLowerCase() == "a")
						builder.append (`[b][url]${node.getAttribute ("href")}[/url][/b]`);
				}
			});
			builder.append ("\n");
		});

		if (data.poll != null)
			data.poll.options.forEach (opt => {
				var tit = opt.title;
				var pct = opt.votes_count * 100 / data.poll.votes_count;
				builder.append (`[*] ${tit} : ${pct} %\n`);
			});
		
		if (data.media_attachments != null)
			data.media_attachments.forEach (media => {
				if (media.type == "image")
					this.images.push (new Hfr.Image (media.preview_url));
				else if (media.type == "gifv") {
					var gif = new Video();
					gif.url = media.url;
					gif.contentType = "video/mp4";
					gif.poster = media.preview_url;
					gif.isGif = true;
					this.videos.push (gif);
				}
				else if (media.type == "video") {
					var video = new Video();
					video.url = media.url
					video.contentType = "video/mp4";
					video.poster = media.preview_url;
					this.videos.push (video);
				}
			});

		this.icon = "[img]https://rehost.diberie.com/Picture/Get/f/110911[/img]";
		this.link = data.url;
		this.user = Utils.normalizeText (data.account.display_name).replace (":verified:", "[:yoann riou:9]");
		var p = data.account.url.split("/");
		this.info = `${p[3]}@${p[2]}`;
		this.text = Utils.normalizeText (builder.toString());
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
	#vrt;

	constructor (vertical = false) {
		super ("div");

		this.#vrt = vertical;
	}

	add (widget) {
		super.add (widget);
		if (this.#vrt == true)
			this.element.appendChild (document.createElement ("br"));
	}
	
	clear() {
		while (this.children.length > 0)
			this.remove (this.children[0]);
	}
}

class Scale extends Widget {
	constructor (min, max) {
		super ("input");
		this.set ("type", "range");
		this.set ("min", min);
		this.set ("max", max);
	}

	changed (callback) {
		this.element.addEventListener ("change", e => {
			callback (e.target.value);
		});
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
			this.width = e.target.width;
			this.height = e.target.height;
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

class UploadService {
	isInvalid (file) {
		return file.size > 20000000;
	}

	uploadAsync (file) {
		return new Promise ((resolve, reject) => {
			this.upload (file, resolve, reject);
		});
	}
	
	static getService (service) {
		if (service == "rehost")
			return new Rehost();
		return new Imgur();
	}

	static getDefault() {
		var svc = Utils.getValue ("hfr-copie-colle-service");
		if (svc == "rehost")
			return new Rehost();
		return new Imgur();
	}
}

class Rehost extends UploadService {
	get name() { return "rehost"; }

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
				try {
					var object = JSON.parse (response.responseText);
					resolve ({
						gif : object.isGIF == true ? true : false,
						url : object.picURL,
						width : object.previewWidht,
						height : object.previewHeight
					});
				}
				catch (e) {
					reject (e);
				}
			}
		});
	}
}

class Imgur extends UploadService {
	get name() { return "imgur"; }

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
				if (!object.success) {
					reject (object);
					return;
				}
				resolve ({
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
					width : object.data.width,
					height : object.data.height
				});
			}
		});
	}
}

class Utils {
	static #oit;
	static #table_;
	static #hdialog;
	
	static set emojis (table) {
		Utils.#table_ = table;
	}
	
	static get emojis() {
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
	
	static addJs (url, module) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement ("script");
		script.setAttribute ("src", url);
		if (module)
			script.setAttribute ("type", "module");
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
				Utils.dropImage (file).then (Utils.displayImage).then (bbcode => {
					loading.destroy();
					area.disabled = false;
					Utils.insertText (area, bbcode);
					resolve();
				}).catch (e => {
					loading.destroy();
					area.disabled = false;
					console.log (e);
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
	
	static convertVideoURL (url) {
		return new Promise ((resolve, reject) => {
			Utils.request({
				method : "GET",
				url : url,
				onabort : function() { reject (url); },
				onerror : function() { reject (url); },
				ontimeout : function() { reject (url); },
				headers : { "Cookie" : "" },
				anonymous : true,
				responseType : "blob",
				onload : function (response) {
					try {
						resolve (URL.createObjectURL (response.response));
					}
					catch (e) {
						console.log (e);
						reject (url);
					}
				}
			});
		});
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
		if (!(data.emojis instanceof Array) || !data.hasOwnProperty ("version") || Number(data.version) === data.version && data.version < 16.2) {
			Utils.request({
				method : "GET",
				responseType : "json",
				url : "https://github.com/BZHDeveloper1986/hfr/raw/refs/heads/main/emojis-data-2.json",
				onload : function (response) {
					localStorage.setItem ("hfr-cc-data", JSON.stringify (response.response));
					callback (response.response.emojis);
				}
			});
		}
		else
			callback (data.emojis);
	}
	
	static isFormattable (text) {
		var array = Array.from (text);
		var uarray = [];
		for (var i = 0; i < array.length; i++) {
			uarray.push (array[i].codePointAt (0).toString (16));
		}
		var tmp = uarray.join ("-");
		var found = false;
		for (var i = 0; i < Utils.emojis.length; i++) {
			if (tmp.indexOf (Utils.emojis[i].code) > -1) {
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
		var ereg = /[#*0-9]\uFE0F?\u20E3|[\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E-\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED8\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])))?))?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3C-\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC2\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF]|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
		var emoji = "emojis";
		var emoji_size = Utils.getValue ("hfr-copie-colle-emoji", "micro");
		if (emoji_size != "normal")
			emoji += `-${emoji_size}`;
		return res_arr.join("").replaceAll (ereg, m => {return "[img]https://github.com/BZHDeveloper1986/hfr/blob/main/" + emoji + "/" + Utils.feofConvert ([...m].map (u => u.codePointAt(0).toString(16)).join("-")) + ".png?raw=true[/img]"; });
	}
	
	static feofConvert (code) {
		var fe0f = code.lastIndexOf ("-fe0f") + 5 == code.length;
		var c = fe0f ? code.substring (0, code.lastIndexOf("-fe0f")) : code;
		for (var i = 0; i < Utils.emojis.length; i++)
			if (Utils.emojis[i].code == c)
				return c;
		return code;
	}
	
	static formatText (text) {
		if (!Utils.isFormattable (text))
			return text;
		var emoji = "emojis";
		var emoji_size = Utils.getValue ("hfr-copie-colle-emoji", "micro");
		if (emoji_size != "normal")
			emoji += `-${emoji_size}`;
		var array = Array.from (text);
		var uarray = [];
		for (var i = 0; i < array.length; i++) {
			uarray.push (array[i].codePointAt (0).toString (16));
		}
		var tmp = uarray.join ("-");
		var result = ""; 
		while (tmp.length > 0) {
			var found = false;
			for (var i = 0; i < Utils.emojis.length; i++) {
				if (tmp.indexOf (Utils.emojis[i].code) == 0) {
					result  = result + "[img]https://github.com/BZHDeveloper1986/hfr/blob/main/" + emoji + "/" + Utils.feofConvert (Utils.emojis[i].code) + ".png?raw=true[/img]";
					tmp = tmp.substring (1 + Utils.emojis[i].code.length);
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
							var detail = Utils.getValue ("hfr-copie-colle-detail", "non");
							if (detail == "non")
								resolve (`[url=${link}][b]${title}[/b][/url]\n\n[url=${link}][img]${img}[/img][/url]`);
							else
								resolve (`[url=${link}][b]${title}[/b][/url]\n\n${desc}\n\n[url=${link}][img]${img}[/img][/url]`);
						} catch (e) {
							console.log (e);
							reject (link);
						}
					}
				});
			})();
		});
	}
	
	static dropText (text) {
		return new Promise ((resolve, reject) => {
			(async () => {
				if (Social.match (text)) {
					Social.load (text).then (msg => {
						resolve (msg.toString());
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
				var sel = doc.querySelectorAll ("span[id^='docs-internal-guid'] > span > img");
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

	static getImageInfo (url) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var img = new Image();
				img.onload = function() {
					resolve ({width: img.width, height: img.height});
				};
				img.onerror = function() {
					reject (url);
				};
				img.src = url;
			})();
		});
	}

	static pasteDefault (link) {
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
						try {
							var doc = new DOMParser().parseFromString (response.responseText, "text/html");
							var m = doc.querySelector ("head > meta[property='og:image']");
							if (m == null)
								reject (link);
							else {
								var img = "https://rehost.diberie.com/Rehost?url=" + encodeURIComponent (m.getAttribute ("content"));
								Utils.getImageInfo (m.getAttribute ("content")).then (info => {
									var title = doc.querySelector ("head > title").textContent;
									var site = doc.querySelector ("head > meta[property='og:site_name']").getAttribute ("content");
									var desc = doc.querySelector ("head > meta[name='description']").getAttribute ("content");
									var w = Math.floor (info.width * 200 / info.height);
									var h = 200;
									var detail = Utils.getValue ("hfr-copie-colle-detail", "non");
									if (detail == "non")
										resolve (`[url=${link}][b]${title}[/b][/url]\n[url=${link}][img=${w},${h}]${img}[/img][/url]`);
									else
										resolve (`[url=${link}]${site}[/url]\n\n[url=${link}][b]${title}[/b][/url]\n\n[url=${link}]${desc}[/url]\n[url=${link}][img=${w},${h}]${img}[/img][/url]`);
								}).catch (e => {
									console.log (e);
									reject (link);
								});
							}
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
	
	static pasteText (item) {
		return new Promise ((resolve, reject) => {
			(async () => {
				var blob = await item.getType ("text/plain");
				var text = await blob.text();
				if (Social.match (text)) {
					Social.load (text).then (msg => msg.build()).then (txt => resolve (txt)).catch (e => {
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
						console.log ("id : " + id);
						if (id != null)
							Utils.pasteYoutube (text, id).then (txt => {
								resolve (txt);
							}).catch (e => {
								console.log (e);
								reject (text);
							});
						else
							Utils.request({
								method : "HEAD",
								url : text,
								onabort : function() { reject (text); },
								ontimeout : function() { reject (text); },
								onerror : function() { reject (text); },
								headers : { "Cookie" : "" },
								anonymous : true,
								onload : function (response) {
									var headers = Headers.parse (response.responseHeaders);
									if (headers.getHeader ("content-type").indexOf ("text/html") >= 0) {
										Utils.pasteDefault (text).then (txt => {
											resolve (txt);
										}).catch (e => {
											console.log (e);
											reject (text);
										});
									}
									else
										reject (text);
								}
							});
					}
					catch (e) {
						console.log (e);
						reject (text);					
					}
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
		var service = UploadService.getDefault();
		if (service.isInvalid (file)) {
			rej ("fichier invalid pour ls service " + service.name);
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
			if (event.shiftKey) {
				return;
			}
			if (!navigator?.clipboard?.read)
				alert ("navigator.clipboard.read : fonction non présente ou non activée.\nVous êtes sur Firefox : suivre ce lien https://forum.hardware.fr/hfr/Discussions/Viepratique/scripts-infos-news-sujet_116015_240.htm#t67904757")
			else
				navigator.clipboard.read().then(array => {
					for (var item of array) {
						if (Utils.isGDoc (item)) {
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
											Utils.insertText (event.target, "[url=" + upload.url + "][img]" + upload.url + "[/img][/url]");	
											loading.destroy();
											event.target.disabled = false;
											event.target.focus();
										}
										else
											Utils.displayImage (upload).then (bbcode => {
												Utils.insertText (event.target, bbcode);
												loading.destroy();
												event.target.disabled = false;
												event.target.focus();
											}).catch (e => {
												console.log (e);
												loading.destroy();
												event.target.disabled = false;
												event.target.focus();
											});
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

	static displayImage (upload) {
		console.log (upload);
		return new Promise ((res, rej) => {
			var dialog = new Dialog();
			dialog.closed (d => { d.destroy(); rej ("annulé"); });
			dialog.title = "prévisualisation de l'image";
			var src = upload.url;
			var button = new TextButton ("400 px");
			var img = new Picture (src);
			var scale = new Scale (100, 800);
			var box = new Box (true);
			var hbox = new Box();
			hbox.add (scale);
			hbox.add (button);
			box.add (hbox);
			box.add (img);
			img.loaded ((w,h) => {
				if (w > 800) {
					img.height = Math.floor (800 * h / w);
					img.width = 800;
				}
				if (h > 800) {
					img.width = Math.floor (800 * w / h);
					img.height = 800;
				}
				button.set ("bbcode", `[url=${upload.url}][img=${img.width},${img.height}]${upload.url}[/img][/url]`);
			});
			dialog.content = box;
			scale.changed (val => {
				var w = img.width, h = img.height;
				img.height = val;
				img.width = Math.floor (val*w/h);
				button.text = `${val} px`;
				button.set ("bbcode", `[url=${upload.url}][img=${img.width},${img.height}]${upload.url}[/img][/url]`);
			});
			scale.set ("value", 400);
			
			button.clicked (self => { dialog.destroy(); res (button.get ("bbcode")); });
			dialog.display();
		});
	}
	
	static drop (event) {
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
							Utils.insertText (event.target, "[url=" + upload.url + "][img]" + src + "[/img][/url]");	
							loading.destroy();
							event.target.disabled = false;
						}
						else {
							Utils.displayImage (upload).then (bbcode => {
								Utils.insertText (event.target, bbcode);
								loading.destroy();
								event.target.disabled = false;
							}).catch (e => {
								loading.destroy();
								event.target.disabled = false;
								console.log (e);
							});
						}
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
				 if (item.type == "text/plain") {
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

Utils.registerCommand ("Copie/Colle -> taille des emojis", () => {
	var taille = prompt ("Entrez ici la taille de l'emoji (micro, mini ou normal) ('micro' par défaut)", Utils.getValue ("hfr-copie-colle-emoji", "micro"));
	Utils.setValue ("hfr-copie-colle-emoji", (taille == "mini" || taille == "normal") ? taille : "micro");
});

Utils.registerCommand ("Copie/Colle -> détail des liens", () => {
	var detail = prompt ("Entrez ici si vous voulez le détail des liens collés (oui ou non) ('non' par défaut)", Utils.getValue ("hfr-copie-colle-detail", "non"));
	Utils.setValue ("hfr-copie-colle-detail", (detail == "oui") ? "oui" : "non");
});

Utils.init (table => {
	Utils.emojis = table;
	Utils.addCss ("https://vjs.zencdn.net/8.0.4/video-js.css");
	Utils.addJs ("https://vjs.zencdn.net/8.0.4/video.js");
	Utils.addJs ("https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js", true);
	
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
			if (href.indexOf ("https://files.mastodon.social/media_attachments/files/") == 0 && u.pathname.endsWith (".mp4") ||
					href.indexOf ("https://static-assets-1.truthsocial.com/tmtg:prime-ts-assets/media_attachments/files/") == 0 && u.pathname.endsWith (".mp4") ||
					href.indexOf ("https://v.redd.it/") == 0 || href.indexOf ("https://video.bsky.app/watch/") == 0 || u.searchParams.get("hfr-cc-insta") == "true") {
				var video = link.createPlayer (u.searchParams.get("gif") == "true");
				video.player.src ({ src : href });
			}
			else if (href.indexOf ("https://video.twimg.com/") == 0) {
				var video = link.createPlayer (u.searchParams.get("gif") == "true");
				Utils.convertVideoURL (href).then (uri => {
					video.player.src ({ src : uri, type : "video/mp4" });
				});
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
		var u = null;
		try {
			u = new URL (href);
		}
		catch {
			return;
		}
		if (u.hostname == "store10.gofile.io" && u.pathname.indexOf ("/download") == 0 && u.searchParams.get("isAudio") == "true") {
			var audio = document.createElement ("audio");
			audio.setAttribute ("src", href);
			audio.setAttribute ("controls", "controls");
			link.parentNode.replaceChild (audio, link);
		}
		if (link.firstElementChild == null || link.firstElementChild.nodeName.toLowerCase() != "img")
			return;
		if (href.indexOf ("https://files.mastodon.social/media_attachments/files/") == 0 && u.pathname.endsWith (".mp4") ||
				href.indexOf ("https://static-assets-1.truthsocial.com/tmtg:prime-ts-assets/media_attachments/files/") == 0 && u.pathname.endsWith (".mp4") ||
				href.indexOf ("https://v.redd.it/") == 0 || href.indexOf ("https://packaged-media.redd.it/") == 0 || href.indexOf ("https://video.bsky.app/watch/") == 0 ||
				u.searchParams.get("hfr-cc-insta") == "true") {

			var video = link.createPlayer (u.searchParams.get("gif") == "true");
			video.player.src ({ src : href, type : "video/mp4"  });
		}
		else if (href.indexOf ("https://video.twimg.com/") == 0) {
			var video = link.createPlayer (u.searchParams.get("gif") == "true");
			Utils.convertVideoURL (href).then (uri => {
				video.player.src ({ src : uri, type : "video/mp4" });
			});
		}
	});
});
