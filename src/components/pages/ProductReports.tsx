import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import TableInformation from "../ui/TableInformation";
import ExcelExporter from "../ui/ExcelExporter";
import PDFExporter from "../ui/PDFExporter";

const API_URL = import.meta.env.VITE_API_URL;

interface Producto {
  id: number;
  codigo_producto: string;
  nombre_producto: string;
  categoria: string;
  stock: number;
  precio_compra: number;
  precio_venta: number;
  unit: { nombre: string } | null;
  bodega_id: number;
  business_nombre: string;
}

type Warehouse = {
  bodega_id: number;
  branch: {
    business: {
      nombre_comercial: string;
    };
  };
};

export default function ProductReports() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedBodega, setSelectedBodega] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos y bodegas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [productosRes, warehousesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/v1/warehouses`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);

        // Mapear productos solo con stock > 0 y agregar nombre de negocio
        const mappedProductos: Producto[] = productosRes
          .filter((p: any) => p.stock > 0)
          .map((p: any) => {
            const warehouse = warehousesRes.find(
              (w: Warehouse) => w.bodega_id === p.bodega_id
            );
            return {
              ...p,
              business_nombre: warehouse?.branch.business.nombre_comercial || "",
            };
          });

        setProductos(mappedProductos);
        setWarehouses(warehousesRes);
      } catch (err) {
        console.error("Error fetching products or warehouses:", err);
        setError("Error al cargar los productos. Por favor, intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lista de bodegas disponibles
  const bodegaList = Array.from(
    new Set(productos.map((p) => p.bodega_id))
  );

  // Filtrar productos por bodega seleccionada
  const filteredProductos = productos.filter((p) =>
    selectedBodega ? p.bodega_id === selectedBodega : true
  );

  const clearFilters = () => setSelectedBodega(null);

  const tableHeaders = [
    "codigo_producto",
    "nombre_producto",
    "categoria",
    "stock",
    "precio_compra",
    "precio_venta",
    "business_nombre",
  ];

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
      <Container
        page={
          <div className="w-full md:w-auto  px-2 md:px-10 mx-auto flex flex-col">
            <h1 className="text-3xl font-bold mb-6 mt-6">
              Reporte de productos
            </h1>

            {loading && <p>Cargando...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && bodegaList.length > 0 && (
              <div className="flex flex-wrap items-end gap-4 mb-6">
                {/* Filtro por bodega */}
                <div className="flex flex-col">
                  <label className="block mb-1 font-semibold">Bodega:</label>
                  <select
                    className="border px-3 py-2 rounded min-w-[180px] cursor-pointer"
                    value={selectedBodega || ""}
                    onChange={(e) =>
                      setSelectedBodega(Number(e.target.value) || null)
                    }
                  >
                    <option value="">-- Todas --</option>
                    {bodegaList.map((b) => (
                      <option key={b} value={b}>
                        {warehouses.find((w) => w.bodega_id === b)?.branch.business.nombre_comercial || b}
                      </option>
                    ))}
                  </select>
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

            {/* Botones exportar */}
            {selectedBodega && filteredProductos.length > 0 && (
              <div className="mb-4 flex gap-4">
                <ExcelExporter
                  data={filteredProductos}
                  headers={tableHeaders}
                  fileName={`Productos_${filteredProductos[0].business_nombre}.xlsx`}
                />

                <PDFExporter
                  data={filteredProductos}
                  headers={tableHeaders}
                  fileName={`Productos_${filteredProductos[0].business_nombre}.pdf`}
                  reportTitle={`Reporte de Productos - ${filteredProductos[0].business_nombre}`}
                />
              </div>
            )}

            {/* Tabla */}
            {filteredProductos.length > 0 && (
              <TableInformation
                headers={tableHeaders}
                tableContent={filteredProductos}
              />
            )}

            {filteredProductos.length === 0 && !loading && (
              <p>No hay productos disponibles para la bodega seleccionada.</p>
            )}
          </div>
        }
      />
    </ProtectedRoute>
  );
}
