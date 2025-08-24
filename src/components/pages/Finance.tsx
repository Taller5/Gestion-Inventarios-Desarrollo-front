import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import Container from "../ui/Container";


export default function Finance() {

// Extraer el usuario del localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // Extraer el rol del usuario
  const userRole = user.role || "";
  

    return (

        <Container page=
        {
            <div className="flex">

        <SideBar role={userRole}></SideBar>

            <div className="w-full pl-10">
                <h1 className="text-2xl font-bold h-5 pt-10">Registro de ingresos</h1>
            </div>
            
        </div>
        }/>
        
    );
}