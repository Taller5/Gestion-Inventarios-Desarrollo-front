import { useState } from "react";
import Button from "../Button";
import GenerateInvoice, { type GenerateInvoiceRef } from "./GenerateInvoice";
import type { Producto, Customer, Sucursal } from "../../../types/salePage";

interface FacturaModalProps {
  facturaModal: boolean;
  setFacturaModal: (open: boolean) => void;
  carrito: { producto: Producto; cantidad: number; descuento: number }[];
  clienteSeleccionado: Customer | null;
  sucursalSeleccionada: Sucursal | null;
  user: any;
  metodoPago: string;
  setMetodoPago: (value: string) => void;
  montoEntregado: number;
  setMontoEntregado: (value: number) => void;
  comprobante: string;
  setComprobante: (value: string) => void;
  facturaCreada: any;
  invoiceRef: React.RefObject<GenerateInvoiceRef | null>;
  botonDisabled: boolean;
  finalizarVenta: (e?: React.FormEvent) => void;
  loadingSucursal?: boolean;
  errorSucursal?: string | null;
}

export default function FacturaModal({
  facturaModal,
  setFacturaModal,
  carrito,
  clienteSeleccionado,
  sucursalSeleccionada,
  user,
  metodoPago,
  setMetodoPago,
  montoEntregado,
  setMontoEntregado,
  comprobante,
  setComprobante,
  facturaCreada,
  invoiceRef,
  botonDisabled,
  finalizarVenta,
  loadingSucursal,
  errorSucursal,
}: FacturaModalProps) {
  if (!facturaModal) return null;

  const [processing, setProcessing] = useState(false); // ⚡ Estado para bloquear doble click

  const handleFinalizar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (processing) return; // ⚡ Evita doble clic
    setProcessing(true);
    try {
      await finalizarVenta(e);
    } finally {
      setProcessing(false); // ⚡ Libera el botón al finalizar
    }
  };

  const subtotal = carrito.reduce(
    (acc, item) => acc + item.producto.precio_venta * item.cantidad,
    0
  );
  const totalDescuento = carrito.reduce(
    (acc, item) =>
      acc + (item.producto.precio_venta * item.cantidad * (item.descuento || 0)) / 100,
    0
  );
  const subtotalConDescuento = subtotal - totalDescuento;
  const impuestos = +(subtotalConDescuento * 0.13).toFixed(2);
  const total = subtotalConDescuento + impuestos;
  const vuelto = metodoPago === "Efectivo" ? Math.max(0, montoEntregado - total) : 0;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-6">
    {/* Fondo semitransparente */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>

    <form
      onSubmit={handleFinalizar}
      className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl sm:max-w-2xl p-4 sm:p-8 overflow-y-auto max-h-[90vh]"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Proceso de facturación
      </h2>

      {/* CLIENTE, SUCURSAL Y USUARIO */}
      <div className="mb-4 text-sm sm:text-base space-y-1">
        <div><strong>Cliente:</strong> {clienteSeleccionado?.name || "-"}</div>
        <div><strong>Cédula:</strong> {clienteSeleccionado?.identity_number || "-"}</div>

        {loadingSucursal ? (
          <p>Cargando sucursal y negocio...</p>
        ) : errorSucursal ? (
          <p className="text-red-500">{errorSucursal}</p>
        ) : sucursalSeleccionada ? (
          <>
            <div><strong>Negocio:</strong> {sucursalSeleccionada.business.nombre_comercial}</div>
            <div><strong>Nombre Legal:</strong> {sucursalSeleccionada.business.nombre_legal}</div>
            <div><strong>Teléfono:</strong> {sucursalSeleccionada.business.telefono || "-"}</div>
            <div><strong>Email:</strong> {sucursalSeleccionada.business.email || "-"}</div>
            <div><strong>Provincia:</strong> {sucursalSeleccionada.provincia || "-"}</div>
            <div><strong>Cantón:</strong> {sucursalSeleccionada.canton || "-"}</div>
            <div><strong>Sucursal:</strong> {sucursalSeleccionada.nombre}</div>
          </>
        ) : null}

        <div><strong>Cajero:</strong> {user.name || user.username}</div>
        <div><strong>Fecha:</strong> {new Date().toLocaleString()}</div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-gray-300 min-w-[600px] sm:min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 border">Código</th>
              <th className="px-2 py-1 border">Producto</th>
              <th className="px-2 py-1 border">Cantidad</th>
              <th className="px-2 py-1 border">Precio Unitario</th>
              <th className="px-2 py-1 border">Descuento</th>
              <th className="px-2 py-1 border">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item, idx) => {
              const descuentoPct = Math.max(0, Math.min(item.descuento || 0, 100));
              const subtotalItem =
                item.producto.precio_venta * item.cantidad * (1 - descuentoPct / 100);
              return (
                <tr key={idx}>
                  <td className="px-2 py-1 border">{item.producto.codigo_producto}</td>
                  <td className="px-2 py-1 border">{item.producto.nombre_producto}</td>
                  <td className="px-2 py-1 border">{item.cantidad}</td>
                  <td className="px-2 py-1 border">₡{item.producto.precio_venta}</td>
                  <td className="px-2 py-1 border">{descuentoPct}%</td>
                  <td className="px-2 py-1 border">₡{Math.round(subtotalItem)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* TOTALES */}
      <div className="mb-4 text-right text-sm sm:text-base space-y-1">
        <div><strong>Subtotal:</strong> ₡{subtotal}</div>
        <div><strong>Total Descuento:</strong> ₡{Math.round(totalDescuento)}</div>
        <div><strong>Impuestos:</strong> ₡{impuestos}</div>
        <div className="text-lg sm:text-xl font-bold"><strong>Total:</strong> ₡{Math.round(total)}</div>
        {metodoPago === "Efectivo" && (
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-verde-claro">
            <strong>Vuelto:</strong> ₡{vuelto.toFixed(2)}
          </div>
        )}
      </div>

      {/* MÉTODO DE PAGO */}
      <div className="flex flex-col sm:flex-row sm:gap-4 mb-6 gap-3">
        <div className="flex-1 flex flex-col">
          <label className="font-semibold mb-1">Método de Pago</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="SINPE">SINPE</option>
          </select>
        </div>

        {metodoPago === "Efectivo" && (
          <div className="flex-1 flex flex-col">
            <label className="font-semibold mb-1">Monto entregado</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={montoEntregado}
              onChange={(e) => setMontoEntregado(Number(e.target.value))}
              placeholder="Ingrese el monto entregado"
            />
          </div>
        )}

        {(metodoPago === "Tarjeta" || metodoPago === "SINPE") && (
          <div className="flex-1 flex flex-col">
            <label className="font-semibold mb-1">
              {metodoPago === "Tarjeta"
                ? "Comprobante / Voucher de tarjeta"
                : "Comprobante de transferencia / SINPE"}
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={comprobante}
              onChange={(e) => setComprobante(e.target.value)}
              placeholder={
                metodoPago === "Tarjeta"
                  ? "Ingrese el voucher o comprobante de la tarjeta"
                  : "Ingrese el comprobante de la transferencia o SINPE"
              }
            />
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <div style={{ display: "none" }}>
          <GenerateInvoice
            ref={invoiceRef}
            sucursalSeleccionada={sucursalSeleccionada}
            clienteSeleccionado={clienteSeleccionado}
            carrito={carrito}
            user={user}
            metodoPago={metodoPago}
            montoEntregado={montoEntregado}
            comprobante={comprobante}
            facturaCreada={facturaCreada}
          />
        </div>

        <Button
          text={processing ? "Procesando..." : "Finalizar"}
          disabled={botonDisabled || processing}
          onClick={handleFinalizar}
          style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold px-6 sm:px-8 py-2 sm:py-3 rounded text-lg sm:text-lg w-full sm:w-36 cursor-pointer"
        />
        <Button
          text="Cancelar"
          onClick={() => setFacturaModal(false)}
          style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 sm:px-8 py-2 sm:py-3 rounded text-lg sm:text-lg w-full sm:w-36 cursor-pointer"
        />
      </div>
    </form>
  </div>
);

}
