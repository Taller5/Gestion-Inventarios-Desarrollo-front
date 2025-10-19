import { useMemo, useState, useEffect } from "react";

type Product = {
  id: number;
  codigo_producto?: string;
  nombre_producto: string;
  descripcion?: string | null;
  categoria?: string | null;
};

interface Props {
  open: boolean;
  products: Product[];
  selected: string[]; // nombres seleccionados
  onClose: () => void;
  onConfirm: (selectedNames: string[]) => void;
}

export default function ProductSelectorModal({
  open,
  products,
  selected,
  onClose,
  onConfirm,
}: Props) {
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    selected.reduce((acc, n) => ({ ...acc, [n]: true }), {})
  );

  // filtros y controles UI
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [nameSort, setNameSort] = useState<"none" | "asc" | "desc">("none");
  const [categoryFilter, setCategoryFilter] = useState<string>(""); // '' = todas
  const [orderNameOpen, setOrderNameOpen] = useState(false);
  const [orderCatOpen, setOrderCatOpen] = useState(false);

  // reset checked/search cuando se abre
  useEffect(() => {
    if (open) {
      setChecked(selected.reduce((acc, n) => ({ ...acc, [n]: true }), {}));
      setQuery("");
      setShowSelectedOnly(false);
      setNameSort("none");
      setCategoryFilter("");
      setOrderNameOpen(false);
      setOrderCatOpen(false);
    }
  }, [open, selected]);

  // lista de categorías detectadas (sin duplicados)
  const categories = useMemo(() => {
    const setCat = new Set<string>();
    for (const p of products) {
      const c = (p as any).categoria ?? null;
      if (c && String(c).trim() !== "") setCat.add(String(c));
    }
    return Array.from(setCat).sort();
  }, [products]);

  // filtrado por búsqueda + categoría (ahora busca por nombre, descripcion y código)
  const baseFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter) {
        const cat = (p.categoria ?? "").toLowerCase();
        if (cat !== categoryFilter.toLowerCase()) return false;
      }
      if (!q) return true;
      const hay = (
        p.nombre_producto +
        " " +
        (p.descripcion || "") +
        " " +
        (p.codigo_producto || "")
      ).toLowerCase();
      return hay.includes(q);
    });
  }, [products, query, categoryFilter]);

  // aplicar mostrar solo seleccionados
  const visibleAfterSelected = useMemo(() => {
    if (!showSelectedOnly) return baseFiltered;
    return baseFiltered.filter((p) => !!checked[p.nombre_producto]);
  }, [baseFiltered, showSelectedOnly, checked]);

  // ordenar por nombre
  const visibleProducts = useMemo(() => {
    const arr = [...visibleAfterSelected];
    if (nameSort === "asc") {
      arr.sort((a, b) =>
        a.nombre_producto.localeCompare(b.nombre_producto, undefined, { sensitivity: "base" })
      );
    } else if (nameSort === "desc") {
      arr.sort((a, b) =>
        b.nombre_producto.localeCompare(a.nombre_producto, undefined, { sensitivity: "base" })
      );
    }
    return arr;
  }, [visibleAfterSelected, nameSort]);

  // helpers para seleccionar todo / estado parcial
  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every(p => !!checked[p.nombre_producto]);
  const someVisibleSelected = visibleProducts.some(p => !!checked[p.nombre_producto]);

  const toggleSelectAllVisible = () => {
    const shouldSelect = !allVisibleSelected;
    setChecked(prev => {
      const next = { ...prev };
      for (const p of visibleProducts) next[p.nombre_producto] = shouldSelect;
      return next;
    });
  };

  const toggleItem = (name: string) => {
    setChecked(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl z-10 p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Seleccionar productos</h2>

        {/* BARRA DE FILTROS */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSelectedOnly(s => !s)}
              className={`px-3 py-1 rounded border ${showSelectedOnly ? 'bg-azul-medio hover:bg-azul-hover text-white' : 'bg-white text-gray-700 hover:bg-gris-ultra-claro'} cursor-pointer`}
            >
              {showSelectedOnly ? 'Seleccionados: ON' : 'Seleccionados'}
            </button>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                ref={el => {
                  if (!el) return;
                  el.indeterminate = !allVisibleSelected && someVisibleSelected;
                }}
                className="cursor-pointer"
              />
              Seleccionar todo
            </label>
          </div>

          {/* Ordenar por nombre */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setOrderNameOpen(o => !o); setOrderCatOpen(false); }}
              className="px-3 py-1 border rounded bg-white text-gray-700 cursor-pointer hover:bg-gris-ultra-claro"
            >
              Ordenar por nombre
            </button>
            {orderNameOpen && (
              <div className="absolute mt-2 bg-white border rounded shadow-md z-20 min-w-[160px]">
                <button className={`block px-4 py-2 w-full text-left ${nameSort==='asc'?'bg-white':''} cursor-pointer hover:bg-gris-ultra-claro`} onClick={() => { setNameSort('asc'); setOrderNameOpen(false); }}>A → Z</button>
                <button className={`block px-4 py-2 w-full text-left ${nameSort==='desc'?'bg-white':''} cursor-pointer hover:bg-gris-ultra-claro`} onClick={() => { setNameSort('desc'); setOrderNameOpen(false); }}>Z → A</button>
                <button className={`block px-4 py-2 w-full text-left ${nameSort==='none'?'bg-white':''} cursor-pointer hover:bg-gris-ultra-claro`} onClick={() => { setNameSort('none'); setOrderNameOpen(false); }}>Sin ordenar</button>
              </div>
            )}
          </div>

          {/* Ordenar / filtrar por categoría */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setOrderCatOpen(o => !o); setOrderNameOpen(false); }}
              className="px-3 py-1 border rounded bg-white hover:bg-gris-ultra-claro text-gray-700 cursor-pointer"
            >
              Categoría
            </button>
            {orderCatOpen && (
              <div className="absolute mt-2 bg-white border rounded shadow-md z-20 max-h-48 overflow-auto min-w-[200px]">
                <button className={`block px-4 py-2 w-full text-left ${categoryFilter===''?'bg-white':''} cursor-pointer hover:bg-gris-ultra-claro`} onClick={() => { setCategoryFilter(''); setOrderCatOpen(false); }}>
                  Todas
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    className={`block px-4 py-2 w-full text-left ${categoryFilter===c?'bg-white':''} cursor-pointer hover:bg-gris-ultra-claro`}
                    onClick={() => { setCategoryFilter(c); setOrderCatOpen(false); }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Barra de búsqueda */}
          <div className="flex-1">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-medio"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="max-h-64 overflow-y-auto border rounded p-2 mb-4">
          {visibleProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-6">Sin resultados</div>
          ) : (
            visibleProducts.map((p) => (
              <label key={p.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checked[p.nombre_producto]}
                  onChange={() => toggleItem(p.nombre_producto)}
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-semibold">{p.nombre_producto} {p.codigo_producto && <span className="text-xs text-gray-400 ml-2">({p.codigo_producto})</span>}</div>
                  {p.categoria && <div className="text-xs text-gray-400">{p.categoria}</div>}
                  <div className="text-sm text-gray-500">{p.descripcion || "Sin descripción"}</div>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-4 py-2 rounded cursor-pointer"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-4 py-2 rounded cursor-pointer"
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