const board = document.getElementsByClassName("board");
const buttons = document.getElementsByClassName("btn");
const boardOverlay = document.getElementById("board-overlay");
const moves = document.getElementById("moves");
const time = document.getElementById("time");
let totalMoves = 0;
let totalSeconds = 0;
let totalMinutes = 0;
let flag = 0;

// start the game
boardOverlay.addEventListener("click", () => {
  flag = 1;
  boardOverlay.classList.add("hide");
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

setInterval(updateClock, 1000);

// shuffle array
const shuffle = (arr) => {
  let currIdx = arr.length;
  while (currIdx != 0) {
    const randomIdx = Math.floor(Math.random() * currIdx);
    currIdx--;

    [arr[currIdx], arr[randomIdx]] = [arr[randomIdx], arr[currIdx]];
  }
  return arr;
};

const update = (ind, b1, b2) => {
  totalMoves++;
  moves.innerHTML = totalMoves;
  b1.classList.remove("empty");
  b1.classList.remove("correct");
  b1.classList.remove("incorrect");
  b2.classList.remove("empty");
  b2.classList.remove("correct");
  b2.classList.remove("incorrect");
  console.log(ind, b1.innerHTML, b2.innerHTML);
  if (ind === +b1.innerHTML - 1) {
    console.log("asdhg");
    b1.classList.add("correct");
  } else {
    b1.classList.add("incorrect");
  }
  b2.classList.remove("incorrect");
  b2.classList.add("empty");
};

// fill the initial grid

const newArr = shuffle([
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  null,
]);
for (let i = 0; i < buttons.length; i++) {
  // set intial colors and inner HTML
  if (newArr[i] === null) {
    buttons[i].innerHTML = "";
    buttons[i].classList.add("empty");
  } else {
    buttons[i].innerHTML = newArr[i];
    if (i + 1 !== +buttons[i].innerHTML) {
      buttons[i].classList.add("incorrect");
    } else {
      buttons[i].classList.add("incorrect");
      console.log("jyagd");
      buttons[i].classList.add("correct");
    }
  }

  // event listener for the buttons
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
      [currButton.innerHTML, neighbour1.innerHTML] = [
        neighbour1.innerHTML,
        currButton.innerHTML,
      ];
      update(i + 4, neighbour1, currButton);
    } else if (neighbour2 && neighbour2.innerHTML === "") {
      [currButton.innerHTML, neighbour2.innerHTML] = [
        neighbour2.innerHTML,
        currButton.innerHTML,
      ];
      update(i - 4, neighbour2, currButton);
    } else if (neighbour3 && neighbour3.innerHTML === "") {
      [currButton.innerHTML, neighbour3.innerHTML] = [
        neighbour3.innerHTML,
        currButton.innerHTML,
      ];
      update(i + 1, neighbour3, currButton);
    } else if (neighbour4 && neighbour4.innerHTML === "") {
      [currButton.innerHTML, neighbour4.innerHTML] = [
        neighbour4.innerHTML,
        currButton.innerHTML,
      ];
      update(i - 1, neighbour4, currButton);
    }
  });
}
