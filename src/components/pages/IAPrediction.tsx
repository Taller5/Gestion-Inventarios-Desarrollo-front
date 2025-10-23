import React, { useState, useEffect } from "react";
import PredictionService, {
  type PredictionRequest,
  type PredictionResponse,
} from "../services/PredictionService";
import {
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaRobot,
} from "react-icons/fa";
import Button from "../ui/Button";
import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import { SearchBar } from "../ui/SearchBar";

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
const [showDropdown, setShowDropdown] = useState(false); // Control del dropdown
showDropdown; // <-- Esto evita el error de variable no usada

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

  // Manejo de la predicción
  const handlePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    setResult(null);

    try {
      const data: PredictionRequest = {
        id_products: parseInt(formData.id_products),
        fecha_prediccion: formData.fecha_prediccion,
        precio_de_venta_esperado: parseFloat(formData.precio_de_venta_esperado),
        promocion_activa: parseInt(formData.promocion_activa) as 0 | 1,
      };

      if (isNaN(data.id_products) || isNaN(data.precio_de_venta_esperado) || data.id_products <= 0) {
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

      const response = await PredictionService.getPrediction(data);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Error al obtener la predicción.");
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
    setShowDropdown(false); // Cerrar dropdown al seleccionar
  };

  // Manejo de input del SearchBar
  const handleInputChange = (input: string) => {
    setSearchQuery(input);

    if (input.trim() === "") {
      setFilteredProducts([]);
      setShowDropdown(false);
    } else {
      const results = allProducts.filter((p) =>
        [p.nombre_producto, p.codigo_producto, String(p.id)]
          .some((field: string) => field.toLowerCase().includes(input.toLowerCase()))
      );
      setFilteredProducts(results);
      setShowDropdown(results.length > 0);
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
    setFilteredProducts([]);
    setSearchQuery("");
    setShowDropdown(false); // cerrar dropdown
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
    setShowDropdown(results.length > 0);
  };

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

              {/* COLUMNA 2: RESULTADO DE LA PREDICCIÓN */}
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
                {result && !loading && !error && <PredictionResult result={result} />}

                {!result && !loading && !error && (
                  <div className="text-center p-8 text-gray-400">
                    <FaChartLine size={48} className="mx-auto mb-2" />
                    <p>Presiona "Consultar Predicción" para ver los resultados.</p>
                  </div>
                )}
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

const PredictionForm: React.FC<PredictionFormProps> = ({ formData, handleChange, onSubmit, loading, error }) => {
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

interface PredictionResultProps {
  result: PredictionResponse;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => (
  <div className="p-6 bg-white rounded-lg border-2 border-verde-claro">
    <div className="flex items-center mb-4">
      <FaCheckCircle size={32} className="text-verde-claro mr-3" />
      <h3 className="text-2xl font-bold text-verde-oscuro">Predicción Finalizada</h3>
    </div>
    <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
      <p className="font-semibold">Producto ID:</p>
      <p>{result.id_products}</p>
      <p className="font-semibold">Fecha:</p>
      <p>{result.fecha_prediccion}</p>
      <p className="font-semibold">Precio Propuesto:</p>
      <p>₡{result.precio_usado.toFixed(2)}</p>
    </div>
    <div className="mt-4 pt-3 border-t border-gray-200">
      <p className="text-base font-semibold text-gray-800">Cantidad Estimada:</p>
      <p className="text-5xl font-extrabold text-azul-medio mt-1">
        {result.cantidad_vendida_estimada} <span className="text-lg font-normal text-gray-500">{result.unidad}</span>
      </p>
    </div>
  </div>
);

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
