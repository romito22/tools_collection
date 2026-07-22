const hssTable = `
CB-ID|EOR-ID|Line|Grids|Lvls|Mark|Qty|Lc|Type|Hc|Wc|tc|Cap Qty|W1cc|H1cc|t1cc|t2cc|rcc|tcc|DWL|DWL-i|DWcc|H2cc-DWL|H1cc-H2cc-t1cc
CB-7.50|BRB_7.5 (1.30)|13B|LS-MS|1|1934|1|29'-7 1/16"|t|12.000|12.000|0.3125|4|11 5/8|5 3/4|11/16|2 11/16|5/16|1/4|4|4|0.125|2 7/8|1 15/16
CB-7.00|BRB_7.0 (1.30)|JS|14-13B|1|1940|1|28'-7 15/16"|t|12.000|12.000|0.3125|4|11 5/8|5 3/4|11/16|2 7/8|5/16|1/4|4|4|0.125|2 11/16|2 1/8
CB-4.00|BRB_4.0 (1.30)|1|LS to CL|2|1943|2|23'-3 1/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|2 1/16|1/4|1/4|4|4|0.125|1 5/8|2 5/16
CB-14.00|BRB_14.0 (1.30)|4|JS-KS|2|1945|1|33'-5 3/4"|t|14.000|14.000|0.6250|4|1' 1 5/8"|6 3/4|13/16|2|5/8|1/2|7|7|0.25|2 3/16|3 5/16
CB-16.00|BRB_16.0 (1.40)|4|JS-KS|1|1946|1|26'-11"|t|14.000|14.000|0.5000|4|1' 1 5/8"|6 3/4|15/16|2 1/8|1/2|1/2|6|6|0.25|2 3/4|2 11/16
CB-13.00|BRB_13.0 (1.30)|9|JS-KS|2|1947|1|33'-8 1/4"|t|14.000|14.000|0.6250|4|1' 1 5/8"|6 3/4|13/16|2 3/8|5/8|1/2|5|5|0.25|2 5/16|3 5/16
CB-13.00|BRB_13.0 (1.35)|9|JS-KS|1|1948|1|28'-0 11/16"|t|14.000|14.000|0.3750|4|1' 1 5/8"|6 3/4|13/16|2 3/8|3/8|1/2|5|5|0.25|2 5/16|3 5/16
CB-9.00|BRB_9.0 (1.35)|11|JS to CL|2|1949|2|22'-10 1/4"|t|12.000|12.000|0.3125|8|11 5/8|5 3/4|11/16|2 1/16|5/16|1/4|4|4|0.125|3 7/16|1 3/8
CB-9.00|BRB_9.0 (1.40)|11|JS to CL|1|1950|1|16'-1"|t|12.000|12.000|0.2500|4|11 5/8|5 3/4|11/16|2 1/16|1/4|1/4|4|4|0.125|3 7/16|1 3/8
CB-9.00|BRB_9.0 (1.40)|11|CL to KS|1|1951|1|16'-1 5/8"|t|12.000|12.000|0.2500|4|11 5/8|5 3/4|11/16|2 1/16|1/4|1/4|4|4|0.125|3 7/16|1 3/8
CB-3.50|BRB_3.5 (1.30)|FS|3.6 to CL|2|1952|2|20'-10 1/4"|t|8.000|8.000|0.3125|8|7 5/8|3 3/4|7/16|1 3/8|5/16|1/4|3|3|0.125|1 15/16|1 3/16
CB-3.50|BRB_3.5 (1.25)|JS|12-11|1|1954|2|29'-8 9/16"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|7/16|2 3/8|1/4|1/4|3|3|0.125|1 15/16|2 3/16
CB-13.00|BRB_13.0 (1.35)|MS|4-5|1|1956|2|27'-5 3/4"|t|14.000|14.000|0.3750|8|1' 1 5/8"|6 3/4|13/16|2 3/8|3/8|1/2|5|5|0.25|2 5/16|3 5/16
CB-4.00|BRB_4.0 (1.30)|MS|10-11|1|1957|2|29'-2 9/16"|t|10.000|10.000|0.3125|8|9 5/8|4 3/4|9/16|2 1/16|5/16|1/4|4|4|0.125|1 5/8|2 5/16
CB-9.00|BRB_9.0 (1.35)|JS|6-7|1|1959|2|27'-8 1/16"|t|14.000|14.000|0.3750|8|1' 1 5/8"|6 3/4|11/16|3 1/16|3/8|1/2|4|4|0.25|3 7/16|2 3/8
CB-3.00|BRB_3.0 (1.25)|1|GS to CL|2|1960|2|22'-10 1/4"|t|8.000|8.000|0.3125|8|7 5/8|3 3/4|7/16|1 11/16|5/16|1/4|3|3|0.125|1 5/8|1 1/2
CB-4.00|BRB_4.0 (1.35)|11|LS to CL|1|1962|2|17'-0 15/16"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|9/16|1 1/16|1/4|1/4|4|4|0.125|1 5/8|1 5/16
CB-6.00|BRB_6.0 (1.30)|9|LS-MS|1|1963|1|29'-0 3/16"|t|12.000|12.000|0.2500|4|11 5/8|5 3/4|9/16|2 11/16|1/4|1/4|4|4|0.125|2 9/16|2 3/8
CB-7.50|BRB_7.5 (1.30)|13B|MS-NS|1|2935|1|32'-5 1/4"|t|12.000|12.000|0.3750|4|11 5/8|5 3/4|11/16|2 11/16|3/8|1/2|4|4|0.25|2 7/8|1 15/16
CB-7.50|BRB_7.5 (1.30)|17|NS-MS|1|2937|1|32'-6 1/4"|t|12.000|12.000|0.3750|4|11 5/8|5 3/4|11/16|2 11/16|3/8|1/2|4|4|0.25|2 7/8|1 15/16
CB-7.50|BRB_7.5 (1.30)|17|MS-LS|1|2938|1|30'-0 3/4"|t|12.000|12.000|0.3125|4|11 5/8|5 3/4|11/16|2 11/16|5/16|1/4|4|4|0.125|2 7/8|1 15/16
CB-7.00|BRB_7.0 (1.30)|JS|17-16|1|2940|1|29'-0 3/4"|t|12.000|12.000|0.3125|4|11 5/8|5 3/4|11/16|2 7/8|5/16|1/4|4|4|0.125|2 11/16|2 1/8
CB-7.50|BRB_7.5 (1.30)|NS|13B-14|1|2942|2|29'-0 3/4"|t|12.000|12.000|0.3125|8|11 5/8|5 3/4|11/16|2 11/16|5/16|1/4|4|4|0.125|2 7/8|1 15/16
CB-6.00|BRB_6.0 (1.45)|1|LS to CL|1|2944|2|16'-2 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|1 11/16|1/4|1/4|4|4|0.125|2 9/16|1 3/8
CB-6.50|BRB_6.5 (1.70)|FS|3.6 to CL|1|2953|2|10'-6 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|1 7/16|1/4|1/4|4|4|0.125|2 13/16|1 1/8
CB-5.50|BRB_5.5 (1.55)|1|GS to CL|1|2961|2|13'-6 1/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|1 15/16|1/4|1/4|4|4|0.125|2 3/8|1 9/16
`;

function parseManualTable(text) {
  const rows = text.trim().split(/\r?\n/).map((line) => line.split("|"));
  const headers = rows.shift();
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function markSortValue(mark) {
  const number = Number(String(mark).match(/\d+/)?.[0] ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function compactValues(values) {
  const clean = [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
  return clean.length ? clean.join(" / ") : "-";
}

function combineByMark(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const mark = String(row.Mark ?? "").trim();
    if (!mark) return;
    if (!groups.has(mark)) groups.set(mark, []);
    groups.get(mark).push(row);
  });

  return [...groups.entries()].map(([mark, rowsForMark]) => {
    const merged = { Mark: mark, _count: rowsForMark.length };
    const keys = [...new Set(rowsForMark.flatMap((row) => Object.keys(row)))].filter((key) => !key.startsWith("_"));
    keys.forEach((key) => {
      if (key === "Mark") return;
      merged[key] = key === "Qty"
        ? rowsForMark.reduce((sum, row) => sum + (Number(row[key]) || 0), 0)
        : compactValues(rowsForMark.map((row) => row[key]));
    });
    return merged;
  }).sort((a, b) => markSortValue(a.Mark) - markSortValue(b.Mark));
}

function parseFilter(text) {
  return String(text || "").split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean);
}

function setupManualDeck(prefix, title, rows) {
  const els = {
    input: byId(`${prefix}MarkInput`),
    show: byId(`${prefix}ShowBtn`),
    reset: byId(`${prefix}ResetBtn`),
    total: byId(`${prefix}Total`),
    shown: byId(`${prefix}Shown`),
    good: byId(`${prefix}Good`),
    bad: byId(`${prefix}Bad`),
    list: byId(`${prefix}List`),
    card: byId(`${prefix}Card`),
    board: byId(`${prefix}Board`),
    note: byId(`${prefix}Note`),
    goodBtn: byId(`${prefix}MarkGoodBtn`),
    badBtn: byId(`${prefix}MarkBadBtn`),
    clearBtn: byId(`${prefix}ClearMarkBtn`),
    status: byId(`${prefix}Status`)
  };
  if (!els.card || !els.board || !els.list) return;

  const records = combineByMark(rows);
  const state = { records, visible: records, selected: 0, selectedKey: records[0] ? "Lc" : "", marks: new Map() };
  const current = () => state.visible[state.selected] || null;
  const keyFor = (record, variable) => `${record.Mark}::${variable}`;

  function counts() {
    let good = 0;
    let bad = 0;
    state.marks.forEach((value) => {
      if (value.status === "good") good += 1;
      if (value.status === "bad") bad += 1;
    });
    els.total.textContent = records.length;
    els.shown.textContent = state.visible.length;
    els.good.textContent = good;
    els.bad.textContent = bad;
  }

  function summaryClass(record) {
    const values = Object.keys(record).filter((key) => !key.startsWith("_") && key !== "Mark");
    const marked = values.map((key) => state.marks.get(keyFor(record, key))?.status).filter(Boolean);
    if (marked.includes("bad")) return "bad";
    if (marked.length && marked.every((value) => value === "good")) return "good";
    return marked.length ? "partial" : "";
  }

  function renderList() {
    els.list.innerHTML = state.visible.length
      ? state.visible.map((record, index) => `
          <button class="brace-list-item ${index === state.selected ? "selected" : ""} ${summaryClass(record)}" type="button" data-index="${index}">
            <strong>Mark ${escapeHtml(record.Mark)}</strong>
            <span>${escapeHtml(record["CB-ID"] || "-")} | ${escapeHtml(record.Grids || "-")}</span>
            <small>Lc ${escapeHtml(record.Lc || "-")} | Qty ${escapeHtml(record.Qty || "-")}</small>
          </button>
        `).join("")
      : `<p class="note">No marks match this filter.</p>`;
  }

  function renderCard() {
    const record = current();
    if (!record) {
      els.card.className = "review-card idle";
      els.card.innerHTML = `<p class="note">${title} has no manual data yet.</p>`;
      els.board.innerHTML = "";
      els.status.textContent = "No marks to show.";
      return;
    }

    const selectedMark = state.marks.get(keyFor(record, state.selectedKey));
    els.note.value = selectedMark?.note || "";
    els.card.className = `review-card ${summaryClass(record)}`;
    els.card.innerHTML = `
      <div class="review-card-head">
        <div>
          <h2>Mark ${escapeHtml(record.Mark)} ${record._count > 1 ? `(${record._count} combined)` : ""}</h2>
          <p>${escapeHtml(record["CB-ID"] || "-")} / ${escapeHtml(record["EOR-ID"] || "-")} / Grid ${escapeHtml(record.Grids || "-")}</p>
        </div>
        <span class="pill">${escapeHtml(selectedMark?.status?.toUpperCase() || "UNMARKED")}</span>
      </div>
      <div class="mini-metrics">
        <span><b>Lc</b>${escapeHtml(record.Lc || "-")}</span>
        <span><b>Type</b>${escapeHtml(record.Type || "-")}</span>
        <span><b>Hc</b>${escapeHtml(record.Hc || "-")}</span>
        <span><b>Wc</b>${escapeHtml(record.Wc || "-")}</span>
      </div>
    `;

    els.board.innerHTML = Object.entries(record).filter(([key]) => !key.startsWith("_")).map(([key, value]) => {
      const mark = state.marks.get(keyFor(record, key));
      return `
        <button class="value-tile ${key === state.selectedKey ? "selected" : ""} ${mark?.status || ""}" type="button" data-key="${escapeHtml(key)}">
          <span>${escapeHtml(key)}</span>
          <b>${escapeHtml(value)}</b>
          <small>${escapeHtml(mark?.note || mark?.status || "-")}</small>
        </button>
      `;
    }).join("");
    els.status.textContent = `Showing ${state.selected + 1} of ${state.visible.length}. Select a value tile, then mark it good or bad.`;
  }

  function render() {
    counts();
    renderList();
    renderCard();
  }

  function applyFilter() {
    const wanted = parseFilter(els.input.value);
    state.visible = wanted.length ? records.filter((record) => wanted.includes(String(record.Mark))) : records;
    state.selected = 0;
    state.selectedKey = state.visible[0] ? "Lc" : "";
    render();
  }

  function setMark(status) {
    const record = current();
    if (!record || !state.selectedKey) return;
    state.marks.set(keyFor(record, state.selectedKey), { status, note: els.note.value.trim() });
    render();
  }

  function clearMark() {
    const record = current();
    if (!record || !state.selectedKey) return;
    state.marks.delete(keyFor(record, state.selectedKey));
    els.note.value = "";
    render();
  }

  els.list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-index]");
    if (!button) return;
    state.selected = Number(button.dataset.index);
    state.selectedKey = "Lc";
    render();
  });
  els.board.addEventListener("click", (event) => {
    const button = event.target.closest("[data-key]");
    if (!button) return;
    state.selectedKey = button.dataset.key;
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
  els.goodBtn?.addEventListener("click", () => setMark("good"));
  els.badBtn?.addEventListener("click", () => setMark("bad"));
  els.clearBtn?.addEventListener("click", clearMark);
  els.note?.addEventListener("input", () => {
    const record = current();
    if (!record || !state.selectedKey) return;
    const existing = state.marks.get(keyFor(record, state.selectedKey));
    if (existing) state.marks.set(keyFor(record, state.selectedKey), { ...existing, note: els.note.value.trim() });
  });
  render();
}

function setupCoreRows(rows) {
  const els = {
    input: byId("coreMarkInput"),
    show: byId("coreShowBtn"),
    reset: byId("coreResetBtn"),
    total: byId("coreTotal"),
    shown: byId("coreShown"),
    reviewed: byId("coreGood"),
    open: byId("coreBad"),
    board: byId("coreBoard"),
    status: byId("coreStatus")
  };
  if (!els.board) return;

  const fields = ["CB-ID", "EOR-ID", "Line", "Grids", "Lvls", "Mark", "Qty", "Lsc", "Fy min", "Fy max", "Wsc", "# Plies", "tply", "tsc", "Wsg", "Whpsc", "rhpsc", "Lsg", "Lsc-2*Lsg"];
  const visibleFields = ["CB-ID", "Location", "Lsc", "Fy min", "Fy max", "Wsc", "# Plies", "tply", "tsc", "Wsg", "Whpsc", "rhpsc", "Lsg", "Lsc-2*Lsg"];
  const source = rows.map((row, index) => ({
    ...row,
    _id: `${row.Mark || "row"}-${index}`,
    Location: `${row.Line || "-"} / ${row.Grids || "-"} / Lv ${row.Lvls || "-"}`
  })).sort((a, b) => markSortValue(a.Mark) - markSortValue(b.Mark) || a._id.localeCompare(b._id));
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
        ${visibleFields.map((field) => `<div class="core-cell">${escapeHtml(field)}</div>`).join("")}
      </div>
    `;
    const body = state.visible.map((row) => `
      <div class="core-row ${state.reviewed.has(row._id) ? "reviewed" : ""}" data-row="${escapeHtml(row._id)}">
        <label class="core-cell core-check"><input type="checkbox" ${state.reviewed.has(row._id) ? "checked" : ""} aria-label="Reviewed mark ${escapeHtml(row.Mark)}"></label>
        <div class="core-cell"><b>${escapeHtml(row.Mark || "-")}</b></div>
        ${visibleFields.map((field) => `<div class="core-cell">${escapeHtml(row[field] || "-")}</div>`).join("")}
      </div>
    `).join("");
    els.board.innerHTML = header + body;
    els.status.textContent = `Showing ${state.visible.length} of ${source.length} Core rows. Check the left box when the full row is reviewed.`;
  }

  function applyFilter() {
    const wanted = parseFilter(els.input.value);
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

setupManualDeck("hss", "HSS", parseManualTable(hssTable));
setupManualDeck("pim", "PIM", []);
