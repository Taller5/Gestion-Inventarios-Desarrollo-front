import React, { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { IoAddCircle, IoPersonAdd, IoPencil } from "react-icons/io5";
import { jsPDF } from "jspdf";
// Para React + TypeScript


// Tipos
type Producto = {
  id?: number;
  codigo: string;
  nombre: string;
  precio: number;
  bodega?: string;
  stock?: number;
};

type Lote = {
  lote_id: number;
  codigo: string;
  cantidad: number;
};

type Customer = {
  customer_id: number;
  name: string;
  identity_number: string;
  phone?: string;
  email?: string;
};

export default function SalesPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  // Estados
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);//si se borra se daña
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Customer | null>(null);
  const [carrito, setCarrito] = useState<{ producto: Producto; cantidad: number; descuento: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [facturaModal, setFacturaModal] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Estados búsqueda y edición
  const [queryCliente, setQueryCliente] = useState("");
  const [queryProducto, setQueryProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editCantidad, setEditCantidad] = useState<number>(1);
  const [editDescuento, setEditDescuento] = useState<number>(0);

  //Facturación
const [metodoPago, setMetodoPago] = useState<string>("Efectivo");
const [montoEntregado, setMontoEntregado] = useState<number>(0);
const [comprobante, setComprobante] = useState<string>("");

//sucursales y negocios
// Definir los tipos completos
interface Business {
  nombre_comercial: string;
  nombre_legal: string;
  telefono: string;
  email: string;
  tipo_identificacion: string;
  numero_identificacion: string;
}

interface Sucursal {
  sucursal_id: number;
  nombre: string;
  ubicacion: string; // Dirección exacta
  provincia: string;
  canton: string;
  business: Business;
  telefono: string;

 

}

// States
const [sucursalSeleccionada, setSucursalSeleccionada] = useState<Sucursal | null>(null);
const [sucursales, setSucursales] = useState<Sucursal[]>([]);
const [modalSucursal, setModalSucursal] = useState(true);
const [loadingSucursal, setLoadingSucursal] = useState(false);
const [errorSucursal, setErrorSucursal] = useState<string | null>(null);


// Traer todas las sucursales
useEffect(() => {
  const fetchSucursales = async () => {
    setLoadingSucursal(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/v1/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar sucursales");
      const data = await res.json();

      // Formatear para que siempre tengan los campos de business y sucursal
      const sucursalesFormateadas: Sucursal[] = data.map((s: any) => ({
        sucursal_id: s.sucursal_id,
        nombre: s.nombre,
        ubicacion: s.ubicacion || "-",
        provincia: s.provincia || "-",
        canton: s.canton || "-",
        telefono: s.telefono || "-",
        business: {
          nombre_comercial: s.business.nombre_comercial || "-",
          nombre_legal: s.business.nombre_legal || "-",
          telefono: s.business.telefono || "-",
          email: s.business.email || "-",
          tipo_identificacion: s.business.tipo_identificacion || "-",
          numero_identificacion: s.business.numero_identificacion || "-",

        },
      }));

      setSucursales(sucursalesFormateadas);
    } catch (err) {
      console.error(err);
      setErrorSucursal("No se pudieron cargar las sucursales");
    } finally {
      setLoadingSucursal(false);
    }
  };

  fetchSucursales();
}, []);




  // Fetch inicial
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/products")
      .then(res => res.json())
      .then(setProductos);

    fetch("http://localhost:8000/api/v1/batch")
      .then(res => res.json())
      .then(setLotes);

    fetch("http://localhost:8000/api/v1/customers")
      .then(res => res.json())
      .then(setClientes);
  }, []);

 // Calcula stock real basado en los lotes
// Clave para localStorage
const LOCAL_STORAGE_KEY = "venta_en_curso";

// Calcula stock temporal basado en el stock de cada producto
const productosConStock: (Producto & { stockTemporal: number })[] = productos.map(producto => ({
  ...producto,
  stockTemporal: producto.stock ?? 0 // stock original del producto
}));

// Cuando agregues al carrito o cambies cliente
useEffect(() => {
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({ clienteSeleccionado, carrito, total })
  );
}, [clienteSeleccionado, carrito, total]);

// Recuperar venta al iniciar página
useEffect(() => {
  const savedVenta = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedVenta) {
    const { clienteSeleccionado, carrito, total } = JSON.parse(savedVenta);
    setClienteSeleccionado(clienteSeleccionado);
    setCarrito(carrito);
    setTotal(total);
  }
}, []);


// Filtrado clientes
const clientesFiltrados = queryCliente.trim()
  ? clientes.filter(c =>
      c.name.toLowerCase().includes(queryCliente.toLowerCase()) ||
      (c.email?.toLowerCase().includes(queryCliente.toLowerCase()) ?? false) ||
      c.identity_number.toLowerCase().includes(queryCliente.toLowerCase())
    )
  : []; // <-- antes estaba ": clientes"

// Filtrado productos
const productosFiltrados = queryProducto.trim()
  ? productosConStock.filter(p =>
      p.codigo.toLowerCase().includes(queryProducto.toLowerCase()) ||
      p.nombre.toLowerCase().includes(queryProducto.toLowerCase())
    )
  : []; // <-- antes estaba ": productosConStock"


  // Calcula total
  useEffect(() => {
    const subtotal = carrito.reduce(
      (acc, item) => acc + item.producto.precio * item.cantidad - item.descuento,
      0
    );
    setTotal(subtotal);
  }, [carrito]);


// Agregar al carrito
const agregarAlCarrito = (producto: Producto & { stock?: number }) => {
  const stockActual = producto.stock ?? 0;
  if (stockActual <= 0) {
    setAlert({ type: "error", message: "Producto sin stock" });
    return;
  }

  setCarrito(prev => {
    const idx = prev.findIndex(item => item.producto.codigo === producto.codigo);
    if (idx >= 0) {
      const nuevo = [...prev];
      if (nuevo[idx].cantidad + 1 > stockActual) {
        setAlert({ type: "error", message: "No se puede superar el stock disponible" });
        return nuevo;
      }
      nuevo[idx].cantidad += 1;
      return nuevo;
    }
    return [...prev, { producto, cantidad: 1, descuento: 0 }];
  });

  // Descontar 1 del stock temporal
  setProductos(prev =>
    prev.map(p =>
      p.codigo === producto.codigo
        ? { ...p, stock: (p.stock ?? 0) - 1 }
        : p
    )
  );

  setModalOpen(false);
  setAlert({ type: "success", message: `${producto.nombre} agregado al carrito` });
};

// Eliminar del carrito
const eliminarDelCarrito = (codigo: string) => {
  const item = carrito.find(i => i.producto.codigo === codigo);
  if (!item) return;

  // Sumar la cantidad eliminada al stock temporal
  setProductos(prev =>
    prev.map(p =>
      p.codigo === codigo
        ? { ...p, stock: (p.stock ?? 0) + item.cantidad }
        : p
    )
  );

  setCarrito(prev => prev.filter(i => i.producto.codigo !== codigo));
};

// Iniciar edición de un item del carrito
const iniciarEdicion = (idx: number) => {
  setEditIdx(idx);
  setEditCantidad(carrito[idx].cantidad);
  setEditDescuento(carrito[idx].descuento);
};

// Guardar edición
const guardarEdicion = (idx: number) => {
  setCarrito(prev => {
    const nuevo = [...prev];
    const item = nuevo[idx];
    const producto = productos.find(p => p.codigo === item.producto.codigo);
    if (!producto) return prev;

    const stockActual = producto.stock ?? 0;
    const diferencia = editCantidad - item.cantidad;

    if (diferencia > stockActual) {
      setAlert({ type: "error", message: "Cantidad excede stock disponible" });
      return prev;
    }

    // Actualizar stock temporal
    setProductos(prevProductos =>
      prevProductos.map(p =>
        p.codigo === item.producto.codigo
          ? { ...p, stock: (p.stock ?? 0) - diferencia }
          : p
      )
    );

    item.cantidad = editCantidad;
    item.descuento = editDescuento;
    return nuevo;
  });

  setEditIdx(null);
};




const finalizarVenta = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!clienteSeleccionado || !sucursalSeleccionada || carrito.length === 0) {
    setFacturaModal(false); // Cierra modal si hay error
    setAlert({type:"error", message: "Seleccione cliente, sucursal y agregue productos al carrito." });
    return;
  }

  try {
    // Validar monto entregado si el pago es en efectivo
    if (metodoPago === "Efectivo" && montoEntregado <= 0) {
      setFacturaModal(false);
      setAlert({type: "error", message: "Ingrese el monto entregado"});
      return;
    }
    if ((metodoPago === "Tarjeta" || metodoPago === "SINPE") && !comprobante.trim()) {
      setFacturaModal(false);
       setAlert({type: "error", message: "Debe ingresar el comprobante para el método de pago seleccionado."});
      return;
    }

    const metodoPagoBackend =
      metodoPago === "Efectivo" ? "Cash" :
      metodoPago === "Tarjeta" ? "Card" :
      metodoPago === "SINPE" ? "SINPE" :
      metodoPago;

    // Calcular totales
    const subtotal = carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
    const totalDescuento = carrito.reduce(
      (acc, item) => acc + (item.producto.precio * item.cantidad * (item.descuento || 0)) / 100,
      0
    );
    const totalAPagar = subtotal - totalDescuento;
    const vuelto = Math.max(0, (montoEntregado || 0) - totalAPagar);

    // Validar monto suficiente si es pago en efectivo
    if (metodoPago === "Efectivo" && montoEntregado < totalAPagar) {
      setFacturaModal(false);
      setAlert({type:"error", message: `El monto entregado es menor al total a pagar. Faltan ₡${(totalAPagar - montoEntregado).toLocaleString()}` });
      return;
    }

    // Preparar productos para la factura
    const productosFactura = carrito.map(item => ({
      code: item.producto.codigo,
      name: item.producto.nombre,
      quantity: item.cantidad,
      discount: item.descuento || 0,
      price: item.producto.precio
    }));

    // Preparar factura
    const facturaData = {
      customer_name: clienteSeleccionado.name,
      customer_identity_number: clienteSeleccionado.identity_number,
      branch_name: sucursalSeleccionada.nombre,
      business_name: sucursalSeleccionada.business.nombre_comercial,
      business_legal_name: sucursalSeleccionada.business.nombre_legal,
      business_phone: sucursalSeleccionada.business.telefono || "-",
      business_email: sucursalSeleccionada.business.email || "-",
      province: sucursalSeleccionada.provincia || "-",
      canton: sucursalSeleccionada.canton || "-",
      branches_phone: sucursalSeleccionada.telefono || "-",
      business_id_type: sucursalSeleccionada.business.tipo_identificacion || "N/A",
      business_id_number: sucursalSeleccionada.business.numero_identificacion || "N/A",
      cashier_name: user?.name || "N/A",
      date: new Date(),
      products: productosFactura,
      subtotal,
      total_discount: totalDescuento,
      taxes: 0,
      total: totalAPagar,
      amount_paid: metodoPagoBackend === "Cash" ? montoEntregado : totalAPagar,
      change: vuelto,
      payment_method: metodoPagoBackend,
      receipt: metodoPagoBackend === "Cash" ? "N/A" : comprobante || "",
    };

    // Enviar factura al backend
const response = await fetch("http://localhost:8000/api/v1/invoices", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Accept": "application/json" },
  body: JSON.stringify(facturaData),
});

// Intentar leer JSON sin romper la app
let responseData: any = null;
try {
  responseData = await response.json();
} catch {
  // La respuesta no es JSON, ignoramos porque la venta ya se guardó
  console.warn("El backend respondió con HTML o texto en lugar de JSON.");
}

// Solo mostrar alerta de éxito usando el ID si existe
setAlert({
  type: "success",
  message: `Factura ${responseData?.id ? `#${responseData.id}` : ""} creada exitosamente. ${vuelto > 0 ? `Vuelto: ₡${vuelto.toLocaleString()}` : ''}`
});


    // Restar stock de productos
    await Promise.all(
      carrito.map(async (item) => {
        const productoRes = await fetch(`http://localhost:8000/api/v1/products/${item.producto.id}`);
        const productoData = await productoRes.json();
        const nuevoStock = productoData.stock - item.cantidad;

        await fetch(`http://localhost:8000/api/v1/products/${item.producto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: nuevoStock }),
        });
      })
    );

    // Mensaje de éxito
    setAlert({type: "success", message: `Factura #${responseData.id} creada exitosamente. ${vuelto > 0 ? `Vuelto: ₡${vuelto.toLocaleString()}` : ''}` });

    // Limpiar estados
    setCarrito([]);
    setClienteSeleccionado(null);
    setMontoEntregado(0);
    setComprobante("");
    setFacturaModal(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    // Actualizar lista de productos
    const updatedProducts = await fetch("http://localhost:8000/api/v1/products").then(res => res.json());
    setProductos(updatedProducts);

  } catch (error: any) {
    console.error("Error en finalizarVenta:", error);
    setFacturaModal(false); // Cierra modal si hay error inesperado
    setAlert({type: "error", message:  "Ocurrió un error al procesar la venta. Por favor intente nuevamente." } );
  }
};


  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "cajero"]}>
      <Container
        page={
          <div className="flex">
            <SideBar role={userRole} />
            <div className="w-full pl-10 pt-10 flex gap-6">
              <div className="w-2/3">
                <h1 className="text-2xl font-bold mb-6">Punto de venta</h1>

       {/* Selector de cliente */}
<div className="mb-6">
  <input
    type="text"
    placeholder="Buscar cliente por nombre, email o cédula..."
    className="border rounded px-3 py-2 w-full mb-2"
    value={queryCliente}
    onChange={e => setQueryCliente(e.target.value)}
  />

  <div className="max-h-40 overflow-y-auto border rounded bg-white">
    {/* Opción de cliente de relleno */}
    <div
      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
        clienteSeleccionado?.customer_id === 0 ? "bg-gray-200 font-bold" : ""
      }`}
      onClick={() => setClienteSeleccionado({ customer_id: 0, name: "Cliente genérico", identity_number: "N/A" })}
    >
      Cliente genérico (No registrado)
    </div>

    {clientesFiltrados.map(cliente => (
      <div
        key={cliente.customer_id}
        className={`px-4 py-2 cursor-pointer hover:bg-sky-100 ${
          clienteSeleccionado?.customer_id === cliente.customer_id ? "bg-sky-200 font-bold" : ""
        }`}
        onClick={() => setClienteSeleccionado(cliente)}
      >
        {cliente.name}
        {cliente.identity_number && (
          <span className="text-gray-500 ml-2">
            Cédula: {cliente.identity_number}
          </span>
        )}
      </div>
    ))}
  </div>

  {clienteSeleccionado && (
    <p className="mt-2 font-bold text-blue-700">
      Cliente seleccionado: {clienteSeleccionado.name} ({clienteSeleccionado.identity_number})
    </p>
  )}

  <Button
    style="bg-green-500 hover:bg-green-700 text-white font-bold px-3 py-1 rounded mt-2"
    onClick={() => (window.location.href = "/customer")}
  >
    <IoPersonAdd /> Nuevo cliente
  </Button>
</div>


                {/* Navegador productos */}
                <div className="shadow-md rounded-lg p-4 mb-6">
                  <h2 className="text-lg font-bold mb-2">Productos</h2>
                  <input
                    type="text"
                    placeholder="Buscar producto por código o nombre..."
                    className="border rounded px-3 py-2 w-full mb-2"
                    value={queryProducto}
                    onChange={e => setQueryProducto(e.target.value)}
                  />
                  <div className="max-h-40 overflow-y-auto border rounded bg-white">
                    {productosFiltrados.map(producto => (
                      <div
                        key={producto.codigo}
                        className={`px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-sky-100 ${
                          productoSeleccionado?.codigo === producto.codigo ? "bg-sky-200 font-bold" : ""
                        }`}
                        onClick={() => setProductoSeleccionado(producto)}
                      >
                        <span>
                          {producto.nombre} <span className="text-gray-500">({producto.codigo})</span>
                        </span>
                        <span
                          className={`ml-4 px-2 py-1 rounded ${
                            (producto.stock ?? 0) > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          Stock: {producto.stock ?? 0}
                        </span>
                        <Button
                          style="bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded ml-4"
                          onClick={() => setModalOpen(true)}
                          disabled={(producto.stock ?? 0) <= 0}
                        >
                          <IoAddCircle /> Añadir
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

{/* Tabla carrito */}
<div className="shadow-md rounded-lg mb-6">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Código</th>
        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Nombre</th>
        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Cantidad</th>
        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Precio</th>
        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Descuento</th>
        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Total</th>
        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Acciones</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {carrito.length === 0 ? (
        <tr>
          <td colSpan={7} className="text-center py-4">Sin productos</td>
        </tr>
      ) : (
        carrito.map((item, idx) => {
          const descuentoPct = Math.max(0, Math.min(item.descuento, 100)); // límite entre 0 y 100%
          const totalItem = item.producto.precio * item.cantidad * (1 - descuentoPct / 100);
          return (
            <tr key={idx}>
              <td className="px-3 py-3">{item.producto.codigo}</td>
              <td className="px-3 py-3">{item.producto.nombre}</td>
              <td className="px-3 py-3">
                {editIdx === idx ? (
                  <input
                    type="number"
                    min={1}
                    value={editCantidad}
                    onChange={e => setEditCantidad(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-16"
                  />
                ) : (
                  item.cantidad
                )}
              </td>
              <td className="px-3 py-3">₡{item.producto.precio}</td>
                      <td className="px-3 py-3">
            {editIdx === idx ? (
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editDescuento}
                  onChange={e => setEditDescuento(Number(e.target.value))}
                  className="w-full"
                />
                <span className="w-10 text-right">{editDescuento}%</span>
              </div>
            ) : (
              `${descuentoPct}%`
            )}
          </td>

              <td className="px-3 py-3">₡{Math.round(totalItem)}</td>
              <td className="px-3 py-3 flex gap-2">
                {editIdx === idx ? (
                  <>
                    <Button
                      text="Guardar"
                      style="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => guardarEdicion(idx)}
                    />
                    <Button
                      text="Cancelar"
                      style="bg-gray-400 text-white px-2 py-1 rounded"
                      onClick={() => setEditIdx(null)}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      text="Editar"
                      style="bg-yellow-500 text-white px-2 py-1 rounded flex items-center gap-1"
                      onClick={() => iniciarEdicion(idx)}
                    >
                      <IoPencil />
                    </Button>
                    <Button
                      text="Eliminar"
                      style="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => eliminarDelCarrito(item.producto.codigo)}
                    />
                  </>
                )}
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>

{/* Pie carrito */}
<div className="flex justify-end items-center bg-sky-700 text-white px-10 py-4 rounded-lg">
  <div className="flex-1">
    {/* Subtotal */}
    <div>
      Costo antes de descuento: ₡{carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)}
    </div>

    {/* Descuento en porcentaje */}
    <div>
      Descuento: {(() => {
        const subtotal = carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
        const totalDescuento = carrito.reduce(
          (acc, item) => acc + item.producto.precio * item.cantidad * Math.max(0, Math.min(item.descuento, 100)) / 100,
          0
        );
        return subtotal > 0 ? `${Math.round((totalDescuento / subtotal) * 100)}%` : "0%";
      })()}
    </div>

    <div>Impuestos: ₡0</div>

    {/* Total a pagar */}
    <div>Total a pagar: ₡{carrito.reduce((acc, item) => {
      const descuentoPct = Math.max(0, Math.min(item.descuento, 100));
      return acc + item.producto.precio * item.cantidad * (1 - descuentoPct / 100);
    }, 0)}</div>
  </div>

  <Button
    text="Pagar"
    style="bg-blue-500 text-white px-8 py-3 rounded text-lg font-bold"
    onClick={() => setFacturaModal(true)}
    disabled={carrito.length === 0 || !clienteSeleccionado}
  />
</div>



              </div>

              <div className="w-1/3"></div>

              {/* Modal añadir producto */}
              {modalOpen && productoSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                    <h2 className="text-xl font-bold mb-4">Añadir producto</h2>
                    <p><strong>Código:</strong> {productoSeleccionado.codigo}</p>
                    <p><strong>Nombre:</strong> {productoSeleccionado.nombre}</p>
                    <p><strong>Precio:</strong> ₡{productoSeleccionado.precio}</p>
                    <p><strong>Stock disponible:</strong> {productoSeleccionado.stock ?? 0}</p>
                    <div className="flex justify-end gap-4 mt-6">
                      <Button
                        style="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded"
                        onClick={() => agregarAlCarrito(productoSeleccionado as Producto & { stock: number })}
                        disabled={(productoSeleccionado.stock ?? 0) <= 0}
                      >
                        <IoAddCircle /> Agregar
                      </Button>
                      <Button
                        style="bg-red-500 hover:bg-red-700 text-white font-bold px-4 py-2 rounded"
                        onClick={() => setModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
{modalSucursal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <h2 className="text-xl font-bold mb-4 text-center">Seleccione la sucursal en la cual esta trabajando</h2>

      <div className="flex flex-col gap-3">
        {sucursales.map(sucursal => (
          <button
            key={sucursal.sucursal_id}
            className="w-full px-4 py-2 bg-sky-500 hover:bg-sky-700 text-white rounded font-bold"
            onClick={() => {
              setSucursalSeleccionada(sucursal);
              setModalSucursal(false);
            }}
          >
            {sucursal.nombre} - {sucursal.business.nombre_comercial}
          </button>
        ))}
      </div>

      {sucursales.length === 0 && (
        <p className="text-red-500 mt-4 text-center">No hay sucursales disponibles</p>
      )}

      {/* Botones adicionales */}
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded font-bold"
          onClick={() => setModalSucursal(false)}
        >
          Cancelar
        </button>
        <button
          className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded font-bold"
          onClick={() => window.location.href = "/Branches"} // redirige a Branches
        >
          Por favor, agrega una sucursal.
        </button>
      </div>
    </div>
  </div>
)}

{facturaModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
    <form
      onSubmit={finalizarVenta}
      className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 overflow-y-auto max-h-[90vh]"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Proceso de facturación</h2>

      {/* CLIENTE, SUCURSAL Y USUARIO */}
      <div className="mb-4">
        <div><strong>Cliente:</strong> {clienteSeleccionado?.name || "-"}</div>
        <div><strong>Cédula:</strong> {clienteSeleccionado?.identity_number || "-"}</div>

        {loadingSucursal ? (
          <p>Cargando sucursal y negocio...</p>
        ) : errorSucursal ? (
          <p className="text-red-500">{errorSucursal}</p>
        ) : sucursalSeleccionada ? (
          <>
            <div><strong>Negocio:</strong> {sucursalSeleccionada.business.nombre_comercial}</div>
            <div><strong>Nombre Legal:</strong> {sucursalSeleccionada.business.nombre_legal}</div>
            <div><strong>Teléfono:</strong> {sucursalSeleccionada.business.telefono || "-"}</div>
            <div><strong>Email:</strong> {sucursalSeleccionada.business.email || "-"}</div>
            <div><strong>Provincia:</strong> {sucursalSeleccionada.provincia || "-"}</div>
            <div><strong>Cantón:</strong> {sucursalSeleccionada.canton || "-"}</div>
            <div><strong>Sucursal:</strong> {sucursalSeleccionada.nombre}</div>
          </>
        ) : null}

        <div><strong>Cajero:</strong> {user.name || user.username}</div>
        <div><strong>Fecha:</strong> {new Date().toLocaleString()}</div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <table className="w-full mb-4 text-sm border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1 border">Código</th>
            <th className="px-2 py-1 border">Producto</th>
            <th className="px-2 py-1 border">Cantidad</th>
            <th className="px-2 py-1 border">Precio Unitario</th>
            <th className="px-2 py-1 border">Descuento</th>
            <th className="px-2 py-1 border">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {carrito.map((item, idx) => {
            const descuentoPct = Math.max(0, Math.min(item.descuento, 100));
            const subtotalItem = item.producto.precio * item.cantidad * (1 - descuentoPct / 100);
            return (
              <tr key={idx}>
                <td className="px-2 py-1 border">{item.producto.codigo}</td>
                <td className="px-2 py-1 border">{item.producto.nombre}</td>
                <td className="px-2 py-1 border">{item.cantidad}</td>
                <td className="px-2 py-1 border">₡{item.producto.precio}</td>
                <td className="px-2 py-1 border">{descuentoPct}%</td>
                <td className="px-2 py-1 border">₡{Math.round(subtotalItem)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TOTALES */}
      <div className="mb-4 text-right">
        {(() => {
          const subtotal = carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
          const totalDescuento = carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad * Math.max(0, Math.min(item.descuento, 100)) / 100, 0);
          const totalAPagar = subtotal - totalDescuento;
          return (
            <>
              <div><strong>Subtotal:</strong> ₡{subtotal}</div>
              <div><strong>Total Descuento:</strong> ₡{Math.round(totalDescuento)}</div>
              <div><strong>Impuestos:</strong> ₡0</div>
              <div className="text-lg font-bold"><strong>Total:</strong> ₡{Math.round(totalAPagar)}</div>
            </>
          );
        })()}
      </div>
{/* PAGO */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div>
    <label>Método de Pago</label>
    <select
      className="w-full border rounded px-3 py-2"
      value={metodoPago}
      onChange={(e) => setMetodoPago(e.target.value)}
    >
      <option value="Efectivo">Efectivo</option>
      <option value="Tarjeta">Tarjeta</option>
      <option value="SINPE">SINPE</option>
    </select>
  </div>

 <div>
  <label>Monto entregado</label>
  <input
    type="text"
    className="w-full border rounded px-3 py-2"
    value={montoEntregado}
    onChange={(e) => setMontoEntregado(Number(e.target.value))}
    placeholder="Ingrese el monto entregado"
  />
</div>


  <div>
    <label>Vuelto</label>
    <input
      type="number"
      className="w-full border rounded px-3 py-2 bg-gray-200"
      value={Math.max(0, montoEntregado - total)}
      disabled
    />
  </div>

<div>
  <label>Comprobante</label>
  <input
    type="text"
    className="w-full border rounded px-3 py-2 bg-gray-200"
    value={metodoPago === "Efectivo" ? "No se necesita comprobante" : comprobante}
    onChange={(e) => setComprobante(e.target.value)}
    disabled={metodoPago === "Efectivo"}
    placeholder={metodoPago === "Efectivo" ? "" : "Ingrese comprobante"}
  />
</div>

</div>

      {/* BOTONES */}
      <div className="flex justify-end gap-4">

        
{/* //se encarga de crear la factura*/}
<Button
  text="Imprimir factura"
  style="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded text-lg"
  onClick={() => {
    try {
      if (!sucursalSeleccionada) {
        window.alert("No se ha seleccionado ninguna sucursal.");
        return;
      }
      if (!clienteSeleccionado) {
        window.alert("Debe seleccionar un cliente antes de imprimir la factura.");
        return;
      }
      if (!carrito || carrito.length === 0) {
        window.alert("El carrito está vacío. No se puede generar la factura.");
        return;
      }

      const doc = new jsPDF();
      const padding = 10;
      let y = padding;

      // --- Encabezado ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(sucursalSeleccionada.business?.nombre_comercial || "N/D", padding, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Razón social: ${sucursalSeleccionada.business?.nombre_legal || "N/D"}`, padding, y); y += 5;
      doc.text(`Tel: ${sucursalSeleccionada.business?.telefono || "-"}`, padding, y); y += 5;
      doc.text(`Email: ${sucursalSeleccionada.business?.email || "-"}`, padding, y); y += 5;
      doc.text(`Provincia: ${sucursalSeleccionada.provincia || "-"}`, padding, y); y += 5;
      doc.text(`Cantón: ${sucursalSeleccionada.canton || "-"}`, padding, y); y += 5;
      doc.text(`Sucursal: ${sucursalSeleccionada.nombre || "-"}`, padding, y); y += 5;
      doc.text(`Teléfono sucursal: ${sucursalSeleccionada.telefono || "-"}`, padding, y); y += 5;
      doc.text(`Tipo de identificación negocio: ${sucursalSeleccionada.business?.tipo_identificacion || "N/A"}`, padding, y); y += 5;
      doc.text(`Número de identificación negocio: ${sucursalSeleccionada.business?.numero_identificacion || "N/A"}`, padding, y); y += 10;


      doc.setLineWidth(0.5);
      doc.line(padding, y, 200, y);
      y += 5;

      // --- Cliente y Cajero ---
      doc.setFont("helvetica", "bold");
      doc.text("Factura para:", padding, y); y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${clienteSeleccionado.name || "-"}`, padding, y); y += 5;
      doc.text(`Cédula: ${clienteSeleccionado.identity_number || "-"}`, padding, y); y += 5;
      doc.text(`Cajero: ${user.name || user.username}`, padding, y); y += 5;
      doc.text(`Fecha: ${new Date().toLocaleString()}`, padding, y); y += 10;

      doc.line(padding, y, 200, y);
      y += 5;

      // --- Tabla de productos ---
      doc.setFont("helvetica", "bold");
      const headers = ["Código", "Producto", "Cant.", "Precio", "Desc.", "Subtotal"];
      const colX = [padding, padding + 30, padding + 90, padding + 110, padding + 140, padding + 160];
      headers.forEach((h, i) => doc.text(h, colX[i], y));
      y += 5;
      doc.setLineWidth(0.1);
      doc.line(padding, y, 200, y);
      y += 2;
      doc.setFont("helvetica", "normal");

      let subtotal = 0;
      let totalDescuento = 0;

      carrito.forEach(item => {
        const descuentoPct = Math.max(0, Math.min(item.descuento || 0, 100));
        const subtotalItem = (item.producto.precio || 0) * (item.cantidad || 0);
        const descuentoItem = subtotalItem * (descuentoPct / 100);

        subtotal += subtotalItem;
        totalDescuento += descuentoItem;

        const values = [
          item.producto.codigo || "-",
          item.producto.nombre || "-",
          (item.cantidad || 0).toString(),
          `₡${(item.producto.precio || 0).toLocaleString()}`,
          `${descuentoPct}%`,
          `₡${Math.round(subtotalItem - descuentoItem).toLocaleString()}`
        ];

        values.forEach((v, i) => doc.text(v, colX[i], y));
        y += 6;
      });

      y += 2;
      doc.line(padding, y, 200, y);
      y += 5;

      // --- Totales ---
      const totalAPagar = subtotal - totalDescuento;
      doc.setFont("helvetica", "bold");
      doc.text(`Subtotal: ₡${subtotal.toLocaleString()}`, padding + 100, y); y += 6;
      doc.text(`Total Descuento: ₡${Math.round(totalDescuento).toLocaleString()}`, padding + 100, y); y += 6;
      doc.text(`Impuestos: ₡0`, padding + 100, y); y += 6;
      doc.text(`Total a pagar: ₡${Math.round(totalAPagar).toLocaleString()}`, padding + 100, y); y += 10;

      // --- Pago ---
      doc.setFont("helvetica", "normal");
      doc.text(`Método de pago: ${metodoPago}`, padding, y); y += 5;
      doc.text(`Monto entregado: ₡${montoEntregado?.toLocaleString() || "0"}`, padding, y); y += 5;
      doc.text(`Vuelto: ₡${Math.max(0, montoEntregado - totalAPagar).toLocaleString()}`, padding, y); y += 5;
      doc.text(`Comprobante: ${comprobante || "-"}`, padding, y); y += 10;

      doc.setLineWidth(0.5);
      doc.line(padding, y, 200, y);
      y += 5;

      // --- Pie de página ---
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("¡Gracias por su compra!", padding, y);

      doc.save(`Factura_${clienteSeleccionado.name || "cliente"}.pdf`);

    } catch (error) {
      console.error("Error al generar la factura:", error);
      window.alert("Ocurrió un error al generar la factura. Revisa la consola para más detalles.");
    }
  }}
/>



        <Button
  text="Finalizar"
  style="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded text-lg"
  type="submit"
/>

        <Button
          text="Cancelar"
          style="bg-gray-400 hover:bg-gray-500 text-white font-bold px-8 py-3 rounded text-lg"
          onClick={() => setFacturaModal(false)}
        />
      </div>
    </form>
  </div>
)}





              {/* Alert */}
              {alert && (
                <div
                  className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg font-semibold shadow-md ${
                    alert.type === "success"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                >
                  {alert.message}
                </div>
              )}
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
