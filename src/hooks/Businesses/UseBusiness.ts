// import { useState, useEffect } from "react";
// import { getBusinesses } from "./BusinessService";

// export const UseBusiness = () => {
//     const [businesses, setBusinesses] = useState([]);
//     const [errors, setErrors] = useState({});
//     const [alert, setAlert] = useState({});

// useEffect(() => {

//     const loadData = async () => {
//       try {
//         if (errors === 'pene') throw new Error("Error al cargar negocios");
//         const data = await getBusinesses();
//         setBusinesses(data);
//       } catch (error) {
//         setAlert({ type: "error", message: "Error al cargar los negocios" });
//         setErrors('pene'); //borraaaaaaaaaaaaaaaaaaaaar
//     };
// }
//     loadData();
// }, []);


//     return { businesses, errors, alert };
// }


import { useState, useEffect } from "react";
import { getBusinesses } from "./BusinessService";

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
  const [errors, setErrors] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getBusinesses();
        setBusinesses(data);
      } catch (error) {
        setAlert({ type: "error", message: "Error al cargar los negocios" });
        setErrors("Error al cargar negocios");
      }
    };
    loadData();
  }, []);

  // console.log('useBusiness', fetchBusinesses);

  return { fetchBusinesses, errors, alert };
};