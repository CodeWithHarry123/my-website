const bird = document.getElementById("bird");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const startScreen = document.getElementById("start-screen");
const pipeContainer = document.getElementById("pipe-container");

let birdTop = 200;
let gravity = 2.5;
let isGameOver = false;
let isGameStarted = false;
let score = 0;
let pipeSpeed = 2;

function startGame() {
  if (!isGameStarted) {
    isGameStarted = true;
    startScreen.classList.add("hidden");
    setInterval(gameLoop, 20);
    setInterval(createPipe, 2000);
  }
}

function flap() {
  if (!isGameOver && isGameStarted) {
    birdTop -= 50;
    bird.classList.add("flap");
    setTimeout(() => bird.classList.remove("flap"), 100);
  }
}

// Event listeners for spacebar and click
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!isGameStarted) startGame();
    flap();
  }
});
game.addEventListener("click", () => {
  if (!isGameStarted) startGame();
  flap();
});

function createPipe() {
  if (!isGameStarted || isGameOver) return;

  const pipeGap = 150;
  const minHeight = 50;
  const maxHeight = 350;
  const pipeTopHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
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
      // Increase difficulty
      if (score % 5 === 0) {
        pipeSpeed += 0.2;
        gravity += 0.1;
      }
    } else {
      pipeTop.style.left = left - pipeSpeed + "px";
      pipeBottom.style.left = left - pipeSpeed + "px";

      // Collision detection
      const birdRect = bird.getBoundingClientRect();
      const pipeTopRect = pipeTop.getBoundingClientRect();
      const pipeBottomRect = pipeBottom.getBoundingClientRect();
      const groundRect = document.getElementById("ground").getBoundingClientRect();

      if (
        birdRect.right > pipeTopRect.left &&
        birdRect.left < pipeTopRect.right &&
        (birdRect.top < pipeTopRect.bottom || birdRect.bottom > pipeBottomRect.top)
      ) {
        endGame();
      }

      // Ground collision
      if (birdRect.bottom > groundRect.top) {
        endGame();
      }
    }
  }, 20);
}

function endGame() {
  isGameOver = true;
  bird.classList.add("fall");
  alert(`Game Over! Your score: ${score}`);
  location.reload();
}

function gameLoop() {
  if (!isGameStarted || isGameOver) return;

  birdTop += gravity;
  if (birdTop < 0) birdTop = 0;
  bird.style.top = birdTop + "px";
}
