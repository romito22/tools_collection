function freshControl(selector) {
  const node = document.querySelector(selector);
  if (!node) return null;
  const clone = node.cloneNode(true);
  node.replaceWith(clone);
  return clone;
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function key(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function findIndex(headers, names) {
  const normalized = headers.map(key);
  return normalized.findIndex((header) => names.some((name) => header.includes(name)));
}

function findHeaderRow(rows) {
  const match = rows.findIndex((row) => {
    const joined = row.map(key).join(" ");
    return joined.includes("cb id") && (joined.includes("mark") || joined.includes("qty"));
  });
  if (match >= 0) return match;
  return rows.findIndex((row) => row.some((cell) => String(cell ?? "").trim()));
}

function buildReviewGroups(headers, parentHeaders = [], mode = "review") {
  const ignored = new Set(["", "#", "qty"]);
  const wanted = new Set([
    "cb id", "eor id", "line", "grids", "lvls", "mark",
    "wwp", "hwp", "lbh", "lwp h", "lwph", "lwp-h",
    "lc", "type", "hc", "wc", "tc", "w1cc", "h1cc", "t1cc", "t2cc", "dwl", "dwc",
    "ni", "no", "e", "s", "gi", "go", "dhg", "tg", "trg", "wrg",
    "fy g", "fy.g", "wl", "tl", "ts", "llg", "db", "g", "l'", "la",
    "beam", "col", "gusset edges", "wt", "cb wt"
  ]);
  return headers.map((header, index) => {
    let name = String(header || "").trim();
    if (/^column \d+$/i.test(name)) name = String(parentHeaders[index] || "").trim();
    return { name, index, span: [index], k: key(name) };
  }).filter((group) => {
    if (!group.name || ignored.has(group.k)) return false;
    if (mode === "assembly") return !/^column \d+$/i.test(group.name);
    return [...wanted].some((name) => group.k === name || group.k.includes(name));
  });
}

function groupValue(item, group) {
  return group.span
    .map((index) => item.row[index])
    .filter((value) => String(value ?? "").trim() !== "")
    .join(" ");
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function formatFraction(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value ?? "";
  const whole = Math.floor(number);
  const den = 16;
  let numerator = Math.round((number - whole) * den);
  if (!numerator) return `${whole}"`;
  if (numerator === den) return `${whole + 1}"`;
  const divisor = gcd(numerator, den);
  return `${whole} ${numerator / divisor}/${den / divisor}"`;
}\n
function setupDeck(config) {
  const els = {
    file: freshControl(`#${config.prefix}ExcelInput`),
    sample: freshControl(`#${config.prefix}SampleBtn`),
    card: document.querySelector(`#${config.prefix}Card`),
    total: document.querySelector(`#${config.prefix}Total`),
    done: document.querySelector(`#${config.prefix}Done`),
    good: document.querySelector(`#${config.prefix}Good`),
    bad: document.querySelector(`#${config.prefix}Bad`),
    note: freshControl(`#${config.prefix}Note`),
    status: document.querySelector(`#${config.prefix}Status`),
    markGood: freshControl(`#${config.prefix}MarkGoodBtn`),
    markBad: freshControl(`#${config.prefix}MarkBadBtn`),
    clear: freshControl(`#${config.prefix}ClearMarkBtn`),
    export: freshControl(`#${config.prefix}ExportReviewBtn`),
    whiteWash: freshControl(`#${config.prefix}WhiteWashBtn`),
    list: document.querySelector(`#${config.prefix}List`),
    board: document.querySelector(`#${config.prefix}Board`)
  };

  if (!els.card || !els.board || !els.list) return;

  let state = {
    fileName: `${config.prefix}.xlsx`,
    rows: [],
    headerIndex: -1,
    headers: [],
    groups: [],
    data: [],
    current: 0,
    currentCell: 0,
    marks: new Map()
  };

  function columnIndex(names) {
    return findIndex(state.headers, names);
  }

  function currentItem() {
    return state.data[state.current];
  }

  function itemLabel(item) {
    if (!item) return "No item";
    const values = [
      item.row[columnIndex(["cb id"])],
      item.row[columnIndex(["eor id"])],
      item.row[columnIndex(["mark"])],
      item.row[columnIndex(["line"])],
      item.row[columnIndex(["grids"])]
    ].filter(Boolean);
    const base = values.join(" / ") || `Excel row ${item.rowIndex + 1}`;
    return `${base} / ${config.itemName} ${item.itemNo} of ${item.qty}`;
  }

  function shortValue(item, names) {
    const value = item.row[columnIndex(names)];
    return value ?? "";
  }

  function reviewCells(item) {
    if (!item) return [];
    return state.groups
      .map((group) => ({ ...group, value: groupValue(item, group), cellKey: `${item.cardKey}:${group.index}` }))
      .filter((cell) => {
        const value = String(cell.value ?? "").trim();
        const core = ["cb id", "eor id", "line", "grids", "lvls", "mark"].includes(cell.k);
        return core || (value && value !== "-");
      });
  }

  function updateStats() {
    const marks = [...state.marks.values()];
    els.total.textContent = state.data.length;
    els.done.textContent = marks.length;
    els.good.textContent = marks.filter((mark) => mark.status === "good").length;
    els.bad.textContent = marks.filter((mark) => mark.status === "bad").length;
  }

  function itemStatus(item) {
    const cells = reviewCells(item);
    const marks = cells.map((cell) => state.marks.get(cell.cellKey)).filter(Boolean);
    if (marks.some((mark) => mark.status === "bad")) return "bad";
    if (cells.length && marks.length === cells.length && marks.every((mark) => mark.status === "good")) return "good";
    if (marks.length) return "partial";
    return "";
  }

  function renderList() {
    if (!state.data.length) {
      els.list.innerHTML = `<p class="note">No ${config.itemName.toLowerCase()}s loaded.</p>`;
      return;
    }
    els.list.innerHTML = state.data.map((item, index) => {
      const status = itemStatus(item);
      const classes = ["brace-list-item", status, index === state.current ? "selected" : ""].filter(Boolean).join(" ");
      return `
        <button class="${classes}" type="button" data-index="${index}">
          <strong>${safeText(shortValue(item, ["mark"]) || `Row ${item.rowIndex + 1}`)}</strong>
          <span>${safeText(config.itemName)} ${item.itemNo}/${item.qty}</span>
          <small>${safeText(shortValue(item, ["cb id"]))} ${safeText(shortValue(item, ["grids"]))}</small>
        </button>
      `;
    }).join("");
    els.list.querySelectorAll(".brace-list-item").forEach((tile) => {
      tile.addEventListener("click", () => {
        saveNote();
        state.current = Number(tile.dataset.index);
        state.currentCell = 0;
        render();
      });
    });
  }

  function renderBoard() {
    const item = currentItem();
    const cells = reviewCells(item);
    if (!cells.length) {
      els.board.innerHTML = `<p class="note">No reviewable values loaded for this ${config.itemName.toLowerCase()}.</p>`;
      return;
    }
    els.board.innerHTML = cells.map((cell, index) => {
      const mark = state.marks.get(cell.cellKey);
      const classes = ["value-tile", mark?.status || "", index === state.currentCell ? "selected" : ""].filter(Boolean).join(" ");
      const status = mark?.status === "good" ? "GOOD" : mark?.status === "bad" ? "ERROR" : "OPEN";
      return `
        <button class="${classes}" type="button" data-index="${index}">
          <span>${safeText(cell.name)}</span>
          <b>${safeText(cell.value)}</b>
          <small>${status}</small>
        </button>
      `;
    }).join("");
    els.board.querySelectorAll(".value-tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        saveNote();
        state.currentCell = Number(tile.dataset.index);
        render();
      });
    });
  }

  function render() {
    updateStats();
    const item = currentItem();
    if (!item) {
      els.card.className = "review-card idle";
      els.card.innerHTML = `<p class="note">Upload an Excel file to create ${config.itemName.toLowerCase()} review cards.</p>`;
      els.status.textContent = "Waiting for Excel data.";
      renderList();
      renderBoard();
      return;
    }

    const cells = reviewCells(item);
    if (state.currentCell >= cells.length) state.currentCell = 0;
    const cell = cells[state.currentCell];
    const mark = cell ? state.marks.get(cell.cellKey) : null;
    els.note.value = mark?.note || "";
    els.card.className = `review-card ${mark?.status || ""}`.trim();
    const statusText = mark?.status === "good" ? "Looks Good" : mark?.status === "bad" ? "Has Error" : "Unmarked";
    const focus = cell ? `
      <div class="review-field focus">
        <span>${safeText(cell.name)}</span>
        <b>${safeText(cell.k === "lbh" ? formatFraction(cell.value) : cell.value)}</b>
      </div>
      <div class="review-field meta">
        <span>${safeText(config.itemName)}</span>
        <b>${item.itemNo} / ${item.qty}</b>
      </div>
    ` : `<p class="note">No reviewable values found for this ${config.itemName.toLowerCase()}.</p>`;

    els.card.innerHTML = `
      <div class="review-title">
        <strong>${safeText(itemLabel(item))}</strong>
        <span class="review-pill ${mark?.status || ""}">${statusText}</span>
      </div>
      <div class="review-fields">${focus}</div>
    `;
    els.status.textContent = `${config.itemName} ${state.current + 1} of ${state.data.length}. Select a value tile, then mark that specific value.`;
    renderList();
    renderBoard();
  }

  function loadRows(rows, fileName = `${config.prefix}.xlsx`) {
    const headerIndex = findHeaderRow(rows);
    const headers = headerIndex >= 0 ? rows[headerIndex].map((cell, index) => String(cell || `Column ${index + 1}`)) : [];
    const groups = buildReviewGroups(headers, rows[headerIndex - 1] || [], config.mode);
    const qtyIndex = findIndex(headers, ["qty"]);
    const cbIndex = findIndex(headers, ["cb id"]);
    const markIndex = findIndex(headers, ["mark"]);
    const data = [];

    if (headerIndex >= 0) {
      rows.slice(headerIndex + 1).forEach((row, offset) => {
        if (!row.some((cell) => String(cell ?? "").trim())) return;
        const cb = String(row[cbIndex] ?? "").trim();
        const mark = String(row[markIndex] ?? "").trim();
        const qtyNumber = Number(row[qtyIndex]);
        if (!cb || !mark || !Number.isFinite(qtyNumber) || qtyNumber <= 0) return;
        const qty = Math.max(1, Math.round(qtyNumber));
        const rowIndex = headerIndex + 1 + offset;
        for (let itemNo = 1; itemNo <= qty; itemNo += 1) {
          data.push({ row, rowIndex, itemNo, qty, cardKey: `${rowIndex}:${itemNo}` });
        }
      });
    }

    state = { fileName, rows, headerIndex, headers, groups, data, current: 0, currentCell: 0, marks: new Map() };
    els.note.value = "";
    if (els.file) els.file.value = "";
    render();
  }

  function saveNote() {
    const item = currentItem();
    const cell = reviewCells(item)[state.currentCell];
    const mark = cell ? state.marks.get(cell.cellKey) : null;
    if (mark) mark.note = els.note.value.trim();
  }

  function markCell(status) {
    const item = currentItem();
    const cells = reviewCells(item);
    const cell = cells[state.currentCell];
    if (!item || !cell) return;
    state.marks.set(cell.cellKey, {
      status,
      note: els.note.value.trim(),
      rowIndex: item.rowIndex,
      itemNo: item.itemNo,
      field: cell.name,
      value: cell.value
    });
    if (state.currentCell < cells.length - 1) state.currentCell += 1;
    else if (state.current < state.data.length - 1) {
      state.current += 1;
      state.currentCell = 0;
    }
    render();
  }

  function clearCell() {
    const item = currentItem();
    const cell = reviewCells(item)[state.currentCell];
    if (!cell) return;
    state.marks.delete(cell.cellKey);
    els.note.value = "";
    render();
  }

  function rowSummary(rowIndex) {
    const rowItems = state.data.filter((item) => item.rowIndex === rowIndex);
    const marks = rowItems.flatMap((item) => reviewCells(item).map((cell) => state.marks.get(cell.cellKey)).filter(Boolean));
    const bad = marks.filter((mark) => mark.status === "bad");
    const good = marks.filter((mark) => mark.status === "good");
    const totalCells = rowItems.reduce((sum, item) => sum + reviewCells(item).length, 0);
    if (bad.length) return { status: "ERROR", color: "#ff4d4d", notes: bad.map((mark) => `${config.itemName} ${mark.itemNo} ${mark.field}: ${mark.note || "error"}`).join("; ") };
    if (totalCells && good.length === totalCells) return { status: "GOOD", color: "#fff200", notes: good.map((mark) => mark.note).filter(Boolean).join("; ") };
    if (good.length) return { status: "PARTIAL GOOD", color: "#fff2a8", notes: good.map((mark) => `${config.itemName} ${mark.itemNo}: ${mark.note || "OK"}`).join("; ") };
    return { status: "", color: "", notes: "" };
  }

  function exportMarked() {
    saveNote();
    if (!state.rows.length || state.headerIndex < 0) {
      els.status.textContent = "Upload an Excel file before exporting.";
      return;
    }
    const maxCols = Math.max(...state.rows.map((row) => row.length), state.headers.length);
    const tableRows = state.rows.map((row, rowIndex) => {
      const summary = rowSummary(rowIndex);
      const bg = summary.color || (rowIndex === state.headerIndex ? "#ffffff" : "");
      const style = bg ? ` style="background:${bg};color:#000;border:1px solid #999;"` : ` style="border:1px solid #999;"`;
      const values = Array.from({ length: maxCols }, (_, index) => row[index] ?? "");
      if (rowIndex === state.headerIndex) values.push("Review Status", "Review Notes");
      else if (rowIndex > state.headerIndex) values.push(summary.status, summary.notes);
      return `<tr>${values.map((value) => `<td${style}>${safeText(value)}</td>`).join("")}</tr>`;
    }).join("");
    const htmlDoc = `<!doctype html><html><head><meta charset="utf-8"></head><body><table>${tableRows}</table></body></html>`;
    const link = document.createElement("a");
    const cleanName = state.fileName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "_") || config.prefix;
    link.href = URL.createObjectURL(new Blob([htmlDoc], { type: "application/vnd.ms-excel;charset=utf-8" }));
    link.download = `${cleanName}_marked_review.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
    els.status.textContent = "Exported marked Excel file.";
  }

  function whiteWash() {
    state = { fileName: `${config.prefix}.xlsx`, rows: [], headerIndex: -1, headers: [], groups: [], data: [], current: 0, currentCell: 0, marks: new Map() };
    if (els.file) els.file.value = "";
    els.note.value = "";
    render();
    els.status.textContent = "White wash complete. Upload a new Excel file.";
  }

  async function readFile(file) {
    if (!window.XLSX) {
      els.status.textContent = "SheetJS did not load. Refresh with internet access.";
      return;
    }
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, defval: "" });
    loadRows(rows, file.name);
  }

  els.file?.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) readFile(file).catch((error) => {
      els.status.textContent = `Could not read data: ${error.message}`;
      if (els.file) els.file.value = "";
    });
  });
  els.sample?.addEventListener("click", () => setTimeout(() => loadRows(config.sampleRows, `${config.prefix}_sample.xlsx`), 0));
  els.markGood?.addEventListener("click", () => markCell("good"));
  els.markBad?.addEventListener("click", () => markCell("bad"));
  els.clear?.addEventListener("click", clearCell);
  els.export?.addEventListener("click", exportMarked);
  els.whiteWash?.addEventListener("click", whiteWash);
  els.note?.addEventListener("input", saveNote);

  loadRows(config.sampleRows, `${config.prefix}_sample.xlsx`);
}

const reviewSampleRows = [
  ["CB-ID", "EOR-ID", "Line", "Grids", "Lvls", "Mark", "Qty", "Wwp", "Hwp", "Lbh", "Lwp-h"],
  ["CB-5.50", "BRB-5.50", 2, "C-D", 2, 1901, 2, "184 8/16", "193 15/16", 226, "23 6/16"],
  ["CB-6.50", "BRB-6.50", 6, "C-D", 1, 1902, 2, "184 8/16", "182 15/16", 228, "8 4/16"]
];

const assemblySampleRows = [
  ["CB-ID", "EOR-ID", "Line", "Grids", "Lvls", "Mark", "Qty", "Lc", "Type", "Hc", "Wc", "tc", "DWL", "DWC"],
  ["CB-13.5", "BRB13.5", "12.3", "W.8 to Y", 250, 1251, 1, "29'-6 1/4\"", "t", 14, 14, 0.5, 6, 0],
  ["CB-23.0", "BRB23", "Z", "12.3 to 11.6", 290, 1253, 1, "28'-6 3/4\"", "p", 16, 16, 0.5, 5, 0]
];

setupDeck({ prefix: "review", itemName: "Brace", mode: "review", sampleRows: reviewSampleRows });
setupDeck({ prefix: "assembly", itemName: "Assembly", mode: "assembly", sampleRows: assemblySampleRows });
