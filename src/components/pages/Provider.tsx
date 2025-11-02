import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";

import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";
import { IoAddCircle } from "react-icons/io5";
import { RiEdit2Fill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { SearchBar } from "../ui/SearchBar";
import ProductSelectorModal from "../ui/ProviderComponents/ProductSelectorModal";
import InfoIcon from "../ui/InfoIcon";

type Provider = {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  state: string;
  products: Product[]; // productos asociados (del backend)
};

// Para el formulario, products es string[] (nombres) y el id es opcional
type ProviderForm = Omit<Provider, "products"> & {
  id?: number;
  products: string[];
};
// Para el backend, products es number[]
type ProviderPayload = Omit<Provider, "products"> & { products: number[] };

const headers = ["id", "name", "contact", "email", "phone", "state", "actions"];

// Productos reales del inventario
type Product = {
  id: number;
  codigo_producto: string;
  nombre_producto: string;
  descripcion: string;
  stock: number;
  precio: number;
  bodega?: string;
};

export default function Providers() {
  const API_URL = import.meta.env.VITE_API_URL;
  // Estado para productos del inventario
  const [products, setProducts] = useState<Product[]>([]);

  // Obtener productos reales del inventario
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        // Si falla, deja el array vacío
        setProducts([]);
      }
    };
    fetchProducts();
  }, [API_URL]);
 


  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersFiltered, setProvidersFiltered] = useState<Provider[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState<Provider | null>(null);

  // Obtener todos los proveedores
  const fetchProviders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/providers`);
      const data = await res.json();
      setProviders(data);
      setProvidersFiltered(data);
    } catch (err) {
      setAlert({ type: "error", message: "Error al cargar proveedores" });
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Eliminar proveedor
  const handleDelete = async () => {
    if (selectedProviderId === null) return;
    await deleteProvider(selectedProviderId);
    setShowModal(false);
    setSelectedProviderId(null);
  };

  // Crear proveedor
  const createProvider = async (providerData: ProviderPayload) => {
    const duplicateField = providers.find(
      (p) =>
        p.name.toLowerCase() === providerData.name.toLowerCase() ||
        p.email.toLowerCase() === providerData.email.toLowerCase() ||
        p.phone === providerData.phone
    );

    if (duplicateField) {
      let field = "";
      if (
        duplicateField.name.toLowerCase() === providerData.name.toLowerCase()
      ) {
        field = "nombre de empresa";
      } else if (
        duplicateField.email.toLowerCase() === providerData.email.toLowerCase()
      ) {
        field = "email";
      } else if (duplicateField.phone === providerData.phone) {
        field = "teléfono";
      }

      setAlert({
        type: "error",
        message: `Ya existe un proveedor con el mismo ${field}`,
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(providerData),
      });

      if (res.ok) {
        fetchProviders();
        setAlert({
          type: "success",
          message: "Proveedor creado correctamente",
        });
      } else {
        setAlert({ type: "error", message: "Error al crear proveedor" });
      }
    } catch {
      setAlert({ type: "error", message: "Error al crear proveedor" });
    }
  };

  // Actualizar proveedor
  const updateProvider = async (id: number, providerData: ProviderPayload) => {
    const duplicateField = providers.find(
      (p) =>
        p.id !== id &&
        (p.name.toLowerCase() === providerData.name.toLowerCase() ||
          p.email.toLowerCase() === providerData.email.toLowerCase() ||
          p.phone === providerData.phone)
    );

    if (duplicateField) {
      let field = "";
      if (
        duplicateField.name.toLowerCase() === providerData.name.toLowerCase()
      ) {
        field = "nombre de empresa";
      } else if (
        duplicateField.email.toLowerCase() === providerData.email.toLowerCase()
      ) {
        field = "email";
      } else if (duplicateField.phone === providerData.phone) {
        field = "teléfono";
      }

      setAlert({
        type: "error",
        message: `Ya existe un proveedor con el mismo ${field}`,
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(providerData),
      });

      if (res.ok) {
        fetchProviders();
        setAlert({
          type: "success",
          message: "Proveedor actualizado correctamente",
        });
      } else {
        setAlert({ type: "error", message: "Error al actualizar proveedor" });
      }
    } catch {
      setAlert({ type: "error", message: "Error al actualizar proveedor" });
    }
  };

  // Eliminar proveedor (API)
  const deleteProvider = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/providers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProviders();
        setAlert({
          type: "success",
          message: "Proveedor eliminado correctamente",
        });
      } else {
        setAlert({ type: "error", message: "Error al eliminar proveedor" });
      }
    } catch {
      setAlert({ type: "error", message: "Error al eliminar proveedor" });
    }
  };

  const getActions = (provider: Provider) => [
    <div className="flex flex-row" key={provider.id}>
      <Button
        style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-1 px-2 rounded m-1 cursor-pointer flex items-center gap-2"
        onClick={() => {
          setProviderToEdit(provider);
          setShowEditModal(true);
        }}
      >
        <RiEdit2Fill />
        Editar
      </Button>
      <Button
        style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold py-1 px-2 rounded m-1 cursor-pointer flex items-center gap-2"
        onClick={() => {
          setSelectedProviderId(provider.id);
          setShowModal(true);
        }}
      >
        <FaTrash />
        Eliminar
      </Button>
    </div>,
  ];

  const tableContent = providersFiltered.map((prov) => ({
    id: prov.id,
    name: prov.name,
    contact: prov.contact,
    email: prov.email,
    phone: prov.phone,
    state: prov.state,
    actions: getActions(prov),
  }));

  // Convierte los nombres de productos seleccionados a IDs
  const getProductIdsFromNames = (names: string[]) => {
    return products
      .filter((p) => names.includes(p.nombre_producto))
      .map((p) => p.id);
  };

  const handleProviderAdded = async (prov: ProviderForm) => {
    const productIds = getProductIdsFromNames(prov.products);
    const payload: ProviderPayload = { ...prov, products: productIds };
    await createProvider(payload);
    setShowEditModal(false);
    setProviderToEdit(null);
  };

  const handleProviderEdited = async (
    updatedProv: ProviderForm & { id: number }
  ) => {
    const productIds = getProductIdsFromNames(updatedProv.products);
    const payload: ProviderPayload = { ...updatedProv, products: productIds };
    await updateProvider(updatedProv.id, payload);
    setShowEditModal(false);
    setProviderToEdit(null);
  };

  // ---------------------- Modal de Proveedor ----------------------

  const ProviderModal = () => {
    const [nameError, setNameError] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [phoneError, setPhoneError] = useState<string>("");
    const [productSelectorOpen, setProductSelectorOpen] = useState(false);

    const [formData, setFormData] = useState<ProviderForm>({
      id: 0,
      name: "",
      contact: "",
      email: "",
      phone: "",
      state: "Activo",
      products: [],
    });

    useEffect(() => {
      if (providerToEdit) {
        setFormData({
          id: providerToEdit.id,
          name: providerToEdit.name,
          contact: providerToEdit.contact,
          email: providerToEdit.email,
          phone: providerToEdit.phone,
          state: providerToEdit.state,
          products: providerToEdit.products.map((p) => p.nombre_producto),
        });
      } else {
        setFormData({
          id: 0,
          name: "",
          contact: "",
          email: "",
          phone: "",
          state: "Activo",
          products: [],
        });
      }
    }, [providerToEdit, showEditModal]);

    if (!showEditModal) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

      // Validación contacto
      if (!nameRegex.test(formData.contact)) {
        setNameError("El contacto solo puede contener letras y espacios.");
        return;
      }

      // Validación email
      if (!emailRegex.test(formData.email)) {
        setEmailError(
          "Debe ingresar un email con dominio válido, por ejemplo: usuario@dominio.com"
        );
        return;
      }

      // Validación teléfono: solo números y exactamente 8 dígitos
      if (!/^\d{8}$/.test(formData.phone)) {
        setPhoneError("El teléfono debe contener exactamente 8 números.");
        return;
      }

      setPhoneError(""); // limpiar error si pasa la validación

      setNameError("");
      setEmailError("");

      if (providerToEdit) {
        await handleProviderEdited(formData);
      } else {
        const { id, ...rest } = formData;
        await handleProviderAdded(rest as ProviderForm);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
        <div className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg">
            <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      aria-label="Cerrar"
                      className="absolute top-4 right-4 rounded-full p-1 bg-[var(--color-rojo-ultra-claro)] hover:bg-[var(--color-rojo-claro)] transition cursor-pointer"
                      style={{ zIndex: 10 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-[var(--color-rojo-oscuro)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
          <h2 className="text-xl font-bold mb-4">
            {providerToEdit ? "Editar Proveedor" : "Añadir Proveedor"}
          </h2>

          <hr className="text-gray-600 pt-2 pb-2"/>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              className="border p-2 rounded"
              type="text"
              placeholder="Nombre del proveedor"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              className="border p-2 rounded"
              title="Persona encargada del proveedor"
              type="text"
              placeholder="Nombre de la persona encargada del proveedor"
              value={formData.contact}
              onChange={(e) => {
                const onlyLetters = e.target.value.replace(
                  /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                  ""
                );
                setFormData({ ...formData, contact: onlyLetters });
              }}
              required
            />
            {nameError && (
              <span className="text-red-500 text-sm">{nameError}</span>
            )}
            <input
              className="border p-2 rounded"
              type="email"
              placeholder="Email"
              title="Debe tener un dominio válido, por ejemplo: usuario@dominio.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            {emailError && (
              <span className="text-red-500 text-sm">{emailError}</span>
            )}
            <input
              className="border p-2 rounded"
              type="text"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => {
                // solo números y máximo 8 dígitos
                const onlyNums = e.target.value
                  .replace(/[^0-9]/g, "")
                  .slice(0, 8);
                setFormData({ ...formData, phone: onlyNums });
              }}
              required
            />
            {phoneError && (
              <span className="text-red-500 text-sm">{phoneError}</span>
            )}

            <select
              className="border p-2 rounded cursor-pointer"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>

            <div>
              <label className="font-semibold mb-2 block">
                Productos que distribuye:
              </label>

              {/* Mostrar badges y botón para abrir modal */}
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.products.length === 0 && (
                  <span className="text-sm text-gray-500">
                    Ninguno seleccionado
                  </span>
                )}

                {formData.products.slice(0, 4).map((name) => (
                  <span
                    key={name}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {name}
                  </span>
                ))}

                {formData.products.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setProductSelectorOpen(true)}
                    className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-sm cursor-pointer"
                  >
                    ...
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProductSelectorOpen(true)}
                  className="w-full text-left border p-2 rounded bg-white hover:bg-gray-50"
                >
                  Seleccionar productos...
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Selecciona los productos que distribuye el proveedor.
              </p>
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button
                type="submit"
                className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
              >
                {providerToEdit ? "Guardar" : "Añadir"}
              </button>
              <button
                type="button"
                className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                onClick={() => {
                  setShowEditModal(false);
                  setProviderToEdit(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Product selector modal */}
          <ProductSelectorModal
            open={productSelectorOpen}
            products={products}
            selected={formData.products}
            onClose={() => setProductSelectorOpen(false)}
            onConfirm={(selectedNames) => {
              setFormData({ ...formData, products: selectedNames });
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
      <Container
        page={
          <div className="flex">
           
       <div className="w-full pl-4 pt-10">

              <h1 className="text-2xl font-bold mb-6 text-left">
                Gestionar Proveedores
                <InfoIcon
                  title="Gestionar Proveedores"
                  description="Aquí puedes gestionar los proveedores de tu inventario. Para añadir un proveedor, debes de añadir primero los productos que distribuye en Inventario."
                />
              </h1>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-6">

                <div className="w-full h-10">
                  <SearchBar<Provider>
                    data={providers}
                    displayField="name" // lo que aparece en el input mientras escribes
                    searchFields={["id", "name", "contact"]} // campos que se buscan
                    placeholder="Buscar por ID, nombre o contacto..."
                    resultFormatter={(item) => `${item.id} - ${item.name}`} //  muestra ID y nombre
                    onResultsChange={(results) => {
                      setProvidersFiltered(results);
                      if (results.length > 0) setAlert(null);
                    }}
                    onSelect={(item) => setProvidersFiltered([item])}
                    onNotFound={(q) => {
                      if (!q || q.trim() === "") {
                        setAlert({
                          type: "error",
                          message:
                            "Por favor digite un ID, nombre o contacto para buscar.",
                        });
                      } else {
                        setProvidersFiltered([]);
                        setAlert({
                          type: "error",
                          message: `No existe ningún proveedor con el criterio "${q}".`,
                        });
                      }
                    }}
                    onClearAlert={() => setAlert(null)}
                  />

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
                  onClick={() => setShowEditModal(true)}
                >
                  <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="whitespace-nowrap text-base">
                    Añadir proveedor
                  </span>
                </Button>
              </div>
              <TableInformation tableContent={tableContent} headers={headers} />

              {/* Modal dentro del mismo archivo */}
              <ProviderModal />

              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
                  
                  <div
                    className="relative bg-white p-6 rounded shadow-lg pointer-events-auto animate-modalShow transition-all duration-300"
                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
                  >
                    <p className="mb-4">
                      ¿Seguro que deseas eliminar este proveedor?
                    </p>
                    <div className="flex gap-4">
                      <button
                        className="px-6 py-2 bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold rounded-lg cursor-pointer"
                        onClick={handleDelete}
                      >
                        Eliminar
                      </button>
                      <button
                        className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
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
