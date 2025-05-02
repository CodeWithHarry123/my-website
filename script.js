const bird = document.getElementById("bird");
const scoreText = document.getElementById("score");
const pipeContainer = document.getElementById("pipe-container");
const restartBtn = document.getElementById("restartBtn");
const jumpSound = document.getElementById("jumpSound");
const hitSound = document.getElementById("hitSound");

let gravity = 0.7;
let velocity = 0;
let isGameOver = false;
let score = 0;
let gameLoopInterval;
let pipeInterval;
let highScore = localStorage.getItem("flappyHighScore") || 0;

// Set high score initially
document.getElementById("highScore").innerText = `High Score: ${highScore}`;

// User Input: Key or Mouse
document.addEventListener("keydown", jump);
document.addEventListener("click", jump);

// Bird jump logic
function jump() {
  if (isGameOver) return;
  velocity = -10;
  if (jumpSound) {
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
}

// Create pipes
function createPipe() {
  const gap = 150;
  const pipeTopHeight = Math.floor(Math.random() * 200) + 50;
  const pipeBottomHeight = 600 - pipeTopHeight - gap;

  const pipeTop = document.createElement("div");
  pipeTop.classList.add("pipe", "top");
  pipeTop.style.height = `${pipeTopHeight}px`;
  pipeTop.style.left = "400px";

  const pipeBottom = document.createElement("div");
  pipeBottom.classList.add("pipe", "bottom");
  pipeBottom.style.height = `${pipeBottomHeight}px`;
  pipeBottom.style.left = "400px";

  pipeContainer.appendChild(pipeTop);
  pipeContainer.appendChild(pipeBottom);

  const move = setInterval(() => {
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
      scoreText.innerText = `Score: ${score}`;
    } else {
      pipeTop.style.left = `${left - 2}px`;
      pipeBottom.style.left = `${left - 2}px`;

      const birdRect = bird.getBoundingClientRect();
      const topRect = pipeTop.getBoundingClientRect();
      const botRect = pipeBottom.getBoundingClientRect();

      if (
        birdRect.right > topRect.left &&
        birdRect.left < topRect.right &&
        (birdRect.top < topRect.bottom || birdRect.bottom > botRect.top)
      ) {
        endGame();
      }
    }
  }, 20);
}

function gameLoop() {
  if (isGameOver) return;

  velocity += gravity;
  let top = parseInt(window.getComputedStyle(bird).top);
  top += velocity;
  bird.style.top = `${top}px`;

  if (top > 530 || top < 0) {
    endGame();
  }
}

function endGame() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("flappyHighScore", highScore);
  }

  isGameOver = true;
  clearInterval(gameLoopInterval);
  clearInterval(pipeInterval);
  restartBtn.style.display = "inline-block";

  if (hitSound) hitSound.play();
}

function restartGame() {
  score = 0;
  velocity = 0;
  isGameOver = false;
  bird.style.top = "200px";
  pipeContainer.innerHTML = "";
  scoreText.innerText = "Score: 0";
  document.getElementById("highScore").innerText = `High Score: ${localStorage.getItem("flappyHighScore")}`;
  restartBtn.style.display = "none";

  startGame();
}

// Main game start
function startGame() {
  gameLoopInterval = setInterval(gameLoop, 20);
  pipeInterval = setInterval(createPipe, 2000);
}

// Start the game on load
startGame();
