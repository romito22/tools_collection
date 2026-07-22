(function () {
  "use strict";

  const KEY = "tools_collection.partsReview.workbookData.v1";
  const SHEETS = ["Cor(-)", "PIM(-)", "HSS D"];
  const n = (value) => value === null || value === undefined || value === "" || value === "-" || !Number.isFinite(Number(value)) ? null : Number(value);
  const text = (value, fallback = "") => String(value === null || value === undefined || value === "" ? fallback : value);
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a) || 1;

  function inches(value, feet) {
    const number = n(value);
    if (number === null) return value === null || value === undefined || value === "" ? "-" : String(value);
    const sixteenths = Math.round(number * 16);
    const ft = Math.floor(sixteenths / 192);
    const rest = sixteenths - ft * 192;
    const whole = Math.floor(rest / 16);
    const fraction = rest % 16;
    const divisor = fraction ? gcd(fraction, 16) : 1;
    const fractionText = fraction ? fraction / divisor + "/" + 16 / divisor : "";
    const inchText = [whole || (!ft && !fractionText) ? whole : "", fractionText].filter((item) => item !== "").join(" ") || "0";
    return feet || ft ? ft + "' " + inchText + '"' : inchText;
  }

  function cell(sheet, row, column) {
    const item = sheet[XLSX.utils.encode_cell({ r: row - 1, c: column - 1 })];
    return item ? item.v : null;
  }

  function rows(sheet) {
    const end = sheet["!ref"] ? XLSX.utils.decode_range(sheet["!ref"]).e.r + 1 : 0;
    const result = [];
    for (let row = 9; row <= end; row += 1) {
      if (cell(sheet, row, 1) !== null && cell(sheet, row, 1) !== "" &&
          cell(sheet, row, 6) !== null && cell(sheet, row, 6) !== "") result.push(row);
    }
    return result;
  }

  function signature(sheet, row) {
    return [1, 2, 3, 4, 5, 6].map((column) => text(cell(sheet, row, column))).join("\u001f");
  }

  function combine(source, sumKeys) {
    const found = new Map();
    source.forEach((row) => {
      const mark = text(row.Mark || row.mark).trim();
      if (!mark) return;
      if (!found.has(mark)) {
        found.set(mark, Object.assign({}, row, { _combinedRows: 1 }));
        return;
      }
      const target = found.get(mark);
      target._combinedRows += 1;
      sumKeys.forEach((key) => {
        if (key in target || key in row) target[key] = (n(target[key]) || 0) + (n(row[key]) || 0);
      });
    });
    return Array.from(found.values()).sort((a, b) => text(a.Mark || a.mark).localeCompare(text(b.Mark || b.mark), undefined, { numeric: true }));
  }

  function identity(sheet, row) {
    return {
      "CB-ID": text(cell(sheet, row, 1)), "EOR-ID": text(cell(sheet, row, 2)),
      Line: text(cell(sheet, row, 3)), Grids: text(cell(sheet, row, 4)),
      Lvls: text(cell(sheet, row, 5)), Mark: text(cell(sheet, row, 6))
    };
  }

  function coreRow(sheet, row) {
    return Object.assign(identity(sheet, row), {
      Qty: text(cell(sheet, row, 7)), Lsc: inches(cell(sheet, row, 9), true),
      "Fy min": (n(cell(sheet, row, 13)) || 0).toFixed(2), "Fy max": (n(cell(sheet, row, 14)) || 0).toFixed(2),
      Wsc: inches(cell(sheet, row, 15)), "# Plies": text(cell(sheet, row, 20), "-"),
      tply: inches(cell(sheet, row, 21)), tsc: inches(cell(sheet, row, 22)), Wsg: inches(cell(sheet, row, 23)),
      Whpsc: inches(cell(sheet, row, 24)), rhpsc: inches(cell(sheet, row, 25)), Lsg: inches(cell(sheet, row, 26), true),
      "Lsc-2*Lsg": inches((n(cell(sheet, row, 9)) || 0) - 2 * (n(cell(sheet, row, 26)) || 0), true)
    });
  }

  function lugRow(sheet, row) {
    const ll = n(cell(sheet, row, 39)) || 0, wl = n(cell(sheet, row, 40)) || 0;
    const lsl = n(cell(sheet, row, 42)) || 0, llg = n(cell(sheet, row, 43)) || 0;
    const br = n(cell(sheet, row, 51)) || 0, edge = n(cell(sheet, row, 52)) || 0, radius = n(cell(sheet, row, 53)) || 0;
    const ni = n(cell(sheet, row, 54)) || 0, no = n(cell(sheet, row, 55)) || 0;
    const spacing = n(cell(sheet, row, 56)) || 0, gage = n(cell(sheet, row, 57)) || 0;
    return {
      Mark: text(cell(sheet, row, 6)), Qty: text(cell(sheet, row, 38)), LL: inches(ll), WL: inches(wl),
      tL: inches(cell(sheet, row, 41)), LsL: inches(lsl), LLg: inches(llg), a: inches(cell(sheet, row, 44)),
      LFC: inches(cell(sheet, row, 45)), LhpL: inches(cell(sheet, row, 46)), W1: inches(cell(sheet, row, 47)),
      WhpL: inches(cell(sheet, row, 48)), rhpL: inches(cell(sheet, row, 49)), "W'se": inches(cell(sheet, row, 50)),
      br: inches(br), e: inches(edge), rL: inches(radius), ni: text(cell(sheet, row, 54)), no: text(cell(sheet, row, 55)),
      s: inches(spacing), g: inches(gage), dh: inches(cell(sheet, row, 58)), "LL-LsL": inches(ll - lsl),
      "s*(ni-1)": inches(ni === no ? (ni + no - 1) * spacing / 2 : spacing * Math.max(0, ni - 1)),
      "LLG-rL": inches(llg - radius), "rL-br": inches(radius - br), "WL-2e-2g": inches(wl - 2 * edge - 2 * gage)
    };
  }

  function pimRow(sheet, row, part) {
    const p06 = part === "p06";
    const result = {
      Row: row - 8, Mark: text(cell(sheet, row, 6)), Qty: text(cell(sheet, row, 14)),
      BraceQty: text(cell(sheet, row, 7)), Color: text(cell(sheet, row, 11), "-"),
      G1: text(cell(sheet, row, 8), "0"), G2: text(cell(sheet, row, 9), "0"), Height: inches(cell(sheet, row, 10)),
      Material: text(cell(sheet, row, 17), "-"), LPIM: inches(cell(sheet, row, 18)), WP: inches(cell(sheet, row, 23)),
      Lyp: inches(cell(sheet, row, 24)), Lhpp: inches(cell(sheet, row, 25)), Whpp: inches(cell(sheet, row, 26)),
      Wcp: inches(cell(sheet, row, 27)), Wep: inches(cell(sheet, row, 29)), Lttp: inches(cell(sheet, row, 32)),
      Lstp: inches(cell(sheet, row, 33)), xtp: inches(cell(sheet, row, 34)), "W''se": inches(cell(sheet, row, 35)),
      Wtp: inches(cell(sheet, row, 36)), Piece: part + (100 + row - 8)
    };
    result[p06 ? "p06u" : "p07u"] = text(cell(sheet, row, p06 ? 12 : 13), "0");
    result[p06 ? "tPIM-p06" : "tPIM-p07"] = inches(cell(sheet, row, p06 ? 15 : 16));
    return result;
  }

  function p15Row(sheet, row) {
    const h2 = n(cell(sheet, row, 21)) || 0, h1 = n(cell(sheet, row, 20)) || 0, t1 = n(cell(sheet, row, 22)) || 0;
    const result = {
      Row: row - 8, Mark: text(cell(sheet, row, 6)), Qty: text(cell(sheet, row, 7)),
      Lc: text(cell(sheet, row, 10), inches(cell(sheet, row, 9), true)).replace(/''/g, '"'),
      Type: text(cell(sheet, row, 14), "-"), Hc: (n(cell(sheet, row, 15)) || 0).toFixed(3),
      "Hc-5": inches(cell(sheet, row, 15)), Wc: (n(cell(sheet, row, 16)) || 0).toFixed(3),
      "Wc-7": inches(cell(sheet, row, 16)), tc: (n(cell(sheet, row, 17)) || 0).toFixed(4),
      "Qty-9": text(cell(sheet, row, 18)), W1cc: inches(cell(sheet, row, 19)), H1cc: inches(cell(sheet, row, 20)),
      t1cc: inches(cell(sheet, row, 22)), t2cc: inches(cell(sheet, row, 23)), rcc: inches(cell(sheet, row, 26)),
      tcc: inches(cell(sheet, row, 27)), DwL: text(cell(sheet, row, 28)), "DwL-i": text(cell(sheet, row, 29)),
      Dwcc: text(cell(sheet, row, 30)), "H2cc - DwL": inches(h2 - (n(cell(sheet, row, 28)) || 0) / 16),
      "H1cc - H2cc - t1cc": inches(h1 - h2 - t1)
    };
    return result;
  }

  function fullMark(cor, pim, hss, row, pimRows, hssRows, project, fileName) {
    const pr = pimRows.get(signature(cor, row)), hr = hssRows.get(signature(cor, row));
    if (!pr || !hr) return null;
    const mark = text(cell(cor, row, 6)), keep = n(cell(cor, row, 73));
    return {
      project, workbook: fileName, mark, pieceMark: mark + "A", quantity: cell(cor, row, 7),
      cbId: text(cell(cor, row, 1)), eorId: text(cell(cor, row, 2)), line: text(cell(cor, row, 3)),
      grids: text(cell(cor, row, 4)), levels: text(cell(cor, row, 5)), sourceSheets: SHEETS.slice(),
      totalShippingWeight: null,
      brace: { overallLength: n(cell(cor, row, 9)), keepLength: keep, casingLength: n(cell(hss, hr, 9)),
        tip: n(cell(cor, row, 89)), lugTipToHeat: null, centerHalf: keep === null ? null : keep / 2 },
      core: { piece: "p02", qty: n(cell(cor, row, 8)), plies: text(cell(cor, row, 20), "-"),
        length: n(cell(cor, row, 9)), fyMin: n(cell(cor, row, 13)), fyMax: n(cell(cor, row, 14)),
        width: n(cell(cor, row, 15)), plyThickness: n(cell(cor, row, 21)), coreThickness: n(cell(cor, row, 22)),
        gussetWidth: n(cell(cor, row, 23)), heatPocketWidth: n(cell(cor, row, 24)), heatPocketRadius: n(cell(cor, row, 25)),
        gussetLength: n(cell(cor, row, 26)), boltHold: n(cell(cor, row, 73)), xL: n(cell(cor, row, 74)),
        c: n(cell(cor, row, 76)), factorC: n(cell(cor, row, 77)), lugInnerWeldLength: n(cell(cor, row, 80)),
        drawingLugLength: n(cell(cor, row, 81)), weldSixteenths: n(cell(cor, row, 82)) },
      lug: { piece: "p03", qty: n(cell(cor, row, 38)), length: n(cell(cor, row, 39)), width: n(cell(cor, row, 40)),
        thickness: n(cell(cor, row, 41)), straightLength: n(cell(cor, row, 42)), gaugeLength: n(cell(cor, row, 43)),
        offsetA: n(cell(cor, row, 44)), frontCutLength: n(cell(cor, row, 45)), heatLength: n(cell(cor, row, 80)),
        heatPocketLength: n(cell(cor, row, 46)), w1: n(cell(cor, row, 47)), heatPocketWidth: n(cell(cor, row, 48)),
        heatPocketRadius: n(cell(cor, row, 49)), smallEndWidth: n(cell(cor, row, 50)), br: n(cell(cor, row, 51)),
        edge: n(cell(cor, row, 52)), radius: n(cell(cor, row, 53)), ni: n(cell(cor, row, 54)),
        no: n(cell(cor, row, 55)), spacing: n(cell(cor, row, 56)), gage: n(cell(cor, row, 57)),
        holeDiameter: n(cell(cor, row, 58)) },
      stopper: { piece: "p04", type: text(cell(cor, row, 59), "-"), qty: n(cell(cor, row, 60)),
        thickness: n(cell(cor, row, 61)), width: n(cell(cor, row, 62)), height: n(cell(cor, row, 63)),
        distance: n(cell(cor, row, 64)) },
      stiffener: { piece: "p05", qty: 1, thickness: n(cell(cor, row, 69)), width: n(cell(cor, row, 70)),
        length: n(cell(cor, row, 71)), weldSixteenths: n(cell(cor, row, 72)) },
      casing: { piece: "p01", qty: n(cell(hss, hr, 7)), type: text(cell(hss, hr, 8), "-"),
        length: n(cell(hss, hr, 9)), height: n(cell(hss, hr, 15)), width: n(cell(hss, hr, 16)),
        thickness: n(cell(hss, hr, 17)) },
      pim: {
        tRod: { g1: n(cell(pim, pr, 8)), g2: n(cell(pim, pr, 9)), height: n(cell(pim, pr, 10)),
          color: text(cell(pim, pr, 11), "-"), p06u: n(cell(pim, pr, 12)), p07u: n(cell(pim, pr, 13)) },
        main: { pieces: "p06 / p07", qty: n(cell(pim, pr, 14)), thickness: n(cell(pim, pr, 15)),
          tP07: n(cell(pim, pr, 16)), grade: text(cell(pim, pr, 17), "-"), length: n(cell(pim, pr, 18)),
          width: n(cell(pim, pr, 23)), Lyp: n(cell(pim, pr, 24)), Lhpp: n(cell(pim, pr, 25)),
          Whpp: n(cell(pim, pr, 26)), Wcp: n(cell(pim, pr, 27)), Wep: n(cell(pim, pr, 29)) },
        transverse: { pieces: "p08 / p09", pieceA: "p08", pieceB: "p09", qty: n(cell(pim, pr, 30)),
          grade: text(cell(pim, pr, 31), "-"), length: n(cell(pim, pr, 32)), stopLength: n(cell(pim, pr, 33)),
          xtp: n(cell(pim, pr, 34)), smallEndWidth: n(cell(pim, pr, 35)), width: n(cell(pim, pr, 36)),
          thickness: n(cell(pim, pr, 37)) },
        capStrip: { piece: "p10", qty: n(cell(pim, pr, 38)), material: text(cell(pim, pr, 39), "-"),
          length: n(cell(pim, pr, 40)), width: n(cell(pim, pr, 43)), thickness: n(cell(pim, pr, 44)) },
        transverseCap: { piece: "p11", qty: n(cell(pim, pr, 45)), length: n(cell(pim, pr, 46)),
          width: n(cell(pim, pr, 47)), thickness: n(cell(pim, pr, 48)) },
        transverseShortCap: { piece: "p12", qty: n(cell(pim, pr, 49)), length: n(cell(pim, pr, 50)),
          width: n(cell(pim, pr, 51)), thickness: n(cell(pim, pr, 52)) }
      },
      capPlate: { piece: "p15", qty: n(cell(hss, hr, 18)), thickness: n(cell(hss, hr, 27)),
        width: n(cell(hss, hr, 20)), length: n(cell(hss, hr, 19)), h2: n(cell(hss, hr, 21)),
        t1: n(cell(hss, hr, 22)), t2: n(cell(hss, hr, 23)), t3: n(cell(hss, hr, 24)),
        t4: n(cell(hss, hr, 25)), tcc: n(cell(hss, hr, 27)), weldSixteenths: n(cell(hss, hr, 28)) }
    };
  }

  function mine(workbook, fileName) {
    const missing = SHEETS.filter((name) => !workbook.Sheets[name]);
    if (missing.length) throw new Error("Missing required sheet" + (missing.length > 1 ? "s: " : ": ") + missing.join(", "));
    const cor = workbook.Sheets["Cor(-)"], pim = workbook.Sheets["PIM(-)"], hss = workbook.Sheets["HSS D"];
    const corRows = rows(cor), pimRowNumbers = rows(pim), hssRowNumbers = rows(hss);
    if (!corRows.length) throw new Error("No brace marks were found in Cor(-), starting at row 9.");
    const pimMap = new Map(pimRowNumbers.map((row) => [signature(pim, row), row]));
    const hssMap = new Map(hssRowNumbers.map((row) => [signature(hss, row), row]));
    const project = fileName.replace(/\.xlsx?$/i, "").trim();
    const full = combine(corRows.map((row) => fullMark(cor, pim, hss, row, pimMap, hssMap, project, fileName)).filter(Boolean), ["quantity"]);
    if (!full.length) throw new Error("Core marks were found, but matching PIM and HSS rows were not found.");
    const welds = {};
    corRows.forEach((row) => {
      welds[text(cell(cor, row, 6))] = { br: n(cell(cor, row, 51)), Dstp: n(cell(cor, row, 64)),
        LwL_i: n(cell(cor, row, 80)), LLg: n(cell(cor, row, 81)), DwL: n(cell(cor, row, 82)),
        DwL_i: n(cell(cor, row, 83)), DwLg: n(cell(cor, row, 84)), t_tg: n(cell(cor, row, 79)) };
    });
    return { version: 1, fileName, project, importedAt: new Date().toISOString(), full, welds,
      core: combine(corRows.map((row) => coreRow(cor, row)), ["Qty"]),
      lug: combine(corRows.map((row) => lugRow(cor, row)), ["Qty"]),
      p06: combine(pimRowNumbers.map((row) => pimRow(pim, row, "p06")), ["Qty", "BraceQty"]),
      p07: combine(pimRowNumbers.map((row) => pimRow(pim, row, "p07")), ["Qty", "BraceQty"]),
      p15: combine(hssRowNumbers.map((row) => p15Row(hss, row)), ["Qty", "Qty-9"]),
      hss: combine(hssRowNumbers.map((row) => Object.assign(identity(hss, row), p15Row(hss, row))), ["Qty", "Qty-9"]) };
  }

  function apply(data) {
    if (!data || data.version !== 1) return;
    window.FULL_SHEET_MARKS = Array.isArray(data.full) ? data.full : [];
    window.FULL_SHEET_WELDS = data.welds || {};
    window.coreRows = data.core || []; window.lugRows = data.lug || [];
    window.p06Rows = data.p06 || []; window.p07Rows = data.p07 || [];
    window.p15Rows = data.p15 || []; window.hssRows = data.hss || [];
    window.PARTS_REVIEW_WORKBOOK = data;
  }

  let restored = null;
  try {
    restored = JSON.parse(localStorage.getItem(KEY) || "null");
    apply(restored);
  } catch (error) {
    console.warn("Could not restore workbook data.", error);
  }

  const status = document.getElementById("workbookStatus");
  const setStatus = (message, state) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state || "";
  };

  async function importFile(file) {
    if (!file) return;
    if (!/\.xlsx?$/i.test(file.name)) return setStatus("Choose an .xlsx or .xls workbook.", "error");
    if (typeof XLSX === "undefined") return setStatus("The Excel reader did not load. Reload while connected to the internet.", "error");
    setStatus("Reading " + file.name + "...", "busy");
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false, cellFormula: false });
      const data = mine(workbook, file.name);
      localStorage.setItem(KEY, JSON.stringify(data));
      setStatus("Loaded " + data.full.length + " marks. Refreshing...", "success");
      setTimeout(() => location.reload(), 200);
    } catch (error) {
      console.warn("Workbook import rejected.", error);
      setStatus(error && error.message ? error.message : "Could not read this workbook.", "error");
    }
  }

  const input = document.getElementById("workbookFileInput");
  const upload = document.getElementById("workbookUploadBtn");
  const drop = document.getElementById("workbookDropZone");
  const clear = document.getElementById("workbookClearBtn");
  upload?.addEventListener("click", () => input?.click());
  input?.addEventListener("change", () => { importFile(input.files && input.files[0]); input.value = ""; });
  ["dragenter", "dragover"].forEach((name) => drop?.addEventListener(name, (event) => {
    event.preventDefault(); drop.classList.add("dragging");
  }));
  ["dragleave", "drop"].forEach((name) => drop?.addEventListener(name, (event) => {
    event.preventDefault(); drop.classList.remove("dragging");
  }));
  drop?.addEventListener("drop", (event) => importFile(event.dataTransfer && event.dataTransfer.files[0]));
  drop?.addEventListener("click", () => input?.click());
  drop?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input?.click(); }
  });
  clear?.addEventListener("click", () => {
    const name = window.PARTS_REVIEW_WORKBOOK && window.PARTS_REVIEW_WORKBOOK.fileName || "the current workbook data";
    if (!confirm("Delete " + name + " from this browser? Your canvas layouts will be kept.")) return;
    localStorage.setItem(KEY, JSON.stringify({ version: 1, cleared: true, full: [], welds: {}, core: [], lug: [], p06: [], p07: [], p15: [], hss: [] }));
    location.reload();
  });

  if (restored && restored.cleared) setStatus("No workbook loaded. Drop an Excel file to begin.", "empty");
  else if (restored && restored.fileName) setStatus(restored.fileName + " | " + restored.full.length + " marks | saved in this browser", "success");
  else setStatus("Bundled workbook data | " + (window.FULL_SHEET_MARKS || []).length + " marks", "");

  window.PartsReviewWorkbook = { mine, importFile, apply, storageKey: KEY };
})();
