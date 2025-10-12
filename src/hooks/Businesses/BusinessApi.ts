const API_URL = import.meta.env.VITE_API_URL;

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

const token = localStorage.getItem("token");

export const fetchBusinesses = async (): Promise<Business[]> => {
  const res = await fetch(`${API_URL}/api/v1/businesses`, {
    
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener los negocios");
  }
  const data: Business[] = await res.json();
  return data;
};


export const deleteBusinessApi = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/api/v1/businesses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Error al eliminar el negocio");
  }
};

export const createBusinessApi = async (formToSend: Business, businessToEdit: Business | null) => {

    try {
      const url = businessToEdit
        ? `${API_URL}/api/v1/businesses/${businessToEdit.negocio_id}`
        : `${API_URL}/api/v1/businesses`;

      const method = businessToEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formToSend),
      });

      const data = await res.json();

      // Caso especial: correo ya registrado
      if (!res.ok) {
        if (data?.message?.toLowerCase().includes("correo")) {
          throw new Error("El correo ya está registrado en otro negocio");
        }
        throw new Error(data?.message || "Error al procesar");
      }

      return data;

    } catch (err: any) {
      throw new Error(err as string);
    }
  };