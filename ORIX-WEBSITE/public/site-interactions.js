"use strict";
const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const motionControl = document.getElementById("motion-control");
let userMotionEnabled = true;
const systemLight = matchMedia("(prefers-color-scheme: light)");
let openingTimers = [];
let connectionTimers = [];
const motionAllowed = () => root.dataset.effects === "on";
function transitionVisual(element) {
  if (motionAllowed())
    element.animate(
      [
        { opacity: 0.2, filter: "blur(4px)", translate: "0 14px" },
        { opacity: 1, filter: "blur(0px)", translate: "0 0" },
      ],
      { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
}
const shell = document.getElementById("notch-shell");
const notchTrigger = document.getElementById("notch-trigger");
const notchBody = document.getElementById("notch-body");
function stopOpening() {
  openingTimers.forEach(clearTimeout);
  openingTimers = [];
}
function setNotch(state) {
  const expanded = state !== "collapsed";
  shell.classList.remove("scrubbing");
  shell.dataset.state = state;
  const chapter =
    state === "collapsed" ? "collapsed" : state === "note" ? "note" : "home";
  document.getElementById("opening-progress").value =
    chapter === "collapsed" ? 0 : chapter === "home" ? 50 : 100;
  document
    .getElementById("opening-progress")
    .setAttribute(
      "aria-valuetext",
      `${chapter === "collapsed" ? "Resting" : chapter === "home" ? "Tools" : "Note"} phase`,
    );
  document
    .querySelectorAll("[data-chapter]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.chapter === chapter),
      ),
    );
  notchTrigger.hidden = expanded;
  notchTrigger.setAttribute("aria-expanded", String(expanded));
  notchBody.hidden = !expanded;
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== state;
  });
  if (expanded)
    transitionVisual(document.querySelector(`[data-panel="${state}"]`));
}
function openNotch(state = "home") {
  stopOpening();
  document.querySelector(".notch-anchor").hidden = false;
  document.getElementById("layer-switch").setAttribute("aria-checked", "true");
  document.getElementById("visibility-status").textContent =
    "Hiding the layer leaves enabled tools running.";
  setNotch(state);
}
document
  .querySelectorAll("[data-chapter]")
  .forEach((button) =>
    button.addEventListener("click", () => openNotch(button.dataset.chapter)),
  );
function scrubOpening() {
  stopOpening();
  const control = document.getElementById("opening-progress");
  const value = Number(control.value);
  const progress = value / 100;
  const state =
    progress < 0.38 ? "collapsed" : progress < 0.8 ? "home" : "note";
  if (shell.dataset.state !== state || !motionAllowed()) setNotch(state);
  if (motionAllowed()) {
    const width = Math.min(
      400,
      document.querySelector(".notch-anchor").clientWidth,
    );
    shell.style.setProperty(
      "--scrub-width",
      `${164 + (width - 164) * Math.min(1, progress * 2)}px`,
    );
    shell.style.setProperty(
      "--scrub-height",
      `${48 + 212 * Math.min(1, progress * 2) + 33 * Math.max(0, progress * 2 - 1)}px`,
    );
    shell.classList.add("scrubbing");
  }
  control.value = value;
}
document
  .getElementById("opening-progress")
  .addEventListener("input", scrubOpening);
function replayOpening() {
  stopOpening();
  if (!motionAllowed()) {
    openNotch();
    return;
  }
  setNotch("collapsed");
  openingTimers = [
    setTimeout(() => setNotch("home"), 550),
    setTimeout(() => setNotch("note"), 1400),
    setTimeout(() => setNotch("home"), 2750),
  ];
}
notchTrigger.addEventListener("click", () => openNotch());
document.getElementById("notch-close").addEventListener("click", () => {
  stopOpening();
  setNotch("collapsed");
  notchTrigger.focus();
});
document.querySelectorAll("[data-open]").forEach((button) =>
  button.addEventListener("click", () => {
    openNotch(button.dataset.open);
    document
      .querySelector(`[data-panel="${button.dataset.open}"] [data-back]`)
      .focus();
  }),
);
document.querySelectorAll("[data-back]").forEach((button) =>
  button.addEventListener("click", () => {
    openNotch();
    document.querySelector(".notch-tools button").focus();
  }),
);
document.getElementById("try-layer").addEventListener("click", () => {
  openNotch();
  document.getElementById("demo").scrollIntoView({
    behavior: motionAllowed() ? "smooth" : "instant",
    block: "center",
  });
});
document.getElementById("replay-layer").addEventListener("click", () => {
  openNotch();
  replayOpening();
});
document.querySelectorAll("[data-sample-copy]").forEach((button) =>
  button.addEventListener("click", () => {
    document.getElementById("sample-note").value = button.dataset.sampleCopy;
    document.getElementById("copy-status").textContent =
      "Added to the sample note.";
    openNotch("note");
    document.getElementById("sample-note").focus();
  }),
);
let remaining = 25 * 60;
let deadline = 0;
let focusInterval;
const focusToggle = document.getElementById("focus-toggle");
function renderFocus() {
  document.getElementById("focus-time").textContent =
    `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
}
function pauseFocus() {
  clearInterval(focusInterval);
  focusInterval = undefined;
  focusToggle.textContent = remaining ? "Resume focus" : "Start again";
}
function tickFocus() {
  remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  renderFocus();
  if (!remaining) {
    pauseFocus();
    document.getElementById("focus-status").textContent =
      "Sample session complete.";
  }
}
focusToggle.addEventListener("click", () => {
  if (focusInterval) {
    tickFocus();
    pauseFocus();
    document.getElementById("focus-status").textContent = remaining
      ? "Sample session paused."
      : "Sample session complete.";
  } else {
    if (!remaining) remaining = 1500;
    deadline = Date.now() + remaining * 1000;
    focusInterval = setInterval(tickFocus, 250);
    focusToggle.textContent = "Pause focus";
    document.getElementById("focus-status").textContent =
      "Sample session running.";
    renderFocus();
  }
});
document.getElementById("focus-reset").addEventListener("click", () => {
  pauseFocus();
  remaining = 1500;
  renderFocus();
  focusToggle.textContent = "Start focus";
  document.getElementById("focus-status").textContent =
    "A 25-minute sample session.";
});
const tools = {
  note: {
    name: "Notes",
    title: "Keep a thought close.",
    description: "A nearby place to write something down and pick it up again.",
  },
  focus: {
    name: "Focus",
    title: "One thing at a time.",
    description:
      "Start a focus session and let its progress stay within reach.",
  },
  clipboard: {
    name: "Clipboard",
    title: "Find the text again.",
    description:
      "Revisit text while Clipboard is enabled. The app keeps up to eight entries in memory.",
  },
  files: {
    name: "File tray",
    title: "Keep useful files nearby.",
    description: "A place for references to the files you keep coming back to.",
  },
};

const storySamples = {
  note: {
    input: "A thought, before it disappears",
    content: "Make something worth coming back to.",
    rows: ["A place to start", "A thought to return to"],
    result: "Ready in your Notes",
    icon: "note",
  },
  focus: {
    input: "One task in front of you",
    content:
      '<span class="work-timer">25:00</span><div class="work-progress"><i></i></div>',
    rows: ["Space for your next idea", "A session within reach"],
    result: "Your focus session is ready",
    icon: "timer",
  },
  clipboard: {
    input: "A prepared text fragment",
    content: "Your desktop, within reach.",
    rows: ["A thought worth keeping", "Find it without searching"],
    result: "Recent text, close at hand",
    icon: "clip",
  },
  files: {
    input: "A reference for your next project",
    content: "ideas.md",
    rows: ["project-outline.pdf", "A reference to the original file"],
    result: "Your useful files, together",
    icon: "folder",
  },
};
let selectedTool = "note";
let storyTimer;
let storyPlaying = false;
let storyVisible = false;
const storyKeys = Object.keys(tools);
const tourTrack = document.getElementById("tour-track");
const tourStage = tourTrack.querySelector(".tour-stage");
const storyButton = document.getElementById("tour-play");
const pinQuery = matchMedia("(min-width: 1100px) and (min-height: 760px)");
function renderTool(key) {
  selectedTool = key;
  const item = tools[key];
  const sample = storySamples[key];
  document
    .querySelectorAll("[data-tool], [data-tour]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String((button.dataset.tool || button.dataset.tour) === key),
      ),
    );
  document.getElementById("tool-title").textContent = item.title;
  document.getElementById("tool-description").textContent = item.description;
  document.getElementById("open-selected-tool").textContent =
    `Try ${item.name} in the layer ↑`;
  document.getElementById("tool-sketch").innerHTML =
    `<div class="work-top"><span>${item.name.toUpperCase()} / ILLUSTRATIVE</span><img src="/brand/orix-icon.svg" alt="" /></div><div class="work-body"><div class="work-input work-build">${sample.input}</div><div class="work-content work-build" style="--delay:150ms">${sample.content}</div>${sample.rows.map((row, index) => `<div class="work-row work-build" style="--delay:${450 + index * 250}ms"><svg class="icon" aria-hidden="true"><use href="#${sample.icon}" /></svg><span>${row}</span></div>`).join("")}<div class="work-result work-build" style="--delay:1100ms">${sample.result}</div></div>`;
  document.getElementById("tour-progress").style.width =
    `${(storyKeys.indexOf(key) + 1) * 25}%`;
}
function stopStory() {
  clearTimeout(storyTimer);
  storyPlaying = false;
  storyButton.textContent = "Play tool story";
  storyButton.setAttribute("aria-pressed", "false");
}
function tourPosition(index) {
  const travel = tourTrack.offsetHeight - tourStage.offsetHeight;
  return (
    scrollY +
    tourTrack.getBoundingClientRect().top -
    88 +
    (travel * (index + 0.16)) / 4
  );
}
function updateTour() {
  const pinned = pinQuery.matches && motionAllowed();
  tourTrack.dataset.pinned = String(pinned);
  storyButton.hidden = !motionAllowed();
  document.getElementById("tour-hint").textContent = pinned
    ? "Scroll to explore · or choose a chapter."
    : "Choose a chapter or play the story.";
  if (!pinned || storyPlaying || !storyVisible) return;
  const travel = tourTrack.offsetHeight - tourStage.offsetHeight;
  const distance = 88 - tourTrack.getBoundingClientRect().top;
  if (distance < 0 || distance > travel) return;
  const key = storyKeys[Math.min(3, Math.floor((distance / travel) * 4))];
  if (key !== selectedTool) renderTool(key);
}
document.querySelectorAll("[data-tool], [data-tour]").forEach((button) =>
  button.addEventListener("click", () => {
    stopStory();
    const key = button.dataset.tool || button.dataset.tour;
    renderTool(key);
    if (tourTrack.dataset.pinned === "true")
      scrollTo({
        top: tourPosition(storyKeys.indexOf(key)),
        behavior: "instant",
      });
  }),
);
storyButton.addEventListener("click", () => {
  if (storyPlaying) {
    stopStory();
    return;
  }
  storyPlaying = true;
  storyButton.textContent = "Pause tool story";
  storyButton.setAttribute("aria-pressed", "true");
  let index = 0;
  function advance() {
    renderTool(storyKeys[index]);
    document.getElementById("tour-status").textContent =
      `${index + 1} of 4. ${tools[storyKeys[index]].title}`;
    index++;
    if (index < storyKeys.length) storyTimer = setTimeout(advance, 3200);
    else
      storyTimer = setTimeout(() => {
        stopStory();
        storyButton.textContent = "Replay tool story";
      }, 2400);
  }
  advance();
});
["wheel", "touchstart"].forEach((type) =>
  addEventListener(type, stopStory, { passive: true }),
);
addEventListener("keydown", (event) => {
  if (
    [
      "PageDown",
      "PageUp",
      "Home",
      "End",
      "ArrowDown",
      "ArrowUp",
      "Escape",
    ].includes(event.key)
  )
    stopStory();
});
if ("IntersectionObserver" in window)
  new IntersectionObserver(
    (entries) => {
      storyVisible = entries[0].isIntersecting;
      tourTrack.classList.toggle("in-view", storyVisible);
      if (!storyVisible) stopStory();
      updateTour();
    },
    { threshold: 0 },
  ).observe(tourTrack);
else {
  storyVisible = true;
  tourTrack.classList.add("in-view");
}
renderTool("note");
document.getElementById("open-selected-tool").addEventListener("click", () => {
  openNotch(selectedTool);
  document.getElementById("demo").scrollIntoView({
    behavior: motionAllowed() ? "smooth" : "instant",
    block: "center",
  });
  document
    .querySelector(`[data-panel="${selectedTool}"] [data-back]`)
    .focus({ preventScroll: true });
});
document.querySelectorAll(".glass-tile").forEach((tile) => {
  tile.addEventListener("pointermove", (event) => {
    if (!motionAllowed() || event.pointerType !== "mouse") return;
    const bounds = tile.getBoundingClientRect();
    tile.style.setProperty(
      "--pointer-x",
      `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
    );
    tile.style.setProperty(
      "--pointer-y",
      `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
    );
  });
});
const heroRegion = document.getElementById("overview");
let handoffQueued = false;
function updateHeroHandoff() {
  handoffQueued = false;
  updateTour();
  const header = document.querySelector(".topbar");
  const section = [...document.querySelectorAll("main > section")].find(
    (section) => {
      const bounds = section.getBoundingClientRect();
      return (
        bounds.top <= header.offsetHeight + 2 &&
        bounds.bottom > header.offsetHeight + 2
      );
    },
  );
  header.dataset.surface =
    section &&
    (section.classList.contains("light-section") || section.id === "appearance")
      ? "light"
      : "dark";
  const bounds = document.getElementById("demo").getBoundingClientRect();
  const progress =
    motionAllowed() && innerWidth >= 1000
      ? Math.max(0, Math.min(1, (innerHeight * 0.5 - bounds.top) / 280))
      : 0;
  heroRegion.style.setProperty("--handoff", progress.toFixed(3));
}
addEventListener(
  "scroll",
  () => {
    if (!handoffQueued) {
      handoffQueued = true;
      requestAnimationFrame(updateHeroHandoff);
    }
  },
  { passive: true },
);
addEventListener("resize", () => {
  updateHeroHandoff();
  if (shell.classList.contains("scrubbing")) scrubOpening();
});
const connections = {
  claude: {
    name: "Claude Code",
    description:
      "Keep supported Claude Code session information in the layer. See when your work is ready for attention, with the local integration configured in ORIX.",
  },
  codex: {
    name: "Codex",
    description:
      "Follow supported Codex sessions from the layer. Monitoring has its own setup path, so your current task can stay close while you work.",
  },
  chatgpt: {
    name: "ChatGPT",
    description:
      "Configure the ChatGPT provider to request AI responses through its account connection. Selected requests are processed by the provider.",
  },
  spotify: {
    name: "Spotify",
    description:
      "Optional playback controls for your listening. Connect your account and playback device in ORIX. Spotify requirements apply to the requested operation.",
  },
};
let selectedConnection = "claude";
const connectionPreview = document.getElementById("connection-preview");
function renderConnection(key) {
  connectionTimers.forEach(clearTimeout);
  connectionTimers = [];
  selectedConnection = key;
  const item = connections[key];
  document.getElementById("integration-name").textContent = item.name;
  document.getElementById("integration-description").textContent =
    item.description;
  connectionPreview.classList.remove("playing");
  if (key === "spotify")
    connectionPreview.innerHTML =
      '<div class="preview-bar"><span>SPOTIFY / VISUAL SAMPLE</span><span>SILENT PREVIEW</span></div><div class="music-row"><div class="album" aria-hidden="true"></div><div><h3>A little headspace.</h3><p>Prepared sample track</p></div></div><div class="equalizer" aria-hidden="true"><i class="ambient" style="--i:0"></i><i class="ambient" style="--i:1"></i><i class="ambient" style="--i:2"></i><i class="ambient" style="--i:3"></i><i class="ambient" style="--i:4"></i><i class="ambient" style="--i:5"></i></div><button class="sample-action" id="connection-action">Play visual preview</button><span class="sample-hint" id="connection-status" role="status">Silent illustration · Spotify stays separate</span>';
  else if (key === "chatgpt")
    connectionPreview.innerHTML =
      '<div class="preview-bar"><span>CHATGPT / PREPARED CONVERSATION</span><span>ILLUSTRATIVE</span></div><div class="chat-bubble">Where should a new idea start?</div><div class="chat-reply" id="sample-reply" hidden>With a little space to think. Keep a note close and build from there.</div><button class="sample-action" id="connection-action">Show sample response</button><span class="sample-hint" id="connection-status" role="status">Prepared text · no provider request</span>';
  else
    connectionPreview.innerHTML = `<div class="preview-bar"><span>${item.name.toUpperCase()} / SAMPLE SESSION</span><span>ILLUSTRATIVE</span></div><div class="workflow-row"><span>your-next-idea</span><span id="session-phase">Ready for review</span></div><div class="workflow-row"><span>Changes prepared</span><span id="session-result">Session complete</span></div><button class="sample-action" id="connection-action">Run sample session</button><span class="sample-hint" id="connection-status" role="status">Prepared sample data · no provider connection</span>`;
  const route = document.getElementById("signal-route");
  route.dataset.state = "idle";
  document.getElementById("signal-destination").textContent = item.name;
  connectionPreview.dataset.running = "false";
  transitionVisual(connectionPreview);
}
document.querySelectorAll("[data-integration]").forEach((button, index) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll("[data-integration]")
      .forEach((choice) =>
        choice.setAttribute("aria-pressed", String(choice === button)),
      );
    document
      .getElementById("glass-grid")
      .style.setProperty("--selected", index);
    renderConnection(button.dataset.integration);
  }),
);
connectionPreview.addEventListener("click", (event) => {
  const button = event.target.closest("#connection-action");
  if (!button) return;
  const route = document.getElementById("signal-route");
  route.dataset.state = "working";
  if (selectedConnection === "spotify") {
    const playing = connectionPreview.classList.toggle("playing");
    route.dataset.state = playing ? "complete" : "idle";
    button.textContent = playing
      ? "Pause visual preview"
      : "Play visual preview";
    document.getElementById("connection-status").textContent = playing
      ? "Silent visual sample running."
      : "Silent visual sample paused.";
  } else if (selectedConnection === "chatgpt") {
    const reply = document.getElementById("sample-reply");
    reply.hidden = !reply.hidden;
    route.dataset.state = reply.hidden ? "idle" : "complete";
    button.textContent = reply.hidden ? "Show sample response" : "Reset sample";
    if (!reply.hidden) transitionVisual(reply);
  } else {
    button.disabled = true;
    connectionPreview.dataset.running = "true";
    document.getElementById("session-phase").textContent = "Working…";
    document.getElementById("session-result").textContent = "Preparing changes";
    document.getElementById("connection-status").textContent =
      "Sample session running.";
    transitionVisual(connectionPreview);
    connectionTimers.push(
      setTimeout(() => {
        document.getElementById("session-phase").textContent =
          "Ready for review";
        document.getElementById("session-result").textContent =
          "Session complete";
        document.getElementById("connection-status").textContent =
          "Sample complete. Your attention is needed.";
        route.dataset.state = "complete";
        connectionPreview.dataset.running = "false";
        button.disabled = false;
        button.textContent = "Replay sample session";
        transitionVisual(connectionPreview);
      }, 1600),
    );
  }
});
const galleryViews = ["overview", "controls", "connections"];
const galleryNames = ["Overview", "Layer controls", "Connections"];
let galleryIndex = 0;
let selectedTheme = "dark";
const dashboard = document.getElementById("dashboard-image");
dashboard.dataset.dark = dashboard.src;
document.getElementById("hero-dashboard").src = dashboard.src;
document.getElementById("dialog-image").src = dashboard.src;
function applyGallery() {
  const light =
    selectedTheme === "light" ||
    (selectedTheme === "system" && systemLight.matches);
  const theme = light ? "Light" : "Dark";
  const nextSource = light ? dashboard.dataset.light : dashboard.dataset.dark;
  if (dashboard.getAttribute("src") !== nextSource) dashboard.src = nextSource;
  dashboard.alt = `Actual ORIX beta Overview dashboard in ${theme} mode, showing ${galleryNames[galleryIndex].toLowerCase()}`;
  document.getElementById("gallery-frame").dataset.view =
    galleryViews[galleryIndex];
  document.getElementById("capture-caption").textContent =
    `ACTUAL ORIX BETA / ${theme.toUpperCase()} / ${galleryNames[galleryIndex].toUpperCase()}`;
  document.getElementById("gallery-position").textContent =
    `0${galleryIndex + 1} / 03`;
  document
    .querySelectorAll("[data-gallery]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.gallery === galleryViews[galleryIndex]),
      ),
    );
  transitionVisual(document.getElementById("gallery-frame"));
}
document.querySelectorAll("[data-theme]").forEach((button) =>
  button.addEventListener("click", () => {
    selectedTheme = button.dataset.theme;
    document
      .querySelectorAll("[data-theme]")
      .forEach((choice) =>
        choice.setAttribute("aria-pressed", String(choice === button)),
      );
    applyGallery();
  }),
);
systemLight.addEventListener("change", () => {
  if (selectedTheme === "system") applyGallery();
});
document.querySelectorAll("[data-gallery]").forEach((button) =>
  button.addEventListener("click", () => {
    galleryIndex = galleryViews.indexOf(button.dataset.gallery);
    applyGallery();
  }),
);
document.getElementById("gallery-prev").addEventListener("click", () => {
  galleryIndex = (galleryIndex + 2) % 3;
  applyGallery();
});
document.getElementById("gallery-next").addEventListener("click", () => {
  galleryIndex = (galleryIndex + 1) % 3;
  applyGallery();
});
const captureDialog = document.getElementById("capture-dialog");
document.getElementById("zoom-capture").addEventListener("click", () => {
  document.getElementById("dialog-image").src = dashboard.src;
  document.getElementById("dialog-title").textContent =
    document.getElementById("capture-caption").textContent;
  captureDialog.showModal();
});
captureDialog.addEventListener("click", (event) => {
  if (event.target === captureDialog) captureDialog.close();
});
document.getElementById("layer-switch").addEventListener("click", (event) => {
  const visible = event.currentTarget.getAttribute("aria-checked") !== "true";
  event.currentTarget.setAttribute("aria-checked", String(visible));
  document.querySelector(".notch-anchor").hidden = !visible;
  document.getElementById("visibility-status").textContent = visible
    ? "Hiding the layer leaves enabled tools running."
    : "Sample layer hidden. A running focus timer continues.";
  if (!visible) stopOpening();
});
const menuButton = document.getElementById("menu-toggle");
const navigation = document.getElementById("navigation");
function closeMenu(restoreFocus = false) {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  if (open) navigation.querySelector("a").focus();
});
navigation.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    closeMenu();
    const target = link.hash && document.querySelector(link.hash);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open"))
    closeMenu(true);
});
matchMedia("(min-width: 761px)").addEventListener("change", () => closeMenu());
const canvas = document.getElementById("terrain");
const terrainContext = canvas.getContext("2d");
let terrainVisible = false;
let terrainFrame = 0;
let lastPaint = 0;
function drawTerrain(time = 0) {
  if (!terrainContext) return;
  const width = canvas.clientWidth,
    height = canvas.clientHeight;
  terrainContext.clearRect(0, 0, width, height);
  const phase = time / 1900;
  for (let row = 0; row < 15; row++) {
    terrainContext.beginPath();
    for (let col = 0; col < 50; col++) {
      const x = (col * width) / 49;
      const y =
        55 +
        row * 12 +
        Math.sin(col * 0.15 + phase + row * 0.2) * 24 +
        Math.sin(col * 0.08 - phase) * 22;
      if (col === 0) terrainContext.moveTo(x, y);
      else terrainContext.lineTo(x, y);
    }
    terrainContext.strokeStyle = `rgba(164,200,255,${0.1 + row * 0.014})`;
    terrainContext.lineWidth = 0.7;
    terrainContext.stroke();
    for (let col = 0; col < 50; col++) {
      const x = (col * width) / 49,
        y =
          55 +
          row * 12 +
          Math.sin(col * 0.15 + phase + row * 0.2) * 24 +
          Math.sin(col * 0.08 - phase) * 22;
      terrainContext.beginPath();
      terrainContext.arc(x, y, row % 3 === 0 ? 1.3 : 0.7, 0, Math.PI * 2);
      terrainContext.fillStyle = row % 3 === 0 ? "#dceaff" : "#a4c8ff";
      terrainContext.fill();
    }
  }
}
function paintTerrain(time) {
  if (time - lastPaint > 33) {
    drawTerrain(time);
    lastPaint = time;
  }
  terrainFrame = requestAnimationFrame(paintTerrain);
}
function updateTerrain() {
  cancelAnimationFrame(terrainFrame);
  terrainFrame = 0;
  if (terrainContext && terrainVisible && !document.hidden && motionAllowed())
    terrainFrame = requestAnimationFrame(paintTerrain);
  else drawTerrain();
}
function resizeTerrain() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  if (terrainContext) terrainContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawTerrain();
}
resizeTerrain();
addEventListener("resize", resizeTerrain);
document.addEventListener("visibilitychange", updateTerrain);
if ("IntersectionObserver" in window) {
  const regionObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
        if (entry.target.id === "get-orix") {
          terrainVisible = entry.isIntersecting;
          updateTerrain();
        }
      }),
    { threshold: 0 },
  );
  document
    .querySelectorAll(".motion-region")
    .forEach((region) => regionObserver.observe(region));
  const revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      }),
    { threshold: 0.18 },
  );
  document
    .querySelectorAll(".visual-reveal")
    .forEach((visual) => revealObserver.observe(visual));
}
function updateEffects() {
  const enabled = userMotionEnabled && !reducedMotion.matches;
  root.dataset.effects = enabled ? "on" : "off";
  motionControl.disabled = reducedMotion.matches;
  motionControl.setAttribute("aria-pressed", String(!userMotionEnabled));
  motionControl.setAttribute(
    "aria-label",
    reducedMotion.matches
      ? "Animation disabled by system preference"
      : enabled
        ? "Pause background animation"
        : "Resume background animation",
  );
  motionControl.title = motionControl.getAttribute("aria-label");
  if (!enabled) {
    stopOpening();
    stopStory();
    document.getAnimations().forEach((animation) => animation.cancel());
    if (shell.classList.contains("scrubbing")) setNotch(shell.dataset.state);
    if (shell.dataset.state === "collapsed") setNotch("home");
  }
  updateTerrain();
  updateHeroHandoff();
}
motionControl.addEventListener("click", () => {
  userMotionEnabled = !userMotionEnabled;
  updateEffects();
});
reducedMotion.addEventListener("change", updateEffects);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopStory();
  tourTrack
    .querySelectorAll(".work-build, .work-progress i")
    .forEach((element) => {
      element.style.animationPlayState = document.hidden ? "paused" : "";
    });
  document.querySelectorAll(".ambient").forEach((element) => {
    element.style.animationPlayState = document.hidden ? "paused" : "";
  });
});
updateEffects();
if (motionAllowed()) openingTimers.push(setTimeout(replayOpening, 700));
else setNotch("home");
