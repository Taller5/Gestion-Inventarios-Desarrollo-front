interface TableInformationProps {
  headers: string[];
  tableContent?: any[];
  button?: React.ReactNode[];
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
};

const formatearTelefono = (numero: string | number) => {
  if (!numero) return "";
  const limpio = numero.toString().replace(/\D/g, ""); // elimina todo menos dígitos
  return limpio.replace(/(\d{4})(\d{4})/, "$1 $2");
};
export default function TableInformation(props: TableInformationProps) {
  return (
    <main className="w-full pl-1 md:pl-4 pt-8">
      {/* --- Tabla Desktop --- */}
      <div className="hidden md:block overflow-x-auto overflow-y-auto
          shadow-md rounded-lg max-w-[95%] ml-0
          max-h-[500px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {props.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-3 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide"
                >
                  {headerMap[header] ?? header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {props.tableContent?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                {props.headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-3 py-3 text-sm text-gray-600">
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

      {/* --- Cards Mobile --- */}
      <div className="md:hidden flex flex-col gap-4">
        {props.tableContent?.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="bg-white shadow rounded-lg p-4 flex flex-col gap-2"
          >
            {props.headers.map((header, colIndex) => (
              <div key={colIndex} className="flex justify-between">
                <span className="font-semibold text-gray-700">{headerMap[header] ?? header}</span>
                <span className="text-gray-600">
                  {header === "phone" ? formatearTelefono(row[header]) : row[header] ?? ""}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
