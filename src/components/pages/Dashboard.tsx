import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import DashboardGraphics from "../ui/DashboardComponents/DashboardGraphics";
import { useEffect, useState } from "react";
import type { Branch } from "../ui/DashboardComponents/DashboardInformation";
import InfoIcon from "../ui/InfoIcon";
import DashboardProductNotification from "../ui/DashboardComponents/DashboardProductNotification";
import DashboardInformation from "../ui/DashboardComponents/DashboardInformation";
import { ColaboradoresButton, NegociosButton, ProductosButton } from "../ui/DashboardComponents/DashboardButtons";

export default function Dashboard() {
  localStorage.getItem("user");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [userBranch, setUserBranch] = useState<Branch | null>(null);
  const [lotes, setLotes] = useState([]);
  const [productos, setProductos] = useState([]); // ← Nuevo estado para productos
  const [promotions, setPromotions] = useState([]);
  const [branches, setBranches] = useState([]);

  // Fetch para lotes 
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/batch`)
      .then((res) => res.json())
      .then((data) => setLotes(data))
      .catch(() => setLotes([]));
  }, []);

  //fetch para productos
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/products`)
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch(() => setProductos([]));
  }, []);

  // Fetch para promociones y sucursales (nuevo)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/promotions`)
      .then((res) => res.json())
      .then((data) => setPromotions(data))
      .catch(() => setPromotions([]));

    fetch(`${import.meta.env.VITE_API_URL}/api/v1/branches`)
      .then((res) => res.json())
      .then((data) => setBranches(data))
      .catch(() => setBranches([]));
  }, []);

  return (
    <ProtectedRoute
      allowedRoles={["administrador", "supervisor", "bodeguero", "vendedor"]}
    >
      <Container
        page={
          <div className="flex flex-col md:flex-row w-full max-w-full px-4 md:px-10 pt-6 overflow-x-hidden">
            <div className="overflow-x-hidden w-full max-w-full
">
              <h1 className="text-2xl font-bold mb-6">
                Bienvenido a Gestior, {user.name}
                <InfoIcon
                  title="Inicio"
                  description="Este es el panel de control donde puedes gestionar colaboradores, negocios y productos, además de visualizar información relevante sobre el rendimiento de tu sucursal."
                />
              </h1>

              {/* Grid principal: 4 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {/* Columna 1 */}
                <div className="flex flex-col gap-4">
                  <ColaboradoresButton />
                  {/* Notificación bajo stock */}
                  <DashboardProductNotification
                    lotes={lotes}
                    productos={productos}
                    promotions={promotions}
                    branches={branches}
                    lowStockThreshold={15}
                    type="lowStock"
                  />
                </div>
                {/* Columna 2 */}
                <div className="flex flex-col gap-4">
                  <NegociosButton />
                  {/* Notificación productos próximos a vencer */}
                  <DashboardProductNotification
                    lotes={lotes}
                    productos={productos}
                    promotions={promotions}
                    branches={branches}
                    lowStockThreshold={15}
                    type="expiring"
                  />
                </div>
                {/* Columna 3 */}
                <div className="flex flex-col gap-4">
                  <ProductosButton />
                  {/* Notificación promociones */}
                  <DashboardProductNotification
                    promotions={promotions}
                    branches={branches}
                    lotes={lotes}
                    productos={productos}
                    lowStockThreshold={15}
                    type="promo"
                  />
                </div>
                {/* Columna 4: Info usuario */}
                <div className="flex flex-col gap-4">
                   {user.role !== "bodeguero" ? (
                <DashboardInformation onSucursalLoaded={setUserBranch} />
              ) : null}
                </div>
              </div>

              {/* Gráfico debajo del grid principal */}
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
          </div>
        }
      />
    </ProtectedRoute>
  );
}
