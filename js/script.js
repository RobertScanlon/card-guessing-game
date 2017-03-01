var game = {
  face : false,
  total : 0,
  deck_id : "",
  pile_id : "myPile",
  currentCard : null,
  pileSize : 0,
  guessStr : ""
};

var server = "http://127.0.0.1:8000/api/deck";

var noFaceString = "/?cards=2S,2D,2C,2H,3S,3D,3C,3H,4S,4D,4C,4H,5S,5D,5C,5H,6S,6D,6C,6H," +
                   "7S,7D,7C,7H,8S,8D,8C,8H,9S,9D,9C,9H,10S,10D,10C,10H,";

var noFaceDeckUrl = server + "/new/shuffle" + noFaceString;

var faceDeckUrl = server + "/new/shuffle/?deck_count=1";



document.addEventListener("DOMContentLoaded", bindUsrOpt);
document.addEventListener("DOMContentLoaded", bindDraw);
document.addEventListener("DOMContentLoaded", bindAdd);
document.addEventListener("DOMContentLoaded", bindGuess);

function bindUsrOpt() {
  document.getElementById("submitUrsOpt").addEventListener("click", function(event) {
      if (!document.getElementById("noFace").checked) {
        game.face = true;
        showFaceCards();
      }
      var opt = document.getElementById("cardNumber");
      game.total = opt.options[opt.selectedIndex].value;
      event.preventDefault();
      getDeck();
  });
}


function getDeck() {
  var res = new XMLHttpRequest();
  if (game.face == false) {
    res.open("GET", noFaceDeckUrl, true);
  } else {
    res.open("GET", faceDeckUrl, true);
  }
  res.send(null);
  res.addEventListener("load", function(event) {
    if (res.status >= 200 && res.status < 400) {
      game.deck_id = JSON.parse(res.responseText).deck_id;
    } else {
      // error
    }
    event.preventDefault();
  });
}

function bindDraw() {
  document.getElementById("draw").addEventListener("click", function(event) {
    draw();
    event.preventDefault();
  });

}
function draw() {
  var res = new XMLHttpRequest();
  var url = server + "/" + game.deck_id + "/draw/?count=1";
  res.open("GET", url, true);
  res.send(null);
  res.addEventListener("load", function(event) {
    if (res.status >= 200 && res.status < 400) {
      // load image
      if (game.pileSize < game.total) {
        var obj = JSON.parse(res.responseText);
        loadImage(obj);
        game.currentCard = obj.cards[0];
      }
    } else {
      // error
    }
    event.preventDefault();
  });
}


function loadImage(obj) {
  document.getElementById("cardImg").src = obj.cards[0].image;
}



function bindAdd() {
  document.getElementById("put").addEventListener("click", function(event) {
    if (game.pileSize < game.total) {
      addToPile();
      document.getElementById("cardImg").src = "";
      document.getElementById("cardImg").alt = "card added";
    }
    event.preventDefault();
  });
}

function addToPile() {
  var res = new XMLHttpRequest();
  var url = server + "/" + game.deck_id + "/pile/" + game.pile_id + "/add/" +
            "?cards=" + game.currentCard.code;
  res.open("GET", url, true);
  res.send(null);
  res.addEventListener("load", function(event) {
    if (res.status >= 200 && res.status < 400) {
      game.pileSize++;
      game.currentCard = null;
      document.getElementById("pileSize").textContent = game.pileSize;
    } else {
      // error
    }
    event.preventDefault();
  });
}

function getGuesses() {
  var guess = "";
  var g = searchSuit("S");
  if (g.length > 0) {
    guess += searchSuit("S");
  }
  g = searchSuit("D");
  if (g.length > 0) {
    guess += searchSuit("D");
  }
  g = searchSuit("C");
  if (g.length > 0) {
    guess += searchSuit("C");
  }
  g = searchSuit("H");
  if (g.length > 0) {
    guess += searchSuit("H");
  }
  return guess.substring(0, guess.length - 1);
}

function searchSuit(suit) {
  var retStr = "";
  for (var i = 2; i < 11; i++) {
    var id = i + suit;
    var e = document.getElementById(id);
    if (e.checked) {
      retStr += (id + ",");
    }
  }
  var fid = "J"+ suit;
  var fe = document.getElementById(fid);
  if (fe.checked) {
    retStr += (id + ",");
  }
  fid = "Q" + suit;
  var fe = document.getElementById(fid);
  if (fe.checked) {
    retStr += (id + ",");
  }
  fid = "K" + suit;
  var fe = document.getElementById(fid);
  if (fe.checked) {
    retStr += (id + ",");
  }
  fid = "A" + suit;
  var fe = document.getElementById(fid);
  if (fe.checked) {
    retStr += (id + ",");
  }
  return retStr;
}

function bindGuess() {
  document.getElementById("guessButton").addEventListener(
    "click", function(event){
      game.guessStr = getGuesses();
      tryGuess();
    });
}

function showFaceCards() {
  var cell = document.getElementsByClassName("faceCard");
  for (var i = 0; i < cell.length; i++) {
    var c = cell[i];
    c.style.display = "table-row";
  }
}

function tryGuess() {
  var count = 1;
  for (var i = 0; i < game.guessStr.length; i++) {
    if (game.guessStr[i] == ",") {
      count++;
    }
  }
  if (count != game.pileSize) {
    document.getElementById("result").textContent = "Sorry, Refresh " +
    "and Try Again!";
    return;
  } else {
    var url = server + "/" + game.deck_id + "/pile/" + game.pile_id +
              "/draw/?cards=" + game.guessStr;
    var res = new XMLHttpRequest();
    res.open("GET", url, true);
    res.send(null);
    res.addEventListener("load", function(event) {
      if (res.status >= 200 && res.status < 400) {
        // test
        var resObj = JSON.parse(res.responseText);
        if (resObj.piles.myPile.remaining == 0) {
          document.getElementById("result").textContent = "You Win!";
        } else {
          document.getElementById("result").textContent = "Sorry, Refresh " +
          "and Try Again!";
        }
      } else {
        // error
      }
      event.preventDefault();
    });
  }
}
// function createGuessOptions(g) {
//   var fld = document.getElementById("cardInputField");
//   if (g.face == false) {
//     addOpt("Spades", fld);
//     addOpt("Diamonds", fld);
//     addOpt("Clubs", fld);
//     addOpt("Hearts", fld);
//   } else {
//
//   }
// }
//
//
// function addOpt(suite, par) {
//   for (var i = 2; i < 11; i++) {
//     var span = document.createElement("span");
//     span.style.border = "1px solid black";
//     var id = i + " " + suite;
//     var opt = document.createElement("input");
//     opt.type = "checkbox";
//     opt.value = id;
//     opt.id = id;
//     var label = document.createElement("label");
//     label.for = id;
//     label.textContent = id;
//     span.appendChild(opt);
//     span.appendChild(label);
//     par.appendChild(span);
//   }
// }
