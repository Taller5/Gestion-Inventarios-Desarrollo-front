import { useState, useMemo } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

interface Lote {
  lote_id: string | number;
  nombre_producto: string;
  fecha_vencimiento: string;
  nombre: string;
  numero_lote: string;
  stock: number;
  producto_id: string | number;
}

interface Producto {
  id: string | number;
  nombre_producto: string;
  stock: number;
}

interface DashboardProductNotificationProps {
  lotes: Lote[];
  productos: Producto[]; 
  lowStockThreshold?: number;
}

export default function DashboardProductNotification({
  lotes,
  productos,
  lowStockThreshold = 15,
}: DashboardProductNotificationProps) {
  // Estados de expansión
  const [showExpiring, setShowExpiring] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);

  // Estados de descartes
  const [dismissedExpiring, setDismissedExpiring] = useState<(string | number)[]>([]);
  const [dismissedLowStock, setDismissedLowStock] = useState<(string | number)[]>([]);

  // Lógica de productos próximos a vencer 
  const expiringNotifications = useMemo(() => {
    const now = new Date();
    return lotes
      .filter((lote) => {
        if (!lote.fecha_vencimiento) return false;
        const vencimiento = new Date(lote.fecha_vencimiento);
        const diffDays = Math.ceil((vencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return (
          diffDays > 0 &&
          diffDays <= 14 &&
          !dismissedExpiring.includes(lote.lote_id)
        );
      })
      .map((lote) => ({
        id: lote.lote_id,
        producto: lote.nombre_producto,
        fecha: lote.fecha_vencimiento,
        dias: Math.ceil(
          (new Date(lote.fecha_vencimiento).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        nombre: lote.nombre,
        numero_lote: lote.numero_lote,
      }));
  }, [lotes, dismissedExpiring]);

  // productos con bajo stock (basada en la tabla product)
  const lowStockNotifications = useMemo(() => {
    return productos
      .filter(
        (producto) =>
          Number(producto.stock) <= lowStockThreshold &&
          !dismissedLowStock.includes(producto.id)
      )
      .map((producto) => ({
        id: producto.id, // ← usa producto_id como identificador único
        nombre_producto: producto.nombre_producto,
        stock: producto.stock,
      }));
  }, [productos, dismissedLowStock, lowStockThreshold]);

  return (
    <div className="bg-yellow-100 p-4 rounded-xl mb-4">
      {/*Productos próximos a vencer */}
      <button
        className="w-full flex items-center justify-between font-bold text-yellow-800 mb-2 text-lg px-2 py-2 rounded transition hover:bg-yellow-200"
        onClick={() => setShowExpiring((v) => !v)}
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <span className="flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-600" />
          Productos próximos a vencer
        </span>
        <span>{showExpiring ? "▼" : "▲"}</span>
      </button>

      {showExpiring && (
        <div style={{ maxHeight: "180px", overflowY: "auto", marginBottom: "12px" }}>
          {expiringNotifications.length === 0 ? (
            <div className="text-gray-500 text-sm px-2">
              No hay productos próximos a vencerse.
            </div>
          ) : (
            expiringNotifications.map((n) => (
              <div
                key={n.id}
                className="relative flex flex-col gap-1 py-3 px-3 mb-2 rounded-lg bg-yellow-50 border border-yellow-200"
                style={{ paddingTop: "2.2rem" }}
              >
                <button
                  className="absolute top-2 right-2 text-yellow-700 hover:text-red-600 text-xl font-bold p-2"
                  onClick={() => setDismissedExpiring((d) => [...d, n.id])}
                  aria-label="Descartar notificación"
                  title="Descartar"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <IoClose />
                </button>
                <span className="text-base font-semibold text-yellow-900">{n.producto}</span>
                <span className="text-sm text-gray-700 flex flex-row items-center gap-2">
                  <b>Lote:</b> {n.nombre} <span className="mx-1">|</span>{" "}
                  <b>Número:</b> {n.numero_lote}
                </span>
                <span className="text-sm text-gray-700">
                  <b>Vence:</b>{" "}
                  <span className="font-semibold text-yellow-800">{n.fecha}</span>
                </span>
                <span className="text-sm">
                  <b className="text-gray-700">Faltan:</b>{" "}
                  <span className="text-rojo-claro font-bold text-lg">{n.dias} días</span>
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/*Productos con bajo stock */}
      <button
        className="w-full flex items-center justify-between font-bold text-yellow-800 mb-2 text-lg px-2 py-2 rounded transition hover:bg-yellow-200"
        onClick={() => setShowLowStock((v) => !v)}
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <span className="flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-600" />
          Productos con bajo stock
        </span>
        <span>{showLowStock ? "▼" : "▲"}</span>
      </button>

      {showLowStock && (
        <div style={{ maxHeight: "180px", overflowY: "auto", marginBottom: "12px" }}>
          {lowStockNotifications.length === 0 ? (
            <div className="text-gray-500 text-sm px-2">No hay productos sin stock.</div>
          ) : (
            lowStockNotifications.map((n) => (
              <div
                key={n.id}
                className="relative flex flex-col gap-1 py-3 px-3 mb-2 rounded-lg bg-yellow-50 border border-yellow-200"
                style={{ paddingTop: "2.2rem" }}
              >
                <button
                  className="absolute top-2 right-2 text-yellow-700 hover:text-red-600 text-xl font-bold p-2"
                  onClick={() => setDismissedLowStock((d) => [...d, n.id])}
                  aria-label="Descartar notificación"
                  title="Descartar"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <IoClose />
                </button>
                <span className="">
                  <b className="text-sm text-gray-700">Producto: </b>
                  {n.nombre_producto}
                </span>
                <span className="text-sm text-gray-700">
                  <b>Stock total:</b>{" "}
                  <span className="text-rojo-claro font-bold text-lg">{n.stock}</span>
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
