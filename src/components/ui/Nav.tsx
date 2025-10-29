import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

interface NavProps {
  logo?: string;
  onHamburgerClick?: () => void; // opcional para sidebar
}

export default function Nav({ logo, onHamburgerClick }: NavProps) {
  const [user, setUser] = useState<{ name?: string; profile_photo?: string } | null>(null);
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
    window.location.href = "/";
  };

  const handleLogoClick = () => {
    if (window.location.pathname !== "/") window.location.href = "/";
  };

  return (
   <nav className="bg-white flex items-center justify-between py-2 px-4 lg:px-7 shadow h-[80px] w-full top-0 left-0">
  <div className="flex items-center gap-3">
    {/* Botón hamburguesa visible solo en móvil */}
    {onHamburgerClick && (
      <button
        className="lg:hidden text-2xl font-bold text-azul-oscuro cursor-pointer hover:text-azul-hover flex-shrink-0"
        onClick={onHamburgerClick}
      >
        ☰
      </button>
    )}

    {/* Logo */}
    <button
      type="button"
      onClick={handleLogoClick}
      className="font-bold text-xl text-verde-oscuro cursor-pointer p-0 border-0 bg-transparent flex-shrink-0"
    >
      <img
        className="w-16 h-8 sm:w-20 sm:h-10 object-contain"
        src={logo || "/img/logo.png"}
        alt="logo"
      />
    </button>
  </div>

  <div className="flex items-center gap-2">
    {user ? (
      <>
        {/* Foto de perfil móvil */}
        <Link to="/profile" className="flex items-center cursor-pointer lg:hidden">
          {user.profile_photo ? (
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={user.profile_photo.startsWith("http") ? user.profile_photo : `${API_URL}/${user.profile_photo}`}
              alt="Perfil"
            />
          ) : (
            <FaUser className="w-10 h-10 text-verde-oscuro" />
          )}
        </Link>

        {/* Perfil completo desktop */}
        <Link
          to="/profile"
          className="hidden lg:flex items-center gap-2 cursor-pointer"
        >
          {user.profile_photo ? (
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={user.profile_photo.startsWith("http") ? user.profile_photo : `${API_URL}/${user.profile_photo}`}
              alt="Perfil"
            />
          ) : (
            <FaUser className="w-10 h-10 text-verde-oscuro" />
          )}
          {user.name && <span className="font-medium">{user.name}</span>}
        </Link>

        {/* Botón logout siempre */}
        <button
          onClick={handleLogout}
          className="bg-rojo-claro hover:bg-rojo-oscuro cursor-pointer text-white px-3 py-1 rounded ml-2 flex items-center gap-1"
        >
          <FaSignOutAlt /> <span className="hidden lg:inline">Cerrar sesión</span>
        </button>
      </>
    ) : (
      !isLoginPage && (
        <button
          onClick={() => (window.location.href = "/login")}
          className="bg-azul-medio hover:bg-azul-hover cursor-pointer text-white px-3 py-1 rounded flex items-center gap-1"
        >
          <FaUser /> <span className="hidden lg:inline">Iniciar sesión</span>
        </button>
      )
    )}
  </div>
</nav>

  );
} 