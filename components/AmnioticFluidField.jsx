"use client";

import { Field, Segmented, Measurement } from "./ui";
import { LIQUIDO_AMNIOTICO } from "@/lib/constants";

/**
 * Sección de líquido amniótico: clasificación cualitativa + medición
 * (ILA o Bolsillo vertical máximo) con una única casilla editable en mm.
 * onChange recibe un patch con las llaves liquidoAmniotico / liquidoTipo / liquidoValor.
 */
export default function AmnioticFluidField({ cualitativo, tipo, valor, onChange }) {
  return (
    <div>
      <Field label="Líquido amniótico">
        <Segmented value={cualitativo} onChange={(v) => onChange({ liquidoAmniotico: v })} options={LIQUIDO_AMNIOTICO} size="sm" />
      </Field>
      <Field label="Medición del líquido">
        <Segmented
          value={tipo}
          onChange={(v) => onChange({ liquidoTipo: v })}
          options={[
            { value: "ila", label: "ILA" },
            { value: "bvm", label: "Bolsillo vertical máximo" },
          ]}
          size="sm"
        />
      </Field>
      <Measurement
        label={tipo === "bvm" ? "Bolsillo vertical máximo" : "Índice de líquido amniótico (ILA)"}
        value={valor}
        onChange={(v) => onChange({ liquidoValor: v })}
        unit="mm"
      />
    </div>
  );
}
