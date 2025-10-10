import React from "react";
import { IoPencil } from "react-icons/io5";
import Button from "../Button";

type Producto = {
  id?: number;
  codigo_producto: string;
  nombre_producto: string;
  precio_venta: number;
  stock?: number;
};

interface CartItemType {
  producto: Producto;
  cantidad: number;
  descuento: number;
}

interface CartTableProps {
  carrito: CartItemType[];
  editIdx: number | null;
  editCantidad: number;
  setEditCantidad: (val: number) => void;
  editDescuento: number;
  setEditDescuento: (val: number) => void;
  iniciarEdicion: (idx: number) => void;
  guardarEdicion: (idx: number) => void;
  eliminarDelCarrito: (codigo: string) => void;
  setCarrito: React.Dispatch<React.SetStateAction<CartItemType[]>>;
  clienteSeleccionado: any;
  setFacturaModal: (val: boolean) => void;
}

export default function CartTable({
  carrito,
  editIdx,
  editCantidad,
  setEditCantidad,
  editDescuento,
  setEditDescuento,
  iniciarEdicion,
  guardarEdicion,
  eliminarDelCarrito,
  setCarrito,
  clienteSeleccionado,
  setFacturaModal,
}: CartTableProps) {
  // Totales
  const subtotal = carrito.reduce(
    (acc, item) => acc + item.producto.precio_venta * item.cantidad,
    0
  );

  const totalDescuento = carrito.reduce(
    (acc, item) =>
      acc +
      (item.producto.precio_venta * item.cantidad * Math.max(0, Math.min(item.descuento, 100))) / 100,
    0
  );

  const totalAPagar = (subtotal - totalDescuento) * 1.13; // con impuestos 13%

  return (
    <div>
      {/* Tabla carrito */}
      <div className="shadow-md rounded-lg mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Código</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Nombre</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Cantidad</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Precio</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Descuento %</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Descuento ₡</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Total</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carrito.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Sin productos
                </td>
              </tr>
            ) : (
              carrito.map((item, idx) => (
                <CartItem
                  key={idx}
                  item={item}
                  idx={idx}
                  editIdx={editIdx}
                  editCantidad={editCantidad}
                  setEditCantidad={setEditCantidad}
                  editDescuento={editDescuento}
                  setEditDescuento={setEditDescuento}
                  iniciarEdicion={iniciarEdicion}
                  guardarEdicion={guardarEdicion}
                  eliminarDelCarrito={eliminarDelCarrito}
                />
              ))
            )}
          </tbody>
        </table>

        {/* Aplicar mismo descuento a todo */}
        {carrito.length > 0 && (
          <div className="mt-1 py-5 px-5 flex justify-end gap-2 bg-gris-ultra-claro">
            <label className="text-gray-700 font-semibold">Aplicar mismo descuento a todo:</label>
            <select
              onChange={(e) => {
                const pct = Number(e.target.value);
                setCarrito((prev) => prev.map((item) => ({ ...item, descuento: pct })));
              }}
              className="border rounded px-2 py-1 w-20"
              defaultValue={0}
            >
              {Array.from({ length: 21 }, (_, i) => i * 5).map((pct) => (
                <option key={pct} value={pct}>
                  {pct}%
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pie carrito */}
      <div className="flex justify-end items-center bg-azul-oscuro text-white px-10 py-4 rounded-lg">
        <div className="flex-1">
          <div>Costo antes de descuento: ₡{subtotal.toLocaleString()}</div>
          <div>Descuento total: ₡{totalDescuento.toLocaleString()}</div>
          <div>Impuestos: ₡{Math.round((subtotal - totalDescuento) * 0.13).toLocaleString()}</div>
          <div className="text-lg font-bold">Total a pagar: ₡{Math.round(totalAPagar).toLocaleString()}</div>
        </div>

        <Button
          text="Pagar"
          style="bg-azul-medio hover:bg-azul-hover text-white px-8 py-3 rounded text-lg font-bold cursor-pointer"
          onClick={() => setFacturaModal(true)}
          disabled={carrito.length === 0 || !clienteSeleccionado}
        />
      </div>
    </div>
  );
}

// --- Componente CartItem ---
const CartItem = ({
  item,
  idx,
  editIdx,
  editCantidad,
  setEditCantidad,
  editDescuento,
  setEditDescuento,
  iniciarEdicion,
  guardarEdicion,
  eliminarDelCarrito,
}: {
  item: CartItemType;
  idx: number;
  editIdx: number | null;
  editCantidad: number;
  setEditCantidad: (val: number) => void;
  editDescuento: number;
  setEditDescuento: (val: number) => void;
  iniciarEdicion: (idx: number) => void;
  guardarEdicion: (idx: number) => void;
  eliminarDelCarrito: (codigo: string) => void;
}) => {
  const descuentoPct = Math.max(0, Math.min(item.descuento, 100));
  const totalItem = item.producto.precio_venta * item.cantidad * (1 - descuentoPct / 100);
  const descuentoColones = Math.round((item.producto.precio_venta * item.cantidad * descuentoPct) / 100);

  return (
    <tr>
      <td className="px-3 py-3">{item.producto.codigo_producto}</td>
      <td className="px-3 py-3">{item.producto.nombre_producto}</td>
      <td className="px-3 py-3">
        {editIdx === idx ? (
          <input
            type="number"
            min={1}
            value={editCantidad}
            onChange={(e) => setEditCantidad(Math.max(1, Number(e.target.value)))}
            className="border rounded px-2 py-1 w-16"
          />
        ) : (
          item.cantidad
        )}
      </td>
      <td className="px-3 py-3">{item.producto.precio_venta}</td>
      <td className="px-3 py-3">
        {editIdx === idx ? (
          <select
            value={editDescuento}
            onChange={(e) => setEditDescuento(Number(e.target.value))}
            className="border rounded px-2 py-1 w-20"
          >
            {Array.from({ length: 21 }, (_, i) => i * 5).map((pct) => (
              <option key={pct} value={pct}>
                {pct}%
              </option>
            ))}
          </select>
        ) : (
          `${descuentoPct}%`
        )}
      </td>
      <td className="px-3 py-3">₡{descuentoColones.toLocaleString()}</td>
      <td className="px-3 py-3">{Math.round(totalItem)}</td>
      <td className="px-3 py-3 flex gap-2">
        {editIdx === idx ? (
          <>
            <Button text="Guardar" style="bg-verde-claro text-white px-2 py-1 rounded" onClick={() => guardarEdicion(idx)} />
            <Button text="Cancelar" style="bg-gris-claro text-white px-2 py-1 rounded" onClick={() => iniciarEdicion(-1)} />
          </>
        ) : (
          <>
            <Button text="Editar" style="bg-amarillo-claro text-white px-2 py-1 rounded flex items-center gap-1" onClick={() => iniciarEdicion(idx)}>
              <IoPencil />
            </Button>
            <Button text="Eliminar" style="bg-rojo-claro text-white px-2 py-1 rounded" onClick={() => eliminarDelCarrito(item.producto.codigo_producto)} />
          </>
        )}
      </td>
    </tr>
  );
};
