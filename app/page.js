"use client";

import { useState } from "react";
import { initialState } from "@/lib/state";
import { ENCABEZADO } from "@/lib/constants";
import Step1History from "@/components/Step1History";
import Step2Study from "@/components/Step2Study";
import Step3Report from "@/components/Step3Report";
import GestCalculator from "@/components/GestCalculator";
import { Button } from "@/components/ui";
import { computeEG } from "@/lib/calculations";

const STEPS = [
  { n: 1, label: "Historia clínica" },
  { n: 2, label: "Datos del ultrasonido" },
  { n: 3, label: "Reporte" },
];

export default function Home() {
  const [state, setState] = useState(initialState);
  const [calcOpen, setCalcOpen] = useState(false);
  const update = (patch) => setState((s) => ({ ...s, ...patch }));
  const goto = (n) => update({ step: n });

  const egRes = state.egCalc.activo ? computeEG(state.egCalc, state.fechaReporte) : null;

  const canNext =
    state.step === 1
      ? state.historia.nombre.trim().length > 0
      : state.step === 2
      ? !!state.opcion
      : true;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      {/* Encabezado de la app */}
      <header className="no-print mb-6 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-5 text-white shadow">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{ENCABEZADO.titulo}</h1>
            <p className="text-sm text-brand-100">
              {ENCABEZADO.medico} · {ENCABEZADO.especialidad1} · {ENCABEZADO.especialidad2} · {ENCABEZADO.lugar}
            </p>
          </div>
          <button
            onClick={() => setCalcOpen(true)}
            className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
          >
            🧮 Calculadora EG
          </button>
        </div>
        {egRes && egRes.ok && (
          <div className="mt-3 rounded-lg bg-white/15 px-4 py-2 text-sm">
            Edad gestacional activa: <strong>{egRes.egTexto}</strong>{" "}
            <span className="text-brand-100">(por {egRes.metodoLabel})</span> · FPP {egRes.fppStr}
          </div>
        )}
      </header>

      {calcOpen && <GestCalculator state={state} update={update} onClose={() => setCalcOpen(false)} />}

      {/* Stepper */}
      <nav className="no-print mb-6 flex items-center justify-between gap-2">
        {STEPS.map((s, i) => {
          const active = state.step === s.n;
          const done = state.step > s.n;
          return (
            <button
              key={s.n}
              onClick={() => goto(s.n)}
              className="flex flex-1 items-center gap-2"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  active ? "bg-brand-600 text-white" : done ? "bg-brand-100 text-brand-700" : "bg-gray-200 text-gray-500"
                }`}
              >
                {s.n}
              </span>
              <span className={`text-sm font-medium ${active ? "text-brand-700" : "text-gray-500"}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <span className="mx-1 hidden h-px flex-1 bg-gray-200 sm:block" />}
            </button>
          );
        })}
      </nav>

      {/* Contenido del paso */}
      <div>
        {state.step === 1 && <Step1History state={state} update={update} />}
        {state.step === 2 && <Step2Study state={state} update={update} />}
        {state.step === 3 && <Step3Report state={state} update={update} />}
      </div>

      {/* Navegación */}
      <div className="no-print mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => goto(Math.max(1, state.step - 1))} disabled={state.step === 1}>
          ← Anterior
        </Button>
        {state.step < 3 ? (
          <Button onClick={() => goto(state.step + 1)} disabled={!canNext}>
            {state.step === 2 ? "Generar reporte →" : "Siguiente →"}
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => { if (confirm("¿Iniciar un nuevo reporte? Se perderán los datos actuales.")) setState(initialState()); }}>
            Nuevo reporte
          </Button>
        )}
      </div>

      <footer className="no-print mt-10 text-center text-xs text-gray-400">
        Los datos se procesan localmente en su navegador y no se almacenan en ningún servidor.
      </footer>
    </main>
  );
}
