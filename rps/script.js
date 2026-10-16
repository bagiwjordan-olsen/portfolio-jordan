const $ = (s) => document.querySelector(s);
const cfg = Object.assign({ best: 3, style: "random" }, JSON.parse(localStorage.getItem("rps_cfg") || "{}"));

const icons = { rock: "✊", paper: "✋", scissors: "✌" };
const beats = { rock: "scissors", paper: "rock", scissors: "paper" };

let wins, losses, rounds, over, lastPlayer, lastCPU;
let best = parseInt(localStorage.getItem("rps_best") || "0", 10);

function reset() {
  wins = 0;
  losses = 0;
  rounds = 0;
  over = false;
  lastPlayer = lastCPU = null;
  $("#you").querySelector("span").textContent = "?";
  $("#cpu").querySelector("span").textContent = "?";
  $("#you").classList.remove("pop");
  $("#cpu").classList.remove("pop");
  updateHud();
  $("#status").textContent = "Pick your weapon";
  $("#status").className = "status";
  document.querySelectorAll(".choice").forEach((b) => (b.disabled = false));
}

function updateHud() {
  $("#sYou").textContent = wins;
  $("#sCPU").textContent = losses;
  $("#sRounds").textContent = `${rounds} / ${cfg.best}`;
}

function pick(player) {
  if (over) return;
  const cpu = cpuChoice();
  lastPlayer = player;
  lastCPU = cpu;

  const youEl = $("#you");
  const cpuEl = $("#cpu");
  youEl.querySelector("span").textContent = icons[player];
  cpuEl.querySelector("span").textContent = icons[cpu];
  youEl.classList.remove("pop"); cpuEl.classList.remove("pop");
  void youEl.offsetWidth; void cpuEl.offsetWidth;
  youEl.classList.add("pop"); cpuEl.classList.add("pop");

  let result;
  if (player === cpu) result = "draw";
  else if (beats[player] === cpu) { result = "win"; wins++; }
  else { result = "lose"; losses++; }

  rounds++;
  updateHud();

  const s = $("#status");
  if (result === "win") { s.textContent = `You win! ${player} beats ${cpu}`; s.className = "status win"; }
  else if (result === "lose") { s.textContent = `CPU wins! ${cpu} beats ${player}`; s.className = "status lose"; }
  else { s.textContent = `Draw — both picked ${player}`; s.className = "status"; }

  if (wins >= cfg.best || losses >= cfg.best) end();
}

function cpuChoice() {
  if (cfg.style === "streak" && lastPlayer) {
    const counter = Object.keys(beats).find((k) => beats[k] === lastPlayer);
    // 60% chance to counter, 40% random
    if (Math.random() < 0.6) return counter;
  }
  const keys = Object.keys(icons);
  return keys[(Math.random() * keys.length) | 0];
}

function end() {
  over = true;
  document.querySelectorAll(".choice").forEach((b) => (b.disabled = true));
  const s = $("#status");
  if (wins > losses) {
    s.textContent = `🏆 You won the match ${wins}–${losses}!`;
    s.className = "status win";
  } else {
    s.textContent = `CPU won the match ${losses}–${wins}.`;
    s.className = "status lose";
  }
}

document.querySelectorAll(".choice").forEach((b) =>
  b.addEventListener("click", () => pick(b.dataset.c))
);

$("#resetBtn").addEventListener("click", reset);

const modal = $("#settings");
$("#settingsBtn").addEventListener("click", () => {
  $("#setBest").value = cfg.best;
  $("#setStyle").value = cfg.style;
  modal.hidden = false;
});
$("#closeSettings").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
$("#saveSettings").addEventListener("click", () => {
  cfg.best = parseInt($("#setBest").value, 10);
  cfg.style = $("#setStyle").value;
  localStorage.setItem("rps_cfg", JSON.stringify(cfg));
  modal.hidden = true;
  reset();
});

reset();