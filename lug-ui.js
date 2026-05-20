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
    EdgeLeft: "8 1/4\"",
    BottomMain: "2'-3 1/16\"",
    BottomStep: "5\"",
    SmallStep: "1 3/16\"",
    RightThicknessA: "3/8\"",
    RightThicknessB: "7/16\"",
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

  function renderHoles() {
    return "";
  }

  function boxText(x, y, width, height, label, rotate = 0) {
    const cx = x + width / 2;
    const cy = y + height / 2 + 6;
    const transform = rotate ? ` transform="rotate(${rotate} ${cx} ${cy})"` : "";
    return `
      <rect x="${x}" y="${y}" width="${width}" height="${height}" class="lug-value-box"></rect>
      <text x="${cx}" y="${cy}" text-anchor="middle" class="lug-box-text"${transform}>${lugEscape(label)}</text>
    `;
  }

  function renderViewer() {
    const row = activeRow();
    if (!row) return;
    els.title.textContent = `Mark ${row.Mark} | Qty ${row.Qty}`;
    els.count.textContent = `${state.active + 1} of ${state.visible.length}`;
    els.eyebrow.textContent = row.Plate;
    els.svg.innerHTML = `
      <rect x="0" y="0" width="1600" height="900" class="lug-template-bg"></rect>
      ${renderHoles()}
      ${boxText(401, 33, 144, 26, row.Overall)}
      ${boxText(239, 119, 55, 34, row.TopInset)}
      ${boxText(399, 119, 55, 34, row.MainBody)}
      ${boxText(520, 119, 74, 34, row.HolePattern)}
      ${boxText(719, 114, 73, 36, row.Neck)}
      ${boxText(76, 255, 70, 38, row.LeftWidth)}
      ${boxText(649, 216, 63, 31, row.NeckRadius)}
      ${boxText(920, 192, 80, 31, row.TipRadius)}
      ${boxText(1076, 207, 32, 31, row.RightThicknessA)}
      ${boxText(1123, 207, 41, 32, row.RightThicknessB)}
      ${boxText(1170, 207, 39, 31, row.TipHeight)}
      ${boxText(229, 212, 45, 22, row.HoleDia)}
      ${boxText(231, 247, 43, 20, row.LeftRadius)}
      ${boxText(229, 281, 44, 20, row.SlotHeight)}
      ${boxText(258, 414, 54, 34, row.EdgeLeft)}
      ${boxText(407, 417, 55, 35, row.BottomMain)}
      ${boxText(611, 426, 53, 35, row.BottomStep)}
      ${boxText(702, 376, 70, 35, row.LowerRadius)}
      ${boxText(742, 429, 68, 32, row.SmallStep)}
      ${boxText(878, 426, 68, 31, row.Tail)}
      ${boxText(158, 513, 850, 47, row.Plate)}
      <text x="900" y="620" text-anchor="middle" class="lug-mark-text">${lugEscape(row.Mark)} | Qty ${lugEscape(row.Qty)}</text>
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
