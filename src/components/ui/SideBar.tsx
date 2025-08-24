import React from "react";
import Button from "./Button";


interface SideBarProps {
  role: string;
}

export default function SideBar(props: SideBarProps) {

const btnCerrarSesion = (<Button text="Cerrar sesión" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/homepage" ></Button>)
const btnInventario = (<Button text="Inventario" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/Inventary" ></Button>)
const btnRegistroIngresos = (<Button text="Registro de Ingresos" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left " to="/finance" ></Button>)
const btnClientes = (<Button text="Clientes y Fidelización " style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left " to="/customer" ></Button>)
const btnPersonal = (<Button text="Personal y Roles" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/employees" ></Button>)
const btnPerfil = (<Button text="Perfil" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/profile" ></Button>)
const sideBarButtons = [btnInventario, btnRegistroIngresos, btnClientes, btnPersonal, btnPerfil, btnCerrarSesion];


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
                className="h-7 w-7 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.012c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.088 2.91.832.091-.646.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.274.098-2.656 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.338 1.909-1.295 2.748-1.025 2.748-1.025.546 1.382.202 2.402.1 2.656.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.138 20.175 22 16.427 22 12.012 22 6.484 17.523 2 12 2z" />
              </svg>
              <div className="flex-1">{btn}</div>
            </div>
          ))}
      </div>
    </section>
  );
}
