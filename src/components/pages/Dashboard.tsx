import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import SideBar from "../ui/SideBar";

export default function Dashboard() {
    localStorage.getItem("user");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || "";

    return(
    <ProtectedRoute allowedRoles={["administrador"]}>
        <Container page={
        <div className="flex">
            <SideBar role={userRole}></SideBar>
             <div className="w-full pl-10 pt-10"></div>
        </div>
        } />
    </ProtectedRoute>
    )
}