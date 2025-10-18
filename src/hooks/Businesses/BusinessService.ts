import { fetchBusinesses, deleteBusinessApi, createBusinessApi, updateBusinessLogoApi } from "./BusinessApi";

// Define el tipo de negocio (debe coincidir con el usado en UseBusiness)
type Business = {
  margen_ganancia: number;
  negocio_id: number;
  nombre_legal: string;
  nombre_comercial: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  codigo_actividad_emisor: string; // nuevo campo (6 dígitos)
  descripcion?: string | null;
  telefono: string;
  email: string;
  logo?: string | null;
};

export const getBusinesses = async (): Promise<Business[]> => {
  return await fetchBusinesses();
  
};

export const deleteBusiness = async (id: number): Promise<void> => {
  await deleteBusinessApi(id);
}

export const createBusiness = async (form: Business): Promise<Business> => {
  return await createBusinessApi(form, null);
};

export const updateBusiness = async (form: Business, businessesToEdit: Business): Promise<Business> => {
  return await createBusinessApi(form, businessesToEdit);
};
export const updateBusinessLogo = async (businessId: number, logoUrl: string) => {
  return await updateBusinessLogoApi(businessId, logoUrl);
};