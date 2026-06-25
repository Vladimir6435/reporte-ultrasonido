"use client";

import { useState } from "react";
import { Field, TextField, Segmented, Button, Grid, DateSelect } from "./ui";
import { computeEG } from "@/lib/calculations";
import { buildHitos, buildHitosTexto, printHitos } from "@/lib/hitos";
import { generateHitosDocx } from "@/lib/docxExport";

const YEAR_END = new Date().getFullYear() + 1;

const METODOS = [
  { value: "fur", label: "Última regla" },
  { value: "us", label: "Ultrasonido previo" },
  { value: "fpp", label: "Fecha probable de parto" },
  { value: "manual", label: "Manual" },
];

export default function GestCalculator({ state, update, onClose }) {
  const c = state.egCalc;
  const set = (patch) => update({ egCalc: { ...c, ...patch } });
  const res = computeEG(c, state.fechaReporte);
  const [showHitos, setShowHitos] = useState(false);
  const [copied, setCopied] = useState(false);
  const hitos = res && res.ok ? buildHitos(state, res) : null;

  const copiarHitos = async () => {
    try {
      await navigator.clipboard.writeText(buildHitosTexto(state, res));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const aplicar = () => {
    const patch = { egCalc: { ...c, activo: true } };
    if (res && res.ok) {
      // Rellena automáticamente la sección de edad gestacional de la etapa 1.
      patch.historia = {
        ...state.historia,
        egConocida: "si",
        egSemanas: String(res.semanas),
        egDias: String(res.dias),
        egFechaRef: state.fechaReporte,
      };
    }
    update(patch);
    onClose();
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="mt-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-700">Calculadora de edad gestacional</h3>
          <button onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-600">×</button>
        </div>

        <Field label="Método de cálculo">
          <Segmented value={c.metodo} onChange={(v) => set({ metodo: v })} options={METODOS} size="sm" />
        </Field>

        {c.metodo === "fur" && (
          <Field label="Fecha de última regla">
            <DateSelect value={c.fur} onChange={(v) => set({ fur: v })} yearStart={2020} yearEnd={YEAR_END} />
          </Field>
        )}

        {c.metodo === "us" && (
          <>
            <Field label="Fecha del ultrasonido">
              <DateSelect value={c.usFecha} onChange={(v) => set({ usFecha: v })} yearStart={2020} yearEnd={YEAR_END} />
            </Field>
            <Grid cols={2}>
              <Field label="Semanas en el ultrasonido">
                <TextField type="number" value={c.usSemanas} onChange={(v) => set({ usSemanas: v })} placeholder="Ej. 12" />
              </Field>
              <Field label="Días (0–6)">
                <TextField type="number" value={c.usDias} onChange={(v) => set({ usDias: v })} placeholder="0–6" />
              </Field>
            </Grid>
          </>
        )}

        {c.metodo === "fpp" && (
          <Field label="Fecha probable de parto">
            <DateSelect value={c.fpp} onChange={(v) => set({ fpp: v })} yearStart={2020} yearEnd={YEAR_END} />
          </Field>
        )}

        {c.metodo === "manual" && (
          <Grid cols={2}>
            <Field label="Semanas actuales">
              <TextField type="number" value={c.manSemanas} onChange={(v) => set({ manSemanas: v })} placeholder="Ej. 18" />
            </Field>
            <Field label="Días (0–6)">
              <TextField type="number" value={c.manDias} onChange={(v) => set({ manDias: v })} placeholder="0–6" />
            </Field>
          </Grid>
        )}

        {/* Resultado en vivo */}
        <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
          {!res && <p className="text-sm text-gray-400">Complete los datos para ver el resultado.</p>}
          {res && !res.ok && <p className="text-sm text-red-600">{res.error}</p>}
          {res && res.ok && (
            <div>
              <div className="text-base font-bold text-brand-800">
                {res.egTexto}
                <span className="ml-2 text-xs font-normal text-gray-500">(por {res.metodoLabel})</span>
              </div>
              <div className="mt-1 text-sm text-gray-700">
                Semana 40 (FPP): <strong>{res.fppStr}</strong>
              </div>
              {res.hitos.map((hk, i) => (
                <div key={i} className="mt-1 text-sm text-gray-600">
                  {hk.label}: {hk.value}
                </div>
              ))}
              <div className="mt-3">
                <Button variant="secondary" onClick={() => setShowHitos((v) => !v)}>
                  {showHitos ? "Ocultar hitos" : "Desplegar hitos del embarazo"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Panel de hitos del embarazo */}
        {showHitos && hitos && (
          <div className="mt-3 rounded-xl border border-brand-200 bg-white p-4">
            <div className="mb-2 flex flex-wrap gap-2">
              <Button onClick={copiarHitos}>{copied ? "✓ ¡Copiado!" : "📋 Copiar información"}</Button>
              <Button variant="secondary" onClick={() => printHitos(state, res)}>Guardar PDF</Button>
              <Button variant="dark" onClick={() => generateHitosDocx(state, res)}>Guardar Word</Button>
            </div>
            <div className="max-h-80 overflow-y-auto rounded-lg bg-gray-50 p-3">
              {hitos.paciente && <p className="text-sm font-semibold text-gray-800">Paciente: {hitos.paciente}</p>}
              {hitos.eg && <p className="mb-2 text-xs text-gray-500">EG: {hitos.eg}{hitos.fpp ? ` · FPP: ${hitos.fpp}` : ""}</p>}
              {hitos.items.map((it, i) => (
                <div key={i} className="mb-2 border-b border-gray-100 pb-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-sm font-semibold text-brand-800">{it.titulo}</span>
                    <span className="text-sm font-semibold text-brand-600">{it.fecha}{it.superada ? " · ya superada" : ""}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">{it.leyenda}</p>
                </div>
              ))}
              <p className="mt-2 text-xs italic text-gray-600">{hitos.cierre}</p>
              <p className="mt-2 text-xs font-semibold text-brand-700">{hitos.consultorio}</p>
              <p className="text-xs text-gray-600">{hitos.contacto}</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <Button variant="ghost" onClick={() => set({ activo: false, fur: "", usFecha: "", usSemanas: "", usDias: "", fpp: "", manSemanas: "", manDias: "" })}>
            Limpiar
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            <Button onClick={aplicar} disabled={!res || !res.ok}>Usar en el reporte</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
