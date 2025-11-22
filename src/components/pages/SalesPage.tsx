import React, { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";

import Container from "../ui/Container";
import type { GenerateInvoiceRef } from "../ui/SaleComponents/GenerateInvoice";
import { FaCashRegister } from "react-icons/fa";
import { useRef } from "react";
import CustomerSelector from "../ui/SaleComponents/CustomerSelector";
import ProductSelector from "../ui/SaleComponents/ProductSelector";
import CartTable from "../ui/SaleComponents/CartTable";
import InfoIcon from "../ui/InfoIcon";

export type Producto = {
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
interface CartItemType {
  producto: Producto;
  cantidad: number;
  descuento: number;
  infoPromo?:
    | string
    | { id: number; descripcion: string; cantidadAplicada: number };
}

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
  id_type?: string;
};
import type { Caja, Warehouse } from "../../types/salePage";
import AddProductModal from "../ui/SaleComponents/AddProductModal";
import SucursalModal from "../ui/SaleComponents/SucursalModal";
import FacturaModal from "../ui/SaleComponents/FacturaModal";
import CashRegisterModal from "../ui/SaleComponents/CashRegisterModal";
import { generateInvoiceXml } from "../../services/invoice.service";

export default function SalesPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

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
  const [modalCaja, setModalCaja] = useState(false);
  const [cajaSeleccionada, setCajaSeleccionada] = useState<Caja | null>(null);
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
  // Tipo de documento: auto (decide según cliente), 04 (tiquete), 01 (factura)
  const [documentType, setDocumentType] = useState<'auto' | '04' | '01'>('auto');

  //sucursales y negocios
  const [bodegas, setBodegas] = useState<Warehouse[]>([]);
  // Definir los tipos completos
  interface Business {
    negocio_id?: number;
    nombre_comercial: string;
    nombre_legal: string;
    telefono: string;
    email: string;
    tipo_identificacion: string;
    numero_identificacion: string;
    logo?: string; // ← agregado
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
            negocio_id: s.business.negocio_id || null,
            nombre_comercial: s.business.nombre_comercial || "-",
            nombre_legal: s.business.nombre_legal || "-",
            telefono: s.business.telefono || "-",
            email: s.business.email || "-",
            tipo_identificacion: s.business.tipo_identificacion || "-",
            numero_identificacion: s.business.numero_identificacion || "-",
            logo: s.business.logo || "", // <--- agregar aquí
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

  // Recuperar caja guardada al iniciar la página o cambiar de sucursal
  useEffect(() => {
    if (!sucursalSeleccionada) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;
    const sucursalId = sucursalSeleccionada.sucursal_id;

    const savedCaja = sessionStorage.getItem(
      `caja_seleccionada_${userId}_${sucursalId}`
    );
    if (savedCaja) {
      setCajaSeleccionada(JSON.parse(savedCaja));
    } else {
      setCajaSeleccionada(null);
    }
  }, [sucursalSeleccionada]);

  // Guardar caja cada vez que cambie
  useEffect(() => {
    if (!cajaSeleccionada || !sucursalSeleccionada) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;
    const sucursalId = sucursalSeleccionada.sucursal_id;

    sessionStorage.setItem(
      `caja_seleccionada_${userId}_${sucursalId}`,
      JSON.stringify(cajaSeleccionada)
    );
  }, [cajaSeleccionada, sucursalSeleccionada]);

  // Mantener tu validación actual por seguridad
  useEffect(() => {
    if (cajaSeleccionada && sucursalSeleccionada) {
      if (cajaSeleccionada.sucursal_id !== sucursalSeleccionada.sucursal_id) {
        setCajaSeleccionada(null);
        mostrarAlerta(
          "error",
          "La caja seleccionada no pertenece a esta sucursal. Debe elegir una nueva caja."
        );
      }
    }
  }, [sucursalSeleccionada]);

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

  // --- AGREGAR AL CARRITO CON CANTIDAD SELECCIONADA ---
  const agregarAlCarritoConCantidad = (
    producto: Producto,
    cantidad: number
  ) => {
    for (let i = 0; i < cantidad; i++) {
      agregarAlCarrito(producto); // reutiliza tu función existente
    }
  };

  const obtenerCajaUsuario = async () => {
    if (!sucursalSeleccionada) return null;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/v1/cash-registers/active-user/${sucursalSeleccionada.sucursal_id}/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al obtener la caja");

      return data.caja || null; // null si el usuario no tiene caja abierta
    } catch (err: any) {
      mostrarAlerta("error", err.message);
      return null;
    }
  };

  // Al nivel del componente (fuera de finalizarVenta)
  const invoiceRef = useRef<GenerateInvoiceRef>(null);
  const [loadingFactura, setLoadingFactura] = useState(false);
  const [procesandoVenta, setProcesandoVenta] = useState(false);

  const finalizarVenta = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    setProcesandoVenta(true);
    try {
      if (
        !clienteSeleccionado ||
        !sucursalSeleccionada ||
        carrito.length === 0
      ) {
        mostrarAlerta(
          "error",
          "Seleccione cliente, sucursal y agregue productos al carrito."
        );
        return;
      }

      // Validación: si usuario selecciona factura (01) y cliente es genérico
      const isGenericClient = clienteSeleccionado.identity_number === 'N/A' || clienteSeleccionado.customer_id === 0;
      if (documentType === '01' && isGenericClient) {
        mostrarAlerta('error', 'Para generar una factura electrónica (01) seleccione un cliente real, no genérico.');
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

        // Obtener caja del usuario logeado en la sucursal actual
        const cajaUsuario = await obtenerCajaUsuario();

        if (!cajaUsuario && metodoPago === "Efectivo") {
          mostrarAlerta(
            "error",
            "No tiene una caja abierta en esta sucursal. Por favor abra una para registrar ventas en efectivo."
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

        // --- Aplicar promociones antes de armar factura ---
        await Promise.all(
          carrito.map(async (item: CartItemType) => {
            const tienePromoValida =
              item.descuento > 0 &&
              item.infoPromo !== undefined &&
              (typeof item.infoPromo === "string" ||
                typeof item.infoPromo === "object");

            if (tienePromoValida) {
              try {
                const token = localStorage.getItem("token");
                await fetch(`${API_URL}/api/v1/promotions/reduce-stock`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({
                    product_id: item.producto.id,
                    quantity: item.cantidad,
                  }),
                });
              } catch (error) {
                console.warn(
                  "No se pudo reducir la promoción para el producto:",
                  item.producto.codigo_producto,
                  error
                );
              }
            }
          })
        );

        // Preparar productos para la factura
        const productosFactura = carrito.map((item) => ({
          code: item.producto.codigo_producto,
          name: item.producto.nombre_producto,
          quantity: item.cantidad,
          discount: item.descuento || 0,
          price: item.producto.precio_venta,
        }));

        // Preparar datos de la factura
        const resolvedDocumentType: '01' | '04' = documentType === 'auto'
          ? (isGenericClient ? '04' : '01')
          : documentType;

        const maybeCustomerIdType = (resolvedDocumentType === '01' && !isGenericClient)
          ? (clienteSeleccionado.id_type || '01')
          : undefined; // Tickets no requieren receptor

        const facturaData: Record<string, any> = {
          customer_name: clienteSeleccionado.name,
          customer_identity_number: clienteSeleccionado.identity_number,
          customer_email: clienteSeleccionado.email || undefined,
          customer_phone: clienteSeleccionado.phone || undefined,
          branch_name: sucursalSeleccionada.nombre,
          business_name: sucursalSeleccionada.business.nombre_comercial,
          business_legal_name: sucursalSeleccionada.business.nombre_legal,
          business_phone: sucursalSeleccionada.business.telefono || "-",
          business_email: sucursalSeleccionada.business.email || "-",
          business_logo: sucursalSeleccionada.business.logo || "", // <--- aquí
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
          document_type: resolvedDocumentType,
        };
        if (maybeCustomerIdType) facturaData.customer_id_type = maybeCustomerIdType;

        const creationEndpoint = resolvedDocumentType === '04' ? 'tickets' : 'facturas';

        // Enviar comprobante al backend usando alias
        const response = await fetch(`${API_URL}/api/v1/${creationEndpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
          },
          body: JSON.stringify(facturaData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error al crear comprobante');
        }
        const responseData = await response.json();
        // Asegurar que el tipo de documento esté disponible en la respuesta almacenada
        if (!responseData.document_type) {
          (responseData as any).document_type = resolvedDocumentType;
        }

        // Guardar la factura creada para usar en PDF
        setFacturaCreada(responseData);
        setLoadingFactura(true); //  dispara useEffect para generar PDF solo cuando tengamos ID

        // Intenta generar el XML y mostrar confirmación
        try {
          await generateInvoiceXml(responseData.id, resolvedDocumentType);
          mostrarAlerta("success", "XML generado correctamente");
        } catch (err: any) {
          console.error("Error al generar XML:", err);
          mostrarAlerta(
            "error",
            `Error al generar el XML${err?.message ? ": " + err.message : ""}`
          );
        }

        // --- Actualizar caja según método de pago ---
        if (!cajaSeleccionada?.id) {
          mostrarAlerta(
            "error",
            "No se pudo identificar la caja para actualizar el monto"
          );
        } else {
          try {
            const payload: any = {
              id: cajaSeleccionada.id, // ID de la caja seleccionada
              payment_method: metodoPagoBackend, //  Tipo de pago (Cash, Card, SINPE, etc.)
            };

            // Si es efectivo, incluye monto entregado y vuelto
            if (metodoPagoBackend === "Cash") {
              payload.amount_received = Number(montoEntregado);
              payload.change_given = Number(vuelto);
            } else {
              // Si no es efectivo, registra solo el total pagado
              payload.amount_received = Number(totalAPagar);
              payload.change_given = 0;
            }

            const cajaResponse = await fetch(
              `${API_URL}/api/v1/cash-register/addCashSale`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(payload),
              }
            );

            const cajaData = await cajaResponse.json();

            if (!cajaResponse.ok) {
              mostrarAlerta(
                "error",
                cajaData.message || "Error al actualizar la caja"
              );
            } else {
              console.log("Caja actualizada:", cajaData.data);
              mostrarAlerta("success", "Caja actualizada correctamente");
            }
          } catch (error: any) {
            console.error("Error al actualizar caja:", error);
            mostrarAlerta("error", "No se pudo actualizar la caja");
          }
        }

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

        //Cerrar modal
        // setFacturaModal(false);

        // Limpiar estados del carrito
        setCarrito([]);
        setClienteSeleccionado(null);
        setMontoEntregado(0);
        setComprobante("");
        setDocumentType('auto');
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
    } finally {
      //  desactivar bloqueo SOLO cuando todo terminó (éxito o error)
      setProcesandoVenta(false);
    }
  };
  // useEffect para generar PDF cuando ya exista la factura y su ID
  useEffect(() => {
    if (loadingFactura && facturaCreada?.id) {
      invoiceRef.current?.generarFactura();
      setLoadingFactura(false);
    }
  }, [facturaCreada, loadingFactura]);
  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "vendedor"]}>
      <Container
        page={
          <div className="w-full flex justify-center px-2 md:px-10 overflow-x-hidden">
            <div className="w-full pl-4 pt-10">
              {/* Contenido principal */}
              <div className="flex-1 flex flex-col">
                <h1 className="text-2xl font-bold mb-6">
                  Punto de venta
                  <InfoIcon
                    title="Información Punto de Venta"
                    description="En esta sección puedes seleccionar clientes, 
                agregar productos al carrito, y finalizar ventas generando facturas.
                 Asegúrate de tener una caja abierta para ventas en efectivo."
                  />
                </h1>

                {/* Selector de clientes */}
                <CustomerSelector
                  queryCliente={queryCliente}
                  setQueryCliente={setQueryCliente}
                  clientesFiltrados={clientesFiltrados}
                  clienteSeleccionado={clienteSeleccionado}
                  setClienteSeleccionado={setClienteSeleccionado}
                  sucursalSeleccionada={sucursalSeleccionada}
                  modalSucursal={modalSucursal}
                  setModalSucursal={setModalSucursal}
                  documentType={documentType}
                  setDocumentType={setDocumentType}
                />

                <div className="my-2">
                  <button
                    className="bg-amarillo-claro hover:bg-amarillo-oscuro text-white font-bold px-5 py-2 rounded-lg shadow-md transition-transform duration-150 
                           transform flex items-center justify-center cursor-pointer w-full sm:w-auto"
                    onClick={() => setModalCaja(true)}
                  >
                    <FaCashRegister className="mr-2.5" size={20} /> Información
                    de caja
                  </button>
                </div>

                {/* Selector de productos */}
                <ProductSelector
                  productos={productos}
                  carrito={carrito}
                  queryProducto={queryProducto}
                  setQueryProducto={setQueryProducto}
                  productoSeleccionado={productoSeleccionado}
                  setProductoSeleccionado={setProductoSeleccionado}
                  setModalOpen={setModalOpen}
                  sucursalSeleccionada={sucursalSeleccionada}
                  bodegas={bodegas}
                  cajaSeleccionada={cajaSeleccionada}
                />

                {/* Tabla de carrito */}
                {sucursalSeleccionada && (
                  <CartTable
                    carrito={carrito}
                    editIdx={editIdx}
                    editCantidad={editCantidad}
                    setEditCantidad={setEditCantidad}
                    editDescuento={editDescuento}
                    setEditDescuento={setEditDescuento}
                    iniciarEdicion={iniciarEdicion}
                    guardarEdicion={guardarEdicion}
                    eliminarDelCarrito={eliminarDelCarrito}
                    setCarrito={setCarrito}
                    clienteSeleccionado={clienteSeleccionado}
                    setFacturaModal={setFacturaModal}
                    businessId={sucursalSeleccionada.business.negocio_id}
                    branch_id={sucursalSeleccionada.sucursal_id}
                    clienteType={clienteSeleccionado?.name} // aquí solo el string
                  />
                )}
              </div>

              {/* Modales */}
              {modalOpen && productoSeleccionado && (
                <AddProductModal
                  productoSeleccionado={productoSeleccionado}
                  cantidadSeleccionada={cantidadSeleccionada}
                  setCantidadSeleccionada={setCantidadSeleccionada}
                  getAvailableStock={getAvailableStock}
                  setModalOpen={setModalOpen}
                  agregarAlCarrito={agregarAlCarritoConCantidad}
                />
              )}

              <SucursalModal
                sucursales={sucursales}
                modalSucursal={modalSucursal}
                setModalSucursal={setModalSucursal}
                setSucursalSeleccionada={setSucursalSeleccionada}
                API_URL={API_URL}
              />

              <CashRegisterModal
                modalCaja={modalCaja}
                setModalCaja={setModalCaja}
                sucursalSeleccionada={sucursalSeleccionada}
                API_URL={API_URL}
                mostrarAlerta={mostrarAlerta}
                onCerrarCaja={(caja) => setCajaSeleccionada(caja)}
                obtenerCajaUsuario={obtenerCajaUsuario}
              />

              <FacturaModal
                facturaModal={facturaModal}
                setFacturaModal={setFacturaModal}
                carrito={carrito}
                clienteSeleccionado={clienteSeleccionado}
                sucursalSeleccionada={sucursalSeleccionada}
                user={user}
                metodoPago={metodoPago}
                setMetodoPago={setMetodoPago}
                montoEntregado={montoEntregado}
                setMontoEntregado={setMontoEntregado}
                comprobante={comprobante}
                setComprobante={setComprobante}
                facturaCreada={facturaCreada}
                invoiceRef={invoiceRef}
                botonDisabled={botonDisabled}
                finalizarVenta={finalizarVenta}
                loadingSucursal={loadingSucursal}
                errorSucursal={errorSucursal}
                procesandoVenta={procesandoVenta} // 
                documentType={documentType}
                mostrarAlerta={mostrarAlerta}
              />

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
