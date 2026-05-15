const $ = (selector) => document.querySelector(selector);

const measure = {
  a: $("#measureA"),
  b: $("#measureB"),
  tol: $("#tolerance"),
  swap: $("#swapBtn"),
  clear: $("#clearBtn"),
  copy: $("#copyBtn"),
  toast: $("#toast"),
  badge: $("#resultBadge"),
  title: $("#resultTitle"),
  detail: $("#resultDetail"),
  va: $("#valueA"),
  vb: $("#valueB"),
  dd: $("#diffDecimal"),
  df: $("#diffFraction"),
  dist: $("#distanceText"),
  corr: $("#correctionText"),
  ha: $("#hintA"),
  hb: $("#hintB")
};

let latestResult = "";

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function tokenValue(token) {
  if (/^\d+\/\d+$/.test(token)) {
    const [num, den] = token.split("/").map(Number);
    return den ? num / den : NaN;
  }
  return Number(token);
}

function parseMeasure(input) {
  let text = String(input ?? "").trim().toLowerCase()
    .replace(/[\u201c\u201d]/g, "\"")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\bfeet|foot\b/g, "ft")
    .replace(/\binches|inch\b/g, "in");

  if (!text) return { ok: false };
  if (/[^\d\s.'"/a-z-]/.test(text)) return { ok: false };

  const metric = text.match(/^(\d+(?:\.\d+)?)\s*(mm|millimeters?|cm|centimeters?)$/);
  if (metric) {
    const value = Number(metric[1]);
    return { ok: true, inches: metric[2].startsWith("mm") ? value / 25.4 : value / 2.54 };
  }

  const feetMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:'|ft\b)/);
  let feet = 0;
  if (feetMatch) {
    feet = Number(feetMatch[1]);
    text = `${text.slice(0, feetMatch.index)} ${text.slice(feetMatch.index + feetMatch[0].length)}`;
  }

  text = text.replace(/(^|\s|-)(\d{3})(?=\s*(?:in|")?\s*$)/, (match, prefix, digits) => {
    const [whole, numerator, denominator] = digits;
    return ["2", "4", "8"].includes(denominator) && Number(numerator) < Number(denominator)
      ? `${prefix}${whole} ${numerator}/${denominator}`
      : match;
  });

  const tokens = text
    .replace(/\b(?:in|ft)\b/g, " ")
    .replace(/["']/g, " ")
    .replace(/-/g, " ")
    .replace(/[^\d./\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  let inches = 0;
  for (const token of tokens) {
    const value = tokenValue(token);
    if (!Number.isFinite(value)) return { ok: false };
    inches += value;
  }
  return { ok: true, inches: feet * 12 + inches };
}

function decimal(value) {
  if (!Number.isFinite(value)) return "--";
  return `${Number(value.toFixed(4)).toFixed(value % 1 === 0 ? 3 : 4)}"`;
}

function fraction(value, denominator = 16) {
  if (!Number.isFinite(value)) return "--";
  const rounded = Math.round(value * denominator) / denominator;
  const whole = Math.floor(rounded);
  let numerator = Math.round((rounded - whole) * denominator);
  if (!numerator) return `${whole}"`;
  if (numerator === denominator) return `${whole + 1}"`;
  const divisor = gcd(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;
  return whole ? `${whole} ${numerator}/${denominator}"` : `${numerator}/${denominator}"`;
}

function feetInches(value) {
  const feet = Math.floor(value / 12);
  const inches = value - feet * 12;
  return feet ? `${feet}'-${fraction(inches)}` : fraction(inches);
}

function setResult(kind, title, detail) {
  measure.badge.className = `badge ${kind}`;
  measure.title.textContent = title;
  measure.detail.textContent = detail;
}

function compare() {
  const a = parseMeasure(measure.a.value);
  const b = parseMeasure(measure.b.value);
  const tolerance = parseMeasure(measure.tol.value);
  latestResult = "";
  measure.toast.textContent = "";

  measure.va.textContent = a.ok ? decimal(a.inches) : "--";
  measure.vb.textContent = b.ok ? decimal(b.inches) : "--";
  measure.dd.textContent = measure.df.textContent = measure.dist.textContent = measure.corr.textContent = "--";
  measure.ha.className = measure.hb.className = "hint";
  measure.ha.textContent = measure.a.value.trim() ? "Invalid measurement" : "Example: 3'-4 1/2\"";
  measure.hb.textContent = measure.b.value.trim() ? "Invalid measurement" : "Example: 40 9/16\"";

  if (a.ok) {
    measure.ha.className = "hint valid";
    measure.ha.textContent = `Looks like: ${feetInches(a.inches)} (${decimal(a.inches)})`;
  }
  if (b.ok) {
    measure.hb.className = "hint valid";
    measure.hb.textContent = `Looks like: ${feetInches(b.inches)} (${decimal(b.inches)})`;
  }
  if (!measure.a.value.trim() && !measure.b.value.trim()) return setResult("idle", "Ready", "Enter measurements");
  if (!a.ok || !b.ok) return setResult("idle", "Invalid", "Check A or B");
  if (!tolerance.ok || tolerance.inches < 0) return setResult("idle", "Bad tolerance", "Use 1/16\"");

  const diff = Math.abs(a.inches - b.inches);
  const diffFraction = fraction(diff);
  const signed = b.inches - a.inches;
  measure.dd.textContent = decimal(diff);
  measure.df.textContent = diffFraction;

  if (diff === 0) {
    measure.dist.textContent = "A and B match";
    measure.corr.textContent = "No correction";
    latestResult = `A = ${decimal(a.inches)}, B = ${decimal(b.inches)}, Difference = 0, EXACT MATCH`;
    return setResult("exact", "MATCH", "Difference is 0");
  }

  measure.dist.textContent = signed > 0 ? `B is larger by ${diffFraction}` : `A is larger by ${diffFraction}`;
  measure.corr.textContent = signed > 0 ? `Subtract ${diffFraction} from B` : `Subtract ${diffFraction} from A`;
  const passed = diff <= tolerance.inches + Number.EPSILON;
  const status = passed ? `PASS within ${fraction(tolerance.inches)}` : `FAIL beyond ${fraction(tolerance.inches)}`;
  latestResult = `A = ${decimal(a.inches)}, B = ${decimal(b.inches)}, Difference = ${diffFraction}, ${measure.dist.textContent}, ${measure.corr.textContent}, ${status}`;
  setResult(passed ? "pass" : "fail", passed ? "PASS" : "FAIL", status.replace(/^PASS |^FAIL /, ""));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function drawAssistantSample(label = "Sample / full.svg", lbh = "226", lwph = "23 6/16") {
  $("#sheetName").textContent = label;
  $("#paramCount").textContent = "6";
  $("#detailType").textContent = "full.svg";
  $("#flagCount").textContent = "0";
  $("#parameterRows").innerHTML = [
    ["CB-ID", "CB-5.50", "High"],
    ["Mark", "1901", "High"],
    ["Wwp", "184 8/16 in", "High"],
    ["Hwp", "193 15/16 in", "High"],
    ["Lbh", `${lbh} in`, "High"],
    ["Lwp-h", `${lwph} in`, "High"]
  ].map((row) => `<tr><td>${row[0]}</td><td class="mono">${row[1]}</td><td>${row[2]}</td></tr>`).join("");
  $("#checkpointList").innerHTML = `
    <div class="checkpoint high"><div class="checkpoint-top"><span>Lbh</span><span>High</span></div><div class="mono">${escapeHtml(lbh)} in</div><div class="checkpoint-note">Check brace length against the client drawing.</div></div>
    <div class="checkpoint high"><div class="checkpoint-top"><span>Lwp-h</span><span>High</span></div><div class="mono">${escapeHtml(lwph)} in</div><div class="checkpoint-note">Use full.svg overlay when this value exists.</div></div>
  `;
  $("#detailSvg").setAttribute("viewBox", "0 0 1024 768");
  $("#detailSvg").innerHTML = `
    <image href="assets/full.svg" x="0" y="0" width="1024" height="768" preserveAspectRatio="xMidYMid meet"></image>
    <rect x="668" y="92" width="252" height="90" rx="8" fill="rgba(0,0,0,.74)" stroke="#f5a524" stroke-width="3"></rect>
    <text x="794" y="126" fill="#f5a524" font-size="24" font-family="ui-monospace,Consolas,monospace" text-anchor="middle">Lwp-h</text>
    <text x="794" y="160" fill="#fff" font-size="28" font-family="ui-monospace,Consolas,monospace" text-anchor="middle">${escapeHtml(lwph)}"</text>
  `;
}

async function loadAssistantExcel(file) {
  if (!window.XLSX) {
    $("#excelStatus").textContent = "SheetJS did not load. Refresh and try again.";
    return;
  }
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, defval: "" });
  const headerIndex = rows.findIndex((row) => row.map((cell) => String(cell).toLowerCase()).join(" ").includes("lbh"));
  const dataRow = rows.slice(headerIndex + 1).find((row) => row.some(Boolean)) || [];
  $("#excelStatus").textContent = `Loaded ${file.name}. Basic preview ready.`;
  drawAssistantSample(sheet, dataRow.join(" / ").includes("226") ? "226" : "See table", "See table");
  $("#excelInput").value = "";
}

[measure.a, measure.b, measure.tol].forEach((input) => input?.addEventListener("input", compare));
measure.swap?.addEventListener("click", () => {
  [measure.a.value, measure.b.value] = [measure.b.value, measure.a.value];
  compare();
});
measure.clear?.addEventListener("click", () => {
  measure.a.value = "";
  measure.b.value = "";
  measure.tol.value = "1/16\"";
  compare();
});
measure.copy?.addEventListener("click", async () => {
  if (!latestResult) return measure.toast.textContent = "Nothing valid to copy yet.";
  await navigator.clipboard.writeText(latestResult);
  measure.toast.textContent = "Copied.";
});
$("#excelInput")?.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) loadAssistantExcel(file).catch((error) => {
    $("#excelStatus").textContent = `Could not read file: ${error.message}`;
    $("#excelInput").value = "";
  });
});
$("#loadSampleBtn")?.addEventListener("click", () => drawAssistantSample());
$("#exportPngBtn")?.addEventListener("click", () => {
  const svg = $("#detailSvg");
  const xml = new XMLSerializer().serializeToString(svg);
  const link = document.createElement("a");
  link.download = "expected-detail.svg";
  link.href = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  link.click();
});
$("#themeBtn")?.addEventListener("click", () => document.body.classList.toggle("light"));

compare();
drawAssistantSample();
