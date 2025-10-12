import { useMemo, useEffect } from "react";
import Select from "react-select";
import { SearchBar } from "../SearchBar";
import Button from "../../ui/Button";
import { IoAddCircle } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";

// Tipos
import type { Warehouse, Producto, Business } from "../../../types/inventario";

interface ProductFiltersProps {
  products: Producto[];
  warehouses: Warehouse[];
  businesses: Business[];
  selectedBusiness: Business | null;
  setSelectedBusiness: (b: Business | null) => void;
  categorySearchMain: string;
  setCategorySearchMain: (c: string) => void;
  searchedProducts: Producto[];
  setSearchedProducts: (p: Producto[]) => void;
  productsFiltered: Producto[];
  setProductsFiltered: (p: Producto[]) => void;
  setEditProductMode: (b: boolean) => void;
  setFormProducto: (p: Producto) => void;
  setModalOpen: (value: false | "add-product" | "add-batch" | any) => void;
  alert: { type: "success" | "error"; message: string } | null;
  setAlert: (a: { type: "success" | "error"; message: string } | null) => void;
}

export default function ProductFilters({
  products,
  warehouses,
  businesses,
  selectedBusiness,
  setSelectedBusiness,
  categorySearchMain,
  setCategorySearchMain,
  searchedProducts,
  setSearchedProducts,
  setProductsFiltered,
  setEditProductMode,
  setFormProducto,
  setModalOpen,
  alert,
  setAlert,
}: ProductFiltersProps) {

  // Filtrado base
  const baseProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedBusiness) {
      filtered = filtered.filter((p) => {
        const warehouse = warehouses.find(
          (w) => String(w.bodega_id) === String(p.bodega_id)
        );
        return warehouse?.branch.business.negocio_id === selectedBusiness.negocio_id;
      });
    }

    if (categorySearchMain) {
      filtered = filtered.filter(
        (p) => p.categoria?.toLowerCase() === categorySearchMain.toLowerCase()
      );
    }

    return filtered;
  }, [products, warehouses, selectedBusiness, categorySearchMain]);

  // 🔹 Resultado final
  const finalProducts = useMemo(() => {
    if (searchedProducts.length > 0) return searchedProducts;
    return baseProducts;
  }, [searchedProducts, baseProducts]);

  // 🔹 Actualizar productos filtrados
  useEffect(() => {
    if (finalProducts.length === 0) {
      setProductsFiltered([]); // vaciar tabla si no hay resultados
    } else {
      setProductsFiltered(finalProducts);
    }
  }, [finalProducts]);

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-10 mb-4 w-full">
      {/* 🟦 Filtros */}
      <div className="w-full sm:w-1/2 flex flex-col gap-6">
  <Select
  placeholder="Seleccione un negocio..."
  value={
    selectedBusiness
      ? {
          value: selectedBusiness.negocio_id,
          label: selectedBusiness.nombre_comercial,
        }
      : null
  }
  onChange={(option: any) => {
    if (!option) setSelectedBusiness(null);
    else {
      const business =
        businesses.find((b) => b.negocio_id === option.value) || null;
      setSelectedBusiness(business);
    }
  }}
  options={businesses.map((b) => ({
    value: b.negocio_id,
    label: b.nombre_comercial,
  }))}
  isClearable
  isLoading={businesses.length === 0}
  styles={{
    control: (base) => ({
      ...base,
      cursor: "pointer", //  cursor sobre el control principal
    }),
    option: (base, state) => ({
      ...base,
      cursor: "pointer", // 👈 cursor sobre cada opción
      backgroundColor: state.isFocused ? "#E5F1FF" : "white", //  hover azul suave
      color: "black",
    }),
    menu: (base) => ({
      ...base,
      cursor: "pointer", //  cursor sobre el menú desplegado
    }),
  }}
/>

        {!selectedBusiness && (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center font-semibold">
            Por favor, seleccione un negocio para ver los productos.
          </div>
        )}

        <div>
          <h3 className="font-bold text-gray-700 mb-2 ">Categorías existentes</h3>
        <Select
    placeholder="Seleccione una categoría..."
    value={
      categorySearchMain
        ? { value: categorySearchMain, label: categorySearchMain }
        : null
    }
    onChange={(option: any) => {
      setCategorySearchMain(option?.value || "");
      const filtered = products.filter((p) => {
        const warehouse = warehouses.find(
          (w) => String(w.bodega_id) === String(p.bodega_id)
        );
        const b = warehouse?.branch.business as Business;
        if (selectedBusiness && b?.negocio_id !== selectedBusiness?.negocio_id)
          return false;
        if (option?.value)
          return p.categoria?.toLowerCase() === option.value.toLowerCase();
        return true;
      });
      setProductsFiltered(filtered.length > 0 ? filtered : []); // Vaciar si no hay
    }}
    options={[...new Set(products.map((p) => p.categoria))]
      .filter(Boolean)
      .map((c) => ({ value: c!, label: c! }))}
    isClearable
    isLoading={products.length === 0}
    styles={{
      control: (base) => ({
        ...base,
        cursor: "pointer", //  cursor sobre el control principal
      }),
      option: (base, state) => ({
        ...base,
        cursor: "pointer", // cursor sobre cada opción
        backgroundColor: state.isFocused ? "#E5F1FF" : "white", // 👌 hover bonito
        color: "black",
      }),
      menu: (base) => ({
        ...base,
        cursor: "pointer", //  cursor sobre el menú desplegado
      }),
    }}
  />
        </div>
      </div>

      {/* 🟩 Buscador y Botones */}
      <div className="w-full sm:w-1/2 flex flex-col gap-2 mr-10 h-full">
        <div className="flex items-center justify-between w-full mt-auto">
          <div className="flex-grow mr-6">
            <SearchBar<Producto>
              data={baseProducts}
              displayField="codigo_producto"
              searchFields={["codigo_producto", "nombre_producto"]}
              placeholder="Buscar por código o nombre..."
              onResultsChange={(results) => {
                setSearchedProducts(results);
                setProductsFiltered(results.length > 0 ? results : []); // vaciar si no hay
              }}
              onSelect={(item) => {
                setSearchedProducts([item]);
                setProductsFiltered([item]);
              }}
              onNotFound={(query) => {
                setSearchedProducts([]);
                setProductsFiltered([]); // vaciar tabla si no existe
                setAlert({
                  type: "error",
                  message: query
                    ? `No existe ningún producto con el código o nombre "${query}".`
                    : "Por favor ingrese un código o nombre para buscar.",
                });
              }}
              onClearAlert={() => setAlert(null)}
              resultFormatter={(item) => `${item.codigo_producto} - ${item.nombre_producto}`}
            />
          </div>

          <div className="flex gap-4 flex-none">
            <Button
              style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-4 px-4 rounded flex items-center whitespace-nowrap cursor-pointer"
              onClick={() => {
                setEditProductMode(false);
                setFormProducto({
                  codigo_producto: "",
                  nombre_producto: "",
                  categoria: "",
                  descripcion: "",
                  stock: 0,
                  precio_compra: 0,
                  precio_venta: 0,
                  bodega_id: "",
                  codigo_cabys: "",
                  impuesto: 0,
                  unit_id: "",
                });
                setModalOpen("add-product");
              }}
            >
              <IoAddCircle className="w-6 h-6 flex-shrink-0" />
              <span className="text-base ml-1">Agregar Producto</span>
            </Button>

            <Button
              to="/iaprediction"
              style="bg-verde-claro hover:bg-verde-oscuro text-white font-bold py-4 px-4 rounded flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <FaSearch />
              <span className="text-base">Ver predicciones</span>
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {alert && (
          <div
            className={`mt-4 px-4 py-2 rounded-lg text-center font-semibold ${
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
  );
}
