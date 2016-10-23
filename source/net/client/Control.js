
lychee.define('app.net.client.Control').includes([
	'lychee.net.Service'
]).exports(function(lychee, global, attachments) {

	const _Service = lychee.import('lychee.net.Service');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(client) {

		_Service.call(this, 'control', client, _Service.TYPE.client);


		// TODO: Remove this debugging stuff

		this.bind('browse',  (data) => console.log('browse',  data));
		this.bind('news',    (data) => console.log('news',    data));
		this.bind('search',  (data) => console.log('search',  data));
		this.bind('archive', (data) => console.log('archive', data));
		this.bind('backup',  (data) => console.log('backup',  data));

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Service.prototype.serialize.call(this);
			data['constructor'] = 'app.net.client.Control';
			data['arguments']   = [ '#MAIN.client' ];


			return data;

		},



		/*
		 * CUSTOM API
		 */

		archive: function() {},

		browse: function(data) {

			if (data instanceof Object && this.tunnel !== null) {

				this.tunnel.send({
					url:    typeof data.url === 'string' ? data.url : null,
					images: data.images === true,
					videos: data.videos === true
				}, {
					id:     this.id,
					method: 'browse'
				});

				return true;

			}


			return false;

		},

		news: function() {},
		search: function() {},
		backup: function() {}

	};


	return Composite;

});

