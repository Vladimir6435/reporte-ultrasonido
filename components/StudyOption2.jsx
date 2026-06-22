"use client";

import { Section, Field, Measurement, Segmented, TextField, Grid } from "./ui";
import { PRESENTE_AUSENTE_NM, ESTADO_PAU, ANATOMIA_11_14 } from "@/lib/constants";

const NORMAL_ANORMAL_NM = [
  { value: "normal", label: "Normal" },
  { value: "anormal", label: "Anormal" },
  { value: "no_medicion", label: "No hay medición" },
];

export default function StudyOption2({ state, update }) {
  const o = state.op2;
  const set = (patch) => update({ op2: { ...o, ...patch } });
  const setAnat = (key, val) =>
    set({ anatomia: { ...o.anatomia, [key]: val } });

  return (
    <div>
      <Section title="Tamizaje 11–14 semanas — Marcadores" accent>
        <Grid cols={2}>
          <Measurement label="Longitud cefalocaudal (CRL)" value={o.crl} onChange={(v) => set({ crl: v })} unit="mm" />
          <Measurement
            label="Translucencia nucal (TN)"
            value={o.tn}
            onChange={(v) => set({ tn: v })}
            unit="mm"
            noMeasure={o.tnNm}
            onNoMeasure={(v) => set({ tnNm: v })}
          />
        </Grid>
        <Grid cols={2}>
          <Field label="Hueso nasal">
            <Segmented value={o.huesoNasal} onChange={(v) => set({ huesoNasal: v })} options={PRESENTE_AUSENTE_NM} />
          </Field>
          <Field label="Ductus venoso">
            <Segmented value={o.ductusVenoso} onChange={(v) => set({ ductusVenoso: v })} options={NORMAL_ANORMAL_NM} />
          </Field>
          <Field label="Regurgitación tricuspídea">
            <Segmented value={o.regurgitacionTricuspidea} onChange={(v) => set({ regurgitacionTricuspidea: v })} options={PRESENTE_AUSENTE_NM} />
          </Field>
          <Measurement
            label="Frecuencia cardíaca fetal"
            value={o.fcf}
            onChange={(v) => set({ fcf: v })}
            unit="lpm"
            noMeasure={o.fcfNm}
            onNoMeasure={(v) => set({ fcfNm: v })}
          />
        </Grid>
      </Section>

      <Section title="Bioquímica (MoM)" subtitle="Ingrese los múltiplos de la mediana reportados por el laboratorio.">
        <Grid cols={3}>
          <Measurement label="PAPP-A" value={o.pappa} onChange={(v) => set({ pappa: v })} unit="MoM" inputType="text"
            noMeasure={o.pappaNm} onNoMeasure={(v) => set({ pappaNm: v })} />
          <Measurement label="β-hCG libre" value={o.hcg} onChange={(v) => set({ hcg: v })} unit="MoM" inputType="text"
            noMeasure={o.hcgNm} onNoMeasure={(v) => set({ hcgNm: v })} />
          <Measurement label="PlGF" value={o.plgf} onChange={(v) => set({ plgf: v })} unit="MoM" inputType="text"
            noMeasure={o.plgfNm} onNoMeasure={(v) => set({ plgfNm: v })} />
        </Grid>
      </Section>

      <Section title="Longitud cervical">
        <Measurement
          label="Longitud cervical"
          value={o.longitudCervical}
          onChange={(v) => set({ longitudCervical: v })}
          unit="mm"
          noMeasure={o.lcNm}
          onNoMeasure={(v) => set({ lcNm: v })}
        />
      </Section>

      <Section title="Riesgos calculados" subtitle="Ingrese manualmente los riesgos según el cálculo del software de tamizaje.">
        <Grid cols={2}>
          <Field label="Riesgo de trisomía 21" hint="Ej. 1/10000">
            <TextField value={o.riesgoT21} onChange={(v) => set({ riesgoT21: v })} placeholder="1/____" />
          </Field>
          <Field label="Riesgo de trisomía 18" hint="Ej. 1/10000">
            <TextField value={o.riesgoT18} onChange={(v) => set({ riesgoT18: v })} placeholder="1/____" />
          </Field>
          <Field label="Riesgo de trisomía 13" hint="Ej. 1/10000">
            <TextField value={o.riesgoT13} onChange={(v) => set({ riesgoT13: v })} placeholder="1/____" />
          </Field>
          <Field label="Riesgo de preeclampsia" hint="Ej. 1/250 (pretérmino)">
            <TextField value={o.riesgoPreeclampsia} onChange={(v) => set({ riesgoPreeclampsia: v })} placeholder="1/____" />
          </Field>
        </Grid>
      </Section>

      <Section title="Hallazgos anatómicos (11–14 semanas)" subtitle="Marque cada estructura.">
        <div className="space-y-3">
          {ANATOMIA_11_14.map((a) => (
            <div key={a.key} className="flex flex-col gap-1 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-gray-700">{a.label}</span>
              <Segmented
                size="sm"
                value={o.anatomia[a.key] || "ausente"}
                onChange={(v) => setAnat(a.key, v)}
                options={ESTADO_PAU}
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
