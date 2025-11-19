import { useState, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import ButtonInfo from "../ButtonInfo";

interface Lote {
  lote_id: string | number;
  nombre_producto: string;
  fecha_vencimiento: string;
  nombre: string;
  numero_lote: string;
  stock: number;
  producto_id: string | number;
}

interface Promotion {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: "porcentaje" | "fijo" | "combo";
  valor?: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  products: { product_id: number }[];
  branch_id: number;
}

interface Branch {
  id: number;
  nombre: string;
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
  promotions: Promotion[];
  branches: Branch[];
}

export default function DashboardProductNotification({
  promotions,
  branches,
  lotes,
  productos,
  lowStockThreshold = 15,
  type = "lowStock", // "lowStock" | "expiring" | "promo"
}: DashboardProductNotificationProps & { type: "lowStock" | "expiring" | "promo" }) {
  const [showExpiring, setShowExpiring] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  const [dismissedExpiring, setDismissedExpiring] = useState<(string | number)[]>([]);
  const [dismissedLowStock, setDismissedLowStock] = useState<(string | number)[]>([]);
  const [dismissedPromos, setDismissedPromos] = useState<number[]>([]);

  const expiringNotifications = useMemo(() => {
    const now = new Date();
    return lotes
      .filter((lote) => {
        if (!lote.fecha_vencimiento) return false;
        const vencimiento = new Date(lote.fecha_vencimiento);
        const diffDays = Math.ceil((vencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 14 && !dismissedExpiring.includes(lote.lote_id);
      })
      .map((lote) => ({
        id: lote.lote_id,
        producto: lote.nombre_producto,
        fecha: lote.fecha_vencimiento,
        dias: Math.ceil((new Date(lote.fecha_vencimiento).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        nombre: lote.nombre,
        numero_lote: lote.numero_lote,
      }));
  }, [lotes, dismissedExpiring]);

  const lowStockNotifications = useMemo(() => {
    return productos
      .filter(
        (producto) =>
          Number(producto.stock) <= lowStockThreshold &&
          !dismissedLowStock.includes(producto.id)
      )
      .map((producto) => ({
        id: producto.id,
        nombre_producto: producto.nombre_producto,
        stock: producto.stock,
      }));
  }, [productos, dismissedLowStock, lowStockThreshold]);

  // Notificaciones de promociones activas
  const promoNotifications = useMemo(() => {
    const now = new Date();
    return promotions
      .filter(
        (promo) =>
          promo.activo &&
          new Date(promo.fecha_fin) >= now &&
          !dismissedPromos.includes(promo.id)
      )
      .map((promo) => {
        const branch = branches.find((b) => b.id === promo.branch_id);
        return {
          id: promo.id,
          sucursal: branch ? branch.nombre : "Sin sucursal",
          nombre_producto: promo.nombre,
          descuento: promo.valor !== undefined ? `${promo.valor}%` : "--",
          tipo: promo.tipo === "combo" ? "Combo" : "Individual",
          descripcion: promo.descripcion ?? "--",
        };
      });
  }, [promotions, branches, dismissedPromos]);

  // Elige el color según el tipo
  const bgColor =
    type === "lowStock"
      ? "bg-blue-100"
      : type === "expiring"
      ? "bg-yellow-100"
      : "bg-verde-ultra-claro";

  return (
    <ButtonInfo
      textInfo={
        type === "lowStock"
          ? "Consulte los productos bajos en stock. Si quiere volver a ver las notificaciones después de descartarlas, recargue la página"
          : type === "expiring"
          ? "Consulte los productos próximos a vencer. Si quiere volver a ver las notificaciones después de descartarlas, recargue la página."
          : "Consulte las promociones activas. Si quiere volver a ver las notificaciones después de descartarlas, recargue la página."
      }
      position="bottom"
    >
      <div className={`${bgColor} p-6 rounded-xl mb-3 shadow-md max-w-md mx-auto`}>
        {type === "lowStock" && (
          <>
            {/* Productos con bajo stock */}
            <button
              onClick={() => setShowLowStock((v) => !v)}
              className="w-full flex items-center justify-between font-bold text-azul-oscuro mb-4 text-lg px-4 py-3 rounded-lg transition-colors duration-300"
              style={{ cursor: "pointer" }}
              // onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "bg-blue-300")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span className="flex items-center gap-3">
                {/* <FaExclamationTriangle className="text-azul-oscuro w-5 h-5" /> */}
                Productos con bajo stock
              </span>
              <span className="select-none">{showLowStock ? "▼" : "▲"}</span>
            </button>

            {showLowStock && (
              <div className="max-h-44 overflow-y-auto mb-0 pr-1 space-y-3 scrollbar-thin scrollbar-thumb-yellow-300 scrollbar-track-yellow-50">
                {lowStockNotifications.length === 0 ? (
                  <div className="text-gray-600 text-sm px-2 italic select-none">No hay productos sin stock.</div>
                ) : (
                  lowStockNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="relative flex flex-col gap-1 py-4 px-4 rounded-lg bg-blue-200 border border-azul-oscuro shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => setDismissedLowStock((d) => [...d, n.id])}
                        aria-label="Descartar notificación"
                        title="Descartar"
                        className="absolute top-3 right-3 text-rojo-claro hover:text-red-600 text-xl font-bold p-1 rounded-full transition-colors"
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        <IoClose />
                      </button>
                      <span className="text-sm text-azul-oscuro truncate">
                        <b>Producto: </b> {n.nombre_producto}
                      </span>
                      <span className="text-sm text-azul-oscuro">
                        <b>Stock total:</b>{" "}
                        <span className="text-rojo-claro font-bold text-lg">{n.stock}</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
        {type === "expiring" && (
          <>
            {/* Productos próximos a vencer */}
            <button
              onClick={() => setShowExpiring((v) => !v)}
              className="w-full flex items-center justify-between font-bold text-yellow-800 mb-4 text-lg px-4 py-3 rounded-lg transition-colors duration-300"
              style={{ cursor: "pointer" }}
              // onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#BCB350")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span className="flex items-center gap-3">
                {/* <FaExclamationTriangle className="text-yellow-600 w-5 h-5" /> */}
                Productos próximos a vencer
              </span>
              <span className="select-none">{showExpiring ? "▼" : "▲"}</span>
            </button>

            {showExpiring && (
              <div className="max-h-44 overflow-y-auto mb-4 pr-1 space-y-3 scrollbar-thin scrollbar-thumb-yellow-300 scrollbar-track-yellow-50">
                {expiringNotifications.length === 0 ? (
                  <div className="text-gray-600 text-sm px-2 italic select-none">
                    No hay productos próximos a vencerse.
                  </div>
                ) : (
                  expiringNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="relative flex flex-col gap-1 py-4 px-4 rounded-lg bg-yellow-100 border border-yellow-300 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => setDismissedExpiring((d) => [...d, n.id])}
                        aria-label="Descartar notificación"
                        title="Descartar"
                        className="absolute top-3 right-3 text-rojo-claro hover:text-red-600 text-xl font-bold p-1 rounded-full transition-colors"
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        <IoClose />
                      </button>
                      <span className="text-base font-semibold text-yellow-900 truncate">{n.producto}</span>
                      <span className="text-sm text-gray-700 flex items-center gap-1 flex-wrap">
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
                  )
                }
              </div>
            )}
          </>
        )}
        {type === "promo" && (
          <>
            {/* Promociones activas */}
            <button
              onClick={() => setShowPromo((v) => !v)}
              className="w-full flex items-center justify-between font-bold text-green-800 mb-4 text-lg px-4 py-3 rounded-lg transition-colors duration-300"
              style={{ cursor: "pointer" }}
              // onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#A7F3D0")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <span className="flex items-center gap-3">
                {/* <FaGift className="text-azul-medio w-5 h-5" /> */}
                Productos en Promoción
              </span>
              <span className="select-none">{showPromo ? "▼" : "▲"}</span>
            </button>
            {showPromo && (
              <div className="max-h-44 overflow-y-auto mb-4 pr-1 space-y-3 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50">
                {promoNotifications.length === 0 ? (
                  <div className="text-gray-600 text-sm px-2 italic select-none">
                    No hay promociones activas.
                  </div>
                ) : (
                  promoNotifications.map((promo) => (
                    <div
                      key={promo.id}
                      className="relative flex flex-col gap-1 py-4 px-4 rounded-lg bg-green-100 border border-green-300 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => setDismissedPromos((d) => [...d, promo.id])}
                        aria-label="Descartar notificación"
                        title="Descartar"
                        className="absolute top-3 right-3 text-rojo-claro hover:text-red-600 text-xl font-bold p-1 rounded-full transition-colors"
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                      >
                        <IoClose />
                      </button>
                      <span className="text-base font-semibold text-azul-oscuro truncate">
                        {promo.nombre_producto}
                      </span>
                      <span className="text-sm text-gray-700">
                        <b>Descuento:</b> {promo.descuento}
                      </span>
                      <span className="text-sm text-gray-700">
                        <b>Tipo:</b> {promo.tipo}
                      </span>
                      <span className="text-sm text-gray-700">
                        <b>Descripción:</b> {promo.descripcion}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ButtonInfo>
  );
}
