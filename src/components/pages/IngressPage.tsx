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
  branch: { nombre: string; business: { nombre_comercial: string } };
};

export default function IngressPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [_products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(
    null
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

const batchHeaders = [
  "Código producto",
  "Producto",
  "Número lote",
  "Cantidad",
  "Proveedor",
  "Fecha entrada",
  "Fecha vencimiento",
  "Descripción",
  "Stock actual",
  "Negocio",
];

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [batchRes, productRes, warehouseRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/batch`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
        fetch(`${API_URL}/api/v1/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
        fetch(`${API_URL}/api/v1/warehouses`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
      ]);

      setProducts(productRes);
      setWarehouses(warehouseRes);

      const mapped = batchRes.map((batch: any) => {
        const product = productRes.find(
          (p: any) => p.codigo_producto === batch.codigo_producto
        );
        const warehouse = product
          ? warehouseRes.find(
              (w: Warehouse) => w.bodega_id === product.bodega_id
            )
          : null;

        return {
          id: batch.id,
          codigo_producto: batch.codigo_producto,
          producto: product?.nombre_producto || "Producto no disponible",
          numero_lote: batch.numero_lote,
          cantidad: batch.cantidad,
          proveedor: batch.proveedor,
          fecha_entrada: formatDate(batch.fecha_entrada),
          fecha_vencimiento: batch.fecha_vencimiento
            ? formatDate(batch.fecha_vencimiento)
            : "—",
          descripcion: batch.descripcion || "—",
          stock_actual: product?.stock ?? 0,
          sucursal: warehouse?.branch?.nombre || "—",
          negocio: warehouse?.branch?.business?.nombre_comercial || "—",
          bodega_id: product?.bodega_id || null,
        };
      });

      setBatches(mapped);
    } catch (err: any) {
      console.error("Error fetching batches:", err);
      setError("Error al cargar los lotes.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

const clearFilters = () => {
  setSelectedWarehouse(null);
  setStartDate("");
  setEndDate("");
};

const filteredBatches = batches.filter((b) => {
  const matchesWarehouse =
    !selectedWarehouse || b.bodega_id === selectedWarehouse;

  const batchTime = new Date(b.fecha_entrada).getTime();
  const start = startDate
    ? new Date(`${startDate}T00:00:00`).getTime()
    : null;
  const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;

  const matchesStart = !start || batchTime >= start;
  const matchesEnd = !end || batchTime <= end;

  return matchesWarehouse && matchesStart && matchesEnd;
});

// ⬇️ AQUI SE HACE EL MAPEO FINAL PARA LA TABLA Y EXPORTADORES
const tableContent = filteredBatches.map((b) => ({
  "Código producto": b.codigo_producto,
  Producto: b.producto,
  "Número lote": b.numero_lote,
  Cantidad: b.cantidad,
  Proveedor: b.proveedor,
  "Fecha entrada": b.fecha_entrada,
  "Fecha vencimiento": b.fecha_vencimiento,
  Descripción: b.descripcion,
  "Stock actual": b.stock_actual,
  Negocio: b.negocio,
}));

const warehouseList = warehouses.map((w) => ({
  id: w.bodega_id,
  label: `${w.codigo} - ${w.branch.business.nombre_comercial} - ${w.branch.nombre}`,
}));

return (
  <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
    <Container
      page={
        <div className="w-full max-w-[1200px] px-2 sm:px-4 md:px-6 lg:px-10 flex flex-col pb-10">
          <div className="w-full px-2 md:px-10 mx-auto">
            <h1 className="text-3xl font-bold mb-6 mt-6">
              Reporte de Ingresos
              <InfoIcon
                title="Reporte de Ingresos"
                description="Consulta los lotes de ingreso de inventario."
              />
            </h1>

            {loading && <p>Cargando...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {warehouseList.length > 0 && (
              <div className="flex flex-wrap items-end gap-4 mb-6">
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

                <div className="flex flex-col">
                  <label className="block mb-1 font-semibold">Fecha fin:</label>
                  <input
                    type="date"
                    className="border px-3 py-2 rounded"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

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

            {filteredBatches.length > 0 && (
              <div className="mb-4 flex gap-4">
                <ExcelExporter
                  data={tableContent}
                  headers={batchHeaders}
                  fileName={`Ingresos.xlsx`}
                />
                <PDFExporter
                  data={tableContent}
                  headers={batchHeaders}
                  fileName={`Ingresos.pdf`}
                  reportTitle={`Reporte de Ingresos`}
                />
              </div>
            )}

            <TableInformation
              headers={batchHeaders}
              tableContent={tableContent}
              loading={loading}
              skeletonRows={8}
            />

            {!loading && filteredBatches.length === 0 && (
              <p>No hay lotes registrados.</p>
            )}
          </div>
        </div>
      }
    />
  </ProtectedRoute>
);
}