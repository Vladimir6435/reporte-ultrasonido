import "./globals.css";

export const metadata = {
  title: "Reporte de Ultrasonido Obstétrico — Dr. Vladimir González Araya",
  description:
    "Generador de reportes de ultrasonido obstétrico, medicina fetal y cardiología fetal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
