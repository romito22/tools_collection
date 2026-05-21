const hssTable = `
CB-ID|EOR-ID|Line|Grids|Lvls|Mark|Qty|Lc|Type|Hc|Wc|tc|Cap Qty|W1cc|H1cc|t1cc|t2cc|rcc|tcc|DWL|DWL-i|DWcc|H2cc-DWL|H1cc-H2cc-t1cc
CB-13.5|BRB13.5|12.3|W.8 to Y|250|1251|1|29'-6 1/4"|t|14.000|14.000|0.5000|4|13 10/16|6 12/16|13/16|2 5/16|8/16|8/16|6|6|0|2 4/16|3 5/16
CB-13.5|BRB13.5|12.3|Y to Z|250|1252|1|25'-4 3/4"|t|14.000|14.000|0.3750|4|13 10/16|6 12/16|13/16|2 3/16|6/16|8/16|6|6|0|2 4/16|3 5/16
CB-23.0|BRB23|Z|12.3 to 11.6|290|1253|1|28'-6 3/4"|t|16.000|16.000|0.5000|4|15 10/16|7 12/16|1 3/16|2 9/16|8/16|8/16|5|5|0|3 3/16|3 1/16
CB-20.0|BRB20|Z|11.6 to 10.8|290|1254|1|32'-9 1/2"|p|20.000|20.000|0.5000|4|19 10/16|9 12/16|1 1/16|4 11/16|-|-|5|5|0|3 1/16|5 5/16
CB-20.0|BRB20|Z|10.8 to 9.8|290|1255|1|41'-0"|t|20.000|20.000|0.5000|4|19 10/16|9 12/16|1 1/16|4 11/16|-|-|5|5|0|3 1/16|5 5/16
CB-23.0|BRB23|Z|12.3 to 11.6|290|1256|1|21'-7 3/4"|t|16.000|16.000|0.3750|4|15 10/16|7 12/16|1 3/16|2 8/16|4/16|4/16|5|5|0|3 3/16|3 1/16
CB-20.0|BRB20|Z|11.6 to 9.8|270|1257|1|26'-2 1/2"|t|16.000|16.000|0.5000|4|15 10/16|7 12/16|1 1/16|2 11/16|-|8/16|5|5|0|3 1/16|3 5/16
CB-20.0|BRB20|Z|10.8 to 9.8|270|1258|1|34'-8"|p|20.000|20.000|0.6250|4|19 10/16|9 12/16|1 1/16|4 11/16|-|8/16|5|5|0|3 1/16|5 5/16
CB-23.0|BRB23|Z|12.3 to 11.6|250|1259|1|19'-5 3/4"|t|16.000|16.000|0.3750|4|15 10/16|7 12/16|1 1/16|2 7/16|6/16|8/16|5|5|0|3 1/16|3 1/16
CB-20.0|BRB20|Z|11.6 to 9.8|250|1260|1|24'-0 1/2"|p|20.000|20.000|0.5000|4|19 10/16|9 12/16|1 1/16|2 11/16|-|8/16|5|5|0|3 1/16|5 5/16
CB-20.0|BRB20|Z|10.8 to 9.8|250|1261|1|32'-9"|p|20.000|20.000|0.5000|4|19 10/16|9 12/16|1 1/16|4 11/16|-|8/16|5|5|0|3 1/16|5 5/16
CB-11.0|BRB11|8|R to CL|270|1262|1|35'-9 1/4"|p|20.000|20.000|0.3750|4|19 10/16|9 12/16|11/16|5 5/16|-|8/16|5|5|0|3 3/16|5 9/16
CB-5.0|BRB5|29.5|R to CL|340|1263|1|28'-2 3/4"|p|12.750|12.750|0.3750|4|12 6/16|6 2/16|9/16|3 9/16|-|8/16|4|4|0|1 12/16|3 9/16
CB-8.0|BRB8|29.5|CL to S.1|325|1264|1|28'-2 3/4"|p|12.750|12.750|0.3750|4|12 6/16|6 2/16|9/16|3 9/16|-|8/16|4|4|0|1 12/16|3 9/16
CB-6.0|BRB6|29.5|W to X|340|1265|1|32'-4 1/4"|t|12.000|12.000|0.2500|4|11 10/16|5 12/16|11/16|2 8/16|4/16|4/16|5|5|0|3 1/16|1 12/16
CB-9.5|BRB9.5|29.5|W to X|325|1266|1|22'-4 3/4"|t|12.000|12.000|0.3125|4|11 10/16|5 12/16|11/16|1 14/16|5/16|4/16|5|5|0|2 12/16|2
CB-15.0|BRB15|Q|17 to 16|355|1267|1|19'-10 1/2"|p|16.000|16.000|0.3750|4|13 10/16|6 12/16|13/16|1 11/16|-|8/16|5|5|0|2 5/16|4 5/16
CB-15.0|BRB15|Q|16 to 15|355|1268|1|20'-11 1/2"|p|16.000|16.000|0.3750|4|13 10/16|6 12/16|13/16|2 11/16|-|8/16|5|5|0|2 5/16|4 5/16
CB-17.5|BRB17.5|Q|17 to 16|355|1269|1|33'-7 1/4"|p|20.000|20.000|0.5000|4|19 10/16|9 12/16|15/16|4 11/16|-|8/16|5|5|0|2 13/16|5 11/16
CB-17.5|BRB17.5|Q|16 to 15|355|1270|1|35'-2 1/4"|p|20.000|20.000|0.5000|4|19 10/16|9 12/16|15/16|4 11/16|-|8/16|5|5|0|2 13/16|5 11/16
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
