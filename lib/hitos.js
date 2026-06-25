// ============================================================
//  Hitos del embarazo — hoja informativa personalizada
//  Calcula las fechas clave a partir de la edad gestacional
//  y genera texto, PDF (impresión) y datos para Word.
// ============================================================
import { parseDate, addDays, formatDate } from "./calculations";

const CONTACTO = "Es un placer servirle. Contacto para dudas: WhatsApp 8801-7001.";
const CONSULTORIO = "Consultorio del Dr. Vladimir González Araya";
const CIERRE =
  "Esperamos que esta información personalizada le ayude a estar más segura de las diferentes etapas del embarazo. No dude en contactarnos si tiene alguna duda; estamos para servirle.";

// Definición de hitos en orden cronológico.
// start/end en días de gestación. Si hay end, es un rango.
export const HITOS_DEF = [
  {
    titulo: "Semana 11 a 12",
    start: 11 * 7, end: 12 * 7,
    leyenda:
      "Favor realizar los laboratorios Proteína A plasmática (PAPP-A), HCG libre y factor de crecimiento placentario (PLGF). Estos exámenes son sumamente útiles para el tamizaje de riesgo de preeclampsia y de trisomías como el síndrome de Down; favor realizarlos en las fechas establecidas para obtener el mayor rendimiento. Recuerde realizar los exámenes generales si no los ha realizado, que incluyen: hemograma, función tiroidea (TSH, T4L), glicemia en ayunas, VDRL, VIH, hepatitis B, grupo y Rh. Si tiene algún padecimiento crónico, informe al Dr. González o a la Lic. Yancini Araya para que le indiquen qué otro laboratorio requiere.",
  },
  {
    titulo: "Semana 12 con 3 días",
    start: 12 * 7 + 3,
    leyenda:
      "Esta es la fecha ideal para realizar el tamizaje de primer trimestre. Puede extender la fecha de la cita hasta por 10 días.",
  },
  {
    titulo: "Semana 18",
    start: 18 * 7,
    leyenda:
      "En esta fecha es el primer momento en que se puede ver con seguridad el género del bebé. Es una fecha clave para medir la longitud del cuello del útero.",
  },
  {
    titulo: "Semana 23 a 24",
    start: 23 * 7, end: 24 * 7,
    leyenda:
      "Estas fechas son las ideales para realizar el ultrasonido anatómico de su bebé: las estructuras anatómicas están formadas y las condiciones de visualización sonográfica son óptimas.",
  },
  {
    titulo: "Semana 24 a 28",
    start: 24 * 7, end: 28 * 7,
    leyenda:
      "Favor realizar en esta fecha el tamizaje de diabetes gestacional; se solicita en el laboratorio como Curva de Tolerancia a la Glucosa con 75 gramos, debe ir en ayunas. Solicitar también un hemograma control y una prueba de ferritina.",
  },
  {
    titulo: "Semana 28",
    start: 28 * 7,
    leyenda: "Primer ultrasonido de crecimiento.",
  },
  {
    titulo: "Semana 32",
    start: 32 * 7,
    leyenda: "Segundo ultrasonido de crecimiento.",
  },
  {
    titulo: "Semana 33",
    start: 33 * 7,
    leyenda:
      "Creemos que esta es una fecha clave para la detección temprana de preeclampsia. Afortunadamente contamos con una prueba capaz de descartar esa condición en esta etapa del embarazo; favor solicitar en el laboratorio un Balance Angiogénico y presentarlo al Dr. González en la cita de la semana 32 y/o en la cita de la semana 36.",
  },
  {
    titulo: "Semana 36",
    start: 36 * 7,
    leyenda: "Tercer ultrasonido de crecimiento.",
  },
  {
    titulo: "Semana 37",
    start: 37 * 7,
    leyenda: "A partir de ahora su bebé está listo para nacer si así lo decide él o ella.",
  },
  {
    titulo: "Semana 39",
    start: 39 * 7,
    leyenda: "En esta fecha es usual que se programen las cesáreas electivas.",
  },
  {
    titulo: "Semana 40",
    start: 40 * 7,
    leyenda:
      "Representa la fecha que tradicionalmente se conoce como fecha estimada de parto, pero lo que realmente significa es que el 50% de los bebés han nacido a esta fecha y al otro 50% aún les falta nacer. Si le preguntan para cuándo está su bebé, responda con esta fecha.",
  },
  {
    titulo: "Semana 41",
    start: 41 * 7,
    leyenda:
      "Es una fecha que amerita una vigilancia más estrecha del embarazo; por lo general se decide internar a la paciente en el hospital para facilitar la vigilancia y el nacimiento del bebé.",
  },
];

/**
 * Construye los hitos con fechas calculadas.
 * @param {object} state  estado de la app
 * @param {object} egRes  resultado de computeEG (con totalDays)
 */
export function buildHitos(state, egRes) {
  const ref = parseDate(state.fechaReporte);
  const current = egRes && egRes.ok ? egRes.totalDays : null;

  const items = HITOS_DEF.map((d) => {
    let fecha = "";
    let superada = false;
    if (ref && current != null) {
      const ini = addDays(ref, d.start - current);
      if (d.end != null) {
        const fin = addDays(ref, d.end - current);
        fecha = `del ${formatDate(ini)} al ${formatDate(fin)}`;
        superada = current > d.end;
      } else {
        fecha = formatDate(ini);
        superada = current > d.start;
      }
    }
    return { titulo: d.titulo, fecha, leyenda: d.leyenda, superada };
  });

  return {
    paciente: state.historia?.nombre || "",
    eg: egRes && egRes.ok ? egRes.egTexto : "",
    fpp: egRes && egRes.ok ? egRes.fppStr : "",
    items,
    cierre: CIERRE,
    consultorio: CONSULTORIO,
    contacto: CONTACTO,
  };
}

export function buildHitosTexto(state, egRes) {
  const d = buildHitos(state, egRes);
  const L = [];
  L.push("HITOS DEL EMBARAZO — FECHAS CLAVE PERSONALIZADAS");
  if (d.paciente) L.push(`Paciente: ${d.paciente}`);
  if (d.eg) L.push(`Edad gestacional: ${d.eg}${d.fpp ? ` · Fecha probable de parto: ${d.fpp}` : ""}`);
  L.push("");
  d.items.forEach((it) => {
    L.push(`${it.titulo} — ${it.fecha}${it.superada ? " (ya superada)" : ""}`);
    L.push(it.leyenda);
    L.push("");
  });
  L.push(d.cierre);
  L.push("");
  L.push(d.consultorio);
  L.push(d.contacto);
  return L.join("\n");
}

/** Genera una hoja imprimible (PDF) en una ventana nueva. */
export function printHitos(state, egRes) {
  const d = buildHitos(state, egRes);
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const filas = d.items
    .map(
      (it) => `
      <div class="hito">
        <div class="hito-head">
          <span class="hito-titulo">${esc(it.titulo)}</span>
          <span class="hito-fecha">${esc(it.fecha)}${it.superada ? " · ya superada" : ""}</span>
        </div>
        <p class="hito-leyenda">${esc(it.leyenda)}</p>
      </div>`
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
  <title>Hitos del embarazo${d.paciente ? " - " + esc(d.paciente) : ""}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #1f2937; margin: 0; padding: 32px 40px; line-height: 1.5; }
    h1 { color: #174c87; font-size: 22px; margin: 0 0 4px; }
    .sub { color: #555; font-size: 13px; margin: 0; }
    .datos { margin: 14px 0 18px; padding: 10px 14px; background: #eef4fb; border-radius: 8px; font-size: 14px; }
    .datos strong { color: #174c87; }
    .hito { padding: 12px 0; border-bottom: 1px solid #e5e7eb; page-break-inside: avoid; }
    .hito-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 4px; }
    .hito-titulo { font-weight: bold; color: #123a68; font-size: 15px; }
    .hito-fecha { font-weight: bold; color: #1d5fa8; font-size: 14px; white-space: nowrap; }
    .hito-leyenda { margin: 0; font-size: 13.5px; text-align: justify; }
    .cierre { margin-top: 20px; font-size: 13.5px; text-align: justify; }
    .firma { margin-top: 22px; padding-top: 12px; border-top: 2px solid #174c87; font-size: 13.5px; }
    .firma strong { color: #174c87; }
    @page { size: A4; margin: 16mm; }
  </style></head><body>
    <h1>Hitos del embarazo — Fechas clave personalizadas</h1>
    <p class="sub">Calendario informativo de su control prenatal</p>
    <div class="datos">
      ${d.paciente ? `<div><strong>Paciente:</strong> ${esc(d.paciente)}</div>` : ""}
      ${d.eg ? `<div><strong>Edad gestacional:</strong> ${esc(d.eg)}${d.fpp ? ` &nbsp;·&nbsp; <strong>Fecha probable de parto:</strong> ${esc(d.fpp)}` : ""}</div>` : ""}
    </div>
    ${filas}
    <p class="cierre">${esc(d.cierre)}</p>
    <div class="firma">
      <strong>${esc(d.consultorio)}</strong><br>${esc(d.contacto)}
    </div>
  </body></html>`;

  const w = window.open("", "_blank");
  if (!w) {
    alert("Permita las ventanas emergentes para generar el PDF.");
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}
