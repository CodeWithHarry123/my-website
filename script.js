const bird = document.getElementById("bird");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");

let birdTop = 200;
let gravity = 2;
let isGameOver = false;
let score = 0;

document.addEventListener("keydown", () => {
  if (!isGameOver) birdTop -= 40;
});

function createPipe() {
  const pipeContainer = document.getElementById("pipe-container");
  const pipeGap = 150;
  const pipeTopHeight = Math.floor(Math.random() * 250) + 50;
  const pipeBottomHeight = 600 - pipeTopHeight - pipeGap;

  const pipeTop = document.createElement("div");
  pipeTop.classList.add("pipe", "top");
  pipeTop.style.height = pipeTopHeight + "px";
  pipeTop.style.left = "400px";

  const pipeBottom = document.createElement("div");
  pipeBottom.classList.add("pipe", "bottom");
  pipeBottom.style.height = pipeBottomHeight + "px";
  pipeBottom.style.left = "400px";

  pipeContainer.appendChild(pipeTop);
  pipeContainer.appendChild(pipeBottom);

  let move = setInterval(() => {
    if (isGameOver) {
      clearInterval(move);
      return;
    }

    let left = parseInt(pipeTop.style.left);
    if (left < -60) {
      pipeContainer.removeChild(pipeTop);
      pipeContainer.removeChild(pipeBottom);
      clearInterval(move);
      score++;
      scoreDisplay.innerText = `Score: ${score}`;
    } else {
      pipeTop.style.left = left - 2 + "px";
      pipeBottom.style.left = left - 2 + "px";

      // Collision
      const birdRect = bird.getBoundingClientRect();
      const pipeTopRect = pipeTop.getBoundingClientRect();
      const pipeBottomRect = pipeBottom.getBoundingClientRect();

      if (
        birdRect.right > pipeTopRect.left &&
        birdRect.left < pipeTopRect.right &&
        (birdRect.top < pipeTopRect.bottom ||
         birdRect.bottom > pipeBottomRect.top)
      ) {
        endGame();
      }
    }
  }, 20);
}

function endGame() {
  isGameOver = true;
  alert("Game Over! Your score: " + score);
  location.reload();
}

function gameLoop() {
  if (isGameOver) return;
  birdTop += gravity;
  if (birdTop > 560) {
    endGame();
    return;
  }
  bird.style.top = birdTop + "px";
}

setInterval(gameLoop, 20);
setInterval(createPipe, 2000);
