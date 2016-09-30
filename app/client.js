(function () {
	'use strict';

	var net = require('net');

	function connectToServer(options) {
		var PORT = options.port;
		var HOST = options.host;

		var socket = new net.Socket();

		socket.connect(PORT, HOST, function () {
			console.log("Client Connected to " + HOST + ":" + PORT);
		});

		return socket;
	}

	function printData(socket) {
		socket.on("data", function (data) {
			console.log("data received from socket below:");
			console.log(data);
			// ends the socket
			socket.end();
		});
	}

	function initClient() {
		// todo: get from main.js
		var options = {
			"port": 1986,
			"host": "localhost"
		}

		var mySocket = connectToServer(options);
		printData(mySocket);
	}


	// exports
	module.exports = {
		"initClient": initClient
	};

})();