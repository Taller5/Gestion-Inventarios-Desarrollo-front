import axios from 'axios';
// La URL base de tu API de FastAPI
//const API_URL = import.meta.env.VITE_API_URL;
const API_IA_URL = 'http://localhost:8001'; 

// --- Tipos de Datos ---

/**
 * Define la estructura de los datos que el Frontend envía al API.
 * Debe coincidir con el schema Pydantic que espera tu endpoint en FastAPI.
 */
export interface PredictionRequest {
  id_products: number;
  fecha_prediccion: string; // YYYY-MM-DD
  precio_de_venta_esperado: number;
  promocion_activa: 0 | 1;
}

/**
 * Datos que se reciben del API
 */
export interface PredictionResponse {
  id_products: number;
  fecha_prediccion: string;
  precio_usado: number;
  cantidad_vendida_estimada: number;
  unidad: string; // Ejemplo: "Unidades", "Litros", etc.
}

// --- Clase del Servicio ---

class PredictionService {
  /**
   * Envía los datos de consulta al endpoint de predicción.
   */
  async getPrediction(data: PredictionRequest): Promise<PredictionResponse> {
    const url = `${API_IA_URL}/predict_quantity`;
    
    try {
      // Realiza la petición HTTP POST
      const response = await axios.post<PredictionResponse>(url, data);
      
      if (response.status !== 200) {
        throw new Error('La API respondió con un error al procesar la predicción.');
      }
      return response.data;
      
    } catch (error) {
      // Manejo de errores de red/backend
      if (axios.isAxiosError(error)) {
        // Devuelve el detalle del error si lo proporciona FastAPI
        throw new Error(error.response?.data?.detail || 'Error de conexión con el backend.');
      }
      throw new Error('No se pudo conectar con el servicio de predicción. Asegúrate de que FastAPI esté corriendo en http://localhost:8001.');
    }
  }
}

export default new PredictionService();
