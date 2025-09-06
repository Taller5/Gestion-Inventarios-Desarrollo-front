import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";
import { IoAddCircle } from "react-icons/io5";
import { RiEdit2Fill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";

type Business = {
  negocio_id: number;
  nombre: string;
  descripcion?: string | null;
  telefono: string;
  email: string;
};

const headers = ["ID", "Nombre", "Descripción", "Teléfono", "Email", "Acciones"];

export default function Businesses() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [businessToEdit, setBusinessToEdit] = useState<Business | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    telefono: "",
    email: "",
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Cargar negocios desde backend
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch("http://127.0.0.1:8000/api/v1/businesses", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar negocios');
        }
        
        const data = await response.json();
        setBusinesses(data);
      } catch (error) {
        console.error("Error al cargar negocios:", error);
        setAlert({ type: "error", message: "Error al cargar los negocios" });
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  // Inicializar formulario al abrir modal
  useEffect(() => {
    if (modalOpen) {
      if (businessToEdit) {
        setForm({
          nombre: businessToEdit.nombre,
          descripcion: businessToEdit.descripcion || "",
          telefono: businessToEdit.telefono,
          email: businessToEdit.email,
        });
      } else {
        setForm({
          nombre: "",
          descripcion: "",
          telefono: "",
          email: "",
        });
      }
      setAlert(null);
    }
  }, [modalOpen, businessToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este negocio?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/v1/businesses/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el negocio');
      }

      setBusinesses(businesses.filter((b) => b.negocio_id !== id));
      setAlert({ type: "success", message: "Negocio eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar negocio:", error);
      setAlert({ type: "error", message: "No se pudo eliminar el negocio" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    setAlert(null);

    const token = localStorage.getItem('token');
    const url = businessToEdit 
      ? `http://127.0.0.1:8000/api/v1/businesses/${businessToEdit.negocio_id}`
      : "http://127.0.0.1:8000/api/v1/businesses";

    try {
      const method = businessToEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      if (businessToEdit) {
        setBusinesses(businesses.map(b => 
          b.negocio_id === businessToEdit.negocio_id ? data : b
        ));
        setAlert({ type: "success", message: "Negocio actualizado correctamente" });
      } else {
        setBusinesses([...businesses, data]);
        setAlert({ type: "success", message: "Negocio creado correctamente" });
      }

      setTimeout(() => {
        setModalOpen(false);
        setBusinessToEdit(null);
      }, 1200);
    } catch (error: any) {
      console.error("Error al guardar negocio:", error);
      setAlert({ 
        type: "error", 
        message: error.message || "Error al procesar la solicitud" 
      });
    } finally {
      setLoadingForm(false);
    }
  };

const tableContent = businesses.map((b) => ({
  ID: b.negocio_id,
  Nombre: b.nombre,
  Descripción: b.descripcion || "-",
  Teléfono: b.telefono,
  Email: b.email,
  Acciones: (
    <div className="flex gap-2">
      <Button
        style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
        onClick={() => {
          setBusinessToEdit(b);
          setModalOpen(true);
        }}
      >
        <RiEdit2Fill/>
        Editar
      </Button>

      <Button
        style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
        onClick={() => handleDelete(b.negocio_id)}
      >
        <FaTrash/>
        Eliminar
      </Button>
    </div>
  ),
}));

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
      <Container
        page={
          <div className="flex">
            <SideBar role={userRole} />
            <div className="w-full pl-10 pt-10">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Administrar Negocios</h1>
                <Button
                  text={
                     <span className="flex items-center gap-2">
                                                     
                                                      {/* Ícono de usuario con "+" usando IoAddCircle */}
                       <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                                                       Añadir negocio
                                                  </span>                                                            
                  }
                  style="bg-sky-500 hover:bg-azul-claro text-white font-bold py-4 px-3 cursor-pointer mr-20 rounded flex items-center gap-2"
                  onClick={() => {
                    setBusinessToEdit(null);
                    setModalOpen(true);
                  }}
                  
                />
              </div>

              {loading ? (
                <p>Cargando negocios...</p>
              ) : (
                <TableInformation headers={headers} tableContent={tableContent} />
              )}

              {/* Modal de negocios - Diseño original preservado */}
              {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-transparent backdrop-blur-xs"></div>
                  <div
                    className="relative bg-white rounded-lg shadow-lg pointer-events-auto overflow-y-auto
                    animate-modalShow transition-all duration-300"
                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)", width: "32rem", maxHeight: "90vh" }}
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-6">
                        {businessToEdit ? "Editar Negocio" : "Nuevo Negocio"}
                      </h2>
                      {alert && (
                        <div
                          className={`mb-4 px-4 py-2 rounded text-center font-semibold ${
                            alert.type === "success"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {alert.message}
                        </div>
                      )}
                      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                          <input
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                          <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                          <input
                            name="telefono"
                            value={form.telefono}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
                            onClick={() => setModalOpen(false)}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={loadingForm}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
                          >
                            {loadingForm
                              ? "Guardando..."
                              : businessToEdit
                              ? "Guardar Cambios"
                              : "Crear Negocio"}
                          </button>
                        </div>
                      </form>
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