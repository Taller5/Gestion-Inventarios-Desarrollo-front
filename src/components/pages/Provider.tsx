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

type Provider = {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  state: string;
  products: string[];
};

const headers = ["id", "name", "contact", "email", "phone", "state", "products", "actions"];

const MOCK_PRODUCTS = ["Arroz", "Frijoles", "Azúcar", "Harina", "Aceite", "Sal"];

export default function Providers() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersFiltered, setProvidersFiltered] = useState<Provider[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState<Provider | null>(null);

  useEffect(() => {
    const mockProviders: Provider[] = [
      { id: 1, name: "Distribuidora La Fortuna", contact: "Carlos López", email: "carlos@lafortuna.com", phone: "8888-1234", state: "Activo", products: ["Arroz","Frijoles"] },
      { id: 2, name: "Agroinsumos del Norte", contact: "María Pérez", email: "maria@agronorte.com", phone: "8888-5678", state: "Activo", products: ["Azúcar","Harina"] },
      { id: 3, name: "Ferretería El Martillo", contact: "Juan García", email: "juan@martillo.com", phone: "8888-9876", state: "Inactivo", products: ["Aceite","Sal"] },
    ];
    setProviders(mockProviders);
    setProvidersFiltered(mockProviders);
  }, []);

  const handleDelete = () => {
    if (selectedProviderId === null) return;
    setProviders(providers.filter((prov) => prov.id !== selectedProviderId));
    setShowModal(false);
    setSelectedProviderId(null);
  };

  const getActions = (provider: Provider) => [
    <div className="flex flex-row" key={provider.id}>
      <Button
        style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer flex items-center gap-2"
        onClick={() => {
          setProviderToEdit(provider);
          setShowEditModal(true);
        }}
      >
        <RiEdit2Fill />
        Editar
      </Button>
      <Button
        style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer flex items-center gap-2"
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
    products: prov.products.join(", "),
    actions: getActions(prov),
  }));

  const handleProviderAdded = (prov: Provider) => setProviders((prev) => [...prev, prov]);
  const handleProviderEdited = (updatedProv: Provider) => setProviders((prev) =>
    prev.map((prov) => (prov.id === updatedProv.id ? { ...prov, ...updatedProv } : prov))
  );

  // ---------------------- Modal de Proveedor ----------------------
  const ProviderModal = () => {
    const [formData, setFormData] = useState<Provider>({
      id: Math.floor(Math.random() * 10000),
      name: "",
      contact: "",
      email: "",
      phone: "",
      state: "Activo",
      products: [],
    });

    useEffect(() => {
      if (providerToEdit) setFormData(providerToEdit);
    }, [providerToEdit]);

    if (!showEditModal) return null;

    const toggleProduct = (product: string) => {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.includes(product)
          ? prev.products.filter((p) => p !== product)
          : [...prev.products, product],
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (providerToEdit) handleProviderEdited(formData);
      else handleProviderAdded(formData);
      setShowEditModal(false);
      setProviderToEdit(null);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-transparent backdrop-blur-xs"></div>
        <div className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg">
          <h2 className="text-xl font-bold mb-4">{providerToEdit ? "Editar Proveedor" : "Añadir Proveedor"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input className="border p-2 rounded" type="text" placeholder="Nombre del proveedor" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} required/>
            <input className="border p-2 rounded" type="text" placeholder="Contacto" value={formData.contact} onChange={(e)=>setFormData({...formData, contact:e.target.value})} required/>
            <input className="border p-2 rounded" type="email" placeholder="Email" value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})} required/>
            <input className="border p-2 rounded" type="text" placeholder="Teléfono" value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} required/>
            <select className="border p-2 rounded" value={formData.state} onChange={(e)=>setFormData({...formData, state:e.target.value})}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>

<div>
  <p className="font-semibold mb-2">Productos que distribuye:</p>
  <div className="border rounded max-h-40 overflow-y-auto p-2">
    {MOCK_PRODUCTS.map((product) => (
      <label key={product} className="flex items-center gap-2 mb-1 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.products.includes(product)}
          onChange={() => toggleProduct(product)}
          className="accent-sky-500"
        />
        {product}
      </label>
    ))}
  </div>
  <p className="text-sm text-gray-500 mt-1">
    Marca los productos que distribuye el proveedor.
  </p>
</div>



            <div className="flex justify-end gap-4 mt-4">
              <button type="button" className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded" onClick={()=>{setShowEditModal(false); setProviderToEdit(null)}}>Cancelar</button>
              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">{providerToEdit ? "Guardar" : "Añadir"}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["administrador","supervisor"]}>
      <Container
        page={
          <div className="flex">
            <SideBar role={userRole}></SideBar>
            <div className="w-full pl-10 pt-10">
              <h1 className="text-2xl font-bold mb-6 text-left">Proveedores</h1>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-6">
                <div className="w-full h-10">
                  <SearchBar<Provider>
                    data={providers}
                    displayField="id"
                    searchFields={["id","name","contact"]}
                    placeholder="Buscar por ID, nombre o contacto..."
                    onResultsChange={(results)=>{setProvidersFiltered(results); if(results.length>0||!results)setAlert(null)}}
                    onSelect={(item)=>setProvidersFiltered([item])}
                    onNotFound={(q)=>{if(q==="")setAlert(null); else{setProvidersFiltered([]); setAlert({type:"error",message:`No existe ningún proveedor con el criterio "${q}".`})}}}
                  />
                  {alert && <div className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${alert.type==="success"?"bg-green-100 text-green-700 border border-green-300":"bg-red-100 text-red-700 border border-red-300"}`}>{alert.message}</div>}
                </div>
                <Button style="bg-sky-500 hover:bg-azul-claro text-white font-bold py-4 px-3 cursor-pointer mr-20 rounded flex items-center gap-2" onClick={()=>setShowEditModal(true)}>
                  <IoAddCircle className="w-6 h-6 flex-shrink-0"/>
                  <span className="whitespace-nowrap text-base">Añadir proveedor</span>
                </Button>
              </div>
              <TableInformation tableContent={tableContent} headers={headers}/>
              
              {/* Modal dentro del mismo archivo */}
              <ProviderModal />

              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-transparent backdrop-blur-xs"></div>
                  <div className="relative bg-white p-6 rounded shadow-lg pointer-events-auto animate-modalShow transition-all duration-300" style={{boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}}>
                    <p className="mb-4">¿Seguro que deseas eliminar este proveedor?</p>
                    <div className="flex gap-4">
                      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer" onClick={handleDelete}>Eliminar</button>
                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer" onClick={()=>setShowModal(false)}>Cancelar</button>
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
