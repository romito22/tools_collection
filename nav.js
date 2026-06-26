const navButtons = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");
const viewTargets = new Set([...views].map((view) => view.id));
const partsToggle = document.getElementById("partsReviewToggle");
const partsMenu = document.getElementById("partsReviewMenu");
const partsEntry = document.querySelector("[data-parts-entry]");

const partViews = [
  ["P01", "p01View"],
  ["P02", "p02View"],
  ["LUG", "lugView"],
  ["P03", "p03View"],
  ["P04", "p04View"],
  ["P05", "p05View"],
  ["P06", "p06View"],
  ["P07", "p07View"],
  ["P08", "p08View"],
  ["P09", "p09View"],
  ["P10", "p10View"],
  ["P11", "p11View"],
  ["P12", "p12View"],
  ["P13", "p13View"],
  ["P14", "p14View"],
  ["P15", "p15View"]
];
const partTargets = new Set(partViews.map(([, target]) => target));
const groupedTargets = new Set([
  "fullSheetView",
  "toolsView",
  "reviewView",
  "hssView",
  "pimView",
  "coreView",
  ...partTargets
]);

function setPartsMenuExpanded(expanded, save = true) {
  partsToggle?.setAttribute("aria-expanded", String(expanded));
  if (partsMenu) partsMenu.hidden = !expanded;
  if (save) localStorage.setItem("tools_collection.partsReview.expanded", String(expanded));
}

function showView(targetId) {
  views.forEach((view) => view.classList.toggle("active", view.id === targetId));
  navButtons.forEach((button) => {
    const active = button === partsEntry
      ? partTargets.has(targetId)
      : button.dataset.target === targetId;
    button.classList.toggle("active", active);
  });
  partsToggle?.classList.toggle("active", groupedTargets.has(targetId));
  document.querySelectorAll(".parts-review-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === targetId);
  });
  if (partTargets.has(targetId)) {
    localStorage.setItem("tools_collection.partsReview.activeView", targetId);
  }
  if (viewTargets.has(targetId)) {
    localStorage.setItem("tools_collection.activeView", targetId);
  }
}

function createPartsSwitcher() {
  partViews.forEach(([, target]) => {
    const view = document.getElementById(target);
    const header = view?.querySelector(":scope > .topbar");
    if (!view || !header) return;

    const switcher = document.createElement("nav");
    switcher.className = "parts-review-switcher";
    switcher.setAttribute("aria-label", "P Parts sections");
    partViews.forEach(([label, viewId]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "parts-review-tab";
      button.dataset.target = viewId;
      button.textContent = label;
      button.addEventListener("click", () => showView(viewId));
      switcher.appendChild(button);
    });
    header.insertAdjacentElement("afterend", switcher);
  });
}

createPartsSwitcher();

const savedExpanded = localStorage.getItem("tools_collection.partsReview.expanded");
setPartsMenuExpanded(savedExpanded === null ? true : savedExpanded === "true", false);

partsToggle?.addEventListener("click", () => {
  setPartsMenuExpanded(partsToggle.getAttribute("aria-expanded") !== "true");
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button === partsEntry) {
      const saved = localStorage.getItem("tools_collection.partsReview.activeView");
      showView(partTargets.has(saved) ? saved : "p01View");
      return;
    }
    showView(button.dataset.target);
  });
});

const savedView = localStorage.getItem("tools_collection.activeView");
if (viewTargets.has(savedView)) showView(savedView);
