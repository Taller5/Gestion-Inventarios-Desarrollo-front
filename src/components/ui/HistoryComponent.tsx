import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { SearchBar } from "./SearchBar";

const API_URL = import.meta.env.VITE_API_URL;

interface IAHistoryDiario {
  id: number;
  type: "diario";
  product_id: string;
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
  product_id: string | number; // <-- usa product_id
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
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: number]: boolean }>({});
  const [productos, setProductos] = useState<{ id: string | number; nombre_producto: string }[]>([]);
  const [filterProduct, setFilterProduct] = useState<{ id: string | number; nombre_producto: string } | null>(null);
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterPromotion, setFilterPromotion] = useState<"" | "0" | "1">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBarKey, setSearchBarKey] = useState(0);
  

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

  useEffect(() => {
    fetch(`${API_URL}/api/v1/products`)
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch(() => setProductos([]));
  }, []);
  useEffect(() => {
  setPage(1);
}, [filterProduct, filterDate, filterPromotion, searchQuery]);

  // Bloquea el scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const toggleDropdown = (id: number) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredHistories = histories.filter((h) => {
    // Filtra por producto
    const matchProduct = !filterProduct || String(h.product_id) === String(filterProduct.id);
    // Filtra por fecha (solo para diario)
    const matchDate =
      !filterDate ||
      (h.type === "diario" &&
        (
          Array.isArray(h.history)
            ? h.history.some((item) => item.prediction_date === filterDate)
            : h.history && "prediction_date" in h.history && h.history.prediction_date === filterDate
        )
      );
    // Filtra por promoción
    const matchPromotion =
      !filterPromotion || String(h.promotion_active) === filterPromotion;
    return matchProduct && matchDate && matchPromotion;
  });
  const paginated = filteredHistories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getProductName(product_id: string | number) {
    const prod = productos.find(p => String(p.id) === String(product_id));
    return prod ? prod.nombre_producto : product_id;
  }

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Fondo translúcido con blur */}
  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

  {/* Modal */}
  <div
    className="relative bg-white rounded-lg shadow-lg pointer-events-auto overflow-y-auto p-10"
    style={{
      width: "50rem",
      maxHeight: "90vh",
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    }}
  >
       <button
  className="absolute top-2 right-2 text-rojo-claro hover:text-rojo-oscuro text-4xl font-bold p-2"
  onClick={onClose}
>
  &times;
</button>

        <h2 className="text-2xl font-bold mb-4 text-azul-medio">Historial de Predicciones</h2>

        <div className="mb-6 flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between">
  {/* Filtro por producto */}
  <div className="w-full sm:w-1/3 min-w-[200px]">
    <SearchBar
      key={searchBarKey}
      data={productos}
      displayField="nombre_producto"
      searchFields={["nombre_producto", "id"]}
      placeholder="Buscar producto..."
      onSelect={setFilterProduct}
      value={searchQuery}
      onInputChange={setSearchQuery}
      resultFormatter={(item) =>
        `${item.nombre_producto ?? "N/A"} (ID: ${item.id})`
      }
    />
  </div>

  {/* Filtro por fecha SOLO para diario */}
  <div className="w-full sm:w-auto">
    {selectedType === "diario" && (
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
        placeholder="Filtrar por fecha"
      />
    )}
  </div>

  {/* Filtro por promoción */}
  <div className="w-full sm:w-auto">
    <select
      value={filterPromotion}
      onChange={(e) => setFilterPromotion(e.target.value as "" | "0" | "1")}
      className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
    >
      <option value="">Promoción</option>
      <option value="1">Sí</option>
      <option value="0">No</option>
    </select>
  </div>

  {/* Limpiar filtros */}
  <div className="w-full sm:w-auto">
    <button
      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold w-full sm:w-auto"
      onClick={() => {
        setFilterProduct(null);
        setSearchQuery("");
        setFilterDate("");
        setFilterPromotion("");
        setPage(1);
        setSearchBarKey(prev => prev + 1); // fuerza el reset del SearchBar
      }}
    >
      Limpiar filtros
    </button>
  </div>
</div>


        <div
          className="flex-1 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 120px)", paddingRight: "8px" }} // Área scrollable interna
        >
          {loading && (
            <div className="text-center text-gray-400 py-8">Cargando historial...</div>
          )}

          {/* Tarjetas para diario */}
          {selectedType === "diario" && !loading && paginated.length > 0 && (
            <div className="grid gap-4">
              {paginated
                .filter((h): h is IAHistoryDiario => h.type === "diario")
                .map((h) => {
                  const historyItems = Array.isArray(h.history) ? h.history : [h.history];
                  return (
                    <div key={h.id} className="p-4 bg-white rounded-lg shadow border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-azul-medio">{getProductName(h.product_id)}</span>
                        <span className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        <span>Fecha a predecir:</span>
                        <span>{historyItems[0]?.prediction_date
                          ? historyItems[0].prediction_date
                          : "Sin fecha"}</span>
                        <span>Precio Propuesto:</span>
                        <span>₡{h.future_price.toFixed(2)}</span>
                        <span>Promoción activa:</span>
                        <span>{h.promotion_active === 1 ? "Sí" : "No"}</span>
                      </div>
                      {/* Mostrar todas las predicciones guardadas */}
                      {historyItems.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-2 text-sm border-t border-gray-200 pt-2 mt-2">
                          <span>Cantidad estimada:</span>
                          <span className="font-semibold text-azul-medio">{item.predicted_quantity}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Tabla mejorada para anual */}
          {selectedType === "anual" && !loading && paginated.length > 0 && (
            <div className="mb-6">
              {paginated
                .filter((h): h is IAHistoryAnual => h.type === "anual")
                .map((h) => {
                  const isOpen = openDropdowns[h.id] || false;
                  return (
                    <div key={h.id} className="mb-4 bg-white rounded-lg shadow border border-gray-200 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-azul-medio">{getProductName(h.product_id)}</span>
                        <span className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        <span>Precio Propuesto:</span>
                        <span>₡{h.future_price.toFixed(2)}</span>
                        <span>Promoción activa:</span>
                        <span>{h.promotion_active === 1 ? "Sí" : "No"}</span>
                      </div>
                      <button
                        className="flex items-center gap-2 text-azul-medio font-semibold py-2 px-3 rounded hover:bg-azul-ultra-claro transition"
                        onClick={() => toggleDropdown(h.id)}
                        aria-expanded={isOpen}
                      >
                        <span>Ver detalle de meses</span>
                        <span className="transition-transform duration-300">
                          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                      </button>
                      <div
                        style={{
                          maxHeight: isOpen ? "500px" : "0px",
                          overflow: "hidden",
                          transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {isOpen && (
                          <div className="overflow-x-auto mt-2">
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
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Sin resultados */}
          {!loading && paginated.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              No hay historial de predicciones para mostrar.
            </div>
          )}
        </div>
        {/* Paginación siempre dentro del modal */}
        {!loading && filteredHistories.length > PAGE_SIZE && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              className={`px-4 py-2 rounded-lg font-semibold shadow transition 
                ${page === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-azul-medio text-white hover:bg-azul-oscuro hover:scale-105"}
              `}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Anterior
            </button>
            <span className="px-4 py-2 rounded-lg bg-azul-ultra-claro text-azul-medio font-bold shadow">
              Página {page}
            </span>
            <button
              className={`px-4 py-2 rounded-lg font-semibold shadow transition 
                ${page * PAGE_SIZE >= filteredHistories.length
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-azul-medio text-white hover:bg-azul-oscuro hover:scale-105"}
              `}
              disabled={page * PAGE_SIZE >= filteredHistories.length}
              onClick={() => setPage(page + 1)}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryComponent;