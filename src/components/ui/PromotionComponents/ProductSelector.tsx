import { useState } from "react";
import Select from "react-select";

interface Producto {
  id: number;
  nombre_producto: string;
}

interface SelectedProduct {
  product_id: number;
  cantidad: number;
  descuento: number;
}

interface Props {
  productos: Producto[];
  selected: SelectedProduct[];
  onChange: (newSelected: SelectedProduct[]) => void;
}

export default function ProductSelector({ productos, selected, onChange }: Props) {
  const [selectedOption, setSelectedOption] = useState<{ value: number; label: string } | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [descuento, setDescuento] = useState<number>(0);

  const options = productos.map((p) => ({ value: p.id, label: p.nombre_producto }));

  const handleAdd = () => {
    if (!selectedOption) return;

    const exists = selected.find((p) => p.product_id === selectedOption.value);
    if (exists) return alert("Este producto ya fue agregado.");

    const nuevo = {
      product_id: selectedOption.value,
      cantidad,
      descuento,
    };
    onChange([...selected, nuevo]);
    setSelectedOption(null);
    setCantidad(1);
    setDescuento(0);
  };

  const handleRemove = (id: number) => {
    onChange(selected.filter((p) => p.product_id !== id));
  };

  const handleUpdate = (id: number, field: "cantidad" | "descuento", value: number) => {
    onChange(
      selected.map((p) =>
        p.product_id === id
          ? {
              ...p,
              [field]: value,
            }
          : p
      )
    );
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Productos en promoción</h3>

      {/* Seleccionar producto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div className="col-span-1 md:col-span-2">
          <Select
            options={options}
            value={selectedOption}
            onChange={(option) => setSelectedOption(option)}
            placeholder="Seleccionar producto..."
            isClearable
          />
        </div>

        <input
          type="number"
          min={1}
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="border p-2 rounded"
          placeholder="Cantidad"
        />

        <input
          type="number"
          min={0}
          value={descuento}
          onChange={(e) => setDescuento(Number(e.target.value))}
          className="border p-2 rounded"
          placeholder="Descuento"
        />
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="bg-azul-medio text-white px-3 py-1 rounded hover:bg-azul-hover"
      >
        Agregar producto
      </button>

      {/* Lista de productos seleccionados */}
      <table className="w-full border-collapse border border-gray-300 text-sm mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Producto</th>
            <th className="border p-2">Cantidad</th>
            <th className="border p-2">Descuento</th>
            <th className="border p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {selected.map((p) => {
            const prod = productos.find((x) => x.id === p.product_id);
            return (
              <tr key={p.product_id} className="hover:bg-gray-50">
                <td className="border p-2">{prod?.nombre_producto || "—"}</td>
                <td className="border p-2 text-center">
                  <input
                    type="number"
                    min={1}
                    value={p.cantidad}
                    onChange={(e) => handleUpdate(p.product_id, "cantidad", Number(e.target.value))}
                    className="border px-2 py-1 w-20 text-center rounded"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={p.descuento}
                    onChange={(e) => handleUpdate(p.product_id, "descuento", Number(e.target.value))}
                    className="border px-2 py-1 w-20 text-center rounded"
                  />
                </td>
                <td className="border p-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemove(p.product_id)}
                    className="text-white bg-rojo-claro hover:bg-rojo-oscuro px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
          {selected.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-gray-500 p-2">
                No hay productos agregados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
