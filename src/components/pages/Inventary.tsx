import React, { useEffect, useState, useMemo, useRef } from "react";

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
import { FaSearch } from "react-icons/fa";
import Select from "react-select";
import ProductFilters from "../ui/InventaryComponents/ProductsFillter";
import type { Warehouse, Business } from "../../types/inventario";
import CategoryModals from "../ui/InventaryComponents/CategoryModals";

const API_URL = import.meta.env.VITE_API_URL;

//type bodega


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
  codigo_cabys?: string;
  impuesto?: number;
  unit_id?: string; // unidad de medida (ej: 'kg', 'unidad')
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

type Unit = {
  id: number;
  unidMedida: string;
  descripcion: string;
};

// Catálogo CABYS
type CabysItem = {
  code: string;
  description: string;
  tax_rate: number;
  category_main?: string;
  category_main_name?: string;
  category_2?: string;
  category_2_name?: string;
  category_2_desc?: string;
  category_3?: string;
  category_3_name?: string;
  category_3_desc?: string;
  category_4?: string;
  category_4_name?: string;
  category_4_desc?: string;
  /** Campo combinado (code + description) para búsquedas */
  _combo?: string;
};

type CabysCategory = {
  code: string;
  description: string;
  level: number; // 1 principal, 2, 3, 4
  parent_code?: string | null;
};

const headers = [
  "Código",
  "Nombre",
  "Categoría",
  "Descripción",
  "Stock",
  "Precio",
  "Bodega",
  "Acciones",
];

export default function Inventary() {
  // Tooltip for bodega info on select hover
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: string;
    position: { x: number; y: number };
  } | null>(null);

  const handleSelectMouseOver = (
    event: React.MouseEvent<HTMLSelectElement>
  ) => {
    const selectedId = formProducto.bodega_id;
    const bodega = warehouses.find(
      (w) => String(w.bodega_id) === String(selectedId)
    );
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
  // Error específico de fechas dentro de los modales de lote (no alerta global detrás)
  const [loteDateError, setLoteDateError] = useState<string | null>(null);
  // Auto-dismiss del error de fechas después de unos segundos
  useEffect(() => {
    if (loteDateError) {
      const t = setTimeout(() => setLoteDateError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [loteDateError]);
  const [loteAEliminar, setLoteAEliminar] = useState<Lote | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [loading, setLoading] = useState(true);
  // Estados separados
  const [categorySearchMain, setCategorySearchMain] = useState("");
  const [categorySearchModal, setCategorySearchModal] = useState("");

  const [suggestedPrice, setSuggestedPrice] = useState<number>(0);
  const [useSuggestedPrice, setUseSuggestedPrice] = useState(true);
  // Negocio seleccionado
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    () => {
      // Recupera al cargar desde sessionStorage
      const stored = sessionStorage.getItem("selectedBusiness");
      return stored ? JSON.parse(stored) : null;
    }
  );
  const [_hasSearched, _setHasSearched] = useState(false);

  // Lista de negocios únicos extraídos de las bodegas
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryEditMode, setCategoryEditMode] = useState(false);
  const [categoryForm, setCategoryForm] = useState<{
    nombre: string;
    descripcion?: string;
  }>({ nombre: "", descripcion: "" });
  const [categories, setCategories] = useState<
    { nombre: string; descripcion?: string }[]
  >([]);
  const [categoryLoadingForm, setCategoryLoadingForm] = useState(false);
  const [categoryOriginalNombre, setCategoryOriginalNombre] = useState<
    string | null
  >(null);
  const [categoryOriginalDescripcion, setCategoryOriginalDescripcion] =
    useState<string | undefined>("");

  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // unidades de medida
  const [units, setUnits] = useState<Unit[]>([]);
  useEffect(() => {
    // Intentar cargar unidades; si falla no bloquea el formulario
    fetch(`${API_URL}/api/v1/units`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setUnits(data);
      })
      .catch(() => {
        // Silencioso; podrías agregar alerta si se desea
      });
  }, []);

  // ----- CABYS -----
  const [cabysModalOpen, setCabysModalOpen] = useState(false);
  const [cabysLoading, setCabysLoading] = useState(false);
  const [cabysError, setCabysError] = useState<string | null>(null);
  const [cabysLoadProgress, setCabysLoadProgress] = useState<{
    loaded: number;
    total: number;
  }>({ loaded: 0, total: 0 });
  const [cabysPageInfo, setCabysPageInfo] = useState<{
    page: number;
    last: number;
  }>({ page: 0, last: 0 });
  const [cabysSearchResults, setCabysSearchResults] = useState<
    CabysItem[] | null
  >(null);
  const [searchBarResetKey, setSearchBarResetKey] = useState(0);
  // --- Configuración y caché CABYS (optimizada para catálogo estático) ---
  const AUTO_PRELOAD_CABYS = true; // activa precarga
  const CABYS_CACHE_KEY_ITEMS = "cabys_items_v1"; // catálogo completo
  const CABYS_CACHE_KEY_CATEGORIES = "cabys_categories_v1";
  const CABYS_CACHE_KEY_ITEMS_SLIM = "cabys_items_v1_slim2"; // nueva versión incremental
  const CABYS_CACHE_TTL_MS = Infinity; // catálogos estáticos: nunca expiran automáticamente
  const CABYS_REFRESH_IN_BG = false; // sin refresco silencioso (evita peticiones redundantes)

  // Inicialización síncrona desde localStorage para render inmediato
  const initialCategories: CabysCategory[] = (() => {
    try {
      const raw = localStorage.getItem(CABYS_CACHE_KEY_CATEGORIES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data && Array.isArray(parsed.data)) return parsed.data;
      }
    } catch {}
    return [];
  })();
  const initialItemsMeta = (() => {
    try {
      const rawSlim = localStorage.getItem(CABYS_CACHE_KEY_ITEMS_SLIM);
      if (rawSlim) return JSON.parse(rawSlim);
      const legacyFull = localStorage.getItem(CABYS_CACHE_KEY_ITEMS);
      if (legacyFull) return JSON.parse(legacyFull);
    } catch {}
    return null;
  })();
  const initialItems: CabysItem[] = (() => {
    if (initialItemsMeta?.data && Array.isArray(initialItemsMeta.data)) {
      return initialItemsMeta.data.map((t: any) =>
        Array.isArray(t) ? { code: t[0], description: t[1], tax_rate: t[2] } : t // soporte legacy full
      );
    }
    return [];
  })();
  const initialItemsComplete: boolean = !!initialItemsMeta?.complete || false;

  const [cabysCategories, setCabysCategories] =
    useState<CabysCategory[]>(initialCategories);
  const [cabysItems, setCabysItems] = useState<CabysItem[]>(initialItems);

  // Refs para evitar doble carga por StrictMode (montar/desmontar en dev)
  const cabysCategoriesLoadStarted = useRef(false);
  const cabysItemsLoadStarted = useRef(false);
  const cabysItemsCompleteRef = useRef(initialItemsComplete);
  const [selectedCat1, setSelectedCat1] = useState("");

  // Normalizador genérico para categorías (por si cambian nombres de campos en backend)
  const normalizeCategory = (raw: any): CabysCategory => {
    let code = raw.code || raw.codigo || raw.id || "";
    if (!code && typeof raw.label === "string") {
      const m = raw.label.match(/^([^\s-]+)/);
      if (m) code = m[1];
    }
    const description =
      raw.label ||
      raw.description ||
      raw.descripcion ||
      raw.name ||
      raw.nombre ||
      raw.title ||
      "";
    return {
      code: String(code),
      description: String(description),
      level: Number(raw.level ?? raw.nivel ?? raw.level_number ?? 1),
      parent_code:
        raw.parent_code ??
        raw.padre ??
        raw.parent ??
        raw.parentId ??
        raw.parent_id ??
        null,
    };
  };

  const loadCache = <T,>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (Date.now() - (parsed.ts || 0) > CABYS_CACHE_TTL_MS) return null;
      return parsed.data as T;
    } catch {
      return null;
    }
  };

  const saveCache = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {}
  };

  // Carga de categorías CABYS (solo si no están en caché / memoria)
  useEffect(() => {
    if (cabysCategories.length) return; // ya cargadas
    if (cabysCategoriesLoadStarted.current) return; // prevenimos doble fetch StrictMode
    cabysCategoriesLoadStarted.current = true;
    if (!AUTO_PRELOAD_CABYS && !cabysModalOpen) return; // esperar apertura de modal

    // Intentar caché primero
    const cached = loadCache<CabysCategory[]>(CABYS_CACHE_KEY_CATEGORIES);
    if (cached && cached.length) {
      setCabysCategories(cached);
      if (!CABYS_REFRESH_IN_BG) return; // no refrescar por ser estático
    }

    fetch(`${API_URL}/api/v1/cabys-categories`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          const norm = data.map(normalizeCategory);
          setCabysCategories(norm);
          saveCache(CABYS_CACHE_KEY_CATEGORIES, norm);
          
        }
      })
      .catch(() => {
        /* silencioso */
      });
  }, [cabysModalOpen, cabysCategories.length]);
  // Opciones por nivel
  const cat1Options = useMemo(
    () => cabysCategories.filter((c) => c.level === 1),
    [cabysCategories]
  );

  // Carga de items CABYS (solo si no están en caché / memoria)
  useEffect(() => {
    if (cabysItems.length && cabysItemsCompleteRef.current) return; // ya cargados completos
    if (cabysItemsLoadStarted.current) return; // evitar doble fetch StrictMode
    cabysItemsLoadStarted.current = true;
    if (!AUTO_PRELOAD_CABYS && !cabysModalOpen) return; // espera apertura de modal
    const abort = new AbortController();
    (async () => {
      setCabysError(null);
      const CABYS_CODE_LENGTH = 13;
      const HARD_LIMIT_ITEMS = 100000; // seguridad extrema

      // Intentar caché primero
      // Si ya tiene items (aunque incompletos), continuamos sumando (resumen incremental)
      if (cabysItems.length && !cabysItemsCompleteRef.current) {
        console.info(
          "[CABYS] Reanudando descarga incremental desde caché parcial"
        );
      }

      setCabysLoading(true);
      setCabysLoadProgress({ loaded: 0, total: 0 });
      setCabysPageInfo({ page: 0, last: 0 });
      let all: CabysItem[] = [];
      if (cabysItems.length) all = [...cabysItems];
      try {
        let page = 1;
        let lastPage = 1;
        
        do {
          const url = `${API_URL}/api/v1/cabys?page=${page}`;
          const r = await fetch(url, { signal: abort.signal });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data: any = await r.json();
          let list: any[] | null = null;
          if (Array.isArray(data)) list = data;
          else if (Array.isArray(data.data)) list = data.data;
          else if (Array.isArray(data.items)) list = data.items;
          else if (Array.isArray(data.results)) list = data.results;
          if (!list) {
            for (const k of Object.keys(data)) {
              const v = data[k];
              if (
                Array.isArray(v) &&
                v.length &&
                (v[0].code !== undefined || v[0].codigo !== undefined)
              ) {
                list = v;
                break;
              }
            }
          }
          if (!list) break;
          lastPage = Number(
            data.last_page || data.total_pages || lastPage || 1
          );
          const normalized = list.map((raw: any) => {
            let codeStr = String(raw.code ?? raw.codigo ?? "");
            if (/^\d+$/.test(codeStr) && codeStr.length < CABYS_CODE_LENGTH) {
              codeStr = codeStr.padStart(CABYS_CODE_LENGTH, "0");
            }
            return {
              code: codeStr,
              description:
                raw.description ||
                raw.descripcion ||
                raw.name ||
                raw.nombre ||
                "(Sin descripción)",
              tax_rate: Number(raw.tax_rate ?? raw.tax ?? raw.impuesto ?? 0),
              category_main: raw.category_main || raw.category1,
              category_main_name: raw.category_main_name || raw.category1_name,
              category_2: raw.category_2 || raw.category2,
              category_3: raw.category_3 || raw.category3,
              category_4: raw.category_4 || raw.category4,
            } as CabysItem;
          });
          all = all.concat(normalized);
          const totalCalc = lastPage * (data.per_page || normalized.length);
          setCabysLoadProgress({ loaded: all.length, total: totalCalc });
          setCabysPageInfo({ page, last: lastPage });
          page++;
          if (page > lastPage) break;
          if (all.length >= HARD_LIMIT_ITEMS) {
            console.warn("[CABYS] Se alcanzó HARD_LIMIT_ITEMS, truncando.");
            break;
          }
        } while (true);
        if (!abort.signal.aborted && all.length) {
          setCabysItems(all);
          const complete = page > lastPage;
          cabysItemsCompleteRef.current = complete;
          try {
            const slim = all.map((i) => [i.code, i.description, i.tax_rate]);
            const slimPayload = JSON.stringify({
              ts: Date.now(),
              data: slim,
              complete,
            });
            localStorage.setItem(CABYS_CACHE_KEY_ITEMS_SLIM, slimPayload);
            console.info(
              `[CABYS] Items cacheados incremental (${all.length}) complete=${complete}`
            );
          } catch (e) {
             console.warn(
              "[CABYS] No se pudo guardar progreso CABYS (quota?)",
              e
            );
          }
        }
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error("[CABYS] Error carga paginada", e);
          setCabysError("Error cargando CABYS");
        }
      } finally {
        if (!abort.signal.aborted) setCabysLoading(false);
      }
    })();
    return () => abort.abort();
  }, [cabysModalOpen, cabysItems.length]);

  // Filtrado base sólo por categorías seleccionadas
  const baseCabysFiltered = useMemo(() => {
    return cabysItems.filter((i: CabysItem) => {
      // Filtro por código prefijo según categoría principal seleccionada (id "0" -> códigos que inician con "0")
      if (selectedCat1) {
        if (!String(i.code).startsWith(selectedCat1)) return false;
      }
      return true;
    });
  }, [cabysItems, selectedCat1]);

  const cabysSearchDataset = useMemo(() => {
    const map: Record<string, CabysItem> = {};
    const extended = baseCabysFiltered.map((item) => {
      const codeNorm = String(item.code).trim();
      map[codeNorm] = item;
      if (!item._combo) {
        item._combo = `${codeNorm} ${item.description}`.toLowerCase();
      }
      return item;
    });
    return { extended, map };
  }, [baseCabysFiltered]);

  const [baseProducts, setBaseProducts] = useState<Producto[]>([]);
  const [searchedProducts, setSearchedProducts] = useState<Producto[]>([]);

  // recalcula la base (negocio + categoría)
  useEffect(() => {
    let productosAgrupados = [...productos];

    // Si no hay negocio ni categoría seleccionados, base vacía
    if (!selectedBusiness && !categorySearchMain) {
      setBaseProducts([]);
      return;
    }

    if (selectedBusiness) {
      productosAgrupados = productosAgrupados.filter((p) => {
        const warehouse = warehouses.find(
          (w) => String(w.bodega_id) === String(p.bodega_id)
        );
        const business = warehouse?.branch.business as Business;
        return business?.negocio_id === selectedBusiness.negocio_id;
      });
    }

    if (categorySearchMain && categorySearchMain.trim() !== "") {
      productosAgrupados = productosAgrupados.filter(
        (p) => p.categoria?.toLowerCase() === categorySearchMain.toLowerCase()
      );
    }

    setBaseProducts(productosAgrupados);

    // NO borrar los resultados de búsqueda, mantener input
    // setSearchedProducts([]);
  }, [productos, selectedBusiness, categorySearchMain, warehouses]);

  // decide qué mostrar en la tabla
  const finalProducts = useMemo(() => {
    // si hay búsqueda activa en el input, usamos esos resultados
    return searchedProducts.length > 0 ? searchedProducts : baseProducts;
  }, [searchedProducts, baseProducts]);

  const [productsFiltered, setProductsFiltered] = useState<Producto[]>([]);

  // Mantener productsFiltered actualizado con finalProducts
  useEffect(() => {
    setProductsFiltered(finalProducts);
  }, [finalProducts]);

  //precios
  const getBusinessMargin = (bodega_id: string) => {
    const warehouse = warehouses.find(
      (w) => String(w.bodega_id) === String(bodega_id)
    );
    if (!warehouse) return 0.25; // 25% por defecto

    // Aquí asumimos que warehouse.branch.business.margen_ganancia existe
    const business: Business = warehouse.branch.business as any;
    // Por si la info de business viene incompleta
    return parseFloat(business.margen_ganancia || "0.25") || 0.25;
  };

  useEffect(() => {
    // Si no hay precio de compra o bodega seleccionada, sugerido = 0
    if (!formProducto.precio_compra || !formProducto.bodega_id) {
      setSuggestedPrice(0);
      return;
    }

    const margin = getBusinessMargin(formProducto.bodega_id);
    const precioOpcional = formProducto.precio_compra * (1 + margin);

    const precioRedondeado = Number(precioOpcional.toFixed(2));
    setSuggestedPrice(precioRedondeado);

    // Solo aplicar automáticamente si el usuario aceptó el sugerido
    if (useSuggestedPrice) {
      setFormProducto((f) => ({ ...f, precio_venta: precioRedondeado }));
    }
  }, [formProducto.precio_compra, formProducto.bodega_id, useSuggestedPrice]);

  // Abrir modal para editar
  const openEditCategory = (cat: { nombre: string; descripcion?: string }) => {
    setCategoryForm(cat);
    setCategoryOriginalNombre(cat.nombre);
    setCategoryOriginalDescripcion(cat.descripcion);
    setCategoryEditMode(true);
    setCategoryModalOpen(true);
  };

  const saveCategory = async () => {
    // Revisar si hubo cambios
    if (
      categoryForm.nombre === categoryOriginalNombre &&
      (categoryForm.descripcion || "") === (categoryOriginalDescripcion || "")
    ) {
      setAlertMessage("No hay cambios que guardar");
      return;
    }

    // Validar que el nombre no esté repetido
    const nombreRepetido = categories.some(
      (c) =>
        c.nombre.toLowerCase() === categoryForm.nombre.toLowerCase() &&
        c.nombre !== categoryOriginalNombre
    );
    if (nombreRepetido) {
      setAlertMessage("El nombre de categoría ya existe, elige otro.");
      return;
    }

    setCategoryLoadingForm(true);
    try {
      const method = categoryEditMode ? "PUT" : "POST";
      const url = categoryEditMode
        ? `${API_URL}/api/v1/categories/${encodeURIComponent(categoryOriginalNombre || "")}`
        : `${API_URL}/api/v1/categories`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      if (!res.ok) throw new Error("Error guardando categoría");

      const savedCategory = await res.json();

      setCategories((prev) =>
        categoryEditMode
          ? prev.map((c) =>
              c.nombre === categoryOriginalNombre ? savedCategory : c
            )
          : [...prev, savedCategory]
      );

      setCategoryModalOpen(false);
      setCategoryEditMode(false);
    } catch (err) {
      setAlertMessage("Ocurrió un error al guardar la categoría.");
      console.error(err);
    } finally {
      setCategoryLoadingForm(false);
    }
  };
  const deleteCategory = async (nombre: string) => {
  try {
    const res = await fetch(`${API_URL}/api/v1/categories/${encodeURIComponent(nombre)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("No se pudo eliminar la categoría");

    setCategories((prev) => prev.filter((c) => c.nombre !== nombre));
  } catch {
    setAlertMessage("No se pudo eliminar la categoría.");
  } finally {
    setCategoryToDelete(null);
  }
};


  // 1️ Cargar bodegas y extraer negocios únicos
  useEffect(() => {
    fetch(`${API_URL}/api/v1/warehouses`)
      .then((res) => res.json())
      .then((data: Warehouse[]) => {
        setWarehouses(data);

        // Extraer negocios únicos
        const map = new Map<number, Business>();
        data.forEach((w) => {
          const b = w.branch.business as Business;
          if (b && !map.has(b.negocio_id)) map.set(b.negocio_id, b);
        });

        const uniqueBusinesses = Array.from(map.values());
        setBusinesses(uniqueBusinesses);

        // Recuperar negocio guardado en sesión solo si existe
        const stored = sessionStorage.getItem("selectedBusiness");
        if (stored) {
          const parsed: Business = JSON.parse(stored);
          const exists = uniqueBusinesses.find(
            (b) => b.negocio_id === parsed.negocio_id
          );
          if (exists) setSelectedBusiness(exists);
        }
      });
  }, []);

  // 2️ Guardar automáticamente cuando cambie
  useEffect(() => {
    if (selectedBusiness) {
      sessionStorage.setItem(
        "selectedBusiness",
        JSON.stringify(selectedBusiness)
      );
    } else {
      sessionStorage.removeItem("selectedBusiness");
    }
  }, [selectedBusiness]);

  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Función para abrir el modal de eliminación

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
    const producto = productos.find(
      (p) => p.codigo_producto === formLote.codigo_producto
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
  useEffect(() => {
    fetch(`${API_URL}/api/v1/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
       .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  // Une productos y lotes para mostrar todos los productos aunque no tengan lotes
  useEffect(() => {
    // 1. Agrupar productos con sus lotes
    const lotesPorCodigo = lotes.reduce(
      (acc, lote) => {
        if (!acc[lote.codigo_producto]) acc[lote.codigo_producto] = [];
        acc[lote.codigo_producto].push(lote);
        return acc;
      },
      {} as Record<string, Lote[]>
    );

    // 2. Agregar lotes a cada producto
    let productosAgrupados = productos.map((producto) => ({
      ...producto,
      stock: producto.stock,
      lotes: lotesPorCodigo[producto.codigo_producto] || [],
    }));

    // 3. Filtrar por negocio si hay uno seleccionado
    if (selectedBusiness) {
      productosAgrupados = productosAgrupados.filter((p) => {
        const warehouse = warehouses.find(
          (w) => String(w.bodega_id) === String(p.bodega_id)
        );
        const business = warehouse?.branch.business as Business;
        return business?.negocio_id === selectedBusiness.negocio_id;
      });
    }

    // 4. Filtrar por categoría (main)
    if (categorySearchMain && categorySearchMain.trim() !== "") {
      productosAgrupados = productosAgrupados.filter(
        (p) => p.categoria.toLowerCase() === categorySearchMain.toLowerCase() // aquí exacto porque viene del datalist
      );
    }

    // 5. Si no hay negocio ni categoría seleccionados => tabla vacía
    if (!selectedBusiness && !categorySearchMain) {
      setProductsFiltered([]);
    } else {
      setProductsFiltered(productosAgrupados);
    }
  }, [productos, lotes, selectedBusiness, categorySearchMain, warehouses]);
// Estado inicial del formulario


  return (
    <ProtectedRoute
      allowedRoles={["administrador", "supervisor", "vendedor", "bodeguero"]}
    >
      <Container
        page={
          <div>
            <div className="flex">
              <SideBar role={userRole} />
              <div className="w-full pl-10 pt-10">
                <h1 className="text-2xl font-bold mb-6 text-left">
                  Gestionar Inventario
                </h1>
                {/* Barra de búsqueda y botones principales */}
                <div className="flex flex-col sm:flex-row justify-between gap-10 mb-4 w-full">
                  {/* 🟦 Sección Izquierda: Filtros */}
                
                    <ProductFilters
                        products={productos}
                        warehouses={warehouses}
                        businesses={businesses}
                        selectedBusiness={selectedBusiness}
                        setSelectedBusiness={setSelectedBusiness}
                        categorySearchMain={categorySearchMain}
                        setCategorySearchMain={setCategorySearchMain}
                        searchedProducts={searchedProducts}
                        setSearchedProducts={setSearchedProducts}
                        productsFiltered={productsFiltered}
                        setProductsFiltered={setProductsFiltered}
                        setEditProductMode={setEditProductMode}
                        setFormProducto={setFormProducto}
                        setModalOpen={setModalOpen}
                        alert={alert}                
                        setAlert={setAlert}        
                      />


                
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
                      ) : finalProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={headers.length}
                            className="text-center py-4"
                          >
                            Sin resultados
                          </td>
                        </tr>
                      ) : (
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
                              <td className="flex flex-row py-3 px-3 text-sm gap-2">
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
                                      codigo_cabys: producto.codigo_cabys || "",
                                      impuesto: producto.impuesto ?? 0,
                                      unit_id: producto.unit_id || "",
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
                                        <b>
                                          {productoAEliminar.nombre_producto}
                                        </b>
                                        ?
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
                                                        setProductos(
                                                          (prevProductos) =>
                                                            prevProductos.map(
                                                              (prod) => {
                                                                if (
                                                                  prod.codigo_producto ===
                                                                  loteAEliminar.codigo_producto
                                                                ) {
                                                                  // Sumar cantidades de lotes restantes de este producto
                                                                  const nuevosLotes =
                                                                    Array.isArray(
                                                                      (
                                                                        prod as unknown as {
                                                                          lotes: Lote[];
                                                                        }
                                                                      ).lotes
                                                                    )
                                                                      ? (
                                                                          prod as unknown as {
                                                                            lotes: Lote[];
                                                                          }
                                                                        ).lotes.filter(
                                                                          (
                                                                            l: Lote
                                                                          ) =>
                                                                            l.lote_id !==
                                                                            loteAEliminar.lote_id
                                                                        )
                                                                      : [];
                                                                  const nuevoStock =
                                                                    nuevosLotes.reduce(
                                                                      (
                                                                        acc: number,
                                                                        l: Lote
                                                                      ) =>
                                                                        acc +
                                                                        (l.cantidad ||
                                                                          0),
                                                                      0
                                                                    );
                                                                  return {
                                                                    ...prod,
                                                                    lotes:
                                                                      nuevosLotes,
                                                                    stock:
                                                                      nuevoStock,
                                                                  };
                                                                }
                                                                return prod;
                                                              }
                                                            )
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

                  <CategoryModals
                              categoryModalOpen={categoryModalOpen}
                              setCategoryModalOpen={setCategoryModalOpen}
                              categoryEditMode={categoryEditMode}
                              setCategoryEditMode={setCategoryEditMode}
                              categoryForm={categoryForm}
                              setCategoryForm={setCategoryForm}
                              categorySearchModal={categorySearchModal}
                              setCategorySearchModal={setCategorySearchModal}
                              categories={categories}
                              openEditCategory={openEditCategory}
                              categoryLoadingForm={categoryLoadingForm}
                              saveCategory={saveCategory}
                              categoryToDelete={categoryToDelete}
                              setCategoryToDelete={setCategoryToDelete}
                              alertMessage={alertMessage}
                              setAlertMessage={setAlertMessage}
                              setCategoryOriginalNombre={setCategoryOriginalNombre}
                              deleteCategory={deleteCategory}
                            />
                {/* Modal para agregar/editar producto */}
                {modalOpen === "add-product" && (
                  <SimpleModal
                    open={true}
                    onClose={() => setModalOpen(false)}
                    isWide
                    onReset={() => setUseSuggestedPrice(false)}
                  >
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
                                precio_compra: Number(
                                  formProducto.precio_compra
                                ),
                                precio_venta: Number(formProducto.precio_venta),
                                bodega_id: Number(formProducto.bodega_id),
                                codigo_cabys: formProducto.codigo_cabys,
                                impuesto: Number(formProducto.impuesto),
                                unit_id: formProducto.unit_id,
                              }),
                            }
                          );
                          if (res.ok) {
                            const actualizado = await res.json();
                            setProductos((prev) =>
                              prev.map((p) =>
                                p.codigo_producto ===
                                formProducto.codigo_producto
                                  ? { ...p, ...actualizado }
                                  : p
                              )
                            );
                            // ACTUALIZA EL NOMBRE EN LOS LOTES RELACIONADOS
                            setLotes((prev) =>
                              prev.map((lote) =>
                                lote.codigo_producto ===
                                formProducto.codigo_producto
                                  ? {
                                      ...lote,
                                      nombre_producto:
                                        formProducto.nombre_producto,
                                    }
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
                                precio_compra: Number(
                                  formProducto.precio_compra
                                ),
                                precio_venta: Number(formProducto.precio_venta),
                                bodega_id: Number(formProducto.bodega_id),
                                codigo_cabys: formProducto.codigo_cabys,
                                impuesto: Number(formProducto.impuesto),
                                unit_id: formProducto.unit_id,
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
                      className="relative bg-white rounded-2xl w-[100%] max-w-7xl m-15  mx-auto  overflow-y-auto"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        {editProductMode
                          ? "Editar Producto"
                          : "Agregar Producto"}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Columna izquierda */}
                        <div className="flex flex-col gap-6 w-full">
                          <label className="font-semibold w-full">
                            Código
                            <input
                              name="codigo_producto"
                              value={formProducto.codigo_producto}
                              onChange={(e) => {
                                const raw = e.target.value;
                                setFormProducto((f) => ({
                                  ...f,
                                  codigo_producto: raw,
                                }));
                                setAlertMessage(null); // limpia alerta al escribir
                              }}
                              onBlur={() => {
                                const codigoExistente = productos.some(
                                  (p) =>
                                    p.codigo_producto ===
                                      formProducto.codigo_producto &&
                                    (!editProductMode ||
                                      p.codigo_producto !==
                                        formProducto.codigo_producto)
                                );

                                if (codigoExistente) {
                                  // cerramos modal
                                  setModalOpen(false);
                                  setEditProductMode(false);

                                  // mostramos alerta global
                                  setAlertMessage(
                                    `El código "${formProducto.codigo_producto}" ya está en uso.`
                                  );
                                }
                              }}
                              placeholder="Código"
                              className="w-full border rounded-lg px-4 py-2"
                              required
                              disabled={editProductMode}
                              readOnly={editProductMode}
                            />
                          </label>

                          {/* ALERTA GLOBAL DESPUÉS DEL MODAL */}
                          {alertMessage && !modalOpen && (
                            <div className="mt-4 mx-auto max-w-lg px-4 py-3 bg-rojo-ultra-claro text-rojo-oscuro border border-rojo-claro rounded text-sm font-semibold text-center shadow-md">
                              {alertMessage}
                            </div>
                          )}

                          <label className="font-semibold w-full">
                            Nombre del producto
                            <input
                              name="nombre_producto"
                              value={formProducto.nombre_producto}
                              onChange={(e) => {
                                const raw = e.target.value;
                                // Permite solo letras, espacios, acentos y caracteres básicos, sin números
                                const filtered = raw.replace(/[0-9]/g, "");
                                setFormProducto((f) => ({
                                  ...f,
                                  nombre_producto: filtered,
                                }));
                              }}
                              placeholder="Nombre del producto"
                              className="w-full border rounded-lg px-4 py-2"
                              required
                            />
                          </label>

                          <label className="font-semibold w-full">
                            Categoría
                            <Select
                              name="categoria"
                              value={
                                categories
                                  .map((cat) => ({
                                    value: cat.nombre,
                                    label: cat.nombre,
                                  }))
                                  .find(
                                    (opt) =>
                                      opt.value === formProducto.categoria
                                  ) || null
                              }
                              onChange={(selected) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  categoria: selected?.value || "",
                                }))
                              }
                              options={categories.map((cat) => ({
                                value: cat.nombre,
                                label: cat.nombre,
                              }))}
                              placeholder="Seleccione una categoría"
                              isSearchable
                              isClearable
                              menuPosition="fixed"
                              menuPortalTarget={document.body}
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                                menuList: (base) => ({
                                  ...base,
                                  maxHeight: 200,
                                  overflowY: "auto",
                                }),
                              }}
                            />
                          </label>

                          <label className="font-semibold w-full">
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
                              className="w-full border rounded-lg px-4 py-2 min-h-[60px]"
                            />
                          </label>
                        </div>

                        {/* Columna derecha */}
                        <div className="flex flex-col gap-6 w-full">
                          <label className="font-semibold w-full">
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
                              className="w-full border rounded-lg px-4 py-2"
                              min={0}
                              required
                            />
                          </label>

                          <label className="font-semibold w-full">
                            Precio de venta
                            <input
                              name="precio_venta"
                              type="number"
                              value={formProducto.precio_venta}
                              onChange={(e) => {
                                setFormProducto((f) => ({
                                  ...f,
                                  precio_venta: Number(e.target.value),
                                }));
                                setUseSuggestedPrice(false);
                              }}
                              placeholder="Ingrese el precio de venta"
                              className="w-full border rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-azul-medio transition mt-1"
                              min={0}
                              required
                            />
                            {formProducto.precio_compra > 0 && (
                              <button
                                type="button"
                                className="bg-verde-claro hover:bg-verde-oscuro text-white px-4 py-2 rounded-lg text-sm mt-2 shadow-md transition w-full cursor-pointer"
                                onClick={() => {
                                  setFormProducto((f) => ({
                                    ...f,
                                    precio_venta: suggestedPrice,
                                  }));
                                  setUseSuggestedPrice(true);
                                }}
                              >
                                Precio sugerido:{" "}
                                <span className="font-bold">
                                  {suggestedPrice}
                                </span>
                              </button>
                            )}
                            <p className="text-gray-500 text-sm mt-1">
                              Puedes aceptar el precio sugerido o ingresar uno
                              propio.
                            </p>
                          </label>
                          <label className="font-semibold">
                            Código CABYS
                            <div className="relative flex items-center">
                              <input
                                name="codigo_cabys"
                                value={formProducto.codigo_cabys}
                                onChange={(e) =>
                                  setFormProducto((f) => ({
                                    ...f,
                                    codigo_cabys: e.target.value,
                                  }))
                                }
                                placeholder="Código CABYS"
                                className="w-full border rounded-lg px-3 py-2 pr-10"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  // Si ya tenemos items cargados o en proceso, simplemente abrimos.
                                  // Si aún no se ha iniciado la carga (precarga desactivada y no se abrió antes), la fuerza y abre cuando termine.
                                  if (cabysItems.length > 0) {
                                    setCabysModalOpen(true);
                                    return;
                                  }
                                  // Forzar apertura y dejar que el spinner interno muestre progreso
                                  setCabysModalOpen(true);
                                }}
                                className="absolute right-2 text-azul-medio hover:text-azul-hover transition disabled:opacity-50"
                                title={
                                  cabysLoading
                                    ? "Cargando catálogo..."
                                    : "Buscar en catálogo CABYS"
                                }
                                disabled={
                                  cabysLoading && cabysItems.length === 0
                                }
                              >
                                {cabysLoading && cabysItems.length === 0 ? (
                                  <svg
                                    className="animate-spin h-5 w-5 text-azul-medio"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <FaSearch />
                                )}
                              </button>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">
                              Usa la lupa para abrir el catálogo.
                            </p>
                          </label>
                          <label className="font-semibold">
                            Impuesto (%):
                            <input
                              name="impuesto"
                              type="number"
                              value={formProducto.impuesto}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  impuesto: Number(e.target.value),
                                }))
                              }
                              placeholder="13"
                              min={0}
                              className="w-full border rounded-lg px-3 py-2"
                            />
                          </label>
                          <label className="font-semibold">
                            Unidad de medida
                            <select
                              name="unit_id"
                              value={formProducto.unit_id}
                              onChange={(e) =>
                                setFormProducto((f) => ({
                                  ...f,
                                  unit_id: e.target.value,
                                }))
                              }
                              className="w-full border rounded-lg px-3 py-2"
                              required
                            >
                              <option value="">Seleccione una unidad</option>
                              {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.unidMedida}{" "}
                                  {u.descripcion ? `(${u.descripcion})` : ""}
                                </option>
                              ))}
                            </select>
                            {units.length === 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                No se cargaron unidades (verifique el endpoint
                                /units).
                              </p>
                            )}
                          </label>

                          <label className="font-semibold w-full">
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
                                className="w-full border rounded-lg px-4 py-2"
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

                              {tooltip && tooltip.visible && (
                                <div
                                  className="fixed bg-gray-900 text-white px-3 py-2 rounded-lg z-[1000] text-sm whitespace-pre-line pointer-events-none shadow-lg"
                                  style={{
                                    left: tooltip.position.x,
                                    top: tooltip.position.y,
                                  }}
                                >
                                  {tooltip.content}
                                </div>
                              )}
                            </div>
                          </label>

                       
                        </div>
                      </div>
                      <div className="flex gap-50 justify-center mt-8">
                        <Button
                          text={
                            loadingForm
                              ? "Guardando..."
                              : editProductMode
                                ? "Guardar cambios"
                                : "Guardar"
                          }
                          style={`
      bg-azul-medio hover:bg-azul-hover 
      text-white font-bold px-17 py-4 
      rounded-xl shadow-md transition 
      cursor-pointer w-52
      disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed
    `}
                          type="submit"
                          disabled={
                            loadingForm ||
                            !formProducto.codigo_producto ||
                            !formProducto.nombre_producto ||
                            !formProducto.categoria ||
                            !formProducto.codigo_cabys ||
                            !formProducto.precio_compra ||
                            !formProducto.precio_venta ||
                            !formProducto.bodega_id ||
                            formProducto.impuesto === undefined ||
                            formProducto.impuesto === null ||
                            formProducto.unit_id === ""
                          }
                        />
                        <Button
                          text="Cancelar"
                          style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-17  py-4 rounded-xl shadow-md transition cursor-pointer w-52"
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
                      setLoteDateError(null);
                    }}
                  >
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (loteDateError) return; // bloquear submit si hay error de fechas
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
                      {loteDateError && (
                        <div className="mb-4 px-4 py-2 rounded bg-rojo-ultra-claro text-rojo-oscuro border border-rojo-claro text-sm font-semibold text-center">
                          {loteDateError}
                        </div>
                      )}
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
                              value={
                                formLote.nombre ||
                                formLote.nombre_producto ||
                                ""
                              }
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
                                setFormLote((f) => {
                                  const nuevaEntrada = e.target.value;
                                  // Si al cambiar entrada las otras fechas ahora son válidas, limpiar error
                                  const salidaOk =
                                    !f.fecha_salida_lote ||
                                    f.fecha_salida_lote >= nuevaEntrada;
                                  const vencOk =
                                    !f.fecha_vencimiento ||
                                    f.fecha_vencimiento >= nuevaEntrada;
                                  if (salidaOk && vencOk)
                                    setLoteDateError(null);
                                  return {
                                    ...f,
                                    fecha_entrada: nuevaEntrada,
                                  };
                                })
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
                              onChange={(e) => {
                                const nuevaFechaSalida = e.target.value;
                                // si el usuario limpia con el control nativo
                                if (!nuevaFechaSalida) {
                                  setLoteDateError(null);
                                  setFormLote((f) => ({
                                    ...f,
                                    fecha_salida_lote: "",
                                  }));
                                  return;
                                }
                                if (
                                  formLote.fecha_entrada &&
                                  nuevaFechaSalida < formLote.fecha_entrada
                                ) {
                                  setLoteDateError(
                                    "La fecha de salida no puede ser menor que la de entrada"
                                  );
                                  return;
                                }
                                setLoteDateError(null);
                                setFormLote((f) => ({
                                  ...f,
                                  fecha_salida_lote: nuevaFechaSalida,
                                }));
                              }}
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
                              onChange={(e) => {
                                const nueva = e.target.value;
                                if (
                                  formLote.fecha_entrada &&
                                  nueva &&
                                  nueva < formLote.fecha_entrada
                                ) {
                                  setLoteDateError(
                                    "La fecha de vencimiento no puede ser menor que la fecha de entrada"
                                  );
                                  return; // no actualiza
                                }
                                setLoteDateError(null);
                                setFormLote((f) => ({
                                  ...f,
                                  fecha_vencimiento: nueva,
                                }));
                              }}
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
                        setLoteDateError(null);
                      }}
                    >
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (loteDateError) return;
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
                                if (
                                  prod.codigo_producto ===
                                  loteActualizado.codigo_producto
                                ) {
                                  const nuevosLotes = Array.isArray(
                                    (prod as unknown as { lotes: Lote[] }).lotes
                                  )
                                    ? (
                                        prod as unknown as { lotes: Lote[] }
                                      ).lotes.map((l: Lote) =>
                                        l.lote_id === loteActualizado.lote_id
                                          ? loteActualizado
                                          : l
                                      )
                                    : [];
                                  const nuevoStock = nuevosLotes.reduce(
                                    (acc: number, l: Lote) =>
                                      acc + (l.cantidad || 0),
                                    0
                                  );
                                  return {
                                    ...prod,
                                    lotes: nuevosLotes,
                                    stock: nuevoStock,
                                  };
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
                        {loteDateError && (
                          <div className="mb-4 px-4 py-2 rounded bg-rojo-ultra-claro text-rojo-oscuro border border-rojo-claro text-sm font-semibold text-center">
                            {loteDateError}
                          </div>
                        )}
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
                              Fecha de entrada de bodega
                              <input
                                name="fecha_entrada"
                                type="date"
                                value={formLote.fecha_entrada}
                                onChange={(e) =>
                                  setFormLote((f) => ({
                                    ...f,
                                    fecha_entrada: e.target.value,
                                    // 🔹 Si la salida es menor que la nueva entrada, la limpia
                                    fecha_salida_lote:
                                      f.fecha_salida_lote &&
                                      e.target.value > f.fecha_salida_lote
                                        ? ""
                                        : f.fecha_salida_lote,
                                    // Si las fechas asociadas vuelven a ser válidas, limpiar error
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
                                min={formLote.fecha_entrada || undefined}
                                value={formLote.fecha_salida_lote || ""}
                                onChange={(e) => {
                                  const salida = e.target.value;
                                  if (!salida) {
                                    setLoteDateError(null);
                                    setFormLote((f) => ({
                                      ...f,
                                      fecha_salida_lote: "",
                                    }));
                                    return;
                                  }
                                  if (
                                    formLote.fecha_entrada &&
                                    salida < formLote.fecha_entrada
                                  ) {
                                    setLoteDateError(
                                      "La fecha de salida no puede ser menor que la fecha de entrada"
                                    );
                                    return;
                                  }
                                  setLoteDateError(null);
                                  setFormLote((f) => ({
                                    ...f,
                                    fecha_salida_lote: salida,
                                  }));
                                }}
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
                                onChange={(e) => {
                                  if (!editMode) return;
                                  const nueva = e.target.value;
                                  if (
                                    formLote.fecha_entrada &&
                                    nueva &&
                                    nueva < formLote.fecha_entrada
                                  ) {
                                    setLoteDateError(
                                      "La fecha de vencimiento no puede ser menor que la fecha de entrada"
                                    );
                                    return;
                                  }
                                  setLoteDateError(null);
                                  setFormLote((f) => ({
                                    ...f,
                                    fecha_vencimiento: nueva,
                                  }));
                                }}
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
                {cabysModalOpen && (
                  <SimpleModal
                    open={true}
                    onClose={() => {
                      setCabysModalOpen(false);
                      // reset legacy search (no-op) anterior
                      setSelectedCat1("");
                      // Secondary category states removed
                    }}
                    className="w-full max-w-7xl"
                    isWide
                  >
                    <div className="flex flex-col gap-4 relative bg-white rounded-2xl w-[100%] mx-auto overflow-y-auto p-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Catálogo CABYS
                      </h2>
                      {/* Categoría principal arriba */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <label className=" flex flex-col md:col-span-1">
                          <span className="text-sm mb-1 font-semibold text-gray-700">
                            Categoría principal
                          </span>
                          <select
                            value={selectedCat1}
                            onChange={(e) => setSelectedCat1(e.target.value)}
                            className="border rounded-lg px-2 py-2 text-sm"
                          >
                            <option value="">Todas</option>
                            {cat1Options.map((c) => {
                              const descTrim = (c.description || "").trim();
                              const startsWithCode = descTrim
                                .toLowerCase()
                                .startsWith(c.code.toLowerCase());
                              const label = startsWithCode
                                ? descTrim
                                : `${c.code} - ${descTrim}`;
                              return (
                                <option key={c.code} value={c.code}>
                                  {label}
                                </option>
                              );
                            })}
                          </select>
                        </label>
                      </div>

                      {/* Búsqueda */}
                      <div className="flex flex-col md:flex-row gap-3 md:items-end">
                        <div className="flex-1 flex flex-col">
                          <span className="text-gray-500 text-sm my-1">
                            Búsqueda (código o descripción)
                          </span>
                          <SearchBar<CabysItem>
                            key={searchBarResetKey}
                            data={cabysSearchDataset.extended}
                            displayField="code"
                            searchFields={["code", "description", "_combo"]}
                            placeholder="Ej: 0101 o arroz"
                            numericPrefixStartsWith
                            resultFormatter={(it) =>
                              `${it.code} - ${it.description}`
                            }
                            onResultsChange={(results) => {
                              if (results.length === baseCabysFiltered.length) {
                                setCabysSearchResults(null);
                              } else {
                                setCabysSearchResults(results as CabysItem[]);
                              }
                            }}
                            onSelect={(item) => {
                              setFormProducto((prev) => ({
                                ...prev,
                                codigo_cabys: item.code,
                                impuesto: item.tax_rate,
                              }));
                            }}
                          />
                        </div>
                        <div className="flex gap-2 text-xs font-semibold text-gray-600 items-center">
                          {cabysLoading && (
                            <span>
                              Cargando CABYS
                              {cabysLoadProgress.total > 0 &&
                                ` ${cabysLoadProgress.loaded}/${cabysLoadProgress.total}`}
                              {cabysPageInfo.last > 1 &&
                                ` (página ${cabysPageInfo.page}/${cabysPageInfo.last})`}
                            </span>
                          )}
                          {!cabysLoading &&
                            cabysPageInfo.last > 0 &&
                            cabysLoadProgress.loaded <
                              cabysLoadProgress.total && (
                              <span className="text-[10px] text-orange-600">
                                Descarga truncada (seguridad).{" "}
                                {cabysLoadProgress.loaded}/
                                {cabysLoadProgress.total}
                              </span>
                            )}
                          {cabysError && (
                            <span className="text-rojo-oscuro">
                              {cabysError}
                            </span>
                          )}
                          {!cabysLoading && !cabysError && (
                            <span className="text-gray-500 text-sm">
                              {(cabysSearchResults ?? baseCabysFiltered).length}{" "}
                              resultado
                              {(cabysSearchResults ?? baseCabysFiltered)
                                .length !== 1 && "s"}
                            </span>
                          )}
                          <button
                            type="button"
                            className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-5 py-2 rounded-lg shadow-sm transition text-sm cursor-pointer"
                            onClick={() => {
                              setSelectedCat1("");
                              setCabysSearchResults(null);
                              setSearchBarResetKey((k) => k + 1);
                              setFormProducto((prev) => ({
                                ...prev,
                                codigo_cabys: "",
                                impuesto: undefined,
                              }));
                            }}
                          >
                            Limpiar
                          </button>
                        </div>
                      </div>

                      {/* Tabla */}
                      <div className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="max-h-[50vh] overflow-y-auto bg-white">
                          <table className="min-w-full text-xs md:text-sm">
                            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold w-32">
                                  CÓDIGO
                                </th>
                                <th className="px-3 py-2 text-left font-semibold">
                                  DESCRIPCIÓN DEL BIEN O SERVICIO
                                </th>
                                <th className="px-3 py-2 text-left font-semibold w-20">
                                  IMPUESTO
                                </th>
                                <th className="px-3 py-2 text-left font-semibold w-24">
                                  ACCIÓN
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {!cabysLoading &&
                                !cabysError &&
                                cabysItems.length === 0 && (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      className="px-3 py-6 text-center text-gray-500"
                                    >
                                      Catálogo vacío (0 registros). Ver consola
                                      para diagnóstico de respuesta.
                                    </td>
                                  </tr>
                                )}
                              {(cabysSearchResults ?? baseCabysFiltered)
                                .length === 0 && !cabysLoading ? (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="px-3 py-6 text-center text-gray-500"
                                  >
                                    Sin resultados
                                  </td>
                                </tr>
                              ) : (
                                (cabysSearchResults ?? baseCabysFiltered)
                                  .slice(0, 500)
                                  .map((item) => (
                                    <tr
                                      key={item.code}
                                      className="hover:bg-gray-50 cursor-pointer"
                                      onClick={() => {
                                        setFormProducto((f) => ({
                                          ...f,
                                          codigo_cabys: item.code,
                                          impuesto: item.tax_rate ?? f.impuesto,
                                        }));
                                        setCabysModalOpen(false);
                                        setCabysSearchResults(null);
                                      }}
                                    >
                                      <td className="px-3 py-2 font-mono whitespace-nowrap">
                                        {item.code}
                                      </td>
                                      <td className="px-3 py-2">
                                        {item.description}
                                      </td>
                                      <td className="px-3 py-2">
                                        {item.tax_rate}%
                                      </td>
                                      <td className="px-3 py-2">
                                        <button
                                          type="button"
                                          className="bg-verde-claro hover:bg-verde-oscuro text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setFormProducto((f) => ({
                                              ...f,
                                              codigo_cabys: item.code,
                                              impuesto:
                                                item.tax_rate ?? f.impuesto,
                                            }));
                                            setCabysModalOpen(false);
                                            setCabysSearchResults(null);
                                          }}
                                        >
                                          Seleccionar
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                              )}
                            </tbody>
                          </table>
                        </div>
                        {(cabysSearchResults ?? baseCabysFiltered).length >
                          500 && (
                          <p className="text-gray-500 text-sm px-3 py-2 bg-gray-50 border-t">
                            Mostrando primeros 500 resultados. Refina la
                            búsqueda.
                          </p>
                        )}
                      </div>
                      {/* Botones */}
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-3 rounded-lg shadow-md transition text-sm cursor-pointer"
                          onClick={() => {
                            setCabysModalOpen(false);
                            setCabysSearchResults(null);
                            setSelectedCat1("");
                          }}
                        >
                          Salir
                        </button>
                      </div>
                    </div>
                  </SimpleModal>
                )}
                <div className="mb-4">
                  <button
                    className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
                    onClick={() => {
                      setCategoryForm({ nombre: "", descripcion: "" });
                      setCategoryEditMode(false);
                      setCategoryModalOpen(true);
                    }}
                  >
                    Gestionar Categorías
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
