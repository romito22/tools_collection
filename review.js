function $(selector) {
  return document.querySelector(selector);
}

function fresh(selector) {
  const node = $(selector);
  if (!node) return null;
  const clone = node.cloneNode(true);
  node.replaceWith(clone);
  return clone;
}

function html(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function norm(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function findIndex(headers, names) {
  const keys = headers.map(norm);
  return keys.findIndex((header) => names.some((name) => header.includes(name)));
}

function findHeader(rows) {
  const index = rows.findIndex((row) => {
    const line = row.map(norm).join(" ");
    return line.includes("cb id") && line.includes("qty") && line.includes("mark");
  });
  return index >= 0 ? index : rows.findIndex((row) => row.some((cell) => String(cell ?? "").trim()));
}

function groupsFrom(headers, parent = [], mode = "review") {
  const wanted = [
    "cb id", "eor id", "line", "grids", "lvls", "mark", "wwp", "hwp", "lbh", "lwp h", "lwph",
    "lc", "type", "hc", "wc", "tc", "w1cc", "h1cc", "t1cc", "t2cc", "dwl", "dwc",
    "ni", "no", "e", "s", "gi", "go", "dhg", "tg", "trg", "wrg", "wl", "tl", "ts",
    "llg", "db", "g", "la", "beam", "col", "gusset edges", "wt", "cb wt"
  ];
  return headers.map((header, index) => {
    let name = String(header || "").trim();
    if (/^column \d+$/i.test(name)) name = String(parent[index] || "").trim();
    return { name, index, k: norm(name) };
  }).filter((group) => {
    if (!group.name || group.k === "#" || group.k === "qty") return false;
    if (mode === "assembly") return !/^column \d+$/i.test(group.name);
    return wanted.some((name) => group.k === name || group.k.includes(name));
  });
}

function setupDeck(cfg) {
  const els = {
    file: fresh(`#${cfg.prefix}ExcelInput`),
    sample: fresh(`#${cfg.prefix}SampleBtn`),
    card: $(`#${cfg.prefix}Card`),
    total: $(`#${cfg.prefix}Total`),
    done: $(`#${cfg.prefix}Done`),
    good: $(`#${cfg.prefix}Good`),
    bad: $(`#${cfg.prefix}Bad`),
    note: fresh(`#${cfg.prefix}Note`),
    status: $(`#${cfg.prefix}Status`),
    markGood: fresh(`#${cfg.prefix}MarkGoodBtn`),
    markBad: fresh(`#${cfg.prefix}MarkBadBtn`),
    clear: fresh(`#${cfg.prefix}ClearMarkBtn`),
    export: fresh(`#${cfg.prefix}ExportReviewBtn`),
    whiteWash: fresh(`#${cfg.prefix}WhiteWashBtn`),
    list: $(`#${cfg.prefix}List`),
    board: $(`#${cfg.prefix}Board`)
  };
  if (!els.card || !els.list || !els.board) return;

  let state = resetState();

  function resetState() {
    return { fileName: `${cfg.prefix}.xlsx`, rows: [], headerIndex: -1, headers: [], groups: [], data: [], current: 0, currentCell: 0, marks: new Map() };
  }

  function col(names) {
    return findIndex(state.headers, names);
  }

  function value(item, names) {
    const index = col(names);
    return index >= 0 ? item.row[index] : "";
  }

  function label(item) {
    const parts = [value(item, ["cb id"]), value(item, ["eor id"]), value(item, ["mark"]), value(item, ["line"]), value(item, ["grids"])].filter(Boolean);
    return `${parts.join(" / ") || `Excel row ${item.rowIndex + 1}`} / ${cfg.itemName} ${item.itemNo} of ${item.qty}`;
  }

  function cells(item) {
    if (!item) return [];
    return state.groups.map((group) => {
      const raw = item.row[group.index];
      return { ...group, value: raw, cellKey: `${item.cardKey}:${group.index}` };
    }).filter((cell) => {
      const text = String(cell.value ?? "").trim();
      const core = ["cb id", "eor id", "line", "grids", "lvls", "mark"].includes(cell.k);
      return core || (text && text !== "-");
    });
  }

  function stats() {
    const marks = [...state.marks.values()];
    els.total.textContent = state.data.length;
    els.done.textContent = marks.length;
    els.good.textContent = marks.filter((mark) => mark.status === "good").length;
    els.bad.textContent = marks.filter((mark) => mark.status === "bad").length;
  }

  function itemState(item) {
    const itemCells = cells(item);
    const marks = itemCells.map((cell) => state.marks.get(cell.cellKey)).filter(Boolean);
    if (marks.some((mark) => mark.status === "bad")) return "bad";
    if (itemCells.length && marks.length === itemCells.length) return "good";
    if (marks.length) return "partial";
    return "";
  }

  function saveNote() {
    const item = state.data[state.current];
    const cell = cells(item)[state.currentCell];
    const mark = cell && state.marks.get(cell.cellKey);
    if (mark) mark.note = els.note.value.trim();
  }

  function renderList() {
    if (!state.data.length) {
      els.list.innerHTML = `<p class="note">No ${cfg.itemName.toLowerCase()}s loaded.</p>`;
      return;
    }
    els.list.innerHTML = state.data.map((item, index) => `
      <button class="${["brace-list-item", itemState(item), index === state.current ? "selected" : ""].filter(Boolean).join(" ")}" type="button" data-index="${index}">
        <strong>${html(value(item, ["mark"]) || `Row ${item.rowIndex + 1}`)}</strong>
        <span>${html(cfg.itemName)} ${item.itemNo}/${item.qty}</span>
        <small>${html(value(item, ["cb id"]))} ${html(value(item, ["grids"]))}</small>
      </button>
    `).join("");
    els.list.querySelectorAll(".brace-list-item").forEach((button) => {
      button.addEventListener("click", () => {
        saveNote();
        state.current = Number(button.dataset.index);
        state.currentCell = 0;
        render();
      });
    });
  }

  function renderBoard() {
    const item = state.data[state.current];
    const itemCells = cells(item);
    if (!itemCells.length) {
      els.board.innerHTML = `<p class="note">No reviewable values loaded.</p>`;
      return;
    }
    els.board.innerHTML = itemCells.map((cell, index) => {
      const mark = state.marks.get(cell.cellKey);
      const status = mark?.status === "good" ? "GOOD" : mark?.status === "bad" ? "ERROR" : "OPEN";
      return `
        <button class="${["value-tile", mark?.status || "", index === state.currentCell ? "selected" : ""].filter(Boolean).join(" ")}" type="button" data-index="${index}">
          <span>${html(cell.name)}</span>
          <b>${html(cell.value)}</b>
          <small>${status}</small>
        </button>
      `;
    }).join("");
    els.board.querySelectorAll(".value-tile").forEach((button) => {
      button.addEventListener("click", () => {
        saveNote();
        state.currentCell = Number(button.dataset.index);
        render();
      });
    });
  }

  function render() {
    stats();
    const item = state.data[state.current];
    if (!item) {
      els.card.className = "review-card idle";
      els.card.innerHTML = `<p class="note">Upload an Excel file to create ${cfg.itemName.toLowerCase()} review cards.</p>`;
      els.status.textContent = "Waiting for Excel data.";
      renderList();
      renderBoard();
      return;
    }
    const itemCells = cells(item);
    if (state.currentCell >= itemCells.length) state.currentCell = 0;
    const cell = itemCells[state.currentCell];
    const mark = cell && state.marks.get(cell.cellKey);
    els.note.value = mark?.note || "";
    els.card.className = `review-card ${mark?.status || ""}`.trim();
    els.card.innerHTML = `
      <div class="review-title">
        <strong>${html(label(item))}</strong>
        <span class="review-pill ${mark?.status || ""}">${mark?.status === "good" ? "Looks Good" : mark?.status === "bad" ? "Has Error" : "Unmarked"}</span>
      </div>
      <div class="review-fields">
        <div class="review-field focus"><span>${html(cell?.name || "Value")}</span><b>${html(cell?.value || "--")}</b></div>
        <div class="review-field meta"><span>${html(cfg.itemName)}</span><b>${item.itemNo} / ${item.qty}</b></div>
      </div>
    `;
    els.status.textContent = `${cfg.itemName} ${state.current + 1} of ${state.data.length}. Select a value tile, then mark that value.`;
    renderList();
    renderBoard();
  }

  function loadRows(rows, fileName) {
    const headerIndex = findHeader(rows);
    const headers = headerIndex >= 0 ? rows[headerIndex].map((cell, index) => String(cell || `Column ${index + 1}`)) : [];
    const groups = groupsFrom(headers, rows[headerIndex - 1] || [], cfg.mode);
    const qtyIndex = findIndex(headers, ["qty"]);
    const cbIndex = findIndex(headers, ["cb id"]);
    const markIndex = findIndex(headers, ["mark"]);
    const data = [];
    if (headerIndex >= 0) {
      rows.slice(headerIndex + 1).forEach((row, offset) => {
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
    if (els.file) els.file.value = "";
    els.note.value = "";
    render();
  }

  function mark(status) {
    const item = state.data[state.current];
    const itemCells = cells(item);
    const cell = itemCells[state.currentCell];
    if (!cell) return;
    state.marks.set(cell.cellKey, { status, note: els.note.value.trim(), rowIndex: item.rowIndex, itemNo: item.itemNo, field: cell.name, value: cell.value });
    if (state.currentCell < itemCells.length - 1) state.currentCell += 1;
    else if (state.current < state.data.length - 1) {
      state.current += 1;
      state.currentCell = 0;
    }
    render();
  }

  function clearMark() {
    const item = state.data[state.current];
    const cell = cells(item)[state.currentCell];
    if (cell) state.marks.delete(cell.cellKey);
    els.note.value = "";
    render();
  }

  function rowSummary(rowIndex) {
    const rowItems = state.data.filter((item) => item.rowIndex === rowIndex);
    const marks = rowItems.flatMap((item) => cells(item).map((cell) => state.marks.get(cell.cellKey)).filter(Boolean));
    const bad = marks.filter((mark) => mark.status === "bad");
    const good = marks.filter((mark) => mark.status === "good");
    const total = rowItems.reduce((sum, item) => sum + cells(item).length, 0);
    if (bad.length) return { status: "ERROR", color: "#ff4d4d", notes: bad.map((mark) => `${cfg.itemName} ${mark.itemNo} ${mark.field}: ${mark.note || "error"}`).join("; ") };
    if (total && good.length === total) return { status: "GOOD", color: "#fff200", notes: good.map((mark) => mark.note).filter(Boolean).join("; ") };
    if (good.length) return { status: "PARTIAL GOOD", color: "#fff2a8", notes: good.map((mark) => `${cfg.itemName} ${mark.itemNo}: ${mark.note || "OK"}`).join("; ") };
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
      const bg = summary.color || (rowIndex === state.headerIndex ? "#fff" : "");
      const style = bg ? ` style="background:${bg};color:#000;border:1px solid #999;"` : ` style="border:1px solid #999;"`;
      const values = Array.from({ length: maxCols }, (_, index) => row[index] ?? "");
      if (rowIndex === state.headerIndex) values.push("Review Status", "Review Notes");
      else if (rowIndex > state.headerIndex) values.push(summary.status, summary.notes);
      return `<tr>${values.map((value) => `<td${style}>${html(value)}</td>`).join("")}</tr>`;
    }).join("");
    const link = document.createElement("a");
    const name = state.fileName.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "_") || cfg.prefix;
    link.href = URL.createObjectURL(new Blob([`<!doctype html><html><body><table>${tableRows}</table></body></html>`], { type: "application/vnd.ms-excel;charset=utf-8" }));
    link.download = `${name}_marked_review.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
    els.status.textContent = "Exported marked Excel file.";
  }

  async function readFile(file) {
    if (!window.XLSX) {
      els.status.textContent = "SheetJS did not load. Refresh with internet access.";
      return;
    }
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const sheet = workbook.SheetNames[0];
    loadRows(XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, defval: "" }), file.name);
  }

  els.file?.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) readFile(file).catch((error) => els.status.textContent = `Could not read data: ${error.message}`);
  });
  els.sample?.addEventListener("click", () => loadRows(cfg.sampleRows, `${cfg.prefix}_sample.xlsx`));
  els.markGood?.addEventListener("click", () => mark("good"));
  els.markBad?.addEventListener("click", () => mark("bad"));
  els.clear?.addEventListener("click", clearMark);
  els.export?.addEventListener("click", exportMarked);
  els.whiteWash?.addEventListener("click", () => {
    state = resetState();
    if (els.file) els.file.value = "";
    els.note.value = "";
    render();
    els.status.textContent = "White wash complete. Upload a new Excel file.";
  });
  els.note?.addEventListener("input", saveNote);
  loadRows(cfg.sampleRows, `${cfg.prefix}_sample.xlsx`);
}

setupDeck({
  prefix: "review",
  itemName: "Brace",
  mode: "review",
  sampleRows: [
    ["CB-ID", "EOR-ID", "Line", "Grids", "Lvls", "Mark", "Qty", "Wwp", "Hwp", "Lbh", "Lwp-h"],
    ["CB-5.50", "BRB-5.50", 2, "C-D", 2, 1901, 2, "184 8/16", "193 15/16", 226, "23 6/16"],
    ["CB-6.50", "BRB-6.50", 6, "C-D", 1, 1902, 2, "184 8/16", "182 15/16", 228, "8 4/16"]
  ]
});
