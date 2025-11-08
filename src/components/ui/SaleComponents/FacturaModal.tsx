import { useState, useEffect, useRef, } from "react";
import Button from "../Button";
import GenerateInvoice, { type GenerateInvoiceRef } from "./GenerateInvoice";
import type { Producto, Customer, Sucursal } from "../../../types/salePage";
// HACIENDA
 import SimpleModal from "../SimpleModal";
 import { generateInvoiceXml, submitInvoice, getInvoiceXmlStatus, type XmlStatus } from "../../../services/invoice.service";

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
  procesandoVenta: boolean;
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
  procesandoVenta,
}: FacturaModalProps) {
  if (!facturaModal) return null;

  const [processing, setProcessing] = useState(false); // Estado para bloquear doble click

  // HACIENDA
   const [confirmSendOpen, setConfirmSendOpen] = useState(false); // Confirmación post-finalizar
   const [xmlGenerating, setXmlGenerating] = useState(false);
   const [sending, setSending] = useState(false);
   const pollingRef = useRef<number | null>(null);
   const askedToSendRef = useRef(false);
   const [awaitingHaciendaPrompt, setAwaitingHaciendaPrompt] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  

  // Normaliza estados que pueden venir en español/inglés o con mayúsculas/minúsculas 
  const STATUS_MAP: Record<string, XmlStatus["status"]> = {
    ACEPTADO: "ACCEPTED",
    ACCEPTED: "ACCEPTED",
    RECHAZADO: "REJECTED",
    REJECTED: "REJECTED",
    RECIBIDO: "RECEIVED",
    RECEIVED: "RECEIVED",
    PROCESANDO: "PROCESSING",
    PROCESSING: "PROCESSING",
  };

  const normalizeStatus = (raw: string): XmlStatus["status"] => {
    const s = (raw || "").toString().trim().toUpperCase();
    return STATUS_MAP[s] ?? (s as XmlStatus["status"]);
  };

  //Intenta extraer el estado desde diferentes formas comunes del payload del backend
  //HACIENDA
   const extractRawStatus = (payload: any): string => {
     if (!payload) return "";
     const candidates = [
       payload.status,
       payload.estado,
       payload["ind-estado"],
       payload.ind_estado,
       payload.data?.status,
       payload.data?.estado,
       payload.data?.["ind-estado"],
       payload.data?.ind_estado,
       payload.result?.status,
       payload.result?.estado,
     ];
     const found = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
     return found ? (found as string) : "";
   };

  const handleFinalizar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (processing) return; // Evita doble clic

    // Validaciones por método de pago
    if (metodoPago === "Tarjeta" && !/^\d{6}$/.test(comprobante)) {
      setVoucherError("El voucher debe tener exactamente 6 dígitos.");
      return;
    } else if (metodoPago === "SINPE" && !/^\d{25}$/.test(comprobante)) {
      setVoucherError(
        "El comprobante SINPE debe tener exactamente 25 dígitos."
      );
      return;
    }
    setVoucherError(null);
    setProcessing(true);
    try {
      await finalizarVenta(e);
  // HACIENDA
  // Marcar que, cuando tengamos el id, debemos preguntar si enviamos a Hacienda
  setAwaitingHaciendaPrompt(true);
    } finally {
      setProcessing(false); // Libera el botón al finalizar
    }
  };
  
//HACIENDA
  // Limpia polling al cerrar modal
  useEffect(() => {
    if (!facturaModal) {
      // Limpia timers
      if (pollingRef.current) {
        window.clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
      // Reset flags y estados cuando se cierra el modal
      askedToSendRef.current = false;
      setAwaitingHaciendaPrompt(false);
      setConfirmSendOpen(false);
      setXmlGenerating(false);
      setSending(false);
    }
  }, [facturaModal]);

  
  // Abre confirmación en cuanto exista la factura y no se haya preguntado aún
  useEffect(() => {
    if (facturaModal && awaitingHaciendaPrompt && facturaCreada?.id && !askedToSendRef.current) {
      setConfirmSendOpen(true);
      askedToSendRef.current = true;
      setAwaitingHaciendaPrompt(false);
    }
  }, [facturaModal, awaitingHaciendaPrompt, facturaCreada?.id]);

  const pollStatus = async (invoiceId: number, attempt = 1) => {
    try {
      const status = await getInvoiceXmlStatus(invoiceId);
      const raw = extractRawStatus(status);
      const s = normalizeStatus(String(raw));

      if (s === "ACCEPTED" || s === "REJECTED") {
        setSending(false);
        return;
      }

      // Polling rápido al inicio, luego más espaciado
      // Intentos 1-10: 800ms; 11-20: 1500ms; >20: 3000ms
      let nextDelay = 800;
      if (attempt > 20) nextDelay = 3000;
      else if (attempt > 10) nextDelay = 1500;

      if (attempt >= 30) {
        // Deja en proceso y permite reintentar consulta
        setSending(false);
        return;
      }
      pollingRef.current = window.setTimeout(() => pollStatus(invoiceId, attempt + 1), nextDelay);
    } catch (err: any) {
      setSending(false);
    }
  };

  const handleEnviarAHacienda = async () => {
    if (!facturaCreada?.id || xmlGenerating || sending) return;
    try {
      setXmlGenerating(true);
      await generateInvoiceXml(facturaCreada.id);
      setXmlGenerating(false);

      // Enviar a Hacienda y luego consultar estado
  setSending(true);
      await submitInvoice(facturaCreada.id);
  await pollStatus(facturaCreada.id, 1);
    } catch (err: any) {
      setXmlGenerating(false);
      setSending(false);
    }
  };

  const subtotal = carrito.reduce(
    (acc, item) => acc + item.producto.precio_venta * item.cantidad,
    0
  );
  const totalDescuento = carrito.reduce(
    (acc, item) =>
      acc +
      (item.producto.precio_venta * item.cantidad * (item.descuento || 0)) /
        100,
    0
  );
  // 🔹 Formatea montos en colones con 1 decimal y separador de miles
  //  Versión segura del formateador
  const formatCurrency = (value: any): string => {
    const num = Number(value);
    if (isNaN(num)) return "₡0.0";
    return "₡" + num.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const subtotalConDescuento = subtotal - totalDescuento;
  const impuestos = +(subtotalConDescuento * 0.13).toFixed(2);
  const total = subtotalConDescuento + impuestos;
  const vuelto =
    metodoPago === "Efectivo" ? Math.max(0, montoEntregado - total) : 0;

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
          <div>
            <strong>Cliente:</strong> {clienteSeleccionado?.name || "-"}
          </div>
          <div>
            <strong>Cédula:</strong>{" "}
            {clienteSeleccionado?.identity_number || "-"}
          </div>

          {loadingSucursal ? (
            <p>Cargando sucursal y negocio...</p>
          ) : errorSucursal ? (
            <p className="text-red-500">{errorSucursal}</p>
          ) : sucursalSeleccionada ? (
            <>
              <div>
                <strong>Negocio:</strong>{" "}
                {sucursalSeleccionada.business.nombre_comercial}
              </div>
              <div>
                <strong>Nombre Legal:</strong>{" "}
                {sucursalSeleccionada.business.nombre_legal}
              </div>
              <div>
                <strong>Teléfono:</strong>{" "}
                {sucursalSeleccionada.business.telefono || "-"}
              </div>
              <div>
                <strong>Email:</strong>{" "}
                {sucursalSeleccionada.business.email || "-"}
              </div>
              <div>
                <strong>Provincia:</strong>{" "}
                {sucursalSeleccionada.provincia || "-"}
              </div>
              <div>
                <strong>Cantón:</strong> {sucursalSeleccionada.canton || "-"}
              </div>
              <div>
                <strong>Sucursal:</strong> {sucursalSeleccionada.nombre}
              </div>
            </>
          ) : null}

          <div>
            <strong>Cajero:</strong> {user.name || user.username}
          </div>
          <div>
            <strong>Fecha:</strong> {new Date().toLocaleString()}
          </div>
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
                const descuentoPct = Math.max(
                  0,
                  Math.min(item.descuento || 0, 100)
                );
                const subtotalItem =
                  item.producto.precio_venta *
                  item.cantidad *
                  (1 - descuentoPct / 100);
                return (
                  <tr key={idx}>
                    <td className="px-2 py-1 border">
                      {item.producto.codigo_producto}
                    </td>
                    <td className="px-2 py-1 border">
                      {item.producto.nombre_producto}
                    </td>
                    <td className="px-2 py-1 border">{item.cantidad}</td>
                    <td className="px-2 py-1 border">
                      {formatCurrency(item.producto.precio_venta)}
                    </td>
                    <td className="px-2 py-1 border">{descuentoPct}%</td>
                    <td className="px-2 py-1 border">
                      {formatCurrency(subtotalItem)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* TOTALES */}
        <div className="mb-4 text-right text-sm sm:text-base space-y-1">
          <div>
            <strong>Subtotal:</strong> {formatCurrency(subtotal)}
          </div>
          <div>
            <strong>Total Descuento:</strong> {formatCurrency(totalDescuento)}
          </div>
          <div>
            <strong>Impuestos:</strong> {formatCurrency(impuestos)}
          </div>
          <div className="text-lg sm:text-xl font-bold">
            <strong>Total:</strong> {formatCurrency(total)}
          </div>

          {metodoPago === "Efectivo" && (
            <div className="mt-2 text-xl sm:text-2xl font-extrabold text-verde-claro">
              <strong>Vuelto:</strong> {formatCurrency(vuelto)}
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
              onChange={(e) => {
                const val = e.target.value;
                setMetodoPago(val);
                // limpiar comprobante y advertencia al cambiar método
                setComprobante("");
                setVoucherError(null);
              }}
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
                inputMode={
                  metodoPago === "Tarjeta" || metodoPago === "SINPE"
                    ? "numeric"
                    : undefined
                }
                pattern={
                  metodoPago === "Tarjeta"
                    ? "\\d{6}"
                    : metodoPago === "SINPE"
                      ? "\\d{25}"
                      : undefined
                }
                maxLength={
                  metodoPago === "Tarjeta"
                    ? 6
                    : metodoPago === "SINPE"
                      ? 25
                      : undefined
                }
                minLength={
                  metodoPago === "Tarjeta"
                    ? 6
                    : metodoPago === "SINPE"
                      ? 25
                      : undefined
                }
                className="w-full border rounded px-3 py-2"
                value={comprobante}
                onChange={(e) => {
                  let v = e.target.value;
                  if (metodoPago === "Tarjeta") {
                    v = v.replace(/\D/g, "").slice(0, 6);
                  } else if (metodoPago === "SINPE") {
                    v = v.replace(/\D/g, "").slice(0, 25);
                  }
                  setComprobante(v);
                  if (
                    (metodoPago === "Tarjeta" && /^\d{6}$/.test(v)) ||
                    (metodoPago === "SINPE" && /^\d{25}$/.test(v))
                  ) {
                    setVoucherError(null);
                  }
                }}
                placeholder={
                  metodoPago === "Tarjeta"
                    ? "Ingrese el voucher o comprobante de la tarjeta"
                    : "Ingrese el comprobante de la transferencia o SINPE"
                }
              />
              {voucherError && (
                <span className="mt-1 text-xs text-red-600">
                  {voucherError}
                </span>
              )}
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
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-4">
            {/* Botón Finalizar */}
            <Button
              text={
                processing ? (
                  <>
                    <span className="flex items-center justify-center gap-2 w-full">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Procesando...</span>
                    </span>
                  </>
                ) : (
                  "Finalizar"
                )
              }
              disabled={botonDisabled || processing}
              onClick={handleFinalizar}
              style="flex items-center justify-center bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold px-6 sm:px-8 py-2 sm:py-3 rounded text-lg sm:text-lg w-full sm:w-36 cursor-pointer text-center"
            />

            {/* Botón Cancelar */}
            <Button
              text={
                procesandoVenta ? (
                  <>
                    <span className="flex items-center justify-center gap-2 w-full">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Procesando...</span>
                    </span>
                  </>
                ) : (
                  "Cancelar"
                )
              }
              onClick={() => {
                if (!procesandoVenta) setFacturaModal(false);
              }}
              disabled={procesandoVenta}
              style={`flex items-center justify-center text-center ${
                procesandoVenta
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gris-claro hover:bg-gris-oscuro cursor-pointer"
              } text-white font-bold px-6 sm:px-8 py-2 sm:py-3 rounded text-lg sm:text-lg w-full sm:w-36`}
            />
          </div>
        </div>

        {/* Confirmación para enviar a Hacienda */} 
      <SimpleModal
        open={confirmSendOpen}
        onClose={() => setConfirmSendOpen(false)}
        title="Enviar factura a Hacienda"
      >
        <div className="space-y-4">
          <p className="text-sm">
            La factura se creó correctamente. ¿Deseas generar el XML y enviarla a Hacienda ahora?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              text="No"
              onClick={() => {
                setFacturaModal(false);
              }}
              style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-4 py-2 rounded text-sm cursor-pointer"
            />
            <Button
              text={xmlGenerating || sending ? "Procesando…" : "Sí, enviar ahora"}
              disabled={xmlGenerating || sending || !facturaCreada?.id}
              onClick={() => {
                // Disparar flujo de Hacienda
                handleEnviarAHacienda();
                // Cerrar 
                setFacturaModal(false);
              }}
              style="bg-azul-medio hover:bg-azul-oscuro text-white font-bold px-4 py-2 rounded text-sm cursor-pointer"
            />
          </div>
        </div>
      </SimpleModal>
      </form>
    </div>
  );
}
