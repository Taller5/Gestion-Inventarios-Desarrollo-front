interface TableInformationProps {
  headers: string[];
  tableContent?: any[];
  button?: React.ReactNode[];
  loading?: boolean;
  skeletonRows?: number;
    compact?: boolean; // <-- Nueva prop
}

const headerMap: Record<string, string> = {
  id: "ID",
  name: "Nombre",
  rol: "Rol",
  contact: "Contacto",
  state: "Estado",
  phone: "Teléfono",
  actions: "Acciones",
  branch_name: "Sucursal",
  date: "Fecha de la factura",
  customer_name: "Cliente",
  payment_method: "Método de pago",
  // Nuevos encabezados para Reporte Hacienda
  business_nombre: "Negocio",
  tipo: "Tipo",
  fecha: "Fecha",
  clave: "Clave",
  hacienda_estado: "Estado Hacienda",
  xml: "XML Generado",
  xml_respuesta: "XML Respuesta",
};

const formatearTelefono = (numero: string | number) => {
  if (!numero) return "";
  const limpio = numero.toString().replace(/\D/g, ""); // elimina todo menos dígitos
  return limpio.replace(/(\d{4})(\d{4})/, "$1 $2");
};
import { useState, useEffect } from "react";

export default function TableInformation(props: TableInformationProps) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Si el ancho es menor a 1024px (laptop pequeña), usamos cards
  const useCards = windowWidth < 1024;
  const isLoading = !!props.loading;
  const skRows = props.skeletonRows ?? 6;
// Clases ajustadas si compact es true
const cardPadding = props.compact ? "p-0.5" : "p-4";     // padding casi nulo
const rowPadding = props.compact ? "py-0.25" : "py-2";   // altura mínima






return (
    <main className="w-full md:pl-1 pt-8">
      {!useCards ? (
        // --- Tabla Desktop ---
        <div className="overflow-x-hidden overflow-y-auto rounded-lg max-w-full max-h-[500px] pr-4">
          <table className="min-w-full table-auto divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {props.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-2 py-2 text-left font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    {headerMap[header] ?? header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading
                ? Array.from({ length: skRows }).map((_, rowIndex) => (
                    <tr key={`sk-${rowIndex}`} className="animate-pulse">
                      {props.headers.map((_, colIndex) => (
                        <td key={colIndex} className="px-2 py-3">
                          <div className="h-4 bg-gray-200 rounded w-24 md:w-32" />
                        </td>
                      ))}
                    </tr>
                  ))
                : props.tableContent?.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {props.headers.map((header, colIndex) => (
                        <td key={colIndex} className={`px-2 py-2 `}>
                          {header === "phone"
                            ? formatearTelefono(row[header])
                            : row[header] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      ) : (
        // --- Cards Mobile / Laptop pequeña ---
        <div className="flex flex-col gap-2 px-2">
          {isLoading
            ? Array.from({ length: skRows }).map((_, rowIndex) => (
                <div
                  key={`skc-${rowIndex}`}
                  className={`bg-white shadow rounded-lg ${cardPadding} flex flex-col animate-pulse`}
                >
                  {props.headers.map((header, colIndex) => (
                    <div
                      key={colIndex}
                      className={`flex justify-between ${rowPadding} border-b last:border-b-0`}
                    >
                      <span className="font-semibold text-gray-700">
                        {headerMap[header] ?? header}
                      </span>
                      <span className="text-gray-600">
                        <span className="inline-block h-4 bg-gray-200 rounded w-24" />
                      </span>
                    </div>
                  ))}
                </div>
              ))
            : props.tableContent?.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`bg-white shadow rounded-lg ${cardPadding} flex flex-col`}
                >
                  {props.headers.map((header, colIndex) => (
                    <div
                      key={colIndex}
                      className={`flex justify-between ${rowPadding} border-b last:border-b-0`}
                    >
                      <span className="font-semibold text-gray-700">
                        {headerMap[header] ?? header}
                      </span>
                      <span className="text-gray-600">
                        {header === "phone"
                          ? formatearTelefono(row[header])
                          : row[header] ?? ""}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
        </div>
      )}
    </main>
  );
}