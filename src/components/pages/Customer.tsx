import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import TableInformation from "../ui/TableInformation";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { SearchBar } from "../ui/SearchBar";
import SimpleModal from "../ui/SimpleModal";

type Customer = {
  customer_id: number;
  name: string;
  identity_number: string;
  phone?: string;
  email: string;
};

const headers = ["ID", "Nombre", "Cédula", "Teléfono", "Email", "Acciones"];

export default function CustomersPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerIdToDelete, setCustomerIdToDelete] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    identity_number: "",
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Función para cargar clientes
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/customers");
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

  // Inicializar formulario cuando se abre modal
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
        setForm({
          name: "",
          email: "",
          phone: "",
          identity_number: "",
        });
      }
      setAlert(null);
    }
  }, [modalOpen, customerToEdit]);

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:8000/api/v1/customers/${id}`, { method: "DELETE" });
    setCustomers(customers.filter((c) => c.customer_id !== id));
    setFilteredCustomers(filteredCustomers.filter((c) => c.customer_id !== id));
    setDeleteModalOpen(false);
    setCustomerIdToDelete(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoadingForm(true);
  setAlert(null);

    try {
      // Client-side validation for duplicates
      const isDuplicateEmail = customers.some(
        c => c.email.toLowerCase() === form.email.toLowerCase() && 
        (!customerToEdit || c.customer_id !== customerToEdit.customer_id)
      );

      const isDuplicateId = customers.some(
        c => c.identity_number === form.identity_number && 
        (!customerToEdit || c.customer_id !== customerToEdit.customer_id)
      );

      const isDuplicatePhone = form.phone && customers.some(
        c => c.phone && c.phone === form.phone &&
        (!customerToEdit || c.customer_id !== customerToEdit.customer_id)
      );

      if (isDuplicateEmail) {
        setAlert({ type: "error", message: "Ya existe un cliente con este correo electrónico." });
        setLoadingForm(false);
        return;
      }

      if (isDuplicateId) {
        setAlert({ type: "error", message: "Ya existe un cliente con esta cédula." });
        setLoadingForm(false);
        return;
      }

      if (isDuplicatePhone) {
        setAlert({ type: "error", message: "Ya existe un cliente con este número de teléfono." });
        setLoadingForm(false);
        return;
      }

      if (customerToEdit) {
        const res = await fetch(`http://localhost:8000/api/v1/customers/${customerToEdit.customer_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();

        if (res.ok) {
          setAlert({ type: "success", message: "Cliente editado correctamente." });
          setCustomers(prev => prev.map(c => c.customer_id === data.customer_id ? data : c));
          setFilteredCustomers(prev => prev.map(c => c.customer_id === data.customer_id ? data : c));
          setTimeout(() => setModalOpen(false), 1200);
        } else if (res.status === 409) {
          setAlert({ type: "error", message: "Error: Ya existe un cliente con la misma cédula o correo." });
        } else if (data?.message) {
          setAlert({ type: "error", message: data.message });
        } else {
          setAlert({ type: "error", message: "No se pudo editar el cliente." });
        }
      } else {
        const res = await fetch("http://localhost:8000/api/v1/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();

        if (res.ok) {
          setAlert({ type: "success", message: "Cliente agregado correctamente." });
          setCustomers(prev => [...prev, data]);
          setFilteredCustomers(prev => [...prev, data]);
          setTimeout(() => setModalOpen(false), 1200);
        } else if (res.status === 409) {
          setAlert({ type: "error", message: "Error: Ya existe un cliente con la misma cédula o correo." });
        } else if (data?.message) {
          setAlert({ type: "error", message: data.message });
        } else {
          setAlert({ type: "error", message: "No se pudo agregar el cliente." });
        }
      }
    } catch (err: any) {
      setAlert({ type: "error", message: `Error de conexión: ${err.message || "Servidor no responde"}` });
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
          text="Editar"
          style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => {
            setCustomerToEdit(c);
            setModalOpen(true);
          }}
        />
        <Button
          text="Eliminar"
          style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => {
            setCustomerIdToDelete(c.customer_id);
            setDeleteModalOpen(true);
          }}
        />
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
              
              {/* Título a la izquierda */}
              <h1 className="text-2xl font-bold mb-6 text-left">Clientes y Fidelización</h1>

              {/* Barra de búsqueda y botones centrados debajo del título */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mb-6">
                <div className="w-full h-10">
                  <SearchBar<Customer>
                    url="http://localhost:8000/api/v1/customers"
                    displayField="identity_number"
                    placeholder="Buscar por cédula..."
                    onSelect={(item) => setFilteredCustomers([item])}
                  />
                </div>

                <div className="flex gap-2">
                <Button
                    text="Refrescar"
                    style="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-10 rounded cursor-pointer"
                    onClick={() => setFilteredCustomers(customers)}
                  />
                
                  <Button
                    text="Añadir Cliente"
                    style="bg-azul-fuerte hover:bg-azul-claro text-white font-bold py-2 px-10 cursor-pointer mr-20  rounded"
                    onClick={() => {
                      setCustomerToEdit(null);
                      setModalOpen(true);
                    }}
                  />
                </div>
              </div>

              {/* Tabla de clientes */}
              {loading ? (
                <p>Cargando clientes...</p>
              ) : (
                <TableInformation headers={headers} tableContent={tableContent} />
              )}

              {/* Modal de clientes */}
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
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-700 border border-red-300"
                        }`}
                      >
                        {alert.message}
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cédula</label>
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Teléfono"
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-fuerte"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Correo</label>
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
                        className="bg-azul-fuerte hover:bg-azul-claro text-white font-bold px-6 py-2 rounded-lg shadow-md transition"
                      >
                        {loadingForm ? "Guardando..." : customerToEdit ? "Guardar cambios" : "Guardar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg shadow-md transition"
                      >
                        Cerrar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Modal de confirmación de eliminación */}
              <SimpleModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirmar eliminación"
                className="shadow-2xl"
              >
                <p className="mb-4">¿Seguro que deseas eliminar este cliente?</p>
                <div className="flex gap-4 justify-center">
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => customerIdToDelete && handleDelete(customerIdToDelete)}
                  >
                    Eliminar
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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