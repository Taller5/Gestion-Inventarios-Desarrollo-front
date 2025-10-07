import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import TableInformation from "../ui/TableInformation";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { SearchBar } from "../ui/SearchBar";
import SimpleModal from "../ui/SimpleModal";
import { IoAddCircle } from "react-icons/io5";
import { RiEdit2Fill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";

type Customer = {
  customer_id: number;
  name: string;
  identity_number: string;
  phone?: string;
  email: string;
};

const headers = ["ID", "Nombre", "Cédula", "Teléfono", "Email", "Acciones"];
const API_URL = import.meta.env.VITE_API_URL;

export default function CustomersPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerIdToDelete, setCustomerIdToDelete] = useState<number | null>(
    null
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    identity_number: "",
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Cargar clientes
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/customers`);
      const data = await res.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (customerToEdit) {
        setForm({
          name: customerToEdit.name,
          email: customerToEdit.email,
          phone: customerToEdit.phone ?? "",
          identity_number: customerToEdit.identity_number,
        });
      } else {
        setForm({ name: "", email: "", phone: "", identity_number: "" });
      }
      setAlert(null);
    }
  }, [modalOpen, customerToEdit]);

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/api/v1/customers/${id}`, { method: "DELETE" });
    setCustomers(customers.filter((c) => c.customer_id !== id));
    setFilteredCustomers(filteredCustomers.filter((c) => c.customer_id !== id));
    setDeleteModalOpen(false);
    setCustomerIdToDelete(null);
  };

  // --- VALIDACIÓN EN TIEMPO REAL ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    switch (name) {
      case "name":
        // Letras y espacios, máximo 50
        if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 50) {
          setForm({ ...form, [name]: value });
        }
        break;

      case "identity_number":
        // Solo números, máximo 12
        if (/^\d*$/.test(value) && value.length <= 12) {
          setForm({ ...form, [name]: value });
        }
        break;

      case "phone":
        // Solo números, máximo 8
        if (/^\d*$/.test(value) && value.length <= 8) {
          setForm({ ...form, [name]: value });
        }
        break;

      case "email":
        // Hasta 100 caracteres
        if (value.length <= 100) {
          setForm({ ...form, [name]: value });
        }
        break;

      default:
        setForm({ ...form, [name]: value });
    }
  };

  // --- ENVÍO Y VALIDACIÓN FINAL ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    setAlert(null);
    if (!/^[a-zA-Z\s]+$/.test(form.name) || form.name.length > 50) {
      setAlert({
        type: "error",
        message: "El nombre solo puede contener letras y espacios (máx. 50).",
      });
      setLoadingForm(false);
      return;
    }

    if (
      !/^\d+$/.test(form.identity_number) ||
      form.identity_number.length > 12
    ) {
      setAlert({
        type: "error",
        message:
          "La cédula o identificación solo puede contener números (máx. 12).",
      });
      setLoadingForm(false);
      return;
    }

    if (!/^\d{8}$/.test(form.phone)) {
      setAlert({
        type: "error",
        message: "El teléfono debe contener exactamente 8 números.",
      });
      setLoadingForm(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email) || form.email.length > 100) {
      setAlert({
        type: "error",
        message: "Correo inválido (máx. 100 caracteres).",
      });
      setLoadingForm(false);
      return;
    }

    try {
      const otherCustomers = customerToEdit
        ? customers.filter((c) => c.customer_id !== customerToEdit.customer_id)
        : customers;

      const isDuplicateEmail = otherCustomers.some(
        (c) => c.email.toLowerCase() === form.email.toLowerCase()
      );
      const isDuplicateId = otherCustomers.some(
        (c) => c.identity_number === form.identity_number
      );
      const isDuplicatePhone = form.phone
        ? otherCustomers.some((c) => c.phone && c.phone === form.phone)
        : false;

      if (isDuplicateEmail) {
        setAlert({
          type: "error",
          message: "Ya existe un cliente con este correo electrónico.",
        });
        setLoadingForm(false);
        return;
      }
      if (isDuplicateId) {
        setAlert({
          type: "error",
          message: "Ya existe un cliente con esta cédula.",
        });
        setLoadingForm(false);
        return;
      }
      if (isDuplicatePhone) {
        setAlert({
          type: "error",
          message: "Ya existe un cliente con este número de teléfono.",
        });
        setLoadingForm(false);
        return;
      }

      // POST / PUT
      if (customerToEdit) {
        const res = await fetch(
          `${API_URL}/api/v1/customers/${customerToEdit.customer_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setAlert({
            type: "success",
            message: "Cliente editado correctamente.",
          });
          setCustomers((prev) =>
            prev.map((c) => (c.customer_id === data.customer_id ? data : c))
          );
          setFilteredCustomers((prev) =>
            prev.map((c) => (c.customer_id === data.customer_id ? data : c))
          );
          setTimeout(() => setModalOpen(false), 1200);
        } else {
          setAlert({
            type: "error",
            message: data?.message || "No se pudo editar el cliente.",
          });
        }
      } else {
        const res = await fetch(`${API_URL}/api/v1/customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setAlert({
            type: "success",
            message: "Cliente agregado correctamente.",
          });
          setCustomers((prev) => [...prev, data]);
          setFilteredCustomers((prev) => [...prev, data]);
          setTimeout(() => setModalOpen(false), 1200);
        } else {
          setAlert({
            type: "error",
            message: data?.message || "No se pudo agregar el cliente.",
          });
        }
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: `Error de conexión: ${err.message || "Servidor no responde"}`,
      });
    } finally {
      setLoadingForm(false);
    }
  };

  const tableContent = filteredCustomers.map((c) => ({
    ID: c.customer_id,
    Nombre: c.name,
    Cédula: c.identity_number,
    Teléfono: c.phone ?? "-",
    Email: c.email,
    Acciones: (
      <div className="flex gap-2">
        <Button
          style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setCustomerToEdit(c);
            setModalOpen(true);
          }}
        >
          <RiEdit2Fill /> Editar
        </Button>
        <Button
          style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setCustomerIdToDelete(c.customer_id);
            setDeleteModalOpen(true);
          }}
        >
          <FaTrash /> Eliminar
        </Button>
      </div>
    ),
  }));

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "vendedor"]}>
      <Container
        page={
          <div className="flex">
            <SideBar role={userRole} />
            <div className="w-full pl-10 pt-10">
              <h1 className="text-2xl font-bold mb-6 text-left">
                Gestionar Clientes y Fidelización
              </h1>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mb-6">
                <div className="w-full h-10">
                  <SearchBar<Customer>
                    data={customers}
                    displayField="identity_number"
                    placeholder="Buscar por cédula..."
                    onResultsChange={(results) => {
                      setFilteredCustomers(results);
                      if (results.length > 0) setAlert(null); // Quita la alerta si hay resultados
                    }}
                    onSelect={(item) => setFilteredCustomers([item])}
                    onNotFound={(q) => {
                      if (!q || q.trim() === "") {
                        setAlert({
                          type: "error",
                          message: "Por favor digite una cédula para buscar.",
                        });
                      } else {
                        setFilteredCustomers([]);
                        setAlert({
                          type: "error",
                          message: `No existe ningún cliente con la cédula "${q}".`,
                        });
                      }
                    }}
                    onClearAlert={() => {
                      setAlert(null); // Quita la alerta
                      // Solo recarga la tabla si actualmente está mostrando menos elementos que todos
                    }}
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

                <div className="flex gap-2">
                  <Button
                    style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-4 px-3 cursor-pointer mr-20 rounded flex items-center gap-2"
                    onClick={() => {
                      setCustomerToEdit(null);
                      setModalOpen(true);
                    }}
                  >
                    <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                    <span className="whitespace-nowrap text-base">
                      Añadir Cliente
                    </span>
                  </Button>
                </div>
              </div>

              {loading ? (
                <p>Cargando clientes...</p>
              ) : (
                <TableInformation
                  headers={headers}
                  tableContent={tableContent}
                />
              )}

              {/* Modal */}
              {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                  <form
                    onSubmit={handleSubmit}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                      {customerToEdit ? "Editar Cliente" : "Añadir Cliente"}
                    </h2>

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

                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Nombre
                        </label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Nombre"
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-fuerte"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Cédula
                        </label>
                        <input
                          name="identity_number"
                          value={form.identity_number}
                          onChange={handleChange}
                          placeholder="Cédula"
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-fuerte"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Teléfono
                        </label>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Teléfono"
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-fuerte"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Correo
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Correo"
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-fuerte"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end mt-6">
                      <button
                        type="submit"
                        disabled={loadingForm}
                        className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      >
                        {loadingForm
                          ? "Guardando..."
                          : customerToEdit
                            ? "Guardar cambios"
                            : "Guardar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <SimpleModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirmar eliminación"
                className="shadow-2xl"
              >
                <p className="mb-4">
                  ¿Seguro que deseas eliminar este cliente?
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    className="px-6 py-2 bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold rounded-lg cursor-pointer"
                    onClick={() =>
                      customerIdToDelete && handleDelete(customerIdToDelete)
                    }
                  >
                    Eliminar
                  </button>
                  <button
                    className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </SimpleModal>
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
