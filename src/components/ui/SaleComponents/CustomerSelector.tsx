import { IoSearch, IoPersonAdd } from "react-icons/io5";
import Button from "../Button";
import { MdStore } from "react-icons/md";
import { FaRegCircleUser } from 'react-icons/fa6';
import type { Customer } from "../../../types/salePage";
import InfoIcon from "../InfoIcon";

interface Props {
  queryCliente: string;
  setQueryCliente: (q: string) => void;
  clientesFiltrados: Customer[];
  clienteSeleccionado: Customer | null;
  setClienteSeleccionado: (c: Customer | null) => void;
  setModalSucursal: (open: boolean) => void;
  sucursalSeleccionada: any;
  modalSucursal?: boolean;
  documentType: 'auto' | '04' | '01';
  setDocumentType: (v: 'auto' | '04' | '01') => void;
}

export default function CustomerSelector({
  queryCliente,
  setQueryCliente,
  clientesFiltrados,
  clienteSeleccionado,
  setClienteSeleccionado,
  setModalSucursal,
  sucursalSeleccionada,
  modalSucursal = false,
  documentType,
  setDocumentType,
}: Props) {
  return (
  <div className="mb-6 w-full  mx-auto">
      {/* Selectores compactos */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="text-lg font-semibold  flex items-center gap-2">
          Comprobante
          
        </span>
        <select
          className="cursor-pointer min-h-[34px] text-lg  text-black rounded px-3 py-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as 'auto' | '04' | '01')}
        >
          <option value="auto">Generar factura (sin envio)</option>
          <option value="04">Tiquete electrónico</option>
          <option value="01">Factura electrónica</option>
        </select>
        <InfoIcon
            title="Tipo de documento"
            description={
              "Generar factura: Crea el comprobante internamente sin intentar enviarlo a Hacienda. Útil para pruebas o registros internos.\n" +
              "Tiquete Electrónico: Documento simplificado para ventas rápidas y clientes genéricos; no requiere todos los datos del receptor y se puede enviar a Hacienda.\n" +
              "Factura Electrónica: Comprobante fiscal completo obligatorio para clientes con identificación válida; se envía a Hacienda y genera XML fiscal."
            }
            containerClassName="whitespace-pre-line w-96 sm:w-[40rem]"
          />
      </div>
      {/* Buscador */}
      <div className="relative mb-2 w-full">
        <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
        <input
          type="text"
          placeholder="Buscar cliente por cédula..."
          className="border rounded pl-10 pr-3 py-2 w-full"
          value={queryCliente}
          onChange={(e) => setQueryCliente(e.target.value)}
        />
      </div>

      {/* Resultados */}
      {queryCliente && (
        <div className="max-h-40 overflow-y-auto border rounded bg-white">
          {clientesFiltrados
            .filter(
              (cliente) =>
                cliente.name.toLowerCase().includes(queryCliente.toLowerCase()) ||
                (cliente.identity_number ?? "").includes(queryCliente)
            )
            .map((cliente) => (
              <div
                key={cliente.customer_id}
                className={`px-4 py-2 cursor-pointer hover:bg-gris-claro break-words ${
                  clienteSeleccionado?.customer_id === cliente.customer_id
                    ? "bg-gris-oscuro font-bold"
                    : ""
                }`}
                onClick={() => {
                  setClienteSeleccionado(cliente);
                  setQueryCliente("");
                }}
              >
                {cliente.name}{" "}
                {cliente.identity_number && (
                  <span className="text-gray-500 ml-2">
                    Cédula: {cliente.identity_number}
                  </span>
                )}
              </div>
            ))}
          {clientesFiltrados.filter(
            (cliente) =>
              cliente.name.toLowerCase().includes(queryCliente.toLowerCase()) ||
              (cliente.identity_number ?? "").includes(queryCliente)
          ).length === 0 && (
            <p className="px-4 py-2 text-red-500 text-sm">
              No existe ningún cliente con ese nombre o cédula.
            </p>
          )}
        </div>
      )}

      {/* Cliente seleccionado */}
      {clienteSeleccionado && (
        <p className="mt-2 font-bold text-azul-hover break-words">
          Cliente seleccionado: {clienteSeleccionado.name} ({clienteSeleccionado.identity_number})
        </p>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full">
        <Button
          style="bg-verde-claro hover:bg-verde-oscuro text-white font-bold px-5 py-2 rounded-lg shadow-md transition-transform duration-150 transform flex items-center justify-center w-full sm:w-auto cursor-pointer"
          onClick={() => (window.location.href = "/customer")}
        >
          <IoPersonAdd className="mr-2" size={18} /> Nuevo cliente
        </Button>

        <Button
          style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-5 py-2 rounded-lg shadow-md transition-transform duration-150 transform flex items-center justify-center w-full sm:w-auto cursor-pointer"
          onClick={() => setClienteSeleccionado({
            customer_id: 0,
            name: 'Cliente genérico',
            identity_number: 'N/A'
          })}
        >
          <FaRegCircleUser className="mr-1" size={20} /> Cliente genérico
        </Button>
        {documentType === '01' && clienteSeleccionado?.identity_number === 'N/A' && (
          <p className="text-red-600 text-normal font-semibold">Seleccione un cliente real para Factura electrónica.</p>
        )}
      </div>

      {/* Info Sucursal */}
      {sucursalSeleccionada && !modalSucursal && (
        <div className="w-full flex flex-col md:flex-row md:items-center items-start mb-6 gap-2 md:gap-6 mt-4">
          <button
            className="px-4 py-2 bg-azul-medio hover:bg-azul-hover text-white font-bold rounded-lg shadow transition-colors duration-200 cursor-pointer flex flex-row justify-center md:justify-start w-full md:w-auto"
            onClick={() => setModalSucursal(true)}
          >
            <MdStore className="mr-2 mt-0.5" size={20}/> Cambiar sucursal
          </button>
          <span className="text-black font-semibold text-left md:text-right break-words">
            Sucursal actual: {sucursalSeleccionada.nombre} - {sucursalSeleccionada.business.nombre_comercial}
          </span>
        </div>
      )}
    </div>
  );
}
