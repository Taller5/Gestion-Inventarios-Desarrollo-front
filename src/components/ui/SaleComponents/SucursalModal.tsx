import { useEffect, useState } from "react";
import type { Sucursal } from "../../../types/salePage";

interface SucursalModalProps {
  sucursales: Sucursal[];
  modalSucursal: boolean;
  setModalSucursal: (open: boolean) => void;
  setSucursalSeleccionada: (sucursal: Sucursal) => void;
  API_URL: string; // Se pasa la URL de la API
}

export default function SucursalModal({
  modalSucursal,
  sucursales,
  setSucursalSeleccionada,
  setModalSucursal,
  API_URL,
}: SucursalModalProps) {
  const [alerta, setAlerta] = useState<{ mensaje: string; tipo: "error" | "info" } | null>(null);
  const [verificandoCaja, setVerificandoCaja] = useState(false);
  const [cajaAbierta, setCajaAbierta] = useState<boolean | null>(null);
  const [sucursalSeleccionada, setSucursalInterna] = useState<Sucursal | null>(null);
  const [cargando, setCargando] = useState(true); // Unifica carga de sucursales y caja

  const mostrarAlerta = (mensaje: string, tipo: "error" | "info" = "error") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 4000);
  };

  // Simular carga inicial de sucursales
  useEffect(() => {
    if (!modalSucursal) return;

    const cargarInicial = async () => {
      setCargando(true);
      try {
        // Aquí podrías hacer fetch real si quisieras recargar desde API
        await new Promise((res) => setTimeout(res, 200)); // simulación mínima
      } catch (err) {
        console.error(err);
        mostrarAlerta("Error al cargar sucursales", "error");
      } finally {
        setCargando(false);
      }
    };

    cargarInicial();
  }, [modalSucursal]);

  // Verificar caja cuando se selecciona la sucursal
  useEffect(() => {
    const verificarCaja = async () => {
      if (!sucursalSeleccionada) return;

      setCargando(true);
      setVerificandoCaja(true);

      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user.id;
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_URL}/api/v1/cash-registers/active-user/${sucursalSeleccionada.sucursal_id}/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Error al verificar caja");

        setCajaAbierta(Boolean(data.caja));
      } catch (error) {
        console.error("Error al verificar caja:", error);
        setCajaAbierta(false);
      } finally {
        setVerificandoCaja(false);
        setCargando(false);
      }
    };

    verificarCaja();
  }, [sucursalSeleccionada, API_URL]);

  // Mostrar alerta si no hay caja después de verificar
  useEffect(() => {
    if (!verificandoCaja && cajaAbierta === false && sucursalSeleccionada) {
      mostrarAlerta("Debe abrir una caja antes de vender", "error");
    }
  }, [verificandoCaja, cajaAbierta, sucursalSeleccionada]);

  const handleSeleccion = (sucursal: Sucursal) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;
    sessionStorage.setItem(`sucursal_seleccionada_${userId}`, JSON.stringify(sucursal));
    setSucursalInterna(sucursal);
    setSucursalSeleccionada(sucursal);
    setModalSucursal(false);
  };

  if (!modalSucursal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-xl font-bold mb-4 text-center">
          Seleccione la sucursal en la cual está trabajando
        </h2>

        {cargando ? (
          <p className="text-center text-gray-500 animate-pulse flex justify-center items-center">
            ⏳ Buscando sucursales y caja...
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sucursales.map((sucursal) => (
              <button
                key={sucursal.sucursal_id}
                className="w-full px-4 py-2 bg-azul-medio hover:bg-azul-hover text-white rounded font-bold cursor-pointer flex justify-between items-center"
                onClick={() => handleSeleccion(sucursal)}
              >
                <span>
                  {sucursal.nombre} - {sucursal.business.nombre_comercial}
                </span>
                {sucursalSeleccionada?.sucursal_id === sucursal.sucursal_id && verificandoCaja && (
                  <span className="animate-spin ml-2">⏳</span>
                )}
              </button>
            ))}

            {sucursales.length === 0 && (
              <p className="text-red-500 mt-4 text-center">No hay sucursales disponibles</p>
            )}
          </div>
        )}

        {/* ALERTA CENTRAL MEGA */}
        {alerta && alerta.tipo === "error" && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-rojo-ultra-claro text-rojo-oscuro border-4 border-rojo-claro rounded-3xl px-16 py-12 text-center text-4xl md:text-5xl font-extrabold shadow-[0_0_30px_rgba(220,38,38,0.7)] animate-pulse">
              {alerta.mensaje}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
            onClick={() => setModalSucursal(false)}
          >
            Cancelar
          </button>
          <button
            className="bg-verde-claro hover:bg-verde-oscuro text-white font-bold px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
            onClick={() => (window.location.href = "/Branches")}
          >
            Por favor, agrega una sucursal.
          </button>
        </div>
      </div>
    </div>
  );
}
