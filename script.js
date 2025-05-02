const bird = document.getElementById("bird");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const pauseScreen = document.getElementById("pause-screen");
const finalScoreDisplay = document.getElementById("final-score");
const retryBtn = document.getElementById("retry-btn");
const menuBtn = document.getElementById("menu-btn");
const pipeContainer = document.getElementById("pipe-container");

let birdTop = 200;
let gravity = 2.5;
let velocity = 0;
let isGameOver = false;
let isGameStarted = false;
let isPaused = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let pipeSpeed = 2;
let lastTime = 0;

highScoreDisplay.innerText = `High Score: ${highScore}`;

function startGame() {
  if (!isGameStarted) {
    isGameStarted = true;
    startScreen.classList.add("hidden");
    requestAnimationFrame(gameLoop);
  }
}

function flap() {
  if (!isGameOver && isGameStarted && !isPaused) {
    velocity = -10;
    bird.classList.add("flap");
    setTimeout(() => bird.classList.remove("flap"), 100);
  }
}

function pauseGame() {
  if (isGameStarted && !isGameOver) {
    isPaused = !isPaused;
    pauseScreen.classList.toggle("hidden");
    if (!isPaused) {
      requestAnimationFrame(gameLoop);
    }
  }
}

function createPipe() {
  if (!isGameStarted || isGameOver || isPaused) return;

  const pipeGap = 150;
  const minHeight = 50;
  const maxHeight = 350;
  const pipeTopHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
  const pipeBottomHeight = 600 - pipeTopHeight - pipeGap;

  const pipeTop = document.createElement("div");
  pipeTop.classList.add("pipe", "top");
  pipeTop.style.height = pipeTopHeight + "px";
  pipeTop.style.left = "400px";
  pipeTop.style.filter = `hue-rotate(${Math.random() * 360}deg)`;

  const pipeBottom = document.createElement("div");
  pipeBottom.classList.add("pipe", "bottom");
  pipeBottom.style.height = pipeBottomHeight + "px";
  pipeBottom.style.left = "400px";
  pipeBottom.style.filter = pipeTop.style.filter;

  pipeContainer.appendChild(pipeTop);
  pipeContainer.appendChild(pipeBottom);

  let move = setInterval(() => {
    if (isGameOver || isPaused) {
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
      if (score > highScore) {
        highScore = score;
        highScoreDisplay.innerText = `High Score: ${highScore}`;
        localStorage.setItem("highScore", highScore);
      }
      if (score % 5 === 0) {
        pipeSpeed += 0.2;
        gravity += 0.1;
      }
    } else {
      pipeTop.style.left = left - pipeSpeed + "px";
      pipeBottom.style.left = left - pipeSpeed + "px";

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

      if (birdRect.bottom > groundRect.top || birdRect.top < 0) {
        endGame();
      }
    }
  }, 20);
}

function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
    game.appendChild(particle);
    setTimeout(() => game.removeChild(particle), 500);
  }
}

function endGame() {
  isGameOver = true;
  bird.classList.add("fall");
  const birdRect = bird.getBoundingClientRect();
  createParticles(birdRect.left + 20, birdRect.top + 15);
  finalScoreDisplay.innerText = `Score: ${score}`;
  gameOverScreen.classList.remove("hidden");
}

function resetGame() {
  score = 0;
  birdTop = 200;
  velocity = 0;
  isGameOver = false;
  isGameStarted = false;
  isPaused = false;
  pipeSpeed = 2;
  gravity = 2.5;
  scoreDisplay.innerText = "Score: 0";
  bird.classList.remove("fall");
  bird.style.top = birdTop + "px";
  pipeContainer.innerHTML = "";
  gameOverScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
}

function gameLoop(timestamp) {
  if (!isGameStarted || isGameOver || isPaused) return;

  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  velocity += gravity * delta * 60;
  birdTop += velocity * delta * 60;
  bird.style.top = birdTop + "px";

  requestAnimationFrame(gameLoop);
}

// Event Listeners
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!isGameStarted) startGame();
    else if (isPaused) pauseGame();
    else flap();
  }
  if (e.code === "KeyP") pauseGame();
});

game.addEventListener("click", () => {
  if (!isGameStarted) startGame();
  else if (isPaused) pauseGame();
  else flap();
});

game.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (!isGameStarted) startGame();
  else if (isPaused) pauseGame();
  else flap();
});

retryBtn.addEventListener("click", resetGame);
menuBtn.addEventListener("click", resetGame);

// Start pipe creation
setInterval(createPipe, 2000);
lastTime = performance.now();
