// elements
const gameContainer = document.getElementById("game-container");
const playerColor = document.getElementById("player-color");
const gameMessage = document.getElementById("game-message");
const startGameBlue = document.getElementById("start-game-blue");
const startGameRed = document.getElementById("start-game-red");

// arrays
const playerNames = ["Blue", "Red"];
const bigboard = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0: black, 1: blue, 2: red, 3: yellow(draw)
const positions = [0, 0, 0, 0, 0];
const rotations = [0, 0, 0, 0, 0];
const aichoices = [0, 0, 0, 0, 0];

// other variables
var currentPlayer = 0; // 0: blue, 1: red;
var currentBigCell = -1; // -1: any, 0-8: specific
var turnNo = 0;
var gameOngoing = true;
var aiOn = false;

// load MENACE
fetch('./MENACE.json')
  .then((response) => response.json())
  .then((MENACE) => console.log(MENACE["states"]));

// switch players
function switchPlayer() {
  currentPlayer = (currentPlayer + 1) % 2;

  if (currentPlayer == 0) {
    gameContainer.style.backgroundColor = "blue";
    playerColor.style.backgroundColor = "blue";
  }
  else {
    gameContainer.style.backgroundColor = "red";
    playerColor.style.backgroundColor = "red";
  }

  playerColor.innerHTML = playerNames[currentPlayer];
}

// click big cell
function clickBigCell(cell) {
  // get indices
  let big = cell.id.substring(5,6);
  let small = cell.id.substring(7,8);

  console.log("Clicked on (" + big + ", " + small + ").");

  // check if valid move
  if (checkValid(big, small)) {
    // update turnNo
    turnNo++;

    // disable ai buttons
    if (turnNo > 0) {
      startGameBlue.disabled = true;
    }
    if (turnNo > 1) {
      startGameRed.disabled = true;
    }

    // change value of bigboard[small]
    bigboard[big] = currentPlayer + 1;
    console.log(bigboard);

    // change background color of smallest cell
    changeColor(cell, currentPlayer);

    // check win in big board
    let bigWin = checkWin(bigboard);
    switch(bigWin) {
      case 1:
      case 2:
        // update game message
        gameMessage.innerHTML = playerNames[currentPlayer] + " wins the game!";
        gameOngoing = false;
        break;
      case 3:
        // update game message
        gameMessage.innerHTML = "It's a draw!";
        gameOngoing = false;
        break;
      default:
        // update game message
        gameMessage.innerHTML = playerNames[(currentPlayer + 1) % 2] + "'s turn!";
    }

    if (gameOngoing) {
      // switch players
      switchPlayer();
    }
  }
}

// change background color
function changeColor(element, color) {
  switch (color) {
    case 0: // blue
      element.style.backgroundColor = "blue";
      break;
    case 1: // red
      element.style.backgroundColor = "red";
      break;
    case 2: // yellow
      element.style.backgroundColor = "yellow";
      break;
    case 3: // green
      element.style.backgroundColor = "green";
      break;
    case 4: // black
      element.style.backgroundColor = "black";
      break;
    default: // white
      element.style.backgroundColor = "white";
  }
}

// reset board
function boardReset() {
  console.log("board reset");
  // reset cells
  for (let i = 0; i < 9; i++) {
    // big cells
    bigboard[i] = 0;
    let bigcellid = "bigcell-" + i;
    let bigcell = document.getElementById(bigcellid);
    changeColor(bigcell, 4);

    // small cells
    for (let j = 0; j < 9; j++) {
      smallboards[i][j] = 0;
      let id = "cell-" + i + "-" + j;
      let cell = document.getElementById(id);
      if (cell != null) {
        changeColor(cell, 100);
      }
    }
  }

  // return player to blue
  currentPlayer = 0;
  gameContainer.style.backgroundColor = "blue";
  playerColor.style.backgroundColor = "blue";
  playerColor.innerHTML = playerNames[0];
  gameMessage.innerHTML = playerNames[0] + "'s turn!";

  // reset game
  turnNo = 0;
  currentBigCell = -1;
  gameOngoing = true;
  aiOn = false;
  for (let i = 0; i < 5; i++) {
    positions[i] = 0;
    rotations[i] = 0;
    aichoices[i] = 0;
  }
  // enable startgame buttons
  startGameBlue.disabled = false;
  startGameRed.disabled = true;
}

// check valid move
function checkValid(big, small) {
  // game stopped
  if (!gameOngoing) {
    return false;
  }

  // correct big cell
  if (currentBigCell != -1 && big != currentBigCell) {
    return false;
  }

  // bigboard value
  if (bigboard[big] != 0) {
    return false;
  }

  return true;
}

// check win
// return values: 0: nothing, 1: blue, 2: red, 3: draw
function checkWin(array) {
  // rows and columns
  for (let i = 0; i < 3; i++) {
    // row
    if (array[3*i] != 0 && array[3*i] == array[(3*i)+1] && array[3*i] == array[(3*i)+2]) {
      return array[3*i];
    }

    // column
    if (array[i] != 0 && array[i] == array[i+3] && array[i] == array[i+6]) {
      return array[i];
    }
  }

  // diagonals
  if (array[0] != 0 && array[0] == array[4] && array[0] == array[8]) {
    return array[0];
  }
  if (array[2] != 0 && array[2] == array[4] && array[2] == array[6]) {
    return array[2];
  }

  console.log("No change or draw?");

  // check for no change
  for (let i = 0; i < 9; i++) {
    if (array[i] == 0) {
      return 0;
    }
  }

  // draw
  return 3;
}

// plays the game
function startGame(aiplayer) {
  // ai on
  aiOn = true;

  // disable startgame buttons
  startGameBlue.disabled = true;
  startGameRed.disabled = true;

  // if aiplayer = 0: turn 0

  // if aiplayer = 1: turn 0 or 1

  console.log(aiplayer);
}

// ai turn
function aiTurn() {
  let turn = "turn" + turnNo;
  let beads = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  // find the right state using copyboard
  for (let i = 0; i < MENACE["states"][turnNo]; i++) {
    let rot = checkRotations(MENACE[turn][i]["stateName"], bigboard);
    if (rot != -1) {
      // remember indices for backpropagating(?)
      positions[Math.floor(turnNo / 2)] = i;
      rotations[Math.floor(turnNo / 2)] = rot;

      copyBoard(MENACE[turn][i]["beads"], beads);
      // rotate beads
      rotateBeads(beads, rot);
      // find available cell
      // click that cell
    }
  }
}

// copy over board
function copyBoard(src, dest) {
  for (let i = 0; i < 9; i++) {
    dest[i] = src[i];
  }
}

// check rotations
// gamestate: statename
// boardstate: int board
function checkRotations(gameState, boardState) {
  let temp = 0;
  let copy = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  copyBoard(boardState, copy);

  // 0-3: rotations
  for (let i = 0; i < 4; i++) {
    // check
    if (checkEqual(gameState, boardToString(copy))) {
      return i;
    }
    // rotate corners
    temp = copy[0];
    copy[0] = copy[6];
    copy[6] = copy[8];
    copy[8] = copy[2];
    copy[2] = temp;
    // rotate edges
    temp = copy[1];
    copy[1] = copy[3];
    copy[3] = copy[7];
    copy[7] = copy[5];
    copy[5] = temp;
  }

  // 4-7: reflect, then rotate
  // reflect corners and edges
  temp = copy[0];
  copy[0] = copy[6];
  copy[6] = temp;
  temp = copy[1];
  copy[1] = copy[7];
  copy[7] = temp;
  temp = copy[2];
  copy[2] = copy[8];
  copy[8] = temp;
  // rotate
  for (let i = 0; i < 4; i++) {
    // check
    if (checkEqual(gameState, boardToString(copy))) {
      return 4+i;
    }
    // rotate corners
    temp = copy[0];
    copy[0] = copy[6];
    copy[6] = copy[8];
    copy[8] = copy[2];
    copy[2] = temp;
    // rotate edges
    temp = copy[1];
    copy[1] = copy[3];
    copy[3] = copy[7];
    copy[7] = copy[5];
    copy[5] = temp;
  }

  return -1;
}

// convert board to string
function boardToString(board) {
  let output = "";

  for (let i = 0; i < 9; i++) {
    switch(board[i]) {
      case 0:
        output += '_';
        break;
      case 1:
        output += 'B';
        break;
      case 2:
        output += 'R';
        break;
      default:
        output += 'X';
    }
  }
}

// rotate beads
function rotateBeads(board, rot) {

}