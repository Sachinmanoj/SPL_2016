(function(win){
	'use strict';

    var config = require('./app/config.json');
    var additionalBarriers = {
        "P1": {
            "3": {
                "firstBlockingBar": [22,31],
                "importantMoves": {
                    "2":'V3',
                    "4":'V4',
                    "12":'H3'
                }
            },
            "7": {
                "firstBlockingBar": [26,35],
                "importantMoves": {
                    "6":'V7',
                    "8":'V8',
                    "16":'H7'
                }
            }
        },
        "P2": {
            "75": {
                "firstBlockingBar": [48,57],
                "importantMoves": {
                    "74":'V75',
                    "76":'V76',
                    "66":'H66'
                }
            },
            "79": {
                "firstBlockingBar": [52,61],
                "importantMoves": {
                    "78":'V79',
                    "80":'V80',
                    "70":'H70'
                }
            }
        }
    };

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
		turnCount: "",
        startTrace: false
	};

    function init() {
        bs.barrierCount = 0;
        bs.errorCount = 0;
        bs.horBar = [];
        bs.verBar = [];
        bs.P1B = "";
        bs.P2B = "";
        bs.spot = [];
        bs.turnCount = "";
        bs.startTrace = false;
        bs.oppBarrierCount = 0;
        bs.opponent = "";
    }

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
        bs.P1B = parseInt(data.p1Banana.substr(1, data.p1Banana.length));
        bs.P2B = parseInt(data.p2Banana.substr(1, data.p2Banana.length));
        // player
        bs.player = data.player;
        bs.opponent = data.player === "P1" ? "P2": "P1";
        // spot
        bs.P1Spot = data.spot.split(",").indexOf("P1") +1;
        bs.P2Spot = data.spot.split(",").indexOf("P2") +1;
        // turnCount
        bs.turnCount = parseInt(data.turnCount);
    }

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getFirstMoves() {
        if(bs.player === 'P1') {
            // return cells in rows 1-4
            return Math.random() > 0.5 ? "B3,H2,H4,V12" : "B7,H6,H8,V16";
        } else {
            // return cells in rows 6-9
            return Math.random() > 0.5 ? "B75,H65,H67,V67" : "B79,H69,H71,V71";
        }
    }

    function firstBarrierPlaced() {
        var pos = bs[bs.opponent+"B"];
        var bars = additionalBarriers[bs.player][pos].firstBlockingBar;
        return (bs.verBar[bars[0]-1] === "W");
    }

    function isOpponentPlaced() {
        var opsPlace = bs[bs.opponent + 'Spot'];
        var pos = bs[bs.opponent+"B"];
        var keys = Object.keys(additionalBarriers[bs.player][pos].importantMoves);
        return (keys.indexOf("" + opsPlace) !== -1);
    }

    function isNoBarrier() {
        var opsPlace = bs[bs.opponent + 'Spot'];
        var pos = bs[bs.opponent+"B"];
        pos = additionalBarriers[bs.player][pos].importantMoves[opsPlace];
        var barPos = parseInt(pos.substring(1, pos.length));
        return (bs.verBar[barPos - 1] !== "W");
    }

    function placeBarrier() {
        var opsPlace = bs[bs.opponent + 'Spot'];
        var pos = bs[bs.opponent+"B"];
        var barPos = additionalBarriers[bs.player][pos].importantMoves[opsPlace];
        return barPos;
    }

    function isBananaUnsafe() {
        return isOpponentPlaced() && isNoBarrier();
    }

    function decideNextStep() {
        if(isBananaUnsafe()) {
            bs.startTrace = true;
            return placeBarrier();
        }
        if(!firstBarrierPlaced()) {
            var pos = bs[bs.opponent+"B"];
            var bars = additionalBarriers[bs.player][pos].firstBlockingBar;
            return "V"+bars[0] +"," +"V"+bars[1];
        }
        return
    }

    function getForwardMove(step) {
        var cPos = bs[bs.player+"Spot"];
        if(bs.player === "P1") {
            return "S"+ (cPos + (9 * step));
        } else if(bs.player === "P2") {
            return "S"+ (cPos - (9 * step));
        }
    }

    function isOppGorillaBlocks(step) {
        var cPos = bs[bs.player+"Spot"];
        var expPos = bs.player === "P1" ? cPos + (9 * step) : cPos - (9 * step) ;
        return expPos === bs[bs.opponent+"Spot"];
    }

    function getNextMove() {
        // simply move
        if(bs.turnCount < 3) {
            return getForwardMove(1);
        } else if(bs.player === "P1" && bs.turnCount === 3 && !isOppGorillaBlocks(2)){
            return getForwardMove(1);
        } else if(bs.player === "P2" && bs.turnCount === 3) {
            if(isOppGorillaBlocks(2)) {
                return decideNextStep();
            } else if (isOppGorillaBlocks(1)) {
                return getForwardMove(2);
            } else {
                return getForwardMove(1);
            }
        } else {
            return decideNextStep();
        }
    }

    function nextMove() {
        return {
            "dataType": "Response",
            "move": getNextMove()
        };
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
		init: init,
		initBanana: initBanana,
		nextMove: nextMove,
		updateBoard: updateBoard,
		bs: bs
    }

})(window);
