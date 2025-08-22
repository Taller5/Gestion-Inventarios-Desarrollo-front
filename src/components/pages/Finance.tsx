import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import Container from "../ui/Container";

const btn1 = (<Button text="Inventario" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/Inventary" ></Button>)
const btn2 = (<Button text="Registro de Ingresos" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left " to="/finance" ></Button>)
const btn3 = (<Button text="Clientes y Fidelización " style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left " to="/customer" ></Button>)
const btn4 = (<Button text="Personal y Roles" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/employees" ></Button>)
const btn5 = (<Button text="Perfil" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/profile" ></Button>)
const sideBarButtons = [btn1, btn2, btn3, btn4, btn5]

export default function Finance() {
    return (

        <Container page=
        {
            <div className="flex">

            <SideBar button={sideBarButtons}></SideBar>

            <div className="w-full pl-10">
                <h1 className="text-2xl font-bold h-5 pt-10">Registro de ingresos</h1>
            </div>
            
        </div>
        }/>
        
    );
}