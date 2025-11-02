import { useState, useEffect } from "react";
import {
  Tag,
  Sparkles,
  X,
  Percent,
  Gift,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  RotateCcw, // 🔹 NUEVO ícono para restaurar
} from "lucide-react";
import Button from "../Button";

interface Promocion {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: "porcentaje" | "fijo" | "combo";
  valor: number;
  fecha_inicio: string;
  fecha_fin: string;
  products: {
    id: number;
    nombre_producto: string;
    cantidad: number;
    descuento: number;
  }[];
}

export interface CartItemType {
  producto: {
    id?: number;
    codigo_producto: string;
    nombre_producto: string;
    precio_venta: number;
  };
  cantidad: number;
  descuento: number;
  infoPromo?: string | { id: number; descripcion: string; cantidadAplicada: number };
}

interface PromotionsButtonProps {
  businessId: number;
  branchId?: number | null;
  carrito: CartItemType[];
  setCarrito: React.Dispatch<React.SetStateAction<CartItemType[]>>;
  disabled?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function PromotionsButton({
  businessId,
  branchId = null,
  carrito,
  setCarrito,
  disabled = false,
}: PromotionsButtonProps) {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [modalMessage, setModalMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (modalMessage) {
      const timer = setTimeout(() => setModalMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [modalMessage]);

  // 🟦 Obtener promociones activas
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/v1/promotions/active?business_id=${businessId}${
          branchId ? `&branch_id=${branchId}` : ""
        }`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}`);
      }

      const data = await res.json();
      setPromociones(data);
      setShow(true);
    } catch (err: any) {
      console.error("Error al cargar promociones:", err);
      setModalMessage({
        type: "error",
        text: err.message || "Error al cargar promociones activas.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟦 Aplicar promoción
  const aplicarPromocion = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const body = {
        business_id: businessId,
        branch_id: branchId,
        carrito: carrito.map((item) => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
        })),
      };

      const res = await fetch(`${API_URL}/api/v1/promotions/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setModalMessage({
          type: "error",
          text: data.message || data.error || "Error al aplicar promociones",
        });
        return;
      }

      const carritoActualizado = carrito.map((item) => {
        const promoItem = data.carrito.find(
          (d: any) => d.producto_id === item.producto.id
        );

        if (!promoItem || !promoItem.aplicada || promoItem.descuento <= 0) {
          return {
            ...item,
            descuento: 0,
            infoPromo: promoItem?.motivo_no_aplica
              ? `No aplica: ${promoItem.motivo_no_aplica}`
              : "Sin promoción activa",
          };
        }

        const descuento = parseFloat(promoItem.descuento);
        const precioFinal = Math.max(0, item.producto.precio_venta - descuento);

        return {
          ...item,
          descuento,
          producto: {
            ...item.producto,
            precio_venta: parseFloat(precioFinal.toFixed(2)),
          },
          infoPromo: {
            id: promoItem.promocion_id ?? null, // 🔹 guardamos ID para restaurar
            descripcion: `${promoItem.promocion_aplicada}: -₡${descuento.toLocaleString()}`,
            cantidadAplicada: item.cantidad,
          },
        };
      });

      const algunaPromo = carritoActualizado.some((i) => i.descuento > 0);
      setCarrito(carritoActualizado);
      setShow(false);

      

      setModalMessage({
        type: algunaPromo ? "success" : "error",
        text:
          data.message ||
          (algunaPromo
            ? "Promociones aplicadas correctamente 🎉"
            : "Ningún producto califica para promoción o no hay promociones activas"),
      });
    } catch (err: any) {
      setModalMessage({
        type: "error",
        text:
          err?.message ||
          "Error inesperado al aplicar las promociones. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

//  NUEVO: Restablecer promociones y stock
const restablecerPromociones = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");

    //  Limpia el carrito en frontend
    const carritoSinPromo = carrito.map((item) => ({
      ...item,
      descuento: 0,
      producto: {
        ...item.producto,
        precio_venta:
          item.producto.precio_venta + (item.descuento || 0), // revertir descuento
      },
      infoPromo: "Promoción restablecida",
    }));

    setCarrito(carritoSinPromo);

    // 🔹 Enviar datos correctos al backend
    const body = {
      business_id: businessId,
      branch_id: branchId,
      carrito: carrito.map((item) => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        promocion_id:
          typeof item.infoPromo === "object" ? item.infoPromo.id : null,
      })),
    };

    const res = await fetch(`${API_URL}/api/v1/promotions/restore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Error al restaurar promociones");
    }

    //  Mostrar mensaje y cerrar modal
    setModalMessage({
      type: "success",
      text: "Promociones y stock restaurados correctamente ♻️",
    });

    setShow(false); //  Cierra el modal de promociones
  } catch (err: any) {
    setModalMessage({
      type: "error",
      text: err?.message || "Error al restablecer promociones.",
    });
  } finally {
    setLoading(false);
  }
};



  return (
    <>
      {/* Botón principal */}
      <Button
        onClick={fetchPromotions}
        disabled={loading || disabled}
        style="bg-azul-claro hover:bg-azul-hover text-white font-semibold px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-2"
      >
        <Tag size={18} />
        {loading ? "Cargando..." : "Ver promociones"}
      </Button>

      {/* 🔹 Modal de promociones */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShow(false)}
          ></div>

          <div className="relative bg-white text-gray-800 p-6 rounded-2xl shadow-2xl z-10 w-11/12 md:w-2/3 lg:w-1/2 max-h-[85vh] overflow-y-auto border border-[var(--color-azul-claro)]">
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-[var(--color-azul-hover)] text-2xl font-bold"
              onClick={() => setShow(false)}
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-5 border-b pb-2 text-center text-[var(--color-azul-oscuro)] flex items-center justify-center gap-2">
              <Sparkles size={24} />
              Promociones Activas
            </h2>

            {promociones.length === 0 ? (
              <p className="text-[var(--color-gris-oscuro)] text-center py-10 flex flex-col items-center gap-2">
                <AlertCircle size={28} />
                No hay promociones activas en este negocio o sucursal.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {promociones.map((p) => (
                  <div
                    key={p.id}
                    className="border border-[var(--color-gris-ultra-claro)] bg-[var(--color-gris-ultra-claro)] rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-lg text-[var(--color-azul-oscuro)] flex items-center gap-2">
                      {p.tipo === "porcentaje" ? (
                        <Percent size={18} />
                      ) : p.tipo === "combo" ? (
                        <Gift size={18} />
                      ) : (
                        <Tag size={18} />
                      )}
                      {p.nombre}
                    </h3>

                    <p className="text-gray-700 text-sm mb-2">{p.descripcion}</p>

                    <span
                      className={`text-xs px-2 py-1 rounded-md font-medium ${
                        p.tipo === "porcentaje"
                          ? "bg-[var(--color-verde-ultra-claro)] text-[var(--color-verde-oscuro)]"
                          : p.tipo === "fijo"
                          ? "bg-[var(--color-amarillo-claro)] text-[var(--color-amarillo-oscuro)]"
                          : "bg-[var(--color-azul-claro)] text-[var(--color-azul-oscuro)]"
                      }`}
                    >
                      {p.tipo === "porcentaje"
                        ? `-${p.valor}%`
                        : p.tipo === "fijo"
                        ? `₡${p.valor.toLocaleString()} descuento`
                        : "Combo especial"}
                    </span>

                    <ul className="text-sm text-gray-700 list-disc ml-5 mt-2">
                      {p.products.map((prod) => (
                        <li key={prod.id}>
                          {prod.nombre_producto} —{" "}
                          {p.tipo === "combo" ? (
                            <span className="text-[var(--color-azul-hover)] font-semibold">
                              Parte del combo
                            </span>
                          ) : (
                            <span className="font-semibold text-[var(--color-verde-oscuro)]">
                              {prod.descuento}% off
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Info size={14} />
                      Vigente desde{" "}
                      <span className="font-medium">{p.fecha_inicio}</span> hasta{" "}
                      <span className="font-medium">{p.fecha_fin}</span>
                    </p>
                  </div>
                ))}

                {/* 🔹 Botones finales */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button
                    onClick={aplicarPromocion}
                    style="bg-[var(--color-verde-claro)] hover:bg-[var(--color-verde-oscuro)] text-white font-semibold px-5 py-2 rounded-lg shadow flex items-center justify-center gap-2"
                  >
                    <Percent size={18} />
                    Aplicar promociones
                  </Button>

                  <Button
                    onClick={restablecerPromociones}
                    style="bg-[var(--color-rojo-claro)] hover:bg-[var(--color-rojo-oscuro)] text-white font-semibold px-5 py-2 rounded-lg shadow flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    Restablecer promociones
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast de mensajes */}
      {modalMessage && (
        <div
          className={`fixed top-16 right-10 px-5 py-3 rounded-xl font-semibold shadow-lg max-w-sm cursor-pointer ${
            modalMessage.type === "success"
              ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro border"
              : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
          }`}
          onClick={() => setModalMessage(null)}
        >
          <div className="flex items-center gap-3">
            {modalMessage.type === "success" ? (
              <CheckCircle size={22} />
            ) : (
              <XCircle size={22} />
            )}
            <span className="font-medium text-sm">{modalMessage.text}</span>
          </div>
        </div>
      )}
    </>
  );
}
