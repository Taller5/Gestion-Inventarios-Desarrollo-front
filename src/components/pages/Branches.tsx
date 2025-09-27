import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";
import { IoAddCircle } from "react-icons/io5";
import { RiEdit2Fill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { SearchBar } from "../ui/SearchBar";

const API_URL = import.meta.env.VITE_API_URL;
// Types
type Branch = {
  sucursal_id: number;
  negocio_id: number;
  nombre: string;
  provincia: string;
  canton: string;
  telefono: string;
  negocio?: {
    nombre: string;
  };
};

type Business = {
  nombre_comercial: string;
  negocio_id: number;
  nombre_legal: string;
};

type Province = {
  id: string;
  name: string;
  cantones: string[];
};

// Costa Rica provinces and cantons data
const COSTA_RICA_PROVINCES: Province[] = [
  {
    id: "SJ",
    name: "San José",
    cantones: [
      "San José",
      "Escazú",
      "Desamparados",
      "Puriscal",
      "Tarrazú",
      "Aserrí",
      "Mora",
      "Goicoechea",
      "Santa Ana",
      "Alajuelita",
      "Vásquez de Coronado",
      "Acosta",
      "Tibás",
      "Moravia",
      "Montes de Oca",
      "Turrubares",
      "Dota",
      "Curridabat",
      "Pérez Zeledón",
      "León Cortés Castro",
    ],
  },
  {
    id: "AL",
    name: "Alajuela",
    cantones: [
      "Alajuela",
      "San Ramón",
      "Grecia",
      "San Mateo",
      "Atenas",
      "Naranjo",
      "Palmares",
      "Poás",
      "Orotina",
      "San Carlos",
      "Zarcero",
      "Valverde Vega",
      "Upala",
      "Los Chiles",
      "Guatuso",
      "Río Cuarto",
    ],
  },
  {
    id: "CA",
    name: "Cartago",
    cantones: [
      "Cartago",
      "Paraíso",
      "La Unión",
      "Jiménez",
      "Turrialba",
      "Alvarado",
      "Oreamuno",
      "El Guarco",
    ],
  },
  {
    id: "HE",
    name: "Heredia",
    cantones: [
      "Heredia",
      "Barva",
      "Santo Domingo",
      "Santa Bárbara",
      "San Rafael",
      "San Isidro",
      "Belén",
      "Flores",
      "San Pablo",
      "Sarapiquí",
    ],
  },
  {
    id: "GU",
    name: "Guanacaste",
    cantones: [
      "Liberia",
      "Nicoya",
      "Santa Cruz",
      "Bagaces",
      "Carrillo",
      "Cañas",
      "Abangares",
      "Tilarán",
      "Nandayure",
      "La Cruz",
      "Hojancha",
    ],
  },
  {
    id: "PU",
    name: "Puntarenas",
    cantones: [
      "Puntarenas",
      "Esparza",
      "Buenos Aires",
      "Montes de Oro",
      "Osa",
      "Quepos",
      "Golfito",
      "Coto Brus",
      "Parrita",
      "Corredores",
      "Garabito",
      "Monteverde",
    ],
  },
  {
    id: "LI",
    name: "Limón",
    cantones: [
      "Limón",
      "Pococí",
      "Siquirres",
      "Talamanca",
      "Matina",
      "Guácimo",
    ],
  },
];

const headers = [
  "ID",
  "Negocio",
  "Nombre",
  "Provincia",
  "Cantón",
  "Teléfono",
  "Acciones",
];

export default function Branches() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";
  const token = localStorage.getItem("token");

  // State
  const [branches, setBranches] = useState<Branch[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
   const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false); 
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    
    message: string;
  } | null>(null);
  const [form, setForm] = useState({
    negocio_id: "",
    nombre: "",
    provincia: "",
    canton: "",
    telefono: "",
  });
  const [branchesFiltered, setBranchesFiltered] = useState<Branch[]>([]);

  useEffect(() => {
    setBranchesFiltered(branches);
  }, [branches]);

  // Load data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch businesses
        const businessesRes = await fetch(
          `${API_URL}/api/v1/businesses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!businessesRes.ok) throw new Error("Error loading businesses");
        const businessesData: Business[] = await businessesRes.json();
        setBusinesses(businessesData);

        // Fetch branches
        const branchesRes = await fetch(
          `${API_URL}/api/v1/branches`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!branchesRes.ok) throw new Error("Error loading branches");
        const branchesData: Branch[] = await branchesRes.json();

        // Enriquecer cada sucursal con el nombre del negocio usando show
        const enrichedBranches = await Promise.all(
          branchesData.map(async (branch) => {
            if (branch.negocio_id) {
              const res = await fetch(
                `${API_URL}/api/v1/businesses/${branch.negocio_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                }
              );
              if (res.ok) {
                const negocio = await res.json();
                branch.negocio = { nombre: negocio.nombre_comercial };

              }
            }
            return branch;
          })
        );

        setBranches(enrichedBranches);
      } catch (error) {
        console.error("Error loading data:", error);
        setAlert({ type: "error", message: "Error al cargar los datos" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);
  // Form handlers
 const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  // Validaciones en tiempo real
  if (name === "nombre") {
    // Permite letras, números, espacios; no deja empezar con número
    if (value === "" || /^[A-Za-zÁÉÍÓÚáéíóúÑñ][A-Za-z0-9ÁÉÍÓÚáéíóúÑñ ]*$/.test(value)) {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    return; // no actualizar si no cumple
  }

  if (name === "telefono") {
    // Solo números
    if (value === "" || /^\d+$/.test(value)) {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    return;
  }

  // Para el resto de campos (selects, etc.)
  setForm((prev) => ({
    ...prev,
    [name]: value,
    ...(name === "provincia" ? { canton: "" } : {}),
  }));
};

  // Handle form submission

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validaciones
  const nombreValido = /^[A-Za-zÁÉÍÓÚáéíóúÑñ][A-Za-z0-9ÁÉÍÓÚáéíóúÑñ ]*$/.test(form.nombre);
  const telefonoValido = /^\d+$/.test(form.telefono);

  if (!nombreValido) {
    setAlert({ type: "error", message: "El nombre debe comenzar con una letra y no puede ser solo números" });
    return;
  }

  if (!telefonoValido) {
    setAlert({ type: "error", message: "El teléfono solo puede contener números" });
    return;
  }

  try {
    const url = branchToEdit
      ? `${API_URL}/api/v1/branches/${branchToEdit.sucursal_id}`
      : `${API_URL}/api/v1/branches`;
    const method = branchToEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al guardar la sucursal");
    }

    const data: Branch = await response.json();

    const negocio = businesses.find((b) => b.negocio_id === Number(data.negocio_id));
    if (negocio) data.negocio = { nombre: negocio.nombre_comercial };

    if (branchToEdit) {
      setBranches(branches.map((b) => (b.sucursal_id === branchToEdit.sucursal_id ? data : b)));
      setAlert({ type: "success", message: "Sucursal actualizada correctamente" });
    } else {
      setBranches([...branches, data]);
      setAlert({ type: "success", message: "Sucursal creada correctamente" });
    }

    setShowEditModal(false);
    setBranchToEdit(null);
  } catch (error: any) {
    console.error("Error saving branch:", error);
    setAlert({ type: "error", message: error.message || "Error al procesar la solicitud" });
  }
};


  // Verificar y eliminar sucursal
const handleDelete = async () => {
  if (!selectedBranchId) return;

  let alertMessage = ""; // mensaje que se mostrará
  let success = false;

  try {
    const response = await fetch(`${API_URL}/api/v1/branches/${selectedBranchId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      alertMessage = errorData.message || "Error al eliminar la sucursal";

      // Mensaje más amigable si es error de FK
      if (alertMessage.includes("FOREIGN KEY") || alertMessage.includes("Constraint")) {
        alertMessage =
          "No se puede eliminar la sucursal porque tiene bodegas asociadas. Por favor elimine primero las bodegas.";
      }

      throw new Error(alertMessage);
    }

    // Éxito
    setBranches(branches.filter((b) => b.sucursal_id !== selectedBranchId));
    alertMessage = "Sucursal eliminada correctamente";
    success = true;
  } catch (error: any) {
    if (!alertMessage) alertMessage = error.message || "No se pudo eliminar la sucursal.";
  } finally {
    setShowModal(false);
    setDeleteMessage(alertMessage);
    setDeleteSuccess(success);

    setTimeout(() => setDeleteMessage(null), 3000); // se cierra solo
    setSelectedBranchId(null);
  }
};





  // Get available cantons based on selected province
  const getAvailableCantons = () => {
    const province = COSTA_RICA_PROVINCES.find(
      (p) => p.name === form.provincia
    );
    return province ? province.cantones : [];
  };

  // Initialize form when editing
  useEffect(() => {
    if (showEditModal && branchToEdit) {
      setForm({
        negocio_id: branchToEdit.negocio_id.toString(),
        nombre: branchToEdit.nombre,
        provincia: branchToEdit.provincia,
        canton: branchToEdit.canton,
        telefono: branchToEdit.telefono,
      });
    } else if (showEditModal) {
      setForm({
        negocio_id: "",
        nombre: "",
        provincia: "",
        canton: "",
        telefono: "",
      });
    }
  }, [showEditModal, branchToEdit]);

  // Table content

  const tableContent = branchesFiltered.map((branch) => ({
    ID: branch.sucursal_id,
    Negocio: branch.negocio?.nombre || "Sin negocio",
    Nombre: branch.nombre,
    Provincia: branch.provincia,
    Cantón: branch.canton,
    Teléfono: branch.telefono,
    Acciones: (
      <div className="flex gap-2">
        <Button
          style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setBranchToEdit(branch);
            setShowEditModal(true);
          }}
        >
          <RiEdit2Fill />
          Editar
        </Button>

        <Button
          style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setSelectedBranchId(branch.sucursal_id);
            setShowModal(true);
          }}
        >
          <FaTrash />
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
              <h1 className="text-2xl font-bold mb-6 text-left">Administrar Sucursales</h1>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-6">
                <div className="w-full h-10">
               <SearchBar<Branch>
                      data={branches}
                      displayField="sucursal_id"
                      searchFields={["sucursal_id", "nombre"]}
                      placeholder="Buscar por ID o nombre..."
                      onResultsChange={results => {
                        setBranchesFiltered(results);
                        if (results.length > 0 || !results) setAlert(null); 
                      }}
                      onSelect={item => setBranchesFiltered([item])}
                      onNotFound={q => {
                        if (q === "") {
                          setAlert(null); 
                        } else {
                          setBranchesFiltered([]);
                          setAlert({
                            type: "error",
                            message: `No existe ningún producto con el código o nombre "${q}".`,
                          });
                        }
                      }}
                    />

               {deleteMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className={`relative p-6 rounded-lg shadow-lg bg-white w-80 text-center animate-modalShow`}>
                    <p className={`font-semibold ${deleteSuccess ? "text-verde-claro" : "text-rojo-claro"}`}>
                      {deleteMessage}
                    </p>
                  </div>
                </div>
              )}

                  {/* Mostrar alert de búsqueda */}
                  {alert && (
                    <div
                      className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${
                        alert.type === "success"
                          ? "bg-green-100 text-verde-oscuro border-verde-ultra-claro"
                          : "bg-red-100 text-rojo-oscuro border border-rojo-ultra-claro"
                      }`}
                    >
                      {alert.message}
                    </div>
                  )}
                </div>
                <Button
                  style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-4 px-3 cursor-pointer mr-20 rounded flex items-center gap-2"
                  onClick={() => {
                    setBranchToEdit(null);
                    setShowEditModal(true);
                  }}> <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                    <span className="whitespace-nowrap text-base">
                      Añadir sucursal
                    </span>
                  </Button>
              </div>

              {alert && !showEditModal && (
                <div
                  className={`mb-4 px-4 py-2 rounded text-center font-semibold ${
                    alert.type === "success"
                      ? "bg-green-100 text-verde-claro"
                      : "bg-red-100 text-rojo-claro"
                  }`}
                >
                  {alert.message}
                </div>
              )}

              {loading ? (
                <p>Cargando sucursales...</p>
              ) : (
                <TableInformation
                  headers={headers}
                  tableContent={tableContent}
                />
              )}

              {/* Delete Confirmation Modal */}
              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-transparent backdrop-blur-xs"></div>
                  <div
                    className="relative bg-white p-6 rounded-lg shadow-lg pointer-events-auto
                    animate-modalShow transition-all duration-300"
                    style={{
                      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                      width: "32rem",
                    }}
                  >
                    <h2 className="text-xl font-bold mb-4">
                      Confirmar eliminación
                    </h2>
                    <p className="mb-6">
                      ¿Está seguro que desea eliminar esta sucursal?
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        className="px-6 py-2 bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold rounded-lg cursor-pointer"
                        onClick={handleDelete}
                      >
                        Eliminar
                      </button>
                      
                      <button
                        type="button"
                        className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        onClick={() => setShowModal(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add/Edit Branch Modal */}
              {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-transparent backdrop-blur-xs"></div>
                  <div
                    className="relative bg-white rounded-lg shadow-lg pointer-events-auto overflow-y-auto
                    animate-modalShow transition-all duration-300"
                    style={{
                      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                      width: "32rem",
                      maxHeight: "90vh",
                    }}
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-6">
                        {branchToEdit ? "Editar Sucursal" : "Nueva Sucursal"}
                      </h2>

                      {alert && (
                        <div
                          className={`mb-4 px-4 py-2 rounded text-center font-semibold ${
                            alert.type === "success"
                              ? "bg-green-100 text-verde-claro"
                              : "bg-red-100 text-rojo-claro"
                          }`}
                        >
                          {alert.message}
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Negocio
                          </label>
                          <select
                            name="negocio_id"
                            value={form.negocio_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                            required
                            disabled={!!branchToEdit}
                          >
                            <option value="">Seleccione un negocio</option>
                            {businesses.map((business) => (
                              <option
                                key={business.negocio_id}
                                value={business.negocio_id}
                              >
                                {business.nombre_comercial}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la Sucursal
                          </label>
                          <input
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Provincia
                            </label>
                            <select
                              name="provincia"
                              value={form.provincia}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                              required
                            >
                              <option value="">Seleccione una provincia</option>
                              {COSTA_RICA_PROVINCES.map((province) => (
                                <option key={province.id} value={province.name}>
                                  {province.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cantón
                            </label>
                            <select
                              name="canton"
                              value={form.canton}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                              required
                              disabled={!form.provincia}
                            >
                              <option value="">
                                {form.provincia
                                  ? "Seleccione un cantón"
                                  : "Seleccione una provincia primero"}
                              </option>
                              {getAvailableCantons().map((canton, index) => (
                                <option key={index} value={canton}>
                                  {canton}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                          </label>
                          <input
                            name="telefono"
                            type="tel"
                            value={form.telefono}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-azul-medio hover:bg-azul-hover text-white font-bold rounded-lg cursor-pointer"
                          >
                            {branchToEdit
                              ? "Guardar Cambios"
                              : "Crear Sucursal"}
                          </button>
                          <button
                            type="button"
                            className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                            onClick={() => {
                              setShowEditModal(false);
                              setBranchToEdit(null);
                              setAlert(null);
                            }}
                          >
                            Cancelar
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