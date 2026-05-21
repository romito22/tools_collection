function p15ById(id) {
  return document.getElementById(id);
}

function p15Escape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function p15Gcd(a, b) {
  return b ? p15Gcd(b, a % b) : Math.abs(a);
}

function p15Reduce(value) {
  return String(value ?? "").trim().replace(/(\d+)\s*\/\s*(\d+)/g, (match, n, d) => {
    const den = Number(d);
    const num = Number(n);
    if (!den) return match;
    const g = p15Gcd(num, den);
    return `${num / g}/${den / g}`;
  }).replace(/\s+/g, " ");
}

function p15DecimalInches(value) {
  const num = Number(String(value ?? "").trim());
  if (!Number.isFinite(num)) return null;
  return num;
}

function p15ParseMixedInches(value) {
  const text = p15Reduce(value).replace(/"/g, "").trim();
  const fraction = text.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const mixed = text.match(/^(\d+)(?:\s+(\d+)\/(\d+))?$/);
  if (!mixed) return null;
  return Number(mixed[1]) + (Number(mixed[2] || 0) / Number(mixed[3] || 1));
}

function p15FormatDecimal(value) {
  const num = p15DecimalInches(value);
  if (num === null) return p15Reduce(value || "-");
  const sixteenths = Math.round(num * 16);
  const feet = Math.floor(sixteenths / 192);
  const rem = sixteenths - feet * 192;
  const inch = Math.floor(rem / 16);
  const frac = rem % 16;
  const g = frac ? p15Gcd(frac, 16) : 1;
  const fracText = frac ? `${frac / g}/${16 / g}` : "";
  const inchText = [inch || (!feet && !frac ? 0 : ""), fracText].filter(Boolean).join(" ");
  return feet ? `${feet}'-${inchText || 0}"` : `${inchText}"`;
}

function p15FormatInches(value) {
  const parsed = p15ParseMixedInches(value);
  if (parsed === null) return p15MeasureText(value);
  return p15FormatDecimal(String(parsed));
}

function p15MeasureText(value) {
  return `${p15Reduce(value || "-")}${String(value || "").includes('"') || !value || value === "-" ? "" : '"'}`;
}

function p15SlotInches(row, key) {
  if (["DwL", "DwL-i", "Dwcc"].includes(key)) {
    const count = Number(String(row[key] ?? "").trim());
    return Number.isFinite(count) ? count / 16 : null;
  }
  if (["Hc", "Wc", "tc"].includes(key)) return p15DecimalInches(row[key]);
  return p15ParseMixedInches(row[key]);
}

function p15Calc(row, keys, calc) {
  const values = keys.map((key) => p15SlotInches(row, key));
  if (values.some((value) => value === null)) return "-";
  return p15FormatDecimal(String(calc(...values)));
}

function p15InnerBay(row) {
  return p15Calc(row, ["W1cc", "t2cc", "H2cc - DwL", "DwL", "DwL-i", "tcc"], (w1, t2, h2MinusDwl, dwl, dwli, tcc) => {
    const used = (2 * t2) + (2 * (h2MinusDwl - p15CornerRadius(row))) + (2 * dwl) + (2 * dwli) + (2 * tcc);
    return (w1 - used) / 2;
  });
}

function p15CenterGap(row) {
  return p15Calc(row, ["tcc"], (tcc) => 2 * tcc);
}

function p15ArcRadius(row) {
  return p15Calc(row, ["W1cc"], (w1) => w1 / 2);
}

function p15CornerRadius(row) {
  const radius = p15SlotInches(row, "rcc");
  return radius === null ? 1 / 8 : radius;
}

function p15BottomShoulder(row) {
  return p15Calc(row, ["H2cc - DwL"], (shoulder) => shoulder - p15CornerRadius(row));
}

function p15BottomShoulderInches(row) {
  const shoulder = p15SlotInches(row, "H2cc - DwL");
  return shoulder === null ? null : shoulder - p15CornerRadius(row);
}

function p15InnerBayInches(row) {
  const w1 = p15SlotInches(row, "W1cc");
  const t2 = p15SlotInches(row, "t2cc");
  const dwl = p15SlotInches(row, "DwL");
  const dwli = p15SlotInches(row, "DwL-i");
  const tcc = p15SlotInches(row, "tcc");
  const shoulder = p15BottomShoulderInches(row);
  if ([w1, t2, dwl, dwli, tcc, shoulder].some((value) => value === null)) return null;
  return (w1 - ((2 * t2) + (2 * shoulder) + (2 * dwl) + (2 * dwli) + (2 * tcc))) / 2;
}

function p15BottomChainTotal(row) {
  const t2 = p15SlotInches(row, "t2cc");
  const shoulder = p15BottomShoulderInches(row);
  const dwl = p15SlotInches(row, "DwL");
  const dwli = p15SlotInches(row, "DwL-i");
  const inner = p15InnerBayInches(row);
  const tcc = p15SlotInches(row, "tcc");
  if ([t2, shoulder, dwl, dwli, inner, tcc].some((value) => value === null)) return "-";
  return p15FormatDecimal(String((2 * t2) + (2 * shoulder) + (2 * dwl) + (2 * inner) + (2 * dwli) + (2 * tcc)));
}

function p15FormatSixteenthCount(value) {
  const count = Number(String(value ?? "").trim());
  if (!Number.isFinite(count) || count === 0) return "-";
  const g = p15Gcd(Math.abs(count), 16);
  return `${count / g}/${16 / g}"`;
}

function p15Measure(row, key) {
  if (["Mark", "Qty", "Qty-9", "Row", "Type"].includes(key)) return p15Reduce(row[key] || "-");
  if (key === "Lc") return p15Reduce(row[key] || "-").replace(/''/g, '"');
  if (["Hc", "Wc", "tc"].includes(key)) return p15FormatDecimal(row[key]);
  if (["DwL", "DwL-i", "Dwcc"].includes(key)) return p15FormatSixteenthCount(row[key]);
  if (["W1cc", "H1cc", "t1cc", "t2cc", "rcc", "tcc", "H2cc - DwL", "H1cc - H2cc - t1cc"].includes(key)) return p15FormatInches(row[key]);
  return p15MeasureText(row[key]);
}

function p15ParseFilter(value) {
  return String(value || "").split(/[\s,;]+/).map((part) => part.trim()).filter(Boolean);
}

function p15Signature(row, fields) {
  return fields.filter((field) => !["Qty", "Qty-9", "Mark", "Lc"].includes(field)).map((field) => `${field}:${p15Reduce(row[field] || "")}`).join("|");
}

function p15Combine(rows, fields) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = p15Signature(row, fields);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return [...groups.values()].map((items, index) => ({
    ...items[0],
    Row: items.map((item) => item.Row).join(", "),
    Mark: [...new Set(items.map((item) => item.Mark).filter(Boolean))].join(", "),
    _rowIds: items.map((item) => item.Row),
    _marks: [...new Set(items.map((item) => String(item.Mark || "").trim()).filter(Boolean))],
    _id: `p15-${index}`,
    _matches: items.length
  })).sort((a, b) => Number(String(a.Mark).split(",")[0]) - Number(String(b.Mark).split(",")[0]));
}

function setupP15(rows) {
  const els = {
    input: p15ById("p15RowInput"),
    show: p15ById("p15ShowBtn"),
    reset: p15ById("p15ResetBtn"),
    total: p15ById("p15Total"),
    shown: p15ById("p15Shown"),
    reviewed: p15ById("p15Reviewed"),
    open: p15ById("p15Open"),
    prev: p15ById("p15PrevBtn"),
    next: p15ById("p15NextBtn"),
    title: p15ById("p15ViewerTitle"),
    count: p15ById("p15ViewerCount"),
    eyebrow: p15ById("p15ViewerEyebrow"),
    svg: p15ById("p15ViewerSvg"),
    meta: p15ById("p15ViewerMeta"),
    same: p15ById("p15SameBox"),
    board: p15ById("p15Board"),
    status: p15ById("p15Status")
  };
  if (!els.board) return;

  const fields = ["Mark", "Qty", "Lc", "Type", "Hc", "Wc", "tc", "Qty-9", "W1cc", "H1cc", "t1cc", "t2cc", "rcc", "tcc", "DwL", "DwL-i", "Dwcc", "H2cc - DwL", "H1cc - H2cc - t1cc"];
  const source = p15Combine(rows, fields);
  const state = { visible: source, active: 0, reviewed: new Set() };

  function current() {
    if (!state.visible.length) return null;
    state.active = Math.max(0, Math.min(state.active, state.visible.length - 1));
    return state.visible[state.active];
  }

  function slot(x, y, w, h, text, extra = "") {
    const label = String(text || "").trim();
    if (!label || label === "-" || label === "0\"" || label === "R=-" || label === "R=-\"") return "";
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="p15-highlight ${extra}"></rect>
      <text x="${x + w / 2}" y="${y + h / 2 + 10}" text-anchor="middle" class="p15-slot-text ${extra}">${p15Escape(label)}</text>
    `;
  }

  function radiusText(row) {
    return row.rcc && row.rcc !== "-" ? `R=${p15Measure(row, "rcc")}` : `R=1/8" TYP.`;
  }

  function plateTitle(row) {
    return `(${p15Escape(row["Qty-9"] || "-")}) PL ${p15Measure(row, "tcc")} X ${p15Measure(row, "H1cc")} X ${p15Measure(row, "W1cc")}`;
  }

  function renderViewer() {
    const row = current();
    if (!row) return;
    const bottomChain = [
      [294, 652, 95, 36, p15Measure(row, "t2cc"), "chain primary"],
      [467, 652, 113, 40, p15BottomShoulder(row), "chain"],
      [634, 649, 54, 24, p15Measure(row, "DwL"), "chain"],
      [703, 579, 77, 24, p15InnerBay(row), "chain"],
      [781, 644, 53, 26, p15Measure(row, "DwL-i"), "chain"],
      [879, 644, 67, 26, p15CenterGap(row), "chain"],
      [980, 634, 53, 26, p15Measure(row, "DwL-i"), "chain"],
      [1014, 559, 79, 40, p15InnerBay(row), "chain"],
      [1093, 631, 53, 26, p15Measure(row, "DwL"), "chain"],
      [1278, 652, 85, 42, p15BottomShoulder(row), "chain"],
      [1502, 657, 85, 42, p15Measure(row, "t2cc"), "chain primary"]
    ];
    els.title.textContent = `Mark ${row.Mark}`;
    els.count.textContent = `${state.active + 1} of ${state.visible.length}`;
    els.eyebrow.textContent = `Cap Plate | ${row._matches} matching source row${row._matches === 1 ? "" : "s"}`;
    els.svg.innerHTML = `
      <rect x="0" y="0" width="1920" height="1080" class="p15-bg"></rect>
      <image href="assets/p15-template.svg" x="0" y="0" width="1920" height="1080"></image>
      ${slot(123, 363, 85, 42, p15Measure(row, "H1cc"), "primary")}
      ${slot(846, 272, 214, 42, `R=${p15ArcRadius(row)}`, "arc-radius")}
      ${slot(1662, 176, 85, 42, radiusText(row), "radius")}
      ${slot(1662, 293, 85, 42, p15Measure(row, "H1cc - H2cc - t1cc"), "vertical")}
      ${slot(1662, 416, 85, 42, p15Measure(row, "H2cc - DwL"), "vertical")}
      ${slot(1662, 498, 85, 42, p15Measure(row, "DwL"), "vertical")}
      ${slot(1662, 569, 85, 42, p15Measure(row, "t1cc"), "vertical")}
      ${bottomChain.map((entry) => slot(...entry)).join("")}
      ${slot(896, 787, 54, 20, p15Measure(row, "W1cc"), "overall")}
      <text x="960" y="920" text-anchor="middle" class="p15-title-text" font-size="42" font-weight="800">${plateTitle(row)}</text>
      <text x="960" y="974" text-anchor="middle" class="p15-title-note" font-size="34" font-weight="700">AS DRAWN MARKED P_15</text>
    `;
    const meta = ["Hc", "Wc", "tc", "W1cc", "H1cc", "t1cc", "t2cc", "tcc", "DwL", "DwL-i"];
    els.meta.innerHTML = meta.map((field) => `<span><b>${p15Escape(field)}</b>${p15Escape(p15Measure(row, field))}</span>`).join("")
      + `<span class="p15-sum"><b>Bottom Sum</b>${p15Escape(p15BottomChainTotal(row))}</span>`;
    els.same.innerHTML = `<span>Same Data Marks</span><b>${p15Escape(row.Mark)}</b>`;
  }

  function render() {
    const row = current();
    els.total.textContent = source.length;
    els.shown.textContent = state.visible.length;
    els.reviewed.textContent = state.reviewed.size;
    els.open.textContent = Math.max(0, source.length - state.reviewed.size);
    renderViewer();
    els.board.innerHTML = `
      <div class="core-head"><div class="core-cell core-check">OK</div><div class="core-cell">Marks</div><div class="core-cell">Rows</div>${fields.filter((field) => field !== "Mark").map((field) => `<div class="core-cell">${p15Escape(field === "Qty-9" ? "Plate Qty" : field)}</div>`).join("")}</div>
      ${state.visible.map((item) => `
        <div class="core-row ${state.reviewed.has(item._id) ? "reviewed" : ""} ${row && row._id === item._id ? "active" : ""}" data-p15="${p15Escape(item._id)}">
          <label class="core-cell core-check"><input type="checkbox" ${state.reviewed.has(item._id) ? "checked" : ""}></label>
          <div class="core-cell"><b>${p15Escape(item.Mark)}</b></div>
          <div class="core-cell"><b>${p15Escape(item.Row)}</b></div>
          ${fields.filter((field) => field !== "Mark").map((field) => `<div class="core-cell">${p15Escape(p15Measure(item, field))}</div>`).join("")}
        </div>
      `).join("")}
    `;
    els.status.textContent = `Showing ${state.visible.length} grouped P15 rows from ${rows.length} source rows.`;
  }

  function filter() {
    const wanted = p15ParseFilter(els.input.value);
    state.visible = wanted.length ? source.filter((row) => row._marks.some((mark) => wanted.includes(mark))) : source;
    state.active = 0;
    render();
  }

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
  els.show.addEventListener("click", filter);
  els.reset.addEventListener("click", () => {
    els.input.value = "";
    filter();
  });
  els.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") filter();
  });
  els.board.addEventListener("click", (event) => {
    const tile = event.target.closest("[data-p15]");
    if (!tile || event.target.matches("input")) return;
    const index = state.visible.findIndex((row) => row._id === tile.dataset.p15);
    if (index >= 0) state.active = index;
    render();
  });
  els.board.addEventListener("change", (event) => {
    const box = event.target.closest("input[type='checkbox']");
    const tile = event.target.closest("[data-p15]");
    if (!box || !tile) return;
    if (box.checked) state.reviewed.add(tile.dataset.p15);
    else state.reviewed.delete(tile.dataset.p15);
    render();
  });
  render();
}

setupP15(window.p15Rows || []);
