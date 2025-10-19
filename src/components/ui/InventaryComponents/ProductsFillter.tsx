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

    // Si no hay negocio seleccionado, no mostrar productos
    if (!selectedBusiness) {
      return [];
    }

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
  <div className="flex flex-col lg:flex-row justify-between gap-5 mb-3 w-full px-2 sm:px-4">
    {/* 🟦 Filtros */}
    <div className="w-full lg:w-[38%] flex flex-col gap-3">
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
            cursor: "pointer",
            minHeight: "34px",
            fontSize: "0.85rem",
          }),
          option: (base, state) => ({
            ...base,
            cursor: "pointer",
            backgroundColor: state.isFocused ? "#E5F1FF" : "white",
            color: "black",
            fontSize: "0.85rem",
          }),
        }}
      />

      {!selectedBusiness && (
        <div className="p-2 bg-yellow-100 text-yellow-800 rounded-md text-center text-sm font-medium">
          Seleccione un negocio para ver los productos.
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-700 mb-1 text-sm">Categorías existentes</h3>
        <Select
          placeholder="Seleccione una categoría..."
          value={
            categorySearchMain
              ? { value: categorySearchMain, label: categorySearchMain }
              : null
          }
          onChange={(option: any) => {
            setCategorySearchMain(option?.value || "");

            if (!selectedBusiness && option?.value) {
              setProductsFiltered([]);
              return;
            }

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
            setProductsFiltered(filtered.length > 0 ? filtered : []);
          }}
          options={[...new Set(products.map((p) => p.categoria))].filter(Boolean).map((c) => ({ value: c!, label: c! }))}
          isClearable
          isDisabled={!selectedBusiness}
          isLoading={products.length === 0}
          styles={{
            control: (base) => ({
              ...base,
              cursor: "pointer",
              minHeight: "34px",
              fontSize: "0.85rem",
            }),
            option: (base, state) => ({
              ...base,
              cursor: "pointer",
              backgroundColor: state.isFocused ? "#E5F1FF" : "white",
              color: "black",
              fontSize: "0.85rem",
            }),
          }}
        />
      </div>
    </div>

    {/* 🟩 Buscador y Botones */}
    <div className="w-full lg:w-[60%] flex flex-col gap-3 pt-18">
      <div className="flex flex-col sm:flex-row sm:items-stretch justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <SearchBar<Producto>
            data={baseProducts}
            displayField="codigo_producto"
            searchFields={["codigo_producto", "nombre_producto"]}
            placeholder="Buscar por código o nombre..."
            onResultsChange={(results) => {
              setSearchedProducts(results);
              setProductsFiltered(results.length > 0 ? results : []);
            }}
            onSelect={(item) => {
              setSearchedProducts([item]);
              setProductsFiltered([item]);
            }}
            onNotFound={(query) => {
              setSearchedProducts([]);
              setProductsFiltered([]);
              setAlert({
                type: "error",
                message: query
                  ? `No existe ningún producto con el código o nombre "${query}".`
                  : "Por favor ingrese un código o nombre para buscar.",
              });
            }}
            onClearAlert={() => setAlert(null)}
            resultFormatter={(item) =>
              `${item.codigo_producto} - ${item.nombre_producto}`
            }
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          <Button
            style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-2.5 px-3 rounded flex items-center justify-center text-sm w-full sm:w-auto cursor-pointer"
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
            <IoAddCircle className="w-5 h-5" />
            <span className="ml-1">Agregar</span>
          </Button>

          <Button
            to="/iaprediction"
            style="bg-verde-claro hover:bg-verde-oscuro text-white font-bold py-2.5 px-3 rounded flex items-center gap-2 justify-center text-sm w-full sm:w-auto cursor-pointer"
          >
            <FaSearch className="w-4 h-4" />
            <span>Predicciones</span>
          </Button>
        </div>
      </div>

      {alert && (
        <div
          className={`mt-3 px-3 py-2 rounded-md text-center font-medium text-sm ${
            alert.type === "success"
              ? "bg-verde-ultra-claro text-verde-oscuro border border-verde-claro"
              : "bg-rojo-ultra-claro text-rojo-oscuro border border-rojo-claro"
          }`}
        >
          {alert.message}
        </div>
      )}
    </div>
  </div>
);

}
