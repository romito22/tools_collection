(function setupP06(rows) {
  const byId = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const rawFields = ["Mark", "Piece", "Qty", "Color", "tPIM-p06", "WP", "LPIM", "Lhpp", "Whpp", "Wep", "Wcp", "G1", "G2", "Height", "p06u", "Lyp", "Lttp", "Lstp", "xtp", "W''se", "Wtp"];
  const els = {
    input: byId("p06MarkInput"),
    show: byId("p06ShowBtn"),
    reset: byId("p06ResetBtn"),
    total: byId("p06Total"),
    shown: byId("p06Shown"),
    reviewed: byId("p06Reviewed"),
    open: byId("p06Open"),
    prev: byId("p06PrevBtn"),
    next: byId("p06NextBtn"),
    title: byId("p06ViewerTitle"),
    count: byId("p06ViewerCount"),
    eyebrow: byId("p06ViewerEyebrow"),
    svg: byId("p06ViewerSvg"),
    meta: byId("p06ViewerMeta"),
    board: byId("p06Board"),
    status: byId("p06Status")
  };
  if (!els.board) return;

  const source = [...rows].sort((a, b) => Number(a.Mark) - Number(b.Mark) || Number(a.Row) - Number(b.Row));
  const state = { visible: source, active: 0, reviewed: new Set() };

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) [x, y] = [y, x % y];
    return x || 1;
  }

  function reduceFraction(num, den) {
    const div = gcd(num, den);
    return [num / div, den / div];
  }

  function parseInches(input) {
    const text = String(input ?? "").trim();
    if (!text || text === "-") return null;
    if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
    const mixed = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
    const frac = text.match(/^(\d+)\/(\d+)$/);
    if (frac) return Number(frac[1]) / Number(frac[2]);
    return null;
  }

  function formatInches(input, options = {}) {
    const inches = parseInches(input);
    if (inches === null) return String(input || "-");
    const nearest = Math.round(inches * 16);
    const whole = Math.floor(nearest / 16);
    const fracNum = nearest % 16;
    const [reducedNum, reducedDen] = fracNum ? reduceFraction(fracNum, 16) : [0, 1];
    const fracText = fracNum ? `${reducedNum}/${reducedDen}"` : "";
    if (options.feet && nearest >= 192) {
      const feet = Math.floor(whole / 12);
      const remaining = whole % 12;
      const inchText = fracText ? `${remaining} ${fracText}` : `${remaining}"`;
      return `${feet}'-${inchText}`;
    }
    if (fracText && whole) return `${whole} ${fracText}`;
    if (fracText) return fracText;
    return `${whole}"`;
  }

  function display(row, key, options = {}) {
    const value = row[key];
    if (["Color", "Material", "Piece", "Mark", "Qty", "BraceQty", "p06u"].includes(key)) return String(value || "-");
    return formatInches(value, options);
  }

  function current() {
    if (!state.visible.length) return null;
    state.active = Math.max(0, Math.min(state.active, state.visible.length - 1));
    return state.visible[state.active];
  }

  function parseFilter(value) {
    return String(value || "").split(/[\s,;]+/).map((part) => part.trim()).filter(Boolean);
  }

  function slot(x, y, w, h, text, extra = "") {
    const label = String(text || "").trim();
    if (!label || label === "-") return "";
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" class="p06-highlight ${extra}"></rect>
      <text x="${x + w / 2}" y="${y + h / 2 + 7}" text-anchor="middle" class="p06-slot-text ${extra}">${esc(label)}</text>
    `;
  }

  function labelText(x, y, text, cls = "p06-label") {
    return `<text x="${x}" y="${y}" text-anchor="middle" class="${cls}">${esc(text)}</text>`;
  }

  function renderViewer() {
    const row = current();
    if (!row) {
      els.title.textContent = "No P06 rows";
      els.count.textContent = "0 of 0";
      els.svg.innerHTML = "";
      els.meta.innerHTML = "";
      return;
    }

    const qty = display(row, "Qty");
    const mark = display(row, "Mark");
    const piece = display(row, "Piece");
    const thickness = display(row, "tPIM-p06");
    const wp = display(row, "WP");
    const lpim = display(row, "LPIM", { feet: true });
    const title = `(${qty}) PIM PL ${thickness} X ${wp} X ${lpim} MARKED ${piece}`;
    const stop = display(row, "W''se");
    const grooveHeight = display(row, "Height");

    els.title.textContent = `Mark ${mark}`;
    els.count.textContent = `${state.active + 1} of ${state.visible.length}`;
    els.eyebrow.textContent = title;
    els.svg.innerHTML = `
      <rect x="0" y="0" width="1200" height="620" fill="#f7f5ee" class="p06-bg"></rect>
      <rect x="42" y="42" width="1116" height="526" class="p06-frame"></rect>

      <g class="p06-main-part">
        <line x1="142" y1="260" x2="928" y2="260" class="p06-part"></line>
        <line x1="142" y1="291" x2="928" y2="291" class="p06-part"></line>
        <line x1="142" y1="322" x2="928" y2="322" class="p06-part"></line>
        <line x1="142" y1="353" x2="928" y2="353" class="p06-part"></line>
        <line x1="928" y1="260" x2="928" y2="353" class="p06-part"></line>
        <line x1="142" y1="260" x2="142" y2="353" class="p06-ghost"></line>
        <rect x="412" y="257" width="184" height="8" class="p06-groove"></rect>
        <rect x="412" y="288" width="184" height="8" class="p06-groove"></rect>
        <rect x="412" y="319" width="184" height="8" class="p06-groove"></rect>
      </g>

      <line x1="596" y1="174" x2="596" y2="382" class="p06-dim"></line>
      <line x1="588" y1="180" x2="604" y2="180" class="p06-dim"></line>
      <line x1="588" y1="376" x2="604" y2="376" class="p06-dim"></line>

      <line x1="142" y1="208" x2="142" y2="400" class="p06-dim"></line>
      <line x1="106" y1="260" x2="142" y2="260" class="p06-dim"></line>
      <line x1="106" y1="353" x2="142" y2="353" class="p06-dim"></line>
      <line x1="94" y1="238" x2="94" y2="375" class="p06-dim"></line>

      <line x1="412" y1="417" x2="596" y2="417" class="p06-dim"></line>
      <line x1="412" y1="390" x2="412" y2="436" class="p06-dim"></line>
      <line x1="596" y1="390" x2="596" y2="436" class="p06-dim"></line>
      <line x1="412" y1="492" x2="928" y2="492" class="p06-dim"></line>
      <line x1="412" y1="464" x2="412" y2="512" class="p06-dim"></line>
      <line x1="928" y1="464" x2="928" y2="512" class="p06-dim"></line>

      <line x1="1018" y1="260" x2="1018" y2="353" class="p06-dim"></line>
      <line x1="994" y1="260" x2="1042" y2="260" class="p06-dim"></line>
      <line x1="994" y1="353" x2="1042" y2="353" class="p06-dim"></line>

      ${slot(56, 245, 74, 28, display(row, "Wep"))}
      ${slot(56, 292, 74, 28, display(row, "Wcp"))}
      ${slot(56, 339, 74, 28, display(row, "Wep"))}
      ${slot(164, 220, 84, 28, display(row, "Whpp"))}
      ${slot(164, 366, 84, 28, display(row, "Whpp"))}
      ${slot(504, 137, 94, 28, `${stop} STOP`, "primary")}
      ${labelText(550, 176, "GROOVE TYP")}
      ${slot(456, 404, 122, 28, display(row, "Lhpp", { feet: true }), "primary")}
      ${slot(632, 478, 130, 28, lpim, "primary")}
      ${slot(987, 286, 82, 30, wp, "primary")}
      ${slot(987, 382, 82, 30, display(row, "p06u"))}
      ${slot(908, 214, 70, 28, display(row, "G1"))}
      ${slot(908, 258, 102, 28, `3x${display(row, "Wep")}`)}
      ${slot(908, 322, 70, 28, display(row, "G2"))}
      ${slot(780, 382, 172, 28, `Groove ${display(row, "G1")} x ${grooveHeight}`)}
      ${slot(810, 418, 148, 28, `T-Rod ${grooveHeight}`)}

      <text x="600" y="548" text-anchor="middle" class="p06-title">${esc(title)}</text>
      <text x="600" y="584" text-anchor="middle" class="p06-note">(${esc(qty)}) @ ${esc(mark)}A | USE ${esc(display(row, "Color"))} COLOR T-RODS</text>
    `;

    els.meta.innerHTML = rawFields.map((field) => {
      const value = field === "LPIM" || field === "Lhpp" || field === "Lyp" || field === "Lttp" || field === "Lstp" ? display(row, field, { feet: true }) : display(row, field);
      return `<span><b>${esc(field)}</b>${esc(value)}</span>`;
    }).join("");
  }

  function render() {
    const row = current();
    els.total.textContent = source.length;
    els.shown.textContent = state.visible.length;
    els.reviewed.textContent = state.reviewed.size;
    els.open.textContent = Math.max(0, source.length - state.reviewed.size);
    renderViewer();
    els.board.innerHTML = `
      <div class="core-head"><div class="core-cell core-check">OK</div>${rawFields.map((field) => `<div class="core-cell">${esc(field)}</div>`).join("")}</div>
      ${state.visible.map((item) => `
        <div class="core-row ${state.reviewed.has(item.Row) ? "reviewed" : ""} ${row && row.Row === item.Row ? "active" : ""}" data-p06="${esc(item.Row)}">
          <label class="core-cell core-check"><input type="checkbox" ${state.reviewed.has(item.Row) ? "checked" : ""}></label>
          ${rawFields.map((field) => {
            const value = field === "LPIM" || field === "Lhpp" || field === "Lyp" || field === "Lttp" || field === "Lstp" ? display(item, field, { feet: true }) : display(item, field);
            return `<div class="core-cell">${esc(value)}</div>`;
          }).join("")}
        </div>
      `).join("")}
    `;
    els.status.textContent = `Showing ${state.visible.length} P06 rows from ${rows.length} source rows.`;
  }

  function filter() {
    const wanted = parseFilter(els.input.value);
    state.visible = wanted.length ? source.filter((row) => wanted.includes(String(row.Mark))) : source;
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
  els.board.addEventListener("click", (event) => {
    const tile = event.target.closest("[data-p06]");
    if (!tile || event.target.matches("input")) return;
    const index = state.visible.findIndex((row) => String(row.Row) === tile.dataset.p06);
    if (index >= 0) state.active = index;
    render();
  });
  els.board.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox']");
    const tile = event.target.closest("[data-p06]");
    if (!checkbox || !tile) return;
    const key = Number(tile.dataset.p06);
    if (checkbox.checked) state.reviewed.add(key);
    else state.reviewed.delete(key);
    render();
  });

  render();
})(window.p06Rows || []);
