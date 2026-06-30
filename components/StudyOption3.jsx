"use client";

import { Section, Field, Measurement, Segmented, TextField, TextArea, Checkbox, Grid } from "./ui";
import { ESTADO_NANE, ANATOMIA_22_24, UBICACION_PLACENTA } from "@/lib/constants";
import { calcPercentil, getGAWeeks, ESTANDARES } from "@/lib/percentile";
import AmnioticFluidField from "./AmnioticFluidField";

const ECO_OPCIONES = [
  { value: "realizado_normal", label: "Realizado — Normal" },
  { value: "realizado_anormal", label: "Realizado — Anormal" },
  { value: "no_realizado", label: "No realizado" },
];

export default function StudyOption3({ state, update }) {
  const o = state.op3;
  const set = (patch) => update({ op3: { ...o, ...patch } });
  const setAnat = (key, patch) =>
    set({ anatomia: { ...o.anatomia, [key]: { ...o.anatomia[key], ...patch } } });

  const ga = getGAWeeks(state);
  const setPeso = (v) => {
    const p = calcPercentil(v, ga, state.percentilEstandar);
    set({ peso: v, ...(p ? { pesoPercentil: p.display } : {}) });
  };
  const setEstandar = (v) => {
    const p = calcPercentil(o.peso, ga, v);
    update({ percentilEstandar: v, op3: { ...o, ...(p ? { pesoPercentil: p.display } : {}) } });
  };

  return (
    <div>
      <Section title="Evaluación anatómica (22–26 semanas)" accent
        subtitle="Marque cada estructura. Si es anormal, describa el hallazgo.">
        <div className="space-y-3">
          {ANATOMIA_22_24.map((a) => {
            const cur = o.anatomia[a.key] || { estado: "normal", detalle: "" };
            return (
              <div key={a.key} className="border-b border-gray-100 pb-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-gray-700">{a.label}</span>
                  <Segmented size="sm" value={cur.estado} onChange={(v) => setAnat(a.key, { estado: v })} options={ESTADO_NANE} />
                </div>
                {cur.estado === "anormal" && (
                  <div className="mt-2">
                    <TextField value={cur.detalle} onChange={(v) => setAnat(a.key, { detalle: v })} placeholder="Describa la anormalidad" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Ecocardiograma fetal">
        <Field label="Estado del estudio">
          <Segmented value={o.ecoEstado} onChange={(v) => set({ ecoEstado: v })} options={ECO_OPCIONES} />
        </Field>

        {o.ecoEstado === "realizado_normal" && (
          <Grid cols={2}>
            <Measurement label="Diámetro de válvula aórtica" value={o.aortaDiam} onChange={(v) => set({ aortaDiam: v })} unit="mm" />
            <Measurement label="Z-score aórtico" value={o.aortaZ} onChange={(v) => set({ aortaZ: v })} unit="" inputType="text" />
            <Measurement label="Diámetro de arteria pulmonar" value={o.pulmonarDiam} onChange={(v) => set({ pulmonarDiam: v })} unit="mm" />
            <Measurement label="Z-score pulmonar" value={o.pulmonarZ} onChange={(v) => set({ pulmonarZ: v })} unit="" inputType="text" />
          </Grid>
        )}

        {o.ecoEstado === "realizado_anormal" && (
          <Field label="Descripción del hallazgo cardíaco">
            <TextArea value={o.ecoDescripcion} onChange={(v) => set({ ecoDescripcion: v })} rows={4}
              placeholder="Describa la anomalía cardíaca de forma completa." />
          </Field>
        )}
      </Section>

      <Section title="Vitalidad, longitud cervical y placenta">
        <Grid cols={2}>
          <Measurement label="Frecuencia cardíaca fetal" value={o.fcf} onChange={(v) => set({ fcf: v })} unit="lpm" />
          <Measurement label="Longitud cervical" value={o.longitudCervical} onChange={(v) => set({ longitudCervical: v })} unit="mm"
            noMeasure={o.lcNm} onNoMeasure={(v) => set({ lcNm: v })} />
          <Field label="Ubicación placentaria">
            <Segmented value={o.ubicacionPlacenta} onChange={(v) => set({ ubicacionPlacenta: v })} options={UBICACION_PLACENTA} size="sm" />
          </Field>
        </Grid>
        <AmnioticFluidField cualitativo={o.liquidoAmniotico} tipo={o.liquidoTipo} valor={o.liquidoValor} onChange={set} />
      </Section>

      <Section title="Tamizaje de preeclampsia">
        <Grid cols={2}>
          <Measurement label="Arterias uterinas (IP)" value={o.arteriasUterinas} onChange={(v) => set({ arteriasUterinas: v })}
            unit="IP / percentil" inputType="text" noMeasure={o.auNm} onNoMeasure={(v) => set({ auNm: v })} width="260px" />
          <Measurement label="PlGF" value={o.plgf} onChange={(v) => set({ plgf: v })} unit="pg/mL o MoM" inputType="text"
            noMeasure={o.plgfNm} onNoMeasure={(v) => set({ plgfNm: v })} width="260px" />
          <Measurement label="sFlt-1" value={o.sflt1} onChange={(v) => set({ sflt1: v })} unit="pg/mL o MoM" inputType="text"
            noMeasure={o.sflt1Nm} onNoMeasure={(v) => set({ sflt1Nm: v })} width="260px" />
          <Measurement label="Cociente sFlt-1/PlGF" value={o.ratio} onChange={(v) => set({ ratio: v })} unit="" inputType="text"
            noMeasure={o.ratioNm} onNoMeasure={(v) => set({ ratioNm: v })} width="260px" />
        </Grid>
        <Field label="Riesgo de preeclampsia" hint="Ingrese manualmente el riesgo calculado. Ej. 1/250">
          <TextField value={o.riesgoPreeclampsia} onChange={(v) => set({ riesgoPreeclampsia: v })} placeholder="1/____" />
        </Field>
      </Section>

      <Section title="Biometría / crecimiento (opcional)">
        <Checkbox checked={o.incluirBiometria} onChange={(v) => set({ incluirBiometria: v })} label="Incluir antropometría y peso fetal en este reporte" />
        {o.incluirBiometria && (
          <Grid cols={3}>
            <Measurement label="DBP" value={o.dbp} onChange={(v) => set({ dbp: v })} unit="mm" />
            <Measurement label="CC" value={o.cc} onChange={(v) => set({ cc: v })} unit="mm" />
            <Measurement label="CA" value={o.ca} onChange={(v) => set({ ca: v })} unit="mm" />
            <Measurement label="LF" value={o.lf} onChange={(v) => set({ lf: v })} unit="mm" />
            <Measurement label="Peso fetal estimado" value={o.peso} onChange={setPeso} unit="g" />
            <Measurement label="Percentil de peso" value={o.pesoPercentil} onChange={(v) => set({ pesoPercentil: v })} unit="percentil" inputType="text" />
            <div className="md:col-span-3 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Estándar:</span>
              <Segmented value={state.percentilEstandar} onChange={setEstandar} options={ESTANDARES} size="sm" />
            </div>
          </Grid>
        )}
      </Section>
    </div>
  );
}
