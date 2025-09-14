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

type Business = {
  margen_ganancia: string; 
  negocio_id: number;
  nombre_legal: string;
  nombre_comercial: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  descripcion?: string | null;
  telefono: string;
  email: string;
};

const headers = [
  "ID",
  "Nombre legal",
  "Nombre comercial",
  "Tipo de identificación",
  "Identificación",
  "Margen de ganancia (%)",
  "Margen decimal",
  "Descripción",
  "Teléfono",
  "Email",
  "Acciones",
];

export default function Businesses() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [businessToEdit, setBusinessToEdit] = useState<Business | null>(null);
  const[businessesFiltered, setBusinessesFiltered] = useState<Business[]>([]);

    useEffect(() => {
    setBusinessesFiltered(businesses);
  }, [businesses]);

  const [form, setForm] = useState({
    nombre_legal: "",
    nombre_comercial: "",
    tipo_identificacion: "",
    numero_identificacion: "",
    margen_ganancia: "",
    descripcion: "",
    telefono: "",
    email: "",
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Cargar negocios desde backend
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://127.0.0.1:8000/api/v1/businesses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al cargar negocios");
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
          nombre_legal: businessToEdit.nombre_legal,
          nombre_comercial: businessToEdit.nombre_comercial,
          tipo_identificacion: businessToEdit.tipo_identificacion,
          numero_identificacion: businessToEdit.numero_identificacion,
          margen_ganancia:
            businessToEdit.margen_ganancia !== undefined &&
            businessToEdit.margen_ganancia !== null
              ? (Number(businessToEdit.margen_ganancia) * 100).toString()
              : "",
          descripcion: businessToEdit.descripcion ?? "",
          telefono: businessToEdit.telefono,
          email: businessToEdit.email,
        });
      } else {
        setForm({
          nombre_legal: "",
          nombre_comercial: "",
          tipo_identificacion: "",
          numero_identificacion: "",
          margen_ganancia: "",
          descripcion: "",
          telefono: "",
          email: "",
        });
      }
      setAlert(null);
    }
  }, [modalOpen, businessToEdit]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este negocio?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/businesses/${id}`,
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
        throw new Error("Error al eliminar el negocio");
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

    let margenDecimal = 0;
    if (form.margen_ganancia !== "") {
      margenDecimal = Number(form.margen_ganancia) / 100;
    }

    const formToSend = {
      ...form,
      margen_ganancia: margenDecimal,
    };

    const token = localStorage.getItem("token");
    const url = businessToEdit
      ? `http://127.0.0.1:8000/api/v1/businesses/${businessToEdit.negocio_id}`
      : "http://127.0.0.1:8000/api/v1/businesses";

    try {
      const method = businessToEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        // Intenta mostrar el mensaje de error del backend
        let errorMsg = "Error al procesar la solicitud";
        if (data?.message) {
          errorMsg = data.message;
        } else if (data?.detail) {
          errorMsg = Array.isArray(data.detail)
            ? data.detail.map((d: any) => d.msg || d).join(", ")
            : data.detail;
        }
        setAlert({
          type: "error",
          message: errorMsg,
        });
        return;
      }

      if (businessToEdit) {
        setBusinesses(
          businesses.map((b) =>
            b.negocio_id === businessToEdit.negocio_id ? data : b
          )
        );
        setAlert({
          type: "success",
          message: "Negocio actualizado correctamente",
        });
      } else {
        setBusinesses([...businesses, data]);
        setAlert({ type: "success", message: "Negocio creado correctamente" });
      }

      setTimeout(() => {
        setModalOpen(false);
        setBusinessToEdit(null);
      }, 1200);
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message || "Error al procesar la solicitud",
      });
    } finally {
      setLoadingForm(false);
    }
  };

  const tableContent = businessesFiltered.map((b) => ({
    "ID": b.negocio_id,
    "Nombre legal": b.nombre_legal,
    "Nombre comercial": b.nombre_comercial,
    "Tipo de identificación": b.tipo_identificacion,
    "Identificación": b.numero_identificacion,
    "Margen de ganancia (%)": b.margen_ganancia
      ? parseFloat((Number(b.margen_ganancia) * 100).toFixed(2)).toString() + " %"
      : "-",
    "Margen decimal": b.margen_ganancia
      ? parseFloat(Number(b.margen_ganancia).toFixed(4)).toString()
      : "-",
    "Descripción": b.descripcion || "-",
    "Teléfono": b.telefono,
    "Email": b.email,
    "Acciones": (
      <div className="flex gap-2">
        <Button
          style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setBusinessToEdit(b);
            setModalOpen(true);
          }}
        >
          <RiEdit2Fill />
          Editar
        </Button>

        <Button
          style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
          onClick={() => handleDelete(b.negocio_id)}
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
              <h1 className="text-2xl font-bold mb-6 text-left">Administrar Negocios</h1>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-6">
                <div className="w-full h-10">
               <SearchBar<Business>
                      data={businesses}
                      displayField="negocio_id"
                      searchFields={["negocio_id", "nombre_legal"]}
                      placeholder="Buscar por ID o nombre legal..."
                      onResultsChange={results => {
                        setBusinessesFiltered(results);
                        if (results.length > 0 || !results) setAlert(null); 
                      }}
                      onSelect={item => setBusinessesFiltered([item])}
                      onNotFound={q => {
                        if (q === "") {
                          setAlert(null); 
                        } else {
                          setBusinessesFiltered([]);
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
                  onClick={() => {
                    setBusinessToEdit(null);
                    setModalOpen(true);
                  }}
                  >  <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                    <span className="whitespace-nowrap text-base">
                      Añadir negocio
                    </span>
                  </Button>
              </div>

              {loading ? (
                <p>Cargando negocios...</p>
              ) : (
                <TableInformation
                  headers={headers}
                  tableContent={tableContent}
                />
              )

              /* Modal de negocios - Diseño original preservado */
              }
              {modalOpen && (
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
                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre legal
                          </label>
                          <input
                            name="nombre_legal"
                            value={form.nombre_legal}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre comercial
                          </label>
                          <input
                            name="nombre_comercial"
                            value={form.nombre_comercial}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de identificación
                          </label>
                          <select
                            name="tipo_identificacion"
                            value={form.tipo_identificacion}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Seleccionar</option>
                            <option value="cedula">física</option>
                            <option value="juridica">jurídica</option>
                            <option value="pasaporte">DIMEX</option>
                            <option value="nite">NITE</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Identificación
                          </label>
                          <input
                            name="numero_identificacion"
                            value={form.numero_identificacion}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Margen de ganancia
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="margen_ganancia"
                              value={form.margen_ganancia}
                              min={0}
                              max={100}
                              step={0.01}
                              onChange={e => {
                                let value = e.target.value;
                                if (Number(value) > 100) value = "100";
                                if (Number(value) < 0) value = "0";
                                setForm({ ...form, margen_ganancia: value });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm pr-8 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <span className="absolute right-3 top-2 text-gray-500 select-none pointer-events-none">%</span>
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            Valor decimal: <span className="font-mono">
                              {form.margen_ganancia !== "" && !isNaN(Number(form.margen_ganancia))
                                ? (Number(form.margen_ganancia) / 100).toFixed(4)
                                : "0.0000"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                          </label>
                          <input
                            name="telefono"
                            value={form.telefono}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
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
