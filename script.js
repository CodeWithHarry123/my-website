
let lastConfirmed = Date.now();
let alertSent = false;

function confirmSafety() {
  lastConfirmed = Date.now();
  alertSent = false;
  alert("Safety confirmed. Timer reset.");
}

function sendEmergencyAlert() {
  alert("EMERGENCY ALERT: User did not confirm safety!");
  console.log("Emergency alert triggered!");
}

function updateTimer() {
  const now = Date.now();
  const diff = Math.floor((now - lastConfirmed) / 1000);
  const remaining = 3 * 60 * 60 - diff;

  if (remaining <= 0 && !alertSent) {
    sendEmergencyAlert();
    alertSent = true;
  }

  const hrs = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  document.getElementById("timer").innerText = `${hrs}h ${mins}m ${secs}s`;
}

setInterval(updateTimer, 1000);
