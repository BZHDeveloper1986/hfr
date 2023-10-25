// ==UserScript==
// @author        BZHDeveloper, roger21
// @name          [HFR] Copié/Collé
// @version       1.2.3
// @namespace     forum.hardware.fr
// @description   Colle les données du presse-papiers et les traite si elles sont reconnues.
// @icon          https://gitlab.com/BZHDeveloper/HFR/raw/master/hfr-logo.png
// @downloadURL   https://gitlab.com/BZHDeveloper/hfr/-/raw/master/hfr_cc.user.js
// @updateURL     https://gitlab.com/BZHDeveloper/hfr/-/raw/master/hfr_cc.user.js
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
// 1.2.3     - Correction Twitter.
// 1.2.2     - Taille de la liste des images.
// 1.2.1     - Compatibilité violentmonkey
// 1.2       - on repart de la v1.
// 1.1.8     - Mastodon.
// 1.1.7.2.9 - Emojis v15 + correction dans l'ordre des codes.
// 1.1.7.2.8 - Twitter : l'URL des données du tweet a changé.
// 1.1.7.2.7 - Instagram désactivé vu les derniers changements.
// 1.1.7.2.6 - Instagram : on tente une correction.
// 1.1.7.2.5 - Twitter card : prévisualisation des liens.
// 1.1.7.2.4 - Test d'affichage des vidéos.
// 1.1.7.2.3 - Test d'affichage des GIF (qui sont des vidéos en fait)
// 1.1.7.2.2 - Correction pour GM4 (analyse JSON : les aut' sont trop permissifs).
// 1.1.7.2   - Emojis v14.
// 1.1.7.1   - Twitter : icône présente dans les images HFR.
// 1.1.7.0   - Option d'affichage des descriptions YouTube.
// 1.1.6.8   - Meilleure présentation des liens YouTube.
// 1.1.6.7   - Correction de l'utilisation des RegExp (Chrome)
// 1.1.6.6   - Possibilité d'afficher la miniature d'un lien YouTube (option).
// 1.1.6.5   - Diminution de la pré-visualisation de l'image si trop grande.
// 1.1.6.4   - Correction de la regex Twitter.
// 1.1.6.3   - Twitter ne partage plus les vidéos dans l'API publique (ben voyons ...)
// 1.1.6.2   - Correction des emoji (certains codes ont un FE0F vide à la fin).
// 1.1.6.1   - première tentative de conversion locale du texte :o
// 1.1.6     - Passage au service rehost de DiB91.
// 1.1.4.1   - Correction d'affichage des liens Twitter.
// 1.1.4     - correction d'affichage du texte.
// 1.1.2     - passage de sndup à zippyshare pour l'audio.
// 1.1.1     - Twitter : ne pas superposer les citations, les enchaîner.
// 1.1.0     - Emojis 13.1 | amélioration du collage Twitter.
// 1.0.9     - Et voici que revoilà reho.st (seulement pour le rehost url)
// 1.0.6     - Correction des liens Twitter.
// 1.0.4     - Correction des liens Telegram.
// 1.0.3     - Possibilité d'ajout de fichier audio.
// 1.0.1     - Twitter : utilisation de nitter.net pour obternir les données.
// 1.0.0     - Multiples corrections. Ajout de telegram.
// 0.9.95    - Ajout d'une image de prévisualisation
// 0.9.93    - sauvegarde des images envoyées (dans la limite de 10 images). Fenêtre de suppression des images
// 0.9.92    - nettoyage de certains codes emoji
// 0.9.91    - ajout du service images.weserv.nl pour "rehost" les images
// 0.9.9.66  - Correction du code instagram
// 0.9.9.65  - Mise à jour des emojis à la version 13.0
// 0.9.9.64  - Encore une correction.
// 0.9.9.62  - Quelques corrections, expressions régulières.
// 0.9.9.6   - Option pour formater ou non les zéros sociaux
// 0.9.9.3   - Retour de la mise en forme des liens Twitter
// 0.9.9.2   - ... à la main pour l'instant
// 0.9.9     - Apparemment le script fonctionne sur tous les sites à boite texte après légère modification. Donc voilà.
// 0.9.8.8   - Test de la table unicode à distance
// 0.9.8.6   - Ajout des emojis jusqu'à 13.0
// 0.9.8.5   - paramètre ":thumb" plutôt que ":small" pour les images Twitter
// 0.9.8.4   - Ajout d'autre formats imgur
// 0.9.8.3   - Possibilité de supprimer les images collées.
// 0.9.8.2   - ajout du paramètre "t" aux images Imgur pour obtenir des miniatures.
// 0.9.8.1   - ajout du paramètre ":small" aux images twitter pour les réduire.
// 0.9.8     - Merci pour tout Sly Angel.
// 0.9.7     - suppression du service pour la session en cours si il ne répond pas.
// 0.9.6.1   - reho.st : passage de 2 à 5 Mo
// 0.9.6     - désolé, c'est de ma faute !
// 0.9.5.1   - Twitter : Application d'un user-agent spécifique pour avoir la vieille version de Twitter
// 0.9.5     - les emojis sont désormais dans le dépôt gitlab, avec le script. ajouts des emojis jusqu'à la v12
// 0.9.4.5   - reho.st : Il n'y a qu'un seul format pour les GIF.
// 0.9.4.4   - Option d'affichage ou non de la fenêtre de sélection. Correction de compatibilité
// 0.9.4.3   - imgur : correction du titre pour la miniature
// 0.9.4.2   - Fenêtre de choix de l'image.
// 0.9.4     - Réintroduction du bouton de sélection de fichier, maintenant que c'est fonctionnel
// 0.9.3.2   - Correction compatibilité GM4
// 0.9.2.9   - La compatibilité GM4 serait mieux avec le polyfill, hein.
// 0.9.2.2   - [Twitter] modification de l'attribut "href" des liens au format t.co pour donner l'adresse finale sans redirection (utile pour les autres scripts HFR)
// 0.9.2.1   - [Twitter] Ajout de l'en-tête "Referer" pour les requêtes.
// 0.9.2     - [Instagram] Compatibilité avec les pages contenant plusieurs médias (vidéo/image)
// 0.9.1.1   - Affichage des smileys en taille "micro" (la taille "mini" est trop grande par rapport au texte affiché)
// 0.9.1     - Conversion d'un PDF en plusieurs images.
// 0.9.0.6   - Twitter : Certains caractères Unicode ne passent toujours pas avec HFR, remplacement de ces caractères par d'autres leur ressemblant (je sais, c'est moche).
// 0.9.0.5   - Twitter : correction du code pour la copie du tweet.
// 0.9.0.4   - Instagram : vérification si la photo est jointe avec du texte.
// 0.9.0     - Méthodes asynchrones pour Twitter et Instagram.
// 0.8.9     - Twitter : ajout des hashtags évènementiels. rehost automatique des icônes Unicode.
// 0.8.8.4   - mode anonyme pour Twitter et Instagram.
// 0.8.8     - formatage correct du nom et du texte pour Instagram.
// 0.8.7     - [roger21] affichage du logo du site et lien vers le message dans le nom de la citation.
// 0.8.6     - affichage du nom enrichi pour Twitter.
// 0.8.5     - Vérifier si le texte est formatable avant de le formater (consomme moins de ressources).
// 0.8.4.3   - Limitation du nombre de caractères avant formatage du texte.
// 0.8.4     - Formate les caractères Unicode lors d'un simple copié/collé ou d'un glissé/déposé.
// 0.8.3     - Compatibilité TamperMonkey : Cette extension ne gère pas correctement les réponses Blob. On doit donc créer un nouveau blob à partir de l'ancien, avec le bon mime-type.
// 0.8.2     - Changement dans l'ordre des types de données : Préférer "Files" plutôt que "text/html".
// 0.8.1     - Inversion de l'ordre des types de données du presse-papier. Analyser le texte d'abord, puis le code HTML si existant.
// 0.8.0     - Compatibilité GreaseMonkey 4 : création d'une pile pour remplacer le contexte des requêtes.
// 0.7.2.1   - vérifie si la valeur des liens est bien une chaîne de caractères.
// 0.7.2     - copie du texte original si erreur.
// 0.7.0     - "génial ton truc ! Et Instagram c'est possible ?" ouais.
// 0.6.5.1   - Changement de nom.
// 0.6.5     - Remplacement des liens GIF/vidéo Twitter par des lecteurs adaptés.
// 0.6.4     - Ajout des citations Twitter (tweets imbriqués).
// 0.6.3     - Medias Twitter à l'intérieur de la citation.
// 0.6.2     - lien vers la vidéo .mp4 du GIF Twitter (si existant)
// 0.6.0     - Sur une proposition de DaddyFatSa​x, reconnaissance des liens Twitter et coller le message formaté
// 0.5.3     - On vérifie si reho.st répond et n'est pas proxytaffé :o
// 0.5.2.1   - On est bien là.
// 0.5       - ton navigateur ne respecte pas les dernières normes & innovations ? Tant pis pour toi.
// 0.4.3.1   - taille du bouton d'envoi d'image à 24px (fixe le conflit avec des scripts comme "smileys favoris")
// 0.4.3     - Compatibilité TamperMonkey / GreaseMonkey
// 0.4.2     - correction du bouton d'envoi d'images (taille / position)
// 0.4.0.1   - compatibilité HTTPS.
// 0.3.9     - ajout d'un bouton type "image/file" à chaque zone de texte, fixant le problème de glisser/déposer de certains explorateurs de fichiers.
// 0.3.4     - certaines images ont une balise "data-src", et non "src". Allez comprendre
// 0.3.3     - conversion des URI base64 en Blob
// 0.3.2     - correction du glisser/déposer des images 
// 0.3.0     - si les données glisées sont du type "text/uri-list", les télécharger et passer à la fonction "process".
// 0.2.3     - compatibilité ViolentMonkey
// 0.2.2     - [roger21] envoi des images dans l'ordre.
// 0.2.1     - Possibilité d'envoi de plusieurs images
// 0.2.0     - Réintégration d'imgur, si l'image fait > 2 Mo, basculement vers imgur, sinon rester sur reho.st
// 0.1.2     - Ajout d'une balise [url] vers l'image originale
// 0.1.1     - Maintenant que tout est bon, on vire imgur et on met reho.st
// 0.0.8     - Glisser/déposer les fichiers depuis un explorateur de fichiers vers la zone de texte
// 0.0.7     - [roger21] possibilité de copié/collé dans une réponse rapide
// 0.0.6.3   - insertion des données au curseur
// 0.0.3     - [roger21] ajout d'une icône de chargement

function isGM4() {
	if (typeof (GM) !== "object")
		return false;
	if (typeof (GM.info) !== "object")
		return false;
	return GM.info.scriptHandler == "Greasemonkey" && parseFloat(GM.info.version) >= 4;
}

function insert_text_at_cursor (textarea, text) {
	var start = textarea.selectionStart;
	var end = textarea.selectionEnd;
	textarea.value = textarea.value.substr (0, start) + text + textarea.value.substr (end);
	textarea.setSelectionRange (start + text.length, start + text.length);
}

let HFR = {
	data : {
		mastodon_icon : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9bpaIVB4uoOGSoDmJB/MJRq1CECqFWaNXB5NIPoUlDkuLiKLgWHPxYrDq4OOvq4CoIgh8gjk5Oii5S4v+SQosYD4778e7e4+4d4K8WmWq2jAKqZhnJeExIZ1aE4Cs60IceTGJYYqY+K4oJeI6ve/j4ehflWd7n/hydStZkgE8gnmG6YRGvE09tWjrnfeIwK0gK8TnxiEEXJH7kuuzyG+e8w36eGTZSyTniMLGQb2K5iVnBUIkniCOKqlG+P+2ywnmLs1oss/o9+QtDWW15ies0BxDHAhYhQoCMMjZQhIUorRopJpK0H/Pw9zt+kVwyuTbAyDGPElRIjh/8D353a+bGx9ykUAxofbHtj0EguAvUKrb9fWzbtRMg8AxcaQ1/qQpMf5JeaWiRI6BrG7i4bmjyHnC5A/Q+6ZIhOVKApj+XA97P6JsyQPct0L7q9lbfx+kDkKKuEjfAwSEwlKfsNY93tzX39u+Zen8/7ZJy2PR6GIIAAAAGYktHRAD4APgA+Im2+KUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfmCxoKGDN04ahMAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAeRJREFUOMul070vnWEYBvDfOV5fCUciWkcpEkmxSDBpLG0i/gCJlA7SJqZu7WrsqkM/ln6sLLUYJI3BqrVJu1CJjxAtMRQHcXg7PIeDk3TpPb3vnee6rvu6nudOwNBwnMYYBpD279rGFF5OTiS2EznwF3RAqpLWNtK1RBExModkMiwts7NDHINF9Ec55Y4oYmSE+z2UlZFI5CVzANksi4u8/8D+vg6MJXNjG3rEwwcBvLvL2loAxDGbm2xthYm6u3n65FJgIEI6iujqCs3vPxgfp6iInh7q7/B5KpA9Hqavj/Z2Sko4OZFOEphTqaD27Su9vbx5zckJc3O8Gg8Tzs5yfk55OclksBURlKMoNPb2uNcaDjU0BOXKSurqODjM53FRSQLr8XHhfRUlKS3N/VwJ9SKbywnOzzk9LSTo68thE9f7mQxnZzcIjo6ormZwMNwEIaiLam7ixfPgfX09LxgR2P7sU4/GxvzdX1VOpaioYHWVicl8P7r42NigvS33VreZmQkTlZZxlg0BLi3xc5ns2XWCbaSnp+ns5FYNNTVUVTE/H+w03GVlJTyum3uRGBqO3+IZ1N5mdJSWFoqLg404Dvl8/MTCQgHBu4JlSiaD3+amYOHXb9bX2D8oAC+iP/G/6/wXu1qrEEayV6MAAAAASUVORK5CYII="
	},
	normalizeText : function (str) {
		
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
			res_arr.push (String.fromCodePoint (code));
		}
		return res_arr.join("")
	},
	Stack : function() {
		var counter = -1;
		this.objects = {};
		this.add = function (data) {
			counter++;
			this.objects[counter.toString()] = data;
			return counter;
		};
		this.getData = function (index) {
			return this.objects[index.toString()];
		}
	},
	regex : {
		twitter : /^(https:\/\/(mobile\.)?twitter\.com\/\w+\/status\/(?<id>\d+)(\?s=\d+)?\??.*)$/g,
		instagram : /^(https:\/\/(www\.)?instagram\.com\/p\/\w+\/)$/g,
		telegram : /^(https:\/\/t\.me\/[a-z]+\/\d+)$/g,
		minds : /^(https:\/\/www\.minds\.com\/newsfeed\/\d+)$/g,
		sndup : /^(https:\/\/sndup\.net\/[a-z0-9]+\/d)$/g,
		zippy : /^(https:\/\/www41.zippyshare.com\/downloadAudioHQ\?key=\w+)$/g,
		youtube : /^https:\/\/(www\.youtube\.com\/watch\?v=|youtu.be\/)(?<id>[^&#]*)/g,
		mastodon : /^(https:\/\/(?<instance>[a-z\.]+)\/@\w+(@[a-z\.]+)?\/(?<tid>\d+))$/g,
		exec : function (reg, str) {
			reg.lastIndex = -1;
			return reg.exec (str);
		}
	},
	registerCommand : function (caption, func, key) {
		if (isGM4())
			GM.registerMenuCommand (caption, func, key);
		else
			GM_registerMenuCommand (caption, func, key);
	},
	request : function (object) {
		if (isGM4())
			return GM.xmlHttpRequest (object);
		else
			return GM_xmlhttpRequest (object);
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
	getValue : function (key, default_value) {
		if (!isGM4())
			return GM_getValue (key, default_value);
		var rk = GM.info.script.name + " :: " + key;
		if (!localStorage.hasOwnProperty(rk))
			return default_value;
		return localStorage.getItem (rk);
	},
	ImageType : {
		small_square : { desc : "petit carré", key : "s" },
		big_square : { desc : "grand carré", key : "b" },
		small_thumbnail : { desc : "petite miniature", key : "t" },
		medium_thumbnail : { desc : "moyenne miniature", key : "m" },
		large_thumbnail : { desc : "large miniature", key : "l" },
		huge_thumbnail : { desc : "grosse miniature", key : "h" },
		original : { desc : "original", key : "" }
	},
	Image : function (id, type) {
		this.title = type.desc;
		this.source = "https://i.imgur.com/" + id + type.key + ".png";
		this.link = "https://i.imgur.com/" + id + ".png";
		
		this.getBBCode = function (b) {
			var str = "[img]" + this.source + "[/img]";
			if (b == true)
				str = "[url=" + this.link + "]" + str + "[/url]";
			return str;
		};
	},
	HashWindow : function() {
		var background = null;
		var win = null;
		var select = null;
		
		this.hide = function() {
			if (document.querySelector("div#apercu_reponse")) 
				document.querySelector("div#apercu_reponse").classList.remove ("hfr_apercu_nope");
			if (background && background.parentElement)
				background.parentElement.removeChild (background);
		}
		
		this.display = function() {
			while (select.querySelector ("option"))
				select.remove (0);
			var hash_table = JSON.parse (HFR.getValue ("hfr-copie-colle-hash-table", "[]"));
			for (var i = 0; i < hash_table.length; i++) {
				var option = document.createElement ("option");
				option.setAttribute ("value", hash_table[i].hash);
				option.appendChild (document.createTextNode (hash_table[i].image));
				select.appendChild (option);
			}
			
			if (background.parentElement == null)
				document.body.appendChild (background);
			if(document.querySelector("div#apercu_reponse"))
				document.querySelector("div#apercu_reponse").classList.add("hfr_apercu_nope");
			background.style.display = "block";
			win.style.display = "block";
			background.style.width = document.documentElement.scrollWidth + "px";
			background.style.height = document.documentElement.scrollHeight + "px";
			win.style.left = ((document.documentElement.clientWidth - win.offsetWidth) / 2) + "px";
			win.style.top = ((document.documentElement.clientHeight - win.offsetHeight) / 2) + "px";
			background.style.opacity = "0.8";
		} 
		
		var count = 0;
		while (document.querySelector("#hfr_cc_" + count + "_window") != null)
			count++;
		
		var style = document.createElement ("style");
		style.textContent = "#hfr_cc_" + count + "_background {position:fixed;left:0;top:0;background-color:#242424;z-index:1001;" +
				  "display:none;opacity:0;transition:opacity 0.7s ease 0s;}" +
				  "#hfr_cc_" + count + "_window {position:fixed;z-index:1002;display:none;background:rgba(255,255,255,1);padding:5px;text-align : center;}" +
				  ".hfr_apercu_nope{display:none !important;}";
		document.head.appendChild (style);
		
		win = document.createElement ("div");
		var img_cancel = document.createElement ("img");
		img_cancel.setAttribute ("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAY1BMVEUAAAD///9VVVX///9AQECZmZmSkpL////6+vr39/f6+vr6+vr39/f6+vr///9NTU1PT09OTk5OTk5OTk5OTk5tbW1qamp1dXV6enp4eHh3d3d4eHhNTU10dHR0dHRZWVlNTU04MJFLAAAAIHRSTlMAAgMDBAUHXF5fX2BiY3ieoqOkqarEysvT1NXV1tfY5cy3b0QAAABVSURBVHjaYqAWAHQi1wYMRTEMAG1/ZqaH2n/KdBogV15YTMSWwHiwm+14GO2Hc0PsGNp7II2FUHUBdy1kK5LDUTIWuGlwWBj5HVSHNzPmRkW0meU/P15vBKOP7JGeAAAAAElFTkSuQmCC");
		img_cancel.onclick = this.hide;
		img_cancel.style.float = "left";
		win.appendChild (img_cancel);
		win.appendChild (document.createElement ("br"));
		win.appendChild (document.createTextNode ("liste des images envoyées"));
		win.appendChild (document.createElement ("br"));
		select = document.createElement ("select");
		select.setAttribute ("size", "10");
		win.appendChild (select);
		win.appendChild (document.createElement ("br"));
		var button = document.createElement ("button");
		button.onclick = e => {
			var index = select.selectedIndex;
			var hash_table = JSON.parse (HFR.getValue ("hfr-copie-colle-hash-table", "[]"));
			var hash = select.options[index].value;
			select.remove (index);
			hash_table.splice (index, 1);
			HFR.setValue ("hfr-copie-colle-hash-table", JSON.stringify (hash_table));
			this.hide();
			HFR.request({
				method : "DELETE",
				headers : {		
					"Authorization" : "Client-ID d1619618d2ac442"
				},
				url : "https://api.imgur.com/3/image/" + hash,
				onerror : function (response) {
					console.log (response);
				},
				onload : function (response) {
					var result = JSON.parse (response.responseText);
					console.log (result.success);
				}
			});
		};
		button.textContent = "effacer";
		win.appendChild (button);
		win.setAttribute ("id", "hfr_cc_" + count + "_window");
		background = document.createElement ("div");
		background.setAttribute ("id", "hfr_cc_" + count + "_background");
		background.appendChild (win);
		background.addEventListener("transitionend", function() {
			if(background.style.opacity === "0") {
				background.style.display = "none";
				win.style.display = "none";
				if(document.querySelector("div#apercu_reponse"))
					document.querySelector("div#apercu_reponse").classList.remove("hfr_apercu_nope");
			}
		}, false);
		document.body.appendChild(background);
	},
	Window : function (ta, data) {
		var textarea = ta; 
		var background = null;
		var win = null;
		var images = [];
		var oon = HFR.getValue ("hfr-copie-colle-window", "oui") == "oui" ? true : false;
		var hash_table = JSON.parse (HFR.getValue ("hfr-copie-colle-hash-table", "[]"));
		var t = HFR.getValue ("hfr-copie-colle-nb-images", "10");
		if (isNaN (t))
			t = 10
		else
			t = parseInt(t);
		if (hash_table.length == t)
			hash_table.splice (0, 1);
		hash_table.push ({
			image : data.link,
			hash : data.deletehash
		});
		HFR.setValue ("hfr-copie-colle-hash-table", JSON.stringify (hash_table));
		
		this.addImage = function (img) {
			images.push (img);
		}
		
		this.hide = function() {
			if (document.querySelector("div#apercu_reponse")) 
				document.querySelector("div#apercu_reponse").classList.remove ("hfr_apercu_nope");
			if (background && background.parentElement)
				background.parentElement.removeChild (background);
		}
		
		this.display = function() {
			if (!oon)
				if (images.length > 0) {
					var image = images[0];
					insert_text_at_cursor (textarea, image.getBBCode (true));
					if (textarea.files != null && textarea.files_index < textarea.files.length)
						process (textarea, textarea.files.item (textarea.files_index++));
					return;
				}
			for (var i = 0; i < images.length; i++) {
				var image = images[i];
				var button = document.createElement ("button");
				button.textContent = image.title;
				button.image = image;
				var hw = this;
				button.style = "margin-left : 2px; margin-right: 2px;";
				button.onclick = e => {
					insert_text_at_cursor (textarea, e.target.image.getBBCode (true));
					hw.hide();
					if (textarea.files != null && textarea.files_index < textarea.files.length)
						process (textarea, textarea.files.item (textarea.files_index++));
				};
				button.oncontextmenu = e => {
					insert_text_at_cursor (textarea, e.target.image.getBBCode (false));
					hw.hide();
					e.preventDefault();
					if (textarea.files != null && textarea.files_index < textarea.files.length)
						process (textarea, textarea.files.item (textarea.files_index++));
				};
				win.appendChild (button);
			}
			
			if (background.parentElement == null)
				document.body.appendChild (background);
			if(document.querySelector("div#apercu_reponse"))
				document.querySelector("div#apercu_reponse").classList.add("hfr_apercu_nope");
			background.style.display = "block";
			win.style.display = "block";
			background.style.width = document.documentElement.scrollWidth + "px";
			background.style.height = document.documentElement.scrollHeight + "px";
			win.style.left = ((document.documentElement.clientWidth - win.offsetWidth) / 2) + "px";
			win.style.top = ((document.documentElement.clientHeight - win.offsetHeight) / 2) + "px";
			background.style.opacity = "0.8";
		} 
		
		var count = 0;
		while (document.querySelector("#hfr_cc_" + count + "_window") != null)
			count++;
		
		var style = document.createElement ("style");
		style.textContent = "#hfr_cc_" + count + "_background {position:fixed;left:0;top:0;background-color:#242424;z-index:1001;" +
				  "display:none;opacity:0;transition:opacity 0.7s ease 0s;}" +
				  "#hfr_cc_" + count + "_window {position:fixed;z-index:1002;display:none;background:rgba(255,255,255,1);padding:5px;text-align : center;}" +
				  ".hfr_apercu_nope{display:none !important;}";
		document.head.appendChild (style);
		
		win = document.createElement ("div");
		var img_cancel = document.createElement ("img");
		img_cancel.setAttribute ("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAY1BMVEUAAAD///9VVVX///9AQECZmZmSkpL////6+vr39/f6+vr6+vr39/f6+vr///9NTU1PT09OTk5OTk5OTk5OTk5tbW1qamp1dXV6enp4eHh3d3d4eHhNTU10dHR0dHRZWVlNTU04MJFLAAAAIHRSTlMAAgMDBAUHXF5fX2BiY3ieoqOkqarEysvT1NXV1tfY5cy3b0QAAABVSURBVHjaYqAWAHQi1wYMRTEMAG1/ZqaH2n/KdBogV15YTMSWwHiwm+14GO2Hc0PsGNp7II2FUHUBdy1kK5LDUTIWuGlwWBj5HVSHNzPmRkW0meU/P15vBKOP7JGeAAAAAElFTkSuQmCC");
		img_cancel.onclick = this.hide;
		img_cancel.style.float = "left";
		win.appendChild (img_cancel);
		win.appendChild (document.createElement ("br"));
		win.appendChild (document.createTextNode ("hash d'effacement : " + data.deletehash));
		win.appendChild (document.createElement ("br"));
		var img_preview = document.createElement ("img");
		img_preview.onload = function (e) {
			if (img_preview.width > 800)
			img_preview.width = 800;
			if (img_preview.height > 200)
				img_preview.height = 200;
		};
		img_preview.src = data.link;
		win.appendChild (img_preview);
		win.appendChild (document.createElement ("br"));
		win.appendChild (document.createTextNode ("Images disponibles :"));
		win.appendChild (document.createElement ("br"));
		win.appendChild (document.createTextNode ("(clic droit sur un des bouton pour une insertion sans lien, clic en dehors de la fenêtre pour annuler l'action)"));
		win.appendChild (document.createElement ("br"));
		win.setAttribute ("id", "hfr_cc_" + count + "_window");
		background = document.createElement ("div");
		background.setAttribute ("id", "hfr_cc_" + count + "_background");
		background.appendChild (win);
		background.addEventListener("transitionend", function() {
			if(background.style.opacity === "0") {
				background.style.display = "none";
				win.style.display = "none";
				if(document.querySelector("div#apercu_reponse"))
					document.querySelector("div#apercu_reponse").classList.remove("hfr_apercu_nope");
			}
		}, false);
		document.body.appendChild(background);
	},
	Throbber : function() {
		var throbber = null;
		var throbber_img = null;
		
		this.hide = function() {
			throbber_img.style.opacity = "0";
			throbber.style.opacity = "0";
			if (document.querySelector("div#apercu_reponse")) 
				document.querySelector("div#apercu_reponse").classList.remove ("hfr_apercu_nope");
		}
		
		this.destroy = function() {
			this.hide();
			throbber.parentElement.removeChild (throbber);
		}
		
		this.display = function() {
			if (throbber.parentElement == null)
				document.body.appendChild (throbber);
			if(document.querySelector("div#apercu_reponse"))
				document.querySelector("div#apercu_reponse").classList.add("hfr_apercu_nope");
			throbber_img.style.display = "block";
			throbber.style.display = "block";
			throbber.style.width = document.documentElement.scrollWidth + "px";
			throbber.style.height = document.documentElement.scrollHeight + "px";
			throbber_img.style.opacity = "1";
			throbber.style.opacity = "0.8";
		}
		
		var count = 0;
		while (document.querySelector("#hfr_" + count + "_throbber") != null)
			count++;
		var style = document.createElement ("style");
		style.textContent = "#hfr_" + count + "_throbber{position:fixed;left:0;top:0;background-color:#242424;z-index:1001;" +
				  "display:none;opacity:0;transition:opacity 0.7s ease 0s;}" +
				  "#hfr_" + count + "_throbber_img{position:fixed;left:calc(50% - 64px);top:calc(50% - 64px);width:128px;height:128px;z-index:1002;" +
				  "display:none;opacity:0;transition:opacity 0.7s ease 0s;border:0;padding:0;}" +
				  ".hfr_apercu_nope{display:none !important;}";
		document.head.appendChild (style);
		
		var throbber_image_url = "https://gitlab.com/BZHDeveloper/HFR/raw/master/throbber.png";
		throbber_img = new Image();
		throbber_img.src = throbber_image_url;
		throbber_img.setAttribute("id", "hfr_" + count + "_throbber_img");
		throbber = document.createElement("div");
		throbber.setAttribute("id", "hfr_" + count + "_throbber");
		throbber.appendChild(throbber_img);
		throbber.addEventListener("transitionend", function() {
			if(throbber.style.opacity === "0") {
				throbber_img.style.display = "none";
				throbber.style.display = "none";
				if(document.querySelector("div#apercu_reponse"))
					document.querySelector("div#apercu_reponse").classList.remove("hfr_apercu_nope");
			}
		}, false);
		document.body.appendChild(throbber);
	},
	Builder : function (data) {
		var txt = "";
		if (data != null)
			txt += data;
			
		this.append = function (str) {
			txt += str;
		};
		this.prepend = function (str) {
			txt = str + txt;
		}	
		this.toString = function() {
			return txt;
		};
	},
	isFloat : function (n) {
		return Number(n) === n;
	},
	init : function (callback) {
		var data = null;
		try {
			var json = localStorage.getItem ("hfr-cc-data");
			data = JSON.parse (json);
		}
		catch {}
		if (!(data instanceof Object))
			data = {};
		// mise à jour si vieille version Unicode
		if (!(data.unicode_table instanceof Array) || !data.hasOwnProperty ("version") || HFR.isFloat (data.version) && data.version < 15) {
			HFR.request({
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
};

HFR.init (table => {
	HFR.unicode_table = table;
	var hash_win = new HFR.HashWindow();
	
	HFR.registerCommand("[HFR] Copié/Collé -> Effacer une image", function() {
		var hash = prompt ("Entrez ici le hash d'effacement d'une image précédemment envoyée");
		HFR.request({
			method : "DELETE",
			headers : {		
				"Authorization" : "Client-ID d1619618d2ac442"
			},
			url : "https://api.imgur.com/3/image/" + hash,
			onerror : function (response) {
				console.log (response);
			},
			onload : function (response) {
				var result = JSON.parse (response.responseText);
				console.log (result.success);
			}
		});
	});

	
	HFR.registerCommand("[HFR] Copié/Collé -> liste des images", function() {
		hash_win.display();
	});
	
	HFR.registerCommand ("[HFR] Copié/Collé -> Taille de la liste des images", function() {
		var param = prompt ("Entrez un nombre (10 par défaut)", HFR.getValue ("hfr-copie-colle-nb-images", "10"));
		var val = "10";
		if (!isNaN(param))
			val = param;
		HFR.setValue ("hfr-copie-colle-nb-images", val);
	});
	// oui par défaut
	if(HFR.getValue ("hfr-copie-colle-twitter-enabled") != "oui" && HFR.getValue ("hfr-copie-colle-twitter-enabled") != "non")
		HFR.setValue ("hfr-copie-colle-twitter-enabled", "oui");

	HFR.registerCommand("[HFR] Copié/Collé -> remise à zéro", function() {
		if (localStorage.hasOwnProperty ("hfr-cc-data"))
			localStorage.removeItem ("hfr-cc-data");
	});
	
	HFR.registerCommand ("[HFR] Copié/Collé -> YouTube", function() {
		var param = prompt ("Formater les liens ? (tapez \"non\" ou \"oui\")", HFR.getValue ("hfr-copie-colle-youtube-enabled", "oui"));
		var val = "non";
		if (param == "oui")
			val = "oui";
		HFR.setValue ("hfr-copie-colle-youtube-enabled", val);
	});

	HFR.registerCommand ("[HFR] Copié/Collé -> Description YouTube", function() {
		var param = prompt ("Afficher les descriptions ? (tapez \"non\" ou \"oui\")", HFR.getValue ("hfr-copie-colle-youtube-description", "oui"));
		var val = "non";
		if (param == "oui")
			val = "oui";
		HFR.setValue ("hfr-copie-colle-youtube-description", val);
	});

	HFR.registerCommand("[HFR] Copié/Collé -> Twitter", function() {
		var param = prompt ("Formater les liens ? (tapez \"non\" ou \"oui\")", HFR.getValue ("hfr-copie-colle-twitter-enabled", "oui"));
		console.log ("merde");
		console.log (param);
		var val = "non";
		if (param == "oui")
			val = "oui";
		HFR.setValue ("hfr-copie-colle-twitter-enabled", val);
	});

	HFR.registerCommand("[HFR] Copié/Collé -> Instagram", function() {
		var param = prompt ("Formater les liens ? (tapez \"non\" ou \"oui\")", HFR.getValue ("hfr-copie-colle-instagram-enabled", "oui"));
		var val = "non";
		if (param == "oui")
			val = "oui";
		HFR.setValue ("hfr-copie-colle-instagram-enabled", val);
	});
	
	HFR.registerCommand("[HFR] Copié/Collé -> Telegram", function() {
		var param = prompt ("Formater les liens ? (tapez \"non\" ou \"oui\")", HFR.getValue ("hfr-copie-colle-telegram-enabled", "oui"));
		var val = "non";
		if (param == "oui")
			val = "oui";
		HFR.setValue ("hfr-copie-colle-telegram-enabled", val);
	});
	
	HFR.registerCommand("[HFR] Copié/Collé -> Minds", function() {
		var param = prompt ("Formater les liens ? (tapez \"non\" ou \"oui\")", HFR.getValue ("hfr-copie-colle-minds-enabled", "oui"));
		var val = "non";
		if (param == "oui")
			val = "oui";
		HFR.setValue ("hfr-copie-colle-minds-enabled", val);
	});
	
	HFR.registerCommand("[HFR] Copié/Collé -> Mastodon", function() {
		var param = prompt ("Formater les liens ? (tapez \"non\" ou \"oui\")", HFR.getValue ("hfr-copie-colle-mastodon-enabled", "oui"));
		var val = "non";
		if (param == "oui")
			val = "oui";
		HFR.setValue ("hfr-copie-colle-mastodon-enabled", val);
	});
	
	HFR.registerCommand("[HFR] Copié/Collé -> prévisualisation des liens", function() {
		var param = prompt ("Afficher le contenu des liens ? (tapez \"non\" ou \"oui\")", HFR.getValue ("hfr-copie-colle-preview", "non"));
		var val = "non";
		if (param == "oui")
			val = "oui";
		HFR.setValue ("hfr-copie-colle-preview", val);
	});
	
	HFR.registerCommand("[HFR] Copié/Collé -> fenêtre de sélection", function() {
		var param = prompt ("Si \"oui\", une fenêtre sera affiché après réception du BBCode", HFR.getValue ("hfr-copie-colle-window", "oui"));
		var val = "non";
		if (param == "oui")
			val = "oui";
		HFR.setValue ("hfr-copie-colle-window", val);
	});
	
	let stack = new HFR.Stack();

	function insert (textarea, link, src) {
		insert_text_at_cursor (textarea, `[url=${link}][img]${src}[/img][/url]`);
		if (textarea.files != null && textarea.files_index < textarea.files.length)
			process (textarea, textarea.files.item (textarea.files_index++));
	}

	function textToUnicode (text) {
		var array = Array.from (text);
		var result = [];
		for (var i = 0; i < array.length; i++)
			result.push (array[i].codePointAt (0).toString (16));
		return result.join ("-");
	}

	function isFormattable (text) {
		var array = Array.from (text);
		var uarray = [];
		for (var i = 0; i < array.length; i++) {
			uarray.push (array[i].codePointAt (0).toString (16));
		}
		var tmp = uarray.join ("-");
		var found = false;
		for (var i = 0; i < HFR.unicode_table.length; i++) {
			if (tmp.indexOf (HFR.unicode_table[i]) > -1) {
				found = true;
				break;
			}
		}
		return found;
	}

	function formatName (text) {
		var table = [ "1D54B", "2297", "4F3", "1D560" ];
		var array = Array.from (text);
		var uarray = [];
		for (var i = 0; i < array.length; i++) {
			uarray.push (array[i].codePointAt (0).toString (16).toUpperCase());
		}
		var str = "";
		for (var i = 0; i < array.length; i++)
			if (uarray[i] == "1D54B")
				str += "T";
			else if (uarray[i] == "2297" || uarray[i] == "1D560")
				str += "o";
			else str += array[i];
		return str;
	}
	
	function feof_convert (code) {
		for (var c of HFR.unicode_table) {
			if (c == code)
				return c;
			if (c == code + "-fe0f")
				return c;
		}
		return code;
	}

	function formatText (text) {
		if (!isFormattable (text))
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
			for (var i = 0; i < HFR.unicode_table.length; i++) {
				if (tmp.indexOf (HFR.unicode_table[i]) == 0) {
					result  = result + "[img]https://gitlab.com/BZHDeveloper/HFR/raw/master/emojis-micro/" + feof_convert (HFR.unicode_table[i]) + ".png[/img]";
					tmp = tmp.substring (1 + HFR.unicode_table[i].length);
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
	
	function tweet_to_quote (tweet) {
		var builder = new HFR.Builder();
		builder.append ("[citation=1,1,1][nom] [:fabrice division:10] [url=https://twitter.com/i/status/" + tweet.id_str + "]" + formatText (HFR.normalizeText(tweet.user.name)) + (tweet.user.verified ? " [:yoann riou:9]" : "") + " (@" + tweet.user.screen_name + ")[/url][/nom]");
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
				builder.append ("[url=https://twitter.com/" + _mention.screen_name + "][b]@" + _mention.screen_name + "[/b][/url]");
				i += _mention.indices[1] - _mention.indices[0] - 1;
			}
			else if (_hashtag) {
				builder.append ("[url=https://twitter.com/hashtag/" + _hashtag.text + "][b]#" + _hashtag.text + "[/b][/url]");
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
				builder.append (HFR.normalizeText(array[i]));
		}
		if (tweet.video) {
			builder.append ("\n");
			var video_src = "";
			for (var i = 0; i < tweet.video.variants.length; i++)
				if (tweet.video.variants[i].type == "video/mp4")
					video_src = tweet.video.variants[i].src;
			var url_data = (video_src == "") ? "" : "&hfr-url-data=" + encodeURIComponent (video_src);
			builder.append ("[url=https://twitter.com/i/status/" + tweet.id_str + "][img]https://rehost.diberie.com/Rehost?size=min&url=" + tweet.video.poster + url_data + "[/img][/url]");
		}
		else if (tweet.photos) {
			builder.append ("\n");
			for (var photo of tweet.photos) {
				builder.append ("[url=https://rehost.diberie.com/Rehost?url=" + photo.url + "][img]https://rehost.diberie.com/Rehost?size=min&url=" + photo.url + "[/img][/url]");
			}
		}
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
				builder.append ("[quote]" + tweet.card.binding_values.description.string_value + "[/quote]");
			}
		}
		
		builder.append ("[/citation]");		
		
		if (tweet.quoted_tweet) {
			builder.prepend ("\n");
			builder.prepend (tweet_to_quote (tweet.quoted_tweet));
		}
		
		return formatText (builder.toString());
	}
	
	function twitter_async (ctx, text) {
		return new Promise ((resolve, reject) => {
			try {
				var json = JSON.parse (text);
				resolve (tweet_to_quote (json));
			}
			catch (e) {
				console.log (e);
				reject (ctx.uri);
			}
		});
	}

	function twitter (area, uri) {
		var res = HFR.regex.exec (HFR.regex.twitter, uri);
		if (res == null) {
			insert_text_at_cursor (area, uri);
			return;
		}
		
		var throbber = new HFR.Throbber();
		throbber.display();
		var context = { 
			textarea : area,
			uri : uri,
			throbber : throbber
		};
		var id = stack.add (context);
		HFR.request({
			method : "GET",
			url : "https://cdn.syndication.twimg.com/tweet-result?token=43l77nyjhwo&id=" + res.groups.id,
			context : { id : id },
			onabort : throbber.hide,
			onerror : throbber.hide,
			ontimeout : throbber.hide,
			onload : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				twitter_async (context, response.responseText).then (text => {
					context.throbber.destroy();
					insert_text_at_cursor (context.textarea, text);
				}).catch (err => {
					console.log (err);
					context.throbber.destroy();
					insert_text_at_cursor (context.textarea, context.uri);
				});
			}
		});
	}
	
	function minds_async (html, uri) {
		return new Promise ((resolve, reject) => {
			var doc = new DOMParser().parseFromString (html, "text/html");
			var element = doc.querySelector (".m-activityContent__messageWrapper");
			console.log (element);
			if (element == null)
				reject (uri);
			else {
				var n = doc.querySelector (".m-activityOwnerBlock__displayName");
				var id = n.getAttribute ("href").substring (1);
				var name = n.querySelector ("strong").textContent;
				var builder = new HFR.Builder (`[citation=1,1,1][nom][:icon3] [url=${uri}]${name} (@${id})[/url][/nom]`);
				builder.append (doc.querySelector (".m-activityContent__messageWrapper").textContent);
				builder.append ("[/citation]");
				resolve (builder.toString());
			}
		});
	}
	
	function minds (area, uri) {
		var throbber = new HFR.Throbber();
		throbber.display();
		var context = {
			textarea : area,
			uri : uri,
			throbber : throbber
		};
		var id = stack.add (context);
		HFR.request({
			method : "GET",
			url : uri,
			context : { id : id },
			headers : { "Cookie" : "" },
			anonymous : true,
			onabort : throbber.hide,
			onerror : throbber.hide,
			ontimeout : throbber.hide,
			onload : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				var textarea = context.textarea;
				var turi = context.uri;
				var tb = context.throbber;
				minds_async (response.responseText, turi).then (text => {
					tb.destroy();
					insert_text_at_cursor (textarea, text);
				}).catch (err => {
					console.log (err);
					tb.destroy();
					insert_text_at_cursor (textarea, turi);
				});
			}
		});
	}
	
	function rehost (url) {
		return new Promise ((resolve, reject) => {
			var form = new FormData();
			form.append ("image", url);
			HFR.request({
				method : "POST",
				data : form,
				headers : {		
					"Authorization" : "Client-ID d1619618d2ac442"
				},
				url : "https://api.imgur.com/3/image",
				onabort : () => { reject (url); }, 
				ontimeout : () => { reject (url); },
				onerror : () => { reject (url); },
				onload : function (response) {
					var object = JSON.parse (response.responseText);
					if (object.success)
						resolve ("[img]" + object.data.link.replace (object.data.id, object.data.id + "m") + "[/img]");
					else
						reject (url);
				}
			});
		});
	}
	
	function BuilderAsync() {
		this.tasks = [];
		this.result = "";
		
		this.append = function (p) {
			this.tasks.push (p);
		};
		
		this.appendString = function (str) {
			this.tasks.push (new Promise ((a, b) => {
				a (str);
			}));
		};
		
		this.toString = function (callback) {
			Promise.all (this.tasks).then (arr => {
				var str = "";
				for (var i = 0; i < arr.length; i++)
					str += arr[i];
				callback (str);
			}).catch (e => {
				console.log (e);
				callback ("");
			});
		};
	}

	function instagram_async (html, uri) {
		return new Promise ((resolve, reject) => {
			var doc = new DOMParser().parseFromString (html, "text/html");
			var node = doc.querySelector(".name");
			if (node != null) {
				var builder = new BuilderAsync();
				var id = node.firstChild.textContent.trim();
				var name = formatText (doc.querySelector (".name .nickname").textContent);
				var pp = doc.querySelector (".avatar img").getAttribute ("src");
				
				
				builder.appendString (`[citation=1,1,1][nom][url=${uri}]`);
				builder.append (rehost (pp));
				builder.appendString (` ${name} (${id})[/url][/nom]`);
				var video = doc.querySelector (".content .video-wrap");
				var swiper = doc.querySelector (".content .swiper-wrapper");
				if (video != null) {
					var vurl = video.getAttribute ("href");
					var iurl = video.querySelector ("img").getAttribute ("src");
					builder.appendString ("[url=" + vurl + "]");
					builder.append (rehost (iurl));
					builder.appendString ("[/url]");
				}
				else if (swiper != null) {
					swiper.querySelectorAll (".swiper-slide img").forEach (e => {
						builder.append (rehost (e.getAttribute ("src")));
					});
				}
				else {
					var iurl = doc.querySelector (".content img").getAttribute ("data-src");
					builder.appendString ("[img]");
					builder.append (rehost (iurl));
					builder.appendString ("[/img]");
				}
				var desc = doc.querySelector (".content .desc");
				if (desc != null) {
					builder.appendString ("\n");
					desc.childNodes.forEach (node => {
						console.log (node.nodeName);
						if (node.nodeName.toLowerCase() == "#text")
							builder.appendString (formatText (node.nodeValue));
						if (node.nodeName.toLowerCase() == "a" && node.textContent != null && node.textContent.length > 0)
							builder.appendString ("[url=https://www.instagram.com" + node.getAttribute ("href") + "]" + node.textContent + "[/url]");
					});
				}
				builder.appendString ("[/citation]");
				builder.toString (resolve);
			}
			else
				reject (uri);
		});
	}

	function instagram (area, uri) {
		var throbber = new HFR.Throbber();
		throbber.display();
		var context = {	
			textarea : area,
			uri : uri,
			throbber : throbber
		};
		var id = stack.add (context);
		HFR.request({
			method : "GET",
			url : uri.replace ("instagram.com", "imginn.org"),
			context : { id : id },
			onabort : throbber.hide,
			onerror : throbber.hide,
			ontimeout : throbber.hide,
			headers : { "Cookie" : "" },
			anonymous : true,
			onload : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				var textarea = context.textarea;
				var turi = context.uri;
				var tb = context.throbber;
				instagram_async (response.responseText, turi).then (text => {
					tb.destroy();
					insert_text_at_cursor (textarea, text);
				}).catch (err => {
					console.log (err);
					tb.destroy();
					insert_text_at_cursor (textarea, turi);
				});
			}
		});
	}
	
	function telegram_async (html, turi) {
		return new Promise ((resolve, reject) => {
			var doc = new DOMParser().parseFromString (html, "text/html");
			var bubble = doc.querySelector (".tgme_widget_message_bubble");
			if (bubble == null)
				reject();
			else {
				var name = formatText (bubble.querySelector (".tgme_widget_message_owner_name").textContent);
				var text = bubble.querySelector (".tgme_widget_message_text");
				var video = bubble.querySelector (".tgme_widget_message_video_player");
				var photos = bubble.querySelectorAll (".tgme_widget_message_photo_wrap");
				var builder = new HFR.Builder (`[citation=1,1,1][nom][url=${turi}][img]https://gitlab.com/BZHDeveloper/hfr/-/raw/master/telegram-logo.png[/img] ${name}[/url][/nom]`);
				if (video != null) {
					var video_url = video.querySelector (".tgme_widget_message_video").getAttribute ("src");
					var thumb = video.querySelector (".tgme_widget_message_video_thumb").style.backgroundImage;
					thumb = thumb.substring (thumb.indexOf ("url(\"") + 5);
					thumb = thumb.substring (0, thumb.lastIndexOf ("\")"));
					builder.append (`[url=${video_url}][img]https://rehost.diberie.com/Rehost?url=${thumb}[/img][/url]\n`);
				}
				for (var i = 0; i < photos.length; i++) {
					var photo = photos.item (i);
					var thumb = photo.style.backgroundImage;
					thumb = thumb.substring (thumb.indexOf ("url(\"") + 5);
					thumb = thumb.substring (0, thumb.lastIndexOf ("\")"));
					builder.append (`[url=https://rehost.diberie.com/Rehost?url=${thumb}][img]https://rehost.diberie.com/Rehost?url=${thumb}[/img][/url] `);
				}
				if (photos.length > 0)
					builder.append ("\n");
				if (text != null)
					text.childNodes.forEach (node => {
						if (node.nodeName.toLowerCase() == "#text")
							builder.append (formatText (node.nodeValue));
						else if (node.nodeName.toLowerCase() == "br")
							builder.append ("\n");
						else if (node.nodeName.toLowerCase() == "a")
							builder.append ("[url=" + node.getAttribute ("href") + "]" + formatText (node.textContent) + "[/url]");
						else if (node.nodeName.toLowerCase() == "i")
							builder.append ("[i]" + formatText (node.textContent) + "[/i]");
						else if (node.nodeName.toLowerCase() == "b")
							builder.append ("[b]" + formatText (node.textContent) + "[/b]");
					});
				builder.append ("[/citation]");
				resolve (builder.toString());
			}
		});
	}
	
	function telegram (area, uri) {
		var url = new URL (uri);
		url.searchParams.append ("embed", "1");
		uri = url.toString();
		var throbber = new HFR.Throbber();
		throbber.display();
		var context = {
			textarea : area,
			uri : uri,
			throbber : throbber
		};
		var id = stack.add (context);
		HFR.request({
			method : "GET",
			url : uri,
			context : { id : id },
			onabort : throbber.hide,
			onerror : throbber.hide,
			ontimeout : throbber.hide,
			headers : { "Cookie" : "" },
			anonymous : true,
			onload : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				var textarea = context.textarea;
				var turi = context.uri;
				var tb = context.throbber;
				telegram_async (response.responseText, turi).then (text => {
					tb.destroy();
					insert_text_at_cursor (textarea, text);
				}).catch (err => {
					console.log (err);
					tb.destroy();
					insert_text_at_cursor (textarea, turi);
				});
			}
		});
	}
	
	function mastodon_async (json, uri) {
		return new Promise ((resolve, reject) => {
			try {
				var builder = new HFR.Builder();
				console.log ("json : " + json);
				var data = JSON.parse (json);
				console.log (data);
				var doc = new DOMParser().parseFromString (data.content, "text/html");
				console.log (doc);
				var id = data.account.acct;
				var instance = new URL (data.account.url).host;
				var name = data.account.display_name;
				builder.append (`[citation=1,1,1][nom][img]https://rehost.diberie.com/Picture/Get/f/110911[/img][url=${uri}]${name} (@${id}@${instance})[/url][/nom]`);
				var p = doc.querySelector ("p");
				while (p != null) {
					var c = p.firstChild;
					while (c != null) {
						if (c.nodeType == 3) {
							var text = formatText (c.textContent);
							builder.append (text);
						}
						else if (c.nodeType == 1) {
							if (c.nodeName.toLowerCase() == "br")
								builder.append ("\n");
							else if (c.classList.contains ("h-card") && c.querySelector (".u-url.mention") != null) {
								var a = c.querySelector ("a");
								var id = a.textContent;
								var lnk = a.getAttribute ("href");
								builder.append (`[url=${lnk}][b]${id}[/b][/url]`);
							}
							else if (c.classList.contains ("hashtag")) {
								var tag = c.querySelector ("span").textContent;
								var lnk = c.getAttribute ("href");
								builder.append (`[url=${lnk}][b]#${tag}[/b][/url]`);
							}
							else if (c.nodeName.toLowerCase() == "a") {
								var lnk = c.getAttribute ("href");
								builder.append (`[url][b]${lnk}[/b][/url]`);
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
	
	function mastodon (area, uri) {
		var throbber = new HFR.Throbber();
		throbber.display();
		
		var res = HFR.regex.exec (HFR.regex.mastodon, uri);
		var tid = res.groups.tid;
		var instance = res.groups.instance;
		var url = `https://${instance}/api/v1/statuses/${tid}`;
		console.log ("uri : " + url);
		var context = {	
			textarea : area,
			uri : uri,
			throbber : throbber
		};
		var id = stack.add (context);
		HFR.request({
			method : "GET",
			url : url,
			context : { id : id },
			onabort : throbber.hide,
			onerror : throbber.hide,
			ontimeout : throbber.hide,
			headers : { "Cookie" : "" },
			anonymous : true,
			onload : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				var textarea = context.textarea;
				var turi = context.uri;
				var tb = context.throbber;
				mastodon_async (response.responseText, turi).then (text => {
					tb.destroy();
					insert_text_at_cursor (textarea, text);
				}).catch (err => {
					console.log (err);
					tb.destroy();
					insert_text_at_cursor (textarea, turi);
				});
			}
		});
	}
	
	function youtube (area, uri) {
		var res = HFR.regex.exec (HFR.regex.youtube, uri);
		var video_id = res.groups.id;
		
		var throbber = new HFR.Throbber();
		throbber.display();
		var context = {
			video_id : video_id,
			textarea : area,
			uri : uri,
			throbber : throbber
		};
		var id = stack.add (context);
		HFR.request({
			method : "GET",
			url : uri,
			context : { id : id },
			onabort : throbber.destroy,
			ontimeout : throbber.destroy,
			headers : { "Cookie" : "" },
			anonymous : true,
			onerror : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				context.throbber.destroy();
				insert_text_at_cursor (context.textarea, context.uri);
			},
			onload : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				context.throbber.destroy();
				var json = response.responseText.split ("var ytInitialPlayerResponse = ")[1].split ("};")[0] + "}";
				var obj = JSON.parse (json);
				var img = "https://i.ytimg.com/vi/" + context.video_id + "/hqdefault.jpg";
				var desc = (HFR.getValue ("hfr-copie-colle-youtube-description") == "oui") ? `[quote]${obj.videoDetails.shortDescription}[/quote]` : "";
				var text = `[url=${context.uri}][b]${obj.videoDetails.title}[/b][/url]\n[img]${img}[/img]\n${desc}`;
				insert_text_at_cursor (context.textarea, text);
			}
		});
	}
	
	function process_audio (area, file) {
		var form = new FormData();
		form.append ("file", file);
		form.append ("name", "audio");
		
		var throbber = new HFR.Throbber();
		throbber.display();
		
		var context = {
			throbber : throbber,
			textarea : area
		};
		var id = stack.add (context);
		
		HFR.request({
			method : "POST",
			data : form,
			url : "https://www41.zippyshare.com/upload",
			context : { id : id },
			onabort : throbber.hide, 
			ontimeout : throbber.hide,
			onerror : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				var tb = context.throbber;
				tb.destroy();
			},
			onload : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				context.throbber.destroy();
				var doc = new DOMParser().parseFromString (response.responseText.trim(), "text/html");
				var url = doc.querySelector ("#urls > a").getAttribute ("href");
				var regex = /https:\/\/www(?<num>\d+)?\.zippyshare\.com\/v\/(?<id>\w+)\/file\.html/;
				var match = regex.exec (url);
				insert_text_at_cursor (context.textarea, "https://www41.zippyshare.com/downloadAudioHQ?key=" + match.groups.id);
			}
		});
	}

	function process (area, file) {
		if (file.type == "application/pdf") {
			loadPDFFile (area, file);
			return event.preventDefault();
		}
		var form = new FormData();
		form.append ("image", file);
		
		// chargement
		var throbber = new HFR.Throbber();
		throbber.display();
		
		var context = {
			throbber : throbber,
			textarea : area
		};
		var id = stack.add (context);
		HFR.request({
			method : "POST",
			data : form,
			headers : {		
				"Authorization" : "Client-ID d1619618d2ac442"
			},
			url : "https://api.imgur.com/3/image",
			context : { id : id },
			onabort : throbber.hide, 
			ontimeout : throbber.hide,
			onerror : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				var tb = context.throbber;
				tb.destroy();
			},
			onload : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				var tb = context.throbber;
				var textarea = context.textarea;
				tb.destroy();	
				var object = JSON.parse (response.responseText);
				if (object.success) {
					var win = new HFR.Window (textarea, object.data);
					win.addImage (new HFR.Image (object.data.id, HFR.ImageType.original));
					if (object.data.type != "image/gif") {
						var types = Object.keys (HFR.ImageType);
						for (var i = 0; i < types.length; i++)
							if (types[i] != "original")
								win.addImage (new HFR.Image (object.data.id, HFR.ImageType[types[i]]));
					}
					win.display();
				}
			}
		});
	}
	
	function download_file (uri) {
		var ext = uri.substring (1 + uri.lastIndexOf(".")).toLowerCase();
		var mime = "image/bmp";
		if (ext == "jpg" || ext == "jpeg")
			mime = "image/jpg";
		if (ext == "png")
			mime = "image/png";
		if (ext == "gif")
			mime = "image/gif";
		var context = {
			textarea : area,
			mime : mime
		};
		var id = stack.add (context);
		HFR.request({
			method : "GET",
			url : uri,
			responseType : "blob",
			context : { id : id },
			onload : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				process (context.textarea, response.response.slice (0, response.response.size, context.mime));
			}
		});
	}

	function download (area, uri) {
		var ext = uri.substring (1 + uri.lastIndexOf(".")).toLowerCase();
		var mime = "image/bmp";
		if (ext == "jpg" || ext == "jpeg")
			mime = "image/jpg";
		if (ext == "png")
			mime = "image/png";
		if (ext == "gif")
			mime = "image/gif";
		var context = {
			textarea : area,
			mime : mime
		};
		var id = stack.add (context);
		HFR.request({
			method : "GET",
			url : uri,
			responseType : "blob",
			context : { id : id },
			onload : function (response) {
				var context = stack.getData (id);
				if (response.context != null)
					context = stack.getData (response.context.id);
				process (context.textarea, response.response.slice (0, response.response.size, context.mime));
			}
		});
	}

	function drop (event) {
		event.preventDefault();
		var dt = event.dataTransfer;
		if (dt.types.includes ("text/plain")) {
			var url = dt.getData ("text");
			var len = url.split ("\n").length;
			if (len == 1 && HFR.regex.exec (HFR.regex.youtube, url) != null && HFR.getValue ("hfr-copie-colle-youtube-enabled") == "oui") {
				youtube (this, url);
				return event.preventDefault();
			}
			else if (len == 1 && HFR.regex.exec (HFR.regex.twitter, url) != null && HFR.getValue ("hfr-copie-colle-twitter-enabled") == "oui") {
				twitter (this, url);
				return event.preventDefault();
			}
			/*
			else if (len == 1 && HFR.regex.exec (HFR.regex.instagram, url)  != null && HFR.getValue ("hfr-copie-colle-instagram-enabled") == "oui") {
				instagram (this, url);
				return event.preventDefault();
			}
			*/
			else if (len == 1 && HFR.regex.exec (HFR.regex.telegram, url)  != null && HFR.getValue ("hfr-copie-colle-telegram-enabled") == "oui") {
				telegram (this, url);
				return event.preventDefault();
			}
			else if (len == 1 && HFR.regex.exec (HFR.regex.minds, url)  != null && HFR.getValue ("hfr-copie-colle-minds-enabled") == "oui") {
				minds (this, url);
				return event.preventDefault();
			}
			else if (len == 1 && HFR.regex.exec (HFR.regex.mastodon, url)  != null && HFR.getValue ("hfr-copie-colle-mastodon-enabled") == "oui") {
				mastodon (this, url);
				return event.preventDefault();
			}
		}
		if (dt.types.includes ("text/uri-list")) {
			if (dt.types.includes ("text/html")) {
				var doc = new DOMParser().parseFromString (dt.getData ("text/html"), "text/html");
				var img = doc.querySelector("img");
				if (img != null) {
					var src = img.getAttribute ("src");
					if (img.getAttribute ("data-src") != null)
						src = img.getAttribute ("data-src");
					if (src.indexOf ("data:image") == 0) {
						var blob = dataURItoBlob (src);
						process (this, blob);
					}
					else
						download (this, src);
					return 0;
				}
			}
			download (this, dt.getData ("URL"));
			return 0;
		}
		this.files = dt.files;
		this.files_index = 0;
		if (this.files.length > 0) {
			if (this.files.item (0).type.indexOf ("audio/") == 0)
				process_audio (this, this.files.item (0));
			else
				process (this, this.files.item (this.files_index++));
		}
		var text = dt.getData ("text");
		if (text.length < 700) {
			text = formatText (text);
			insert_text_at_cursor (this, text);
			return event.preventDefault();
		}
	}

	function pasting (event) {
		console.log ("crotte");
		console.log (HFR.getValue ("hfr-copie-colle-twitter-enabled"));
		if (event.clipboardData.types.includes ("text/plain")) {
			var url = event.clipboardData.getData ("text");
			var len = url.split ("\n").length;
			if (len == 1 && HFR.regex.exec (HFR.regex.youtube, url) != null && HFR.getValue ("hfr-copie-colle-youtube-enabled") == "oui") {
				youtube (this, url);
				return event.preventDefault();
			}
			else if (len == 1 && HFR.regex.exec (HFR.regex.twitter, url) != null && HFR.getValue ("hfr-copie-colle-twitter-enabled") == "oui") {
				twitter (this, url);
				return event.preventDefault();
			}
			/*
			else if (len == 1 && HFR.regex.exec (HFR.regex.instagram, url) != null && HFR.getValue ("hfr-copie-colle-instagram-enabled") == "oui") {
				instagram (this, url);
				return event.preventDefault();
			}
			*/
			else if (len == 1 && HFR.regex.exec (HFR.regex.telegram, url) != null && HFR.getValue ("hfr-copie-colle-telegram-enabled") == "oui") {
				telegram (this, url);
				return event.preventDefault();
			}
			else if (len == 1 && HFR.regex.exec (HFR.regex.minds, url)  != null && HFR.getValue ("hfr-copie-colle-minds-enabled") == "oui") {
				minds (this, url);
				return event.preventDefault();
			}
			else if (len == 1 && HFR.regex.exec (HFR.regex.mastodon, url) != null && HFR.getValue ("hfr-copie-colle-mastodon-enabled") == "oui") {
				mastodon (this, url);
				return event.preventDefault();
			}
			var text = event.clipboardData.getData ("text");
			if (text.length < 700) {
				text = formatText (text);
				insert_text_at_cursor (this, text);
				return event.preventDefault();
			}
		}
		else if (event.clipboardData.types.includes ("Files")) {
			var files = event.clipboardData.files;
			this.files = files;
			this.files_index = 0;
			if (files.length > 0) {
				if (this.files.item (0).type.indexOf ("audio/") == 0)
					process_audio (this, this.files.item (0));
				else
					process (this, this.files.item (this.files_index++));
				return event.preventDefault();
			}
		}
		else if (event.clipboardData.types.includes ("text/html")) {
			var doc = new DOMParser().parseFromString (event.clipboardData.getData ("text/html"), "text/html");
			var img = doc.querySelector("img");
			if (img != null) {
				var src = img.getAttribute ("src");
				if (img.getAttribute ("data-src") != null)
					src = img.getAttribute ("data-src");
				if (src.indexOf ("data:image") == 0) {
					var blob = dataURItoBlob (src);
					process (this, blob);
				}
				else
					download (this, src);
				return 0;
			}
		}
		else if (event.clipboardData.types.includes ("text/uri-list")) {
			var url = event.clipboardData.getData ("URL");
			if (HFR.regex.exec (HFR.regex.twitter, url) != null && HFR.getValue ("hfr-copie-colle-twitter-enabled") == "oui") {
				twitter (this, url);
				return event.preventDefault();
			}
			/*
			else if (HFR.regex.exec (HFR.regex.instagram, url) != null && HFR.getValue ("hfr-copie-colle-instagram-enabled") == "oui") {
				instagram (this, url);
				return event.preventDefault();
			}
			*/
			else if (HFR.regex.exec (HFR.regex.telegram, url) != null && HFR.getValue ("hfr-copie-colle-telegram-enabled") == "oui") {
				telegram (this, url);
				return event.preventDefault();
			}
			else if (HFR.regex.exec (HFR.regex.mastodon, url) != null && HFR.getValue ("hfr-copie-colle-mastodon-enabled") == "oui") {
				mastodon (this, url);
				return event.preventDefault();
			}
			else {
				download (this, url);
				return event.preventDefault();
			}
		}
	}
	
	function stroke (event) {
		console.log (event);
		
		if (event.key == "V" && event.ctrlKey) {
		
		}
	}

	function allow_drop (event) {
		event.preventDefault();
	}

	function file_send_images (event) {
		var ta = document.getElementById (event.target.getAttribute ("data-textarea"));
		if (ta == null)
			return;
		ta.files = this.files;
		ta.files_index = 0;
		if (ta.files.length > 0) {
			if (this.files.item (0).type.indexOf ("audio/") == 0)
				process_audio (ta, ta.files.item (0));
			else
				process (ta, ta.files.item (ta.files_index++));
		}
	}
	
	function find_form (textarea) {
		var parent = textarea.parentElement;
		while (parent != null) {
			if (parent.nodeName.toLowerCase() == "form")
				return parent;
			parent = parent.parentElement;
		}
		return false;
	}

	function add_button_to_textarea (event) {
		var num = -1;
		if (event.target.id.indexOf ("rep_editin_") == 0) {
			num = parseInt(event.target.id.split ("rep_editin_")[1]);
		}
		var file_id = "hfr-cc-file" + (num == -1 ? "" : "-" + num);
		var form = find_form (event.target);
		var btn = null;
		if (form == false)
			btn = event.target.parentElement.querySelector("input[type=\"button\"], input[type=\"submit\"]");
		else
			btn = form.querySelector("input[type=\"button\"], input[type=\"submit\"]");
		if (btn.parentElement.querySelector (".hfr-cc-button"))
			return;
		var button = document.createElement ("img");
		button.setAttribute ("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEg0lEQVR42mKAgVFgYmLyxtjY+D+l2MzM7ApZDgBq/rtx48b/s2fPBhu0/uRNYjFY/fz58/9v3rwZQHo1wMiWBdE14rVtc2zbtm3btm0b0dqKs+HaCr7tX1unkq9pvZ5JclqvcAq3bjU+X9w1gZSUFAJgsGb1S8WAfFZWFmVnZxPsaPJhYGBwPz+3YbhZW1vfpEJgdXWVhoaGdkUAmdvc3BQCb7755gsMH/5cwk7Xubw/ME4ZGRmdtLKyOmxubn6Mfx9UIZCbm0s5OTl6ESibeU/kHRwcyMzMTD6bmJgctbOzO+Lm5nYuMDCQYmNjKT09nVJTUykyMpL4d2IC+1UIzM3NUV9fnxipXPpcEew9fMnV1ZVCQkIoPj6eMjIyxFlycrI4Dg8PJ39/f/Lw8LgEkeeMHFAhUFZWRsXFxUKgdP4TRXjbwIDy8vLEkZ+fHxxogAICExMT1NXVJQQKZz5SAhAAaRhWBHd3d80EGhoaqKqqSgjkTn2gBCAAHRUnzs7OZG9vTzY2NhfQdNyAh9npae6P0yiTWgI4Ae3t7UIga/xdRTAwNKTKykriY0WWlpYwDP2z3GS/8+f3+b2ZT0Q0v5syXmICJ1EytQQ6OjqosbFR38lH5eXlxBESekjbHGCZ+7QS6O7upqamJjE8+dG3inDJMRum4eFhmYS7JjAwMEBtbW1CIL5vWxEMmUBpaakQQBPrImBqaqqZQGtrK9XV1QmB6O5NRTAyNhYCxvze29uriEB+fr7mY9jT0yMEwjvWFQEESkpKJAMLCwt7I4DoLx3D4NYVRTBmx5gDyEBnZ+feCCCCwcFBIRDQtKQIJqamVFRUJBnY2NjYGwEcJ9QTBHzqFxTB1NSMCgsLJQPNzc06CfCFpZkAIri0kHjWzinCJQIcmdqFhB29wZjgIfQ9v//KU/GURgIFBQUEKCXgUTUlBKCDDFRXV19N4Hp20s+OT/j6+l6Ijo6moKAgcnFxwaWlQuBmKCKC6elprQRcC3vIwj2IR7AR3wOGvAOYEyJCBj744APRhT120MLpPo5TNTk5ifkizRoXFyf7wNUEbmc8y4o/6xi7UMIiQd7e3nLnJyQkIBrc93h2Sea/e++914zfT2BCrq2t0fz8PGaEnLC0tDToqCwkNzLuZDzCeFIdnnjiCU82ehJGYBSnBSnHluPj4wPnx6APO2+88UakhYXF0ZqaGsgJMOTQ4Ng5uSQg8LdeSysrfMCKFzGsEBGMYm5gGcU2xOQOX9VPKXwNy8itra0VOZwwLK0xMTG4ps+z/Iy+/xuOIVrUEnVFRDDKpbhUgj8vyfL1+xbfksfQeJmZmXAMOdRfokd5WOZpfdf2s9jx0Ei4/5FOGIZRW1vb02y0awfhLW7CE1hKsa4FBweTk5PTRTjnbAZBRt8SfMab7zk0HjKBpRPp5A0IRg+9+uqr914t/9JLL93CpJvQN6x7nN+xpHyD7IjALgg8wjjItT3t5eVFnp6exDv+Kfymw+j13JT/TwrYYuLAJklqNIgALZwJxLeA+DyQ3wisA4QYhjIAACqkfZkBRe3AAAAAAElFTkSuQmCC");
		button.setAttribute ("title", "Sélectionnez une image");
		button.setAttribute ("height", "20");
		button.setAttribute ("class", "hfr-cc-button");
		button.setAttribute ("style", "vertical-align : middle");
		var label = document.createElement ("label");
		label.setAttribute ("for", file_id);
		label.appendChild (button);
		var file = document.createElement ("input");
		file.setAttribute ("data-textarea", event.target.id);
		file.setAttribute ("type", "file");
		file.setAttribute ("multiple", "true");
		file.setAttribute ("accept", "image/png,image/jpeg,image/bmp,image/gif,audio/*");
		file.setAttribute ("id", file_id);
		file.setAttribute ("style", "display : none");
		file.onchange = file_send_images;
		var span = document.createElement ("span");
		span.appendChild (label);
		span.appendChild (file);
		btn.parentElement.insertBefore (span, btn.nextElementSibling);
	}
	
	for (var textarea of document.querySelectorAll ("textarea")) {
		textarea.addEventListener('keydown', stroke); 
		textarea.addEventListener('paste', pasting);
		textarea.addEventListener('drop', drop);
		textarea.addEventListener('dragover', allow_drop);
		textarea.addEventListener('focus', add_button_to_textarea);
	}

	var observer=new MutationObserver(function(mutations, observer){
		var textareas = document.querySelectorAll("textarea"); 
		if(textareas.length){
			for(var textarea of textareas) {
				textarea.removeEventListener('keydown', stroke, false); 
				textarea.addEventListener('keydown', stroke, false); 
				textarea.removeEventListener('paste', pasting, false); 
				textarea.addEventListener('paste', pasting, false); 
				textarea.removeEventListener('drop', drop, false); 
				textarea.addEventListener('drop', drop, false); 
				textarea.removeEventListener('dragover', allow_drop, false); 
				textarea.addEventListener('dragover', allow_drop, false); 
				textarea.removeEventListener('focus', add_button_to_textarea, false);
				textarea.addEventListener('focus', add_button_to_textarea, false);
			}
		} 
	}); 
	observer.observe(document, {attributes: false, childList: true, characterData: false, subtree: true}); 

	document.querySelectorAll (".cLink").forEach (function (link) {
		if (typeof (link.getAttribute ("href")) !== "string")
			return;
		else if (HFR.regex.exec (HFR.regex.zippy, link.getAttribute ("href"))) {
			var audio = document.createElement ("audio");
			audio.setAttribute ("src", link.getAttribute ("href"));
			audio.setAttribute ("controls", "controls");
			link.parentNode.replaceChild (audio, link);
		}
		else if (link.getAttribute ("href").indexOf ("cdninstagram.com/vp/") > 0 && link.getAttribute ("href").indexOf (".mp4") > 0) {
			var video = document.createElement ("video");
			video.setAttribute ("controls", "");
			video.setAttribute ("height", "200");
			video.setAttribute ("src", link.getAttribute ("href"));
			link.parentNode.replaceChild(video, link);
		}
		else if (link.getAttribute ("href").indexOf ("https://video.twimg.com/tweet_video/") == 0) {
			var video = document.createElement ("video");
			video.setAttribute ("autoplay", "");
			video.setAttribute ("loop", "");
			video.setAttribute ("height", "200");
			video.setAttribute ("src", link.getAttribute ("href"));
			link.parentNode.replaceChild(video, link);
		}
		else if (link.getAttribute ("href").indexOf ("https://twitter.com/i/videos/tweet/") == 0) {
			var iframe = document.createElement ("iframe");
			iframe.setAttribute ("src", link.getAttribute ("href"));
			iframe.setAttribute("frameborder", "0");
			iframe.setAttribute("allowfullscreen", "");
			iframe.setAttribute("webkitAllowFullScreen", "");
			iframe.setAttribute("mozallowfullscreen", "");
			link.parentNode.replaceChild(iframe, link);
		}
	});

	var obs=new MutationObserver(function (mutations, observer) {
		document.querySelectorAll ("img").forEach (function (img) {
			if (img.hasAttribute ("src") && img.getAttribute ("src").indexOf ("https://abs.twimg.com/hashflags/") == 0) {
				img.setAttribute ("width", "24");
				img.setAttribute ("height", "24");
			}
		});
		
		document.querySelectorAll (".cLink").forEach (function (link) {
			if (typeof (link.getAttribute ("href")) !== "string")
				return;
			var uri = new URL (link.getAttribute ("href"));
			if (HFR.regex.exec (HFR.regex.zippy, link.getAttribute ("href"))) {
				var audio = document.createElement ("audio");
				audio.setAttribute ("src", link.getAttribute ("href"));
				audio.setAttribute ("controls", "controls");
				link.parentNode.replaceChild (audio, link);
			}
			else if (link.getAttribute ("href").indexOf ("cdninstagram.com/vp/") > 0 && link.getAttribute ("href").indexOf (".mp4") > 0) {
				var video = document.createElement ("video");
				video.setAttribute ("controls", "");
				video.setAttribute ("height", "200");
				video.setAttribute ("src", link.getAttribute ("href"));
				link.parentNode.replaceChild(video, link);
			}
			else if (uri.searchParams != null && (uri.searchParams.get ("hfr-url-type") == "mastodon" || uri.searchParams.get ("hfr-url-type") == "mastodon-gif")) {
				var is_gif = uri.searchParams.get ("hfr-url-type") == "mastodon-gif";
				var video = document.createElement ("video");
				if (is_gif)
					video.setAttribute ("autoplay", "");
				else
					video.setAttribute ("controls", "");
				video.setAttribute ("loop", "");
				video.setAttribute ("height", "200");
				video.setAttribute ("src", uri.toString());
				link.parentNode.replaceChild(video, link);
			}
			else if (link.getAttribute ("href").indexOf ("https://twitter.com/i/status/") == 0) {
				var img = link.querySelector ("img");
				if (img == null)
					return;
				var autoplay = true;
				var controls = false;
				var src = "";
				var url = new URL (img.getAttribute ("src"));
				var reg = /url=https:\/\/pbs\.twimg\.com\/tweet_video_thumb\/(?<id>.+)\.jpg/;
				var res = reg.exec (img.getAttribute ("src"));
				if (url.searchParams.has ("hfr-url-data")) {
					autoplay = false;
					controls = true;
					src = url.searchParams.get ("hfr-url-data");
				}
				else {
					if (res == null || res.groups == null || typeof (res.groups.id) !== "string")
						return;
					src = "https://video.twimg.com/tweet_video/" + res.groups.id + ".mp4";
				}
				var video = document.createElement ("video");
				if (controls)
					video.setAttribute ("controls", "");
				if (autoplay)
					video.setAttribute ("autoplay", "");
				video.setAttribute ("loop", "");
				video.setAttribute ("height", "200");
				video.setAttribute ("src", src);
				link.parentNode.replaceChild(video, link);
			}
			else if (link.getAttribute ("href").indexOf ("https://t.co") == 0 && HFR.getValue ("hfr-copie-colle-preview") == "oui") {
				var context = { link : link };
				var id = stack.add (context);
				HFR.request({
					method : "GET",
					url : link.href,
					context : { id : id },
					onload : function (response) {
						var context = stack.getData (id);
						if (response.context != null)
							context = stack.getData (response.context.id);
						var doc = new DOMParser().parseFromString (response.responseText, "text/html");
						context.link.href = doc.querySelector ("[http-equiv='refresh']").getAttribute ("content").split ("URL=")[1].split (";")[0];
					}
				});
			}
		});
	}); 
	obs.observe(document, {attributes: false, childList: true, characterData: false, subtree: true});
});
