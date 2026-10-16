const $ = (s) => document.querySelector(s);
const boardEl = $("#board");
const cfg = Object.assign({ size: 4, win: 2048 }, JSON.parse(localStorage.getItem("g2048_cfg") || "{}"));
let grid, score, best, won, over;

best = parseInt(localStorage.getItem("g2048_best") || "0", 10);
$("#best").textContent = best;

function newGame() {
  grid = Array.from({ length: cfg.size }, () => Array(cfg.size).fill(0));
  score = 0;
  won = false;
  over = false;
  addTile(); addTile();
  draw();
  $("#score").textContent = "0";
  $("#overlay").classList.add("hidden");
}

function addTile() {
  const empty = [];
  grid.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r, c]); }));
  if (!empty.length) return;
  const [r, c] = empty[(Math.random() * empty.length) | 0];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function draw() {
  boardEl.style.gridTemplateColumns = `repeat(${cfg.size},1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${cfg.size},1fr)`;
  const fontSize = `clamp(1rem, ${8 / cfg.size}vw, 2.2rem)`;
  boardEl.innerHTML = grid.flat().map((v) => {
    if (v === 0) return '<div class="tile"></div>';
    const cls = v > 2048 ? "big" : `v${v}`;
    return `<div class="tile ${cls}" style="font-size:${fontSize}">${v}</div>`;
  }).join("");
}

function move(dir) {
  if (over) return;
  const before = JSON.stringify(grid);
  const size = cfg.size;
  const rotate = (g) => g[0].map((_, c) => g.map((r) => r[c]).reverse());
  const merge = (row) => {
    let r = row.filter((v) => v);
    for (let i = 0; i < r.length - 1; i++) {
      if (r[i] === r[i + 1]) {
        r[i] *= 2;
        if (r[i] >= cfg.win && !won) { won = true; }
        r.splice(i + 1, 1);
      }
    }
    while (r.length < size) r.push(0);
    return r;
  };

  let g = grid.map((r) => r.slice());
  const times = dir === "left" ? 0 : dir === "up" ? 3 : dir === "right" ? 2 : 1;
  for (let i = 0; i < times; i++) g = rotate(g);
  g = g.map(merge);
  for (let i = 0; i < (4 - times) % 4; i++) g = rotate(g);
  grid = g;

  if (JSON.stringify(grid) !== before) {
    score = grid.flat().reduce((s, v) => s + v, 0);
    // real scoring would track merges; keep it simple & visual
    score = Math.max(0, score - 4 * (cfg.size - 1));
    $("#score").textContent = score;
    if (score > best) { best = score; $("#best").textContent = best; localStorage.setItem("g2048_best", best); }
    addTile();
    draw();
    if (won) { showOverlay("You Win!", `You reached ${cfg.win}!`); }
    else if (isStuck()) { over = true; showOverlay("Game Over", `Score: ${score}`); }
  }
}

function isStuck() {
  const s = cfg.size;
  for (let r = 0; r < s; r++) {
    for (let c = 0; c < s; c++) {
      if (!grid[r][c]) return false;
      if (c < s - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < s - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

function showOverlay(t, s) {
  $("#ovTitle").textContent = t;
  $("#ovText").textContent = s;
  $("#overlay").classList.remove("hidden");
}

document.addEventListener("keydown", (e) => {
  const k = e.key;
  if (["ArrowUp", "w", "W"].includes(k)) { e.preventDefault(); move("up"); }
  else if (["ArrowDown", "s", "S"].includes(k)) { e.preventDefault(); move("down"); }
  else if (["ArrowLeft", "a", "A"].includes(k)) { e.preventDefault(); move("left"); }
  else if (["ArrowRight", "d", "D"].includes(k)) { e.preventDefault(); move("right"); }
});

let tx = 0, ty = 0;
boardEl.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
boardEl.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
  else move(dy > 0 ? "down" : "up");
});

$("#ovBtn").addEventListener("click", newGame);

const modal = $("#settings");
$("#settingsBtn").addEventListener("click", () => {
  $("#setSize").value = cfg.size;
  $("#setWin").value = cfg.win;
  modal.hidden = false;
});
$("#closeSettings").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
$("#saveSettings").addEventListener("click", () => {
  cfg.size = parseInt($("#setSize").value, 10);
  cfg.win = parseInt($("#setWin").value, 10);
  localStorage.setItem("g2048_cfg", JSON.stringify(cfg));
  modal.hidden = true;
  newGame();
});

newGame();