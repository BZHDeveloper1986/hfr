// ==UserScript==
// @author        BZHDeveloper, roger21
// @name          [HFR] Copié/Collé v3
// @version       1.4.33
// @namespace     forum.hardware.fr
// @description   Colle les données du presse-papiers et les traite si elles sont reconnues.
// @icon          https://gitlab.gnome.org/BZHDeveloper/HFR/raw/main/hfr-logo.png
// @downloadURL   https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr_cc_2.user.js
// @updateURL     https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr_cc_2.user.js
// @require       https://gitlab.gnome.org/BZHDeveloper/hfr/-/raw/main/hfr.js?time=1715212901307
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

function getPrivateDataAsync() {
    return new Promise ((resolve, reject) => {
        var cat = new HFR.Category("prive");
        cat.findTopic ("data-copie-colle").then (topic => {
            topic.getFirstPage().then (page => {
                resolve (page.messages[0].text);
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

getPrivateDataAsync().then (data => { console.log (data); });