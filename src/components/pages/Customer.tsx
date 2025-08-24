import SideBar from "../ui/SideBar";
import TableInformation from "../ui/TableInformation";
import Button from "../ui/Button";
import Container from "../ui/Container";


const headers = ["ID", "Cliente", "Contacto", "Total Compras", "Puntos", "Cupones", "Acciones"]
const tableContent = [
    { id: "1", client: "Juan Perez", contact: "juanperez@gmail.com", totalShopping: "1000", points: "1000", coupons: "mes09", actions: "Editar | Eliminar" },
    { id: "2", client: "Maria Lopez", contact: "marialopez@gmail.com", totalShopping: "2000", points: "2000", coupons: "mes09", actions: "Editar | Eliminar" },
    { id: "3", client: "Pedro Gomez", contact: "pedrogomez@gmail.com", totalShopping: "3000", points: "3000", coupons: "mes09", actions: "Editar | Eliminar" },
]




export default function Customer() {
  // Extraer el usuario del localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // Extraer el rol del usuario
  const userRole = user.role || "";

    return (
        
        <Container page={
            <div className="flex">
                <SideBar role={userRole}></SideBar>
            <div className="w-full pl-10">
                <h1 className="text-2xl font-bold h-5 pt-10">Clientes y Fidelización </h1>
                
                <TableInformation tableContent={tableContent} headers={headers} ></TableInformation>
            </div>
        </div>
        }/>
    );
}