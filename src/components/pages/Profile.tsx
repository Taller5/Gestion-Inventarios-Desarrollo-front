import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import Container from "../ui/Container";

const btn1 = (<Button text="Cerrar sesión" style="bg-transparent text-red-900 font-bold rounded p-1 cursor-pointer w-full text-left" to="/homepage" ></Button>)
const btn2 = (<Button text="Inventario" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left" to="/Inventary" ></Button>)
const btn3 = (<Button text="Registro de Ingresos" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer w-full text-left " to="/finance" ></Button>)
const btn4 = (<Button text="Clientes y Fidelización " style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left " to="/customer" ></Button>)
const btn5 = (<Button text="Personal y Roles" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/employees" ></Button>)
const btn6 = (<Button text="Perfil" style="bg-transparent text-white font-bold rounded p-1 cursor-pointer  w-full text-left" to="/profile" ></Button>)
const sideBarButtons = [btn1, btn2, btn3, btn4, btn5, btn6]

interface ProfileProps {
  titleSection: string;
  textSection: string;

  labelPersonalInfo: string;
  labelName: string;
  labelEmail: string;

  labelChangePassword: string;
  labelCurrentPassword: string;
  labelNewPassword: string;
  labelConfirmPassword: string; 
}
export default function Profile(props: ProfileProps) {
    return (
        
        <Container page={
            <div className="flex">
            
                <SideBar button={sideBarButtons}></SideBar>
            
            <div className="w-full ">
    <section className="m-10">
      {/*Header Section*/}
      <section className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">{props.titleSection}</h1>
          <p>{props.textSection}</p>
        </div>

        <Button
          text="Guardar configuración"
          style="bg-azul-fuerte hover:bg-azul-oscuro cursortext-white px-4 py-2 rounded ml-2 text-white cursor-pointer"
        />
      </section>
      {/*End header section*/}
      <section className="grid grid-cols-2 gap-4">
        {/*Personal info section*/}
        <article className="bg-gris-claro p-4">
          <h2 className="text-lg font-bold ml-4 mb-10 mt-2">{props.labelPersonalInfo}</h2>
          {/*Profile Picture Section*/}
          <div className="flex flex-col items-center mb-2">
            <div className="mb-4">
              <img
                className="w-32 h-32 rounded-full mx-auto"
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                alt="Profile"
              />
            </div>
            <div className="flex p-3 gap-2 bg-azul-fuerte hover:bg-azul-oscuro">
             
              <Button
                text="Cambiar foto"
                style="text-white cursor-pointer"
              />
            </div>
          </div>

          {/*End picture section*/}

          {/*Form section*/}

         <form className="flex flex-col gap-4 px-8 mb-6" >
            <div>
              <label className="flex flex-col text-lg font-bold">
                {props.labelName}
                <input
                  className="bg-gris-oscuro pl-2 py-1 mt-2 font-normal text-base"
                  type="text"
                  required
                />
              </label>
            </div>

            <div>
              <label className="flex flex-col text-lg font-bold">
                {props.labelEmail}
                <input
                  className="bg-gris-oscuro pl-2 py-1 mt-2 font-normal text-base "
                  type="email"
                  required
                />
              </label>
            </div>
          </form>
          {/*End form section*/}
        </article>
        {/*End personal info section*/}

        {/*Change password section*/}
        <article className="bg-gris-claro p-4">
           <h2 className="text-lg font-bold ml-4 mb-10 mt-2">{props.labelChangePassword}</h2>
          <form className="flex flex-col gap-4 px-8 mb-6">
            <div>
              <label className="flex flex-col text-lg font-bold">{props.labelCurrentPassword}
              <input 
              className="bg-gris-oscuro pl-2 py-1 mt-2 font-normal text-base"
              type="password" 
              required/>
              </label>
            </div>

            <div>
              <label className="flex flex-col text-lg font-bold">{props.labelNewPassword}
              <input 
              className="bg-gris-oscuro pl-2 py-1 mt-2 font-normal text-base"
              type="password"
              required />
              </label>
            </div>
            <ul className="text-sm text-red-700 list-disc pl-5">
              <li >
                Al menos 8 caracteres 
              </li>
              <li >
                 Al menos una letra mayúscula 
              </li>
              <li>
               Al menos una letra minúscula 
              </li>
              <li>
                Al menos un número 
              </li>
              <li>
                Al menos un carácter especial 
              </li>
            </ul>
            <div>
               <label className="flex flex-col text-lg font-bold">{props.labelConfirmPassword}
              <input 
              className="bg-gris-oscuro pl-2 py-1 mt-2 font-normal text-base"
              type="password"
              required />
              </label>
            </div>
          </form>
        </article>

        {/*End change password section*/}
      </section>
    </section>
            </div>
        </div>

        }/>
        
    );
}