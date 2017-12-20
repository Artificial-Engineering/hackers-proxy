
lychee.define('app.state.Dialog').requires([
	'app.interface.Intent'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	const _Intent    = lychee.import('app.interface.Intent');
	const _State     = lychee.import('lychee.app.State');
	const _COMPONENT = Polyfillr.import(attachments["html"].url, attachments["html"].buffer)['state-dialog'];
	const _main      = global.document.querySelector('main');



	/*
	 * HELPERS
	 */

	const _on_command = function(value) {

		let result = this.main.command(value);
		if (result === false) {

			this.element.fireEventListener('error', {
				message: 'Please rephrase command.'
			});

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(main) {

		this.element = _COMPONENT.create();

		this.__listener = null;


		_main.appendChild(this.element);
		_State.call(this, main);

	};


	Composite.prototype = {

		// deserialize: function(blob) {},

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'app.state.Dialog';


			return data;

		},

		update: function(intent) {

			// XXX: Do nothing

		},

		enter: function(oncomplete, intent) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;
			intent     = intent instanceof _Intent      ? intent     : null;


			this.__listener = function(e) {
				_on_command.call(this, e.detail);
			}.bind(this);

			this.element.fireEventListener('enter', null);
			this.element.addEventListener('command', this.__listener, true);


			return _State.prototype.enter.call(this, oncomplete);

		},

		leave: function(oncomplete) {

			oncomplete = oncomplete instanceof Function ? oncomplete : null;


			this.element.removeEventListener('command', this.__listener, true);
			this.element.fireEventListener('leave', null);

			this.__listener = null;


			return _State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});
