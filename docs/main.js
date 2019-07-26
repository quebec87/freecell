let cardNumArr = [];
const col = 8;
let dataCollection;
// var dataCollection = [
//     ['C9', 'H4', 'C1', 'S10', 'S3', 'H9', 'D1'],
//     ['D6', 'S12', 'C4', 'C7', 'D4', 'D11', 'H7'],
//     ['D9', 'C8', 'S8', 'H3', 'H10', 'C3', 'S7'],
//     ['H12', 'S6', 'C10', 'D2', 'H1', 'D5', 'S5'],
//     ['C6', 'S2', 'H13', 'H2', 'D10', 'S9'],
//     ['H8', 'S11', 'D7', 'C11', 'D13', 'C2'],
//     ['C12', 'H5', 'S13', 'D3', 'S4', 'H11'],
//     ['D8', 'C13', 'C5', 'D12', 'H6', 'S1']
// ];
let gameState = "";
let timerInt;
//////////buildata
function buildCardNumArr() {
    var arr = []
    for (var i = 1; i <= 52; i++) {
        arr.push(i);
    }
    cardNumArr = shuffleArr(arr);
}

function shuffleArr(_arr) {
    for (var j, x, i = _arr.length; i; j = parseInt(Math.random() * i), x = _arr[--i], _arr[i] = _arr[j], _arr[j] = x);
    return _arr;
}

function getDataCollection() {
    var arr = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];
    for (var i = 0; i < cardNumArr.length; i++) {

        var suit = getSuit(cardNumArr[i]);
        var num = cardNumArr[i] % 13;
        var cardVal = suit + (num + 1).toString();

        var col_order = i % col;
        arr[col_order].push(cardVal);
    }
    console.log(arr);
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
        var column = $('.working-area>li').eq(i);
        for (let j = 0; j < dataCollection[i].length; j++) {
            var myVal = dataCollection[i][j].toString();
            var dataSuit = myVal.slice(0, 1);
            var dataNum = myVal.substring(1);
            var dataColor;
            dataSuit == "S" || dataSuit == "C" ? dataColor = "B" : dataColor = "R";
            var img = 'url("img/cards_background/' + myVal + '.png")';
            var draggableVal = (j != dataCollection[i].length - 1) ? false : true;
            var card = "<div id='" + myVal + "' class='card'  data-suit='" + dataSuit + "' data-num='" + dataNum + "' data-color='" + dataColor + "' data-pos=[c" + i + "r" + j + "] style='background-image:" + img + "' draggable='" + draggableVal + "' ondragstart='drag(event)' ></div>";
            if (j == 0) {
                column.append(card);
            } else {
                var parent = dataCollection[i][j - 1];
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
function allowDrop(ev) {
    ev.preventDefault();
    ev.target.classList.add('drop-target-focus');
}

function dragStart(ev) {
    //console.log('dragSTart');
    //hint
}


function dragEnter(ev) {
    // $(ev.target).addClass('dragging');
}

function dragLeave(ev) {
    ev.target.classList.remove('drop-target-focus');
    // $(ev.target).removeClass('dragging');
}


function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function dropHome(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var dataEl = document.getElementById(data);
    var dropcell = ev.target;
    dropcell.classList.remove('drop-target-focus');
    var num = parseInt(dataEl.getAttribute('data-num'));
    var suit = dataEl.getAttribute('data-suit');
    //check dragging card length
    if (dataEl.childElementCount > 0) return;

    if (dropcell.className.indexOf('home-cell') != -1) {
        //check suit
        if (dropcell.className.indexOf(suit) == -1) return;
        //check num 
        if (num != parseInt(dropcell.getAttribute('data-top')) + 1) return;
    } else {
        //card cell
        //check suit
        if (dropcell.getAttribute('data-suit') != suit) return;
        //check num
        if (parseInt(dropcell.getAttribute('data-num')) != num - 1) return;

    }
    var suitClass = "." + suit + "-home";
    $(suitClass).attr('data-top', num);
    dataEl.setAttribute('draggable', false);
    dropcell.appendChild(dataEl);
    updateDraggable();
}


function dropTemp(ev) {
    ev.preventDefault();
    ev.target.classList.remove('drop-target-focus');
    var data = ev.dataTransfer.getData("text");
    var dataEl = document.getElementById(data);
    //check dragging card length
    if (dataEl.childElementCount > 0) return;
    //check if already has card
    if (ev.target.className.indexOf('temp-cell') == -1) return;
    dataEl.setAttribute('data-pos', []);
    ev.target.appendChild(dataEl);
    updateDraggable();
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var dataEl = document.getElementById(data);
    var dropcell = ev.target;
    dropcell.classList.remove('drop-target-focus');
    var num = parseInt(dataEl.getAttribute('data-num'));
    var dropColumn;
    if (dropcell.className.indexOf('cell') != -1) {
        //cell
        if (dropcell.childElementCount > 0) return;
        dropColumn = $(dropcell).index();
    } else {
        //card
        //check color
        if (dropcell.getAttribute('data-color') == dataEl.getAttribute('data-color')) return;
        //check num
        if (parseInt(dropcell.getAttribute('data-num')) != num + 1) return;
        var dropcellPos = dropcell.getAttribute('data-pos');
        dropColumn = dropcellPos.substr(2, 1);
    }
    dropcell.appendChild(dataEl);
    updateDraggable();
    updateOrder(dropColumn); //for undo 
}



function checkAutoHome(_lastCard, _autoLimit) {
    var suit = _lastCard.getAttribute('data-suit');
    var num = _lastCard.getAttribute('data-num');
    var lastCardEl = $(_lastCard);
    if (num > _autoLimit) return;
    //console.log('last card suit' + suit + '. num' + num);
    for (var i = 0; i < $('.home-cell').length; i++) {
        var homeCell = $('.home-cell')[i];
        //console.log('homeCell ' + homeCell.className);
        if (homeCell.className.indexOf(suit) != -1) {
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
    if (_home.childElementCount > 0) {
        //find last card in home
        //var lastInHome = $(_home).find('div')[parseInt(_row - 1)];
        var lastInHome = _home.querySelectorAll('div')[parseInt(_row - 1)];
        $(lastInHome).append(_card);
    } else {
        _home.append(_card);
    }
    _card.setAttribute('draggable', false);
    _card.classList.remove('autohome');
    updateDraggable();
}

function updateOrder(_c) {
    var column = document.querySelectorAll('.working-area >li')[_c]; //$('.working-area >li').eq(_c);
    var totalRow = column.querySelectorAll('div').length;
    var card = column;
    for (var i = 0; i < totalRow; i++) {
        newPos = "[c" + _c + "r" + i + "]";
        card.children[0].setAttribute('data-pos', newPos);
        card = card.children[0];
    }

}

function updateDraggable() {
    for (let i = 0; i < col; i++) {
        var column = document.querySelectorAll('.working-area >li')[i]; // $('.working-area >li').eq(i);
        var cardsInColumn = column.querySelectorAll('div');
        var totalRow = cardsInColumn.length;
        if (totalRow != 0) {
            ///last one is draggable
            cardsInColumn[totalRow - 1].setAttribute('draggable', true);
            checkAutoHome(cardsInColumn[totalRow - 1], 2); //this auto home only do ace and 2
            ///check prev is draggable
            for (var j = totalRow - 1; j >= 0; j--) {
                var last = cardsInColumn[j];
                if (j != 0) {
                    var prev = cardsInColumn[j - 1];
                    //check num
                    if (parseInt(last.getAttribute('data-num')) != parseInt(prev.getAttribute('data-num')) - 1) {
                        break;
                    }
                    //check color
                    if (last.getAttribute('data-color') == prev.getAttribute('data-color')) {
                        break;
                    }
                    prev.setAttribute('draggable', true)
                } else {
                    ///j == 0 
                    if (totalRow == 1) {
                        last.setAttribute('draggable', true);
                    }
                }
            }
        }
    }
    checkWin();
}


function checkWin() {
    var falseCount = document.querySelectorAll('.working-area div[draggable="false"]').length;
    if (falseCount == 0) {
        ///you win
        autoEnd();
    }
}

function autoEnd() {
    if (document.querySelectorAll('.working-area div').length > 0 || document.querySelectorAll('.temp-cell div').length > 0) {
        for (var i = 0; i < col; i++) {
            var column = document.querySelectorAll('.working-area>li')[i]; //$('.working-area >li').eq(i);
            var cardsInColumn = column.querySelectorAll('div');
            var totalRow = cardsInColumn.length;
            if (totalRow != 0) {
                //has card -- find last one
                var last = cardsInColumn[totalRow - 1];
                checkAutoHome(last, 13);
            }
        }
        for (var j = 0; j < document.querySelectorAll('.temp-cell').length; j++) {
            var temp = document.querySelectorAll('.temp-cell')[j]; //$('.temp-cell').eq(j);
            if (temp.children.length > 0) {
                var card = temp.children[0];
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
    timerInt = window.setInterval(() => {
        if (gameState == "playing") {
            timer++;
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? `0${minutes}` : minutes;
            seconds = seconds < 10 ? `0${seconds}` : seconds;
            $('.time>span').text(`${minutes}:${seconds}`);
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

function restartGame() {
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
    var card = ev.target;
    var cardPos = card.getAttribute('data-pos')
    var cardColumn = cardPos.substr(2, 1);
    var cardRow = cardPos.slice(4).slice(0, -1);
    var column = document.querySelectorAll('.working-area>li')[cardColumn]; //$('.working-area > li').eq(cardColumn);
    if (column.querySelectorAll('div').length == parseInt(cardRow) + 1) {
        //last card
        checkAutoHome(card, 13);
    }
}

function hintClicked(ev) {
    //hack
    // gameState = "win";
    // showWinScreen();
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
    $('.close-btn').on('click', closeMask);
    $('.new-game-confirm-btn').on('click', confirmNewGame);
    newGame();
})