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
  board: document.querySelector("#braceBoard")
};

let reviewState = {
  fileName: "review.xlsx",
  rows: [],
  headerIndex: -1,
  headers: [],
  data: [],
  current: 0,
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
  reviewState = { fileName, rows, headerIndex, headers, data, current: 0, marks: new Map() };
  reviewEls.note.value = "";
  renderReview();
}

function reviewColumns() {
  return reviewState.headers
    .map((header, index) => ({ header: String(header || "").trim(), index, k: key(header) }))
    .filter((item) => item.header && item.header !== "#");
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
    renderBoard();
    return;
  }

  const mark = reviewState.marks.get(item.cardKey);
  reviewEls.note.value = mark?.note || "";
  reviewEls.card.className = `review-card ${mark?.status || ""}`.trim();
  const statusText = mark?.status === "good" ? "Looks Good" : mark?.status === "bad" ? "Has Error" : "Unmarked";
  const focus = `
    <div class="review-field focus">
      <span>Expected Lbh</span>
      <b>${safeText(formatLbh(item.lbh))}</b>
    </div>
    <div class="review-field focus">
      <span>Brace</span>
      <b>${item.braceNo} / ${item.qty}</b>
    </div>
  `;
  const fields = reviewColumns().filter(({ index }) => String(item.row[index] ?? "").trim() !== "").map(({ header, index }) => `
    <div class="review-field">
      <span>${safeText(header)}</span>
      <b>${safeText(item.row[index] ?? "")}</b>
    </div>
  `).join("");

  reviewEls.card.innerHTML = `
    <div class="review-title">
      <strong>${safeText(cardLabel(item))}</strong>
      <span class="review-pill ${mark?.status || ""}">${statusText}</span>
    </div>
    <div class="review-fields">${focus}${fields}</div>
  `;
  reviewEls.status.textContent = `Selected ${reviewState.current + 1} of ${reviewState.data.length}. Choose a tile below or mark this brace.`;
  renderBoard();
}

function shortValue(item, names) {
  const value = item.row[columnIndex(names)];
  return value ?? "";
}

function renderBoard() {
  if (!reviewEls.board) return;
  if (!reviewState.data.length) {
    reviewEls.board.innerHTML = `<p class="note">No brace cards loaded.</p>`;
    return;
  }
  reviewEls.board.innerHTML = reviewState.data.map((item, index) => {
    const mark = reviewState.marks.get(item.cardKey);
    const classes = ["brace-tile", mark?.status || "", index === reviewState.current ? "selected" : ""].filter(Boolean).join(" ");
    const status = mark?.status === "good" ? "GOOD" : mark?.status === "bad" ? "ERROR" : "OPEN";
    return `
      <button class="${classes}" type="button" data-index="${index}">
        <strong>${safeText(shortValue(item, ["mark"]) || `Row ${item.rowIndex + 1}`)} / Brace ${item.braceNo}</strong>
        <b>${safeText(formatLbh(item.lbh))}</b>
        <span>${safeText(shortValue(item, ["cb id"]))} | ${safeText(shortValue(item, ["grids"]))} | ${status}</span>
      </button>
    `;
  }).join("");
  reviewEls.board.querySelectorAll(".brace-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      saveNote();
      reviewState.current = Number(tile.dataset.index);
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
  const mark = reviewState.marks.get(item.cardKey);
  if (mark) mark.note = reviewEls.note.value.trim();
}

function moveCard(delta) {
  saveNote();
  if (!reviewState.data.length) return;
  reviewState.current = Math.max(0, Math.min(reviewState.data.length - 1, reviewState.current + delta));
  renderReview();
}

function markCard(status) {
  const item = currentItem();
  if (!item) return;
  reviewState.marks.set(item.cardKey, { status, note: reviewEls.note.value.trim(), rowIndex: item.rowIndex, braceNo: item.braceNo });
  if (reviewState.current < reviewState.data.length - 1) reviewState.current += 1;
  renderReview();
}

function clearCard() {
  const item = currentItem();
  if (!item) return;
  reviewState.marks.delete(item.cardKey);
  reviewEls.note.value = "";
  renderReview();
}

function rowReviewSummary(rowIndex) {
  const rowCards = reviewState.data.filter((item) => item.rowIndex === rowIndex);
  const marks = rowCards.map((item) => reviewState.marks.get(item.cardKey)).filter(Boolean);
  const bad = marks.filter((mark) => mark.status === "bad");
  const good = marks.filter((mark) => mark.status === "good");
  if (bad.length) {
    return {
      status: "ERROR",
      color: "#ff4d4d",
      notes: bad.map((mark) => `Brace ${mark.braceNo}: ${mark.note || "Lbh error"}`).join("; ")
    };
  }
  if (rowCards.length && good.length === rowCards.length) {
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
    data: [],
    current: 0,
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
