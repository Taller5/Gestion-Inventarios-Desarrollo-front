import React, { useMemo, useState } from "react";

type Product = {
  id: number;
  nombre_producto: string;
  descripcion?: string | null;
};

interface Props {
  open: boolean;
  products: Product[];
  selected: string[]; // nombres seleccionados
  onClose: () => void;
  onConfirm: (selectedNames: string[]) => void;
}

export default function ProductSelectorModal({ open, products, selected, onClose, onConfirm }: Props) {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    selected.reduce((acc, n) => ({ ...acc, [n]: true }), {})
  );

  // reset checked when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setChecked(selected.reduce((acc, n) => ({ ...acc, [n]: true }), {}));
      setQuery("");
    }
  }, [open, selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter(p => (p.nombre_producto + " " + (p.descripcion || "")).toLowerCase().includes(q)) : products;
  }, [products, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-transparent backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl z-10 p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Seleccionar productos</h2>

        <div className="mb-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="max-h-64 overflow-y-auto border rounded p-2 mb-4">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-6">Sin resultados</div>
          ) : (
            filtered.map((p) => (
              <label key={p.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={!!checked[p.nombre_producto]}
                  onChange={() =>
                    setChecked(prev => ({ ...prev, [p.nombre_producto]: !prev[p.nombre_producto] }))
                  }
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold">{p.nombre_producto}</div>
                  <div className="text-sm text-gray-500">{p.descripcion || "Sin descripción"}</div>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-4 py-2 rounded"
            onClick={() => {
              const selectedNames = Object.keys(checked).filter(k => checked[k]);
              onConfirm(selectedNames);
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