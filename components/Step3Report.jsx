"use client";

import { useState } from "react";
import { Section, TextArea, Button } from "./ui";
import { buildReport, buildNotaMedica } from "@/lib/report";
import { generateDocx } from "@/lib/docxExport";

function Blocks({ blocks }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "heading")
          return (
            <h3 key={i} className="mb-2 mt-5 border-b border-brand-100 pb-1 text-sm font-bold uppercase tracking-wide text-brand-700">
              {b.text}
            </h3>
          );
        if (b.type === "kv")
          return (
            <div key={i} className="mb-2 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
              {b.items.map((it, j) => (
                <div key={j} className="text-sm">
                  <span className="font-semibold text-gray-700">{it.label}:</span>{" "}
                  <span className="text-gray-800">{it.value}</span>
                </div>
              ))}
            </div>
          );
        if (b.type === "para")
          return (
            <p key={i} className="mb-2 text-justify text-sm leading-relaxed text-gray-800">
              {b.runs.map((r, j) => (r.bold ? <strong key={j}>{r.text}</strong> : <span key={j}>{r.text}</span>))}
            </p>
          );
        if (b.type === "highlight")
          return (
            <div key={i} className="mb-2 rounded-md border-l-4 border-brand-600 bg-brand-50 px-3 py-2 text-sm">
              <span className="font-bold text-brand-800">{b.label}:</span>{" "}
              <span className="text-brand-900">{b.value}</span>
            </div>
          );
        if (b.type === "alert")
          return (
            <div key={i} className="mb-2 rounded-md border-l-4 border-red-600 bg-red-50 px-3 py-2 text-sm">
              <span className="font-bold text-red-700">{b.label}:</span>{" "}
              <span className="font-semibold text-red-900">{b.value}</span>
            </div>
          );
        if (b.type === "note")
          return <p key={i} className="mb-2 text-sm text-gray-700">{b.text}</p>;
        return null;
      })}
    </>
  );
}

export default function Step3Report({ state, update }) {
  const [busy, setBusy] = useState(false);
  const [notaOpen, setNotaOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const r = buildReport(state);
  const nota = buildNotaMedica(state);

  const handleWord = async () => {
    setBusy(true);
    try {
      await generateDocx(state);
    } catch (e) {
      alert("Error al generar Word: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = () => window.print();

  const copyNota = async () => {
    try {
      await navigator.clipboard.writeText(nota);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = nota;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      {/* Caja de comentarios (siempre accesible antes de generar) */}
      <Section title="Comentarios" subtitle="Texto libre que aparecerá al final del reporte. Editable en todo momento." accent>
        <TextArea
          value={state.comentarios}
          onChange={(v) => update({ comentarios: v })}
          rows={4}
          placeholder="Agregue comentarios, recomendaciones o plan de seguimiento."
        />
      </Section>

      {/* Acciones */}
      <div className="no-print mb-4 flex flex-wrap gap-3">
        <Button onClick={handleWord} disabled={busy}>
          {busy ? "Generando…" : "Descargar Word (.docx)"}
        </Button>
        <Button variant="secondary" onClick={handlePrint}>
          Imprimir / Guardar PDF
        </Button>
        <Button variant="dark" onClick={() => setNotaOpen((v) => !v)}>
          {notaOpen ? "Ocultar nota médica" : "Nota médica para expediente"}
        </Button>
      </div>

      {/* Nota médica compacta */}
      {notaOpen && (
        <Section title="Nota médica compacta" subtitle="Lista para copiar al expediente.">
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
            {nota}
          </pre>
          <div className="mt-3">
            <Button variant="secondary" onClick={copyNota}>
              {copied ? "¡Copiado!" : "Copiar al portapapeles"}
            </Button>
          </div>
        </Section>
      )}

      {/* Vista previa imprimible */}
      <div id="print-area" className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {/* Encabezado */}
        <div className="mb-5 border-b-2 border-brand-600 pb-4 text-center">
          <h1 className="text-xl font-bold text-brand-700">{r.encabezado.titulo}</h1>
          <div className="mt-1 text-base font-semibold text-gray-800">{r.encabezado.medico}</div>
          <div className="text-sm text-gray-500">
            {r.encabezado.especialidad1} · {r.encabezado.especialidad2}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {r.encabezado.lugar} · Fecha de elaboración: {r.fechaReporte}
          </div>
        </div>

        {/* Datos paciente */}
        <div className="mb-3 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-3">
          <div className="text-sm"><span className="font-semibold text-gray-700">Paciente:</span> {r.paciente.nombre}</div>
          <div className="text-sm"><span className="font-semibold text-gray-700">Expediente:</span> {r.paciente.identificacion}</div>
          <div className="text-sm"><span className="font-semibold text-gray-700">Edad:</span> {r.paciente.edad}</div>
          {r.paciente.fechaNacimiento && (
            <div className="text-sm"><span className="font-semibold text-gray-700">Fecha de nacimiento:</span> {r.paciente.fechaNacimiento}</div>
          )}
          {r.paciente.pesoMaterno && (
            <div className="text-sm"><span className="font-semibold text-gray-700">Peso materno:</span> {r.paciente.pesoMaterno}</div>
          )}
          {r.paciente.presionArterial && (
            <div className="text-sm"><span className="font-semibold text-gray-700">Presión arterial:</span> {r.paciente.presionArterial}</div>
          )}
        </div>

        {/* Antecedentes */}
        <div className="mb-2 text-sm">
          <span className="font-semibold text-gray-700">Antecedentes médicos:</span>{" "}
          <span className="text-gray-800">{r.antecedentesMedicos}</span>
        </div>
        {r.antecedentesObstetricos.length > 0 && (
          <div className="mb-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
            <span className="font-bold text-brand-700">Antecedentes obstétricos:</span>{" "}
            <span className="font-semibold text-gray-800">
              {r.antecedentesObstetricos.map((x) => `${x.label}: ${x.value}`).join("  ·  ")}
            </span>
          </div>
        )}

        {/* Edad gestacional */}
        {r.edadGestacional && (
          <div className="mb-3">
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Edad gestacional:</span>{" "}
              <span className="font-bold text-gray-900">{r.edadGestacional}</span>
              {r.egFuente && <span className="text-gray-500"> ({r.egFuente.replace(/\.$/, "")})</span>}
            </div>
            {r.fpp && (
              <div className="text-sm text-gray-700">Semana 40 (fecha probable de parto): <strong>{r.fpp}</strong></div>
            )}
            {r.egHitos.map((hk, i) => (
              <div key={i} className="text-sm text-gray-600">
                {hk.label}: <span className="font-medium">{hk.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Hallazgos */}
        <Blocks blocks={r.blocks} />

        {/* Comentarios */}
        {r.comentarios && (
          <>
            <h3 className="mb-2 mt-5 border-b border-brand-100 pb-1 text-sm font-bold uppercase tracking-wide text-brand-700">
              Comentarios
            </h3>
            <p className="text-justify text-sm leading-relaxed text-gray-800">{r.comentarios}</p>
          </>
        )}

        {/* Firma */}
        <div className="mt-10 text-sm">
          <div className="mb-1">_______________________________</div>
          <div className="font-semibold text-gray-800">{r.encabezado.medico}</div>
          <div className="text-gray-500">{r.encabezado.especialidad1} · {r.encabezado.especialidad2}</div>
        </div>
      </div>
    </div>
  );
}
