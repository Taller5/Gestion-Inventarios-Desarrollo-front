import React, { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

interface IAHistoryDiario {
  id: number;
  type: "diario";
  product_name: string;
  future_price: number;
  promotion_active: number;
  history: {
    prediction_date: string;
    predicted_quantity: number;
  };
  created_at: string;
}

interface IAHistoryAnual {
  id: number;
  type: "anual";
  product_name: string;
  future_price: number;
  promotion_active: number;
  history: Array<{
    month: string;
    quantity: number;
  }>;
  created_at: string;
}

const PAGE_SIZE = 5;

const HistoryComponent: React.FC<{ userId: number; onClose: () => void; initialType?: "diario" | "anual" }> = ({ userId, onClose, initialType = "diario" }) => {
  const [selectedType, setSelectedType] = useState<"diario" | "anual">(initialType);
  const [histories, setHistories] = useState<(IAHistoryDiario | IAHistoryAnual)[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
    setLoading(true);
    fetch(`${API_URL}/api/v1/ia-history?type=${selectedType}&user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => setHistories(data))
      .catch(() => setHistories([]))
      .finally(() => setLoading(false));
  }, [selectedType, userId]);

  useEffect(() => {
    setSelectedType(initialType ?? "diario");
  }, [initialType]);

  // Bloquea el scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const paginated = histories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-60 backdrop-blur-md">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative border border-azul-medio"
        style={{ maxHeight: "80vh", overflow: "hidden" }} // Limita la altura del modal
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-azul-medio">Historial de Predicciones</h2>

        <div
          className="overflow-y-auto"
          style={{ maxHeight: "65vh", paddingRight: "8px" }} // Área scrollable interna
        >
          {loading && (
            <div className="text-center text-gray-400 py-8">Cargando historial...</div>
          )}

          {/* Tarjetas para diario */}
          {selectedType === "diario" && !loading && paginated.length > 0 && (
            <div className="grid gap-4">
              {paginated
                .filter((h): h is IAHistoryDiario => h.type === "diario")
                .map((h) => (
                  <div key={h.id} className="p-4 bg-white rounded-lg shadow border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-azul-medio">{h.product_name}</span>
                      <span className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span>Fecha:</span>
                      <span>{h.history.prediction_date}</span>
                      <span>Cantidad Estimada:</span>
                      <span className="font-semibold text-azul-medio">{h.history.predicted_quantity}</span>
                      <span>Precio Propuesto:</span>
                      <span>₡{h.future_price.toFixed(2)}</span>
                      <span>Promoción activa:</span>
                      <span>{h.promotion_active === 1 ? "Sí" : "No"}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Tabla mejorada para anual */}
          {selectedType === "anual" && !loading && paginated.length > 0 && (
            <div className="mb-6">
              {paginated
                .filter((h): h is IAHistoryAnual => h.type === "anual")
                .map((h) => (
                  <div key={h.id} className="mb-8 bg-white rounded-lg shadow border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-azul-medio">{h.product_name}</span>
                      <span className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <span>Precio Propuesto:</span>
                      <span>₡{h.future_price.toFixed(2)}</span>
                      <span>Promoción activa:</span>
                      <span>{h.promotion_active === 1 ? "Sí" : "No"}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden shadow">
                        <thead>
                          <tr className="bg-azul-medio text-white">
                            <th className="py-2 px-3 border-b border-gray-200 text-left">Mes</th>
                            <th className="py-2 px-3 border-b border-gray-200 text-left">Cantidad Estimada</th>
                          </tr>
                        </thead>
                        <tbody>
                          {h.history.map((m, i) => (
                            <tr key={m.month} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                              <td className="py-2 px-3 border-b border-gray-100 font-semibold">{m.month}</td>
                              <td className="py-2 px-3 border-b border-gray-100 font-semibold text-azul-medio">{m.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Paginación */}
          {!loading && histories.length > PAGE_SIZE && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded border bg-gray-100"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </button>
              <span className="px-2 py-1">{page}</span>
              <button
                className="px-3 py-1 rounded border bg-gray-100"
                disabled={page * PAGE_SIZE >= histories.length}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </button>
            </div>
          )}

          {/* Sin resultados */}
          {!loading && paginated.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              No hay historial de predicciones para mostrar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryComponent;