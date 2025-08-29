import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import TableInformation from "../ui/TableInformation";
import Button from "../ui/Button";
import Container from "../ui/Container";

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
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    identity_number: "",
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar clientes:", err);
        setCustomers([]);
        setLoading(false);
      });
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
    await fetch(`http://localhost:8000/api/v1/customers/${id}`, {
      method: "DELETE",
    });
    setCustomers(customers.filter((c) => c.customer_id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);

    try {
      if (customerToEdit) {
        // Editar cliente
        const res = await fetch(`http://localhost:8000/api/v1/customers/${customerToEdit.customer_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setAlert({ type: "success", message: "Cliente editado correctamente." });
          setCustomers((prev) =>
            prev.map((c) => (c.customer_id === data.customer_id ? data : c))
          );
          setTimeout(() => setModalOpen(false), 1200);
        } else {
          setAlert({ type: "error", message: "No se pudo editar el cliente." });
        }
      } else {
        // Añadir cliente
        const res = await fetch("http://localhost:8000/api/v1/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          setAlert({ type: "success", message: "Cliente agregado correctamente." });
          setCustomers((prev) => [...prev, data]);
          setTimeout(() => setModalOpen(false), 1200);
        } else {
          setAlert({ type: "error", message: "No se pudo agregar el cliente." });
        }
      }
    } catch {
      setAlert({ type: "error", message: "Error de conexión con el servidor." });
    } finally {
      setLoadingForm(false);
    }
  };

  const tableContent = customers.map((c) => ({
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
          onClick={() => handleDelete(c.customer_id)}
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
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Clientes y Fidelización</h1>
                <Button
                  text="Añadir cliente"
                  style="bg-azul-fuerte hover:bg-azul-claro text-white font-bold py-2 px-4 m-10 rounded"
                  onClick={() => {
                    setCustomerToEdit(null); // modo añadir
                    setModalOpen(true);
                  }}
                />
              </div>
              {loading ? (
                <p>Cargando clientes...</p>
              ) : (
                <TableInformation headers={headers} tableContent={tableContent} />
              )}

              {/* Modal de clientes */}
              {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black opacity-30"></div>
                  <form
                    onSubmit={handleSubmit}
                    className="relative bg-white p-8 rounded shadow-lg flex flex-col w-1/2 max-w-lg"
                  >
                    <h2 className="text-xl font-bold mb-4">
                      {customerToEdit ? "Editar Cliente" : "Añadir Cliente"}
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
                    <div className="flex flex-col gap-4">
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Nombre"
                        className="border rounded px-3 py-2"
                        required
                      />
                      <input
                        name="identity_number"
                        value={form.identity_number}
                        onChange={handleChange}
                        placeholder="Cédula"
                        className="border rounded px-3 py-2"
                        required
                      />
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Teléfono"
                        className="border rounded px-3 py-2"
                      />
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Correo"
                        className="border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div className="flex gap-4 justify-center mt-6">
                      <button
                        type="submit"
                        disabled={loadingForm}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
                        className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
                      >
                        Cerrar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
