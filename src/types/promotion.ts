export interface PromotionProductForModal {
  product_id: number;
  cantidad: number;
  descuento?: number;
}

export interface PromotionProduct {
  id: number;
  nombre_producto: string;
  cantidad: number;
  descuento: number;
}

export interface Promotion {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: "porcentaje" | "fijo" | "combo";
  valor?: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  products: PromotionProduct[];
    negocio_id?: number | string; // ✅ nuevo
  sucursal_id?: number | string; // ✅ nuevo
}



export interface Product {
  id: number;
  nombre_producto: string;
}
