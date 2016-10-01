(function(win){

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
        return (verBars+ horBars-9) - bs.barrierCount;
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
        data.horizontalBarrier += ",W,W,W,W,W,W,W,W,W";
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
        // save it to prev
         bs.prevOppPos = bs[bs.opponent+"Spot"];
        // spot
        data.spot = data.spot.replace("\r\n", "");
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


    function P1BFS(banPos, kingPos, horiArr, verArr, oppKings, oppBan, specps) {
        var arr = [];
        var fullArr = [banPos];
        var start = banPos;
        while (fullArr.length < 81) {
            /* Vertical down */
                var verD = start + 9;
                if(verD <= 81 && horiArr[start -1] !== 'W' && (start) !== specps && fullArr.indexOf(verD) === -1) {
                    arr.unshift(verD);
                }
                var HoriR = start + 1;
                if((HoriR - 1) % 9 === 0) {
                    HoriR = HoriR - 9;
                }
                if(verArr[HoriR -1] !== 'W' && (HoriR) !== specps && fullArr.indexOf(HoriR) === -1) {
                    arr.unshift(HoriR);
                }
                var HoriL = start - 1;
                if(HoriL % 9 === 0) {
                    HoriL = HoriL + 9;
                }
                if(verArr[start -1] !== 'W' && (start) !== specps && fullArr.indexOf(HoriL) === -1) {
                    arr.unshift(HoriL);
                }
                var verU = start - 9;
                if(verU > 0 &&  horiArr[verU -1] !== 'W' && (verU) !== specps && fullArr.indexOf(verU) === -1) {
                    arr.unshift(verU);
                }
                if(arr.indexOf(kingPos) !== -1) {
                    return true;
                }
                if(verD <= 81 && fullArr.indexOf(verD) === -1) {
                    fullArr.push(verD);
                }
                if(fullArr.indexOf(HoriR) === -1) {
                    fullArr.push(HoriR);
                }
                if(fullArr.indexOf(HoriL) === -1) {
                    fullArr.push(HoriL);
                }
                if(verU > 0 && fullArr.indexOf(verU) === -1) {
                    fullArr.push(verU);
                }
                start = arr.shift();
        }
        return false;

    }


        function P2BFS(banPos, kingPos, horiArr, verArr, oppKings, oppBan, specps) {
            var arr = [];
            var fullArr = [banPos];
            var start = banPos;
            while (fullArr.length < 81) {
                /* Vertical down */
                    var verU = start - 9;
                    if(verU > 0 && horiArr[verU -1] !== 'W' && (verU) !== specps && fullArr.indexOf(verU) === -1) {
                        arr.unshift(verU);
                    }
                    var HoriR = start + 1;
                    if((HoriR - 1) % 9 === 0) {
                        HoriR = HoriR - 9;
                    }
                    if(verArr[HoriR -1] !== 'W' && (HoriR) !== specps && fullArr.indexOf(HoriR) === -1) {
                        arr.unshift(HoriR);
                    }
                    var HoriL = start - 1;
                    if(HoriL % 9 === 0) {
                        HoriL = HoriL + 9;
                    }
                    if(verArr[start -1] !== 'W' && (start) !== specps && fullArr.indexOf(HoriL) === -1) {
                        arr.unshift(HoriL);
                    }
                    var verD = start + 9;
                    if(verD <= 81 && horiArr[start -1] !== 'W' && (start) !== specps && fullArr.indexOf(verD) === -1) {
                        arr.unshift(verD);
                    }
                    if(arr.indexOf(kingPos) !== -1) {
                        return true;
                    }
                    if(verD <= 81 && fullArr.indexOf(verD) === -1) {
                        fullArr.push(verD);
                    }
                    if(fullArr.indexOf(HoriR) === -1) {
                        fullArr.push(HoriR);
                    }
                    if(fullArr.indexOf(HoriL) === -1) {
                        fullArr.push(HoriL);
                    }
                    if(verU > 0 && fullArr.indexOf(verU) === -1) {
                        fullArr.push(verU);
                    }
                    start = arr.shift();
            }
            return false;

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
        var pos = bs[bs.opponent+"B"], index;
        pos = additionalBarriers[bs.player][pos].importantMoves[opsPlace];
        var barPos = parseInt(pos.substring(1, pos.length));
        switch(pos.charAt(0)) {
            case "V":
                index = barPos -1;
                return bs.verBar[index] !== "W";
                break;
            case "H":
                index = barPos -1;
                return bs.horBar[index] !== "W";
                break;
            }
    }

    function isMovesOver(importantMoves) {
        var keys = Object.keys(importantMoves);
        var emtyBar = keys.filter(function (element) {
            var bar = importantMoves[element],
                index;
            switch(bar.charAt(0)) {
                case "V":
                    index = parseInt(bar.substr(1, bar.length)) -1;
                    return bs.verBar[index] !== "W";
                    break;
                case "H":
                    index = parseInt(bar.substr(1, bar.length)) -1;
                    return bs.horBar[index] !== "W";
                    break;
            }
        });
        return emtyBar.length < 2;
    }

    function placeBarrier() {
        var opsPlace = bs[bs.opponent + 'Spot'];
        var pos = bs[bs.opponent+"B"];
        var barPos = additionalBarriers[bs.player][pos].importantMoves[opsPlace];
        if(isMovesOver(additionalBarriers[bs.player][pos].importantMoves)) {
            return;
        };
        return barPos;
    }

    function isBananaUnsafe() {
        return isOpponentPlaced() && isNoBarrier();
    }

    function isTargetsNearP1() {
        /* Vertical down */
        var spot = bs.P1Spot + 9;
        if (spot === bs.P1B) {
            return true;
        }
        /* Horizntal right */
        spot = bs.P1Spot + 1;
        if((spot - 1) % 9 === 0) {
            spot = spot - 9;
        }
        if (spot === bs.P1B) {
            return true;
        }
        /* Horizntal Left */
        spot = bs.P1Spot - 1;
        if(spot % 9 === 0) {
            spot = spot + 9;
        }
        if (spot === bs.P1B) {
            return true;
        }
        /* Vertical Up */
        var spot = bs.P1Spot - 9;
        if (spot === bs.P1B) {
            return true;
        }

        // Jump possibility
        if(isOppGorillaBlocksVer(1)) {
            var spot = bs.P2Spot - 9;
            if (spot === bs.P1B) {
                return true;
            }

// Move Dia left
            spot = bs.P1Spot -10;
            if(spot %9 ===0 ) {
                spot = spot + 9;
            }
            if (spot === bs.P1B) {
                return true;
            }

// Move Dia left
            spot = bs.P1Spot - 8;
            if((spot - 1) %9 ===0 ) {
                spot = spot - 9;
            }
            if (spot === bs.P1B) {
                return true;
            }

        }

        if(isOppGorillaBlocksHorR(1)) {
            /* Horizntal right */
            spot = bs.P2Spot + 1;
            if((spot - 1) % 9 === 0) {
                spot = spot - 9;
            }
            if (spot === bs.P1B) {
                return true;
            }

            var spot = bs.P2Spot + 10;
            if((spot - 1) %9 ===0 ) {
                spot = spot - 9;
            }
            if (spot === bs.P1B) {
                return true;
            }
            // jump possibility
        }

        if(isOppGorillaBlocksHorL(1)) {

            /* Horizntal Left */
            spot = bs.P2Spot - 1;
            if(spot % 9 === 0) {
                spot = spot + 9;
            }
            if (spot === bs.P1B) {
                return true;
            }

            var spot = bs.P1Spot + 8;
            if((spot) %9 ===0 ) {
                spot = spot + 9;
            }
            if (spot === bs.P1B) {
                return true;
            }
            // jump possibility
        }

        return false;
    }

    function isTargetsNearP2() {
        /* Vertical down */
        var spot = bs.P2Spot + 9;
        if (spot === bs.P2B) {
            return true;
        }
        /* Horizntal right */
        spot = bs.P2Spot + 1;
        if((spot - 1) % 9 === 0) {
            spot = spot - 9;
        }
        if (spot === bs.P2B) {
            return true;
        }
        /* Horizntal Left */
        spot = bs.P2Spot - 1;
        if(spot % 9 === 0) {
            spot = spot + 9;
        }
        if (spot === bs.P2B) {
            return true;
        }
        /* Vertical Up */
        var spot = bs.P2Spot - 9;
        if (spot === bs.P2B) {
            return true;
        }

        // Jump possibility
        if(isOppGorillaBlocksVer(1)) {
            var spot = bs.P1Spot - 9;
            if (spot === bs.P2B) {
                return true;
            }

// Move Dia left
            spot = bs.P2Spot -10;
            if(spot %9 ===0 ) {
                spot = spot + 9;
            }
            if (spot === bs.P2B) {
                return true;
            }

// Move Dia left
            spot = bs.P2Spot - 8;
            if((spot - 1) %9 ===0 ) {
                spot = spot - 9;
            }
            if (spot === bs.P2B) {
                return true;
            }

        }
        if(isOppGorillaBlocksHorR(1)) {
            /* Horizntal right */
            spot = bs.P1Spot + 1;
            if((spot - 1) % 9 === 0) {
                spot = spot - 9;
            }
            if (spot === bs.P2B) {
                return true;
            }

            var spot = bs.P1Spot - 8;
            if((spot - 1) %9 ===0 ) {
                spot = spot - 9;
            }
            if (spot === bs.P2B) {
                return true;
            }
            // jump possibility
        }

        if(isOppGorillaBlocksHorL(1)) {

            /* Horizntal Left */
            spot = bs.P1Spot - 1;
            if(spot % 9 === 0) {
                spot = spot + 9;
            }
            if (spot === bs.P2B) {
                return true;
            }

            var spot = bs.P2Spot - 10;
            if((spot) %9 ===0 ) {
                spot = spot + 9;
            }
            if (spot === bs.P2B) {
                return true;
            }
            // jump possibility
        }

        return false;
    }

    function bfsImplementP1() {
        if(bs.startTrace && bs.barrierCount < 22 && toDoTraceP1()) {
            var prevPos = bs.prevOppPos;
            if(!(bs.P2Spot >= 1 && (bs.P2Spot) <=36)) {
                bs.startTrace = false;
            }
            var diff = bs.P2Spot - prevPos;
            var horBar = bs.horBar.slice(0);
            var verBar = bs.verBar.slice(0);
            // Trace Him
            if (Math.abs(diff === 1)) {
                // he moved horizontally;
                var toSpot = bs.P2Spot - 9;
                if(toSpot > 0) {

                    if(horBar[toSpot-1] !== "W" && (toSpot >= 1 && (toSpot) <=36)) {
                        if(horBar[toSpot + diff -1] !== "W" ) {
                            horBar[toSpot-1] = "W";
                            horBar[toSpot + diff -1] = "W";
                            if((toSpot + diff >= 1 && (toSpot + diff) <=36) && P2BFS(bs.P2B, bs.P2Spot, horBar, verBar, bs.P1Spot, bs.P1B, -1)) {
                                bs.doVertical = true;
                                return "H" + toSpot + "," + "H" + (toSpot + diff) ;
                            }
                            else {
                                horBar[toSpot + diff -1] = "";
                                if(P2BFS(bs.P2B, bs.P2Spot, horBar, verBar, bs.P1Spot, bs.P1B, -1)) {
                                    return "H" + toSpot;
                                }
                            }
                        }
                    }
                }
            }
            if(diff === -1 || bs.doVertical) {
                // he moved horizontally;
                if(verBar[bs.P2Spot-1] !== "W" && (bs.P2Spot >= 1 && (bs.P2Spot) <=36)) {
                    if(verBar[(bs.P2Spot + 9) - 1] !== "W" ) {
                        verBar[bs.P2Spot-1] = "W";
                        verBar[(bs.P2Spot + 9) -1] = "W";
                        if( ((bs.P2Spot + 9) >= 1 && (bs.P2Spot + 9) <=36) && P2BFS(bs.P2B, bs.P2Spot, horBar, verBar, bs.P1Spot, bs.P1B, -1)) {
                            bs.doVertical = false;
                            return "V" + bs.P2Spot + "," + "V" + (bs.P2Spot + 9) ;
                        }
                        else {
                            verBar[(bs.P2Spot + 9) -1] = "";
                            if(P2BFS(bs.P2B, bs.P2Spot, horBar, verBar, bs.P1Spot, bs.P1B, -1)) {
                                bs.doVertical = false;
                                return "V" + bs.P2Spot;
                            }
                        }
                    }
                }
            }

            if(diff === 1 || bs.doVertical) {
                // he moved horizontally;
                if(verBar[(bs.P2Spot+ 1) -1] !== "W" && ((bs.P2Spot+ 1) >= 1 && (bs.P2Spot+ 1) <=36)) {
                    if(verBar[((bs.P2Spot+ 1) + 9) - 1] !== "W" ) {
                        verBar[(bs.P2Spot+ 1)-1] = "W";
                        verBar[((bs.P2Spot+ 1) + 9) -1] = "W";
                        if((((bs.P2Spot+ 1) + 9) >= 1 && ((bs.P2Spot+ 1) + 9) <=36) && P2BFS(bs.P2B, bs.P2Spot, horBar, verBar, bs.P1Spot, bs.P1B, -1)) {
                            bs.doVertical = false;
                            return "V" + (bs.P2Spot+ 1) + "," + "V" + ((bs.P2Spot+ 1) + 9) ;
                        }
                        else {
                            verBar[((bs.P2Spot+ 1) + 9) -1] = "";
                            if(P2BFS(bs.P2B, bs.P2Spot, horBar, verBar, bs.P1Spot, bs.P1B, -1)) {
                                bs.doVertical = false;
                                return "V" + (bs.P1Spot+ 1);
                            }
                        }
                    }
                }
            }
        }
        if(isTargetsNearP1()) {
            return 'S' + bs.P1B;
        }
        if(isOppGorillaBlocksVer(1)) {
            /* Vertical 2 dowm */
            var spot = bs.P2Spot + 9;
            if (spot <= 81 && spot > 0 &&  bs.horBar[bs.P2Spot -1] !== 'W' && P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
                return 'S'+(spot);
            }
            // Move Dia left
            var spot = bs.P1Spot + 8;
            if(spot %9 ===0 ) {
                spot = spot + 9;
            }
            if (spot <= 81 && spot > 0 &&  P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
                return 'S'+(spot);
            }
            // Move Dia left
            var spot = bs.P1Spot + 10;
            if((spot - 1) %9 ===0 ) {
                spot = spot - 9;
            }
            if (spot <= 81 && spot > 0 &&  P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
                return 'S'+(spot);
            }


            // jump possibility
        }
        if(isOppGorillaBlocksHorR(1)) {
            /* Horizntal right */
            spot = bs.P2Spot + 1;
            if((spot - 1) % 9 === 0) {
                spot = spot - 9;
            }
            if ( bs.verBar[spot - 1] !== 'W' && P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
                return 'S'+(spot);
            }

            var spot = bs.P2Spot + 10;
            if((spot - 1) %9 ===0 ) {
                spot = spot - 9;
            }
            if ( P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
                return 'S'+(spot);
            }
            // jump possibility
        }

        if(isOppGorillaBlocksHorL(1)) {

            /* Horizntal Left */
            spot = bs.P2Spot - 1;
            if(spot % 9 === 0) {
                spot = spot + 9;
            }
            if (bs.verBar[bs.P2Spot - 1] !== 'W' && P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
                return 'S'+(spot);
            }

            var spot = bs.P1Spot + 8;
            if((spot) %9 ===0 ) {
                spot = spot + 9;
            }
            if ( P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
                return 'S'+(spot);
            }
            // jump possibility
        }
        /* Vertical down */
        var spot = bs.P1Spot + 9;
        if (spot <= 81 &&  bs.horBar[bs.P1Spot -1] !== 'W' && P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
            return 'S'+(spot);
        }
        /* Horizntal right */
        spot = bs.P1Spot + 1;
        if((spot - 1) % 9 === 0) {
            spot = spot - 9;
        }
        if ( bs.verBar[spot - 1] !== 'W' && P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
            return 'S'+(spot);
        }
        /* Horizntal Left */
        spot = bs.P1Spot - 1;
        if(spot % 9 === 0) {
            spot = spot + 9;
        }
        if (bs.verBar[bs.P1Spot - 1] !== 'W' && P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
            return 'S'+(spot);
        }
        /* Vertical Up */
        var spot = bs.P1Spot - 9;
        if (spot > 0 && bs.horBar[spot -1] !== 'W' && P1BFS(bs.P1B, spot, bs.horBar, bs.verBar, bs.P2Spot, bs.P2B, bs.P1Spot)) {
            return 'S'+(spot);
        }
    }

    function toDoTraceP2 () {
        var count = 0;
        (bs.horBar[bs.P1Spot - 1] !== 'W') ? count++ : true;
        (bs.verBar[bs.P1Spot - 1] !== 'W') ? count++ : true;
        if((bs.P1Spot - 9 ) < 82 && (bs.P1Spot - 9 ) > 0) {
            (bs.horBar[bs.P1Spot - 9 - 1 ] !== 'W') ? count++ : true;
        }
        else {
             count++;
        }
        var slot = bs.P1Spot + 1;
        if ((slot-1) % 9 === 0) {
            slot = slot - 9;
        }
        (bs.verBar[slot + 1] !== 'W') ? count++ : true;
        return (count === 3);
    }

    function toDoTraceP1 () {
        var count = 0;
        (bs.horBar[bs.P2Spot - 1] !== 'W') ? count++ : true;
        (bs.verBar[bs.P2Spot - 1] !== 'W') ? count++ : true;
        if((bs.P2Spot - 9 ) < 82 && (bs.P2Spot - 9 ) > 0) {
            (bs.horBar[bs.P2Spot - 9 - 1 ] !== 'W') ? count++ : true;
        }
        else {
             count++;
        }
        var slot = bs.P2Spot + 1;
        if ((slot-1) % 9 === 0) {
            slot = slot - 9;
        }
        (bs.verBar[slot + 1] !== 'W') ? count++ : true;
        return (count === 3);
    }

    function bfsImplementP2() {
        if(bs.startTrace && bs.barrierCount < 22 && toDoTraceP2()) {
            var prevPos = bs.prevOppPos;
            if(!(bs.P1Spot >= 46 && (bs.P1Spot) <=81)) {
                bs.startTrace = false;
            }
            var diff = bs.P1Spot - prevPos;
            var horBar = bs.horBar.slice(0);
            var verBar = bs.verBar.slice(0);
            // Trace Him
            if (Math.abs(diff === 1)) {
                // he moved horizontally;
                if(horBar[bs.P1Spot-1] !== "W" && (bs.P1Spot >= 46 && (bs.P1Spot) <=81)) {
                    if(horBar[bs.P1Spot + diff -1] !== "W" ) {
                        horBar[bs.P1Spot-1] = "W";
                        horBar[bs.P1Spot + diff -1] = "W";
                        if((bs.P1Spot + diff >= 46 && (bs.P1Spot + diff) <=81) && P1BFS(bs.P1B, bs.P1Spot, horBar, verBar, bs.P2Spot, bs.P2B, -1)) {
                            bs.doVertical = true;
                            return "H" + bs.P1Spot + "," + "H" + (bs.P1Spot + diff) ;
                        }
                        else {
                            horBar[bs.P1Spot + diff -1] = "";
                            if(P1BFS(bs.P1B, bs.P1Spot, horBar, verBar, bs.P2Spot, bs.P2B, -1)) {
                                return "H" + bs.P1Spot;
                            }
                        }
                    }
                }
            }
            if(diff === -1 || bs.doVertical) {
                // he moved horizontally;
                if(verBar[bs.P1Spot-1] !== "W" && (bs.P1Spot >= 46 && (bs.P1Spot) <=81)) {
                    if(verBar[(bs.P1Spot - 9) - 1] !== "W" ) {
                        verBar[bs.P1Spot-1] = "W";
                        verBar[(bs.P1Spot - 9) -1] = "W";
                        if( ((bs.P1Spot - 9) >= 46 && (bs.P1Spot - 9) <=81) && P1BFS(bs.P1B, bs.P1Spot, horBar, verBar, bs.P2Spot, bs.P2B, -1)) {
                            bs.doVertical = false;
                            return "V" + bs.P1Spot + "," + "V" + (bs.P1Spot - 9) ;
                        }
                        else {
                            verBar[(bs.P1Spot - 9) -1] = "";
                            if(P1BFS(bs.P1B, bs.P1Spot, horBar, verBar, bs.P2Spot, bs.P2B, -1)) {
                                bs.doVertical = false;
                                return "V" + bs.P1Spot;
                            }
                        }
                    }
                }
            }

            if(diff === 1 || bs.doVertical) {
                // he moved horizontally;
                if(verBar[(bs.P1Spot+ 1) -1] !== "W" && ((bs.P1Spot+ 1) >= 46 && (bs.P1Spot+ 1) <=81)) {
                    if(verBar[((bs.P1Spot+ 1) - 9) - 1] !== "W" ) {
                        verBar[(bs.P1Spot+ 1)-1] = "W";
                        verBar[((bs.P1Spot+ 1) - 9) -1] = "W";
                        if((((bs.P1Spot+ 1) - 9) >= 46 && ((bs.P1Spot+ 1) - 9) <=81) && P1BFS(bs.P1B, bs.P1Spot, horBar, verBar, bs.P2Spot, bs.P2B, -1)) {
                            bs.doVertical = false;
                            return "V" + (bs.P1Spot+ 1) + "," + "V" + ((bs.P1Spot+ 1) - 9) ;
                        }
                        else {
                            verBar[((bs.P1Spot+ 1) - 9) -1] = "";
                            if(P1BFS(bs.P1B, bs.P1Spot, horBar, verBar, bs.P2Spot, bs.P2B, -1)) {
                                bs.doVertical = false;
                                return "V" + (bs.P1Spot+ 1);
                            }
                        }
                    }
                }
            }
        }

        // Move the kingPos
        if(isTargetsNearP2()) {
            return 'S' + bs.P2B;
        }

        if(isOppGorillaBlocksVer(1)) {
            /* Vertical 2 dowm */
            var spot = bs.P1Spot - 9;
            if (spot <= 81 && spot > 0 &&  bs.horBar[bs.P1Spot -1] !== 'W' && P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
                return 'S'+(spot);
            }
            // Move Dia left
            var spot = bs.P2Spot -10;
            if(spot %9 ===0 ) {
                spot = spot + 9;
            }
            if (spot <= 81 && spot > 0 &&  P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
                return 'S'+(spot);
            }
            // Move Dia left
            var spot = bs.P2Spot - 8;
            if((spot - 1) %9 ===0 ) {
                spot = spot - 9;
            }
            if (spot <= 81 && spot > 0 &&  P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
                return 'S'+(spot);
            }


            // jump possibility
        }
        if(isOppGorillaBlocksHorR(1)) {
            /* Horizntal right */
            spot = bs.P1Spot + 1;
            if((spot - 1) % 9 === 0) {
                spot = spot - 9;
            }
            if ( bs.verBar[spot - 1] !== 'W' && P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
                return 'S'+(spot);
            }

            var spot = bs.P1Spot - 8;
            if((spot - 1) %9 ===0 ) {
                spot = spot - 9;
            }
            if ( P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
                return 'S'+(spot);
            }
            // jump possibility
        }

        if(isOppGorillaBlocksHorL(1)) {

            /* Horizntal Left */
            spot = bs.P1Spot - 1;
            if(spot % 9 === 0) {
                spot = spot + 9;
            }
            if (bs.verBar[bs.P1Spot - 1] !== 'W' && P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
                return 'S'+(spot);
            }

            var spot = bs.P2Spot - 10;
            if((spot) %9 ===0 ) {
                spot = spot + 9;
            }
            if ( P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
                return 'S'+(spot);
            }
            // jump possibility
        }
        /* Vertical Up */
        var spot = bs.P2Spot - 9;
        if (spot > 0 && P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
            return 'S'+(spot);
        }
        /* Horizntal right */
        spot = bs.P2Spot + 1;
        if((spot - 1) % 9 === 0) {
            spot = spot - 9;
        }
        if (P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
            return 'S'+(spot);
        }
        /* Horizntal Left */
        spot = bs.P2Spot - 1;
        if(spot % 9 === 0) {
            spot = spot + 9;
        }
        if (P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
            return 'S'+(spot);
        }
        /* Vertical down */
        var spot = bs.P2Spot + 9;
        if (spot <= 81 && P2BFS(bs.P2B, spot, bs.horBar, bs.verBar, bs.P1Spot, bs.P1B, bs.P2Spot)) {
            return 'S'+(spot);
        }


    }

    function decideNextStep() {
        var bar;
        if(isBananaUnsafe()) {
            bs.startTrace = true;
            bar = placeBarrier();
            if(bar) {
                return bar;
            }
        }
        if(!firstBarrierPlaced()) {
            var pos = bs[bs.opponent+"B"];
            var bars = additionalBarriers[bs.player][pos].firstBlockingBar;
            return "V"+bars[0] +"," +"V"+bars[1];
        }

        if(bs.player === "P1") {
            return bfsImplementP1();
        }
        else if (bs.player === "P2") {
            return bfsImplementP2();
        }
    }

    function getForwardMove(step) {
        var cPos = bs[bs.player+"Spot"];
        if(bs.player === "P1") {
            return "S"+ (cPos + (9 * step));
        } else if(bs.player === "P2") {
            return "S"+ (cPos - (9 * step));
        }
    }

    function isOppGorillaBlocksVer(step) {
        var cPos = bs[bs.player+"Spot"];
        var expPos = bs.player === "P1" ? cPos + (9 * step) : cPos - (9 * step) ;
        return expPos === bs[bs.opponent+"Spot"];
    }

    function isOppGorillaBlocksHorR() {
        var cPos = bs[bs.player+"Spot"];
        var expPos = cPos + 1 ;
        if((expPos - 1) % 9 === 0) {
            expPos = expPos - 9;
        }
        return expPos === bs[bs.opponent+"Spot"];
    }

    function isOppGorillaBlocksHorL() {
        var cPos = bs[bs.player+"Spot"];
        var expPos = cPos - 1 ;
        if(expPos % 9 === 0) {
            expPos = expPos + 9;
        }
        return expPos === bs[bs.opponent+"Spot"];
    }

    function getNextMove() {
        // simply move
        if(bs.turnCount < 3) {
            return getForwardMove(1);
        } else if(bs.player === "P1" && bs.turnCount === 3 && !isOppGorillaBlocksVer(2)){
            return getForwardMove(1);
        } else if(bs.player === "P2" && bs.turnCount === 3) {
            if(isOppGorillaBlocksVer(2)) {
                return decideNextStep();
            } else if (isOppGorillaBlocksVer(1)) {
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
