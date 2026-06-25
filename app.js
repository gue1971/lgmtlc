function safeMarkup(s) {
  return String(s ?? "")
    .replaceAll("<strong>", "<strong>")
    .replaceAll("</strong>", "</strong>")
    .replaceAll("<br>", "<br>")
    .replaceAll("<red>", '<span class="red">')
    .replaceAll("</red>", "</span>");
}

function stabilizeNumbers(html) {
  return String(html ?? "").replace(/(?<![\w>])\d[\d,.]*(?:\s?%|\s?per cent|\s?°C|兆|万|億)?/g, '<span class="num">$&</span>');
}

function marked(s) {
  return stabilizeNumbers(safeMarkup(s));
}



const DATA = window.LINGUA_DATA;

const state = {
  view: "toc",
  passageId: null,
  mode: "english",
  accent: localStorage.getItem("accent") || "us",
  rate: Number(localStorage.getItem("rate") || "1")
};

const $app = document.getElementById("app");
const $footer = document.getElementById("footer");
const $headerTitle = document.getElementById("headerTitle");
const $headerSubtitle = document.getElementById("headerSubtitle");
const $headerPassage = document.getElementById("headerPassage");
const $backToTocTop = document.getElementById("backToTocTop");
const $prevPassageButton = document.getElementById("prevPassageButton");
const $nextPassageButton = document.getElementById("nextPassageButton");
const $audio = document.getElementById("audio");
const $viewToggleButton = document.getElementById("viewToggleButton");
const $rewindButton = document.getElementById("rewindButton");
const $playButton = document.getElementById("playButton");
const $forwardButton = document.getElementById("forwardButton");
const $rateSelect = document.getElementById("rateSelect");
const $accentToggleButton = document.getElementById("accentToggleButton");

function pad2(n) {
  return String(n).padStart(2, "0");
}

function audioUrl(id) {
  if (state.mode === "phrases") {
    return `https://juno.zkai.co.jp/contents/shoseki/lingua/lingua_passage${id}_phrase.mp3`;
  }
  return `https://juno.zkai.co.jp/contents/shoseki/lingua/lingua_passage${id}_eibun${state.accent === "us" ? "A" : "B"}.mp3`;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[ch]));
}


function iconBookOpen() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path class="stroke" d="M4.5 5.5h6.2c1 0 1.8.8 1.8 1.8v11.2c0-1.1-.9-2-2-2h-6V5.5Z"/>
    <path class="stroke" d="M19.5 5.5h-6.2c-1 0-1.8.8-1.8 1.8v11.2c0-1.1.9-2 2-2h6V5.5Z"/>
  </svg>`;
}

function iconPhraseList() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path class="stroke" d="M5 6h14M5 12h14M5 18h10"/>
    <circle class="fill" cx="4.8" cy="6" r="1"/>
    <circle class="fill" cx="4.8" cy="12" r="1"/>
    <circle class="fill" cx="4.8" cy="18" r="1"/>
  </svg>`;
}

function iconPlay() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path class="fill" d="M9 6.7c0-.75.83-1.2 1.46-.79l7.55 5.04c.56.37.56 1.19 0 1.56l-7.55 5.04A.94.94 0 0 1 9 16.76V6.7Z"/>
  </svg>`;
}

function iconPause() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <rect class="fill" x="7.6" y="6" width="3.2" height="12" rx="1"/>
    <rect class="fill" x="13.2" y="6" width="3.2" height="12" rx="1"/>
  </svg>`;
}

function iconBack2() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path class="stroke" d="M9.2 7.2H5.4V3.4"/>
    <path class="stroke" d="M6.1 7.1A7.2 7.2 0 1 1 5 12.4"/>
    <text class="svg-text" x="10.1" y="15.4">2</text>
  </svg>`;
}

function iconForward2() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path class="stroke" d="M14.8 7.2h3.8V3.4"/>
    <path class="stroke" d="M17.9 7.1A7.2 7.2 0 1 0 19 12.4"/>
    <text class="svg-text" x="10.1" y="15.4">2</text>
  </svg>`;
}

function setStaticIcons() {
  $rewindButton.innerHTML = iconBack2();
  $forwardButton.innerHTML = iconForward2();
}


function iconChevronLeft() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="stroke" d="M14.8 6.2 9 12l5.8 5.8"/></svg>`;
}
function iconChevronRight() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="stroke" d="M9.2 6.2 15 12l-5.8 5.8"/></svg>`;
}
function readyPassageIds() {
  return DATA.chapters.flatMap(ch => ch.items.map(item => item.id)).filter(id => Boolean(DATA.passages[String(id)]));
}
function adjacentPassageId(direction) {
  if (!state.passageId) return null;
  const ids = readyPassageIds();
  const index = ids.indexOf(state.passageId);
  if (index < 0) return null;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= ids.length) return null;
  return ids[nextIndex];
}
function updateHeaderNavigation() {
  const show = state.view === "passage";
  const prevId = adjacentPassageId(-1);
  const nextId = adjacentPassageId(1);
  $prevPassageButton.classList.toggle("hidden", !show || !prevId);
  $nextPassageButton.classList.toggle("hidden", !show || !nextId);
  $prevPassageButton.innerHTML = iconChevronLeft();
  $nextPassageButton.innerHTML = iconChevronRight();
}
function goAdjacentPassage(direction) {
  const id = adjacentPassageId(direction);
  if (id) renderPassage(id);
}

function setHeader(title, subtitle = "", showBack = false, passageLabel = "") {
  $headerPassage.textContent = passageLabel;
  $headerPassage.classList.toggle("hidden", !passageLabel);
  $headerTitle.textContent = title;
  $headerSubtitle.textContent = subtitle;
  $headerSubtitle.classList.toggle("hidden", !subtitle);
  $backToTocTop.classList.toggle("hidden", !showBack);
  updateHeaderNavigation();
}

function showFooter(show) {
  $footer.classList.toggle("hidden", !show);
  $app.classList.toggle("with-footer", show);
}

function renderToc() {
  state.view = "toc";
  state.passageId = null;
  setHeader(DATA.appTitle, "", false);
  showFooter(false);
  pauseAudio();
  updateHeaderNavigation();

  $app.innerHTML = `<div class="toc">${DATA.chapters.map(ch => `
    <section class="chapter">
      <h2 class="chapter-title">第${ch.chapter}章　${escapeHtml(ch.chapterTitle)}</h2>
      ${ch.items.map(item => {
        const ready = Boolean(DATA.passages[String(item.id)]);
        return `<button class="toc-item ${ready ? "" : "not-ready"}" data-passage-id="${item.id}">
          <span class="toc-number">${pad2(item.id)}</span>
          <span class="toc-title">${escapeHtml(item.titleJa)}</span>
        </button>`;
      }).join("")}
    </section>
  `).join("")}</div>`;

  $app.scrollTop = 0;
  $app.querySelectorAll("[data-passage-id]").forEach(button => {
    button.addEventListener("click", () => renderPassage(Number(button.dataset.passageId)));
  });
}

function findMeta(id) {
  for (const ch of DATA.chapters) {
    const found = ch.items.find(item => item.id === id);
    if (found) return found;
  }
  return null;
}

function renderPassage(id) {
  state.view = "passage";
  state.passageId = id;
  const meta = findMeta(id);
  const passage = DATA.passages[String(id)];

  setHeader(passage?.titleEn || meta?.titleJa || `Passage ${id}`, passage?.titleJa || meta?.titleJa || "", true, `Passage ${id}`);
  showFooter(true);
  syncFooterControls();
  updateHeaderNavigation();
  updateAudioSource();

  if (!passage) {
    $app.innerHTML = `<section class="passage">
      <div class="card empty-state">このPassageはまだ本文未登録です。<br>音声リンクだけ利用できます。</div>
    </section>`;
    $app.scrollTop = 0;
    return;
  }

  $app.innerHTML = `<section class="passage">${state.mode === "english" ? renderEnglish(passage) : renderPhrases(passage)}</section>`;
  $app.scrollTop = 0;
}

function renderEnglish(passage) {
  return `<div class="card">${passage.paragraphs.map(p => `
    <div class="paragraph">
      <button class="para-hit" data-translation-id="${p.number}" aria-label="${p.number}段落の訳を開く">
        <span class="para-num">${p.number}</span>
      </button>
      <div class="english-text">${marked(p.english)}</div>
      <div class="translation-box hidden" id="translation-${p.number}">${marked(p.translation)}</div>
    </div>
  `).join("")}</div>`;
}

function renderPhrases(passage) {
  const phrases = `<ul class="phrase-list">${passage.phrases.map(phrase => `
    <li class="phrase-card">
      <div class="phrase-en">${marked(phrase.english)}</div>
      <div class="phrase-ja">${marked(phrase.japanese)}</div>
      <div class="phrase-meta">
        <span class="pos-badge">${escapeHtml(phrase.pos || "")}</span>
        <span>${escapeHtml(phrase.phonetic || "")}</span>
      </div>
      <div class="phrase-meaning">${marked(phrase.meaning || "")}</div>
    </li>
  `).join("")}</ul>`;

  const poly = passage.polysemy?.length ? `
    <section class="poly-section">
      <h2 class="poly-title">多義語</h2>
      ${passage.polysemy.map(item => `
        <div class="poly-card">
          <div class="poly-head">${marked(item.headword)} <span class="pos-badge">${escapeHtml(item.pos || "")}</span></div>
          <div class="poly-meaning">${marked(item.meaning || "")}</div>
          <div class="poly-example">${marked(item.example || "")}</div>
          <div class="poly-translation">${marked(item.translation || "")}</div>
        </div>
      `).join("")}
    </section>` : "";

  return phrases + poly;
}

function syncFooterControls() {
  $viewToggleButton.innerHTML = state.mode === "english" ? iconPhraseList() : iconBookOpen();
  $viewToggleButton.setAttribute("aria-label", state.mode === "english" ? "フレーズへ" : "本文へ");
  $accentToggleButton.textContent = state.accent === "us" ? "🇺🇸" : "🇬🇧";
  $rateSelect.value = String(state.rate);
  setStaticIcons();
}

function updateAudioSource() {
  if (!state.passageId) return;
  const current = audioUrl(state.passageId);
  if ($audio.src !== current) {
    const wasPlaying = !$audio.paused;
    $audio.src = current;
    $audio.playbackRate = state.rate;
    if (wasPlaying) $audio.play().catch(() => {});
  }
}

function pauseAudio() {
  $audio.pause();
  $playButton.innerHTML = iconPlay();
}

function togglePlay() {
  if (!$audio.src && state.passageId) updateAudioSource();
  if ($audio.paused) {
    $audio.playbackRate = state.rate;
    $audio.play().then(() => {
      $playButton.innerHTML = iconPause();
    }).catch(() => {
      $playButton.innerHTML = iconPlay();
      alert("音声を再生できませんでした。通信状態かリンクを確認してください。");
    });
  } else {
    pauseAudio();
  }
}

document.addEventListener("click", e => {
  const hit = e.target.closest(".para-hit");
  if (hit) {
    const box = document.getElementById(`translation-${hit.dataset.translationId}`);
    if (box) box.classList.toggle("hidden");
  }
});

$backToTocTop.addEventListener("click", renderToc);

$viewToggleButton.addEventListener("click", () => {
  state.mode = state.mode === "english" ? "phrases" : "english";
  renderPassage(state.passageId);
});

$accentToggleButton.addEventListener("click", () => {
  state.accent = state.accent === "us" ? "uk" : "us";
  localStorage.setItem("accent", state.accent);
  syncFooterControls();
  updateAudioSource();
});

$rewindButton.addEventListener("click", () => {
  if (!$audio.src && state.passageId) updateAudioSource();
  $audio.currentTime = Math.max(0, ($audio.currentTime || 0) - 2);
});

$forwardButton.addEventListener("click", () => {
  if (!$audio.src && state.passageId) updateAudioSource();
  const nextTime = ($audio.currentTime || 0) + 2;
  $audio.currentTime = Number.isFinite($audio.duration) ? Math.min($audio.duration, nextTime) : nextTime;
});

$playButton.addEventListener("click", togglePlay);

$rateSelect.addEventListener("change", () => {
  state.rate = Number($rateSelect.value);
  localStorage.setItem("rate", String(state.rate));
  $audio.playbackRate = state.rate;
});

$audio.addEventListener("ended", () => { $playButton.innerHTML = iconPlay(); });
$audio.addEventListener("pause", () => { $playButton.innerHTML = iconPlay(); });
$audio.addEventListener("play", () => { $playButton.innerHTML = iconPause(); });


$prevPassageButton.addEventListener("click", () => goAdjacentPassage(-1));
$nextPassageButton.addEventListener("click", () => goAdjacentPassage(1));

let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let touchStartedOnText = false;
let selectionGestureActive = false;
let selectionGestureTimer = 0;

function hasActiveTextSelection() {
  const selection = window.getSelection?.();
  return !!selection && !selection.isCollapsed && selection.toString().trim().length > 0;
}

function isSelectableTextTarget(target) {
  return !!target.closest?.(
    ".english-text, .translation-box, .phrase-en, .phrase-ja, .phrase-meaning, .poly-card, .poly-example, .poly-translation"
  );
}

document.addEventListener("selectionchange", () => {
  if (!hasActiveTextSelection()) return;
  selectionGestureActive = true;
  clearTimeout(selectionGestureTimer);
  selectionGestureTimer = setTimeout(() => { selectionGestureActive = false; }, 900);
});

$app.addEventListener("touchstart", event => {
  if (state.view !== "passage" || event.touches.length !== 1) return;
  if (hasActiveTextSelection()) {
    touchStartTime = 0;
    selectionGestureActive = true;
    return;
  }
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
  touchStartTime = Date.now();
  touchStartedOnText = isSelectableTextTarget(event.target);
}, { passive: true });

$app.addEventListener("touchmove", () => {
  if (hasActiveTextSelection()) selectionGestureActive = true;
}, { passive: true });

$app.addEventListener("touchcancel", () => {
  touchStartTime = 0;
  touchStartedOnText = false;
}, { passive: true });

$app.addEventListener("touchend", event => {
  if (state.view !== "passage" || !touchStartTime || event.changedTouches.length !== 1) return;
  const dx = event.changedTouches[0].clientX - touchStartX;
  const dy = event.changedTouches[0].clientY - touchStartY;
  const elapsed = Date.now() - touchStartTime;
  const startedOnText = touchStartedOnText;
  touchStartTime = 0;
  touchStartedOnText = false;

  // Text selection and page swipe are intentionally separated:
  // - If text is currently selected, or selection just started, never change passages.
  // - If the gesture began on selectable text and was not a quick flick, treat it as reading/selection.
  if (hasActiveTextSelection() || selectionGestureActive) return;
  if (startedOnText && elapsed > 360) return;
  if (elapsed > 650) return;
  if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 1.7) return;
  if (dx < 0) goAdjacentPassage(1);
  else goAdjacentPassage(-1);
}, { passive: true });

setStaticIcons();
$playButton.innerHTML = iconPlay();
renderToc();


// Prevent iOS/Safari double-tap zoom on fast repeated taps of footer controls.
// This is scoped to the footer only, so normal page pinch zoom and text zoom remain available.
(function preventFooterDoubleTapZoom() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const footerControl = event.target.closest(
      '.footer, .player-footer, .bottom-bar, button, select, .control-btn, .icon-btn, .speed-select'
    );
    if (!footerControl) return;

    const now = Date.now();
    if (now - lastTouchEnd <= 320) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener('dblclick', (event) => {
    const footerControl = event.target.closest(
      '.footer, .player-footer, .bottom-bar, button, select, .control-btn, .icon-btn, .speed-select'
    );
    if (!footerControl) return;
    event.preventDefault();
  }, { passive: false });
})();

