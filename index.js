"use strict";

const buttonElements = document.getElementsByClassName("btn");
const boardOverlay = document.getElementById("board-overlay");
const moves = document.getElementById("moves");
const overlay = document.getElementById("overlay");
const time = document.getElementById("time");
const pause = document.getElementById("pause");
const retry = document.getElementById("retry");
const saveProgressButton = document.getElementById("save");
const currentGameStatus = document.getElementById("current-game-status");
const boxMoving = document.getElementById("box-moving");
const resumeButton = document.getElementById("resume-btn");
const newGameButton = document.getElementById("new-game-btn");
const directions = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

let resumeAnswer = null;
let backendMoves = null;
let backendMinutes = null;
let backendBoard = null;
let backendSeconds = null;
let totalMoves = 0;
let totalSeconds = 0;
let totalMinutes = 0;
let flag = 0;
let board = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, null],
];
let emptyCellIndex = [3, 3];

/* ----------------------------------------------- FUNCTIONS -------------------------------------------------- */

// save to backend json
const saveProgress = async () => {
  const res = await fetch("http://localhost:3001/save-progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      sec: totalSeconds,
      min: totalMinutes,
      moves: totalMoves,
      board: board,
    }),
  });
};

// fetch from backend json
const fetchProgress = async () => {
  const res = await fetch("http://localhost:3001/get-saved-progress", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  backendMoves = data.moves;
  backendMinutes = data.min;
  backendSeconds = data.sec;
  backendBoard = data.board;
};

// timer
const updateClock = () => {
  if (flag === 1) {
    totalSeconds++;
    totalMinutes += parseInt(totalSeconds / 60);
    totalSeconds = totalSeconds % 60;
    time.innerHTML = `${totalMinutes > 9 ? "" : "0"}${totalMinutes}:${
      totalSeconds > 9 ? "" : "0"
    }${totalSeconds}`;
  }
};

// swap buttons
const swapButtons = (row, col, di, dj) => {
  if (row + di >= 4 || row + di < 0 || col + dj >= 4 || col + dj < 0) return;

  [board[row][col], board[row + di][col + dj]] = [
    board[row + di][col + dj],
    board[row][col],
  ];
};

// shuffle array
const shuffle = (num) => {
  for (let i = 0; i < num; i++) {
    const dir = Math.trunc(Math.random() * 4);
    const [di, dj] = directions[dir];
    const rawIdx = Math.trunc(Math.random() * 16);
    // random index generation
    const row = parseInt(rawIdx / 4);
    const col = rawIdx % 4;
    // swap
    swapButtons(row, col, di, dj);
  }
};

// initialize board
const initializeBoard = () => {
  for (let i = 0; i < buttonElements.length; i++) {
    buttonElements[i].classList.remove("empty");
    buttonElements[i].classList.remove("incorrect");
    buttonElements[i].classList.remove("correct");
    // set intial colors and inner HTML
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const buttonIndex = row * 4 + col;
        const value = board[row][col];

        buttonElements[buttonIndex].classList.remove("empty");
        buttonElements[buttonIndex].classList.remove("incorrect");
        buttonElements[buttonIndex].classList.remove("correct");

        if (value === null || value === "") {
          buttonElements[buttonIndex].innerHTML = "";
          buttonElements[buttonIndex].classList.add("empty");
        } else {
          buttonElements[buttonIndex].innerHTML = value;
          if (value !== buttonIndex + 1) {
            buttonElements[buttonIndex].classList.add("incorrect");
          } else {
            buttonElements[buttonIndex].classList.add("correct");
          }
        }
      }
    }
  }
};

// check greens
const checkGreens = (arr) => {
  let numGreen = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const value = board[row][col];
      const correctValue = row * 4 + col + 1;

      if (value && value === correctValue) {
        numGreen++;
      }
    }
  }

  if (numGreen === 15) {
    // 15 because the last tile should be empty
    flag = 0;
    boardOverlay.classList.remove("hide");
    currentGameStatus.innerHTML = "YOU WIN!!";
  }
};

// update the colors and moves
const update = (ind, btn1, btn2) => {
  totalMoves++;
  moves.innerHTML = totalMoves;
  localStorage.setItem("moves", totalMoves);
  btn1.classList.remove("empty", "correct", "incorrect");
  btn2.classList.remove("empty", "correct", "incorrect");
  if (ind === +btn1.innerHTML - 1) {
    btn1.classList.add("correct");
  } else {
    btn1.classList.add("incorrect");
  }

  btn2.classList.add("empty");
};

const swapInGame = (row, col, currButton, neighbour, dir) => {
  boxMoving.play();
  [board[row][col], board[row + dir[0]][col + dir[1]]] = [
    board[row + dir[0]][col + dir[1]],
    board[row][col],
  ];

  [currButton.innerHTML, neighbour.innerHTML] = [
    neighbour.innerHTML,
    currButton.innerHTML,
  ];
};

/* ----------------------------------------------- EVENT LISTNERS -------------------------------------------------- */

saveProgressButton.addEventListener("click", () => {
  saveProgress();
});

const buttonsEventListener = () => {
  for (let i = 0; i < buttonElements.length; i++) {
    buttonElements[i].addEventListener("click", () => {
      const row = Math.floor(i / 4);
      const col = i % 4;

      const currButton = buttonElements[i];

      let neighbour1 = row > 0 ? buttonElements[(row - 1) * 4 + col] : null; // top
      let neighbour2 = col < 3 ? buttonElements[row * 4 + col + 1] : null; // right
      let neighbour3 = row < 3 ? buttonElements[(row + 1) * 4 + col] : null; // bottom
      let neighbour4 = col > 0 ? buttonElements[row * 4 + col - 1] : null; // left

      // Swapping logic
      if (neighbour1 && neighbour1.innerHTML === "") {
        swapInGame(
          row,
          col,

          currButton,
          neighbour1,
          directions[1]
        );
        update((row - 1) * 4 + col, neighbour1, currButton);
      } else if (neighbour2 && neighbour2.innerHTML === "") {
        swapInGame(row, col, currButton, neighbour2, directions[2]);
        update(row * 4 + col + 1, neighbour2, currButton);
      } else if (neighbour3 && neighbour3.innerHTML === "") {
        swapInGame(row, col, currButton, neighbour3, directions[0]);
        update((row + 1) * 4 + col, neighbour3, currButton);
      } else if (neighbour4 && neighbour4.innerHTML === "") {
        swapInGame(row, col, currButton, neighbour4, directions[3]);
        update(row * 4 + col - 1, neighbour4, currButton);
      }

      checkGreens(board);
    });
  }
};

// retry
retry.addEventListener("click", () => {
  totalMinutes = 0;
  totalSeconds = 0;
  totalMoves = 0;
  flag = 0;
  boardOverlay.classList.remove("hide");
  time.innerHTML = "00:00";
  moves.innerHTML = totalMoves;
  startGame();
});

// resume game
boardOverlay.addEventListener("click", () => {
  flag = 1;
  boardOverlay.classList.add("hide");
});

// pause game
pause.addEventListener("click", () => {
  flag = 0;
  boardOverlay.classList.remove("hide");
  currentGameStatus.innerHTML = "Paused";
});

/* ------------------------------------------------------- START THE GAME ------------------------------------------------------------*/

async function startGame() {
  const res = await fetch("http://localhost:3001/check", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.ok) {
    resumeAnswer = window.confirm("Resume the game ?");
  }
  if (resumeAnswer) {
    await fetchProgress();
    totalMinutes = backendMinutes;
    totalMoves = backendMoves;
    totalSeconds = backendSeconds;
    board = backendBoard;
    moves.innerHTML = totalMoves;
    time.innerHTML = `${totalMinutes > 9 ? "" : "0"}${totalMinutes}:${
      totalSeconds > 9 ? "" : "0"
    }${totalSeconds}`;
  } else {
    totalSeconds = 0;
    totalMinutes = 0;
    totalMoves = 0;
    shuffle(100);
  }
  buttonsEventListener();
  initializeBoard();
}

setInterval(updateClock, 1000);
startGame();
