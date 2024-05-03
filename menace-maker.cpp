#include <iostream>
#include <fstream>
#include <vector>

using namespace std;

// prototypes
string boardToString(int board[9]);
void buildMenace();
void buildTextFile();
bool checkRotations(int board[9]);
int checkWin(int board[9]);
void copyBoard(int src[9], int dest[9]);
void fillBeads(int board[9], int beads[9]);
bool findBoard(int startidx, int endidx, string search);

// classes
class gameState {
  public:
    string stateName; // string of board state. used for identifying and also comparing states
    int boardState[9]; // integers representing board state
    int beads[9]; // number of beads in each cell

    gameState(int board[9]) {
      stateName = boardToString(board);
      copyBoard(board, boardState);
      fillBeads(boardState, beads);
    }
};

// variables
vector<gameState> gameStates;
int boardState[9] = {0, 0, 0, 0, 0, 0, 0, 0, 0};
const int MAXBEADS = 3;
int startIndex[10] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int turnNo = 0;
int counter = 0;
int endCounter = 0;
gameState rootState = gameState(boardState);
gameState newState = gameState(boardState);

int main() {
  // build all possible boards
  buildMenace();

  // create text file in json format
  buildTextFile();

  return 0;
}

// converts the board state to stringname
string boardToString(int board[9]) {
  string output = "";

  for (int i = 0; i < 9; i++) {
    switch(board[i]) {
      case 0: // nothing
        output += "_";
        break;
      case 1: // blue
        output += "B";
        break;
      case 2: // red
        output += "R";
        break;
    }
  }

  return output;
}

// builds all possible boards
void buildMenace() {
  cout << "Building MENACE" << endl;

  // turn 0: 0 marks on board
  cout << "Turn 0" << endl;
  // add new gamestate
  newState = gameState(boardState);
  gameStates.push_back(newState);
  // update counter
  counter++;
  cout << "States: " << counter - startIndex[0] << endl;

  // rest of the turns
  for (int i = 1; i < 9; i++) {
    // update turnNo and startIndex
    startIndex[i] = counter;
    turnNo = i;
    cout << "Turn " << turnNo << endl;

    // get each gameState from the previous turn
    for (int j = startIndex[i - 1]; j < startIndex[i]; j++) {
      // get gameState
      rootState = gameStates[j];

      // copy boardstate
      copyBoard(rootState.boardState, boardState);
      // check if endgame condition. if so, continue to next. only matters when there are at least 5 marks.
      if (i >= 5 && checkWin(boardState) != 0) {
        continue;
      }

      // add to each empty cell to make a potential new boardstate
      for (int k = 0; k < 9; k++) {
        if (boardState[k] == 0) {
          // add to cell. 1: blue, 2: red -> odd turnNo: blue, even turnNo: red
          boardState[k] = ((i + 1) % 2) + 1;

          // check if new, including rotations. if new, add gamestate
          if (!checkRotations(boardState)) {
            // check if endgame condition. if so, continue to next. only matters when there are at least 5 marks.
            if (i >= 5 && checkWin(boardState) != 0) {
              // cout << boardToString(boardState) << endl;
              boardState[k] = 0;
              // endCounter++;
              continue;
            }

            newState = gameState(boardState);
            gameStates.push_back(newState);
            counter++;
          }

          // remove from cell
          boardState[k] = 0;
        }
      }
    }

    // output
    cout << "States: " << counter - startIndex[i] << endl;
  }
  startIndex[9] = counter;
  // cout << "Endgame positions: " << endCounter << endl;
}

// build text file
void buildTextFile() {
  ofstream textFile("MENACE.txt");
  // opening bracket
  textFile << "{\n";

  // go through each turn
  for (int i = 0; i < 9; i++) {
    textFile << "\"turn" << i << "\" : [\n";
    // go through each state
    for (int j = startIndex[i]; j < startIndex[i + 1]; j++) {
      textFile << "{\n";

      // stateName
      textFile << "\"stateName\" : \"" << gameStates[j].stateName << "\",\n";

      // beads
      textFile << "\"Beads\" : [";
      for (int k = 0; k < 9; k++) {
        textFile << gameStates[j].beads[k];
        if (k < 8) {
          textFile << ",";
        }
      }
      textFile << "]\n";

      textFile << "}";
      if (j < startIndex[i + 1] - 1) {
        textFile << ",";
      }
      textFile << "\n";
    }
    textFile << "],\n";
  }

  // list down numbers of states in each turn
  textFile << "\"states\" : [\n";
  for (int i = 0; i < 9; i++) {
    textFile << startIndex[i + 1] - startIndex[i];
    if (i != 8) {
      textFile << ",";
    }
    textFile << "\n";
  }
  textFile << "]\n";

  // closing bracket
  textFile << "}";

  // close file
  textFile.close();

  cout << "MENACE has been built." << endl;
}

// does all rotations
bool checkRotations(int board[9]) {
  int copyboard[9];
  bool found = false;
  int temp = 0;

  // copy board over
  copyBoard(board, copyboard);

  // 0-3: rotations
  for (int i = 0; i < 4; i++) {
    // check
    if (findBoard(startIndex[turnNo], counter, boardToString(board))) {
      copyBoard(copyboard, board);
      return true;
    }
    // rotate corners
    temp = board[0];
    board[0] = board[6];
    board[6] = board[8];
    board[8] = board[2];
    board[2] = temp;
    // rotate edges
    temp = board[1];
    board[1] = board[3];
    board[3] = board[7];
    board[7] = board[5];
    board[5] = temp;
  }

  // 4-7: reflect, then rotate
  // reflect corners and edges
  temp = board[0];
  board[0] = board[6];
  board[6] = temp;
  temp = board[1];
  board[1] = board[7];
  board[7] = temp;
  temp = board[2];
  board[2] = board[8];
  board[8] = temp;
  // rotate
  for (int i = 0; i < 4; i++) {
    // check
    if (findBoard(startIndex[turnNo], counter, boardToString(board))) {
      copyBoard(copyboard, board);
      return true;
    }
    // rotate corners
    temp = board[0];
    board[0] = board[6];
    board[6] = board[8];
    board[8] = board[2];
    board[2] = temp;
    // rotate edges
    temp = board[1];
    board[1] = board[3];
    board[3] = board[7];
    board[7] = board[5];
    board[5] = temp;
  }

  // copy back
  copyBoard(copyboard, board);

  return found;
}

// checks whether the board is a winning position
// 0: nothing, 1: blue, 2: red, 3: draw
int checkWin(int board[9]) {
  // rows and columns
  for (int i = 0; i < 3; i++) {
    // row
    if (board[3*i] != 0 && board[3*i] == board[(3*i)+1] && board[3*i] == board[(3*i)+2]) {
      return board[3*i];
    }

    // column
    if (board[i] != 0 && board[i] == board[i+3] && board[i] == board[i+6]) {
      return board[i];
    }
  }

  // diagonals
  if (board[0] != 0 && board[0] == board[4] && board[0] == board[8]) {
    return board[0];
  }
  if (board[2] != 0 && board[2] == board[4] && board[2] == board[6]) {
    return board[2];
  }

  // check for no change
  for (int i = 0; i < 9; i++) {
    if (board[i] == 0) {
      return 0;
    }
  }

  // draw
  return 3;
}

// copy over board
void copyBoard(int src[9], int dest[9]) {
  for (int i = 0; i < 9; i++) {
    dest[i] = src[i];
  }
}

// fill the board with beads
void fillBeads(int board[9], int beads[9]) {
  for (int i = 0; i < 9; i++) {
    if (board[i] == 0) {
      beads[i] = MAXBEADS;
    }
    else {
      beads[i] = 0;
    }
  }
}

// check whether a board exists in MENACE
bool findBoard(int startidx, int endidx, string search) {
  bool found = false;

  for (int i = startidx; i <= endidx; i++) {
    if (gameStates[i].stateName == search) {
      found = true;
      break;
    }
  }

  return found;
}