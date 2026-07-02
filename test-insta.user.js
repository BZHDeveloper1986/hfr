// ==UserScript==
// @author        BZHDeveloper
// @name          [HFR] test insta
// @version       0.0.4
// @namespace     forum.hardware.fr
// @description   caca
// @icon          https://github.com/BZHDeveloper1986/hfr/blob/main/hfr-logo.png?raw=true
// @include       https://www.instagram.com
// @include       https://www.instagram.com/*
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


let Hfr = {
	isGM4 : function(){
		return typeof (GM) === "object" && typeof (GM.info) === "object" && GM.info.scriptHandler == "Greasemonkey" && parseFloat(GM.info.version) >= 4;
	},
	request : function (object) {
		if (Hfr.isGM4())
			return GM.xmlHttpRequest (object);
		else
			return GM_xmlhttpRequest (object);
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
	fetch : function (url, object) {
		return new Promise ((resolve, reject) => {
			var req = {
				method : "GET",
				url : url,
				headers : {},
				onabort : function() { reject (url); },
				onerror : function() { reject (url); },
				ontimeout : function() { reject (url); },
				responseType : "blob",
				onload : function (response) {
					resolve (new Hfr.Response (response));
				}
			};
			if (typeof (object) == "object") {
				if (object.hasOwnProperty ("method"))
					req.method = object["method"];
				if (object.hasOwnProperty("body"))
					req.data = object["body"];
				if (object.hasOwnProperty ("headers") && typeof (object["headers"] == "object")) {
					for (const [k,v] of Object.entries (object["headers"]))
						req.headers[k] = v;
				}
				if (typeof (object["referrer"]) == "string")
					req.headers["Referer"] = object["referrer"];
				if (typeof (object["referrerPolicy"]) == "string")
					req.headers["Referrer-Policy"] = object["referrerPolicy"];
				if (typeof (object["credentials"]) == "string")
					req.anonymous = object["credentials"] != "include";
			}
			Hfr.request (req);
		});
	},
	Data : class {
		#obj;
		#uurl;
		#numrep;

		constructor (post, numrep, data) {
			this.#obj = data;
			this.numrep = numrep;
			this.#uurl = "https://forum.hardware.fr/message.php?config=hfr.inc&cat=prive&post=" + post + "&numreponse=" + numrep + "&page=1&p=1&subcat=0&sondage=0&owntopic=0";
			this.#uurl = "https://forum.hardware.fr/message.php?config=hfr.inc&cat=prive&post=3198202&numreponse=1980713758&page=1&p=1&subcat=0&sondage=0&owntopic=0#formulaire";
			console.log (this.#uurl);
		}

		update() {
			Hfr.fetch (this.#uurl)
			.then (rep => rep.html())
			.then (doc => {
				console.log (doc);
				var form = doc.querySelector ("#hop");
				console.log (form);
				form.querySelector("#content_form").value = JSON.stringify (this.#obj);
				var fdata = new FormData (form);
				console.log  (fdata);
				Hfr.fetch ("https://forum.hardware.fr/bdd.php?config=hfr.inc", {
					method : "POST",
					body : fdata
				}).then (r => r.html()).then (d => console.log (d))
				.catch (e => console.log (e));
			})
			.catch (caca => {
				console.log (caca);
			});
		}

		get data() {
			return this.#obj;
		}

		static create (id, json) {
			return new Promise ((resolve, reject) => {
				Hfr.fetch ("https://forum.hardware.fr/message.php?config=hfr.inc&cat=prive&sond=0&p=1&subcat=0&dest=&subcatgroup=0")
				.then (rep => rep.html())
				.then (doc => {
					var form = doc.querySelector ("#hop");
					console.log (form);
					form.querySelector("#dest").value = "MultiMP";
					form.querySelector("#topic_title").value = id;
					form.querySelector("#content_form").value = JSON.stringify (json);
					var fdata = new FormData (form);
					Hfr.fetch ("https://forum.hardware.fr/bddpost.php?config=hfr.inc", {
						method : "POST",
						body : fdata
					})
					.then (r => r.html())
					.then (d => resolve (d))
					.catch (e => reject (e));
				})
				.catch (e => reject (e));
			});
		}

		static get (id, user) {
			return new Promise ((resolve, reject) => {
				Hfr.fetch ("https://forum.hardware.fr/forum1.php?config=hfr.inc&cat=prive&page=1")
				.then (rep => rep.html())
				.then (doc => {
					var found = false;
					doc.querySelectorAll(".sujetCase3 .cCatTopic").forEach (a => {
						if (found)
							return;
						if (a.textContent == id) {
							found = true;
							var u = new URL ("https://forum.hardware.fr/" + a.getAttribute ("href"));
							var post = u.searchParams.get ("post");
							Hfr.fetch (u.toString())
							.then (r => r.html())
							.then (d => {
								var numrep = d.querySelector("[action='/transsearch.php'] [name='firstnum']").value;
								console.log ("numrep: " + numrep);
								var s = d.querySelector(".messCase2 p").textContent;
								try {
									var data = JSON.parse (s);
									resolve (new Hfr.Data (post, numrep, data));
								}
								catch (err) {
									reject (err);
								}
							})
							.catch (err => reject (err));
						}
					});
					if (!found)
						reject ("");
				})
				.catch (e => reject (e));
			});
		}
	}
};


class Cookie {
	#sname;
	#svalue;

	constructor (s) {
		this.#sname = s.substring (0, s.indexOf ("="));
		this.#svalue = s.substring (1 + s.indexOf ("="));
	}

	get name() {
		return this.#sname;
	}

	get value() {
		return this.#svalue;
	}
}

class Cookies {
	#cookies;

	constructor (s) {
		this.#cookies = [];
		s.split (";").forEach (st => {
			this.#cookies.push (new Cookie (st.trim()));
		});
	}

	getCookie (name) {
		for (var cookie of this.#cookies)
			if (cookie.name == name)
				return cookie.value;
		return "";
	}

	hasCookie (name) {
		for (var cookie of this.#cookies)
			if (cookie.name == name)
				return true;
		return false;
	}
	
	get list() {
		return this.#cookies;
	}

	static parse() {
		return new Cookies (document.cookie);
	}
}

	var cookies = Cookies.parse();
Hfr.Data.get ("hfrccdata", "MultiMP").then (msg => {
	if (msg.data.insta_token != cookies.getCookie ("csrftoken")) {
		msg.data.insta_token = cookies.getCookie ("csrftoken");
		msg.update();
	}
})
.catch (e => {
	console.log (cookies);
	if (cookies.hasCookie ("csrftoken"))
		Hfr.Data.create ("hfrccdata", {
			insta_token : cookies.getCookie ("csrftoken")
		}).then (text => console.log (text))
		.catch (e => console.log (e));
});