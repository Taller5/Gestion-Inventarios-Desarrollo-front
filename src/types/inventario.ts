// src/types/inventario.ts
export type Business = {
  negocio_id: number;
  nombre_legal: string;
  nombre_comercial: string;
  margen_ganancia: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  descripcion?: string | null;
  telefono: string;
  email: string;
};

// Tipo bodega
export type Warehouse = {
  bodega_id: number;
  codigo: string;
  sucursal_id: number;
  branch: {
    nombre: string;
    business: Business;
  };
};

// Tipo producto
export type Producto = {
  id?: number;
  codigo_producto: string;
  nombre_producto: string;
  categoria: string;
  descripcion?: string;
  stock: number;
  precio_compra: number;
  precio_venta: number;
  bodega_id: string;
  codigo_cabys?: string;
  impuesto?: number;
  unit_id?: string;
  lotes?: Lote[];
};

// Tipo lote
export type Lote = {
  lote_id: number;
  codigo_producto: string;
  numero_lote: string;
  cantidad: number;
  proveedor: string;
  fecha_entrada: string;
  fecha_vencimiento: string;
  fecha_salida_lote?: string;
  descripcion: string;
  nombre_producto: string;
  nombre?: string;
};

// Tipo proveedor
export type Provider = {
  id: number;
  name: string;
  products: { id: number; nombre: string }[];
};

// Tipo unidad de medida
export type Unit = {
  id: number;
  unidMedida: string;
  descripcion: string;
};

// Tipo CABYS
export type CabysItem = {
  code: string;
  description: string;
  tax_rate: number;
  category_main?: string;
  category_main_name?: string;
  category_2?: string;
  category_2_name?: string;
  category_2_desc?: string;
  category_3?: string;
  category_3_name?: string;
  category_3_desc?: string;
  category_4?: string;
  category_4_name?: string;
  category_4_desc?: string;
  _combo?: string; // campo combinado para búsqueda
};

export type CabysCategory = {
  code: string;
  description: string;
  level: number;
  parent_code?: string | null;
};
// Tipo de categoría
export type Category = {
  nombre: string;
  descripcion: string;
};
