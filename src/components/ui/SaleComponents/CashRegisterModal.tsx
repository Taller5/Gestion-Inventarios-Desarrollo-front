import { useEffect, useState } from "react";
import type { Caja } from "../../../types/salePage";

interface CashRegisterModalProps {
  modalCaja: boolean;
  setModalCaja: (open: boolean) => void;
  sucursalSeleccionada: { sucursal_id: number; nombre: string } | null;
  setCajaSeleccionada: (caja: Caja | null) => void;
  API_URL: string;
  mostrarAlerta: (tipo: "success" | "error", mensaje: string) => void;
}

export default function CashRegisterModal({
  modalCaja,
  setModalCaja,
  sucursalSeleccionada,
  setCajaSeleccionada,
  API_URL,
  mostrarAlerta,
}: CashRegisterModalProps) {
  const [cargando, setCargando] = useState(false);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modalCaja || !sucursalSeleccionada) return;

    const fetchCajas = async () => {
      setCargando(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
         const res = await fetch(
        `${API_URL}/api/v1/cashbox/active/${sucursalSeleccionada.sucursal_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al cargar cajas");

        if (!data.cajas?.length) {
          setError("No hay cajas abiertas en esta sucursal");
          setCajas([]);
        } else {
          setCajas(data.cajas);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchCajas();
  }, [modalCaja, sucursalSeleccionada]);

  if (!modalCaja) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-800">
          Seleccione la caja activa
        </h2>

        {/* Cargando */}
        {cargando && (
          <p className="text-center text-gray-500 animate-pulse">Cargando cajas...</p>
        )}

        {/* Error */}
        {error && !cargando && (
          <p className="text-center text-red-600 font-bold text-lg">{error}</p>
        )}

        {/* Lista de cajas */}
        {!cargando && !error && (
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
            {cajas.map((caja) => (
              <button
                key={caja.id}
                className="w-full px-4 py-3 bg-azul-medio hover:bg-azul-hover text-white rounded-lg font-bold cursor-pointer transition-all"
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem("user") || "{}");
                  const userId = user.id;

                  sessionStorage.setItem(
                    `caja_activa_${userId}`,
                    JSON.stringify(caja)
                  );
                  setCajaSeleccionada(caja);
                  setModalCaja(false);
                  mostrarAlerta("success", "Caja seleccionada correctamente");
                }}
              >
                Caja #{caja.id} — Apertura: ₡
                {Number(caja.opening_amount).toLocaleString()} — Disponible: ₡
                {Number(caja.available_amount).toLocaleString()}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
            onClick={() => setModalCaja(false)}
          >
            Cancelar
          </button>
          <button
            className="bg-verde-claro hover:bg-verde-oscuro text-white font-bold px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
            onClick={() => (window.location.href = "/cashRegisterPage")}
          >
            Abrir nueva caja
          </button>
        </div>
      </div>
    </div>
  );
}
