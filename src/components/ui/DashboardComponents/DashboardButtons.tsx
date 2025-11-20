import { MdBusiness, MdInventory, MdPerson, MdWarehouse , MdPeople, MdPointOfSale, MdPayments } from "react-icons/md";

interface DashboardButtonsProps {
    role: string;
}

export default function DashboardButtons(props: DashboardButtonsProps) {

    switch (props.role) {
        case 'bodeguero':
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <a
                href="/warehouses"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdWarehouse size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Gestionar bodegas
                </h3>
              </a>

              <a
                href="/inventary"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdInventory size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Gestionar productos
                </h3>
              </a>
            </div>
            );
        case 'vendedor':
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <a
                href="/customer"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdPeople size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Gestionar clientes
                </h3>
              </a>

              <a
                href="/salesPage"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdPointOfSale size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Ir al punto de venta
                </h3>
              </a>

              <a
                href="/cashRegisterPage"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdPayments size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Gestionar cajas
                </h3>
              </a>
            </div>
            );
        default:
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <a
                href="/employees"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdPerson size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Gestionar colaboradores
                </h3>
              </a>

              <a
                href="/businesses"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdBusiness size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Gestionar negocios
                </h3>
              </a>

              <a
                href="/inventary"
                className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
              >
                <MdInventory size={32} className="text-azul-medio mb-2 sm:mb-2" />
                <h3 className="font-semibold text-center text-base sm:text-lg">
                  Gestionar productos
                </h3>
              </a>
            </div>
            );
    }
}

export function ColaboradoresButton() {
  return (
    <a
      href="/employees"
      className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
    >
      <MdPerson size={32} className="text-azul-medio mb-2 sm:mb-2" />
      <h3 className="font-semibold text-center text-base sm:text-lg">
        Gestionar colaboradores
      </h3>
    </a>
  );
}

export function NegociosButton() {
  return (
    <a
      href="/businesses"
      className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
    >
      <MdBusiness size={32} className="text-azul-medio mb-2 sm:mb-2" />
      <h3 className="font-semibold text-center text-base sm:text-lg">
        Gestionar negocios
      </h3>
    </a>
  );
}

export function ProductosButton() {
  return (
    <a
      href="/inventary"
      className="rounded-lg border border-gris-ultra-claro flex flex-col items-center p-4 sm:p-6 hover:scale-105 hover:text-azul-medio transition-transform shadow-sm hover:shadow-md bg-white"
    >
      <MdInventory size={32} className="text-azul-medio mb-2 sm:mb-2" />
      <h3 className="font-semibold text-center text-base sm:text-lg">
        Gestionar productos
      </h3>
    </a>
  );
}