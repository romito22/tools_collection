const reviewEls = {
  file: document.querySelector("#reviewExcelInput"),
  sample: document.querySelector("#reviewSampleBtn"),
  card: document.querySelector("#reviewCard"),
  total: document.querySelector("#reviewTotal"),
  done: document.querySelector("#reviewDone"),
  good: document.querySelector("#reviewGood"),
  bad: document.querySelector("#reviewBad"),
  note: document.querySelector("#reviewNote"),
  status: document.querySelector("#reviewStatus"),
  prev: document.querySelector("#reviewPrevBtn"),
  next: document.querySelector("#reviewNextBtn"),
  markGood: document.querySelector("#markGoodBtn"),
  markBad: document.querySelector("#markBadBtn"),
  clear: document.querySelector("#clearMarkBtn"),
  export: document.querySelector("#exportReviewBtn")
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
  const data = headerIndex >= 0
    ? rows.slice(headerIndex + 1).map((row, offset) => ({ row, rowIndex: headerIndex + 1 + offset })).filter((item) => item.row.some((cell) => String(cell ?? "").trim()))
    : [];
  reviewState = { fileName, rows, headerIndex, headers, data, current: 0, marks: new Map() };
  reviewEls.note.value = "";
  renderReview();
}

function reviewColumns() {
  const wanted = ["cb id", "eor id", "line", "grids", "lvls", "mark", "qty", "wwp", "hwp", "lbh", "lwp h", "lwph", "lwp-h"];
  const picked = reviewState.headers.map((header, index) => ({ header, index, k: key(header) }))
    .filter((item) => item.header && wanted.some((name) => item.k.includes(name)));
  return picked.length ? picked : reviewState.headers.map((header, index) => ({ header: header || `Column ${index + 1}`, index })).slice(0, 12);
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
  return values.join(" / ") || `Excel row ${item.rowIndex + 1}`;
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
    return;
  }

  const mark = reviewState.marks.get(item.rowIndex);
  reviewEls.note.value = mark?.note || "";
  reviewEls.card.className = `review-card ${mark?.status || ""}`.trim();
  const statusText = mark?.status === "good" ? "Looks Good" : mark?.status === "bad" ? "Has Error" : "Unmarked";
  const fields = reviewColumns().map(({ header, index }) => `
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
    <div class="review-fields">${fields}</div>
  `;
  reviewEls.status.textContent = `Card ${reviewState.current + 1} of ${reviewState.data.length}. Yellow = good, red = error.`;
}

function saveNote() {
  const item = currentItem();
  if (!item) return;
  const mark = reviewState.marks.get(item.rowIndex);
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
  reviewState.marks.set(item.rowIndex, { status, note: reviewEls.note.value.trim() });
  if (reviewState.current < reviewState.data.length - 1) reviewState.current += 1;
  renderReview();
}

function clearCard() {
  const item = currentItem();
  if (!item) return;
  reviewState.marks.delete(item.rowIndex);
  reviewEls.note.value = "";
  renderReview();
}

function exportMarkedReview() {
  saveNote();
  if (!reviewState.rows.length || reviewState.headerIndex < 0) {
    reviewEls.status.textContent = "Upload an Excel file before exporting.";
    return;
  }

  const maxCols = Math.max(...reviewState.rows.map((row) => row.length), reviewState.headers.length);
  const tableRows = reviewState.rows.map((row, rowIndex) => {
    const mark = reviewState.marks.get(rowIndex);
    const bg = mark?.status === "good" ? "#fff200" : mark?.status === "bad" ? "#ff4d4d" : rowIndex === reviewState.headerIndex ? "#ffffff" : "";
    const style = bg ? ` style="background:${bg};color:#000;border:1px solid #999;"` : ` style="border:1px solid #999;"`;
    const values = Array.from({ length: maxCols }, (_, index) => row[index] ?? "");
    if (rowIndex === reviewState.headerIndex) values.push("Review Status", "Review Notes");
    else if (rowIndex > reviewState.headerIndex) values.push(mark?.status === "good" ? "GOOD" : mark?.status === "bad" ? "ERROR" : "", mark?.note || "");
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
reviewEls.prev.addEventListener("click", () => moveCard(-1));
reviewEls.next.addEventListener("click", () => moveCard(1));
reviewEls.markGood.addEventListener("click", () => markCard("good"));
reviewEls.markBad.addEventListener("click", () => markCard("bad"));
reviewEls.clear.addEventListener("click", clearCard);
reviewEls.export.addEventListener("click", exportMarkedReview);
reviewEls.note.addEventListener("input", saveNote);
loadReviewSample();
