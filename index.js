"use strict";

const buttons = document.getElementsByClassName("btn");
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

let resumeAnswer = null;
let backendMoves = null;
let backendMinutes = null;
let backendBoard = null;
let backendSeconds = null;
let totalMoves = 0;
let totalSeconds = 0;
let totalMinutes = 0;
let flag = 0;
let boardArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, null, 15];

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
      board: boardArr,
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

saveProgressButton.addEventListener("click", () => {
  saveProgress();
});

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

// shuffle array
const shuffle = () => {
  let currIdx = boardArr.length;
  while (currIdx != 0) {
    const randomIdx = Math.floor(Math.random() * currIdx);
    currIdx--;

    [boardArr[currIdx], boardArr[randomIdx]] = [
      boardArr[randomIdx],
      boardArr[currIdx],
    ];
  }
};

// initialize board
const initializeBoard = () => {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("empty");
    buttons[i].classList.remove("incorrect");
    buttons[i].classList.remove("correct");

    // set intial colors and inner HTML
    if (boardArr[i] === null || boardArr[i] === "") {
      buttons[i].innerHTML = "";
      buttons[i].classList.add("empty");
    } else {
      buttons[i].innerHTML = boardArr[i];
      if (i + 1 !== +buttons[i].innerHTML) {
        buttons[i].classList.add("incorrect");
      } else {
        buttons[i].classList.add("correct");
      }
    }
  }
};

// check greens
const checkGreens = (arr) => {
  let numGreen = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] && arr[i] === i + 1) {
      numGreen++;
    }
  }
  if (numGreen === 15) {
    flag = 0;
    boardOverlay.classList.remove("hide");
    currentGameStatus.innerHTML = "YOU WIN!!";
  }
};

// update the colors and moves
const update = (ind, b1, b2) => {
  totalMoves++;
  moves.innerHTML = totalMoves;
  localStorage.setItem("moves", totalMoves);
  b1.classList.remove("empty", "correct", "incorrect");
  b2.classList.remove("empty", "correct", "incorrect");
  if (ind === +b1.innerHTML - 1) {
    b1.classList.add("correct");
  } else {
    b1.classList.add("incorrect");
  }

  b2.classList.add("empty");
};

/* ----------------------------------------------- EVENT LISTNERS -------------------------------------------------- */

const buttonsEventListener = () => {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", () => {
      // current button
      const currButton = buttons[i];

      // current button neighbours
      let neighbour1 = i + 4 < 16 ? buttons[i + 4] : null;
      let neighbour2 = i - 4 >= 0 ? buttons[i - 4] : null;
      let neighbour3 = i + 1 < 16 ? buttons[i + 1] : null;
      let neighbour4 = i - 1 >= 0 ? buttons[i - 1] : null;

      // check for edge cases
      if ((i + 1) % 4 === 0) {
        neighbour3 = null;
      }
      if (i % 4 === 0) {
        neighbour4 = null;
      }

      // swapping the buttons inner HTML logic
      if (neighbour1 && neighbour1.innerHTML === "") {
        boxMoving.play();
        [boardArr[i], boardArr[i + 4]] = [boardArr[i + 4], boardArr[i]];
        [currButton.innerHTML, neighbour1.innerHTML] = [
          neighbour1.innerHTML,
          currButton.innerHTML,
        ];
        update(i + 4, neighbour1, currButton);
      } else if (neighbour2 && neighbour2.innerHTML === "") {
        boxMoving.play();
        [boardArr[i], boardArr[i - 4]] = [boardArr[i - 4], boardArr[i]];
        [currButton.innerHTML, neighbour2.innerHTML] = [
          neighbour2.innerHTML,
          currButton.innerHTML,
        ];
        update(i - 4, neighbour2, currButton);
      } else if (neighbour3 && neighbour3.innerHTML === "") {
        boxMoving.play();
        [boardArr[i], boardArr[i + 1]] = [boardArr[i + 1], boardArr[i]];
        [currButton.innerHTML, neighbour3.innerHTML] = [
          neighbour3.innerHTML,
          currButton.innerHTML,
        ];
        update(i + 1, neighbour3, currButton);
      } else if (neighbour4 && neighbour4.innerHTML === "") {
        boxMoving.play();
        [boardArr[i], boardArr[i - 1]] = [boardArr[i - 1], boardArr[i]];
        [currButton.innerHTML, neighbour4.innerHTML] = [
          neighbour4.innerHTML,
          currButton.innerHTML,
        ];
        update(i - 1, neighbour4, currButton);
      }
      checkGreens(boardArr);
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
    boardArr = backendBoard;
    moves.innerHTML = totalMoves;
    time.innerHTML = `${totalMinutes > 9 ? "" : "0"}${totalMinutes}:${
      totalSeconds > 9 ? "" : "0"
    }${totalSeconds}`;
  } else {
    totalSeconds = 0;
    totalMinutes = 0;
    totalMoves = 0;
    shuffle();
  }
  buttonsEventListener();
  initializeBoard();
}

setInterval(updateClock, 1000);
startGame();
