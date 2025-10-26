import axios from 'axios';
const API_IA_URL = import.meta.env.VITE_IA_URL;

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
  fecha_prediccion: string;
  cantidad_vendida_estimada: number;
  unidad: string;
  precio_usado: number;
  nombre_producto?: string;      // <-- Agregado
  promocion_activa?: number;     // <-- Agregado
}

export interface PredictionAnualRequest {
  id_products: number;
  precio_de_venta_esperado: number;
  promocion_activa: number;
  anios: number[]; // <-- Cambiado a anios y tipo number[]
}

export interface PredictionAnualResponse {
  [year: string]: {
    [month: string]: number; // Ejemplo: { "2026": { "01": 123, "02": 456, ... } }
  };
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
      
    } catch (error: any) {
      // Manejo de errores de red/backend
      if (axios.isAxiosError(error)) {
        // Devuelve el detalle del error si lo proporciona FastAPI
        throw new Error(error.response?.data?.detail || 'Error de conexión con el backend.');
      }
      throw new Error('No se pudo conectar con el servicio de predicción. Asegúrate de que FastAPI esté corriendo en http://localhost:8001.');
    }
  }

  async getPredictionAnual(data: PredictionAnualRequest): Promise<any[]> {
    const url = `${API_IA_URL}/predict_anual_quantity`;
    try {
      const response = await axios.post<any[]>(url, data);
      if (response.status !== 200) {
        throw new Error('La API respondió con un error al procesar la predicción anual.');
      }
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || 'Error de conexión con el backend.');
      }
      throw new Error('No se pudo conectar con el servicio de predicción anual.');
    }
  }
}

export default new PredictionService();
