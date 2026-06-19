const slides = Array.from(document.querySelectorAll(".slide"));
const totalPages = document.getElementById("totalPages");
const currentPage = document.getElementById("currentPage");
const progressBar = document.getElementById("progressBar");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const ggbFallback = document.getElementById("ggbFallback");
const ggbFallbackText = document.getElementById("ggbFallbackText");
const assetBase = document.body.dataset.assetBase || "";
const ggbFile = document.body.dataset.ggbFile || "assets/demo.ggb";
const progressStorageKey = `lesson-progress:${window.location.pathname}`;

let activeIndex = 0;
let geogebraStarted = false;
let geogebraScriptLoading = false;
let geogebraScriptReady = false;
let ggbApplet = null;

totalPages.textContent = String(slides.length);

function activeSlide() {
  return slides[activeIndex];
}

function saveProgress() {
  try {
    window.sessionStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        activeIndex,
        visibleCount: activeSlide().querySelectorAll(".reveal.visible").length,
      }),
    );
  } catch (error) {
    // The lesson still works when browser storage is unavailable.
  }
}

function restoreProgress() {
  try {
    const savedProgress = JSON.parse(window.sessionStorage.getItem(progressStorageKey));

    if (!savedProgress || !Number.isInteger(savedProgress.activeIndex)) {
      return false;
    }

    activeIndex = Math.min(Math.max(savedProgress.activeIndex, 0), slides.length - 1);
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      resetSlideAnimation(slide);
    });

    const revealItems = Array.from(activeSlide().querySelectorAll(".reveal"));
    const visibleCount = Math.min(
      Math.max(Number(savedProgress.visibleCount) || 0, 0),
      revealItems.length,
    );
    revealItems.slice(0, visibleCount).forEach((item) => item.classList.add("visible"));
    return true;
  } catch (error) {
    return false;
  }
}

function showFallback(message) {
  ggbFallbackText.textContent = message;
  ggbFallback.hidden = false;
}

function isLocalFile() {
  return window.location.protocol === "file:";
}

function revealNext(slide = activeSlide()) {
  const hiddenItems = Array.from(slide.querySelectorAll(".reveal:not(.visible)"));

  if (hiddenItems.length === 0) {
    return false;
  }

  hiddenItems[0].classList.add("visible");
  return true;
}

function hidePrevious(slide = activeSlide()) {
  const visibleItems = Array.from(slide.querySelectorAll(".reveal.visible"));

  if (visibleItems.length <= 2) {
    return false;
  }

  visibleItems[visibleItems.length - 1].classList.remove("visible");
  return true;
}

function revealAll(slide) {
  slide.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
}

function resetSlideAnimation(slide) {
  slide.querySelectorAll(".reveal").forEach((item) => item.classList.remove("visible"));
}

function playInitialAnimation(slide) {
  const items = Array.from(slide.querySelectorAll(".reveal"));
  items.slice(0, 2).forEach((item, index) => {
    window.setTimeout(() => item.classList.add("visible"), 90 * index);
  });
}

function updateControls() {
  currentPage.textContent = String(activeIndex + 1);
  progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  const hasPreviousStep = activeSlide().querySelectorAll(".reveal.visible").length > 2;
  const hasNextStep = !!activeSlide().querySelector(".reveal:not(.visible)");
  prevBtn.disabled = activeIndex === 0 && !hasPreviousStep;
  nextBtn.disabled = activeIndex === slides.length - 1 && !hasNextStep;
  saveProgress();
}

function goToSlide(index, options = {}) {
  if (index < 0 || index >= slides.length || index === activeIndex) {
    return;
  }

  slides[activeIndex].classList.remove("active");
  slides[activeIndex].setAttribute("aria-hidden", "true");

  activeIndex = index;
  const slide = activeSlide();
  slide.classList.add("active");
  slide.setAttribute("aria-hidden", "false");
  resetSlideAnimation(slide);
  if (options.showAll) {
    revealAll(slide);
  } else {
    playInitialAnimation(slide);
  }
  updateControls();

  if (slide.dataset.slideTitle === "GeoGebra") {
    loadGeogebra();
  }
}

function nextStep() {
  if (!revealNext()) {
    goToSlide(activeIndex + 1);
  }
  updateControls();
}

function previousStep() {
  if (!hidePrevious()) {
    goToSlide(activeIndex - 1, { showAll: true });
  }
  updateControls();
}

function setupQuiz() {
  document.querySelectorAll("[data-quiz]").forEach((quiz) => {
    const feedback = quiz.querySelector(".quiz-feedback");
    const buttons = Array.from(quiz.querySelectorAll("[data-answer]"));

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.remove("correct", "wrong"));

        if (button.dataset.answer === "true") {
          button.classList.add("correct");
          feedback.textContent = quiz.dataset.correctFeedback || "回答正确。";
        } else {
          button.classList.add("wrong");
          feedback.textContent = quiz.dataset.wrongFeedback || "再想一想，结合本页规律重新判断。";
        }
      });
    });
  });
}

function setupCards() {
  document.querySelectorAll("[data-highlight]").forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("selected");
    });
  });

  document.querySelectorAll("[data-flip-card]").forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
  });
}

function injectGeogebra() {
  if (geogebraStarted) {
    return;
  }

  if (!window.GGBApplet) {
    showFallback("没有找到本地 GeoGebra/deployggb.js，请确认离线包已经解压到 GeoGebra/ 目录。");
    return;
  }

  geogebraStarted = true;
  const stage = document.querySelector(".ggb-stage");
  const stageWidth = Math.max(320, Math.floor(stage.getBoundingClientRect().width));
  const stageHeight = Math.max(180, Math.floor(stage.getBoundingClientRect().height));
  const ggbUrl = new URL(`${assetBase}${ggbFile}`, window.location.href);
  ggbUrl.searchParams.set("v", String(Date.now()));
  const params = {
    appName: "classic",
    width: stageWidth,
    height: stageHeight,
    filename: ggbUrl.href,
    perspective: "GT",
    showToolBar: true,
    showAlgebraInput: false,
    showMenuBar: true,
    allowStyleBar: true,
    enableShiftDragZoom: true,
    enableRightClick: true,
    useBrowserForJS: false,
  };

  try {
    ggbFallback.hidden = true;
    const views = {
      is3D: true,
      AV: false,
      SV: false,
      CV: false,
      EV2: false,
      CP: false,
      PC: false,
      DA: false,
      FI: false,
      PV: false,
      macro: false,
    };
    ggbApplet = new GGBApplet(params, views, true);
    ggbApplet.setHTML5Codebase(`${assetBase}GeoGebra/HTML5/5.0/web3d/`);
    ggbApplet.inject("ggb-element");

    window.setTimeout(() => {
      const hasApplet = document.querySelector("#ggb-element .GeoGebraFrame, #ggb-element iframe, #ggb-element article, #ggb-element canvas");
      if (!hasApplet) {
        showFallback("GeoGebra 已尝试启动，但浏览器可能限制了本地文件访问。推荐运行 python3 -m http.server 8080 后访问 http://localhost:8080。");
      }
    }, 4500);
  } catch (error) {
    showFallback(`GeoGebra 启动失败：${error.message}`);
  }
}

function loadGeogebra() {
  if (geogebraStarted) {
    return;
  }

  if (isLocalFile()) {
    showFallback("当前是双击 HTML 打开的 file:// 模式。页面可浏览，但 GeoGebra 本地文件常被浏览器限制；请运行 python3 -m http.server 8080 后访问 http://localhost:8080。");
    return;
  }

  if (geogebraScriptReady) {
    injectGeogebra();
    return;
  }

  if (geogebraScriptLoading) {
    return;
  }

  geogebraScriptLoading = true;
  const script = document.createElement("script");
  script.src = `${assetBase}GeoGebra/deployggb.js`;
  script.onload = () => {
    geogebraScriptReady = true;
    geogebraScriptLoading = false;
    if (activeSlide().dataset.slideTitle === "GeoGebra") {
      injectGeogebra();
    }
  };
  script.onerror = () => {
    geogebraScriptLoading = false;
    showFallback("无法加载 GeoGebra/deployggb.js，请确认 GeoGebra 离线包已经放入项目。");
  };
  document.head.appendChild(script);
}

function preloadGeogebraScript() {
  if (!isLocalFile()) {
    loadGeogebra();
  }
}

prevBtn.addEventListener("click", previousStep);
nextBtn.addEventListener("click", nextStep);

window.addEventListener("keydown", (event) => {
  const keysThatMoveForward = ["ArrowRight", "ArrowDown", " ", "PageDown", "Enter"];
  const keysThatMoveBack = ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"];

  if (keysThatMoveForward.includes(event.key)) {
    event.preventDefault();
    nextStep();
  }

  if (keysThatMoveBack.includes(event.key)) {
    event.preventDefault();
    previousStep();
  }
});

setupQuiz();
setupCards();
if (!restoreProgress()) {
  playInitialAnimation(activeSlide());
}
updateControls();
window.addEventListener("load", preloadGeogebraScript);
