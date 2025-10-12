
import { IoAddCircle, IoSearch } from "react-icons/io5";
import Button from "../Button";

// Tipos unificados con los que usas en SalesPage
type Producto = {
  id?: number;
  codigo_producto: string;
  nombre_producto: string;
  categoria?: string;
  descripcion?: string;
  stock?: number;
  precio_compra?: number;
  precio_venta: number;
  bodega?: string;
  bodega_id?: number;
};

type Sucursal = {
  sucursal_id: number;
  nombre: string; // coincide con SalesPage
};

type Warehouse = {
  bodega_id: number;
  nombre_bodega: string;
  sucursal_id: number;
};

interface ProductSelectorProps {
  productos: Producto[];
  carrito: { producto: Producto; cantidad: number; descuento: number }[];
  queryProducto: string;
  setQueryProducto: (q: string) => void;
  productoSeleccionado: Producto | null;
  setProductoSeleccionado: (p: Producto | null) => void;
  setModalOpen: (open: boolean) => void;
  sucursalSeleccionada: Sucursal | null;
  bodegas: Warehouse[];
}

export default function ProductSelector({
  productos,
  carrito,
  queryProducto,
  setQueryProducto,
  productoSeleccionado,
  setProductoSeleccionado,
  setModalOpen,
  sucursalSeleccionada,
  bodegas,
}: ProductSelectorProps) {
  // 🔎 Filtrado por sucursal + bodegas de esa sucursal + query
  const productosFiltrados = productos.filter((producto) => {
    if (!sucursalSeleccionada || !producto.bodega_id) return false;

    const bodega = bodegas.find((b) => b.bodega_id === producto.bodega_id);

    // solo productos de bodegas que pertenecen a la sucursal seleccionada
    if (!bodega || bodega.sucursal_id !== sucursalSeleccionada.sucursal_id) {
      return false;
    }

    // aplicar filtro de búsqueda
    if (queryProducto.trim()) {
      const q = queryProducto.toLowerCase();
      return (
        producto.nombre_producto.toLowerCase().includes(q) ||
        producto.codigo_producto.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const getAvailableStock = (producto: Producto) => {
    const enCarrito = carrito.find(
      (i) => i.producto.codigo_producto === producto.codigo_producto
    );
    return (producto.stock ?? 0) - (enCarrito?.cantidad ?? 0);
  };

  return (
    <div className="shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Productos</h2>

      {/* Input con lupa */}
      <div className="relative mb-2">
        <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
        <input
          type="text"
          placeholder="Buscar producto por código o nombre..."
          className="border rounded pl-10 pr-3 py-2 w-full"
          value={queryProducto}
          onChange={(e) => setQueryProducto(e.target.value)}
        />
      </div>

      {/* Dropdown */}
      {queryProducto && (
        <div className="max-h-40 overflow-y-auto border rounded bg-white">
          {productosFiltrados.length === 0 && (
            <p className="px-4 py-2 text-rojo-claro text-sm">
              No existe ningún producto en esta sucursal con ese código o nombre.
            </p>
          )}

          {productosFiltrados.map((producto) => {
            const stockDisponible = getAvailableStock(producto);

            return (
              <ProductItem
                key={producto.codigo_producto}
                producto={producto}
                stockDisponible={stockDisponible}
                seleccionado={
                  productoSeleccionado?.codigo_producto ===
                  producto.codigo_producto
                }
                onSelect={() => {
                  setProductoSeleccionado(producto);
                  setQueryProducto("");
                }}
                onAdd={() => setModalOpen(true)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Item ---
const ProductItem = ({
  producto,
  stockDisponible,
  seleccionado,
  onSelect,
  onAdd,
}: {
  producto: Producto;
  stockDisponible: number;
  seleccionado: boolean;
  onSelect: () => void;
  onAdd: () => void;
}) => (
  <div
    className={`px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-gris-ultra-claro ${
      seleccionado ? "bg-white font-bold" : ""
    }`}
    onClick={onSelect}
  >
    <div className="flex-1">
      <span>{producto.nombre_producto}</span>{" "}
      <span className="text-gray-500">({producto.codigo_producto})</span>
    </div>

    <div
      className={`ml-4 px-2 py-1 rounded text-sm font-medium ${
        stockDisponible > 0
          ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro border"
          : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
      }`}
    >
      Stock: {stockDisponible}
    </div>

    <Button
      style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-3 py-1 rounded ml-4 flex items-center cursor-pointer"
      onClick={onAdd}
      disabled={stockDisponible <= 0}
    >
      <IoAddCircle className="mr-1" /> Añadir
    </Button>
  </div>
);
