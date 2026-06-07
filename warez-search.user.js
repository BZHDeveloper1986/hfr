// ==UserScript==
// @author        BZHDeveloper
// @name          [HFR] warez search
// @version       0.0.2
// @namespace     forum.hardware.fr
// @description   recherche de contenu
// @icon          https://github.com/BZHDeveloper1986/hfr/blob/main/hfr-logo.png?raw=true
// @downloadURL   https://github.com/BZHDeveloper1986/hfr/raw/refs/heads/main/warez-search.user.js
// @updateURL     https://github.com/BZHDeveloper1986/hfr/raw/refs/heads/main/warez-search.user.js
// @include       https://forum.hardware.fr/*
// @noframes
// @grant         GM.info
// @grant         GM.xmlHttpRequest
// @grant         GM_xmlhttpRequest
// @grant         GM_openInTab
// @grant         GM.registerMenuCommand
// @grant         GM_registerMenuCommand
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM.getValue
// @grant         GM.setValue
// ==/UserScript==

class SearchItem {
	#uri;
	#str;
	#ttype;
	#sid;
	#img;
	
	constructor (u, s, t, i, p) {
		this.#str = s;
		this.#uri = u;
		this.#ttype = t;
		this.#sid = i;
		this.#img = p;
	}
	
	get url() {
		return this.#uri;
	}
	
	get name() {
		return this.#str;
	}
	
	get id() {
		return this.#sid;
	}
	
	get icon() {
		var icons = ["🎞️", "📖", "🎵", "⚙️", "🎮", "📦", "📺" ];
		return icons[this.#ttype];
	}
	
	get type() {
		return this.#ttype;
	}
	
	get image() {
		return this.#img;
	}
}

let Hfr = {
	searchVidlox : function (query) {
		return new Promise ((resolve, reject) => {
			Hfr.fetch ("https://www.vidlox2.cc/recherche/" + query)
			.then (rep => rep.html())
			.then (doc => {
				var items = [];
				doc.querySelectorAll ("table.table tbody tr").forEach (tr => {
					var arr = {
						"films" : 0,
						"vidéos" : 0,
						"séries" : 6,
						"musiques" : 2,
						"livres" : 1,
						"logiciels" : 3,
						"jeux-consoles" : 4,
						"jeux-pc" : 4
					};
					var t = arr[tr.querySelector("td.type i").getAttribute("class").toLowerCase()];
					var a = tr.querySelector("td.liste-accueil-nom > div > a");
					var n = a.firstChild.textContent;
					var l = "https://www.vidlox2.cc" + a.getAttribute("href");
					var i = tr.querySelector ("span.WinOption1 img").getAttribute("src");
					items.push (new SearchItem (l, n, t, "vidlox", i));
				});
				resolve (items);
			})
			.catch (e => reject (e));
		});
	},
	searchC411 : function (query) {
		return new Promise ((resolve, reject) => {
			Hfr.fetch ("https://c411.org/api/torrents?page=1&perPage=25&sortBy=createdAt&sortOrder=desc&name=" + query)
			.then (rep => rep.json())
			.then (json => {
				var items = [];
				json.data.forEach (item => {
					var type = item.category.id - 1;
					if (item.category.id == 10)
						type = 5;
					var i = typeof (item.posterUrl == "string") ? item.posterUrl : "https://i.imgur.com/Z6I332D.png";
					items.push (new SearchItem ("https://c411.org/torrents/" + item.infoHash, item.name, type, "c411", i));
				});
				resolve (items);
			})
			.catch (err => { reject (err); });
		});
	},
	searchTgx : function (query) {
		return new Promise ((resolve, reject) => {
			Hfr.fetch ("https://torrentgalaxy.one/get-posts/keywords:" + query.replace (" ", "%20") + ":format:json/")
			.then (rep => rep.json())
			.then (json => {
				var items = [];
				json.results.forEach (item => {
					items.push (new SearchItem ("https://torrentgalaxy.one/post-detail/" + item.pk + "/" + item.n.replace (" ", "%20") + "/", item.n, 0, "tgx", item.t));
				});
				resolve (items);
			})
			.catch (err => { reject (err); });
		});
	},
	search : function (query) {
		return new Promise ((resolve, reject) => {
				Promise.allSettled([
					Hfr.searchVidlox(query),
					Hfr.searchC411(query),
					Hfr.searchTgx(query)
				]).then (results => {
					var items = [];
					results.forEach (r => {
						if (r.status == "fulfilled")
							items = items.concat (r.value);
						else
							console.log (r);
					});
					resolve (items);
				}).catch (e => reject (e));
		});
	},
	request : function (data) {
		if (typeof (GM.xmlHttpRequest) == "function")
			return GM.xmlHttpRequest (data);
		return GM_xmlhttpRequest (data);
	},
	command : function (title, callback) {
		if (typeof (GM.registerMenuCommand) == "function")
			GM.registerMenuCommand (title, callback);
		else
			GM_registerMenuCommand (title, callback);
	},
	getValue : function (key, default_val) {
		if (typeof (GM_getValue) == "function")
			return GM_getValue (key, default_val);
		var rk = GM.info.script.name + " :: " + key;
		if (!localStorage.hasOwnProperty (rk))
			return default_val;
		var data = localStorage.getItem (rk);
		try {
			var obj = JSON.parse (data);
			return obj;
		}
		catch(e) {}
		return data;
	},
	setValue : function (key, data) {
		if (typeof (GM_setValue) == "function") {
			GM_setValue (key, data);
			return;
		}
		if (typeof (data) === "object")
			localStorage.setItem (GM.info.script.name + " :: " + key, JSON.stringify (data));
		else
			localStorage.setItem (GM.info.script.name + " :: " + key, data);
	},
	open : function (url, silent) {
		if (typeof(GM.openInTab) == "function")
			GM.openInTab (url, silent);
		else
			GM_openInTab (url, silent);
	},
	Headers : class {
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
			var headers = new Hfr.Headers();
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
	},
	Response : class {
		#hdr;
		#data;

		constructor (r) {
			this.#hdr = Hfr.Headers.parse (r.responseHeaders);
			this.#data = r.response.slice (0, r.response.size, this.#hdr.contentType);
		}

		get headers() {
			return this.#hdr;
		}

		blob() {
			return Promise.resolve (this.#data);
		}

		text() {
			return this.#data.text();
		}

		html() {
			return new Promise ((resolve, reject) => {
				this.text().then (txt => {
					try {
						var parser = new DOMParser();
						var doc = parser.parseFromString (txt, "text/html");
						resolve (doc);
					}
					catch {
						reject (txt);
					}
				}).catch (reject);
			});
		}

		json() {
			return new Promise ((resolve, reject) => {
				this.text().then (txt => {
					try {
						var obj = JSON.parse (txt);
						resolve (obj);
					}
					catch {
						reject (txt);
					}
				}).catch (reject);
			});
		}
	},
	fetch : function (url, headers) {
		return new Promise ((resolve, reject) => {
			var rh = {};
			if (headers != null)
			for (const [k,v] of Object.entries (headers))
				rh[k] = v;
			Hfr.request({
				method : "GET",
				url : url,
				headers : rh,
				onabort : function() { reject (url); },
				onerror : function() { reject (url); },
				ontimeout : function() { reject (url); },
				responseType : "blob",
				onload : function (response) {
					resolve (new Hfr.Response (response));
				}
			});
		});
	},
	post : function (url, data, headers) {
		var fdata = new FormData();
		for (const [k,v] of Object.entries (data))
			fdata.append (k, v);
		var rh = {};
		if (headers != null)
			for (const [k,v] of Object.entries (headers))
				rh[k] = v;
		return new Promise ((resolve, reject) => {
			Hfr.request ({
				method : "POST",
				data : fdata,
				headers : rh,
				url : url,
				responseType : "blob",
				onabort : function() { reject ("envoi annulé"); }, 
				ontimeout : function() { reject ("délai dépassé"); },
				onerror : function () { reject ("erreur lors de l'envoi d'image"); },
				onload : function (response) { console.log ("prout"); console.log (response);  resolve (new Hfr.Response (response)); }
			});
		});
	},
	postJSON : function (url, data, headers) {
		var rh = {};
		if (headers != null)
			for (const [k,v] of Object.entries (headers))
				rh[k] = v;
		var json = JSON.stringify(data);
		rh["Content-Type"] = "application/json";
		rh["Content-Lenght"] = json.length;
		return new Promise ((resolve, reject) => {
			Hfr.request ({
				method : "POST",
				data : json,
				headers : rh,
				url : url,
				responseType : "blob",
				onabort : function() { reject ("envoi annulé"); }, 
				ontimeout : function() { reject ("délai dépassé"); },
				onerror : function () { reject ("erreur lors de l'envoi d'image"); },
				onload : function (response) { console.log ("prout"); console.log (response);  resolve (new Hfr.Response (response)); }
			});
		});
	}
};

var url = new URL (document.location);
if (url.searchParams.get("cat") != "prive" || url.searchParams.get("post") != "2685910")
	return;

var div_result = document.createElement("div");
div_result.style = "margin: 5px 0px 0px; overflow-y: auto; max-height: 300px; height: auto;";
var div = document.createElement("div");
div.appendChild (document.createTextNode ("🏴‍☠️"));
var input = document.createElement("input");
input.setAttribute("id", "hfr-warez-search");
div.appendChild (input);
var button = document.createElement ("input");
button.setAttribute ("type", "button");
button.setAttribute ("value", "recherche");
button.addEventListener ("click", e => {
	Hfr.search (input.value).then (items => {
		while (div_result.childNodes.length > 0)
			div_result.removeChild (select.firstChild);
		var count = parseInt (Hfr.getValue ("hfr-warez-search-nb","30"));
		var i = 0;
		items.forEach (item => {
			if (i >= count)
				return;
			var img = document.createElement("img");
			img.src = item.image;
			img.height = 100;
			img.title = item.name;
			img.setAttribute ("data-url", item.url);
			img.addEventListener ("click", () => {
				Hfr.open (img.getAttribute ("data-url"), true);
			});
			div_result.appendChild (img);
			i++;
		});
	}).catch (err => { console.log (err); });
});
div.appendChild(button);
div.appendChild(document.createElement("br"));
div.appendChild(div_result);

var ta = document.querySelector("#content_form");
ta.parentElement.appendChild (div);

Hfr.command ("[HFR] warez search > nombre de résultats", () => {
	var str = prompt ("Entrez ici le nombre de résultats dans la liste de recherche", Hfr.getValue ("hfr-warez-search-nb","30"));
	var count = isNaN(parseInt(str)) ? "30" : str;
	Hfr.setValue ("hfr-warez-search-nb", count);
});
