"use client";

/**
 * GestationalCalculator — Calculadora de edad gestacional (ventana flotante)
 * ---------------------------------------------------------------------------
 * Componente React AUTÓNOMO y portátil. No depende de Tailwind ni de librerías
 * externas: solo React. Pégalo en cualquier proyecto y úsalo así:
 *
 *     import GestationalCalculator from "./GestationalCalculator";
 *     <GestationalCalculator />
 *
 * Props opcionales:
 *   - onUse(result)   : callback al pulsar "Usar resultado". Recibe
 *                       { semanas, dias, totalDays, egTexto, fppStr, metodo, detalle }.
 *   - consultorio     : texto del consultorio (hoja de hitos).
 *   - contacto        : texto de contacto (hoja de hitos).
 *   - defaultOpen     : abrir el modal al montar (boolean).
 *
 * Métodos: última regla, ultrasonido previo, LCC (CRL), DBP, FPP y manual.
 * Incluye el despliegue de "Hitos del embarazo" con copiar / PDF / Word.
 *
 * Autor de referencia clínica: Dr. Vladimir González Araya.
 */

import { useState } from "react";

/* ===================== Utilidades de fecha ===================== */
const MS_DAY = 86400000;
const TERM = 280;

function parseDate(s) {
  if (!s) return null;
  const [y, m, d] = String(s).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function formatDate(date) {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}
function addDays(date, days) { return new Date(date.getTime() + days * MS_DAY); }
function diffDays(a, b) { return Math.round((a.getTime() - b.getTime()) / MS_DAY); }
function weeksDaysToDays(w, d) { return (Number(w) || 0) * 7 + (Number(d) || 0); }
function daysToWeeksString(t) {
  if (t == null || isNaN(t)) return "";
  return `${Math.floor(t / 7)} semanas ${t % 7} días`;
}
function todayISO() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

/* ===================== Fórmulas biométricas ===================== */
// LCC -> EG (días). INTERGROWTH-21st (Papageorghiou 2014, ecuación invertida) o Robinson 1975.
function crlToGADays(crlMm, estandar = "intergrowth") {
  const crl = Number(crlMm);
  if (!crl || crl <= 0) return null;
  if (estandar === "robinson") return Math.round(8.052 * Math.sqrt(crl) + 23.73);
  const a = -50.6562, b = 0.815118, c = 0.00535302;
  const disc = b * b - 4 * c * (a - crl);
  if (disc < 0) return null;
  const ga = (-b + Math.sqrt(disc)) / (2 * c);
  return ga > 0 ? Math.round(ga) : null;
}
// DBP -> EG (días). Hadlock 1984 (DBP en cm): EG(sem) = 9.54 + 1.482·cm + 0.1676·cm².
function bpdToGADays(bpdMm) {
  const cm = Number(bpdMm) / 10;
  if (!cm || cm <= 0) return null;
  return Math.round((9.54 + 1.482 * cm + 0.1676 * cm * cm) * 7);
}

const METODO_LABEL = {
  fur: "fecha de última regla",
  us: "ultrasonido previo",
  crl: "longitud cefalocaudal",
  bpd: "diámetro biparietal",
  fpp: "fecha probable de parto",
  manual: "manual",
};
const CRL_ESTANDAR_LABEL = { intergrowth: "INTERGROWTH-21st", robinson: "Robinson-Fleming" };

/* ===================== Cálculo de edad gestacional ===================== */
function computeEG(d, refISO) {
  const ref = parseDate(refISO);
  if (!ref) return null;
  let totalDays = null, fpp = null, detalle = {};

  if (d.metodo === "fur") {
    const fur = parseDate(d.fur);
    if (!fur) return { ok: false, error: "Ingrese la fecha de última regla." };
    totalDays = diffDays(ref, fur);
    fpp = addDays(fur, TERM);
    detalle = { confiable: d.furConfiable || "confiable" };
  } else if (d.metodo === "us") {
    const us = parseDate(d.usFecha);
    if (!us) return { ok: false, error: "Ingrese la fecha del ultrasonido." };
    if (Number(d.usDias) < 0 || Number(d.usDias) > 6) return { ok: false, error: "Los días deben estar entre 0 y 6." };
    const base = weeksDaysToDays(d.usSem, d.usDias);
    totalDays = base + diffDays(ref, us);
    fpp = addDays(ref, TERM - totalDays);
    detalle = { fecha: d.usFecha, gaScanDays: base };
  } else if (d.metodo === "crl") {
    const cf = parseDate(d.crlFecha);
    if (!cf) return { ok: false, error: "Ingrese la fecha de la medición de LCC." };
    const ga = crlToGADays(d.crl, d.crlEstandar);
    if (ga == null) return { ok: false, error: "Ingrese una LCC válida (mm)." };
    totalDays = ga + diffDays(ref, cf);
    fpp = addDays(ref, TERM - totalDays);
    detalle = { crl: d.crl, fecha: d.crlFecha, gaScanDays: ga, estandar: d.crlEstandar };
  } else if (d.metodo === "bpd") {
    const bf = parseDate(d.bpdFecha);
    if (!bf) return { ok: false, error: "Ingrese la fecha de la medición del DBP." };
    const ga = bpdToGADays(d.bpd);
    if (ga == null) return { ok: false, error: "Ingrese un DBP válido (mm)." };
    totalDays = ga + diffDays(ref, bf);
    fpp = addDays(ref, TERM - totalDays);
    detalle = { bpd: d.bpd, fecha: d.bpdFecha, gaScanDays: ga };
  } else if (d.metodo === "fpp") {
    const f = parseDate(d.fpp);
    if (!f) return { ok: false, error: "Ingrese la fecha probable de parto." };
    totalDays = TERM - diffDays(f, ref);
    fpp = f;
  } else if (d.metodo === "manual") {
    if (d.manSem === "" && d.manDias === "") return { ok: false, error: "Ingrese semanas y días." };
    if (Number(d.manDias) < 0 || Number(d.manDias) > 6) return { ok: false, error: "Los días deben estar entre 0 y 6." };
    totalDays = weeksDaysToDays(d.manSem, d.manDias);
    fpp = addDays(ref, TERM - totalDays);
  } else {
    return null;
  }

  if (totalDays == null || isNaN(totalDays)) return { ok: false, error: "Datos insuficientes." };
  if (totalDays < 0) return { ok: false, error: "La fecha produce una edad gestacional negativa." };
  if (totalDays > 310) return { ok: false, error: "La edad gestacional parece excesiva (> 44 semanas)." };

  const semanas = Math.floor(totalDays / 7), dias = totalDays % 7;
  return {
    ok: true, semanas, dias, totalDays, fpp,
    fppStr: formatDate(fpp),
    egTexto: `${semanas} semanas ${dias} días`,
    metodo: d.metodo, metodoLabel: METODO_LABEL[d.metodo], detalle,
  };
}

function fuenteTexto(r) {
  const d = r.detalle || {};
  switch (r.metodo) {
    case "fur": return `Fecha de última regla (${d.confiable === "no_confiable" ? "no confiable" : "confiable"})`;
    case "us": return `Ultrasonido previo del ${formatDate(parseDate(d.fecha))} (${daysToWeeksString(d.gaScanDays)} en ese momento)`;
    case "crl": return `Longitud cefalocaudal de ${d.crl} mm (${daysToWeeksString(d.gaScanDays)}, ${CRL_ESTANDAR_LABEL[d.estandar] || ""})`;
    case "bpd": return `Diámetro biparietal de ${d.bpd} mm (${daysToWeeksString(d.gaScanDays)})`;
    case "fpp": return "A partir de la fecha probable de parto";
    case "manual": return "Método manual ingresado por el médico";
    default: return r.metodoLabel;
  }
}

/* ===================== Hitos del embarazo ===================== */
const HITOS_DEF = [
  { titulo: "Semana 11 a 12", start: 77, end: 84, leyenda: "Favor realizar los laboratorios Proteína A plasmática (PAPP-A), HCG libre y factor de crecimiento placentario (PLGF). Estos exámenes son sumamente útiles para el tamizaje de riesgo de preeclampsia y de trisomías como el síndrome de Down; favor realizarlos en las fechas establecidas para obtener el mayor rendimiento. Recuerde realizar los exámenes generales si no los ha realizado, que incluyen: hemograma, función tiroidea (TSH, T4L), glicemia en ayunas, VDRL, VIH, hepatitis B, grupo y Rh. Si tiene algún padecimiento crónico, informe al Dr. González o a la Lic. Yancini Araya para que le indiquen qué otro laboratorio requiere." },
  { titulo: "Semana 12 con 3 días", start: 87, leyenda: "Esta es la fecha ideal para realizar el tamizaje de primer trimestre. Puede extender la fecha de la cita hasta por 10 días." },
  { titulo: "Semana 18", start: 126, leyenda: "En esta fecha es el primer momento en que se puede ver con seguridad el género del bebé. Es una fecha clave para medir la longitud del cuello del útero." },
  { titulo: "Semana 23 a 24", start: 161, end: 168, leyenda: "Estas fechas son las ideales para realizar el ultrasonido anatómico de su bebé: las estructuras anatómicas están formadas y las condiciones de visualización sonográfica son óptimas." },
  { titulo: "Semana 24 a 28", start: 168, end: 196, leyenda: "Favor realizar en esta fecha el tamizaje de diabetes gestacional; se solicita en el laboratorio como Curva de Tolerancia a la Glucosa con 75 gramos, debe ir en ayunas. Solicitar también un hemograma control y una prueba de ferritina." },
  { titulo: "Semana 28", start: 196, leyenda: "Primer ultrasonido de crecimiento." },
  { titulo: "Semana 32", start: 224, leyenda: "Segundo ultrasonido de crecimiento." },
  { titulo: "Semana 33", start: 231, leyenda: "Creemos que esta es una fecha clave para la detección temprana de preeclampsia. Afortunadamente contamos con una prueba capaz de descartar esa condición en esta etapa del embarazo; favor solicitar en el laboratorio un Balance Angiogénico y presentarlo al Dr. González en la cita de la semana 32 y/o en la cita de la semana 36." },
  { titulo: "Semana 36", start: 252, leyenda: "Tercer ultrasonido de crecimiento." },
  { titulo: "Semana 37", start: 259, leyenda: "A partir de ahora su bebé está listo para nacer si así lo decide él o ella." },
  { titulo: "Semana 39", start: 273, leyenda: "En esta fecha es usual que se programen las cesáreas electivas." },
  { titulo: "Semana 40", start: 280, leyenda: "Representa la fecha que tradicionalmente se conoce como fecha estimada de parto, pero lo que realmente significa es que el 50% de los bebés han nacido a esta fecha y al otro 50% aún les falta nacer. Si le preguntan para cuándo está su bebé, responda con esta fecha." },
  { titulo: "Semana 41", start: 287, leyenda: "Es una fecha que amerita una vigilancia más estrecha del embarazo; por lo general se decide internar a la paciente en el hospital para facilitar la vigilancia y el nacimiento del bebé." },
];
const CIERRE = "Esperamos que esta información personalizada le ayude a estar más segura de las diferentes etapas del embarazo. No dude en contactarnos si tiene alguna duda; estamos para servirle.";

function buildHitos(res, refISO, paciente, consultorio, contacto) {
  const ref = parseDate(refISO);
  const current = res && res.ok ? res.totalDays : null;
  const items = HITOS_DEF.map((d) => {
    let fecha = "", superada = false;
    if (ref && current != null) {
      const ini = addDays(ref, d.start - current);
      if (d.end != null) {
        fecha = `del ${formatDate(ini)} al ${formatDate(addDays(ref, d.end - current))}`;
        superada = current > d.end;
      } else {
        fecha = formatDate(ini);
        superada = current > d.start;
      }
    }
    return { titulo: d.titulo, fecha, leyenda: d.leyenda, superada };
  });
  return {
    paciente: paciente || "",
    eg: res && res.ok ? res.egTexto : "",
    fpp: res && res.ok ? res.fppStr : "",
    items, cierre: CIERRE, consultorio, contacto,
  };
}
function hitosTexto(h) {
  const L = ["HITOS DEL EMBARAZO — FECHAS CLAVE PERSONALIZADAS"];
  if (h.paciente) L.push(`Paciente: ${h.paciente}`);
  if (h.eg) L.push(`Edad gestacional: ${h.eg}${h.fpp ? ` · Fecha probable de parto: ${h.fpp}` : ""}`);
  L.push("");
  h.items.forEach((it) => { L.push(`${it.titulo} — ${it.fecha}${it.superada ? " (ya superada)" : ""}`); L.push(it.leyenda); L.push(""); });
  L.push(h.cierre, "", h.consultorio, h.contacto);
  return L.join("\n");
}
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function hitosHTML(h) {
  const filas = h.items.map((it) => `
    <div class="hito"><div class="hh"><span class="ht">${esc(it.titulo)}</span><span class="hf">${esc(it.fecha)}${it.superada ? " · ya superada" : ""}</span></div><p class="hl">${esc(it.leyenda)}</p></div>`).join("");
  return `<h1>Hitos del embarazo — Fechas clave personalizadas</h1>
    <p class="sub">Calendario informativo de su control prenatal</p>
    <div class="datos">${h.paciente ? `<div><b>Paciente:</b> ${esc(h.paciente)}</div>` : ""}${h.eg ? `<div><b>Edad gestacional:</b> ${esc(h.eg)}${h.fpp ? ` &nbsp;·&nbsp; <b>Fecha probable de parto:</b> ${esc(h.fpp)}` : ""}</div>` : ""}</div>
    ${filas}
    <p class="cierre">${esc(h.cierre)}</p>
    <div class="firma"><b>${esc(h.consultorio)}</b><br>${esc(h.contacto)}</div>`;
}
const HITOS_CSS = `
  body{font-family:Georgia,'Times New Roman',serif;color:#1f2937;margin:0;padding:32px 40px;line-height:1.5}
  h1{color:#174c87;font-size:22px;margin:0 0 4px}.sub{color:#555;font-size:13px;margin:0}
  .datos{margin:14px 0 18px;padding:10px 14px;background:#eef4fb;border-radius:8px;font-size:14px}
  .hito{padding:12px 0;border-bottom:1px solid #e5e7eb;page-break-inside:avoid}
  .hh{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:4px}
  .ht{font-weight:bold;color:#123a68;font-size:15px}.hf{font-weight:bold;color:#1d5fa8;font-size:14px;white-space:nowrap}
  .hl{margin:0;font-size:13.5px;text-align:justify}.cierre{margin-top:20px;font-size:13.5px;text-align:justify}
  .firma{margin-top:22px;padding-top:12px;border-top:2px solid #174c87;font-size:13.5px}
  @page{size:A4;margin:16mm}`;
function printHitos(h) {
  const w = window.open("", "_blank");
  if (!w) { alert("Permita las ventanas emergentes para generar el PDF."); return; }
  w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Hitos del embarazo${h.paciente ? " - " + esc(h.paciente) : ""}</title><style>${HITOS_CSS}</style></head><body>${hitosHTML(h)}</body></html>`);
  w.document.close(); w.focus();
  setTimeout(() => w.print(), 400);
}
function downloadHitosWord(h) {
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>${HITOS_CSS}</style></head><body>${hitosHTML(h)}</body></html>`;
  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const nombre = (h.paciente || "paciente").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "");
  a.href = url; a.download = `Hitos_${nombre}.doc`; a.click();
  URL.revokeObjectURL(url);
}

/* ===================== Estilos en línea ===================== */
const C = { brand: "#174c87", brand600: "#1d5fa8", brand50: "#eef4fb", border: "#d1d5db", gray: "#6b7280" };
const S = {
  fab: { position: "fixed", right: 20, bottom: 20, zIndex: 9998, background: C.brand, color: "#fff", border: "none", borderRadius: 999, padding: "12px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,.25)" },
  overlay: { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: 16, fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif" },
  modal: { marginTop: 30, width: "100%", maxWidth: 540, background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 10px 40px rgba(0,0,0,.3)", color: "#111827" },
  h3: { margin: 0, fontSize: 18, fontWeight: 700, color: C.brand },
  x: { border: "none", background: "none", fontSize: 26, lineHeight: 1, color: "#9ca3af", cursor: "pointer" },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", margin: "12px 0 4px" },
  input: { width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 14 },
  sel: { border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 8px", fontSize: 14 },
  resBox: { marginTop: 14, border: `1px solid #e5e7eb`, background: "#f9fafb", borderRadius: 12, padding: 14 },
  btn: (v) => ({ borderRadius: 8, padding: "8px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer", border: v === "ghost" ? "none" : `1px solid ${C.brand}`, background: v === "primary" ? C.brand : v === "dark" ? "#1f2937" : v === "ghost" ? "transparent" : "#fff", color: v === "primary" || v === "dark" ? "#fff" : v === "ghost" ? C.gray : C.brand }),
  seg: (active) => ({ borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: active ? C.brand : "transparent", color: active ? "#fff" : "#4b5563" }),
  segWrap: { display: "inline-flex", flexWrap: "wrap", gap: 4, background: "#f3f4f6", padding: 4, borderRadius: 8 },
};

function Seg({ value, onChange, options }) {
  return (
    <div style={S.segWrap}>
      {options.map((o) => (
        <button key={o.value} type="button" style={S.seg(value === o.value)} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}
function DateSelect({ value, onChange, yearStart = 2020 }) {
  const yEnd = new Date().getFullYear() + 1;
  const p = (value || "").split("-");
  const y = p[0] || "", m = p[1] ? String(Number(p[1])) : "", d = p[2] ? String(Number(p[2])) : "";
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const years = []; for (let i = yEnd; i >= yearStart; i--) years.push(i);
  const emit = (yy, mm, dd) => onChange(`${yy || ""}-${mm ? String(mm).padStart(2, "0") : ""}-${dd ? String(dd).padStart(2, "0") : ""}`);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select style={S.sel} value={d} onChange={(e) => emit(y, m, e.target.value)}><option value="">Día</option>{Array.from({ length: 31 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select>
      <select style={{ ...S.sel, flex: 1 }} value={m} onChange={(e) => emit(y, e.target.value, d)}><option value="">Mes</option>{meses.map((mn, i) => <option key={i} value={i + 1}>{mn}</option>)}</select>
      <select style={S.sel} value={y} onChange={(e) => emit(e.target.value, m, d)}><option value="">Año</option>{years.map((yr) => <option key={yr} value={yr}>{yr}</option>)}</select>
    </div>
  );
}

const METODOS = [
  { value: "fur", label: "Última regla" },
  { value: "us", label: "Ultrasonido previo" },
  { value: "crl", label: "LCC" },
  { value: "bpd", label: "DBP" },
  { value: "fpp", label: "FPP" },
  { value: "manual", label: "Manual" },
];
const BLANK = {
  metodo: "fur", paciente: "",
  fur: "", furConfiable: "confiable",
  usFecha: "", usSem: "", usDias: "",
  crl: "", crlFecha: todayISO(), crlEstandar: "intergrowth",
  bpd: "", bpdFecha: todayISO(),
  fpp: "", manSem: "", manDias: "",
};

/* ===================== Componente principal ===================== */
export default function GestationalCalculator({
  onUse,
  consultorio = "Consultorio del Dr. Vladimir González Araya",
  contacto = "Es un placer servirle. Contacto para dudas: WhatsApp 8801-7001.",
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [d, setD] = useState(BLANK);
  const [showHitos, setShowHitos] = useState(false);
  const [copied, setCopied] = useState(false);
  const set = (patch) => setD((s) => ({ ...s, ...patch }));

  const ref = todayISO();
  const res = computeEG(d, ref);
  const hitos = res && res.ok ? buildHitos(res, ref, d.paciente, consultorio, contacto) : null;

  const copiarHitos = async () => {
    try { await navigator.clipboard.writeText(hitosTexto(hitos)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  };

  if (!open) {
    return <button type="button" style={S.fab} onClick={() => setOpen(true)}>🧮 Edad gestacional</button>;
  }

  return (
    <div style={S.overlay} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div style={S.modal}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <h3 style={S.h3}>Calculadora de edad gestacional</h3>
          <button type="button" style={S.x} onClick={() => setOpen(false)}>×</button>
        </div>

        <label style={S.label}>Nombre de la paciente (opcional)</label>
        <input style={S.input} value={d.paciente} onChange={(e) => set({ paciente: e.target.value })} placeholder="Para la hoja de hitos" />

        <label style={S.label}>Método de cálculo</label>
        <Seg value={d.metodo} onChange={(v) => set({ metodo: v })} options={METODOS} />

        {d.metodo === "fur" && (<>
          <label style={S.label}>Fecha de última regla</label>
          <DateSelect value={d.fur} onChange={(v) => set({ fur: v })} yearStart={2019} />
          <label style={S.label}>Confiabilidad de la fecha</label>
          <Seg value={d.furConfiable} onChange={(v) => set({ furConfiable: v })} options={[{ value: "confiable", label: "Confiable" }, { value: "no_confiable", label: "No confiable" }]} />
        </>)}

        {d.metodo === "us" && (<>
          <label style={S.label}>Fecha del ultrasonido</label>
          <DateSelect value={d.usFecha} onChange={(v) => set({ usFecha: v })} />
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={S.label}>Semanas</label><input type="number" style={S.input} value={d.usSem} onChange={(e) => set({ usSem: e.target.value })} placeholder="Ej. 12" /></div>
            <div style={{ flex: 1 }}><label style={S.label}>Días (0–6)</label><input type="number" style={S.input} value={d.usDias} onChange={(e) => set({ usDias: e.target.value })} placeholder="0–6" /></div>
          </div>
        </>)}

        {d.metodo === "crl" && (<>
          <label style={S.label}>Longitud cefalocaudal (LCC)</label>
          <input type="number" style={S.input} value={d.crl} onChange={(e) => set({ crl: e.target.value })} placeholder="mm" />
          <label style={S.label}>Estándar</label>
          <Seg value={d.crlEstandar} onChange={(v) => set({ crlEstandar: v })} options={[{ value: "intergrowth", label: "INTERGROWTH-21st" }, { value: "robinson", label: "Robinson-Fleming" }]} />
          <label style={S.label}>Fecha de la medición</label>
          <DateSelect value={d.crlFecha} onChange={(v) => set({ crlFecha: v })} />
        </>)}

        {d.metodo === "bpd" && (<>
          <label style={S.label}>Diámetro biparietal (DBP)</label>
          <input type="number" style={S.input} value={d.bpd} onChange={(e) => set({ bpd: e.target.value })} placeholder="mm" />
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Hadlock 1984 — estándar universal de datación.</div>
          <label style={S.label}>Fecha de la medición</label>
          <DateSelect value={d.bpdFecha} onChange={(v) => set({ bpdFecha: v })} />
        </>)}

        {d.metodo === "fpp" && (<>
          <label style={S.label}>Fecha probable de parto</label>
          <DateSelect value={d.fpp} onChange={(v) => set({ fpp: v })} />
        </>)}

        {d.metodo === "manual" && (
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><label style={S.label}>Semanas actuales</label><input type="number" style={S.input} value={d.manSem} onChange={(e) => set({ manSem: e.target.value })} placeholder="Ej. 18" /></div>
            <div style={{ flex: 1 }}><label style={S.label}>Días (0–6)</label><input type="number" style={S.input} value={d.manDias} onChange={(e) => set({ manDias: e.target.value })} placeholder="0–6" /></div>
          </div>
        )}

        {/* Resultado */}
        <div style={S.resBox}>
          {!res && <span style={{ fontSize: 14, color: "#9ca3af" }}>Complete los datos para ver el resultado.</span>}
          {res && !res.ok && <span style={{ fontSize: 14, color: "#dc2626" }}>{res.error}</span>}
          {res && res.ok && (
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.brand }}>{res.egTexto}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Origen: {fuenteTexto(res)}</div>
              <div style={{ fontSize: 14, color: "#374151", marginTop: 6 }}>Semana 40 (FPP): <b>{res.fppStr}</b></div>
              <div style={{ marginTop: 10 }}>
                <button type="button" style={S.btn("secondary")} onClick={() => setShowHitos((v) => !v)}>{showHitos ? "Ocultar hitos" : "Desplegar hitos del embarazo"}</button>
              </div>
            </div>
          )}
        </div>

        {/* Hitos */}
        {showHitos && hitos && (
          <div style={{ marginTop: 12, border: `1px solid #bcd0ea`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              <button type="button" style={S.btn("primary")} onClick={copiarHitos}>{copied ? "✓ ¡Copiado!" : "📋 Copiar información"}</button>
              <button type="button" style={S.btn("secondary")} onClick={() => printHitos(hitos)}>Guardar PDF</button>
              <button type="button" style={S.btn("dark")} onClick={() => downloadHitosWord(hitos)}>Guardar Word</button>
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto", background: "#f9fafb", borderRadius: 8, padding: 12 }}>
              {hitos.paciente && <div style={{ fontSize: 14, fontWeight: 700 }}>Paciente: {hitos.paciente}</div>}
              {hitos.eg && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>EG: {hitos.eg}{hitos.fpp ? ` · FPP: ${hitos.fpp}` : ""}</div>}
              {hitos.items.map((it, i) => (
                <div key={i} style={{ marginBottom: 8, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#123a68" }}>{it.titulo}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.brand600 }}>{it.fecha}{it.superada ? " · ya superada" : ""}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4b5563", lineHeight: 1.5 }}>{it.leyenda}</p>
                </div>
              ))}
              <p style={{ fontSize: 12, fontStyle: "italic", color: "#4b5563" }}>{hitos.cierre}</p>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.brand, margin: "8px 0 0" }}>{hitos.consultorio}</p>
              <p style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>{hitos.contacto}</p>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <button type="button" style={S.btn("ghost")} onClick={() => { setD(BLANK); setShowHitos(false); }}>Limpiar</button>
          <div style={{ display: "flex", gap: 8 }}>
            {onUse && <button type="button" style={S.btn("primary")} disabled={!res || !res.ok} onClick={() => res && res.ok && onUse(res)}>Usar resultado</button>}
            <button type="button" style={S.btn("secondary")} onClick={() => setOpen(false)}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
