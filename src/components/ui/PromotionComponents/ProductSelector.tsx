import { useState, useEffect } from "react";
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
  tipo: "porcentaje" | "combo";
  onChange: (newSelected: SelectedProduct[]) => void;
}

export default function ProductSelector({
  productos,
  selected,
  tipo,
  onChange,
}: Props) {
  const [selectedOption, setSelectedOption] = useState<{ value: number; label: string } | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [descuento, setDescuento] = useState<number>(0);
  const [modalMessage, setModalMessage] = useState<string | null>(null); // <-- modal

  const options = productos.map((p) => ({
    value: p.id,
    label: p.nombre_producto,
  }));

const handleAdd = () => {
  if (!selectedOption) return;

  //  Solo 1 producto permitido en porcentaje
  if (tipo === "porcentaje" && selected.length >= 1) {
    setModalMessage("Para promociones individuales solo puedes agregar un producto.");
    return;
  }

  // Validar duplicado
  const exists = selected.find((p) => p.product_id === selectedOption.value);
  if (exists) {
    setModalMessage("Este producto ya fue agregado.");
    return;
  }

  let appliedDescuento = descuento;
  if (tipo === "porcentaje" && appliedDescuento > 100) appliedDescuento = 100;

  const nuevo = {
    product_id: selectedOption.value,
    cantidad,
    descuento: appliedDescuento,
  };

  onChange([...selected, nuevo]);
  setSelectedOption(null);
  setCantidad(1);
  setDescuento(0);
};


  const handleRemove = (id: number) => {
    onChange(selected.filter((p) => p.product_id !== id));
  };

  const handleUpdate = (
    id: number,
    field: "cantidad" | "descuento",
    value: number
  ) => {
    onChange(
      selected.map((p) =>
        p.product_id === id
          ? { ...p, [field]: value }
          : p
      )
    );
  };
useEffect(() => {
  const validIds = productos.map(p => p.id);

  const filtered = selected.filter(s => validIds.includes(s.product_id));

  if (filtered.length !== selected.length) {
    onChange(filtered); // elimina productos que ya no existen
  }
}, [productos]);
useEffect(() => {
  if (tipo === "porcentaje" && selected.length > 1) {
    onChange([]); // limpiar carrito
    setModalMessage("Las promociones individuales solo permiten un producto. Carrito limpiado.");
  }
}, [tipo]);

  // Cerrar modal automáticamente después de 2 seg
  useEffect(() => {
    if (modalMessage) {
      const timer = setTimeout(() => setModalMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [modalMessage]);

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4 relative">
      <h3 className="text-lg font-semibold text-gray-700">
        Productos en promoción
      </h3>

      {/* Modal */}
      {modalMessage && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-rojo-claro text-white p-2 rounded shadow z-10">
          {modalMessage}
        </div>
      )}

      {/* Selección de producto */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="col-span-1 md:col-span-2">
          <label className="block font-medium mb-1">Producto</label>
          <Select
            options={options}
            value={selectedOption}
            onChange={(option) => setSelectedOption(option)}
            placeholder="Seleccionar producto..."
            isClearable
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="cantidad" className="block font-medium mb-1">
            Cantidad a comprar
          </label>
          <input
            id="cantidad"
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="border p-2 rounded w-full"
            placeholder="Ingrese la cantidad"
          />
        </div>

        <div className="col-span-1">
          <label htmlFor="descuento" className="block font-medium mb-1">
            Descuento individual (Opcional)
          </label>
          <input
            id="descuento"
            type="number"
            min={0}
            max={100}
            value={descuento}
            onChange={(e) => setDescuento(Number(e.target.value))}
            className="border p-2 rounded w-full"
            placeholder="Ingrese el descuento"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="bg-azul-medio text-white px-3 py-1 rounded hover:bg-azul-hover font-bold"
      >
        Agregar producto
      </button>

      {/* Lista de productos */}
      <table className="w-full border-collapse border border-gray-300 text-sm mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Producto</th>
            <th className="border p-2">Cantidad</th>
            <th className="border p-2">Descuento(%)</th>
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
                    onChange={(e) =>
                      handleUpdate(p.product_id, "cantidad", Number(e.target.value))
                    }
                    className="border px-2 py-1 w-20 text-center rounded"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={p.descuento}
                    onChange={(e) =>
                      handleUpdate(p.product_id, "descuento", Number(e.target.value))
                    }
                    className="border px-2 py-1 w-20 text-center rounded"
                  />
                </td>
                <td className="border p-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemove(p.product_id)}
                    className="text-white bg-rojo-claro hover:bg-rojo-oscuro px-3 py-1 rounded font-bold"
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
