import type { FC } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PDFExporterProps {
  data: any[];
  headers: string[];
  fileName?: string;       // nombre del archivo
  reportTitle?: string;    // título dentro del PDF
}

const PDFExporter: FC<PDFExporterProps> = ({
  data,
  headers,
  fileName = "reporte.pdf",
  reportTitle = "Reporte",
}) => {
  const exportToPDF = () => {
    if (!data || data.length === 0) return;

    const doc = new jsPDF();

    // Agregar título centrado arriba
    doc.setFontSize(16);
    doc.text(reportTitle, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

    // Mapear filas
    const rows = data.map((row) => headers.map((key) => row[key] ?? ""));

    // Tabla
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 25, // un poco debajo del título
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] }, // verde bonito
    });

    // Guardar archivo
    doc.save(fileName);
  };

  return (
    <button
      className="bg-azul-medio hover:bg-azul-hover text-white font-semibold py-2 px-4 rounded cursor-pointer"
      onClick={exportToPDF}
    >
      Exportar PDF
    </button>
  );
};

export default PDFExporter;
