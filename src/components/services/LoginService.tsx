const API_URL = import.meta.env.VITE_API_URL;

// services/LoginService.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export class LoginService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // Si el backend responde con 429, muestra un mensaje especial
      if (response.status === 429) {
        throw new Error("Demasiados intentos. Espere un minuto antes de volver a intentarlo.");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Credenciales inválidas');
    }

    const data: LoginResponse = await response.json();
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  static logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  static getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
