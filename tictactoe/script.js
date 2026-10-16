const $ = (s) => document.querySelector(s);
const boardEl = $("#board");
const cfg = Object.assign({ diff: "medium", best: 3 }, JSON.parse(localStorage.getItem("ttt_cfg") || "{}"));

let board, turn, wins, draws, losses, over, scores = { you: 0, ai: 0, draw: 0 };

function newRound() {
  board = Array(9).fill("");
  turn = "X";
  over = false;
  boardEl.innerHTML = Array.from({ length: 9 }, (_, i) => `<div class="cell" data-i="${i}"></div>`).join("");
  setStatus("Your turn");
}

function setStatus(t, cls = "") {
  const s = $("#status");
  s.textContent = t;
  s.className = "status " + cls;
}

boardEl.addEventListener("click", (e) => {
  const c = e.target.closest(".cell");
  if (!c || over || c.classList.contains("taken")) return;
  play(+c.dataset.i, "X");
  if (!over) setTimeout(aiMove, 250);
});

function play(i, p) {
  board[i] = p;
  const c = boardEl.children[i];
  c.textContent = p;
  c.classList.add(p.toLowerCase(), "taken");

  const w = winner();
  if (w) return finish(w);
  if (board.every((v) => v)) return finish("draw");
  turn = p === "X" ? "O" : "X";
}

function finish(w) {
  over = true;
  if (w === "X") {
    scores.you++;
    setStatus("You win! 🎉", "win");
  } else if (w === "O") {
    scores.ai++;
    setStatus("AI wins 😅", "lose");
  } else {
    scores.draw++;
    setStatus("Draw");
  }
  updateHud();
  if (w !== "draw") {
    const line = winningLine();
    if (line) line.forEach((i) => boardEl.children[i].classList.add("win"));
  }

  if (scores.you + scores.ai + scores.draw >= cfg.best) {
    const msg = scores.you > scores.ai ? "You win the match! 🏆" : scores.you < scores.ai ? "AI wins the match." : "Match drawn.";
    setTimeout(() => {
      setStatus(msg, scores.you > scores.ai ? "win" : scores.you < scores.ai ? "lose" : "");
      setTimeout(() => { scores = { you: 0, ai: 0, draw: 0 }; updateHud(); newRound(); }, 1600);
    }, 500);
  }
}

function updateHud() {
  $("#sYou").textContent = scores.you;
  $("#sDraw").textContent = scores.draw;
  $("#sAI").textContent = scores.ai;
}

function aiMove() {
  if (over) return;
  let idx;
  const d = cfg.diff;
  if (d === "easy") idx = randomMove();
  else if (d === "medium") idx = Math.random() < 0.5 ? bestMove() : randomMove();
  else idx = bestMove();
  if (idx >= 0) play(idx, "O");
}

function randomMove() {
  const empty = board.map((v, i) => v ? -1 : i).filter((i) => i >= 0);
  return empty.length ? empty[(Math.random() * empty.length) | 0] : -1;
}

function bestMove() {
  let bestScore = -Infinity, move = -1;
  board.forEach((v, i) => {
    if (v) return;
    board[i] = "O";
    const s = minimax(board, 0, false);
    board[i] = "";
    if (s > bestScore) { bestScore = s; move = i; }
  });
  return move;
}

function minimax(b, depth, isMax) {
  const w = checkWinner(b);
  if (w === "O") return 10 - depth;
  if (w === "X") return depth - 10;
  if (b.every((v) => v)) return 0;

  if (isMax) {
    let best = -Infinity;
    b.forEach((v, i) => {
      if (v) return;
      b[i] = "O";
      best = Math.max(best, minimax(b, depth + 1, false));
      b[i] = "";
    });
    return best;
  } else {
    let best = Infinity;
    b.forEach((v, i) => {
      if (v) return;
      b[i] = "X";
      best = Math.min(best, minimax(b, depth + 1, true));
      b[i] = "";
    });
    return best;
  }
}

function winner() {
  return checkWinner(board);
}

function winningLine() {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const l of lines) {
    const [a, b, c] = l;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return l;
  }
  return null;
}

function checkWinner(b) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a, bb, c] of lines) {
    if (b[a] && b[a] === b[bb] && b[a] === b[c]) return b[a];
  }
  return null;
}

$("#newRound").addEventListener("click", () => {
  scores = { you: 0, ai: 0, draw: 0 };
  updateHud();
  newRound();
});

const modal = $("#settings");
$("#settingsBtn").addEventListener("click", () => {
  $("#setDiff").value = cfg.diff;
  $("#setBest").value = cfg.best;
  modal.hidden = false;
});
$("#closeSettings").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
$("#saveSettings").addEventListener("click", () => {
  cfg.diff = $("#setDiff").value;
  cfg.best = parseInt($("#setBest").value, 10);
  localStorage.setItem("ttt_cfg", JSON.stringify(cfg));
  modal.hidden = true;
  scores = { you: 0, ai: 0, draw: 0 };
  updateHud();
  newRound();
});

newRound();
updateHud();