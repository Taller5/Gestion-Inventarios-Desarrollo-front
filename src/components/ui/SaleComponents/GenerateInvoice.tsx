import { useState, forwardRef, useImperativeHandle } from "react";
import { jsPDF } from "jspdf";
import Button from "../Button";

export interface GenerateInvoiceRef {
  generarFactura: () => void;
}

interface GenerateInvoiceProps {
  sucursalSeleccionada: any;
  clienteSeleccionado: any;
  carrito: any[];
  metodoPago: string;
  montoEntregado?: number;
  comprobante?: string;
  user: { name?: string; username?: string };
  buttonText?: string;
  disabled?: boolean;
  facturaCreada?: any; 
}

const GenerateInvoice = forwardRef<GenerateInvoiceRef, GenerateInvoiceProps>((props, ref) => {
  const {
    sucursalSeleccionada,
    clienteSeleccionado,
    carrito,
    metodoPago,
    montoEntregado,
    comprobante,
    user,
    buttonText,
    disabled,
    facturaCreada,
  } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatNumber = (value: number) =>
    value.toLocaleString("es-CR", { maximumFractionDigits: 0 });

  const generarFactura = () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!sucursalSeleccionada) throw new Error("No se ha seleccionado ninguna sucursal.");
      if (!clienteSeleccionado) throw new Error("Debe seleccionar un cliente antes de imprimir la factura.");
      if (!carrito || carrito.length === 0) throw new Error("El carrito está vacío. No se puede generar la factura.");

      const doc = new jsPDF();
      const padding = 10;
      let y = padding;

      const numeroFactura = facturaCreada?.id || "N/D";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(`Factura #${numeroFactura}`, 105, y, { align: "center" });
      y += 10;
      
      const sistemaFactura = " de Facturación: Gestior";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(`Sistema ${sistemaFactura}`, 105, y, { align: "center" });
      y += 10;

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

      // Tabla productos
      const headers = ["Código", "Producto", "Cant.", "Precio", "Desc.", "Subtotal"];
      const colWidths = [30, 60, 20, 30, 25, 25];
      let x = padding;

      doc.setFont("helvetica", "bold");
      doc.setFillColor(220, 220, 220);
      doc.rect(x, y - 4, colWidths.reduce((a, b) => a + b, 0), 8, "F");
      headers.forEach((h, i) => {
        doc.text(h, x + 2, y);
        x += colWidths[i];
      });
      y += 8;

      doc.setFont("helvetica", "normal");
      let subtotal = 0;
      let totalDescuento = 0;

      carrito.forEach((item, index) => {
        x = padding;
        const descuentoPct = Math.max(0, Math.min(item.descuento || 0, 100));
        const subtotalItem = (item.producto.precio_venta || 0) * (item.cantidad || 0);
        const descuentoItem = subtotalItem * (descuentoPct / 100);

        subtotal += subtotalItem;
        totalDescuento += descuentoItem;

        if (index % 2 === 1) {
          doc.setFillColor(245, 245, 245);
          doc.rect(x, y - 4, colWidths.reduce((a, b) => a + b, 0), 6, "F");
        }

        const row = [
          item.producto.codigo_producto || "-",
          item.producto.nombre_producto || "-",
          (item.cantidad || 0).toString(),
          formatNumber(item.producto.precio_venta || 0),
          `${descuentoPct}%`,
          formatNumber(Math.round(subtotalItem - descuentoItem)),
        ];

        row.forEach((text, i) => {
          doc.text(text, x + 2, y);
          x += colWidths[i];
        });

        y += 6;
        doc.line(padding, y - 4, padding + colWidths.reduce((a, b) => a + b, 0), y - 4);
      });

      const subtotalConDescuento = subtotal - totalDescuento;
      const impuestos = +(subtotalConDescuento * 0.13).toFixed(2);
      const totalAPagar = subtotalConDescuento + impuestos;

      doc.setFont("helvetica", "bold");
      const totalX = padding + colWidths.slice(0, 3).reduce((a, b) => a + b, 0);
      doc.text(`Subtotal: ${formatNumber(subtotal)}`, totalX, y);
      y += 6;
      doc.text(`Total Descuento: ${formatNumber(Math.round(totalDescuento))}`, totalX, y);
      y += 6;
      doc.text(`Impuestos (13%): ${formatNumber(Math.round(impuestos))}`, totalX, y);
      y += 6;
      doc.text(`Total a pagar: ${formatNumber(Math.round(totalAPagar))}`, totalX, y);
      y += 10;

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
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const leyenda = `2025: autorizado mediante resolución
No. DGT-R-033-2019 del 20/06/2019
Versión del documento 4.3`;
      doc.text(leyenda, 105, y, { align: "center", maxWidth: 180 });

      doc.save(`Factura_${clienteSeleccionado.name || "cliente"}_${numeroFactura}.pdf`);
      setSuccessMessage("Factura generada correctamente");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al generar la factura");
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    generarFactura,
  }));

  return (
    <section className="flex flex-col gap-3">
      {error && (
        <div className="p-3 bg-rojo-ultra-claro text-rojo-claro rounded-lg text-center">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 bg-verde-ultra-claro text-verde-oscuro rounded-lg text-center">
          {successMessage}
        </div>
      )}
      <Button
        text={loading ? "Generando..." : buttonText || "Imprimir factura"}
        style="bg-verde-claro hover:bg-verde-oscuro text-white font-bold px-8 py-3 rounded text-lg cursor-pointer"
        onClick={generarFactura}
        disabled={disabled}
      />
    </section>
  );
});

export default GenerateInvoice;
