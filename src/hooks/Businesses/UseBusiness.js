import { useState, useEffect } from "react";
import { getBusinesses } from "./BusinessService";

export const UseBusiness = () => {
    const [businesses, setBusinesses] = useState([]);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({});

useEffect(() => {

    const loadData = async () => {
      try {
        if (!res.ok) throw new Error("Error al cargar negocios");
        const data = await getBusinesses();
        setBusinesses(data);
      } catch (error) {
        setAlert({ type: "error", message: "Error al cargar los negocios" });
    };
}
    loadData();
}, []);


    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/v1/businesses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error("Error al cargar negocios");
        const data = await res.json();
        setBusinesses(data);
      } catch (error) {
        console.error(error);
        setAlert({ type: "error", message: "Error al cargar los negocios" });
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();


    return { businesses, errors, alert };
}