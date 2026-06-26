const hssTable = `
CB-ID|EOR-ID|Line|Grids|Lvls|Mark|Qty|Lc|Type|Hc|Wc|tc|Cap Qty|W1cc|H1cc|t1cc|t2cc|rcc|tcc|DWL|DWL-i|DWcc|H2cc-DWL|H1cc-H2cc-t1cc
CB-6.50|BRB-6.50|1-1|B.2-A.2|2|1901|2|12'-0 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|1 7/16|1/4|1/4|4|4|0.125|2 13/16|1 1/8
CB-12.00|BRB-12.00|1-1|B.2-A.2|1|1902|2|16'-1 1/4"|t|12.000|12.000|0.3125|8|11 5/8|5 3/4|13/16|1 11/16|5/16|1/4|5|5|0.125|3 3/8|1 1/4
CB-4.25|BRB-4.25|1-A|1-1.5|2|1903|1|13'-6 1/4"|t|8.000|8.000|0.2500|4|7 5/8|3 3/4|9/16|1 9/16|1/4|1/4|4|4|0.125|1 5/8|1 5/16
CB-4.25|BRB-4.25|1-A|1.5-2|2|1904|1|14'-4 1/4"|t|8.000|8.000|0.2500|4|7 5/8|3 3/4|9/16|1 9/16|1/4|1/4|4|4|0.125|1 5/8|1 5/16
CB-9.00|BRB-9.00|1-A|1-2|1|1905|2|18'-9 1/4"|t|12.000|12.000|0.2500|8|11 5/8|5 3/4|11/16|2 1/16|1/4|1/4|4|4|0.125|3 7/16|1 3/8
CB-6.50|BRB-6.50|1-22|CC.2-DD.1|2|1906|2|13'-0 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|1 7/16|1/4|1/4|4|4|0.125|2 13/16|1 1/8
CB-12.00|BRB-12.00|1-22|CC.2-DD.1|1|1907|2|17'-0 1/4"|t|12.000|12.000|0.3125|8|11 5/8|5 3/4|13/16|1 11/16|5/16|1/4|5|5|0.125|3 3/8|1 1/4
CB-4.25|BRB-4.25|1-EE|21-MID|2|1908|2|15'-3 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|9/16|1 9/16|1/4|1/4|4|4|0.125|1 5/8|1 5/16
CB-9.00|BRB-9.00|1-EE|21-MID|1|1909|2|19'-3 1/4"|t|12.000|12.000|0.2500|8|11 5/8|5 3/4|11/16|2 1/16|1/4|1/4|4|4|0.125|3 7/16|1 3/8
CB-5.00|BRB-5.00|1-F|3-4|3|2910|6|14'-9 1/4"|t|10.000|10.000|0.2500|24|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-9.00|BRB-9.00|1-F|3-5|2|2911|4|13'-4 1/4"|t|12.000|12.000|0.2500|16|11 5/8|5 3/4|11/16|2 1/16|1/4|1/4|5|5|0.125|3 3/8|1 3/8
CB-16.00|BRB-16.00|1-F|3-5|1|2912|2|16'-3 3/4"|t|16.000|16.000|0.3125|8|1' 3 5/8"|7 3/4|13/16|2 3/8|5/16|1/2|6|6|0.25|2 7/8|3 11/16
CB-5.00|BRB-5.00|1-HH|23-24|3|2913|2|15'-0 1/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-7.00|BRB-7.00|1-HH|23-24|2|2914|2|13'-6 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|11/16|1 7/8|1/4|1/4|4|4|0.125|2 11/16|1 1/8
CB-11.00|BRB-11.00|1-HH|23-24|1|2915|4|17'-0 3/4"|t|12.000|12.000|0.2500|16|11 5/8|5 3/4|13/16|2|1/4|1/4|5|5|0.125|3 1/16|1 9/16
CB-5.00|BRB-5.00|1-I|3-4|3|2916|1|14'-4 1/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-5.00|BRB-5.00|1-I|4-5|3|2917|1|15'-3 1/4"|t|10.000|10.000|0.2500|4|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-7.50|BRB-7.50|1-I|3-5|2|2918|4|13'-10 3/4"|t|10.000|10.000|0.2500|16|9 5/8|4 3/4|11/16|1 11/16|1/4|1/4|4|4|0.125|2 7/8|15/16
CB-4.50|BRB-4.50|1-27|RR.1-RR.3|3|2919|2|14'-2 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|9/16|1 7/16|1/4|1/4|4|4|0.125|1 3/4|1 3/16
CB-7.00|BRB-7.00|1-25|GG.2-HH.1|2|2920|2|12'-7 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|11/16|1 7/8|1/4|1/4|4|4|0.125|2 11/16|1 1/8
CB-11.00|BRB-11.00|1-25|GG.2-HH.1|1|2921|2|15'-7 3/4"|t|12.000|12.000|0.2500|8|11 5/8|5 3/4|13/16|2|1/4|1/4|5|5|0.125|3 1/16|1 9/16
CB-5.00|BRB-5.00|1-3|K-J.5|3|2922|2|13'-6 1/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|2 3/16|1/4|1/4|4|4|0.125|1 3/4|2 3/16
CB-6.00|BRB-6.00|1-3|J-I.5|3|2923|2|13'-2 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|1 11/16|1/4|1/4|4|4|0.125|2 9/16|1 3/8
CB-7.50|BRB-7.50|1-3|K-J.5|2|2924|2|13'-1 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|11/16|1 11/16|1/4|1/4|4|4|0.125|2 7/8|15/16
CB-8.50|BRB-8.50|1-3|J-I.5|2|2925|2|12'-7 1/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|11/16|1 5/16|1/4|1/4|5|5|0.125|3 3/16|9/16
CB-13.00|BRB-13.00|1-3|K-J.5|1|2926|2|16'-0 1/4"|t|14.000|14.000|0.3125|8|1' 1 5/8"|6 3/4|13/16|2 3/8|5/16|1/2|6|6|0.25|2 1/4|3 5/16
CB-10.00|BRB-10.00|1-3|J-I.5|1|2927|2|16'-2 3/4"|t|12.000|12.000|0.2500|8|11 5/8|5 3/4|11/16|1 11/16|1/4|1/4|5|5|0.125|2 7/8|1 7/8
CB-13.00|BRB-13.00|1-M|3-5|1|2928|2|14'-8 1/4"|t|14.000|14.000|0.3125|8|1' 1 5/8"|6 3/4|13/16|2 3/8|5/16|1/2|6|6|0.25|2 5/16|3 1/4
CB-11.00|BRB-11.00|1-N|3-5|1|2929|2|13'-0 3/4"|t|12.000|12.000|0.2500|8|11 5/8|5 3/4|13/16|2|1/4|1/4|6|6|0.125|3|1 9/16
CB-4.50|BRB-4.50|1-Q|5-4|3|2930|2|14'-9 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|9/16|1 7/16|1/4|1/4|4|4|0.125|1 3/4|1 3/16
CB-6.00|BRB-6.00|1-Q|5-3|2|2931|2|14'-0 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|1 11/16|1/4|1/4|4|4|0.125|2 9/16|1 3/8
CB-7.50|BRB-7.50|1-Q|5-3|1|2932|2|14'-2 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|11/16|1 11/16|1/4|1/4|4|4|0.125|2 7/8|15/16
CB-7.00|BRB-7.00|1-27|RR.1-RR.3|2|2933|2|12'-7 3/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|11/16|1 7/8|1/4|1/4|4|4|0.125|2 11/16|1 1/8
CB-10.00|BRB-10.00|1-27|RR.1-RR.3|1|2934|2|11'-5 3/4"|t|12.000|12.000|0.2500|8|11 5/8|5 3/4|11/16|1 11/16|1/4|1/4|5|5|0.125|2 7/8|1 7/8
CB-4.25|BRB-4.25|1-26|KK.6-MM.1|3|2935|2|14'-2 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|9/16|1 9/16|1/4|1/4|4|4|0.125|1 5/8|1 5/16
CB-5.50|BRB-5.50|1-26|KK.6-MM.1|2|2936|2|13'-0 1/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|1 15/16|1/4|1/4|4|4|0.125|2 3/8|1 9/16
CB-10.00|BRB-10.00|1-26|KK.6-MM.1|1|2937|2|13'-3 3/4"|t|12.000|12.000|0.2500|8|11 5/8|5 3/4|11/16|1 11/16|1/4|1/4|5|5|0.125|2 7/8|1 7/8
CB-4.25|BRB-4.25|1-3|P.1-O.2|3|2938|2|13'-0 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|9/16|1 9/16|1/4|1/4|4|4|0.125|1 5/8|1 5/16
CB-8.00|BRB-8.00|1-3|P.1-O.2|2|2939|2|12'-1 1/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|11/16|1 1/2|1/4|1/4|4|4|0.125|3 1/16|3/4
CB-13.00|BRB-13.00|1-3|P.1-O.2|1|2940|2|11'-3 1/4"|t|14.000|14.000|0.3125|8|1' 1 5/8"|6 3/4|13/16|2 3/8|5/16|1/2|7|7|0.25|2 1/2|3
CB-4.50|BRB-4.50|1-25|GG.2-HH.1|3|2959|2|14'-1 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|9/16|1 7/16|1/4|1/4|4|4|0.125|1 3/4|1 3/16
CB-6.00|BRB-6.00|4-1|D-C|1|4945|2|26'-2 1/4"|t|10.000|10.000|0.3750|8|9 5/8|4 3/4|9/16|1 11/16|3/8|1/2|4|4|0.25|2 9/16|1 3/8
CB-4.25|BRB-4.25|4-3|C-D|1|4946|2|25'-3 1/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|2 9/16|1/4|1/4|4|4|0.125|1 5/8|2 5/16
CB-2.00|BRB-2.00|4-F|2-1.5|1|4947|2|15'-3 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|5/16|1 11/16|1/4|1/4|3|3|0.125|1 3/8|1 7/8
CB-6.00|BRB-6.00|4-A|6-7|1|4948|2|28'-8 1/4"|t|10.000|10.000|0.5000|8|9 5/8|4 3/4|9/16|1 11/16|1/2|1/2|4|4|0.25|2 9/16|1 3/8
CB-8.50|BRB-8.50|4-8|C.7-D.1|1|4949|2|26'-1 3/4"|t|12.000|12.000|0.3750|8|11 5/8|5 3/4|11/16|2 5/16|3/8|1/2|4|4|0.25|3 1/4|1 9/16
CB-7.00|BRB-7.00|4-H|6-5|1|4950|2|26'-9 1/4"|t|10.000|10.000|0.5000|8|9 5/8|4 3/4|11/16|1 7/8|1/2|1/2|4|4|0.25|2 11/16|1 1/8
CB-3.50|BRB-3.50|4-E|2-1.5|2|4951|1|13'-10 1/4"|t|8.000|8.000|0.2500|4|7 5/8|3 3/4|7/16|1 3/8|1/4|1/4|3|3|0.125|1 15/16|1 3/16
CB-3.50|BRB-3.50|4-E|1.5-1|2|4952|1|14'-8 1/4"|t|8.000|8.000|0.2500|4|7 5/8|3 3/4|7/16|1 3/8|1/4|1/4|3|3|0.125|1 15/16|1 3/16
CB-5.50|BRB-5.50|4-E|2-1.5|1|4953|2|14'-9 1/4"|t|10.000|10.000|0.2500|8|9 5/8|4 3/4|9/16|1 15/16|1/4|1/4|4|4|0.125|2 3/8|1 9/16
CB-2.00|BRB-2.00|4-H|4-3|1|4954|2|12'-2 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|5/16|1 11/16|1/4|1/4|3|3|0.125|1 3/8|1 7/8
CB-4.50|BRB-4.50|4-4|E-F|2|4955|2|10'-6 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|9/16|1 7/16|1/4|1/4|4|4|0.125|1 3/4|1 3/16
CB-2.00|BRB-2.00|4-2|H-MID|1|4956|2|13'-2 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|5/16|1 11/16|1/4|1/4|3|3|0.125|1 3/8|1 7/8
CB-2.00|BRB-2.00|4-1|F-E.5|1|4957|2|12'-9 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|5/16|1 11/16|1/4|1/4|3|3|0.125|1 3/8|1 7/8
CB-4.50|BRB-4.50|4-4|E-F|1|4958|2|13'-10 1/4"|t|8.000|8.000|0.2500|8|7 5/8|3 3/4|9/16|1 7/16|1/4|1/4|4|4|0.125|1 3/4|1 3/16
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
