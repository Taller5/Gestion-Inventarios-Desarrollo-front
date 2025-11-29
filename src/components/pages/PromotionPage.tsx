import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import PromotionForm from "../ui/PromotionComponents/PromotionForm";
import TableInformation from "../ui/TableInformation";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import InfoIcon from "../ui/InfoIcon";
import { FaTrash } from "react-icons/fa";
import { RiEdit2Fill } from "react-icons/ri";

const API_URL = import.meta.env.VITE_API_URL;

export interface Producto {
  id: number;
  nombre_producto: string;
}

export interface PromotionProduct {
  product_id: number;
  cantidad: number;
  descuento: number;
}

export interface Promotion {
  id?: number;
  nombre: string;
  descripcion?: string;
  tipo: "porcentaje" | "fijo" | "combo";
  valor?: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  products: PromotionProduct[];
  business_nombre?: string;
    business_id: null,
    branch_id: null,
  
}


export default function PromotionPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });

  // Modal para ver productos
  const [productsModal, setProductsModal] = useState<{
    open: boolean;
    products: PromotionProduct[];
    promoName: string;
  }>({ open: false, products: [], promoName: "" });

  //  Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/v1/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProductos(data);
      } catch (err) {
        console.error("Error cargando productos:", err);
      }
    };
    fetchProductos();
  }, []);

  //  Cargar promociones
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/v1/promotions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data: Promotion[] = await res.json();

      // Normalizar productos
      data = data.map((promo) => ({
        ...promo,
        products: promo.products.map((p: any) => ({
          product_id: p.product_id ?? p.id,
          cantidad: p.cantidad ?? p.pivot?.cantidad ?? 1,
          descuento: p.descuento ?? p.pivot?.descuento ?? 0,
        })),
      }));

      setPromotions(data);
    } catch (err) {
      console.error("Error cargando promociones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);
  const [branches, setBranches] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
   //  Cargar sucursales y negocios
  useEffect(() => {
    const fetchBranchesAndBusinesses = async () => {
      try {
        const token = localStorage.getItem("token");
        const [branchesRes, businessesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/branches`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/v1/businesses`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);
        setBranches(branchesRes);
        setBusinesses(businessesRes);
      } catch (err) {
        console.error("Error cargando sucursales y negocios:", err);
      }
    };
    fetchBranchesAndBusinesses();
  }, []);


  // 🔹 Eliminar promoción
  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/v1/promotions/${confirmDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirmDelete({ open: false, id: null });
      fetchPromotions();
    } catch (err) {
      console.error(err);
    }
  };

  //  Contenido de la tabla
  const tableHeaders = ["Nombre", "Tipo", "Descuento", "Activa", "Productos", "Acciones"];
  const tableContent = promotions.map((promo) => ({
    Nombre: promo.nombre,
    Tipo: promo.tipo,
    Descuento: promo.valor!== undefined && promo.valor !== null ? `${promo.valor}%` : "--indefinido--", //se concatena %
    Activa: promo.activo ? (
      <AiOutlineCheck className="text-green-600 text-lg" />
    ) : (
      <AiOutlineClose className="text-red-600 text-lg" />
    ),
    Productos:
      promo.products.length > 0 ? (
        <div>
          <ul className="space-y-1">
            {promo.products.slice(0, 2).map((p, i) => {
              const prod = productos.find((pr) => pr.id === p.product_id);
              return (
                <li
                  key={i}
                  className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200"
                >
                  <span className="font-medium text-gray-900">
                    {prod?.nombre_producto || "Sin nombre"}
                  </span>
                  <span className="text-gray-600">
                    {" "}— C: {p.cantidad} | D: {p.descuento}%
                  </span>
                </li>
              );
            })}
          </ul>
          {promo.products.length > 2 && (
            <button
              onClick={() =>
                setProductsModal({
                  open: true,
                  products: promo.products,
                  promoName: promo.nombre,
                })
              }
              className="text-white bg-azul-medio hover:bg-azul-hover px-2 py-1 rounded text-sm mt-1"
            >
              Ver más ({promo.products.length - 2})
            </button>
          )}
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      ),
    Acciones: (
     <div className="flex gap-2">
  <button
    className="bg-azul-medio hover:bg-azul-hover text-white px-2 py-1 rounded font-bold flex items-center gap-2"
    onClick={() => {
      setEditing(promo);
      setModalOpen(true);
    }}
  >
    <RiEdit2Fill />
    Editar
  </button>
  <button
    className="bg-rojo-claro hover:bg-rojo-oscuro text-white px-2 py-1 rounded font-bold flex items-center gap-2"
    onClick={() => setConfirmDelete({ open: true, id: promo.id! })}
  >
    <FaTrash />
    Eliminar
  </button>
</div>

    ),
  }));

  

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
      <Container
        page={
          <div className="w-full px-2 md:px-10 mx-auto flex flex-col">
            <h1 className="text-3xl font-bold mb-6 mt-6">Promociones
              <InfoIcon
                title="Gestión de Promociones"
                description="En esta sección puedes crear, editar y eliminar promociones para tus productos. Las promociones pueden ser de tipo porcentaje, fijo o combo. Asegúrate de asignar productos a cada promoción para que sean efectivas."
              />
            </h1>

            {/* Botón crear promoción */}
            <button
              className="bg-azul-medio hover:bg-azul-hover text-white px-4 py-2 rounded mb-4 w-max font-bold"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Nueva Promoción
            </button>

            {/* Modal de formulario */}
            {modalOpen && (
            <PromotionForm
                editing={editing}
                onSaved={() => {
                setModalOpen(false);
                fetchPromotions();
                }}
                onClose={() => setModalOpen(false)}
                productos={productos}
                businesses={businesses}  // <-- PASAR AQUÍ
                branches={branches}      // <-- PASAR AQUÍ
            />
            )}


           

            {/* Tabla principal  */}
            {promotions.length > 0 || loading ? (
              <TableInformation
                headers={tableHeaders}
                tableContent={tableContent}
                loading={loading}
                skeletonRows={8}
              />
            ) : (
              <p>No hay promociones registradas.</p>
            )}

            {/* Modal de confirmación de eliminación */}
            {confirmDelete.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center">
                  <h2 className="text-lg font-semibold mb-4">¿Eliminar promoción?</h2>
                  <p className="text-gray-600 mb-6">
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setConfirmDelete({ open: false, id: null })}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      
                      className="bg-rojo-claro hover:bg-rojo-oscuro text-white px-4 py-2 rounded font-bold" 
                    >
                      
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}

       {/* Modal de productos (Ver más) */}
{productsModal.open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Fondo */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>

    {/* Contenido */}
    <div
      className="relative bg-white rounded-lg shadow-lg pointer-events-auto overflow-y-auto animate-modalShow transition-all duration-300 p-8"
      style={{ width: "40rem", maxHeight: "90vh" }}
    >
      <h3 className="text-xl font-semibold mb-4">
        {productsModal.promoName} — Productos
      </h3>

      <table className="w-full table-auto border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Nombre</th>
            <th className="border px-2 py-1">Cantidad</th>
            <th className="border px-2 py-1">Descuento (%)</th>
          </tr>
        </thead>

        <tbody>
          {productsModal.products.map((p, i) => {
            const prod = productos.find((pr) => pr.id === p.product_id);
            return (
              <tr key={i} className="even:bg-gray-50">
                <td className="border px-2 py-1">{p.product_id}</td>
                <td className="border px-2 py-1">
                  {prod?.nombre_producto || "Sin nombre"}
                </td>
                <td className="border px-2 py-1">{p.cantidad}</td>
                <td className="border px-2 py-1">{p.descuento}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-end mt-6">
        <button
          onClick={() =>
            setProductsModal({ open: false, products: [], promoName: "" })
          }
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
        >
          Cerrar
        </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      />
    </ProtectedRoute>
  );
}
