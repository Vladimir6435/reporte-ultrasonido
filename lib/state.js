import { todayISO } from "./calculations";
import { ANATOMIA_22_24, DEFAULT_MEDICOS } from "./constants";

// Estado inicial (en memoria, sin base de datos)
export function initialState() {
  const anat2224 = {};
  ANATOMIA_22_24.forEach((a) => {
    anat2224[a.key] = { estado: "normal", detalle: "" };
  });

  return {
    step: 1,
    fechaReporte: todayISO(),

    historia: {
      nombre: "",
      identificacion: "",
      fechaNacimiento: "",
      edad: "",
      pesoMaterno: "",
      presionArterial: "",
      htaCronica: "no",
      htaTiempo: "",
      htaTratamiento: "",
      diabetes: "no", // no | tipo1 | tipo2 | gestacional
      dmTiempo: "",
      dmTratamiento: "",
      colageno: "no",
      colagenoLes: false,
      colagenoSjogren: false,
      colagenoArtritis: false,
      colagenoOtro: false,
      colagenoOtroCual: "",
      colagenoMedicamentos: "",
      // Síndrome de anticuerpos antifosfolípidos
      saf: "no",
      safEventos: "",
      // Trombofilias
      trombofilia: "no",
      tromboFactorVLeiden: false,
      tromboProtrombina: false,
      tromboAntitrombina: false,
      tromboProteinaC: false,
      tromboProteinaS: false,
      tromboOtra: false,
      tromboOtraCual: "",
      tromboTratamiento: "",
      medicamentos: "no",
      antiepilepticos: false,
      medicamentosLista: "",
      partosPrevios: "",
      cesareas: "no",
      cesareasFechas: "", // texto libre con fechas
      antPretermino: false,
      antPreeclampsia: false,
      antRCIU: false,
      // Edad gestacional conocida por estudio previo
      egConocida: "no",
      egSemanas: "",
      egDias: "",
      egFechaRef: todayISO(), // fecha del estudio de referencia
    },

    opcion: null, // opcion1 | opcion2 | opcion3 | opcion4

    op1: {
      crl: "",
      egSemanas: "",
      egDias: "",
      tipoEmbarazo: "unico",
      corionicidad: "monocorionico",
      vesiculaVitelina: "presente",
      fcf1: "",
      fcf2: "",
    },

    op2: {
      crl: "",
      tn: "",
      tnNm: false,
      huesoNasal: "presente",
      ductusVenoso: "normal", // normal | anormal | no_medicion
      regurgitacionTricuspidea: "ausente",
      fcf: "",
      fcfNm: false,
      pappa: "",
      pappaNm: false,
      hcg: "",
      hcgNm: false,
      plgf: "",
      plgfNm: false,
      longitudCervical: "",
      lcNm: false,
      riesgoT21: "",
      riesgoT18: "",
      riesgoT13: "",
      riesgoPreeclampsia: "",
      anatomia: {}, // key -> 'presente'|'ausente'|'indeterminado'
    },

    op3: {
      anatomia: anat2224,
      ecoEstado: "realizado_normal", // realizado_normal | no_realizado | realizado_anormal
      aortaDiam: "",
      aortaZ: "",
      pulmonarDiam: "",
      pulmonarZ: "",
      ecoDescripcion: "",
      longitudCervical: "",
      lcNm: false,
      ubicacionPlacenta: "posterior",
      arteriasUterinas: "",
      auNm: false,
      plgf: "",
      plgfNm: false,
      sflt1: "",
      sflt1Nm: false,
      ratio: "",
      ratioNm: false,
      riesgoPreeclampsia: "",
      // Biometría opcional
      incluirBiometria: false,
      dbp: "",
      cc: "",
      ca: "",
      lf: "",
      peso: "",
      pesoPercentil: "",
    },

    op4: {
      dbp: "",
      cc: "",
      ca: "",
      lf: "",
      peso: "",
      pesoPercentil: "",
      presentacion: "cefalico", // cefalico | pelvico | transverso
      ubicacionPlacenta: "posterior",
      placentaAnormal: false,
      placentaPrevia: false,
      placentaInsercionAnormal: false,
      placentaDescripcion: "",
      liquidoAmniotico: "normal",
      ilaValor: "",
      // Doppler: IP + percentil + "no se requiere"
      uterinas: "",
      uterinasP: "",
      uterinasNm: false,
      umbilical: "",
      umbilicalP: "",
      umbilicalNm: false,
      umbilicalReverso: false, // flujo diastólico reverso
      acm: "",
      acmP: "",
      acmNm: false,
      icp: "",
      icpP: "",
      icpNm: false,
      ductusVenoso: "",
      dvP: "",
      dvNm: false,
      dvOndaAReversa: false, // onda a reversa
      plgf: "",
      plgfNm: false,
      sflt1: "",
      sflt1Nm: false,
      balanceAngiogenico: "", // cociente sFlt-1/PlGF
      balanceNm: false,
      // RCIU
      rciuEnabled: false,
      rciu_umbilicalPI_p95: false,
      rciu_acmPI_p5: false,
      rciu_cpr_p5: false,
      rciu_uterinasPI_p95: false,
      rciu_umbDiastoleAusente: false,
      rciu_umbDiastoleReversa: false,
      rciu_dvIP_p95: false,
      rciu_dvAReversa: false,
    },

    // Calculadora de edad gestacional (disponible en todas las etapas)
    egCalc: {
      activo: false,
      metodo: "fur", // fur | us | fpp | manual
      fur: "",
      usFecha: "",
      usSemanas: "",
      usDias: "",
      fpp: "",
      manSemanas: "",
      manDias: "",
    },

    // Personal médico
    medicos: DEFAULT_MEDICOS.map((m) => ({ ...m })),
    medicoSelId: DEFAULT_MEDICOS[0].id,

    comentarios: "",
    notaAbierta: false,
  };
}
