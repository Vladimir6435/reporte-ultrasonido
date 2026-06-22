"use client";

import { OPCIONES_ESTUDIO } from "@/lib/constants";
import StudyOption1 from "./StudyOption1";
import StudyOption2 from "./StudyOption2";
import StudyOption3 from "./StudyOption3";
import StudyOption4 from "./StudyOption4";

export default function Step2Study({ state, update }) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="mb-1 text-lg font-semibold text-gray-800">
          Seleccione el estudio según la edad gestacional
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          Escoja una de las cuatro opciones para desplegar el formulario correspondiente.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OPCIONES_ESTUDIO.map((op) => {
            const active = state.opcion === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => update({ opcion: op.id })}
                className={`rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-brand-600 bg-brand-50 shadow"
                    : "border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {op.rango}
                </div>
                <div className="mt-1 font-semibold text-gray-800">{op.titulo}</div>
                <div className="mt-1 text-xs text-gray-500">{op.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {state.opcion === "opcion1" && <StudyOption1 state={state} update={update} />}
      {state.opcion === "opcion2" && <StudyOption2 state={state} update={update} />}
      {state.opcion === "opcion3" && <StudyOption3 state={state} update={update} />}
      {state.opcion === "opcion4" && <StudyOption4 state={state} update={update} />}
    </div>
  );
}
