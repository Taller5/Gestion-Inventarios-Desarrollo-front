import ProtectedRoute from "../services/ProtectedRoute";
import Button from "../ui/Button";
import SideBar from "../ui/SideBar";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";


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
    ID: "1",
    image: "1",
    codigo: "Producto A",
    name: "azucar",
    stock: "5",
    price: "$20",
    ubicacion: "Estante 2",
    acciones: "Editar | Eliminar",
  },
  {
    ID: "2",
    image: "2",
    codigo: "Producto B",
    name: "Arroz",
    stock: "20",
    price: "$15",
    ubicacion: "Estante 3",
    acciones: "Editar | Eliminar",
  },
  {
    ID: "3",
    image: "3",
    codigo: "Producto C",
    name: "Cafe",
    stock: "10",
    price: "$30",
    ubicacion: "Estante 1",
    acciones: "Editar | Eliminar",
  },
  {
    ID: "4",
    image: "4",
    codigo: "Producto D",
    name: "Leche",
    stock: "15",
    price: "$25",
    ubicacion: "Estante 4",
    acciones: "Editar | Eliminar",
  },
];
export default function Inventary() {
  // Extraer el usuario del localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // Extraer el rol del usuario
  const userRole = user.role || "";

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "cajero", "bodeguero"]}>
      <Container page=
    {
      <div>
      <div className="flex">
        
        <SideBar role={userRole}></SideBar>

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
    </ProtectedRoute>
  );
}
