import SideBar from "../ui/SideBar";
import TableInformation from "../ui/TableInformation";
import Button from "../ui/Button";
import Container from "../ui/Container";

const btn1 = (<Button text="Cerrar sesión" style="bg-transparent text-red-900 font-bold rounded p-1 cursor-pointer w-full text-left" to="/homepage" ></Button>)
const btn2 = (<Button text="Inventario" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/Inventary" ></Button>)
const btn3 = (<Button text="Registro de Ingresos" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left " to="/finance" ></Button>)
const btn4 = (<Button text="Clientes y Fidelización " style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left " to="/customer" ></Button>)
const btn5 = (<Button text="Personal y Roles" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/employees" ></Button>)
const btn6 = (<Button text="Perfil" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/profile" ></Button>)
const sideBarButtons = [btn1, btn2, btn3, btn4, btn5, btn6]

const headers = ["ID", "Cliente", "Contacto", "Total Compras", "Puntos", "Cupones", "Acciones"]
const tableContent = [
    { id: "1", client: "Juan Perez", contact: "juanperez@gmail.com", totalShopping: "1000", points: "1000", coupons: "mes09", actions: "Editar | Eliminar" },
    { id: "2", client: "Maria Lopez", contact: "marialopez@gmail.com", totalShopping: "2000", points: "2000", coupons: "mes09", actions: "Editar | Eliminar" },
    { id: "3", client: "Pedro Gomez", contact: "pedrogomez@gmail.com", totalShopping: "3000", points: "3000", coupons: "mes09", actions: "Editar | Eliminar" },
]




export default function Customer() {
    return (
        
        <Container page={
            <div className="flex">
            <SideBar button={sideBarButtons}></SideBar>

            <div className="w-full pl-10">
                <h1 className="text-2xl font-bold h-5 pt-10">Clientes y Fidelización </h1>
                
                <TableInformation tableContent={tableContent} headers={headers} ></TableInformation>
            </div>
        </div>
        }/>
    );
}