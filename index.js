const board = document.getElementsByClassName("board");
const buttons = document.getElementsByClassName("btn");
const boardOverlay = document.getElementById("board-overlay");
const moves = document.getElementById("moves");
const time = document.getElementById("time");
const pause = document.getElementById("pause");
const retry = document.getElementById("retry");
const currentGameStatus = document.getElementById("current-game-status");
const boxMoving = document.getElementById("box-moving");

let movesLocalStorage = localStorage.getItem("moves");
let secondsLocalStorage = localStorage.getItem("seconds");
let minutesLocalStorage = localStorage.getItem("minutes");
let flagLocalStorage = localStorage.getItem("flag");
let resumeAnswer = null;
let boardArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null];

let totalMoves = movesLocalStorage !== null ? +movesLocalStorage : 0;
let totalSeconds = secondsLocalStorage !== null ? +secondsLocalStorage : 0;
let totalMinutes = minutesLocalStorage !== null ? +minutesLocalStorage : 0;
let flag = flagLocalStorage !== null ? +flagLocalStorage : 0;

if (
  movesLocalStorage ||
  secondsLocalStorage ||
  minutesLocalStorage ||
  flagLocalStorage
) {
  resumeAnswer = window.confirm("Resume the game ?");
  if (resumeAnswer) {
    moves.innerHTML = totalMoves;
  } else {
    localStorage.clear();
    totalSeconds = 0;
    totalMinutes = 0;
  }
}
/* ----------------------------------------------- EVENT LISTNERS -------------------------------------------------- */

const buttonsEventListener = () => {
  const storedBoard = JSON.parse(localStorage.getItem("currArr"));
  console.log(storedBoard);
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", () => {
      boxMoving.play();
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
        [storedBoard[i], storedBoard[i + 4]] = [
          storedBoard[i + 4],
          storedBoard[i],
        ];
        [currButton.innerHTML, neighbour1.innerHTML] = [
          neighbour1.innerHTML,
          currButton.innerHTML,
        ];
        update(i + 4, neighbour1, currButton);
      } else if (neighbour2 && neighbour2.innerHTML === "") {
        [storedBoard[i], storedBoard[i - 4]] = [
          storedBoard[i - 4],
          storedBoard[i],
        ];
        [currButton.innerHTML, neighbour2.innerHTML] = [
          neighbour2.innerHTML,
          currButton.innerHTML,
        ];
        update(i - 4, neighbour2, currButton);
      } else if (neighbour3 && neighbour3.innerHTML === "") {
        [storedBoard[i], storedBoard[i + 1]] = [
          storedBoard[i + 1],
          storedBoard[i],
        ];
        [currButton.innerHTML, neighbour3.innerHTML] = [
          neighbour3.innerHTML,
          currButton.innerHTML,
        ];
        update(i + 1, neighbour3, currButton);
      } else if (neighbour4 && neighbour4.innerHTML === "") {
        [storedBoard[i], storedBoard[i - 1]] = [
          storedBoard[i - 1],
          storedBoard[i],
        ];
        [currButton.innerHTML, neighbour4.innerHTML] = [
          neighbour4.innerHTML,
          currButton.innerHTML,
        ];
        update(i - 1, neighbour4, currButton);
      }
      console.log("updated =>", storedBoard);
      localStorage.setItem("currArr", JSON.stringify(storedBoard));
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
  localStorage.clear();
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

/* ----------------------------------------------- FUNCTIONS -------------------------------------------------- */

// timer
const updateClock = () => {
  if (flag === 1) {
    totalSeconds++;
    totalMinutes += parseInt(totalSeconds / 60);
    totalSeconds = totalSeconds % 60;
    time.innerHTML = `${totalMinutes > 9 ? "" : "0"}${totalMinutes}:${
      totalSeconds > 9 ? "" : "0"
    }${totalSeconds}`;
    localStorage.setItem("seconds", totalSeconds.toString());
    localStorage.setItem("minutes", totalMinutes.toString());
  }
};

// shuffle array
const shuffle = () => {
  console.log(localStorage.getItem("currArr"));
  if (resumeAnswer) {
    boardArr = JSON.parse(localStorage.getItem("currArr"));

    console.log("retrieved", boardArr);
    return;
  }
  let currIdx = boardArr.length;
  while (currIdx != 0) {
    const randomIdx = Math.floor(Math.random() * currIdx);
    currIdx--;

    [boardArr[currIdx], boardArr[randomIdx]] = [
      boardArr[randomIdx],
      boardArr[currIdx],
    ];
  }
  localStorage.setItem("currArr", JSON.stringify(boardArr));
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
        buttons[i].classList.add("incorrect");
        buttons[i].classList.add("correct");
      }
    }
  }
};

// update the colors and moves
const update = (ind, b1, b2) => {
  totalMoves++;
  moves.innerHTML = totalMoves;
  localStorage.setItem("moves", totalMoves);
  b1.classList.remove("empty");
  b1.classList.remove("correct");
  b1.classList.remove("incorrect");
  b2.classList.remove("empty");
  b2.classList.remove("correct");
  b2.classList.remove("incorrect");
  console.log(ind, b1.innerHTML, b2.innerHTML);
  if (ind === +b1.innerHTML - 1) {
    b1.classList.add("correct");
  } else {
    b1.classList.add("incorrect");
  }
  b2.classList.remove("incorrect");
  b2.classList.add("empty");
};

/* ------------------------------------------------------- START THE GAME ------------------------------------------------------------*/

function startGame() {
  shuffle();
  buttonsEventListener();
  initializeBoard();
}

setInterval(updateClock, 1000);
startGame();
