function lugById(id) {
  return document.getElementById(id);
}

function lugEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function lugGcd(a, b) {
  return b ? lugGcd(b, a % b) : Math.abs(a);
}

function lugReduce(value) {
  return String(value ?? "").trim().replace(/(\d+)\s*\/\s*(\d+)/g, (match, n, d) => {
    const num = Number(n);
    const den = Number(d);
    if (!den) return match;
    const g = lugGcd(num, den);
    return `${num / g}/${den / g}`;
  }).replace(/\s+/g, " ");
}

function lugParseInches(value) {
  const text = lugReduce(value).replace(/"/g, "").trim();
  if (!text || text === "-" || text.includes("'")) return null;
  const match = text.match(/^(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+))?$|^(\d+)\/(\d+)$/);
  if (!match) return null;
  if (match[4]) return Number(match[4]) / Number(match[5]);
  return Number(match[1]) + (Number(match[2] || 0) / Number(match[3] || 1));
}

function lugFormatMeasure(value) {
  const total = lugParseInches(value);
  if (total === null) return lugReduce(value || "-");
  return lugFormatInches(total);
}

function lugFormatInches(total) {
  const sixteenths = Math.round(total * 16);
  const feet = Math.floor(sixteenths / 192);
  const rem = sixteenths - feet * 192;
  const inches = Math.floor(rem / 16);
  const frac = rem % 16;
  const g = frac ? lugGcd(frac, 16) : 1;
  const fracText = frac ? `${frac / g}/${16 / g}` : "";
  const inchBase = inches || (!feet && !frac ? 0 : "");
  const inchText = [inchBase, fracText].filter((part) => part !== "").join(" ");
  return feet ? `${feet}'-${inchText || 0}\"` : `${inchText}\"`;
}

function lugParseFilter(text) {
  return String(text || "").split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean);
}

function lugCompact(values) {
  const clean = [...new Set(values.map((value) => lugReduce(value)).filter(Boolean).filter((value) => value !== "-"))];
  return clean.length ? clean.join(" / ") : "-";
}

function lugCombineByMark(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const mark = String(row.Mark || "").trim();
    if (!mark) return;
    if (!groups.has(mark)) groups.set(mark, []);
    groups.get(mark).push(row);
  });
  return [...groups.entries()].map(([mark, items]) => {
    const merged = { Mark: mark, _count: items.length };
    const keys = [...new Set(items.flatMap((row) => Object.keys(row)))].filter((key) => key !== "Mark");
    keys.forEach((key) => {
      merged[key] = key === "Qty"
        ? items.reduce((sum, row) => sum + (Number(row.Qty) || 0), 0)
        : lugCompact(items.map((row) => row[key]));
    });
    return merged;
  }).sort((a, b) => Number(a.Mark) - Number(b.Mark));
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
    meta: lugById("lugViewerMeta"),
    same: lugById("lugSameBox")
  };
  if (!els.board) return;

  const pinned = rows.some((row) => row._template === "pinned");
  const fields = pinned
    ? ["Piece", "Qty", "WL", "tL", "LTotal", "LsL", "xL", "thpL", "Wse", "LhpL", "rhpL", "Repad Piece", "Repad Qty", "drL", "dph", "dphc", "trL", "Pin Piece", "Pin Qty", "dp", "Lp", "Pin Cap Piece", "Pin Cap Qty", "dpc", "tpc", "Grade", "Bolt Dia"]
    : ["Qty", "LL", "WL", "tL", "LsL", "LLg", "a", "LFC", "LhpL", "W1", "WhpL", "rhpL", "W'se", "br", "e", "rL", "ni", "no", "s", "g", "dh", "LL-LsL", "s*(ni-1)", "LLG-rL", "rL-br", "WL-2e-2g"];
  const nonMeasures = new Set(["Piece", "Qty", "Repad Piece", "Repad Qty", "Pin Piece", "Pin Qty", "Pin Cap Piece", "Pin Cap Qty", "Grade", "Bolt Dia", "ni", "no"]);
  const measureFields = new Set(fields.filter((field) => !nonMeasures.has(field)));
  const source = lugCombineByMark(rows).map((row, index) => ({ ...row, _id: `${row.Mark}-${index}` }));
  const state = { visible: source, reviewed: new Set(), active: 0 };

  function sameSignature(row) {
    return fields
      .filter((field) => field !== "Qty")
      .map((field) => `${field}:${lugReduce(row[field] || "")}`)
      .join("|");
  }

  const sameGroups = source.reduce((map, row) => {
    const key = sameSignature(row);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
    return map;
  }, new Map());

  function value(row, field) {
    const raw = row[field] || "-";
    return measureFields.has(field) ? lugFormatMeasure(raw) : lugReduce(raw);
  }

  function numberValue(row, field) {
    const parsed = lugParseInches(row[field]);
    return parsed === null ? 0 : parsed;
  }

  function boltSpaces(row) {
    return Math.max(0, (Number(row.ni) || 0) + (Number(row.no) || 0) - 1);
  }

  function halfSpacing(row) {
    return (Number(row.no) || 0) > 0 ? numberValue(row, "s") / 2 : numberValue(row, "s");
  }

  function boltPatternText(row) {
    const spaces = boltSpaces(row);
    const half = halfSpacing(row);
    return spaces && half ? `${spaces}@(${lugFormatInches(half)})` : "-";
  }

  function boltPatternLength(row) {
    if (row["s*(ni-1)"] && row["s*(ni-1)"] !== "-") return value(row, "s*(ni-1)");
    const spaces = boltSpaces(row);
    const half = halfSpacing(row);
    return spaces && half ? lugFormatInches(spaces * half) : "-";
  }

  function measureCalc(row, fields, calc) {
    const values = fields.map((field) => numberValue(row, field));
    if (values.some((entry) => !entry)) return "-";
    return lugFormatInches(calc(...values));
  }

  function halfValue(row, field) {
    const raw = numberValue(row, field);
    return raw ? lugFormatInches(raw / 2) : "-";
  }

  function webHalf(row) {
    return measureCalc(row, ["WL", "e", "g"], (wl, e, g) => (wl - (2 * e) - (2 * g)) / 2);
  }

  function plateBannerQty(row) {
    return (Number(row.Qty) || 0) * 3 || row.Qty || "-";
  }

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

  function boxText(x, y, width, height, label, extra = "") {
    const cx = x + width / 2;
    const cy = y + height / 2 + 6;
    return `
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="3" class="lug-value-box ${extra}"></rect>
      <text x="${cx}" y="${cy}" text-anchor="middle" class="lug-box-text">${lugEscape(label)}</text>
    `;
  }

  function slotText(x, y, width, height, label, extra = "") {
    const cleanLabel = String(label ?? "").trim();
    if (!cleanLabel || cleanLabel === "-" || cleanLabel === "0\"" || cleanLabel === "R=0\"" || cleanLabel === "0") return "";
    const padX = Math.max(1.4, width * 0.08);
    const padY = Math.max(0.7, height * 0.12);
    return `
      <rect x="${x - padX}" y="${y - padY}" width="${width + padX * 2}" height="${height + padY * 2}" rx="1.2" class="lug-highlight ${extra}"></rect>
      <text x="${x + width / 2}" y="${y + height / 2 + 1.8}" text-anchor="middle" class="lug-slot-text ${extra}">${lugEscape(cleanLabel)}</text>
    `;
  }

  function slotTextScaled(x, y, sx, sy, label, extra = "") {
    return slotText(x, y, 25.804081 * sx, 5.349627 * sy, label, extra);
  }

  function renderViewer() {
    const row = activeRow();
    if (!row) return;
    if (pinned) {
      els.title.textContent = `Mark ${row.Mark} | ${row.Piece || "p33"} | Qty ${row.Qty || "-"}`;
      els.count.textContent = `${state.active + 1} of ${state.visible.length}`;
      els.eyebrow.textContent = `Pinned Lug | PL ${value(row, "tL")} X ${value(row, "WL")} X ${value(row, "LTotal")}`;
      els.svg.setAttribute("viewBox", "0 0 900 360");
      els.svg.innerHTML = `
        <rect x="0" y="0" width="900" height="360" class="lug-template-bg"></rect>
        <line x1="72" y1="184" x2="828" y2="184" class="lug-center"></line>
        <path d="M120 115 H590 L700 148 H790 V220 H700 L590 253 H120 A69 69 0 0 1 120 115 Z" class="lug-part"></path>
        <circle cx="150" cy="184" r="47" class="lug-part"></circle>
        <circle cx="150" cy="184" r="22" class="lug-template-bg"></circle>
        <circle cx="150" cy="184" r="32" fill="none" class="lug-center"></circle>
        <line x1="120" y1="72" x2="790" y2="72" class="lug-center"></line>
        <line x1="120" y1="62" x2="120" y2="82" class="lug-center"></line>
        <line x1="790" y1="62" x2="790" y2="82" class="lug-center"></line>
        ${boxText(390, 42, 130, 40, value(row, "LTotal"), "primary")}
        ${boxText(44, 155, 86, 42, value(row, "WL"), "primary")}
        ${boxText(284, 101, 92, 38, value(row, "LsL"))}
        ${boxText(500, 101, 92, 38, value(row, "xL"))}
        ${boxText(612, 266, 105, 38, value(row, "LhpL"))}
        ${boxText(94, 272, 115, 38, `PIN DIA ${value(row, "dp")}`)}
        ${boxText(222, 272, 122, 38, `HOLE DIA ${value(row, "dph")}`)}
        ${boxText(357, 272, 128, 38, `REPAD DIA ${value(row, "drL")}`)}
        ${boxText(726, 266, 132, 38, `R=${value(row, "rhpL")}`)}
        <text x="450" y="334" text-anchor="middle" class="lug-mark-text">${lugEscape(row.Piece || "p33")} LUG | ${lugEscape(row["Repad Piece"] || "p34")} REPAD | ${lugEscape(row["Pin Piece"] || "p35")} PIN | ${lugEscape(row["Pin Cap Piece"] || "p46")} CAP</text>
      `;
      const meta = ["Piece", "Qty", "LTotal", "WL", "tL", "LsL", "xL", "thpL", "Wse", "LhpL", "rhpL", "drL", "dph", "trL", "dp", "Lp", "dpc", "tpc", "Grade", "Bolt Dia"];
      els.meta.innerHTML = meta.map((field) => `<span><b>${lugEscape(field)}</b>${lugEscape(value(row, field))}</span>`).join("");
      const same = (sameGroups.get(sameSignature(row)) || []).filter((item) => item._id !== row._id);
      els.same.innerHTML = `<span>Same Data</span><b>${same.length ? same.map((item) => lugEscape(item.Mark)).join(", ") : "None"}</b>`;
      return;
    }
    const plateText = `PL ${value(row, "tL")} X ${value(row, "WL")} X ${value(row, "LL")}`;
    const hasOutsideRows = (Number(row.no) || 0) > 0 && numberValue(row, "g") > 0;
    const hasSingleHoleRow = !hasOutsideRows;
    els.title.textContent = `Mark ${row.Mark} | Qty ${row.Qty || "-"}`;
    els.count.textContent = `${state.active + 1} of ${state.visible.length}`;
    els.eyebrow.textContent = plateText;
    els.svg.setAttribute("viewBox", "0 62 300 150");
    els.svg.innerHTML = `
      <rect x="0" y="0" width="300" height="300" class="lug-template-bg"></rect>
      <path d="M63.813109,88.151773h55.856397L150,104.200653l71.941776,1.258735l49.720057,18.251666-.000001,3.146838-127.132299.314683-.314685,6.293678l127.446981-1.57342.314683,5.349627-48.461322,12.757537h-73.515195l-29.386442,19.969589h-56.800444c-22.256548-29.366715-20.603099-56.928052,0-81.817813Z" transform="matrix(1 0 0 0.539836 0.000005 58.244278)" class="lug-part"></path>
      <path d="M294.633758,128.745997L0,128.746002" transform="translate(2.683121 0.000005)" class="lug-center"></path>
      <g class="lug-slot-boxes">
        <rect width="25.804081" height="5.349627" transform="translate(130.925069 73.401844)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1 69.32005 91.480439)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1 69.32005 156.491213)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1 63.498366 173.169462)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1 101.732523 173.169462)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1 133.830252 173.169462)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1 164.160712 118.188357)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1 156.729151 149.999979)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1 175.804082 173.169462)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1 212.186467 170.494649)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1 225.088507 149.999979)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451222 0 0 1.182352 41.938871 186.842489)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.524387 0 0 1 88.201198 91.480439)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.487806 0 0 1 110.228973 91.480438)"></rect>
        <rect width="25.804081" height="5.349627" transform="translate(174.267165 86.130811)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.478443 0 0 1 156.72915 99.779347)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.478443 0 0 1 29.593089 106.517372)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.478443 0 0 1 29.593089 114.541812)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.478443 0 0 1 29.593089 122.566252)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.478443 0 0 1 6.467533 120.863171)"></rect>
        <rect width="25.804081" height="5.349627" transform="translate(223.829835 88.805625)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.475614 0 0 1 243.497525 102.45416)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.36588 0 0 1 262.53532 102.45416)"></rect>
        <rect width="25.804081" height="5.349627" transform="matrix(0.451219 0 0 1 279.528941 102.45416)"></rect>
      </g>
      <g class="lug-slot-labels">
        ${slotText(130.925069, 73.401844, 25.804081, 5.349627, value(row, "LL"), "primary")}
        ${slotTextScaled(69.32005, 91.480439, 0.451222, 1, value(row, "rL-br"))}
        ${slotTextScaled(88.201198, 91.480439, 0.524387, 1, boltPatternLength(row))}
        ${slotTextScaled(110.228973, 91.480438, 0.487806, 1, value(row, "e"))}
        ${slotText(174.267165, 86.130811, 25.804081, 5.349627, value(row, "LhpL"), "primary")}
        ${slotTextScaled(156.72915, 99.779347, 0.478443, 1, `R=${value(row, "rhpL")} TYP.`)}
        ${slotTextScaled(223.829835, 88.805625, 1, 1, `R=${halfValue(row, "W'se")} TYP.`)}
        ${slotTextScaled(243.497525, 102.45416, 0.475614, 1, value(row, "W'se"))}
        ${slotTextScaled(262.53532, 102.45416, 0.36588, 1, halfValue(row, "WhpL"))}
        ${slotTextScaled(279.528941, 102.45416, 0.451219, 1, value(row, "WhpL"))}
        ${slotTextScaled(6.467533, 120.863171, 0.478443, 1, value(row, "WL"), "primary")}
        ${hasOutsideRows ? slotTextScaled(29.593089, 98.492932, 0.478443, 1, value(row, "e")) : ""}
        ${hasOutsideRows ? slotTextScaled(29.593089, 106.517372, 0.478443, 1, value(row, "e")) : ""}
        ${hasOutsideRows ? slotTextScaled(29.593089, 114.541812, 0.478443, 1, value(row, "g")) : ""}
        ${hasOutsideRows ? slotTextScaled(29.593089, 122.566252, 0.478443, 1, webHalf(row)) : ""}
        ${hasOutsideRows ? slotTextScaled(29.593089, 130.590692, 0.478443, 1, value(row, "g")) : ""}
        ${hasOutsideRows ? slotTextScaled(29.593089, 138.615132, 0.478443, 1, value(row, "e")) : ""}
        ${hasSingleHoleRow ? slotTextScaled(29.593089, 106.517372, 0.478443, 1, value(row, "e")) : ""}
        ${hasSingleHoleRow ? slotTextScaled(29.593089, 116.8, 0.478443, 1, webHalf(row)) : ""}
        ${hasSingleHoleRow ? slotTextScaled(29.593089, 130.590692, 0.478443, 1, value(row, "e")) : ""}
        ${slotTextScaled(164.160712, 118.188357, 0.451222, 1, value(row, "W1"))}
        ${slotTextScaled(95.8, 104.8, 1.12, 1, boltPatternText(row), "pattern")}
        ${slotTextScaled(156.729151, 149.999979, 0.451222, 1, `R=1" TYP.`)}
        ${slotText(64, 154.8, 34, 6, `Ø=${value(row, "dh")} TYP.`, "leader")}
        ${slotText(51, 181.8, 32, 6, `R=${value(row, "rL")}`, "leader")}
        ${slotTextScaled(63.498366, 173.169462, 0.451222, 1, value(row, "rL"))}
        ${slotTextScaled(101.732523, 173.169462, 0.451222, 1, value(row, "LLG-rL"))}
        ${slotTextScaled(133.830252, 173.169462, 0.451222, 1, value(row, "a"))}
        ${slotTextScaled(175.804082, 173.169462, 0.451222, 1, value(row, "LFC"))}
        ${slotTextScaled(212.186467, 170.494649, 0.451222, 1, value(row, "LL-LsL"))}
        ${slotTextScaled(225.088507, 149.999979, 0.451222, 1, `R=${halfValue(row, "rhpL")} TYP.`)}
        ${slotText(76, 202, 146, 7, `(${lugEscape(plateBannerQty(row))}) ${plateText}`, "banner")}
      </g>
      <text x="202" y="203" class="lug-mark-text">(${lugEscape(row.Qty || "-")}) @ ${lugEscape(row.Mark)}A,</text>
    `;
    const meta = ["LL", "WL", "tL", "LsL", "LLg", "LhpL", "ni", "no", "s", "g", "dh", "rL"];
    els.meta.innerHTML = meta.map((field) => `<span><b>${lugEscape(field)}</b>${lugEscape(value(row, field))}</span>`).join("");
    const same = (sameGroups.get(sameSignature(row)) || []).filter((item) => item._id !== row._id);
    els.same.innerHTML = `
      <span>Same Data</span>
      <b>${same.length ? same.map((item) => lugEscape(item.Mark)).join(", ") : "None"}</b>
    `;
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
        ${fields.map((field) => `<div class="core-cell">${lugEscape(value(row, field))}</div>`).join("")}
      </div>
    `).join("");
    els.board.innerHTML = header + body;
    els.status.textContent = `Showing ${state.visible.length} of ${source.length} combined LUG marks. Check the left box when reviewed.`;
  }

  function applyFilter() {
    const wanted = lugParseFilter(els.input.value);
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

setupLugRows(window.lugRows || []);
