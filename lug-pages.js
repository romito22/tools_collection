(function () {
  const STORAGE_KEY = "tools_collection.lugPageMap.v1";

  const els = {
    select: document.getElementById("lugPageMarkSelect"),
    prev: document.getElementById("lugPagePrevBtn"),
    next: document.getElementById("lugPageNextBtn"),
    add: document.getElementById("lugPageAddBtn"),
    clear: document.getElementById("lugPageClearBtn"),
    total: document.getElementById("lugPageTotal"),
    count: document.getElementById("lugPageCount"),
    list: document.getElementById("lugPageMarkList"),
    canvas: document.getElementById("lugPageCanvas"),
    empty: document.getElementById("lugPageEmpty")
  };

  if (!els.select || !els.canvas) return;

  const marks = collectMarks();
  const state = loadState();
  if (!state.selectedMark || !marks.includes(state.selectedMark)) {
    state.selectedMark = marks[0] || "";
  }

  function collectMarks() {
    const values = [];
    (window.FULL_SHEET_MARKS || []).forEach((row) => values.push(row.mark || row.Mark));
    (window.lugRows || []).forEach((row) => values.push(row.Mark || row.mark));
    return [...new Set(values.filter(Boolean).map(String))].sort(compareMarks);
  }

  function compareMarks(a, b) {
    const an = Number(a);
    const bn = Number(b);
    if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an - bn;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        selectedMark: saved.selectedMark || "",
        entriesByMark: saved.entriesByMark && typeof saved.entriesByMark === "object" ? saved.entriesByMark : {}
      };
    } catch {
      return { selectedMark: "", entriesByMark: {} };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function activeEntries() {
    if (!state.selectedMark) return [];
    if (!Array.isArray(state.entriesByMark[state.selectedMark])) {
      state.entriesByMark[state.selectedMark] = [];
    }
    return state.entriesByMark[state.selectedMark];
  }

  function render() {
    renderSelect();
    renderMarkList();
    renderCanvas();
    els.total.textContent = String(marks.length);
    els.count.textContent = String(activeEntries().length);
    els.prev.disabled = marks.length < 2;
    els.next.disabled = marks.length < 2;
    els.add.disabled = !state.selectedMark;
    els.clear.disabled = !activeEntries().length;
    saveState();
  }

  function renderSelect() {
    const current = els.select.value;
    els.select.textContent = "";
    marks.forEach((mark) => {
      const option = document.createElement("option");
      option.value = mark;
      option.textContent = mark;
      els.select.appendChild(option);
    });
    els.select.value = state.selectedMark || current || "";
  }

  function renderMarkList() {
    els.list.textContent = "";
    marks.forEach((mark) => {
      const entries = state.entriesByMark[mark] || [];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lug-page-mark";
      button.classList.toggle("active", mark === state.selectedMark);
      button.innerHTML = `<strong></strong><span></span>`;
      button.querySelector("strong").textContent = `Mark ${mark}`;
      button.querySelector("span").textContent = `${entries.length} lug${entries.length === 1 ? "" : "s"}`;
      button.addEventListener("click", () => {
        state.selectedMark = mark;
        render();
      });
      els.list.appendChild(button);
    });
  }

  function renderCanvas() {
    [...els.canvas.querySelectorAll(".lug-page-card")].forEach((card) => card.remove());
    const entries = activeEntries();
    els.empty.hidden = entries.length > 0;
    entries.forEach((entry, index) => els.canvas.appendChild(createCard(entry, index)));
  }

  function createCard(entry, index) {
    const card = document.createElement("article");
    card.className = "lug-page-card";
    card.style.left = `${entry.x ?? 18 + (index % 3) * 250}px`;
    card.style.top = `${entry.y ?? 18 + Math.floor(index / 3) * 190}px`;
    card.dataset.id = entry.id;

    const head = document.createElement("div");
    head.className = "lug-page-card-head";
    const title = document.createElement("strong");
    title.textContent = entry.name || `Lug ${index + 1}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "lug-page-remove";
    remove.textContent = "x";
    remove.setAttribute("aria-label", "Remove lug");
    remove.addEventListener("click", () => removeEntry(entry.id));
    head.append(title, remove);

    const grid = document.createElement("div");
    grid.className = "lug-page-fields";
    [
      ["name", "Lug", entry.name || `Lug ${index + 1}`],
      ["page", "Page", entry.page || ""],
      ["weldWide", "Weld W", entry.weldWide || ""],
      ["weldLong", "Weld L", entry.weldLong || ""]
    ].forEach(([key, label, value]) => {
      const field = document.createElement("label");
      field.textContent = label;
      const input = document.createElement("input");
      input.value = value;
      input.dataset.key = key;
      input.placeholder = key === "page" ? "B01234" : key === "name" ? "Lug 1" : "1/4";
      input.addEventListener("input", () => {
        entry[key] = input.value;
        if (key === "name") title.textContent = input.value || `Lug ${index + 1}`;
        saveState();
      });
      field.appendChild(input);
      grid.appendChild(field);
    });

    card.append(head, grid);
    makeDraggable(card, head, entry);
    return card;
  }

  function addEntry() {
    const entries = activeEntries();
    const next = entries.length + 1;
    entries.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: `Lug ${next}`,
      page: "",
      weldWide: "",
      weldLong: "",
      x: 18 + ((next - 1) % 3) * 250,
      y: 18 + Math.floor((next - 1) / 3) * 190
    });
    render();
  }

  function removeEntry(id) {
    state.entriesByMark[state.selectedMark] = activeEntries().filter((entry) => entry.id !== id);
    render();
  }

  function clearMark() {
    state.entriesByMark[state.selectedMark] = [];
    render();
  }

  function moveMark(delta) {
    const index = marks.indexOf(state.selectedMark);
    if (index < 0 || !marks.length) return;
    state.selectedMark = marks[(index + delta + marks.length) % marks.length];
    render();
  }

  function makeDraggable(card, handle, entry) {
    let drag = null;
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: Number.parseFloat(card.style.left) || 0,
        y: Number.parseFloat(card.style.top) || 0
      };
      card.classList.add("dragging");
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener("pointermove", (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const bounds = els.canvas.getBoundingClientRect();
      const nextX = drag.x + event.clientX - drag.startX;
      const nextY = drag.y + event.clientY - drag.startY;
      entry.x = clamp(nextX, 0, Math.max(0, bounds.width - card.offsetWidth - 2));
      entry.y = clamp(nextY, 0, Math.max(0, bounds.height - card.offsetHeight - 2));
      card.style.left = `${entry.x}px`;
      card.style.top = `${entry.y}px`;
    });
    handle.addEventListener("pointerup", finishDrag);
    handle.addEventListener("pointercancel", finishDrag);

    function finishDrag(event) {
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag = null;
      card.classList.remove("dragging");
      saveState();
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  els.select.addEventListener("change", () => {
    state.selectedMark = els.select.value;
    render();
  });
  els.prev.addEventListener("click", () => moveMark(-1));
  els.next.addEventListener("click", () => moveMark(1));
  els.add.addEventListener("click", addEntry);
  els.clear.addEventListener("click", clearMark);

  render();
})();
