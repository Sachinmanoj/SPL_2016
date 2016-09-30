(function(win){
	'use strict';

    var config = require('./app/config.json');

	// bs - board struct
	var bs = {
		barrierCount: 0,
		errorCount: 0,
		horBar: [],
		verBar: [],
		P1B: "",
		P2B: "",
		player: "",
		spot: [],
		turnCount: ""
	};

	function errorFreeBanana(data) {
        return data;
	}

    function updateBoard(data) {
        // barrierCount
        bs.barrierCount = data.barrierCount;
        // errorCount
        bs.errorCount = data.errorCount;
        // horBar
        data.horizontalBarrier = data.horizontalBarrier.replace("\r\n", "");
        data.horizontalBarrier = data.horizontalBarrier.replace(/_/g, "");
        bs.horBar = data.horizontalBarrier.split(",");
        // verBar
        data.verticalBarrier = data.verticalBarrier.replace("\r\n", "");
        data.verticalBarrier = data.verticalBarrier.replace(/_/g, "");
        bs.verBar = data.verticalBarrier.split(",");
        // banana pos
        bs.P1B = data.p1Banana;
        bs.P2B = data.p2Banana;
        // player
        bs.player = data.player;
        // spot
        bs.P1Spot = data.spot.split(",").indexOf("P1");
        bs.P2Spot = data.spot.split(",").indexOf("P2");
        // turnCount
        bs.turnCount = data.turnCount;
    }

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getBarriers() {
        var bars = [];
        var rand;
        while(bars.length <3) {
            if(bs.player === 'P1') {
                // return cells in rows 1-4
                rand = getRandomIntInclusive(1, 36);
                if(bars.indexOf(rand) === -1) {
                    bars.push(rand);
                }
            } else {
                // return cells in rows 6-9
                rand = getRandomIntInclusive(46, 72);
                if(bars.indexOf(rand) === -1) {
                    bars.push(rand);
                }
            }
        }
        return bars;
    }

    function getBananaRegion() {
        if(bs.player === 'P1') {
            // return cells in rows 1-4
            return getRandomIntInclusive(1, 9);
        } else {
            // return cells in rows 6-9
            return getRandomIntInclusive(73, 81);
        }
    }

    function getFirstMoves() {
        var bPos = getBananaRegion();
        var br = getBarriers();
        var brStr = "H"+br[0] +"," +"V"+br[1]+ "," +"H"+br[2];
        return "B"+bPos +"," +brStr;
    }

    function nextMove() {

    }

	function initBanana() {
		var retVal = {
			"dataType":"Response",
			"move": getFirstMoves()
		};
		return errorFreeBanana(retVal);
	};

    // export
    win.board = {
		initBanana: initBanana,
		nextMove: nextMove,
		updateBoard: updateBoard,
		bs: bs
    }

})(window);
