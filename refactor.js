class GameField {
    constructor(fieldSize, bombsNum) {
        this.fieldSize = fieldSize;
        this.bombsNum = bombsNum;
        this.interfaceButtons = {};
        this.gamefieldDiv = document.getElementById("gamefield");
        this.clickCnt = 0;
        this.openedCells = {};
        this.cellState = {};
        this.moves = [[1, 0], [1, 1], [0, 1], [1, -1], [-1, 0], [0, -1], [-1, -1], [-1, 1]];
        this.underButtonScore = [];
        this.bombsCoords = [];
        this.randomSequence = [];
        this.bombs = [];
        this.interfaceActions = "lol";
        cntTimer = 0;
        secondsLeft = 40 * 60;
        this.openCellsNum = 0;
        this.flagCounter = bombsNum;
        for (let i = 0; i < fieldSize * fieldSize; i++) {
            this.randomSequence.push(i);
        }

        this.randomSequence.sort((a, b) => 0.5 - Math.random());
        this.bombs = this.randomSequence.slice(0, bombsNum);

        console.log(this.bombs);

        for (let i = 0; i < bombsNum; i++) {
            var ind = this.bombs[i];
            var coord_i = Math.floor(ind / fieldSize);
            var coord_j = ind - coord_i * fieldSize;
            this.bombsCoords.push(coord_i + ", " + coord_j);
        }
        this.caclUnderButtonScore();


    }

    caclUnderButtonScore() {
        for (let i = 0; i < this.fieldSize; i++) {
            for (let j = 0; j < this.fieldSize; j++) {
                if (this.isBomb(i, j)) {
                    console.log(i, j, "bomb");
                }
                var cnt = 0;
                for (let k = 0; k < this.moves.length; k++) {
                    var coord_i = i + this.moves[k][0];
                    var coord_j = j + this.moves[k][1];
                    if (this.isValidCoords(coord_i, coord_j) && this.isBomb(coord_i, coord_j)) {
                        cnt++;
                    }
                }
                console.log(cnt);
                this.underButtonScore[[i, j]] = cnt;
            }
        }
    }
    isBomb(i, j) {
        return this.bombsCoords.includes(i + ", " + j);
    }

    isValidCoords(i, j) {
        return i >= 0 && j >= 0 && i < this.fieldSize && j < this.fieldSize;
    }
    openNear(i, j) {
        if (!this.isValidCoords(i, j)) return;
        this.openCellsNum++;
        this.interfaceButtons[[i, j]].disabled = true;
        this.openedCells[i + ", " + j] = 1;
        this.cellState[i + ", " + j] = "opened";
        this.interfaceButtons[[i, j]].style.backgroundImage = "url(" + fromNumToImg(this.underButtonScore[[i, j]]) + ")";
        if (this.underButtonScore[[i, j]] == 0) {
            for (let k = 0; k < 8; k++) {
                var to_i = +i + this.moves[k][0];
                var to_j = +j + this.moves[k][1];
                if (this.openedCells[to_i + ", " + to_j] === undefined) {
                    this.openNear(+i + this.moves[k][0], +j + this.moves[k][1]);
                }
            }
        }
    }

    cellPushEvent(id) {
        var i = id.split(', ')[0];
        var j = id.split(', ')[1];

        if (this.clickCnt == 0) {
            this.timerStart();
        }
        if (this.clickCnt == 0 && this.isBomb(i, j) == true) {

            var index = this.bombsCoords.indexOf(id);
            if (index !== -1) {
                this.bombsCoords.splice(index, 1);
            }
            var ind = this.randomSequence[this.bombsNum];
            var coord_i = Math.floor(ind / this.fieldSize);
            var coord_j = ind - coord_i * this.fieldSize;
            this.interfaceButtons[[coord_i, coord_j]].style.backgroundColor = "#808080";
            this.interfaceButtons[[i, j]].style.backgroundColor = "#000000";
            this.interfaceButtons[[i, j]].style.backgroundImage = "url(pics/button_pushed.png)";
            this.bombsCoords.push(coord_i + ", " + coord_j);
            this.caclUnderButtonScore();
        }
        this.clickCnt++;
        if (this.isBomb(i, j) == true) {
            clearInterval(intervalId);
            this.interfaceButtons[[i, j]].disabled = true;
            document.getElementById("smileyButton").style.backgroundImage = "url(pics/smileyDead.png)";
            for (let k = 0; k < this.bombsCoords.length; k++) {
                var coord_i = this.bombsCoords[k].split(', ')[0];
                var coord_j = this.bombsCoords[k].split(', ')[1];
                console.log(coord_i, coord_j);
                this.interfaceButtons[[coord_i, coord_j]].style.backgroundImage = "url(pics/bomb.png)";
            }
            this.interfaceButtons[[i, j]].style.backgroundImage = "url(pics/redbomb.png)";
            for (let k = 0; k < this.fieldSize; k++) {
                for (let w = 0; w < this.fieldSize; w++) {
                    if (this.isBomb(k, w) == false && this.cellState[k + ", " + w] == "flag") {
                        this.interfaceButtons[[k, w]].style.backgroundImage = "url(pics/underflag.png)";
                    }
                    this.interfaceButtons[[k, w]].disabled = true;
                }
            }
        }
        else {
            this.openNear(i, j);
            if (this.openCellsNum == this.fieldSize * this.fieldSize - this.bombsNum) {
                clearInterval(intervalId);
                document.getElementById("smileyButton").style.backgroundImage = "url(pics/cool.png)";
                for (let k = 0; k < this.fieldSize; k++) {
                    for (let w = 0; w < this.fieldSize; w++) {
                        if (this.isBomb(k, w) == true) {
                            this.interfaceButtons[[k, w]].style.backgroundImage = "url(pics/bomb.png)";
                        }
                        this.interfaceButtons[[k, w]].disabled = true;
                    }
                }
            }
        }
    }

    rightCickEvent(id) {
        var i = id.split(', ')[0];
        var j = id.split(', ')[1];
        if (this.cellState[id] === undefined || this.cellState[id] == "free") {
            this.interfaceButtons[[i, j]].style.backgroundImage = "url(pics/flag.png)";
            this.cellState[id] = "flag";
            this.flagCounterDecrease();
        }
        else if (this.cellState[id] == "flag") {
            this.interfaceButtons[[i, j]].style.backgroundImage = "url(pics/question.png)";
            this.cellState[id] = "question";
            this.flagCounterIncrease();
        }
        else if (this.cellState[id] == "question") {
            this.interfaceButtons[[i, j]].style.backgroundImage = "url(pics/button_unpushed.png)";
            this.cellState[id] = "free";
        }
        return false;
    }

    pressAndHoldEvent(id) {
        var i = id.split(', ')[0];
        var j = id.split(', ')[1];
        var btn = document.getElementById("smileyButton");
        if (this.cellState[id] == "flag" || this.cellState[id] == "free" || this.cellState[id] == undefined || this.cellState[id] == "question") {
            btn.style.backgroundImage = "url(pics/smileyScared.png)";
        }
    }


    smileyPushEvent() {
        clearInterval(intervalId);
        document.getElementById("gamefield").remove();
        gameField = new GameField(gameField.fieldSize, gameField.bombsNum);
        intAct = new interfaceActions(gameField);
        intAct.createLineWithButtons();
        intAct.createGameField();
        gameField.interfaceActions = intAct;
    }

    smileyPushAndHoldEvent() {

        document.getElementById("smileyButton").style.backgroundImage = "url(pics/smileypushed.png)";
    }

    timerStart() {
        intervalId = setInterval(timerRunning, 1000);
    }

    flagCounterIncrease() {
        this.flagCounter++;
        if (this.flagCounter >= 0)
            this.changeFlagCounter();
    }

    flagCounterDecrease() {
        this.flagCounter--;
        if (this.flagCounter >= 0)
            this.changeFlagCounter();
    }

    changeFlagCounter() {
        document.getElementById("time6").src = fromNumToTimeImg(this.flagCounter % 10);
        document.getElementById("time5").src = fromNumToTimeImg(Math.floor(this.flagCounter / 10) % 10);
        document.getElementById("time4").src = fromNumToTimeImg(Math.floor(this.flagCounter / 100));
    }
}

let intervalId;
var cntTimer = 0;
var secondsLeft = 40 * 60;
function timerRunning() {
    cntTimer++;
    secondsLeft--;

    document.getElementById("time3").src = fromNumToTimeImg(cntTimer % 10);
    document.getElementById("time2").src = fromNumToTimeImg(Math.floor(cntTimer / 10) % 10);
    document.getElementById("time1").src = fromNumToTimeImg(Math.floor(cntTimer / 100));
}

class interfaceActions {

    constructor(gameField) {
        let backgroundDiv = document.createElement('div');
        backgroundDiv.style.width = "600px";
        backgroundDiv.style.margin = "auto";
        backgroundDiv.style.left = "0";
        backgroundDiv.style.right = "0";
        backgroundDiv.style.top = "0";
        backgroundDiv.style.bottom = "0";
        backgroundDiv.style.height = "650px";
        backgroundDiv.style.backgroundColor = "#d0d0d0";
        backgroundDiv.style.position = "absolute";
        backgroundDiv.style.border = "solid";
        backgroundDiv.style.borderWidth = "10px";
        document.body.appendChild(backgroundDiv);

        this.gameField = gameField;
        this.fieldSize = gameField.fieldSize;
        this.intervalId = undefined;
        this.gamefieldDiv = document.createElement('div');
        this.gamefieldDiv.id = "gamefield";
        this.gamefieldDiv.style.width = "40%";
        this.gamefieldDiv.style.margin = "auto";
        this.gamefieldDiv.style.marginTop = "100px";
        this.gamefieldDiv.style.backgroundColor = "#000000";
        document.body.appendChild(this.gamefieldDiv);
    }

    createLineWithButtons() {
        var img4 = new Image();
        img4.id = "time4"
        img4.style.width = "35px";
        img4.style.height = "60px";
        img4.src = fromNumToTimeImg(Math.floor(this.gameField.flagCounter / 100));

        var img5 = new Image();
        img5.id = "time5"
        img5.style.width = "35px";
        img5.style.height = "60px";
        img5.src = fromNumToTimeImg(Math.floor(this.gameField.flagCounter / 10) % 10);

        var img6 = new Image();
        img6.id = "time6"
        img6.style.width = "35px";
        img6.style.height = "60px";
        img6.src = fromNumToTimeImg(this.gameField.flagCounter % 10);

        let line_with_buttons = document.createElement('div');
        line_with_buttons.id = "buttonsLine";
        line_with_buttons.style.backgroundColor = "#000000";
        line_with_buttons.style.width = "480px";
        line_with_buttons.style.height = "60px";
        line_with_buttons.style.margin = "auto";
        line_with_buttons.style.position = "relative";
        line_with_buttons.style.marginBottom = "20px";
        line_with_buttons.style.borderStyle = "solid";
        line_with_buttons.style.borderWidth = "15px";

        line_with_buttons.appendChild(img4);
        line_with_buttons.appendChild(img5);
        line_with_buttons.appendChild(img6);

        let btnSmiley = document.createElement("button");
        btnSmiley.style.width = "60px";
        btnSmiley.style.height = "60px";
        btnSmiley.style.marginLeft = "105px";
        btnSmiley.style.backgroundImage = "url(pics/smiley.png)";
        btnSmiley.id = "smileyButton";

        line_with_buttons.appendChild(btnSmiley);
        btnSmiley.style.backgroundSize = "cover";
        btnSmiley.addEventListener("click", this.gameField.smileyPushEvent);

        let timerClass = document.createElement('div');
        timerClass.style.width = "120px";
        timerClass.style.height = "60px";
        timerClass.style.backgroundColor = "#00FFFF";

        var img1 = new Image();
        img1.id = "time1"
        img1.style.marginLeft = "105px";
        img1.style.width = "35px";
        img1.style.height = "60px";
        img1.src = fromNumToTimeImg(0);

        var img2 = new Image();
        img2.id = "time2"
        img2.style.width = "35px";
        img2.style.height = "60px";
        img2.src = fromNumToTimeImg(0);

        var img3 = new Image();
        img3.id = "time3"
        img3.style.width = "35px";
        img3.style.height = "60px";
        img3.src = fromNumToTimeImg(0);

        line_with_buttons.appendChild(img1);
        line_with_buttons.appendChild(img2);
        line_with_buttons.appendChild(img3);

        this.gamefieldDiv.appendChild(line_with_buttons);
    }

    createGameField() {
        console.log("FIELD", this.fieldSize);
        for (let i = 0; i < this.fieldSize; i++) {
            console.log("STEP", i);
            let divline = document.createElement('div');
            divline.style.backgroundColor = "#808080";
            divline.style.width = "480px";
            divline.style.height = "30px";
            divline.style.marginTop = "0px";
            divline.style.margin = "auto";
            divline.style.position = "relative";
            for (let j = 0; j < this.fieldSize; j++) {

                let btn = document.createElement("button");
                btn.id = j.toString;
                btn.addEventListener("click", function () {
                    gameField.cellPushEvent(i.toString() + ", " + j.toString());
                });
                btn.addEventListener("contextmenu", function (ev) {
                    ev.preventDefault();
                    gameField.rightCickEvent(i.toString() + ", " + j.toString());
                    return false;
                }, false);
                btn.addEventListener("mousedown", function (event) {
                    if (event.button == 0) {
                        gameField.pressAndHoldEvent(i.toString() + ", " + j.toString());
                    }
                });
                btn.addEventListener("mouseup", function () {
                    document.getElementById("smileyButton").style.backgroundImage = "url(pics/smiley.png)";
                });
                btn.style.width = "30px";
                btn.style.height = "30px";
                btn.innerText = "\u2060";
                btn.style.marginRight = "0px";
                btn.style.backgroundSize = "cover";
                btn.style.backgroundImage = "url(pics/button_unpushed.png)";
                gameField.interfaceButtons[[i, j]] = btn;
                divline.appendChild(btn);
            }

            this.gamefieldDiv.appendChild(divline);
        }
        this.gamefieldDiv.style.backgroundColor = "#FF0000";
    }
}



function fromNumToImg(i) {
    return ({
        0: 'pics/button_pushed.png',
        1: 'pics/one.png',
        2: 'pics/two.png',
        3: 'pics/three.png',
        4: 'pics/four.png',
        5: 'picsfive.png',
        6: 'pics/six.png',
        7: 'pics/seven.png',
        8: 'pics/eight.png'
    })[i];
}

function fromNumToTimeImg(i) {
    return ({
        0: "pics/timer_zero.png",
        1: "pics/timer_one.png",
        2: "pics/timer_two.png",
        3: "pics/timer_three.png",
        4: "pics/timer_four.png",
        5: "pics/timer_five.png",
        6: "pics/timer_six.png",
        7: "pics/timer_seven.png",
        8: "pics/timer_eight.png",
        9: "pics/timer_nine.png"
    })[i];
}




var gameField = new GameField(16, 40);
var intAct = new interfaceActions(gameField);
intAct.createLineWithButtons();
intAct.createGameField();
gameField.interfaceActions = intAct;
intAct.gameField = gameField;

