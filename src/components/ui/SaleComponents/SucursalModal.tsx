
import type { Sucursal } from "../../../types/types";

interface SucursalModalProps {
  sucursales: Sucursal[];
  modalSucursal: boolean;
  setModalSucursal: (open: boolean) => void;
  setSucursalSeleccionada: (sucursal: Sucursal) => void;
}

export default function SucursalModal({
  modalSucursal,
  sucursales,
  setSucursalSeleccionada,
  setModalSucursal,
}: SucursalModalProps) {
  if (!modalSucursal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-xl font-bold mb-4 text-center">
          Seleccione la sucursal en la cual está trabajando
        </h2>

        <div className="flex flex-col gap-3">
          {sucursales.map((sucursal) => (
            <button
              key={sucursal.sucursal_id}
              className="w-full px-4 py-2 bg-azul-medio hover:bg-azul-hover text-white rounded font-bold cursor-pointer"
              onClick={() => {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const userId = user.id;
                sessionStorage.setItem(
                  `sucursal_seleccionada_${userId}`,
                  JSON.stringify(sucursal)
                );
                setSucursalSeleccionada(sucursal);
                setModalSucursal(false);
              }}
            >
              {sucursal.nombre} - {sucursal.business.nombre_comercial}
            </button>
          ))}
        </div>

        {sucursales.length === 0 && (
          <p className="text-red-500 mt-4 text-center">
            No hay sucursales disponibles
          </p>
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
