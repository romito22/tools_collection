(function setupP07(rows) {
  const byId = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const fields = ["Mark", "Piece", "Qty", "Color", "tPIM-p07", "WP", "LPIM", "Lhpp", "Whpp", "Wep", "Wcp", "G1", "G2", "Height", "p07u", "Lyp", "Lttp", "Lstp", "xtp", "W''se", "Wtp"];
  const els = {
    input: byId("p07MarkInput"),
    show: byId("p07ShowBtn"),
    reset: byId("p07ResetBtn"),
    total: byId("p07Total"),
    shown: byId("p07Shown"),
    reviewed: byId("p07Reviewed"),
    open: byId("p07Open"),
    prev: byId("p07PrevBtn"),
    next: byId("p07NextBtn"),
    title: byId("p07ViewerTitle"),
    count: byId("p07ViewerCount"),
    eyebrow: byId("p07ViewerEyebrow"),
    svg: byId("p07ViewerSvg"),
    meta: byId("p07ViewerMeta"),
    board: byId("p07Board"),
    status: byId("p07Status")
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
    const div = fracNum ? gcd(fracNum, 16) : 1;
    const fracText = fracNum ? `${fracNum / div}/${16 / div}"` : "";
    if (options.feet && nearest >= 192) {
      const feet = Math.floor(whole / 12);
      const remaining = whole % 12;
      return `${feet}'-${fracText ? `${remaining} ${fracText}` : `${remaining}"`}`;
    }
    if (fracText && whole) return `${whole} ${fracText}`;
    if (fracText) return fracText;
    return `${whole}"`;
  }

  function display(row, key, options = {}) {
    const value = row[key];
    if (["Color", "Material", "Piece", "Mark", "Qty", "BraceQty", "p07u"].includes(key)) return String(value || "-");
    return formatInches(value, options);
  }

  function current() {
    if (!state.visible.length) return null;
    state.active = Math.max(0, Math.min(state.active, state.visible.length - 1));
    return state.visible[state.active];
  }

  function slot(x, y, w, h, text, extra = "") {
    const label = String(text || "").trim();
    if (!label || label === "-") return "";
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" class="p07-highlight ${extra}"></rect>
      <text x="${x + w / 2}" y="${y + h / 2 + 7}" text-anchor="middle" class="p07-slot-text ${extra}">${esc(label)}</text>
    `;
  }

  function renderViewer() {
    const row = current();
    if (!row) {
      els.title.textContent = "No P07 rows";
      els.count.textContent = "0 of 0";
      els.svg.innerHTML = "";
      els.meta.innerHTML = "";
      return;
    }
    const qty = display(row, "Qty");
    const mark = display(row, "Mark");
    const piece = display(row, "Piece");
    const thickness = display(row, "tPIM-p07");
    const wp = display(row, "WP");
    const lpim = display(row, "LPIM", { feet: true });
    const title = `(${qty}) PIM PL ${thickness} X ${wp} X ${lpim} MARKED ${piece}`;

    els.title.textContent = `Mark ${mark}`;
    els.count.textContent = `${state.active + 1} of ${state.visible.length}`;
    els.eyebrow.textContent = title;
    els.svg.innerHTML = `
      <rect x="0" y="0" width="1200" height="620" fill="#f7f5ee" class="p07-bg"></rect>
      <rect x="42" y="42" width="1116" height="526" class="p07-frame"></rect>

      <line x1="135" y1="250" x2="932" y2="250" class="p07-part"></line>
      <line x1="135" y1="281" x2="932" y2="281" class="p07-part"></line>
      <line x1="135" y1="312" x2="932" y2="312" class="p07-part"></line>
      <line x1="135" y1="343" x2="932" y2="343" class="p07-part"></line>
      <line x1="932" y1="250" x2="932" y2="343" class="p07-part"></line>
      <line x1="135" y1="250" x2="135" y2="343" class="p07-ghost"></line>

      <rect x="406" y="246" width="184" height="8" class="p07-groove"></rect>
      <rect x="406" y="277" width="184" height="8" class="p07-groove"></rect>
      <line x1="590" y1="188" x2="590" y2="366" class="p07-dim"></line>

      <line x1="135" y1="205" x2="135" y2="385" class="p07-dim"></line>
      <line x1="99" y1="250" x2="135" y2="250" class="p07-dim"></line>
      <line x1="99" y1="343" x2="135" y2="343" class="p07-dim"></line>
      <line x1="87" y1="228" x2="87" y2="365" class="p07-dim"></line>

      <line x1="406" y1="414" x2="590" y2="414" class="p07-dim"></line>
      <line x1="406" y1="385" x2="406" y2="434" class="p07-dim"></line>
      <line x1="590" y1="385" x2="590" y2="434" class="p07-dim"></line>
      <line x1="406" y1="492" x2="932" y2="492" class="p07-dim"></line>
      <line x1="406" y1="464" x2="406" y2="512" class="p07-dim"></line>
      <line x1="932" y1="464" x2="932" y2="512" class="p07-dim"></line>

      <rect x="1014" y="229" width="54" height="92" class="p07-mini-part"></rect>

      ${slot(52, 236, 76, 28, display(row, "Wep"))}
      ${slot(52, 284, 76, 28, display(row, "Wcp"))}
      ${slot(52, 332, 76, 28, display(row, "Wep"))}
      ${slot(160, 212, 84, 28, display(row, "Whpp"))}
      ${slot(160, 356, 84, 28, display(row, "Whpp"))}
      ${slot(500, 151, 100, 28, `${display(row, "W''se")} STOP`, "primary")}
      <text x="550" y="190" text-anchor="middle" class="p07-label">GROOVE TYP</text>
      ${slot(455, 399, 124, 28, display(row, "Lhpp", { feet: true }), "primary")}
      ${slot(628, 477, 132, 28, lpim, "primary")}
      ${slot(1005, 322, 84, 30, wp, "primary")}

      <text x="600" y="548" text-anchor="middle" class="p07-title">${esc(title)}</text>
      <text x="600" y="584" text-anchor="middle" class="p07-note">(${esc(qty)}) @ ${esc(mark)}A | USE ${esc(display(row, "Color"))} COLOR T-RODS</text>
    `;

    els.meta.innerHTML = fields.map((field) => {
      const value = ["LPIM", "Lhpp", "Lyp", "Lttp", "Lstp"].includes(field) ? display(row, field, { feet: true }) : display(row, field);
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
      <div class="core-head"><div class="core-cell core-check">OK</div>${fields.map((field) => `<div class="core-cell">${esc(field)}</div>`).join("")}</div>
      ${state.visible.map((item) => `
        <div class="core-row ${state.reviewed.has(item.Row) ? "reviewed" : ""} ${row && row.Row === item.Row ? "active" : ""}" data-p07="${esc(item.Row)}">
          <label class="core-cell core-check"><input type="checkbox" ${state.reviewed.has(item.Row) ? "checked" : ""}></label>
          ${fields.map((field) => {
            const value = ["LPIM", "Lhpp", "Lyp", "Lttp", "Lstp"].includes(field) ? display(item, field, { feet: true }) : display(item, field);
            return `<div class="core-cell">${esc(value)}</div>`;
          }).join("")}
        </div>
      `).join("")}
    `;
    els.status.textContent = `Showing ${state.visible.length} P07 rows from ${rows.length} source rows.`;
  }

  function filter() {
    const wanted = String(els.input.value || "").split(/[\s,;]+/).map((part) => part.trim()).filter(Boolean);
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
    const tile = event.target.closest("[data-p07]");
    if (!tile || event.target.matches("input")) return;
    const index = state.visible.findIndex((row) => String(row.Row) === tile.dataset.p07);
    if (index >= 0) state.active = index;
    render();
  });
  els.board.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox']");
    const tile = event.target.closest("[data-p07]");
    if (!checkbox || !tile) return;
    const key = Number(tile.dataset.p07);
    if (checkbox.checked) state.reviewed.add(key);
    else state.reviewed.delete(key);
    render();
  });

  render();
})(window.p07Rows || []);
