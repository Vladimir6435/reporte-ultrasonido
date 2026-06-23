// ============================================================
//  Constructor del reporte
//  Convierte el estado en una estructura de "bloques" neutral
//  que luego se renderiza a HTML (vista previa), Word y nota médica.
// ============================================================

import {
  parseDate, formatDate, calcEDD, weeksDaysToDays, daysToWeeksString,
  diffDays, classifyRCIU, computeEG,
} from "./calculations";
import {
  ANATOMIA_22_24, ANATOMIA_11_14, UBICACION_PLACENTA, LIQUIDO_AMNIOTICO, ENCABEZADO,
} from "./constants";

const labelFrom = (list, value) =>
  (list.find((x) => x.value === value) || {}).label || value || "";

// --- helpers de bloque ---
const h = (text) => ({ type: "heading", text });
const kv = (items) => ({ type: "kv", items: items.filter((i) => i && i.value) });
const para = (runs) => ({ type: "para", runs });
const highlight = (label, value) => ({ type: "highlight", label, value });
const alert = (label, value) => ({ type: "alert", label, value });
const note = (text) => ({ type: "note", text });
const run = (text, bold = false) => ({ text, bold });

// ============================================================
//  Edad gestacional actual + FPP
// ============================================================
export function getGestational(state) {
  const h_ = state.historia;
  const ref = state.fechaReporte;

  // Prioridad: calculadora de edad gestacional activa
  if (state.egCalc && state.egCalc.activo) {
    const r = computeEG(state.egCalc, ref);
    if (r && r.ok) {
      return {
        egTexto: r.egTexto,
        fpp: r.fppStr,
        fuente: `Calculada por ${r.metodoLabel}.`,
        hitos: r.hitos,
      };
    }
  }

  // Opción 1: EG ingresada en el estudio del primer trimestre
  if (state.opcion === "opcion1" && (state.op1.egSemanas !== "" || state.op1.egDias !== "")) {
    const fpp = calcEDD(ref, state.op1.egSemanas, state.op1.egDias);
    const egDays = weeksDaysToDays(state.op1.egSemanas, state.op1.egDias);
    return {
      egTexto: daysToWeeksString(egDays),
      fpp: fpp ? formatDate(fpp) : "",
      fuente: "Calculada por LCC del estudio actual.",
      hitos: [],
    };
  }

  // Resto: EG conocida por estudio previo
  if (h_.egConocida === "si" && (h_.egSemanas !== "" || h_.egDias !== "")) {
    const fpp = calcEDD(h_.egFechaRef, h_.egSemanas, h_.egDias);
    const baseDays = weeksDaysToDays(h_.egSemanas, h_.egDias);
    const refD = parseDate(ref);
    const egRefD = parseDate(h_.egFechaRef);
    let currentDays = baseDays;
    if (refD && egRefD) currentDays = baseDays + diffDays(refD, egRefD);
    return {
      egTexto: daysToWeeksString(currentDays),
      fpp: fpp ? formatDate(fpp) : "",
      fuente: "Calculada a partir de estudio previo.",
      hitos: [],
    };
  }

  return { egTexto: "", fpp: "", fuente: "", hitos: [] };
}

// ============================================================
//  Antecedentes
// ============================================================
function antecedentesMedicos(h_) {
  const items = [];

  if (h_.htaCronica === "si") {
    const d = [];
    if (h_.htaTiempo) d.push(`desde hace ${h_.htaTiempo}`);
    if (h_.htaTratamiento) d.push(`tratamiento: ${h_.htaTratamiento}`);
    items.push("Hipertensión arterial crónica" + (d.length ? ` (${d.join(", ")})` : ""));
  }

  if (h_.diabetes && h_.diabetes !== "no") {
    const map = { tipo1: "Diabetes tipo 1", tipo2: "Diabetes tipo 2", gestacional: "Diabetes gestacional" };
    const d = [];
    if (h_.dmTiempo) d.push(`desde hace ${h_.dmTiempo}`);
    if (h_.dmTratamiento) d.push(`tratamiento: ${h_.dmTratamiento}`);
    items.push(map[h_.diabetes] + (d.length ? ` (${d.join(", ")})` : ""));
  }

  if (h_.colageno === "si") {
    const tipos = [];
    if (h_.colagenoLes) tipos.push("lupus eritematoso sistémico");
    if (h_.colagenoSjogren) tipos.push("síndrome de Sjögren");
    if (h_.colagenoArtritis) tipos.push("artritis reumatoide");
    if (h_.colagenoOtro && h_.colagenoOtroCual) tipos.push(h_.colagenoOtroCual);
    let s = "Enfermedad del colágeno" + (tipos.length ? ` (${tipos.join(", ")})` : "");
    if (h_.colagenoMedicamentos) s += ` — tratamiento: ${h_.colagenoMedicamentos}`;
    items.push(s);
  }

  if (h_.saf === "si") {
    items.push(
      "Síndrome de anticuerpos antifosfolípidos" +
        (h_.safEventos ? ` (eventos previos: ${h_.safEventos})` : "")
    );
  }

  if (h_.trombofilia === "si") {
    const t = [];
    if (h_.tromboFactorVLeiden) t.push("factor V de Leiden");
    if (h_.tromboProtrombina) t.push("mutación de protrombina G20210A");
    if (h_.tromboAntitrombina) t.push("deficiencia de antitrombina");
    if (h_.tromboProteinaC) t.push("deficiencia de proteína C");
    if (h_.tromboProteinaS) t.push("deficiencia de proteína S");
    if (h_.tromboOtra && h_.tromboOtraCual) t.push(h_.tromboOtraCual);
    let s = "Trombofilia" + (t.length ? ` (${t.join(", ")})` : "");
    if (h_.tromboTratamiento) s += ` — tratamiento: ${h_.tromboTratamiento}`;
    items.push(s);
  }

  if (h_.medicamentos === "si") {
    const meds = [];
    if (h_.antiepilepticos) meds.push("antiepilépticos");
    if (h_.medicamentosLista) meds.push(h_.medicamentosLista);
    items.push("Otros medicamentos: " + (meds.length ? meds.join(", ") : "sí"));
  }

  return items.length ? items.join(" · ") : "Sin antecedentes médicos relevantes";
}

function antecedentesObstetricos(h_) {
  const items = [];
  const partos = Number(h_.partosPrevios);
  const ant = [];
  if (h_.antPretermino) ant.push("parto pretérmino");
  if (h_.antPreeclampsia) ant.push("preeclampsia");
  if (h_.antRCIU) ant.push("restricción de crecimiento intrauterino");

  // ¿Hay embarazo previo? (partos > 0, cesárea previa o algún antecedente marcado)
  const hasPrior =
    (h_.partosPrevios !== "" && partos > 0) || h_.cesareas === "si" || ant.length > 0;

  if (h_.partosPrevios !== "") items.push({ label: "Partos previos", value: String(h_.partosPrevios) });

  if (hasPrior) {
    items.push({
      label: "Cesárea previa",
      value: h_.cesareas === "si" ? "Sí" + (h_.cesareasFechas ? ` (${h_.cesareasFechas})` : "") : "No",
    });
    // Solo se incluye la línea de embarazo anterior cuando realmente hay antecedente.
    if (ant.length) items.push({ label: "Embarazo anterior", value: ant.join(", ") });
    else items.push({ label: "Embarazo anterior", value: "sin pretérmino, preeclampsia ni RCIU" });
  }

  return items;
}

// ============================================================
//  Hallazgos por opción
// ============================================================
function findingsOpcion1(state, blocks) {
  const o = state.op1;
  blocks.push(h("Hallazgos del primer trimestre"));
  const items = [
    { label: "Longitud cefalocaudal (LCC)", value: o.crl ? `${o.crl} mm` : "" },
    { label: "Tipo de embarazo", value: o.tipoEmbarazo === "unico" ? "Único" : "Múltiple" },
  ];
  if (o.tipoEmbarazo === "multiple")
    items.push({ label: "Corionicidad", value: o.corionicidad === "monocorionico" ? "Monocoriónico" : "Bicoriónico" });
  items.push({ label: "Vesícula vitelina", value: vitelinaTxt(o.vesiculaVitelina) });
  if (o.tipoEmbarazo === "unico") {
    items.push({ label: "Frecuencia cardíaca fetal", value: o.fcf1 ? `${o.fcf1} lpm` : "" });
  } else {
    items.push({ label: "FCF — Feto 1", value: o.fcf1 ? `${o.fcf1} lpm` : "" });
    items.push({ label: "FCF — Feto 2", value: o.fcf2 ? `${o.fcf2} lpm` : "" });
  }
  blocks.push(kv(items));
}

const vitelinaTxt = (v) =>
  v === "presente" ? "Presente" : v === "ausente" ? "Ausente" : "No hay medición";

const marcadorTxt = (v) => {
  const map = {
    presente: "Presente", ausente: "Ausente", indeterminado: "No es posible determinar",
    normal: "Normal", anormal: "Anormal", no_medicion: "No hay medición",
  };
  return map[v] || v;
};

function findingsOpcion2(state, blocks) {
  const o = state.op2;
  blocks.push(h("Tamizaje 11–14 semanas"));
  const m = [
    { label: "LCC", value: o.crl ? `${o.crl} mm` : "" },
    { label: "Translucencia nucal", value: o.tnNm ? "No hay medición" : o.tn ? `${o.tn} mm` : "" },
    { label: "Hueso nasal", value: marcadorTxt(o.huesoNasal) },
    { label: "Ductus venoso", value: marcadorTxt(o.ductusVenoso) },
    { label: "Regurgitación tricuspídea", value: marcadorTxt(o.regurgitacionTricuspidea) },
    { label: "FCF", value: o.fcfNm ? "No hay medición" : o.fcf ? `${o.fcf} lpm` : "" },
    { label: "PAPP-A", value: o.pappaNm ? "No hay medición" : o.pappa ? `${o.pappa} MoM` : "" },
    { label: "β-hCG libre", value: o.hcgNm ? "No hay medición" : o.hcg ? `${o.hcg} MoM` : "" },
    { label: "PlGF", value: o.plgfNm ? "No hay medición" : o.plgf ? `${o.plgf} MoM` : "" },
  ];
  blocks.push(kv(m));

  // Longitud cervical resaltada
  if (!o.lcNm && o.longitudCervical) blocks.push(highlight("Longitud cervical", `${o.longitudCervical} mm`));
  else if (o.lcNm) blocks.push(kv([{ label: "Longitud cervical", value: "No hay medición" }]));

  // Riesgos
  const r = [
    { label: "Riesgo trisomía 21", value: o.riesgoT21 },
    { label: "Riesgo trisomía 18", value: o.riesgoT18 },
    { label: "Riesgo trisomía 13", value: o.riesgoT13 },
    { label: "Riesgo de preeclampsia", value: o.riesgoPreeclampsia },
  ].filter((x) => x.value);
  if (r.length) {
    blocks.push(h("Riesgos calculados"));
    blocks.push(kv(r));
  }

  // Anatomía en prosa
  const presentes = [], ausentes = [], indet = [];
  ANATOMIA_11_14.forEach((a) => {
    const v = o.anatomia[a.key] || "ausente";
    if (v === "presente") presentes.push(a.label.toLowerCase());
    else if (v === "indeterminado") indet.push(a.label.toLowerCase());
    else ausentes.push(a.label.toLowerCase());
  });
  blocks.push(h("Evaluación anatómica"));
  const runs = [];
  if (ausentes.length)
    runs.push(run(`Evaluación anatómica precoz sin evidencia de: ${ausentes.join(", ")}. `));
  presentes.forEach((p) => {
    runs.push(run("Hallazgo presente: ", false));
    runs.push(run(p, true));
    runs.push(run(". "));
  });
  if (indet.length) runs.push(run(`No fue posible determinar: ${indet.join(", ")}. `));
  blocks.push(para(runs.length ? runs : [run("Sin hallazgos anatómicos consignados.")]));
}

function findingsOpcion3(state, blocks) {
  const o = state.op3;
  blocks.push(h("Evaluación morfológica (22–26 semanas)"));

  // Prosa de anatomía
  const normales = [], anormales = [], noExam = [];
  ANATOMIA_22_24.forEach((a) => {
    const cur = o.anatomia[a.key] || { estado: "normal" };
    if (cur.estado === "normal") normales.push(a.label.toLowerCase());
    else if (cur.estado === "no_examinado") noExam.push(a.label.toLowerCase());
    else anormales.push({ label: a.label, detalle: cur.detalle });
  });
  const runs = [];
  if (normales.length)
    runs.push(run(`Se evaluaron con apariencia ecográfica normal: ${normales.join(", ")}. `));
  anormales.forEach((a) => {
    runs.push(run(a.label, true));
    runs.push(run(`: ${a.detalle || "hallazgo anormal"}. `));
  });
  if (noExam.length) runs.push(run(`No se examinó: ${noExam.join(", ")}. `));
  blocks.push(para(runs.length ? runs : [run("Sin hallazgos consignados.")]));

  // Biometría opcional
  if (o.incluirBiometria) {
    const b = [
      { label: "DBP", value: o.dbp ? `${o.dbp} mm` : "" },
      { label: "CC", value: o.cc ? `${o.cc} mm` : "" },
      { label: "CA", value: o.ca ? `${o.ca} mm` : "" },
      { label: "LF", value: o.lf ? `${o.lf} mm` : "" },
      { label: "Peso fetal estimado", value: o.peso ? `${o.peso} g` : "" },
      { label: "Percentil de peso", value: o.pesoPercentil ? `p${o.pesoPercentil}` : "" },
    ];
    blocks.push(h("Biometría / crecimiento"));
    blocks.push(kv(b));
  }

  // Ecocardiograma
  blocks.push(h("Ecocardiograma fetal"));
  blocks.push(ecoBlock(o));

  // Longitud cervical resaltada + placenta
  if (!o.lcNm && o.longitudCervical) blocks.push(highlight("Longitud cervical", `${o.longitudCervical} mm`));
  blocks.push(kv([
    o.lcNm ? { label: "Longitud cervical", value: "No hay medición" } : null,
    { label: "Ubicación placentaria", value: labelFrom(UBICACION_PLACENTA, o.ubicacionPlacenta) },
  ].filter(Boolean)));

  // Preeclampsia
  blocks.push(h("Tamizaje de preeclampsia"));
  blocks.push(kv([
    { label: "Arterias uterinas", value: o.auNm ? "No hay medición" : o.arteriasUterinas },
    { label: "PlGF", value: o.plgfNm ? "No hay medición" : o.plgf },
    { label: "sFlt-1", value: o.sflt1Nm ? "No hay medición" : o.sflt1 },
    { label: "Cociente sFlt-1/PlGF", value: o.ratioNm ? "No hay medición" : o.ratio },
  ]));
  if (o.riesgoPreeclampsia) blocks.push(highlight("Riesgo de preeclampsia", o.riesgoPreeclampsia));
}

function ecoBlock(o) {
  if (o.ecoEstado === "no_realizado") {
    return para([run("Ecocardiograma fetal no realizado en este estudio.")]);
  }
  if (o.ecoEstado === "realizado_anormal") {
    return para([
      run("Ecocardiograma fetal con hallazgos anormales. ", true),
      run(o.ecoDescripcion || "Ver descripción."),
    ]);
  }
  // Normal
  const runs = [
    run(
      "Situs solitus con concordancia auriculoventricular y ventriculoarterial. " +
      "Corazón de posición, eje y tamaño normales, con cuatro cámaras simétricas. " +
      "Tractos de salida cruzados y permeables. Arcos aórtico y ductal sin alteraciones. " +
      "Retorno venoso pulmonar y sistémico normal. Frecuencia y ritmo cardíacos normales. "
    ),
  ];
  const diam = [];
  if (o.aortaDiam) diam.push(`válvula aórtica ${o.aortaDiam} mm${o.aortaZ ? ` (Z ${o.aortaZ})` : ""}`);
  if (o.pulmonarDiam) diam.push(`arteria pulmonar ${o.pulmonarDiam} mm${o.pulmonarZ ? ` (Z ${o.pulmonarZ})` : ""}`);
  if (diam.length) runs.push(run("Diámetros: " + diam.join("; ") + "."));
  return para(runs);
}

function findingsOpcion4(state, blocks) {
  const o = state.op4;
  blocks.push(h("Ultrasonido de crecimiento — Antropometría"));
  blocks.push(kv([
    { label: "DBP", value: o.dbp ? `${o.dbp} mm` : "" },
    { label: "CC", value: o.cc ? `${o.cc} mm` : "" },
    { label: "CA", value: o.ca ? `${o.ca} mm` : "" },
    { label: "LF", value: o.lf ? `${o.lf} mm` : "" },
    { label: "Peso fetal estimado", value: o.peso ? `${o.peso} g` : "" },
    { label: "Percentil de peso", value: o.pesoPercentil ? `p${o.pesoPercentil}` : "" },
  ]));

  const presentacionLabel = { cefalico: "Cefálica", pelvico: "Pélvica", transverso: "Transversa" }[o.presentacion] || "";
  blocks.push(kv([
    { label: "Presentación fetal", value: presentacionLabel },
    { label: "Ubicación placentaria", value: labelFrom(UBICACION_PLACENTA, o.ubicacionPlacenta) },
    { label: "Líquido amniótico", value: labelFrom(LIQUIDO_AMNIOTICO, o.liquidoAmniotico) + (o.ilaValor ? ` (${o.ilaValor} cm)` : "") },
  ]));

  // Alerta de placenta anormal
  if (o.placentaAnormal) {
    const tipos = [];
    if (o.placentaPrevia) tipos.push("placenta previa");
    if (o.placentaInsercionAnormal) tipos.push("inserción anormal");
    let txt = tipos.length ? tipos.join(" y ") : "placenta anormal";
    txt = txt.charAt(0).toUpperCase() + txt.slice(1);
    if (o.placentaDescripcion) txt += `. ${o.placentaDescripcion}`;
    blocks.push(alert("⚠ Alerta placentaria", txt));
  }

  // Doppler (IP + percentil + patrones de flujo)
  const fmtDop = (ip, p, nm, extra) => {
    if (nm) return "No se requiere";
    const parts = [];
    if (ip) parts.push(`IP ${ip}`);
    if (p) parts.push(`p${p}`);
    let s = parts.length === 2 ? `${parts[0]} (${parts[1]})` : parts.join(" ");
    if (extra) s = s ? `${s}, ${extra}` : extra;
    return s;
  };
  const dop = [
    { label: "Arterias uterinas", value: fmtDop(o.uterinas, o.uterinasP, o.uterinasNm) },
    { label: "Arteria umbilical", value: fmtDop(o.umbilical, o.umbilicalP, o.umbilicalNm, o.umbilicalReverso ? "flujo diastólico reverso" : "") },
    { label: "Arteria cerebral media", value: fmtDop(o.acm, o.acmP, o.acmNm) },
    { label: "Índice cerebro-placentario", value: fmtDop(o.icp, o.icpP, o.icpNm) },
    { label: "Ductus venoso", value: fmtDop(o.ductusVenoso, o.dvP, o.dvNm, o.dvOndaAReversa ? "onda a reversa" : "") },
    { label: "PlGF", value: o.plgfNm ? "No se requiere" : o.plgf },
    { label: "sFlt-1", value: o.sflt1Nm ? "No se requiere" : o.sflt1 },
    { label: "Balance angiogénico (sFlt-1/PlGF)", value: o.balanceNm ? "No se requiere" : o.balanceAngiogenico },
  ].filter((x) => x.value);
  if (dop.length) {
    blocks.push(h("Estudio Doppler"));
    blocks.push(kv(dop));
  }

  // RCIU
  if (o.rciuEnabled) {
    const cl = classifyRCIU({
      pesoPercentil: o.pesoPercentil,
      umbilicalPI_p95: o.rciu_umbilicalPI_p95,
      acmPI_p5: o.rciu_acmPI_p5,
      cprPercentil_p5: o.rciu_cpr_p5,
      uterinasPI_p95: o.rciu_uterinasPI_p95,
      umbilicalDiastoleAusente: o.rciu_umbDiastoleAusente,
      umbilicalDiastoleReversa: o.rciu_umbDiastoleReversa || o.umbilicalReverso,
      ductusVenosoIP_p95: o.rciu_dvIP_p95,
      ductusVenosoAReversa: o.rciu_dvAReversa || o.dvOndaAReversa,
    });
    blocks.push(h("Clasificación de RCIU (Medicina Fetal Barcelona)"));
    blocks.push(highlight(cl.label, cl.detail));
  }
}

// ============================================================
//  Construcción principal
// ============================================================
export function buildReport(state) {
  const h_ = state.historia;
  const fechaRep = formatDate(parseDate(state.fechaReporte));
  const gest = getGestational(state);

  const blocks = [];
  blocks.push(...findingsForOption(state));

  return {
    encabezado: ENCABEZADO,
    fechaReporte: fechaRep,
    paciente: {
      nombre: h_.nombre || "—",
      identificacion: h_.identificacion || "—",
      fechaNacimiento: h_.fechaNacimiento ? formatDate(parseDate(h_.fechaNacimiento)) : "",
      edad: h_.edad ? `${h_.edad} años` : "—",
      pesoMaterno: h_.pesoMaterno ? `${h_.pesoMaterno} kg` : "",
      presionArterial: h_.presionArterial ? `${h_.presionArterial} mmHg` : "",
    },
    antecedentesMedicos: antecedentesMedicos(h_),
    antecedentesObstetricos: antecedentesObstetricos(h_),
    edadGestacional: gest.egTexto,
    egFuente: gest.fuente,
    fpp: gest.fpp,
    egHitos: gest.hitos || [],
    blocks,
    comentarios: state.comentarios || "",
  };
}

function findingsForOption(state) {
  const blocks = [];
  if (state.opcion === "opcion1") findingsOpcion1(state, blocks);
  else if (state.opcion === "opcion2") findingsOpcion2(state, blocks);
  else if (state.opcion === "opcion3") findingsOpcion3(state, blocks);
  else if (state.opcion === "opcion4") findingsOpcion4(state, blocks);
  return blocks;
}

// ============================================================
//  Nota médica compacta (texto plano para expediente)
// ============================================================
export function buildNotaMedica(state) {
  const r = buildReport(state);
  const L = [];
  L.push(`ULTRASONIDO OBSTÉTRICO — ${r.fechaReporte}`);
  L.push(`Paciente: ${r.paciente.nombre} | Exp: ${r.paciente.identificacion} | Edad: ${r.paciente.edad}` +
    (r.paciente.fechaNacimiento ? ` | F. nac: ${r.paciente.fechaNacimiento}` : ""));
  if (r.paciente.pesoMaterno || r.paciente.presionArterial)
    L.push(`Peso materno: ${r.paciente.pesoMaterno || "—"} | PA: ${r.paciente.presionArterial || "—"}`);
  L.push(`Antec. médicos: ${r.antecedentesMedicos}`);
  if (r.antecedentesObstetricos.length > 0)
    L.push(
      "Antec. obstétricos: " +
        r.antecedentesObstetricos.map((x) => `${x.label}: ${x.value}`).join("; ")
    );
  if (r.edadGestacional) {
    L.push(`EG: ${r.edadGestacional}${r.egFuente ? ` (${r.egFuente.replace(/\.$/, "")})` : ""}${r.fpp ? ` | Semana 40 (FPP): ${r.fpp}` : ""}`);
    r.egHitos.forEach((hk) => L.push(`  · ${hk.label}: ${hk.value}`));
  }

  r.blocks.forEach((b) => {
    if (b.type === "heading") L.push(`\n${b.text.toUpperCase()}:`);
    else if (b.type === "kv") L.push(b.items.map((i) => `${i.label}: ${i.value}`).join("; "));
    else if (b.type === "para") L.push(b.runs.map((x) => x.text).join(""));
    else if (b.type === "highlight") L.push(`${b.label}: ${b.value}`);
    else if (b.type === "alert") L.push(`** ${b.label}: ${b.value} **`);
    else if (b.type === "note") L.push(b.text);
  });

  if (r.comentarios) L.push(`\nComentarios: ${r.comentarios}`);
  L.push(`\n${r.encabezado.medico} — ${r.encabezado.especialidad1}, ${r.encabezado.especialidad2}.`);
  return L.join("\n");
}
