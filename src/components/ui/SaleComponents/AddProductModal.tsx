import React from "react";
import { IoAddCircle } from "react-icons/io5";
import Button from "../Button";

import type { Producto } from "../../pages/SalesPage";

interface AddProductModalProps {
  productoSeleccionado: Producto;
  cantidadSeleccionada: number;
  setCantidadSeleccionada: (cantidad: number) => void;
  getAvailableStock: (codigo: string) => number;
  setModalOpen: (open: boolean) => void;
  agregarAlCarrito: (producto: Producto, cantidad: number) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  productoSeleccionado,
  cantidadSeleccionada,
  setCantidadSeleccionada,
  getAvailableStock,
  setModalOpen,
  agregarAlCarrito,
}) => {
  const stockDisponible = getAvailableStock(productoSeleccionado.codigo_producto);
// 🔹 Formatear el precio con colones y 1 decimal
  const precioFormateado = `₡${Number(productoSeleccionado.precio_venta).toLocaleString("es-CR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        
        <h2 className="text-xl font-bold mb-4">Añadir producto</h2>
        <p><strong>Código:</strong> {productoSeleccionado.codigo_producto}</p>
        <p><strong>Nombre:</strong> {productoSeleccionado.nombre_producto}</p>
         <p><strong>Precio:</strong> {precioFormateado}</p>
        <p><strong>Stock disponible:</strong> {stockDisponible}</p>

        {/* Input cantidad */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Cantidad:</label>
          <input
            type="number"
            min={1}
            max={stockDisponible}
            value={cantidadSeleccionada}
            onChange={(e) =>
              setCantidadSeleccionada(
                Math.min(stockDisponible, Math.max(1, Number(e.target.value)))
              )
            }
            className="border rounded px-3 py-2 w-24 mt-1"
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-4 py-2 rounded flex items-center gap-1 cursor-pointer"
            onClick={() => {
              agregarAlCarrito(productoSeleccionado, cantidadSeleccionada);
              setModalOpen(false);
              setCantidadSeleccionada(1);
            }}
            disabled={stockDisponible <= 0}
          >
            <IoAddCircle /> Agregar
          </Button>
          <Button
            style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold px-4 py-2 rounded cursor-pointer"
            onClick={() => {
              setModalOpen(false);
              setCantidadSeleccionada(1);
            }}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
