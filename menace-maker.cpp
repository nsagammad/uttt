#include <iostream>
#include <vector>

using namespace std;

// classes
class gameState {
  string stateName;
  string rootName;
  int boardState[9];
};

// variables
vector<gameState> gameStates;

// prototypes
void addToMenace();
string boardToString(int board[9]);
void buildMenace();
int checkWin(int board[9]);
void rotations();

int main() {
  // build all possible boards
  buildMenace();
  // rotations
  rotations();
  // add beads to each empty cell
  // create json file

  return 0;
}

// adds the gameState to Menace
void addToMenace() {
  
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
  cout << "Test buildMenace" << endl;
}

// checks whether the board is a winning position
// 0: nothing, 1: blue, 2: red, 3: draw
int checkWin(int board[9]) {
  // rows and columns
  for (int i = 0; i < 3; i++) {
    // row
    if (board[3*i] != '_' && board[3*i] == board[(3*i)+1] && board[3*i] == board[(3*i)+2]) {
      return board[3*i];
    }

    // column
    if (board[i] != '_' && board[i] == board[i+3] && board[i] == board[i+6]) {
      return board[i];
    }
  }

  // diagonals
  if (board[0] != '_' && board[0] == board[4] && board[0] == board[8]) {
    return board[0];
  }
  if (board[2] != '_' && board[2] == board[4] && board[2] == board[6]) {
    return board[2];
  }

  // check for no change
  for (int i = 0; i < 9; i++) {
    if (board[i] == '_') {
      return 0;
    }
  }

  // draw
  return 3;
}

// goes through each rotation 
void rotations() {
  cout << "Test rotations" << endl;
}