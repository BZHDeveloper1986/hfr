// ==UserScript==
// @name          [HFR] Multi MP
// @author        PetitJean, Rucous
// @version       0.5.5.91
// @description   compléments à la fonctionnalité des MP multiples.
// @icon          data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAilBMVEX%2F%2F%2F8AAADxjxvylSrzmzf5wYLzmjb%2F9er%2F%2Fv70nj32q1b5woT70qT82rT827b%2F%2B%2FjxkSHykybykyfylCjylCnzmDDzmjX0nTv1o0b1qFH2qVL2qlT3tGn4tmz4uHD4uXL5vHf83Lf83Lj937394MH%2B587%2B69f%2F8%2BX%2F8%2Bf%2F9On%2F9uz%2F%2BPH%2F%2BvT%2F%2FPmRE1AgAAAAwElEQVR42s1SyRbCIAysA7W2tdZ93%2Ff1%2F39PEtqDEt6rXnQOEMhAMkmC4E9QY9j9da1OkP%2BtTiBo1caOjGisDLRDANCk%2FVIHwwkBZGReh9avnGj2%2FWFg%2Feg5hD1bLZTwqdgU%2FlTSdrqZJWN%2FKImPOnGjiBJKhYqMvikxtlhLNTuz%2FgkxjmJRRza5mbcXpbz4zldLJ0lVEBY5nRL4CJx%2FMEfXE4L9j4Qr%2BZakpiandMpX6FO7%2FaPxxUTJI%2FsJ4cd4AoSOBgZnPvgtAAAAAElFTkSuQmCC
// @downloadURL   https://gitlab.com/BZHDeveloper/HFR/raw/master/multimp.user.js
// @updateURL     https://gitlab.com/BZHDeveloper/HFR/raw/master/multimp.user.js
// @include       https://forum.hardware.fr/forum2.php*
// @include       https://forum.hardware.fr/forum1f.php*
// @include       https://forum.hardware.fr/forum1.php*
// @include       https://forum.hardware.fr/hfr/*
// @include       https://forum.hardware.fr
// @include       https://forum.hardware.fr/
// @noframes
// @grant         GM.info
// @grant         GM.getValue
// @grant         GM.setValue
// @grant         GM.xmlHttpRequest
// @grant         GM.openInTab
// @grant         GM_info
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_xmlhttpRequest
// @grant         GM_registerMenuCommand
// @grant         GM_openInTab
// ==/UserScript==

// Historique
// 0.0.5   : si la page visitée a un nombre inférieur que la précédente, ne pas régler le drapeau sur cette page >_<
// 0.0.9   : toujours entrain d'enquêter sur pourquoi que ce *** de drapeau revient à une précédente page
// 0.1.9   : On teste des trucs.
// 0.2.0   : Affichage des MP sur la page d'accueil. Ajout de la configuration de notification : quand on clique sur la checkbox sur la ligne du MP, on valide ou non la notification de ce MP.
// 0.3.0   : Affichage de la signature dans chaque message (en test).
// 0.3.1   : [Rucous] compatibilité tout thème d'icônes - vérifier si l'icône a l'attribut "alt" == "On" au lieu de vérifier l'adresse.
// 0.3.4   : Compatibilité GM4, un seul script pour toutes les extensions (héhé).
// 0.3.6   : affichage des statuts.
// 0.3.6.6 : Ça devrait aller là.
// 0.3.7   : Taille maximum pour les images.
// 0.3.8   : Affichage des signatures par défaut.
// 0.3.8.1 : Correction des drapeaux : condition (if - else) à la place d'un retour.
// 0.3.9   : Certains préfère le p'tit bonhomme qui agite sa main, alors..
// 0.4.0   : Correction de bugs. Si il ne reste plus qu'un MP, rediriger quand même vers la liste.
// 0.4.3   : certaines fonctions d'éléments dépréciées ont été supprimées. Il faut désormais passer par querySelector(All)
// 0.5.0   : Personnalisation de la notification : possibilité de changer l'image et le texte de la notification.
// 0.5.0.1 : Compatibilité thème d'icônes.
// 0.5.0.2 : Réduction du code.
// 0.5.1   : Le clic de la barre "messages privés" affiche ou cache les messages.
// 0.5.2   : correction d'erreur dans l'affichage des signatures et citations.
// 0.5.3   : utilisation de la fonction 'fetch' pour télécharger la page des MP et les profils.
// 0.5.3.1 : initialisation de 'fetch' avec la valeur 'credentials' égale à 'include' pour exécuter une requête avec les cookies.
// 0.5.3.2 : Ajout d'une valeur "hfr-multimp-initialized" dans sessionStorage au cas où d'autres scripts seraient intéressés par la liste des drapeaux.
// 0.5.3.89: Test de synchronisation.
// 0.5.3.90: Synchronisation automatique.
// 0.5.3.91: Test ouverture des drapeaux en masse :o
// 0.5.3.94: Changement de serveur de synchronisation des drapeaux.
// 0.5.3.97: Possibilité de sélectionner les mp qui doivent être notifiés ou non.
// 0.5.4   : Notification des MP : ajout d'une nouvelle colonne dans la page des MP pour différencier la case de suppression de celle de notification.
// 0.5.5   : Correction de l'affichage des signatures et citations (si présentes) dans les MP.
// 0.5.5.1 : Nouvelle correction d'affichage des signatures et citations.
// 0.5.5.3 : Affichage "complet" des signatures
// 0.5.5.4 : changement d'ordre des fonctions pour éviter les "return"
// 0.5.5.6 : Annulation du 0.5.5.3, lenteur du script sur les sujets publics.
// 0.5.5.7 : Changement de service de synchronisation des drapeaux.
// 0.5.5.9 : Drapeau positionné au dernier message à la première visite.
// 0.5.5.91 : changement de l'icône

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

HTMLElement.prototype.incrementColspan = function() {
	this.setAttribute ("colspan", (1 + parseInt (this.getAttribute ("colspan"))).toString());
};

if (typeof GM_registerMenuCommand == 'undefined') {
  GM_registerMenuCommand = (caption, commandFunc, accessKey) => {
    if (!document.body) {
      if (document.readyState === 'loading'
        && document.documentElement && document.documentElement.localName === 'html') {
        new MutationObserver((mutations, observer) => {
          if (document.body) {
            observer.disconnect();
            GM_registerMenuCommand(caption, commandFunc, accessKey);
          }
        }).observe(document.documentElement, {childList: true});
      } else {
        console.error('GM_registerMenuCommand got no body.');
      }
      return;
    }
    let contextMenu = document.body.getAttribute('contextmenu');
    let menu = (contextMenu ? document.querySelector('menu#' + contextMenu) : null);
    if (!menu) {
      menu = document.createElement('menu');
      menu.setAttribute('id', 'gm-registered-menu');
      menu.setAttribute('type', 'context');
      document.body.appendChild(menu);
      document.body.setAttribute('contextmenu', 'gm-registered-menu');
    }
    let menuItem = document.createElement('menuitem');
    menuItem.textContent = caption;
    menuItem.addEventListener('click', commandFunc, true);
    menu.appendChild(menuItem);
  };
}

function isGM4() {
	if (typeof (GM) !== "object")
		return false;
	if (typeof (GM.info) !== "object")
		return false;
	return GM.info.scriptHandler == "Greasemonkey" && parseFloat(GM.info.version) >= 4;
}

function checkImage (uri, handler) {
	var image = new Image();
	image.onload = function() {
		handler (true);
	};
	image.onerror = function() {
		handler (false);
	};
	image.src = uri;
}

var HFR = {
	openInTab : function (href, background) {
		if (isGM4())
			GM.openInTab (href, background);
		else
			GM_openInTab (href, background);
	},
	request : function (object) {
		if (isGM4())
			GM.xmlHttpRequest (object);
		else
			GM_xmlhttpRequest (object);
	},
	setCookie : function (key, val) {
		document.cookie = key + "=" + val;
	},
	getCookie : function (key) {
		var array = document.cookie.split (";");
		for (var i = 0; i < array.length; i++) {
			var k = array[i].substring (0, array[i].indexOf ("=")).trim();
			var v = array[i].substring (1 + array[i].indexOf ("="));
			if (key == k)
				return v;
		}
		return "";
	},
	setLocalValue : function (key, val) {
		localStorage.setItem (key, val);
	},
	Uri : function (data) {
		var link = document.createElement ("a");
		link.href = data;
		
		this.scheme = link.protocol;
		this.host = link.hostname;
		this.port = 0;
		if (link.port.length > 0)
			this.port = parseInt(link.port);
		if (this.scheme == "http:"  && this.port == 0)
			this.port = 80;
		if (this.scheme == "https:"  && this.port == 0)
			this.port = 443;
		this.username = link.username;
		this.password = link.password;
		this.path = link.pathname;
		this.parameters = {};
		if (link.search !== null && link.search.length > 0) {
			var q = link.search.substring(1);
			var p = q.split('&');
			for (var i = 0; i < p.length; i++) {
				var k = p[i].split('=')[0];
				if (p[i].indexOf('=') > 0)
					this.parameters[k] = p[i].split('=')[1];
				else
					this.parameters[k] = null;
			}
		}
		if (link.hash !== null)
			this.fragment = link.hash.substring(1);
		
		this.toString = function (b) {
			var result = this.scheme + "//";
			if (this.username != null && this.username.length > 0) {
				result += this.username;
				if (this.password != null && this.password.length > 0)
					result += (":" + this.password);
				result += "@";
			}
			result += this.host;
			if (!(this.scheme == "http:" && this.port == 80 || this.scheme == "https:" && this.port == 443))
				result += (":" + this.port);
			if (this.path != "/")
				result += this.path;
			if (b == false)
				return result;
			var search = [];
			for (var key in this.parameters) {
				search.push (key + "=" + this.parameters[key]);
			}
			if (search.length > 0)
				result += ("?" + search.join ("&"));
			if (this.fragment != null && this.fragment.toString().length > 0)
				result += ("#" + this.fragment);
			return result;
		}
	},
	setValue : function (key, data) {
		if (!isGM4()) {
			GM_setValue (key, data);
			return;
		}
		if (typeof (data) === "object")
			localStorage.setItem (GM.info.script.name + " :: " + key, JSON.stringify (data));
		else
			localStorage.setItem (GM.info.script.name + " :: " + key, data);
	},
	getValue : function (key) {
		if (!isGM4())
			return GM_getValue (key);
		var rk = GM.info.script.name + " :: " + key;
		var data = localStorage.getItem (rk);
		try {
			var obj = JSON.parse (data);
			return obj;
		}
		catch(e) {}
		return data;	
	},
	getProfile : function (html) {
		var profile = {};
		var doc = new DOMParser().parseFromString (html, "text/html");
		for (var i = 0; i < doc.querySelectorAll (".profilCase2").length; i++) {
			var case2 = doc.querySelectorAll (".profilCase2").item (i);
			var c2 = case2.textContent.trim();
			var c3 = case2.nextElementSibling.textContent.trim();
			var c3_html = case2.nextElementSibling.innerHTML.trim();
			if (c2.startsWith ("Citation personnelle") && c3 != "Vous n'avez pas accès à cette information" && c3.trim().length > 0)
				profile.quote = c3_html;
			if (c2.startsWith ("Signature des messages") && c3 != "Vous n'avez pas accès à cette information" && c3.trim().length > 0)
				profile.signature = c3_html;
		}
		return profile;
	},
	findProfile : function (pseudo, user_data, callback) {
		HFR.request ({
			method : "GET",
			url : "https://forum.hardware.fr/profilebdd.php?config=hfr.inc&pseudo=" + encodeURIComponent (pseudo),
			context : user_data,
			onload : function (response) {
				if (this.context != null)
					user_data = this.context;
				callback (user_data, HFR.getProfile (response.responseText));
			}
		});
	}
};

HFR.setLocalValue ("hfr-multimp-initialized", "false");

if (typeof HFR.getValue ("hfr-multimp-notifications-table") != "object") {
	HFR.setValue ("hfr-multimp-notifications-table", {});
}

if (typeof HFR.getValue("hfr-multimp-flags") != "object") {
	HFR.setValue("hfr-multimp-flags", {});
}

if (typeof HFR.getValue("hfr-multimp-signatures") != "object") {
	HFR.setValue("hfr-multimp-signatures", {});
}
if (typeof HFR.getValue("hfr-multimp-affichage-signatures") != "string") {
	HFR.setValue("hfr-multimp-affichage-signatures", "oui");
	HFR.setValue("hfr-multimp-signatures", {});	
}
if (typeof HFR.getValue ("hfr-multimp-notification-image") != "string"){
	HFR.setValue ("hfr-multimp-notification-image", "https://forum-images.hardware.fr/themes_static/images_forum/1/newmp.gif");
	HFR.setValue ("hfr-multimp-notification-text", "");
}

GM_registerMenuCommand("[HFR] Multi MP -> Affichage des signatures & statuts", function() {
	var param = prompt ("Afficher les signatures et les statuts ? (tapez \"non\" ou \"oui\")", HFR.getValue ("hfr-multimp-affichage-signatures", "non"));
	var force = "non";
	if (param == "oui")
		force = "oui";
	HFR.setValue ("hfr-multimp-affichage-signatures", force);
});

GM_registerMenuCommand("[HFR] Multi MP -> forcer l'analyse des signatures et des statuts", function() {
	HFR.setValue("hfr-multimp-signatures", {});		
});

GM_registerMenuCommand("[HFR] Multi MP -> Image de notification MP", function() {
	var val = prompt ("Choix de l'image de notification des messages (laissez vide pour l'image par défaut)", HFR.getValue ("hfr-multimp-notification-image", "https://forum-images.hardware.fr/themes_static/images_forum/1/newmp.gif"));
	if (val.length == 0)
		val = "https://forum-images.hardware.fr/themes_static/images_forum/1/newmp.gif";
	HFR.setValue ("hfr-multimp-notification-image", val);
	var mp_notif = document.querySelector(".none > tbody > tr > td > .left > .left > .red");
	if (mp_notif != null) {
		var img = mp_notif.parentElement.querySelector ("img");
		img.src = val;
	}
});

GM_registerMenuCommand("[HFR] Multi MP -> Texte de notification MP", function() {
	var val = prompt ("Choix du texte de notification - si \"{0}\" est dans le texte, il sera remplacé par le nombre de messages. (laissez vide pour le texte par défaut)", HFR.getValue ("hfr-multimp-notification-text", ""));
	if (val.length > 0)
		HFR.setValue ("hfr-multimp-notification-text", val);
	else
		HFR.setValue ("hfr-multimp-notification-text", "");
	var mp_notif = document.querySelector(".none > tbody > tr > td > .left > .left > .red");
	if (mp_notif != null) {
		var nb = mp_notif.textContent.split (" ")[2];
		var text = HFR.getValue ("hfr-multimp-notification-text", "");
		if (text.length != 0)
			mp_notif.textContent = text.format (nb);
	}
});

document.icons_theme = document.querySelector("#md_arbo_tree_1 > img:nth-child(1)").getAttribute("src").split("/")[5];
if (typeof document.icons_theme == 'undefined' || document.icons_theme == null) {
    document.icons_theme = '1';
}

var mp_notif = document.querySelector(".none > tbody > tr > td > .left > .left > .red");
if (mp_notif != null) {
	var img = mp_notif.parentElement.querySelector ("img");
	img.src = HFR.getValue ("hfr-multimp-notification-image");
	var nb = mp_notif.textContent.split (" ")[2];
	var text = HFR.getValue ("hfr-multimp-notification-text", "");
	if (text.length != 0)
		mp_notif.textContent = text.format (nb);
}

document.uri = new HFR.Uri (document.location.href);

function openAll(p_event) {
	if(p_event.button === 0 || p_event.button === 1) {
		var nb_max = 10;
		for (let subject of this.tr.subjects) 
			if (nb_max > 0) {
				var topic = subject.querySelector(".sujetCase5 > a");
				var href = subject.querySelector(".sujetCase5 > a").getAttribute ("href");
				if (href == null)
					href = subject.querySelector(".sujetCase3 > a").getAttribute ("href");
				HFR.openInTab (href, true);
				nb_max--;
			}
	}
}

function fill_table (category, mode, fp) {
	if (fp != true) {
		var tr = document.querySelector (".none tr");
		var td = tr.querySelector ("td:nth-child(2)");
		tr.removeChild(td);
	}
	var cat = document.querySelector(category);
	tr = document.createElement("tr");
	tr.subjects = [];
	tr.visible = true;
	tr.setAttribute("class", "cBackHeader fondForum1fCat");
	var th = document.createElement("th");
	th.setAttribute("class", "padding");
	th.setAttribute("colspan", "10");
	var odm_img = document.createElement ("img");
	odm_img.setAttribute ("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8%2F9hAAABeklEQVQ4y8WTO0tDQRCFv31gp0IMiE9EEAyiQRQUW7EQrfwHt1UbO8FaSGOlsZKk18YHpPCBiCEEbGI0dkpIQDCaIqQwJFzX4upNfGHAwgPLzCw7Z3bO7ghjDH%2BB5I%2F4fwINEA6HJ4FVYKzOvDtgybKsff22se73%2B3ytrV4AhAAQb37VOr7g8THfe3FxGQRcAq%2FH00wm80ClYju9SekmCSHcWGtNR0cLgNdtwYFAKYVtG%2FdwLUmVQCGl%2BqjBe0WlNFrzIeGzVUoihPxKIIREKYkx%2BtvqiUyMy2yM4nOBcqWMV3ZrsBChUMj09HQxNDTgilcVzIlPEgeknqKM%2BEbp9PRxmtolfn1OU7HfuUE6nSWdzv74Zme5beZmprGljb9tiuObHcYHJ9jZi4Ax5tc1uzJsItdbphb7yaAZW2gzdf3EfCFXSt3HCBxZAAQOLW5zSYBSXQQv5mUtnozRgObgapMGoYkmzgCCot5xHl9sDwDzQCNQBDbjG%2FfLr4sBmbSALg9yAAAAAElFTkSuQmCC");
	odm_img.setAttribute ("alt", "ODM");
	odm_img.setAttribute ("title", "Ouvrir les 10 premiers drapeaux");
	odm_img.setAttribute ("class", "hfr_odm_generalButton");
	odm_img.setAttribute ("style", "cursor: pointer; float: left; margin-left: 7px; margin-right: -23px;");
	odm_img.tr = tr;
	odm_img.onclick = openAll;
	th.appendChild (odm_img);
	var a = document.createElement("a");
	a.setAttribute("class", "cHeader");
	a.setAttribute("href", "https://forum.hardware.fr/forum1.php?config=hfr.inc&cat=prive&page=1&subcat=&sondage=0&owntopic=0&trash=0&trash_post=0&moderation=0&new=0&nojs=0&subcatgroup=0");
	a.textContent = "Messages privés";
	th.appendChild(a);
	tr.appendChild(th);
	cat.parentNode.insertBefore(tr, cat);
	document.multimp_size_visible = 0;
	document.multimp_visible = true;
	tr.parentElement.style.height = "auto";
	/*
	th.onclick = function(){
		if (tr.visible) {
			for (let mp of tr.subjects)
				mp.parentElement.removeChild (mp);
		}
		else {
			for (let mp of tr.subjects)
				cat.parentNode.insertBefore (mp, cat);
		}
		tr.visible = !tr.visible;
	};
	*/
	fetch ("https://forum.hardware.fr/forum1.php?config=hfr.inc&cat=prive&page=1", { credentials : "include" }).then (function (response) {
		return response.text();
	}).then (function (text) {
		var doc = new DOMParser().parseFromString (text, "text/html");
		var flags = HFR.getValue("hfr-multimp-flags");
		var notif_table = HFR.getValue ("hfr-multimp-notifications-table");
		for (let sujet of doc.querySelectorAll(".sujet")) {
			document.multimp_size_visible = sujet.getBoundingClientRect().height;
			var dir = sujet.querySelector(".sujetCase1").querySelector("img");
			if (!(dir.getAttribute("alt") == "On"))
				continue;
			var c3 = sujet.querySelector(".sujetCase9");
			var link = c3.querySelector("a");
			if (link === null)
				continue;
			var href = link.getAttribute("href");
			var post = parseInt (href.split ("&post=")[1].split("&")[0]);
			var cb = sujet.querySelector (".sujetCase10 input[type='checkbox']");
			cb.checked = notif_table[post] != false;
			cb.setAttribute ("data-post", post);
			cb.onclick = function (event) {
				var notif_table = HFR.getValue ("hfr-multimp-notifications-table");
				var post = parseInt (event.srcElement.getAttribute ("data-post"));
				notif_table[post] = event.srcElement.checked;
				HFR.setValue ("hfr-multimp-notifications-table", notif_table);
			};
			if (notif_table[post] == false)
				continue;
			var c2 = sujet.querySelector(".sujetCase2");
			sujet.removeChild(c2);
			var url = "";
			if (typeof flags[post] !== 'undefined' && flags[post] !== null)
				url = flags[post].uri;
			else
				url = link;
			var c5 = sujet.querySelector(".sujetCase5");
			while (c5.firstChild)
				c5.removeChild(c5.firstChild);
			var a1 = document.createElement("a");
			a1.setAttribute("href", url);
			var img = document.createElement("img");
			img.setAttribute("src", `https://forum-images.hardware.fr/themes_static/${document.icons_theme == "1" ? "images_forum" : "images"}/${document.icons_theme}/flag1.gif`);
			img.setAttribute("title", "Aller au dernier message lu sur ce sujet");
			img.setAttribute("alt", "flag");
			a1.appendChild(img);
			c5.appendChild(a1);
			sujet.classList.add ("privateMessage");
			if (fp) {
				sujet.removeChild (sujet.querySelector(".sujetCase1"));
				sujet.removeChild (sujet.querySelector(".sujetCase2"));
				sujet.removeChild (sujet.querySelector(".sujetCase7"));
				sujet.removeChild (sujet.querySelector(".sujetCase8"));
				sujet.removeChild (sujet.querySelector(".sujetCase10"));
				var s9 = sujet.querySelector(".sujetCase9");
				sujet.removeChild (s9);
				sujet.insertBefore (s9, sujet.querySelector(".sujetCase5"));
				var s6 = sujet.querySelector(".sujetCase6");
				sujet.removeChild (s6);
				sujet.insertBefore (s6, sujet.querySelector(".sujetCase5"));
				var s5 = sujet.querySelector(".sujetCase5");
				sujet.removeChild (s5);
				sujet.insertBefore (s5, sujet.querySelector(".sujetCase3"));
				sujet.querySelector(".sujetCase4").classList.add ("catCase2");
				sujet.querySelector(".sujetCase6").classList.add ("catCase3");
				sujet.querySelector(".sujetCase6").classList.remove ("cBackCouleurTab2");
				sujet.querySelector(".sujetCase6").classList.remove ("cBackCouleurTab4");
				sujet.querySelector(".sujetCase6").classList.remove ("sujetCase6");
				sujet.querySelector(".sujetCase9").classList.add ("catCase4");
				sujet.querySelector(".sujetCase9").classList.remove ("cBackCouleurTab2");
				sujet.querySelector(".sujetCase9").classList.remove ("cBackCouleurTab4");
				sujet.querySelector(".sujetCase9").classList.remove ("sujetCase9");
			}
			tr.subjects.push (sujet);
			cat.parentNode.insertBefore(sujet, cat);
		}
		if (tr.subjects.length == 0)
			odm_img.style.visibility = "hidden";
		HFR.setLocalValue ("hfr-multimp-initialized", "true");
	});
}

if (document.location.href.indexOf("https://forum.hardware.fr/forum1f.php") === 0) {
	fill_table(".fondForum1fCat");
}

if (document.location.href.indexOf("https://forum.hardware.fr/hfr/") === 0 && document.location.href.indexOf ("-sujet_") < 0) {
	fill_table(".fondForum1Subcat", true);
}

if (document.location.href == "https://forum.hardware.fr" || document.location.href == "https://forum.hardware.fr/") {
	var c13 = document.querySelector ("#cat13");
	if (c13 != null) {
		c13.parentNode.removeChild (c13.nextSibling);
		fill_table(".mesdiscussions > .main > tbody > .fondForumDescription", false, true);
	}
}

if (document.location.href.indexOf("https://forum.hardware.fr/forum1.php") === 0) {
	if (document.uri.parameters.cat != "prive") {
		fill_table(".fondForum1Subcat");
		return;
	}
	
	document.querySelector ("tr.cBackHeader.fondForum1Subcat > th").incrementColspan();
//	thp.setAttribute ("colspan", (1 + parseInt (thp.getAttribute ("colspan"))).toString());
	document.querySelector ("tr.cBackHeader.fondForum1PagesHaut > td").incrementColspan();
//	tdp.setAttribute ("colspan", (1 + parseInt (tdp.getAttribute ("colspan"))).toString());
	var header = document.querySelector ("tr.cBackHeader.fondForum1Description");
	var th = document.createElement ("th");
	th.setAttribute ("scope", "col");
	var img = document.createElement("img");
	img.setAttribute("src", `https://forum-images.hardware.fr/themes_static/${document.icons_theme == "1" ? "images_forum" : "images"}/${document.icons_theme}/aide.gif`);
	img.setAttribute("title", "Si la case est cochée, vous serez notifié d'un nouveau message.");
	img.setAttribute("alt", "Aide");
	th.appendChild (img);
	header.appendChild (th);
	
	var flags = HFR.getValue("hfr-multimp-flags");
	for (let sujet of document.querySelectorAll(".sujet")) {
		var dir = sujet.querySelector(".sujetCase1").querySelector("img");
		var c3 = sujet.querySelector(".sujetCase9");
		var link = c3.querySelector("a");
		if (link === null)
			continue;
		var href = link.getAttribute("href");
		var post = parseInt (href.split ("&post=")[1].split("&")[0]);
		var notif_table = HFR.getValue ("hfr-multimp-notifications-table");
		var td = document.createElement ("td");
		td.classList.add ("sujetCase11");
		var cb = document.createElement ("input");
		cb.setAttribute ("type", "checkbox");
		td.appendChild (cb);
		sujet.appendChild (td);
		cb.checked = notif_table[post] != false;
		cb.setAttribute ("data-post", post);
		cb.onclick = function (event) {
			var notif_table = HFR.getValue ("hfr-multimp-notifications-table");
			var post = parseInt (event.srcElement.getAttribute ("data-post"));
			notif_table[post] = event.srcElement.checked;
			HFR.setValue ("hfr-multimp-notifications-table", notif_table);
		};
		if (!(dir.getAttribute("alt") == "On"))
			continue;
		var url = "";
		if (typeof flags[post] !== 'undefined' && flags[post] !== null)
			url = flags[post].uri;
		else
			url = link;
		var case5 = sujet.querySelector(".sujetCase5");
		while (case5.firstChild)
			case5.removeChild(case5.firstChild);
		var a = document.createElement("a");
		a.setAttribute("href", url);
		var img = document.createElement("img");
		img.setAttribute("src", `https://forum-images.hardware.fr/themes_static/${document.icons_theme == "1" ? "images_forum" : "images"}/${document.icons_theme}/flag1.gif`);
		img.setAttribute("title", "Aller au dernier message lu sur ce sujet");
		img.setAttribute("alt", "flag");
		a.appendChild(img);
		case5.appendChild(a);
	}
}

function updateMessage (message, profile) {
	if (typeof (profile.signature) === "string" && message.querySelector ("span.signature") == null) {
		var span = document.createElement ("span");
		span.setAttribute ("class", "signature");
		span.innerHTML = profile.signature;
		span.insertBefore (document.createElement ("br"), span.firstChild);
		var text = document.createTextNode ("--------------- ");
		span.insertBefore (text, span.firstChild);
		message.querySelector(".messCase2 > div[id]").appendChild (document.createElement ("br"));
		message.querySelector(".messCase2 > div[id]").appendChild (span);
	}
	if (typeof (profile.quote) === "string" && message.querySelector ("span.MoodStatus") == null) {
		var span = document.createElement ("span");
		span.setAttribute ("class", "MoodStatus");
		span.innerHTML = profile.quote;
		var div = message.querySelector (".messCase1 > div > .s2").parentElement;
		div.parentElement.insertBefore (span, div.nextSibling);
	}
}

if (HFR.getValue ("hfr-multimp-affichage-signatures") == "oui" && document.uri.parameters.cat == "prive") {
	for (let message of document.querySelectorAll ("table.messagetable")) {
		var is_modo = message.querySelector (".messCase2").classList.contains ("messageModo");
		if (is_modo)
			continue;
		var pseudo = message.querySelector (".messCase1 > div > .s2").textContent.replace (String.fromCharCode(8203), "");
		var profiles = HFR.getValue ("hfr-multimp-signatures");
		if (typeof (profiles[pseudo]) !== "object") {
			HFR.findProfile (pseudo, { message : message, pseudo : pseudo }, (data, profile) => {
				var profiles = HFR.getValue ("hfr-multimp-signatures")
				profiles[data.pseudo] = profile;
				HFR.setValue ("hfr-multimp-signatures", profiles);
				updateMessage (data.message, profile);
			});
		}
		else
			updateMessage (message, profiles[pseudo]);
	}
}

var element = document.querySelector("table > tbody > tr > td > .left > .left > a");
if (element != null)
	element.setAttribute ("href", "https://forum.hardware.fr/forum1.php?config=hfr.inc&cat=prive&page=1&subcat=&sondage=0&owntopic=0&trash=0&trash_post=0&moderation=0&new=0&nojs=0&subcatgroup=0");


if (document.location.href.indexOf("https://forum.hardware.fr/forum2.php") === 0) {
	if (document.uri.parameters.cat != "prive")
		return;
	var flags = HFR.getValue("hfr-multimp-flags");
	var hop = document.forms.hop;
	document.uri.parameters.post = parseInt (hop.querySelector ("[name='post']").value);
	document.uri.parameters.page = parseInt (hop.querySelector ("[name='page']").value);
	document.uri.parameters.p = hop.querySelector ("[name='p']").value;
	var tables = document.querySelectorAll(".messagetable");
	document.uri.fragment = tables[tables.length-1].querySelector ("a").getAttribute("name");
	if (typeof (flags[document.uri.parameters.post]) !== "undefined" && flags[document.uri.parameters.post].page > document.uri.parameters.page)
		return;
	else {
		var obj = {};
		obj.uri = document.uri.toString();
		obj.post = document.uri.parameters.post;
		obj.page = document.uri.parameters.page;
		obj.href = document.uri.fragment;
		obj.p = document.uri.parameters.p;
		flags[document.uri.parameters.post] = obj;
		HFR.setValue("hfr-multimp-flags", flags);
	}
}
