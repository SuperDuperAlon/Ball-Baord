"use strict";

var score = document.querySelector("h2 span");

const WALL = "WALL";
const FLOOR = "FLOOR";
const BALL = "BALL";
const GAMER = "GAMER";
const CANDY = "CANDY";

const GAMER_IMG = '<img src="img/gamer.png">';
const BALL_IMG = '<img src="img/ball.png">';
const CANDY_IMG = '<img src="img/candy.png">';

// Model:
var gIsFrozen = false;
var gBoard;
var gGamerPos;
var gBallInterval;
var gCandyInterval;
var gScore = 0;

function onInitGame() {
  gGamerPos = { i: 2, j: 9 };
  gBoard = buildBoard();
  renderBoard(gBoard);
  getEmptyCell();
  countBalls();
  gBallInterval = addBallInterval();
  gCandyInterval = addCandyInterval();

  //   console.log(gBoard);
}

function buildBoard() {
  const board = [];
  // DONE: Create the Matrix 10 * 12
  // DONE: Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < 10; i++) {
    board[i] = [];
    for (var j = 0; j < 12; j++) {
      board[i][j] = { type: FLOOR, gameElement: null };
      if (i === 0 || i === 9 || j === 0 || j === 11) {
        board[i][j].type = WALL;
      }
    }
  }
  // DONE: Place the gamer and two balls
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
  board[5][5].gameElement = BALL;
  board[7][2].gameElement = BALL;

  // Passages
  board[0][5].gameElement = null;
  board[0][5].type = FLOOR;
  board[5][0].gameElement = null;
  board[5][0].type = FLOOR;
  board[9][5].gameElement = null;
  board[9][5].type = FLOOR;
  board[5][11].gameElement = null;
  board[5][11].type = FLOOR;

  return board;
}

function renderBoard(board) {
  const elBoard = document.querySelector(".board");
  var strHTML = "";
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n";
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j];

      var cellClass = getClassName({ i: i, j: j });
      // console.log('cellClass:', cellClass)

      if (currCell.type === FLOOR) cellClass += " floor";
      else if (currCell.type === WALL) cellClass += " wall";

      strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`;

      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG;
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG;
      }

      strHTML += "\t</td>\n";
    }
    strHTML += "</tr>\n";
  }

  elBoard.innerHTML = strHTML;
}

function moveTo(i, j) {
  console.log(i, j);
  const targetCell = gBoard[i][j];
  if (targetCell.type === WALL) return;

  // Calculate distance to make sure we are moving to a neighbor cell
  const iAbsDiff = Math.abs(i - gGamerPos.i);
  const jAbsDiff = Math.abs(j - gGamerPos.j);


  if (j === -1) j = gBoard[0].length - 1
    else if (j === gBoard[0].length) j = 0

    if (i === -1) i = gBoard.length - 1
    else if (i === gBoard.length) i = 0

  // If the clicked Cell is one of the four allowed
  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0)
  ) {
    if (targetCell.gameElement === BALL) {
      gScore++;
      var elScore = document.querySelector("h2 span");
      elScore.innerText = gScore;
      playSound();
      gBoard[(targetCell.gameElement = null)];
      if (gScore > 5) {
        gameOver();
      }
      console.log("Collecting!");
    }
    if (targetCell.gameElement === CANDY) {
      freezeGamer();
      //   clearInterval(freezeInterval);
    }

    // DONE: Move the gamer
    // REMOVING FROM
    // update Model
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    // update DOM
    renderCell(gGamerPos, "");

    // ADD TO
    // update Model
    targetCell.gameElement = GAMER;
    gGamerPos = { i, j };
    // update DOM
    renderCell(gGamerPos, GAMER_IMG);
  }
}

function renderCell(location, value) {
  const cellSelector = "." + getClassName(location); // cell-i-j
  const elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}

function onHandleKey(event) {
  const i = gGamerPos.i;
  const j = gGamerPos.j;
  console.log("event.key:", event.key);

  //   if (event.key === "ArrowLeft" && j === 0) {
  //     moveTo(9,5)
  //     renderCell({i:5, j:0}, "")
  //     renderCell({i:5, j:11}, GAMER_IMG)

  //     return
  // }
  if (!gIsFrozen) {
    switch (event.key) {
      case "ArrowLeft":
        moveTo(i, j - 1);
        break;
      case "ArrowRight":
        moveTo(i, j + 1);
        break;
      case "ArrowUp":
        moveTo(i - 1, j);
        break;
      case "ArrowDown":
        moveTo(i + 1, j);
        break;
    }
  }

  countNeighbors(i, j, gBoard);
}

// Returns the class name for a specific cell
function getClassName(location) {
  const cellClass = "cell-" + location.i + "-" + location.j;
  return cellClass;
}

function getEmptyCell() {
  var emptyCells = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].gameElement === null && gBoard[i][j].type === FLOOR) {
        emptyCells.push({ i, j });
      }
    }
  }
  var emptyCell = emptyCells[getRandomInt(0, emptyCells.length)];
  return emptyCell;
}

function addBall() {
  var emptyCell = getEmptyCell();
  var img = BALL_IMG;
  var newCell = gBoard[emptyCell.i][emptyCell.j];
  newCell.gameElement = BALL;
  renderCell(emptyCell, img);
  console.log(gBoard);
}

function addCandy() {
  var emptyCell = getEmptyCell();
  var img = CANDY_IMG;
  var newCell = gBoard[emptyCell.i][emptyCell.j];
  newCell.gameElement = CANDY;
  renderCell(emptyCell, img);
  console.log(gBoard);
}

function addBallInterval() {
  var bInterval = setInterval(addBall, 4000); //
  return bInterval;
}

function addCandyInterval() {
  var cInterval = setInterval(addCandy, 6000); //
  return cInterval;
}

function freezeGamer() {
  gIsFrozen = true;
  var freezeInterval = setTimeout(unFreezeGamer, 3000);
  return freezeInterval;
}

function unFreezeGamer() {
  gIsFrozen = false;
}

function gameOver() {
  var ballsOnBoard = countBalls();
  var elScore = document.querySelector("h2 span");
  if (elScore.innerText > 5 && ballsOnBoard === 0) {
    alert("Game Over! Press restart to get a new game");
  }
}

function countBalls() {
  var ballsOnBoard = 0;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].gameElement === BALL) {
        ballsOnBoard += 1;
      }
    }
  }
  return ballsOnBoard;
}

function restart() {
  var elScore = document.querySelector("h2 span");
  elScore.innerText = 0;
  gScore = 0;
  clearInterval(gBallInterval)
  clearInterval(gCandyInterval)

  onInitGame();
}

function playSound() {
  var aud = new Audio("audio/collectSound.wav");
  aud.play();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function countNeighbors(cellI, cellJ, mat) {
  var neighborsCount = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= mat.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= mat[i].length) continue;
      if (mat[i][j].gameElement === BALL) neighborsCount++;
    }
  }
  return neighborsCount;
}
