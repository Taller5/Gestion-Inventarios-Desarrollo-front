// Tipos (puedes ajustarlos según tu proyecto)
interface Business {
  margen_ganancia?: string;
}

interface Branch {
  business: Business;
}

interface Warehouse {
  bodega_id: string;
  branch: Branch;
}

// Lista de bodegas (puede venir de tu estado o base de datos)
export const warehouses: Warehouse[] = [
  { bodega_id: '1', branch: { business: { margen_ganancia: '0.3' } } },
  { bodega_id: '2', branch: { business: { margen_ganancia: '0.15' } } },
];

// Función que devuelve margen
export const getBusinessMargin = (bodega_id: string): number => {
  const warehouse = warehouses.find(
    (w) => String(w.bodega_id) === String(bodega_id)
  );
  if (!warehouse) return 0.25; // 25% por defecto

  const business: Business = warehouse.branch.business as any;
  return Number.parseFloat(business.margen_ganancia || '0.25') || 0.25;
};

// Función que calcula precio sugerido a partir del precio de compra y bodega
export const calcularPrecioSugerido = (
  precio_compra: number,
  bodega_id: string
): number => {
  const margin = getBusinessMargin(bodega_id);
  return Number((precio_compra * (1 + margin)).toFixed(2));
};
