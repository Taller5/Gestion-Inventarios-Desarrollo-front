import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";

import Container from "../ui/Container";
import TableInformation from "../ui/TableInformation";
import ExcelExporter from "../ui/ExcelExporter";
import PDFExporter from "../ui/PDFExporter";
import InfoIcon from "../ui/InfoIcon";

const API_URL = import.meta.env.VITE_API_URL;

export default function SaleReports() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invoiceHeaders = [
    "id",
    "branch_name",
    "date",
    "customer_name",
    "total",
    "payment_method",
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("es-CR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch(`${API_URL}/api/v1/invoices`, {
          method: "GET",
        });
        if (!res.ok) throw new Error("Error al obtener las facturas");
        const data = await res.json();

        const formatted = data.map((inv: any) => ({
          ...inv,
          rawDate: inv.date,
          date: formatDate(inv.date),
          total: Number(inv.total).toFixed(2),
        }));

        setInvoices(formatted);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  const businessList = Array.from(
    new Set(invoices.map((inv) => inv.business_name).filter(Boolean))
  );

  const filteredInvoices = invoices.filter((inv) => {
    if (!selectedBusiness) return false;
    if (inv.business_name !== selectedBusiness) return false;

    const invoiceTime = new Date(inv.rawDate).getTime();
    const start = startDate
      ? new Date(`${startDate}T00:00:00`).getTime()
      : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;

    if (start && invoiceTime < start) return false;
    if (end && invoiceTime > end) return false;

    return true;
  });

  const clearFilters = () => {
    setSelectedBusiness(null);
    setStartDate("");
    setEndDate("");
  };

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
      <Container
        page={
          <div className="w-full flex justify-center px-2 md:px-10 pt-10 overflow-x-hidden">
            <div className="w-full px-2 md:px-10 mx-auto">
              <h1 className="text-3xl font-bold mb-6 mt-6">
                Reporte de ventas
                <InfoIcon
                  title="Reporte de Ventas"
                  description="En este módulo puedes generar reportes de ventas filtrados por negocio y rango de fechas. Selecciona un negocio y un rango de fechas para ver las facturas correspondientes. También puedes exportar los datos a Excel o PDF."
                />
              </h1>

              {loading && <p>Cargando...</p>}
              {error && <p className="text-red-500">{error}</p>}

              {!loading && !error && businessList.length > 0 && (
                <div className="flex flex-wrap items-end gap-4 mb-6">
                  {/* Negocio */}
                  <div className="flex flex-col">
                    <label className="block mb-1 font-semibold">Negocio:</label>
                    <select
                      className="border px-3 py-2 rounded min-w-[180px] cursor-pointer"
                      value={selectedBusiness || ""}
                      onChange={(e) =>
                        setSelectedBusiness(e.target.value || null)
                      }
                    >
                      <option value="" className="cursor-pointer">
                        -- Seleccione --
                      </option>
                      {businessList.map((b) => (
                        <option key={b} value={b} className="cursor-pointer">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha inicio */}
                  <div className="flex flex-col">
                    <label className="block mb-1 font-semibold">
                      Fecha inicio:
                    </label>
                    <input
                      type="date"
                      className="border px-3 py-2 rounded cursor-pointer"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  {/* Fecha fin */}
                  <div className="flex flex-col">
                    <label className="block mb-1 font-semibold">
                      Fecha fin:
                    </label>
                    <input
                      type="date"
                      className="border px-3 py-2 rounded cursor-pointer"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  {/* Botón limpiar */}
                  <div className="flex flex-col">
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-4 rounded mt-4 md:mt-0 cursor-pointer"
                      onClick={clearFilters}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}

              {selectedBusiness && filteredInvoices.length > 0 && (
                <div className="mb-4 flex gap-4">
                  {/* Exportar Excel */}
                  <ExcelExporter
                    data={filteredInvoices}
                    headers={invoiceHeaders}
                    fileName={`Ventas_${selectedBusiness}.xlsx`} // nombre dinámico con negocio
                  />

                  {/* Exportar PDF */}
                  <PDFExporter
                    data={filteredInvoices}
                    headers={invoiceHeaders}
                    fileName={`Ventas_${selectedBusiness}.pdf`} // nombre dinámico con negocio
                    reportTitle={`Reporte de Ventas - ${selectedBusiness}`} // título dentro del PDF
                  />
                </div>
              )}

              {/* Tabla */}
              {selectedBusiness && filteredInvoices.length > 0 && (
                <TableInformation
                  headers={invoiceHeaders}
                  tableContent={filteredInvoices}
                />
              )}

              {selectedBusiness && filteredInvoices.length === 0 && (
                <p>
                  No hay facturas para este negocio en el rango seleccionado.
                </p>
              )}
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
