const bird = document.getElementById("bird");
const gameCanvas = document.getElementById("game-canvas");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const pauseScreen = document.getElementById("pause-screen");
const tutorialScreen = document.getElementById("tutorial-screen");
const settingsScreen = document.getElementById("settings-screen");
const loadingScreen = document.getElementById("loading-screen");
const finalScoreDisplay = document.getElementById("final-score");
const retryBtn = document.getElementById("retry-btn");
const menuBtn = document.getElementById("menu-btn");
const shareBtn = document.getElementById("share-btn");
const tutorialBtn = document.getElementById("tutorial-btn");
const closeTutorialBtn = document.getElementById("close-tutorial");
const closeSettingsBtn = document.getElementById("close-settings");
const pipeContainer = document.getElementById("pipe-container");
const soundToggle = document.getElementById("sound-toggle");
const difficultySelect = document.getElementById("difficulty");
const themeSelect = document.getElementById("theme");
const sections = document.querySelectorAll(".section");
const navLinks = document.querySelectorAll(".nav-links a");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

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
let soundEnabled = true;
let difficulty = "medium";
let theme = "day";

highScoreDisplay.innerText = `High Score: ${highScore}`;

// Sounds
const flapSound = new Audio("sounds/flap.mp3");
const scoreSound = new Audio("sounds/score.mp3");
const hitSound = new Audio("sounds/hit.mp3");

function playSound(sound) {
  if (soundEnabled) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

// Navigation
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    sections.forEach(section => section.classList.add("hidden"));
    document.getElementById(targetId).classList.remove("hidden");
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    if (targetId === "game") {
      resetGame();
    }
    nav.classList.remove("active");
  });
});

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("active");
});

// Settings
soundToggle.addEventListener("change", () => {
  soundEnabled = soundToggle.checked;
  localStorage.setItem("soundEnabled", soundEnabled);
});

difficultySelect.addEventListener("change", () => {
  difficulty = difficultySelect.value;
  localStorage.setItem("difficulty", difficulty);
  updateDifficulty();
});

themeSelect.addEventListener("change", () => {
  theme = themeSelect.value;
  localStorage.setItem("theme", theme);
  updateTheme();
});

closeSettingsBtn.addEventListener("click", () => {
  settingsScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

function updateDifficulty() {
  switch (difficulty) {
    case "easy":
      gravity = 0.4;
      pipeSpeed = 1.5;
      break;
    case "medium":
      gravity = 0.5;
      pipeSpeed = 2;
      break;
    case "hard":
      gravity = 0.6;
      pipeSpeed = 2.5;
      break;
  }
}

function updateTheme() {
  document.body.className = theme;
  document.getElementById("background").className = `bg-${theme}`;
}

// Load saved settings
if (localStorage.getItem("soundEnabled")) {
  soundEnabled = localStorage.getItem("soundEnabled") === "true";
  soundToggle.checked = soundEnabled;
}
if (localStorage.getItem("difficulty")) {
  difficulty = localStorage.getItem("difficulty");
  difficultySelect.value = difficulty;
}
if (localStorage.getItem("theme")) {
  theme = localStorage.getItem("theme");
  themeSelect.value = theme;
}
updateDifficulty();
updateTheme();

// Game Logic
function startGame() {
  if (!isGameStarted) {
    isGameStarted = true;
    isPaused = false;
    startScreen.classList.add("hidden");
    tutorialScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");
    settingsScreen.classList.add("hidden");
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }
}

function flap() {
  const now = Date.now();
  if (!isGameOver && isGameStarted && !isPaused && now - lastFlapTime > flapCooldown) {
    velocity = -7;
    playSound(flapSound);
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

  const pipeGap = difficulty === "easy" ? 220 : difficulty === "medium" ? 200 : 180;
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
    gameCanvas.appendChild(particle);
    setTimeout(() => particle.remove(), 500);
  }
}

function endGame() {
  isGameOver = true;
  bird.classList.add("fall");
  playSound(hitSound);
  createParticles(120, birdTop + 15);
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
  pipes = [];
  lastPipeTime = 0;
  scoreDisplay.innerText = "Score: 0";
  bird.classList.remove("fall");
  bird.style.top = birdTop + "px";
  pipeContainer.innerHTML = "";
  gameOverScreen.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  tutorialScreen.classList.add("hidden");
  settingsScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  updateDifficulty();
}

function gameLoop(timestamp) {
  if (!isGameStarted || isGameOver || isPaused) return;

  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  velocity += gravity * delta * 20;
  birdTop += velocity * delta * 20;
  if (birdTop < 0) {
    birdTop = 0;
    velocity = 0;
  }
  if (birdTop > 570) {
    endGame();
    return;
  }
  bird.style.top = birdTop + "px";

  createPipe(timestamp);

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

    const birdX = 100;
    const birdY = birdTop;
    const birdWidth = 34;
    const birdHeight = 24;
    const pipeX = left;
    const pipeWidth = 60;
    const topPipeHeight = parseInt(pipe.top.style.height) || 0;
    const bottomPipeY = topPipeHeight + (difficulty === "easy" ? 220 : difficulty === "medium" ? 200 : 180);

    const collisionBuffer = 8;
    const verticalBuffer = 10;

    if (
      birdX + birdWidth > pipeX - collisionBuffer &&
      birdX < pipeX + pipeWidth + collisionBuffer &&
      (birdY < topPipeHeight - verticalBuffer || birdY + birdHeight > bottomPipeY + verticalBuffer)
    ) {
      endGame();
      return false;
    }

    if (!pipe.scored && pipeX + pipeWidth < birdX) {
      score++;
      playSound(scoreSound);
      scoreDisplay.innerText = `Score: ${score}`;
      if (score > highScore) {
        highScore = score;
        highScoreDisplay.innerText = `High Score: ${highScore}`;
        localStorage.setItem("highScore", highScore);
      }
      pipe.scored = true;
      if (score % 5 === 0) {
        pipeSpeed += difficulty === "easy" ? 0.1 : difficulty === "medium" ? 0.2 : 0.3;
        gravity += difficulty === "easy" ? 0.03 : difficulty === "medium" ? 0.05 : 0.07;
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

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") handleInput(e);
  if (e.code === "KeyP") pauseGame();
  if (e.code === "KeyS") {
    startScreen.classList.add("hidden");
    settingsScreen.classList.remove("hidden");
  }
});

gameCanvas.addEventListener("click", handleInput);
gameCanvas.addEventListener("touchstart", handleInput);
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

function handleButtonClick(e) {
  e.preventDefault();
  resetGame();
}
retryBtn.addEventListener("click", handleButtonClick);
retryBtn.addEventListener("touchstart", handleButtonClick);
menuBtn.addEventListener("click", handleButtonClick);
menuBtn.addEventListener("touchstart", handleButtonClick);
tutorialBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  tutorialScreen.classList.remove("hidden");
});
closeTutorialBtn.addEventListener("click", () => {
  tutorialScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

shareBtn.addEventListener("click", () => {
  const shareData = {
    title: "Flappy Bird Ultra",
    text: `I scored ${score} in Flappy Bird Ultra! Can you beat my score?`,
    url: window.location.href
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    alert("Score copied to clipboard!");
  }
});

// Loading Screen
window.addEventListener("load", () => {
  setTimeout(() => {
    loadingScreen.classList.add("hidden");
    document.getElementById("home").classList.remove("hidden");
  }, 1000);
});
