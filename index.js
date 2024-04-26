// elements
gameContainer = document.getElementById("game-container");
playerColor = document.getElementById("player-color");
gameMessage = document.getElementById("game-message");

// arrays
const playerNames = ["Blue", "Red"];
const bigboard = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0: black, 1: blue, 2: red, 3: yellow(draw)
const smallboard0 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const smallboard1 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const smallboard2 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const smallboard3 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const smallboard4 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const smallboard5 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const smallboard6 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const smallboard7 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const smallboard8 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const smallboards = [smallboard0, smallboard1, smallboard2, smallboard3, smallboard4, smallboard5, smallboard6, smallboard7, smallboard8];

// other variables
var currentPlayer = 0; // 0: blue, 1: red;
var currentBigCell = -1; // -1: any, 0-8: specific
var gameOngoing = true;

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

// click cell
function clickCell(cell) {
  // get indices
  let big = cell.id.substring(5,6);
  let small = cell.id.substring(7,8);

  console.log("Clicked on (" + big + ", " + small + ").");

  // check if valid move
  if (checkValid(big, small)) {
    // change value of smallboards[big][small]
    smallboards[big][small] = currentPlayer + 1;
    console.log(smallboards[big]);

    // change background color of smallest cell
    changeColor(cell, currentPlayer);

    // change background color of big cell to black
    let bigcellid = "bigcell-" + big;
    let bigcell = document.getElementById(bigcellid);
    changeColor(bigcell, 4);
    
    // check win in small board
    let smallWin = checkWin(smallboards[big]);
    console.log(smallWin);
    switch(smallWin) {
      case 1:
      case 2:
        // update game message
        gameMessage.innerHTML = playerNames[currentPlayer] + " wins Cell " + big + "! " + playerNames[(currentPlayer + 1) % 2] + "'s turn!";

        // update bigboard
        bigboard[big] = currentPlayer + 1;

        // change color of cell
        let bigcellwinid = "bigcell-" + big;
        let bigcellwin = document.getElementById(bigcellwinid);
        changeColor(bigcellwin, currentPlayer);

        // check win in big board
        let bigWin = checkWin(bigboard);
        switch(bigWin) {
          case 1:
          case 2:
            // update game message
            gameMessage.innerHTML = playerNames[currentPlayer] + " wins the game!";
            break;
          case 3:
            // update game message
            gameMessage.innerHTML = "It's a draw!";
            break;
        }
        break;
      case 3:
        // update bigboard
        bigboard[big] = 3;

        // change color of cell
        let bigcelldrawid = "bigcell-" + big;
        let bigcelldraw = document.getElementById(bigcelldrawid);
        changeColor(bigcelldraw, 2);

        // check win in big board
        let bigDraw = checkWin(bigboard);
        if (bigDraw == 3) {
          // update game message
          gameMessage.innerHTML = "It's a draw!";
        }
        break;
      default:
        // update game message
        gameMessage.innerHTML = playerNames[(currentPlayer + 1) % 2] + "'s turn!";
    }

    // pick new big cell
    if (bigboard[small] == 0) {
      currentBigCell = small;

      bigcellid = "bigcell-" + small;
      bigcell = document.getElementById(bigcellid);
      changeColor(bigcell, 3);
    }
    else {
      currentBigCell = -1;
    }
    console.log("Current big cell: " + currentBigCell);

    // switch players
    switchPlayer();
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
      changeColor(cell, 100);
    }
  }

  // return player to blue
  currentPlayer = 0;
  gameContainer.style.backgroundColor = "blue";
  playerColor.style.backgroundColor = "blue";
  playerColor.innerHTML = "Blue";
  gameMessage.innerHTML = "Blue's turn!";

  // reset game
  gameOngoing = true;
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

  // occupied small cell
  if (smallboards[big][small] != 0) {
    return false;
  }

  return true;
}

// check win
// return values: 0: blue, 1: red, 2: nothing , 3: draw
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
