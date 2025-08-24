import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";
import Modal from "../ui/Modal";

type User = {
    id: number;
    name: string;
    role: string;
    email: string;
    phone: string;
    status: string;
    profile_photo?: string; // 🔥 Añadido para manejar la foto
};

const headers = ["id", "name", "rol", "contact", "state", "phone", "actions"];

export default function Employees() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || "";

    const [users, setUsers] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    useEffect(() => {
        fetch("http://localhost:8000/api/v1/employees")
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(() => setUsers([]));
    }, []);

    const handleDelete = async () => {
        if (selectedUserId === null) return;
        await fetch(`http://localhost:8000/api/v1/employees/${selectedUserId}`, {
            method: "DELETE"
        });
        setUsers(users.filter(user => user.id !== selectedUserId));
        setShowModal(false);
        setSelectedUserId(null);
    };

    const getActions = (user: User) => [
        <Button
            text="Editar"
            style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer"
            onClick={() => {
                setUserToEdit(user);
                setShowEditModal(true);
            }}
        />,
        <Button
            text="Eliminar"
            style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer"
            onClick={() => {
                setSelectedUserId(user.id);
                setShowModal(true);
            }}
        />
    ];

    const tableContent = users.map(user => ({
        id: user.id,
        name: user.name,
        rol: user.role,
        contact: user.email,
        state: user.status,
        phone: user.phone,
        actions: getActions(user)
    }));

    const handleUserAdded = (user: User) => {
        setUsers(prev => [...prev, user]);
    };

    const handleUserEdited = (updatedUser: User) => {
        setUsers(prev =>
            prev.map(user => {
                // 🔥 Mantener la foto si no viene en updatedUser
                const userWithPhoto = {
                    ...user,
                    ...updatedUser,
                    profile_photo: updatedUser.profile_photo || user.profile_photo
                };
                return user.id === updatedUser.id ? userWithPhoto : user;
            })
        );
        if (updatedUser.id === user.id) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("userUpdated"));
        }
    };

    return (
        <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
            <Container page={
            <div className="flex">
                <SideBar role={userRole}></SideBar>
                <div className="w-full pl-10">
                    <div className="flex items-center justify-between pt-10">
                        <h1 className="text-2xl font-bold h-5">Personal y Roles</h1>
                        <Button
                            text="Añadir empleado"
                            style="bg-azul-fuerte hover:bg-azul-claro text-white font-bold py-2 px-4 mr-10 rounded m-1 cursor-pointer"
                            onClick={() => setShowEditModal(true)}
                        />
                    </div>
                    <TableInformation tableContent={tableContent} headers={headers} />
                    <Modal
                        open={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setUserToEdit(null);
                        }}
                        onUserAdded={handleUserAdded}
                        userToEdit={userToEdit}
                        onUserEdited={handleUserEdited}
                    />
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="absolute inset-0 bg-transparent backdrop-blur-xs"></div>
                            <div
                                className="relative bg-white p-6 rounded shadow-lg pointer-events-auto
                                animate-modalShow transition-all duration-300"
                                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
                            >
                                <p className="mb-4">¿Seguro que deseas eliminar este usuario?</p>
                                <div className="flex gap-4">
                                    <button
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer"
                                        onClick={handleDelete}
                                    >
                                        Eliminar
                                    </button>
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        }/>
        </ProtectedRoute>
        
    );
}
