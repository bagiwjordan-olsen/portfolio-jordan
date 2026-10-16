const $ = (s) => document.querySelector(s);
const cfg = Object.assign({ speed: "normal", sound: "on" }, JSON.parse(localStorage.getItem("simon_cfg") || "{}"));

const speeds = { slow: 900, normal: 620, fast: 400 };
const freqs = [329.63, 261.63, 392.00, 196.00];

let sequence, step, playing, round, best;
best = parseInt(localStorage.getItem("simon_best") || "0", 10);
$("#best").textContent = best;

const pads = document.querySelectorAll(".btn-pad");
pads.forEach((p) => p.addEventListener("click", () => playerPress(+p.dataset.c)));

let audioCtx;
function beep(freq, dur = 0.18) {
  if (cfg.sound !== "on") return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = freq;
    o.type = "sine";
    o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.start(); o.stop(audioCtx.currentTime + dur + 0.02);
  } catch (e) { /* ignore */ }
}

function flash(i, dur = 350) {
  const p = pads[i];
  p.classList.add("lit");
  beep(freqs[i]);
  setTimeout(() => p.classList.remove("lit"), dur);
}

function newGame() {
  sequence = [];
  step = 0;
  round = 0;
  playing = false;
  $("#round").textContent = "0";
  $("#status").textContent = "Watch the sequence…";
  pads.forEach((p) => (p.disabled = true));
  nextRound();
}

function nextRound() {
  round++;
  $("#round").textContent = round;
  sequence.push((Math.random() * 4) | 0);
  step = 0;
  playSequence();
}

function playSequence() {
  playing = false;
  pads.forEach((p) => (p.disabled = true));
  $("#status").textContent = "Watch…";
  const gap = speeds[cfg.speed] / 2;
  sequence.forEach((c, i) => {
    setTimeout(() => flash(c), i * speeds[cfg.speed] + 400);
  });
  setTimeout(() => {
    playing = true;
    pads.forEach((p) => (p.disabled = false));
    $("#status").textContent = "Your turn";
  }, sequence.length * speeds[cfg.speed] + 500);
}

function playerPress(i) {
  if (!playing) return;
  flash(i, 220);
  if (sequence[step] !== i) return gameOver();
  step++;
  if (step === sequence.length) {
    playing = false;
    pads.forEach((p) => (p.disabled = true));
    setTimeout(nextRound, 700);
  }
}

function gameOver() {
  playing = false;
  pads.forEach((p) => (p.disabled = true));
  if (round - 1 > best) {
    best = round - 1;
    localStorage.setItem("simon_best", best);
    $("#best").textContent = best;
  }
  $("#status").textContent = `Game over — you reached round ${round - 1}`;
}

$("#startBtn").addEventListener("click", newGame);

const modal = $("#settings");
$("#settingsBtn").addEventListener("click", () => {
  $("#setSpeed").value = cfg.speed;
  $("#setSound").value = cfg.sound;
  modal.hidden = false;
});
$("#closeSettings").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
$("#saveSettings").addEventListener("click", () => {
  cfg.speed = $("#setSpeed").value;
  cfg.sound = $("#setSound").value;
  localStorage.setItem("simon_cfg", JSON.stringify(cfg));
  modal.hidden = true;
});