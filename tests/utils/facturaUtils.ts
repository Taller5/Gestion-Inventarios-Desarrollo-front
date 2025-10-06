// utils/facturaUtils.ts
export type Producto = { codigo_producto: string; nombre_producto: string; precio_venta: number };
export type ItemCarrito = { producto: Producto; cantidad: number; descuento?: number };

export function calcularSubtotal(carrito: ItemCarrito[]): number {
  return carrito.reduce((acc, item) => {
    const descuentoPct = Math.max(0, Math.min(item.descuento || 0, 100));
    return acc + item.producto.precio_venta * item.cantidad * (1 - descuentoPct / 100);
  }, 0);
}

export function calcularTotales(carrito: ItemCarrito[]) {
  const subtotal = carrito.reduce((acc, item) => acc + item.producto.precio_venta * item.cantidad, 0);
  const totalDescuento = carrito.reduce(
    (acc, item) => acc + (item.producto.precio_venta * item.cantidad * (item.descuento || 0)) / 100,
    0
  );
  const subtotalConDescuento = subtotal - totalDescuento;
  const impuestos = +(subtotalConDescuento * 0.13).toFixed(2);
  const total = subtotalConDescuento + impuestos;
  return { subtotal, totalDescuento, subtotalConDescuento, impuestos, total };
}
