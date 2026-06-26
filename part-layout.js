(function () {
  const commonVariables = [
    "CB-ID",
    "EOR-ID",
    "Line",
    "Grids",
    "Lvls",
    "Mark",
    "Qty",
    "Piece"
  ];

  const operationVariables = [
    "Hcc-Dwl",
    "H2cc - DwL",
    "H1cc - H2cc - t1cc",
    "Lsc-2*Lsg",
    "WL-2e-2g",
    "(WL-2e-2g)/2",
    "LL-LsL",
    "s*(ni-1)",
    "LLg-rL",
    "rL-br"
  ];

  const connSchedVariables = [
    "CB-ID",
    "EOR-ID",
    "Line",
    "Grids",
    "Lvls",
    "Mark",
    "Qty",
    "WWP",
    "HWP",
    "Lbh",
    "Lbh ft-in",
    "Lwp-h",
    "Lwp-h ft-in",
    "ni",
    "no",
    "e",
    "s",
    "gi",
    "go",
    "dhg",
    "Bottom Flange Wb",
    "Bottom Flange Lwb",
    "Bottom Flange Wc",
    "Bottom Flange Lwc",
    "Bottom Flange Lgb",
    "Bottom Flange Lgc",
    "Bottom V Wb",
    "Bottom V Lwb",
    "Bottom V Lgb",
    "Bottom V Lgc",
    "Top Flange Wb",
    "Top Flange Lwb",
    "Top Flange Wc",
    "Top Flange Lwc",
    "Top Flange Ext",
    "Top Flange Lgb",
    "Top Flange Lgc",
    "Top Chev Wb",
    "Top Chev Lwb",
    "Top Chev Lgb",
    "Top Chev Lgc"
  ];

  const partVariables = {
    p01: ["Type", "Lc", "Hc", "Wc", "tc", "W1cc", "H1cc", "H2cc", "t1cc", "t2cc", "t3cc", "t4cc", "rcc", "tcc", "DwL", "DwL-i", "Dwcc"],
    p02: ["Qty", "Lsc", "Fy min", "Fy max", "Wsc", "Wt", "Lst", "xt1", "W3", "# Plies", "tply", "tsc", "Wsg", "Whpsc", "rhpsc", "Lsg", "Perf Core", "Wsc.2", "Float", "Lperf", "nperf", "WPfT", "LPfT", "Delta e1", "Delta e2", "Delta e3-F", "Delta s"],
    p03: ["Qty", "LL", "WL", "tL", "LsL", "LLg", "a", "LFC", "LhpL", "W1", "WhpL", "rhpL", "W'se", "br", "e", "rL", "ni", "no", "s", "g", "dh", "Eccentric Pin", "Ecc Pin Other End", "WL-Bulb", "r1", "r2", "LTotal", "xL", "thpL", "Wse", "Repad Piece", "Repad Qty", "drL", "dph", "dphc", "trL", "Pin Piece", "Pin Qty", "dp", "Lp", "Pin Cap Piece", "Pin Cap Qty", "dpc", "tpc", "Grade", "Bolt Dia"],
    p04: ["Type", "Qty", "tstp", "Wstp", "Hstp", "Dstp", "tp04a", "Wp04a", "Hp04a", "t'tg", "LwL-i", "LLg", "DwL", "DwL-i", "DwLg"],
    p05: ["tcst", "Wcst", "Lcst", "Dcst", "DwL", "DwL-i", "DwLg"],
    p08: ["Qty EA", "Material", "Lttp", "Lstp", "xtp", "W''se", "Wtp", "tp08,09-Pim"],
    p09: ["Qty EA", "Material", "Lttp", "Lstp", "xtp", "W''se", "Wtp", "tp08,09-Pim"],
    p10: ["Qty", "Strip", "Lcp", "Wp10-Cap", "tp10-Cap"],
    p11: ["Qty", "Lctp", "Lcxp", "Wp11", "tp11"],
    p12: ["Lcxp", "Wp12", "tp12"],
    p13: ["Qty", "Strip", "Lcp13", "Wp13", "tp13"],
    p14: ["Qty", "Strip", "Lcp14", "Wp14", "tp14"]
  };

  const labels = {
    p01: "P01 Variable Layout",
    p02: "P02 Variable Layout",
    p03: "P03 Variable Layout",
    p04: "P04 Variable Layout",
    p05: "P05 Variable Layout",
    p08: "P08 Variable Layout",
    p09: "P09 Variable Layout",
    p10: "P10 Variable Layout",
    p11: "P11 Variable Layout",
    p12: "P12 Variable Layout",
    p13: "P13 Variable Layout",
    p14: "P14 Variable Layout",
    connSched: "Conn Sched Variable Layout",
    lbTab: "LB Tab Variable Layout"
  };

  const defaultLayouts = {
    connSched: [
      { name: "CB-ID", left: "24px", top: "24px", locked: true },
      { name: "Mark", left: "24px", top: "100px", locked: true },
      { name: "Qty", left: "24px", top: "176px", locked: true },
      { name: "WWP", left: "230px", top: "64px", locked: true },
      { name: "HWP", left: "420px", top: "64px", locked: true },
      { name: "Lbh", left: "610px", top: "64px", locked: true },
      { name: "Lwp-h", left: "800px", top: "64px", locked: true },
      { name: "ni", left: "230px", top: "210px", locked: true },
      { name: "no", left: "350px", top: "210px", locked: true },
      { name: "e", left: "470px", top: "210px", locked: true },
      { name: "s", left: "590px", top: "210px", locked: true },
      { name: "Bottom Flange Wb", left: "230px", top: "360px", locked: true },
      { name: "Top Flange Wb", left: "590px", top: "360px", locked: true }
    ],
    lbTab: [
      { name: "CB-ID", left: "24px", top: "24px", locked: true },
      { name: "Mark", left: "24px", top: "100px", locked: true },
      { name: "Frame", left: "24px", top: "176px", locked: true },
      { name: "Line", left: "190px", top: "24px", locked: true },
      { name: "Grids", left: "360px", top: "24px", locked: true },
      { name: "Lvls", left: "530px", top: "24px", locked: true },
      { name: "Qty", left: "700px", top: "24px", locked: true },
      { name: "WWP", left: "190px", top: "180px", locked: true },
      { name: "HTOS,n", left: "380px", top: "180px", locked: true },
      { name: "HWP", left: "570px", top: "180px", locked: true },
      { name: "Lwp", left: "760px", top: "180px", locked: true },
      { name: "Lbh", left: "570px", top: "330px", locked: true }
    ],
    p01: [
      { name: "Lc", left: "400px", top: "260px", locked: true },
      { name: "Wc", left: "710px", top: "268px", locked: true },
      { name: "Hc", left: "780px", top: "210px", locked: true }
    ],
    p11: [
      { name: "Lctp", left: "360px", top: "118px", locked: true },
      { name: "Lcxp", left: "560px", top: "118px", locked: true },
      { name: "Wp11", left: "520px", top: "258px", locked: true },
      { name: "tp11", left: "700px", top: "312px", locked: true },
      { name: "Qty", left: "120px", top: "356px", locked: true },
      { name: "Mark", left: "120px", top: "468px", locked: true }
    ]
  };

  const staleLayouts = {
    p10: ["Lcp", "Wp10-Cap", "tp10-Cap", "Qty", "Strip", "Mark"]
  };

  const unique = (items) => Array.from(new Set(items.filter(Boolean)));
  const cleanKey = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

  const aliases = {
    hccdwl: "h2ccdwl",
    h2ccdwL: "h2ccdwl",
    h2ccdwl: "h2ccdwl",
    h1cch2cct1cc: "h1cch2cct1cc",
    dwl: "dwl",
    dwli: "dwli",
    dwcc: "dwcc"
  };

  function variablesFor(part, rows = []) {
    if (part === "connSched") {
      const available = new Set(rows.flatMap((row) => Object.keys(row || {}).filter((key) => !key.startsWith("_"))));
      return connSchedVariables.filter((name) => available.has(name));
    }
    if (part === "lbTab") {
      return unique(rows.flatMap((row) => Object.keys(row || {}).filter((key) => !key.startsWith("_"))));
    }
    return unique([
      ...commonVariables,
      ...(partVariables[part] || []),
      ...operationVariables
    ]);
  }

  function parsePipeTable(text) {
    const rows = String(text || "").trim().split(/\r?\n/).filter(Boolean).map((line) => line.split("|"));
    const headers = rows.shift() || [];
    return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
  }

  function formatNumber(value) {
    if (value === null || value === undefined || value === "" || value === "-") return "-";
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    const sixteenths = Math.round(number * 16);
    const inches = Math.floor(sixteenths / 16);
    const fraction = sixteenths % 16;
    if (!fraction) return String(inches);
    const divisor = gcd(fraction, 16);
    const fractionText = `${fraction / divisor}/${16 / divisor}`;
    return inches ? `${inches} ${fractionText}` : fractionText;
  }

  function gcd(a, b) {
    return b ? gcd(b, a % b) : Math.abs(a) || 1;
  }

  function identityFromMark(mark) {
    return {
      "CB-ID": mark.cbId,
      "EOR-ID": mark.eorId,
      Line: mark.line,
      Grids: mark.grids,
      Lvls: mark.levels,
      Mark: mark.mark
    };
  }

  function generatedRows(part) {
    const marks = Array.isArray(window.FULL_SHEET_MARKS) ? window.FULL_SHEET_MARKS : [];
    return marks.map((mark) => {
      const id = identityFromMark(mark);
      if (part === "p04" && Number(mark.stopper?.qty || 0) > 0) {
        return {
          ...id,
          Piece: mark.stopper.piece,
          Type: mark.stopper.type,
          Qty: mark.stopper.qty,
          tstp: formatNumber(mark.stopper.thickness),
          Wstp: formatNumber(mark.stopper.width),
          Hstp: formatNumber(mark.stopper.height),
          Dstp: formatNumber(mark.stopper.distance)
        };
      }
      if (part === "p05" && Number(mark.stiffener?.qty || 0) > 0) {
        return {
          ...id,
          Piece: mark.stiffener.piece,
          Qty: mark.stiffener.qty,
          tcst: formatNumber(mark.stiffener.thickness),
          Wcst: formatNumber(mark.stiffener.width),
          Lcst: formatNumber(mark.stiffener.length),
          Dcst: formatNumber(mark.stiffener.distance)
        };
      }
      if ((part === "p08" || part === "p09") && mark.pim?.transverse) {
        return {
          ...id,
          Piece: part === "p08" ? mark.pim.transverse.pieceA : mark.pim.transverse.pieceB,
          "Qty EA": part === "p08" ? Math.ceil(Number(mark.pim.transverse.qty || 0) / 2) : Math.floor(Number(mark.pim.transverse.qty || 0) / 2),
          Material: mark.pim.transverse.grade,
          Lttp: formatNumber(mark.pim.transverse.length),
          Lstp: formatNumber(mark.pim.transverse.stopLength),
          xtp: formatNumber(mark.pim.transverse.xtp),
          "W''se": formatNumber(mark.pim.transverse.smallEndWidth),
          Wtp: formatNumber(mark.pim.transverse.width),
          "tp08,09-Pim": formatNumber(mark.pim.transverse.thickness)
        };
      }
      if (part === "p10" && mark.pim?.capStrip) {
        return {
          ...id,
          Piece: mark.pim.capStrip.piece,
          Qty: mark.pim.capStrip.qty,
          Strip: mark.pim.capStrip.material,
          Lcp: formatNumber(mark.pim.capStrip.length),
          "Wp10-Cap": formatNumber(mark.pim.capStrip.width),
          "tp10-Cap": formatNumber(mark.pim.capStrip.thickness)
        };
      }
      if (part === "p11" && mark.pim?.transverseCap) {
        return {
          ...id,
          Piece: mark.pim.transverseCap.piece,
          Qty: mark.pim.transverseCap.qty,
          Lctp: formatNumber(mark.pim.transverseCap.length),
          Lcxp: formatNumber(mark.pim.transverseShortCap?.length),
          Wp11: formatNumber(mark.pim.transverseCap.width),
          tp11: formatNumber(mark.pim.transverseCap.thickness)
        };
      }
      if (part === "p12" && mark.pim?.transverseShortCap) {
        return {
          ...id,
          Piece: mark.pim.transverseShortCap.piece,
          Qty: mark.pim.transverseShortCap.qty,
          Lcxp: formatNumber(mark.pim.transverseShortCap.length),
          Wp12: formatNumber(mark.pim.transverseShortCap.width),
          tp12: formatNumber(mark.pim.transverseShortCap.thickness)
        };
      }
      if (part === "p13" && Number(mark.pim?.widenedCap?.qty || 0) > 0) {
        return {
          ...id,
          Piece: mark.pim.widenedCap.piece,
          Qty: mark.pim.widenedCap.qty,
          Strip: mark.pim.widenedCap.material,
          Lcp13: formatNumber(mark.pim.widenedCap.length),
          Wp13: formatNumber(mark.pim.widenedCap.width),
          tp13: formatNumber(mark.pim.widenedCap.thickness)
        };
      }
      if (part === "p14" && Number(mark.pim?.transitionCap?.qty || 0) > 0) {
        return {
          ...id,
          Piece: mark.pim.transitionCap.piece,
          Qty: mark.pim.transitionCap.qty,
          Strip: mark.pim.transitionCap.material,
          Lcp14: formatNumber(mark.pim.transitionCap.length),
          Wp14: formatNumber(mark.pim.transitionCap.width),
          tp14: formatNumber(mark.pim.transitionCap.thickness)
        };
      }
      return null;
    }).filter(Boolean);
  }

  function sourceRows(part) {
    if (part === "connSched" && Array.isArray(window.connSchedRows)) return window.connSchedRows;
    if (part === "lbTab" && Array.isArray(window.lbRows)) return window.lbRows;
    if (part === "p01") {
      if (Array.isArray(window.hssRows)) return window.hssRows;
      if (typeof hssTable !== "undefined") return parsePipeTable(hssTable);
    }
    if (part === "p02" && Array.isArray(window.coreRows)) return window.coreRows;
    if (part === "p03" && Array.isArray(window.lugRows)) return window.lugRows;
    if (part === "p06" && Array.isArray(window.p06Rows)) return window.p06Rows;
    if (part === "p07" && Array.isArray(window.p07Rows)) return window.p07Rows;
    return generatedRows(part);
  }

  function braceValue(row) {
    const key = Object.keys(row || {}).find((name) => ["brace", "bracemark", "braceid", "braceno", "bracenumber"].includes(cleanKey(name)));
    return key ? String(row[key] ?? "").trim() : "";
  }

  function rowIdentity(row, part) {
    if (!row) return "";
    return part === "connSched" || part === "lbTab"
      ? String(row._braceIdentity || braceValue(row)).trim()
      : String(row.Mark || "").trim();
  }

  function rowLabel(row, part) {
    if (!row) return "";
    if (part === "connSched" || part === "lbTab") return [row["CB-ID"], row.Mark].filter((value) => value !== undefined && value !== "").join(" | ");
    return String(row.Mark || "").trim();
  }

  function combineRows(rows, part) {
    const groups = new Map();
    rows.forEach((row) => {
      const key = rowIdentity(row, part);
      if (!key.trim()) return;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    });
    return [...groups.values()].map((items) => {
      const row = { ...items[0], _matches: items.length };
      row.Qty = items.reduce((sum, item) => sum + (Number(item.Qty) || 0), 0) || row.Qty;
      if (row["Cap Qty"] !== undefined) row["Cap Qty"] = items.reduce((sum, item) => sum + (Number(item["Cap Qty"]) || 0), 0) || row["Cap Qty"];
      return row;
    }).sort((a, b) => rowIdentity(a, part).localeCompare(rowIdentity(b, part), undefined, { numeric: true, sensitivity: "base" }));
  }

  function valueFor(row, variable) {
    if (!row) return "-";
    const wanted = aliases[cleanKey(variable)] || cleanKey(variable);
    const key = Object.keys(row).find((name) => {
      const clean = cleanKey(name);
      return clean === wanted || aliases[clean] === wanted;
    });
    const value = key ? row[key] : "";
    return value === null || value === undefined || value === "" ? "-" : String(value);
  }

  function parseMeasure(value) {
    const text = String(value ?? "").trim().replace(/"/g, "").replace(/''/g, "").replace(/\s+/g, " ");
    if (!text || text === "-") return null;
    const feet = text.match(/^(\d+)\s*'\s*-?\s*(.*)$/);
    if (feet) {
      const rest = feet[2].trim();
      return Number(feet[1]) * 12 + (parseMeasure(rest) || 0);
    }
    const parts = text.split(/\s+/);
    let total = 0;
    for (const part of parts) {
      if (!part) continue;
      const fraction = part.match(/^(\d+)\/(\d+)$/);
      if (fraction) {
        total += Number(fraction[1]) / Number(fraction[2]);
      } else {
        const number = Number(part);
        if (!Number.isFinite(number)) return null;
        total += number;
      }
    }
    return total;
  }

  function feetInchesText(value) {
    const total = parseMeasure(value);
    if (total === null || total < 12) return "";
    const sixteenths = Math.round(total * 16);
    const feet = Math.floor(sixteenths / 192);
    const rest = sixteenths - feet * 192;
    const inches = Math.floor(rest / 16);
    const fraction = rest % 16;
    const divisor = fraction ? gcd(fraction, 16) : 1;
    const fractionText = fraction ? `${fraction / divisor}/${16 / divisor}` : "";
    const inchBase = feet ? inches : inches || (!fractionText ? 0 : "");
    const inchText = [inchBase, fractionText].filter((part) => part !== "").join(" ");
    return `${feet}'-${inchText || "0"}"`;
  }

  function chipDisplay(row, variable, part) {
    const value = valueFor(row, variable);
    const typedSpreadsheet = part === "connSched" || part === "lbTab";
    const nonMeasureVariables = new Set([
      "CB-ID", "EOR-ID", "Line", "Grids", "Lvls", "Mark", "Qty", "Qty EA", "BraceQty", "Piece",
      "Type", "Material", "Strip", "Color", "Grade", "Bolt Dia", "# Plies", "Perf Core", "nperf",
      "ni", "no", "Repad Piece", "Repad Qty", "Pin Piece", "Pin Qty", "Pin Cap Piece", "Pin Cap Qty",
      "Fy min", "Fy max"
    ]);
    const canShowFeet = !nonMeasureVariables.has(variable)
      && (!typedSpreadsheet || (Array.isArray(row?._inchFields) && row._inchFields.includes(variable)));
    const feet = canShowFeet && !String(value).includes("'") ? feetInchesText(value) : "";
    return { value, feet };
  }

  function updateLockButton(button, locked) {
    if (!button) return;
    button.textContent = locked ? "\uD83D\uDD12" : "\uD83D\uDD13";
    button.title = locked ? "Unlock variable" : "Lock variable";
    button.setAttribute("aria-label", locked ? "Unlock variable" : "Lock variable");
  }

  function setupPartLayout(section) {
    const part = section.dataset.part;
    const source = sourceRows(part);
    const variables = variablesFor(part, source);
    const sourcePieces = unique(source.map((row) => row?.Piece));
    const pieceSuffix = sourcePieces.length && !sourcePieces.includes(part) ? ` (${sourcePieces.join(" / ")})` : "";
    const title = `${labels[part] || `${part.toUpperCase()} Variable Layout`}${pieceSuffix}`;
    const rows = combineRows(source, part);
    const itemName = part === "connSched" || part === "lbTab" ? "Brace" : "Mark";
    const storageKey = `tools_collection.partLayout.${part}`;
    const state = { active: 0 };

    section.innerHTML = `
      <div class="part-layout-head">
        <div>
          <h2>${title}</h2>
          <p class="note">Use variable names only. Add a variable, drag it on the blank canvas, then lock it when the location feels right.</p>
        </div>
        <div class="part-layout-actions">
          <button class="part-prev-mark" type="button" aria-label="Previous ${itemName.toLowerCase()}">&lt;</button>
          <strong class="part-mark-title">No ${itemName.toLowerCase()}s</strong>
          <button class="part-next-mark" type="button" aria-label="Next ${itemName.toLowerCase()}">&gt;</button>
          <label class="part-field">
            <span>Variable</span>
            <select class="part-variable-select"></select>
          </label>
          <button class="part-add-variable" type="button">Agregar variable</button>
          <label class="part-lock-all">
            <input class="part-lock-toggle" type="checkbox">
            <span>Fijar todo</span>
          </label>
          <button class="part-clear-canvas" type="button">Limpiar</button>
        </div>
      </div>
      <div class="part-variable-library" aria-label="Variable list"></div>
      <div class="part-canvas-wrap">
        <div class="part-canvas" aria-label="Blank variable placement canvas">
          <span class="part-canvas-hint">Canvas en blanco: agrega variables y arrastralas donde quieras.</span>
        </div>
      </div>
    `;

    const select = section.querySelector(".part-variable-select");
    const library = section.querySelector(".part-variable-library");
    const canvas = section.querySelector(".part-canvas");
    const addButton = section.querySelector(".part-add-variable");
    const clearButton = section.querySelector(".part-clear-canvas");
    const lockToggle = section.querySelector(".part-lock-toggle");
    const prevButton = section.querySelector(".part-prev-mark");
    const nextButton = section.querySelector(".part-next-mark");
    const markTitle = section.querySelector(".part-mark-title");

    function activeRow() {
      if (!rows.length) return null;
      state.active = Math.max(0, Math.min(state.active, rows.length - 1));
      return rows[state.active];
    }

    function saveLayout() {
      const payload = {
        locked: lockToggle.checked,
        chips: [...canvas.querySelectorAll(".part-variable-chip")].map((chip) => ({
          name: chip.dataset.name,
          left: chip.style.left,
          top: chip.style.top,
          locked: chip.dataset.locked === "true"
        }))
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    }

    function updateValues() {
      const row = activeRow();
      if (markTitle) {
        const identity = rowLabel(row, part);
        markTitle.textContent = row
          ? `${itemName} ${identity || "-"} | ${state.active + 1} of ${rows.length}`
          : `No ${itemName.toLowerCase()}s`;
      }
      canvas.querySelectorAll(".part-variable-chip").forEach((chip) => {
        const display = chipDisplay(row, chip.dataset.name, part);
        const valueNode = chip.querySelector(".part-chip-value");
        const feetNode = chip.querySelector(".part-chip-feet");
        if (valueNode) valueNode.textContent = display.value;
        if (feetNode) {
          feetNode.textContent = display.feet;
          feetNode.hidden = !display.feet;
        }
      });
    }

    function loadLayout() {
      let payload = null;
      try {
        payload = JSON.parse(localStorage.getItem(storageKey) || "null");
      } catch (error) {
        payload = null;
      }
      if (payload && (payload.chips || []).length > 1) {
        const positions = (payload.chips || []).map((chip) => `${parseFloat(chip.left) || 0},${parseFloat(chip.top) || 0}`);
        if (new Set(positions).size === 1 && positions[0] === "0,0") {
          localStorage.removeItem(storageKey);
          payload = null;
        }
      }
      const stale = staleLayouts[part];
      if (payload && stale) {
        const names = (payload.chips || []).map((chip) => chip.name).sort().join("|");
        if (names === [...stale].sort().join("|")) {
          localStorage.removeItem(storageKey);
          payload = null;
        }
      }
      if (!payload) return;
      lockToggle.checked = Boolean(payload.locked);
      canvas.classList.toggle("all-locked", lockToggle.checked);
      (payload.chips || []).filter((item) => variables.includes(item.name)).forEach((item) => addChip(canvas, item.name, {
        left: item.left,
        top: item.top,
        locked: item.locked,
        onChange: saveLayout
      }));
    }

    function loadDefaultLayout() {
      const defaults = defaultLayouts[part] || [];
      defaults.forEach((item) => addChip(canvas, item.name, {
        left: item.left,
        top: item.top,
        locked: item.locked,
        onChange: saveLayout
      }));
    }

    variables.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);

      const item = document.createElement("button");
      item.type = "button";
      item.className = "part-library-chip";
      item.textContent = name;
      item.addEventListener("click", () => {
        select.value = name;
        addChip(canvas, name, { onChange: saveLayout });
        updateValues();
        saveLayout();
      });
      library.appendChild(item);
    });

    addButton.addEventListener("click", () => {
      addChip(canvas, select.value, { onChange: saveLayout });
      updateValues();
      saveLayout();
    });
    clearButton.addEventListener("click", () => {
      canvas.querySelectorAll(".part-variable-chip").forEach((chip) => chip.remove());
      updateHint(canvas);
      saveLayout();
    });
    lockToggle.addEventListener("change", () => {
      canvas.classList.toggle("all-locked", lockToggle.checked);
      canvas.querySelectorAll(".part-variable-chip").forEach((chip) => {
        chip.dataset.locked = lockToggle.checked ? "true" : "false";
        chip.classList.toggle("locked", chip.dataset.locked === "true");
        updateLockButton(chip.querySelector(".part-chip-lock"), chip.dataset.locked === "true");
      });
      saveLayout();
    });
    prevButton.addEventListener("click", () => {
      if (!rows.length) return;
      state.active = (state.active - 1 + rows.length) % rows.length;
      updateValues();
    });
    nextButton.addEventListener("click", () => {
      if (!rows.length) return;
      state.active = (state.active + 1) % rows.length;
      updateValues();
    });

    loadLayout();
    if (!canvas.querySelector(".part-variable-chip")) {
      loadDefaultLayout();
      saveLayout();
    }
    updateHint(canvas);
    updateValues();
  }

  function addChip(canvas, name, options = {}) {
    if (!name) return;
    const chipCount = canvas.querySelectorAll(".part-variable-chip").length;
    const chip = document.createElement("div");
    chip.className = "part-variable-chip";
    chip.dataset.name = name;
    chip.dataset.locked = options.locked || canvas.classList.contains("all-locked") ? "true" : "false";
    chip.style.left = options.left || `${24 + (chipCount % 8) * 18}px`;
    chip.style.top = options.top || `${24 + Math.floor(chipCount / 8) * 46}px`;
    chip.innerHTML = `
      <span class="part-chip-label">${name}</span>
      <b class="part-chip-value">-</b>
      <small class="part-chip-feet" hidden></small>
      <button class="part-chip-lock" type="button"></button>
      <button class="part-chip-remove" type="button" aria-label="Remove ${name}" title="Remove variable">x</button>
    `;
    chip.classList.toggle("locked", chip.dataset.locked === "true");
    updateLockButton(chip.querySelector(".part-chip-lock"), chip.dataset.locked === "true");

    const lockButton = chip.querySelector(".part-chip-lock");
    const removeButton = chip.querySelector(".part-chip-remove");

    [lockButton, removeButton].forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });
    });

    lockButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const next = chip.dataset.locked !== "true";
      chip.dataset.locked = next ? "true" : "false";
      chip.classList.toggle("locked", next);
      updateLockButton(event.currentTarget, next);
      options.onChange?.();
    });

    removeButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      chip.remove();
      updateHint(canvas);
      options.onChange?.();
    });

    makeDraggable(chip, canvas, options.onChange);
    canvas.appendChild(chip);
    if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
      const maxLeft = Math.max(0, canvas.clientWidth - chip.offsetWidth);
      const maxTop = Math.max(0, canvas.clientHeight - chip.offsetHeight);
      chip.style.left = `${Math.min(Math.max(0, parseFloat(chip.style.left) || 0), maxLeft)}px`;
      chip.style.top = `${Math.min(Math.max(0, parseFloat(chip.style.top) || 0), maxTop)}px`;
    }
    updateHint(canvas);
    options.onChange?.();
  }

  function makeDraggable(chip, canvas, onChange) {
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    chip.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      if (chip.dataset.locked === "true" || canvas.classList.contains("all-locked")) return;

      event.preventDefault();
      chip.setPointerCapture(event.pointerId);
      chip.classList.add("dragging");
      startX = event.clientX;
      startY = event.clientY;
      startLeft = parseFloat(chip.style.left) || 0;
      startTop = parseFloat(chip.style.top) || 0;
    });

    chip.addEventListener("pointermove", (event) => {
      if (!chip.classList.contains("dragging")) return;

      const nextLeft = startLeft + event.clientX - startX;
      const nextTop = startTop + event.clientY - startY;
      const maxLeft = Math.max(0, canvas.clientWidth - chip.offsetWidth);
      const maxTop = Math.max(0, canvas.clientHeight - chip.offsetHeight);

      chip.style.left = `${Math.min(Math.max(0, nextLeft), maxLeft)}px`;
      chip.style.top = `${Math.min(Math.max(0, nextTop), maxTop)}px`;
    });

    chip.addEventListener("pointerup", (event) => {
      chip.classList.remove("dragging");
      try {
        chip.releasePointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture can already be released when the pointer leaves the window.
      }
      onChange?.();
    });
  }

  function updateHint(canvas) {
    const hint = canvas.querySelector(".part-canvas-hint");
    const hasChips = Boolean(canvas.querySelector(".part-variable-chip"));
    if (hint) hint.hidden = hasChips;
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".part-layout[data-part]").forEach(setupPartLayout);
  });
})();
