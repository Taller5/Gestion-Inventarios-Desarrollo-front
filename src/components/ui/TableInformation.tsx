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
};

export default function TableInformation(props: TableInformationProps) {
  return (
    <main className="w-full pl-1 md:pl-4 pt-8">
      <div className="overflow-x-auto shadow-md rounded-lg max-w-[95%] ml-0">
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
                  <td
                    key={colIndex}
                    className="px-3 py-3 text-sm text-gray-600"
                  >
                    {row[header] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}