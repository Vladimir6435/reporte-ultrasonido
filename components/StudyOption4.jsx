"use client";

import { Section, Field, Measurement, Segmented, Checkbox, Grid } from "./ui";
import { UBICACION_PLACENTA, LIQUIDO_AMNIOTICO } from "@/lib/constants";
import { classifyRCIU } from "@/lib/calculations";

export default function StudyOption4({ state, update }) {
  const o = state.op4;
  const set = (patch) => update({ op4: { ...o, ...patch } });

  const rciu = o.rciuEnabled
    ? classifyRCIU({
        pesoPercentil: o.pesoPercentil,
        umbilicalPI_p95: o.rciu_umbilicalPI_p95,
        acmPI_p5: o.rciu_acmPI_p5,
        cprPercentil_p5: o.rciu_cpr_p5,
        uterinasPI_p95: o.rciu_uterinasPI_p95,
        umbilicalDiastoleAusente: o.rciu_umbDiastoleAusente,
        umbilicalDiastoleReversa: o.rciu_umbDiastoleReversa,
        ductusVenosoIP_p95: o.rciu_dvIP_p95,
        ductusVenosoAReversa: o.rciu_dvAReversa,
      })
    : null;

  return (
    <div>
      <Section title="Antropometría fetal" accent>
        <Grid cols={3}>
          <Measurement label="DBP (diámetro biparietal)" value={o.dbp} onChange={(v) => set({ dbp: v })} unit="mm" />
          <Measurement label="CC (circunferencia cefálica)" value={o.cc} onChange={(v) => set({ cc: v })} unit="mm" />
          <Measurement label="CA (circunferencia abdominal)" value={o.ca} onChange={(v) => set({ ca: v })} unit="mm" />
          <Measurement label="LF (longitud femoral)" value={o.lf} onChange={(v) => set({ lf: v })} unit="mm" />
          <Measurement label="Peso fetal estimado" value={o.peso} onChange={(v) => set({ peso: v })} unit="g" />
          <Measurement label="Percentil de peso" value={o.pesoPercentil} onChange={(v) => set({ pesoPercentil: v })} unit="p" inputType="text" />
        </Grid>
      </Section>

      <Section title="Placenta y líquido amniótico">
        <Grid cols={2}>
          <Field label="Ubicación placentaria">
            <Segmented value={o.ubicacionPlacenta} onChange={(v) => set({ ubicacionPlacenta: v })} options={UBICACION_PLACENTA} size="sm" />
          </Field>
          <Field label="Líquido amniótico">
            <Segmented value={o.liquidoAmniotico} onChange={(v) => set({ liquidoAmniotico: v })} options={LIQUIDO_AMNIOTICO} size="sm" />
          </Field>
          <Measurement label="ILA / bolsillo mayor (opcional)" value={o.ilaValor} onChange={(v) => set({ ilaValor: v })} unit="cm" inputType="text" />
        </Grid>
      </Section>

      <Section title="Estudio Doppler" subtitle="Ingrese valor con percentil/MoM, o marque 'No se requiere medición'.">
        <Grid cols={2}>
          <Measurement label="Arterias uterinas (IP medio)" value={o.uterinas} onChange={(v) => set({ uterinas: v })} unit="IP / p" inputType="text"
            noMeasure={o.uterinasNm} onNoMeasure={(v) => set({ uterinasNm: v })} noMeasureLabel="No se requiere" width="260px" />
          <Measurement label="Arteria umbilical (IP)" value={o.umbilical} onChange={(v) => set({ umbilical: v })} unit="IP / p" inputType="text"
            noMeasure={o.umbilicalNm} onNoMeasure={(v) => set({ umbilicalNm: v })} noMeasureLabel="No se requiere" width="260px" />
          <Measurement label="Arteria cerebral media (IP)" value={o.acm} onChange={(v) => set({ acm: v })} unit="IP / p" inputType="text"
            noMeasure={o.acmNm} onNoMeasure={(v) => set({ acmNm: v })} noMeasureLabel="No se requiere" width="260px" />
          <Measurement label="Índice cerebro-placentario (ICP)" value={o.icp} onChange={(v) => set({ icp: v })} unit="ratio / p" inputType="text"
            noMeasure={o.icpNm} onNoMeasure={(v) => set({ icpNm: v })} noMeasureLabel="No se requiere" width="260px" />
          <Measurement label="Ductus venoso (IP)" value={o.ductusVenoso} onChange={(v) => set({ ductusVenoso: v })} unit="IP / p" inputType="text"
            noMeasure={o.dvNm} onNoMeasure={(v) => set({ dvNm: v })} noMeasureLabel="No se requiere" width="260px" />
          <Measurement label="PlGF" value={o.plgf} onChange={(v) => set({ plgf: v })} unit="pg/mL o MoM" inputType="text"
            noMeasure={o.plgfNm} onNoMeasure={(v) => set({ plgfNm: v })} noMeasureLabel="No se requiere" width="260px" />
          <Measurement label="sFlt-1" value={o.sflt1} onChange={(v) => set({ sflt1: v })} unit="pg/mL o MoM" inputType="text"
            noMeasure={o.sflt1Nm} onNoMeasure={(v) => set({ sflt1Nm: v })} noMeasureLabel="No se requiere" width="260px" />
        </Grid>
      </Section>

      <Section title="Clasificación de RCIU — Medicina Fetal Barcelona">
        <Checkbox checked={o.rciuEnabled} onChange={(v) => set({ rciuEnabled: v })}
          label="Habilitar clasificación de restricción de crecimiento intrauterino" />
        {o.rciuEnabled && (
          <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-xs text-gray-500">Marque los criterios presentes. El estadio se calcula automáticamente.</p>
            <Checkbox checked={o.rciu_umbilicalPI_p95} onChange={(v) => set({ rciu_umbilicalPI_p95: v })} label="IP de arteria umbilical > p95" />
            <Checkbox checked={o.rciu_acmPI_p5} onChange={(v) => set({ rciu_acmPI_p5: v })} label="IP de arteria cerebral media < p5" />
            <Checkbox checked={o.rciu_cpr_p5} onChange={(v) => set({ rciu_cpr_p5: v })} label="Índice cerebro-placentario < p5" />
            <Checkbox checked={o.rciu_uterinasPI_p95} onChange={(v) => set({ rciu_uterinasPI_p95: v })} label="IP medio de arterias uterinas > p95" />
            <Checkbox checked={o.rciu_umbDiastoleAusente} onChange={(v) => set({ rciu_umbDiastoleAusente: v })} label="Flujo diastólico umbilical ausente" />
            <Checkbox checked={o.rciu_umbDiastoleReversa} onChange={(v) => set({ rciu_umbDiastoleReversa: v })} label="Flujo diastólico umbilical reverso" />
            <Checkbox checked={o.rciu_dvIP_p95} onChange={(v) => set({ rciu_dvIP_p95: v })} label="IP de ductus venoso > p95" />
            <Checkbox checked={o.rciu_dvAReversa} onChange={(v) => set({ rciu_dvAReversa: v })} label="Ductus venoso: onda a ausente o reversa" />

            {rciu && (
              <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
                <div className="text-sm font-semibold text-brand-800">{rciu.label}</div>
                <div className="mt-1 text-sm text-brand-700">{rciu.detail}</div>
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}
