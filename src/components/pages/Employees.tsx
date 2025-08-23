import { useEffect, useState } from "react";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";

type User = {
    id: number;
    name: string;
    role: string;
    email: string;
    status: string;
};

const btn1 = (<Button text="Inventario" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/Inventary" />);
const btn2 = (<Button text="Registro de Ingresos" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left " to="/finance" />);
const btn3 = (<Button text="Clientes y Fidelización " style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left " to="/customer" />);
const btn4 = (<Button text="Personal y Roles" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/employees" />);
const btn5 = (<Button text="Perfil" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/profile" />);
const sideBarButtons = [btn1, btn2, btn3, btn4, btn5];

const headers = ["ID", "Nombre", "Rol", "Contacto", "Estado", "Asistencia", "Acciones"];

export default function Employees() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/employees")
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(() => setUsers([]));
    }, []);

    const tableContent = users.map(user => ({
        id: user.id,
        name: user.name,
        rol: user.role,
        contact: user.email,
        state: user.status,
        attendance: "N/A", 
        actions: "Editar | Eliminar"
    }));

    return (
        <Container page={
            <div className="flex">
                <SideBar button={sideBarButtons}></SideBar>
                <div className="w-full pl-10">
                    <h1 className="text-2xl font-bold h-5 pt-10">Personal y Roles</h1>
                    <TableInformation tableContent={tableContent} headers={headers} />
                </div>
            </div>
        }/>
    );
}