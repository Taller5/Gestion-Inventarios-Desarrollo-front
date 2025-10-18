// Después
import { useState, useEffect } from "react";
import { IoAddCircle, IoSearch } from "react-icons/io5";
import Button from "../Button";
import type { Caja } from "../../../types/salePage";

// Tipos
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
  nombre: string;
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
   cajaSeleccionada: Caja | null;
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
  cajaSeleccionada,
  bodegas,
}: ProductSelectorProps) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [verificandoCaja, setVerificandoCaja] = useState(true); //  Nuevo estado para control de carga

  const [cajaAbierta, setCajaAbierta] = useState<boolean | null>(null);

  //  Modal de alerta interno
  const [alerta, setAlerta] = useState<{ mensaje: string; tipo: "error" | "info" } | null>(null);
  const mostrarAlerta = (mensaje: string, tipo: "error" | "info" = "info") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 2000);
  };

 // Verificar si hay caja abierta
  useEffect(() => {
    const verificarCaja = async () => {
      if (!sucursalSeleccionada) return setVerificandoCaja(false);

      setVerificandoCaja(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/api/v1/cashbox/active/${sucursalSeleccionada.sucursal_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Error al verificar caja");
        const data = await res.json();
        setCajaAbierta(data.abierta);
      } catch (error) {
        console.error("Error al verificar caja:", error);
        setCajaAbierta(false);
      } finally {
        setVerificandoCaja(false);
      }
    };
    verificarCaja();
  }, [sucursalSeleccionada]);

  // Mostrar alerta si no hay caja después de verificar
  useEffect(() => {
    if (!verificandoCaja && (!cajaSeleccionada || cajaAbierta === false)) {
      mostrarAlerta("Debe seleccionar y abrir una caja antes de vender", "error");
    }
  }, [verificandoCaja, cajaAbierta, cajaSeleccionada]);



  //  Filtrado por sucursal + bodegas de esa sucursal + query
  const productosFiltrados = productos.filter((producto) => {
    if (!sucursalSeleccionada || !producto.bodega_id) return false;
    const bodega = bodegas.find((b) => b.bodega_id === producto.bodega_id);
    if (!bodega || bodega.sucursal_id !== sucursalSeleccionada.sucursal_id)
      return false;

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
    <div className="shadow-md rounded-lg p-4 mb-6 relative">
      <h2 className="text-lg font-bold mb-2">Productos</h2>

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
  seleccionado={productoSeleccionado?.codigo_producto === producto.codigo_producto}
  onSelect={() => {
    setProductoSeleccionado(producto);
    setQueryProducto("");
  }}
  onAdd={() => {
    // Alertas según estado de la caja
    if (!cajaSeleccionada || cajaAbierta === false) {
      mostrarAlerta("Debe seleccionar y abrir una caja antes de vender", "error");
      return;
    }
    if (cajaAbierta === null) {
      mostrarAlerta("Verificando caja, espere...", "info");
      return;
    }
    setModalOpen(true);
  }}
  cajaAbierta={cajaAbierta}
  cajaSeleccionada={cajaSeleccionada}
  verificandoCaja={verificandoCaja}
/>


            );
          })}
        </div>
      )}

      {/* Modal de alerta */}
      {alerta && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg font-semibold shadow-md z-50 ${
            alerta.tipo === "error"
              ? "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
              : "bg-azul-ultra-claro text-azul-oscuro border-azul-claro border"
          }`}
        >
          {alerta.mensaje}
        </div>
      )}
    </div>
  );
}

const ProductItem = ({
  producto,
  stockDisponible,
  seleccionado,
  onSelect,
  onAdd,
  cajaAbierta,
  cajaSeleccionada,
  verificandoCaja,
}: {
  producto: Producto;
  stockDisponible: number;
  seleccionado: boolean;
  onSelect: () => void;
  onAdd: () => void;
  cajaAbierta: boolean | null;
  cajaSeleccionada: Caja | null;
  verificandoCaja: boolean;
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
      disabled={
        stockDisponible <= 0 ||
        verificandoCaja ||
        !cajaSeleccionada ||
        cajaAbierta === false
      }
    >
      {verificandoCaja ? (
        <span className="animate-spin mr-1">⏳</span>
      ) : (
        <IoAddCircle className="mr-1" />
      )}
      Añadir
    </Button>
  </div>
);

