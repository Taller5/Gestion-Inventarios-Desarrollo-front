import { useState, useEffect } from "react";

type Product = {
  id: number;
  codigo_producto?: string;
  nombre_producto: string;
  descripcion?: string | null;
  categoria?: string | null;
};

interface PromotionProduct {
  id: number;
  cantidad: number;
  descuento: number;
}

interface Props {
  open: boolean;
  products: Product[];
  selectedProducts: PromotionProduct[]; // productos ya seleccionados
  onClose: () => void;
  onConfirm: (selectedProducts: PromotionProduct[]) => void;
}

export default function ProductSelectorModal({
  open,
  products,
  selectedProducts,
  onClose,
  onConfirm,
}: Props) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [discounts, setDiscounts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (open) {
      const checkedInit: Record<number, boolean> = {};
      const qtyInit: Record<number, number> = {};
      const discInit: Record<number, number> = {};

      selectedProducts.forEach(p => {
        checkedInit[p.id] = true;
        qtyInit[p.id] = p.cantidad;
        discInit[p.id] = p.descuento;
      });

      setChecked(checkedInit);
      setQuantities(qtyInit);
      setDiscounts(discInit);
    }
  }, [open, selectedProducts]);

  const toggleItem = (id: number) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl z-10 p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Seleccionar Productos para la Promoción</h2>

        <div className="flex flex-col gap-3 mb-4">
          {products.length === 0 && <div className="text-gray-500 text-center py-4">No hay productos disponibles</div>}
          {products.map(p => (
            <div
              key={p.id}
              className="flex items-center gap-3 border-b py-2"
            >
              <input
                type="checkbox"
                checked={!!checked[p.id]}
                onChange={() => toggleItem(p.id)}
              />
              <div className="flex-1">
                <div className="font-semibold">{p.nombre_producto}</div>
                {p.descripcion && <div className="text-sm text-gray-500">{p.descripcion}</div>}
              </div>
              {checked[p.id] && (
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={1}
                    value={quantities[p.id] ?? 1}
                    onChange={e => setQuantities({...quantities, [p.id]: Number(e.target.value)})}
                    className="border px-2 py-1 w-16 rounded"
                    placeholder="Cantidad"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discounts[p.id] ?? 0}
                    onChange={e => setDiscounts({...discounts, [p.id]: Number(e.target.value)})}
                    className="border px-2 py-1 w-16 rounded"
                    placeholder="% Desc"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              const selected = products
                .filter(p => checked[p.id])
                .map(p => ({
                  id: p.id,
                  cantidad: quantities[p.id] ?? 1,
                  descuento: discounts[p.id] ?? 0,
                }));
              onConfirm(selected);
              onClose();
            }}
          >
            Confirmar ({Object.values(checked).filter(Boolean).length})
          </button>
        </div>
      </div>
    </div>
  );
}
