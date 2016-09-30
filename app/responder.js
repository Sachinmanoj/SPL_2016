(function(win){
	'use strict';

	function getBotDetails() {
		return {
			"botName":"<Name>Working Still<ID>679281937551",
			"dataType":"Response"
		};
	}

	function respondToCommand(data) {
		switch(data.dataExpected.toUpperCase()) {
			case "BOTNAME":
				return getBotDetails();
				break;
			case "BANANA":
				win.board.updateBoard(data);
				return win.board.initBanana();
				break;
			case "MOVE":
				win.board.updateBoard(data);
                console.log(win.board.bs);
				return win.board.nextMove();
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

	win.respondMod = {
		respondToHost: respondToHost
	};

})(window);
