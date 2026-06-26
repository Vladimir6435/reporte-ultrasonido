// ============================================================
//  Percentil de peso fetal estimado
//  Dos estándares seleccionables:
//   - INTERGROWTH-21st (Stirnemann, UOG 2017) — internacional,
//     recomendado para población latinoamericana.
//   - Hadlock 1991 (Radiology) — referencia estadounidense.
//  El usuario ingresa el peso (g); aquí se calcula el percentil.
// ============================================================
import { computeEG, weeksDaysToDays, parseDate, diffDays } from "./calculations";

export const ESTANDARES = [
  { value: "intergrowth", label: "INTERGROWTH-21st", desc: "Internacional · población latinoamericana" },
  { value: "hadlock", label: "Hadlock 1991", desc: "Referencia EE. UU. / anglosajona" },
];

export const ESTANDAR_LABEL = {
  intergrowth: "INTERGROWTH-21st",
  hadlock: "Hadlock 1991",
};

// Tabla INTERGROWTH-21st de peso fetal estimado (g) por semana exacta.
// Centiles: 3, 5, 10, 50, 90, 95, 97.  © University of Oxford, Stirnemann 2017.
const IG_CENTILES = [3, 5, 10, 50, 90, 95, 97];
const IG = {
  22: [463, 470, 481, 525, 578, 596, 607],
  23: [516, 524, 538, 592, 658, 680, 694],
  24: [575, 585, 602, 668, 751, 778, 796],
  25: [642, 654, 675, 756, 857, 891, 913],
  26: [716, 732, 757, 856, 980, 1020, 1048],
  27: [800, 818, 848, 969, 1119, 1168, 1202],
  28: [892, 915, 951, 1097, 1277, 1335, 1376],
  29: [994, 1021, 1064, 1239, 1453, 1521, 1570],
  30: [1105, 1138, 1189, 1396, 1648, 1728, 1784],
  31: [1226, 1265, 1325, 1568, 1861, 1953, 2017],
  32: [1356, 1401, 1472, 1755, 2090, 2195, 2267],
  33: [1495, 1547, 1630, 1954, 2332, 2450, 2529],
  34: [1641, 1700, 1796, 2162, 2582, 2713, 2798],
  35: [1794, 1860, 1969, 2378, 2836, 2978, 3069],
  36: [1951, 2024, 2146, 2594, 3086, 3237, 3331],
  37: [2109, 2190, 2323, 2806, 3324, 3480, 3578],
  38: [2266, 2355, 2496, 3006, 3540, 3697, 3798],
  39: [2416, 2516, 2658, 3186, 3726, 3876, 3982],
  40: [2554, 2670, 2805, 3338, 3871, 4006, 4121],
};
const IG_MIN = 22;
const IG_MAX = 40;

// --- Estadística normal ---
function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t) *
      Math.exp(-x * x);
  return x >= 0 ? y : -y;
}
export function normCDF(z) {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}
// Inversa de la normal estándar (algoritmo de Acklam).
function invNorm(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  let q, r;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= 1 - pl) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

// Interpola los pesos de los 7 centiles para una EG decimal (INTERGROWTH).
function igRow(ga) {
  const w = Math.max(IG_MIN, Math.min(IG_MAX, ga));
  const lo = Math.floor(w);
  const hi = Math.min(IG_MAX, Math.ceil(w));
  const f = w - lo;
  const a = IG[lo];
  const b = IG[hi];
  return a.map((v, i) => v + (b[i] - v) * f);
}

// Interpolación/extrapolación lineal de y respecto a xs (ascendente).
function interp(x, xs, ys) {
  const n = xs.length;
  if (x <= xs[0]) {
    const s = (ys[1] - ys[0]) / (xs[1] - xs[0]);
    return ys[0] + s * (x - xs[0]);
  }
  for (let i = 0; i < n - 1; i++) {
    if (x <= xs[i + 1]) {
      return ys[i] + (ys[i + 1] - ys[i]) * (x - xs[i]) / (xs[i + 1] - xs[i]);
    }
  }
  const s = (ys[n - 1] - ys[n - 2]) / (xs[n - 1] - xs[n - 2]);
  return ys[n - 1] + s * (x - xs[n - 1]);
}

/**
 * Calcula el percentil de un peso fetal estimado.
 * @param {number} efw   peso en gramos
 * @param {number} ga    edad gestacional en semanas (decimal)
 * @param {string} estandar  "intergrowth" | "hadlock"
 * @returns {{display:string, num:number}|null}
 */
export function calcPercentil(efw, ga, estandar = "intergrowth") {
  const w = Number(efw);
  if (!w || w <= 0 || ga == null || isNaN(ga)) return null;

  let pct;
  if (estandar === "hadlock") {
    const g = Math.max(10, Math.min(42, ga));
    const med = Math.exp(0.578 + 0.332 * g - 0.00354 * g * g); // mediana Hadlock 1991 (g)
    const sd = 0.12 * med; // CV ~12%
    pct = normCDF((w - med) / sd) * 100;
  } else {
    const pesos = igRow(ga);
    const zc = IG_CENTILES.map((c) => invNorm(c / 100));
    pct = normCDF(interp(w, pesos, zc)) * 100;
  }

  pct = Math.max(0, Math.min(100, pct));
  let display;
  if (pct < 1) display = "<1";
  else if (pct > 99) display = ">99";
  else display = String(Math.round(pct));
  return { display, num: pct };
}

/** Edad gestacional actual en semanas decimales, según el estado. */
export function getGAWeeks(state) {
  if (state.egCalc && state.egCalc.activo) {
    const r = computeEG(state.egCalc, state.fechaReporte);
    if (r && r.ok) return r.totalDays / 7;
  }
  const h = state.historia;
  if (h && h.egConocida === "si" && (h.egSemanas !== "" || h.egDias !== "")) {
    const base = weeksDaysToDays(h.egSemanas, h.egDias);
    const ref = parseDate(state.fechaReporte);
    const egRef = parseDate(h.egFechaRef);
    let days = base;
    if (ref && egRef) days = base + diffDays(ref, egRef);
    return days / 7;
  }
  if (state.opcion === "opcion1" && (state.op1.egSemanas !== "" || state.op1.egDias !== "")) {
    return weeksDaysToDays(state.op1.egSemanas, state.op1.egDias) / 7;
  }
  return null;
}
