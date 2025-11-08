import { useState, useEffect } from "react";
import { getBusinesses, deleteBusiness, createBusiness, updateBusiness, updateBusinessLogo } from "./BusinessService";

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

export const UseBusiness = () => {
  const [savingLogo, setSavingLogo] = useState(false);

  const [fetchBusinesses, setFetchBusinesses] = useState<Business[]>([]);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [fetchAlert, setFetchAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setFetchLoading(true);
        const data = await getBusinesses();
        setFetchBusinesses(data);
      } catch (error) {
        setFetchAlert({ type: "error", message: "Error al cargar los negocios" });
        throw new Error(error as string);
      } finally {
        setFetchLoading(false);
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
  };

 const handleUpdateLogo = async (businessId: number, logoUrl: string) => {
    try {
      setSavingLogo(true);
      const updated = await updateBusinessLogo(businessId, logoUrl);

      // Actualiza localmente la lista de negocios
      setFetchBusinesses(prev =>
        prev.map(b => (b.negocio_id === businessId ? { ...b, logo: updated.logo } : b))
      );

      setFetchAlert({ type: "success", message: "Logo actualizado correctamente" });
    } catch (error: any) {
      setFetchAlert({ type: "error", message: error.message || "Error al actualizar el logo" });
    } finally {
      setSavingLogo(false);
    }
  };
  return { fetchBusinesses, fetchLoading, handleDeleteBusiness, handleSubmitBusiness, fetchAlert, handleUpdateLogo, savingLogo };
};