import { useEffect, useState } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

interface NavProps {
  logo?: string;
}

export default function Nav({ logo }: NavProps) {
  const [user, setUser] = useState<{
    name?: string;
    profile_photo?: string;
  } | null>(null);

  const isLoginPage = window.location.pathname === "/login";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) setUser(JSON.parse(updatedUser));
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setUser(null);
    window.location.href = "/"; // redirige al home
  };

  const handleLogoClick = () => {
    if (window.location.pathname !== "/") {
      window.location.href = "/"; // redirige solo si no estamos ya en home
    }
  };

  return (
    <nav className="bg-white flex items-center justify-between py-1 px-7 shadow h-[80px] w-full top-0 left-0">
      <button
        type="button"
        onClick={handleLogoClick}
        className="font-bold text-xl text-verde-oscuro cursor-pointer p-0 border-0 bg-transparent"
      >
        <img className="w-20 h-10" src={logo || "/img/logo.png"} alt="logo" />
      </button>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            {/* Perfil clickeable */}
            <div
              role="presentation" 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => (window.location.href = "/profile")}
            >
              {user.profile_photo && (
                <img
                  className="w-10 h-10 rounded-full"
                  src={
                    user.profile_photo.startsWith("http")
                      ? user.profile_photo
                      : `${API_URL}/${user.profile_photo}`
                  }
                  alt="Perfil"
                />
              )}
              {user.name && <span className="font-medium">{user.name}</span>}
            </div>

            <button
              onClick={handleLogout}
              className="bg-rojo-claro hover:bg-rojo-oscuro cursor-pointer text-white px-3 py-1 rounded ml-2 flex items-center gap-1"
            >
              <FaSignOutAlt /> Cerrar sesión
            </button>
          </>
        ) : (
          !isLoginPage && (
            <button
              onClick={() => (window.location.href = "/login")}
              className="bg-azul-medio hover:bg-azul-hover cursor-pointer text-white px-3 py-1 rounded flex items-center gap-1"
            >
              <FaUser /> Iniciar sesión
            </button>
          )
        )}
      </div>
    </nav>
  );
}
