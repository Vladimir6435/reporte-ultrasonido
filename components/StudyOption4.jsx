"use client";

import { Section, Field, Measurement, Segmented, Checkbox, Grid, TextField, TextArea } from "./ui";
import { UBICACION_PLACENTA, LIQUIDO_AMNIOTICO } from "@/lib/constants";
import { classifyRCIU } from "@/lib/calculations";
import { calcPercentil, getGAWeeks, ESTANDARES } from "@/lib/percentile";

// Fila de Doppler con dos casillas: IP y percentil, más "no se requiere".
function DopplerRow({ label, ip, onIp, p, onP, nm, onNm, extra }) {
  return (
    <div className="border-b border-gray-100 py-2">
      <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-stretch" style={{ maxWidth: "150px" }}>
          <input type="text" disabled={nm} value={nm ? "" : ip ?? ""} onChange={(e) => onIp(e.target.value)}
            placeholder="IP" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-gray-100" />
          <span className="ml-1 flex items-center text-xs text-gray-500">IP</span>
        </div>
        <div className="flex items-stretch" style={{ maxWidth: "150px" }}>
          <input type="text" disabled={nm} value={nm ? "" : p ?? ""} onChange={(e) => onP(e.target.value)}
            placeholder="percentil" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:bg-gray-100" />
          <span className="ml-1 flex items-center text-xs text-gray-500">p</span>
        </div>
        <Checkbox checked={nm} onChange={onNm} label="No se requiere" />
      </div>
      {extra && <div className="mt-2">{extra}</div>}
    </div>
  );
}

export default function StudyOption4({ state, update }) {
  const o = state.op4;
  const set = (patch) => update({ op4: { ...o, ...patch } });

  const ga = getGAWeeks(state);
  // Autocompleta el percentil al ingresar el peso.
  const setPeso = (v) => {
    const p = calcPercentil(v, ga, state.percentilEstandar);
    set({ peso: v, ...(p ? { pesoPercentil: p.display } : {}) });
  };
  // Cambia el estándar y recalcula con el peso actual.
  const setEstandar = (v) => {
    const p = calcPercentil(o.peso, ga, v);
    update({ percentilEstandar: v, op4: { ...o, ...(p ? { pesoPercentil: p.display } : {}) } });
  };
  const recalc = () => {
    const p = calcPercentil(o.peso, ga, state.percentilEstandar);
    if (p) set({ pesoPercentil: p.display });
  };

  const rciu = o.rciuEnabled
    ? classifyRCIU({
        pesoPercentil: o.pesoPercentil,
        umbilicalPI_p95: o.rciu_umbilicalPI_p95,
        acmPI_p5: o.rciu_acmPI_p5,
        cprPercentil_p5: o.rciu_cpr_p5,
        uterinasPI_p95: o.rciu_uterinasPI_p95,
        umbilicalDiastoleAusente: o.rciu_umbDiastoleAusente,
        umbilicalDiastoleReversa: o.rciu_umbDiastoleReversa || o.umbilicalReverso,
        ductusVenosoIP_p95: o.rciu_dvIP_p95,
        ductusVenosoAReversa: o.rciu_dvAReversa || o.dvOndaAReversa,
      })
    : null;

  return (
    <div>
      <Section title="Antropometría fetal" accent>
        <Grid cols={3}>
          <Measurement label="Frecuencia cardíaca fetal" value={o.fcf} onChange={(v) => set({ fcf: v })} unit="lpm" />
          <Measurement label="DBP (diámetro biparietal)" value={o.dbp} onChange={(v) => set({ dbp: v })} unit="mm" />
          <Measurement label="CC (circunferencia cefálica)" value={o.cc} onChange={(v) => set({ cc: v })} unit="mm" />
          <Measurement label="CA (circunferencia abdominal)" value={o.ca} onChange={(v) => set({ ca: v })} unit="mm" />
          <Measurement label="LF (longitud femoral)" value={o.lf} onChange={(v) => set({ lf: v })} unit="mm" />
          <Measurement label="Peso fetal estimado" value={o.peso} onChange={setPeso} unit="g" />
          <Measurement label="Percentil de peso" value={o.pesoPercentil} onChange={(v) => set({ pesoPercentil: v })} unit="percentil" inputType="text" />
        </Grid>

        <div className="mt-2 rounded-lg bg-gray-50 p-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Estándar de percentil:</span>
            <Segmented value={state.percentilEstandar} onChange={setEstandar} options={ESTANDARES} size="sm" />
            <button type="button" onClick={recalc} className="rounded-md border border-brand-600 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50">
              Recalcular percentil
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {ga != null
              ? `Calculado con edad gestacional ${Math.floor(ga)} sem ${Math.round((ga - Math.floor(ga)) * 7)} d. El percentil se autocompleta al ingresar el peso y es editable.`
              : "Ingrese la edad gestacional (calculadora o historia) para calcular el percentil automáticamente."}
          </p>
        </div>
      </Section>

      <Section title="Presentación, placenta y líquido amniótico">
        <Grid cols={2}>
          <Field label="Presentación fetal">
            <Segmented
              value={o.presentacion}
              onChange={(v) => set({ presentacion: v })}
              options={[
                { value: "cefalico", label: "Cefálico" },
                { value: "pelvico", label: "Pélvico" },
                { value: "transverso", label: "Transverso" },
              ]}
              size="sm"
            />
          </Field>
          <Field label="Ubicación placentaria">
            <Segmented value={o.ubicacionPlacenta} onChange={(v) => set({ ubicacionPlacenta: v })} options={UBICACION_PLACENTA} size="sm" />
          </Field>
          <Field label="Líquido amniótico">
            <Segmented value={o.liquidoAmniotico} onChange={(v) => set({ liquidoAmniotico: v })} options={LIQUIDO_AMNIOTICO} size="sm" />
          </Field>
          <Measurement label="ILA / bolsillo mayor (opcional)" value={o.ilaValor} onChange={(v) => set({ ilaValor: v })} unit="cm" inputType="text" />
        </Grid>

        <Field label="Placenta">
          <Checkbox checked={o.placentaAnormal} onChange={(v) => set({ placentaAnormal: v })} label="Placenta anormal" />
          {o.placentaAnormal && (
            <div className="mt-2 space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
              <Checkbox checked={o.placentaPrevia} onChange={(v) => set({ placentaPrevia: v })} label="Placenta previa" />
              <Checkbox checked={o.placentaInsercionAnormal} onChange={(v) => set({ placentaInsercionAnormal: v })} label="Inserción anormal (acretismo / vasa previa)" />
              <TextArea value={o.placentaDescripcion} onChange={(v) => set({ placentaDescripcion: v })} rows={3} placeholder="Descripción de la anormalidad placentaria" />
            </div>
          )}
        </Field>
      </Section>

      <Section title="Estudio Doppler" subtitle="Ingrese índice de pulsatilidad (IP) y percentil, o marque 'No se requiere'.">
        <DopplerRow label="Arterias uterinas (IP medio)"
          ip={o.uterinas} onIp={(v) => set({ uterinas: v })} p={o.uterinasP} onP={(v) => set({ uterinasP: v })}
          nm={o.uterinasNm} onNm={(v) => set({ uterinasNm: v })} />
        <DopplerRow label="Arteria umbilical"
          ip={o.umbilical} onIp={(v) => set({ umbilical: v })} p={o.umbilicalP} onP={(v) => set({ umbilicalP: v })}
          nm={o.umbilicalNm} onNm={(v) => set({ umbilicalNm: v })}
          extra={<Checkbox checked={o.umbilicalReverso} onChange={(v) => set({ umbilicalReverso: v })} label="Flujo diastólico reverso" />} />
        <DopplerRow label="Arteria cerebral media"
          ip={o.acm} onIp={(v) => set({ acm: v })} p={o.acmP} onP={(v) => set({ acmP: v })}
          nm={o.acmNm} onNm={(v) => set({ acmNm: v })} />
        <DopplerRow label="Índice cerebro-placentario (ICP)"
          ip={o.icp} onIp={(v) => set({ icp: v })} p={o.icpP} onP={(v) => set({ icpP: v })}
          nm={o.icpNm} onNm={(v) => set({ icpNm: v })} />
        <DopplerRow label="Ductus venoso"
          ip={o.ductusVenoso} onIp={(v) => set({ ductusVenoso: v })} p={o.dvP} onP={(v) => set({ dvP: v })}
          nm={o.dvNm} onNm={(v) => set({ dvNm: v })}
          extra={<Checkbox checked={o.dvOndaAReversa} onChange={(v) => set({ dvOndaAReversa: v })} label="Onda a reversa" />} />

        <div className="mt-4">
          <Grid cols={3}>
            <Measurement label="PlGF" value={o.plgf} onChange={(v) => set({ plgf: v })} unit="pg/mL o MoM" inputType="text"
              noMeasure={o.plgfNm} onNoMeasure={(v) => set({ plgfNm: v })} noMeasureLabel="No se requiere" width="200px" />
            <Measurement label="sFlt-1" value={o.sflt1} onChange={(v) => set({ sflt1: v })} unit="pg/mL o MoM" inputType="text"
              noMeasure={o.sflt1Nm} onNoMeasure={(v) => set({ sflt1Nm: v })} noMeasureLabel="No se requiere" width="200px" />
            <Measurement label="Balance angiogénico (sFlt-1/PlGF)" value={o.balanceAngiogenico} onChange={(v) => set({ balanceAngiogenico: v })} unit="cociente" inputType="text"
              noMeasure={o.balanceNm} onNoMeasure={(v) => set({ balanceNm: v })} noMeasureLabel="No se requiere" width="200px" />
          </Grid>
        </div>
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
