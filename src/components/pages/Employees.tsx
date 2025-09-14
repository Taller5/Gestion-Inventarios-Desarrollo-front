import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";
import Modal from "../ui/Modal";
import { IoAddCircle } from "react-icons/io5";
import { RiEdit2Fill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { SearchBar } from "../ui/SearchBar";

type User = {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: string;
  profile_photo?: string; 
};

const headers = ["id", "name", "rol", "contact", "state", "phone", "actions"];

export default function Employees() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [employeesFiltered, setEmployeesFiltered] = useState<User[]>([]);

  useEffect(() => {
    setEmployeesFiltered(users);
  }, [users]);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/employees")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  const handleDelete = async () => {
    if (selectedUserId === null) return;
    await fetch(`http://localhost:8000/api/v1/employees/${selectedUserId}`, {
      method: "DELETE",
    });
    setUsers(users.filter((user) => user.id !== selectedUserId));
    setShowModal(false);
    setSelectedUserId(null);
  };

  const getActions = (user: User) => [
    <div className="flex flex-row" key={user.id}>
      <Button
        style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer flex items-center gap-2"
        onClick={() => {
          setUserToEdit(user);
          setShowEditModal(true);
        }}
      >
        <RiEdit2Fill/>
        Editar
      </Button>

      <Button
        style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer flex items-center gap-2"
        onClick={() => {
          setSelectedUserId(user.id);
          setShowModal(true);
        }}
      >
        <FaTrash/>
        Eliminar
      </Button>
    </div>,
  ];
  const tableContent = employeesFiltered.map((user) => ({
    id: user.id,
    name: user.name,
    rol: user.role,
    contact: user.email,
    state: user.status,
    phone: user.phone,
    actions: getActions(user),
  }));

  const handleUserAdded = (user: User) => {
    setUsers((prev) => [...prev, user]);
  };

  const handleUserEdited = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) => {
        const userWithPhoto = {
          ...user,
          ...updatedUser,
          profile_photo: updatedUser.profile_photo || user.profile_photo,
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
      <Container
        page={
          <div className="flex">
            <SideBar role={userRole}></SideBar>
            <div className="w-full pl-10 pt-10">
               <h1 className="text-2xl font-bold mb-6 text-left">Personal y Roles</h1>
               <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-6">
                <div className="w-full h-10">
               <SearchBar<User>
                      data={users}
                      displayField="id"
                      searchFields={["id", "name"]}
                      placeholder="Buscar por ID o nombre..."
                      onResultsChange={results => {
                        setEmployeesFiltered(results);
                        if (results.length > 0 || !results) setAlert(null); 
                      }}
                      onSelect={item => setEmployeesFiltered([item])}
                      onNotFound={q => {
                        if (q === "") {
                          setAlert(null); 
                        } else {
                          setEmployeesFiltered([]);
                          setAlert({
                            type: "error",
                            message: `No existe ningún producto con el código o nombre "${q}".`,
                          });
                        }
                      }}
                    />
                  {/* Mostrar alert de búsqueda */}
                  {alert && (
                    <div
                      className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${
                        alert.type === "success"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-red-100 text-red-700 border border-red-300"
                      }`}
                    >
                      {alert.message}
                    </div>
                  )}
                </div>
                <Button
                 
                  style="bg-sky-500 hover:bg-azul-claro text-white font-bold py-4 px-3 cursor-pointer mr-20 rounded flex items-center gap-2"
                  onClick={() => setShowEditModal(true)}
                > <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="whitespace-nowrap text-base">
                      {/* Ícono de usuario con "+" usando IoAddCircle */}
                     
                      Añadir empleado
                    </span></Button>
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
                    <p className="mb-4">
                      ¿Seguro que deseas eliminar este usuario?
                    </p>
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
        }
      />
    </ProtectedRoute>
  );
}
