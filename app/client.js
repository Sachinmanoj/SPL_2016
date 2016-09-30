(function (win) {
	'use strict';

	var net = require('net');

    var printChunk = false;

	var ds = {
		completeData: new Buffer(0),
		canStartAccumulateData: true,
		dataLength: -1
	};

	function initStats() {
		ds.completeData = new Buffer(0);
		ds.canStartAccumulateData = true;
		ds.dataLength = -1;
	}

	function connectToServer(options) {
		var PORT = options.port;
		var HOST = options.host;

		var socket = new net.Socket();

		socket.connect(PORT, HOST, function () {
			console.log("Client Connected to " + HOST + ":" + PORT);
		});

		return socket;
	}

	function getData(socket) {
		initStats();
		var retVal, bufData, bufLen, bufToRet;
		socket.on("data", function (data) {
			ds.completeData = Buffer.concat([ds.completeData, data], ds.completeData.length + data.length);
			if(printChunk) {
				console.log("data received from socket below:");
				console.log(data);
			}
			if(ds.canStartAccumulateData && ds.completeData.length >=4) {
				// length to read
				ds.dataLength = ds.completeData.readUInt32BE(0, 3);
				ds.canStartAccumulateData = false;
				ds.completeData = ds.completeData.slice(4, ds.completeData.length);
				console.log(ds.dataLength);
			}
			if(ds.dataLength === ds.completeData.length) {
				console.log("reached full data: ", ds.completeData.toString());
				retVal = respondMod.respondToHost(ds.completeData.toString());
				console.log("retVal: ",retVal);
				initStats();
				if(retVal) {
					bufData = new Buffer(JSON.stringify(retVal));
					bufLen = new Buffer(4);
					bufLen.writeUInt32BE(bufData.length, 0);
					bufToRet = Buffer.concat([bufLen, bufData], bufData.length +bufLen.length);
					console.log("-> socket: ", bufToRet.toString());
					socket.write(bufToRet);
				}
			}
		});
	}

	function registerEvents(socket) {
		socket.on("error", function (data) {
			console.error("error: ");
			console.error(data);
		});
		socket.on("end", function () {
			console.info("socket ends now");
		});
		socket.on("close", function () {
			console.info("socket closes now");
		});
	}

	function initClient(options) {
		var mySocket = connectToServer(options);
		registerEvents(mySocket);
		getData(mySocket);
	}


	// exports
	win.client = {
		"initClient": initClient
	};

})(window);
