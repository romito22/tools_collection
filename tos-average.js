(function setupTosAverage() {
  "use strict";

  const STORAGE_KEY = "tools_collection.tosAverage.values.v2";
  const LEGACY_STORAGE_KEY = "tools_collection.tosAverage.values.v1";
  const byId = (id) => document.getElementById(id);
  const els = {
    a: {
      feet: byId("tosFeetA"),
      inches: byId("tosInchesA"),
      fraction: byId("tosFractionA")
    },
    b: {
      feet: byId("tosFeetB"),
      inches: byId("tosInchesB"),
      fraction: byId("tosFractionB")
    },
    swap: byId("tosSwapBtn"),
    clear: byId("tosClearBtn"),
    copy: byId("tosCopyBtn"),
    average: byId("tosAverageResult"),
    rounded: byId("tosRoundedResult"),
    difference: byId("tosDifferenceResult"),
    error: byId("tosError")
  };
  if (!els.a.feet || !els.b.feet) return;

  function gcd(a, b) {
    while (b) [a, b] = [b, a % b];
    return Math.abs(a) || 1;
  }

  function parseNumber(value) {
    const number = Number(String(value).trim());
    return Number.isFinite(number) ? number : null;
  }

  function parseInches(value) {
    let input = String(value || "")
      .trim()
      .replace(/^TOS\s*=\s*/i, "")
      .replace(/[″"]/g, "")
      .replace(/\b(in|inch|inches)\b/gi, "")
      .trim();
    if (!input) return null;

    let feet = 0;
    let inchText = input;
    const footMark = input.match(/^([+-]?\d+(?:\.\d+)?)\s*['′]\s*-?\s*(.*)$/);
    const hyphenFeet = input.match(/^([+-]?\d+)\s*-\s*(\d.*)$/);
    const wordFeet = input.match(/^([+-]?\d+(?:\.\d+)?)\s*(?:ft|feet)\s*(.*)$/i);

    if (footMark) {
      feet = Number(footMark[1]);
      inchText = footMark[2];
    } else if (wordFeet) {
      feet = Number(wordFeet[1]);
      inchText = wordFeet[2];
    } else if (hyphenFeet) {
      feet = Number(hyphenFeet[1]);
      inchText = hyphenFeet[2];
    } else {
      const decimalFeet = parseNumber(input);
      return decimalFeet === null ? null : decimalFeet * 12;
    }

    inchText = inchText.replace(/(\d)\s*-\s*(\d+\s*\/\s*\d+)/g, "$1 $2").trim();
    if (!inchText) return feet * 12;

    let inches = 0;
    const mixed = inchText.match(/^(\d+(?:\.\d+)?)?\s*(?:(\d+)\s*\/\s*(\d+))?$/);
    if (!mixed) return null;
    if (mixed[1]) inches += Number(mixed[1]);
    if (mixed[2] && mixed[3]) {
      const denominator = Number(mixed[3]);
      if (!denominator) return null;
      inches += Number(mixed[2]) / denominator;
    }
    if (!Number.isFinite(inches) || inches >= 12) return null;
    return feet * 12 + (feet < 0 ? -inches : inches);
  }

  function formatElevation(totalInches, denominator) {
    if (!Number.isFinite(totalInches)) return "-";
    const sign = totalInches < 0 ? "-" : "";
    const units = Math.round(Math.abs(totalInches) * denominator);
    const feet = Math.floor(units / (12 * denominator));
    const remainder = units - feet * 12 * denominator;
    const whole = Math.floor(remainder / denominator);
    const numerator = remainder % denominator;
    let fraction = "";
    if (numerator) {
      const divisor = gcd(numerator, denominator);
      fraction = numerator / divisor + "/" + denominator / divisor;
    }
    const inchText = [whole || !fraction ? String(whole) : "", fraction].filter(Boolean).join(" ");
    return sign + feet + "'-" + inchText + '"';
  }

  function formatDifference(totalInches) {
    if (!Number.isFinite(totalInches)) return "-";
    const units = Math.round(Math.abs(totalInches) * 32);
    const whole = Math.floor(units / 32);
    const numerator = units % 32;
    let fraction = "";
    if (numerator) {
      const divisor = gcd(numerator, 32);
      fraction = numerator / divisor + "/" + 32 / divisor;
    }
    return [whole || !fraction ? String(whole) : "", fraction].filter(Boolean).join(" ") + '"';
  }

  function rowValues(row) {
    return {
      feet: row.feet.value,
      inches: row.inches.value,
      fraction: row.fraction.value
    };
  }

  function setRow(row, values) {
    row.feet.value = values.feet ?? "";
    row.inches.value = values.inches ?? "0";
    row.fraction.value = values.fraction ?? "0";
  }

  function splitElevation(totalInches) {
    const sign = totalInches < 0 ? -1 : 1;
    const units = Math.round(Math.abs(totalInches) * 16);
    const feet = Math.floor(units / 192);
    const remainder = units - feet * 192;
    return {
      feet: String(feet * sign),
      inches: String(Math.floor(remainder / 16)),
      fraction: String((remainder % 16) / 16)
    };
  }

  function readRow(row) {
    const rawFeet = row.feet.value.trim();
    const rawInches = row.inches.value.trim();
    const feet = Number(rawFeet);
    const inches = rawInches === "" ? 0 : Number(rawInches);
    const fraction = Number(row.fraction.value);
    const feetValid = rawFeet !== "" && Number.isInteger(feet);
    const inchesValid = Number.isInteger(inches) && inches >= 0 && inches <= 11;

    row.feet.classList.toggle("invalid", rawFeet !== "" && !feetValid);
    row.inches.classList.toggle("invalid", !inchesValid);
    if (!feetValid || !inchesValid || !Number.isFinite(fraction)) return null;
    return feet * 12 + (feet < 0 ? -(inches + fraction) : inches + fraction);
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      a: rowValues(els.a),
      b: rowValues(els.b)
    }));
  }

  function render() {
    const a = readRow(els.a);
    const b = readRow(els.b);
    const waiting = !els.a.feet.value.trim() || !els.b.feet.value.trim();

    if (waiting || a === null || b === null) {
      els.average.textContent = "-";
      els.rounded.textContent = "-";
      els.difference.textContent = "-";
      els.copy.disabled = true;
      els.error.textContent = waiting ? "" : "Use whole feet and inches from 0 to 11.";
      save();
      return;
    }

    const average = (a + b) / 2;
    els.average.textContent = formatElevation(average, 32);
    els.rounded.textContent = formatElevation(average, 16);
    els.difference.textContent = formatDifference(a - b);
    els.copy.disabled = false;
    els.error.textContent = "";
    save();
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved) {
      setRow(els.a, saved.a || {});
      setRow(els.b, saved.b || {});
    } else {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "null");
      const legacyA = parseInches(legacy?.a);
      const legacyB = parseInches(legacy?.b);
      if (legacyA !== null) setRow(els.a, splitElevation(legacyA));
      if (legacyB !== null) setRow(els.b, splitElevation(legacyB));
    }
  } catch (error) {
    console.warn("Could not restore TOS values.", error);
  }

  Object.values(els.a).forEach((control) => control.addEventListener("input", render));
  Object.values(els.b).forEach((control) => control.addEventListener("input", render));
  els.swap.addEventListener("click", () => {
    const a = rowValues(els.a);
    setRow(els.a, rowValues(els.b));
    setRow(els.b, a);
    render();
    els.a.feet.focus();
  });
  els.clear.addEventListener("click", () => {
    setRow(els.a, { feet: "", inches: "0", fraction: "0" });
    setRow(els.b, { feet: "", inches: "0", fraction: "0" });
    render();
    els.a.feet.focus();
  });
  els.copy.addEventListener("click", async () => {
    const value = els.average.textContent;
    try {
      await navigator.clipboard.writeText(value);
      els.copy.textContent = "Copied";
      window.setTimeout(() => { els.copy.textContent = "Copy Average"; }, 900);
    } catch (error) {
      els.error.textContent = "Copy was blocked by the browser.";
    }
  });

  render();
  window.TosAverage = { parseInches, formatElevation, splitElevation };
})();
