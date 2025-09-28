import React, { useState } from 'react';
import PredictionService, { type PredictionRequest, type PredictionResponse } from '../services/PredictionService'; 
import { FaChartLine, FaExclamationTriangle, FaCheckCircle, FaRobot } from 'react-icons/fa'; 

// --- Tipos de Datos del Formulario ---
interface IAFormState {
  id_products: string;
  fecha_prediccion: string;
  precio_de_venta_esperado: string;
  promocion_activa: string;
}

// --- Componente Principal ---
export const IAPrediction = () => {
  const [formData, setFormData] = useState<IAFormState>({
    id_products: '',
    fecha_prediccion: new Date().toISOString().split('T')[0],
    precio_de_venta_esperado: '',
    promocion_activa: '0',
  });
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Lógica de predicción que será llamada por el botón de consulta
  const handlePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    setResult(null);

    try {
      // 1. Conversión y validación de tipos
      const data: PredictionRequest = {
        id_products: parseInt(formData.id_products),
        fecha_prediccion: formData.fecha_prediccion,
        precio_de_venta_esperado: parseFloat(formData.precio_de_venta_esperado),
        promocion_activa: parseInt(formData.promocion_activa) as 0 | 1,
      };

      if (isNaN(data.id_products) || isNaN(data.precio_de_venta_esperado) || data.id_products <= 0) {
        throw new Error("Por favor, introduce ID de producto y precio válidos.");
      }

      // 2. Llamada al Servicio
      const response = await PredictionService.getPrediction(data);
      
      // 3. Resultado listo para mostrar
      setResult(response);
      
    } catch (err: any) {
      setError(err.message || 'Error al obtener la predicción.');
    } finally {
      setLoading(false);
    }
  };

  // Lógica para el manejo de inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl max-w-4xl mx-auto my-10">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700 flex items-center">
        <FaRobot className="mr-3" /> Herramienta de Predicción de Demanda
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* COLUMNA 1: FORMULARIO DE ENTRADA */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">1. Ingresa Datos para la Predicción</h2>
          
          <PredictionForm 
            formData={formData} 
            handleChange={handleChange} 
            onSubmit={handlePrediction} 
            loading={loading} 
            error={error}
          />
        </div>
        
        {/* COLUMNA 2: RESULTADO DE LA PREDICCIÓN */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">2. Resultado de la Consulta</h2>
          
          {loading && (
             <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <p className="ml-3 text-indigo-600">Calculando demanda...</p>
            </div>
          )}

          {error && !loading && (
            <AlertMessage type="error" message={error} />
          )}

          {result && !loading && !error && (
            <PredictionResult result={result} />
          )}

          {!result && !loading && !error && (
            <div className="text-center p-8 text-gray-400">
                <FaChartLine size={48} className="mx-auto mb-2" />
                <p>Presiona "Consultar Predicción" para ver los resultados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default IAPrediction;

// -----------------------------------------------------------------
// --- Sub-Componentes (Formulario, Resultado, Alerta) ---
// -----------------------------------------------------------------

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
            
            {/* 1. ID Producto */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Producto:</label>
                <input 
                    type="number" 
                    name="id_products" 
                    value={formData.id_products} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    min="1"
                    required
                />
            </div>
            
            {/* 2. FECHA DE PREDICCIÓN (CAMPO FALTANTE) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Predicción:</label>
                <input 
                    type="date" 
                    name="fecha_prediccion" 
                    value={formData.fecha_prediccion} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                />
            </div>
            
            {/* 3. PRECIO ESPERADO (CAMPO FALTANTE) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Esperado ($):</label>
                <input 
                    type="number" 
                    name="precio_de_venta_esperado" 
                    value={formData.precio_de_venta_esperado} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    step="0.01"
                    min="0"
                    required
                />
            </div>

            {/* 4. Selector de Promoción */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promoción Activa:</label>
                <select
                    name="promocion_activa"
                    value={formData.promocion_activa}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                    <option value="0">No (0)</option>
                    <option value="1">Sí (1)</option>
                </select>
            </div>
            
            {/* Mensaje de Error (Si lo hay) */}
            {error && (
                <div className="bg-red-100 text-red-700 border border-red-400 px-4 py-2 rounded-lg text-sm font-semibold">
                    Error: {error}
                </div>
            )}

            {/* Botón de Envío */}
            <button 
                type="submit" 
                className={`w-full py-2 mt-4 rounded-lg font-bold text-white shadow-md transition duration-150 ${
                    loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                disabled={loading}
            >
                {loading ? 'Calculando...' : 'Consultar Predicción'}
            </button>
        </form>
    );
}


// ... (El resto de los componentes PredictionResult y AlertMessage deben estar definidos debajo de IAPrediction en este archivo)
// --- 2.2 Resultado ---
interface PredictionResultProps {
    result: PredictionResponse;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => (
    <div className="p-6 bg-white rounded-lg border-2 border-green-400">
        <div className="flex items-center mb-4">
            <FaCheckCircle size={32} className="text-green-500 mr-3" />
            <h3 className="text-2xl font-bold text-green-700">Predicción Finalizada</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <p className="font-semibold">Producto ID:</p><p>{result.id_products}</p>
            <p className="font-semibold">Fecha:</p><p>{result.fecha_prediccion}</p>
            <p className="font-semibold">Precio Usado:</p><p>${result.precio_usado.toFixed(2)}</p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-base font-semibold text-gray-800">Cantidad Estimada:</p>
            <p className="text-5xl font-extrabold text-indigo-600 mt-1">
                {result.cantidad_vendida_estimada} <span className="text-lg font-normal text-gray-500">{result.unidad}</span>
            </p>
        </div>
    </div>
);

// --- 2.3 Alerta ---
interface AlertMessageProps {
    type: 'error' | 'success';
    message: string;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message }) => (
    <div className={`flex items-center p-4 rounded-lg ${
        type === 'error' 
            ? 'bg-red-100 border-red-400 text-red-700' 
            : 'bg-green-100 border-green-400 text-green-700'
    } border`} role="alert">
        {type === 'error' ? <FaExclamationTriangle className="mr-3" /> : <FaCheckCircle className="mr-3" />}
        <span className="text-sm font-medium">{message}</span>
    </div>
);