const API_URL = import.meta.env.VITE_API_URL;
let inactivityTimeout: any;
let onInactivity: (() => void) | null = null; // callback cuando haya inactividad

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
  // ------------------- LOGIN -------------------
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          "Demasiados intentos. Espere un minuto antes de volver a intentarlo."
        );
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Credenciales inválidas");
    }

    const data: LoginResponse = await response.json();
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Inicia el timer de inactividad al hacer login
    LoginService.startInactivityTimer();

    return data;
  }

  // ------------------- LOGOUT -------------------
  static logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    clearTimeout(inactivityTimeout);
  }

  // ------------------- CHEQUEOS -------------------
  static isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  }

  static getUser(): any {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  // ------------------- INACTIVIDAD -------------------
  static setInactivityCallback(callback: () => void) {
    onInactivity = callback;
  }

  static startInactivityTimer() {
    // Limpia cualquier timer previo
    clearTimeout(inactivityTimeout);

    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(
        () => {
          LoginService.logout();
          if (onInactivity) {
            onInactivity(); // dispara callback para mostrar modal
          } else {
            alert("Sesión cerrada por inactividad");
            window.location.href = "/login"; // redirige si no hay modal
          }
        },
        15 * 60 * 1000
      ); // 1 minuto para prueba
    };

    // Eventos que reinician el timer
    ["click", "mousemove", "keydown"].forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    // Inicializa el timer al arrancar
    resetTimer();
  }
}

// Si el usuario ya está logueado al cargar la app, inicia el timer automáticamente
if (LoginService.isAuthenticated()) {
  LoginService.startInactivityTimer();
}
