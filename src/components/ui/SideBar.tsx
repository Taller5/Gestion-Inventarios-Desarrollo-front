import React from "react";
import Button from "./Button";


interface SideBarProps {
  role: string;
}

export default function SideBar(props: SideBarProps) {


const btnInventario = (<Button text="Inventario" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/Inventary" ></Button>)
const btnRegistroIngresos = (<Button text="Registro de Ingresos" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left " to="/finance" ></Button>)
const btnClientes = (<Button text="Clientes y Fidelización " style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left " to="/customer" ></Button>)
const btnPersonal = (<Button text="Personal y Roles" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/employees" ></Button>)
const btnPerfil = (<Button text="Perfil" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/profile" ></Button>)
const btnHomepage = (<Button text="Home page" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/homepage" ></Button>)
const sideBarButtons = [btnInventario, btnRegistroIngresos, btnClientes, btnPersonal, btnPerfil,btnHomepage];


switch (props.role) {
  case "supervisor":
    // supervisor ya tiene sus botones por defecto, no hacer nada
    break;
  case "vendedor":
    sideBarButtons.splice(3, 1); // Eliminar "Personal y Roles" 3 es el índice de "Personal y Roles"
    sideBarButtons.splice(1, 1); // Eliminar "Registro de Ingresos" 1 es el índice de "Registro de Ingresos"
    
    break;

  case "bodeguero":
    //se debe de borrar en orden inverso para no alterar los índices
    sideBarButtons.splice(3, 1); // Eliminar "Personal y Roles" 3 es el índice de "Personal y Roles"
    sideBarButtons.splice(2, 1); // Eliminar "Clientes y Fidelización" 2 es el índice de "Clientes y Fidelización"
    sideBarButtons.splice(1, 1); // Eliminar "Registro de Ingresos" 1 es el índice de "Registro de Ingresos"
    
    break;

  default:
    break;
}


  return (
    <section className="bg-azul-oscuro h-screen w-1/6 min-w-[200px] flex flex-col">
      <div className="pt-10 flex flex-col gap-3">
        {Array.isArray(sideBarButtons) &&
          sideBarButtons.map((btn, index) => (
            <div
              key={index}
              className="flex items-center gap-2 mb-3 w-full pl-6 hover:bg-azul-fuerte duration-300 cursor-pointer rounded-lg"
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
