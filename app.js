
const DATA = window.LINGUA_DATA;

const state = {
  view: "toc",
  passageId: null,
  mode: "english",
  accent: localStorage.getItem("accent") || "us",
  rate: Number(localStorage.getItem("rate") || "1"),
};

const $app = document.getElementById("app");
const $footer = document.getElementById("footer");
const $headerTitle = document.getElementById("headerTitle");
const $backToTocTop = document.getElementById("backToTocTop");
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

function audioUrl(id, accent) {
  const suffix = accent === "us" ? "A" : "B";
  return `https://juno.zkai.co.jp/contents/shoseki/lingua/lingua_passage${id}_eibun${suffix}.mp3`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[ch]));
}

function safeMarkup(s) {
  return String(s)
    .replaceAll("<red>", "<span class=\"red\">")
    .replaceAll("</red>", "</span>");
}

function setHeader(title, showBack = false) {
  $headerTitle.textContent = title;
  $backToTocTop.classList.toggle("hidden", !showBack);
}

function showFooter(show) {
  $footer.classList.toggle("hidden", !show);
  $app.classList.toggle("with-footer", show);
}

function renderToc() {
  state.view = "toc";
  state.passageId = null;
  document.body.classList.remove("phrase-mode");
  setHeader(DATA.appTitle, false);
  showFooter(false);
  pauseAudio();

  const html = DATA.chapters.map(ch => `
    <section class="chapter">
      <h2 class="chapter-title">第${ch.chapter}章　${escapeHtml(ch.chapterTitle)}</h2>
      ${ch.items.map(item => {
        const ready = Boolean(DATA.passages[String(item.id)]);
        return `
          <button class="toc-item ${ready ? "" : "not-ready"}" data-passage-id="${item.id}">
            <span class="toc-number">${pad2(item.id)}</span>
            <span class="toc-title">${escapeHtml(item.titleJa)}</span>
          </button>
        `;
      }).join("")}
    </section>
  `).join("");

  $app.innerHTML = `<div class="toc">${html}</div>`;
  $app.scrollTop = 0;

  $app.querySelectorAll("[data-passage-id]").forEach(button => {
    button.addEventListener("click", () => renderPassage(Number(button.dataset.passageId)));
  });
}

function renderPassage(id) {
  state.view = "passage";
  state.passageId = id;
  const meta = findMeta(id);
  const passage = DATA.passages[String(id)];

  setHeader(passage?.titleEn || meta?.titleJa || `Passage ${id}`, true);
  showFooter(true);
  document.body.classList.toggle("phrase-mode", state.mode === "phrases");
  syncFooterControls();
  updateAudioSource();

  if (!passage) {
    $app.innerHTML = `
      <section class="passage">
        <p class="passage-subtitle">Passage ${pad2(id)} / ${escapeHtml(meta?.titleJa || "")}</p>
        <div class="card empty-state">
          このPassageはまだ本文未登録です。<br>
          音声リンクだけ利用できます。
        </div>
      </section>
    `;
    $app.scrollTop = 0;
    return;
  }

  const body = state.mode === "english" ? renderEnglish(passage) : renderPhrases(passage);

  $app.innerHTML = `
    <section class="passage">
      <p class="passage-subtitle">Passage ${pad2(id)} / ${escapeHtml(passage.titleJa)}</p>
      ${body}
    </section>
  `;
  $app.scrollTop = 0;
}

function findMeta(id) {
  for (const ch of DATA.chapters) {
    const found = ch.items.find(item => item.id === id);
    if (found) return found;
  }
  return null;
}

function renderEnglish(passage) {
  return `
    <div class="card">
      ${passage.paragraphs.map(p => `
        <div class="paragraph">
          <div><span class="para-num">${p.number}</span></div>
          <div class="english-text">${safeMarkup(p.english)}</div>
          <button class="translation-toggle" data-translation-id="${p.number}">訳を開く</button>
          <div class="translation-box hidden" id="translation-${p.number}">${safeMarkup(p.translation)}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderPhrases(passage) {
  return `
    <ul class="phrase-list">
      ${passage.phrases.map(phrase => `
        <li class="phrase-card">
          <div class="phrase-en">${safeMarkup(phrase.english)}</div>
          <div class="phrase-ja">${safeMarkup(phrase.japanese)}</div>
        </li>
      `).join("")}
    </ul>
  `;
}

function syncFooterControls() {
  $viewToggleButton.textContent = state.mode === "english" ? "本文" : "フレーズ";
  $accentToggleButton.textContent = state.accent === "us" ? "🇺🇸" : "🇬🇧";
  $rateSelect.value = String(state.rate);
}

function updateAudioSource() {
  if (!state.passageId) return;
  const current = audioUrl(state.passageId, state.accent);
  if ($audio.src !== current) {
    const wasPlaying = !$audio.paused;
    $audio.src = current;
    $audio.playbackRate = state.rate;
    if (wasPlaying) $audio.play().catch(() => {});
  }
}

function pauseAudio() {
  $audio.pause();
  $playButton.textContent = "▶︎";
}

function togglePlay() {
  if (!$audio.src && state.passageId) updateAudioSource();
  if ($audio.paused) {
    $audio.playbackRate = state.rate;
    $audio.play().then(() => {
      $playButton.textContent = "Ⅱ";
    }).catch(() => {
      $playButton.textContent = "▶︎";
      alert("音声を再生できませんでした。通信状態かリンクを確認してください。");
    });
  } else {
    pauseAudio();
  }
}

document.addEventListener("click", e => {
  const toggle = e.target.closest(".translation-toggle");
  if (toggle) {
    const box = document.getElementById(`translation-${toggle.dataset.translationId}`);
    const isHidden = box.classList.toggle("hidden");
    toggle.textContent = isHidden ? "訳を開く" : "訳を閉じる";
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
  if (Number.isFinite($audio.duration)) {
    $audio.currentTime = Math.min($audio.duration, nextTime);
  } else {
    $audio.currentTime = nextTime;
  }
});

$playButton.addEventListener("click", togglePlay);

$rateSelect.addEventListener("change", () => {
  state.rate = Number($rateSelect.value);
  localStorage.setItem("rate", String(state.rate));
  $audio.playbackRate = state.rate;
});

$audio.addEventListener("ended", () => { $playButton.textContent = "▶︎"; });
$audio.addEventListener("pause", () => { $playButton.textContent = "▶︎"; });
$audio.addEventListener("play", () => { $playButton.textContent = "Ⅱ"; });

renderToc();
