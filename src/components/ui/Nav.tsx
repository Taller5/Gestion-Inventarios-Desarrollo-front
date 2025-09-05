import { useEffect, useState } from "react";

interface NavProps {
  logo?: string;
}

export default function Nav({ logo }: NavProps) {
  const [user, setUser] = useState<{ name?: string; profile_photo?: string } | null>(null);

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

  return (
    <nav className="bg-white flex items-center justify-between py-1 px-7 shadow h-[80px] w-full top-0 left-0">
      <div className="font-bold text-xl text-verde-oscuro">
        <img className="w-20 h-10" src={logo || "/img/logo.png"} alt="logo" />
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            {user.profile_photo && (
              <img
                className="w-10 h-10 rounded-full"
                src={user.profile_photo.startsWith("http") ? user.profile_photo : `http://localhost:8000/${user.profile_photo}`}
                alt="Perfil"
              />
            )}
            {user.name && <span className="font-medium">{user.name}</span>}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-3 py-1 rounded ml-2"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-blue-500 hover:bg-blue-600  cursor-pointer text-white px-3 py-1 rounded"
          >
            Iniciar sesión
          </button>
        )}
      </div>
    </nav>
  );
}
