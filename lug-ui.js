const lugRows = [
  {
    Mark: "1210A / 1211A",
    Qty: "4",
    Part: "LUG Plate",
    Material: "A572-50",
    Overall: "5'-3 3/8\"",
    Plate: "PL 1/4\" x 1'-4 1/2\" x 5'-3 7/8\"",
    LeftWidth: "1'-4 1/2\"",
    MainBody: "2'-6\"",
    Neck: "1'-11 3/16\"",
    Tail: "9 3/8\"",
    TopInset: "3 15/16\"",
    HolePattern: "16 @ 1 7/8\"",
    HoleDia: "1 3/8\" TYP.",
    LeftRadius: "8 1/4\"",
    NeckRadius: "1/2\" TYP.",
    LowerRadius: "1\" TYP.",
    TipRadius: "3/16\" TYP.",
    SlotHeight: "1 1/2\"",
    TipHeight: "3/8\"",
    Notes: "Use this as a placeholder until spreadsheet values arrive."
  }
];

function lugById(id) {
  return document.getElementById(id);
}

function lugEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function lugParseFilter(text) {
  return String(text || "").split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean);
}

function setupLugRows(rows) {
  const els = {
    input: lugById("lugMarkInput"),
    show: lugById("lugShowBtn"),
    reset: lugById("lugResetBtn"),
    total: lugById("lugTotal"),
    shown: lugById("lugShown"),
    reviewed: lugById("lugGood"),
    open: lugById("lugBad"),
    board: lugById("lugBoard"),
    status: lugById("lugStatus"),
    prev: lugById("lugPrevBtn"),
    next: lugById("lugNextBtn"),
    title: lugById("lugViewerTitle"),
    count: lugById("lugViewerCount"),
    eyebrow: lugById("lugViewerEyebrow"),
    svg: lugById("lugViewerSvg"),
    meta: lugById("lugViewerMeta")
  };
  if (!els.board) return;

  const fields = ["Part", "Material", "Overall", "Plate", "LeftWidth", "MainBody", "Neck", "Tail", "TopInset", "HolePattern", "HoleDia", "LeftRadius", "NeckRadius", "LowerRadius", "TipRadius", "SlotHeight", "TipHeight"];
  const source = rows.map((row, index) => ({ ...row, _id: `${row.Mark}-${index}` }));
  const state = { visible: source, reviewed: new Set(), active: 0 };

  function activeRow() {
    if (!state.visible.length) return null;
    state.active = Math.max(0, Math.min(state.active, state.visible.length - 1));
    return state.visible[state.active];
  }

  function counts() {
    els.total.textContent = source.length;
    els.shown.textContent = state.visible.length;
    els.reviewed.textContent = state.reviewed.size;
    els.open.textContent = Math.max(0, source.length - state.reviewed.size);
  }

  function dim(x1, x2, y, label) {
    return `
      <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="dim-line"></line>
      <line x1="${x1}" y1="${y - 10}" x2="${x1}" y2="${y + 18}" class="dim-line"></line>
      <line x1="${x2}" y1="${y - 10}" x2="${x2}" y2="${y + 18}" class="dim-line"></line>
      <text x="${(x1 + x2) / 2}" y="${y - 8}" text-anchor="middle" class="dim-text">${lugEscape(label)}</text>
    `;
  }

  function renderHoles() {
    const holes = [];
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        holes.push(`<circle cx="${205 + col * 34}" cy="${156 + row * 30}" r="7" class="lug-hole"></circle>`);
      }
    }
    return holes.join("");
  }

  function renderViewer() {
    const row = activeRow();
    if (!row) return;
    els.title.textContent = `Mark ${row.Mark} | Qty ${row.Qty}`;
    els.count.textContent = `${state.active + 1} of ${state.visible.length}`;
    els.eyebrow.textContent = row.Plate;
    els.svg.innerHTML = `
      <rect x="18" y="18" width="944" height="394" rx="8" class="core-paper"></rect>
      ${dim(150, 760, 74, row.Overall)}
      ${dim(190, 500, 118, row.MainBody)}
      ${dim(545, 760, 118, row.Neck)}
      ${dim(650, 760, 346, row.Tail)}
      <path d="M150 150 Q115 210 150 270 L500 270 L545 238 L675 238 L760 270 L885 270 L885 210 L760 210 L675 180 L545 180 L500 150 Z" class="lug-outline"></path>
      <line x1="110" y1="210" x2="910" y2="210" class="brace-center"></line>
      <line x1="150" y1="150" x2="150" y2="270" class="ext-line"></line>
      <line x1="500" y1="135" x2="500" y2="286" class="ext-line"></line>
      <line x1="545" y1="170" x2="545" y2="250" class="ext-line"></line>
      <line x1="760" y1="118" x2="760" y2="300" class="ext-line"></line>
      ${renderHoles()}
      <text x="104" y="213" text-anchor="middle" class="side-text" transform="rotate(-90 104 213)">${lugEscape(row.LeftWidth)}</text>
      <text x="872" y="218" text-anchor="middle" class="side-text" transform="rotate(90 872 218)">${lugEscape(row.TipHeight)}</text>
      <text x="305" y="140" text-anchor="middle" class="note-text">${lugEscape(row.HolePattern)}</text>
      <text x="205" y="315" text-anchor="middle" class="note-text">Dia ${lugEscape(row.HoleDia)}</text>
      <text x="126" y="330" text-anchor="middle" class="note-text">R=${lugEscape(row.LeftRadius)}</text>
      <text x="580" y="160" class="note-text">R=${lugEscape(row.NeckRadius)}</text>
      <text x="615" y="304" class="note-text">R=${lugEscape(row.LowerRadius)}</text>
      <text x="795" y="160" class="note-text">R=${lugEscape(row.TipRadius)}</text>
      <text x="490" y="386" text-anchor="middle" class="title-block">${lugEscape(row.Plate)}</text>
      <text x="900" y="386" text-anchor="end" class="mark-block">${lugEscape(row.Mark)}</text>
    `;
    const meta = ["Overall", "Plate", "LeftWidth", "MainBody", "Neck", "Tail", "HolePattern", "HoleDia"];
    els.meta.innerHTML = meta.map((field) => `<span><b>${lugEscape(field)}</b>${lugEscape(row[field] || "-")}</span>`).join("");
  }

  function render() {
    counts();
    const current = activeRow();
    renderViewer();
    const header = `<div class="core-head lug-head"><div class="core-cell core-check">OK</div><div class="core-cell">Mark</div>${fields.map((field) => `<div class="core-cell">${lugEscape(field)}</div>`).join("")}</div>`;
    const body = state.visible.map((row) => `
      <div class="core-row ${state.reviewed.has(row._id) ? "reviewed" : ""} ${current && current._id === row._id ? "active" : ""}" data-row="${lugEscape(row._id)}">
        <label class="core-cell core-check"><input type="checkbox" ${state.reviewed.has(row._id) ? "checked" : ""} aria-label="Reviewed mark ${lugEscape(row.Mark)}"></label>
        <div class="core-cell"><b>${lugEscape(row.Mark)}</b></div>
        ${fields.map((field) => `<div class="core-cell">${lugEscape(row[field] || "-")}</div>`).join("")}
      </div>
    `).join("");
    els.board.innerHTML = header + body;
    els.status.textContent = `Showing ${state.visible.length} LUG row(s). Check the left box when the row is reviewed.`;
  }

  function applyFilter() {
    const wanted = lugParseFilter(els.input.value);
    state.visible = wanted.length ? source.filter((row) => wanted.some((mark) => String(row.Mark).includes(mark))) : source;
    state.active = 0;
    render();
  }

  els.board.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox']");
    const row = event.target.closest("[data-row]");
    if (!checkbox || !row) return;
    if (checkbox.checked) state.reviewed.add(row.dataset.row);
    else state.reviewed.delete(row.dataset.row);
    render();
  });
  els.board.addEventListener("click", (event) => {
    if (event.target.matches("input[type='checkbox']")) return;
    const row = event.target.closest("[data-row]");
    if (!row) return;
    const index = state.visible.findIndex((item) => item._id === row.dataset.row);
    if (index >= 0) state.active = index;
    render();
  });
  els.prev.addEventListener("click", () => {
    if (!state.visible.length) return;
    state.active = (state.active - 1 + state.visible.length) % state.visible.length;
    render();
  });
  els.next.addEventListener("click", () => {
    if (!state.visible.length) return;
    state.active = (state.active + 1) % state.visible.length;
    render();
  });
  els.show.addEventListener("click", applyFilter);
  els.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") applyFilter();
  });
  els.reset.addEventListener("click", () => {
    els.input.value = "";
    applyFilter();
  });
  render();
}

setupLugRows(lugRows);
