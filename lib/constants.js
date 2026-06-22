// ============================================================
//  Constantes: listas de estructuras anatómicas y opciones
// ============================================================

export const ENCABEZADO = {
  titulo: "Reporte de Ultrasonido Obstétrico",
  medico: "Dr. Vladimir González Araya",
  especialidad1: "Medicina Fetal",
  especialidad2: "Cardiología Fetal",
  lugar: "Liberia, Guanacaste",
};

// Estados booleanos para hallazgos de semana 11-14
export const ESTADO_PAU = [
  { value: "presente", label: "Presente" },
  { value: "ausente", label: "Ausente" },
  { value: "indeterminado", label: "No es posible determinar" },
];

// Estados para hallazgos anatómicos de semana 22-24 / morfológico
export const ESTADO_NANE = [
  { value: "normal", label: "Normal" },
  { value: "anormal", label: "Anormal" },
  { value: "no_examinado", label: "No examinado" },
];

// Presente / Ausente / Sin medición — para marcadores
export const PRESENTE_AUSENTE_NM = [
  { value: "presente", label: "Presente" },
  { value: "ausente", label: "Ausente" },
  { value: "no_medicion", label: "No hay medición" },
];

// Hallazgos anatómicos evaluados en semana 11-14 (presente/ausente/indeterminado).
// "presente" = el hallazgo (patológico) está presente.
export const ANATOMIA_11_14 = [
  { key: "holoprosencefalia", label: "Holoprosencefalia" },
  { key: "acrania", label: "Acrania / exencefalia" },
  { key: "defecto_pared", label: "Defecto de pared abdominal (onfalocele/gastrosquisis)" },
  { key: "megavejiga", label: "Megavejiga" },
  { key: "higroma", label: "Higroma quístico" },
  { key: "ausencia_extremidad", label: "Ausencia / anomalía de extremidades" },
];

// Estructuras anatómicas evaluadas en la morfología de 22-24 semanas
// (cada una: normal / anormal / no examinado, con texto si anormal)
export const ANATOMIA_22_24 = [
  { key: "craneo_cerebro", label: "Cráneo y cerebro" },
  { key: "cara_perfil", label: "Cara y perfil" },
  { key: "columna", label: "Columna vertebral" },
  { key: "corazon", label: "Corazón (situs y cuatro cámaras)" },
  { key: "tractos_salida", label: "Tractos de salida cardíacos" },
  { key: "torax_pulmones", label: "Tórax y pulmones" },
  { key: "diafragma", label: "Diafragma" },
  { key: "pared_abdominal", label: "Pared abdominal e inserción de cordón" },
  { key: "estomago", label: "Estómago" },
  { key: "intestino", label: "Intestino" },
  { key: "rinones", label: "Riñones" },
  { key: "vejiga", label: "Vejiga" },
  { key: "genitales", label: "Genitales" },
  { key: "extremidades", label: "Extremidades" },
  { key: "cordon", label: "Cordón umbilical" },
  { key: "placenta_morfo", label: "Placenta" },
];

// Opciones de líquido amniótico
export const LIQUIDO_AMNIOTICO = [
  { value: "normal", label: "Normal" },
  { value: "oligoamnios", label: "Oligoamnios" },
  { value: "polihidramnios", label: "Polihidramnios" },
  { value: "anhidramnios", label: "Anhidramnios" },
];

// Ubicación placentaria
export const UBICACION_PLACENTA = [
  { value: "anterior", label: "Anterior" },
  { value: "posterior", label: "Posterior" },
  { value: "fundica", label: "Fúndica" },
  { value: "lateral_der", label: "Lateral derecha" },
  { value: "lateral_izq", label: "Lateral izquierda" },
  { value: "previa", label: "Previa" },
  { value: "marginal", label: "Marginal / baja" },
];

// Corionicidad
export const CORIONICIDAD = [
  { value: "monocorionico", label: "Monocoriónico" },
  { value: "bicorionico", label: "Bicoriónico" },
];

// Tipo de embarazo
export const TIPO_EMBARAZO = [
  { value: "unico", label: "Único" },
  { value: "multiple", label: "Múltiple" },
];

// Las 4 opciones de estudio según edad gestacional
export const OPCIONES_ESTUDIO = [
  {
    id: "opcion1",
    titulo: "Primer trimestre",
    rango: "< 11 semanas",
    desc: "Longitud cefalocaudal, vitalidad, corionicidad y cálculo automático de FPP.",
  },
  {
    id: "opcion2",
    titulo: "Tamizaje 11–14 semanas",
    rango: "11 – 14 semanas",
    desc: "Translucencia nucal, marcadores, bioquímica y cálculo manual de riesgos.",
  },
  {
    id: "opcion3",
    titulo: "Morfológico 22–26 semanas",
    rango: "22 – 26 semanas",
    desc: "Anatomía, ecocardiograma, longitud cervical y tamizaje de preeclampsia.",
  },
  {
    id: "opcion4",
    titulo: "Ultrasonido de crecimiento",
    rango: "≥ 24 semanas",
    desc: "Antropometría, percentiles, Doppler y clasificación de RCIU (Barcelona).",
  },
];
