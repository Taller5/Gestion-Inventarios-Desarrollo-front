import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5"; // Importar ícono de cerrar
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

  useEffect(() => {
    if (!modalCaja || !sucursalSeleccionada) return;

    const cargarCaja = async () => {
      setCargando(true);
      try {
        const caja = await obtenerCajaUsuario();

        if (caja && caja.sucursal_id === sucursalSeleccionada.sucursal_id) {
          setCajaUsuario(caja);
          onCerrarCaja(caja);
        } else {
          setCajaUsuario(null);
          mostrarAlerta("error", "No tiene una caja activa en esta sucursal");
        }
      } catch (err: any) {
        mostrarAlerta("error", err.message || "Error al buscar caja");
        setCajaUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    cargarCaja();
  }, [modalCaja, sucursalSeleccionada]);

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
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl"
          onClick={() => setModalCaja(false)}
          aria-label="Cerrar modal"
        >
          <IoClose />
        </button>

        <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-800">
          Caja del usuario
        </h2>

        {cargando && (
          <p className="text-center text-gray-500 animate-pulse flex justify-center items-center">
            ⏳ Buscando caja...
          </p>
        )}

        {!cargando && cajaUsuario && (
          <div className="text-center">
            <p className="mb-4 font-bold">
              Caja activa: #{cajaUsuario.id} — Disponible: ₡
              {Number(cajaUsuario.available_amount).toLocaleString()}
            </p>
            <button
              className="bg-verde-claro hover:bg-verde-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition"
              onClick={() => setModalCaja(false)}
            >
              Cerrar caja
            </button>
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

