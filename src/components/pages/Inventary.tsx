import React, { useEffect, useState } from "react";

import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { SearchBar } from "../ui/SearchBar";
import SimpleModal from "../ui/SimpleModal";

import { FaTrash } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { CgDetailsMore } from "react-icons/cg";
import { RiEdit2Fill } from "react-icons/ri";

const API_URL = import.meta.env.VITE_API_URL;

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

// type provider
type Provider = {
  id: number;
  name: string;
  products: { id: number; nombre: string }[];
};

const headers = ["Código", "Nombre", "Stock", "Precio", "Bodega", "Acciones"];

export default function Inventary() {
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Cargar bodegas al inicio
  useEffect(() => {
    fetch(`${API_URL}/api/v1/warehouses`)
      .then((res) => res.json())
      .then((data) => setWarehouses(data));
  }, []);
  // Estado para el formulario del modal de producto
  const [formProducto, setFormProducto] = useState<Producto>({
    codigo: "",
    nombre: "",
    stock: 0,
    precio: 0,
    bodega: "",
  });
  // Estado para el formulario del modal de lote
  const [formLote, setFormLote] = useState<
    Omit<Lote, "lote_id"> & { lote_id?: number }
  >({
    codigo: "",
    numero_lote: "",
    cantidad: 0,
    proveedor: "",
    fecha_entrada: "",
    fecha_salida: "",
    fecha_salida_lote: "",
    descripcion: "",
    nombre: "",
    lote_id: undefined,
  });

  const [loadingForm, setLoadingForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  const [lotes, setLotes] = useState<Lote[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productsFiltered, setProductsFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null); // agrupado por codigo
  // modalOpen: false | 'add-product' | 'add-lote' | Lote
  const [modalOpen, setModalOpen] = useState<
    false | "add-product" | "add-lote" | Lote
  >(false);
  const [editMode, setEditMode] = useState(false);
  const [editProductMode, setEditProductMode] = useState(false);
  // Estado para el producto a eliminar y mostrar modal de confirmación
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(
    null
  );
  const [loteAEliminar, setLoteAEliminar] = useState<Lote | null>(null);

  // Estado para proveedores
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  // Cargar proveedores al inicio
  useEffect(() => {
    fetch(`${API_URL}/api/v1/providers`)
      .then((res) => res.json())
      .then((data) => setProviders(data));
  }, []);

  // Filtrar proveedores por producto seleccionado en el lote
  useEffect(() => {
    if (!formLote.codigo) {
      setFilteredProviders([]);
      return;
    }
    // Buscar el producto por código
    const producto = productos.find((p) => p.codigo === formLote.codigo);
    if (!producto) {
      setFilteredProviders([]);
      return;
    }
    // Filtrar proveedores que tengan ese producto
    const filtered = providers.filter((prov) =>
      prov.products.some((prod) => prod.id === producto.id)
    );
    setFilteredProviders(filtered);
  }, [formLote.codigo, productos, providers]);

  // Tipo para proveedor

  // Cargar proveedores al inicio
  useEffect(() => {
    fetch(`${API_URL}/api/v1/providers`)
      .then((res) => res.json())
      .then((data) => setProviders(data));
  }, []);

  // Filtrar proveedores por producto seleccionado en el lote
  useEffect(() => {
    if (!formLote.codigo) {
      setFilteredProviders([]);
      return;
    }
    // Buscar el producto por código
    const producto = productos.find(
      (p: Producto) => p.codigo === formLote.codigo
    );
    if (!producto) {
      setFilteredProviders([]);
      return;
    }
    // Filtrar proveedores que tengan ese producto
    const filtered = providers.filter((prov) =>
      prov.products.some((prod) => prod.id === producto.id)
    );
    setFilteredProviders(filtered);
  }, [formLote.codigo, productos, providers]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/api/v1/products`).then((res) => res.json()),
      fetch(`${API_URL}/api/v1/batch`).then((res) => res.json()),
    ])
      .then(([productosData, lotesData]) => {
        setProductos(productosData);
        setLotes(lotesData);
      })
      .catch(() => {
        console.error("Error al obtener productos y lotes");
        setProductos([]);
        setLotes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Une productos y lotes para mostrar todos los productos aunque no tengan lotes
  const agruparProductos = (productosArr: Producto[], lotesArr: Lote[]) => {
    const lotesPorCodigo = lotesArr.reduce(
      (acc, lote) => {
        if (!acc[lote.codigo]) acc[lote.codigo] = [];
        acc[lote.codigo].push(lote);
        return acc;
      },
      {} as Record<string, Lote[]>
    );

    return productosArr.map((producto) => {
      const lotes = lotesPorCodigo[producto.codigo] || [];
      return {
        ...producto,
        stock: producto.stock, // <-- stock real del producto
        lotes,
      };
    });
  };

  // Inicializa productosFiltrados con todos los productos agrupados
  useEffect(() => {
    setProductsFiltered(agruparProductos(productos, lotes));
  }, [productos, lotes]);

  return (
    <ProtectedRoute
      allowedRoles={["administrador", "supervisor", "cajero", "bodeguero"]}
    >
      <Container
        page={
          <div>
            <div className="flex">
              <SideBar role={userRole} />
              <div className="w-full pl-10 pt-10">
                <h1 className="text-2xl font-bold mb-6 text-left">
                  Inventario
                </h1>
                {/* Barra de búsqueda y botones principales */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-6">
                  <div className="w-full h-10">
                    <SearchBar<Producto>
                      data={productos}
                      displayField="codigo"
                      searchFields={["codigo", "nombre"]}
                      placeholder="Buscar por código o nombre..."
                      onResultsChange={(results) => {
                        setProductsFiltered(results);
                        if (results.length > 0 || !results) setAlert(null);
                      }}
                      onSelect={(item) => setProductsFiltered([item])}
                      onNotFound={(q) => {
                        if (q === "") {
                          setAlert(null);
                        } else {
                          setProductsFiltered([]);
                          setAlert({
                            type: "error",
                            message: `No existe ningún producto con el código o nombre "${q}".`,
                          });
                        }
                      }}
                    />
                    {/* Mostrar alert de búsqueda */}
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
                  </div>
                  <div className="flex gap-2">
                    <Button
                      style="bg-sky-500 hover:bg-azul-claro text-white font-bold py-4 px-3 cursor-pointer mr-20 rounded flex items-center gap-2"
                      onClick={() => {
                        setEditProductMode(false);
                        setFormProducto({
                          codigo: "",
                          nombre: "",
                          stock: 0,
                          precio: 0,
                          bodega: "",
                        });
                        setModalOpen("add-product");
                      }}
                    >
                      <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                      <span className="whitespace-nowrap text-base">
                        Agregar Producto
                      </span>
                    </Button>
                  </div>
                </div>
                {/* Tabla de productos agrupados */}
                <div className="shadow-md rounded-lg max-h-[63vh] overflow-y-auto mb-10 mr-10">
                  <table className="min-w-full divide-y divide-gray-200 ">
                    <thead className="bg-gray-100">
                      <tr>
                        {headers.map((header, idx) => (
                          <th
                            key={idx}
                            className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={headers.length}
                            className="text-center py-4"
                          >
                            Cargando...
                          </td>
                        </tr>
                      ) : productsFiltered.length === 0 ? (
                        <tr>
                          <td
                            colSpan={headers.length}
                            className="text-center py-4"
                          >
                            Sin resultados
                          </td>
                        </tr>
                      ) : (
                        // Renderiza una fila por producto agrupado
                        productsFiltered.map((producto: any) => (
                          <React.Fragment key={producto.codigo}>
                            <tr
                              className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                              onClick={() =>
                                setExpanded(
                                  expanded === producto.codigo
                                    ? null
                                    : producto.codigo
                                )
                              }
                            >
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.codigo}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.nombre}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.stock}
                              </td>

                              <td className="px-3 py-3 text-sm text-gray-600">
                                ₡{producto.precio}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.bodega?.codigo ||
                                  producto.bodega ||
                                  ""}
                              </td>
                              <td className=" flex flex-row py-3 px-3  text-sm gap-2">
                                <Button
                                  style="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
                                  onClick={() => {
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
                                      lote_id: undefined,
                                    });
                                    setModalOpen("add-lote");
                                  }}
                                >
                                  <IoAddCircle />
                                  Agregar lote
                                </Button>
                                {/* Botón Editar Producto */}
                                <Button
                                  style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
                                  onClick={() => {
                                    setEditProductMode(true);

                                    setFormProducto({
                                      id: producto.id,
                                      codigo: producto.codigo,
                                      nombre: producto.nombre,
                                      stock: producto.stock,
                                      precio: producto.precio,
                                      bodega: producto.bodega?.bodega_id
                                        ? producto.bodega.bodega_id
                                        : producto.bodega,
                                    });
                                    setModalOpen("add-product");
                                  }}
                                >
                                  <RiEdit2Fill />
                                  Editar
                                </Button>
                                <Button
                                  style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
                                  onClick={() => setProductoAEliminar(producto)}
                                >
                                  <FaTrash />
                                  Eliminar
                                </Button>

                                {/* Modal de confirmación para eliminar producto */}
                                {productoAEliminar && (
                                  <SimpleModal
                                    open={true}
                                    onClose={() => setProductoAEliminar(null)}
                                  >
                                    <div className="z-10 relative bg-white rounded-xl w-full max-w-md p-8">
                                      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                        Eliminar producto
                                      </h2>
                                      <p className="mb-6 text-center">
                                        ¿Seguro que deseas eliminar el producto{" "}
                                        <b>{productoAEliminar.nombre}</b>?
                                      </p>
                                      <div className="flex gap-4 justify-center">
                                        <Button
                                          text="Eliminar"
                                          style="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                                          onClick={async () => {
                                            const res = await fetch(
                                              `${API_URL}/api/v1/products/${productoAEliminar.id}`,
                                              {
                                                method: "DELETE",
                                              }
                                            );
                                            if (res.ok) {
                                              setProductos((prev) =>
                                                prev.filter(
                                                  (p) =>
                                                    p.codigo !==
                                                    productoAEliminar.codigo
                                                )
                                              );
                                            }
                                            setProductoAEliminar(null);
                                          }}
                                        />
                                        <Button
                                          text="Cancelar"
                                          style="bg-gray-400 hover:bg-gray-500 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                                          onClick={() =>
                                            setProductoAEliminar(null)
                                          }
                                        />
                                      </div>
                                    </div>
                                  </SimpleModal>
                                )}
                              </td>
                            </tr>
                            {/* Fila colapsable con los lotes de ese producto */}
                            {expanded === producto.codigo && (
                              <tr className="bg-gray-100">
                                <td
                                  colSpan={headers.length}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide"
                                >
                                  <div className="flex flex-col gap-2">
                                    {/* Renderiza cada lote de ese producto con info resumida y botón de detalles */}
                                    {producto.lotes.map((lote: Lote) => (
                                      <div
                                        key={lote.lote_id}
                                        className="mb p-2 flex flex-row items-center gap-5"
                                      >
                                        <span>
                                          <b>Número de lote:</b>{" "}
                                          {lote.numero_lote}
                                        </span>
                                        <span>
                                          <b>Fecha de vencimiento:</b>{" "}
                                          {lote.fecha_salida}
                                        </span>
                                        <span>
                                          <b>Cantidad actual:</b>{" "}
                                          {lote.cantidad}
                                        </span>
                                        {/* Botón para ver detalles completos del lote en el modal */}
                                        <div className="ml-auto flex gap-2">
                                          <Button
                                            style="text-sm cursor-pointer bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                                            onClick={() => {
                                              setEditMode(false);
                                              setFormLote(lote);
                                              setModalOpen(lote);
                                            }}
                                          >
                                            <CgDetailsMore />
                                            Detalles
                                          </Button>
                                          <Button
                                            style="text-sm cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                                            onClick={() => {
                                              setEditMode(true);
                                              setFormLote(lote);
                                              setModalOpen(lote);
                                            }}
                                          >
                                            <RiEdit2Fill />
                                            Editar
                                          </Button>
                                          <Button
                                            style="text-sm cursor-pointer bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                            onClick={async () => {
                                              if (
                                                !window.confirm(
                                                  "¿Seguro que deseas eliminar este lote?"
                                                )
                                              )
                                                return;
                                              setLoadingForm(true);
                                              try {
                                                const res = await fetch(
                                                  `${API_URL}/api/v1/batch/${lote.lote_id}`,
                                                  {
                                                    method: "DELETE",
                                                  }
                                                );
                                                if (res.ok) {
                                                  setLotes((prev) =>
                                                    prev.filter(
                                                      (l) =>
                                                        l.lote_id !==
                                                        lote.lote_id
                                                    )
                                                  );
                                                }
                                              } finally {
                                                setLoadingForm(false);
                                              }
                                            }}
                                            disabled={loadingForm}
                                          >
                                            <FaTrash />
                                            Eliminar
                                          </Button>
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
                {/* Modal para agregar/editar producto */}
                {modalOpen === "add-product" && (
                  <SimpleModal open={true} onClose={() => setModalOpen(false)}>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setLoadingForm(true);
                        if (editProductMode) {
                          // Editar producto
                          const res = await fetch(
                            `${API_URL}/api/v1/products/${formProducto.id}`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                nombre: formProducto.nombre,
                                precio: Number(formProducto.precio),
                                bodega_id: Number(formProducto.bodega),
                              }),
                            }
                          );
                          if (res.ok) {
                            const actualizado = await res.json();
                            setProductos((prev) =>
                              prev.map((p) =>
                                p.codigo === formProducto.codigo
                                  ? { ...p, ...actualizado }
                                  : p
                              )
                            );
                            // ACTUALIZA EL NOMBRE EN LOS LOTES RELACIONADOS
                            setLotes((prev) =>
                              prev.map((lote) =>
                                lote.codigo === formProducto.codigo
                                  ? { ...lote, nombre: formProducto.nombre }
                                  : lote
                              )
                            );
                          }
                        } else {
                          // Crear producto
                          const res = await fetch(
                            `${API_URL}/api/v1/products`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                codigo: formProducto.codigo,
                                nombre: formProducto.nombre,
                                stock: 0,
                                precio: Number(formProducto.precio),
                                bodega_id: Number(formProducto.bodega),
                              }),
                            }
                          );
                          if (res.ok) {
                            const nuevoProducto = await res.json();
                            setProductos((prev) => [...prev, nuevoProducto]);
                          }
                        }
                        setLoadingForm(false);
                        setModalOpen(false);
                        setEditProductMode(false);
                      }}
                      className="relative bg-white rounded-2xl w-full max-w-lg p-8 overflow-y-auto"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        {editProductMode
                          ? "Editar Producto"
                          : "Agregar Producto"}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-4">
                          <label className="font-semibold">
                            Código
                            <input
                              name="codigo"
                              value={formProducto.codigo}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  codigo: e.target.value,
                                }))
                              }
                              placeholder="Código"
                              className="w-full border rounded-lg px-3 py-2"
                              required
                              disabled={editProductMode}
                              readOnly={editProductMode}
                            />
                          </label>
                          <label className="font-semibold">
                            Nombre
                            <input
                              name="nombre"
                              value={formProducto.nombre}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  nombre: e.target.value,
                                }))
                              }
                              placeholder="Nombre"
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            />
                          </label>
                          <label className="font-semibold">
                            Stock
                            <input
                              name="stock"
                              value={formProducto.stock}
                              disabled
                              readOnly
                              className="w-full border rounded-lg px-3 py-2 bg-gray-300"
                            />
                          </label>
                        </div>
                        <div className="flex flex-col gap-4">
                          <label className="font-semibold">
                            Precio
                            <input
                              name="precio"
                              type="number"
                              value={formProducto.precio}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  precio: Number(e.target.value),
                                }))
                              }
                              placeholder="Precio"
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            />
                          </label>
                          <label className="font-semibold">
                            Bodega
                            <select
                              name="bodega"
                              value={formProducto.bodega}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  bodega: e.target.value,
                                }))
                              }
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            >
                              <option value="">Seleccione una bodega</option>
                              {warehouses.map((w) => (
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
                          text={
                            loadingForm
                              ? "Guardando..."
                              : editProductMode
                                ? "Guardar cambios"
                                : "Guardar"
                          }
                          style="bg-blue-500 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                          type="submit"
                          disabled={
                            loadingForm ||
                            !formProducto.codigo ||
                            !formProducto.nombre ||
                            !formProducto.precio ||
                            !formProducto.bodega
                          }
                        />
                        <Button
                          text="Cerrar"
                          style="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                          type="button"
                          onClick={() => {
                            setModalOpen(false);
                            setEditProductMode(false);
                          }}
                        />
                      </div>
                    </form>
                  </SimpleModal>
                )}

                {/* Modal para agregar lote */}
                {modalOpen === "add-lote" && (
                  <SimpleModal
                    open={true}
                    onClose={() => {
                      setModalOpen(false);
                      setEditMode(false);
                    }}
                  >
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setLoadingForm(true);

                        try {
                          const res = await fetch(`${API_URL}/api/v1/batch`, {
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
                              nombre: formLote.nombre,
                            }),
                          });

                          if (!res.ok)
                            throw new Error("Error al guardar el lote");

                          const nuevoLote = await res.json();

                          // Actualizar lista de lotes local
                          setLotes((prev) => [...prev, nuevoLote]);

                          // **Actualizar lista de productos desde backend**
                          const productosActualizados = await fetch(
                            `${API_URL}/api/v1/products`
                          ).then((r) => r.json());
                          setProductos(productosActualizados);
                        } catch (error) {
                          console.error("Error al agregar lote:", error);
                        } finally {
                          setLoadingForm(false);
                          setModalOpen(false);
                          setEditMode(false);
                        }
                      }}
                      className="relative bg-white rounded-2xl w-full max-w-lg p-8 overflow-y-auto"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Agregar Lote
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-4">
                          <label className="font-semibold">
                            Número de lote
                            <input
                              name="numero_lote"
                              value={formLote.numero_lote}
                              onChange={(e) =>
                                setFormLote((f) => ({
                                  ...f,
                                  numero_lote: e.target.value,
                                }))
                              }
                              placeholder="Número de lote"
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            />
                          </label>
                          <label className="font-semibold">
                            Código de lote
                            <input
                              name="codigo"
                              value={formLote.codigo}
                              disabled
                              readOnly
                              className="w-full border rounded-lg px-3 py-2 bg-gray-300"
                            />
                          </label>
                          <label className="font-semibold">
                            Nombre
                            <input
                              name="nombre"
                              value={formLote.nombre}
                              disabled
                              readOnly
                              className="w-full border rounded-lg px-3 py-2 bg-gray-300"
                            />
                          </label>
                          <label className="font-semibold">
                            Cantidad
                            <input
                              name="cantidad"
                              type="number"
                              value={formLote.cantidad}
                              onChange={(e) =>
                                setFormLote((f) => ({
                                  ...f,
                                  cantidad: Number(e.target.value),
                                }))
                              }
                              placeholder="Cantidad"
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            />
                          </label>
                          <label className="font-semibold">
                            Fecha de entrada de bodega
                            <input
                              name="fecha_entrada"
                              type="date"
                              value={formLote.fecha_entrada}
                              onChange={(e) =>
                                setFormLote((f) => ({
                                  ...f,
                                  fecha_entrada: e.target.value,
                                }))
                              }
                              placeholder="Fecha de entrada"
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            />
                          </label>
                          <label className="font-semibold">
                            Fecha de salida de bodega
                            <input
                              name="fecha_salida_lote"
                              type="date"
                              value={formLote.fecha_salida_lote || ""}
                              onChange={(e) =>
                                setFormLote((f) => ({
                                  ...f,
                                  fecha_salida_lote: e.target.value,
                                }))
                              }
                              placeholder="Fecha de salida"
                              className="w-full border rounded-lg px-3 py-2"
                            />
                          </label>
                        </div>
                        <div className="flex flex-col gap-4">
                          <label className="font-semibold">
                            Proveedor
                            <select
                              name="proveedor"
                              value={formLote.proveedor}
                              onChange={(e) =>
                                setFormLote((f) => ({
                                  ...f,
                                  proveedor: e.target.value,
                                }))
                              }
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            >
                              <option value="">Seleccione un proveedor</option>
                              {filteredProviders.length === 0 ? (
                                <option value="" disabled>
                                  No hay proveedores para este producto
                                </option>
                              ) : (
                                filteredProviders.map((prov) => (
                                  <option key={prov.id} value={prov.name}>
                                    {prov.name}
                                  </option>
                                ))
                              )}
                            </select>
                          </label>
                          <label className="font-semibold">
                            Fecha de vencimiento
                            <input
                              name="fecha_salida"
                              type="date"
                              value={formLote.fecha_salida}
                              onChange={(e) =>
                                setFormLote((f) => ({
                                  ...f,
                                  fecha_salida: e.target.value,
                                }))
                              }
                              placeholder="Fecha de vencimiento"
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            />
                          </label>
                          <label className="font-semibold">
                            Descripción
                            <textarea
                              name="descripcion"
                              value={formLote.descripcion}
                              onChange={(e) =>
                                setFormLote((f) => ({
                                  ...f,
                                  descripcion: e.target.value,
                                }))
                              }
                              placeholder="Descripción"
                              className="w-full border rounded-lg px-3 py-2 min-h-[40px]"
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-4 justify-end mt-6">
                        <Button
                          text={loadingForm ? "Guardando..." : "Guardar"}
                          style="bg-blue-500 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                          type="submit"
                          disabled={
                            loadingForm ||
                            !formLote.codigo ||
                            !formLote.nombre ||
                            !formLote.numero_lote ||
                            !formLote.cantidad ||
                            !formLote.proveedor ||
                            !formLote.fecha_entrada ||
                            !formLote.fecha_salida
                          }
                        />
                        <Button
                          text="Cerrar"
                          style="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                          type="button"
                          onClick={() => {
                            setModalOpen(false);
                            setEditMode(false);
                          }}
                        />
                      </div>
                    </form>
                  </SimpleModal>
                )}

                {/* Modal para ver detalles o editar un lote */}
                {modalOpen &&
                  typeof modalOpen === "object" &&
                  modalOpen !== null && (
                    <SimpleModal
                      open={true}
                      onClose={() => {
                        setModalOpen(false);
                        setEditMode(false);
                      }}
                    >
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setLoadingForm(true);
                          const lote = formLote;
                          const res = await fetch(
                            `${API_URL}/api/v1/batch/${lote.lote_id}`,
                            {
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
                                nombre: formLote.nombre,
                              }),
                            }
                          );
                          if (res.ok) {
                            const loteActualizado = await res.json();
                            setLotes((prev) =>
                              prev.map((l) =>
                                l.lote_id === loteActualizado.lote_id
                                  ? loteActualizado
                                  : l
                              )
                            );
                          }
                          setLoadingForm(false);
                          setModalOpen(false);
                          setEditMode(false);
                        }}
                        className="relative bg-white rounded-2xl w-full max-w-lg p-8 overflow-y-auto"
                      >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                          {editMode ? "Editar Lote" : "Detalles del Lote"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Columna 1 */}
                          <div className="flex flex-col gap-4">
                            <label className="font-semibold">
                              Número de lote
                              <input
                                name="numero_lote"
                                value={formLote.numero_lote}
                                onChange={(e) =>
                                  setFormLote((f) => ({
                                    ...f,
                                    numero_lote: e.target.value,
                                  }))
                                }
                                placeholder="Número de lote"
                                className="w-full border rounded-lg px-3 py-2"
                                required
                                readOnly={!editMode}
                              />
                            </label>
                            <label className="font-semibold">
                              Código de lote
                              <input
                                name="codigo"
                                value={formLote.codigo}
                                disabled
                                readOnly
                                className="w-full border rounded-lg px-3 py-2 bg-gray-300"
                              />
                            </label>
                            <label className="font-semibold">
                              Nombre
                              <input
                                name="nombre"
                                value={formLote.nombre}
                                disabled
                                readOnly
                                className="w-full border rounded-lg px-3 py-2 bg-gray-300"
                              />
                            </label>
                            <label className="font-semibold">
                              Cantidad
                              <input
                                name="cantidad"
                                type="number"
                                value={formLote.cantidad}
                                onChange={(e) =>
                                  setFormLote((f) => ({
                                    ...f,
                                    cantidad: Number(e.target.value),
                                  }))
                                }
                                placeholder="Cantidad"
                                className="w-full border rounded-lg px-3 py-2"
                                required
                                readOnly={!editMode}
                              />
                            </label>
                            <label className="font-semibold">
                              Fecha de entrada de bodega
                              <input
                                name="fecha_entrada"
                                type="date"
                                value={formLote.fecha_entrada}
                                onChange={(e) =>
                                  setFormLote((f) => ({
                                    ...f,
                                    fecha_entrada: e.target.value,
                                  }))
                                }
                                placeholder="Fecha de entrada"
                                className="w-full border rounded-lg px-3 py-2"
                                required
                                readOnly={!editMode}
                              />
                            </label>
                            <label className="font-semibold">
                              Fecha de salida de bodega
                              <input
                                name="fecha_salida_lote"
                                type="date"
                                value={formLote.fecha_salida_lote || ""}
                                onChange={(e) =>
                                  setFormLote((f) => ({
                                    ...f,
                                    fecha_salida_lote: e.target.value,
                                  }))
                                }
                                placeholder="Fecha de salida"
                                className="w-full border rounded-lg px-3 py-2"
                                readOnly={!editMode}
                              />
                            </label>
                          </div>
                          {/* Columna 2 */}
                          <div className="flex flex-col gap-4">
                            <label className="font-semibold">
                              Proveedor
                              {editMode ? (
                                <select
                                  name="proveedor"
                                  value={formLote.proveedor}
                                  onChange={(e) =>
                                    setFormLote((f) => ({
                                      ...f,
                                      proveedor: e.target.value,
                                    }))
                                  }
                                  className="w-full border rounded-lg px-3 py-2"
                                  required
                                >
                                  <option value="">
                                    Seleccione un proveedor
                                  </option>
                                  {filteredProviders.length === 0 ? (
                                    <option value="" disabled>
                                      No hay proveedores para este producto
                                    </option>
                                  ) : (
                                    filteredProviders.map((prov) => (
                                      <option key={prov.id} value={prov.name}>
                                        {prov.name}
                                      </option>
                                    ))
                                  )}
                                </select>
                              ) : (
                                <input
                                  name="proveedor"
                                  value={formLote.proveedor}
                                  readOnly
                                  className="w-full border rounded-lg px-3 py-2 bg-gray-300"
                                />
                              )}
                            </label>
                            <label className="font-semibold">
                              Fecha de vencimiento
                              <input
                                name="fecha_salida"
                                type="date"
                                value={formLote.fecha_salida}
                                onChange={(e) =>
                                  setFormLote((f) => ({
                                    ...f,
                                    fecha_salida: e.target.value,
                                  }))
                                }
                                placeholder="Fecha de vencimiento"
                                className="w-full border rounded-lg px-3 py-2"
                                required
                                readOnly={!editMode}
                              />
                            </label>
                            <label className="font-semibold">
                              Descripción
                              <textarea
                                name="descripcion"
                                value={formLote.descripcion}
                                onChange={(e) =>
                                  setFormLote((f) => ({
                                    ...f,
                                    descripcion: e.target.value,
                                  }))
                                }
                                placeholder="Descripción"
                                className="w-full border rounded-lg px-3 py-2 min-h-[40px]"
                                readOnly={!editMode}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-4 justify-end mt-6">
                          {(editMode || loadingForm) && (
                            <Button
                              text={
                                loadingForm ? "Guardando..." : "Guardar cambios"
                              }
                              style="bg-blue-500 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                              type="submit"
                              disabled={loadingForm}
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
                    </SimpleModal>
                  )}
              </div>
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
