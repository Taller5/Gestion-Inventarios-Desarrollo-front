import type { FC } from "react";
import type { WorkBook, WorkSheet } from "xlsx";
import { utils, writeFile } from "xlsx";

interface ExcelExporterProps {
  data: any[];
  headers: string[];
  fileName?: string;
}

const ExcelExporter: FC<ExcelExporterProps> = ({
  data,
  headers,
  fileName = "reporte.xlsx",
}) => {
  const exportToExcel = () => {
    if (!data || data.length === 0) return;

    // Crear Array-of-Arrays (AoA) con headers
    const aoa: (string | number)[][] = [headers];
    data.forEach((row) => {
      aoa.push(headers.map((key) => row[key] ?? ""));
    });

    // Crear hoja
    const ws: WorkSheet = utils.aoa_to_sheet(aoa);

    // Estilos de cabecera
    headers.forEach((_, colIdx) => {
      const cellRef = utils.encode_cell({ r: 0, c: colIdx });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFFFF" } },
          fill: { fgColor: { rgb: "FF2E8B57" } }, // verde oscuro
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    });

    // Ajustar ancho de columnas automáticamente
    const colWidths = headers.map((header) => ({ wch: Math.max(header.length + 2, 10) }));
    ws["!cols"] = colWidths;

    // Crear libro
    const wb: WorkBook = utils.book_new();
    utils.book_append_sheet(wb, ws, "Reporte");

    // Escribir archivo
    writeFile(wb, fileName);
  };

  return (
    <button
      className="bg-verde-claro hover:bg-verde-oscuro text-white font-semibold py-2 px-4 rounded cursor-pointer"
      onClick={exportToExcel}
    >
      Exportar Excel
    </button>
  );
};

export default ExcelExporter;
