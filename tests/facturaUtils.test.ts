// tests/facturaUtils.test.ts
import { calcularSubtotal, calcularTotales } from './utils/facturaUtils';

type Producto = { codigo_producto: string; nombre_producto: string; precio_venta: number };
type ItemCarrito = { producto: Producto; cantidad: number; descuento?: number };

const carrito: ItemCarrito[] = [
  { producto: { codigo_producto: '001', nombre_producto: 'Producto A', precio_venta: 1000 }, cantidad: 2, descuento: 10 },
  { producto: { codigo_producto: '002', nombre_producto: 'Producto B', precio_venta: 500 }, cantidad: 1 }
];

test('calcular subtotal', () => {
  const subtotal = calcularSubtotal(carrito);
  expect(subtotal).toBe(2300); // 1000*2 + 500*1 - 10% de 2000 = 2300
});

test('calcular totales con descuento e impuestos', () => {
  const { subtotal, totalDescuento, subtotalConDescuento, impuestos, total } = calcularTotales(carrito);
  
  expect(subtotal).toBe(2500); // sin descuento
  expect(totalDescuento).toBe(200); // 10% de 2000
  expect(subtotalConDescuento).toBe(2300); // 2500 - 200
  expect(impuestos).toBeCloseTo(299); // 13% de 2300
  expect(total).toBeCloseTo(2599); // subtotalConDescuento + impuestos
});
