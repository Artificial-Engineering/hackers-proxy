
lychee.define('app.interface.Intent').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _parse_result = function() {

		if (this.format === null || this.sentence === null) {
			return;
		}


		let data   = Object.assign({}, this.data);
		let format = this.format.split(' ');
		let words  = this.sentence.split(' ');

		for (let w = 0, wl = words.length; w < wl; w++) {

			let temp = format[w];
			let word = words[w];

			if (temp === undefined) {

				// XXX: Nothing to parse

			} else if (temp === word) {

				// XXX: Nothing to parse

			} else if (temp.startsWith('<') && temp.endsWith('>')) {

				let name = temp.split(/<|>/g)[1] || null;
				if (name !== null) {
					data[name] = word;
				}

			} else if (temp.includes('<') && temp.includes('>')) {

				if (temp.endsWith('>')) {

					let prefix = temp.substr(0, temp.indexOf('<'));
					if (prefix === word.substr(0, prefix.length)) {

						let name = temp.substr(temp.indexOf('<') + 1, temp.indexOf('>') - temp.indexOf('<') - 1) || null;
						if (name !== null) {
							data[name] = word.substr(prefix.length);
						}

					}

				} else if (temp.startsWith('<')) {

					let suffix = temp.substr(temp.indexOf('>') + 1);
					if (suffix === word.substr(-1 * suffix.length)) {

						let name = temp.substr(temp.indexOf('<') + 1, temp.indexOf('>') - temp.indexOf('<') - 1) || null;
						if (name !== null) {
							data[name] = word.substr(0, word.length - suffix.length);
						}

					}

				}

			}

		}


		this._result = data;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.action   = null;
		this.data     = {};
		this.format   = null;
		this.sentence = '';

		this._result  = {};


		this.setAction(settings.action);
		this.setData(settings.data);
		this.setFormat(settings.format);
		this.setSentence(settings.sentence);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let settings = {};
			let blob     = {};


			if (this.action !== null)   settings.action   = this.action;
			if (this.data !== null)     settings.data     = Object.assign({}, this.data);
			if (this.format !== null)   settings.format   = this.format;
			if (this.sentence !== null) settings.sentence = this.sentence;


			return {
				'constructor': 'app.interface.Intent',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		analyze: function(sentence) {

			sentence = typeof sentence === 'string' ? sentence : null;


			let probability = 0.0;


			if (sentence !== null) {

				let count  = 0;
				let format = this.format.split(' ');
				let words  = sentence.split(' ');

				for (let w = 0, wl = words.length; w < wl; w++) {

					let temp = format[w];
					let word = words[w];

					if (temp === undefined) {

						// TODO: What to do when sentence has too much words?
						// console.error('not sure what to do', format, words);

					} else if (temp === word) {

						count++;

					} else if (temp.startsWith('<') && temp.endsWith('>')) {

						count++;

					} else if (temp.includes('<') && temp.includes('>')) {

						if (temp.endsWith('>')) {

							let prefix = temp.substr(0, temp.indexOf('<'));
							if (prefix === word.substr(0, prefix.length)) {
								count++;
							}

						} else if (temp.startsWith('<')) {

							let suffix = temp.substr(temp.indexOf('>') + 1);
							if (suffix === word.substr(-1 * suffix.length)) {
								count++;
							}

						}

					}

				}


				if (count > 0) {
					probability = count / words.length;
				}

			}


			return probability;

		},

		clone: function(sentence) {

			sentence = typeof sentence === 'string' ? sentence : null;


			if (sentence !== null) {

				return new Composite({
					action:   this.action,
					data:     this.data,
					format:   this.format,
					sentence: sentence
				});

			}


			return null;

		},

		setAction: function(action) {

			action = typeof action === 'string' ? action : null;


			if (action !== null) {

				this.action = action;

				return true;

			}


			return false;

		},

		setData: function(data) {

			data = data instanceof Object ? data : null;


			if (data !== null) {

				this.data = data;
				_parse_result.call(this);

				return true;

			}


			return false;

		},

		setFormat: function(format) {

			format = typeof format === 'string' ? format : null;


			if (format !== null) {

				this.format = format;

				return true;

			}


			return false;

		},

		setSentence: function(sentence) {

			sentence = typeof sentence === 'string' ? sentence : null;


			if (sentence !== null) {

				this.sentence = sentence;
				_parse_result.call(this);

				return true;

			}


			return false;

		}

	};


	return Composite;

});

