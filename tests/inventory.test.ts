import { calcularTotales } from './utils/facturaUtils';

type Producto = { codigo_producto: string; nombre_producto: string; precio_venta: number };
type ItemCarrito = { producto: Producto; cantidad: number; descuento?: number };

test('item con cantidad cero produce totales cero', () => {
  const c: ItemCarrito[] = [
    { producto: { codigo_producto: '003', nombre_producto: 'Producto C', precio_venta: 100 }, cantidad: 0, descuento: 50 }
  ];
  const { subtotal, totalDescuento, subtotalConDescuento, impuestos, total } = calcularTotales(c);

  expect(subtotal).toBe(0);
  expect(totalDescuento).toBe(0);
  expect(subtotalConDescuento).toBe(0);
  expect(impuestos).toBe(0);
  expect(total).toBe(0);
});

export async function obtenerProductos(): Promise<any> {
  // endpoint por defecto; los tests mockean global.fetch
  const res = await fetch('/api/productos');
  if (!res.ok) {
    throw new Error(`Error fetching productos: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

