import React from "react";
import { FaSearch } from "react-icons/fa";
import Select from "react-select"; 
const API_URL = import.meta.env.VITE_API_URL;

type Producto = {
  id?: number;
  codigo_producto: string;
  nombre_producto: string;
  categoria: string;
  descripcion?: string;
  stock: number;
  precio_compra: number;
  precio_venta: number;
  bodega_id: any;
  codigo_cabys?: string;
  impuesto?: number;
  unit_id?: string;
};

type Lote = {
  lote_id: number;
  codigo_producto: string;
  numero_lote: string;
  cantidad: number;
  proveedor: string;
  fecha_entrada: string;
  fecha_vencimiento?: string;
  fecha_salida_lote?: string;
  descripcion: string;
  nombre_producto: string;
};

type Category = { nombre: string; descripcion?: string };
type Unit = { id: number; unidMedida: string; descripcion?: string };
type CabysItem = { code: string; description: string; tax_rate: number };

interface Props {
  open: boolean;
  onClose: () => void;

  formProducto: Producto;
  // aceptar setState funcional para formProducto
  setFormProducto: React.Dispatch<React.SetStateAction<Producto>>;

  editProductMode: boolean;
  setEditProductMode: React.Dispatch<React.SetStateAction<boolean>>;

  loadingForm: boolean;
  setLoadingForm: React.Dispatch<React.SetStateAction<boolean>>;

  productos: Producto[];
  // aceptar setState funcional para productos
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;

  // aceptar setState funcional para lotes
  setLotes: React.Dispatch<React.SetStateAction<Lote[]>>;

  categories: Category[];
  units: Unit[];

  cabysItems: CabysItem[];
  cabysLoading: boolean;
  onOpenCabys: () => void;

  suggestedPrice: number;
  // useSuggestedPrice: boolean;
  // setUseSuggestedPrice: React.Dispatch<React.SetStateAction<boolean>>;

  // nuevo: lista de bodegas/warehouses para el dropdown
  warehouses: { bodega_id?: number | string; codigo?: string; nombre?: string; }[];

  setAlert: (alert: { type: "success" | "error"; message: string } | null) => void;
}

export default function ProductsModal({
  open,
  onClose,
  formProducto,
  setFormProducto,
  editProductMode,
  setEditProductMode,
  loadingForm,
  setLoadingForm,
  productos,
  setProductos,
  setLotes,
  categories,
  units,
  cabysItems,
  cabysLoading,
  onOpenCabys,
  suggestedPrice,
  // useSuggestedPrice,
  // setUseSuggestedPrice,
  warehouses, // <--- nuevo prop
  setAlert,
}: Props) {
  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);

    try {
      if (editProductMode) {
        const res = await fetch(`${API_URL}/api/v1/products/${formProducto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre_producto: formProducto.nombre_producto,
            categoria: formProducto.categoria,
            descripcion: formProducto.descripcion,
            precio_compra: Number(formProducto.precio_compra),
            precio_venta: Number(formProducto.precio_venta),
            bodega_id: Number(formProducto.bodega_id),
            codigo_cabys: formProducto.codigo_cabys,
            impuesto: Number(formProducto.impuesto),
            unit_id: formProducto.unit_id,
          }),
        });
        
        if (res.ok) {
          const actualizado = await res.json();
          setProductos((prev) => {
            return prev.map((p) => 
              p.codigo_producto === formProducto.codigo_producto ? { ...p, ...actualizado } : p
            );
          });

            // Actualizar nombre en lotes si existe
           setLotes((prev) => {
             return prev.map((l) => {
               if (l.codigo_producto === formProducto.codigo_producto) {
                 return { ...l, nombre_producto: formProducto.nombre_producto };
               }
               return l;
             });
           });

            setAlert({
              type: "success",
              message: `Producto "${formProducto.nombre_producto}" actualizado correctamente`
            });
        } else {
          setAlert({
            type: "error", 
            message: "Error al actualizar el producto"
          });
        }
      } else {
        const res = await fetch(`${API_URL}/api/v1/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo_producto: formProducto.codigo_producto,
            nombre_producto: formProducto.nombre_producto,
            categoria: formProducto.categoria,
            descripcion: formProducto.descripcion,
            stock: 0,
            precio_compra: Number(formProducto.precio_compra),
            precio_venta: Number(formProducto.precio_venta),
            bodega_id: Number(formProducto.bodega_id),
            codigo_cabys: formProducto.codigo_cabys,
            impuesto: Number(formProducto.impuesto),
            unit_id: formProducto.unit_id,
          }),
        });

        if (res.ok) {
          const nuevoProducto = await res.json();
          setProductos(prev => [...prev, nuevoProducto]);
          setAlert({
            type: "success",
            message: `Producto "${formProducto.nombre_producto}" agregado correctamente`
          });
        } else {
          setAlert({
            type: "error",
            message: "Error al crear el producto"
          });
        }
      }
    } catch (err) {
      console.error("Error guardando producto", err);
      setAlert({
        type: "error",
        message: "Error al procesar la operación"
      });
    } finally {
      setLoadingForm(false);
      setEditProductMode(false);
      onClose();
    }
  };

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Fondo semitransparente */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

    {/* Modal */}
    <div className="relative bg-white rounded-2xl max-w-2xl w-full sm:w-auto z-10 p-4 sm:p-8 max-h-[90vh] overflow-y-auto text-sm">

      {/* Botón cerrar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 rounded-full p-1 bg-[var(--color-rojo-ultra-claro)] hover:bg-[var(--color-rojo-claro)] transition cursor-pointer z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-rojo-oscuro)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Título */}
      <h2 className="text-2xl font-bold text-center mb-6">
        {editProductMode ? "Editar Producto" : "Agregar Producto"}
      </h2>

      <hr className="text-gray-600 pt-2 pb-2"/>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">

        {/* Columna izquierda */}
        <div className="flex flex-col gap-4">
          {/* Código */}
          <label className="font-semibold w-full">
            Código
            <input
              name="codigo_producto"
              value={formProducto.codigo_producto}
              onChange={(e) => setFormProducto(f => ({ ...f, codigo_producto: e.target.value }))}
              onBlur={() => {
                const codigoExistente = productos.some(
                  p => p.codigo_producto === formProducto.codigo_producto &&
                       (!editProductMode || p.id !== formProducto.id)
                );
                if (codigoExistente) { onClose(); setEditProductMode(false); }
              }}
              placeholder="Código"
              className="w-full border rounded-lg px-4 py-2"
              required
              disabled={editProductMode}
              readOnly={editProductMode}
            />
          </label>

          {/* Nombre */}
          <label className="font-semibold w-full">
            Nombre del producto
            <input
              name="nombre_producto"
              value={formProducto.nombre_producto}
              onChange={(e) => setFormProducto(f => ({ ...f, nombre_producto: e.target.value.replace(/[0-9]/g, "") }))}
              placeholder="Nombre del producto"
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </label>

          {/* Categoría */}
          <label className="font-semibold w-full">
            Categoría
            <Select
              name="categoria"
              value={categories.map(cat => ({ value: cat.nombre, label: cat.nombre }))
                              .find(opt => opt.value === formProducto.categoria) || null}
              onChange={(selected) => setFormProducto(f => ({ ...f, categoria: selected?.value || "" }))}
              options={categories.map(cat => ({ value: cat.nombre, label: cat.nombre }))}
              placeholder="Seleccione una categoría"
              isSearchable
              isClearable
              menuPosition="fixed"
              menuPortalTarget={document.body}
              styles={{
                menuPortal: base => ({ ...base, zIndex: 9999 }),
                menuList: base => ({ ...base, maxHeight: 200, overflowY: "auto" }),
              }}
            />
          </label>

          {/* Código CABYS */}
          <label className="font-semibold w-full">
            Código CABYS
            <div className="relative flex items-center">
              <input
                name="codigo_cabys"
                value={formProducto.codigo_cabys || ""}
                onChange={e => setFormProducto(f => ({ ...f, codigo_cabys: e.target.value }))}
                placeholder="Código CABYS"
                className="w-full border rounded-lg px-3 py-2 pr-10"
                required
              />
              <button
                type="button"
                onClick={onOpenCabys}
                className="absolute right-2 text-azul-medio hover:text-azul-hover transition disabled:opacity-50"
                title={cabysLoading ? "Cargando catálogo..." : "Buscar en catálogo CABYS"}
                disabled={cabysLoading && cabysItems.length === 0}
              >
                {cabysLoading && cabysItems.length === 0 ? (
                  <svg className="animate-spin h-5 w-5 text-azul-medio" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : <FaSearch />}
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-1">Usa la lupa para abrir el catálogo.</p>
          </label>

          {/* Descripción */}
          <label className="font-semibold w-full">
            Descripción
            <textarea
              name="descripcion"
              value={formProducto.descripcion}
              onChange={e => setFormProducto(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Descripción"
              className="w-full border rounded-lg px-4 py-2 min-h-[60px]"
            />
          </label>
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4">
          {/* Precio compra */}
          <label className="font-semibold w-full">
            Precio de compra
            <input
              name="precio_compra"
              type="number"
              value={formProducto.precio_compra as any}
              onChange={e => setFormProducto(f => ({ ...f, precio_compra: Number(e.target.value) }))}
              placeholder="Precio compra"
              className="w-full border rounded-lg px-4 py-2"
              min={0}
              required
            />
          </label>

          {/* Precio venta */}
          <label className="font-semibold w-full">
            Precio de venta
            <input
              name="precio_venta"
              type="number"
              value={formProducto.precio_venta as any}
              onChange={e => setFormProducto(f => ({ ...f, precio_venta: Number(e.target.value) }))}
              placeholder="Ingrese el precio de venta"
              className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-azul-medio transition mt-1"
              min={0}
              required
            />
            {formProducto.precio_compra > 0 && (
              <button
                type="button"
                className="bg-verde-claro hover:bg-verde-oscuro text-white px-4 py-2 rounded-lg text-sm mt-2 shadow-md transition w-full cursor-pointer"
                onClick={() => setFormProducto(f => ({ ...f, precio_venta: suggestedPrice }))}
              >
                Precio sugerido: <span className="font-bold">{suggestedPrice}</span>
              </button>
            )}
            <p className="text-gray-500 text-sm mt-1">Puedes aceptar el precio sugerido o ingresar uno propio.</p>
          </label>

          {/* Impuesto */}
          <label className="font-semibold w-full">
            Impuesto (%)
            <input
              name="impuesto"
              type="number"
              value={formProducto.impuesto ?? 0}
              onChange={e => setFormProducto(f => ({ ...f, impuesto: Number(e.target.value) }))}
              placeholder="13"
              min={0}
              className="w-full border rounded-lg px-3 py-2"
            />
          </label>

          {/* Unidad */}
          <label className="font-semibold w-full">
            Unidad de medida
            <select
              name="unit_id"
              value={formProducto.unit_id || ""}
              onChange={e => setFormProducto(f => ({ ...f, unit_id: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Seleccione una unidad</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.unidMedida} {u.descripcion && `(${u.descripcion})`}</option>)}
            </select>
          </label>

          {/* Bodega */}
          <label className="font-semibold w-full">
            Bodega
            <select
              name="bodega_id"
              value={String(formProducto.bodega_id ?? "")}
              onChange={e => setFormProducto(f => ({ ...f, bodega_id: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Seleccione una bodega</option>
              {warehouses.map(w => {
                const key = String(w.bodega_id ?? w.codigo ?? w.nombre ?? "");
                const label = w.codigo ?? w.nombre ?? `Bodega ${w.bodega_id ?? ""}`;
                return <option key={key} value={w.bodega_id ?? w.codigo ?? key}>{label}</option>;
              })}
            </select>
          </label>
        </div>
      </form>

      {/* Botones guardar/cancelar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
        <button
          className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-3 rounded-lg shadow-md transition w-full sm:w-auto"
          onClick={handleSubmit}
          disabled={loadingForm || !formProducto.codigo_producto || !formProducto.nombre_producto || !formProducto.categoria || !formProducto.codigo_cabys || (!formProducto.precio_compra && !formProducto.precio_venta) || !formProducto.bodega_id || formProducto.impuesto === undefined || formProducto.unit_id === ""}
        >
          {loadingForm ? "Guardando..." : editProductMode ? "Guardar cambios" : "Guardar"}
        </button>

        <button
          className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-3 rounded-lg shadow-md transition w-full sm:w-auto"
          onClick={() => { setEditProductMode(false); onClose(); }}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
);

}