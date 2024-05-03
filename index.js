// elements
const gameContainer = document.getElementById("game-container");
const playerColor = document.getElementById("player-color");
const gameMessage = document.getElementById("game-message");
const startGameBlue = document.getElementById("start-game-blue");
const startGameRed = document.getElementById("start-game-red");
const gameScores = document.getElementById("game-scores");
const turnOff = document.getElementById("turn-off");

// arrays
const playerNames = ["Blue", "Red"];
const bigboard = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0: black, 1: blue, 2: red, 3: yellow(draw)
const positions = [0, 0, 0, 0, 0];
const rotations = [0, 0, 0, 0, 0];
const aichoices = [0, 0, 0, 0, 0];

// rotation arrays
const rot0 = [0, 1, 2, 
              3, 4, 5, 
              6, 7, 8];
const rot1 = [2, 5, 8, 
              1, 4, 7, 
              0, 3, 6];
const rot2 = [8, 7, 6, 
              5, 4, 3, 
              2, 1, 0];
const rot3 = [6, 3, 0, 
              7, 4, 1, 
              8, 5, 2];
const rot4 = [6, 7, 8, 
              3, 4, 5, 
              0, 1, 2];
const rot5 = [8, 5, 2, 
              7, 4, 1, 
              6, 3, 0];
const rot6 = [2, 1, 0, 
              5, 4, 3, 
              8, 7, 6];
const rot7 = [0, 3, 6, 
              1, 4, 7, 
              2, 5, 8];
const revrot = [rot0, rot1, rot2, rot3, rot4, rot5, rot6, rot7];

// other variables
var currentPlayer = 0; // 0: blue, 1: red;
var currentBigCell = -1; // -1: any, 0-8: specific
var turnNo = 0;
var gameOngoing = true;
var aiOn = false;
var aiPlayer = 0;
var MENACEWins = 0;
var MENACELosses = 0;
var MENACEDraws = 0;


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

        // update menace
        if (aiOn) {
          updateMENACE(bigWin);
        }
        break;
      case 3:
        // update game message
        gameMessage.innerHTML = "It's a draw!";
        gameOngoing = false;

        // update menace
        if (aiOn) {
          updateMENACE(bigWin);
        }
        break;
      default:
        // update game message
        gameMessage.innerHTML = playerNames[(currentPlayer + 1) % 2] + "'s turn!";
    }

    if (gameOngoing) {
      // switch players
      switchPlayer();

      if (aiOn && currentPlayer == aiPlayer) {
        aiTurn();
      }
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
  for (let i = 0; i < 5; i++) {
    positions[i] = 0;
    rotations[i] = 0;
    aichoices[i] = 0;
  }
  // enable startgame buttons based on ai state
  if (aiOn) {
    startGame(aiPlayer);
  }
  else {
    startGameBlue.disabled = false;
    startGameRed.disabled = false;
    turnOff.disabled = true;
  }
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
  aiPlayer = aiplayer;

  // disable startgame buttons
  startGameBlue.disabled = true;
  startGameRed.disabled = true;
  turnOff.disabled = false;

  // if aiplayer = 0: turn 0
  // if aiplayer = 1: turn 0 or 1
  if (aiplayer == 1 && turnNo == 0) {
    return;
  }

  aiTurn();
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

      // console log menace
      console.log(MENACE[turn][i]["stateName"]);

      copyBoard(MENACE[turn][i]["Beads"], beads);
      // rotate beads
      rotateBeads(beads, rot);
      // find available cell
      let cellNo = findAvailableCell(beads);

      // check if menace can still play
      if (cellNo == -1) {
        // update game message
        gameMessage.innerHTML = "MENACE cannot play. User wins the game!";
        gameOngoing = false;
      }
      else {
        aichoices[Math.floor(turnNo / 2)] = cellNo;
        let id = "cell-" + cellNo + "-0";
        let cell = document.getElementById(id);
      
        // click that cell
        clickBigCell(cell);
      }
      break;
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
  // console.log(boardState);
  copyBoard(boardState, copy);
  // console.log(copy);
  // console.log(boardToString(copy));

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
  // console.log("boardtostring: " + board);

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

  return output;
}

// compare string
function checkEqual(gameState, boardState) {
  for (let i = 0; i < 9; i++) {
    if (gameState.charAt(i) != boardState.charAt(i)) {
      return false;
    }
  }

  return true;
}

// rotate beads
function rotateBeads(board, rot) {
  let temp = 0;
  // rotations ccw
  for (let i = 0; i < rot % 4; i++) {
    // rotate corners
    temp = board[0];
    board[0] = board[2];
    board[2] = board[8];
    board[8] = board[6];
    board[6] = temp;
    // rotate edges
    temp = board[1];
    board[1] = board[5];
    board[5] = board[7];
    board[7] = board[3];
    board[3] = temp;
  }
  // reflections
  if (rot >= 4) {
    temp = board[0];
    board[0] = board[6];
    board[6] = temp;
    temp = board[1];
    board[1] = board[7];
    board[7] = temp;
    temp = board[2];
    board[2] = board[8];
    board[8] = temp;
  }
}

// reverse rotations
function reverseRotate(index, rot) {
  let newIndex = 0;

  newIndex = revrot[rot][index];

  return newIndex;
}

// find available cell based on beads
function findAvailableCell(beads) {
  let cellNo = -1;
  let sum = 0;

  // get total beads
  for (let i = 0; i < 9; i++) {
    sum += beads[i];
  }

  // get random number
  let random = Math.floor(Math.random() * sum) + 1;

  // check which cell it is
  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += beads[i];
    if (sum >= random) {
      cellNo = i;
      break;
    }
  }

  return cellNo;
}

// update MENACE
function updateMENACE(outcome) {
  let beadUpdate = 0;
  let turn = 0;
  let turnId = "";
  let index = 0;

  // consolelogs
  console.log("Positions: " + positions);
  console.log("Rotations: " + rotations);
  console.log("Choices: " + aichoices);

  if (outcome == 3) { // draw
    console.log("Draw Game between User and MENACE!");
    beadUpdate = 1;
    MENACEDraws++;
  }
  else if (outcome == aiPlayer + 1) { // win
    console.log("MENACE Wins!");
    beadUpdate = 3;
    MENACEWins++;
  }
  else { // lose
    console.log("User Wins!");
    beadUpdate = -1;
    MENACELosses++;
  }

  // update beads
  console.log("Final value of turnNo: " + turnNo); // turnNo is number of marks
  // [1, 3, 5, 7, 9] -> [0, 1, 2, 3, 4] aiplayer = 0 -> [0, 2, 4, 6, 8]
  // [2, 4, 6, 8, 0] -> [0, 1, 2, 3, 4] aiplayer = 1 -> [1, 3, 5, 7, 0]
  // go through each position
  for (let i = 0; i < Math.floor((turnNo - 1) / 2); i++) {
    turn = (2 * i) + aiPlayer;
    turnId = "turn" + turn;

    // convert choice and rotation to new index
    index = reverseRotate(aichoices[i], rotations[i]);

    // update beads
    MENACE[turnId][positions[i]]["Beads"][index] += beadUpdate;
    if (MENACE[turnId][positions[i]]["Beads"][index] < 0) {
      MENACE[turnId][positions[i]]["Beads"][index] = 0;
    }
  }

  // update h1
  gameScores.innerHTML = "MENACE's Current Score: " + MENACEWins + "-" + MENACELosses + "-" + MENACEDraws;
}

// turn of menace
function turnOffAI() {
  aiOn = false;
  boardReset();
}

// modal things
// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("save-state");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Get the <textarea> that holds the json file
var jsonholder = document.getElementById("json-holder");

// When the user clicks on the button, open the modal
btn.onclick = function() {
  turnOffAI();
  jsonholder.innerText = JSON.stringify(MENACE);
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}