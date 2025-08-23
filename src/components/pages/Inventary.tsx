import Button from "../ui/Button";
import SideBar from "../ui/SideBar";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";

const btn1 = (<Button text="Cerrar sesión" style="bg-transparent text-red-900 font-bold rounded p-1 cursor-pointer w-full text-left" to="/homepage" ></Button>)
const btn2 = (<Button text="Inventario" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/Inventary" ></Button>)
const btn3 = (<Button text="Registro de Ingresos" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left " to="/finance" ></Button>)
const btn4 = (<Button text="Clientes y Fidelización " style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left " to="/customer" ></Button>)
const btn5 = (<Button text="Personal y Roles" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/employees" ></Button>)
const btn6 = (<Button text="Perfil" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/profile" ></Button>)
const sideBarButtons = [btn1, btn2, btn3, btn4, btn5, btn6]



const headers = [
  "ID",
  "Imagen",
  "Codigo",
  "Nombre",
  "Stock",
  "Precio Unitario",
  "Ubicacion",
  "Acciones",
];
const tableContent = [
  {
    id: "1",
    image: "1",
    codigo: "Producto A",
    name: "azucar",
    stock: "5",
    price: "$20",
    ubicacion: "Estante 2",
    acciones: "Editar | Eliminar",
  },
  {
    id: "2",
    image: "2",
    codigo: "Producto B",
    name: "Arroz",
    stock: "20",
    price: "$15",
    ubicacion: "Estante 3",
    acciones: "Editar | Eliminar",
  },
  {
    id: "3",
    image: "3",
    codigo: "Producto C",
    name: "Cafe",
    stock: "10",
    price: "$30",
    ubicacion: "Estante 1",
    acciones: "Editar | Eliminar",
  },
  {
    image: "4",
    ubicación: "4",
    id: "Producto D",
    name: "Leche",
    stock: "15",
    price: "$25",
    codigo: "Estante 4",
    acciones: "Editar | Eliminar",
  },
];
export default function Inventary() {
  //return <SideBar button={sideBarButtons}></SideBar>
  return (
    <Container page=
    {
      <div>
      <div className="flex">
        
        <SideBar button={sideBarButtons}></SideBar>

        <div className="w-full pl-10">
          <h1 className="text-2xl font-bold h-5 pt-10">Inventario</h1>

        <TableInformation
          tableContent={tableContent}
          headers={headers}
        ></TableInformation>
        </div>
      </div>
    </div>
    }/>
  );
}
