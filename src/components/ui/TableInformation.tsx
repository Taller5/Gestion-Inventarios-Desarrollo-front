interface TableInformationProps {
  headers: string[];
  tableContent?: any[];
  button?: React.ReactNode[];
  //array de strings y hacer for para poner datos
}

const headerMap: Record<string, string> = {
  id: "ID",
  name: "Nombre",
  rol: "Rol",
  contact: "Contacto",
  state: "Estado",
  phone: "Teléfono",
  actions: "Acciones"
};

export default function TableInformation(props: TableInformationProps) {
  return (
    <main className="w-5/6 p-auto pt-20" >
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {props.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {headerMap[header] ?? header}
                </th>
              ))}
            </tr>
          </thead>
          {/* Cada objeto creado en inventary se va a transformar en una fila */}
          <tbody className="bg-white divide-y divide-gray-200">
            {props.tableContent?.map((row, index) => (
              <tr key={index}>
                {props.headers.map((header) => (
                  <td key={header} className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                    {row[header] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
            <tr>

            </tr>
                
          </tbody>
        </table>
      </div>
    </main>
  );
}
