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
let gravity = 1;
let velocity = 0;
let isGameOver = false;
let isGameStarted = false;
let isPaused = false;
let score = 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let pipeSpeed = 2;
let lastTime = 0;
let lastPipeTime = 0;
let pipes = [];
let lastFlapTime = 0;
const flapCooldown = 200; // Prevent rapid flapping (ms)

highScoreDisplay.innerText = `High Score: ${highScore}`;

function startGame() {
  if (!isGameStarted) {
    isGameStarted = true;
    isPaused = false;
    startScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }
}

function flap() {
  const now = Date.now();
  if (!isGameOver && isGameStarted && !isPaused && now - lastFlapTime > flapCooldown) {
    velocity = -10;
    bird.classList.add("flap");
    setTimeout(() => bird.classList.remove("flap"), 100);
    lastFlapTime = now;
  }
}

function pauseGame() {
  if (isGameStarted && !isGameOver) {
    isPaused = !isPaused;
    pauseScreen.classList.toggle("hidden");
    if (!isPaused) {
      lastTime = performance.now();
      requestAnimationFrame(gameLoop);
    }
  }
}

function createPipe(timestamp) {
  if (!isGameStarted || isGameOver || isPaused) return;
  if (timestamp - lastPipeTime < 2000) return;

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
  pipes.push({ top: pipeTop, bottom: pipeBottom, scored: false });

  lastPipeTime = timestamp;
}

function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
    game.appendChild(particle);
    setTimeout(() => particle.remove(), 500);
  }
}

function endGame() {
  isGameOver = true;
  bird.classList.add("fall");
  createParticles(120, birdTop + 15); // Relative to game container
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
  pipes = [];
  lastPipeTime = 0;
  scoreDisplay.innerText = "Score: 0";
  bird.classList.remove("fall");
  bird.style.top = birdTop + "px";
  pipeContainer.innerHTML = "";
  gameOverScreen.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
}

function gameLoop(timestamp) {
  if (!isGameStarted || isGameOver || isPaused) return;

  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // Update bird
  velocity += gravity * delta * 60;
  birdTop += velocity * delta * 60;
  if (birdTop < 0) {
    birdTop = 0;
    velocity = 0;
  }
  if (birdTop > 470) { // Ground collision (600 - 100 ground - 30 bird)
    endGame();
    return;
  }
  bird.style.top = birdTop + "px";

  // Create pipes
  createPipe(timestamp);

  // Update pipes
  pipes = pipes.filter((pipe) => {
    let left = parseInt(pipe.top.style.left);
    if (left < -60) {
      pipe.top.remove();
      pipe.bottom.remove();
      return false;
    }
    left -= pipeSpeed * delta * 60;
    pipe.top.style.left = left + "px";
    pipe.bottom.style.left = left + "px";

    // Collision detection (relative to game container)
    const birdX = 100;
    const birdY = birdTop;
    const birdWidth = 40;
    const birdHeight = 30;
    const pipeX = left;
    const pipeWidth = 60;
    const topPipeHeight = parseInt(pipe.top.style.height);
    const bottomPipeY = 600 - parseInt(pipe.bottom.style.height);

    if (
      birdX + birdWidth > pipeX &&
      birdX < pipeX + pipeWidth &&
      (birdY < topPipeHeight || birdY + birdHeight > bottomPipeY)
    ) {
      endGame();
      return false;
    }

    // Score when bird passes pipe
    if (!pipe.scored && pipeX + pipeWidth < birdX) {
      score++;
      scoreDisplay.innerText = `Score: ${score}`;
      if (score > highScore) {
        highScore = score;
        highScoreDisplay.innerText = `High Score: ${highScore}`;
        localStorage.setItem("highScore", highScore);
      }
      pipe.scored = true;
      if (score % 5 === 0) {
        pipeSpeed += 0.2;
        gravity += 0.1;
      }
    }

    return true;
  });

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
  
