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
  const [businessesFiltered, setBusinessesFiltered] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [businessToEdit, setBusinessToEdit] = useState<Business | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);

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

  useEffect(() => setBusinessesFiltered(businesses), [businesses]);

  // Cargar negocios
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/v1/businesses`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Error al cargar negocios");
        const data = await res.json();
        setBusinesses(data);
      } catch (error) {
        console.error(error);
        setAlert({ type: "error", message: "Error al cargar los negocios" });
      } finally { setLoading(false); }
    };
    fetchBusinesses();
  }, []);

  // Inicializar modal
  useEffect(() => {
    if (modalOpen) {
      if (businessToEdit) {
        setForm({
          nombre_legal: businessToEdit.nombre_legal,
          nombre_comercial: businessToEdit.nombre_comercial,
          tipo_identificacion: businessToEdit.tipo_identificacion,
          numero_identificacion: businessToEdit.numero_identificacion,
          margen_ganancia: businessToEdit.margen_ganancia ? (Number(businessToEdit.margen_ganancia)*100).toString() : "",
          descripcion: businessToEdit.descripcion ?? "",
          telefono: businessToEdit.telefono,
          email: businessToEdit.email,
        });
      } else {
        setForm({ nombre_legal:"", nombre_comercial:"", tipo_identificacion:"", numero_identificacion:"", margen_ganancia:"", descripcion:"", telefono:"", email:"" });
      }
      setAlert(null);
    }
  }, [modalOpen, businessToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (form.nombre_legal.trim().length < 3) return "Nombre legal mínimo 3 caracteres";
    if (form.nombre_comercial.trim().length < 3) return "Nombre comercial mínimo 3 caracteres";
    if (!form.tipo_identificacion) return "Seleccione un tipo de identificación";
    if (form.numero_identificacion.trim().length < 5 || isNaN(Number(form.numero_identificacion)))
      return "Número de identificación mínimo 5 dígitos y solo números";
    const duplicado = businesses.some(b => b.numero_identificacion === form.numero_identificacion && (!businessToEdit || b.negocio_id !== businessToEdit.negocio_id));
    if (duplicado) return "Esta identificación ya está registrada";
    if (!form.margen_ganancia || Number(form.margen_ganancia)<0 || Number(form.margen_ganancia)>100) return "Margen de ganancia entre 0 y 100";
    if (form.telefono.trim().length<8 || isNaN(Number(form.telefono))) return "Teléfono mínimo 8 dígitos y solo números";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Email inválido";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    setAlert(null);

    const error = validateForm();
    if (error) { setAlert({type:"error", message:error}); setTimeout(()=>setAlert(null),8000); setLoadingForm(false); return; }

    const formToSend = {...form, margen_ganancia: Number(form.margen_ganancia)/100};
    const token = localStorage.getItem("token");
    const url = businessToEdit ? `${API_URL}/api/v1/businesses/${businessToEdit.negocio_id}` : `${API_URL}/api/v1/businesses`;
    try {
      const method = businessToEdit ? "PUT":"POST";
      const res = await fetch(url, { method, headers:{Authorization:`Bearer ${token}`, "Content-Type":"application/json"}, body:JSON.stringify(formToSend) });
      const data = await res.json();
      if (!res.ok) { setAlert({type:"error", message:data?.message||"Error al procesar"}); setTimeout(()=>setAlert(null),8000); return; }

      if (businessToEdit) setBusinesses(businesses.map(b=>b.negocio_id===businessToEdit.negocio_id?data:b));
      else setBusinesses([...businesses,data]);

      setAlert({type:"success", message:businessToEdit?"Negocio actualizado":"Negocio creado"});
      setTimeout(()=>{ setModalOpen(false); setBusinessToEdit(null); setAlert(null); },1200);
    } catch(err:any) {
      setAlert({type:"error", message:err.message||"Error al procesar"}); setTimeout(()=>setAlert(null),8000);
    } finally { setLoadingForm(false); }
  };

  const handleDelete = async () => {
    if (!businessToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/v1/businesses/${businessToDelete.negocio_id}`, { method:"DELETE", headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"} });
      if (!res.ok) throw new Error("No se pudo eliminar");
      setBusinesses(businesses.filter(b=>b.negocio_id!==businessToDelete.negocio_id));
      setAlert({type:"success", message:"Negocio eliminado"});
    } catch(err) { setAlert({type:"error", message:"No se pudo eliminar"}); }
    finally { setDeleteModalOpen(false); setBusinessToDelete(null); setTimeout(()=>setAlert(null),8000);}
  };

  const tableContent = businessesFiltered.map((b)=>({
    ID:b.negocio_id, "Nombre legal":b.nombre_legal, "Nombre comercial":b.nombre_comercial,
    "Tipo de identificación":b.tipo_identificacion, Identificación:b.numero_identificacion,
    "Margen de ganancia (%)":b.margen_ganancia?parseFloat((Number(b.margen_ganancia)*100).toFixed(2))+" %":"-",
    "Margen decimal":b.margen_ganancia?parseFloat(Number(b.margen_ganancia).toFixed(4)).toString():"-",
    Descripción:b.descripcion||"-", Teléfono:b.telefono, Email:b.email,
    Acciones:(
      <div className="flex gap-2">
        <Button style="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded flex items-center gap-2" onClick={()=>{ setBusinessToEdit(b); setModalOpen(true); }}>
          <RiEdit2Fill/> Editar
        </Button>
        <Button style="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded flex items-center gap-2" onClick={()=>{ setBusinessToDelete(b); setDeleteModalOpen(true); }}>
          <FaTrash/> Eliminar
        </Button>
      </div>
    )
  }));

  return (
    <ProtectedRoute allowedRoles={["administrador","supervisor"]}>
      <Container page={
        <div className="flex">
          <SideBar role={userRole}/>
          <div className="w-full pl-10 pt-10">
            <h1 className="text-2xl font-bold mb-6 text-left">Administrar Negocios</h1>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-6">
              <div className="w-full h-10">
                <SearchBar<Business>
                  data={businesses} displayField="negocio_id" searchFields={["negocio_id","nombre_legal"]}
                  placeholder="Buscar por ID o nombre legal..."
                  onResultsChange={results=>{ setBusinessesFiltered(results); if(results.length>0||!results) setAlert(null); }}
                  onSelect={item=>setBusinessesFiltered([item])}
                  onNotFound={q=>{ setBusinessesFiltered([]); setAlert({type:"error", message:`No existe "${q}"`}); setTimeout(()=>setAlert(null),8000); }}
                />
                {alert && <div className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${alert.type==="success"?"bg-green-100 text-green-700 border border-green-300":"bg-red-100 text-red-700 border border-red-300"}`}>{alert.message}</div>}
              </div>
               <Button
    style="bg-sky-500 hover:bg-azul-claro text-white font-bold py-4 px-3 cursor-pointer mr-20 rounded flex items-center gap-2"
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
            {loading ? <p>Cargando...</p> : <TableInformation headers={headers} tableContent={tableContent}/>}
            
          {/* Modal Agregar/Editar */}
{modalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-transparent backdrop-blur-xs"></div>
    <div className="relative bg-white rounded-lg shadow-lg pointer-events-auto overflow-y-auto animate-modalShow transition-all duration-300" style={{width:"32rem", maxHeight:"90vh"}}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">{businessToEdit?"Editar Negocio":"Nuevo Negocio"}</h2>
        {alert && (
          <div className={`mb-4 px-4 py-2 rounded text-center font-semibold ${alert.type==="success"?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>
            {alert.message}
          </div>
        )}
        <form
          onSubmit={async e => {
            e.preventDefault();

            // Validaciones
            if (!form.nombre_legal.trim() || /^\d+$/.test(form.nombre_legal)) {
              setAlert({ type: "error", message: "El nombre legal no puede estar vacío ni ser solo números" });
              setTimeout(() => setAlert(null), 5000);
              return;
            }

            if (!form.nombre_comercial.trim() || /^\d+$/.test(form.nombre_comercial)) {
              setAlert({ type: "error", message: "El nombre comercial no puede estar vacío ni ser solo números" });
              setTimeout(() => setAlert(null), 5000);
              return;
            }

            if (!/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
              setAlert({ type: "error", message: "Email inválido" });
              setTimeout(() => setAlert(null), 5000);
              return;
            }

            if (!/^\d{8,}$/.test(form.telefono)) {
              setAlert({ type: "error", message: "Teléfono inválido, mínimo 8 dígitos" });
              setTimeout(() => setAlert(null), 5000);
              return;
            }

            // Validar margen de ganancia
            const margen = Number(form.margen_ganancia);
            if (isNaN(margen) || margen < 0 || margen > 100) {
              setAlert({ type: "error", message: "Margen de ganancia debe ser entre 0 y 100" });
              setTimeout(() => setAlert(null), 5000);
              return;
            }

            // Validar identificación única
            const existeIdentificacion = businesses.some(b => b.numero_identificacion === form.numero_identificacion && (!businessToEdit || b.negocio_id !== businessToEdit.negocio_id));
            if (existeIdentificacion) {
              setAlert({ type: "error", message: "La identificación ya está registrada" });
              setTimeout(() => setAlert(null), 5000);
              return;
            }

            // Si pasa validaciones, llama a handleSubmit
            handleSubmit(e);
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre legal</label>
            <input
              name="nombre_legal"
              value={form.nombre_legal}
              onChange={e => setForm({...form, nombre_legal: e.target.value.replace(/[0-9]/g, "")})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre comercial</label>
            <input
              name="nombre_comercial"
              value={form.nombre_comercial}
              onChange={e => setForm({...form, nombre_comercial: e.target.value.replace(/[0-9]/g, "")})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo identificación</label>
            <select
              name="tipo_identificacion"
              value={form.tipo_identificacion}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Seleccionar</option>
              <option value="cedula">física</option>
              <option value="juridica">jurídica</option>
              <option value="pasaporte">DIMEX</option>
              <option value="nite">NITE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número identificación</label>
            <input
              name="numero_identificacion"
              value={form.numero_identificacion}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margen ganancia (%)</label>
            <input
              type="number"
              name="margen_ganancia"
              value={form.margen_ganancia}
              min={0}
              max={100}
              step={0.01}
              onChange={e => setForm({...form, margen_ganancia: e.target.value})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={e => setForm({...form, telefono: e.target.value.replace(/\D/g, "")})}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={()=>setModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingForm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loadingForm?"Guardando...":businessToEdit?"Guardar":"Crear"}
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
    <div className="absolute inset-0 backdrop-blur-xs"></div> {/* solo blur */}
    <div className="relative bg-white rounded-lg shadow-lg p-6 w-96 z-50">
      <h2 className="text-lg font-bold mb-4">Confirmar eliminación</h2>
      <p className="mb-6">¿Estás seguro de que deseas eliminar este negocio?</p>
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setDeleteModalOpen(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
)}

          </div>
        </div>
      }/>
    </ProtectedRoute>
  );
}
