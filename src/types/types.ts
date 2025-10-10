export interface Customer {
  customer_id: number;
  name: string;
  identity_number: string;
  phone?: string;
  email?: string;
}

export interface Producto {
  id?: number;
  codigo_producto: string;
  nombre_producto: string;
  categoria?: string;
  descripcion?: string;
  stock?: number;
  precio_compra?: number;
  precio_venta: number;
  bodega?: string;
  bodega_id?: number;
}


export interface Lote {
  lote_id: number;
  codigo: string;
  cantidad: number;
}



// 🔹 Interfaces adicionales para sucursales y negocios
export interface Business {
    
  nombre_comercial: string;
  nombre_legal: string;
  telefono: string;
  email: string;
  tipo_identificacion: string;
  numero_identificacion: string;
}
export type BusinessExtended = {
  negocio_id: number;
  nombre_comercial: string;
  nombre_legal?: string;
  tipo_identificacion?: string;
  numero_identificacion?: string;
  telefono?: string;
  email?: string;
  margen_ganancia: string; // ⚠ obligatorio
};


export interface Sucursal {
  sucursal_id: number;
  nombre: string;      // usa siempre "nombre"
  ubicacion: string;   // Dirección exacta
  provincia: string;
  canton: string;
  telefono: string;
  business: Business;
}
// types.ts
export interface Warehouse {
  bodega_id: number;
  nombre_bodega: string;
  sucursal_id: number;
  branch?: {
    nombre: string;
    business: {
      nombre_comercial: string;
    };
  };
}
// types.ts
export type FullBusiness = {
  negocio_id: number;
  nombre_comercial: string;
  margen_ganancia: number;
  nombre_legal: string;
  tipo_identificacion: string;
  numero_identificacion: string;
};

