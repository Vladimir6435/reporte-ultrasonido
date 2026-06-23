// ============================================================
//  Generación del documento Word (.docx) en el navegador
// ============================================================
import {
  Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { buildReport } from "./report";

// Nombre de archivo: nombre de paciente + identificación + fecha, todo seguido.
export function nombreArchivo(state) {
  const h = state.historia || {};
  const clean = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]/g, "");
  const fecha = (state.fechaReporte || "").replace(/-/g, "");
  const base = `${clean(h.nombre)}${clean(h.identificacion)}${fecha}`;
  return base || "ReporteUltrasonido";
}

const BRAND = "174C87";

function heading(text) {
  return new Paragraph({
    spacing: { before: 220, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: BRAND })],
  });
}

function kvParagraph(items) {
  return items.map(
    (i) =>
      new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({ text: `${i.label}: `, bold: true, size: 20 }),
          new TextRun({ text: String(i.value), size: 20 }),
        ],
      })
  );
}

function paraBlock(runs) {
  return new Paragraph({
    spacing: { after: 80 },
    alignment: AlignmentType.JUSTIFIED,
    children: runs.map((r) => new TextRun({ text: r.text, bold: r.bold, size: 20 })),
  });
}

function alertBlock(label, value) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22 }),
      new TextRun({ text: String(value), bold: true, size: 22 }),
    ],
  });
}

function highlightBlock(label, value) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    shading: { fill: "EEF4FB" },
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: BRAND, space: 6 },
    },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, color: BRAND }),
      new TextRun({ text: String(value), size: 22 }),
    ],
  });
}

export async function generateDocx(state) {
  const r = buildReport(state);
  const children = [];

  // Encabezado
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: r.encabezado.titulo, bold: true, size: 30, color: BRAND })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: r.encabezado.medico, bold: true, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: r.encabezado.especialidades || "",
          size: 20, color: "555555",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND, space: 6 } },
      children: [
        new TextRun({ text: `${r.encabezado.lugar}   ·   Fecha: ${r.fechaReporte}`, size: 20, color: "555555" }),
      ],
    })
  );

  // Datos de la paciente
  children.push(heading("Datos de la paciente"));
  children.push(
    ...kvParagraph(
      [
        { label: "Nombre", value: r.paciente.nombre },
        { label: "Identificación / Expediente", value: r.paciente.identificacion },
        { label: "Fecha de nacimiento", value: r.paciente.fechaNacimiento },
        { label: "Edad", value: r.paciente.edad },
        { label: "Peso materno", value: r.paciente.pesoMaterno },
        { label: "Presión arterial", value: r.paciente.presionArterial },
      ].filter((i) => i.value)
    )
  );

  // Antecedentes
  children.push(heading("Antecedentes"));
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: "Médicos: ", bold: true, size: 20 }),
        new TextRun({ text: r.antecedentesMedicos, size: 20 }),
      ],
    })
  );
  if (r.antecedentesObstetricos.length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        shading: { fill: "F3F4F6" },
        children: [
          new TextRun({ text: "Obstétricos: ", bold: true, size: 20, color: BRAND }),
          new TextRun({
            text: r.antecedentesObstetricos.map((x) => `${x.label}: ${x.value}`).join("  ·  "),
            size: 20, bold: true,
          }),
        ],
      })
    );
  }

  // Edad gestacional
  if (r.edadGestacional) {
    children.push(heading("Edad gestacional"));
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${r.edadGestacional}`, bold: true, size: 22 }),
          new TextRun({ text: r.egFuente ? `   (${r.egFuente.replace(/\.$/, "")})` : "", size: 18, color: "666666" }),
        ],
      })
    );
    if (r.fpp)
      children.push(
        new Paragraph({
          spacing: { before: 20 },
          children: [
            new TextRun({ text: "Semana 40 (fecha probable de parto): ", size: 20 }),
            new TextRun({ text: r.fpp, bold: true, size: 20 }),
          ],
        })
      );
    (r.egHitos || []).forEach((hk) =>
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${hk.label}: `, size: 20, color: "444444" }),
            new TextRun({ text: hk.value, size: 20, color: "444444" }),
          ],
        })
      )
    );
  }

  // Bloques de hallazgos
  r.blocks.forEach((b) => {
    if (b.type === "heading") children.push(heading(b.text));
    else if (b.type === "kv") children.push(...kvParagraph(b.items));
    else if (b.type === "para") children.push(paraBlock(b.runs));
    else if (b.type === "highlight") children.push(highlightBlock(b.label, b.value));
    else if (b.type === "alert") children.push(alertBlock(b.label, b.value));
    else if (b.type === "note") children.push(new Paragraph({ children: [new TextRun({ text: b.text, size: 20 })] }));
  });

  // Comentarios
  if (r.comentarios) {
    children.push(heading("Comentarios"));
    children.push(paraBlock([{ text: r.comentarios, bold: false }]));
  }

  // Firma
  children.push(
    new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "_______________________________", size: 20 })] }),
    new Paragraph({ children: [new TextRun({ text: r.encabezado.medico, bold: true, size: 20 })] }),
    new Paragraph({
      children: [new TextRun({ text: r.encabezado.especialidades || "", size: 18, color: "555555" })],
    })
  );

  const doc = new Document({
    sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${nombreArchivo(state)}.docx`);
}
