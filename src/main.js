let cardNumArr = [];
const col = 8;
let dataCollection;
// const dataCollection = [
//     ['C9', 'H4', 'C1', 'S10', 'S3', 'H9', 'D1'],
//     ['D6', 'S12', 'C4', 'C7', 'D4', 'D11', 'H7'],
//     ['D9', 'C8', 'S8', 'H3', 'H10', 'C3', 'S7'],
//     ['H12', 'S6', 'C10', 'D2', 'H1', 'D5', 'S5'],
//     ['C6', 'S2', 'H13', 'H2', 'D10', 'S9'],
//     ['H8', 'S11', 'D7', 'C11', 'D13', 'C2'],
//     ['C12', 'H5', 'S13', 'D3', 'S4', 'H11'],
//     ['D8', 'C13', 'C5', 'D12', 'H6', 'S1']
// ];
let gameState = ""; //playing, win
let timerInt; //timerInterval
let hintArr = []; //hintArr store hint cards
let historyArr = []; //store history object; {id, datapos, newpos}
let historyMax = 5; //history max steps

//////////buildata
function buildCardNumArr() {
    let arr = []
    for (let i = 1; i <= 52; i++) {
        arr.push(i);
    }
    cardNumArr = shuffleArr(arr);
}

function shuffleArr(_arr) {
    for (let j, x, i = _arr.length; i; j = parseInt(Math.random() * i), x = _arr[--i], _arr[i] = _arr[j], _arr[j] = x);
    return _arr;
}

function getDataCollection() {
    let arr = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];
    for (let i = 0; i < cardNumArr.length; i++) {
        let suit = getSuit(cardNumArr[i]);
        let num = cardNumArr[i] % 13;
        let cardVal = suit + (num + 1).toString();
        let col_order = i % col;
        arr[col_order].push(cardVal);
    }
    //console.log(arr);
    return arr;
}

function getSuit(_num) {
    if (_num < 14) {
        return "S";
    } else if (_num > 13 && _num < 27) {
        return "H";
    } else if (_num > 26 && _num < 40) {
        return "D";
    } else {
        return "C";
    }
}

//////////////deal card

function dealCard() {
    gameState = "playing";
    //setup card
    for (let i = 0; i < dataCollection.length; i++) {
        let column = $('.working-area>li').eq(i);
        for (let j = 0; j < dataCollection[i].length; j++) {
            let myVal = dataCollection[i][j].toString();
            let dataSuit = myVal.slice(0, 1);
            let dataNum = myVal.substring(1);
            let dataColor;
            dataSuit == "S" || dataSuit == "C" ? dataColor = "B" : dataColor = "R";
            let img = 'url("img/cards_background/' + myVal + '.png")';
            let draggableVal = (j != dataCollection[i].length - 1) ? false : true;
            let card = "<div id='" + myVal + "' class='card'  data-suit='" + dataSuit + "' data-num='" + dataNum + "' data-color='" + dataColor + "' data-pos=c" + i + "r" + j + " style='background-image:" + img + "' draggable='" + draggableVal + "' ondragstart='drag(event)' ></div>";
            if (j == 0) {
                column.append(card);
            } else {
                let parent = dataCollection[i][j - 1];
                $('#' + parent).append(card);
            }
        }
    }
}

function dealTransition() {
    $('.card').on('click', cardClicked);
    $('.card').addClass('show');
    updateDraggable();
    startTimer();
}


/////////////drag and drop
//dragover
function allowDrop(ev) {
    ev.preventDefault();
    ev.target.classList.add('drop-target-focus');
}

function dragEnter(ev) {
    // $(ev.target).addClass('dragging');
}

function dragLeave(ev) {
    ev.target.classList.remove('drop-target-focus');
    // $(ev.target).removeClass('dragging');
}

//drag start
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function dropHome(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    let dataEl = document.getElementById(data);
    let dropcell = ev.target;
    dropcell.classList.remove('drop-target-focus');
    let num = parseInt(dataEl.getAttribute('data-num'));
    let suit = dataEl.getAttribute('data-suit');
    //check dragging card length
    if (dataEl.childElementCount > 0) return;

    if (dropcell.className.indexOf('home-cell') != -1) {
        //check suit
        if (dropcell.id.indexOf(suit) == -1) return;
        //check num 
        if (num != parseInt(dropcell.getAttribute('data-top')) + 1) return;
    } else {
        //card cell
        //check suit
        if (dropcell.getAttribute('data-suit') != suit) return;
        //check num
        if (parseInt(dropcell.getAttribute('data-num')) != num - 1) return;
    }
    let hisObj = {
        id: dataEl.getAttribute('id'),
        now: dataEl.getAttribute('data-pos'),
        new: 'h' + suit + (num - 1)
    }
    pushHistory(hisObj);
    let suitID = "#" + suit + "-home";
    $(suitID).attr('data-top', num);
    dataEl.setAttribute('data-pos', ['h' + suit + (num - 1)]);
    dataEl.setAttribute('draggable', false);
    dropcell.appendChild(dataEl);
    clearHint();
    updateDraggable();
}


function dropTemp(ev) {
    ev.preventDefault();
    ev.target.classList.remove('drop-target-focus');
    let data = ev.dataTransfer.getData("text");
    let dataEl = document.getElementById(data);
    //check dragging card length
    if (dataEl.childElementCount > 0) return;
    //check if already has card
    if (ev.target.className.indexOf('temp-cell') == -1) return;
    let index = $(ev.target).index();
    let hisObj = {
        id: dataEl.getAttribute('id'),
        now: dataEl.getAttribute('data-pos'),
        new: 't' + index
    };
    pushHistory(hisObj);
    dataEl.setAttribute('data-pos', ['t' + index]);
    ev.target.appendChild(dataEl);
    clearHint();
    updateDraggable();
}

function drop(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    let dataEl = document.getElementById(data);
    let dropcell = ev.target;
    dropcell.classList.remove('drop-target-focus');
    let num = parseInt(dataEl.getAttribute('data-num'));
    let dropColumn;
    let hisObj;
    if (dropcell.className.indexOf('cell') != -1) {
        //cell
        if (dropcell.childElementCount > 0) return;
        dropColumn = $(dropcell).index();
        hisObj = {
            id: dataEl.getAttribute('id'),
            now: dataEl.getAttribute('data-pos'),
            new: 'c' + dropColumn + 'r0'
        }
    } else {
        //card
        //check color
        if (dropcell.getAttribute('data-color') == dataEl.getAttribute('data-color')) return;
        //check num
        if (parseInt(dropcell.getAttribute('data-num')) != num + 1) return;
        let dropcellPos = dropcell.getAttribute('data-pos');
        dropColumn = dropcellPos.substr(1, 1);
        let dropRow = parseInt(dropcell.getAttribute('data-pos').substr(3)) + 1;
        hisObj = {
            id: dataEl.getAttribute('id'),
            now: dataEl.getAttribute('data-pos'),
            new: 'c' + dropColumn + 'r' + dropRow
        }
    }
    pushHistory(hisObj);
    dropcell.appendChild(dataEl);
    clearHint();
    updateDraggable();
    updateOrder(dropColumn); //for undo
}



function checkAutoHome(_lastCard, _autoLimit) {
    let suit = _lastCard.getAttribute('data-suit');
    let num = _lastCard.getAttribute('data-num');
    let lastCardEl = $(_lastCard);
    if (num > _autoLimit) return;
    //console.log('last card suit' + suit + '. num' + num);
    for (let i = 0; i < $('.home-cell').length; i++) {
        let homeCell = $('.home-cell')[i];
        if (homeCell.id.indexOf(suit) != -1) {
            ///has this suit --check num
            if (homeCell.getAttribute('data-top') == num - 1) {
                homeCell.setAttribute('data-top', num);
                lastCardEl.addClass('autohome');
                if (_autoLimit > 2) {
                    ///by click
                    setTimeout(goHome, 300, homeCell, _lastCard, (num - 1));
                } else {
                    setTimeout(goHome, 1000, homeCell, _lastCard, (num - 1));
                }
            }
        }
    }
}

function goHome(_home, _card, _row) {
    // let hisObj;
    let suit = _card.getAttribute('data-suit');
    if (_home.childElementCount > 0) {
        //find last card in home
        //let lastInHome = $(_home).find('div')[parseInt(_row - 1)];
        let lastInHome = _home.getElementsByTagName('div')[parseInt(_row - 1)];
        lastInHome.append(_card);
    } else {
        _home.append(_card);
    }
    let hisObj = {
        id: _card.getAttribute('id'),
        now: _card.getAttribute('data-pos'),
        new: 'h' + suit + _row
    }
    pushHistory(hisObj);
    _card.setAttribute('data-pos', ['h' + suit + _row]);
    _card.setAttribute('draggable', false);
    _card.classList.remove('autohome');
    clearHint();
    updateDraggable();
}

function updateOrder(_c) {
    let column = document.querySelectorAll('.working-area>li')[_c]; //$('.working-area >li').eq(_c);
    let totalRow = column.querySelectorAll('div').length;
    let card = column;
    for (let i = 0; i < totalRow; i++) {
        newPos = "c" + _c + "r" + i;
        card.children[0].setAttribute('data-pos', newPos);
        card = card.children[0];
    }
}


function getTotalRow(_c) {
    let column = document.querySelectorAll('.working-area>li')[_c];
    let totalRow = column.querySelectorAll('div').length;
    return totalRow;
}

function updateDraggable() {

    for (let i = 0; i < col; i++) {
        let column = document.querySelectorAll('.working-area>li')[i]; // $('.working-area >li').eq(i);
        let cardsInColumn = column.querySelectorAll('div');
        let totalRow = cardsInColumn.length;
        if (totalRow != 0) {
            ///last one is draggable
            cardsInColumn[totalRow - 1].setAttribute('draggable', true);
            // checkAutoHome(cardsInColumn[totalRow - 1], 2); //this auto home only do ace and 2
            ///check prev is draggable
            for (let j = totalRow - 1; j >= 0; j--) {
                let last = cardsInColumn[j];
                if (j != 0) {
                    let prev = cardsInColumn[j - 1];
                    //check num
                    if (parseInt(last.getAttribute('data-num')) != parseInt(prev.getAttribute('data-num')) - 1) {
                        break;
                    }
                    //check color
                    if (last.getAttribute('data-color') == prev.getAttribute('data-color')) {
                        break;
                    }
                    prev.setAttribute('draggable', true);
                } else {
                    ///j == 0 
                    if (totalRow == 1) {
                        last.setAttribute('draggable', true);
                    }
                }
            }
        }
    }
    checkHint();
    checkWin();
}

function checkHint() {
    let foundHint = false;
    //check each column to see if any hint
    for (let i = 0; i < col; i++) {
        let column = document.getElementsByClassName('working-area')[0].getElementsByTagName('li')[i];
        if (column.getElementsByTagName('div').length > 0) {
            let nowCard = column.querySelector('div[draggable=true]');
            for (let j = 0; j < col; j++) {
                if (i == j) {
                    continue;
                }
                let otherColCards = document.getElementsByClassName('working-area')[0].getElementsByTagName('li')[j].getElementsByTagName('div');
                if (otherColCards.length > 0) {
                    let otherCard = otherColCards[otherColCards.length - 1];
                    foundHint = checkEachCol(nowCard, otherCard);
                    if (foundHint) break;
                }
            }
            if (foundHint) break;
        }
    }
    //check if temp cell can put back to column
    if (!foundHint) {
        let tempCellCards = document.querySelectorAll('.temp-cell>div');
        if (tempCellCards.length > 0) {
            for (let t = 0; t < tempCellCards.length; t++) {
                for (let k = 0; k < col; k++) {
                    let otherColCards = document.getElementsByClassName('working-area')[0].getElementsByTagName('li')[k].getElementsByTagName('div');
                    if (otherColCards.length > 0) {
                        let otherCard = otherColCards[otherColCards.length - 1];
                        foundHint = checkEachCol(tempCellCards[t], otherCard);
                        if (foundHint) break;
                    }
                }
                if (foundHint) break;
            }
        }
    }
    if (!foundHint) {
        $('.hint-btn').addClass('disable');
    } else {
        $('.hint-btn').removeClass('disable');
    }
}

function checkEachCol(_nowCard, _otherCard) {
    //check number
    if (parseInt(_nowCard.getAttribute('data-num')) != (parseInt(_otherCard.getAttribute('data-num')) - 1)) return false;

    if (_nowCard.getAttribute('data-color') == _otherCard.getAttribute('data-color')) return false;

    hintArr.push(_nowCard.getAttribute('id'));
    hintArr.push(_otherCard.getAttribute('id'));
    // console.log('hintArr ' + hintArr);
    return true;
}


function showHint() {
    for (let i = 0; i < hintArr.length; i++) {
        let hintCard = document.getElementById(hintArr[i]);
        hintCard.classList.add('hint');
        let hasChild = hintCard.getElementsByTagName('div');
        if (hasChild.length > 0) {
            //has child
            hasChild[hasChild.length - 1].classList.add('hint-end');
        }
    }
}

function clearHint() {
    for (let i = 0; i < hintArr.length; i++) {
        let hintCard = document.getElementById(hintArr[i]);
        hintCard.classList.remove('hint');
        let hasChild = hintCard.getElementsByTagName('div');
        if (hasChild.length > 0) {
            //has child
            hasChild[hasChild.length - 1].classList.remove('hint-end');
        }
    }
    hintArr = [];
}




function pushHistory(_obj) {
    if (historyArr.length < historyMax) {
        historyArr.push(_obj);
    } else {
        historyArr.shift();
        historyArr.push(_obj);
    }
    if (historyArr.length > 0) {
        if ($('.restart-btn').hasClass('disable')) {
            $('.restart-btn').removeClass('disable');
        }
        if ($('.undo-btn').hasClass('disable')) {
            $('.undo-btn').removeClass('disable');
        }
    } else {
        if (!$('.restart-btn').hasClass('disable')) {
            $('.restart-btn').addClass('disable');
        }
        if (!$('.undo-btn').hasClass('disable')) {
            $('.undo-btn').addClass('disable');
        }
    }
    // console.log('pushHistory ' + historyArr[historyArr.length - 1].id + "   " + historyArr[historyArr.length - 1].now + ".  " + historyArr[historyArr.length - 1].new);
}

function popHistory() {
    historyArr.pop();
    if (historyArr.length < 1) {
        if (!$('.undo-btn').hasClass('disable')) {
            $('.undo-btn').addClass('disable');
        }
    }
}

function undo() {
    if (historyArr.length < 1) return;
    let hisObj = historyArr[historyArr.length - 1];
    let currentPos = hisObj.new;
    let card = document.getElementById(hisObj.id);
    let prevPos = hisObj.now;
    switch (currentPos.substring(0, 1)) {
        case 'h':
            if (prevPos.indexOf('t') != -1) {
                //home to temp
                removeCardFromHome(card, currentPos);
                appendBacktoTemp(card, prevPos);
            } else {
                //home to card   
                removeCardFromHome(card, currentPos);
                appendBacktoCard(card, prevPos);
            }
            break;
        case 't':
            if (prevPos.indexOf('t') != -1) {
                //temp to temp
                removeCardFromTemp(card, currentPos);
                appendBacktoTemp(card, prevPos); //
            } else {
                //temp to card
                removeCardFromTemp(card, currentPos);
                appendBacktoCard(card, prevPos);
            }
            break;
        case 'c':
            if (prevPos.indexOf('t') != -1) {
                //card to temp 
                removeCardFromCard(card, currentPos);
                appendBacktoTemp(card, prevPos);
            } else {
                //working cell to card
                removeCardFromCard(card, currentPos);
                appendBacktoCard(card, prevPos);
            }

            break;
    }
    //update history
    popHistory();
    //clear hint
    clearHint();
    //update draggable
    updateDraggable();

}

//remove card from home
function removeCardFromHome(_card, _home) {
    let suit = _home.substring(1, 2).toUpperCase();
    let homeCell = document.getElementById(suit + '-home');
    let homeRow = _home.substr(2);
    //remove card from home
    if (homeRow != 0) {
        //remove from card
        let lastInHome = homeCell.getElementsByTagName('div')[parseInt(homeRow - 1)];
        lastInHome.removeChild(_card);
    } else {
        homeCell.removeChild(_card);
    }
    //set home back
    homeCell.setAttribute('data-top', homeRow);
}

function removeCardFromTemp(_card, _temp) {
    let index = _temp.substring(1, 2);
    let tempCell = document.getElementsByClassName('temp-cell')[index];
    console.log('temp to Card ' + index + '.  temp cell' + tempCell);
    tempCell.removeChild(_card);
}

function removeCardFromCard(_card, _orig) {
    //remove from card
    let col = _orig.substring(1, 2);
    let columnCell = document.getElementsByClassName('working-area')[0].getElementsByTagName('li')[col];
    let row = _orig.substr(3);
    let des;
    if (row == 0) {
        des = columnCell;
    } else {
        des = columnCell.getElementsByTagName('div')[row - 1];
    }
    des.removeChild(_card);
    updateOrder(col); //for undo     
}

function appendBacktoCard(_card, _pos) {
    let col = _pos.substring(1, 2);
    let columnCell = document.getElementsByClassName('working-area')[0].getElementsByTagName('li')[col];
    let row = _pos.substr(3);
    let des;
    if (row == 0) {
        des = columnCell;
    } else {
        des = columnCell.getElementsByTagName('div')[row - 1];
    }
    //append card to card
    des.append(_card);
    updateOrder(col); //for undo    
}

function appendBackToTemp(_card, _pos) {
    let index = _pos.substring(1, 2);
    let tempCell = document.getElementsByClassName('temp-cell')[index];
    _card.setAttribute('data-pos', ['t' + index]);
    tempCell.append(_card);
}


function checkWin() {
    let falseCount = document.querySelectorAll('.working-area div[draggable="false"]').length;
    if (falseCount == 0) {
        ///you win
        autoEnd();
    }
}

function autoEnd() {
    if (document.querySelectorAll('.working-area div').length > 0 || document.querySelectorAll('.temp-cell div').length > 0) {
        for (let i = 0; i < col; i++) {
            let column = document.querySelectorAll('.working-area>li')[i]; //$('.working-area >li').eq(i);
            let cardsInColumn = column.querySelectorAll('div');
            let totalRow = cardsInColumn.length;
            if (totalRow != 0) {
                //has card -- find last one
                let last = cardsInColumn[totalRow - 1];
                checkAutoHome(last, 13);
            }
        }
        for (let j = 0; j < document.querySelectorAll('.temp-cell').length; j++) {
            let temp = document.querySelectorAll('.temp-cell')[j]; //$('.temp-cell').eq(j);
            if (temp.children.length > 0) {
                let card = temp.children[0];
                checkAutoHome(card, 13);
            }
        }
    } else {
        gameState = "win";
        showWinScreen();
    }
}


//////Time
function startTimer() {
    let timer = 0;
    let minutes;
    let seconds;
    let hours;
    timerInt = window.setInterval(() => {
        if (gameState == "playing") {
            timer++;
            hours = parseInt(timer / 3600, 10);
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            hours = hours < 10 ? `0${hours}` : hours;
            minutes = minutes < 10 ? `0${minutes}` : minutes;
            seconds = seconds < 10 ? `0${seconds}` : seconds;
            $('.time>span').text(`${hours}:${minutes}:${seconds}`);
        }
    }, 1000);
}

function cleanTimer() {
    if (timerInt != undefined) {
        window.clearInterval(timerInt);
        timerInt = undefined;
        $('.time>span').text('00:00');
    }
}

//////////btns

function cleanup() {
    $('.temp-cell').empty();
    $('.home-cell').empty();
    $('.home-cell').attr('data-top', 0);
    $('.working-area>li').empty();
    hintArr = [];
    historyArr = [];
    cleanTimer();
    gameState = "";
}


function newGame() {
    if (document.querySelector('.mask').classList.contains('show')) {
        closeMask();
    }
    if (gameState == "playing") {
        showConfirmWindow();
        return;
    }
    buildCardNumArr();
    dataCollection = getDataCollection();
    cleanup();
    dealCard();
    setTimeout(dealTransition, 1000);
}

function restartGame(ev) {
    if (ev.target.classList.contains('disable')) return;
    if (document.querySelector('.mask').classList.contains('show')) {
        closeMask();
    }
    cleanup();
    dealCard();
    setTimeout(dealTransition, 1000);
}

function confirmNewGame() {
    gameState = "";
    newGame();
}


function cardClicked(ev) {
    ev.stopPropagation();
    //check is last card or not
    let card = ev.target;
    let cardPos = card.getAttribute('data-pos')
    if (cardPos.substr(0, 1) != 't') {
        let cardColumn = cardPos.substr(1, 1);
        let cardRow = cardPos.substr(3);
        // console.log('card column ' + cardColumn + '. ' + 'cardRow ' + cardRow);
        let column = document.getElementsByClassName('working-area')[0].getElementsByTagName('li')[cardColumn];
        if (column.getElementsByTagName('div').length == parseInt(cardRow) + 1) {
            //last card
            checkAutoHome(card, 13);
        }
    } else {
        ///in temp cell
        checkAutoHome(card, 13);
    }

}

function hintClicked(ev) {
    if (ev.target.classList.contains('disable')) return;
    showHint();
}

function undoClicked(ev) {
    if (ev.target.classList.contains('disable')) return;
    undo();
}

function showConfirmWindow() {
    $('.mask').removeClass('hide').addClass('show');
    $('.info-window .confirm-pan').addClass('show');
    $('.info-window').removeClass('hide').addClass('show');
}

function showWinScreen() {
    $('.mask').removeClass('hide').addClass('show');
    $('.info-window .win-pan').addClass('show');
    $('.info-window').removeClass('hide').addClass('show');
}

function closeMask() {
    $('.info-window').removeClass('show');
    $('.mask').removeClass('show');
    setTimeout(hideMask, 1000);
}

function hideMask() {
    $('.info-window').addClass('hide');
    $('.info-window .pan').removeClass('show');
    $('.mask').addClass('hide');
}

$('document').ready(function() {
    $('.new-game-btn').on('click', newGame);
    $('.restart-btn').on('click', restartGame);
    $('.hint-btn').on('click', hintClicked);
    $('.undo-btn').on('click', undoClicked);
    $('.close-btn').on('click', closeMask);
    $('.new-game-confirm-btn').on('click', confirmNewGame);
    newGame();
})