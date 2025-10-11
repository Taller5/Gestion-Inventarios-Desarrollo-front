// const API_URL = import.meta.env.VITE_API_URL;

// export const fetchBusinesses = async () => {
//     const res = await fetch(`${API_URL}/api/v1/businesses`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//         });
//     const data = await response.json();
//     return data;

// };

const API_URL = import.meta.env.VITE_API_URL;

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

// Puedes obtener el token desde localStorage, contexto, o como parámetro
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