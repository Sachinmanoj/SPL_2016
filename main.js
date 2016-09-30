(function (win) {
	'use strict';
	console.log("Started");

	var options = require('./app/config.json');

	win.client.initClient(options);

})(window);
