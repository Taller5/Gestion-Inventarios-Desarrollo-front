import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5"; // Ícono de cerrar
import type { Caja } from "../../../types/salePage";

interface CashRegisterModalProps {
  modalCaja: boolean;
  setModalCaja: (open: boolean) => void;
  sucursalSeleccionada: { sucursal_id: number; nombre: string } | null;
  API_URL: string;
  mostrarAlerta: (tipo: "success" | "error", mensaje: string) => void;
  onCerrarCaja: (caja: Caja) => void; // asigna la caja activa automáticamente
  obtenerCajaUsuario: () => Promise<Caja | null>; // función externa que devuelve la caja
}

export default function CashRegisterModal({
  modalCaja,
  setModalCaja,
  sucursalSeleccionada,
  mostrarAlerta,
  onCerrarCaja,
  obtenerCajaUsuario,
}: CashRegisterModalProps) {
  const [cargando, setCargando] = useState(false);
  const [cajaUsuario, setCajaUsuario] = useState<Caja | null>(null);
  const [sucursalCaja, setSucursalCaja] = useState<number | null>(null); // sucursal asociada a la caja cargada

useEffect(() => {
  if (!modalCaja || !sucursalSeleccionada) return;

  // Si ya tenemos caja y la sucursal coincide, no recargamos
  if (cajaUsuario && sucursalCaja === sucursalSeleccionada.sucursal_id) return;

  const cargarCaja = async () => {
    setCargando(true);
    try {
      const caja = await obtenerCajaUsuario();

      if (caja && caja.sucursal_id === sucursalSeleccionada.sucursal_id) {
        setCajaUsuario(caja);
        setSucursalCaja(sucursalSeleccionada.sucursal_id);
        onCerrarCaja(caja);
      } else {
        // No reseteamos mientras esté cargando la sucursal
        setCajaUsuario(null);
        setSucursalCaja(sucursalSeleccionada.sucursal_id); // marcamos sucursal revisada
        mostrarAlerta("error", "No tiene una caja activa en esta sucursal");
      }
    } catch (err: any) {
      setCajaUsuario(null);
      setSucursalCaja(sucursalSeleccionada.sucursal_id);
      mostrarAlerta("error", err.message || "Error al buscar caja");
    } finally {
      setCargando(false);
    }
  };

  cargarCaja();
}, [modalCaja, sucursalSeleccionada]);



  // 🔥 Siempre recargar caja cada vez que el modal se abre
  useEffect(() => {
    if (!modalCaja || !sucursalSeleccionada) return;

    const cargarCaja = async () => {
      setCargando(true);
      try {
        const caja = await obtenerCajaUsuario();

        if (caja && caja.sucursal_id === sucursalSeleccionada.sucursal_id) {
          setCajaUsuario(caja);
          setSucursalCaja(sucursalSeleccionada.sucursal_id);
          onCerrarCaja(caja);
        } else {
          setCajaUsuario(null);
          setSucursalCaja(sucursalSeleccionada.sucursal_id);
          mostrarAlerta("error", "No tiene una caja activa en esta sucursal");
        }
      } catch (err: any) {
        setCajaUsuario(null);
        setSucursalCaja(sucursalSeleccionada.sucursal_id);
        mostrarAlerta("error", err.message || "Error al buscar caja");
      } finally {
        setCargando(false);
      }
    };

    cargarCaja();
  }, [modalCaja]); //  Se ejecuta SIEMPRE al abrir el modal

  if (!modalCaja) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={() => setModalCaja(false)}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Botón cerrar con ícono */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl cursor-pointer"
          onClick={() => setModalCaja(false)}
          aria-label="Cerrar modal"
        >
          <IoClose />
        </button>

        <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-800">
          Caja del usuario
        </h2>

        {cargando && (
          <div className="flex flex-col items-center justify-center gap-2 text-gray-500 animate-pulse">
            <div className="w-12 h-12 border-4 border-t-verde-claro border-gray-200 rounded-full animate-spin"></div>
            <p className="text-lg font-medium">Buscando caja...</p>
          </div>
        )}

        {!cargando && cajaUsuario && (
          <div className="text-center">
            <p className="mb-4 font-bold text-gray-700">
              Caja activa: #{cajaUsuario.id} — Disponible: ₡
              {Number(cajaUsuario.available_amount).toLocaleString()}
            </p>
            <a
              href="/cashRegisterPage"
              className="bg-verde-claro hover:bg-verde-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition inline-block text-center"
              onClick={() => setModalCaja(false)}
            >
              Manejar caja
            </a>
          </div>
        )}

        {!cargando && !cajaUsuario && (
          <div className="text-center">
            <p className="mb-4 font-bold text-red-600">
              No tiene una caja activa en esta sucursal
            </p>
            <button
              className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition"
              onClick={() => (window.location.href = "/cashRegisterPage")}
            >
              Abrir una caja
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
