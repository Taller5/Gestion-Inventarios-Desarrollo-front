import React from "react";
import Button from "./Button";


interface SideBarProps {
  role: string;
}

export default function SideBar(props: SideBarProps) {


const btnInventario = (<Button text="Inventario" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/Inventary" ></Button>)
const btnRegistroIngresos = (<Button text="Registro de Ingresos" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left " to="/finance" ></Button>)
const btnClientes = (<Button text="Clientes y Fidelización" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/customer" ></Button>)
const btnPersonal = (<Button text="Personal y Roles" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/employees" ></Button>)
const btnNegocios = (<Button text="Negocios" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/businesses" ></Button>)
const btnSucursales = (<Button text="Sucursales" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/branches" ></Button>)
const btnBodegas = (<Button text="Bodegas" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/warehouses" ></Button>)
const btnPerfil = (<Button text="Perfil" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/profile" ></Button>)

// Botones base para todos los usuarios
let sideBarButtons = [btnInventario, btnRegistroIngresos, btnClientes, btnPersonal, btnBodegas, btnPerfil];

// Agregar botones adicionales para administradores y supervisores
if (props.role === 'administrador' || props.role === 'supervisor') {
    sideBarButtons.splice(4, 0, btnNegocios, btnSucursales);
}


switch (props.role) {
  case "supervisor":
    // supervisor ya tiene sus botones por defecto, incluyendo los nuevos módulos
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


  return (
    <section className="bg-sky-700 h-screen w-1/6 min-w-[200px] flex flex-col">
      <div className="pt-10 flex flex-col gap-3">
        {Array.isArray(sideBarButtons) &&
          sideBarButtons.map((btn, index) => (
            <div
              key={index}
              className="flex items-center gap-2 mb-3 w-full pl-6 hover:bg-sky-600 duration-300 cursor-pointer rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 flex-shrink-0 text-white"
                 viewBox="0 0 24 24"
                fill="currentColor"
>
  <path d="M21 16V8a1 1 0 0 0-.553-.894l-8-4a1 1 0 0 0-.894 0l-8 4A1 1 0 0 0 3 8v8a1 1 0 0 0 .553.894l8 4a1 1 0 0 0 .894 0l8-4A1 1 0 0 0 21 16zm-9 2.618L5 15.236V9.764l7 3.382 7-3.382v5.472l-7 3.382z" />
</svg>
              <div className="flex-1">{btn}</div>
            </div>
          ))}
      </div>
    </section>
  );
}
