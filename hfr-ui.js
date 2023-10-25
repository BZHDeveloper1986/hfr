class UI {
	static get Signal() {
		return class {
			#data;
			
			constructor() {
				this.#data = [];
			}
			
			connect (callback) {
				this.#data.push (callback);
				return this.#data.length - 1;
			}
			
			disconnect (id) {
				if (isNaN(id) || id < 0 || id >= this.#data.length)
					return false;
				this.#data.splice (id, 1);
				return true;
			}
			
			send (data) {
				for (var cb of this.#data)
					cb (data);
			}
		};
	}
	
	static get Widget() {
		return class {
			#element;
			#ntfy;
			
			constructor (type) {
				this.#element = document.createElement (type);
				this.#ntfy = new UI.Signal();
			}
			
			get (key) {
				return this.#element.getAttribute (key);
			}
			
			set (key, value) {
				this.#element.setAttribute (key, value);
				this.#ntfy.send (key);
			}
			
			get notify() {
				return this.#ntfy;
			}
		};
	}
}
