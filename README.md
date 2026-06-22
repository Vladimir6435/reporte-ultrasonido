# Reporte de Ultrasonido Obstétrico

Generador de reportes de ultrasonido obstétrico para **Dr. Vladimir González Araya — Medicina Fetal · Cardiología Fetal** (Liberia, Guanacaste).

Aplicación web construida con **Next.js + React + Tailwind**. Funciona en tres etapas:

1. **Historia clínica** — datos de la paciente, antecedentes médicos y obstétricos, edad gestacional conocida.
2. **Datos del ultrasonido** — cuatro opciones según la edad gestacional (primer trimestre, 11–14 semanas, morfológico 22–24 semanas, crecimiento con clasificación de RCIU de Barcelona).
3. **Reporte** — vista previa elegante editable, con caja de comentarios, exportación a **Word (.docx)**, **PDF** (impresión) y **nota médica compacta** para el expediente.

Los datos se procesan **localmente en el navegador**. No se guardan en ningún servidor ni base de datos.

---

## Cómo probarlo en tu computadora

Necesitas tener instalado [Node.js](https://nodejs.org) (versión 18 o superior).

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` en tu navegador.

Para generar la versión optimizada de producción:

```bash
npm run build
npm start
```

---

## Subir a GitHub

1. Crea una cuenta en [github.com](https://github.com) si aún no la tienes.
2. Crea un repositorio nuevo (botón **New**), por ejemplo `reporte-ultrasonido`. Déjalo **vacío** (sin README).
3. Desde la carpeta del proyecto, en la terminal:

```bash
git init
git add .
git commit -m "Generador de reportes de ultrasonido obstétrico"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/reporte-ultrasonido.git
git push -u origin main
```

> La carpeta `node_modules` y `.next` **no se suben** (están en `.gitignore`); Vercel las reconstruye automáticamente.

---

## Desplegar en Vercel (recomendado)

Vercel es gratuito para uso personal y mantiene intactas las funciones de Word y PDF, porque **ambas se generan en el navegador del usuario**, no en el servidor.

1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New… → Project**.
3. Selecciona el repositorio `reporte-ultrasonido` que acabas de subir.
4. Vercel detecta automáticamente que es un proyecto **Next.js**. No necesitas configurar nada:
   - Framework Preset: `Next.js`
   - Build Command: `next build` (automático)
   - Output: automático
5. Haz clic en **Deploy**.
6. En 1–2 minutos tendrás una URL pública (ej. `https://reporte-ultrasonido.vercel.app`) lista para usar desde cualquier dispositivo.

Cada vez que hagas `git push`, Vercel vuelve a desplegar la nueva versión automáticamente.

---

## Generación de Word y PDF

- **Word (.docx):** se crea con la librería `docx` directamente en el navegador y se descarga al instante. Encabezado, antecedentes resaltados, hallazgos en prosa (órganos anormales en **negrita**), riesgos, ecocardiograma y firma.
- **PDF:** se genera con el motor de impresión del navegador (botón *Imprimir / Guardar PDF* → "Guardar como PDF"). El reporte se imprime limpio, sin la interfaz. Ajusta los márgenes en el diálogo de impresión si lo deseas.
- **Nota médica compacta:** texto plano listo para copiar y pegar en el expediente.

Ambas funciones siguen operando igual en Vercel porque no dependen del servidor.

---

## Notas clínicas

- El cálculo de la **fecha probable de parto (40 semanas)** es automático a partir de la edad gestacional y la fecha del reporte (`lib/calculations.js`).
- La **clasificación de RCIU** sigue el protocolo de Medicina Fetal Barcelona (estadios I–IV). Los criterios Doppler se marcan manualmente y el estadio se calcula solo.
- Todos los **riesgos (trisomías, preeclampsia) y los valores de percentil/MoM se ingresan manualmente**, tal como los calcula el software de tamizaje. La aplicación no genera gráficos.

---

## Estructura del proyecto

```
app/
  layout.js            Estructura HTML y metadatos
  page.js              Orquestador de las 3 etapas (stepper)
  globals.css          Estilos + reglas de impresión/PDF
components/
  ui.jsx               Componentes reutilizables (campos, segmented, etc.)
  Step1History.jsx     Etapa 1: historia clínica
  Step2Study.jsx       Etapa 2: selector de estudio
  StudyOption1..4.jsx  Formularios por edad gestacional
  Step3Report.jsx      Etapa 3: vista previa + exportación
lib/
  calculations.js      FPP, edad gestacional, RCIU Barcelona
  constants.js         Listas anatómicas y opciones
  state.js             Estado inicial
  report.js            Construcción del reporte y nota médica
  docxExport.js        Exportación a Word
```

---

*Desarrollado como herramienta de apoyo. La interpretación clínica es responsabilidad del médico.*
