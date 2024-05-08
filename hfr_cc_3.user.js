// ==UserScript==
// @author        BZHDeveloper, roger21
// @name          [HFR] Copié/Collé v3
// @version       1.4.33
// @namespace     forum.hardware.fr
// @description   Colle les données du presse-papiers et les traite si elles sont reconnues.
// @icon          https://gitlab.gnome.org/BZHDeveloper/HFR/raw/main/hfr-logo.png
// @downloadURL   https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr_cc_2.user.js
// @updateURL     https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr_cc_2.user.js
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

let HFR = {
    isGM4 : function(){
        return typeof (GM) === "object" && typeof (GM.info) === "object" && GM.info.scriptHandler == "Greasemonkey" && parseFloat(GM.info.version) >= 4;
    },
    request : function (data) {
        if (HFR.isGM4())
            return GM.xmlHttpRequest (data);
        return GM_xmlhttpRequest (data);
    },
    Message : class {
        #atr;

        constructor (tr) {
            this.#atr = tr.querySelector("b.s2").textContent;
        }

        get author() {
            return this.#atr;
        }
    },
    Topic : class {
        #tit;
        #url;
        #mpm;
        #list;
        #usr;

        constructor (tr, data) {
            if (tr != null) {
                this.#tit = tr.querySelector("td.sujetCase3 > a").textContent;
                this.#url = tr.querySelector("a").getAttribute("href");
                this.#list = [];
                this.#mpm = false;
                if (tr.querySelector("td.sujetCase6 > span") != null)
                    this.#mpm = true;
                else
                    this.#usr = tr.querySelector("td.sujetCase6 > a").textContent;
            }
        }

        static create (user, title) {

        }

        get user() { return this.#usr; }

        get uri() { return this.#url; }

        isMultiple() { return this.#mpm; }

        get title() { return this.#tit; }

        get messages() { return this.#list; }

        load() {
            this.#list = [];
            return new Promise ((resolve, reject) => {
                HFR.request({
					method : "GET",
					url : this.#url,
                    context : this,
					onabort : function() { reject (); },
					onerror : function() { reject (); },
					ontimeout : function() { reject (); },
					onload : function (response) {
						try {
                            var doc = new DOMParser().parseFromString(response.responseText, "text/html");
                            doc.querySelectorAll("tr.message").forEach(m => {
                                response.context.messages.push (new HFR.Message(m));
                            });
                            resolve (response.context.messages);
						}
						catch (e) {
							console.log (e);
							reject ();
						}
					}
				});
            });
        }
    },
    TopicList : class {
        #list;
        #idx;

        constructor (index){
            this.#list = [];
            this.#idx = index;
        }

        load() {
            this.#list = [];
            return new Promise ((resolve, reject) => {
                HFR.request({
					method : "GET",
					url : "https://forum.hardware.fr/forum1.php?config=hfr.inc&cat=prive",
                    context : this,
					onabort : function() { reject (); },
					onerror : function() { reject (); },
					ontimeout : function() { reject (); },
					onload : function (response) {
						try {
                            var doc = new DOMParser().parseFromString(response.responseText, "text/html");
                            doc.querySelectorAll("tr.sujet").forEach(s => {
                                response.context.topics.push (new HFR.Topic (s));
                            });
                            resolve (response.context.topics);
						}
						catch (e) {
							console.log (e);
							reject ();
						}
					}
				});
            });
        }

        addTopic (t) {
            this.#list.push (t);
        }

        get topics() {
            return this.#list;
        }

        get next() {
            return new HFR.Topic(1 + this.#idx);
        }

        get previous() {
            return new HFR.Topic(this.#idx - 1);
        }
    }
};

var tl = new HFR.TopicList(1);
tl.load().then (list => {
   list.forEach(topic => {
    if (!topic.isMultiple())
        console.log (topic.user);
   });
});