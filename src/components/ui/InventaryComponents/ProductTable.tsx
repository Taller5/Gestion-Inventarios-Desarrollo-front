import React from "react";
import Button from "../Button";
import SimpleModal from "../SimpleModal";
import { FaTrash } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { RiEdit2Fill } from "react-icons/ri";


// Tipos
import type { Producto, Lote } from "../../../types/inventario";

// Extender Producto para que tenga lotes opcionales
export type ProductoConLotes = Producto & { lotes?: Lote[] };

interface ProductsTableProps {
  headers: string[];
  loading: boolean;
  finalProducts: ProductoConLotes[];
  productsFiltered: ProductoConLotes[];
  expanded: string | null;
  setExpanded: (codigo: string | null) => void;
  setEditMode: (val: boolean) => void;
  setEditProductMode: (val: boolean) => void;
  setFormLote: React.Dispatch<React.SetStateAction<any>>;
  setFormProducto: React.Dispatch<React.SetStateAction<any>>;
  setModalOpen: React.Dispatch<
    React.SetStateAction<false | "add-product" | "add-lote" | Lote>
  >;
  setProductoAEliminar: React.Dispatch<React.SetStateAction<Producto | null>>;
  productoAEliminar: Producto | null;
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
  API_URL: string;
}

export default function ProductsTable({
  headers,
  loading,
  finalProducts,
  productsFiltered,
  expanded,
  setExpanded,
  setEditMode,
  setEditProductMode,
  setFormLote,
  setFormProducto,
  setModalOpen,
  setProductoAEliminar,
  productoAEliminar,
  setProductos,
  API_URL,
}: ProductsTableProps) {
  return (
    <div className="shadow-md rounded-lg max-h-[63vh] overflow-y-auto mb-10 mr-10">
      <table className="min-w-full divide-y divide-gray-200">
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
              <td colSpan={headers.length} className="text-center py-4">
                Cargando...
              </td>
            </tr>
          ) : finalProducts.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-4">
                Sin resultados
              </td>
            </tr>
          ) : (
            productsFiltered.map((producto) => (
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
                    {producto.bodega_id || ""}
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
                      <IoAddCircle /> Agregar lote
                    </Button>

                    <Button
                      style="text-sm cursor-pointer bg-azul-medio hover:bg-azul-hover text-white font-bold py-1 px-2 rounded"
                      onClick={() => {
                        setEditProductMode(true);
                        setFormProducto(producto);
                        setModalOpen("add-product");
                      }}
                    >
                      <RiEdit2Fill /> Editar
                    </Button>

                    <Button
                      style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold py-1 px-2 rounded flex items-center gap-2 cursor-pointer"
                      onClick={() => setProductoAEliminar(producto)}
                    >
                      <FaTrash /> Eliminar
                    </Button>

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
                            <b>{productoAEliminar.nombre_producto}</b>?
                          </p>
                          <div className="flex gap-4 justify-center">
                            <Button
                              text="Eliminar"
                              style="px-6 py-2 bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold rounded-lg cursor-pointer"
                              onClick={async () => {
                                const res = await fetch(
                                  `${API_URL}/api/v1/products/${productoAEliminar.id}`,
                                  { method: "DELETE" }
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
                              onClick={() => setProductoAEliminar(null)}
                            />
                          </div>
                        </div>
                      </SimpleModal>
                    )}
                  </td>
                </tr>

             {expanded === producto.codigo_producto &&
  (producto.lotes ?? []).length > 0 && (
    <tr className="bg-gray-100">
      <td
        colSpan={headers.length}
        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide"
      >
        {(producto.lotes ?? []).map((lote) => (
          <div
            key={lote.lote_id}
            className="mb p-2 flex flex-row items-center gap-5"
          >
            <span>
              <b>Número de lote:</b> {lote.numero_lote}
            </span>
            <span>
              <b>Fecha de vencimiento:</b> {lote.fecha_vencimiento}
            </span>
            <span>
              <b>Productos ingresados por lote:</b> {lote.cantidad}
            </span>
          </div>
        ))}
      </td>
    </tr>
)}

              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
