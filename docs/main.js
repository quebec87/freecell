var cardNumArr = [];
const col = 8;
var dataCollection;
// var dataCollection = [
//     ['C9', 'H4', 'C1', 'S10', 'D1', 'S3', 'H9'],
//     ['D6', 'S12', 'C4', 'C7', 'D4', 'D11', 'H7'],
//     ['C3', 'D9', 'C8', 'S8', 'H3', 'H10', 'S7'],
//     ['H12', 'S6', 'C10', 'D2', 'H1', 'D5', 'S5'],
//     ['C6', 'S2', 'D10', 'S9', 'H13', 'H2'],
//     ['H8', 'S11', 'D7', 'C11', 'D13', 'C2'],
//     ['C12', 'H5', 'S13', 'D3', 'S4', 'H11'],
//     ['S1', 'D8', 'C13', 'C5', 'D12', 'H6'],
// ];

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

        var color = getColor(cardNumArr[i]);
        var num = cardNumArr[i] % 13;
        var cardVal = color + (num + 1).toString();

        var col_order = i % col;
        arr[col_order].push(cardVal);
    }
    console.log(arr);
    return arr;
}

function getColor(_num) {
    if (_num < 14) {
        return "S";
    } else if (_num > 13 && _num < 27) {
        return "D";
    } else if (_num > 26 && _num < 40) {
        return "C";
    } else {
        return "H";
    }
}



function dealCard() {
    //setup card
    for (let i = 0; i < dataCollection.length; i++) {
        var column = $('.working-area>li').eq(i);
        for (let j = 0; j < dataCollection[i].length; j++) {
            var myVal = dataCollection[i][j].toString();
            var dataColor = myVal.slice(0, 1);
            var dataNum = myVal.substring(1);
            var img = 'url("img/cards_background/' + myVal + '.png")';
            var card = "<div id='" + myVal + "' class='card row" + j + "' dataColor='" + dataColor + "' dataNum='" + dataNum + "' dataPos=[c" + i + "r" + j + "]' style='background-image:" + img + "'></div>";
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
    $('.card').addClass('show');
}

function cleanup() {
    $('.working-area>li').empty();
}


function newGame() {
    buildCardNumArr();
    dataCollection = getDataCollection();
    cleanup();
    dealCard();
    setTimeout(dealTransition, 1000);
}

function restartGame() {
    cleanup();
    dealCard();
    setTimeout(dealTransition, 1000);
}


$('document').ready(function() {
    $('.new-game-btn').on('click', newGame);
    $('.restart-btn').on('click', restartGame);
    newGame();
})