(function setupFullSheet() {
  const marks = Array.isArray(window.FULL_SHEET_MARKS) ? window.FULL_SHEET_MARKS : [];
  const byId = (id) => document.getElementById(id);
  const els = {
    input: byId("fullSheetMarkInput"),
    show: byId("fullSheetShowBtn"),
    reset: byId("fullSheetResetBtn"),
    total: byId("fullSheetTotal"),
    shown: byId("fullSheetShown"),
    reviewed: byId("fullSheetReviewed"),
    open: byId("fullSheetOpen"),
    prev: byId("fullSheetPrevBtn"),
    next: byId("fullSheetNextBtn"),
    eyebrow: byId("fullSheetEyebrow"),
    title: byId("fullSheetTitle"),
    count: byId("fullSheetCount"),
    svg: byId("fullSheetSvg"),
    bom: byId("fullSheetBom"),
    bomColor: byId("fullSheetBomColor"),
    bomHole: byId("fullSheetBomHole"),
    meta: byId("fullSheetMeta"),
    checks: byId("fullSheetChecks"),
    status: byId("fullSheetStatus")
  };
  if (!els.svg) return;

  const state = { visible: marks, active: 0, checked: new Set() };
  const weldMap = window.FULL_SHEET_WELDS || {};
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const parseFilter = (value) => String(value || "").split(/[\s,;]+/).map((part) => part.trim()).filter(Boolean);

  function formatInches(value, forceFeet = false) {
    if (value === null || value === undefined || value === "" || value === "-") return "-";
    const number = Number(value);
    if (!Number.isFinite(number)) return esc(value || "-");
    const sixteenths = Math.round(number * 16);
    const feet = Math.floor(sixteenths / 192);
    const rest = sixteenths - feet * 192;
    const inches = Math.floor(rest / 16);
    const fraction = rest % 16;
    const divisor = fraction ? gcd(fraction, 16) : 1;
    const fractionText = fraction ? `${fraction / divisor}/${16 / divisor}` : "";
    const inchWhole = inches ? String(inches) : ((feet || forceFeet || fractionText) ? "" : "0");
    const inchesText = [inchWhole, fractionText].filter(Boolean).join(" ");
    if (forceFeet || feet) return `${feet}'-${inchesText || "0"}"`;
    return `${inchesText || "0"}"`;
  }

  function formatDecimal(value, digits = 3) {
    if (value === null || value === undefined || value === "" || value === "-") return "-";
    const number = Number(value);
    return Number.isFinite(number) ? String(Number(number.toFixed(digits))) : esc(value || "-");
  }

  function weld(value) {
    return formatInches(Number(value || 0) / 16);
  }

  function formatSixteenthInches(value) {
    if (value === null || value === undefined || value === "" || value === "-") return "-";
    const number = Number(value);
    if (!Number.isFinite(number)) return esc(value || "-");
    const sixteenths = Math.round(number * 16);
    const inches = Math.floor(sixteenths / 16);
    const fraction = sixteenths % 16;
    return fraction ? `${inches} ${fraction}/16"` : `${inches}"`;
  }

  function weld16(value) {
    if (value === null || value === undefined || value === "" || value === "-") return "-";
    const number = Number(value);
    return Number.isFinite(number) ? `${number}/16"` : esc(value);
  }

  function corWelds(mark) {
    const data = weldMap[String(mark.mark)] || {};
    const fallback = mark.core.weldSixteenths;
    return {
      Dstp: data.Dstp ?? "-",
      br: data.br ?? "-",
      LwL_i: data.LwL_i ?? mark.lug.heatLength,
      LLg: data.LLg ?? mark.lug.gaugeLength,
      DwL: data.DwL ?? fallback,
      DwL_i: data.DwL_i ?? fallback,
      DwLg: data.DwLg ?? fallback,
      t_tg: data.t_tg ?? "-"
    };
  }

  function weldStack(mark) {
    const data = corWelds(mark);
    return [
      ["Dstp", data.Dstp],
      ["DwL", data.DwL],
      ["DwL-i", data.DwL_i],
      ["DwLg", data.DwLg]
    ].map(([label, value]) => `${label} ${weld16(value)}`).join("   ");
  }

  function lugHeatPocketPlusRadius(mark) {
    return Number(mark.lug.heatPocketWidth || 0) + Number(mark.lug.heatPocketRadius || 0);
  }

  function lugClearHalf(mark) {
    return (Number(mark.lug.width || 0) - 2 * Number(mark.lug.edge || 0) - 2 * Number(mark.lug.gage || 0)) / 2;
  }

  function lugRadiusMinusBr(mark) {
    const br = Number(corWelds(mark).br);
    if (!Number.isFinite(br)) return null;
    return Number(mark.lug.radius || 0) - br;
  }

  function lugHoleSpacing(mark) {
    return Number(mark.lug.no || 0) > 0 ? Number(mark.lug.spacing || 0) / 2 : Number(mark.lug.spacing || 0);
  }

  function lugHolePattern(mark) {
    const spaces = Math.max(0, Number(mark.lug.ni || 0) + Number(mark.lug.no || 0) - 1);
    return spaces ? `${spaces}x${formatInches(lugHoleSpacing(mark))}` : "-";
  }

  function sourceLugRow(mark) {
    const rows = Array.isArray(window.lugRows) ? window.lugRows : [];
    return rows.find((row) => String(row.Mark ?? "").trim() === String(mark.mark ?? "").trim()) || null;
  }

  function sourceLugValue(mark, key, fallback) {
    const row = sourceLugRow(mark);
    const value = row?.[key];
    return value !== null && value !== undefined && String(value).trim() && value !== "-"
      ? formatInches(value)
      : formatInches(fallback);
  }

  function plate(thickness, width, length) {
    return `PL ${formatInches(thickness)} X ${formatInches(width)} X ${formatInches(length, Number(length) >= 12)}`;
  }

  function plateSize(thickness, width) {
    return `PL ${formatInches(thickness)} X ${formatInches(width)}`;
  }

  function sourceBraceQuantity(mark) {
    const sourceRows = Array.isArray(window.coreRows) ? window.coreRows : [];
    const same = (a, b) => String(a ?? "").trim() === String(b ?? "").trim();
    const sourceQty = sourceRows
      .filter((row) => same(row.Mark, mark.mark))
      .reduce((sum, row) => sum + (Number(row.Qty) || 0), 0);
    const fallback = Number(mark.quantity);
    return sourceQty || (Number.isFinite(fallback) && fallback > 0 ? fallback : 1);
  }

  function current() {
    if (!state.visible.length) return null;
    state.active = Math.max(0, Math.min(state.active, state.visible.length - 1));
    return state.visible[state.active];
  }

  function pieceRows(mark) {
    return [
      { piece: mark.casing.piece, qty: mark.casing.qty, size: mark.casing.type, length: formatInches(mark.casing.length, true), note: "Casing" },
      { piece: mark.core.piece, qty: mark.core.qty, size: plate(mark.core.plyThickness, mark.core.width, mark.core.length), length: formatInches(mark.core.length, true), note: `Fy ${formatDecimal(mark.core.fyMin, 2)}-${formatDecimal(mark.core.fyMax, 2)} ksi` },
      { piece: mark.lug.piece, qty: mark.lug.qty, size: plate(mark.lug.thickness, mark.lug.width, mark.lug.length), length: formatInches(mark.lug.length, true), note: "Lug" },
      { piece: mark.stiffener.piece, qty: mark.stiffener.qty, size: plate(mark.stiffener.thickness, mark.stiffener.width, mark.stiffener.length), length: formatInches(mark.stiffener.length, true), note: "Center stiffener" },
      { piece: mark.capPlate.piece, qty: mark.capPlate.qty, size: plate(mark.capPlate.thickness, mark.capPlate.width, mark.capPlate.length), length: formatInches(mark.capPlate.length, true), note: "Cap plate" },
      { piece: mark.pim.main.pieces, qty: mark.pim.main.qty, size: plate(mark.pim.main.thickness, mark.pim.main.width, mark.pim.main.length), length: formatInches(mark.pim.main.length, true), note: mark.pim.main.grade },
      { piece: mark.pim.transverse.pieces, qty: mark.pim.transverse.qty, size: plate(mark.pim.transverse.thickness, mark.pim.transverse.width, mark.pim.transverse.length), length: formatInches(mark.pim.transverse.length, true), note: mark.pim.transverse.grade },
      { piece: mark.pim.capStrip.piece, qty: mark.pim.capStrip.qty, size: `MI ${formatInches(mark.pim.capStrip.width)} EDGE`, length: formatInches(mark.pim.capStrip.length, true), note: mark.pim.capStrip.material },
      { piece: mark.pim.transverseCap.piece, qty: mark.pim.transverseCap.qty, size: `MI ${formatInches(mark.pim.transverseCap.width)} EDGE`, length: formatInches(mark.pim.transverseCap.length, true), note: "PIM cap" },
      { piece: mark.pim.transverseShortCap.piece, qty: mark.pim.transverseShortCap.qty, size: `MI ${formatInches(mark.pim.transverseShortCap.width)} EDGE`, length: formatInches(mark.pim.transverseShortCap.length), note: "PIM cap" }
    ];
  }

  function billRows(mark) {
    if (Array.isArray(mark.billOfMaterial)) return mark.billOfMaterial;
    const braceQty = sourceBraceQuantity(mark);
    const partQty = (value) => {
      const qty = Number(value);
      return Number.isFinite(qty) && qty > 0 ? qty : value;
    };
    const scaledQty = (value) => {
      const qty = Number(value);
      return Number.isFinite(qty) && qty > 0 ? partQty(qty * braceQty) : value;
    };
    const hasPartSize = (part) => [part?.thickness, part?.width, part?.length].some((value) => Number.isFinite(Number(value)) && Number(value) > 0);
    const rows = [
      { piece: `${mark.mark}A`, qty: partQty(braceQty), size: "BRACE", length: formatInches(mark.brace.overallLength, true), remarks: "", steel: "", aml: "", seq: "", weight: "", pc: "" },
      { spacer: true },
      { piece: "p01", qty: scaledQty(mark.casing.qty), size: mark.casing.type, length: formatInches(mark.casing.length, true), remarks: "", steel: "A53-GR.B", aml: "", seq: "", weight: "", pc: "" },
      { piece: "p02", qty: scaledQty(mark.core.qty), size: plateSize(mark.core.plyThickness, mark.core.width), length: formatInches(mark.core.length, true), remarks: `Fysc = ${formatDecimal(mark.core.fyMin, 2)}-${formatDecimal(mark.core.fyMax, 2)}ksi`, steel: "A36", aml: "", seq: "", weight: "", pc: "" },
      { piece: "p03", qty: scaledQty(mark.lug.qty), size: plateSize(mark.lug.thickness, mark.lug.width), length: formatInches(mark.lug.length, true), remarks: "", steel: "A572-GR.50", aml: "", seq: "", weight: "", pc: "" },
      { spacer: true },
      ...(mark.stopper?.qty && mark.stopper.qty !== "-" ? [{ piece: "p04", qty: scaledQty(mark.stopper.qty), size: plateSize(mark.stopper.thickness, mark.stopper.width), length: formatInches(mark.stopper.height), remarks: "", steel: "ASTM A36/ASTM A572 Gr. 50", aml: "", seq: "", weight: "", pc: "" }] : []),
      ...(hasPartSize(mark.stiffener) ? [{ piece: "p05", qty: scaledQty(mark.stiffener.qty || 1), size: plateSize(mark.stiffener.thickness, mark.stiffener.width), length: formatInches(mark.stiffener.length), remarks: "", steel: "ASTM A36 OR ASTM A572 Gr. 50", aml: "", seq: "", weight: "", pc: "" }] : []),
      { piece: "p15", qty: scaledQty(mark.capPlate.qty), size: plateSize(mark.capPlate.thickness, mark.capPlate.width), length: formatInches(mark.capPlate.length, true), remarks: "", steel: "ASTM A36 OR ASTM A572 Gr. 50", aml: "", seq: "", weight: "", pc: "" },
      { spacer: true },
      { piece: "p06", qty: scaledQty(Math.ceil(Number(mark.pim.main.qty || 0) / 2) || "-"), size: plateSize(mark.pim.main.thickness, mark.pim.main.width), length: formatInches(mark.pim.main.length, true), remarks: "", steel: mark.pim.main.grade, aml: "", seq: "", weight: "", pc: "" },
      { piece: "p07", qty: scaledQty(Math.floor(Number(mark.pim.main.qty || 0) / 2) || "-"), size: plateSize(mark.pim.main.tP07 ?? mark.pim.main.thickness, mark.pim.main.width), length: formatInches(mark.pim.main.length, true), remarks: "", steel: mark.pim.main.grade, aml: "", seq: "", weight: "", pc: "" },
      { piece: "p08", qty: scaledQty(Math.ceil(Number(mark.pim.transverse.qty || 0) / 2) || "-"), size: plateSize(mark.pim.transverse.thickness, mark.pim.transverse.width), length: formatInches(mark.pim.transverse.length, true), remarks: "", steel: mark.pim.transverse.grade, aml: "", seq: "", weight: "", pc: "" },
      { piece: "p09", qty: scaledQty(Math.floor(Number(mark.pim.transverse.qty || 0) / 2) || "-"), size: plateSize(mark.pim.transverse.thickness, mark.pim.transverse.width), length: formatInches(mark.pim.transverse.length, true), remarks: "", steel: mark.pim.transverse.grade, aml: "", seq: "", weight: "", pc: "" },
      { piece: "p10", qty: scaledQty(mark.pim.capStrip.qty), size: `MI ${formatInches(mark.pim.capStrip.width)} EDGE`, length: formatInches(mark.pim.capStrip.length, true), remarks: mark.pim.capStrip.material, steel: "PIM", aml: "", seq: "", weight: "", pc: "" },
      { piece: "p11", qty: scaledQty(mark.pim.transverseCap.qty), size: `MI ${formatInches(mark.pim.transverseCap.width)} EDGE`, length: formatInches(mark.pim.transverseCap.length, true), remarks: "", steel: "PIM", aml: "", seq: "", weight: "", pc: "" },
      { piece: "p12", qty: scaledQty(mark.pim.transverseShortCap.qty), size: `MI ${formatInches(mark.pim.transverseShortCap.width)} EDGE`, length: formatInches(mark.pim.transverseShortCap.length), remarks: "", steel: "PIM", aml: "", seq: "", weight: "", pc: "" }
    ];
    return rows.filter((row) => row.spacer || row.qty !== "-" && row.qty !== null && row.qty !== undefined && row.qty !== 0);
  }

  function reviewGroups(mark) {
    if (mark.templateType === "pinned") return pinnedReviewGroups(mark);
    return [
      {
        name: "Brace Identity",
        fields: [
          ["Brace mark", `${mark.mark} / ${mark.pieceMark}`],
          ["CB-ID", mark.cbId],
          ["EOR-ID", mark.eorId],
          ["Line / grids", `${mark.line} / ${mark.grids}`],
          ["Levels", mark.levels],
          ["Qty", sourceBraceQuantity(mark)],
          ["T-Rod Color", mark.pim.tRod.color || "-"],
          ["Holes Dia U.N.O.", formatInches(mark.lug.holeDiameter)]
        ]
      },
      {
        name: "Assembly Control",
        fields: [
          ["Brace overall", formatInches(mark.brace.overallLength, true)],
          ["Keep / Lbh", formatInches(mark.brace.keepLength, true)],
          ["Casing length", formatInches(mark.brace.casingLength, true)],
          ["Tip", formatInches(mark.brace.tip)],
          ["Lug tip to heat", formatInches(mark.brace.lugTipToHeat)],
          ["Half brace", formatInches(mark.brace.centerHalf, true)]
        ]
      },
      {
        name: "Core p02",
        fields: [
          ["Plies", mark.core.plies],
          ["Core plate", plate(mark.core.plyThickness, mark.core.width, mark.core.length)],
          ["Wsg", formatInches(mark.core.gussetWidth)],
          ["Whpsc", formatInches(mark.core.heatPocketWidth)],
          ["rhpsc", formatInches(mark.core.heatPocketRadius)],
          ["Lsg", formatInches(mark.core.gussetLength, true)],
          ["Weld at bolt pattern", weld(mark.core.weldSixteenths)]
        ]
      },
      {
        name: "Lug p03",
        fields: [
          ["Lug plate", plate(mark.lug.thickness, mark.lug.width, mark.lug.length)],
          ["LsL", formatInches(mark.lug.straightLength, true)],
          ["LLg", formatInches(mark.lug.gaugeLength, true)],
          ["Hole pattern", lugHolePattern(mark)],
          ["Hole dia", formatInches(mark.lug.holeDiameter)],
          ["Gage", formatInches(mark.lug.gage)],
          ["rL - br", formatInches(lugRadiusMinusBr(mark))],
          ["WhpL + rhpL", formatInches(lugHeatPocketPlusRadius(mark))],
          ["WL-2e-2g / 2", formatInches(lugClearHalf(mark))],
          ["Hold dimension t'tg", formatInches(corWelds(mark).t_tg)],
          ["Radius", formatInches(mark.lug.radius)]
        ]
      },
      {
        name: "PIM",
        fields: [
          ["T-rod", `${mark.pim.tRod.color} ${formatInches(mark.pim.tRod.height)} high`],
          ["Main PIM", plate(mark.pim.main.thickness, mark.pim.main.width, mark.pim.main.length)],
          ["Transverse PIM", plate(mark.pim.transverse.thickness, mark.pim.transverse.width, mark.pim.transverse.length)],
          ["Main cap strip", `${formatInches(mark.pim.capStrip.width)} edge X ${formatInches(mark.pim.capStrip.length, true)}`],
          ["Transverse cap", `${formatInches(mark.pim.transverseCap.width)} edge X ${formatInches(mark.pim.transverseCap.length, true)}`],
          ["Short cap", `${formatInches(mark.pim.transverseShortCap.width)} edge X ${formatInches(mark.pim.transverseShortCap.length)}`]
        ]
      },
      {
        name: "Welds",
        fields: [
          ["Dstp", weld16(corWelds(mark).Dstp)],
          ["LwL-i", formatSixteenthInches(corWelds(mark).LwL_i)],
          ["LLg", formatSixteenthInches(corWelds(mark).LLg)],
          ["Cor(-) DwL", weld16(corWelds(mark).DwL)],
          ["Cor(-) DwL-i", weld16(corWelds(mark).DwL_i)],
          ["Cor(-) DwLg / bolt pattern", weld16(corWelds(mark).DwLg)],
          ["HSS D cap weld", weld(mark.capPlate.weldSixteenths)]
        ]
      },
      {
        name: "Casing + Cap Plate",
        fields: [
          ["Casing", `${mark.casing.type} X ${formatInches(mark.casing.length, true)}`],
          ["Cap plate", plate(mark.capPlate.thickness, mark.capPlate.width, mark.capPlate.length)],
          ["H2cc", formatInches(mark.capPlate.h2)],
          ["t1cc", formatInches(mark.capPlate.t1)],
          ["t2cc", formatInches(mark.capPlate.t2)],
          ["t3cc / t4cc", `${formatInches(mark.capPlate.t3)} / ${formatInches(mark.capPlate.t4)}`],
          ["Cap weld", weld(mark.capPlate.weldSixteenths)]
        ]
      }
    ];
  }

  function pinnedReviewGroups(mark) {
    return [
      {
        name: "Brace Identity",
        fields: [
          ["Brace mark", `${mark.mark} / ${mark.pieceMark}`],
          ["CB-ID", mark.cbId],
          ["EOR-ID", mark.eorId],
          ["Line / grids", `${mark.line} / ${mark.grids}`],
          ["Levels", mark.levels],
          ["Qty", sourceBraceQuantity(mark)],
          ["Template", "Pinned (2026.04.07)"]
        ]
      },
      {
        name: "Assembly Control",
        fields: [
          ["Brace overall Lb", formatInches(mark.brace.overallLength, true)],
          ["Pin-hole length Lph", formatInches(mark.brace.keepLength, true)],
          ["Core length Lsc", formatInches(mark.core.length, true)],
          ["Casing length", formatInches(mark.casing.length, true)],
          ["Tip", formatInches(mark.brace.tip)],
          ["Edge eL", formatInches(mark.pinned?.edge)]
        ]
      },
      {
        name: `Core ${mark.core.piece || "p02"}`,
        fields: [
          ["Qty", mark.core.qty],
          ["Plies", mark.core.plies],
          ["Core plate", plate(mark.core.plyThickness, mark.core.width, mark.core.length)],
          ["Wsg", formatInches(mark.core.gussetWidth)],
          ["Whpsc", formatInches(mark.core.heatPocketWidth)],
          ["rhpsc", formatInches(mark.core.heatPocketRadius)],
          ["Lhpsc", formatInches(mark.core.gussetLength)]
        ]
      },
      {
        name: `Pinned Lug ${mark.lug.piece || "p33"}`,
        fields: [
          ["Lug plate", plate(mark.lug.thickness, mark.lug.width, mark.lug.length)],
          ["LsL", formatInches(mark.lug.straightLength)],
          ["xL", formatInches(mark.lug.xL)],
          ["LhpL", formatInches(mark.lug.heatPocketLength)],
          ["Wse", formatInches(mark.lug.smallEndWidth)],
          ["rhpL", formatInches(mark.lug.heatPocketRadius)],
          [`Repad ${mark.lug.repadPiece || "p34"}`, `DIA ${formatInches(mark.lug.repadDiameter)} X ${formatInches(mark.lug.repadThickness)}`],
          [`Pin ${mark.lug.pinPiece || "p35"}`, `DIA ${formatInches(mark.lug.pinDiameter)} X ${formatInches(mark.lug.pinLength)}`],
          [`Pin cap ${mark.lug.pinCapPiece || "p46"}`, `DIA ${formatInches(mark.lug.pinCapDiameter)} X ${formatInches(mark.lug.pinCapThickness)}`],
          ["Bolt", mark.pinned?.boltType || "-"]
        ]
      },
      {
        name: "PIM p36-p44",
        fields: [
          ["T-rod", `${mark.pim.tRod.color} ${formatInches(mark.pim.tRod.height)} high`],
          [mark.pim.main.pieces, plate(mark.pim.main.thickness, mark.pim.main.width, mark.pim.main.length)],
          [mark.pim.transverse.pieces, plate(mark.pim.transverse.thickness, mark.pim.transverse.width, mark.pim.transverse.length)],
          [mark.pim.capStrip.piece, `${formatInches(mark.pim.capStrip.width)} edge X ${formatInches(mark.pim.capStrip.length, true)}`],
          [mark.pim.transverseCap.piece, `${formatInches(mark.pim.transverseCap.width)} edge X ${formatInches(mark.pim.transverseCap.length)}`],
          [mark.pim.transverseShortCap.piece, `${formatInches(mark.pim.transverseShortCap.width)} edge X ${formatInches(mark.pim.transverseShortCap.length)}`]
        ]
      },
      {
        name: `Casing ${mark.casing.piece || "p01"} + Cap ${mark.capPlate.piece || "p45"}`,
        fields: [
          ["Casing", `${mark.casing.type} X ${formatInches(mark.casing.length, true)}`],
          ["Casing H x W x t", `${formatInches(mark.casing.height)} X ${formatInches(mark.casing.width)} X ${formatInches(mark.casing.thickness)}`],
          ["Cap plate", plate(mark.capPlate.thickness, mark.capPlate.width, mark.capPlate.length)],
          ["H2cc", formatInches(mark.capPlate.h2)],
          ["t1cc", formatInches(mark.capPlate.t1)],
          ["t2cc", formatInches(mark.capPlate.t2)],
          ["t3cc / t4cc", `${formatInches(mark.capPlate.t3)} / ${formatInches(mark.capPlate.t4)}`],
          ["Cap weld", weld(mark.capPlate.weldSixteenths)]
        ]
      }
    ];
  }

  function arrowDimension(x1, x2, y, text) {
    return `
      <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="fs-dim"></line>
      <line x1="${x1}" y1="${y - 14}" x2="${x1}" y2="${y + 14}" class="fs-dim"></line>
      <line x1="${x2}" y1="${y - 14}" x2="${x2}" y2="${y + 14}" class="fs-dim"></line>
      <path d="M ${x1} ${y} l 12 -5 l 0 10 z" class="fs-arrow"></path>
      <path d="M ${x2} ${y} l -12 -5 l 0 10 z" class="fs-arrow"></path>
      <text x="${(x1 + x2) / 2}" y="${y - 9}" text-anchor="middle" class="fs-dim-text fs-focus-text">${esc(text)}</text>
    `;
  }

  function focusValue(x, y, value, className = "fs-note", anchor = "middle") {
    if (value === null || value === undefined || value === "" || value === "-") return "";
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${className} fs-focus-text">${esc(value)}</text>`;
  }

  function focusLabel(x, y, label, value, anchor = "middle") {
    if (value === null || value === undefined || value === "" || value === "-") return "";
    return `
      <text x="${x}" y="${y}" text-anchor="${anchor}" class="fs-small-callout">${esc(label)}</text>
      <text x="${x}" y="${y + 18}" text-anchor="${anchor}" class="fs-note fs-focus-text">${esc(value)}</text>
    `;
  }

  function weldCallout(x, y, label, value, anchor = "middle") {
    if (value === null || value === undefined || value === "" || value === "-") return "";
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="fs-small-callout fs-focus-text">${esc(label)} ${esc(value)}</text>`;
  }

  function weldBox(x, y, label, value) {
    if (value === null || value === undefined || value === "" || value === "-") return "";
    return `
      <rect x="${x}" y="${y}" width="94" height="36" rx="4" class="fs-weld-box"></rect>
      <text x="${x + 47}" y="${y + 13}" text-anchor="middle" class="fs-weld-label">${esc(label)}</text>
      <text x="${x + 47}" y="${y + 29}" text-anchor="middle" class="fs-weld-value">${esc(value)}</text>
    `;
  }

  function billSvg(mark) {
    const x = 18;
    const y = 22;
    const titleHeight = 38;
    const headerHeight = 46;
    const rowHeight = 19;
    const totalHeight = 24;
    const columns = [
      ["PIECE", 160],
      ["QTY", 66],
      ["SIZE", 306],
      ["LENGTH", 158],
      ["REMARKS", 250],
      ["STEEL", 224],
      ["AML", 78],
      ["SEQ", 70],
      ["WEIGHT", 162],
      ["PC", 52]
    ];
    const width = columns.reduce((sum, column) => sum + column[1], 0);
    const bodyHeight = billRows(mark).length * rowHeight;
    const tableBottom = y + titleHeight + headerHeight + bodyHeight;
    let cursor = x;
    const verticals = columns.map((column) => {
      cursor += column[1];
      return `<line x1="${cursor}" y1="${y + titleHeight}" x2="${cursor}" y2="${tableBottom}" class="fs-bom-line"></line>`;
    }).join("");
    cursor = x;
    const header = columns.map(([label, widthValue]) => {
      const center = cursor + widthValue / 2;
      cursor += widthValue;
      const second = label === "PIECE" ? "MARK" : label === "WEIGHT" ? "LB/QTY" : label === "SIZE" ? "DESCRIPTION" : "";
      return `
        <text x="${center}" y="${y + titleHeight + 18}" text-anchor="middle" class="fs-bom-head">${label}</text>
        ${second ? `<text x="${center}" y="${y + titleHeight + 36}" text-anchor="middle" class="fs-bom-subhead">${second}</text>` : ""}
      `;
    }).join("");
    const rowLines = billRows(mark).map((row, index) => {
      const baseline = y + titleHeight + headerHeight + rowHeight * index + 14;
      const lineY = y + titleHeight + headerHeight + rowHeight * (index + 1);
      if (row.spacer) return `<line x1="${x}" y1="${lineY}" x2="${x + width}" y2="${lineY}" class="fs-bom-line"></line>`;
      const values = [row.piece, row.qty, row.size, row.length, row.remarks, row.steel, row.aml, row.seq, row.weight, row.pc];
      let cellX = x;
      const texts = values.map((value, cellIndex) => {
        const left = cellX + (cellIndex === 1 || cellIndex >= 6 ? columns[cellIndex][1] / 2 : 4);
        const anchor = cellIndex === 1 || cellIndex >= 6 ? "middle" : "start";
        const cell = `<text x="${left}" y="${baseline}" text-anchor="${anchor}" class="fs-bom-cell fs-bom-cell-${cellIndex}">${esc(value || "")}</text>`;
        cellX += columns[cellIndex][1];
        return cell;
      }).join("");
      return `${texts}<line x1="${x}" y1="${lineY}" x2="${x + width}" y2="${lineY}" class="fs-bom-line"></line>`;
    }).join("");
    return `
      <rect x="${x}" y="${y}" width="${width}" height="${titleHeight + headerHeight + bodyHeight + totalHeight}" class="fs-bom-table"></rect>
      <line x1="${x}" y1="${y + titleHeight}" x2="${x + width}" y2="${y + titleHeight}" class="fs-bom-line"></line>
      <line x1="${x}" y1="${y + titleHeight + headerHeight}" x2="${x + width}" y2="${y + titleHeight + headerHeight}" class="fs-bom-line"></line>
      ${verticals}
      <text x="${x + width / 2}" y="${y + 28}" text-anchor="middle" class="fs-bom-title">BILL OF MATERIAL</text>
      ${header}
      ${rowLines}
      <line x1="${x}" y1="${tableBottom}" x2="${x + width}" y2="${tableBottom}" class="fs-bom-line"></line>
      <text x="${x + width - 270}" y="${tableBottom + 17}" text-anchor="end" class="fs-bom-total">TOTAL SHIPPING WEIGHT OF BRACE</text>
      <text x="${x + width - 64}" y="${tableBottom + 17}" text-anchor="end" class="fs-bom-total">${esc(mark.totalShippingWeight || "")}</text>
    `;
  }

  function pinnedSheetSvg(mark) {
    const overall = formatInches(mark.brace.overallLength, true);
    const pinLength = formatInches(mark.brace.keepLength, true);
    const coreLength = formatInches(mark.core.length, true);
    const casing = `${mark.casing.type} X ${formatInches(mark.casing.length, true)}`;
    const lugPlate = `${mark.lug.piece || "p33"}: PL ${formatInches(mark.lug.thickness)} X ${formatInches(mark.lug.width)} X ${formatInches(mark.lug.length)}`;
    const pin = `${mark.lug.pinPiece || "p35"}: DIA ${formatInches(mark.lug.pinDiameter)} X ${formatInches(mark.lug.pinLength)}`;
    return `
      <rect x="12" y="12" width="1576" height="836" class="fs-paper"></rect>
      ${billSvg(mark)}
      <g transform="translate(0 18)">
        <rect x="28" y="500" width="1536" height="310" class="fs-frame"></rect>
        <text x="50" y="526" class="fs-heading">PINNED BRACE ASSEMBLY REVIEW</text>
        ${arrowDimension(120, 1480, 558, overall)}
        ${arrowDimension(190, 1410, 598, `Lph ${pinLength}`)}
        <line x1="100" y1="686" x2="1500" y2="686" class="fs-center"></line>
        <path d="M128 646 H330 L390 620 H1210 L1270 646 H1472 V726 H1270 L1210 752 H390 L330 726 H128 Z" class="fs-core"></path>
        <rect x="420" y="635" width="760" height="102" rx="48" class="fs-casing"></rect>
        <circle cx="210" cy="686" r="58" class="fs-core"></circle>
        <circle cx="210" cy="686" r="22" class="fs-paper"></circle>
        <circle cx="1390" cy="686" r="58" class="fs-core"></circle>
        <circle cx="1390" cy="686" r="22" class="fs-paper"></circle>
        ${focusValue(800, 654, casing, "fs-note")}
        ${focusValue(800, 714, `CORE ${mark.core.piece || "p02"} X ${coreLength}`, "fs-note")}
        ${focusValue(260, 776, lugPlate, "fs-small-callout", "start")}
        ${focusValue(1340, 776, pin, "fs-small-callout", "end")}
        ${focusLabel(210, 624, mark.lug.repadPiece || "p34", `DIA ${formatInches(mark.lug.repadDiameter)}`)}
        ${focusLabel(1390, 624, mark.lug.pinCapPiece || "p46", `DIA ${formatInches(mark.lug.pinCapDiameter)}`)}
      </g>
    `;
  }

  function sheetSvg(mark) {
    if (mark.templateType === "pinned") return pinnedSheetSvg(mark);
    const overall = formatInches(mark.brace.overallLength, true);
    const keep = formatInches(mark.brace.keepLength, true);
    const casing = formatInches(mark.casing.length, true);
    const pipe = `${mark.casing.type} X ${casing}`;
    const holePattern = lugHolePattern(mark);
    const boltPatternLength = sourceLugValue(mark, "s*(ni-1)", (mark.lug.ni + mark.lug.no - 1) * lugHoleSpacing(mark));
    const weldData = corWelds(mark);
    const weldAtPattern = weld16(weldData.DwL);
    const weldInner = weld16(weldData.DwL_i);
    const weldBoltPattern = weld16(weldData.DwLg);
    const dstp = weld16(weldData.Dstp);
    const lwlInner = formatSixteenthInches(weldData.LwL_i);
    const llg = formatSixteenthInches(weldData.LLg);
    const holdDimension = formatInches(weldData.t_tg);
    const capWeld = weld(mark.capPlate.weldSixteenths);
    const hasOutsideHoleRows = Number(mark.lug.no || 0) > 0 && Number(mark.lug.gage || 0) > 0;
    const leftTopDim = hasOutsideHoleRows ? formatInches(lugRadiusMinusBr(mark)) : formatInches(mark.lug.edge);
    const leftMiddleDim = hasOutsideHoleRows ? formatInches(mark.lug.gage) : formatInches(lugClearHalf(mark));
    const leftLowerDim = hasOutsideHoleRows ? formatInches(lugClearHalf(mark)) : formatInches(mark.lug.edge);
    const firstHole = sourceLugValue(mark, "rL-br", lugRadiusMinusBr(mark));
    const endOffset = formatInches(mark.lug.offsetA);
    const edgeDistance = formatInches(mark.lug.edge);
    return `
      <rect x="12" y="12" width="1576" height="836" class="fs-paper"></rect>
      ${billSvg(mark)}

      <g transform="translate(0 92)">
      <rect x="28" y="370" width="1536" height="390" class="fs-frame"></rect>
      <text x="50" y="384" class="fs-heading">FLAT PLATE ASSEMBLY DETAIL</text>
      ${arrowDimension(112, 1005, 422, overall)}
      ${arrowDimension(182, 935, 462, keep)}
      <line x1="94" y1="566" x2="1018" y2="566" class="fs-center"></line>
      <path d="M112 535 H282 L336 506 H782 L836 535 H1005 V597 H836 L782 626 H336 L282 597 H112 Z" class="fs-core"></path>
      <rect x="314" y="516" width="490" height="100" rx="45" class="fs-casing"></rect>
      <path d="M112 522 L202 494 L336 494 L282 535 H112 Z" class="fs-lug"></path>
      <path d="M112 610 L282 597 L336 638 H202 L112 610 Z" class="fs-lug"></path>
      <path d="M1005 522 L915 494 L782 494 L836 535 H1005 Z" class="fs-lug"></path>
      <path d="M1005 610 L836 597 L782 638 H915 L1005 610 Z" class="fs-lug"></path>
      <rect x="175" y="530" width="120" height="16" class="fs-pim"></rect>
      <rect x="175" y="586" width="120" height="16" class="fs-pim"></rect>
      <rect x="825" y="530" width="120" height="16" class="fs-pim"></rect>
      <rect x="825" y="586" width="120" height="16" class="fs-pim"></rect>
      <circle cx="202" cy="511" r="8" class="fs-hole"></circle>
      <circle cx="302" cy="511" r="8" class="fs-hole"></circle>
      <circle cx="868" cy="511" r="8" class="fs-hole"></circle>
      <circle cx="911" cy="511" r="8" class="fs-hole"></circle>
      <circle cx="954" cy="511" r="8" class="fs-hole"></circle>
      ${focusValue(560, 484, pipe, "fs-callout")}
      <line x1="96" y1="438" x2="96" y2="536" class="fs-dim"></line>
      <line x1="96" y1="438" x2="202" y2="438" class="fs-dim"></line>
      <line x1="96" y1="536" x2="202" y2="536" class="fs-dim"></line>
      <line x1="202" y1="428" x2="202" y2="522" class="fs-dim"></line>
      <line x1="302" y1="428" x2="302" y2="522" class="fs-dim"></line>
      <line x1="382" y1="428" x2="382" y2="522" class="fs-dim"></line>
      <line x1="164" y1="452" x2="202" y2="452" class="fs-dim"></line>
      <line x1="202" y1="452" x2="302" y2="452" class="fs-dim"></line>
      <line x1="302" y1="452" x2="382" y2="452" class="fs-dim"></line>
      ${focusValue(72, 456, leftTopDim, "fs-note", "end")}
      ${focusValue(72, 492, leftMiddleDim, "fs-note", "end")}
      ${focusValue(72, 528, leftLowerDim, "fs-note", "end")}
      ${hasOutsideHoleRows ? focusValue(1005, 492, formatInches(mark.lug.gage), "fs-note") : ""}
      ${focusValue(1025, 542, formatInches(mark.lug.edge), "fs-note", "start")}
      ${focusValue(1025, 604, formatInches(mark.lug.edge), "fs-note", "start")}
      ${focusValue(978, 566, formatInches(lugHeatPocketPlusRadius(mark)), "fs-note", "end")}
      ${focusValue(168, 430, firstHole, "fs-note")}
      ${focusValue(252, 430, boltPatternLength, "fs-note")}
      ${focusValue(342, 430, endOffset, "fs-note")}
      ${focusValue(817, 488, formatInches(mark.lug.offsetA), "fs-note")}
      ${focusValue(292, 486, edgeDistance, "fs-note")}
      ${focusValue(840, 512, formatInches(mark.lug.edge), "fs-note")}
      ${focusValue(896, 454, `LLg ${formatSixteenthInches(mark.lug.gaugeLength)}`, "fs-small-callout")}
      ${focusValue(896, 478, holePattern, "fs-small-callout")}
      ${focusLabel(914, 642, "TYP @ OUTSIDE FACE OF LUG", weldAtPattern)}
      ${focusLabel(560, 642, "TYP @ BOLT PATTERN", weldBoltPattern)}

      <text x="1155" y="430" class="fs-heading">WELDS</text>
      ${weldBox(1130, 458, "Dstp", dstp)}
      ${weldBox(1234, 458, "DwL-i", weldInner)}
      ${weldBox(1338, 458, "DwLg", weldBoltPattern)}
      ${weldBox(1130, 506, "DwL", weldAtPattern)}
      ${weldBox(1234, 506, "LwL-i", lwlInner)}
      ${weldBox(1338, 506, "LLg", llg)}

      </g>
    `;
  }

  function renderBom(mark) {
    const rows = billRows(mark);
    if (els.bomColor) els.bomColor.textContent = mark.pim.tRod.color || "-";
    if (els.bomHole) els.bomHole.textContent = formatInches(mark.lug.holeDiameter);
    els.bom.innerHTML = `
      <div class="full-bom-head"><span>Piece Mark</span><span>Qty</span><span>Size / Description</span><span>Length</span><span>Remarks</span><span>Steel Grade</span><span>AML #</span><span>Seq</span><span>Weight LB/QTY</span><span>PC</span></div>
      ${rows.map((row) => row.spacer
        ? `<div class="full-bom-row spacer" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>`
        : `<div class="full-bom-row"><b>${esc(row.piece)}</b><span>${esc(row.qty)}</span><span>${esc(row.size)}</span><span>${esc(row.length)}</span><span>${esc(row.remarks)}</span><span>${esc(row.steel)}</span><span>${esc(row.aml)}</span><span>${esc(row.seq)}</span><span>${esc(row.weight)}</span><span>${esc(row.pc)}</span></div>`).join("")}
      <div class="full-bom-total"><span>Total Shipping Weight Of Brace</span><b>${esc(mark.totalShippingWeight || "-")}</b></div>
    `;
  }

  function checkedCount() {
    return state.checked.size;
  }

  function allChecks(mark) {
    return reviewGroups(mark).reduce((sum, group) => sum + group.fields.length, 0);
  }

  function renderChecks(mark) {
    els.checks.innerHTML = reviewGroups(mark).map((group, groupIndex) => `
      <section class="full-check-group">
        <h3>${esc(group.name)}</h3>
        <div>
          ${group.fields.map(([label, value], fieldIndex) => {
            const id = `${mark.mark}-${groupIndex}-${fieldIndex}`;
            return `
              <label class="full-check-field ${state.checked.has(id) ? "checked" : ""}">
                <input type="checkbox" data-check="${esc(id)}" ${state.checked.has(id) ? "checked" : ""}>
                <span><b>${esc(label)}</b>${esc(value)}</span>
              </label>
            `;
          }).join("")}
        </div>
      </section>
    `).join("");
  }

  function renderMeta(mark) {
    if (!els.meta) return;
    els.meta.innerHTML = `
      <span><b>Workbook</b>${esc(mark.workbook || "-")}</span>
      <span><b>Source Sheets</b>${mark.sourceSheets.map(esc).join(" + ")}</span>
      <span><b>PDF Reference</b>BRACE ${esc(mark.mark)}.pdf</span>
      <span><b>Review Scope</b>BOM, assembly control, lug, PIM, casing, cap plate</span>
    `;
  }

  function render() {
    const mark = current();
    els.total.textContent = marks.length;
    els.shown.textContent = state.visible.length;
    if (!mark) {
      els.title.textContent = "No full sheet marks";
      els.count.textContent = "0 of 0";
      els.svg.innerHTML = "";
      els.bom.innerHTML = "";
      if (els.bomColor) els.bomColor.textContent = "-";
      if (els.bomHole) els.bomHole.textContent = "-";
      if (els.meta) els.meta.innerHTML = "";
      els.checks.innerHTML = "";
      els.reviewed.textContent = "0";
      els.open.textContent = "0";
      els.status.textContent = "No Full Sheet marks match the filter.";
      return;
    }
    els.eyebrow.textContent = `${mark.cbId} | ${mark.eorId} | ${mark.line} | ${mark.grids}`;
    els.title.textContent = `Brace ${mark.pieceMark} | Mark ${mark.mark}`;
    els.count.textContent = `${state.active + 1} of ${state.visible.length}`;
    els.svg.innerHTML = sheetSvg(mark);
    renderBom(mark);
    renderMeta(mark);
    renderChecks(mark);
    els.reviewed.textContent = checkedCount();
    els.open.textContent = Math.max(0, allChecks(mark) - checkedCount());
    els.status.textContent = `Full Sheet ${mark.mark} joins ${mark.sourceSheets.join(", ")} for one-by-one drawing comparison.`;
  }

  function applyFilter() {
    const wanted = parseFilter(els.input.value);
    state.visible = wanted.length ? marks.filter((mark) => wanted.includes(String(mark.mark))) : marks;
    state.active = 0;
    render();
  }

  els.show.addEventListener("click", applyFilter);
  els.reset.addEventListener("click", () => {
    els.input.value = "";
    state.visible = marks;
    state.active = 0;
    render();
  });
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
  els.checks.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-check]");
    if (!checkbox) return;
    if (checkbox.checked) state.checked.add(checkbox.dataset.check);
    else state.checked.delete(checkbox.dataset.check);
    render();
  });

  render();
})();
