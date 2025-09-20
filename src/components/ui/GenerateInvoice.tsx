import { useState } from "react";
import { jsPDF } from "jspdf";
import Button from "./Button";

interface GenerateInvoiceProps {
  sucursalSeleccionada: any;
  clienteSeleccionado: any;
  carrito: any[];
  metodoPago: string;
  montoEntregado?: number;
  comprobante?: string;
  user: { name?: string; username?: string };
  buttonText?: string;
}

export default function GenerateInvoice(props: GenerateInvoiceProps) {
  const {
    sucursalSeleccionada,
    clienteSeleccionado,
    carrito,
    metodoPago,
    montoEntregado,
    comprobante,
    user,
    buttonText,
  } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Función para formatear números
  const formatNumber = (value: number) =>
    value.toLocaleString("es-CR", { maximumFractionDigits: 0 });

  // Variable para desactivar el botón
  const disabledPrint =
    loading ||
    !sucursalSeleccionada ||
    !clienteSeleccionado ||
    carrito.length === 0 ||
    (metodoPago === "Efectivo" && (!montoEntregado || montoEntregado <= 0)) ||
    ((metodoPago === "Tarjeta" || metodoPago === "SINPE") &&
      (!comprobante || comprobante.trim() === ""));

  const generarFactura = () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // Validaciones
      if (!sucursalSeleccionada)
        throw new Error("No se ha seleccionado ninguna sucursal.");
      if (!clienteSeleccionado)
        throw new Error("Debe seleccionar un cliente antes de imprimir la factura.");
      if (!carrito || carrito.length === 0)
        throw new Error("El carrito está vacío. No se puede generar la factura.");

      if (metodoPago === "Efectivo" && (!montoEntregado || montoEntregado <= 0))
        throw new Error("Ingrese el monto entregado para el pago en efectivo.");

      if (
        (metodoPago === "Tarjeta" || metodoPago === "SINPE") &&
        (!comprobante || comprobante.trim() === "")
      )
        throw new Error("Debe ingresar el comprobante para el método de pago seleccionado.");

      const doc = new jsPDF();
      const padding = 10;
      let y = padding;

      // --- Encabezado ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(sucursalSeleccionada.business?.nombre_comercial || "N/D", padding, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Razón social: ${sucursalSeleccionada.business?.nombre_legal || "N/D"}`, padding, y);
      y += 5;
      doc.text(`Tel: ${sucursalSeleccionada.business?.telefono || "-"}`, padding, y);
      y += 5;
      doc.text(`Email: ${sucursalSeleccionada.business?.email || "-"}`, padding, y);
      y += 5;
      doc.text(`Provincia: ${sucursalSeleccionada.provincia || "-"}`, padding, y);
      y += 5;
      doc.text(`Cantón: ${sucursalSeleccionada.canton || "-"}`, padding, y);
      y += 5;
      doc.text(`Sucursal: ${sucursalSeleccionada.nombre || "-"}`, padding, y);
      y += 10;

      doc.setLineWidth(0.5);
      doc.line(padding, y, 200, y);
      y += 5;

      // --- Cliente y Cajero ---
      doc.setFont("helvetica", "bold");
      doc.text("Factura para:", padding, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${clienteSeleccionado.name || "-"}`, padding, y);
      y += 5;
      doc.text(`Cédula: ${clienteSeleccionado.identity_number || "-"}`, padding, y);
      y += 5;
      doc.text(`Cajero: ${user.name || user.username}`, padding, y);
      y += 5;
      doc.text(`Fecha: ${new Date().toLocaleString()}`, padding, y);
      y += 10;

      doc.line(padding, y, 200, y);
      y += 5;

      // --- Tabla productos ---
      const headers = ["Código", "Producto", "Cant.", "Precio", "Desc.", "Subtotal"];
      const colWidths = [30, 60, 20, 30, 25, 25];
      let x = padding;

      doc.setFont("helvetica", "bold");
      doc.setFillColor(220, 220, 220);
      doc.rect(x, y - 4, colWidths.reduce((a, b) => a + b), 8, "F");
      headers.forEach((h, i) => {
        doc.text(h, x + 2, y);
        x += colWidths[i];
      });
      y += 8;

      // Filas de productos
      doc.setFont("helvetica", "normal");
      let subtotal = 0;
      let totalDescuento = 0;

      carrito.forEach((item, index) => {
        x = padding;
        const descuentoPct = Math.max(0, Math.min(item.descuento || 0, 100));
        const subtotalItem = (item.producto.precio || 0) * (item.cantidad || 0);
        const descuentoItem = subtotalItem * (descuentoPct / 100);

        subtotal += subtotalItem;
        totalDescuento += descuentoItem;

        if (index % 2 === 1) {
          doc.setFillColor(245, 245, 245);
          doc.rect(x, y - 4, colWidths.reduce((a, b) => a + b), 6, "F");
        }

        const row = [
          item.producto.codigo || "-",
          item.producto.nombre || "-",
          (item.cantidad || 0).toString(),
          formatNumber(item.producto.precio || 0),
          `${descuentoPct}%`,
          formatNumber(Math.round(subtotalItem - descuentoItem)),
        ];

        row.forEach((text, i) => {
          doc.text(text, x + 2, y);
          x += colWidths[i];
        });

        y += 6;
        doc.line(padding, y - 4, padding + colWidths.reduce((a, b) => a + b), y - 4);
      });

      y += 5;

      // --- Totales ---
      const subtotalConDescuento = subtotal - totalDescuento;
      const impuestos = +(subtotalConDescuento * 0.13).toFixed(2);
      const totalAPagar = subtotalConDescuento + impuestos;

      doc.setFont("helvetica", "bold");
      const totalX = padding + colWidths.slice(0, 3).reduce((a, b) => a + b);
      doc.text(`Subtotal: ${formatNumber(subtotal)}`, totalX, y);
      y += 6;
      doc.text(`Total Descuento: ${formatNumber(Math.round(totalDescuento))}`, totalX, y);
      y += 6;
      doc.text(`Impuestos (13%): ${formatNumber(Math.round(impuestos))}`, totalX, y);
      y += 6;
      doc.text(`Total a pagar: ${formatNumber(Math.round(totalAPagar))}`, totalX, y);
      y += 10;

      // --- Pago ---
      doc.setFont("helvetica", "normal");
      doc.text(`Método de pago: ${metodoPago}`, padding, y);
      y += 5;
      doc.text(`Monto entregado: ${formatNumber(montoEntregado || 0)}`, padding, y);
      y += 5;
      doc.text(`Vuelto: ${formatNumber(Math.max(0, (montoEntregado || 0) - totalAPagar))}`, padding, y);
      y += 5;
      doc.text(`Comprobante: ${comprobante || "-"}`, padding, y);
      y += 10;

      doc.setLineWidth(0.5);
      doc.line(padding, y, 200, y);
      y += 5;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Gracias por su compra", padding, y);

      doc.save(`Factura_${clienteSeleccionado.name || "cliente"}.pdf`);
      setSuccessMessage("Factura generada correctamente");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al generar la factura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center">{error}</div>}
      {successMessage && <div className="p-3 bg-green-100 text-green-700 rounded-lg text-center">{successMessage}</div>}
      <Button
        text={loading ? "Generando..." : buttonText || "Imprimir factura"}
        style="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded text-lg"
        onClick={generarFactura}
        disabled={disabledPrint}
      />
    </section>
  );
}
