// ==UserScript==
// @author        BZHDeveloper, roger21
// @name          [HFR] Copié/Collé v3
// @version       1.4.33
// @namespace     forum.hardware.fr
// @description   Colle les données du presse-papiers et les traite si elles sont reconnues.
// @icon          https://gitlab.gnome.org/BZHDeveloper/HFR/raw/main/hfr-logo.png
// @downloadURL   https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr_cc_2.user.js
// @updateURL     https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr_cc_2.user.js
// @require       https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr.js?time=1715212901308
// @require       https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr.ui.js?time=1715212901308
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

class Utils {
    static #table;

    static get unicodeTable() {
        return this.#table;
    }

    static set unicodeTable (data) {
        this.#table = data;
    }

    static isGM4() {
        return typeof (GM) === "object" && typeof (GM.info) === "object" && GM.info.scriptHandler == "Greasemonkey" && parseFloat(GM.info.version) >= 4;
    }

    static request (data) {
        if (Utils.isGM4())
			GM.xmlHttpRequest (object);
		else
            GM_xmlhttpRequest (object);
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
				url : "https://gitlab.com/BZHDeveloper/HFR/raw/master/emojis-data.json",
				onload : function (response) {
					localStorage.setItem ("hfr-cc-data", JSON.stringify (response.response));
					callback (response.response.unicode_table);
				}
			});
		}
		else
			callback (data.unicode_table);
	}

    static stroke (event) {
        var loading = new HfrUi.Loading();
    }

    static drop (event) {}

    static allowDrop (event) {
        
    }

    static addButtonToTextarea (event) {
        
    }
}

function getPrivateDataAsync() {
    return new Promise ((resolve, reject) => {
        var cat = new HFR.Category("prive");
        cat.findTopic ("data-copie-colle").then (topic => {
            topic.getFirstPage().then (page => {
                resolve (JSON.parse(page.messages[0].text));
            }).catch (e => { reject (e); });
        }).catch (e => {
            console.log (e);
            var data = {
                toto : "tata",
                tutu : true,
                titi : 33.5
            };
            cat.createTopic (JSON.stringify (data), "multimp", "data-copie-colle").then (b => {
                resolve (data);
            }).catch (e => { reject (e); });
        });
    });
}

HTMLTextAreaElement.prototype.listen = function (id, func) {
    this.removeEventListener (id, func, false);
    this.addEventListener (id, func, false);
};

Utils.init (table => {
    Utils.unicodeTable = table;
    document.querySelectorAll ("textarea").forEach (area => {
        area.addEventListener('keydown', Utils.stroke);
		area.addEventListener('drop', Utils.drop);
		area.addEventListener('dragover', Utils.allowDrop);
		area.addEventListener('focus', Utils.addButtonToTextarea);
    });

    var observer = new MutationObserver ((mutations, observer) => {
        document.querySelectorAll("textarea").forEach (area => {
            area.listen ("keydown", Utils.stroke);
            area.listen ("drop", Utils.drop);
            area.listen ("dragover", Utils.allowDrop);
            area.listen ("focus", Utils.addButtonToTextarea);
        });
    });
    observer.observe(document, { attributes : false, childList : true, characterData : false, subtree : true });
});

function UAParser (ua) {
    var str = ua;
    var tkn = str.substring (0, str.indexOf (' '));
    str = str.substring (1 + str.indexOf (' '));
    console.log (str);
    var os = str.substring (1, str.indexOf (')'));
    str = str.substring (1 + str.indexOf (')')).trim();
    console.log (str);
    var rndr = str.substring (0, str.indexOf (' '));
    str = str.substring (1 + str.indexOf (' '));
    console.log (str);
    var cmpt_list = [];
    if (str.indexOf ('(') == 0) {
        var cmpt = str.substring (1, str.indexOf (')'));
        cmpt_list = cmpt.split(',');
        for (var i = 0; i < cmpt_list.length; i++)
            cmpt_list[i] = cmpt_list[i].trim();
        str = str.substring (1 + str.indexOf (')')).trim();
    }
    console.log ("browser : "+str);
    var bwsr = str.substring (0, str.indexOf (' '));
    str = str.substring (1 + str.indexOf (' '));
    console.log (str);
    var cbwsr = str.substring (0, str.indexOf (' '));
    return {
        token : {
            compat : tkn.substring (0, tkn.indexOf ('/')),
            version : tkn.substring (1 + tkn.indexOf ('/'))
        },
        operating_system : {
            type : os.substring (0, os.indexOf (';')),
            version : os.substring (2 + os.indexOf (';'))
        },
        rendering_engine : {
            name : rndr.substring (0, rndr.indexOf ('/')),
            version : rndr.substring (1 + rndr.indexOf ('/'))
        },
        rendering_compatibility : cmpt_list,
        browser : {
            name : bwsr.substring (0, bwsr.indexOf ('/')),
            version : bwsr.substring (1 + bwsr.indexOf ('/'))
        },
        compatible_browser : {
            name : cbwsr.substring (0, bwsr.indexOf ('/')),
            version : cbwsr.substring (1 + bwsr.indexOf ('/'))
        }
    };
}