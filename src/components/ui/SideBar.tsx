import React from "react";
import Button from "./Button";

interface SideBarProps {
  role: string;
}

export default function SideBar(props: SideBarProps) {

  const btnStyle = 'bg-transparent font-bold rounded p-1 cursor-pointer w-full text-left';

  const btnInventario = (<Button text="Inventario" style={btnStyle} to="/Inventary" />);
  const btnRegistroIngresos = (<Button text="Registro de Ingresos" style={btnStyle} to="/finance" />);
  const btnClientes = (<Button text="Clientes y Fidelización" style={btnStyle} to="/customer" />);
  const btnPersonal = (<Button text="Personal y Roles" style={btnStyle} to="/employees" />);
  const btnNegocios = (<Button text="Negocios" style={btnStyle} to="/businesses" />);
  const btnSucursales = (<Button text="Sucursales" style={btnStyle} to="/branches" />);
  const btnBodegas = (<Button text="Bodegas" style={btnStyle} to="/warehouses" />);
  const btnPerfil = (<Button text="Perfil" style={btnStyle} to="/profile" />);
  const btnSalesPages = (<Button text="Punto de Venta" style={btnStyle} to="/salesPage" />);
  const btnProvider = (<Button text="Proveedores" style={btnStyle} to="/Provider" />);
  const btnCashRegisterPage = (<Button text="Control de Caja" style={btnStyle} to="/cashRegisterPage" />);


  // Botones base para todos los usuarios
  let sideBarButtons = [btnInventario, btnRegistroIngresos, btnClientes, btnPersonal, btnBodegas, btnPerfil, btnProvider, btnCashRegisterPage];

  // Agregar botones adicionales para administradores y supervisores
  if (props.role === 'administrador' || props.role === 'supervisor') {
      sideBarButtons.splice(4, 0, btnNegocios, btnSucursales);
  }

  // Agregar Sales Pages para roles específicos
  if (["administrador", "supervisor", "vendedor"].includes(props.role)) {
    sideBarButtons.push(btnSalesPages);
  }

  switch (props.role) {
    case "supervisor":
      // supervisor ya tiene sus botones por defecto
      break;
    case "vendedor":
      // Eliminar módulos que no debe ver el vendedor
      sideBarButtons = sideBarButtons.filter(btn => 
        btn.props.text !== 'Personal y Roles' && 
        btn.props.text !== 'Registro de Ingresos' &&
        btn.props.text !== 'Negocios' &&
        btn.props.text !== 'Sucursales' &&
        btn.props.text !== 'Bodegas'
      );
      break;
    case "bodeguero":
      // Filtrar solo los módulos que debe ver el bodeguero
      sideBarButtons = sideBarButtons.filter(btn => 
        btn.props.text === 'Inventario' || 
        btn.props.text === 'Perfil' ||
        btn.props.text === 'Bodegas'
      );
      break;
    default:
      break;
  }

  // Obtener la ruta actual
  const currentPath = window.location.pathname.toLowerCase();

  return (
    <section className="bg-azul-oscuro w-1/6 min-w-[200px] min-h-220 flex flex-col pt-4">
      <div className="pt-10 flex items-center duration-700 flex-col gap-3">
        {Array.isArray(sideBarButtons) &&
          sideBarButtons.map((btn, index) => {
            const btnPath = (btn.props.to || "").toLowerCase();
            const isActive = currentPath === btnPath || currentPath.startsWith(btnPath + "/");
            // Mantener los estilos originales y solo agregar el color activo
            const originalStyle = 'bg-transparent  font-bold rounded p-1 cursor-pointer w-full text-left';
            const activeStyle = isActive ? "text-white font-bold" : "text-white";
            return (
              <div
                key={index}
                className={`flex items-center gap-2 mb-3 w-11/12 rounded-xl pl-4 duration-700 cursor-pointer
                  ${isActive ? "bg-azul-medio" : "hover:bg-azul-hover"}
                `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-7 w-7 flex-shrink-0 text-white`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21 16V8a1 1 0 0 0-.553-.894l-8-4a1 1 0 0 0-.894 0l-8 4A1 1 0 0 0 3 8v8a1 1 0 0 0 .553.894l8 4a1 1 0 0 0 .894 0l8-4A1 1 0 0 0 21 16zm-9 2.618L5 15.236V9.764l7 3.382 7-3.382v5.472l-7 3.382z" />
                </svg>
                <div className="flex-1">
                  {React.cloneElement(btn, {
                    style: `${originalStyle} ${activeStyle}`.trim()
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}