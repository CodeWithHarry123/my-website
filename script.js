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
let gravity = 0.5;
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
const flapCooldown = 150;
let outCount = 0; // Track number of times player dies

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
    velocity = -7;
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

  const pipeGap = 200; // Kept at 200 for easier gameplay
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
  createParticles(120, birdTop + 15);
  finalScoreDisplay.innerText = `Score: ${score}`;
  outCount++;
  console.log(`Game Over: Score=${score}, birdTop=${birdTop}, outCount=${outCount}`);
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
  gravity = 0.5;
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
  velocity += gravity * delta * 20;
  birdTop += velocity * delta * 20;
  if (birdTop < 0) {
    birdTop = 0;
    velocity = 0;
  }
  if (birdTop > 570) { // Adjusted for canvas height (600px) minus bird height (~30px)
    console.log("Game Over: Bird hit ground, birdTop=", birdTop);
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

    // Collision detection
    const birdX = 100;
    const birdY = birdTop;
    const birdWidth = 34;
    const birdHeight = 24;
    const pipeX = left;
    const pipeWidth = 60;
    const topPipeHeight = parseInt(pipe.top.style.height) || 0;
    const bottomPipeY = topPipeHeight + 200; // Use pipeGap = 200 directly

    const collisionBuffer = 8; // Increased buffer for more forgiving collisions
    const verticalBuffer = 10; // Added vertical leniency for pipe edges

    if (
      birdX + birdWidth > pipeX - collisionBuffer &&
      birdX < pipeX + pipeWidth + collisionBuffer &&
      (birdY < topPipeHeight - verticalBuffer || birdY + birdHeight > bottomPipeY + verticalBuffer)
    ) {
      console.log(
        `Game Over: Collision with pipe\nBird Position: birdX=${birdX}, birdY=${birdY}, birdWidth=${birdWidth}, birdHeight=${birdHeight}\nPipe Position: pipeX=${pipeX}, topPipeHeight=${topPipeHeight}, bottomPipeY=${bottomPipeY}`
      );
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
        gravity += 0.05;
      }
    }

    return true;
  });

  requestAnimationFrame(gameLoop);
}

// Event Listeners
function handleInput(e) {
  e.preventDefault();
  if (!isGameStarted) startGame();
  else if (isPaused) pauseGame();
  else flap();
}

// Desktop and Mobile: Game and screen interactions
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") handleInput(e);
  if (e.code === "KeyP") pauseGame();
});
game.addEventListener("click", handleInput);
game.addEventListener("touchstart", handleInput);
startScreen.addEventListener("click", handleInput);
startScreen.addEventListener("touchstart", handleInput);
pauseScreen.addEventListener("click", handleInput);
pauseScreen.addEventListener("touchstart", handleInput);
gameOverScreen.addEventListener("click", (e) => {
  if (!e.target.closest("button")) handleInput(e);
});
gameOverScreen.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (!e.target.closest("button")) handleInput(e);
});

// Button interactions
function handleButtonClick(e) {
  e.preventDefault();
  resetGame();
}
retryBtn.addEventListener("click", handleButtonClick);
retryBtn.addEventListener("touchstart", handleButtonClick);
menuBtn.addEventListener("click", handleButtonClick);
menuBtn.addEventListener("touchstart", handleButtonClick);1
