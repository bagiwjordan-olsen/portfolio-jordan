const $ = (s) => document.querySelector(s);
const canvas = $("#game");
const ctx = canvas.getContext("2d");

const speeds = { slow: 160, normal: 110, fast: 70 };
const cfg = Object.assign({ speed: "normal", grid: 20, wrap: false }, JSON.parse(localStorage.getItem("snake_cfg") || "{}"));

let cell, snake, dir, nextDir, food, score, best, timer, running, over;
best = parseInt(localStorage.getItem("snake_best") || "0", 10);
$("#best").textContent = best;

function fitCanvas() {
  const size = canvas.clientWidth || 480;
  canvas.width = size;
  canvas.height = size;
  cell = size / cfg.grid;
}

function reset() {
  fitCanvas();
  const mid = Math.floor(cfg.grid / 2);
  snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
  dir = { x: 1, y: 0 };
  nextDir = dir;
  score = 0;
  over = false;
  running = false;
  placeFood();
  draw();
  $("#score").textContent = "0";
}

function placeFood() {
  let spot;
  do { spot = { x: (Math.random() * cfg.grid) | 0, y: (Math.random() * cfg.grid) | 0 }; }
  while (snake.some((s) => s.x === spot.x && s.y === spot.y));
  food = spot;
}

function step() {
  if (!running || over) return;
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (cfg.wrap) {
    head.x = (head.x + cfg.grid) % cfg.grid;
    head.y = (head.y + cfg.grid) % cfg.grid;
  } else if (head.x < 0 || head.y < 0 || head.x >= cfg.grid || head.y >= cfg.grid) {
    return end();
  }

  if (snake.some((s) => s.x === head.x && s.y === head.y)) return end();

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    $("#score").textContent = score;
    if (score > best) {
      best = score;
      $("#best").textContent = best;
      localStorage.setItem("snake_best", best);
    }
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  const size = canvas.width;
  const g = cfg.grid;
  const c = size / g;
  ctx.clearRect(0, 0, size, size);

  // subtle grid
  ctx.strokeStyle = "rgba(232,168,124,.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= g; i++) {
    ctx.beginPath(); ctx.moveTo(i * c, 0); ctx.lineTo(i * c, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * c); ctx.lineTo(size, i * c); ctx.stroke();
  }

  // food
  ctx.fillStyle = "#c17b9c";
  ctx.beginPath();
  ctx.arc(food.x * c + c / 2, food.y * c + c / 2, c * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // snake
  snake.forEach((s, i) => {
    const t = i / snake.length;
    ctx.fillStyle = i === 0 ? "#e8a87c" : `rgba(232,168,124,${0.9 - t * 0.5})`;
    ctx.beginPath();
    const r = c * 0.22;
    const x = s.x * c + 1, y = s.y * c + 1, w = c - 2, h = c - 2;
    ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
    ctx.fill();
  });
}

function start() {
  reset();
  running = true;
  $("#overlay").classList.add("hidden");
  clearInterval(timer);
  timer = setInterval(step, speeds[cfg.speed]);
}

function end() {
  running = false;
  over = true;
  clearInterval(timer);
  $("#ovTitle").textContent = "Game Over";
  $("#ovText").textContent = `Score: ${score} · Best: ${best}`;
  $("#ovBtn").textContent = "Play Again";
  $("#overlay").classList.remove("hidden");
}

function turn(x, y) {
  if (x === -dir.x && y === -dir.y) return;
  nextDir = { x, y };
}

document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (k === "ArrowUp" || k === "w") turn(0, -1);
  else if (k === "ArrowDown" || k === "s") turn(0, 1);
  else if (k === "ArrowLeft" || k === "a") turn(-1, 0);
  else if (k === "ArrowRight" || k === "d") turn(1, 0);
  else if (k === " " && !running) start();
});

document.querySelectorAll(".dpad button").forEach((b) =>
  b.addEventListener("click", () => {
    const d = b.dataset.dir;
    if (d === "up") turn(0, -1);
    if (d === "down") turn(0, 1);
    if (d === "left") turn(-1, 0);
    if (d === "right") turn(1, 0);
  })
);

$("#ovBtn").addEventListener("click", start);

// settings
const modal = $("#settings");
$("#settingsBtn").addEventListener("click", () => {
  $("#setSpeed").value = cfg.speed;
  $("#setGrid").value = cfg.grid;
  $("#setWrap").checked = cfg.wrap;
  modal.hidden = false;
});
$("#closeSettings").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
$("#saveSettings").addEventListener("click", () => {
  cfg.speed = $("#setSpeed").value;
  cfg.grid = parseInt($("#setGrid").value, 10);
  cfg.wrap = $("#setWrap").checked;
  localStorage.setItem("snake_cfg", JSON.stringify(cfg));
  modal.hidden = true;
  reset();
  $("#ovTitle").textContent = "Ready?";
  $("#ovText").textContent = `Grid ${cfg.grid}×${cfg.grid} · ${cfg.speed} speed`;
  $("#ovBtn").textContent = "Start";
  $("#overlay").classList.remove("hidden");
});

window.addEventListener("resize", () => { fitCanvas(); draw(); });
reset();