"use client";

import {
  Section, Field, TextField, TextArea, Segmented, YesNo, Checkbox, Grid, DateSelect,
} from "./ui";
import { calcEDD, formatDate, ageFromDOB } from "@/lib/calculations";

export default function Step1History({ state, update }) {
  const h = state.historia;
  const setH = (patch) => update({ historia: { ...h, ...patch } });

  // Al ingresar la fecha de nacimiento, calcula la edad al día del ultrasonido.
  const onFechaNacimiento = (v) => {
    const edad = ageFromDOB(v, state.fechaReporte);
    setH({ fechaNacimiento: v, ...(edad != null ? { edad: String(edad) } : {}) });
  };

  const fppPrevia =
    h.egConocida === "si"
      ? calcEDD(h.egFechaRef, h.egSemanas, h.egDias)
      : null;

  return (
    <div>
      <Section title="Datos de la paciente" accent>
        <Grid cols={2}>
          <Field label="Nombre completo">
            <TextField value={h.nombre} onChange={(v) => setH({ nombre: v })} placeholder="Nombre y apellidos" />
          </Field>
          <Field label="Identificación / Expediente">
            <TextField value={h.identificacion} onChange={(v) => setH({ identificacion: v })} placeholder="Cédula o número de expediente" />
          </Field>
          <Field label="Fecha de nacimiento" hint="Calcula la edad automáticamente.">
            <DateSelect value={h.fechaNacimiento} onChange={onFechaNacimiento} yearStart={1950} />
          </Field>
          <Field label="Edad (años)" hint="Edad al día del ultrasonido.">
            <TextField type="number" value={h.edad} onChange={(v) => setH({ edad: v })} placeholder="Ej. 32" />
          </Field>
          <Field label="Peso materno" hint="Al momento del ultrasonido.">
            <TextField type="number" value={h.pesoMaterno} onChange={(v) => setH({ pesoMaterno: v })} suffix="kg" placeholder="Ej. 68" />
          </Field>
          <Field label="Presión arterial" hint="Al momento del ultrasonido.">
            <TextField value={h.presionArterial} onChange={(v) => setH({ presionArterial: v })} suffix="mmHg" placeholder="Ej. 120/80" />
          </Field>
        </Grid>
      </Section>

      <Section title="Antecedentes médicos" subtitle="Marque las condiciones presentes.">
        <Grid cols={2}>
          <Field label="Hipertensión arterial crónica">
            <YesNo value={h.htaCronica} onChange={(v) => setH({ htaCronica: v })} />
            {h.htaCronica === "si" && (
              <div className="mt-2 space-y-2">
                <TextField value={h.htaTiempo} onChange={(v) => setH({ htaTiempo: v })} placeholder="¿Hace cuánto tiempo? (Ej. 4 años)" />
                <TextField value={h.htaTratamiento} onChange={(v) => setH({ htaTratamiento: v })} placeholder="Tratamiento actual" />
              </div>
            )}
          </Field>

          <Field label="Diabetes">
            <Segmented
              value={h.diabetes}
              onChange={(v) => setH({ diabetes: v })}
              options={[
                { value: "no", label: "No" },
                { value: "tipo1", label: "Tipo 1" },
                { value: "tipo2", label: "Tipo 2" },
                { value: "gestacional", label: "Gestacional" },
              ]}
            />
            {h.diabetes !== "no" && (
              <div className="mt-2 space-y-2">
                <TextField value={h.dmTiempo} onChange={(v) => setH({ dmTiempo: v })} placeholder="¿Hace cuánto tiempo? (Ej. 6 años)" />
                <TextField value={h.dmTratamiento} onChange={(v) => setH({ dmTratamiento: v })} placeholder="Tratamiento actual" />
              </div>
            )}
          </Field>
        </Grid>

        <Field label="Enfermedad del colágeno / autoinmune">
          <YesNo value={h.colageno} onChange={(v) => setH({ colageno: v })} />
          {h.colageno === "si" && (
            <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Seleccione la(s) que aplique(n):</p>
              <Checkbox checked={h.colagenoLes} onChange={(v) => setH({ colagenoLes: v })} label="Lupus eritematoso sistémico" />
              <Checkbox checked={h.colagenoSjogren} onChange={(v) => setH({ colagenoSjogren: v })} label="Síndrome de Sjögren" />
              <Checkbox checked={h.colagenoArtritis} onChange={(v) => setH({ colagenoArtritis: v })} label="Artritis reumatoide" />
              <Checkbox checked={h.colagenoOtro} onChange={(v) => setH({ colagenoOtro: v })} label="Otra" />
              {h.colagenoOtro && (
                <TextField value={h.colagenoOtroCual} onChange={(v) => setH({ colagenoOtroCual: v })} placeholder="¿Cuál?" />
              )}
              <TextField value={h.colagenoMedicamentos} onChange={(v) => setH({ colagenoMedicamentos: v })} placeholder="Medicamentos para la enfermedad del colágeno" />
            </div>
          )}
        </Field>

        <Grid cols={2}>
          <Field label="Síndrome de anticuerpos antifosfolípidos">
            <YesNo value={h.saf} onChange={(v) => setH({ saf: v })} />
            {h.saf === "si" && (
              <div className="mt-2">
                <TextArea value={h.safEventos} onChange={(v) => setH({ safEventos: v })} rows={3}
                  placeholder="Eventos obstétricos o trombóticos previos" />
              </div>
            )}
          </Field>

          <Field label="Trombofilias">
            <YesNo value={h.trombofilia} onChange={(v) => setH({ trombofilia: v })} />
            {h.trombofilia === "si" && (
              <div className="mt-2 space-y-2 rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Marque la(s) presente(s):</p>
                <Checkbox checked={h.tromboFactorVLeiden} onChange={(v) => setH({ tromboFactorVLeiden: v })} label="Factor V de Leiden" />
                <Checkbox checked={h.tromboProtrombina} onChange={(v) => setH({ tromboProtrombina: v })} label="Mutación de protrombina G20210A" />
                <Checkbox checked={h.tromboAntitrombina} onChange={(v) => setH({ tromboAntitrombina: v })} label="Deficiencia de antitrombina" />
                <Checkbox checked={h.tromboProteinaC} onChange={(v) => setH({ tromboProteinaC: v })} label="Deficiencia de proteína C" />
                <Checkbox checked={h.tromboProteinaS} onChange={(v) => setH({ tromboProteinaS: v })} label="Deficiencia de proteína S" />
                <Checkbox checked={h.tromboOtra} onChange={(v) => setH({ tromboOtra: v })} label="Otra" />
                {h.tromboOtra && (
                  <TextField value={h.tromboOtraCual} onChange={(v) => setH({ tromboOtraCual: v })} placeholder="¿Cuál?" />
                )}
                <TextField value={h.tromboTratamiento} onChange={(v) => setH({ tromboTratamiento: v })} placeholder="Tratamiento actual" />
              </div>
            )}
          </Field>
        </Grid>

        <Field label="¿Toma otros medicamentos?">
          <YesNo value={h.medicamentos} onChange={(v) => setH({ medicamentos: v })} />
          {h.medicamentos === "si" && (
            <div className="mt-2 space-y-2">
              <Checkbox
                checked={h.antiepilepticos}
                onChange={(v) => setH({ antiepilepticos: v })}
                label="Antiepilépticos"
              />
              <TextField value={h.medicamentosLista} onChange={(v) => setH({ medicamentosLista: v })} placeholder="Detalle de medicamentos" />
            </div>
          )}
        </Field>
      </Section>

      <Section title="Antecedentes obstétricos">
        <Grid cols={2}>
          <Field label="Número de partos previos">
            <TextField type="number" value={h.partosPrevios} onChange={(v) => setH({ partosPrevios: v })} placeholder="Ej. 2" />
          </Field>
          <Field label="¿Cesárea previa?">
            <YesNo value={h.cesareas} onChange={(v) => setH({ cesareas: v })} />
            {h.cesareas === "si" && (
              <div className="mt-2">
                <TextField value={h.cesareasFechas} onChange={(v) => setH({ cesareasFechas: v })} placeholder="Fecha(s) de cesárea(s)" />
              </div>
            )}
          </Field>
        </Grid>

        <Field label="Antecedentes del embarazo anterior" hint="Marque los que apliquen.">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <Checkbox checked={h.antPretermino} onChange={(v) => setH({ antPretermino: v })} label="Parto pretérmino" />
            <Checkbox checked={h.antPreeclampsia} onChange={(v) => setH({ antPreeclampsia: v })} label="Preeclampsia" />
            <Checkbox checked={h.antRCIU} onChange={(v) => setH({ antRCIU: v })} label="Restricción de crecimiento intrauterino" />
          </div>
        </Field>
      </Section>

      <Section title="Edad gestacional actual" subtitle="Si ya conoce la edad gestacional por un estudio previo, indíquela aquí.">
        <Field label="¿Tiene edad gestacional conocida por estudio previo?">
          <YesNo value={h.egConocida} onChange={(v) => setH({ egConocida: v })} />
        </Field>
        {h.egConocida === "si" && (
          <Grid cols={3}>
            <Field label="Semanas">
              <TextField type="number" value={h.egSemanas} onChange={(v) => setH({ egSemanas: v })} placeholder="Ej. 20" />
            </Field>
            <Field label="Días">
              <TextField type="number" value={h.egDias} onChange={(v) => setH({ egDias: v })} placeholder="0–6" />
            </Field>
            <Field label="Fecha del estudio de referencia" hint="Fecha en que se determinó esa edad gestacional.">
              <TextField type="date" value={h.egFechaRef} onChange={(v) => setH({ egFechaRef: v })} />
            </Field>
            {fppPrevia && (
              <div className="md:col-span-3">
                <div className="rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-800">
                  Fecha probable de parto (40 semanas):{" "}
                  <strong>{formatDate(fppPrevia)}</strong>
                </div>
              </div>
            )}
          </Grid>
        )}
      </Section>
    </div>
  );
}
