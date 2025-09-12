import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";
import { IoAddCircle } from "react-icons/io5";
import { RiEdit2Fill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
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

  // Load data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch businesses
        const businessesRes = await fetch(
          "http://127.0.0.1:8000/api/v1/businesses",
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
          "http://127.0.0.1:8000/api/v1/branches",
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
                `http://127.0.0.1:8000/api/v1/businesses/${branch.negocio_id}`,
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
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Reset canton when province changes
      ...(name === "provincia" ? { canton: "" } : {}),
    }));
  };

  // Handle form submission
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = branchToEdit
        ? `http://127.0.0.1:8000/api/v1/branches/${branchToEdit.sucursal_id}`
        : "http://127.0.0.1:8000/api/v1/branches";

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

      // Enriquecer con el nombre del negocio usando la lista de businesses en el estado
      const negocio = businesses.find(
        (b) => b.negocio_id === Number(data.negocio_id)
      );
      if (negocio) {
        data.negocio = { nombre: negocio.nombre_comercial };
      }

      if (branchToEdit) {
        setBranches(
          branches.map((b) =>
            b.sucursal_id === branchToEdit.sucursal_id ? data : b
          )
        );
        setAlert({
          type: "success",
          message: "Sucursal actualizada correctamente",
        });
      } else {
        setBranches([...branches, data]);
        setAlert({ type: "success", message: "Sucursal creada correctamente" });
      }

      setShowEditModal(false);
      setBranchToEdit(null);
    } catch (error: any) {
      console.error("Error saving branch:", error);
      setAlert({
        type: "error",
        message: error.message || "Error al procesar la solicitud",
      });
    }
  };

  // Verificar y eliminar sucursal
  const handleDelete = async () => {
    if (!selectedBranchId) return;

    try {
      // Primero verificar si la sucursal tiene bodegas asociadas
      let warehousesResponse;
      try {
        warehousesResponse = await fetch(
          `http://127.0.0.1:8000/api/v1/warehouses?branch_id=${selectedBranchId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!warehousesResponse.ok) {
          throw new Error("Error al verificar bodegas asociadas");
        }

        const warehousesData = await warehousesResponse.json();
        if (Array.isArray(warehousesData) && warehousesData.length > 0) {
          // Obtener los códigos de las bodegas para mostrarlos en el mensaje
          const warehouseCodes = warehousesData
            .map((w: any) => `"${w.codigo}"`)
            .join(", ");
          throw new Error(
            `No se puede eliminar la sucursal porque tiene ${warehousesData.length} bodega(s) asociada(s): ${warehouseCodes}. ` +
              "Por favor, elimine primero las bodegas asociadas antes de eliminar la sucursal."
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("No se puede eliminar")
        ) {
          throw error; // Re-lanzar el error de bodegas asociadas
        }
        console.error("Error al verificar bodegas:", error);
        throw new Error(
          "Error al verificar bodegas asociadas. Por favor, intente nuevamente."
        );
      }

      // Si no hay bodegas asociadas, proceder con la eliminación
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/branches/${selectedBranchId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Error al procesar la solicitud de eliminación"
        );
      }

      setBranches(branches.filter((b) => b.sucursal_id !== selectedBranchId));
      setShowModal(false);
      setSelectedBranchId(null);
      setAlert({
        type: "success",
        message: "Sucursal eliminada correctamente",
      });
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      setAlert({
        type: "error",
        message:
          error.message ||
          "No se pudo eliminar la sucursal. Por favor, intente nuevamente.",
      });
    } finally {
      setShowModal(false);
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

  const tableContent = branches.map((branch) => ({
    ID: branch.sucursal_id,
    Negocio: branch.negocio?.nombre || "Sin negocio",
    Nombre: branch.nombre,
    Provincia: branch.provincia,
    Cantón: branch.canton,
    Teléfono: branch.telefono,
    Acciones: (
      <div className="flex gap-2">
        <Button
          style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setBranchToEdit(branch);
            setShowEditModal(true);
          }}
        >
          <RiEdit2Fill />
          Editar
        </Button>

        <Button
          style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
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
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Administrar Sucursales</h1>
                <Button
                  text={
                    <span className="flex items-center gap-2">
                      {/* Ícono de usuario con "+" usando IoAddCircle */}
                      <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                      Añadir sucursal
                    </span>
                  }
                  style="bg-sky-500 hover:bg-azul-claro text-white font-bold py-4 px-3 cursor-pointer mr-20 rounded flex items-center gap-2"
                  onClick={() => {
                    setBranchToEdit(null);
                    setShowEditModal(true);
                  }}
                />
              </div>

              {alert && !showEditModal && (
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
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        onClick={() => setShowModal(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        onClick={handleDelete}
                      >
                        Eliminar
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
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
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
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
                            onClick={() => {
                              setShowEditModal(false);
                              setBranchToEdit(null);
                              setAlert(null);
                            }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
                          >
                            {branchToEdit
                              ? "Guardar Cambios"
                              : "Crear Sucursal"}
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
