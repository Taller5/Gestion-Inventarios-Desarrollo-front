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
import { FaSearch } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

//type bodega
type Warehouse = {
  bodega_id: number;
  codigo: string;
   sucursal_id: number;
  branch: {
    nombre: string;
    business: {
      nombre_comercial: string;
    };
  };
};

//type producto
type Producto = {
  id?: number;
  codigo_producto: string;
  nombre_producto: string;
  categoria: string;
  descripcion?: string;
  stock: number;
  precio_compra: number;
  precio_venta: number;
  bodega_id: string;
};

//type lote
type Lote = {
  lote_id: number;
  codigo_producto: string;
  numero_lote: string;
  cantidad: number;
  proveedor: string;
  fecha_entrada: string;
  fecha_vencimiento: string; // fecha de vencimiento
  fecha_salida_lote?: string; // fecha de salida del lote
  descripcion: string;
  nombre_producto: string;
  nombre?: string;
};

// type provider
type Provider = {
  id: number;
  name: string;
  products: { id: number; nombre: string }[];
};

const headers = [ "Código", "Nombre", "Categoría", "Descripción", "Stock", "Precio", "Bodega", "Acciones"];

export default function Inventary() {
  // Tooltip for bodega info on select hover
  const [tooltip, setTooltip] = useState<{visible: boolean, content: string, position: {x: number, y: number}} | null>(null);

  const handleSelectMouseOver = (event: React.MouseEvent<HTMLSelectElement>) => {
    const selectedId = formProducto.bodega_id;
    const bodega = warehouses.find((w) => String(w.bodega_id) === String(selectedId));
    if (!bodega) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      content: `Sucursal: ${bodega.branch.nombre || "-"}\nNegocio: ${bodega.branch.business.nombre_comercial || "-"}`,
      position: { x: rect.right + 10, y: rect.top },
    });
  };
  const handleSelectMouseOut = () => setTooltip(null);
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
    codigo_producto: "",
    nombre_producto: "",
    categoria: "",
    descripcion: "",
    stock: 0,
    precio_compra: 0,
    precio_venta: 0,
    bodega_id: "",
  });
  // Estado para el formulario del modal de lote
  const [formLote, setFormLote] = useState<
    Omit<Lote, "lote_id"> & { lote_id?: number }
  >({
    codigo_producto: "",
    numero_lote: "",
    cantidad: 0,
    proveedor: "",
    fecha_entrada: "",
    fecha_vencimiento: "",
    fecha_salida_lote: "",
    descripcion: "",
    nombre_producto: "",
    lote_id: undefined,
  });
  const [simpleModal, setSimpleModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [loadingForm, setLoadingForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loteAEliminar, setLoteAEliminar] = useState<Lote | null>(null);
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
    if (!formLote.codigo_producto) {
      setFilteredProviders([]);
      return;
    }
    // Buscar el producto por código
    const producto = productos.find((p) => p.codigo_producto === formLote.codigo_producto);
    if (!producto) {
      setFilteredProviders([]);
      return;
    }
    // Filtrar proveedores que tengan ese producto
    const filtered = providers.filter((prov) =>
      prov.products.some((prod) => prod.id === producto.id)
    );
    setFilteredProviders(filtered);
  }, [formLote.codigo_producto, productos, providers]);

  // Tipo para proveedor

  // Cargar proveedores al inicio
  useEffect(() => {
    fetch(`${API_URL}/api/v1/providers`)
      .then((res) => res.json())
      .then((data) => setProviders(data));
  }, []);

  // Filtrar proveedores por producto seleccionado en el lote
  useEffect(() => {
    if (!formLote.codigo_producto) {
      setFilteredProviders([]);
      return;
    }
    // Buscar el producto por código
    const producto = productos.find(
      (p: Producto) => p.codigo_producto === formLote.codigo_producto
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
  }, [formLote.codigo_producto, productos, providers]);

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
        if (!acc[lote.codigo_producto]) acc[lote.codigo_producto] = [];
        acc[lote.codigo_producto].push(lote);
        return acc;
      },
      {} as Record<string, Lote[]>
    );

    return productosArr.map((producto) => {
      const lotes = lotesPorCodigo[producto.codigo_producto] || [];
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
                      displayField="codigo_producto"
                      searchFields={["codigo_producto", "nombre_producto"]}
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
                            ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro border"
                            : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
                        }`}
                      >
                        {alert.message}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-4 px-3 cursor-pointer rounded flex items-center"
                      onClick={() => {
                        setEditProductMode(false);
                        setFormProducto({
                          codigo_producto: "",
                          nombre_producto: "",
                          categoria: "",
                          descripcion: "",
                          stock: 0,
                          precio_compra: 0,
                          precio_venta: 0,
                          bodega_id: "",
                        });
                        setModalOpen("add-product");
                      }}
                    >
                      <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                      <span className="whitespace-nowrap text-base">
                        Agregar Producto
                      </span>
                    </Button>
                    <Button to="/iaprediction" style="bg-verde-claro hover:bg-verde-oscuro text-white font-bold py-4 px-3 cursor-pointer mr-20 rounded flex items-center gap-2">
                      <FaSearch/>
                      <span className="whitespace-nowrap text-base">
                        Ver predicciones
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
                          <React.Fragment key={producto.codigo_producto}>
                            <tr
                              className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                              onClick={() =>
                                setExpanded(
                                  expanded === producto.codigo_producto
                                    ? null
                                    : producto.codigo_producto
                                )
                              }
                            >
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.codigo_producto}
                                </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.nombre_producto}
                                </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.categoria}
                                </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.descripcion}
                                </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.stock}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600">
                                ₡{producto.precio_venta}
                                </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.bodega_id?.codigo_producto ||
                                producto.bodega_id ||
                                 ""}
                                 </td>
                              <td className=" flex flex-row py-3 px-3  text-sm gap-2">
                                <Button
                                  style="bg-verde-claro hover:bg-verde-oscuro text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
                                  onClick={() => {
                                    setEditMode(true);
                                    setFormLote({
                                      codigo_producto: producto.codigo_producto,
                                      nombre_producto: producto.nombre_producto,
                                      numero_lote: "",
                                      cantidad: 0,
                                      proveedor: "",
                                      fecha_entrada: "",
                                      fecha_vencimiento: "",
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
                                  style="text-sm cursor-pointer bg-azul-medio hover:bg-azul-hover text-white font-bold py-1 px-2 rounded"
                                  onClick={() => {
                                    setEditProductMode(true);

                                    setFormProducto({
                                      id: producto.id,
                                      codigo_producto: producto.codigo_producto,
                                      nombre_producto: producto.nombre_producto,
                                      categoria: producto.categoria,
                                      descripcion: producto.descripcion || "",
                                      stock: producto.stock,
                                      precio_compra: producto.precio_compra,
                                      precio_venta: producto.precio_venta,
                                      bodega_id: producto.bodega_id?.bodega_id
                                       ? producto.bodega_id.bodega_id 
                                       : producto.bodega_id,
                                    });
                                    setModalOpen("add-product");
                                  }}
                                >
                                  <RiEdit2Fill />
                                  Editar
                                </Button>
                                <Button
                                  style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
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
                                        <b>{productoAEliminar.nombre_producto}</b>?
                                      </p>
                                      <div className="flex gap-4 justify-center">
                                        <Button
                                          text="Eliminar"
                                          style="px-6 py-2 bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold rounded-lg cursor-pointer"
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
                                                    p.codigo_producto !==
                                                    productoAEliminar.codigo_producto
                                                )
                                              );
                                            }
                                            setProductoAEliminar(null);
                                          }}
                                        />
                                        <Button
                                          text="Cancelar"
                                          style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
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
                            {expanded === producto.codigo_producto && (
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
                                          {lote.fecha_vencimiento}
                                        </span>
                                        <span>
                                          <b>Productos ingresados por lote:</b>{" "}
                                          {lote.cantidad}
                                        </span>
                                        {/* Botón para ver detalles completos del lote en el modal */}
                                        <div className="ml-auto flex gap-2">
                                          <Button
                                            style="text-sm cursor-pointer bg-verde-claro hover:bg-verde-oscuro text-white font-bold py-1 px-2 rounded"
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
                                            style="text-sm cursor-pointer bg-azul-medio hover:bg-azul-hover text-white font-bold py-1 px-2 rounded"
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
                                            style="text-sm cursor-pointer bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold py-1 px-2 rounded justify-self-end"
                                            onClick={() => {
                                              setLoteAEliminar(lote);
                                              setSimpleModal({
                                                open: true,
                                                title: "Confirmación",
                                                message:
                                                  "¿Seguro que deseas eliminar este lote?",
                                              });
                                            }}
                                          >
                                            <FaTrash />
                                            Eliminar
                                          </Button>

                                          <SimpleModal
                                            open={simpleModal.open}
                                            onClose={() => {
                                              setSimpleModal({
                                                ...simpleModal,
                                                open: false,
                                              });
                                              setLoteAEliminar(null);
                                            }}
                                            title={simpleModal.title}
                                          >
                                            <div className="flex flex-col gap-4">
                                              <p>{simpleModal.message}</p>
                                              <div className="flex justify-end gap-2">
                                                <button
                                                  className="px-6 py-2 bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold rounded-lg cursor-pointer"
                                                  onClick={async () => {
                                                    if (!loteAEliminar) return;
                                                    setLoadingForm(true);
                                                    try {
                                                      const res = await fetch(
                                                        `${API_URL}/api/v1/batch/${loteAEliminar.lote_id}`,
                                                        {
                                                          method: "DELETE",
                                                        }
                                                      );
                                                      if (res.ok) {
                                                        setLotes((prev) =>
                                                          prev.filter(
                                                            (l) =>
                                                              l.lote_id !==
                                                              loteAEliminar.lote_id
                                                          )
                                                        );
                                                        // Recalcular stock de productos
                                                        setProductos((prevProductos) =>
                                                          prevProductos.map((prod) => {
                                                            if (prod.codigo_producto === loteAEliminar.codigo_producto) {
                                                              // Sumar cantidades de lotes restantes de este producto
                                                              const nuevosLotes = Array.isArray((prod as unknown as { lotes: Lote[] }).lotes)
                                                                ? (prod as unknown as { lotes: Lote[] }).lotes.filter((l: Lote) => l.lote_id !== loteAEliminar.lote_id)
                                                                : [];
                                                              const nuevoStock = nuevosLotes.reduce((acc: number, l: Lote) => acc + (l.cantidad || 0), 0);
                                                              return { ...prod, lotes: nuevosLotes, stock: nuevoStock };
                                                            }
                                                            return prod;
                                                          })
                                                        );
                                                      }
                                                    } finally {
                                                      setLoadingForm(false);
                                                      setSimpleModal({
                                                        ...simpleModal,
                                                        open: false,
                                                      });
                                                      setLoteAEliminar(null);
                                                    }
                                                  }}
                                                >
                                                  Eliminar
                                                </button>
                                                <button
                                                  className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                                                  onClick={() => {
                                                    setSimpleModal({
                                                      ...simpleModal,
                                                      open: false,
                                                    });
                                                    setLoteAEliminar(null);
                                                  }}
                                                >
                                                  Cancelar
                                                </button>
                                              </div>
                                            </div>
                                          </SimpleModal>
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
                                nombre_producto: formProducto.nombre_producto,
                                categoria: formProducto.categoria,
                                descripcion: formProducto.descripcion,
                                precio_compra: Number(formProducto.precio_compra),
                                precio_venta: Number(formProducto.precio_venta),
                                bodega_id: Number(formProducto.bodega_id),
                              }),
                            }
                          );
                          if (res.ok) {
                            const actualizado = await res.json();
                            setProductos((prev) =>
                              prev.map((p) =>
                                p.codigo_producto === formProducto.codigo_producto
                                  ? { ...p, ...actualizado }
                                  : p
                              )
                            );
                            // ACTUALIZA EL NOMBRE EN LOS LOTES RELACIONADOS
                            setLotes((prev) =>
                              prev.map((lote) =>
                                lote.codigo_producto === formProducto.codigo_producto
                                  ? { ...lote, nombre_producto: formProducto.nombre_producto }
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
                                codigo_producto: formProducto.codigo_producto,
                                nombre_producto: formProducto.nombre_producto,
                                categoria: formProducto.categoria,
                                descripcion: formProducto.descripcion,
                                stock: 0,
                                precio_compra: Number(formProducto.precio_compra),
                                precio_venta: Number(formProducto.precio_venta),
                                bodega_id: Number(formProducto.bodega_id),
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
                              name="codigo_producto"
                              value={formProducto.codigo_producto}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  codigo_producto: e.target.value,
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
                            Nombre del producto
                            <input
                              name="nombre_producto"
                              value={formProducto.nombre_producto}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  nombre_producto: e.target.value,
                                }))
                              }
                              placeholder="Nombre del producto"
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            />
                          </label>
                          <label className="font-semibold">
                            Categoría
                            <input
                              name="categoria"
                              value={formProducto.categoria}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  categoria: e.target.value,
                                }))
                              }
                              placeholder="Categoría"
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            />
                          </label>
                          <label className="font-semibold">
                            Descripción
                            <textarea
                              name="descripcion"
                              value={formProducto.descripcion}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  descripcion: e.target.value,
                                }))
                              }
                              placeholder="Descripción"
                              className="w-full border rounded-lg px-3 py-2 min-h-[40px]"
                            />
                          </label>
                          
                        </div>
                        <div className="flex flex-col gap-4">
                          <label className="font-semibold">
                            Precio de compra
                            <input
                              name="precio_compra"
                              type="number"
                              value={formProducto.precio_compra}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  precio_compra: Number(e.target.value),
                                }))
                              }
                              placeholder="Precio compra"
                              className="w-full border rounded-lg px-3 py-2"
                              min={0}
                              required
                            />
                          </label>
                          <label className="font-semibold">
                            Precio de venta
                            <input
                              name="precio_venta"
                              type="number"
                              value={formProducto.precio_venta}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  precio_venta: Number(e.target.value),
                                }))
                              }
                              placeholder="Precio de venta"
                              className="w-full border rounded-lg px-3 py-2"
                              min={0}
                              required
                            />
                          </label>
                          <label className="font-semibold">
                            Bodega
                            <div className="relative">
                              <select
                                name="bodega_id"
                                value={formProducto.bodega_id}
                                onChange={(e) =>
                                  setFormProducto((f) => ({
                                    ...f,
                                    bodega_id: e.target.value,
                                  }))
                                }
                                className="w-full border rounded-lg px-3 py-2"
                                required
                                onMouseOver={handleSelectMouseOver}
                                onMouseOut={handleSelectMouseOut}
                              >
                                <option value="">Seleccione una bodega</option>
                                {warehouses.map((w) => (
                                  <option key={w.bodega_id} value={w.bodega_id}>
                                    {w.codigo}
                                  </option>
                                ))}
                              </select>
                              {/* Tooltip for bodega info */}
                              {tooltip && tooltip.visible && (
                                <div
                                  className="fixed bg-gray-900 text-white px-3 py-2 rounded-lg z-[1000] text-sm whitespace-pre-line pointer-events-none shadow-lg"
                                  style={{ left: tooltip.position.x, top: tooltip.position.y }}
                                >
                                  {tooltip.content}
                                </div>
                              )}
                            </div>
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
                          style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                          type="submit"
                          disabled={
                            loadingForm ||
                            !formProducto.codigo_producto ||
                            !formProducto.nombre_producto ||
                            !formProducto.categoria ||
                            !formProducto.precio_compra ||
                            !formProducto.precio_venta ||
                            !formProducto.bodega_id
                          }
                        />
                        <Button
                          text="Cancelar"
                          style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
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
                              codigo_producto: formLote.codigo_producto,
                              numero_lote: formLote.numero_lote,
                              cantidad: Number(formLote.cantidad),
                              proveedor: formLote.proveedor,
                              fecha_entrada: formLote.fecha_entrada,
                              fecha_vencimiento: formLote.fecha_vencimiento,
                              fecha_salida_lote: formLote.fecha_salida_lote,
                              descripcion: formLote.descripcion,
                              nombre: formLote.nombre_producto,
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
                              value={formLote.codigo_producto}
                              disabled
                              readOnly
                              className="w-full border rounded-lg px-3 py-2 bg-gray-300"
                            />
                          </label>
                            <label className="font-semibold">
                              Nombre
                              <input
                                name="nombre"
                                value={formLote.nombre || formLote.nombre_producto || ""}
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
                              name="fecha_vencimiento"
                              type="date"
                              value={formLote.fecha_vencimiento}
                              onChange={(e) =>
                                setFormLote((f) => ({
                                  ...f,
                                  fecha_vencimiento: e.target.value,
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
                          style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                          type="submit"
                          disabled={
                            loadingForm ||
                            !formLote.codigo_producto ||
                            !formLote.nombre_producto ||
                            !formLote.numero_lote ||
                            !formLote.cantidad ||
                            !formLote.proveedor ||
                            !formLote.fecha_entrada ||
                            !formLote.fecha_vencimiento
                          }
                        />
                        <Button
                          text="Cancelar"
                          style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
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
                                codigo_producto: formLote.codigo_producto,
                                numero_lote: formLote.numero_lote,
                                cantidad: Number(formLote.cantidad),
                                proveedor: formLote.proveedor,
                                fecha_entrada: formLote.fecha_entrada,
                                fecha_vencimiento: formLote.fecha_vencimiento,
                                fecha_salida_lote: formLote.fecha_salida_lote,
                                descripcion: formLote.descripcion,
                                nombre: formLote.nombre_producto,
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
                            // Recalcular stock de productos
                            setProductos((prevProductos) =>
                              prevProductos.map((prod) => {
                                if (prod.codigo_producto === loteActualizado.codigo_producto) {
                                  const nuevosLotes = Array.isArray((prod as unknown as { lotes: Lote[] }).lotes)
                                    ? (prod as unknown as { lotes: Lote[] }).lotes.map((l: Lote) =>
                                        l.lote_id === loteActualizado.lote_id ? loteActualizado : l
                                      )
                                    : [];
                                  const nuevoStock = nuevosLotes.reduce((acc: number, l: Lote) => acc + (l.cantidad || 0), 0);
                                  return { ...prod, lotes: nuevosLotes, stock: nuevoStock };
                                }
                                return prod;
                              })
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
                                disabled={!editMode}  
                              />
                            </label>
                            <label className="font-semibold">
                              Código de lote
                              <input
                                name="codigo"
                                value={formLote.codigo_producto}
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
                                disabled={!editMode}
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
                                disabled={!editMode}
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
                                disabled={!editMode}
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
                                  className="w-full border rounded-lg px-3 py-2"
                                  disabled
                                />
                              )}
                            </label>
                            <label className="font-semibold">
                              Fecha de vencimiento
                              <input
                                name="fecha_vencimiento"
                                type="date"
                                value={formLote.fecha_vencimiento}
                                onChange={(e) =>
                                  setFormLote((f) => ({
                                    ...f,
                                    fecha_vencimiento: e.target.value,
                                  }))
                                }
                                placeholder="Fecha de vencimiento"
                                className="w-full border rounded-lg px-3 py-2"
                                required
                                readOnly={!editMode}
                                disabled={!editMode}
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
                                disabled={!editMode}
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
                              style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                              type="submit"
                              disabled={loadingForm}
                            />
                          )}
                          <Button
                            text="Cancelar"
                            type="button"
                            style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
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