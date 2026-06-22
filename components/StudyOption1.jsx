"use client";

import { Section, Field, Measurement, Segmented, Grid } from "./ui";
import { TIPO_EMBARAZO, CORIONICIDAD, PRESENTE_AUSENTE_NM } from "@/lib/constants";
import { calcEDD, gaFromCRL, daysToWeeksString, formatDate, parseDate } from "@/lib/calculations";

export default function StudyOption1({ state, update }) {
  const o = state.op1;
  const set = (patch) => update({ op1: { ...o, ...patch } });

  // FPP calculada a partir de la EG ingresada y la fecha de elaboración del reporte
  const fpp = calcEDD(state.fechaReporte, o.egSemanas, o.egDias);
  const crlGaDays = gaFromCRL(o.crl);

  return (
    <div>
      <Section title="Primer trimestre — Biometría y vitalidad" accent>
        <Grid cols={2}>
          <Measurement
            label="Longitud cefalocaudal (LCC / CRL)"
            value={o.crl}
            onChange={(v) => set({ crl: v })}
            unit="mm"
          />
          <div />
          <Field label="Edad gestacional (semanas)">
            <input type="number" value={o.egSemanas} onChange={(e) => set({ egSemanas: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100" placeholder="Ej. 9" />
          </Field>
          <Field label="Edad gestacional (días)">
            <input type="number" value={o.egDias} onChange={(e) => set({ egDias: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100" placeholder="0–6" />
          </Field>
        </Grid>

        {crlGaDays && (
          <p className="mb-3 text-xs text-gray-500">
            Sugerencia por LCC (Robinson): {daysToWeeksString(crlGaDays)} — puede usarla como referencia.
          </p>
        )}

        {fpp && (
          <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <div>
              Fecha de elaboración del reporte: <strong>{formatDate(parseDate(state.fechaReporte))}</strong>
            </div>
            <div className="mt-1">
              Fecha probable de parto (40 semanas), calculada automáticamente:{" "}
              <strong className="text-base">{formatDate(fpp)}</strong>
            </div>
          </div>
        )}
      </Section>

      <Section title="Tipo de embarazo">
        <Field label="Número de fetos">
          <Segmented value={o.tipoEmbarazo} onChange={(v) => set({ tipoEmbarazo: v })} options={TIPO_EMBARAZO} />
        </Field>
        {o.tipoEmbarazo === "multiple" && (
          <Field label="Corionicidad">
            <Segmented value={o.corionicidad} onChange={(v) => set({ corionicidad: v })} options={CORIONICIDAD} />
          </Field>
        )}
      </Section>

      <Section title="Vitalidad">
        <Field label="Vesícula vitelina">
          <Segmented value={o.vesiculaVitelina} onChange={(v) => set({ vesiculaVitelina: v })} options={PRESENTE_AUSENTE_NM} />
        </Field>
        {o.tipoEmbarazo === "unico" ? (
          <Measurement label="Frecuencia cardíaca fetal" value={o.fcf1} onChange={(v) => set({ fcf1: v })} unit="lpm" />
        ) : (
          <Grid cols={2}>
            <Measurement label="FCF — Feto 1" value={o.fcf1} onChange={(v) => set({ fcf1: v })} unit="lpm" />
            <Measurement label="FCF — Feto 2" value={o.fcf2} onChange={(v) => set({ fcf2: v })} unit="lpm" />
          </Grid>
        )}
      </Section>
    </div>
  );
}
