import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";

const btn1 = (<Button text="Inventario" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/Inventary" ></Button>)
const btn2 = (<Button text="Registro de Ingresos" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left " to="/finance" ></Button>)
const btn3 = (<Button text="Clientes y Fidelización " style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left " to="/customer" ></Button>)
const btn4 = (<Button text="Personal y Roles" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/employees" ></Button>)
const btn5 = (<Button text="Perfil" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/profile" ></Button>)
const sideBarButtons = [btn1, btn2, btn3, btn4, btn5]

const headers = ["ID", "Nombre", "Rol", "Contacto", "Estado", "Asistencia", "Acciones"]
const tableContent = [
    { id: "1", name: "Juan Perez", rol: "Administrador", contact: "juanperez@gmail.com", state: "Activo", attendance: "Presente", actions: "Editar | Eliminar" }
]
export default function Employees() {
    return (

        <Container page={

            <div className="flex">
            
            <SideBar button={sideBarButtons}></SideBar>
            
            <div className="w-full pl-10">
                <h1 className="text-2xl font-bold h-5 pt-10">Personal y Roles</h1>

                <TableInformation tableContent={tableContent} headers={headers} ></TableInformation>
            </div>
            
        </div>
        }/>

    );
}