const $ = (s) => document.querySelector(s);
const boardEl = $("#board");
const cfg = Object.assign({ size: 4, theme: "emoji" }, JSON.parse(localStorage.getItem("mem_cfg") || "{}"));

const POOL = {
  emoji: ["🍎","🍌","🍇","🍒","🍑","🍍","🥝","🍉","🥕","🌽","🍄","🌶","🥑","🍋","🍓","🍐","🥥","🍅"],
  letters: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R"]
};

let deck, first, second, lock, moves, matched, timer, seconds, best;

best = localStorage.getItem(`mem_best_${cfg.size}`) ? parseInt(localStorage.getItem(`mem_best_${cfg.size}`), 10) : null;
if (best) $("#best").textContent = best + "s";

function newGame() {
  const total = cfg.size * cfg.size;
  const pairs = total / 2;
  const src = POOL[cfg.theme];
  const picks = src.slice(0, pairs);
  deck = [...picks, ...picks]
    .map((v) => ({ v, id: Math.random() }))
    .sort(() => Math.random() - 0.5);

  moves = 0;
  matched = 0;
  seconds = 0;
  first = second = null;
  lock = false;

  $("#moves").textContent = "0";
  $("#time").textContent = "0s";
  $("#best").textContent = best ? best + "s" : "—";
  $("#overlay").hidden = true;

  render();
  clearInterval(timer);
  timer = setInterval(() => {
    seconds++;
    $("#time").textContent = seconds + "s";
  }, 1000);
}

function render() {
  boardEl.style.gridTemplateColumns = `repeat(${cfg.size}, 1fr)`;
  boardEl.innerHTML = deck.map((c, i) => `
    <div class="card" data-i="${i}">
      <div class="card-inner">
        <div class="face front"></div>
        <div class="face back">${c.v}</div>
      </div>
    </div>
  `).join("");
}

boardEl.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card || lock) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
  card.classList.add("flipped");

  if (!first) { first = card; return; }
  second = card;
  moves++;
  $("#moves").textContent = moves;
  lock = true;

  const a = deck[+first.dataset.i].v;
  const b = deck[+second.dataset.i].v;

  if (a === b) {
    first.classList.add("matched");
    second.classList.add("matched");
    matched++;
    first = second = null;
    lock = false;
    if (matched === deck.length / 2) win();
  } else {
    setTimeout(() => {
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      first = second = null;
      lock = false;
    }, 700);
  }
});

function win() {
  clearInterval(timer);
  if (!best || seconds < best) {
    best = seconds;
    localStorage.setItem(`mem_best_${cfg.size}`, best);
    $("#best").textContent = best + "s";
  }
  $("#ovTitle").textContent = "Nice!";
  $("#ovText").textContent = `${moves} moves · ${seconds}s`;
  $("#overlay").hidden = false;
}

$("#ovBtn").addEventListener("click", newGame);

const modal = $("#settings");
$("#settingsBtn").addEventListener("click", () => {
  $("#setSize").value = cfg.size;
  $("#setTheme").value = cfg.theme;
  modal.hidden = false;
});
$("#closeSettings").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
$("#saveSettings").addEventListener("click", () => {
  cfg.size = parseInt($("#setSize").value, 10);
  cfg.theme = $("#setTheme").value;
  localStorage.setItem("mem_cfg", JSON.stringify(cfg));
  best = localStorage.getItem(`mem_best_${cfg.size}`) ? parseInt(localStorage.getItem(`mem_best_${cfg.size}`), 10) : null;
  modal.hidden = true;
  newGame();
});

newGame();