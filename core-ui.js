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

function coreCompact(values) {
  const clean = [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
  return clean.length ? clean.join(" / ") : "-";
}

function coreGcd(a, b) {
  return b ? coreGcd(b, a % b) : Math.abs(a);
}

function coreReduceFractionText(value) {
  return String(value ?? "").replace(/(\d+)\s*\/\s*(\d+)/g, (match, top, bottom) => {
    const numerator = Number(top);
    const denominator = Number(bottom);
    if (!denominator) return match;
    const divisor = coreGcd(numerator, denominator);
    return `${numerator / divisor}/${denominator / divisor}`;
  });
}

function coreDisplay(value) {
  return coreReduceFractionText(coreEscape(value || "-"));
}

function coreInchDisplay(row, field) {
  const inches = coreReduceFractionText(row[field] || "-");
  return inches === "-" ? "-" : `${inches}"`;
}

function coreCombineByMark(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const mark = String(row.Mark ?? "").trim();
    if (!mark) return;
    if (!groups.has(mark)) groups.set(mark, []);
    groups.get(mark).push(row);
  });

  return [...groups.entries()].map(([mark, groupRows]) => {
    const row = { Mark: mark, _combined: groupRows.length };
    const keys = [...new Set(groupRows.flatMap((item) => Object.keys(item)))];
    keys.forEach((key) => {
      if (key === "Mark") return;
      row[key] = key === "Qty"
        ? groupRows.reduce((sum, item) => sum + (Number(item.Qty) || 0), 0)
        : coreCompact(groupRows.map((item) => item[key]));
    });
    row.Location = coreCompact(groupRows.map((item) => `${item.Line || "-"} / ${item.Grids || "-"} / Lv ${item.Lvls || "-"}`));
    return row;
  });
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
    status: coreById("coreStatus"),
    prev: coreById("corePrevBtn"),
    next: coreById("coreNextBtn"),
    viewerTitle: coreById("coreViewerTitle"),
    viewerCount: coreById("coreViewerCount"),
    viewerEyebrow: coreById("coreViewerEyebrow"),
    viewerSvg: coreById("coreViewerSvg"),
    viewerMeta: coreById("coreViewerMeta")
  };
  if (!els.board) return;

  const visibleFields = ["CB-ID", "Location", "Lsc", "Fy min", "Fy max", "Wsc", "# Plies", "tply", "tsc", "Wsg", "Whpsc", "rhpsc", "Lsg", "Lsc-2*Lsg"];
  const source = coreCombineByMark(rows).map((row, index) => ({
    ...row,
    _id: `${row.Mark || "row"}-${index}`
  })).sort((a, b) => coreMarkSort(a.Mark) - coreMarkSort(b.Mark) || a._id.localeCompare(b._id));
  const state = { visible: source, reviewed: new Set(), active: 0 };

  function counts() {
    els.total.textContent = source.length;
    els.shown.textContent = state.visible.length;
    els.reviewed.textContent = state.reviewed.size;
    els.open.textContent = Math.max(0, source.length - state.reviewed.size);
  }

  function activeRow() {
    if (!state.visible.length) return null;
    state.active = Math.max(0, Math.min(state.active, state.visible.length - 1));
    return state.visible[state.active];
  }

  function renderDimension(x1, x2, y, label, offset = 0) {
    const tickTop = y - 14;
    const tickBottom = y + 14;
    const textY = y - 8 + offset;
    return `
      <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="dim-line"></line>
      <line x1="${x1}" y1="${tickTop}" x2="${x1}" y2="${tickBottom}" class="dim-line"></line>
      <line x1="${x2}" y1="${tickTop}" x2="${x2}" y2="${tickBottom}" class="dim-line"></line>
      <path d="M ${x1} ${y} l 12 -5 l 0 10 z" class="dim-arrow"></path>
      <path d="M ${x2} ${y} l -12 -5 l 0 10 z" class="dim-arrow"></path>
      <text x="${(x1 + x2) / 2}" y="${textY}" text-anchor="middle" class="dim-text">${coreDisplay(label)}</text>
    `;
  }

  function renderViewer() {
    const row = activeRow();
    if (!row) {
      if (els.viewerTitle) els.viewerTitle.textContent = "No Core marks";
      if (els.viewerCount) els.viewerCount.textContent = "0 of 0";
      if (els.viewerSvg) els.viewerSvg.innerHTML = "";
      if (els.viewerMeta) els.viewerMeta.innerHTML = `<span>No data loaded.</span>`;
      return;
    }

    const title = `Mark ${row.Mark || "-"} | ${row["CB-ID"] || "-"} | Qty ${row.Qty || "-"}`;
    if (els.viewerTitle) els.viewerTitle.textContent = title;
    if (els.viewerCount) els.viewerCount.textContent = `${state.active + 1} of ${state.visible.length}`;
    if (els.viewerEyebrow) els.viewerEyebrow.textContent = row.Location || "Core brace display";

    if (els.viewerSvg) {
      const overall = coreReduceFractionText(row.Lsc || "-");
      const net = coreReduceFractionText(row["Lsc-2*Lsg"] || "-");
      const endLength = coreInchDisplay(row, "Lsg");
      const plate = `(${row["# Plies"] || "-"} PL) ${coreInchDisplay(row, "tply")} X ${coreInchDisplay(row, "Wsc")} X ${overall}`;
      const fy = `Fy ${coreDisplay(row["Fy min"])} - ${coreDisplay(row["Fy max"])} ksi`;
      els.viewerSvg.innerHTML = `
        <rect x="18" y="18" width="884" height="264" rx="8" class="core-paper"></rect>
        ${renderDimension(100, 820, 55, overall)}
        ${renderDimension(205, 715, 88, net)}
        ${renderDimension(100, 205, 122, endLength, 30)}
        ${renderDimension(715, 820, 122, endLength, 30)}
        <line x1="95" y1="150" x2="825" y2="150" class="brace-center"></line>
        <rect x="100" y="132" width="720" height="36" class="brace-body"></rect>
        <rect x="100" y="127" width="105" height="46" class="end-plate"></rect>
        <rect x="715" y="127" width="105" height="46" class="end-plate"></rect>
        <line x1="100" y1="120" x2="100" y2="184" class="ext-line"></line>
        <line x1="205" y1="110" x2="205" y2="190" class="ext-line"></line>
        <line x1="715" y1="110" x2="715" y2="190" class="ext-line"></line>
        <line x1="820" y1="120" x2="820" y2="184" class="ext-line"></line>
        <text x="65" y="156" text-anchor="middle" class="side-text" transform="rotate(-90 65 156)">Wsc ${coreInchDisplay(row, "Wsc")}</text>
        <text x="855" y="156" text-anchor="middle" class="side-text" transform="rotate(90 855 156)">tsc ${coreInchDisplay(row, "tsc")}</text>
        <text x="110" y="226" class="note-text">${coreDisplay(row["# Plies"] || "-")}</text>
        <text x="110" y="252" class="note-text">${fy}</text>
        <text x="460" y="226" text-anchor="middle" class="title-block">${coreDisplay(plate)}</text>
        <text x="812" y="248" text-anchor="end" class="mark-block">${coreEscape(row.Mark || "-")}</text>
      `;
    }

    if (els.viewerMeta) {
      const meta = [
        ["Lsc", row.Lsc],
        ["Lsc-2*Lsg", row["Lsc-2*Lsg"]],
        ["Wsc", coreInchDisplay(row, "Wsc")],
        ["# Plies", row["# Plies"]],
        ["tply", coreInchDisplay(row, "tply")],
        ["Wsg", coreInchDisplay(row, "Wsg")],
        ["Whpsc", coreInchDisplay(row, "Whpsc")],
        ["rhpsc", coreInchDisplay(row, "rhpsc")]
      ];
      els.viewerMeta.innerHTML = meta.map(([label, value]) => `<span><b>${coreEscape(label)}</b>${coreDisplay(String(value).replace(/\s+/g, " ").trim())}</span>`).join("");
    }
  }

  function render() {
    counts();
    if (!source.length) {
      els.board.innerHTML = `<p class="note">No Core rows loaded.</p>`;
      els.status.textContent = "Waiting for Core data.";
      renderViewer();
      return;
    }
    const current = activeRow();
    const header = `
      <div class="core-head">
        <div class="core-cell core-check">OK</div>
        <div class="core-cell">Mark</div>
        ${visibleFields.map((field) => `<div class="core-cell">${coreEscape(field)}</div>`).join("")}
      </div>
    `;
    const body = state.visible.map((row) => `
      <div class="core-row ${state.reviewed.has(row._id) ? "reviewed" : ""} ${current && current._id === row._id ? "active" : ""}" data-row="${coreEscape(row._id)}">
        <label class="core-cell core-check"><input type="checkbox" ${state.reviewed.has(row._id) ? "checked" : ""} aria-label="Reviewed mark ${coreEscape(row.Mark)}"></label>
        <div class="core-cell"><b>${coreDisplay(row.Mark || "-")}</b></div>
        ${visibleFields.map((field) => `<div class="core-cell">${coreDisplay(row[field] || "-")}</div>`).join("")}
      </div>
    `).join("");
    els.board.innerHTML = header + body;
    els.status.textContent = `Showing ${state.visible.length} of ${source.length} combined Core marks. Check the left box when the full mark row is reviewed.`;
    renderViewer();
  }

  function applyFilter() {
    const wanted = coreParseFilter(els.input.value);
    state.visible = wanted.length ? source.filter((row) => wanted.includes(String(row.Mark))) : source;
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
    if (index >= 0) {
      state.active = index;
      render();
    }
  });
  els.prev?.addEventListener("click", () => {
    if (!state.visible.length) return;
    state.active = (state.active - 1 + state.visible.length) % state.visible.length;
    render();
  });
  els.next?.addEventListener("click", () => {
    if (!state.visible.length) return;
    state.active = (state.active + 1) % state.visible.length;
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
