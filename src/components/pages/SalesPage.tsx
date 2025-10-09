import React, { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { IoAddCircle, IoPersonAdd, IoPencil, IoSearch } from "react-icons/io5";
import GenerateInvoice, {
  type GenerateInvoiceRef,
} from "../ui/GenerateInvoice";

import { useRef } from "react";

// Para React + TypeScript

// Tipos
type Producto = {
  id?: number;
  codigo_producto: string;
  nombre_producto: string;
  categoria?: string;
  descripcion?: string;
  stock?: number;
  precio_compra?: number;
  precio_venta: number;
  bodega?: string;
  bodega_id?: number;
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

export default function SalesPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";
  const API_URL = import.meta.env.VITE_API_URL;
  // Estados
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [, setLotes] = useState<Lote[]>([]); //si se borra se daña
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Customer | null>(null);
  const [carrito, setCarrito] = useState<
    { producto: Producto; cantidad: number; descuento: number }[]
  >([]);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [facturaModal, setFacturaModal] = useState(false);
  // Hook de estado
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Función auxiliar
  const mostrarAlerta = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 2000); // Ocultar la alerta despues de 2 segundos
  };

  // Estados búsqueda y edición
  const [queryCliente, setQueryCliente] = useState("");
  const [queryProducto, setQueryProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editCantidad, setEditCantidad] = useState<number>(1);
  const [editDescuento, setEditDescuento] = useState<number>(0);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);

  //Facturación
  const [metodoPago, setMetodoPago] = useState<string>("Efectivo");
  const [montoEntregado, setMontoEntregado] = useState<number>(0);
  const [comprobante, setComprobante] = useState<string>("");
  const [facturaCreada, setFacturaCreada] = useState<any>(null);

  //sucursales y negocios
  const [bodegas, setBodegas] = useState<Warehouse[]>([]);
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
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [modalSucursal, setModalSucursal] = useState(true);
  const [loadingSucursal, setLoadingSucursal] = useState(false);
  const [errorSucursal, setErrorSucursal] = useState<string | null>(null);

  // Traer todas las sucursales y manejar selección por usuario
  useEffect(() => {
    const fetchSucursales = async () => {
      setLoadingSucursal(true);
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user.id; // O user.user_id según tu estructura

        const res = await fetch(`${API_URL}/api/v1/branches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar sucursales");

        const data = await res.json();

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

        // Revisar si hay sucursal guardada para este usuario
        const savedSucursal = sessionStorage.getItem(
          `sucursal_seleccionada_${userId}`
        );
        if (savedSucursal) {
          const sucursalGuardada = JSON.parse(savedSucursal);
          const existe = sucursalesFormateadas.find(
            (s) => s.sucursal_id === sucursalGuardada.sucursal_id
          );
          if (existe) {
            setSucursalSeleccionada(existe);
            setModalSucursal(false);
          } else {
            setModalSucursal(true);
          }
        } else {
          setModalSucursal(true);
        }
      } catch (err) {
        console.error(err);
        setErrorSucursal("No se pudieron cargar las sucursales");
      } finally {
        setLoadingSucursal(false);
      }
    };

    fetchSucursales();
  }, [API_URL]);

  // Fetch inicial
  useEffect(() => {
    fetch(`${API_URL}/api/v1/products`)
      .then((res) => res.json())
      .then(setProductos);

    fetch(`${API_URL}/api/v1/batch`)
      .then((res) => res.json())
      .then(setLotes);

    fetch(`${API_URL}/api/v1/warehouses`)
      .then((res) => res.json())
      .then(setBodegas);

    fetch(`${API_URL}/api/v1/customers`)
      .then((res) => res.json())
      .then(setClientes);
  }, [API_URL]);

  // Clave para localStorage
  const LOCAL_STORAGE_KEY = "venta_en_curso";

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
    ? clientes.filter(
        (c) =>
          c.name.toLowerCase().includes(queryCliente.toLowerCase()) ||
          (c.email?.toLowerCase().includes(queryCliente.toLowerCase()) ??
            false) ||
          c.identity_number.toLowerCase().includes(queryCliente.toLowerCase())
      )
    : []; // <-- antes estaba ": clientes"

  // Filtrado productos según búsqueda y sucursal
  const productosFiltrados = productos
    .filter((producto) => {
      // Si no hay sucursal seleccionada o producto no tiene bodega, no mostrarlo
      if (!sucursalSeleccionada || !producto.bodega_id) return false;
      const bodega = bodegas.find((b) => b.bodega_id === producto.bodega_id);
      // Solo mostrar si la bodega pertenece a la sucursal seleccionada
      return bodega?.sucursal_id === sucursalSeleccionada.sucursal_id;
    })
    .filter((producto) =>
      queryProducto.trim()
        ? producto.nombre_producto
            .toLowerCase()
            .includes(queryProducto.toLowerCase()) ||
          producto.codigo_producto
            .toLowerCase()
            .includes(queryProducto.toLowerCase())
        : true
    );

  // --- AGREGAR AL CARRITO ---

  const getAvailableStock = (codigo: string) => {
    const producto = productos.find((p) => p.codigo_producto === codigo);
    if (!producto) return 0;

    const enCarrito =
      carrito.find((item) => item.producto.codigo_producto === codigo)
        ?.cantidad ?? 0;
    return (producto.stock ?? 0) - enCarrito;
  };

  const agregarAlCarrito = (producto: Producto) => {
    const stockDisponible = getAvailableStock(producto.codigo_producto);
    if (stockDisponible <= 0) {
      mostrarAlerta("error", "Producto sin stock disponible");
      return;
    }

    setCarrito((prevCarrito) => {
      const idx = prevCarrito.findIndex(
        (item) => item.producto.codigo_producto === producto.codigo_producto
      );

      if (idx >= 0) {
        const nuevo = [...prevCarrito];
        nuevo[idx] = { ...nuevo[idx], cantidad: nuevo[idx].cantidad + 1 };
        return nuevo;
      }

      return [...prevCarrito, { producto, cantidad: 1, descuento: 0 }];
    });

    mostrarAlerta("success", `${producto.nombre_producto} agregado al carrito`);
    setModalOpen(false);
  };

  // --- ELIMINAR DEL CARRITO ---
  const eliminarDelCarrito = (codigo: string) => {
    setCarrito((prevCarrito) =>
      prevCarrito.filter((item) => item.producto.codigo_producto !== codigo)
    );
    mostrarAlerta("success", "Producto eliminado del carrito");
  };

  // --- INICIAR EDICIÓN ---
  const iniciarEdicion = (idx: number) => {
    setEditIdx(idx);
    setEditCantidad(carrito[idx].cantidad);
    setEditDescuento(carrito[idx].descuento);
  };

  // --- GUARDAR EDICIÓN ---
  const guardarEdicion = (idx: number) => {
    setCarrito((prevCarrito) => {
      const nuevo = [...prevCarrito];
      const item = nuevo[idx];
      if (!item) return prevCarrito;

      const stockDisponible =
        getAvailableStock(item.producto.codigo_producto) + item.cantidad;

      if (editCantidad > stockDisponible) {
        mostrarAlerta("error", "Cantidad excede stock disponible");
        return prevCarrito;
      }

      item.cantidad = editCantidad;
      item.descuento = editDescuento;
      return nuevo;
    });

    setEditIdx(null);
  };

  // Calcular totales
  const subtotal = carrito.reduce(
    (acc, item) => acc + item.producto.precio_venta * item.cantidad,
    0
  );
  const totalDescuento = carrito.reduce(
    (acc, item) =>
      acc +
      (item.producto.precio_venta * item.cantidad * (item.descuento || 0)) /
        100,
    0
  );
  const subtotalConDescuento = subtotal - totalDescuento;
  const impuestos = +(subtotalConDescuento * 0.13).toFixed(2); // 13% de impuesto
  const totalAPagar = subtotalConDescuento + impuestos;

  const vuelto =
    metodoPago === "Efectivo"
      ? Math.max(0, (montoEntregado || 0) - totalAPagar)
      : 0;

  const botonDisabled =
    (metodoPago === "Efectivo" && (montoEntregado || 0) < totalAPagar) ||
    ((metodoPago === "Tarjeta" || metodoPago === "SINPE") &&
      (!comprobante || comprobante.trim() === ""));

  // Al nivel del componente (fuera de finalizarVenta)
  const invoiceRef = useRef<GenerateInvoiceRef>(null);

  const finalizarVenta = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteSeleccionado || !sucursalSeleccionada || carrito.length === 0) {
      mostrarAlerta(
        "error",
        "Seleccione cliente, sucursal y agregue productos al carrito."
      );
      return;
    }

    try {
      // Validaciones de pago
      if (metodoPago === "Efectivo" && (montoEntregado || 0) <= 0) {
        mostrarAlerta("error", "Ingrese el monto entregado");
        return;
      }
      if (
        (metodoPago === "Tarjeta" || metodoPago === "SINPE") &&
        !comprobante.trim()
      ) {
        mostrarAlerta(
          "error",
          "Debe ingresar el comprobante para el método de pago seleccionado."
        );
        return;
      }

      // Mapear método de pago al backend
      const metodoPagoBackend =
        metodoPago === "Efectivo"
          ? "Cash"
          : metodoPago === "Tarjeta"
            ? "Card"
            : metodoPago === "SINPE"
              ? "SINPE"
              : metodoPago;

      // Validar monto suficiente si es pago en efectivo
      if (metodoPago === "Efectivo" && (montoEntregado || 0) < totalAPagar) {
        setFacturaModal(false);
        mostrarAlerta(
          "error",
          `El monto entregado es menor al total a pagar. Faltan ₡${
            totalAPagar - (montoEntregado || 0)
          }`
        );
        return;
      }

      // Preparar productos para la factura
      const productosFactura = carrito.map((item) => ({
        code: item.producto.codigo_producto,
        name: item.producto.nombre_producto,
        quantity: item.cantidad,
        discount: item.descuento || 0,
        price: item.producto.precio_venta,
      }));

      // Preparar datos de la factura
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
        business_id_type:
          sucursalSeleccionada.business.tipo_identificacion || "N/A",
        business_id_number:
          sucursalSeleccionada.business.numero_identificacion || "N/A",
        cashier_name: user?.name || "N/A",
        date: new Date(),
        products: productosFactura,
        subtotal,
        total_discount: totalDescuento,
        taxes: impuestos,
        total: totalAPagar,
        amount_paid:
          metodoPagoBackend === "Cash" ? montoEntregado : totalAPagar,
        change: vuelto,
        payment_method: metodoPagoBackend,
        receipt: metodoPagoBackend === "Cash" ? "N/A" : comprobante || "",
      };

      // Enviar factura al backend
      const response = await fetch(`${API_URL}/api/v1/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(facturaData),
      });

      const responseData = await response.json();

      // Restar stock de productos
      await Promise.all(
        carrito.map(async (item) => {
          const productoRes = await fetch(
            `${API_URL}/api/v1/products/${item.producto.id}`
          );
          const productoData = await productoRes.json();
          const nuevoStock = productoData.stock - item.cantidad;

          await fetch(`${API_URL}/api/v1/products/${item.producto.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock: nuevoStock }),
          });
        })
      );

      // Mensaje de éxito
      mostrarAlerta(
        "success",
        `Factura #${responseData?.id} creada exitosamente. ${
          vuelto > 0 ? `Vuelto: ₡${vuelto.toLocaleString()}` : ""
        }`
      );

    // Guardar la factura creada para usar en PDF
setFacturaCreada(responseData);

// Generar PDF automáticamente
invoiceRef.current?.generarFactura();

// Cerrar modal después de generar la factura
setFacturaModal(false);


      // Limpiar estados del carrito
      setCarrito([]);
      setClienteSeleccionado(null);
      setMontoEntregado(0);
      setComprobante("");
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      // Actualizar lista de productos
      const updatedProducts = await fetch(`${API_URL}/api/v1/products`).then(
        (res) => res.json()
      );
      setProductos(updatedProducts);
    } catch (error: any) {
      console.error("Error en finalizarVenta:", error);
      mostrarAlerta(
        "error",
        "Ocurrió un error al procesar la venta. Por favor intente nuevamente."
      );
    }
  };

  const [loadingFactura, setLoadingFactura] = useState(false);

useEffect(() => {
  if (loadingFactura && facturaCreada?.id) {
    // ⚡ Solo genera factura cuando ya existe la id
    invoiceRef.current?.generarFactura();
    setLoadingFactura(false);
  }
}, [facturaCreada, loadingFactura]);


  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "vendedor"]}>
      <Container
        page={
          <div className="flex">
            <SideBar role={userRole} />
            <div className="w-full pl-10 pt-10 flex gap-6">
              <div className="w-3/2 flex flex-col pl-10">
                <h1 className="text-2xl font-bold mb-6">Punto de venta</h1>

                {/* Selector de cliente */}
                <div className="mb-6">
                  {/* Input con lupa */}
                  <div className="relative mb-2">
                    <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                    <input
                      type="text"
                      placeholder="Buscar cliente por cédula..."
                      className="border rounded pl-10 pr-3 py-2 w-full"
                      value={queryCliente}
                      onChange={(e) => setQueryCliente(e.target.value)}
                    />
                  </div>

                  {/* Mostrar dropdown solo si hay texto en el input */}
                  {queryCliente && (
                    <div className="max-h-40 overflow-y-auto border rounded bg-white">
                      {/* Lista de clientes filtrados */}
                      {clientesFiltrados
                        .filter(
                          (cliente) =>
                            cliente.name
                              .toLowerCase()
                              .includes(queryCliente.toLowerCase()) ||
                            (cliente.identity_number ?? "").includes(
                              queryCliente
                            )
                        )
                        .map((cliente) => (
                          <div
                            key={cliente.customer_id}
                            className={`px-4 py-2 cursor-pointer hover:bg-gris-claro ${
                              clienteSeleccionado?.customer_id ===
                              cliente.customer_id
                                ? "bg-gris-oscuro font-bold"
                                : ""
                            }`}
                            onClick={() => {
                              setClienteSeleccionado(cliente);
                              setQueryCliente(""); // 🚀 Limpiar input al seleccionar
                            }}
                          >
                            {cliente.name}
                            {cliente.identity_number && (
                              <span className="text-gray-500 ml-2">
                                Cédula: {cliente.identity_number}
                              </span>
                            )}
                          </div>
                        ))}

                      {/* Mensaje si no hay clientes */}
                      {clientesFiltrados.filter(
                        (cliente) =>
                          cliente.name
                            .toLowerCase()
                            .includes(queryCliente.toLowerCase()) ||
                          (cliente.identity_number ?? "").includes(queryCliente)
                      ).length === 0 && (
                        <p className="px-4 py-2 text-red-500 text-sm">
                          No existe ningún cliente con ese nombre o cédula.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cliente seleccionado */}
                  {clienteSeleccionado && (
                    <p className="mt-2 font-bold text-azul-hover">
                      Cliente seleccionado: {clienteSeleccionado.name} (
                      {clienteSeleccionado.identity_number})
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                    <Button
                      style="bg-verde-claro hover:bg-verde-oscuro text-white font-bold px-5 py-2 rounded-lg shadow-md transition-transform duration-150 transform flex items-center justify-center cursor-pointer"
                      onClick={() => (window.location.href = "/customer")}
                    >
                      <IoPersonAdd className="mr-2" size={18} /> Nuevo cliente
                    </Button>

                    <Button
                      style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-5 py-2 rounded-lg shadow-md transition-transform duration-150 transform flex items-center justify-center cursor-pointer"
                      onClick={() =>
                        setClienteSeleccionado({
                          customer_id: 0,
                          name: "Cliente genérico",
                          identity_number: "N/A",
                        })
                      }
                    >
                      Cliente genérico
                    </Button>
                  </div>

                  {/* Botón para cambiar sucursal */}
                  {sucursalSeleccionada && !modalSucursal && (
                    <div className="w-full flex flex-row md:items-center items-start mb-6 gap-6 mt-4">
                      <button
                        className="px-4 py-2 bg-azul-medio hover:bg-azul-hover text-white font-bold rounded-lg shadow transition-colors duration-200 cursor-pointer"
                        onClick={() => setModalSucursal(true)}
                      >
                        Cambiar sucursal
                      </button>
                      <span className="text-black font-semibold text-left md:text-right">
                        Sucursal actual: {sucursalSeleccionada.nombre} -{" "}
                        {sucursalSeleccionada.business.nombre_comercial}
                      </span>
                    </div>
                  )}
                </div>

              {/* Navegador de productos */}
<div className="shadow-md rounded-lg p-4 mb-6">
  <h2 className="text-lg font-bold mb-2">Productos</h2>

  {/* Input con lupa */}
  <div className="relative mb-2">
    <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
    <input
      type="text"
      placeholder="Buscar producto por código o nombre..."
      className="border rounded pl-10 pr-3 py-2 w-full"
      value={queryProducto}
      onChange={(e) => setQueryProducto(e.target.value)}
    />
  </div>

  {/* Mostrar dropdown solo si hay texto en el input */}
  {queryProducto && (
    <div className="max-h-40 overflow-y-auto border rounded bg-white">
      {productos
        .filter((producto) => {
          const q = queryProducto.toLowerCase();
          return (
            producto.codigo_producto.toLowerCase().includes(q) ||
            producto.nombre_producto.toLowerCase().includes(q)
          );
        })
        .map((producto) => {
          const getAvailableStock = (codigo: string) => {
            const itemEnCarrito = carrito.find(
              (i) => i.producto.codigo_producto === codigo
            );
            return (producto.stock ?? 0) - (itemEnCarrito?.cantidad ?? 0);
          };
          const stockDisponible = getAvailableStock(producto.codigo_producto);

          return (
            <div
              key={producto.codigo_producto}
              className={`px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-gris-ultra-claro ${
                productoSeleccionado?.codigo_producto === producto.codigo_producto
                  ? "bg-white font-bold"
                  : ""
              }`}
              onClick={() => {
                setProductoSeleccionado(producto);
                setQueryProducto(""); // Limpiar input al seleccionar
              }}
            >
              <div className="flex-1">
                <span>{producto.nombre_producto}</span>{" "}
                <span className="text-gray-500">({producto.codigo_producto})</span>
              </div>

              <div
                className={`ml-4 px-2 py-1 rounded text-sm font-medium ${
                  stockDisponible > 0
                    ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro border"
                    : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
                }`}
              >
                Stock: {stockDisponible}
              </div>

              <Button
                style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-3 py-1 rounded ml-4 flex items-center"
                onClick={() => setModalOpen(true)}
                disabled={stockDisponible <= 0}
              >
                <IoAddCircle className="mr-1" /> Añadir
              </Button>
            </div>
          );
        })}

                      {productosFiltrados.length === 0 && (
                        <p className="px-4 py-2 text-rojo-claro text-sm">
                          No existe ningún producto con ese código.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tabla carrito */}
                <div className="shadow-md rounded-lg mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                          Código
                        </th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                          Nombre
                        </th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                          Cantidad
                        </th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                          Precio
                        </th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                          Descuento %
                        </th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                          Descuento ₡
                        </th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                          Total
                        </th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {carrito.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-4">
                            Sin productos
                          </td>
                        </tr>
                      ) : (
                        carrito.map((item, idx) => {
                          const descuentoPct = Math.max(
                            0,
                            Math.min(item.descuento, 100)
                          );
                          const totalItem =
                            item.producto.precio_venta *
                            item.cantidad *
                            (1 - descuentoPct / 100);
                          const descuentoColones = Math.round(
                            (item.producto.precio_venta *
                              item.cantidad *
                              descuentoPct) /
                              100
                          );

                          return (
                            <tr key={idx}>
                              <td className="px-3 py-3">
                                {item.producto.codigo_producto}
                              </td>
                              <td className="px-3 py-3">
                                {item.producto.nombre_producto}
                              </td>
                              <td className="px-3 py-3">
                                {editIdx === idx ? (
                                  <input
                                    type="number"
                                    min={1}
                                    value={editCantidad}
                                    onChange={(e) => {
                                      const value = Math.max(
                                        1,
                                        Number(e.target.value)
                                      );
                                      setEditCantidad(value);
                                    }}
                                    className="border rounded px-2 py-1 w-16"
                                  />
                                ) : (
                                  item.cantidad
                                )}
                              </td>
                              <td className="px-3 py-3">
                                {item.producto.precio_venta}
                              </td>
                              <td className="px-3 py-3">
                                {editIdx === idx ? (
                                  <select
                                    value={editDescuento}
                                    onChange={(e) =>
                                      setEditDescuento(Number(e.target.value))
                                    }
                                    className="border rounded px-2 py-1 w-20"
                                  >
                                    {Array.from(
                                      { length: 21 },
                                      (_, i) => i * 5
                                    ).map((pct) => (
                                      <option key={pct} value={pct}>
                                        {pct}%
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  `${descuentoPct}%`
                                )}
                              </td>
                              <td className="px-3 py-3">
                                ₡{descuentoColones.toLocaleString()}
                              </td>
                              <td className="px-3 py-3">
                                {Math.round(totalItem)}
                              </td>
                              <td className="px-3 py-3 flex gap-2">
                                {editIdx === idx ? (
                                  <>
                                    <Button
                                      text="Guardar"
                                      style="bg-verde-claro text-white px-2 py-1 rounded"
                                      onClick={() => guardarEdicion(idx)}
                                    />
                                    <Button
                                      text="Cancelar"
                                      style="bg-gris-claro text-white px-2 py-1 rounded"
                                      onClick={() => setEditIdx(null)}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      text="Editar"
                                      style="bg-amarillo-claro text-white px-2 py-1 rounded flex items-center gap-1"
                                      onClick={() => iniciarEdicion(idx)}
                                    >
                                      <IoPencil />
                                    </Button>
                                    <Button
                                      text="Eliminar"
                                      style="bg-rojo-claro text-white px-2 py-1 rounded"
                                      onClick={() =>
                                        eliminarDelCarrito(
                                          item.producto.codigo_producto
                                        )
                                      }
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

                  {/* Aplicar mismo descuento a todo */}
                  {carrito.length > 0 && (
                    <div className="mt-1  py-5 px-5 flex justify-end gap-2 bg-gris-ultra-claro">
                      <label className="text-gray-700 font-semibold">
                        Aplicar mismo descuento a todo:
                      </label>
                      <select
                        onChange={(e) => {
                          const pct = Number(e.target.value);
                          setCarrito((prev) =>
                            prev.map((item) => ({ ...item, descuento: pct }))
                          );
                        }}
                        className="border rounded px-2 py-1 w-20"
                        defaultValue={0}
                      >
                        {Array.from({ length: 21 }, (_, i) => i * 5).map(
                          (pct) => (
                            <option key={pct} value={pct}>
                              {pct}%
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}
                </div>

                {/* Pie carrito */}
                <div className="flex justify-end items-center bg-azul-oscuro text-white px-10 py-4 rounded-lg">
                  <div className="flex-1">
                    {/* Subtotal */}
                    <div>
                      Costo antes de descuento: ₡
                      {carrito
                        .reduce(
                          (acc, item) =>
                            acc + item.producto.precio_venta * item.cantidad,
                          0
                        )
                        .toLocaleString()}
                    </div>

                    {/* Descuento total en colones */}
                    <div>
                      Descuento total: ₡
                      {carrito
                        .reduce(
                          (acc, item) =>
                            acc +
                            (item.producto.precio_venta *
                              item.cantidad *
                              Math.max(0, Math.min(item.descuento, 100))) /
                              100,
                          0
                        )
                        .toLocaleString()}
                    </div>

                    {/* Impuestos calculados al 13% */}
                    <div>
                      Impuestos: ₡
                      {Math.round(
                        (carrito.reduce(
                          (acc, item) =>
                            acc + item.producto.precio_venta * item.cantidad,
                          0
                        ) -
                          carrito.reduce(
                            (acc, item) =>
                              acc +
                              (item.producto.precio_venta *
                                item.cantidad *
                                Math.max(0, Math.min(item.descuento, 100))) /
                                100,
                            0
                          )) *
                          0.13
                      ).toLocaleString()}
                    </div>

                    {/* Total a pagar */}
                    <div className="text-lg font-bold">
                      Total a pagar: ₡
                      {Math.round(
                        (carrito.reduce(
                          (acc, item) =>
                            acc + item.producto.precio_venta * item.cantidad,
                          0
                        ) -
                          carrito.reduce(
                            (acc, item) =>
                              acc +
                              (item.producto.precio_venta *
                                item.cantidad *
                                Math.max(0, Math.min(item.descuento, 100))) /
                                100,
                            0
                          )) *
                          1.13
                      ).toLocaleString()}
                    </div>
                  </div>

                  <Button
                    text="Pagar"
                    style="bg-azul-medio hover:bg-azul-hover text-white px-8 py-3 rounded text-lg font-bold cursor-pointer"
                    onClick={() => setFacturaModal(true)}
                    disabled={carrito.length === 0 || !clienteSeleccionado}
                  />
                </div>
              </div>

              <div className="w-1/3"></div>

              {modalOpen && productoSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                    <h2 className="text-xl font-bold mb-4">Añadir producto</h2>
                    <p>
                      <strong>Código:</strong>{" "}
                      {productoSeleccionado.codigo_producto}
                    </p>
                    <p>
                      <strong>Nombre:</strong>{" "}
                      {productoSeleccionado.nombre_producto}
                    </p>
                    <p>
                      <strong>Precio:</strong> ₡
                      {productoSeleccionado.precio_venta}
                    </p>
                    <p>
                      <strong>Stock disponible:</strong>{" "}
                      {getAvailableStock(productoSeleccionado.codigo_producto)}
                    </p>

                    {/* Input cantidad */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Cantidad:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={getAvailableStock(
                          productoSeleccionado.codigo_producto
                        )}
                        value={cantidadSeleccionada}
                        onChange={(e) =>
                          setCantidadSeleccionada(
                            Math.min(
                              getAvailableStock(
                                productoSeleccionado.codigo_producto
                              ),
                              Math.max(1, Number(e.target.value))
                            )
                          )
                        }
                        className="border rounded px-3 py-2 w-24 mt-1"
                      />
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                      <Button
                        style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-4 py-2 rounded flex items-center gap-1"
                        onClick={() => {
                          // Llamamos agregarAlCarrito N veces
                          for (let i = 0; i < cantidadSeleccionada; i++) {
                            agregarAlCarrito(productoSeleccionado);
                          }
                          setModalOpen(false);
                          setCantidadSeleccionada(1); // reset
                        }}
                        disabled={
                          getAvailableStock(
                            productoSeleccionado.codigo_producto
                          ) <= 0
                        }
                      >
                        <IoAddCircle /> Agregar
                      </Button>
                      <Button
                        style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold px-4 py-2 rounded"
                        onClick={() => {
                          setModalOpen(false);
                          setCantidadSeleccionada(1); // reset
                        }}
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
                    <h2 className="text-xl font-bold mb-4 text-center">
                      Seleccione la sucursal en la cual está trabajando
                    </h2>

                    <div className="flex flex-col gap-3">
                      {sucursales.map((sucursal) => (
                        <button
                          key={sucursal.sucursal_id}
                          className="w-full px-4 py-2 bg-azul-medio hover:bg-azul-hover text-white rounded font-bold cursor-pointer"
                          onClick={() => {
                            const user = JSON.parse(
                              localStorage.getItem("user") || "{}"
                            );
                            const userId = user.id;
                            // Guardar sucursal en sessionStorage por usuario
                            sessionStorage.setItem(
                              `sucursal_seleccionada_${userId}`,
                              JSON.stringify(sucursal)
                            );
                            setSucursalSeleccionada(sucursal);
                            setModalSucursal(false);
                          }}
                        >
                          {sucursal.nombre} -{" "}
                          {sucursal.business.nombre_comercial}
                        </button>
                      ))}
                    </div>

                    {sucursales.length === 0 && (
                      <p className="text-red-500 mt-4 text-center">
                        No hay sucursales disponibles
                      </p>
                    )}

                    {/* Botones adicionales */}
                    <div className="flex justify-between mt-6">
                      <button
                        className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        onClick={() => setModalSucursal(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="bg-verde-claro hover:bg-verde-oscuro text-white font-bold px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
                        onClick={() => (window.location.href = "/Branches")}
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
                    <h2 className="text-2xl font-bold mb-6 text-center">
                      Proceso de facturación
                    </h2>

                    {/* CLIENTE, SUCURSAL Y USUARIO */}
                    <div className="mb-4">
                      <div>
                        <strong>Cliente:</strong>{" "}
                        {clienteSeleccionado?.name || "-"}
                      </div>
                      <div>
                        <strong>Cédula:</strong>{" "}
                        {clienteSeleccionado?.identity_number || "-"}
                      </div>

                      {loadingSucursal ? (
                        <p>Cargando sucursal y negocio...</p>
                      ) : errorSucursal ? (
                        <p className="text-red-500">{errorSucursal}</p>
                      ) : sucursalSeleccionada ? (
                        <>
                          <div>
                            <strong>Negocio:</strong>{" "}
                            {sucursalSeleccionada.business.nombre_comercial}
                          </div>
                          <div>
                            <strong>Nombre Legal:</strong>{" "}
                            {sucursalSeleccionada.business.nombre_legal}
                          </div>
                          <div>
                            <strong>Teléfono:</strong>{" "}
                            {sucursalSeleccionada.business.telefono || "-"}
                          </div>
                          <div>
                            <strong>Email:</strong>{" "}
                            {sucursalSeleccionada.business.email || "-"}
                          </div>
                          <div>
                            <strong>Provincia:</strong>{" "}
                            {sucursalSeleccionada.provincia || "-"}
                          </div>
                          <div>
                            <strong>Cantón:</strong>{" "}
                            {sucursalSeleccionada.canton || "-"}
                          </div>
                          <div>
                            <strong>Sucursal:</strong>{" "}
                            {sucursalSeleccionada.nombre}
                          </div>
                        </>
                      ) : null}

                      <div>
                        <strong>Cajero:</strong> {user.name || user.username}
                      </div>
                      <div>
                        <strong>Fecha:</strong> {new Date().toLocaleString()}
                      </div>
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
                          const descuentoPct = Math.max(
                            0,
                            Math.min(item.descuento || 0, 100)
                          );
                          const subtotalItem =
                            item.producto.precio_venta *
                            item.cantidad *
                            (1 - descuentoPct / 100);
                          return (
                            <tr key={idx}>
                              <td className="px-2 py-1 border">
                                {item.producto.codigo_producto}
                              </td>
                              <td className="px-2 py-1 border">
                                {item.producto.nombre_producto}
                              </td>
                              <td className="px-2 py-1 border">
                                {item.cantidad}
                              </td>
                              <td className="px-2 py-1 border">
                                ₡{item.producto.precio_venta}
                              </td>
                              <td className="px-2 py-1 border">
                                {descuentoPct}%
                              </td>
                              <td className="px-2 py-1 border">
                                ₡{Math.round(subtotalItem)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* TOTALES */}
                    {(() => {
                      const subtotal = carrito.reduce(
                        (acc, item) =>
                          acc + item.producto.precio_venta * item.cantidad,
                        0
                      );
                      const totalDescuento = carrito.reduce(
                        (acc, item) =>
                          acc +
                          (item.producto.precio_venta *
                            item.cantidad *
                            (item.descuento || 0)) /
                            100,
                        0
                      );
                      const subtotalConDescuento = subtotal - totalDescuento;
                      const impuestos = +(subtotalConDescuento * 0.13).toFixed(
                        2
                      ); // 13% de impuestos
                      const total = subtotalConDescuento + impuestos;
                      const mostrarVuelto = metodoPago === "Efectivo";
                      const vuelto = mostrarVuelto
                        ? Math.max(0, (montoEntregado || 0) - total)
                        : 0;

                      return (
                        <div className="mb-4 text-right">
                          <div>
                            <strong>Subtotal:</strong> ₡{subtotal}
                          </div>
                          <div>
                            <strong>Total Descuento:</strong> ₡
                            {Math.round(totalDescuento)}
                          </div>
                          <div>
                            <strong>Impuestos:</strong> ₡{impuestos}
                          </div>
                          <div className="text-lg font-bold">
                            <strong>Total:</strong> ₡{Math.round(total)}
                          </div>

                          {/* VUELTO */}
                          {mostrarVuelto && (
                            <div className="mt-4 text-2xl font-extrabold text-verde-claro">
                                     <strong>Vuelto:</strong> ₡{vuelto.toFixed(2)}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {/* MÉTODO DE PAGO Y COMPROBANTE - Apilado */}
                    <div className="flex flex-col gap-4 mb-6">
                      {/* Método de Pago */}
                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">
                          Método de Pago
                        </label>
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

                      {/* Monto entregado o Comprobante */}
                      {metodoPago === "Efectivo" && (
                        <div className="flex flex-col">
                          <label className="font-semibold mb-1">
                            Monto entregado
                          </label>
                          <input
                            type="number"
                            className="w-full border rounded px-3 py-2"
                            value={montoEntregado}
                            onChange={(e) =>
                              setMontoEntregado(Number(e.target.value))
                            }
                            placeholder="Ingrese el monto entregado"
                          />
                        </div>
                      )}

                      {(metodoPago === "Tarjeta" || metodoPago === "SINPE") && (
                        <div className="flex flex-col">
                          <label className="font-semibold mb-1">
                            {metodoPago === "Tarjeta"
                              ? "Comprobante / Voucher de tarjeta"
                              : "Comprobante de transferencia / SINPE"}
                          </label>
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={comprobante}
                            onChange={(e) => setComprobante(e.target.value)}
                            placeholder={
                              metodoPago === "Tarjeta"
                                ? "Ingrese el voucher o comprobante de la tarjeta"
                                : "Ingrese el comprobante de la transferencia o SINPE"
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-4">
                      {/* Componente GenerateInvoice oculto */}
                      <div style={{ display: "none" }}>
                        <GenerateInvoice
                          ref={invoiceRef}
                          sucursalSeleccionada={sucursalSeleccionada}
                          clienteSeleccionado={clienteSeleccionado}
                          carrito={carrito}
                          user={user}
                          metodoPago={metodoPago}
                          montoEntregado={montoEntregado}
                          comprobante={comprobante}
                          facturaCreada={facturaCreada}
                        />
                      </div>

                      {/* Botón Finalizar: crea factura en backend y genera PDF */}
                      <Button
                        text="Finalizar"
                        disabled={botonDisabled}
                        onClick={() => {}}
                        style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold px-8 py-3 rounded text-lg w-36 cursor-pointer"
                      />

                      <Button
                        text="Cancelar"
                        onClick={() => setFacturaModal(false)}
                        style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-8 py-3 rounded text-lg w-36 cursor-pointer"
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
                      ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro border"
                      : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
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
