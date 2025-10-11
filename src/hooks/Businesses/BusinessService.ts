import { fetchBusinesses } from "./BusinessApi";

// Define el tipo de negocio (debe coincidir con el usado en UseBusiness)
type Business = {
  margen_ganancia: string;
  negocio_id: number;
  nombre_legal: string;
  nombre_comercial: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  codigo_actividad_emisor: string; // nuevo campo (6 dígitos)
  descripcion?: string | null;
  telefono: string;
  email: string;
};

export const getBusinesses = async (): Promise<Business[]> => {
  return await fetchBusinesses();
};