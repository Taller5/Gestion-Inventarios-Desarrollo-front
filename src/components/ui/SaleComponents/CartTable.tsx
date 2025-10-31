import React, { useState } from "react";
import { IoPencil } from "react-icons/io5";
import { BsCash } from "react-icons/bs";
import { FaTrash } from "react-icons/fa6";
import Button from "../Button";
import PromotionsButton from "../SaleComponents/PromotionsButton";
import { useEffect } from "react";

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
  infoPromo?: string | { id: number; descripcion: string; cantidadAplicada: number };
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
  businessId?: number;
  branch_id?: number;
  clienteType?: string
}

const API_URL = import.meta.env.VITE_API_URL;
// --- Helper para formatear números ---
const formatMoney = (amount: number) =>
  `₡${amount.toLocaleString("es-CR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}`;

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
  businessId,
  branch_id,
  clienteType
}: CartTableProps) {
  const subtotal = carrito.reduce(
    (acc, item) => acc + item.producto.precio_venta * item.cantidad,
    0
  );

  const totalDescuento = carrito.reduce(
    (acc, item) =>
      acc +
      (item.producto.precio_venta *
        item.cantidad *
        Math.max(0, Math.min(item.descuento, 100))) /
        100,
    0
  );

  const totalAPagar = (subtotal - totalDescuento) * 1.13;
  const [alertPromo, setAlertPromo] = useState<string | null>(null);

 // --- Fetch promociones activas para la sucursal ---
  useEffect(() => {
    if (!businessId || !clienteType || clienteType === "Cliente genérico") return;

    const fetchPromotions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/api/v1/promotions/active?business_id=${businessId}${
            branch_id ? `&branch_id=${branch_id}` : ""
          }`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${res.status}`);
        }

        const data = await res.json();
        if (data && data.length > 0) {
          setAlertPromo("Esta sucursal tiene promociones activas. Revisa si alguna aplica para ti.");
          const timer = setTimeout(() => setAlertPromo(null), 10000); // se quita a los 6s
          return () => clearTimeout(timer);
        }
      } catch (err: any) {
        console.error("Error al cargar promociones:", err);
      }
    };

    fetchPromotions();
  }, [businessId, branch_id, clienteType]);





  return (
    <div className="w-full">
           {/* --- Alert de promociones --- */}
      {alertPromo && (
        <div className="fixed bottom-6 right-6 px-4 py-2 rounded-lg font-semibold shadow-md bg-amarillo-claro text-white border border-amarillo-oscuro">
          {alertPromo}
        </div>
      )}
      {/* --- Tabla Desktop --- */}
      <div className="hidden md:block shadow-md rounded-lg mb-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                Código
              </th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                Nombre
              </th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                Cantidad
              </th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                Precio c/u
              </th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                Descuento %
              </th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                Descuento ₡
              </th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                Total₡
              </th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                Acciones
              </th>
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

        {carrito.length > 0 && (
          <div className="mt-1 py-5 px-5 flex justify-end gap-2 bg-gris-ultra-claro">
            <label className="text-gray-700 font-semibold">
              Aplicar mismo descuento a todo:
            </label>
            <select
              onChange={(e) => {
                const pct = Number(e.target.value);
                setCarrito((prev) =>
                  prev.map((item) => ({ ...item, descuento: pct }))
                );
              }}
              className="border rounded px-2 py-1 w-20 cursor-pointer"
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

      {/* --- Cards Mobile --- */}
      <div className="md:hidden flex flex-col gap-4">
        {carrito.length === 0 ? (
          <div className="text-center py-4 bg-white shadow rounded-lg">
            Sin productos
          </div>
        ) : (
          carrito.map((item, idx) => {
            const descuentoPct = Math.max(0, Math.min(item.descuento, 100));
            const totalItem =
              item.producto.precio_venta *
              item.cantidad *
              (1 - descuentoPct / 100);
            const descuentoColones = Math.round(
              (item.producto.precio_venta * item.cantidad * descuentoPct) / 100
            );
            const precioVenta = Number(item.producto.precio_venta) || 0;

            return (
              <div
                key={idx}
                className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-2"
              >
              
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Código:</span>
                  <span className="text-gray-600">
                    {item.producto.codigo_producto}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Nombre:</span>
                  <span className="text-gray-600">
                    {item.producto.nombre_producto}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Cantidad:</span>
                  {editIdx === idx ? (
                    <input
                      type="number"
                      min={1}
                      value={editCantidad}
                      onChange={(e) =>
                        setEditCantidad(Math.max(1, Number(e.target.value)))
                      }
                      className="border rounded px-2 py-1 w-16"
                    />
                  ) : (
                    <span className="text-gray-600">{item.cantidad}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">
                    Precio c/u:
                  </span>
                  <span className="text-gray-600">
                    {formatMoney(precioVenta)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">
                    Descuento %:
                  </span>
                  {editIdx === idx ? (
                    <select
                      value={editDescuento}
                      onChange={(e) => setEditDescuento(Number(e.target.value))}
                      className="border rounded px-2 py-1 w-20"
                    >
                      {Array.from({ length: 21 }, (_, i) => i * 5).map(
                        (pct) => (
                          <option key={pct} value={pct}>
                            {pct}%
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <span className="text-gray-600">{`${descuentoPct}%`}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">
                    Descuento ₡:
                  </span>
                  <span className="text-gray-600">
                    {formatMoney(descuentoColones)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Total ₡:</span>
                  <span className="text-gray-600">
                    {formatMoney(totalItem)}
                  </span>
                </div>

                {/* Botones acciones */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {editIdx === idx ? (
                    <>
                      <Button
                        text="Guardar"
                        style="bg-verde-claro text-white px-2 py-1 rounded"
                        onClick={() => guardarEdicion(idx)}
                      />
                      <Button
                        text="Cancelar"
                        style="bg-gris-claro text-white px-2 py-1 rounded"
                        onClick={() => iniciarEdicion(-1)}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        text="Editar"
                        style="bg-amarillo-claro hover:bg-amarillo-oscuro text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                        onClick={() => iniciarEdicion(idx)}
                      >
                        <IoPencil className="m-1" />
                      </Button>
                      <Button
                        style="bg-rojo-claro hover:bg-rojo-oscuro text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                        onClick={() =>
                          eliminarDelCarrito(item.producto.codigo_producto)
                        }
                      >
                        <FaTrash className="m-1" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- Footer Totales y Pagar --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-azul-oscuro text-white px-6 py-4 rounded-lg mt-4">
        <div className="flex-1 flex flex-col gap-1">
          <div>Costo antes de descuento: {formatMoney(subtotal)}</div>
          <div>Descuento total: {formatMoney(totalDescuento)}</div>
          <div>Impuestos: {formatMoney((subtotal - totalDescuento) * 0.13)}</div>
          <div className="text-lg font-bold">Total a pagar: {formatMoney(totalAPagar)}</div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* PromotionsButton ahora recibe solo el businessId */}
              {businessId && (
                <PromotionsButton
                  businessId={businessId}
                  branchId={branch_id}
                  carrito={carrito}
                  setCarrito={setCarrito}
                  disabled={clienteType === "Cliente genérico"}
                />
              )}




          <Button
            style="bg-azul-medio hover:bg-azul-hover text-white px-8 py-3 rounded text-lg font-bold cursor-pointer w-full md:w-auto"
            onClick={() => setFacturaModal(true)}
            disabled={carrito.length === 0 || !clienteSeleccionado}
          >
            <BsCash className="mr-2.5" size={20} /> Pagar
          </Button>
        </div>
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
  const totalItem =
    item.producto.precio_venta * item.cantidad * (1 - descuentoPct / 100);
  const descuentoColones = Math.round(
    (item.producto.precio_venta * item.cantidad * descuentoPct) / 100
  );
  const precioVenta = Number(item.producto.precio_venta) || 0;

  return (
    <tr className="hidden md:table-row">
      <td className="px-3 py-3">{item.producto.codigo_producto}</td>
      <td className="px-3 py-3">{item.producto.nombre_producto}</td>
      <td className="px-3 py-3">
        {editIdx === idx ? (
          <input
            type="number"
            min={1}
            value={editCantidad}
            onChange={(e) =>
              setEditCantidad(Math.max(1, Number(e.target.value)))
            }
            className="border rounded px-2 py-1 w-16"
          />
        ) : (
          item.cantidad
        )}
      </td>
      <td className="px-3 py-3">{formatMoney(precioVenta)}</td>
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
      <td className="px-3 py-3">{formatMoney(descuentoColones)}</td>
      <td className="px-3 py-3">{formatMoney(totalItem)}</td>
      <td className="px-3 py-3 flex gap-2">
        {editIdx === idx ? (
          <>
            <Button
              text="Guardar"
              style="bg-verde-claro text-white px-2 py-1 rounded"
              onClick={() => guardarEdicion(idx)}
            />
            <Button
              text="Cancelar"
              style="bg-gris-claro text-white px-2 py-1 rounded"
              onClick={() => iniciarEdicion(-1)}
            />
          </>
        ) : (
          <>
            <Button
              text="Editar"
              style="bg-amarillo-claro hover:bg-amarillo-oscuro text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
              onClick={() => iniciarEdicion(idx)}
            >
              <IoPencil className="m-1" />
            </Button>
            <Button
              style="bg-rojo-claro hover:bg-rojo-oscuro text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
              onClick={() => eliminarDelCarrito(item.producto.codigo_producto)}
            >
              <FaTrash className="m-1" />
            </Button>
          </>
        )}
      </td>
    </tr>
  );
};
