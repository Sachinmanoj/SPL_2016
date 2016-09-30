(function () {
	'use strict';
	console.log("Started");
	
	var fs = require("fs");
	
	var client = require("./app/client.js"),
		options = JSON.parse(fs.readFileSync("./app/config.json", "utf8"));
	
	client.initClient(options);

})();