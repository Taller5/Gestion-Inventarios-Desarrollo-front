import React, { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { SearchBar } from "../ui/SearchBar";


//type bodega
type Warehouse = {
  bodega_id: number;
  codigo: string;
};
 
//type producto
type Producto = {
  id?: number;
  codigo: string;
  nombre: string;
  stock: number;
  precio: number;
  bodega: string;
};

//type lote
type Lote = {
  lote_id: number;
  codigo: string;
  numero_lote: string;
  cantidad: number;
  proveedor: string;
  fecha_entrada: string;
  fecha_salida: string; // fecha de vencimiento
  fecha_salida_lote?: string; // fecha de salida del lote
  descripcion: string;
  nombre: string;
};

const headers = ["Código", "Nombre", "Stock", "Precio", "Bodega", "Acciones"];

export default function Inventary() {

   const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Cargar bodegas al inicio
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/warehouses")
      .then(res => res.json())
      .then(data => setWarehouses(data));
  }, []);
  // Estado para el formulario del modal de producto
  const [formProducto, setFormProducto] = useState<Producto>({
    codigo: "",
    nombre: "",
    stock: 0,
    precio: 0,
    bodega: ""
  });
  // Estado para el formulario del modal de lote
  const [formLote, setFormLote] = useState<Omit<Lote, 'lote_id'> & { lote_id?: number }>({
    codigo: "",
    numero_lote: "",
    cantidad: 0,
    proveedor: "",
    fecha_entrada: "",
    fecha_salida: "",
    fecha_salida_lote: "",
    descripcion: "",
    nombre: "",
    lote_id: undefined
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  const [lotes, setLotes] = useState<Lote[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null); // agrupado por codigo
  // modalOpen: false | 'add-product' | 'add-lote' | Lote
  const [modalOpen, setModalOpen] = useState<false | 'add-product' | 'add-lote' | Lote>(false);
  const [editMode, setEditMode] = useState(false);
  // Estado para el producto a eliminar y mostrar modal de confirmación
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:8000/api/v1/products").then(res => res.json()),
      fetch("http://localhost:8000/api/v1/batch").then(res => res.json())
    ])
      .then(([productosData, lotesData]) => {
        setProductos(productosData);
        setLotes(lotesData);
      })
      .catch(() => {
        // Datos quemados si la API falla
        setProductos([]);
        setLotes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Une productos y lotes para mostrar todos los productos aunque no tengan lotes
  const agruparProductos = (productosArr: Producto[], lotesArr: Lote[]) => {
    const lotesPorCodigo = lotesArr.reduce((acc, lote) => {
      if (!acc[lote.codigo]) acc[lote.codigo] = [];
      acc[lote.codigo].push(lote);
      return acc;
    }, {} as Record<string, Lote[]>);

    return productosArr.map(producto => {
      const lotes = lotesPorCodigo[producto.codigo] || [];
      const stock = lotes.reduce((sum, l) => sum + Number(l.cantidad), 0);
      return {
        ...producto,
        stock,
        lotes
      };
    });
  };

  // Inicializa productosFiltrados con todos los productos agrupados
  useEffect(() => {
    setProductosFiltrados(agruparProductos(productos, lotes));
  }, [productos, lotes]);

  // Filtro de búsqueda para productos
  // Búsqueda parcial por código o nombre
  const handleSearch = (item: Producto) => {
    if (!item) return;
    const query = item.codigo || item.nombre;
    if (!query) return;
    const lowerQuery = query.toLowerCase();
    const filtrados = productos.filter(p =>
      p.codigo.toLowerCase().includes(lowerQuery) ||
      p.nombre.toLowerCase().includes(lowerQuery)
    );
    setProductosFiltrados(agruparProductos(filtrados, lotes));
  };
  const handleRefresh = () => setProductosFiltrados(agruparProductos(productos, lotes));

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "cajero", "bodeguero"]}>
      <Container page={
        <div>
          <div className="flex">
            <SideBar role={userRole} />
            <div className="w-full pl-10 pt-10">
              <h1 className="text-2xl font-bold mb-6 text-left">Inventario</h1>
              {/* Barra de búsqueda y botones principales */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-6">
                <div className="w-full h-10">
                  {/* Barra de búsqueda
                   <SearchBar<Producto>
                    url="http://localhost:8000/api/v1/products"
                    displayField="codigo"
                    placeholder="Buscar por código o nombre..."
                    filterFn={(item, query) =>
                      item.codigo.toLowerCase().includes(query.toLowerCase()) ||
                      item.nombre.toLowerCase().includes(query.toLowerCase())
                    }
                    onSelect={handleSearch}
                  /> */}
                 
                </div>
                <div className="flex gap-2">
                  <Button
                    text="Refrescar"
                    style="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-10 rounded cursor-pointer"
                    onClick={handleRefresh}
                  />
                  <Button
                    text="Agregar Producto"
                    style="bg-azul-fuerte hover:bg-azul-claro text-white font-bold py-2 px-10 cursor-pointer mr-20  rounded"
                    onClick={() => {
                      setEditMode(false);
                      setFormProducto({ codigo: "", nombre: "", stock: 0, precio: 0, bodega: "" });
                      setModalOpen('add-product');
                    }}
                  />
                </div>
              </div>
              {/* Tabla de productos agrupados */}
              <div className="bg-gray-50 rounded-xl p-4 max-h-[63vh] overflow-y-auto mb-10 mr-10">
  <table className="min-w-full divide-y divide-gray-200 ">
                  <thead className="bg-gray-100">
                    <tr>
                      {headers.map((header, idx) => (
                        <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={headers.length} className="text-center py-4">Cargando...</td></tr>
                    ) : productosFiltrados.length === 0 ? (
                      <tr><td colSpan={headers.length} className="text-center py-4">Sin resultados</td></tr>
                    ) : (
                      // Renderiza una fila por producto agrupado
                      productosFiltrados.map((producto: any) => (
                        <React.Fragment key={producto.codigo}>
                          <tr className="hover:bg-gray-100 cursor-pointer" onClick={() => setExpanded(expanded === producto.codigo ? null : producto.codigo)}>
                            <td className="px-6 py-4 text-left text-xs font-medium text-gray-500">{producto.codigo}</td>
                            <td className="px-6 py-4 text-left text-xs font-medium text-gray-500">{producto.nombre}</td>
                            <td className="px-6 py-4 text-left text-xs font-medium text-gray-500">{producto.stock}</td>
                            <td className="px-6 py-4 text-left text-xs font-medium text-gray-500">${producto.precio}</td>
                            <td className="px-6 py-4 text-left text-xs font-medium text-gray-500">{producto.bodega?.codigo || producto.bodega || ''}</td>
                            <td className=" flex flex-row py-4 text-left text-xs font-medium text-gray-500">
                              <Button text="Agregar lote" style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2 cursor-pointer" onClick={() => {
                                setEditMode(true);
                                setFormLote({
                                  codigo: producto.codigo,
                                  nombre: producto.nombre,
                                  numero_lote: "",
                                  cantidad: 0,
                                  proveedor: "",
                                  fecha_entrada: "",
                                  fecha_salida: "",
                                  fecha_salida_lote: "",
                                  descripcion: "",
                                  lote_id: undefined
                                });
                                setModalOpen('add-lote');
                              }} />
                              <Button text="Eliminar" style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded cursor-pointer" onClick={() => setProductoAEliminar(producto)} />
              {/* Modal de confirmación para eliminar producto */}
              {productoAEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-xs"></div>
                  <div className="z-10 relative bg-white rounded-xl w-full max-w-md p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Eliminar producto</h2>
                    <p className="mb-6 text-center">¿Seguro que deseas eliminar el producto <b>{productoAEliminar.nombre}</b>?</p>
                    <div className="flex gap-4 justify-center">
                     <Button
                        text="Eliminar"
                        style="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        onClick={async () => {
                          const res = await fetch(`http://localhost:8000/api/v1/products/${productoAEliminar.id}`, {
                            method: "DELETE"
                          });
                          if (res.ok) {
                            setProductos(prev => prev.filter(p => p.codigo !== productoAEliminar.codigo));
                          }
                          setProductoAEliminar(null);
                        }}
                      />
                      <Button
                        text="Cancelar"
                        style="bg-gray-400 hover:bg-gray-500 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        onClick={() => setProductoAEliminar(null)}
                      />
                    </div>
                  </div>
                </div>
              )}
                            </td>
                          </tr>
                          {/* Fila colapsable con los lotes de ese producto */}
                          {expanded === producto.codigo && (
                            <tr className="bg-blue-50">
                              <td colSpan={headers.length} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex flex-col gap-2">
                                  {/* Renderiza cada lote de ese producto con info resumida y botón de detalles */}
                                  {producto.lotes.map((lote: Lote) => (
                                    <div key={lote.lote_id} className="mb p-2 border-b border-blue-200 flex flex-row items-center gap-5">
                                      <span><b>Número de lote:</b> {lote.numero_lote}</span>
                                      <span><b>Fecha de vencimiento:</b> {lote.fecha_salida}</span>
                                      <span><b>Cantidad actual:</b> {lote.cantidad}</span>
                                      {/* Botón para ver detalles completos del lote en el modal */}
                                      <div className="ml-auto">
                                        <Button text="Detalles" style=" cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded " onClick={() => { setEditMode(false); setFormLote(lote); setModalOpen(lote); }} />
                                        </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Modal para agregar producto */}
              {modalOpen === 'add-product' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setLoadingForm(true);
                      const res = await fetch("http://localhost:8000/api/v1/products", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          codigo: formProducto.codigo,
                          nombre: formProducto.nombre,
                          stock: 0,
                          precio: Number(formProducto.precio),
                          bodega_id: Number(formProducto.bodega)
                        })
                      });
                      if (res.ok) {
                        const nuevoProducto = await res.json();
                        setProductos(prev => [...prev, nuevoProducto]);
                      }
                      setLoadingForm(false);
                      setModalOpen(false);
                    }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Agregar Producto</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-4">
                        <label className="font-semibold">Código
                          <input name="codigo" value={formProducto.codigo} onChange={e => setFormProducto(f => ({ ...f, codigo: e.target.value }))} placeholder="Código" className="w-full border rounded-lg px-3 py-2" required />
                        </label>
                        <label className="font-semibold">Nombre
                          <input name="nombre" value={formProducto.nombre} onChange={e => setFormProducto(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre" className="w-full border rounded-lg px-3 py-2" required />
                        </label>
                        <label className="font-semibold">Stock
                          <input
                            name="stock"
                            type="number"
                            value={(() => {
                              // Siempre 0 al crear
                              return 0;
                            })()}
                            readOnly
                            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                          />
                        </label>
                      </div>
                      <div className="flex flex-col gap-4">
                        <label className="font-semibold">Precio
                          <input name="precio" type="number" value={formProducto.precio} onChange={e => setFormProducto(f => ({ ...f, precio: Number(e.target.value) }))} placeholder="Precio" className="w-full border rounded-lg px-3 py-2" required />
                        </label>
                        <label className="font-semibold">Bodega
                          <select
                            name="bodega"
                            value={formProducto.bodega}
                            onChange={e => setFormProducto(f => ({ ...f, bodega: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2"
                            required
                          >
                            <option value="">Seleccione una bodega</option>
                            {warehouses.map(w => (
                              <option key={w.bodega_id} value={w.bodega_id}>
                                {w.codigo}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end mt-6">
                      <Button
                        text={loadingForm ? "Guardando..." : "Guardar"}
                        style="bg-blue-500 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        type="submit"
                        disabled={loadingForm || !formProducto.codigo || !formProducto.nombre || !formProducto.precio || !formProducto.bodega}
                      />
                     <Button
                        text="Cerrar"
                        style="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        type="button"
                        onClick={() => setModalOpen(false)}
                      />
                    </div>
                  </form>
                </div>
              )}

              {/* Modal para agregar lote */}
              {modalOpen === 'add-lote' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setLoadingForm(true);
                      const res = await fetch("http://localhost:8000/api/v1/batch", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          codigo: formLote.codigo,
                          numero_lote: formLote.numero_lote,
                          cantidad: Number(formLote.cantidad),
                          proveedor: formLote.proveedor,
                          fecha_entrada: formLote.fecha_entrada,
                          fecha_salida: formLote.fecha_salida,
                          fecha_salida_lote: formLote.fecha_salida_lote,
                          descripcion: formLote.descripcion,
                          nombre: formLote.nombre
                        })
                      });
                      if (res.ok) {
                        const nuevoLote = await res.json();
                        setLotes(prev => [...prev, nuevoLote]);
                      }
                      setLoadingForm(false);
                      setModalOpen(false);
                      setEditMode(false);
                    }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Agregar Lote</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-4">
                        <label className="font-semibold">Número de lote
                          <input name="numero_lote" value={formLote.numero_lote} onChange={e => setFormLote(f => ({ ...f, numero_lote: e.target.value }))} placeholder="Número de lote" className="w-full border rounded-lg px-3 py-2" required />
                        </label>
                        <label className="font-semibold">Código de lote
                          <input name="codigo" value={formLote.codigo} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                        </label>
                        <label className="font-semibold">Nombre
                          <input name="nombre" value={formLote.nombre} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                        </label>
                        <label className="font-semibold">Cantidad
                          <input name="cantidad" type="number" value={formLote.cantidad} onChange={e => setFormLote(f => ({ ...f, cantidad: Number(e.target.value) }))} placeholder="Cantidad" className="w-full border rounded-lg px-3 py-2" required />
                        </label>
                        <label className="font-semibold">Fecha de entrada
                          <input name="fecha_entrada" type="date" value={formLote.fecha_entrada} onChange={e => setFormLote(f => ({ ...f, fecha_entrada: e.target.value }))} placeholder="Fecha de entrada" className="w-full border rounded-lg px-3 py-2" required />
                        </label>
                        <label className="font-semibold">Fecha de salida
                          <input name="fecha_salida_lote" type="date" value={formLote.fecha_salida_lote || ''} onChange={e => setFormLote(f => ({ ...f, fecha_salida_lote: e.target.value }))} placeholder="Fecha de salida" className="w-full border rounded-lg px-3 py-2" />
                        </label>
                      </div>
                      <div className="flex flex-col gap-4">
                        
                        <label className="font-semibold">Proveedor
                          <input name="proveedor" value={formLote.proveedor} onChange={e => setFormLote(f => ({ ...f, proveedor: e.target.value }))} placeholder="Proveedor" className="w-full border rounded-lg px-3 py-2" required />
                        </label>
                        <label className="font-semibold">Fecha de vencimiento
                          <input name="fecha_salida" type="date" value={formLote.fecha_salida} onChange={e => setFormLote(f => ({ ...f, fecha_salida: e.target.value }))} placeholder="Fecha de vencimiento" className="w-full border rounded-lg px-3 py-2" required />
                        </label>
                        <label className="font-semibold">Descripción
                          <textarea name="descripcion" value={formLote.descripcion} onChange={e => setFormLote(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción" className="w-full border rounded-lg px-3 py-2 min-h-[40px]" />
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end mt-6">
                      <Button
                        text={loadingForm ? "Guardando..." : "Guardar"}
                        style="bg-blue-500 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        type="submit"
                        disabled={loadingForm || !formLote.codigo || !formLote.nombre || !formLote.numero_lote || !formLote.cantidad || !formLote.proveedor || !formLote.fecha_entrada || !formLote.fecha_salida}
                      />
                    <Button
                      text="Cerrar"
                      style="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      type="button"
                      onClick={() => { setModalOpen(false); setEditMode(false); }}
                    />
                    </div>
                  </form>
                </div>
              )}

              {/* Modal para ver detalles o editar un lote */}
              {modalOpen && typeof modalOpen === 'object' && modalOpen !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setLoadingForm(true);
                      const lote = formLote;
                      const res = await fetch(`http://localhost:8000/api/v1/batch/${lote.lote_id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          codigo: formLote.codigo,
                          numero_lote: formLote.numero_lote,
                          cantidad: Number(formLote.cantidad),
                          proveedor: formLote.proveedor,
                          fecha_entrada: formLote.fecha_entrada,
                          fecha_salida: formLote.fecha_salida,
                          fecha_salida_lote: formLote.fecha_salida_lote,
                          descripcion: formLote.descripcion,
                          nombre: formLote.nombre
                        })
                      });
                      if (res.ok) {
                        const loteActualizado = await res.json();
                        setLotes(prev => prev.map(l => l.lote_id === loteActualizado.lote_id ? loteActualizado : l));
                      }
                      setLoadingForm(false);
                      setModalOpen(false);
                      setEditMode(false);
                    }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                      {editMode ? "Editar Lote" : "Detalles del Lote"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Columna 1 */}
                      <div className="flex flex-col gap-4">
                        <label className="font-semibold">Número de lote
                          <input name="numero_lote" value={formLote.numero_lote} onChange={e => setFormLote(f => ({ ...f, numero_lote: e.target.value }))} placeholder="Número de lote" className="w-full border rounded-lg px-3 py-2" required readOnly={!editMode} />
                        </label>
                        <label className="font-semibold">Código de lote
                          <input name="codigo" value={formLote.codigo} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                        </label>
                        <label className="font-semibold">Nombre
                          <input name="nombre" value={formLote.nombre} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
                        </label>
                        <label className="font-semibold">Cantidad
                          <input name="cantidad" type="number" value={formLote.cantidad} onChange={e => setFormLote(f => ({ ...f, cantidad: Number(e.target.value) }))} placeholder="Cantidad" className="w-full border rounded-lg px-3 py-2" required readOnly={!editMode} />
                        </label>
                        <label className="font-semibold">Fecha de entrada
                          <input name="fecha_entrada" type="date" value={formLote.fecha_entrada} onChange={e => setFormLote(f => ({ ...f, fecha_entrada: e.target.value }))} placeholder="Fecha de entrada" className="w-full border rounded-lg px-3 py-2" required readOnly={!editMode} />
                        </label>
                        <label className="font-semibold">Fecha de salida
                          <input name="fecha_salida_lote" type="date" value={formLote.fecha_salida_lote || ''} onChange={e => setFormLote(f => ({ ...f, fecha_salida_lote: e.target.value }))} placeholder="Fecha de salida" className="w-full border rounded-lg px-3 py-2" readOnly={!editMode} />
                        </label>
                      </div>
                      {/* Columna 2 */}
                      <div className="flex flex-col gap-4">
                        
                        <label className="font-semibold">Proveedor
                          <input name="proveedor" value={formLote.proveedor} onChange={e => setFormLote(f => ({ ...f, proveedor: e.target.value }))} placeholder="Proveedor" className="w-full border rounded-lg px-3 py-2" required readOnly={!editMode} />
                        </label>
                        <label className="font-semibold">Fecha de vencimiento
                          <input name="fecha_salida" type="date" value={formLote.fecha_salida} onChange={e => setFormLote(f => ({ ...f, fecha_salida: e.target.value }))} placeholder="Fecha de vencimiento" className="w-full border rounded-lg px-3 py-2" required readOnly={!editMode} />
                        </label>
                        
                        <label className="font-semibold">Descripción
                          <textarea name="descripcion" value={formLote.descripcion} onChange={e => setFormLote(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción" className="w-full border rounded-lg px-3 py-2 min-h-[40px]" readOnly={!editMode} />
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end mt-6">
                      <Button
                        text={loadingForm ? "Guardando..." : (editMode ? "Guardar cambios" : "OK")}
                        style="bg-blue-500 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        type="submit"
                        disabled={loadingForm || !editMode}
                      />
                      {!editMode && (
                      <Button
                        text="Editar"
                        style="bg-blue-500 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        type="button"
                        onClick={() => setEditMode(true)}
                      />
                      )}
                     
                      <Button
                        text="Cerrar"
                        type="button"
                        style="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        onClick={() => {
                          setModalOpen(false);
                          setEditMode(false);
                        }}
                      />
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      }/>
    </ProtectedRoute>
  );
}


