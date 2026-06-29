"use client";

import { Segmented, Button } from "./ui";
import { crlToGADays, daysToWeeksString } from "@/lib/calculations";

const CRL_ESTANDARES = [
  { value: "intergrowth", label: "INTERGROWTH-21st" },
  { value: "robinson", label: "Robinson-Fleming" },
];

/**
 * Muestra la edad gestacional derivada de la LCC y permite aplicarla
 * a todo el reporte (sincroniza la calculadora de edad gestacional).
 * @param extra  función opcional (sem, dias) => patch adicional para `update`
 */
export default function CrlGaSync({ crl, state, update, extra }) {
  const estandar = state.egCalc.crlEstandar || "intergrowth";
  const gaDays = crlToGADays(crl, estandar);
  const setEstandar = (v) => update({ egCalc: { ...state.egCalc, crlEstandar: v } });

  if (!crl || gaDays == null) return null;
  const sem = Math.floor(gaDays / 7);
  const dias = gaDays % 7;

  const applied =
    state.egCalc.activo &&
    state.egCalc.metodo === "crl" &&
    String(state.egCalc.crl) === String(crl);

  const aplicar = () => {
    const patch = {
      egCalc: {
        ...state.egCalc,
        activo: true,
        metodo: "crl",
        crl: String(crl),
        crlFecha: state.fechaReporte,
        crlEstandar: estandar,
      },
      historia: {
        ...state.historia,
        egConocida: "si",
        egSemanas: String(sem),
        egDias: String(dias),
        egFechaRef: state.fechaReporte,
      },
    };
    if (extra) Object.assign(patch, extra(sem, dias));
    update(patch);
  };

  return (
    <div className="mb-3 rounded-lg border border-brand-200 bg-brand-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-brand-800">
          Edad gestacional por LCC: <strong>{daysToWeeksString(gaDays)}</strong>
        </div>
        <Button onClick={aplicar} variant={applied ? "secondary" : "primary"}>
          {applied ? "✓ En uso en el reporte" : "Usar en el reporte"}
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">Estándar:</span>
        <Segmented value={estandar} onChange={setEstandar} options={CRL_ESTANDARES} size="sm" />
      </div>
    </div>
  );
}
