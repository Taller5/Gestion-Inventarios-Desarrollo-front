import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import { UseBusiness } from "../../hooks/Businesses/UseBusiness";
import { IoAddCircle } from "react-icons/io5";
import { RiEdit2Fill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { SearchBar } from "../ui/SearchBar";

const API_URL = import.meta.env.VITE_API_URL;

type Business = {
  margen_ganancia: string;
  negocio_id: number;
  nombre_legal: string;
  nombre_comercial: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  codigo_actividad_emisor: string; // nuevo campo (6 dígitos)
  descripcion?: string | null;
  telefono: string;
  email: string;
};

const headers = [
  "ID",
  "Nombre legal",
  "Nombre comercial",
  "Identificación",
  "Margen de ganancia (%)",
  "Descripción",
  "Teléfono",
  "Email",
  "Acciones",
];

export default function Businesses() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  const { fetchBusinesses, handleDeleteBusiness, errors, alert } = UseBusiness();

  console.log('clase principal' , fetchBusinesses);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessesFiltered, setBusinessesFiltered] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [businessToEdit, setBusinessToEdit] = useState<Business | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>( null);
  const [alert2, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [loadingForm, setLoadingForm] = useState(false);

  const [form, setForm] = useState({
    nombre_legal: "",
    nombre_comercial: "",
    tipo_identificacion: "",
    numero_identificacion: "",
    codigo_actividad_emisor: "",
    margen_ganancia: "",
    descripcion: "",
    telefono: "",
    email: "",
  });

  useEffect(() => setBusinessesFiltered(businesses), [businesses]);

  // Cargar negocios
  useEffect(() => {
    const getFetchedBusinesses = async () => {
      try {
        setBusinesses(fetchBusinesses);
        console.log('useeffect busines',fetchBusinesses);
      } catch (error) {
        console.error(error);
        setAlert({ type: "error", message: "Error al cargar los negocios" });
      } finally {
        setLoading(false);
      }
    };
    getFetchedBusinesses();
  }, [fetchBusinesses]);

  // Inicializar modal
  useEffect(() => {
    if (modalOpen) {
      if (businessToEdit) {
        setForm({
          nombre_legal: businessToEdit.nombre_legal,
          nombre_comercial: businessToEdit.nombre_comercial,
          tipo_identificacion: businessToEdit.tipo_identificacion,
          numero_identificacion: businessToEdit.numero_identificacion,
          codigo_actividad_emisor: businessToEdit.codigo_actividad_emisor || "",
          margen_ganancia: businessToEdit.margen_ganancia
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
          codigo_actividad_emisor: "",
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
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (form.nombre_legal.trim().length < 3)
      return "Nombre legal mínimo 3 caracteres";
    if (form.nombre_comercial.trim().length < 3)
      return "Nombre comercial mínimo 3 caracteres";
    if (!form.tipo_identificacion)
      return "Seleccione un tipo de identificación";
    if (
      form.numero_identificacion.trim().length < 5 ||
      isNaN(Number(form.numero_identificacion))
    )
      return "Número de identificación mínimo 5 dígitos y solo números";
    const duplicado = businesses.some(
      (b) =>
        b.numero_identificacion === form.numero_identificacion &&
        (!businessToEdit || b.negocio_id !== businessToEdit.negocio_id)
    );
    if (duplicado) return "Esta identificación ya está registrada";
    if (!/^\d{6}$/.test(form.codigo_actividad_emisor)) return "Código actividad emisor debe tener exactamente 6 dígitos";
    if (
      !form.margen_ganancia ||
      Number(form.margen_ganancia) < 0 ||
      Number(form.margen_ganancia) > 100
    )
      return "Margen de ganancia entre 0 y 100";
    if (form.telefono.trim().length < 8 || isNaN(Number(form.telefono)))
      return "Teléfono mínimo 8 dígitos y solo números";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Email inválido";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    setAlert(null);

    try {
      // Validación
      const error = validateForm();
      if (error) throw new Error(error);

      if (!/^\d{8}$/.test(form.telefono))
        throw new Error("Teléfono inválido, debe tener exactamente 8 dígitos");

      if (form.numero_identificacion.trim().length < 5)
        throw new Error("Número de identificación mínimo 5 dígitos");

      // Preparar datos
      const formToSend = {
        ...form,
        margen_ganancia: Number(form.margen_ganancia) / 100,
      };
      const token = localStorage.getItem("token");
      const url = businessToEdit
        ? `${API_URL}/api/v1/businesses/${businessToEdit.negocio_id}`
        : `${API_URL}/api/v1/businesses`;

      const method = businessToEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formToSend),
      });

      const data = await res.json();

      // Caso especial: correo ya registrado
      if (!res.ok) {
        if (data?.message?.toLowerCase().includes("correo")) {
          throw new Error("El correo ya está registrado en otro negocio");
        }
        throw new Error(data?.message || "Error al procesar");
      }

      if (businessToEdit) {
        setBusinesses(
          businesses.map((b) =>
            b.negocio_id === businessToEdit.negocio_id ? data : b
          )
        );
      } else {
        setBusinesses([...businesses, data]);
      }

      setAlert({
        type: "success",
        message: businessToEdit ? "Negocio actualizado" : "Negocio creado",
      });

      setTimeout(() => {
        setModalOpen(false);
        setBusinessToEdit(null);
      }, 1200);
    } catch (err: any) {
      setAlert({ type: "error", message: err.message });
      setTimeout(() => setAlert(null), 8000);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDelete = async () => {
    if (!businessToDelete) return;
    try {
      await handleDeleteBusiness(businessToDelete.negocio_id);
      setBusinesses(
        businesses.filter((b) => b.negocio_id !== businessToDelete.negocio_id)
      );
      setAlert({ type: "success", message: "Negocio eliminado" });
    } catch (err) {
      setAlert({ type: "error", message: "No se pudo eliminar" });
    } finally {
      setDeleteModalOpen(false);
      setBusinessToDelete(null);
      setTimeout(() => setAlert(null), 8000);
    }
  };

  const tableContent = businessesFiltered.map((b) => ({
    ID: b.negocio_id,
    "Nombre legal": b.nombre_legal,
    "Nombre comercial": b.nombre_comercial,
    "Tipo de identificación": b.tipo_identificacion,
    "Actividad (6 dígitos)": b.codigo_actividad_emisor,
    Identificación: b.numero_identificacion,
    "Margen de ganancia (%)": b.margen_ganancia
      ? parseFloat((Number(b.margen_ganancia) * 100).toFixed(2)) + " %"
      : "-",
    "Margen decimal": b.margen_ganancia
      ? parseFloat(Number(b.margen_ganancia).toFixed(4)).toString()
      : "-",
    Descripción: b.descripcion || "-",
    Teléfono: b.telefono,
    Email: b.email,
    Acciones: (
      <div className="flex gap-2">
        <Button
          style="bg-azul-medio hover:bg-azul-hover text-white py-1 px-2 rounded flex items-center gap-2 font-bold"
          onClick={() => {
            setBusinessToEdit(b);
            setModalOpen(true);
          }}
        >
          <RiEdit2Fill /> Editar
        </Button>
        <Button
          style="bg-rojo-claro hover:bg-rojo-oscuro text-white py-1 px-2 rounded flex items-center gap-2 font-bold"
          onClick={() => {
            setBusinessToDelete(b);
            setDeleteModalOpen(true);
          }}
        >
          <FaTrash /> Eliminar
        </Button>
      </div>
    ),
  }));
  {console.log('table content', tableContent)}

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
      <Container
        page={
          <div className="flex">
            <SideBar role={userRole} />
            <div className="w-full pl-10 pt-10">
              <h1 className="text-2xl font-bold mb-6 text-left">
                Gestionar Negocios
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-6">
                <div className="w-full h-10">
                    <SearchBar<Business>
                      data={businesses}
                      displayField="negocio_id"  // ⚠️ se deja cualquier campo para tipado, no afecta el formatter
                      searchFields={["negocio_id", "nombre_legal"]}
                      placeholder="Buscar por ID o nombre legal..."
                      onResultsChange={(results) => {
                        setBusinessesFiltered(results);
                        if (results.length > 0) setAlert(null);
                      }}
                      onSelect={(item) => setBusinessesFiltered([item])}
                      onNotFound={(q) => {
                        if (!q || q.trim() === "") {
                          setAlert({
                            type: "error",
                            message: "Por favor digite un ID o nombre legal para buscar.",
                          });
                        } else {
                          setBusinessesFiltered([]);
                          setAlert({
                            type: "error",
                            message: `No existe ningún negocio con el ID o nombre legal "${q}".`,
                          });
                        }
                      }}
                      onClearAlert={() => setAlert(null)}
                      resultFormatter={(item) => `${item.negocio_id} - ${item.nombre_legal}`} // ✅ muestra ID + nombre
                    />


                  {/* Mostrar solo un alert de búsqueda */}
                  {alert && (
                    <div
                      className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${
                        alert.type === "success"
                          ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro border"
                          : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
                      }`}
                    >
                      {alert.message}
                    </div>
                  )}
                </div>
                <Button
                  style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-4 px-3 cursor-pointer mr-20 rounded flex items-center gap-2"
                  onClick={() => {
                    setBusinessToEdit(null);
                    setModalOpen(true);
                  }}
                >
                  <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="whitespace-nowrap text-base">
                    Añadir negocio
                  </span>
                </Button>
              </div>
              {loading ? (
                <p>Cargando...</p>
              ) : (
                <TableInformation
                  headers={headers}
                  tableContent={tableContent}
                />
              )}
              {/* Modal Agregar/Editar */}
              {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-transparent backdrop-blur-xs"></div>
                  <div
                    className="relative bg-white rounded-lg shadow-lg pointer-events-auto overflow-y-auto animate-modalShow transition-all duration-300"
                    style={{ width: "32rem", maxHeight: "90vh" }}
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-6">
                        {businessToEdit ? "Editar Negocio" : "Nuevo Negocio"}
                      </h2>

                      {alert && (
                        <div
                          className={`mb-4 px-4 py-2 rounded text-center font-semibold ${
                            alert.type === "success"
                              ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro border"
                              : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
                          }`}
                        >
                          {alert.message}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();

                          // --- Validaciones ---
                          if (
                            !form.nombre_legal.trim() ||
                            /^\d+$/.test(form.nombre_legal)
                          ) {
                            setAlert({
                              type: "error",
                              message:
                                "El nombre legal no puede estar vacío ni ser solo números",
                            });
                            setTimeout(() => setAlert(null), 5000);
                            return;
                          }

                          if (
                            !form.nombre_comercial.trim() ||
                            /^\d+$/.test(form.nombre_comercial)
                          ) {
                            setAlert({
                              type: "error",
                              message:
                                "El nombre comercial no puede estar vacío ni ser solo números",
                            });
                            setTimeout(() => setAlert(null), 5000);
                            return;
                          }

                          if (
                            form.numero_identificacion.trim().length < 5 ||
                            isNaN(Number(form.numero_identificacion))
                          ) {
                            setAlert({
                              type: "error",
                              message:
                                "Número de identificación mínimo 5 dígitos y solo números",
                            });
                            setTimeout(() => setAlert(null), 5000);
                            return;
                          }

                          // Duplicado
                          const duplicado = businesses.some(
                            (b) =>
                              b.numero_identificacion ===
                                form.numero_identificacion &&
                              (!businessToEdit ||
                                b.negocio_id !== businessToEdit.negocio_id)
                          );
                          if (duplicado) {
                            setAlert({
                              type: "error",
                              message: "Esta identificación ya está registrada",
                            });
                            setTimeout(() => setAlert(null), 5000);
                            return;
                          }

                          // Margen de ganancia
                          const margen = Number(form.margen_ganancia);
                          if (isNaN(margen) || margen < 0 || margen > 100) {
                            setAlert({
                              type: "error",
                              message:
                                "Margen de ganancia debe ser entre 0 y 100",
                            });
                            setTimeout(() => setAlert(null), 5000);
                            return;
                          }

                          // Teléfono
                          if (!/^\d{8,}$/.test(form.telefono)) {
                            setAlert({
                              type: "error",
                              message:
                                "Teléfono inválido, mínimo 8 dígitos y solo números",
                            });
                            setTimeout(() => setAlert(null), 5000);
                            return;
                          }

                          // Validación de email segura// Validación segura de email
                          // Validación segura de email sin riesgo de super-linear backtracking
                          const validateEmail = (
                            email: string
                          ): string | null => {
                            if (email.length > 100) {
                              return "Correo demasiado largo (máx. 100 caracteres).";
                            }

                            // Email: hasta 64 chars usuario, @, hasta 255 chars dominio, un punto, 2+ chars TLD
                            const emailRegex =
                              /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

                            // Validación simple: no hay repetición de patrones peligrosos
                            if (!emailRegex.test(email)) {
                              return "Correo inválido.";
                            }

                            return null;
                          };

                          // Uso
                          const errorEmail = validateEmail(form.email);
                          if (errorEmail) {
                            setAlert({ type: "error", message: errorEmail });
                            setLoadingForm(false);
                            return;
                          }

                          // Verificación de correo duplicado en lista local
                          const emailDuplicado = businesses.some(
                            (b) =>
                              b.email.toLowerCase() ===
                                form.email.toLowerCase() &&
                              (!businessToEdit ||
                                b.negocio_id !== businessToEdit.negocio_id)
                          );
                          if (emailDuplicado) {
                            setAlert({
                              type: "error",
                              message:
                                "El correo ya está registrado en otro negocio",
                            });
                            setTimeout(() => setAlert(null), 5000);
                            return;
                          }

                          // --- Si pasa todas las validaciones ---
                          handleSubmit(e);
                        }}
                        className="flex flex-col gap-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre legal
                          </label>
                          <input
                            name="nombre_legal"
                            value={form.nombre_legal}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                nombre_legal: e.target.value.replace(
                                  /[0-9]/g,
                                  ""
                                ),
                              })
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre comercial
                          </label>
                          <input
                            name="nombre_comercial"
                            value={form.nombre_comercial}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                nombre_comercial: e.target.value.replace(
                                  /[0-9]/g,
                                  ""
                                ),
                              })
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo identificación
                          </label>
                          <select
                            name="tipo_identificacion"
                            value={form.tipo_identificacion}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                          >
                            <option value="">Seleccionar</option>
                            <option value="cedula">Física</option>
                            <option value="juridica">Jurídica</option>
                            <option value="pasaporte">DIMEX</option>
                            <option value="nite">NITE</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número identificación
                          </label>
                          <input
                            name="numero_identificacion"
                            value={form.numero_identificacion}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                numero_identificacion: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 12), // <-- límite máximo según tu criterio
                              })
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código actividad emisor (6 dígitos)
                          </label>
                          <input
                            name="codigo_actividad_emisor"
                            value={form.codigo_actividad_emisor}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                codigo_actividad_emisor: e.target.value.replace(/\D/g, "").slice(0,6),
                              })
                            }
                            required
                            maxLength={6}
                            pattern="\d{6}"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm tracking-wider"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Margen ganancia (%)
                          </label>
                          <input
                            type="number"
                            name="margen_ganancia"
                            value={form.margen_ganancia}
                            min={0}
                            max={100}
                            step={0.01}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                margen_ganancia: e.target.value,
                              })
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                          </label>
                          <input
                            name="telefono"
                            value={form.telefono}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                telefono: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 8), // <-- slice limita a 8
                              })
                            }
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                          />
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                          <button
                            type="submit"
                            disabled={loadingForm}
                            className="px-6 py-2 bg-azul-medio hover:bg-azul-hover text-white font-bold rounded-lg cursor-pointer"
                          >
                            {loadingForm
                              ? "Guardando..."
                              : businessToEdit
                                ? "Guardar"
                                : "Crear"}
                          </button>
                          <button
                            type="button"
                            className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                            onClick={() => setModalOpen(false)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal eliminar */}
              {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 backdrop-blur-xs"></div>{" "}
                  {/* solo blur */}
                  <div className="relative bg-white rounded-lg shadow-lg p-6 w-96 z-50">
                    <h2 className="text-lg font-bold mb-4">
                      Confirmar eliminación
                    </h2>
                    <p className="mb-6">
                      ¿Estás seguro de que deseas eliminar este negocio?
                    </p>
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={handleDelete}
                        className="px-6 py-2 bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold rounded-lg cursor-pointer"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => setDeleteModalOpen(false)}
                        className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
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
