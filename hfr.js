let HFR = {
    Message : class {
        static parse (tr) {}
    },
    TopicPage : class {
        #url;
        #list;

        constructor (u) {
            this.#url = u;
            this.#list = [];
        }

        get messages() {
            return this.#list;
        }

        static load (url) {
            return new Promise ((resolve, reject) => {
                fetch (url.toString()).then (rep => {
                    return rep.text();
                }).then (text => {
                    var page = new HFR.TopicPage (url);
                    var dom = new DOMParser().parseFromString (text, "text/html");
                    return page;
                }).catch (e => { reject (e); });
            });
        }
    },
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

        getfirstPage () {
            var url = new URL ("https://forum.hardware.fr" + this.#url);
            url.searchParams.set ("page", 1);
            return HFR.TopicPage.load (url);
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
                    doc.querySelectorAll("tr.sujet").forEach(s => {
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
                        if (topic.title == query) {
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

        createTopic (msg, dest, title, topics, subcat) {
            return new Promise ((resolve, reject) => {
                fetch ("/message.php?config=hfr.inc&cat=" + this.#cid + "&sond=0&p=1&subcat=0&dest=&subcatgroup=0")
                .then (rep => rep.text())
                .then (text => {
                    var doc = new DOMParser().parseFromString(text, "text/html");
                    var data = "verifrequet=1100&content_form=" + encodeURIComponent (msg)
                        + "&pseudo=" + doc.querySelector("input[name='pseudo']").value
                        + "&cat=" + this.#cid
                        + ((subcat != null) ? "&subcat=" + subcat : "")
                        + "&sujet=" + encodeURIComponent(title)
                        + "&dest=" + encodeURIComponent(dest)
                        + "&hash_check=" + doc.querySelector("input[name='hash_check']").value;
                    if (topics != null && Array.isArray (topics))
                        for (var i = 0; i < topics.length && i < 5; i++) {
                            data = data + "&toread" + (i+1) + "=" + topics[i];
                        }

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
                        var dom = new DOMParser().parseFromString(txt, "text/html");
                        if (dom.getElementsByClassName("hop").length > 0 && dom.querySelector(".hop").getElementsByTagName('input').length === 0)
                            resolve (true);
                        else
                            reject ("erreur dans la création du message");
                    })
                    .catch (e => { reject(e); });
                })
                .catch (e => { reject (e); });
            });
        }
    }
};