import { getBusinessMargin, calcularPrecioSugerido } from './utils/InventoryUtils';

describe('Pruebas de inventoryUtils', () => {
  test('getBusinessMargin devuelve margen correcto', () => {
    expect(getBusinessMargin('1')).toBe(0.3);
    expect(getBusinessMargin('2')).toBe(0.15);
    expect(getBusinessMargin('99')).toBe(0.25); // default
  });

  test('calcularPrecioSugerido funciona correctamente', () => {
    expect(calcularPrecioSugerido(100, '1')).toBe(130); // 100 * (1 + 0.3)
    expect(calcularPrecioSugerido(200, '2')).toBe(230); // 200 * (1 + 0.15)
    expect(calcularPrecioSugerido(50, '99')).toBe(62.5);  // default 0.25
  });
});
