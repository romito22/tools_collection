function coreById(id) {
  return document.getElementById(id);
}

function coreEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function coreParseTable(text) {
  const rows = String(text || "").trim().split(/\r?\n/).filter(Boolean).map((line) => line.split("|"));
  const headers = rows.shift() || [];
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function coreMarkSort(mark) {
  const number = Number(String(mark).match(/\d+/)?.[0] ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function coreParseFilter(text) {
  return String(text || "").split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean);
}

function setupCoreRows(rows) {
  const els = {
    input: coreById("coreMarkInput"),
    show: coreById("coreShowBtn"),
    reset: coreById("coreResetBtn"),
    total: coreById("coreTotal"),
    shown: coreById("coreShown"),
    reviewed: coreById("coreGood"),
    open: coreById("coreBad"),
    board: coreById("coreBoard"),
    status: coreById("coreStatus")
  };
  if (!els.board) return;

  const visibleFields = ["CB-ID", "Location", "Lsc", "Fy min", "Fy max", "Wsc", "# Plies", "tply", "tsc", "Wsg", "Whpsc", "rhpsc", "Lsg", "Lsc-2*Lsg"];
  const source = rows.map((row, index) => ({
    ...row,
    _id: `${row.Mark || "row"}-${index}`,
    Location: `${row.Line || "-"} / ${row.Grids || "-"} / Lv ${row.Lvls || "-"}`
  })).sort((a, b) => coreMarkSort(a.Mark) - coreMarkSort(b.Mark) || a._id.localeCompare(b._id));
  const state = { visible: source, reviewed: new Set() };

  function counts() {
    els.total.textContent = source.length;
    els.shown.textContent = state.visible.length;
    els.reviewed.textContent = state.reviewed.size;
    els.open.textContent = Math.max(0, source.length - state.reviewed.size);
  }

  function render() {
    counts();
    if (!source.length) {
      els.board.innerHTML = `<p class="note">No Core rows loaded.</p>`;
      els.status.textContent = "Waiting for Core data.";
      return;
    }
    const header = `
      <div class="core-head">
        <div class="core-cell core-check">OK</div>
        <div class="core-cell">Mark</div>
        ${visibleFields.map((field) => `<div class="core-cell">${coreEscape(field)}</div>`).join("")}
      </div>
    `;
    const body = state.visible.map((row) => `
      <div class="core-row ${state.reviewed.has(row._id) ? "reviewed" : ""}" data-row="${coreEscape(row._id)}">
        <label class="core-cell core-check"><input type="checkbox" ${state.reviewed.has(row._id) ? "checked" : ""} aria-label="Reviewed mark ${coreEscape(row.Mark)}"></label>
        <div class="core-cell"><b>${coreEscape(row.Mark || "-")}</b></div>
        ${visibleFields.map((field) => `<div class="core-cell">${coreEscape(row[field] || "-")}</div>`).join("")}
      </div>
    `).join("");
    els.board.innerHTML = header + body;
    els.status.textContent = `Showing ${state.visible.length} of ${source.length} Core rows. Check the left box when the full row is reviewed.`;
  }

  function applyFilter() {
    const wanted = coreParseFilter(els.input.value);
    state.visible = wanted.length ? source.filter((row) => wanted.includes(String(row.Mark))) : source;
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
  els.show?.addEventListener("click", applyFilter);
  els.input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") applyFilter();
  });
  els.reset?.addEventListener("click", () => {
    els.input.value = "";
    applyFilter();
  });
  render();
}

setupCoreRows(window.coreRows || coreParseTable(window.coreTable));
