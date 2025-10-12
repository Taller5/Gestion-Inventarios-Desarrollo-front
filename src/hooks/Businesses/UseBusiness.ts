import { useState, useEffect } from "react";
import { getBusinesses, deleteBusiness, createBusiness, updateBusiness } from "./BusinessService";

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
};

export const UseBusiness = () => {
  const [fetchBusinesses, setFetchBusinesses] = useState<Business[]>([]);
  const [fetchAlert, setFetchAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getBusinesses();
        setFetchBusinesses(data);
      } catch (error) {
        setFetchAlert({ type: "error", message: "Error al cargar los negocios" });
        throw new Error(error as string);
      }
    };
    loadData();
  }, []);


  const handleDeleteBusiness = async (id: number) => {
    if (!id) return;
    try {
      await deleteBusiness(id);
      setFetchAlert({ type: "success", message: "Negocio eliminado" });

    } catch(error){
      setFetchAlert({ type: "error", message: "Error al eliminar el negocio" });
      throw new Error(error as string);
        }
  };

  const handleSubmitBusiness = async ( form: any, businessToEdit?: Business) : Promise<Business> => {
    if (businessToEdit) {
      try {
        const updated = await updateBusiness(form, businessToEdit);
        setFetchAlert({ type: "success", message: "Negocio actualizado" });
        return updated;
      } catch (error) {
        setFetchAlert({ type: "error", message: "Error al actualizar el negocio" });
        throw new Error(error as string);
      }
    } else {
      try {
        const created = await createBusiness(form);
        setFetchAlert({ type: "success", message: "Negocio creado" });
        return created;
      } catch (error) {
        setFetchAlert({ type: "error", message: "Error al crear el negocio" });
        throw new Error(error as string);
      }
    }
    return {} as Business;
  };


  return { fetchBusinesses, handleDeleteBusiness, handleSubmitBusiness, fetchAlert };
};