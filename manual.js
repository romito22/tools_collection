const hssTable = `
CB-ID|EOR-ID|Line|Grids|Lvls|Mark|Qty|Lc|Type|Hc|Wc|tc|Cap Qty|W1cc|H1cc|t1cc|t2cc|rcc|tcc|DWL|DWL-i|DWcc|H2cc-DWL|H1cc-H2cc-t1cc
CB-3.50|CB-3.5|A|5.1 to CL|1|1907|2|9'-8 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|7/16|1 3/8|1/4|1/4|4|4|0.125|1 7/8|1 3/16
CB-7.50|CB-7.5|B.4|24 to 25|2|1908|1|12'-11 3/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|11/16|1 11/16|1/4|1/4|4|4|0.125|2 7/8|15/16
CB-6.00|CB-6.0|B.4|24 to 25|1|1909|1|12'-2 3/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|1 11/16|1/4|1/4|4|4|0.125|2 9/16|1 3/8
CB-5.50|CB-5.5|B.6|7(+) to 9(-)|1|1910|1|20'-0 1/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|1 15/16|1/4|1/4|4|4|0.125|2 3/8|1 9/16
CB-8.00|CB-8.0|D|12 to 13|2|1911|1|16'-3 1/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|11/16|1 1/2|1/4|1/4|4|4|0.125|3 1/16|3/4
CB-5.00|CB-5.0|D|12 to 13|1|1912|1|17'-2 1/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-5.00|CB-5.0|F|2.1 to 3.6|1|1913|1|18'-4 1/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-5.50|CB-5.5|2.1|B.6 to B.3|1|1914|1|18'-1 1/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|1 15/16|1/4|1/4|4|4|0.125|2 3/8|1 9/16
CB-5.50|CB-5.5|10.9|C(-) to B.3(+)|2|1916|1|11'-9 1/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|1 15/16|1/4|1/4|4|4|0.125|2 3/8|1 9/16
CB-7.50|CB-7.5|10.9|C(-) to B.3(+)|1|1917|1|10'-4 3/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|11/16|1 11/16|1/4|1/4|4|4|0.125|2 7/8|15/16
CB-3.00|CB-3.0|15|B.4 to A.4|2|1918|1|16'-7 1/4"|t|8.000|8.000|0.2500|4|7 5/8|3 3/4|7/16|1 11/16|1/4|1/4|3|3|0.125|1 5/8|1 1/2
CB-5.50|CB-5.5|15|B.4 to A.4|1|1919|1|15'-5 1/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|1 15/16|1/4|1/4|4|4|0.125|2 3/8|1 9/16
CB-3.50|CB-3.5|20|B.4 to A.4|2|1920|2|16'-6 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|7/16|1 3/8|1/4|1/4|3|3|0.125|1 15/16|1 3/16
CB-6.00|CB-6.0|20|B.4 to A.4|1|1921|1|15'-8 3/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|1 11/16|1/4|1/4|4|4|0.125|2 9/16|1 3/8
CB-6.00|CB-6.0|24|F to E.2|1|1922|1|15'-6 3/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|1 11/16|1/4|1/4|4|4|0.125|2 9/16|1 3/8
CB-4.00|CB-4.0|Q|12 to CL|2|2901|4|13'-9 1/4"|t|8.000|8.000|0.2500|16|7 5/8|3 3/4|9/16|1 11/16|1/4|1/4|4|4|0.125|1 5/8|1 5/16
CB-8.00|CB-8.0|Q|12 to CL|1|2902|4|12'-2 1/4"|t|10.000|10.000|0.2500|16|9 5/8|4 3/4|11/16|1 1/2|1/4|1/4|4|4|0.125|3 1/16|3/4
CB-3.00|CB-3.0|19|Q to P|2|2903|3|16'-9 1/4"|t|8.000|8.000|0.2500|12|7 5/8|3 3/4|7/16|1 11/16|1/4|1/4|3|3|0.125|1 5/8|1 1/2
CB-5.00|CB-5.0|19|Q to P|1|2904|3|15'-11 1/4"|t|10.000|10.000|0.2500|12|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-3.00|CB-3.0|23|Q to P|2|2907|3|16'-9 1/4"|t|8.000|8.000|0.2500|12|7 5/8|3 3/4|7/16|1 11/16|1/4|1/4|3|3|0.125|1 5/8|1 1/2
CB-5.00|CB-5.0|23|Q to P|1|2908|3|15'-11 1/4"|t|10.000|10.000|0.2500|12|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-7.00|CB-7.0|G.4|12(+) to 13(+)|1|2922|1|13'-8 3/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|11/16|1 7/8|1/4|1/4|4|4|0.125|2 11/16|1 1/8
CB-4.50|CB-4.5|12.6|G.4 to H(+)|1|2923|1|20'-9 3/4"|t|8.000|8.000|0.3750|4|7 5/8|3 3/4|9/16|1 7/16|3/8|1/2|4|4|0.25|1 3/4|1 3/16
CB-4.00|CB-4.0|L.7|12 to 13|1|2924|1|17'-1 1/4"|t|8.000|8.000|0.2500|4|7 5/8|3 3/4|9/16|1 11/16|1/4|1/4|4|4|0.125|1 5/8|1 5/16
CB-4.00|CB-4.0|X|12 to CL|2|3901|4|13'-9 1/4"|t|8.000|8.000|0.2500|16|7 5/8|3 3/4|9/16|1 11/16|1/4|1/4|4|4|0.125|1 5/8|1 5/16
CB-8.00|CB-8.0|X|12 to CL|1|3902|4|12'-2 1/4"|t|10.000|10.000|0.2500|16|9 5/8|4 3/4|11/16|1 1/2|1/4|1/4|4|4|0.125|3 1/16|3/4
CB-3.00|CB-3.0|19|X to W|2|3903|3|16'-9 1/4"|t|8.000|8.000|0.2500|12|7 5/8|3 3/4|7/16|1 11/16|1/4|1/4|3|3|0.125|1 5/8|1 1/2
CB-5.00|CB-5.0|19|X to W|1|3904|3|15'-11 1/4"|t|10.000|10.000|0.2500|12|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-4.00|CB-4.0|Q.2|12 to 13|2|3905|1|17'-3 1/4"|t|8.000|8.000|0.3125|4|7 5/8|3 3/4|9/16|1 11/16|5/16|1/4|4|4|0.125|1 5/8|1 5/16
CB-4.50|CB-4.5|Q.2|12 to 13|1|3906|1|16'-9 1/4"|t|8.000|8.000|0.3125|4|7 5/8|3 3/4|9/16|1 7/16|5/16|1/4|4|4|0.125|1 3/4|1 3/16
CB-3.00|CB-3.0|23|X to W|2|3907|3|16'-9 1/4"|t|8.000|8.000|0.2500|12|7 5/8|3 3/4|7/16|1 11/16|1/4|1/4|3|3|0.125|1 5/8|1 1/2
CB-5.00|CB-5.0|23|X to W|1|3908|3|15'-11 1/4"|t|10.000|10.000|0.2500|12|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-4.00|CB-4.0|DD|12 to CL|2|4901|4|13'-9 1/4"|t|8.000|8.000|0.2500|16|7 5/8|3 3/4|9/16|1 11/16|1/4|1/4|4|4|0.125|1 5/8|1 5/16
CB-8.00|CB-8.0|DD|12 to CL|1|4902|4|12'-2 1/4"|t|10.000|10.000|0.2500|16|9 5/8|4 3/4|11/16|1 1/2|1/4|1/4|4|4|0.125|3 1/16|3/4
CB-3.00|CB-3.0|19|EE to DD|2|4903|4|16'-9 1/4"|t|8.000|8.000|0.2500|16|7 5/8|3 3/4|7/16|1 11/16|1/4|1/4|3|3|0.125|1 5/8|1 1/2
CB-5.00|CB-5.0|19|EE to DD|1|4904|4|15'-11 1/4"|t|10.000|10.000|0.2500|16|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-4.00|CB-4.0|PN|12 to 13|2|4905|1|17'-3 1/4"|t|8.000|8.000|0.3125|4|7 5/8|3 3/4|9/16|1 11/16|5/16|1/4|4|4|0.125|1 5/8|1 5/16
CB-4.50|CB-4.5|PN|12 to 13|1|4906|1|16'-7 1/4"|t|8.000|8.000|0.3125|4|7 5/8|3 3/4|9/16|1 7/16|5/16|1/4|4|4|0.125|1 3/4|1 3/16
CB-3.00|CB-3.0|23|EE to DD|2|4907|2|16'-9 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|7/16|1 11/16|1/4|1/4|3|3|0.125|1 5/8|1 1/2
CB-5.00|CB-5.0|23|EE to DD|1|4908|2|15'-11 1/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
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
