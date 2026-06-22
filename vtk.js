class Event {
	#list;
	#owner;

	constructor (owner) {
		this.#list = [];
		this.#owner = owner;
	}

	emit (data = null) {
		this.#list.forEach (s => {
            if (data != null)
                s(data);
			else
                s();
		});
	}

	connect (callback) {
		this.#list.push (callback);
		return this.#list.length - 1;
	}

	disconnect (id) {
		if (id >= 0 && id < this.#list.length)
			this.#list.splice (id, 1);
	}
}

class Widget {
	#elem;
	#dst;
	#click;

	constructor (type) {
		this.#elem = document.createElement (type);
		this.#dst = new Vtk.Event (this);
		this.#click = new Vtk.Event (this);
		this.#elem.addEventListener ("click", e => {
			this.#click.emit();
		});
	}
	
	get clicked() {
		return this.#click;
	}

	get destroy() {
		return this.#dst;
	}

	get element() {
		return this.#elem;
	}
}

class Bin extends Widget {
	#cld;

	constructor() {
		super("div");
	}

	get child() {
		return this.#cld;
	}

	set child (widget) {
		if (this.element.firstChild != null)
			this.element.removeChild (this.element.firstChild);
		this.#cld = widget;
		this.element.appendChild (widget.element);
	}
}

let Orientation = {
	Horizontal : 0,
	Vertical : 1
};

class Box extends Widget {
	#o;

	constructor (orientation = 0) {
		super ("div");
		this.orientation = orientation;
	}

	get orientation() {
		return this.#o;
	}

	set orientation (orientation) {
		this.#o = orientation;
        if (orientation == 0)
            this.element.style = "display: flex; flex-direction: row;";
        else
            this.element.style = "display: flex; flex-direction: column;";
	}

	add (widget) {
		this.element.appendChild (widget.element);
	}
	
	remove (widget) {
		this.element.removeChild (widget.element);
	}
}

class Label extends Widget {
	#txt;

	constructor (txt) {
		super ("div");
		this.text = txt;
		this.element.style = "user-select: none;";
	}

	get text() { return this.#txt; }

	set text (txt) {
		this.#txt = txt;
		this.element.textContent = txt;
	}
}

class Window extends Bin {
	#box;
	#lbl;
	#cld;

	constructor (title = "") {
		super();
		this.element.style = "border: solid; position: absolute;";
		this.#box = new Vtk.Box(1);
		this.#lbl = new Vtk.Label (title);
		this.#box.add (this.#lbl);
        this.#box.element.appendChild (document.createElement ("br"));
		super.child = this.#box;
		
		var down = false;
		this.#lbl.element.addEventListener ("mousedown", e => { down = true; });
		document.addEventListener ("mouseup", e => { down = false; });
		document.addEventListener ("mousemove", e => {
			if (!down)
				return;
			this.element.style.top = (e.pageY || e.clientY) + 'px';
			this.element.style.left = (e.pageX || e.clientX) + 'px';
		});
	}
	
	get title() {
		return this.#lbl.text;
	}
	
	set title (txt) {
		this.#lbl.text = txt;
	}
	
	get child() {
		return this.#cld;
	}

	set child (widget) {
		if (this.#cld != null)
			this.#box.remove (this.#cld);
		this.#box.add (widget);
		this.#cld = widget;
	}

	show() {
		document.body.appendChild (this.element);
	}
	
	setSize (width, height) {
		this.element.style.width = width;
		this.element.style.height = height;
	}
}

class Button extends Widget {
	constructor (lbl) {
		super ("input");
		this.element.setAttribute ("type", "button");
		this.element.setAttribute ("value", lbl);
	}
}

class Column {
    #pname;
    #ptype;

    constructor (n, t) {
        this.#pname = n;
        this.#ptype = t;
    }

    get name() {
        return this.#pname;
    }

    get type() {
        return this.#ptype;
    }
}

class Table extends Widget {
    #rows;
    #types;
    #body;
    #slct;

    constructor (columns) {
        super ("table");

        this.#rows = [];
        this.#types = columns;
        this.#slct = new Vtk.Event (this);

        var thead = document.createElement ("thead");
        thead.style = "display: block";
        var trh = document.createElement ("tr");
        var i = 0;
        columns.forEach (col => {
            var td = document.createElement ("td");
            td.setAttribute ("data-index", i);
            td.textContent = col.name;
            td.addEventListener ("click", e => {
                var sorted = e.target.getAttribute ("data-sorted") == "true";
                var index = parseInt (e.target.getAttribute ("data-index"));
                this.#rows.sort ((r1, r2) => {
                    if (this.#types[index].type == "string")
                        return sorted ? r2[index].localeCompare(r1[index]) : r1[index].localeCompare(r2[index]);
                    return sorted ? r2[index] - r1[index] : r1[index] - r2[index];
                });
                e.target.setAttribute ("data-sorted", sorted ? "false" : "true");
                this.update();
            });
            trh.appendChild (td);
            i++;
        });
        thead.appendChild (trh);
        this.element.appendChild (thead);

        this.#body = document.createElement ("tbody");
        this.#body.style = "display: block; height: 100px; overflow-y: auto; overflow-x: hidden;";
        this.element.appendChild (this.#body);
    }

    get rowSelected() {
        return this.#slct;
    }

    update() {
        while (this.#body.firstChild != null)
            this.#body.removeChild (this.#body.firstChild);
        this.#rows.forEach (row => {
            var tr = document.createElement ("tr");
            tr.addEventListener ("click", () => {
                this.#slct.emit(row);
            });
            for (var i = 0; i < row.length; i++) {
                var vtype = Object.prototype.toString.call (row[i]);
                vtype = vtype.split ("[object")[1].split ("]")[0].trim().toLowerCase();
                var td = document.createElement("td");
                if (vtype == "date")
                    td.textContent = row[i].toString();
                else
                    td.textContent = row[i];
                tr.appendChild (td);
            }
            this.#body.appendChild (tr);
        });
    }

	clear() {
		this.#rows = [];
		 while (this.#body.firstChild != null)
            this.#body.removeChild (this.#body.firstChild);
	}

    addRow (row) {
        this.#rows.push (row);
        var tr = document.createElement ("tr");
        tr.addEventListener ("click", () => {
                this.#slct.emit(row);
            });
        for (var i = 0; i < row.length; i++) {
            var vtype = Object.prototype.toString.call (row[i]);
            vtype = vtype.split ("[object")[1].split ("]")[0].trim().toLowerCase();
            if (vtype != this.#types[i].type)
                throw new Error ("invalid item");
            var td = document.createElement("td");
            if (vtype == "date")
                td.textContent = row[i].toString();
            else
                td.textContent = row[i];
            tr.appendChild (td);
        }
        this.#body.appendChild (tr);
    }
}

let Vtk = {
	Event : Event,
	Widget : Widget,
	Bin : Bin,
	Orientation : Orientation,
	Box : Box,
	Label : Label,
	Window : Window,
	Button : Button,
    Column: Column,
    Table: Table
};
