type Producto = { codigo_producto: string; nombre_producto: string; precio_venta: number };
type ItemCarrito = { producto: Producto; cantidad: number; descuento?: number };

export function calcularSubtotal(items: ItemCarrito[]): number {
  // Aquí subtotal = suma después de aplicar descuentos por línea (según test activo)
  const total = (items || []).reduce((acc, it) => {
    const cantidad = Math.max(0, it.cantidad || 0);
    const linea = (it.producto?.precio_venta || 0) * cantidad;
    const descuento = (it.descuento && !isNaN(Number(it.descuento))) ? (it.descuento / 100) : 0;
    const lineaNeta = linea * (1 - descuento);
    return acc + lineaNeta;
  }, 0);
  return Number(total);
}

export function calcularTotales(items: ItemCarrito[]) {
  const subtotal = (items || []).reduce((acc, it) => {
    return acc + ((it.producto?.precio_venta || 0) * Math.max(0, it.cantidad || 0));
  }, 0);

  const totalDescuento = (items || []).reduce((acc, it) => {
    if (!it.descuento) return acc;
    const linea = (it.producto?.precio_venta || 0) * Math.max(0, it.cantidad || 0);
    return acc + (linea * (it.descuento / 100));
  }, 0);

  const subtotalConDescuento = subtotal - totalDescuento;
  const impuestos = subtotalConDescuento * 0.13;
  const total = subtotalConDescuento + impuestos;

  return {
    subtotal,
    totalDescuento,
    subtotalConDescuento,
    impuestos,
    total
  };
}