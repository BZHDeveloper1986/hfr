// ==UserScript==
// @author        BZHDeveloper, roger21
// @name          [HFR] GIF search
// @version       0.0.1
// @namespace     forum.hardware.fr
// @description   Recherche de GIF
// @icon          https://gitlab.com/BZHDeveloper/HFR/raw/master/hfr-logo.png
// @downloadURL   https://gitlab.com/BZHDeveloper/hfr/-/raw/master/hfr_gif_search.user.js
// @updateURL     https://gitlab.com/BZHDeveloper/hfr/-/raw/master/hfr_gif_search.user.js
// @include       https://forum.hardware.fr/*
// @noframes
// @grant         GM.info
// @grant         GM.xmlHttpRequest
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_registerMenuCommand
// @grant         GM_xmlhttpRequest
// ==/UserScript==

function isGM4() {
	if (typeof (GM) !== "object")
		return false;
	if (typeof (GM.info) !== "object")
		return false;
	return GM.info.scriptHandler == "Greasemonkey" && parseFloat(GM.info.version) >= 4;
}

let HFR = {
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
		var data = localStorage.getItem (rk);
		try {
			var obj = JSON.parse (data);
			return obj;
		}
		catch(e) {
			return default_value;
		}
		return data;	
	}
};


function hfr_ui() {
	function dragElement (elem) {
		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			elem.style.top = (elem.offsetTop - pos2) + "px";
			elem.style.left = (elem.offsetLeft - pos1) + "px";
		}

		function closeDragElement() {
			document.onmouseup = null;
			document.onmousemove = null;
		}
		
		
		elem.header.onmousedown = dragMouseDown;
	}
	
	var style = document.createElement ("style");
	style.textContent = `.hfr-ui-window {
  position: absolute;
  z-index: 9;
  background-color: #f1f1f1;
  text-align: center;
  border: 1px solid #d3d3d3;
}

.hfr-ui-window-header {
  padding: 10px;
  cursor: move;
  z-index: 10;
  background-color: #2196F3;
  color: #fff;
}`;
	document.head.appendChild (style);
	
	this.Window = function(){
		this.win = document.createElement ("div");
		this.header = document.createElement ("div");
		this.title = document.createElement ("span");
		this.header.appendChild (this.title);
		var img_cancel = document.createElement ("img");
		img_cancel.setAttribute ("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAY1BMVEUAAAD///9VVVX///9AQECZmZmSkpL////6+vr39/f6+vr6+vr39/f6+vr///9NTU1PT09OTk5OTk5OTk5OTk5tbW1qamp1dXV6enp4eHh3d3d4eHhNTU10dHR0dHRZWVlNTU04MJFLAAAAIHRSTlMAAgMDBAUHXF5fX2BiY3ieoqOkqarEysvT1NXV1tfY5cy3b0QAAABVSURBVHjaYqAWAHQi1wYMRTEMAG1/ZqaH2n/KdBogV15YTMSWwHiwm+14GO2Hc0PsGNp7II2FUHUBdy1kK5LDUTIWuGlwWBj5HVSHNzPmRkW0meU/P15vBKOP7JGeAAAAAElFTkSuQmCC");
		img_cancel.style = "margin-left : 10px";
		img_cancel.onclick = this.destroy;
		this.header.appendChild (img_cancel);
		this.win.header = this.header;
		this.header.classList.add ("hfr-ui-window-header");
		this.win.classList.add ("hfr-ui-window");
		this.win.appendChild (this.header);
		this.win.appendChild (document.createTextNode ("toto"));
//		dragElement (this.win);
		
		this.setTitle = function (txt) {
			this.title.textContent = txt;
		}
		
		this.setPosition = function (a, b) {
			this.win.style.left = a + "px";
			this.win.style.top = a + "px";
		}
		
		this.show = function() {
			document.body.appendChild (this.win);
		}
		
		this.destroy = function() {
			document.body.removeChild (this.win);
		}
	};
}

let HFRUI = new hfr_ui();
