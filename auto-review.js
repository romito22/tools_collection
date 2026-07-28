import * as pdfjsLib from "./assets/pdfjs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "./assets/pdfjs/pdf.worker.mjs",
  import.meta.url
).href;

const STORAGE_KEY = "tools_collection.autoReview.allParts.v2";
const PDF_DB_NAME = "tools_collection.autoReview.files";
const PDF_DB_VERSION = 1;
const PDF_STORE_NAME = "pdfs";

const SAMPLE_ROWS = [
  {
    mark: "1901",
    row: 9,
    values: {
      A: "CB-2.00", F: "1901", G: "1", H: "t8x8x0.25",
      I: "108.75", J: "9'-0 3/4\"", O: "8", P: "8", Q: "0.25"
    }
  },
  {
    mark: "1906",
    row: 14,
    values: {
      A: "CB-2.00", F: "1906", G: "1", H: "t8x8x0.25",
      I: "108.75", J: "9'-0 3/4\"", O: "8", P: "8", Q: "0.25"
    }
  },
  {
    mark: "1912",
    row: 20,
    values: {
      A: "CB-2.00", F: "1912", G: "1", H: "t8x8x0.25",
      I: "108.75", J: "9'-0 3/4\"", O: "8", P: "8", Q: "0.25"
    }
  }
];

const P01_COLUMNS = [
  { letter: "A", label: "CB-ID", unit: "#" },
  { letter: "F", label: "Mark", unit: "#" },
  { letter: "G", label: "Qty", unit: "#", field: "qty" },
  { letter: "H", label: "Type", unit: "", field: "type" },
  { letter: "I", label: "Lc", unit: "in" },
  { letter: "J", label: "Lc", unit: "FIF", field: "length" },
  { letter: "O", label: "Hc", unit: "in", field: "height" },
  { letter: "P", label: "Wc", unit: "in", field: "width" },
  { letter: "Q", label: "tc", unit: "in", field: "thickness" }
];

const P01_FIELDS = [
  {
    key: "qty",
    label: "Qty",
    column: "G",
    candidate: (row) => `1 @ ${row.mark}A`,
    hint: "Quantity callout beside the mark list.",
    box: (row) => ({
      x: 0.855,
      y: { "1901": 0.793, "1906": 0.817, "1912": 0.841 }[row.mark] || 0.793,
      w: 0.108,
      h: 0.032
    })
  },
  {
    key: "type",
    label: "Type",
    column: "H",
    candidate: () => "HSS 8 X 8 X 0.250",
    hint: "Material description in the drawing title.",
    box: () => ({ x: 0.22, y: 0.882, w: 0.42, h: 0.048 })
  },
  {
    key: "length",
    label: "Lc",
    column: "J",
    candidate: () => "9'-0 3/4\"",
    hint: "Overall casing length dimension.",
    box: () => ({ x: 0.345, y: 0.416, w: 0.165, h: 0.064 })
  },
  {
    key: "height",
    label: "Hc",
    column: "O",
    candidate: () => "8\"",
    hint: "Vertical outside HSS dimension.",
    box: () => ({ x: 0.846, y: 0.315, w: 0.052, h: 0.122 })
  },
  {
    key: "width",
    label: "Wc",
    column: "P",
    candidate: () => "8\"",
    hint: "Horizontal outside HSS dimension.",
    box: () => ({ x: 0.746, y: 0.414, w: 0.116, h: 0.064 })
  },
  {
    key: "thickness",
    label: "tc",
    column: "Q",
    candidate: () => "0.250",
    hint: "Wall thickness inside the material description.",
    box: () => ({ x: 0.365, y: 0.882, w: 0.115, h: 0.048 })
  }
];

const materialBox = (role) => {
  const boxes = {
    qty: { x: 0.76, y: 0.72, w: 0.21, h: 0.14 },
    thickness: { x: 0.17, y: 0.86, w: 0.13, h: 0.055 },
    width: { x: 0.29, y: 0.86, w: 0.15, h: 0.055 },
    length: { x: 0.43, y: 0.86, w: 0.23, h: 0.055 },
    text: { x: 0.17, y: 0.79, w: 0.32, h: 0.055 }
  };
  return () => boxes[role] || boxes.text;
};

const field = (key, label, column, unit, role, get, hint) => ({
  key, label, column, unit, role, get, hint, box: materialBox(role)
});

const PARTS = {
  p01: { label: "P01", prefix: "p01", sheet: "HSS D", fields: P01_FIELDS },
  p02: {
    label: "P02", prefix: "p02", sheet: "Cor(-)", presence: (mark) => mark.core?.length != null,
    fields: [
      field("qty", "Qty", "H", "#", "qty", (mark) => mark.core?.qty, "Quantity callout beside the mark list."),
      field("length", "Lsc", "I", "in", "length", (mark) => mark.core?.length, "Overall plate length in the material title."),
      field("width", "Wsc", "O", "in", "width", (mark) => mark.core?.width, "Plate width in the material title."),
      field("thickness", "tply", "U", "in", "thickness", (mark) => mark.core?.plyThickness, "Plate thickness in the material title."),
      field("plies", "# Plies", "T", "", "text", (mark) => mark.core?.plies, "Ply count printed on the drawing.")
    ]
  },
  p03: {
    label: "P03", prefix: "p03", sheet: "Cor(-)", presence: (mark) => Number(mark.lug?.qty || 0) > 0,
    fields: [
      field("qty", "Qty", "AL", "#", "qty", (mark) => mark.lug?.qty, "Quantity callout beside the mark list."),
      field("length", "LL", "AM", "in", "length", (mark) => mark.lug?.length, "Lug length in the material title."),
      field("width", "WL", "AN", "in", "width", (mark) => mark.lug?.width, "Lug width in the material title."),
      field("thickness", "tL", "AO", "in", "thickness", (mark) => mark.lug?.thickness, "Lug thickness in the material title.")
    ]
  },
  p04: {
    label: "P04", prefix: "p04", sheet: "Cor(-)", presence: (mark) => Number(mark.stopper?.qty || 0) > 0,
    fields: [
      field("qty", "Qty", "BH", "#", "qty", (mark) => mark.stopper?.qty, "Quantity callout beside the mark list."),
      field("length", "Hstp", "BK", "in", "length", (mark) => mark.stopper?.height, "Stopper length in the material title."),
      field("width", "Wstp", "BJ", "in", "width", (mark) => mark.stopper?.width, "Stopper width in the material title."),
      field("thickness", "tstp", "BI", "in", "thickness", (mark) => mark.stopper?.thickness, "Stopper thickness in the material title.")
    ]
  },
  p05: {
    label: "P05", prefix: "p05", sheet: "Cor(-)",
    presence: (mark) => mark.stiffener?.thickness != null && mark.stiffener?.length != null,
    fields: [
      field("length", "Lcst", "BS", "in", "length", (mark) => mark.stiffener?.length, "Stiffener length in the material title."),
      field("width", "Wcst", "BR", "in", "width", (mark) => mark.stiffener?.width, "Stiffener width in the material title."),
      field("thickness", "tcst", "BQ", "in", "thickness", (mark) => mark.stiffener?.thickness, "Stiffener thickness in the material title.")
    ]
  },
  p06: {
    label: "P06", prefix: "p06", sheet: "PIM(-)", presence: (mark) => Number(mark.pim?.main?.qty || 0) > 0,
    fields: [
      field("qty", "Qty", "N", "#", "qty", (mark) => Number(mark.pim?.main?.qty || 0) / 2, "P06 quantity beside the mark."),
      field("length", "LPIM", "R", "in", "length", (mark) => mark.pim?.main?.length, "PIM plate length in the material title."),
      field("width", "Wp", "W", "in", "width", (mark) => mark.pim?.main?.width, "PIM plate width in the material title."),
      field("thickness", "tPIM-p06", "O", "in", "thickness", (mark) => mark.pim?.main?.thickness, "P06 plate thickness in the material title.")
    ]
  },
  p07: {
    label: "P07", prefix: "p07", sheet: "PIM(-)", presence: (mark) => Number(mark.pim?.main?.qty || 0) > 0,
    fields: [
      field("qty", "Qty", "N", "#", "qty", (mark) => Number(mark.pim?.main?.qty || 0) / 2, "P07 quantity beside the mark."),
      field("length", "LPIM", "R", "in", "length", (mark) => mark.pim?.main?.length, "PIM plate length in the material title."),
      field("width", "Wp", "W", "in", "width", (mark) => mark.pim?.main?.width, "PIM plate width in the material title."),
      field("thickness", "tPIM-p07", "P", "in", "thickness", (mark) => mark.pim?.main?.tP07, "P07 plate thickness in the material title.")
    ]
  },
  p08: {
    label: "P08", prefix: "p08", sheet: "PIM(-)", presence: (mark) => Number(mark.pim?.transverse?.qty || 0) > 0,
    fields: [
      field("qty", "Qty EA", "AD", "#", "qty", (mark) => Math.ceil(Number(mark.pim?.transverse?.qty || 0) / 2), "P08 quantity beside the mark."),
      field("length", "Lttp", "AF", "in", "length", (mark) => mark.pim?.transverse?.length, "Transverse PIM length in the material title."),
      field("stopLength", "Lstp", "AG", "in", "stopLength", (mark) => mark.pim?.transverse?.stopLength, "Straight portion dimension above the P08 profile."),
      field("xtp", "xtp", "AH", "in", "xtp", (mark) => mark.pim?.transverse?.xtp, "Taper portion dimension above the P08 profile."),
      field("profileRise", "Whpp-W''se", "Z-AI", "in", "profileRise", (mark) => {
        const height = Number(mark.pim?.main?.Whpp);
        const smallEnd = Number(mark.pim?.transverse?.smallEndWidth);
        return Number.isFinite(height) && Number.isFinite(smallEnd) ? height - smallEnd : null;
      }, "Derived left-side rise dimension on the P08 profile."),
      field("smallEndWidth", "W''se", "AI", "in", "smallEndWidth", (mark) => mark.pim?.transverse?.smallEndWidth, "Small-end vertical dimension at the left of the P08 profile."),
      field("width", "Wtp", "AJ", "in", "width", (mark) => mark.pim?.transverse?.width, "Transverse PIM width in the material title."),
      field("thickness", "tp08,09-Pim", "AK", "in", "thickness", (mark) => mark.pim?.transverse?.thickness, "Transverse PIM thickness in the material title.")
    ]
  },
  p09: {
    label: "P09", prefix: "p09", sheet: "PIM(-)", presence: (mark) => Number(mark.pim?.transverse?.qty || 0) > 0,
    fields: [
      field("qty", "Qty EA", "AD", "#", "qty", (mark) => Math.floor(Number(mark.pim?.transverse?.qty || 0) / 2), "P09 quantity beside the mark."),
      field("length", "Lttp", "AF", "in", "length", (mark) => mark.pim?.transverse?.length, "Transverse PIM length in the material title."),
      field("width", "Wtp", "AJ", "in", "width", (mark) => mark.pim?.transverse?.width, "Transverse PIM width in the material title."),
      field("thickness", "tp08,09-Pim", "AK", "in", "thickness", (mark) => mark.pim?.transverse?.thickness, "Transverse PIM thickness in the material title.")
    ]
  },
  p10: {
    label: "P10", prefix: "p10", sheet: "PIM(-)", presence: (mark) => Number(mark.pim?.capStrip?.qty || 0) > 0,
    fields: [
      field("qty", "Qty", "AL", "#", "qty", (mark) => mark.pim?.capStrip?.qty, "P10 quantity beside the mark."),
      field("length", "Lcp", "AN", "in", "length", (mark) => mark.pim?.capStrip?.length, "P10 strip length in the material title."),
      field("width", "Wp10-Cap", "AQ", "in", "width", (mark) => mark.pim?.capStrip?.width, "P10 strip width in the material title."),
      field("thickness", "tp10-Cap", "AR", "in", "thickness", (mark) => mark.pim?.capStrip?.thickness, "P10 strip thickness in the material title.")
    ]
  },
  p11: {
    label: "P11", prefix: "p11", sheet: "PIM(-)", presence: (mark) => Number(mark.pim?.transverseCap?.qty || 0) > 0,
    fields: [
      field("qty", "Qty", "AS", "#", "qty", (mark) => mark.pim?.transverseCap?.qty, "P11 quantity beside the mark.")
    ]
  },
  p12: {
    label: "P12", prefix: "p12", sheet: "PIM(-)", presence: (mark) => Number(mark.pim?.transverseShortCap?.qty || 0) > 0,
    fields: [
      field("qty", "Qty", "AW", "#", "qty", (mark) => mark.pim?.transverseShortCap?.qty, "P12 quantity on the shared P11/P12 drawing.")
    ]
  },
  p13: {
    label: "P13", prefix: "p13", sheet: "PIM(-)", presence: (mark) => Number(mark.pim?.widenedCap?.qty || 0) > 0,
    fields: [
      field("qty", "Qty", "BA", "#", "qty", (mark) => mark.pim?.widenedCap?.qty, "P13 quantity beside the mark."),
      field("length", "Lcp13", "BC", "in", "length", (mark) => mark.pim?.widenedCap?.length, "P13 strip length in the material title."),
      field("width", "Wp13", "BD", "in", "width", (mark) => mark.pim?.widenedCap?.width, "P13 strip width in the material title."),
      field("thickness", "tp13", "BE", "in", "thickness", (mark) => mark.pim?.widenedCap?.thickness, "P13 strip thickness in the material title.")
    ]
  },
  p14: {
    label: "P14", prefix: "p14", sheet: "PIM(-)", presence: (mark) => Number(mark.pim?.transitionCap?.qty || 0) > 0,
    fields: [
      field("qty", "Qty", "BF", "#", "qty", (mark) => mark.pim?.transitionCap?.qty, "P14 quantity beside the mark."),
      field("length", "Lcp14", "BH", "in", "length", (mark) => mark.pim?.transitionCap?.length, "P14 strip length in the material title."),
      field("width", "Wp14", "BI", "in", "width", (mark) => mark.pim?.transitionCap?.width, "P14 strip width in the material title."),
      field("thickness", "tp14", "BJ", "in", "thickness", (mark) => mark.pim?.transitionCap?.thickness, "P14 strip thickness in the material title.")
    ]
  },
  p15: {
    label: "P15", prefix: "p15", sheet: "HSS D", presence: (mark) => Number(mark.capPlate?.qty || 0) > 0,
    fields: [
      field("qty", "Qty", "R", "#", "qty", (mark) => mark.capPlate?.qty, "P15 quantity beside the mark."),
      field("length", "W1cc", "S", "in", "length", (mark) => mark.capPlate?.length, "Cap plate length in the material title."),
      field("width", "H1cc", "T", "in", "width", (mark) => mark.capPlate?.width, "Cap plate width in the material title."),
      field("thickness", "tcc", "AA", "in", "thickness", (mark) => mark.capPlate?.thickness, "Cap plate thickness in the material title.")
    ]
  }
};
PARTS.lug = { ...PARTS.p03, label: "LUG" };

const byId = (id) => document.getElementById(id);
const els = {
  view: byId("autoReviewView"),
  tabs: byId("autoPartTabs"),
  workbookInput: byId("autoWorkbookInput"),
  workbookUpload: byId("autoWorkbookUploadBtn"),
  workbookName: byId("autoWorkbookName"),
  workbookStatus: byId("autoWorkbookStatus"),
  workbookDrop: byId("autoWorkbookDropZone"),
  input: byId("autoPdfInput"),
  folderInput: byId("autoPdfFolderInput"),
  upload: byId("autoPdfUploadBtn"),
  folder: byId("autoPdfFolderBtn"),
  clearPdfs: byId("autoPdfClearBtn"),
  clearPdfDialog: byId("autoClearPdfDialog"),
  clearPdfCancel: byId("autoClearPdfCancelBtn"),
  clearPdfConfirm: byId("autoClearPdfConfirmBtn"),
  drop: byId("autoPdfDropZone"),
  pdfName: byId("autoPdfName"),
  pdfStatus: byId("autoPdfStatus"),
  pdfLibraryDrop: byId("autoPdfLibraryDropZone"),
  pdfBreakdown: byId("autoPdfBreakdown"),
  pdfPanelTitle: byId("autoPdfPanelTitle"),
  sheetTitle: byId("autoSheetTitle"),
  scroll: byId("autoPdfScroll"),
  stage: byId("autoPdfStage"),
  canvas: byId("autoPdfCanvas"),
  annotations: byId("autoPdfAnnotations"),
  highlight: byId("autoPdfHighlight"),
  highlightLabel: byId("autoPdfHighlightLabel"),
  zoomOut: byId("autoZoomOutBtn"),
  zoomFit: byId("autoZoomFitBtn"),
  zoomIn: byId("autoZoomInBtn"),
  zoomValue: byId("autoZoomValue"),
  cellAddress: byId("autoCellAddress"),
  markLabel: byId("autoMarkLabel"),
  fieldLabel: byId("autoFieldLabel"),
  expectedValue: byId("autoExpectedValue"),
  sheetGrid: byId("autoSheetGrid"),
  progress: byId("autoProgressEyebrow"),
  title: byId("autoReviewTitle"),
  hint: byId("autoEvidenceHint"),
  compareExpected: byId("autoCompareExpected"),
  compareCandidate: byId("autoCompareCandidate"),
  checkAll: byId("autoCheckAllBtn"),
  pass: byId("autoPassBtn"),
  fail: byId("autoFailBtn"),
  prevData: byId("autoPrevDataBtn"),
  prevMark: byId("autoPrevMarkBtn"),
  nextData: byId("autoNextDataBtn"),
  nextMark: byId("autoNextMarkBtn"),
  passCount: byId("autoPassCount"),
  failCount: byId("autoFailCount"),
  openCount: byId("autoOpenCount"),
  clearLog: byId("autoClearLogBtn"),
  logList: byId("autoLogList")
};

if (!els.canvas || !els.sheetGrid || !els.tabs) {
  throw new Error("Auto Review view is incomplete.");
}

const state = {
  part: "p01",
  rows: SAMPLE_ROWS,
  markIndex: 0,
  fieldIndex: 0,
  documents: [],
  pageIndex: [],
  activeRecord: null,
  activeRequest: 0,
  pdf: null,
  page: null,
  pdfName: "",
  pdfMarks: [],
  scale: 1.5,
  viewport: null,
  renderTask: null,
  decisions: loadDecisions()
};

function loadDecisions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch (error) {
    console.warn("Could not restore the Auto Review log.", error);
    return {};
  }
}

function saveDecisions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.decisions));
}

function openPdfDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PDF_DB_NAME, PDF_DB_VERSION);
    request.addEventListener("upgradeneeded", () => {
      if (!request.result.objectStoreNames.contains(PDF_STORE_NAME)) {
        request.result.createObjectStore(PDF_STORE_NAME, { keyPath: "key" });
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function withPdfStore(mode, run) {
  const database = await openPdfDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(PDF_STORE_NAME, mode);
      const store = transaction.objectStore(PDF_STORE_NAME);
      let result;
      try {
        result = run(store);
      } catch (error) {
        reject(error);
        return;
      }
      transaction.addEventListener("complete", () => resolve(result));
      transaction.addEventListener("abort", () => reject(transaction.error));
      transaction.addEventListener("error", () => reject(transaction.error));
    });
  } finally {
    database.close();
  }
}

function readPersistedPdfs() {
  return withPdfStore("readonly", (store) => new Promise((resolve, reject) => {
    const request = store.getAll();
    request.addEventListener("success", () => resolve(request.result || []));
    request.addEventListener("error", () => reject(request.error));
  }));
}

function persistPdfDocument(file, document) {
  const records = document.records.map((record) => ({
    id: record.id,
    fileName: record.fileName,
    relativePath: record.relativePath,
    pageNumber: record.pageNumber,
    text: record.text,
    marks: record.marks,
    pieces: record.pieces,
    category: record.category
  }));
  return withPdfStore("readwrite", (store) => {
    store.put({
      key: document.key,
      fileName: document.fileName,
      relativePath: document.relativePath,
      size: file.size,
      lastModified: file.lastModified,
      type: file.type || "application/pdf",
      blob: file.slice(0, file.size, file.type || "application/pdf"),
      category: document.category,
      records
    });
  });
}

function clearPersistedPdfs() {
  return withPdfStore("readwrite", (store) => store.clear());
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function currentRow() {
  return state.rows[state.markIndex];
}

function currentConfig() {
  return PARTS[state.part] || PARTS.p01;
}

function currentFields() {
  return currentConfig().fields;
}

function currentColumns() {
  if (state.part === "p01") return P01_COLUMNS;
  return [
    { letter: "A", label: "CB-ID", unit: "#" },
    { letter: "F", label: "Mark", unit: "#" },
    ...currentFields().map((item) => ({
      letter: item.column,
      label: item.label,
      unit: item.unit,
      field: item.key
    }))
  ];
}

function currentField() {
  return currentFields()[state.fieldIndex];
}

function decisionKey(row = currentRow(), field = currentField()) {
  return `${state.part}:${row.mark}:${field.key}`;
}

function currentDecision() {
  if (currentRow()?.pdfOnly) return null;
  return state.decisions[decisionKey()] || null;
}

function expectedValue(row = currentRow(), field = currentField()) {
  return row.values[field.column] ?? row.expected?.[field.key] ?? "-";
}

function nearlyEqual(actual, expected, tolerance = 0.01) {
  return Number.isFinite(actual) &&
    Number.isFinite(expected) &&
    Math.abs(actual - expected) <= tolerance;
}

function greatestCommonDivisor(left, right) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function formatNumber(value, precision = 3) {
  return Number(value.toFixed(precision)).toString();
}

function formatConstructionLength(totalInches) {
  if (!Number.isFinite(totalInches)) return "Not found";
  const totalSixteenths = Math.round(totalInches * 16);
  const feet = Math.floor(totalSixteenths / 192);
  const remainder = totalSixteenths - feet * 192;
  const inches = Math.floor(remainder / 16);
  const numerator = remainder % 16;
  let fraction = "";
  if (numerator) {
    const divisor = greatestCommonDivisor(numerator, 16);
    fraction = ` ${numerator / divisor}/${16 / divisor}`;
  }
  return `${feet}'-${inches}${fraction}"`;
}

function formatDrawingDimension(totalInches) {
  if (!Number.isFinite(totalInches)) return "Not found";
  if (Math.abs(totalInches) >= 12) return formatConstructionLength(totalInches);
  const totalSixteenths = Math.round(totalInches * 16);
  const whole = Math.floor(totalSixteenths / 16);
  const numerator = Math.abs(totalSixteenths % 16);
  let fraction = "";
  if (numerator) {
    const divisor = greatestCommonDivisor(numerator, 16);
    fraction = `${numerator / divisor}/${16 / divisor}`;
  }
  return `${[whole || "", fraction].filter(Boolean).join(" ") || "0"}"`;
}

function formatExpected(raw, role) {
  if (raw === null || raw === undefined || raw === "") return "-";
  if (role === "qty") return formatNumber(Number(raw), 3);
  if (role === "length" || role === "width" || role === "thickness") {
    return Number.isFinite(Number(raw)) ? formatNumber(Number(raw), 4) : String(raw);
  }
  return String(raw);
}

function buildRows(part = state.part) {
  const config = PARTS[part] || PARTS.p01;
  const marks = Array.isArray(window.PARTS_REVIEW_WORKBOOK?.full)
    ? window.PARTS_REVIEW_WORKBOOK.full
    : [];
  if (!marks.length) {
    const pdfRows = buildPdfRows(config);
    if (pdfRows.length) return pdfRows;
    return part === "p01" && !state.pageIndex.length ? SAMPLE_ROWS : [];
  }

  return marks
    .filter((mark) => part === "p01"
      ? mark.casing?.length != null
      : (config.presence ? config.presence(mark) : true))
    .map((mark, index) => {
      if (part === "p01") {
        return {
          mark: String(mark.mark),
          row: index + 9,
          source: mark,
          expected: {
            qty: mark.casing.qty,
            type: mark.casing.type,
            length: mark.casing.length,
            height: mark.casing.height,
            width: mark.casing.width,
            thickness: mark.casing.thickness
          },
          values: {
            A: mark.cbId,
            F: String(mark.mark),
            G: formatExpected(mark.casing.qty, "qty"),
            H: mark.casing.type,
            I: formatExpected(mark.casing.length, "length"),
            J: formatConstructionLength(mark.casing.length),
            O: formatExpected(mark.casing.height, "height"),
            P: formatExpected(mark.casing.width, "width"),
            Q: formatExpected(mark.casing.thickness, "thickness")
          }
        };
      }

      const expected = {};
      const values = { A: mark.cbId, F: String(mark.mark) };
      config.fields.forEach((item) => {
        const raw = item.get(mark);
        expected[item.key] = raw;
        values[item.column] = formatExpected(raw, item.role);
      });
      return {
        mark: String(mark.mark),
        row: index + 9,
        source: mark,
        expected,
        values
      };
    });
}

function buildPdfRows(config) {
  const byMark = new Map();
  state.pageIndex
    .filter((record) => isPartRecord(record, config))
    .forEach((record) => {
      record.marks.forEach((mark) => {
        if (!byMark.has(mark)) byMark.set(mark, record);
      });
    });

  return [...byMark.entries()]
    .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
    .map(([mark, record], index) => {
      const values = { A: "-", F: mark };
      const expected = {};
      config.fields.forEach((item) => {
        values[item.column] = "-";
        expected[item.key] = null;
      });
      return {
        mark,
        row: index + 1,
        source: null,
        sourceRecord: record,
        pdfOnly: true,
        expected,
        values
      };
    });
}

function normalizeDrawingText(value) {
  return String(value || "")
    .replace(/[â€™â€²’′]/g, "'")
    .replace(/[â€â€³”″]/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDimension(value) {
  const cleaned = normalizeDrawingText(value)
    .replace(/"{1,2}/g, "")
    .replace(/'{2}/g, "")
    .replace(/\s*\/\s*/g, "/")
    .trim();
  const feet = /^(\d+)\s*'\s*-?\s*(.*)$/.exec(cleaned);
  if (feet) return Number(feet[1]) * 12 + parseDimension(feet[2] || "0");
  return cleaned.split(/\s+/).reduce((total, token) => {
    const fraction = /^(\d+)\/(\d+)$/.exec(token);
    if (fraction) return total + Number(fraction[1]) / Number(fraction[2]);
    const number = Number(token);
    return Number.isFinite(number) ? total + number : Number.NaN;
  }, 0);
}

function parsePlateMaterial(record) {
  if (!record) return null;
  if (record.plateMaterial !== undefined) return record.plateMaterial;
  const text = normalizeDrawingText(record.text);
  const match = /\(\s*(\d+)\s*\)\s+(?:PIM\s+)?PL\s*(.+?)(?=\s+(?:PROJECT|CONTRACT|DRAWING|SITE|MARKED|DRWG|CHK'D|REVISION|AS\s+DRAWN)\b)/i.exec(text);
  if (!match) {
    record.plateMaterial = null;
    return null;
  }
  const dimensions = match[2].split(/\s+X\s+/i);
  if (dimensions.length < 3) {
    record.plateMaterial = null;
    return null;
  }
  record.plateMaterial = {
    totalQty: Number(match[1]),
    raw: {
      thickness: dimensions[0],
      width: dimensions[1],
      length: dimensions.slice(2).join(" X ")
    },
    thickness: parseDimension(dimensions[0]),
    width: parseDimension(dimensions[1]),
    length: parseDimension(dimensions.slice(2).join(" X "))
  };
  return record.plateMaterial;
}

function parseP01Material(record) {
  if (!record) return null;
  if (record.p01Material !== undefined) return record.p01Material;
  const text = String(record.text || "")
    .replace(/[’′]/g, "'")
    .replace(/[”″]/g, "\"")
    .replace(/\s+/g, " ");
  const header = /HSS\s*([0-9.]+)\s*X\s*([0-9.]+)\s*X\s*([0-9.]+)\s*X\s*/i.exec(text);
  if (!header) {
    record.p01Material = null;
    return null;
  }

  const lengthSource = text.slice(header.index + header[0].length, header.index + header[0].length + 42);
  const fractionLength =
    /(\d+)\s*'\s*-\s*(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)/.exec(lengthSource);
  const wholeLength = fractionLength
    ? null
    : /(\d+)\s*'\s*-\s*(\d+)/.exec(lengthSource);
  let lengthInches = Number.NaN;
  if (fractionLength) {
    lengthInches =
      Number(fractionLength[1]) * 12 +
      Number(fractionLength[2] || 0) +
      Number(fractionLength[3]) / Number(fractionLength[4]);
  } else if (wholeLength) {
    lengthInches = Number(wholeLength[1]) * 12 + Number(wholeLength[2]);
  }

  record.p01Material = {
    height: Number(header[1]),
    width: Number(header[2]),
    thickness: Number(header[3]),
    lengthInches
  };
  return record.p01Material;
}

function pdfOnlyCandidate(row, field, record) {
  if (!record) return `${currentConfig().label} drawing not found`;
  if (field.key === "qty") {
    const qty = parseMarkQuantity(record, row.mark);
    return Number.isFinite(qty) ? `${qty} @ ${row.mark}A` : "Quantity not found";
  }

  if (state.part === "p01") {
    const material = parseP01Material(record);
    if (!material) return "HSS material not found";
    const candidates = {
      type: `HSS ${formatNumber(material.height)} X ${formatNumber(material.width)} X ${formatNumber(material.thickness)}`,
      length: formatConstructionLength(material.lengthInches),
      height: `${formatNumber(material.height)}"`,
      width: `${formatNumber(material.width)}"`,
      thickness: formatNumber(material.thickness)
    };
    return candidates[field.key] || "Found on drawing";
  }

  if (["stopLength", "xtp", "profileRise", "smallEndWidth"].includes(field.role)) {
    const dimension = parseP08ProfileDimensions(record)?.[field.role];
    return Number.isFinite(dimension?.value)
      ? formatDrawingDimension(dimension.value)
      : "Profile dimension not found";
  }

  if (field.role === "text") return "Found on drawing";
  const material = parsePlateMaterial(record);
  const found = material?.[field.role];
  if (!Number.isFinite(found)) return `Unparsed: ${material?.raw?.[field.role] || "not found"}`;
  return field.role === "length"
    ? formatConstructionLength(found)
    : `${formatNumber(found, 4)}"`;
}

function parseMarkQuantity(record, mark) {
  if (!record) return Number.NaN;
  const match = new RegExp(
    `(?:\\(\\s*)?(\\d+)(?:\\s*\\))?\\s*@\\s*${mark}A\\b`,
    "i"
  ).exec(record.text || "");
  return match ? Number(match[1]) : Number.NaN;
}

function comparisonResult(found, expected, candidate, description) {
  if (!Number.isFinite(found)) {
    return {
      status: "fail",
      candidate: candidate || "Not found",
      reason: `${description} was not found in the selected part drawing.`
    };
  }
  const passed = nearlyEqual(found, expected, 0.065);
  return {
    status: passed ? "pass" : "fail",
    candidate,
    reason: passed
      ? `${description} matches the spreadsheet.`
      : `${description} expected ${expected}, found ${candidate}.`
  };
}

function evaluateField(row = currentRow(), field = currentField(), record = resolveRecord(row)) {
  if (row.pdfOnly) {
    return {
      status: "open",
      candidate: pdfOnlyCandidate(row, field, record),
      reason: `PDF categorized as ${currentConfig().label}. Load the Excel workbook to compare it.`
    };
  }

  if (state.part !== "p01") {
    if (!record) {
      return {
        status: "fail",
        candidate: `${currentConfig().label} for mark ${row.mark} not found`,
        reason: `No indexed ${currentConfig().label} page contains mark ${row.mark}.`
      };
    }
    if (field.role === "qty") {
      const found = parseMarkQuantity(record, row.mark);
      return comparisonResult(
        found,
        Number(row.expected[field.key]),
        Number.isFinite(found) ? `${found} @ ${row.mark}A` : "Not found",
        "Quantity"
      );
    }
    if (field.role === "text") {
      const expected = normalizeDrawingText(row.expected[field.key])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");
      const drawing = normalizeDrawingText(record.text)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");
      const passed = Boolean(expected) && drawing.includes(expected);
      return {
        status: passed ? "pass" : "fail",
        candidate: passed ? String(row.expected[field.key]) : "Not found",
        reason: passed
          ? `${field.label} matches the spreadsheet.`
          : `${field.label} ${row.expected[field.key]} was not found in the drawing.`
      };
    }

    if (["stopLength", "xtp", "profileRise", "smallEndWidth"].includes(field.role)) {
      const dimension = parseP08ProfileDimensions(record)?.[field.role];
      const found = dimension?.value;
      return comparisonResult(
        found,
        Number(row.expected[field.key]),
        Number.isFinite(found) ? formatDrawingDimension(found) : "Not found",
        field.label
      );
    }

    const material = parsePlateMaterial(record);
    if (!material) {
      return {
        status: "fail",
        candidate: "Material title not found",
        reason: "The plate material title could not be extracted from this page."
      };
    }
    const found = material[field.role];
    const candidate = Number.isFinite(found)
      ? field.role === "length"
        ? formatConstructionLength(found)
        : `${formatNumber(found, 4)}"`
      : `Unparsed: ${material.raw?.[field.role] || "not found"}`;
    return comparisonResult(
      found,
      Number(row.expected[field.key]),
      candidate,
      field.label
    );
  }

  if (!record) {
    return {
      status: "fail",
      candidate: `P01 for mark ${row.mark} not found`,
      reason: `No indexed P01 page contains mark ${row.mark}.`
    };
  }

  const material = parseP01Material(record);
  if (field.key === "qty") {
    const found = parseMarkQuantity(record, row.mark);
    return comparisonResult(
      found,
      Number(row.values.G),
      Number.isFinite(found) ? `${found} @ ${row.mark}A` : "Not found",
      "Quantity"
    );
  }

  if (!material) {
    return {
      status: "fail",
      candidate: "HSS material not found",
      reason: "The HSS material description could not be extracted from this page."
    };
  }

  if (field.key === "type") {
    const candidate =
      `HSS ${formatNumber(material.height)} X ${formatNumber(material.width)} X ${formatNumber(material.thickness)}`;
    const passed =
      nearlyEqual(material.height, Number(row.values.O)) &&
      nearlyEqual(material.width, Number(row.values.P)) &&
      nearlyEqual(material.thickness, Number(row.values.Q));
    return {
      status: passed ? "pass" : "fail",
      candidate,
      reason: passed
        ? "HSS material matches the spreadsheet."
        : `HSS material expected ${row.values.H}, found ${candidate}.`
    };
  }

  const definitions = {
    length: {
      found: material.lengthInches,
      expected: Number(row.values.I),
      candidate: formatConstructionLength(material.lengthInches),
      description: "Overall length"
    },
    height: {
      found: material.height,
      expected: Number(row.values.O),
      candidate: `${formatNumber(material.height)}"`,
      description: "HSS height"
    },
    width: {
      found: material.width,
      expected: Number(row.values.P),
      candidate: `${formatNumber(material.width)}"`,
      description: "HSS width"
    },
    thickness: {
      found: material.thickness,
      expected: Number(row.values.Q),
      candidate: formatNumber(material.thickness),
      description: "Wall thickness"
    }
  };
  const definition = definitions[field.key];
  return comparisonResult(
    definition.found,
    definition.expected,
    definition.candidate,
    definition.description
  );
}

function candidateValue(row = currentRow(), field = currentField()) {
  if (!state.pageIndex.length) return "Waiting for PDF";
  return evaluateField(row, field).candidate;
}

function setPdfStatus(message, tone = "") {
  els.pdfStatus.textContent = message;
  els.pdfStatus.className = tone ? `is-${tone}` : "";
}

function uniqueMatches(text, expression, group = 0) {
  return [...new Set(
    [...text.matchAll(expression)].map((match) => match[group])
  )];
}

function extractMarks(text, fileName = "") {
  const textMarks = uniqueMatches(
    text,
    /(?:@|BRACE(?:\s+MK)?|MARK)\s*[-:#]?\s*(\d{4})A?\b/gi,
    1
  );
  const fileMarks = uniqueMatches(fileName, /\bBRACE\s+(\d{4})\b/gi, 1);
  return [...new Set([...textMarks, ...fileMarks])];
}

function extractPieces(text) {
  return uniqueMatches(
    text,
    /(?:^|[^a-z0-9])(p(?:0[1-9]|1[0-5])\d{2}(?:-\d+)?)(?=$|[^a-z0-9])/gi,
    1
  ).map((piece) => piece.toLowerCase());
}

function pathCategory(label) {
  if (/(?:^|[\\/])(?:\d{4}[^\\/]*\s+)?brace pdf(?:[\\/]|$)|^brace\s+\d{4}\.pdf$/i.test(label)) {
    return "brace";
  }
  if (/(?:^|[\\/])(?:\d{4}[^\\/]*\s+)?pim pdf(?:[\\/]|$)/i.test(label)) return "pim";
  if (/(?:^|[\\/])(?:\d{4}[^\\/]*\s+)?parts pdf(?:[\\/]|$)/i.test(label)) return "parts";
  return "";
}

function classifyPage(label, text, pieces) {
  if (/inventory schedule/i.test(label)) return "other";
  const fromPath = pathCategory(label);
  if (fromPath) return fromPath;
  if (/COREBRACE SHOP DRAWING/i.test(text) && /BRACE(?:\s+MK)?\s*\d{4}/i.test(text)) {
    return "brace";
  }
  if (pieces.some((piece) => /^p(?:0[6-9]|1[0-4])/.test(piece))) return "pim";
  if (pieces.some((piece) => /^p(?:0[1-5]|15)/.test(piece))) return "parts";
  return "other";
}

function expectedPdfCategory(config = currentConfig()) {
  return /^p(?:0[6-9]|1[0-4])$/i.test(config.prefix) ? "pim" : "parts";
}

function isPartRecord(record, config = currentConfig()) {
  return record.category === expectedPdfCategory(config) &&
    record.pieces.some((piece) =>
      new RegExp(`^${config.prefix}\\d{2}(?:-\\d+)?$`, "i").test(piece)
    );
}

function recordScore(record, mark) {
  let score = 0;
  if (record.marks.includes(mark)) score += 100;
  if (isPartRecord(record)) score += 80;
  if (record.category === expectedPdfCategory()) score += 60;
  if (new RegExp(`^${currentConfig().prefix}\\d{2}(?:-\\d+)?(?:_p\\d+)?(?:-\\d+)?\\.pdf$`, "i").test(record.fileName)) score += 30;
  if (!/^combined\.pdf$/i.test(record.fileName)) score += 10;
  return score;
}

function resolveRecord(row = currentRow()) {
  return state.pageIndex
    .filter((record) => record.marks.includes(row.mark) && isPartRecord(record))
    .sort((a, b) => recordScore(b, row.mark) - recordScore(a, row.mark))[0] || null;
}

function categoryLabel(category) {
  return { brace: "Brace", parts: "Parts", pim: "PIM", other: "Other" }[category] || "Other";
}

function displayRecordName(record) {
  const path = record.relativePath || record.fileName;
  return `${categoryLabel(record.category)} / ${path} / page ${record.pageNumber}`;
}

function updateIndexSummary(tone = "ready") {
  const fileCount = state.documents.length;
  const pageCount = state.pageIndex.length;
  const marks = [...new Set(state.pageIndex.flatMap((record) => record.marks))];
  const counts = { brace: 0, parts: 0, pim: 0, other: 0 };
  state.pageIndex.forEach((record) => {
    if (record.category in counts) counts[record.category] += 1;
  });
  els.pdfName.textContent = fileCount
    ? `${fileCount} PDF${fileCount === 1 ? "" : "s"} / ${pageCount} page${pageCount === 1 ? "" : "s"}`
    : "No PDF loaded";
  setPdfStatus(
    fileCount ? `${marks.length} marks indexed / saved in this browser` : "Add PDF files or select a project folder.",
    fileCount ? tone : ""
  );
  els.pdfBreakdown.hidden = !fileCount;
  Object.entries(counts).forEach(([kind, count]) => {
    const item = els.pdfBreakdown.querySelector(`[data-kind="${kind}"]`);
    if (item) item.textContent = `${categoryLabel(kind)} ${count}`;
  });
  state.pdfMarks = marks;
  updatePartTabCounts();
}

function updatePartTabCounts() {
  els.tabs.querySelectorAll("[data-auto-part]").forEach((button) => {
    const config = PARTS[button.dataset.autoPart];
    const count = config
      ? state.pageIndex.filter((record) => isPartRecord(record, config)).length
      : 0;
    button.dataset.pdfCount = count ? String(count) : "";
    button.title = count
      ? `${count} ${config.label} PDF page${count === 1 ? "" : "s"} indexed`
      : `No ${config?.label || "part"} PDF pages indexed`;
  });
}

function setLoadDisabled(disabled) {
  els.upload.disabled = disabled;
  els.folder.disabled = disabled;
  els.clearPdfs.disabled = disabled;
  els.checkAll.disabled = disabled || !state.pageIndex.length;
}

function fileKey(file) {
  return [
    file.webkitRelativePath || file.name,
    file.size,
    file.lastModified
  ].join(":");
}

function nextFrame() {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

async function loadPdfFiles(fileList) {
  const files = Array.from(fileList || []).filter((file) => /\.pdf$/i.test(file.name));
  if (!files.length) {
    setPdfStatus("Choose one or more PDF files.", "error");
    return;
  }

  const existing = new Set(state.documents.map((document) => document.key));
  const pending = files.filter((file) => !existing.has(fileKey(file)));
  const duplicateCount = files.length - pending.length;
  if (!pending.length) {
    updateIndexSummary("warning");
    setPdfStatus(
      `${duplicateCount} duplicate PDF${duplicateCount === 1 ? "" : "s"} skipped; nothing new was added.`,
      "warning"
    );
    return;
  }

  const failures = [];
  const persistenceFailures = [];
  setLoadDisabled(true);
  for (let fileIndex = 0; fileIndex < pending.length; fileIndex += 1) {
    const file = pending[fileIndex];
    const relativePath = file.webkitRelativePath || "";
    const label = relativePath || file.name;
    setPdfStatus(`Reading ${fileIndex + 1} of ${pending.length}: ${label}`, "loading");
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const records = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join(" ");
        const pieces = extractPieces(text);
        records.push({
          id: `${fileKey(file)}:${pageNumber}`,
          fileName: file.name,
          relativePath,
          pdf,
          pageNumber,
          text,
          textItems: textContent.items
            .filter((item) => item.str && Array.isArray(item.transform))
            .map((item) => ({
              str: item.str,
              transform: item.transform,
              width: item.width,
              height: item.height
            })),
          marks: extractMarks(text, file.name),
          pieces,
          category: classifyPage(label, text, pieces)
        });
        if (pageNumber % 10 === 0 || pageNumber === pdf.numPages) {
          setPdfStatus(
            `Indexing ${fileIndex + 1} of ${pending.length}: page ${pageNumber} of ${pdf.numPages}`,
            "loading"
          );
          await nextFrame();
        }
      }
      const categoryCounts = records.reduce((counts, record) => {
        counts[record.category] = (counts[record.category] || 0) + 1;
        return counts;
      }, {});
      const documentCategory = Object.entries(categoryCounts)
        .filter(([category]) => category !== "other")
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "other";
      records.forEach((record) => {
        if (record.category === "other") record.category = documentCategory;
      });
      const document = {
        key: fileKey(file),
        fileName: file.name,
        relativePath,
        pdf,
        category: documentCategory,
        records
      };
      state.documents.push(document);
      state.pageIndex.push(...records);
      try {
        await persistPdfDocument(file, document);
      } catch (error) {
        console.warn(`Could not save ${label} for the next session.`, error);
        persistenceFailures.push(label);
      }
    } catch (error) {
      console.error(`Could not index ${label}.`, error);
      failures.push(label);
    }
  }

  setLoadDisabled(false);
  updateIndexSummary(failures.length || persistenceFailures.length ? "warning" : "ready");
  state.rows = buildRows(state.part);
  state.markIndex = Math.min(state.markIndex, Math.max(0, state.rows.length - 1));
  state.fieldIndex = 0;
  render();
  if (failures.length) {
    setPdfStatus(
      `${failures.length} PDF${failures.length === 1 ? "" : "s"} failed; the rest are ready.`,
      "warning"
    );
  } else if (persistenceFailures.length) {
    setPdfStatus(
      `${pending.length} PDF${pending.length === 1 ? "" : "s"} loaded, but ${persistenceFailures.length} could not be saved for refresh.`,
      "warning"
    );
  } else if (duplicateCount) {
    setPdfStatus(
      `${pending.length} new PDF${pending.length === 1 ? "" : "s"} added; ${duplicateCount} duplicate${duplicateCount === 1 ? "" : "s"} skipped.`,
      "warning"
    );
  }
}

async function restorePdfLibrary() {
  setLoadDisabled(true);
  setPdfStatus("Restoring saved PDFs...", "loading");
  try {
    const savedDocuments = await readPersistedPdfs();
    if (!savedDocuments.length) {
      updateIndexSummary();
      return;
    }

    const failures = [];
    for (let index = 0; index < savedDocuments.length; index += 1) {
      const saved = savedDocuments[index];
      setPdfStatus(
        `Restoring ${index + 1} of ${savedDocuments.length}: ${saved.relativePath || saved.fileName}`,
        "loading"
      );
      try {
        const data = new Uint8Array(await saved.blob.arrayBuffer());
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const records = (saved.records || []).map((record) => ({
          ...record,
          pdf
        }));
        state.documents.push({
          key: saved.key,
          fileName: saved.fileName,
          relativePath: saved.relativePath || "",
          pdf,
          category: saved.category || "other",
          records
        });
        state.pageIndex.push(...records);
      } catch (error) {
        console.warn(`Could not restore ${saved.fileName}.`, error);
        failures.push(saved.fileName);
      }
      await nextFrame();
    }

    updateIndexSummary(failures.length ? "warning" : "ready");
    state.rows = buildRows(state.part);
    state.markIndex = Math.min(state.markIndex, Math.max(0, state.rows.length - 1));
    state.fieldIndex = 0;
    render();
    if (failures.length) {
      setPdfStatus(
        `${state.documents.length} saved PDF${state.documents.length === 1 ? "" : "s"} restored; ${failures.length} failed.`,
        "warning"
      );
    }
  } catch (error) {
    console.warn("Could not restore the saved PDF library.", error);
    updateIndexSummary("warning");
    setPdfStatus("Saved PDFs could not be restored. You can upload them again.", "warning");
  } finally {
    setLoadDisabled(false);
  }
}

async function syncActivePage(force = false) {
  const record = resolveRecord();
  if (!record) {
    state.activeRecord = null;
    state.pdf = null;
    state.page = null;
    state.viewport = null;
    els.stage.hidden = true;
    els.drop.hidden = false;
    els.highlight.hidden = true;
    els.pdfPanelTitle.textContent = state.pageIndex.length
      ? `No ${currentConfig().label} page for mark ${currentRow().mark}`
      : `${currentConfig().label} drawing`;
    return;
  }

  if (!force && state.activeRecord?.id === record.id && state.page) {
    focusEvidence();
    return;
  }

  const request = ++state.activeRequest;
  const page = await record.pdf.getPage(record.pageNumber);
  if (request !== state.activeRequest) return;
  if (!record.textItems?.length) {
    const textContent = await page.getTextContent();
    if (request !== state.activeRequest) return;
    record.textItems = textContent.items
      .filter((item) => item.str && Array.isArray(item.transform))
      .map((item) => ({
        str: item.str,
        transform: item.transform,
        width: item.width,
        height: item.height
      }));
  }
  state.activeRecord = record;
  state.pdf = record.pdf;
  state.page = page;
  state.pdfName = record.relativePath || record.fileName;
  els.pdfPanelTitle.textContent = displayRecordName(record);
  els.drop.hidden = true;
  els.stage.hidden = false;
  await renderPage();
  autoCheckCurrentMark();
  renderAnnotations();
  renderLog();
  renderSummary();
  const field = currentField();
  els.hint.textContent =
    `${field.hint} Page ${record.pageNumber} of ${record.pdf.numPages} in ${record.fileName}.`;
}

async function renderPage() {
  if (!state.page) return;
  if (state.renderTask) {
    try {
      state.renderTask.cancel();
      await state.renderTask.promise;
    } catch (error) {
      if (error?.name !== "RenderingCancelledException") console.warn(error);
    }
  }

  const viewport = state.page.getViewport({ scale: state.scale });
  const outputScale = Math.min(window.devicePixelRatio || 1, 2);
  const context = els.canvas.getContext("2d", { alpha: false });
  els.canvas.width = Math.floor(viewport.width * outputScale);
  els.canvas.height = Math.floor(viewport.height * outputScale);
  els.canvas.style.width = `${Math.floor(viewport.width)}px`;
  els.canvas.style.height = `${Math.floor(viewport.height)}px`;
  els.stage.style.width = `${Math.floor(viewport.width)}px`;
  els.stage.style.height = `${Math.floor(viewport.height)}px`;
  state.viewport = viewport;
  els.zoomValue.textContent = `${Math.round(state.scale * 100)}%`;

  state.renderTask = state.page.render({
    canvasContext: context,
    viewport,
    transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0]
  });
  await state.renderTask.promise;
  state.renderTask = null;
  focusEvidence(false);
}

function renderAnnotations() {
  els.annotations.replaceChildren();
  if (!state.viewport || !state.activeRecord) return;

  const row = currentRow();
  const width = state.viewport.width;
  const height = state.viewport.height;
  const groups = new Map();
  currentFields().forEach((field) => {
    const box = evidenceBox(row, field, state.activeRecord);
    const result = evaluateField(row, field, state.activeRecord);
    const decision = state.decisions[decisionKey(row, field)];
    const status = decision?.status || result.status || "open";
    const key = [box.x, box.y, box.w, box.h]
      .map((value) => Number(value).toFixed(3))
      .join(":");
    if (!groups.has(key)) {
      groups.set(key, { box, fields: [], statuses: [], selected: false });
    }
    const group = groups.get(key);
    group.fields.push({
      label: field.label,
      candidate: decision?.candidate || result.candidate
    });
    group.statuses.push(status);
    group.selected ||= field.key === currentField().key;
  });

  groups.forEach((group) => {
    const status = group.statuses.includes("fail")
      ? "fail"
      : group.statuses.every((item) => item === "pass")
        ? "pass"
        : "open";
    const { box } = group;
    const annotation = document.createElement("div");
    annotation.className = `auto-pdf-annotation is-${status}`;
    annotation.classList.toggle("is-selected", group.selected);
    annotation.style.left = `${box.x * width}px`;
    annotation.style.top = `${box.y * height}px`;
    annotation.style.width = `${box.w * width}px`;
    annotation.style.height = `${box.h * height}px`;
    const description = group.fields
      .map((item) => `${item.label} ${item.candidate}`)
      .join(" | ");
    annotation.title = `${status.toUpperCase()}: ${description}`;
    annotation.setAttribute("aria-label", `${status}: ${description}`);

    const badge = document.createElement("span");
    badge.className = "auto-pdf-annotation-badge";
    badge.textContent = status === "pass" ? "P" : status === "fail" ? "F" : "?";
    const label = document.createElement("span");
    label.className = "auto-pdf-annotation-label";
    label.textContent = description;
    annotation.append(badge, label);
    els.annotations.append(annotation);
  });
}

function groupTextLines(items) {
  const lines = [];
  [...(items || [])]
    .sort((left, right) => {
      const leftBox = displayTextGeometry(left);
      const rightBox = displayTextGeometry(right);
      return leftBox.y - rightBox.y || leftBox.x - rightBox.x;
    })
    .forEach((item) => {
      const geometry = displayTextGeometry(item);
      const baseline = geometry.y;
      const tolerance = Math.max(3, state.viewport?.scale * 3 || 3);
      let line = lines.find((candidate) => Math.abs(candidate.baseline - baseline) <= tolerance);
      if (!line) {
        line = { baseline, items: [] };
        lines.push(line);
      }
      line.items.push(item);
    });
  lines.forEach((line) => {
    line.items.sort((left, right) =>
      displayTextGeometry(left).x - displayTextGeometry(right).x
    );
    line.text = normalizeDrawingText(line.items.map((item) => item.str).join(" "));
  });
  return lines;
}

function textItemsBox(items) {
  if (!state.viewport || !items?.length) return null;
  const rectangles = items.map((item) => {
    const transform = pdfjsLib.Util.transform(state.viewport.transform, item.transform);
    const fontHeight = Math.max(
      Math.hypot(transform[2], transform[3]),
      Number(item.height || 0) * state.viewport.scale,
      8
    );
    const itemWidth = Math.max(Number(item.width || 0) * state.viewport.scale, fontHeight * 0.5);
    return {
      left: transform[4],
      top: transform[5] - fontHeight,
      right: transform[4] + itemWidth,
      bottom: transform[5] + fontHeight * 0.18
    };
  });
  const padding = Math.max(5, state.viewport.scale * 3);
  const left = Math.max(0, Math.min(...rectangles.map((box) => box.left)) - padding);
  const top = Math.max(0, Math.min(...rectangles.map((box) => box.top)) - padding);
  const right = Math.min(
    state.viewport.width,
    Math.max(...rectangles.map((box) => box.right)) + padding
  );
  const bottom = Math.min(
    state.viewport.height,
    Math.max(...rectangles.map((box) => box.bottom)) + padding
  );
  return {
    x: left / state.viewport.width,
    y: top / state.viewport.height,
    w: Math.max(0.02, (right - left) / state.viewport.width),
    h: Math.max(0.025, (bottom - top) / state.viewport.height)
  };
}

function displayTextGeometry(item) {
  const transform = state.viewport
    ? pdfjsLib.Util.transform(state.viewport.transform, item.transform)
    : item.transform;
  return {
    x: transform[4],
    y: transform[5],
    width: Number(item.width || 0) * (state.viewport?.scale || 1),
    height: Math.max(Math.hypot(transform[2], transform[3]), 1),
    angle: Math.atan2(transform[1], transform[0]) * 180 / Math.PI
  };
}

function textItemFontSize(item) {
  return displayTextGeometry(item).height;
}

function textItemAngle(item) {
  return displayTextGeometry(item).angle;
}

function clusterDimensionItems(items, axis = "x", maximumGap = 24) {
  const position = (item) => displayTextGeometry(item)[axis];
  const sorted = [...items].sort((left, right) => position(left) - position(right));
  const clusters = [];
  sorted.forEach((item) => {
    const itemPosition = position(item);
    const cluster = clusters.at(-1);
    if (!cluster || itemPosition - cluster.last > maximumGap * (state.viewport?.scale || 1)) {
      clusters.push({ items: [item], last: itemPosition });
    } else {
      cluster.items.push(item);
      cluster.last = itemPosition;
    }
  });
  return clusters.map((cluster) => cluster.items);
}

function parseStackedDimension(items) {
  const numeric = items.flatMap((item) =>
    [...String(item.str || "").matchAll(/\d+/g)].map((match) => ({
      value: Number(match[0]),
      size: textItemFontSize(item),
      x: displayTextGeometry(item).x,
      y: displayTextGeometry(item).y,
      angle: textItemAngle(item)
    }))
  );
  if (!numeric.length) return Number.NaN;
  const maximumSize = Math.max(...numeric.map((token) => token.size));
  const wholeTokens = numeric.filter((token) => token.size >= maximumSize * 0.82);
  const fractionTokens = numeric.filter((token) => token.size < maximumSize * 0.82);
  const whole = Number(
    wholeTokens
      .sort((left, right) => {
        const vertical = Math.abs(left.angle) > 45;
        return vertical ? left.y - right.y : left.x - right.x || left.y - right.y;
      })
      .map((token) => token.value)
      .join("") || 0
  );
  if (fractionTokens.length < 2) return whole;
  const fractions = fractionTokens.map((token) => token.value).sort((left, right) => left - right);
  const numerator = fractions[0];
  const denominator = fractions.at(-1);
  return denominator ? whole + numerator / denominator : whole;
}

function parseVerticalStackedDimension(items) {
  const numeric = items.flatMap((item) =>
    [...String(item.str || "").matchAll(/\d+/g)].map((match) => ({
      value: Number(match[0]),
      y: displayTextGeometry(item).y
    }))
  ).sort((left, right) => left.y - right.y);
  if (!numeric.length) return Number.NaN;
  if (numeric.length === 1) return numeric[0].value;
  const denominator = numeric[0].value;
  const numerator = numeric.at(-1).value;
  const whole = Number(numeric.slice(1, -1).map((token) => token.value).join("") || 0);
  return denominator ? whole + numerator / denominator : whole;
}

function parseP08ProfileDimensions(record) {
  if (!record?.textItems?.length) return null;
  if (record.p08ProfileDimensions) return record.p08ProfileDimensions;
  const piece = record.pieces.find((candidate) => /^p08\d{2}(?:-\d+)?$/i.test(candidate));
  const materialLine = groupTextLines(record.textItems).find((line) => {
    const compact = line.text.toLowerCase().replace(/\s+/g, "");
    return piece && compact.includes(piece.toLowerCase()) && /\b(?:pim\s+)?pl\b/i.test(line.text);
  });
  if (!materialLine) return null;

  const materialLeft = Math.min(...materialLine.items.map((item) => displayTextGeometry(item).x));
  const materialRight = Math.max(...materialLine.items.map((item) =>
    displayTextGeometry(item).x + displayTextGeometry(item).width
  ));
  const materialY = materialLine.baseline;
  const scale = state.viewport?.scale || 1;
  const horizontal = record.textItems.filter((item) => {
    const angle = Math.abs(textItemAngle(item));
    const { x, y } = displayTextGeometry(item);
    return angle < 12 &&
      x < materialRight &&
      x > materialLeft - 12 * scale &&
      y < materialY - 62 * scale &&
      y > materialY - 145 * scale &&
      /[\d"']/i.test(item.str || "") &&
      !/[a-z@()]/i.test(item.str || "");
  });
  const horizontalClusters = clusterDimensionItems(horizontal, "x", 28)
    .filter((items) => items.some((item) => /\d/.test(item.str || "")))
    .sort((left, right) => displayTextGeometry(left[0]).x - displayTextGeometry(right[0]).x);

  const verticalItems = record.textItems.filter((item) => {
    const angle = Math.abs(textItemAngle(item));
    const { x, y } = displayTextGeometry(item);
    return angle > 75 &&
      x > materialLeft - 90 * scale &&
      x < materialRight &&
      y < materialY - 20 * scale &&
      y > materialY - 105 * scale &&
      /[\d"']/i.test(item.str || "") &&
      !/[a-z@()]/i.test(item.str || "");
  });
  const verticalClusters = clusterDimensionItems(verticalItems, "x", 22)
    .filter((items) => items.some((item) => /\d/.test(item.str || "")))
    .sort((left, right) => displayTextGeometry(left[0]).x - displayTextGeometry(right[0]).x);

  const stopItems = horizontalClusters[0] || [];
  const taperItems = horizontalClusters[1] || [];
  const riseItems = verticalClusters.find((items) => displayTextGeometry(items[0]).x < materialLeft) || [];
  const smallEndItems = verticalClusters.find((items) => {
    const x = displayTextGeometry(items[0]).x;
    return x > materialLeft + 120 * scale && x < materialRight - 25 * scale;
  }) || [];
  record.p08ProfileDimensions = {
    stopLength: { value: parseStackedDimension(stopItems), items: stopItems },
    xtp: { value: parseStackedDimension(taperItems), items: taperItems },
    profileRise: { value: parseVerticalStackedDimension(riseItems), items: riseItems },
    smallEndWidth: { value: parseVerticalStackedDimension(smallEndItems), items: smallEndItems }
  };
  return record.p08ProfileDimensions;
}

function detectedEvidenceBox(row, field, record) {
  if (!record?.textItems?.length) return null;
  if (["stopLength", "xtp", "profileRise", "smallEndWidth"].includes(field.role)) {
    const dimension = parseP08ProfileDimensions(record)?.[field.role];
    return dimension?.items?.length ? textItemsBox(dimension.items) : null;
  }
  const lines = groupTextLines(record.textItems);
  const markToken = `${row.mark}a`.toLowerCase();
  let line;
  if (field.role === "qty") {
    line = lines.find((candidate) => {
      const compact = candidate.text.toLowerCase().replace(/\s+/g, "");
      return compact.includes(markToken) && candidate.text.includes("@");
    });
  } else {
    const piece = record.pieces.find((candidate) =>
      new RegExp(`^${currentConfig().prefix}\\d{2}(?:-\\d+)?$`, "i").test(candidate)
    );
    line = lines.find((candidate) => {
      const compact = candidate.text.toLowerCase().replace(/\s+/g, "");
      return piece && compact.includes(piece.toLowerCase()) &&
        /\b(?:pim\s+)?pl\b|\bhss\b/i.test(candidate.text);
    }) || lines.find((candidate) =>
      piece && candidate.text.toLowerCase().replace(/\s+/g, "").includes(piece.toLowerCase())
    );
  }
  return line ? textItemsBox(line.items) : null;
}

function evidenceBox(row, field, record = state.activeRecord) {
  return detectedEvidenceBox(row, field, record) || field.box(row);
}

function focusEvidence(smooth = true) {
  if (!state.viewport || !state.activeRecord) {
    els.annotations.replaceChildren();
    els.highlight.hidden = true;
    return;
  }

  const row = currentRow();
  const field = currentField();
  const box = evidenceBox(row, field);
  const width = state.viewport.width;
  const height = state.viewport.height;
  const left = box.x * width;
  const top = box.y * height;
  const boxWidth = box.w * width;
  const boxHeight = box.h * height;

  els.highlight.hidden = true;
  renderAnnotations();

  window.requestAnimationFrame(() => {
    els.scroll.scrollTo({
      left: Math.max(0, left + boxWidth / 2 - els.scroll.clientWidth / 2),
      top: Math.max(0, top + boxHeight / 2 - els.scroll.clientHeight / 2),
      behavior: smooth ? "smooth" : "auto"
    });
  });
}

function renderSheetGrid() {
  const row = currentRow();
  const field = currentField();
  const columns = currentColumns();
  const fields = currentFields();
  const letters = columns.map((column) => `<th>${column.letter}</th>`).join("");
  const labels = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
  const units = columns.map((column) => `<td>${escapeHtml(column.unit)}</td>`).join("");
  const dataRows = state.rows.map((item) => {
    const cells = columns.map((column) => {
      const selected = item.mark === row.mark && column.letter === field.column;
      const reviewField = fields.find((candidate) => candidate.key === column.field);
      const reviewable = Boolean(reviewField);
      const reviewStatus = reviewField
        ? state.decisions[decisionKey(item, reviewField)]?.status
        : "";
      const classes = [
        selected ? "selected" : "",
        reviewable ? "reviewable" : "",
        reviewStatus ? `is-${reviewStatus}` : ""
      ].filter(Boolean).join(" ");
      return `<td class="${classes}" data-field="${column.field || ""}">${escapeHtml(item.values[column.letter] || "")}</td>`;
    }).join("");
    return `<tr class="${item.mark === row.mark ? "current-row" : ""}"><th>${item.row}</th>${cells}</tr>`;
  }).join("");

  els.sheetGrid.innerHTML = `
    <thead>
      <tr><th></th>${letters}</tr>
      <tr><th>7</th>${labels}</tr>
    </thead>
    <tbody>
      <tr class="unit-row"><th>8</th>${units}</tr>
      ${dataRows}
    </tbody>
  `;

  const selected = els.sheetGrid.querySelector("td.selected");
  const scroller = els.sheetGrid.parentElement;
  if (selected && scroller) {
    window.requestAnimationFrame(() => {
      const scrollerRect = scroller.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();
      const selectedCenter = selectedRect.left + selectedRect.width / 2;
      scroller.scrollTo({
        left: Math.max(
          0,
          scroller.scrollLeft + selectedCenter - scrollerRect.left - scroller.clientWidth / 2
        ),
        behavior: "smooth"
      });
    });
  }
}

function renderLog() {
  const entries = Object.values(state.decisions)
    .filter((entry) => entry.part === state.part)
    .sort((a, b) => b.at.localeCompare(a.at));
  if (!entries.length) {
    els.logList.innerHTML = '<p class="auto-log-empty">No decisions yet.</p>';
    return;
  }
  els.logList.innerHTML = entries.map((entry) => `
    <button class="auto-log-item is-${entry.status}" type="button"
      data-mark="${entry.mark}" data-field="${entry.field}"
      title="${escapeHtml(entry.reason || "")}">
      <span>${entry.status}</span>
      <strong>${entry.mark} / ${escapeHtml(entry.label)}</strong>
      <small>${entry.source === "auto" ? "Auto" : "Manual"} / ${escapeHtml(entry.candidate || "No candidate")}</small>
    </button>
  `).join("");
}

function renderSummary() {
  const pdfOnly = Boolean(currentRow()?.pdfOnly);
  const entries = pdfOnly
    ? []
    : Object.values(state.decisions).filter((entry) => entry.part === state.part);
  const pass = entries.filter((entry) => entry.status === "pass").length;
  const fail = entries.filter((entry) => entry.status === "fail").length;
  const total = state.rows.length * currentFields().length;
  els.passCount.textContent = pass;
  els.failCount.textContent = fail;
  els.openCount.textContent = Math.max(0, total - pass - fail);
  if (state.pageIndex.length && !els.upload.disabled) {
    setPdfStatus(
      entries.length
        ? `${currentConfig().label}: ${pass} pass / ${fail} fail.`
        : `${currentConfig().label} is ready for review.`,
      fail ? "warning" : "ready"
    );
  }
}

function updateWorkbookSummary() {
  const workbook = window.PARTS_REVIEW_WORKBOOK;
  const pdfOnly = Boolean(currentRow()?.pdfOnly);
  els.workbookName.textContent = workbook?.fileName || (pdfOnly ? "No Excel loaded" : "7078-A sample");
  els.workbookStatus.textContent = state.rows.length
    ? pdfOnly
      ? `${currentConfig().label} / ${state.rows.length} mark${state.rows.length === 1 ? "" : "s"} found in PDFs / load Excel to compare`
      : `${currentConfig().sheet} / ${state.rows.length} mark${state.rows.length === 1 ? "" : "s"}`
    : workbook?.fileName
      ? `${currentConfig().sheet} / no ${currentConfig().label} parts in this project`
      : "Load the project Excel file to populate this part.";
  els.sheetTitle.textContent = currentConfig().sheet;
}

function renderEmptyPart() {
  updateWorkbookSummary();
  els.cellAddress.textContent = "-";
  els.markLabel.textContent = `No ${currentConfig().label} parts`;
  els.fieldLabel.textContent = currentConfig().sheet;
  els.expectedValue.textContent = "-";
  els.progress.textContent = `${currentConfig().label} / no parts`;
  els.title.textContent = `No ${currentConfig().label} parts in this project`;
  els.compareExpected.textContent = "-";
  els.compareCandidate.textContent = "No drawing expected";
  els.hint.textContent = window.PARTS_REVIEW_WORKBOOK
    ? `The workbook has no populated ${currentConfig().label} rows.`
    : state.pageIndex.length
      ? `No ${currentConfig().label} pages were found in the uploaded PDFs.`
      : "Load the project Excel file and PDFs to populate this part.";
  els.sheetGrid.innerHTML = `
    <tbody><tr><td class="auto-sheet-empty">
      ${escapeHtml(window.PARTS_REVIEW_WORKBOOK
        ? `No ${currentConfig().label} parts in this project.`
        : state.pageIndex.length
          ? `No ${currentConfig().label} pages were found in the PDF library.`
          : "Load an Excel workbook and PDFs to begin.")}
    </td></tr></tbody>
  `;
  [els.checkAll, els.pass, els.fail, els.prevData, els.nextData, els.prevMark, els.nextMark]
    .forEach((button) => { button.disabled = true; });
  state.activeRecord = null;
  state.page = null;
  state.viewport = null;
  els.stage.hidden = true;
  els.drop.hidden = !state.pageIndex.length;
  els.highlight.hidden = true;
  els.annotations.replaceChildren();
  els.pdfPanelTitle.textContent = `${currentConfig().label} / no parts`;
  renderLog();
  renderSummary();
}

function render() {
  const row = currentRow();
  const field = currentField();
  if (!row || !field) {
    renderEmptyPart();
    return;
  }
  updateWorkbookSummary();
  const pdfOnly = Boolean(row.pdfOnly);
  [els.prevData, els.nextData, els.prevMark, els.nextMark]
    .forEach((button) => { button.disabled = false; });
  [els.pass, els.fail].forEach((button) => { button.disabled = pdfOnly; });
  const expected = expectedValue(row, field);
  const candidate = candidateValue(row, field);
  const decision = currentDecision();

  els.cellAddress.textContent = `${field.column}${row.row}`;
  els.markLabel.textContent = `Mark ${row.mark}`;
  els.fieldLabel.textContent = field.label;
  els.expectedValue.textContent = expected;
  els.progress.textContent =
    `Mark ${state.markIndex + 1} of ${state.rows.length} / Data ${state.fieldIndex + 1} of ${currentFields().length}`;
  els.title.textContent = `${row.mark} - ${field.label}`;
  els.compareExpected.textContent = expected;
  els.compareCandidate.textContent = candidate;
  els.hint.textContent = decision?.reason || (
    state.activeRecord
      ? `${field.hint} Page ${state.activeRecord.pageNumber} of ${state.activeRecord.pdf.numPages} in ${state.activeRecord.fileName}.`
      : "Load the PDF to view the drawing candidate."
  );

  els.checkAll.disabled = !state.pageIndex.length || pdfOnly;
  els.pass.classList.toggle("selected", decision?.status === "pass");
  els.fail.classList.toggle("selected", decision?.status === "fail");
  els.pass.setAttribute("aria-pressed", String(decision?.status === "pass"));
  els.fail.setAttribute("aria-pressed", String(decision?.status === "fail"));

  renderSheetGrid();
  renderLog();
  renderSummary();
  focusEvidence();
  syncActivePage().catch((error) => {
    console.error("Could not open the indexed part page.", error);
    setPdfStatus("The PDFs were indexed, but the selected page could not be shown.", "error");
  });
}

function recordDecision(status) {
  const row = currentRow();
  const field = currentField();
  state.decisions[decisionKey(row, field)] = {
    status,
    part: state.part,
    mark: row.mark,
    field: field.key,
    label: field.label,
    cell: `${field.column}${row.row}`,
    expected: expectedValue(row, field),
    candidate: candidateValue(row, field),
    pdf: state.pdfName || "No PDF loaded",
    page: state.activeRecord?.pageNumber || null,
    source: "manual",
    reason: `Marked ${status} manually.`,
    at: new Date().toISOString()
  };
  saveDecisions();
  render();
}

function autoCheckCurrentMark() {
  const row = currentRow();
  const record = state.activeRecord;
  if (!row || row.pdfOnly || !record) return;
  const checkedAt = new Date().toISOString();
  currentFields().forEach((field) => {
    const key = decisionKey(row, field);
    if (state.decisions[key]?.source === "manual") return;
    const result = evaluateField(row, field, record);
    state.decisions[key] = {
      status: result.status,
      part: state.part,
      mark: row.mark,
      field: field.key,
      label: field.label,
      cell: `${field.column}${row.row}`,
      expected: expectedValue(row, field),
      candidate: result.candidate,
      pdf: record.relativePath || record.fileName,
      page: record.pageNumber,
      source: "auto",
      reason: result.reason,
      at: checkedAt
    };
  });
  saveDecisions();
}

function runAutoCheck() {
  if (!state.pageIndex.length) {
    setPdfStatus("Load the project PDFs before running Check All.", "error");
    return;
  }

  let pass = 0;
  let fail = 0;
  const checkedAt = new Date().toISOString();
  state.rows.forEach((row) => {
    const record = resolveRecord(row);
    currentFields().forEach((field) => {
      const result = evaluateField(row, field, record);
      if (result.status === "pass") pass += 1;
      else fail += 1;
      state.decisions[decisionKey(row, field)] = {
        status: result.status,
        part: state.part,
        mark: row.mark,
        field: field.key,
        label: field.label,
        cell: `${field.column}${row.row}`,
        expected: expectedValue(row, field),
        candidate: result.candidate,
        pdf: record?.relativePath || record?.fileName || `No matching ${currentConfig().label}`,
        page: record?.pageNumber || null,
        source: "auto",
        reason: result.reason,
        at: checkedAt
      };
    });
  });

  saveDecisions();
  render();
  setPdfStatus(
    `Auto check complete: ${pass} pass / ${fail} fail.`,
    fail ? "warning" : "ready"
  );
}

function goTo(mark, fieldKey) {
  const markIndex = state.rows.findIndex((row) => row.mark === mark);
  const fieldIndex = currentFields().findIndex((field) => field.key === fieldKey);
  if (markIndex < 0 || fieldIndex < 0) return;
  state.markIndex = markIndex;
  state.fieldIndex = fieldIndex;
  render();
}

function selectPart(part) {
  if (!PARTS[part]) return;
  state.part = part;
  state.rows = buildRows(part);
  state.markIndex = 0;
  state.fieldIndex = 0;
  state.activeRecord = null;
  state.page = null;
  state.viewport = null;
  els.tabs.querySelectorAll("[data-auto-part]").forEach((button) => {
    const selected = button.dataset.autoPart === part;
    button.classList.toggle("active", selected);
    if (selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  render();
}

function requestClearPdfLibrary() {
  if (!state.documents.length) return;
  els.clearPdfDialog.showModal();
}

async function clearPdfLibrary() {
  els.clearPdfDialog.close();
  setLoadDisabled(true);
  setPdfStatus("Clearing saved PDFs...", "loading");
  try {
    await clearPersistedPdfs();
  } catch (error) {
    console.warn("Could not clear the saved PDF library.", error);
    setPdfStatus("Could not clear the saved PDFs. Try again.", "error");
    setLoadDisabled(false);
    return;
  }
  state.activeRequest += 1;
  state.documents = [];
  state.pageIndex = [];
  state.activeRecord = null;
  state.pdf = null;
  state.page = null;
  state.pdfName = "";
  state.pdfMarks = [];
  state.viewport = null;
  if (state.renderTask) state.renderTask.cancel();
  state.renderTask = null;
  els.input.value = "";
  els.folderInput.value = "";
  els.stage.hidden = true;
  els.drop.hidden = false;
  els.highlight.hidden = true;
  els.pdfPanelTitle.textContent = `${currentConfig().label} drawing`;
  const context = els.canvas.getContext("2d");
  context.clearRect(0, 0, els.canvas.width, els.canvas.height);
  updateIndexSummary();
  state.rows = buildRows(state.part);
  state.markIndex = 0;
  state.fieldIndex = 0;
  render();
  setLoadDisabled(false);
}

els.workbookUpload.addEventListener("click", () => els.workbookInput.click());
els.workbookInput.addEventListener("change", () => {
  const file = els.workbookInput.files?.[0];
  if (file) window.PartsReviewWorkbook?.importFile(file);
  els.workbookInput.value = "";
});
els.tabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-auto-part]");
  if (button) selectPart(button.dataset.autoPart);
});
els.upload.addEventListener("click", () => els.input.click());
els.folder.addEventListener("click", () => els.folderInput.click());
els.clearPdfs.addEventListener("click", requestClearPdfLibrary);
els.clearPdfCancel.addEventListener("click", () => els.clearPdfDialog.close());
els.clearPdfConfirm.addEventListener("click", () => {
  clearPdfLibrary();
});
els.drop.addEventListener("click", () => els.input.click());
els.input.addEventListener("change", async () => {
  await loadPdfFiles(els.input.files);
  els.input.value = "";
});
els.folderInput.addEventListener("change", async () => {
  await loadPdfFiles(els.folderInput.files);
  els.folderInput.value = "";
});

let dragDepth = 0;
const hasDraggedFiles = (event) =>
  Array.from(event.dataTransfer?.types || []).includes("Files");
const droppedFiles = (event) => Array.from(event.dataTransfer?.files || []);
const isWorkbookFile = (file) => /\.xlsx?$/i.test(file?.name || "");
const isPdfFile = (file) => /\.pdf$/i.test(file?.name || "");
const setDragActive = (active) => {
  els.view.classList.toggle("pdf-dragging", active);
  els.scroll.classList.toggle("dragging", active);
};

function bindFileDropTarget(element, accepts, onDrop, onReject) {
  let targetDepth = 0;
  const reset = () => {
    targetDepth = 0;
    element.classList.remove("is-dragging", "is-drag-reject");
  };
  element.addEventListener("dragenter", (event) => {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    event.stopPropagation();
    targetDepth += 1;
    const accepted = droppedFiles(event).length
      ? droppedFiles(event).some(accepts)
      : true;
    element.classList.toggle("is-dragging", accepted);
    element.classList.toggle("is-drag-reject", !accepted);
  });
  element.addEventListener("dragover", (event) => {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    event.stopPropagation();
    const files = droppedFiles(event);
    const accepted = !files.length || files.some(accepts);
    element.classList.toggle("is-dragging", accepted);
    element.classList.toggle("is-drag-reject", !accepted);
    if (event.dataTransfer) event.dataTransfer.dropEffect = accepted ? "copy" : "none";
  });
  element.addEventListener("dragleave", (event) => {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    event.stopPropagation();
    targetDepth = Math.max(0, targetDepth - 1);
    if (!targetDepth) reset();
  });
  element.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const accepted = droppedFiles(event).filter(accepts);
    reset();
    if (!accepted.length) {
      onReject();
      return;
    }
    onDrop(accepted);
  });
}

bindFileDropTarget(
  els.workbookDrop,
  isWorkbookFile,
  ([file]) => {
    els.workbookStatus.textContent = `Reading ${file.name}...`;
    window.PartsReviewWorkbook?.importFile(file);
  },
  () => {
    els.workbookStatus.textContent = "Drop an .xlsx or .xls file here.";
  }
);

bindFileDropTarget(
  els.pdfLibraryDrop,
  isPdfFile,
  (files) => loadPdfFiles(files),
  () => setPdfStatus("Drop one or more PDF files here.", "error")
);

els.view.addEventListener("dragenter", (event) => {
  if (!hasDraggedFiles(event)) return;
  event.preventDefault();
  dragDepth += 1;
  setDragActive(true);
});
els.view.addEventListener("dragover", (event) => {
  if (!hasDraggedFiles(event)) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
});
els.view.addEventListener("dragleave", (event) => {
  if (!hasDraggedFiles(event)) return;
  event.preventDefault();
  dragDepth = Math.max(0, dragDepth - 1);
  if (!dragDepth) setDragActive(false);
});
els.view.addEventListener("drop", (event) => {
  event.preventDefault();
  dragDepth = 0;
  setDragActive(false);
  const files = droppedFiles(event);
  const pdfs = files.filter(isPdfFile);
  const workbook = files.find(isWorkbookFile);
  if (pdfs.length) loadPdfFiles(pdfs);
  else if (workbook) {
    els.workbookStatus.textContent = "Drop Excel in the Spreadsheet box.";
  } else {
    setPdfStatus("Drop PDFs in PDF Library or Excel in Spreadsheet.", "error");
  }
});

els.zoomOut.addEventListener("click", async () => {
  state.scale = Math.max(0.6, Number((state.scale - 0.2).toFixed(2)));
  await renderPage();
});
els.zoomIn.addEventListener("click", async () => {
  state.scale = Math.min(3, Number((state.scale + 0.2).toFixed(2)));
  await renderPage();
});
els.zoomFit.addEventListener("click", async () => {
  if (!state.page) return;
  const base = state.page.getViewport({ scale: 1 });
  state.scale = Math.max(0.6, Math.min(2, (els.scroll.clientWidth - 24) / base.width));
  await renderPage();
});

els.pass.addEventListener("click", () => recordDecision("pass"));
els.fail.addEventListener("click", () => recordDecision("fail"));
els.checkAll.addEventListener("click", runAutoCheck);
els.prevData.addEventListener("click", () => {
  state.fieldIndex = (state.fieldIndex - 1 + currentFields().length) % currentFields().length;
  render();
});
els.nextData.addEventListener("click", () => {
  state.fieldIndex = (state.fieldIndex + 1) % currentFields().length;
  render();
});
els.prevMark.addEventListener("click", () => {
  state.markIndex = (state.markIndex - 1 + state.rows.length) % state.rows.length;
  state.fieldIndex = 0;
  render();
});
els.nextMark.addEventListener("click", () => {
  state.markIndex = (state.markIndex + 1) % state.rows.length;
  state.fieldIndex = 0;
  render();
});

els.sheetGrid.addEventListener("click", (event) => {
  const cell = event.target.closest("[data-field]");
  if (!cell?.dataset.field) return;
  const index = currentFields().findIndex((field) => field.key === cell.dataset.field);
  if (index >= 0) {
    state.fieldIndex = index;
    render();
  }
});

els.logList.addEventListener("click", (event) => {
  const item = event.target.closest("[data-mark][data-field]");
  if (item) goTo(item.dataset.mark, item.dataset.field);
});

els.clearLog.addEventListener("click", () => {
  if (!window.confirm(`Delete the complete ${currentConfig().label} review log?`)) return;
  Object.keys(state.decisions).forEach((key) => {
    if (state.decisions[key]?.part === state.part) delete state.decisions[key];
  });
  saveDecisions();
  render();
});

els.stage.hidden = true;
state.rows = buildRows(state.part);
render();
restorePdfLibrary();

window.AutoPartReview = {
  rows: () => [...state.rows],
  fields: () => [...currentFields()],
  activeTextItems: () => (state.activeRecord?.textItems || []).map((item) => ({
    str: item.str,
    transform: [...item.transform],
    width: item.width,
    height: item.height
  })),
  loadPdfFiles,
  getState: () => ({
    part: state.part,
    mark: currentRow().mark,
    field: currentField().key,
    decisions: { ...state.decisions },
    pdfMarks: [...state.pdfMarks],
    files: state.documents.length,
    pages: state.pageIndex.length,
    activePage: state.activeRecord
      ? {
          file: state.activeRecord.relativePath || state.activeRecord.fileName,
          page: state.activeRecord.pageNumber,
          category: state.activeRecord.category,
          pieces: [...state.activeRecord.pieces],
          marks: [...state.activeRecord.marks]
        }
      : null
  })
};
