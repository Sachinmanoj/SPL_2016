(function(){
	'use strict';

	var board = require("./board.js");

	function getBotDetails() {
		return {
			"botName":"<Name>Working Still<ID>795481492759",
			"dataType":"Response"
		};
	}

	function respondToCommand(data) {
		switch(data.dataExpected.toUpperCase()) {
			case "BOTNAME":
				return getBotDetails();
				break;
			case "BANANA":
				board.updateBoard(data);
				return board.initBanana();
				break;
			case "MOVE":
				board.updateBoard(data);
                console.log(board.bs);
				return board.nextMove();
				break;
			default:
				console.error("error:", data);
		}
	}

	function logResponse(data) {
		if(data.acknowledge.toUpperCase() === 'INVALID') {
			console.error(data.reason);
		}
	}

	function respondToHost (str) {
		var data = JSON.parse(str);
		switch(data.dataType.toUpperCase()) {
			case "COMMAND":
				return respondToCommand(data);
				break;
			case "RESPONSE":
				logResponse(data);
				break;
			case "RESULT":
				break;
			default:
				console.error("error:", data);
		}
	}

	module.exports = {
		respondToHost: respondToHost
	};

})();
