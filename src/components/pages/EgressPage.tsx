import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import TableInformation from "../ui/TableInformation";
import ExcelExporter from "../ui/ExcelExporter";
import PDFExporter from "../ui/PDFExporter";
import InfoIcon from "../ui/InfoIcon";

const API_URL = import.meta.env.VITE_API_URL;

type Warehouse = {
  bodega_id: number;
  codigo: string;
  sucursal_id: number;
  branch: {
    nombre: string;
    business: { nombre_comercial: string };
  };
};

export default function EgressPage() {
  const [egresses, setEgresses] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(
    null
  );
  const [selectedMotivo, setSelectedMotivo] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 const egressHeaders = [
  "ID",
  "Código producto",
  "Nombre producto",
  "Cantidad",
  "Motivo",
  "Descripción",
  "Sucursal origen",
  "Negocio origen",
  "Sucursal destino",
  "Negocio destino",
  "Fecha",
];



const formatDate = (dateStr: string) => {
  const d = new Date(dateStr); // dateStr es ISO UTC, p.ej. "2025-11-17T22:45:00Z"
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [egressRes, warehousesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/egresos`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/v1/warehouses`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);

  const mappedEgresses = egressRes.map((eg: any) => {
  const origen = warehousesRes.find(
    (w: Warehouse) => w.bodega_id === eg.bodega_origen_id
  );
  const destino = warehousesRes.find(
    (w: Warehouse) => w.bodega_id === eg.bodega_destino_id
  );

  return {
    ...eg,
    nombre_producto:
      eg.producto?.nombre ||
      eg.producto?.nombre_producto ||
      "Producto no disponible",

    // Origen
    bodega_origen: origen?.codigo || "N/A",
    sucursal_origen: origen?.branch?.nombre || "—",
    negocio_origen: origen?.branch?.business?.nombre_comercial || "—",

    // Destino
    bodega_destino:
      destino?.codigo || (eg.motivo === "traslado" ? "—" : ""),
    sucursal_destino:
      destino?.branch?.nombre || (eg.motivo === "traslado" ? "—" : ""),
    negocio_destino:
      destino?.branch?.business?.nombre_comercial ||
      (eg.motivo === "traslado" ? "—" : ""),
fechaISO: eg.created_at,
fecha: formatDate(eg.created_at),
  };
});

        setEgresses(mappedEgresses);
        setWarehouses(warehousesRes);
      } catch (err: any) {
        console.error("Error fetching egresos:", err);
        setError("Error al cargar los egresos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lista de bodegas para filtro
  const warehouseList = warehouses.map((w) => ({
    id: w.bodega_id,
    label: `${w.codigo} - ${w.branch.business.nombre_comercial} - ${w.branch.nombre}`,
  }));

  // Motivos únicos para filtro
  const uniqueMotives = Array.from(
    new Set(egresses.map((eg) => eg.motivo).filter(Boolean))
  );

  // Filtros combinados
  const filteredEgresses = egresses.filter((eg) => {
    const matchesWarehouse =
      !selectedWarehouse || eg.bodega_origen_id === selectedWarehouse;
    const matchesMotivo =
      !selectedMotivo ||
      eg.motivo?.toLowerCase() === selectedMotivo.toLowerCase();

  const egTime = new Date(eg.fechaISO).getTime();

    const start = startDate
      ? new Date(`${startDate}T00:00:00`).getTime()
      : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;
    const matchesStart = !start || egTime >= start;
    const matchesEnd = !end || egTime <= end;

    return matchesWarehouse && matchesMotivo && matchesStart && matchesEnd;
  });

  const clearFilters = () => {
    setSelectedWarehouse(null);
    setSelectedMotivo("");
    setStartDate("");
    setEndDate("");
  };
const tableContent = filteredEgresses.map((e) => ({
  ID: e.id,
  "Código producto": e.codigo_producto,
  "Nombre producto": e.nombre_producto,
  Cantidad: e.cantidad,
  Motivo: e.motivo,
  Descripción: e.descripcion || "-",
  "Sucursal origen": e.sucursal_origen,
  "Negocio origen": e.negocio_origen,
  "Sucursal destino": e.sucursal_destino,
  "Negocio destino": e.negocio_destino,
  Fecha: e.fecha, // ya formateada
}));

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
      <Container
        page={
<div className="w-full max-w-[1200px] px-2 sm:px-4 md:px-6 lg:px-10 flex flex-col pb-10">
            <div className="w-full px-2 md:px-10 mx-auto">
              <h1 className="text-3xl font-bold mb-6 mt-6">
                Reporte de Egresos
                <InfoIcon
                  title="Reporte de Egresos"
                  description="Consulta los egresos de inventario, con filtros por motivo, bodega, fecha y mostrando sucursal y negocio tanto de origen como de destino."
                />
              </h1>

              {loading && <p>Cargando...</p>}
              {error && <p className="text-red-500">{error}</p>}

              {!loading && !error && warehouseList.length > 0 && (
                <div className="flex flex-wrap items-end gap-4 mb-6">
                  {/* Filtro bodega */}
                  <div className="flex flex-col">
                    <label className="block mb-1 font-semibold">Bodega:</label>
                    <select
                      className="border px-3 py-2 rounded min-w-[200px]"
                      value={selectedWarehouse || ""}
                      onChange={(e) =>
                        setSelectedWarehouse(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    >
                      <option value="">-- Todas --</option>
                      {warehouseList.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro motivo */}
                  <div className="flex flex-col">
                    <label className="block mb-1 font-semibold">Motivo:</label>
                    <select
                      className="border px-3 py-2 rounded min-w-[200px]"
                      value={selectedMotivo}
                      onChange={(e) => setSelectedMotivo(e.target.value)}
                    >
                      <option value="">-- Todos --</option>
                      {uniqueMotives.map((m) => (
                        <option key={m} value={m}>
                          {m.charAt(0).toUpperCase() + m.slice(1)}
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
                      className="border px-3 py-2 rounded"
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
                      className="border px-3 py-2 rounded"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  {/* Limpiar filtros */}
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

              {/* Exportadores */}
              {filteredEgresses.length > 0 && (
                <div className="mb-4 flex gap-4">
                  <ExcelExporter
                    data={tableContent}
                    headers={egressHeaders}
                    fileName={`Egresos.xlsx`}
                  />
                  <PDFExporter
                    data={tableContent}
                    headers={egressHeaders}
                    fileName={`Egresos.pdf`}
                    reportTitle={`Reporte de Egresos`}
                  />
                </div>
              )}

         
                <TableInformation
                  headers={egressHeaders}
                  tableContent={tableContent}
                    loading={loading}
                skeletonRows={8}
                />
             
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
