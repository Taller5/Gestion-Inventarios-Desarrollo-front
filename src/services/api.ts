const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RequestOptions extends RequestInit {
  token?: string;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.token && { 'Authorization': `Bearer ${options.token}` }),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorText = await response.text();
      const errorData = errorText ? JSON.parse(errorText) : {};
      throw new Error(errorData.message || 'Error en la solicitud');
    }

    const text = await response.text();
    if (!text) {
      return [] as T; // o null, según lo que esperes
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


export const get = <T>(endpoint: string, token?: string) =>
  apiRequest<T>(endpoint, { method: 'GET', token });

export const post = <T>(endpoint: string, data: any, token?: string) =>
  apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    token
  });

export const put = <T>(endpoint: string, data: any, token?: string) =>
  apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    token
  });

export const del = <T>(endpoint: string, token?: string) =>
  apiRequest<T>(endpoint, { method: 'DELETE', token });
