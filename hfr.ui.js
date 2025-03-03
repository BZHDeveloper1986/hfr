let HfrUi = {
    addCss : function (url) {
        var head = document.getElementsByTagName('head')[0];
		if (!head) { return; }
		var link = document.createElement ("link");
		link.setAttribute ("rel", "stylesheet");
		link.setAttribute ("href", url);
		head.appendChild (link);
    },
    addJs : function (url) {
        var head = document.getElementsByTagName('head')[0];
		var script = document.createElement ("script");
		script.setAttribute ("src", url);
		head.appendChild (script);
    },
    Widget : class {
        #wtype;
        #data;
        #list;

        constructor (type) {
            this.#wtype = type;
            this.element = document.createElement (type);
            this.#data = {};
        }

        get type() {
            return this.#wtype;
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

        attach (widget) {
            var elmt = null;
            if (widget instanceof HfrUi.Widget)
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
        
        get children() {
            return this.#list;
        }

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
    },
    Box : class extends HfrUi.Widget {
        constructor() {
            super ("div");
        }
        
        clear() {
            while (this.children.length > 0)
                this.remove (this.children[0]);
        }
    },
    ScrolledWindow : class extends HfrUi.Widget {
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
    },
    Video : class extends HfrUi.Widget {
        static #initv;

        static init() {
            if (this.#initv == true)
                return;
            HfrUi.addCss ("https://vjs.zencdn.net/8.0.4/video-js.css");
            HfrUi.addJs ("https://vjs.zencdn.net/8.0.4/video.js");
            this.#initv = true;
        }

        static isInitialized() {
            return this.#initv == true;
        }

        #player;
	
        constructor() {
            super ("video");
            HfrUi.Video.init();
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
    },
    Image : class extends HfrUi.Widget {
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
    },
    Label : class extends HfrUi.Widget {
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
    },
    Input : class extends HfrUi.Widget {
        constructor (type) {
            super ("input");
            this.set ("type", type);
        }
    },
    TextButton : class extends HfrUi.Widget {
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
    },
    Button : class extends HfrUi.Widget {
        #img;
        #lbl;
        #ipt;
        
        constructor (title) {
            super ("span");
            
            this.#img = new Image ("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEg0lEQVR42mKAgVFgYmLyxtjY+D+l2MzM7ApZDgBq/rtx48b/s2fPBhu0/uRNYjFY/fz58/9v3rwZQHo1wMiWBdE14rVtc2zbtm3btm0b0dqKs+HaCr7tX1unkq9pvZ5JclqvcAq3bjU+X9w1gZSUFAJgsGb1S8WAfFZWFmVnZxPsaPJhYGBwPz+3YbhZW1vfpEJgdXWVhoaGdkUAmdvc3BQCb7755gsMH/5cwk7Xubw/ME4ZGRmdtLKyOmxubn6Mfx9UIZCbm0s5OTl6ESibeU/kHRwcyMzMTD6bmJgctbOzO+Lm5nYuMDCQYmNjKT09nVJTUykyMpL4d2IC+1UIzM3NUV9fnxipXPpcEew9fMnV1ZVCQkIoPj6eMjIyxFlycrI4Dg8PJ39/f/Lw8LgEkeeMHFAhUFZWRsXFxUKgdP4TRXjbwIDy8vLEkZ+fHxxogAICExMT1NXVJQQKZz5SAhAAaRhWBHd3d80EGhoaqKqqSgjkTn2gBCAAHRUnzs7OZG9vTzY2NhfQdNyAh9npae6P0yiTWgI4Ae3t7UIga/xdRTAwNKTKykriY0WWlpYwDP2z3GS/8+f3+b2ZT0Q0v5syXmICJ1EytQQ6OjqosbFR38lH5eXlxBESekjbHGCZ+7QS6O7upqamJjE8+dG3inDJMRum4eFhmYS7JjAwMEBtbW1CIL5vWxEMmUBpaakQQBPrImBqaqqZQGtrK9XV1QmB6O5NRTAyNhYCxvze29uriEB+fr7mY9jT0yMEwjvWFQEESkpKJAMLCwt7I4DoLx3D4NYVRTBmx5gDyEBnZ+feCCCCwcFBIRDQtKQIJqamVFRUJBnY2NjYGwEcJ9QTBHzqFxTB1NSMCgsLJQPNzc06CfCFpZkAIri0kHjWzinCJQIcmdqFhB29wZjgIfQ9v//KU/GURgIFBQUEKCXgUTUlBKCDDFRXV19N4Hp20s+OT/j6+l6Ijo6moKAgcnFxwaWlQuBmKCKC6elprQRcC3vIwj2IR7AR3wOGvAOYEyJCBj744APRhT120MLpPo5TNTk5ifkizRoXFyf7wNUEbmc8y4o/6xi7UMIiQd7e3nLnJyQkIBrc93h2Sea/e++914zfT2BCrq2t0fz8PGaEnLC0tDToqCwkNzLuZDzCeFIdnnjiCU82ehJGYBSnBSnHluPj4wPnx6APO2+88UakhYXF0ZqaGsgJMOTQ4Ng5uSQg8LdeSysrfMCKFzGsEBGMYm5gGcU2xOQOX9VPKXwNy8itra0VOZwwLK0xMTG4ps+z/Iy+/xuOIVrUEnVFRDDKpbhUgj8vyfL1+xbfksfQeJmZmXAMOdRfokd5WOZpfdf2s9jx0Ei4/5FOGIZRW1vb02y0awfhLW7CE1hKsa4FBweTk5PTRTjnbAZBRt8SfMab7zk0HjKBpRPp5A0IRg+9+uqr914t/9JLL93CpJvQN6x7nN+xpHyD7IjALgg8wjjItT3t5eVFnp6exDv+Kfymw+j13JT/TwrYYuLAJklqNIgALZwJxLeA+DyQ3wisA4QYhjIAACqkfZkBRe3AAAAAAElFTkSuQmCC");
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
    },
    Loading : class extends HfrUi.Image {
        constructor() {
            super ("data:image/png;base64,R0lGODdhEAAQAHcAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgAAACwAAAAAEAAQAMIAAAAAAABmZmbMzMyZmZkAAAAAAAAAAAADIwi63EzEjeGAECAEMCvrXiiOH7WAZKoq2niVFSSZ68xRaK0nACH5BAkKAAAALAMAAwAKAAoAwgAAAGZmZpmZmQAAAMzMzAAAAAAAAAAAAAMcCAoRq4SAOCV9FQjxxsCgxjWAFz4XaklLCrFKAgAh+QQJCgAAACwDAAMACgAKAMIAAACZmZnMzMxmZmYAAAAAAAAAAAAAAAADGwgKEatCgDglfYCQ+sbAINcAXvhcj8YtKCQtCQAh+QQJCgAAACwDAAMACgAKAMIAAADMzMyZmZlmZmYAAAAAAAAAAAAAAAADGggKEauNOULkU2PYJcT9VtSBT3Rlm0JdppIAACH5BAkKAAAALAMAAwAKAAoAwgAAAMzMzJmZmWZmZgAAAAAAAAAAAAAAAAMbCAoRqw0QAsZg7gEh8ItaGI1ZuIAP5y2WNj0JACH5BAkKAAAALAMAAwAKAAoAwgAAAMzMzAAAAJmZmWZmZgAAAAAAAAAAAAMaCAoRq0IAQsAYzL3MV9sg932hpz1f9Fwb9SQAIfkECQoAAAAsAwADAAoACgDCAAAAzMzMAAAAZmZmmZmZAAAAAAAAAAAAAxoIChGrYwBCmBPiqWYf1yAnOuCDhU7kkQv1JAAh+QQJCgAAACwDAAMACgAKAMIAAADMzMwAAABmZmaZmZkAAAAAAAAAAAADGggKEauEMNfAGE9VIV7NIDeN4HOBVeQ565MAADs=");
        }
    },
    Dialog : class extends HfrUi.Widget {
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
};