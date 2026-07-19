// ==UserScript==
// @author        BZHDeveloper
// @name          [HFR] warez search
// @version       0.0.5
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
	#d;
	#s;
	
	constructor (u, s, t, i, p, dstr, size) {
		this.#str = s;
		this.#uri = u;
		this.#ttype = t;
		this.#sid = i;
		this.#img = p;
		this.#d = new Date (dstr);
		this.#s = size;
	}
	
	get size() {
		return this.#s;
	}

	get date() {
		return this.#d;
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
		var icons = ["🎞️", "📖", "🎵", "⚙️", "🎮", "📦", "📺", "❓" ];
		return icons[this.#ttype];
	}
	
	get type() {
		return this.#ttype;
	}
	
	get logo() {
		if (this.id == "c411")
			return "https://i.imgur.com/SDmDkHh.png";
		if (this.id == "tr4ker")
			return "https://i.imgur.com/Oh6yvGP.png";
		return "https://i.imgur.com/2D1mMMm.png";
	}
	
	get image() {
		return this.#img;
	}
}

function printSize (size){
	var s = size;
	var i = 0;
	while (s > 1024) {
		s = s / 1024;
		i++;
	}
	var a = [ "B", "KB", "MB", "GB", "TB" ];
	
	return s.toFixed(2) + " " + a[i];
}

let Hfr = {
	searchTr4ker : function (query) {
		return new Promise ((resolve, reject) => {
			var arr = [ "films", "livres", "audio", "applications", "jeux-video", "impression-3d", "series" ];
			var items = [];
			Hfr.fetch ("https://tr4ker.net/api/torrents?q=" + query + "&limit=20&search_in=title")
			.then (rep => rep.json())
			.then (json => {
				json.torrents.forEach (torrent => {
					var link = "https://tr4ker.net/torrent/" + torrent.slug;
					var name = torrent.name;
					var idx = arr.indexOf (torrent.parent_cat_slug);
					var i =  idx < 0 ? 7 : idx;
					console.log (torrent.classic_cover_url);
					var img = torrent.classic_cover_url == null ? "https://i.imgur.com/Z6I332D.png" : torrent.classic_cover_url;
					items.push (new SearchItem (link, name, i, "tr4ker", img, torrent.created_at, torrent.size_bytes));
				});
				resolve (items);
			})
			.catch (e => reject ("tr4ker déconne"));
		});
	},
	searchVidlox : function (query) {
		return new Promise ((resolve, reject) => {
			Hfr.fetch ("https://www.vidlox4.cc/recherche/" + query)
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
					var tstr = tr.querySelector("td.liste-accueil-taille").textContent.trim();
					var tsize = parseInt (tstr.split (" ")[0]);
					var trange = tstr.split (" ")[1].toLowerCase();
					if (trange == "kb")
						tsize = tsize * 1024;
					if (trange == "mb")
						tsize = tsize * 1024 * 1024;
					if (trange == "gb")
						tsize = tsize * 1024 * 1024 * 1024;
					if (trange == "tb")
						tsize = tsize * 1024 * 1024 * 1024 * 1024;
					var now = new Date();
					var d = new Date();
					var dstr = tr.querySelector("td.date").textContent.trim();
					var c = parseInt (dstr.split (" ")[0]);
					var r = dstr.split (" ")[1].toLowerCase();
					if (r == "minutes" || r == "minute")
						c = c * 60 * 1000;
					if (r == "heures" || r == "heure")
						c = c * 60 * 60 * 1000;
					if (r == "jours" || r == "jour")
						c = c * 24 * 60 * 60 * 1000;
					if (r == "mois")
						c = c * 30 * 24 * 60 * 60 * 1000;
					if (r == "ans" || r == "an")
						c = c * 365 * 24 * 60 * 60 * 1000;
					d.setTime (now.getTime() - c);
					items.push (new SearchItem (l, n, t, "vidlox", i, d, tsize));
				});
				resolve (items);
			})
			.catch (e => reject ("vidlox pue"));
		});
	},
	searchC411 : function (query) {
		return new Promise ((resolve, reject) => {
			Hfr.fetch ("https://c411.org/api/torrents?page=1&perPage=25&sortBy=relevance&sortOrder=desc&name=" + query.replace (" ", "+"))
			.then (rep => rep.json())
			.then (json => {
				var items = [];
				console.log (json);
				json.data.forEach (item => {
					var type = item.category.id - 1;
					if (item.category.id == 10)
						type = 5;
					var i = (item.posterUrl != null) ? item.posterUrl : "https://i.imgur.com/Z6I332D.png";
					items.push (new SearchItem ("https://c411.org/torrents/" + item.infoHash, item.name, type, "c411", i, item.createdAt, item.size));
				});
				resolve (items);
			})
			.catch (err => { reject ("c411 pue"); });
		});
	},
	searchTgx : function (query) {
		return new Promise ((resolve, reject) => {
			Hfr.fetch ("https://torrentgalaxy.one/get-posts/keywords:" + query.replace (" ", "%20") + ":format:json/")
			.then (rep => rep.json())
			.then (json => {
				var items = [];
				json.results.forEach (item => {
					var i = (item.t != null) ? "https://i.rar.pics" + item.t : "https://i.imgur.com/Z6I332D.png";
					items.push (new SearchItem ("https://torrentgalaxy.one/post-detail/" + item.pk + "/" + item.n.replace (" ", "%20") + "/", item.n, 0, "tgx", i));
				});
				resolve (items);
			})
			.catch (err => { reject ("tgx pue"); });
		});
	},
	search : function (query) {
		return new Promise ((resolve, reject) => {
				Promise.allSettled([
					Hfr.searchTr4ker(query),
					Hfr.searchC411(query),
					Hfr.searchVidlox(query)
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
				onload : function (response) { resolve (new Hfr.Response (response)); }
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
				onload : function (response) { resolve (new Hfr.Response (response)); }
			});
		});
	},
	Table : class {
		#table;
		#body;
		#list;
		#now;

		constructor (names) {
			this.#now = new Date();
			this.#table = document.createElement ("table");
			var thead = document.createElement ("thead");
			thead.style = "text-align: center";
			var trh = document.createElement ("tr");
			names.forEach (name => {
				var th = document.createElement ("th");
				th.addEventListener ("click", e => {
					if (name == "tracker")
						this.#list.sort ((a, b) => {
							return th.getAttribute ("ordered") == "true" ? b.id.localeCompare (a.id) : a.id.localeCompare (b.id);
						});
					else if (name == "type")
						this.#list.sort ((a, b) => {
							return th.getAttribute ("ordered") == "true" ? b.type - a.type : a.type - b.type;
						});
					else if (name == "date")
						this.#list.sort ((a, b) => {
							return th.getAttribute ("ordered") == "true" ? b.date - a.date : a.date - b.date;
						});
					else if (name == "taille")
						this.#list.sort ((a, b) => {
							return th.getAttribute ("ordered") == "true" ? b.size - a.size : a.size - b.size;
						});
					else
						this.#list.sort((a, b) => {
							return th.getAttribute ("ordered") == "true" ? b.name.localeCompare(a.name) : a.name.localeCompare (b.name);
						});
					this.update();
					th.setAttribute ("ordered", th.getAttribute ("ordered") == "true" ? "false" : "true");
					th.removeChild (th.firstChild);
					th.appendChild (document.createTextNode ((th.getAttribute ("ordered") == "true" ? "⬇️ " : "⬆️ ") + name));
				});
				th.appendChild (document.createTextNode ("⬇️ " + name));
				trh.appendChild (th);
			});
			thead.appendChild (trh);
			this.#table.appendChild (thead);
			this.#body = document.createElement ("tbody");
			this.#table.appendChild (this.#body);
		}

		get element() {
			return this.#table;
		}

		get items() {
			return this.#list;
		}

		update() {
			while (this.#body.childNodes.length > 0)
				this.#body.removeChild (this.#body.firstChild);
			var count = parseInt (Hfr.getValue ("hfr-warez-search-nb","30"));
			var i = 0;
			this.#list.forEach (item => {
				if (i > count)
					return;
				i++;
				var tr = document.createElement ("tr");
				
				var tdl = document.createElement ("td");
				var img = document.createElement ("img");
				img.setAttribute ("src", item.logo);
				tdl.appendChild (img);
				tr.appendChild (tdl);
				
				var td0 = document.createElement ("td");
				td0.appendChild (document.createTextNode (item.icon));
				tr.appendChild (td0);
				
				var td1 = document.createElement ("td");
				var diff = this.#now - item.date;
				var dstr = diff + " ms";
				if (diff > 1000) {
					diff = diff / 1000;
					dstr = Math.round (diff) + " s";
					if (diff > 60) {
						diff = diff / 60;
						dstr = Math.round (diff) + " min";
						if (diff > 60) {
							diff = diff / 60;
							dstr = Math.round (diff) + " h";
							if (diff > 24) {
								diff = diff / 24;
								dstr = Math.round (diff) + " j";
								if (diff > 31) {
									diff = diff / 31;
									dstr = Math.round (diff) + " mois";
									if (diff > 12) {
										diff = diff / 12;
										dstr = Math.round (diff) + " ans";
									}
								}
							}
						}
					}
				}
				td1.appendChild (document.createTextNode (dstr));
				tr.appendChild (td1);

				var img = document.createElement("img");
				img.height = 1;
				img.src = item.image;
				img.style.visibility = "hidden";
				tr.addEventListener("mouseleave", e => {
					img.style.visibility = "hidden";
				});
				tr.addEventListener ("mousemove", e => {
					img.style.visibility = "visible";
					img.style.position = 'absolute';
					img.style.height = '200px';
					img.style.top = (e.pageY || e.clientY) + 'px';
					img.style.left = (e.pageX || e.clientX) + 'px';
				});
				tr.setAttribute ("data-url", item.url);
				tr.addEventListener ("click", () => {
					Hfr.open (tr.getAttribute ("data-url"), true);
				});
				var td2 = document.createElement("td");
				td2.style = "overflow-x: hidden";
				td2.appendChild (document.createTextNode(item.name));
				td2.appendChild (img);
				tr.appendChild (td2);
				var td3 = document.createElement("td");
				td3.style = "overflow-x: hidden";
				td3.appendChild (document.createTextNode(printSize (item.size)));
				tr.appendChild (td3);

				this.#body.appendChild (tr);
			});
		}

		set items (list) {
			this.#list = list;
			this.update();
		}
	}
};

var url = new URL (document.location);
if (url.searchParams.get("cat") != "prive" || url.searchParams.get("post") != "2685910")
	return;

var div_result = document.createElement("div");
div_result.style = "margin: 5px 0px 0px; overflow-y: auto; max-height: 300px; height: auto;";
var table = new Hfr.Table ([ "tracker", "type", "date", "titre", "taille" ]);
div_result.appendChild (table.element);
var div = document.createElement("div");
div.appendChild (document.createTextNode ("🏴‍☠️"));
var input = document.createElement("input");
input.setAttribute("id", "hfr-warez-search");
div.appendChild (input);
var button = document.createElement ("input");
button.setAttribute ("type", "button");
button.setAttribute ("value", "recherche");
button.addEventListener ("click", e => {
	var now = new Date();
	Hfr.search (input.value).then (items => {
		table.items = items;
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
