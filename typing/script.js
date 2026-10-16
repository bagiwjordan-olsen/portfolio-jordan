const $ = (s) => document.querySelector(s);
const textEl = $("#text");
const inputEl = $("#input");
const cfg = Object.assign({ time: 30, cat: "quotes" }, JSON.parse(localStorage.getItem("typing_cfg") || "{}"));

const TEXTS = {
  quotes: [
    "The best way to predict the future is to invent it.",
    "Simplicity is the soul of efficiency in any craft.",
    "Programs must be written for people to read, and only incidentally for machines to execute.",
    "Talk is cheap. Show me the code.",
    "First, solve the problem. Then, write the code."
  ],
  code: [
    "const sum = (a, b) => a + b; console.log(sum(2, 3));",
    "function greet(name) { return `Hello, ${name}!`; }",
    "for (let i = 0; i < arr.length; i++) { total += arr[i]; }",
    "if (user.isAdmin) { grantAccess(); } else { denyAccess(); }"
  ],
  words: [
    "apple orange banana grape kiwi mango lemon cherry peach plum",
    "computer keyboard monitor mouse screen laptop tablet phone watch",
    "run jump skip walk jump swim dance sing write read code build"
  ]
};

let target, started, timeLeft, timer, correct, typed;

function newGame() {
  clearInterval(timer);
  target = TEXTS[cfg.cat][(Math.random() * TEXTS[cfg.cat].length) | 0];
  started = false;
  timeLeft = cfg.time;
  correct = 0;
  typed = 0;
  inputEl.value = "";
  inputEl.disabled = false;
  textEl.innerHTML = [...target].map((c, i) => `<span class="${i === 0 ? "cur" : ""}" data-i="${i}">${c === " " ? "&nbsp;" : c}</span>`).join("");
  $("#time").textContent = timeLeft;
  $("#wpm").textContent = "0";
  $("#acc").textContent = "100%";
  $("#overlay").hidden = true;
}

function start() {
  if (started) return;
  started = true;
  timer = setInterval(() => {
    timeLeft--;
    $("#time").textContent = timeLeft;
    if (timeLeft <= 0) end();
    else updateWPM();
  }, 1000);
}

function update() {
  const val = inputEl.value;
  const chars = [...target];
  const spans = textEl.querySelectorAll("span");
  let ok = 0, bad = 0;

  spans.forEach((sp, i) => {
    sp.className = "";
    const t = val[i];
    if (t == null) {
      if (i === val.length) sp.className = "cur";
    } else if (t === chars[i]) {
      sp.classList.add("ok"); ok++;
    } else {
      sp.classList.add("bad"); bad++;
    }
  });

  correct = ok;
  typed = ok + bad;
  const acc = typed ? Math.round((ok / typed) * 100) : 100;
  $("#acc").textContent = acc + "%";
  updateWPM();

  if (val.length >= target.length) end();
}

function updateWPM() {
  if (!started) return;
  const mins = (cfg.time - timeLeft) / 60;
  if (mins <= 0) return;
  const wpm = Math.max(0, Math.round((correct / 5) / mins));
  $("#wpm").textContent = wpm;
}

function end() {
  clearInterval(timer);
  inputEl.disabled = true;
  const mins = cfg.time / 60;
  const wpm = Math.max(0, Math.round((correct / 5) / mins));
  const acc = typed ? Math.round((correct / typed) * 100) : 100;
  $("#ovText").textContent = `${wpm} WPM\n${acc}% accuracy\n${correct} correct of ${target.length} chars`;
  $("#overlay").hidden = false;
}

inputEl.addEventListener("input", () => { start(); update(); });

$("#ovBtn").addEventListener("click", newGame);

const modal = $("#settings");
$("#settingsBtn").addEventListener("click", () => {
  $("#setTime").value = cfg.time;
  $("#setCat").value = cfg.cat;
  modal.hidden = false;
});
$("#closeSettings").addEventListener("click", () => (modal.hidden = true));
modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
$("#saveSettings").addEventListener("click", () => {
  cfg.time = parseInt($("#setTime").value, 10);
  cfg.cat = $("#setCat").value;
  localStorage.setItem("typing_cfg", JSON.stringify(cfg));
  modal.hidden = true;
  newGame();
});

newGame();