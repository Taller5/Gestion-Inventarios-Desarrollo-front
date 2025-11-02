import React, { useState, useEffect } from "react";
import PredictionService, {
  type PredictionRequest,
  type PredictionResponse,
} from "../services/PredictionService";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaRobot,
  FaChartLine,
  FaCalendarDay,
  FaCalendarAlt
} from "react-icons/fa";
import Button from "../ui/Button";
import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import { SearchBar } from "../ui/SearchBar";
import Plot from 'react-plotly.js';
import HistoryComponent from "../ui/HistoryComponent";

const API_URL = import.meta.env.VITE_API_URL;

// --- Tipos de Datos del Formulario ---
interface IAFormState {
  id_products: string;
  fecha_prediccion: string;
  precio_de_venta_esperado: string;
  promocion_activa: string;
}

// --- Componente Principal ---
export const IAPrediction = () => {
  const initialFormState: IAFormState = {
    id_products: "",
    fecha_prediccion: new Date().toISOString().split("T")[0],
    precio_de_venta_esperado: "",
    promocion_activa: "0",
  };

  const [formData, setFormData] = useState<IAFormState>(initialFormState);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearsOptions, setYearsOptions] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [canSelectYears, setCanSelectYears] = useState(false);
  const [anualResult, setAnualResult] = useState<any | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyType, setHistoryType] = useState<"diario" | "anual">("diario");
  

  // Paleta de colores usada en los gráficos
  const colorPalette = [
    "#369FF5", // azul-medio
    "#D6CA4E", // amarillo-claro
    "#4EB353", // verde-claro
  ];

  // Cargar productos al inicio
  useEffect(() => {
    setProductsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/products`)
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
        setFilteredProducts(data);
      })
      .catch(() => {
        setAllProducts([]);
        setFilteredProducts([]);
      })
      .finally(() => setProductsLoading(false));
  }, []);

  // --- Predicción diaria ---
  const handlePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      const data: PredictionRequest = {
        id_products: parseInt(formData.id_products),
        fecha_prediccion: formData.fecha_prediccion,
        precio_de_venta_esperado: parseFloat(formData.precio_de_venta_esperado),
        promocion_activa: parseInt(formData.promocion_activa) as 0 | 1,
      };

      // Validaciones
      if (
        isNaN(data.id_products) ||
        isNaN(data.precio_de_venta_esperado) ||
        data.id_products <= 0
      ) {
        throw new Error("Por favor, introduce ID de producto y precio válidos.");
      }

      const today = new Date();
      const selectedDate = new Date(formData.fecha_prediccion);
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setError("No puedes seleccionar una fecha anterior a hoy para la predicción.");
        setLoading(false);
        return;
      }

      // Consulta diaria
      const response = await PredictionService.getPrediction(data);

      // --- NUEVO HISTORIAL LOCAL DE PREDICCIONES ---
      const res = await fetch(`${API_URL}/api/v1/ia-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          type: "diario",
          product_id: data.id_products,
          future_price: data.precio_de_venta_esperado,
          promotion_active: data.promocion_activa,
          history: [
            {
              prediction_date: formData.fecha_prediccion,
              predicted_quantity: response.cantidad_vendida_estimada,
            }
          ],
        }),
      });

      if (res.ok) {
        console.log("Predicción guardada en el historial correctamente");
        //alert("Predicción guardada en el historial correctamente");
      } else {
        const errorData = await res.json();
        console.error("Error Laravel:", errorData);
       // alert("Error al guardar la predicción en el historial");
      }

      // Calcular años disponibles
      const yearsToShow = ["2026", "2027", "2028", "2029"];
      setYearsOptions(yearsToShow);
      setCanSelectYears(true);

      setResult(response);

    } catch (err: any) {
      setError(err.message || "Error al consultar la predicción.");
    } finally {
      setLoading(false);
    }
  };

// --- Predicción anual ---
const handleYearsSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (selectedYears.length === 0 || selectedYears.length > 3) {
    setError("Selecciona entre 1 y 3 años.");
    return;
  }

  setLoading(true);
  setError(undefined);

  try {
    const anualData = {
      id_products: Number(formData.id_products),
      precio_de_venta_esperado: Number(formData.precio_de_venta_esperado),
      promocion_activa: Number(formData.promocion_activa),
      anios: selectedYears.map(Number),
    };

    // Llamada a tu servicio de predicción (frontend)
    const anualResult = await PredictionService.getPredictionAnual(anualData);
    
    // --- Llamada al backend Laravel ---
    const res = await fetch(`${API_URL}/api/v1/ia-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        type: "anual",
        product_id: anualData.id_products,
        future_price: anualData.precio_de_venta_esperado,
        promotion_active: anualData.promocion_activa,
        history: anualResult.map((item: { mes: string; cantidad: number }) => ({
          month: item.mes,
          quantity: item.cantidad,
        })),
      }),
    });

    if (res.ok) {
      //alert("Predicción guardada en el historial correctamente");
      console.log("Predicción anual guardada en el historial correctamente");
    } else {
      const errorData = await res.json();
      console.error("Error Laravel:", errorData);
      //alert("Error al guardar la predicción anual en el historial");
    }

    setAnualResult(anualResult);

  } catch (err: any) {
    console.error("Error frontend:", err);
    setError(err.message || "Error al consultar la predicción anual.");
  } finally {
    setLoading(false);
  }
};

  // Manejo de selección de producto
  const handleProductSelect = (product: any) => {
    if (!product.id) {
      alert("Error: El producto seleccionado no tiene un ID válido.");
      return;
    }
    setSelectedProduct(product);
    setFormData((prev) => ({ ...prev, id_products: String(product.id) }));
    setSearchQuery(product.nombre_producto);
    setFilteredProducts([]);
  };

  // Manejo de input del SearchBar
  const handleInputChange = (input: string) => {
    setSearchQuery(input);

    if (input.trim() === "") {
      setFilteredProducts([]);
    } else {
      const results = allProducts.filter((p) =>
        [p.nombre_producto, p.codigo_producto, String(p.id)]
          .some((field: string) => field.toLowerCase().includes(input.toLowerCase()))
      );
      setFilteredProducts(results);
    }
  };

  // Reiniciar campos
  const handleReset = () => {
    setFormData({
      ...initialFormState,
      fecha_prediccion: new Date().toISOString().split("T")[0],
    });
    setResult(null);
    setError(undefined);
    setSelectedProduct(null);
    setFilteredProducts(allProducts);
    setSearchQuery("");
    setCanSelectYears(false);
    setSelectedYears([]);
    setYearsOptions([]);
    setAnualResult(null);
  };

  // Manejo de cambios de inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Filtrar productos (callback para SearchBar)
  const handleProductSearch = (results: any[]) => {
    setFilteredProducts(results);
  };

  // Manejo de selección de años
  const handleYearToggle = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.filter((y) => y !== year)
        : prev.length < 3
        ? [...prev, year]
        : prev
    );
    setAnualResult(null);
    setError(undefined);
  };

  // Renderiza la gráfica anual con Plotly
  const renderPlotlyChart = () => {
    if (!anualResult || !Array.isArray(anualResult)) return null;

    const mesesNombre = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    // Agrupa los datos por año y mes
    const grouped: Record<string, number[]> = {};
    selectedYears.forEach(year => {
      grouped[year] = Array(12).fill(0); // 12 meses, inicializa en 0
    });
    anualResult.forEach((item: { mes: string, cantidad: number }) => {
      const [year, month] = item.mes.split("-");
      const idx = parseInt(month, 10) - 1;
      if (grouped[year] && idx >= 0 && idx < 12) {
        grouped[year][idx] = item.cantidad;
      }
    });

    // Cada trace es un año, y para cada mes hay una barra por año
    const traces = Object.keys(grouped).map((year, idx) => ({
      x: mesesNombre,
      y: grouped[year],
      type: 'bar',
      name: year,
      marker: { color: colorPalette[idx % colorPalette.length] },
      hovertemplate:
        `Año: ${year}<br>Mes: %{x}<br>Cantidad Vendida Estimada: %{y}<extra></extra>`,
    }));

    return (
      <Plot
        data={traces}
        layout={{
          title: 'Predicción Mensual por Año',
          xaxis: {
            title: 'Mes',
            tickangle: -45,
            // Plotly usará los valores de x automáticamente como etiquetas
          },
          yaxis: { title: 'Cantidad Vendida Estimada' },
          barmode: 'group',
          autosize: true,
          legend: { orientation: "h", y: -0.2 },
        }}
        style={{ width: '100%', height: '400px' }}
        config={{ responsive: true }}
      />
    );
  };

  // Renderiza la predicción diaria
  const renderPredictionBox = () => {
    if (!result) return null;
    return (
      <div className="p-6 bg-white rounded-lg border-2 border-verde-claro mt-4 shadow-lg">
        <div className="flex items-center mb-4">
          <FaCheckCircle size={32} className="text-verde-claro mr-3" />
          <h3 className="text-2xl font-bold text-verde-oscuro">Predicción Finalizada</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
          <p className="font-semibold">Producto:</p>
          <p>{selectedProduct?.nombre_producto ?? "N/A"}</p>
          <p className="font-semibold">Fecha:</p>
          <p>{result.fecha_prediccion ?? "Sin fecha"}</p>
          <p className="font-semibold">Precio Propuesto:</p>
          <p>
            {result.precio_usado !== undefined
              ? `₡${Number(result.precio_usado).toFixed(2)}`
              : "-"}
          </p>
          <p className="font-semibold">Promoción activa:</p>
          <p>{formData.promocion_activa === "1" ? "Sí" : "No"}</p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-base font-semibold text-gray-800">Cantidad Estimada:</p>
          <p className="text-5xl font-extrabold text-azul-medio mt-1">
            {result.cantidad_vendida_estimada ?? "-"}{" "}
            <span className="text-lg font-normal text-gray-500">
              {result.unidad ?? ""}
            </span>
          </p>
        </div>
      </div>
    );
  };

 const user = JSON.parse(localStorage.getItem("user") || "{}");
 const userId = user.id;

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "vendedor", "bodeguero"]}>
      <Container
        page={
          <div className="p-6 bg-white shadow-xl rounded-xl max-w-4xl mx-auto my-10">
            <h1 className="text-3xl font-bold mb-6 text-azul-medio flex items-center">
              <FaRobot className="mr-3" /> Herramienta de Predicción de Demanda
            </h1>

            <Button
              onClick={() => window.history.back()}
              style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-2 px-3 mb-4 cursor-pointer mr-20 rounded-lg flex items-center gap-2"
            >
              <span className="whitespace-nowrap text-base">Volver a Inventario</span>
            </Button>


            {showHistoryModal && (
              <HistoryComponent
                userId={userId}
                onClose={() => setShowHistoryModal(false)}
                initialType={historyType}
              />
            )}
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* COLUMNA 1: FORMULARIO DE ENTRADA */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  1. Ingresa Datos para la Predicción
                </h2>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccione un producto:
                </label>

                {productsLoading ? (
                  <div className="text-center text-gray-500">Cargando productos...</div>
                ) : (
                  <SearchBar
                    data={filteredProducts}
                    displayField="nombre_producto"
                    searchFields={["nombre_producto", "codigo_producto", "id"]}
                    placeholder="Buscar producto por nombre, código o ID..."
                    onSelect={handleProductSelect}
                    onResultsChange={handleProductSearch}
                    resultFormatter={(item) =>
                      `${item.nombre_producto ?? "N/A"}, Codigo: ${item.codigo_producto}`
                    }
                    value={searchQuery}
                    onInputChange={handleInputChange}
                  />
                )}

                {selectedProduct && (
                  <div className="my-2 text-sm text-gray-600">
                    <span className="font-semibold">Producto seleccionado:</span>{" "}
                    {selectedProduct.nombre_producto} (ID: {selectedProduct.codigo_producto})
                  </div>
                )}

                <PredictionForm
                  formData={formData}
                  handleChange={handleChange}
                  onSubmit={handlePrediction}
                  loading={loading}
                  error={error}
                />

                <button
                  type="button"
                  className="w-full py-2 mt-2 rounded-lg font-bold text-white shadow-md transition duration-150 bg-gray-400 hover:bg-gray-500 cursor-pointer"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reiniciar campos
                </button>
              </div>

              {/* COLUMNA 2: RESULTADO DE PREDICCIÓN DIARIA Y ANUAL */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col justify-center">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  2. Resultado de la Consulta
                </h2>

                {loading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-sky-500"></div>
                    <p className="ml-3 text-azul-medio">Calculando demanda...</p>
                  </div>
                )}

                {error && !loading && <AlertMessage type="error" message={error} />}
                {result && !loading && !error && renderPredictionBox()}

                {!result && !loading && !error && (
                  <div className="text-center p-8 text-gray-400">
                    <FaChartLine size={48} className="mx-auto mb-2" />
                    <p>Presiona "Consultar Predicción" para ver los resultados.</p>
                  </div>
                )}

                {/* Selección de años para predicción mensual */}
                {canSelectYears && (
                  <form onSubmit={handleYearsSubmit} className="mt-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecciona hasta 3 años para ver la predicción mensual:
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {yearsOptions.map((year) => (
                        <button
                          type="button"
                          key={year}
                          className={`px-4 py-2 rounded-lg font-bold border transition
                            ${selectedYears.includes(year)
                              ? "bg-azul-medio text-white border-azul-oscuro "
                              : "bg-white text-azul-oscuro border-gray-300 hover:bg-azul-medio hover:text-white"}
                            hover:bg-azul-hover hover:border-azul-oscuro cursor-pointer`}
                          onClick={() => handleYearToggle(year)}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className={`w-full py-2 rounded-lg font-bold text-white shadow-md transition duration-150
                        ${selectedYears.length === 0 || loading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-azul-medio hover:bg-azul-hover cursor-pointer"}`}
                      disabled={selectedYears.length === 0 || loading}
                    >
                      Consultar predicción mensual
                    </button>
                    {selectedYears.length === 0 && (
                      <div className="text-xs text-rojo-claro mt-2">
                        Selecciona al menos un año para consultar la predicción mensual.
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* GRÁFICO DE PREDICCIÓN ANUAL EN LA PARTE INFERIOR */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                3. Gráfico de Predicción Anual
              </h2>
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-azul-medio"></div>
                  <p className="ml-3 text-azul-medio">Actualizando gráfico...</p>
                </div>
              )}
              {!loading && anualResult && renderPlotlyChart()}
              {!loading && !anualResult && (
                <div className="text-center p-8 text-gray-400">
                  <p>Realiza una consulta anual para ver el gráfico.</p>
                </div>
              )}
            </div>

            {/* --- DISEÑO DE HISTORIAL EN APARTADO 4 --- */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                4. Historial de Predicciones
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <button
                  type="button"
                  className="rounded-lg border border-gris-ultra-claro flex flex-col p-6 justify-center items-center hover:scale-105 transition-transform hover:text-azul-medio bg-white shadow"
                  onClick={() => {
                    setShowHistoryModal(true);
                    setHistoryType("diario");
                  }}
                >
                  <FaCalendarDay size={40} className="text-azul-medio mb-2" />
                  <span className="font-semibold text-center text-lg">Historial Diario</span>
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gris-ultra-claro flex flex-col p-6 justify-center items-center hover:scale-105 transition-transform hover:text-azul-medio bg-white shadow"
                  onClick={() => {
                    setShowHistoryModal(true);
                    setHistoryType("anual");
                  }}
                >
                  <FaCalendarAlt size={40} className="text-azul-medio mb-2" />
                  <span className="font-semibold text-center text-lg">Historial Anual</span>
                </button>
              </div>
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
};

export default IAPrediction;

// ---------------------------
// --- Sub-Componentes
// ---------------------------

interface PredictionFormProps {
  formData: IAFormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | undefined;
}

const PredictionForm: React.FC<PredictionFormProps> = ({
  formData,
  handleChange,
  onSubmit,
  loading,
  error,
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Fecha de Predicción:</label>
        <input
          type="date"
          name="fecha_prediccion"
          value={formData.fecha_prediccion}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
          className="outline-none w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Propuesto (₡):</label>
        <input
          type="number"
          name="precio_de_venta_esperado"
          value={formData.precio_de_venta_esperado}
          onChange={handleChange}
          className="outline-none w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          step="0.01"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Promoción Activa:</label>
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-bold border transition ${
              formData.promocion_activa === "1"
                ? "bg-verde-claro text-white border-verde-oscuro"
                : "bg-white text-gray-700 border-gray-300"
            }`}
            onClick={() =>
              handleChange({ target: { name: "promocion_activa", value: "1" } } as any)
            }
          >
            Sí
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-bold border transition ${
              formData.promocion_activa === "0"
                ? "bg-rojo-claro text-white border-rojo-oscuro"
                : "bg-white text-gray-700 border-gray-300"
            }`}
            onClick={() =>
              handleChange({ target: { name: "promocion_activa", value: "0" } } as any)
            }
          >
            No
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rojo-ultra-claro text-rojo-claro border-rojo-oscuro px-4 py-2 rounded-lg text-sm font-semibold">
          Error: {error}
        </div>
      )}

      <button
        type="submit"
        className={`w-full py-2 mt-4 rounded-lg font-bold text-white shadow-md transition duration-150 ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-azul-medio hover:bg-azul-hover cursor-pointer"
        }`}
        disabled={loading}
      >
        {loading ? "Calculando..." : "Generar Predicción"}
      </button>
    </form>
  );
};

interface AlertMessageProps {
  type: "error" | "success";
  message: string;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message }) => (
  <div
    className={`flex items-center p-4 rounded-lg ${
      type === "error"
        ? "bg-rojo-ultra-claro text-rojo-claro border-rojo-oscuro"
        : "bg-verde-ultra-claro text-verde-oscuro border-verde-claro"
    } border`}
    role="alert"
  >
    {type === "error" ? <FaExclamationTriangle className="mr-3" /> : <FaCheckCircle className="mr-3" />}
    <span className="text-sm font-medium">{message}</span>
  </div>
);
