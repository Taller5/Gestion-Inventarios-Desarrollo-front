import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import DashboardInformation from "../ui/DashboardComponents/DashboardInformation";
import DashboardGraphics from "../ui/DashboardComponents/DashboardGraphics";
import { useState } from "react";
import type { Branch } from "../ui/DashboardComponents/DashboardInformation";
import { MdInventory, MdPerson, MdBusiness } from "react-icons/md";
import InfoIcon from "../ui/InfoIcon";

export default function Dashboard() {
  localStorage.getItem("user");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [userBranch, setUserBranch] = useState<Branch | null>(null);

  // Cuando un admin hace login, debe ver el dashboard que le reporte ventas, ganancias, pérdidas de productos, por meses, gráficas...

  return (
 
  <ProtectedRoute allowedRoles={["administrador"]}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <a
                href="/employees"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdPerson size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Gestionar colaboradores
                </h3>
              </a>

              <a
                href="/businesses"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdBusiness size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Gestionar negocios
                </h3>
              </a>

              <a
                href="/inventory"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdInventory size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Gestionar productos
                </h3>
              </a>
            </div>

            {/* Gráfico */}
            <div className="mt-8 w-full h-auto lg:h-[400px]">
              <DashboardGraphics branch={userBranch} />
            </div>
          </div>

          {/* Side Info */}
          <div className="mt-8 pt-14 md:mt-0 md:ml-6 w-full md:w-[320px] flex-shrink-0 min-w-0">
            <DashboardInformation onSucursalLoaded={setUserBranch} />
          </div>
        </div>
      }
    />
  </ProtectedRoute>
);
}