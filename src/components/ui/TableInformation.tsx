interface TableInformationProps {
  headers: string[];
  tableContent?: any[];
  button?: React.ReactNode[];
  //array de strings y hacer for para poner datos
}

export default function TableInformation(props: TableInformationProps) {
  return (
    <main className="w-5/6 p-6 pt-20" >
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {props.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          {/* Cada objeto creado en inventary se va a transformar en una fila */}
          <tbody className="bg-white divide-y divide-gray-200">
            {props.tableContent?.map((row, index) => (
                <tr key={index}>
                    {/* Object se usa para que cada dato del objeto se ponga en una celda, hasta terminar con los datos */}
                    {/* key(row) devuelve un arreglo con las claves del objeto (como ID, Nombre, Stock) */}
                    {Object.keys(row).map((key) =>(
                        <td key= {key} className="px-6 py-4 text-left text-xs font-medium text-gray-500">
                            {/* asocia la propiedad con el valor de la clave */}
                            {row[key]}
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
