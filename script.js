// Previous variable declarations remain the same...

function endGame() {
  if (isGameOver) return; // Prevent multiple calls
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
  
  // Boundary checks
  if (birdTop < 0) {
    birdTop = 0;
    velocity = 0;
  }
  
  // Improved ground collision detection
  const birdHeight = 30; // Actual height of bird element
  if (birdTop + birdHeight > 570) { // 600px canvas - 30px bird height
    birdTop = 570 - birdHeight;
    if (velocity > 0) { // Only end game if falling down
      console.log("Game Over: Bird hit ground, birdTop=", birdTop);
      endGame();
      return;
    }
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

    // Improved collision detection
    const birdX = 100;
    const birdY = birdTop;
    const birdWidth = 34; // Adjusted to actual visible width
    const birdHeight = 24; // Adjusted to actual visible height
    const pipeX = left;
    const pipeWidth = 60;
    const topPipeHeight = parseInt(pipe.top.style.height) || 0;
    const bottomPipeY = topPipeHeight + 200; // pipeGap = 200

    // Pixel-perfect collision detection
    const birdRight = birdX + birdWidth;
    const birdBottom = birdY + birdHeight;
    const pipeRight = pipeX + pipeWidth;
    
    // Check if bird is horizontally aligned with pipe
    if (birdRight > pipeX && birdX < pipeRight) {
      // Check collision with top pipe
      if (birdY < topPipeHeight) {
        console.log("Collision with top pipe");
        endGame();
        return false;
      }
      // Check collision with bottom pipe
      if (birdBottom > bottomPipeY) {
        console.log("Collision with bottom pipe");
        endGame();
        return false;
      }
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

// Rest of the code remains the same...
