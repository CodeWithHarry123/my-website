let lastConfirmed = Date.now();
let alertSent = false;
const ALERT_THRESHOLD = 3 * 60 * 60 * 1000; // ✅ 3 hours in milliseconds

function confirmSafety() {
  lastConfirmed = Date.now();
  alertSent = false;
  showStatus("✅ Safety confirmed!", "green");
}

function sendEmergencyAlert() {
  showStatus("🚨 Emergency! No confirmation received.", "red");
  console.log("🚨 Emergency alert triggered!");
  alertSent = true;
}

function showStatus(message, color) {
  const status = document.getElementById("statusText");
  if (status) {
    status.innerText = message;
    status.style.color = color;
  }
}

function formatTime(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function updateTimer() {
  const now = Date.now();
  const timeDiff = now - lastConfirmed;
  const timeRemaining = ALERT_THRESHOLD - timeDiff;

  const timerEl = document.getElementById("timer");
  if (timerEl) {
    timerEl.innerText = formatTime(timeRemaining);
  }

  if (timeRemaining <= 0 && !alertSent) {
    sendEmergencyAlert();
    alertSent = true;
  }
}

// Call immediately to prevent "Loading..."
updateTimer();

// ✅ Update every second
setInterval(updateTimer, 1000);
