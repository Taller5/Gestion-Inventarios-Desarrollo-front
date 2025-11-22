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

   autoTable(doc, {
  head: [headers],
  body: rows,
  startY: 25,
  styles: {
    fontSize: 8,            // reduce texto
    cellPadding: 1.2,
    overflow: "linebreak",  // permite texto multi-línea
  },
  headStyles: { fillColor: [22, 160, 133] },
  columnStyles: {
    // autoTable calculará automáticamente los widths
    0: { cellWidth: "auto" },
    1: { cellWidth: "auto" },
    // podrías poner más si quieres columnas más estrechas
  },
  tableWidth: "wrap",       // ajusta ancho de la tabla
  pageBreak: "auto",        // divide en varias páginas si es muy grande
  horizontalPageBreak: true // divide horizontalmente si hay demasiadas columnas
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
