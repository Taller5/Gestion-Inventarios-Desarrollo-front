import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";

import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { SearchBar } from "../ui/SearchBar";
import SimpleModal from "../ui/SimpleModal";
import ProductsModal from "../ui/InventaryComponents/ProductsModal";

import { FaTrash } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { CgDetailsMore } from "react-icons/cg";
import { RiEdit2Fill } from "react-icons/ri";
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
  fecha_vencimiento?: string; // fecha de vencimiento
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
  const navigate = useNavigate();
  const navigateTimeoutRef = useRef<number | null>(null);
  // Tooltip removed (no usage detected)
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Cargar bodegas e inicializar businesses (ver más abajo - un único efecto lo hace)
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

    useEffect(() => {
    if (simpleModal.open && loteAEliminar) {
      console.debug('Modal abierto para lote:', loteAEliminar, setSuggestedPrice);
      
    }
  }, [simpleModal.open, loteAEliminar]);
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

 // ---- CABYS ----
const [cabysModalOpen, setCabysModalOpen] = useState(false);
const [cabysLoading, setCabysLoading] = useState(false);
const [cabysError, setCabysError] = useState<string | null>(null);
const [cabysLoadProgress, setCabysLoadProgress] = useState<{ loaded: number; total: number; }>({ loaded: 0, total: 0 });
const [cabysPageInfo, setCabysPageInfo] = useState<{ page: number; last: number; }>({ page: 0, last: 0 });
const [cabysSearchResults, setCabysSearchResults] = useState<CabysItem[] | null>(null);
const [searchBarResetKey, setSearchBarResetKey] = useState(0);

// Configuración general
// No precargar todos los CABYS por defecto (evita descargar 20k+ en clientes)
const CABYS_REFRESH_IN_BG = false;

// Inicialización vacía 
const [cabysCategories, setCabysCategories] = useState<CabysCategory[]>([]);
const [cabysItems, setCabysItems] = useState<CabysItem[]>([]);
const cabysCategoriesLoadStarted = useRef(false);
const [selectedCat1, setSelectedCat1] = useState("");

// ---------------------------------------------------------
//  IndexedDB Helpers 
// ---------------------------------------------------------
function openCabysDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("CabysDB_v1", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("categories")) {
        db.createObjectStore("categories", { keyPath: "code" });
      }
      if (!db.objectStoreNames.contains("items")) {
        db.createObjectStore("items", { keyPath: "code" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openCabysDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function saveAllToStore(storeName: string, data: any[]) {
  const db = await openCabysDB();
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  data.forEach((d) => store.put(d));
  return new Promise((resolve) => {
    tx.oncomplete = resolve;
  });
}

// ---------------------------------------------------------
// 🧠 Normalizador
// ---------------------------------------------------------
const normalizeCategory = (raw: any): CabysCategory => ({
  code: String(raw.code || raw.codigo || raw.id || ""),
  description: String(raw.label || raw.description || raw.descripcion || raw.name || raw.nombre || ""),
  level: Number(raw.level ?? raw.nivel ?? 1),
  parent_code: raw.parent_code ?? raw.padre ?? raw.parent ?? null,
});

// ---------------------------------------------------------
//  Carga de categorías
// ---------------------------------------------------------
useEffect(() => {
  if (cabysCategories.length) return;
  if (cabysCategoriesLoadStarted.current) return;
  cabysCategoriesLoadStarted.current = true;

  (async () => {
    try {
      const cached = await getAllFromStore<CabysCategory>("categories");
      if (cached.length) {
        setCabysCategories(cached);
        if (!CABYS_REFRESH_IN_BG) return;
      }

      const res = await fetch(`${API_URL}/api/v1/cabys-categories`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const norm = data.map(normalizeCategory);
        setCabysCategories(norm);
        await saveAllToStore("categories", norm);
      }
    } catch (err) {
      console.error("[CABYS] Error cargando categorías", err);
    }
  })();
}, []);

// ---------------------------------------------------------
// Carga paginada y on-demand de items CABYS
// ---------------------------------------------------------
// Ya no intenta descargar todo el conjunto en el cliente.
// En su lugar trae páginas cuando el usuario abre el modal o busca.
const CABYS_CODE_LENGTH = 13;
// Tamaños de página configurables
const CABYS_INITIAL_PER_PAGE = 200; // cuántos traer en la primera carga al abrir modal
const CABYS_LOAD_MORE_PER_PAGE = 200; // cuántos traer al pulsar "Cargar más"
const CABYS_SEARCH_PER_PAGE = 50; // resultados por página en búsqueda
async function fetchCabysPage(page = 1, query: string | null = null, signal?: AbortSignal, categoryMain: string | null = null, perPage?: number) {
  // El backend expone /cabys (index) y /cabys/search (search).
  // Usamos /cabys/search cuando hay query, y /cabys para paginación normal.
  let url: string;
  const catQs = categoryMain ? `&category_main=${encodeURIComponent(categoryMain)}` : "";
  const perPageQs = typeof perPage === 'number' && perPage > 0 ? `&per_page=${perPage}` : "";
  if (query && query.trim()) {
    url = `${API_URL}/api/v1/cabys/search?q=${encodeURIComponent(query.trim())}&page=${page}${perPageQs}${catQs}`;
  } else {
    url = `${API_URL}/api/v1/cabys?page=${page}${perPageQs}${catQs}`;
  }
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data: any = await r.json();
  // El backend puede devolver { data: [...], last_page, per_page } o directamente un array.
  let list: any[] = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : (data.results || []);
  if (!list) list = [];
  const normalized = list.map((raw) => ({
    code: String(raw.code ?? raw.codigo ?? "").padStart(CABYS_CODE_LENGTH, "0"),
    description: raw.description ?? raw.descripcion ?? raw.name ?? "(Sin descripción)",
    tax_rate: Number(raw.tax_rate ?? raw.tax ?? 0),
    category_main: raw.category_main || raw.category1,
  }));
  const lastPage = Number(data.last_page || data.total_pages || data.lastPage || 1);
  const perPageResp = Number(data.per_page || data.perPage || normalized.length || 0);
  return { data: normalized, page: Number(page), lastPage, perPage: perPageResp };
}

// Carga la primera página cuando se abre el modal (o al buscar)
useEffect(() => {
  if (!cabysModalOpen) return;

  const abort = new AbortController();
  (async () => {
    setCabysError(null);
    setCabysLoading(true);
    setCabysLoadProgress({ loaded: 0, total: 0 });

    try {
      // Intentar traer primera página desde la API (sin descargar todo)
    const res = await fetchCabysPage(1, null, abort.signal, selectedCat1 || null, CABYS_INITIAL_PER_PAGE);
  if (abort.signal.aborted) return;
  // agregar propiedad _combo para SearchBar local
  const withCombo = res.data.map((it) => ({ ...it, _combo: `${String(it.code).trim()} ${it.description}`.toLowerCase() }));
  setCabysItems(withCombo);
    setCabysPageInfo({ page: res.page, last: res.lastPage });
    setCabysLoadProgress({ loaded: withCombo.length, total: res.lastPage * (res.perPage || withCombo.length) });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error("[CABYS] Error cargando página CABYS", err);
        setCabysError("Error cargando CABYS");
      }
    } finally {
      if (!abort.signal.aborted) setCabysLoading(false);
    }
  })();

  return () => abort.abort();
}, [cabysModalOpen, searchBarResetKey, selectedCat1]);

// Cargar página siguiente y anexarla a la lista actual
const loadNextCabysPage = async () => {
  if (cabysLoading) return;
  const next = cabysPageInfo.page + 1;
  if (cabysPageInfo.last && next > cabysPageInfo.last) return;

  setCabysLoading(true);
  try {
  const res = await fetchCabysPage(next, null, undefined, selectedCat1 || null, CABYS_LOAD_MORE_PER_PAGE);
  const withCombo = res.data.map((it) => ({ ...it, _combo: `${String(it.code).trim()} ${it.description}`.toLowerCase() }));
  setCabysItems((prev) => prev.concat(withCombo));
    setCabysPageInfo({ page: res.page, last: res.lastPage });
    setCabysLoadProgress((prev) => ({ loaded: prev.loaded + withCombo.length, total: res.lastPage * (res.perPage || withCombo.length) }));
  } catch (err) {
    console.error('[CABYS] Error cargando siguiente página', err);
    setCabysError('Error cargando CABYS');
  } finally {
    setCabysLoading(false);
  }
};

// Buscar CABYS (consulta al backend). Devuelve y muestra la primera página de resultados.
const searchCabys = async (query: string) => {
  setCabysSearchResults(null);
  setSearchBarResetKey((k) => k + 1);
  setCabysLoading(true);
  try {
  const res = await fetchCabysPage(1, query, undefined, selectedCat1 || null, CABYS_SEARCH_PER_PAGE);
  const withCombo = res.data.map((it) => ({ ...it, _combo: `${String(it.code).trim()} ${it.description}`.toLowerCase() }));
  setCabysSearchResults(withCombo);
    setCabysPageInfo({ page: res.page, last: res.lastPage });
    setCabysLoadProgress({ loaded: withCombo.length, total: res.lastPage * (res.perPage || withCombo.length) });
  } catch (err) {
    console.error('[CABYS] Error en búsqueda', err);
    setCabysError('Error buscando CABYS');
  } finally {
    setCabysLoading(false);
  }
};

// Opcional: lista de categorías principales para el select
const cat1Options = useMemo(() => {
  return cabysCategories.filter((c) => (c.level ?? 1) === 1);
}, [cabysCategories]);

// Debounced input handler para SearchBar
const cabysInputTimer = useRef<number | null>(null);
const handleCabysInput = (val: string) => {
  if (cabysInputTimer.current) {
    window.clearTimeout(cabysInputTimer.current as unknown as number);
    cabysInputTimer.current = null;
  }
  // esperar 300ms antes de buscar
  cabysInputTimer.current = window.setTimeout(() => {
    const q = val ?? "";
    if (!q.trim()) {
      // si está vacío, limpiar búsqueda y recargar primera página local
      setCabysSearchResults(null);
      setSearchBarResetKey((k) => k + 1);
      return;
    }
    searchCabys(q);
  }, 300) as unknown as number;
};

// ---------------------------------------------------------
//  Filtros
// ---------------------------------------------------------
const baseCabysFiltered = useMemo(() => {
  return cabysItems.filter((i) => {
    if (selectedCat1 && !String(i.code).startsWith(selectedCat1)) return false;
    return true;
  });
}, [cabysItems, selectedCat1]);

// Nota: el dataset para SearchBar ahora usa cabysItems y cabysSearchResults directamente.


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
      setUseSuggestedPrice(false);
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

//format de los numeros
const formatMoney = (amount: number) =>
  `₡${amount.toLocaleString("es-CR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}`;
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

  // limpiar timeout de navegación si el componente se desmonta
  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) {
        window.clearTimeout(navigateTimeoutRef.current as unknown as number);
        navigateTimeoutRef.current = null;
      }
    };
  }, []);

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
      .then((data) => setProviders(data))
      .catch(() => setProviders([]));
  }, []);

  // Filtrar proveedores por producto seleccionado en el lote
  useEffect(() => {
    if (!formLote.codigo_producto) {
      setFilteredProviders([]);
      return;
    }
    const producto = productos.find(
      (p: Producto) => p.codigo_producto === formLote.codigo_producto
    );
    if (!producto) {
      setFilteredProviders([]);
      return;
    }
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

                    {/* -- FIXED tbody: asegurarse de JSX balanceado y sin tokens sueltos -- */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={headers.length} className="text-center py-4">
                            Cargando...
                          </td>
                        </tr>
                      ) : productsFiltered.length === 0 ? (
                        <tr>
                          <td colSpan={headers.length} className="text-center py-4">
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
                               {formatMoney(Number(producto.precio_venta))}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {producto.bodega_id?.codigo_producto ??
                                  producto.bodega_id ??
                                  ""}
                              </td>
                              <td className="flex flex-row py-3 px-3 text-sm gap-2">
                                <Button
                                  style="bg-verde-claro hover:bg-verde-oscuro text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
                                  onClick={() => {
                                    const productoObj = producto as Producto;
                                    const matching = providers.filter((prov) =>
                                      Array.isArray(prov.products) &&
                                      prov.products.some((p) => p.id === productoObj.id)
                                    );
                                    if (matching.length === 0) {
                                      setAlert({
                                        type: "error",
                                        message:
                                          "No hay proveedores para este producto. Redirigiendo a Proveedores...",
                                      });
                                      // limpiar timeout previo 
                                      if (navigateTimeoutRef.current) {
                                        window.clearTimeout(navigateTimeoutRef.current as unknown as number);
                                      }
                                      navigateTimeoutRef.current = window.setTimeout(() => {
                                        navigate({ to: "/provider" });
                                      }, 2000);
                                      return;
                                    }
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
                                {productoAEliminar && productoAEliminar.codigo_producto === producto.codigo_producto && (
                                  <SimpleModal
                                    open={true}
                                    onClose={() => setProductoAEliminar(null)}
                                  >
                                    
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
                                            try {
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
                                                setAlert({
                                                  type: "success",
                                                  message: `Producto "${productoAEliminar.nombre_producto}" eliminado correctamente`
                                                });
                                              } else {
                                                setAlert({
                                                  type: "error",
                                                  message: "Error al eliminar el producto"
                                                });
                                              }
                                            } catch (err) {
                                              console.error("Error eliminando producto", err);
                                              setAlert({
                                                type: "error",
                                                message: "Error al eliminar el producto"
                                              });
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
                                    {producto.lotes?.map((lote: Lote) => (
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
                {/* Modal para agregar/editar producto (extraído a ProductsModal) */}
                <ProductsModal
                  open={modalOpen === "add-product"}
                  onClose={() => {
                    setModalOpen(false);
                    setEditProductMode(false);
                  }}
                  formProducto={formProducto}
                  setFormProducto={setFormProducto}
                  editProductMode={editProductMode}
                  setEditProductMode={setEditProductMode}
                  loadingForm={loadingForm}
                  setLoadingForm={setLoadingForm}
                  productos={productos}
                  setProductos={setProductos}
                  setLotes={setLotes}
                  categories={categories}
                  units={units}
                  cabysItems={cabysItems}
                  cabysLoading={cabysLoading}
                  onOpenCabys={() => setCabysModalOpen(true)}
                  suggestedPrice={suggestedPrice}
                  warehouses={warehouses}
                  setAlert={setAlert}
                />

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
                              )
                            }
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
                            !formLote.fecha_entrada
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
                            // dataset driven por servidor (si hubo búsqueda) o por items cargados
                            data={(cabysSearchResults ?? cabysItems).map((it) => ({ ...it }))}
                            displayField="code"
                            searchFields={["code", "description", "_combo"]}
                            placeholder="Ej: 0101 o arroz"
                            numericPrefixStartsWith
                            resultFormatter={(it) => `${it.code} - ${it.description}`}
                            onResultsChange={(results) => {
                              // cuando el SearchBar filtra localmente, actualizamos estado para mostrar
                              if (results.length === (cabysItems || []).length) {
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
                              setCabysModalOpen(false);
                              setCabysSearchResults(null);
                            }}
                            onInputChange={handleCabysInput}
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
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          {/* Mostrar botón Cargar más si hay más páginas */}
                          {!cabysLoading && cabysPageInfo.last > cabysPageInfo.page && (
                            <button
                              type="button"
                              className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-4 py-2 rounded-lg shadow-md transition text-sm cursor-pointer"
                              onClick={() => loadNextCabysPage()}
                            >
                              Cargar más
                            </button>
                          )}
                        </div>
                        <div>
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
