import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import TableInformation from "../ui/TableInformation";
import ExcelExporter from "../ui/ExcelExporter";
import PDFExporter from "../ui/PDFExporter";
import InfoIcon from "../ui/InfoIcon";

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
  sucursal_id: number;
  business_nombre: string;
  branch_nombre: string;
}

type Warehouse = {
  bodega_id: number;
  codigo: string;
  sucursal_id: number;
  branch: {
    nombre: string;
    business: {
      nombre_comercial: string;
    };
  };
};

type Branch = {
  sucursal_id: number;
  nombre: string;
  business: {
    nombre_comercial: string;
  };
};

export default function ProductReports() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [selectedBodega, setSelectedBodega] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos, bodegas y sucursales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [productosRes, warehousesRes, branchesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/v1/warehouses`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/v1/branches`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);

        // Mapear productos para incluir negocio, sucursal y código de bodega
        const mappedProductos: Producto[] = productosRes
          .filter((p: any) => p.stock > 0)
          .map((p: any) => {
            const warehouse = warehousesRes.find(
              (w: Warehouse) => w.bodega_id === p.bodega_id
            );
            return {
              ...p,
              business_nombre:
                warehouse?.branch.business.nombre_comercial || "",
              branch_nombre: warehouse?.branch.nombre || "",
              sucursal_id: warehouse?.sucursal_id || null,
              codigo: warehouse?.codigo || "", // <-- código real de la bodega
            };
          });

        setProductos(mappedProductos);
        setWarehouses(warehousesRes);
        setBranches(branchesRes);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos. Por favor, intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lista de negocios
  const businessList = Array.from(
    new Set(productos.map((p) => p.business_nombre).filter(Boolean))
  );

  // Lista de sucursales del negocio seleccionado
  const branchList = branches.filter(
    (b) => b.business.nombre_comercial === selectedBusiness
  );

  // Lista de bodegas según sucursales del negocio
  const warehouseList = warehouses.filter(
    (w) =>
      selectedBusiness &&
      branchList.some((b) => b.sucursal_id === w.sucursal_id)
  );

  // Filtrado de productos
  const filteredProductos = productos.filter((p) => {
    if (selectedBusiness && p.business_nombre !== selectedBusiness)
      return false;
    if (selectedBodega && p.bodega_id !== selectedBodega) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedBusiness(null);
    setSelectedBodega(null);
  };

  const tableHeaders = [
    "codigo_producto",
    "nombre_producto",
    "categoria",
    "stock",
    "precio_compra",
    "precio_venta",
    "business_nombre",
    "branch_nombre",

    "codigo", // <-- aquí mostramos el código de bodega en la tabla
  ];
  

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
      <Container
        page={
          <div className="w-full md:w-auto px-2 md:px-10 mx-auto flex flex-col">
            <h1 className="text-3xl font-bold mb-6 mt-6">
              Reporte de productos
              <InfoIcon
                title="Reporte de Productos"
                description="En este módulo puedes generar reportes de productos filtrados por negocio y bodega. Selecciona un negocio y una bodega para ver los productos correspondientes. También puedes exportar los datos a Excel o PDF."
              />
            </h1>

            {loading && <p>Cargando...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && businessList.length > 0 && (
              <div className="flex flex-wrap items-end gap-4 mb-6">
                {/* Filtro negocio */}
                <div className="flex flex-col">
                  <label className="block mb-1 font-semibold">Negocio:</label>
                  <select
                    className="border px-3 py-2 rounded min-w-[180px] cursor-pointer"
                    value={selectedBusiness || ""}
                    onChange={(e) => {
                      setSelectedBusiness(e.target.value || null);
                      setSelectedBodega(null);
                    }}
                  >
                    <option value="">-- Todos --</option>
                    {businessList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro bodega */}
                {selectedBusiness && warehouseList.length > 0 && (
                  <div className="flex flex-col">
                    <label className="block mb-1 font-semibold">Bodega:</label>
                    <select
                      className="border px-3 py-2 rounded min-w-[180px] cursor-pointer"
                      value={selectedBodega || ""}
                      onChange={(e) =>
                        setSelectedBodega(Number(e.target.value) || null)
                      }
                    >
                      <option value="">seleccione una bodega</option>
                      {warehouseList.map((w) => (
                        <option key={w.bodega_id} value={w.bodega_id}>
                          {w.codigo} - {w.branch.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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

            {/* Exportadores */}
            {filteredProductos.length > 0 && (
              <div className="mb-4 flex gap-4">
                <ExcelExporter
                  data={filteredProductos}
                  headers={tableHeaders}
                  fileName={`Productos_${selectedBusiness || "Todos"}.xlsx`}
                />
                <PDFExporter
                  data={filteredProductos}
                  headers={tableHeaders}
                  fileName={`Productos_${selectedBusiness || "Todos"}.pdf`}
                  reportTitle={`Reporte de Productos - ${selectedBusiness || "Todos"}`}
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
              <p>No hay productos disponibles para el filtro seleccionado.</p>
            )}
          </div>
        }
      />
    </ProtectedRoute>
  );
}
