import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import DashboardInformation from "../ui/DashboardComponents/DashboardInformation";
import DashboardGraphics from "../ui/DashboardComponents/DashboardGraphics";
import { useState } from "react";
import type { Branch } from "../ui/DashboardComponents/DashboardInformation";
import { MdInventory, MdPerson, MdBusiness} from "react-icons/md";


export default function Dashboard() {
    localStorage.getItem("user");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [userBranch, setUserBranch] = useState<Branch | null>(null);


    // Cuando un admin hace login, debe ver el dashboard que le reporte ventas, ganancias, pérdidas de productos, por meses, gráficas...

    return(
    <ProtectedRoute allowedRoles={["administrador"]}>
        <Container page={
        <div className="flex">
             <div className="w-full pl-10 pt-10">
                <h1 className="text-2xl font-bold h-5">Bienvenido a Gestior, {user.name}</h1>
                
                <div className="grid grid-cols-4 grid-rows-3 gap-5">
                    {/* cajas de botones */}
                    <div className="mt-10 max-h-[4rem]">
                        <a href="/employees" className="rounded-lg border border-gris-ultra-claro flex flex-col p-4 justify-center max-h-[7rem] hover:scale-104 transition-transform hover:text-azul-medio">
                            <div className="w-full justify-center items-center flex">
                            <MdPerson size={40} className="text-azul-medio"/>
                            </div>
                            <h3 className="font-semibold text-center w-full text-[1.286rem]">Gestionar colaboradores</h3>
                        </a>
                    </div>

                    <div className="mt-10 max-h-[4rem]">
                        <a href="/employees" className="rounded-lg border border-gris-ultra-claro flex flex-col p-4 justify-center max-h-[7rem] hover:scale-104 transition-transform hover:text-azul-medio">
                            <div className="w-full justify-center items-center flex">
                            <MdBusiness size={40} className="text-azul-medio"/>
                            </div>
                            <h3 className="font-semibold text-center w-full text-[1.286rem]">Gestionar negocios</h3>
                        </a>
                    </div>

                    <div className="mt-10 max-h-[4rem]">
                        <a href="/employees" className="rounded-lg border border-gris-ultra-claro flex flex-col p-4 justify-center max-h-[7rem] hover:scale-104 transition-transform hover:text-azul-medio">
                            <div className="w-full justify-center items-center flex">
                            <MdInventory size={40} className="text-azul-medio"/>
                            </div>
                            <h3 className="font-semibold text-center w-full text-[1.286rem]">Gestionar productos</h3>
                        </a>
                    </div>

                    <div className="col-span-3 row-span-2 col-start-1 row-start-2">
                        <DashboardGraphics branch={userBranch}/>
                    </div>
                    {/* sideInfo */}
                    <div className="row-span-3 col-start-4 row-start-1">
                        <DashboardInformation onSucursalLoaded={setUserBranch}/>
                    </div>
                </div>
             </div>
        </div>
        } />
    </ProtectedRoute>
    )
}