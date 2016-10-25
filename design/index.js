
((global) => {

	const document = global.document;
	const states   = [].slice.call(document.querySelectorAll('#wm-appstates li'));
	const views    = [].slice.call(document.querySelectorAll('main > section'));
	const tabmenus = [].slice.call(document.querySelectorAll('main > section > header > ul'));



	/*
	 * HELPERS
	 */

	const _unbind_event = function(event, callback, scope) {

		if (this.___events !== undefined && this.___events[event] !== undefined) {

			let found = false;

			for (let e = 0, el = this.___events[event].length; e < el; e++) {

				let entry = this.___events[event][e];

				if ((callback === null || entry.callback === callback) && (scope === null || entry.scope === scope)) {

					found = true;

					this.___events[event].splice(e, 1);
					el--;
					e--;

				}

			}


			return found;

		}


		return false;

	};

	const _Emitter = function() {

		this.___events = [];

	};

	_Emitter.prototype = {

		bind: function(event, callback, scope, once) {

			event    = typeof event === 'string'    ? event    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;
			once     = once === true;


			if (event === null || callback === null) {
				return false;
			}


			let pass_event = false;
			let pass_self  = false;

			let modifier = event.charAt(0);
			if (modifier === '@') {

				event      = event.substr(1, event.length - 1);
				pass_event = true;

			} else if (modifier === '#') {

				event     = event.substr(1, event.length - 1);
				pass_self = true;

			}


			if (this.___events[event] === undefined) {
				this.___events[event] = [];
			}


			this.___events[event].push({
				pass_event: pass_event,
				pass_self:  pass_self,
				callback:   callback,
				scope:      scope,
				once:       once
			});


			return true;

		},

		trigger: function(event, data) {

			event = typeof event === 'string' ? event : null;
			data  = data instanceof Array     ? data : null;


			if (this.___events !== undefined && this.___events[event] !== undefined) {

				let value = undefined;

				for (let e = 0; e < this.___events[event].length; e++) {

					let args  = [];
					let entry = this.___events[event][e];

					if (entry.pass_event === true) {

						args.push(event);

					} else if (entry.pass_self === true) {

						args.push(this);

					}


					if (data !== null) {
						args.push.apply(args, data);
					}


					let result = entry.callback.apply(entry.scope, args);
					if (result !== undefined) {
						value = result;
					}


					if (entry.once === true) {

						if (this.unbind(event, entry.callback, entry.scope) === true) {
							e--;
						}

					}

				}


				if (value !== undefined) {
					return value;
				} else {
					return true;
				}

			}


			return false;

		},

		unbind: function(event, callback, scope) {

			event    = typeof event === 'string'    ? event    : null;
			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : null;


			let found = false;

			if (event !== null) {

				found = _unbind_event.call(this, event, callback, scope);

			} else {

				for (event in this.___events) {

					let result = _unbind_event.call(this, event, callback, scope);
					if (result === true) {
						found = true;
					}

				}

			}


			return found;

		}

	};



	/*
	 * STREAMS
	 */

	const _bind_input = function() {

		let that = this;


		this.__elements.forEach((element) => {

			let el_name = element.tagName.toLowerCase();
			let el_type = element.getAttribute('type');

			if (el_name === 'input' && el_type === 'text') {

				element.onchange = function() {
					that.trigger('change', [ this.value ]);
				};

			} else if (el_name === 'input' && el_type === 'checkbox') {

				element.onchange = function() {
					that.trigger('change', [ this.value === 'on' ]);
				};

			}

		});

	};

	const _get_value = function() {

		let values = [];

		this.__elements.forEach((element) => {

			let el_name = element.tagName.toLowerCase();
			let el_type = element.getAttribute('type');

			if (el_name === 'input' && el_type === 'text') {
				values.push(element.value);
			} else if (el_name === 'input' && el_type === 'checkbox') {
				values.push(element.checked);
			}

		});


		if (values.length > 1) {
			return values;
		} else if (values[0] !== undefined) {
			return values[0];
		}


		return null;

	};

	const _set_value = function(values) {

		if (values.length > 1) {

			if (this.__elements.length === values.length) {

				this.__elements.forEach((element, e) => {

					let el_name = element.tagName.toLowerCase();
					let el_type = element.getAttribute('type');

					if (el_name === 'input' && el_type === 'text') {
						element.value = values[e];
					} else if (el_name === 'input' && el_type === 'checkbox') {
						element.checked = values[e] === true;
					}

				});

			}

		} else {

			this.__elements.forEach(element => {

				let el_name = element.tagName.toLowerCase();
				let el_type = element.getAttribute('type');

				if (el_name === 'input' && el_type === 'text') {
					element.value = values;
				} else if (el_name === 'input' && el_type === 'checkbox') {
					element.checked = values === true;
				}

			});

		}

	};

	const _Input = function(raw) {

		this.__elements = raw instanceof Array ? raw : [ raw ];

		_Emitter.call(this);
		_bind_input.call(this);

	};

	_Input.prototype = Object.assign({}, _Emitter.prototype, {

		enable: function() {

			this.__elements.forEach(element => {
				element.removeAttribute('disabled');
			});

		},

		disable: function() {

			this.__elements.forEach(element => {
				element.setAttribute('disabled', true);
			});

		},

		getValue: function() {
			return _get_value.call(this);
		},

		setValue: function(value) {
			return _set_value.call(this, value);
		}

	});


	const _Output = function(raw) {

		this.__elements = raw instanceof Array ? raw : [ raw ];

		_Emitter.call(this);

	};

	_Output.prototype = Object.assign({}, _Emitter.prototype, {
		whatever: () => console.log('whatever')
	});



	/*
	 * INITIALIZATION
	 */

	if (states.length > 0 && views.length > 0) {

		states.forEach(state => {

			state.onclick = function(e) {

				let main = global.MAIN || null;
				let id   = this.innerHTML.toLowerCase();
				if (main !== null) {

					let result = main.changeState(id);
					if (result === true) {
						states.forEach(other => other.className = other === this ? 'active' : 'inactive');
						views.forEach(view   => view.className  = view.id === id ? 'active' : 'inactive');
					}

				}

			};

		});

	}


	if (tabmenus.length > 0) {

		tabmenus.forEach(tabmenu => {

			tabmenu.addEventListener('click', function(e) {

				let type = e.target.tagName.toLowerCase();
				let url  = e.target.innerHTML || null;

				if (type === 'li' && url !== null) {

					console.log('TAB', type, url);

				}

			}, true);

		});

	}



	const $ = {

		query: function(query) {

			query = typeof query === 'string' ? query : null;


			if (query !== null) {

				let result = [].slice.call(document.querySelectorAll(query));
				if (result.length > 1) {
					return result;
				} else if (result.length === 1) {
					return result[0];
				}

			}


			return null;

		},

		remove: function(query) {

			query = typeof query === 'string' ? query : null;


			if (query !== null) {

				let result = [].slice.call(document.querySelectorAll(query));
				if (result.length > 0) {

					result.forEach(node => {

						let parent = node.parentNode;
						if (parent !== null) {
							parent.removeChild(node);
						}

					});

					return true;

				}

			}


			return false;

		},

		input: function(query) {

			let element = this.query(query);
			if (element !== null) {
				return new _Input(element);
			}


			return null;

		},

		output: function(query) {

			let element = this.query(query);
			if (element !== null) {
				return new _Output(element);
			}


			return null;

		}

	};



	global.$ = $;

	if (typeof window !== 'undefined') {
		window.$ = $;
	}

})(typeof window !== 'undefined' ? window : global);

