// ============================================================
//  Cálculos obstétricos
//  Toda la lógica de fechas y edad gestacional vive aquí.
// ============================================================

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TERM_DAYS = 280; // 40 semanas

/** Convierte "YYYY-MM-DD" a objeto Date local (sin desfase de zona horaria). */
export function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Formatea un Date a "DD/MM/AAAA". */
export function formatDate(date) {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/** Formatea un Date a texto largo en español: "22 de junio de 2026". */
export function formatDateLong(date) {
  if (!date) return "";
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function diffDays(a, b) {
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

/** Normaliza semanas + días a días totales. */
export function weeksDaysToDays(weeks, days) {
  const w = Number(weeks) || 0;
  const d = Number(days) || 0;
  return w * 7 + d;
}

/** Convierte días totales a string "Xs Yd". */
export function daysToWeeksString(totalDays) {
  if (totalDays == null || isNaN(totalDays)) return "";
  const w = Math.floor(totalDays / 7);
  const d = totalDays % 7;
  return `${w} semanas ${d} días`;
}

/**
 * Calcula la Fecha Probable de Parto (FPP, 40 semanas) a partir de una
 * edad gestacional conocida en una fecha de referencia.
 *
 * FPP = fechaReferencia + (280 días − EG en días en esa fecha)
 *
 * @param {string} refDateStr  Fecha del estudio / elaboración del reporte (YYYY-MM-DD)
 * @param {number} weeks       Semanas de EG en esa fecha
 * @param {number} days        Días de EG en esa fecha
 */
export function calcEDD(refDateStr, weeks, days) {
  const ref = parseDate(refDateStr);
  if (!ref) return null;
  const gaDays = weeksDaysToDays(weeks, days);
  const remaining = TERM_DAYS - gaDays;
  return addDays(ref, remaining);
}

/**
 * Edad gestacional ACTUAL (a la fecha del reporte) calculada a partir de la FPP.
 * EG = 280 − (FPP − hoy)
 */
export function gaFromEDD(eddDate, todayStr) {
  const today = parseDate(todayStr);
  if (!eddDate || !today) return null;
  const totalDays = TERM_DAYS - diffDays(eddDate, today);
  return totalDays;
}

/**
 * Estimación de EG por LCC (CRL) — fórmula de Robinson & Fleming (1975).
 * EG(días) = 8.052 * sqrt(CRL_mm) + 23.73
 * Válida aproximadamente entre 10 y 84 mm de LCC.
 * @param {number} crlMm  Longitud cefalocaudal en milímetros
 * @returns {number|null} días de gestación
 */
export function gaFromCRL(crlMm) {
  const crl = Number(crlMm);
  if (!crl || crl <= 0) return null;
  const days = 8.052 * Math.sqrt(crl) + 23.73;
  return Math.round(days);
}

/** Devuelve hoy en formato YYYY-MM-DD (zona local). */
export function todayISO() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ============================================================
//  Clasificación de RCIU — Medicina Fetal Barcelona
//  (Figueras & Gratacós, protocolo BCNatal)
//  Devuelve etapa y criterios cumplidos para guiar la conducta.
// ============================================================
export function classifyRCIU({
  pesoPercentil,
  acPercentil,
  umbilicalPI_p95,   // boolean: IP arteria umbilical > p95
  acmPI_p5,          // boolean: IP ACM < p5 (vasodilatación)
  cprPercentil_p5,   // boolean: ICP/CPR < p5
  uterinasPI_p95,    // boolean: IP medio art. uterinas > p95
  umbilicalDiastoleAusente, // boolean: flujo diastólico ausente
  umbilicalDiastoleReversa, // boolean: flujo diastólico reverso
  ductusVenosoIP_p95,       // boolean: IP DV > p95
  ductusVenosoAReversa,     // boolean: onda a ausente/reversa
}) {
  const peso = Number(pesoPercentil);
  const hasPeso = !isNaN(peso) && pesoPercentil !== "" && pesoPercentil != null;

  // Estadio 4 — Riesgo de muerte fetal inminente
  if (ductusVenosoAReversa) {
    return stage(4, "Ductus venoso con onda a ausente o reversa.");
  }
  // Estadio 3 — Deterioro avanzado
  if (umbilicalDiastoleReversa || ductusVenosoIP_p95) {
    return stage(
      3,
      "Flujo diastólico reverso en arteria umbilical y/o IP de ductus venoso > p95."
    );
  }
  // Estadio 2 — Insuficiencia placentaria severa
  if (umbilicalDiastoleAusente) {
    return stage(2, "Flujo diastólico ausente en arteria umbilical.");
  }
  // Estadio 1 — RCIU con signos de insuficiencia placentaria leve
  const stage1Criteria = [];
  if (hasPeso && peso < 3) stage1Criteria.push("Peso fetal estimado < percentil 3.");
  if (umbilicalPI_p95) stage1Criteria.push("IP de arteria umbilical > p95.");
  if (acmPI_p5) stage1Criteria.push("IP de arteria cerebral media < p5.");
  if (cprPercentil_p5) stage1Criteria.push("Índice cerebro-placentario < p5.");
  if (uterinasPI_p95) stage1Criteria.push("IP medio de arterias uterinas > p95.");
  if (stage1Criteria.length > 0) {
    return stage(1, stage1Criteria.join(" "));
  }

  // PFE p3–p10 sin alteración Doppler → Pequeño para edad gestacional (PEG)
  if (hasPeso && peso >= 3 && peso < 10) {
    return {
      label: "Pequeño para la edad gestacional (PEG)",
      stage: 0,
      detail:
        "Peso fetal estimado entre percentil 3 y 10 con estudio Doppler normal. Bajo riesgo.",
    };
  }

  return {
    label: "No clasificable / sin criterios de RCIU",
    stage: null,
    detail:
      "No se cumplen criterios de restricción de crecimiento con los datos ingresados.",
  };
}

function stage(n, detail) {
  const labels = {
    1: "RCIU Estadio I (insuficiencia placentaria leve)",
    2: "RCIU Estadio II (insuficiencia placentaria severa)",
    3: "RCIU Estadio III (deterioro avanzado)",
    4: "RCIU Estadio IV (riesgo de pérdida fetal inminente)",
  };
  return { label: labels[n], stage: n, detail };
}
