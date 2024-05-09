let HFR = {
    Topic : class {
        #tit;
        #url;
        #mpm;
        #list;
        #usr;

        constructor() {
            this.#list = [];
        }

        static parse (tr) {
            var topic = new HFR.Topic();
            topic.title = tr.querySelector("td.sujetCase3 > a").textContent;
            topic.uri = tr.querySelector("td.sujetCase3 > a").getAttribute("href");
            topic.isMultiple = tr.querySelector("td.sujetCase6 > span") != null;
            if (!topic.isMultiple)
                topic.user = tr.querySelector("td.sujetCase6 > a").textContent;
            return topic;
        }

        static create (user, title) {

        }

        set user (u) { this.#usr = u; }

        get user() { return this.#usr; }

        set uri (u) { this.#url = u; }

        get uri() { return this.#url; }

        set isMultiple (m) { this.#mpm = m; }

        get isMultiple() { return this.#mpm; }

        set title (t) { this.#tit = t; }

        get title() { return this.#tit; }

        get messages() { return this.#list; }
    },
    CategoryPage : class {
        #cid;
        #idx;
        #list;

        constructor (id, num) {
            this.#cid = id;
            this.#idx = num;
            this.#list = [];
        }

        get topics() {
            return this.#list;
        }

        getNextPage() {
            return HFR.CategoryPage.load (this.#cid, this.#idx + 1);
        }

        getPreviousPage() {
            return HFR.CategoryPage.load (this.#cid, this.#idx - 1);
        }

        static load (id, index) {
            return new Promise ((o, n) => {
                fetch ("/forum1.php?cat=" + id + "&page=" + index).then (response => response.text()).then (text => {
                    var page = new HFR.CategoryPage (id, index);
                    var doc = new DOMParser().parseFromString(text, "text/html");
                    console.log (doc);
                    doc.querySelectorAll("tr.sujet").forEach(s => {
                        console.log ("prout");
                        page.topics.push (HFR.Topic.parse (s));
                    });
                    o(page);

                }).catch (e => {
                    n(e);
                });
            });
        }
    },
    Category : class {
        #cid;

        constructor (id) {
            this.#cid = id;
        }

        get id() { return this.#cid; }

        getfirstPage() {
            return HFR.CategoryPage.load (this.#cid, 1);
        }

        findTopicInternal (query, index) {
            return new Promise ((resolve, reject) => {
                HFR.CategoryPage.load (this.#cid, index).then (page => {
                    var resolved = false;
                    page.topics.forEach (topic => {
                        if (topic.title.indexOf (query) == 0) {
                            resolved = true;
                            resolve (topic);
                        }
                    });
                    if (!resolved && index < 5)
                        this.findTopicInternal (query, index + 1).then (page => { resolve (page); }).catch (e => { reject (e); });
                }).catch (e => { reject (e); });
            });
        }

        findTopic (query) {
            return this.findTopicInternal (query, 1);
        }

        createTopic (dest, title, msg) {
            return new Promise ((resolve, reject) => {
                fetch ("/message.php?config=hfr.inc&cat=" + this.#cid + "&sond=0&p=1&subcat=0&dest=&subcatgroup=0")
                .then (rep => rep.text())
                .then (text => {
                    var doc = new DOMParser().parseFromString(text, "text/html");
                    var data = "content_form=" + encodeURIComponent (msg)
                        + "&pseudo=" + doc.querySelector("input[name='pseudo']").value
                        + "&cat=" + this.#cid
                        + "&sujet=" + encodeURIComponent(title)
                        + "&dest=" + encodeURIComponent(dest)
                        + "&hash_check=" + doc.querySelector("input[name='hash_check']").value;

                    fetch ("https://forum.hardware.fr/bddpost.php?config=hfr.inc", {
                        method : "POST",
                        headers : {
                            "Content-Type" : "application/x-www-form-urlencoded"
                        },
                        body : data
                    }).then (resp => {
                        if (resp.status == 200)
                            return resp.text();
                    }).then (txt => {
                        console.log ("caca");
                        resolve (txt);
                        console.log ("prout");
                    })
                    .catch (e => { reject(e); });
                })
                .catch (e => { reject (e); });
            });
        }
    }
};