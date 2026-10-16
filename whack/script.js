const $ = (s) => document.querySelector(s);
const field = $("#field");
const cfg = Object.assign({ diff: "normal", time: 30 }, JSON.parse(localStorage.getItem("whack_cfg") || "{}"));

const intervals = { easy: 900, normal: 650, hard: 420 };
const lives = { easy: 1300, normal: 950, hard: 650 };

let score, timeLeft, running, spawnTimer, tickTimer, activeHole;
let best = parseInt(localStorage.getItem("whack_best") || "0", 10);
$("#best").textContent = best;

function buildField() {
  field.innerHTML = Array.from({ length: 9 }, (_, i) => `
    <div class="hole" data-i="${i}"><div class="mole"></div></div>
  `).join("");
  field.querySelectorAll(".hole").forEach((h) => {
    h.addEventListener("click", () => hit(h));
  });
}

function hit(h) {
  if (!running || !h.classList.contains("up")) return;
  h.classList.remove("up");
  h.classList.add("hit");
  score++;
  $("#score").textContent = score;
  setTimeout(() => h.classList.remove("hit"), 200);
}

function start() {
  score = 0;
  timeLeft = cfg.time;
  running = true;
  $("#score").textContent = "0";
  $("#time").textContent = timeLeft;
  $("#status").textContent = "Go!";

  field.querySelectorAll(".hole").forEach((h) => h.classList.remove("up", "hit"));

  clearInterval(spawnTimer);
  clearInterval(tickTimer);

  spawnTimer = setInterval(spawn, intervals[cfg.diff]);

  tickTimer = setInterval(() => {
    timeLeft--;
    $("#time").textContent = timeLeft;
    if (timeLeft <= 0) end();
  }, 1000);
}

function spawn() {
  if (!running) return;
  field.querySelectorAll(".hole").forEach((h) => h.classList.remove("up"));
  const holes = field.querySelectorAll(".hole");
  const pick = holes[(Math.random() * holes.length) | 0];
  pick.classList.add("up");
  setTimeout(() => pick.classList.remove("up"), lives[cfg.diff]);
}

function end() {
  running = false;
  clearInterval(spawnTimer);
  clearInterval(tickTimer);
  field.querySelectorAll(".hole").forEach((h) => h.classList.remove("up"));
  if (score > best) {
    best = score;
    localStorage.setItem("whack_best", best);
    $("#best").textContent = best;
  }
  $("#status").textContent = `Time's up! Score: ${score}${score === best && score > 0 ? " (new best!)" : ""}`;
}

$("#startBtn").addEventListener("click", start);

const modal = $("#settings");
$("#settingsBtn").addEventListener("click", () => {
  $("#setDiff").value = cfg.diff;
  $("#setTime").value = cfg.time;
  modal.hidden = false;
});
$("#closeSettings").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
$("#saveSettings").addEventListener("click", () => {
  cfg.diff = $("#setDiff").value;
  cfg.time = parseInt($("#setTime").value, 10);
  localStorage.setItem("whack_cfg", JSON.stringify(cfg));
  modal.hidden = true;
});

buildField();