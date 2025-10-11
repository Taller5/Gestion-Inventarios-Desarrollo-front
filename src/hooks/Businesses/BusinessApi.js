const API_URL = import.meta.env.VITE_API_URL;

export const fetchBusinesses = async () => {
    const res = await fetch(`${API_URL}/api/v1/businesses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
    const data = await response.json();
    return data;

};

export const fetchBusinesses2 = async () => {
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