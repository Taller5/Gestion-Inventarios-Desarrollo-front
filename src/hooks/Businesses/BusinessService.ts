import { fetchBusinesses, deleteBusinessApi, createBusinessApi } from "./BusinessApi";

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
  // const pene = await fetchBusinesses();
  // await console.log('businessesService', pene);
  return await fetchBusinesses();
  
};

export const deleteBusiness = async (id: number): Promise<void> => {
  await deleteBusinessApi(id);
}

export const createBusiness = async (form: Business): Promise<void> => {
  await createBusinessApi(form, null);
};

export const updateBusiness = async (form: Business, businessesToEdit: Business): Promise<void> => {
  await createBusinessApi(form, businessesToEdit);
};