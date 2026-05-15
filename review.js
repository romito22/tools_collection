function freshControl(selector) {
  const node = document.querySelector(selector);
  if (!node) return null;
  const clone = node.cloneNode(true);
  node.replaceWith(clone);
  return clone;
}

const reviewEls = {
  file: freshControl("#reviewExcelInput"),
  sample: freshControl("#reviewSampleBtn"),
  card: document.querySelector("#reviewCard"),
  total: document.querySelector("#reviewTotal"),
  done: document.querySelector("#reviewDone"),
  good: document.querySelector("#reviewGood"),
  bad: document.querySelector("#reviewBad"),
  note: freshControl("#reviewNote"),
  status: document.querySelector("#reviewStatus"),
  markGood: freshControl("#markGoodBtn"),
  markBad: freshControl("#markBadBtn"),
  clear: freshControl("#clearMarkBtn"),
  export: freshControl("#exportReviewBtn"),
  whiteWash: freshControl("#whiteWashBtn"),
  list: document.querySelector("#braceList"),
  board: document.querySelector("#braceBoard")
};

let reviewState = {
  fileName: "review.xlsx",
  rows: [],
  headerIndex: -1,
  headers: [],
  groups: [],
  data: [],
  current: 0,
  currentCell: 0,
  marks: new Map()
};

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

function findReviewHeader(rows) {
  const match = rows.findIndex((row) => {
    const joined = row.map(key).join(" ");
    return joined.includes("cb id") && (joined.includes("mark") || joined.includes("wwp") || joined.includes("hwp"));
  });
  if (match >= 0) return match;
  return rows.findIndex((row) => row.some((cell) => String(cell ?? "").trim()));
}

function loadReviewRows(rows, fileName = "review.xlsx") {
  const headerIndex = findReviewHeader(rows);
  const headers = headerIndex >= 0 ? rows[headerIndex].map((cell, index) => String(cell || `Column ${index + 1}`)) : [];
  const groups = buildReviewGroups(headers, rows[headerIndex - 1] || []);
  const raw = headerIndex >= 0
    ? rows.slice(headerIndex + 1).map((row, offset) => ({ row, rowIndex: headerIndex + 1 + offset })).filter((item) => item.row.some((cell) => String(cell ?? "").trim()))
    : [];
  const cbIndex = findIndex(headers, ["cb id"]);
  const markIndex = findIndex(headers, ["mark"]);
  const qtyIndex = findIndex(headers, ["qty"]);
  const lbhIndex = findIndex(headers, ["lbh"]);
  const data = [];
  raw.forEach((item) => {
    const cb = String(item.row[cbIndex] ?? "").trim();
    const mark = String(item.row[markIndex] ?? "").trim();
    const qtyNumber = Number(item.row[qtyIndex]);
    const lbh = item.row[lbhIndex];
    const lbhNumber = Number(lbh);
    if (!cb || !mark || !Number.isFinite(qtyNumber) || !Number.isFinite(lbhNumber)) return;
    const qty = Math.max(1, Math.round(qtyNumber));
    for (let braceNo = 1; braceNo <= qty; braceNo += 1) {
      data.push({ ...item, braceNo, qty, lbh: lbhNumber, cardKey: `${item.rowIndex}:${braceNo}` });
    }
  });
  reviewState = { fileName, rows, headerIndex, headers, groups, data, current: 0, currentCell: 0, marks: new Map() };
  reviewEls.note.value = "";
  renderReview();
}

function buildReviewGroups(headers, parentHeaders = []) {
  const ignored = new Set(["", "#"]);
  const groups = [];
  headers.forEach((header, index) => {
    let name = String(header || "").trim();
    if (/^column \d+$/i.test(name)) name = String(parentHeaders[index] || "").trim();
    if (!name || ignored.has(name)) return;
    groups.push({ name, index, span: [index], k: key(name) });
  });
  const wanted = new Set([
    "cb id", "eor id", "line", "grids", "lvls", "mark",
    "wwp", "hwp", "lbh", "lwp h", "lwph", "lwp-h",
    "ni", "no", "e", "s", "gi", "go", "dhg", "tg", "trg", "wrg",
    "fy g", "fy.g", "wl", "tl", "ts", "llg", "db", "g", "l'", "la",
    "beam", "col", "gusset edges", "wt", "cb wt"
  ]);
  return groups.filter((group) => group.k !== "qty" && [...wanted].some((name) => group.k === name || group.k.includes(name)));
}

function groupValue(item, group) {
  return group.span
    .map((index) => item.row[index])
    .filter((value) => String(value ?? "").trim() !== "")
    .join(" ");
}

function reviewCells(item) {
  if (!item) return [];
  return reviewState.groups
    .map((group) => ({ ...group, value: groupValue(item, group), cellKey: `${item.cardKey}:${group.index}` }))
    .filter((cell) => {
      const value = String(cell.value ?? "").trim();
      const core = ["cb id", "eor id", "line", "grids", "lvls", "mark"].includes(cell.k);
      return core || (value && value !== "-");
    });
}

function findIndex(headers, names) {
  const normalized = headers.map(key);
  return normalized.findIndex((header) => names.some((name) => header.includes(name)));
}

function currentItem() {
  return reviewState.data[reviewState.current];
}

function columnIndex(names) {
  const headers = reviewState.headers.map(key);
  return headers.findIndex((header) => names.some((name) => header.includes(name)));
}

function cardLabel(item) {
  if (!item) return "No row";
  const values = [
    item.row[columnIndex(["cb id"])],
    item.row[columnIndex(["eor id"])],
    item.row[columnIndex(["mark"])],
    item.row[columnIndex(["line"])],
    item.row[columnIndex(["grids"])]
  ].filter(Boolean);
  const base = values.join(" / ") || `Excel row ${item.rowIndex + 1}`;
  return `${base} / Brace ${item.braceNo} of ${item.qty}`;
}

function updateStats() {
  const marks = [...reviewState.marks.values()];
  reviewEls.total.textContent = reviewState.data.length;
  reviewEls.done.textContent = marks.length;
  reviewEls.good.textContent = marks.filter((mark) => mark.status === "good").length;
  reviewEls.bad.textContent = marks.filter((mark) => mark.status === "bad").length;
}

function renderReview() {
  updateStats();
  const item = currentItem();
  if (!item) {
    reviewEls.card.className = "review-card idle";
    reviewEls.card.innerHTML = `<p class="note">Upload an Excel file above to create review cards.</p>`;
    reviewEls.status.textContent = "Waiting for Excel data.";
    renderBraceList();
    renderBoard();
    return;
  }

  const cells = reviewCells(item);
  if (reviewState.currentCell >= cells.length) reviewState.currentCell = 0;
  const cell = cells[reviewState.currentCell];
  const mark = cell ? reviewState.marks.get(cell.cellKey) : null;
  reviewEls.note.value = mark?.note || "";
  reviewEls.card.className = `review-card ${mark?.status || ""}`.trim();
  const statusText = mark?.status === "good" ? "Looks Good" : mark?.status === "bad" ? "Has Error" : "Unmarked";
  const focus = cell ? `
    <div class="review-field focus">
      <span>${safeText(cell.name)}</span>
      <b>${safeText(cell.value)}</b>
    </div>
    <div class="review-field meta">
      <span>Brace</span>
      <b>${item.braceNo} / ${item.qty}</b>
    </div>
  ` : `<p class="note">No reviewable values found for this brace.</p>`;

  reviewEls.card.innerHTML = `
    <div class="review-title">
      <strong>${safeText(cardLabel(item))}</strong>
      <span class="review-pill ${mark?.status || ""}">${statusText}</span>
    </div>
    <div class="review-fields">${focus}</div>
  `;
  reviewEls.status.textContent = `Brace ${reviewState.current + 1} of ${reviewState.data.length}. Select a value tile, then mark that specific value.`;
  renderBraceList();
  renderBoard();
}

function shortValue(item, names) {
  const value = item.row[columnIndex(names)];
  return value ?? "";
}

function braceStatus(item) {
  const cells = reviewCells(item);
  const marks = cells.map((cell) => reviewState.marks.get(cell.cellKey)).filter(Boolean);
  if (marks.some((mark) => mark.status === "bad")) return "bad";
  if (cells.length && marks.length === cells.length && marks.every((mark) => mark.status === "good")) return "good";
  if (marks.length) return "partial";
  return "";
}

function renderBraceList() {
  if (!reviewEls.list) return;
  if (!reviewState.data.length) {
    reviewEls.list.innerHTML = `<p class="note">No braces loaded.</p>`;
    return;
  }
  reviewEls.list.innerHTML = reviewState.data.map((item, index) => {
    const status = braceStatus(item);
    const classes = ["brace-list-item", status, index === reviewState.current ? "selected" : ""].filter(Boolean).join(" ");
    return `
      <button class="${classes}" type="button" data-index="${index}">
        <strong>${safeText(shortValue(item, ["mark"]) || `Row ${item.rowIndex + 1}`)}</strong>
        <span>Brace ${item.braceNo}/${item.qty}</span>
        <small>${safeText(shortValue(item, ["cb id"]))} ${safeText(shortValue(item, ["grids"]))}</small>
      </button>
    `;
  }).join("");
  reviewEls.list.querySelectorAll(".brace-list-item").forEach((tile) => {
    tile.addEventListener("click", () => {
      saveNote();
      reviewState.current = Number(tile.dataset.index);
      reviewState.currentCell = 0;
      renderReview();
    });
  });
}

function renderBoard() {
  if (!reviewEls.board) return;
  const item = currentItem();
  const cells = reviewCells(item);
  if (!cells.length) {
    reviewEls.board.innerHTML = `<p class="note">No reviewable values loaded for this brace.</p>`;
    return;
  }
  reviewEls.board.innerHTML = cells.map((cell, index) => {
    const mark = reviewState.marks.get(cell.cellKey);
    const classes = ["value-tile", mark?.status || "", index === reviewState.currentCell ? "selected" : ""].filter(Boolean).join(" ");
    const status = mark?.status === "good" ? "GOOD" : mark?.status === "bad" ? "ERROR" : "OPEN";
    return `
      <button class="${classes}" type="button" data-index="${index}">
        <span>${safeText(cell.name)}</span>
        <b>${safeText(cell.value)}</b>
        <small>${status}</small>
      </button>
    `;
  }).join("");
  reviewEls.board.querySelectorAll(".value-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      saveNote();
      reviewState.currentCell = Number(tile.dataset.index);
      renderReview();
    });
  });
}

function formatLbh(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value;
  const whole = Math.floor(number);
  const den = 16;
  let numerator = Math.round((number - whole) * den);
  if (!numerator) return `${whole}"`;
  if (numerator === den) return `${whole + 1}"`;
  const divisor = gcd(numerator, den);
  return `${whole} ${numerator / divisor}/${den / divisor}"`;
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function saveNote() {
  const item = currentItem();
  if (!item) return;
  const cell = reviewCells(item)[reviewState.currentCell];
  if (!cell) return;
  const mark = reviewState.marks.get(cell.cellKey);
  if (mark) mark.note = reviewEls.note.value.trim();
}

function markCard(status) {
  const item = currentItem();
  if (!item) return;
  const cells = reviewCells(item);
  const cell = cells[reviewState.currentCell];
  if (!cell) return;
  reviewState.marks.set(cell.cellKey, {
    status,
    note: reviewEls.note.value.trim(),
    rowIndex: item.rowIndex,
    braceNo: item.braceNo,
    columnIndex: cell.index,
    field: cell.name,
    value: cell.value
  });
  if (reviewState.currentCell < cells.length - 1) reviewState.currentCell += 1;
  else if (reviewState.current < reviewState.data.length - 1) {
    reviewState.current += 1;
    reviewState.currentCell = 0;
  }
  renderReview();
}

function clearCard() {
  const item = currentItem();
  if (!item) return;
  const cell = reviewCells(item)[reviewState.currentCell];
  if (!cell) return;
  reviewState.marks.delete(cell.cellKey);
  reviewEls.note.value = "";
  renderReview();
}

function rowReviewSummary(rowIndex) {
  const rowCards = reviewState.data.filter((item) => item.rowIndex === rowIndex);
  const marks = rowCards.flatMap((item) => reviewCells(item).map((cell) => reviewState.marks.get(cell.cellKey)).filter(Boolean));
  const bad = marks.filter((mark) => mark.status === "bad");
  const good = marks.filter((mark) => mark.status === "good");
  if (bad.length) {
    return {
      status: "ERROR",
      color: "#ff4d4d",
      notes: bad.map((mark) => `Brace ${mark.braceNo} ${mark.field}: ${mark.note || "error"}`).join("; ")
    };
  }
  const rowCellCount = rowCards.reduce((sum, item) => sum + reviewCells(item).length, 0);
  if (rowCellCount && good.length === rowCellCount) {
    return {
      status: "GOOD",
      color: "#fff200",
      notes: good.map((mark) => mark.note).filter(Boolean).join("; ")
    };
  }
  if (good.length) {
    return {
      status: "PARTIAL GOOD",
      color: "#fff2a8",
      notes: good.map((mark) => `Brace ${mark.braceNo}: ${mark.note || "OK"}`).join("; ")
    };
  }
  return { status: "", color: "", notes: "" };
}

function exportMarkedReview() {
  saveNote();
  if (!reviewState.rows.length || reviewState.headerIndex < 0) {
    reviewEls.status.textContent = "Upload an Excel file before exporting.";
    return;
  }

  const maxCols = Math.max(...reviewState.rows.map((row) => row.length), reviewState.headers.length);
  const tableRows = reviewState.rows.map((row, rowIndex) => {
    const summary = rowReviewSummary(rowIndex);
    const bg = summary.color || (rowIndex === reviewState.headerIndex ? "#ffffff" : "");
    const style = bg ? ` style="background:${bg};color:#000;border:1px solid #999;"` : ` style="border:1px solid #999;"`;
    const values = Array.from({ length: maxCols }, (_, index) => row[index] ?? "");
    if (rowIndex === reviewState.headerIndex) values.push("Review Status", "Review Notes");
    else if (rowIndex > reviewState.headerIndex) values.push(summary.status, summary.notes);
    return `<tr>${values.map((value) => `<td${style}>${safeText(value)}</td>`).join("")}</tr>`;
  }).join("");

  const htmlDoc = `<!doctype html><html><head><meta charset="utf-8"></head><body><table>${tableRows}</table></body></html>`;
  const link = document.createElement("a");
  const cleanName = reviewState.fileName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "_") || "review";
  link.href = URL.createObjectURL(new Blob([htmlDoc], { type: "application/vnd.ms-excel;charset=utf-8" }));
  link.download = `${cleanName}_marked_review.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
  reviewEls.status.textContent = "Exported marked Excel file.";
}

function whiteWash() {
  reviewState = {
    fileName: "review.xlsx",
    rows: [],
    headerIndex: -1,
    headers: [],
    groups: [],
    data: [],
    current: 0,
    currentCell: 0,
    marks: new Map()
  };
  if (reviewEls.file) reviewEls.file.value = "";
  reviewEls.note.value = "";
  renderReview();
  reviewEls.status.textContent = "White wash complete. Upload a new Excel file.";
}

async function readReviewFile(file) {
  if (!window.XLSX) {
    reviewEls.status.textContent = "SheetJS did not load. Refresh with internet access.";
    return;
  }
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, defval: "" });
  loadReviewRows(rows, file.name);
}

function loadReviewSample() {
  loadReviewRows([
    ["CB-ID", "EOR-ID", "Line", "Grids", "Lvls", "Mark", "Qty", "Wwp", "", "", "Hwp", "", "", "Lbh", "", "", "Lwp-h"],
    ["CB-5.50", "BRB-5.50", 2, "C-D", 2, 1901, 2, 184, "8/16", "", 193, "15/16", "", 226, "", "", "23 6/16"],
    ["CB-6.50", "BRB-6.50", 6, "C-D", 1, 1902, 2, 184, "8/16", "", 182, "15/16", "", 228, "", "", "8 4/16"]
  ], "sample_review.xlsx");
}

reviewEls.file.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) readReviewFile(file).catch((error) => {
    reviewEls.status.textContent = `Could not read review data: ${error.message}`;
  });
});
reviewEls.sample.addEventListener("click", () => setTimeout(loadReviewSample, 0));
reviewEls.markGood.addEventListener("click", () => markCard("good"));
reviewEls.markBad.addEventListener("click", () => markCard("bad"));
reviewEls.clear.addEventListener("click", clearCard);
reviewEls.export.addEventListener("click", exportMarkedReview);
reviewEls.whiteWash.addEventListener("click", whiteWash);
reviewEls.note.addEventListener("input", saveNote);
loadReviewSample();
