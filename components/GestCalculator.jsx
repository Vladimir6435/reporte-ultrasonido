"use client";

import { Field, TextField, Segmented, Button, Grid } from "./ui";
import { computeEG } from "@/lib/calculations";

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
            <TextField type="date" value={c.fur} onChange={(v) => set({ fur: v })} />
          </Field>
        )}

        {c.metodo === "us" && (
          <>
            <Field label="Fecha del ultrasonido">
              <TextField type="date" value={c.usFecha} onChange={(v) => set({ usFecha: v })} />
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
            <TextField type="date" value={c.fpp} onChange={(v) => set({ fpp: v })} />
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
            </div>
          )}
        </div>

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
