import { useState, useEffect } from "react";
import { getBusinesses, deleteBusiness, createBusiness, updateBusiness } from "./BusinessService";

// Define el tipo de negocio si lo conoces
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

export const UseBusiness = () => {
  const [fetchBusinesses, setBusinesses] = useState<Business[]>([]);
  // const [errors, setErrors] = useState<string | null>(null);
  const [fetchAlert, setFetchAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getBusinesses();
        setBusinesses(data);
      } catch (error) {
        setFetchAlert({ type: "error", message: "Error al cargar los negocios" });
        // setErrors("Error al cargar negocios");
      }
    };
    loadData();
  }, []);

  // console.log('useBusiness', fetchBusinesses);

  const handleDeleteBusiness = async (id: number) => {
    if (!id) return;
    try {
      await deleteBusiness(id);
      setFetchAlert({ type: "success", message: "Negocio eliminado" });

    } catch(error){
      setFetchAlert({ type: "error", message: "Error al eliminar el negocio" });
        }
  };

  const handleSubmit = async (e: React.FormEvent, form: Business, businessToEdit: Business | null) => {
    e.preventDefault();
    if (businessToEdit) {
      try {
        await updateBusiness(form, businessToEdit);
        setFetchAlert({ type: "success", message: "Negocio actualizado" });
      } catch (error) {
        setFetchAlert({ type: "error", message: "Error al actualizar el negocio" });
      }
    } else {
      try {
        await createBusiness(form);
        setFetchAlert({ type: "success", message: "Negocio creado" });
      } catch (error) {
        setFetchAlert({ type: "error", message: "Error al crear el negocio" });
      }
    }
  };


  return { fetchBusinesses, handleDeleteBusiness, handleSubmit, fetchAlert };
};