import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import DashboardInformation from "../ui/DashboardComponents/DashboardInformation";
import SideBar from "../ui/SideBar";

export default function Dashboard() {
    localStorage.getItem("user");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Cuando un admin hace login, debe ver el dashboard que le reporte ventas, ganancias, pérdidas de productos, por meses, gráficas...

    return(
    <ProtectedRoute allowedRoles={["administrador"]}>
        <Container page={
        <div className="flex">
            <SideBar role={user.role}></SideBar>
             <div className="w-full pl-10 pt-10">
                <h1 className="text-2xl font-bold h-5">Dashboard</h1>
                
                <div className="grid grid-cols-4 grid-rows-3 gap-4 h-full">
                    {/* cajas de botones */}
                    <div className="mt-10">Gestionar colaboradores</div>
                    <div className="mt-10">Gestionar negocios</div>
                    <div className="mt-10">Gestionar productos</div>
                    <div className="col-span-3 col-start-1 row-start-2">Ver reportes</div>
                    <div className="col-span-3 col-start-1 row-start-3">Consultar predicciones</div>
                    {/* sideInfo */}
                    <div className="row-span-3 col-start-4 row-start-1">
                        <DashboardInformation/>
                    </div>
                </div>
             </div>
        </div>
        } />
    </ProtectedRoute>
    )
}