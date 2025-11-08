import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import DashboardInformation from "../ui/DashboardComponents/DashboardInformation";
import DashboardGraphics from "../ui/DashboardComponents/DashboardGraphics";
import { useEffect, useState } from "react";
import type { Branch } from "../ui/DashboardComponents/DashboardInformation";
import DashboardButtons from "../ui/DashboardComponents/DashboardButtons";
import InfoIcon from "../ui/InfoIcon";
import DashboardProductNotification from "../ui/DashboardComponents/DashboardProductNotification";

export default function Dashboard() {
  localStorage.getItem("user");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [userBranch, setUserBranch] = useState<Branch | null>(null);
  const [lotes, setLotes] = useState([]);
  const [productos, setProductos] = useState([]); // ← Nuevo estado para productos

  // Fetch para lotes (ya existente)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/batch`)
      .then((res) => res.json())
      .then((data) => setLotes(data))
      .catch(() => setLotes([]));
  }, []);

  // 🔹 Nuevo fetch para productos
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/products`)
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch(() => setProductos([]));
  }, []);

  return (
    <ProtectedRoute
      allowedRoles={["administrador", "supervisor", "bodeguero", "vendedor"]}
    >
      <Container
        page={
          <div className="flex flex-col md:flex-row w-full max-w-full px-4 md:px-10 pt-6 overflow-x-hidden">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-6">
                Bienvenido a Gestior, {user.name}
                <InfoIcon
                  title="Inicio"
                  description="Este es el panel de control donde puedes gestionar colaboradores, negocios y productos, además de visualizar información relevante sobre el rendimiento de tu sucursal."
                />
              </h1>

              {/* Botones principales */}
              <DashboardButtons role={user.role} />

              {/* Gráfico */}
              <div className="mt-8 w-full h-auto lg:h-[400px]">
                {user.role !== "bodeguero" && user.role !== "vendedor" ? (
                  <DashboardGraphics branch={userBranch} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-500 text-center">
                      Gracias por el buen trabajo
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Side Info */}
            <div className="mt-8 pt-14 md:mt-0 md:ml-6 w-full md:w-[320px] flex-shrink-0 min-w-0">
              {/* Notificaciones */}
              <DashboardProductNotification
                lotes={lotes}
                productos={productos} 
                lowStockThreshold={15}
              />
              {user.role !== "bodeguero" ? (
                <DashboardInformation onSucursalLoaded={setUserBranch} />
              ) : null}
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
