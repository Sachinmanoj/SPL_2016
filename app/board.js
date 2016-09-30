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

    // function getDiff(barArr, currentBar) {
    //     currentBar = currentBar.replace("\r\n", "");
    //     currentBar = currentBar.replace(/_/g, "");
    //     currentBar = currentBar.split(",");
    //     //
    //     var barPos;
    //     barArr.some(function (val, index) {
    //         if(barArr[index] === currentBar[index]) {
    //             return false; //keep loop running
    //         }
    //         barPos = index +1;
    //         return true; //Hurray, we found the diff
    //     });
    //     return barPos;
    // }

    // function getNewBarrier(data) {
    //     var horPos = getDiff(bs.horBar, data.horizontalBarrier),
    //         verPos;
    //     if(horPos) {
    //         return "H" +horPos;
    //     } else {
    //         verPos = getDiff(bs.verBar, data.verticalBarrier);
    //         if(verPos) {
    //             return "V" +verPos;
    //         }
    //     }
    // }

    function getHisBarrierCount() {
        var verBars = bs.verBar.reduce(function (count, elem) {
            if(elem) {
                ++count;
            }
            return count;
        }, 0);
        var horBars = bs.horBar.reduce(function (count, elem) {
            if(elem) {
                ++count;
            }
            return count;
        }, 0);
        return (verBars+ horBars) - bs.barrierCount;
    }

    function updateBoard(data) {
        // newly added barrier
        // bs.newBarrier = getNewBarrier(data);
        // barrierCount
        bs.barrierCount = parseInt(data.barrierCount);
        // errorCount
        bs.errorCount = parseInt(data.errorCount);
        // horBar
        data.horizontalBarrier = data.horizontalBarrier.replace("\r\n", "");
        data.horizontalBarrier = data.horizontalBarrier.replace(/_/g, "");
        bs.horBar = data.horizontalBarrier.split(",");
        // verBar
        data.verticalBarrier = data.verticalBarrier.replace("\r\n", "");
        data.verticalBarrier = data.verticalBarrier.replace(/_/g, "");
        bs.verBar = data.verticalBarrier.split(",");
        //
        bs.oppBarrierCount = getHisBarrierCount();
        // banana pos
        bs.P1B = data.p1Banana;
        bs.P2B = data.p2Banana;
        // player
        bs.player = data.player;
        // spot
        bs.P1Spot = data.spot.split(",").indexOf("P1") +1;
        bs.P2Spot = data.spot.split(",").indexOf("P2") +1;
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
