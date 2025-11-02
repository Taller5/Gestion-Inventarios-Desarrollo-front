import { useEffect, useState } from "react";
import ProductSelector from "./ProductSelector";
import type { Promotion } from "../../pages/PromotionPage";

type Producto = any;
type Branch = {
  sucursal_id: number;
  nombre: string;
  business: { negocio_id: number; nombre_comercial: string };
};
type Business = { negocio_id: number; nombre_comercial: string };
const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  editing: Promotion | null;
  onSaved: () => void;
  onClose: () => void;
  productos: Producto[];
  branches: Branch[];
  businesses: Business[];
}

export default function PromotionFormModal({
  editing,
  onSaved,
  onClose,
  productos: initialProductos,
  branches: initialBranches,
}: Props) {
  const [form, setForm] = useState<Promotion>({
    nombre: "",
    descripcion: "",
    tipo: "porcentaje",
    valor: 0,
    fecha_inicio: "",
    fecha_fin: "",
    activo: true,
    products: [],
    business_id: null,
    branch_id: null,
  });

  const [productos, setProductos] = useState<Producto[]>(initialProductos);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [selectedBodega, setSelectedBodega] = useState<number | null>(null);

  // Formateo de fechas
  const formatDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  // Cargar datos si estamos editando
  useEffect(() => {
    if (editing) {
      setForm({
        ...editing,
        fecha_inicio: formatDateTimeLocal(editing.fecha_inicio),
        fecha_fin: formatDateTimeLocal(editing.fecha_fin),
        valor: editing.valor ?? 0,
        products: editing.products.map((p) => ({
          product_id: p.product_id,
          cantidad: p.cantidad ?? 1,
          descuento: p.descuento ?? 0,
        })),
        business_id: editing.business_id ?? null,
        branch_id: editing.branch_id ?? null,
      });
      if (editing.business_nombre) setSelectedBusiness(editing.business_nombre);
      if (editing.branch_id) setSelectedBodega(editing.branch_id);
    }
  }, [editing]);

  // Cargar productos, bodegas y sucursales al estilo ProductReports
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [productosRes, warehousesRes, branchesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/products`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/v1/warehouses`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/v1/branches`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);

        const mappedProductos: Producto[] = productosRes
          .filter((p: any) => p.stock > 0)
          .map((p: any) => {
            const warehouse = warehousesRes.find(
              (w: any) => w.bodega_id === p.bodega_id
            );
            return {
              ...p,
              business_nombre:
                warehouse?.branch.business.nombre_comercial || "",
              branch_nombre: warehouse?.branch.nombre || "",
              sucursal_id: warehouse?.sucursal_id || null,
              codigo: warehouse?.codigo || "",
            };
          });

        setProductos(mappedProductos);
        setWarehouses(warehousesRes);
        setBranches(branchesRes);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado de productos para ProductSelector
  const filteredProductosForSelector = productos.filter((p) => {
    if (selectedBusiness && p.business_nombre !== selectedBusiness)
      return false;
    if (selectedBodega && p.sucursal_id !== selectedBodega) return false;
    return true;
  });

  // Manejo de cambios en inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => {
      const newForm = {
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      };
      if (name === "business_id") {
        newForm.branch_id = null;
        setSelectedBusiness(value || null);
        setSelectedBodega(null);
      }
      if (name === "branch_id") {
        setSelectedBodega(Number(value) || null);
      }
      return newForm;
    });
  };

  // Submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_URL}/api/v1/promotions/${editing.id}`
      : `${API_URL}/api/v1/promotions`;
    // 🔹 Obtenemos el business_id desde la sucursal seleccionada
    const selectedBranch = branches.find(
      (b) => b.sucursal_id === Number(form.branch_id || selectedBodega)
    );

    // 🔹 Obtenemos el business_id desde la sucursal seleccionada
    const businessIdToSend = selectedBranch?.business.negocio_id ?? null;

    const payload = {
      ...form,
      business_id: businessIdToSend,
      branch_id: Number(form.branch_id) || Number(selectedBodega) || null,
      valor: form.valor ?? 0,
      products: form.products.map((p) => ({
        product_id: p.product_id,
        cantidad: p.cantidad ?? 1,
        descuento: p.descuento ?? 0,
      })),
      fecha_inicio: new Date(form.fecha_inicio).toISOString(),
      fecha_fin: new Date(form.fecha_fin).toISOString(),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      setFeedback({
        message: editing
          ? "Promoción actualizada correctamente"
          : "Promoción creada exitosamente",
        type: "success",
      });
      setForm({
        nombre: "",
        descripcion: "",
        tipo: "porcentaje",
        valor: 0,
        fecha_inicio: "",
        fecha_fin: "",
        activo: true,
        products: [],
        business_id: null,
        branch_id: null,
      });
      setSelectedBusiness(null);
      setSelectedBodega(null);
      onSaved();

      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setFeedback({ message: "Error al guardar la promoción", type: "error" });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 mx-4 md:mx-8 overflow-y-auto max-h-[90vh] border border-gray-200"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">
          {editing ? "Editar Promoción" : "Nueva Promoción"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre, Tipo, Valor, Descripción, Fechas */}
          <div>
            <label className="block font-medium mb-1">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Tipo de promoción</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 text-sm"
            >
              <option value="porcentaje">Porcentaje</option>
              <option value="fijo">Monto fijo</option>
              <option value="combo">Combo</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">
              {form.tipo === "porcentaje" ? "Valor (%)" : "Valor fijo"}
            </label>
            <input
              name="valor"
              type="number"
              value={form.valor ?? 0}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 text-sm"
              required
              min={form.tipo === "porcentaje" ? 0 : undefined}
              max={form.tipo === "porcentaje" ? 100 : undefined}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 text-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Fecha inicio</label>
            <input
              name="fecha_inicio"
              type="datetime-local"
              value={form.fecha_inicio}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Fecha fin</label>
            <input
              name="fecha_fin"
              type="datetime-local"
              value={form.fecha_fin}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 text-sm"
              required
            />
          </div>

          {/* Negocio */}
          <div>
            <label className="block font-medium mb-1">Negocio</label>
            <select
              name="business_id"
              value={form.business_id || ""}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 text-sm"
              required
              disabled={!!editing} // bloqueado si estamos editando
            >
              <option value="">-- Seleccione negocio --</option>
              {Array.from(
                new Set(productos.map((p) => p.business_nombre).filter(Boolean))
              ).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Sucursal */}
          <div>
            <label className="block font-medium mb-1">Sucursal</label>
            <select
              name="branch_id"
              value={form.branch_id || ""}
              onChange={handleChange}
              className="border rounded-lg w-full p-2 text-sm"
              required
              disabled={!!editing} // bloqueado si estamos editando
            >
              <option value="">-- Seleccione sucursal --</option>
              {branches
                .filter((b) =>
                  editing
                    ? b.business.nombre_comercial === form.business_id // filtramos según el negocio cargado
                    : selectedBusiness
                      ? b.business.nombre_comercial === selectedBusiness
                      : true
                )
                .map((b) => (
                  <option key={b.sucursal_id} value={b.sucursal_id}>
                    {b.nombre} ({b.business.nombre_comercial})
                  </option>
                ))}
            </select>
          </div>

          {/* Mostrar negocio y sucursal asignados en edición */}
          {editing && (
            <>
              <div>
                <label className="block font-medium mb-1">
                  Negocio asignado
                </label>
                <input
                  type="text"
                  value={
                    branches.find((b) => b.sucursal_id === form.branch_id)
                      ?.business.nombre_comercial || "-"
                  }
                  disabled
                  className="border rounded-lg w-full p-2 text-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Sucursal asignada
                </label>
                <input
                  type="text"
                  value={
                    branches.find((b) => b.sucursal_id === form.branch_id)
                      ?.nombre || "-"
                  }
                  disabled
                  className="border rounded-lg w-full p-2 text-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
            </>
          )}

          {/* Productos */}
          <div className="col-span-full">
            <label className="block font-medium mb-1">
              Productos incluidos
            </label>
            <ProductSelector
              productos={filteredProductosForSelector}
              selected={form.products}
              onChange={(newProducts) =>
                setForm((prev) => ({
                  ...prev,
                  products: newProducts.map((p: any) => ({
                    product_id: p.product_id ?? p.id,
                    nombre_producto: p.nombre ?? p.nombre_producto ?? "",
                    cantidad: p.cantidad ?? 1,
                    descuento: p.descuento ?? 0,
                  })),
                }))
              }
            />
          </div>

          {/* Activa */}
          <div className="col-span-full">
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="activo"
                checked={form.activo}
                onChange={handleChange}
              />
              Activa
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-verde-claro hover:bg-verde-oscuro text-white px-4 py-2 rounded-lg"
          >
            {loading ? "Guardando..." : editing ? "Actualizar" : "Crear"}
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
            <div
              className={`bg-white rounded-xl shadow p-4 w-80 text-center border ${feedback.type === "success" ? "border-green-500" : "border-red-500"}`}
            >
              <p
                className={`font-semibold ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}
              >
                {feedback.message}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
