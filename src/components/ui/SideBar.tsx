import React, { useState, useEffect, type JSX } from "react";
import Button from "./Button";
import { TbReportSearch, TbReportMoney } from "react-icons/tb";
import { HiOutlineChartBar } from "react-icons/hi";
import { ArrowUpRight  } from "lucide-react";
import { FaTruck } from "react-icons/fa";
import {
  MdInventory,
  MdPeople,
  MdPerson,
  MdBusiness,
  MdStore,
  MdWarehouse,
  MdAccountCircle,
  MdPointOfSale,
  MdLocalShipping,
  MdPayments,
  MdExpandMore,
  MdExpandLess,
  MdCategory,
  MdOutlineApartment,
  MdSavings,
  MdMonetizationOn,
  

} from "react-icons/md";
import { FaUsersGear } from "react-icons/fa6";
import { FaPercent } from "react-icons/fa6";
import { LayoutDashboard } from "lucide-react";
interface SideBarProps {
  role: string;
  isOpen?: boolean; // para mobile
  onClose?: () => void;
}

export default function SideBar({ role, isOpen, onClose }: SideBarProps) {
  const btnStyle =
    "bg-transparent font-bold text-white rounded p-1 cursor-pointer w-full text-left flex items-center gap-2";
  const currentPath = window.location.pathname.toLowerCase();

  // --- Secciones iniciales ---
  const initialSections: { [key: string]: boolean } = {
    "Administración de Productos": false,
    Gestión: false,
    Finanzas: false,
    "Administración de Usuarios": false,
    Reportes: false,
  };

  const sectionMap: { [key: string]: string } = {
    "/inventary": "Administración de Productos",
    "/provider": "Administración de Productos",
    "/salespage": "Administración de Productos",
    "/businesses": "Gestión",
    "/branches": "Gestión",
    "/warehouses": "Gestión",
    "/finance": "Finanzas",
    "/cashregisterpage": "Finanzas",
    "/customer": "Administración de Usuarios",
    "/employees": "Administración de Usuarios",
    "/saleReports": "Reportes",
    "/productReports": "Reportes",
    "/financeReports": "Reportes",
    "/promotionPage": "Promociones",
    "/financialReports": "Reportes de ganancias",
    "/egressPage": "Reportes de egresos",
    "/ingressPage": "Reportes de ingresos",
  };

  const currentSection = Object.keys(sectionMap).find((path) =>
    currentPath.startsWith(path)
  );
  if (currentSection) initialSections[sectionMap[currentSection]] = true;

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    initialSections
  );

  const handleToggleSection = (title: string) => {
    setOpenSections((prev) => {
      const newState: { [key: string]: boolean } = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      newState[title] = !prev[title];
      return newState;
    });
  };

  // --- Botones ---
  const btnInventario = (
    <Button style={btnStyle} to="/Inventary">
      <MdInventory size={20} color="white" /> Inventario
    </Button>
  );

  const btnClientes = (
    <Button style={btnStyle} to="/customer">
      <MdPeople size={20} color="white" /> Clientes y Fidelización
    </Button>
  );
  const btnPersonal = (
    <Button style={btnStyle} to="/employees">
      <MdPerson size={20} color="white" /> Personal y Roles
    </Button>
  );
  const btnNegocios = (
    <Button style={btnStyle} to="/businesses">
      <MdBusiness size={20} color="white" /> Negocios
    </Button>
  );
  const btnSucursales = (
    <Button style={btnStyle} to="/branches">
      <MdStore size={20} color="white" /> Sucursales
    </Button>
  );
  const btnBodegas = (
    <Button style={btnStyle} to="/warehouses">
      <MdWarehouse size={20} color="white" /> Bodegas
    </Button>
  );
  const btnSalesPages = (
    <Button style={btnStyle} to="/salesPage">
      <MdPointOfSale size={20} color="white" /> Punto de Venta
    </Button>
  );
  const btnProvider = (
    <Button style={btnStyle} to="/Provider">
      <MdLocalShipping size={20} color="white" /> Proveedores
    </Button>
  );
  const btnCashRegisterPage = (
    <Button style={btnStyle} to="/cashRegisterPage">
      <MdPayments size={20} color="white" /> Cajas
    </Button>
  );
  const btnSaleReports = (
    <Button style={btnStyle} to="/saleReports">
      <TbReportMoney size={20} color="white" /> Reportes de Ventas
    </Button>
  );
  const btnProductReports = (
    <Button style={btnStyle} to="/productReports">
      <HiOutlineChartBar size={20} color="white" /> Reportes de Productos
    </Button>
  );
  const btnPromociones = (
    <Button style={btnStyle} to="/promotionPage">
      <FaPercent size={20} color="white" /> Promociones
    </Button>
  );
  const btnFinanceReports = (
    <Button style={btnStyle} to="/financialReports">
      <MdMonetizationOn size={20} color="white" /> Reportes de Ganancias
    </Button>

  );
  const btnEgresos = (
    <Button style={btnStyle} to="/egressPage">
      <ArrowUpRight size={20} color="white" /> Reportes de Egresos
    </Button>
  );

  const btnIngresos = (
    <Button style={btnStyle} to="/ingressPage">
      <FaTruck  size={20} color="white" /> Reportes de Ingresos
    </Button>
  );
  const btnHaciendaReports = (
    <Button style={btnStyle} to="/haciendaReport">
      <TbReportSearch size={20} color="white" /> Reportes Hacienda
    </Button>
  );

  const sectionIcons: { [key: string]: JSX.Element } = {
    "Administración de Productos": <MdCategory size={20} color="white" />,
    Gestión: <MdOutlineApartment size={20} color="white" />,
    Finanzas: <MdSavings size={20} color="white" />,
    Reportes: <TbReportSearch size={20} color="white" />,
    "Administración de Usuarios": <FaUsersGear size={20} color="white" />,
  };

  let sections: { [key: string]: JSX.Element[] } = {};

  if (role === "bodeguero") {
    sections = {
      "Administración de Productos": [btnInventario],
      Gestión: [btnBodegas],
      Finanzas: [],
      "Administración de Usuarios": [],
    };
  } else if (role === "vendedor") {
    sections = {
      Gestión: [],
      Finanzas: [btnCashRegisterPage, btnSalesPages],
      "Administración de Usuarios": [btnClientes],
    };
  } else {
    sections = {
      "Administración de Productos": [
        btnInventario,
        btnProvider,
        btnPromociones,
      ],
      Gestión: [btnNegocios, btnSucursales, btnBodegas],
      Finanzas: [btnCashRegisterPage, btnSalesPages],
      "Administración de Usuarios": [btnClientes, btnPersonal],
      Reportes: [btnSaleReports, btnProductReports, btnFinanceReports, btnEgresos, btnIngresos, btnHaciendaReports],
    };
  }

  const renderButtons = (buttons: JSX.Element[]) =>
    buttons.map((btn, i) => {
      const btnPath = (btn.props.to || "").toLowerCase();
      const isActive =
        currentPath === btnPath || currentPath.startsWith(btnPath + "/");
      return (
        <div
          key={i}
          className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center gap-2 mb-2 w-full rounded-xl pl-4 cursor-pointer
            ${isActive ? "bg-azul-medio" : "hover:bg-azul-hover"}`}
        >
          {React.cloneElement(btn, { className: "flex-1" })}
        </div>
      );
    });

  const Section = ({
    title,
    buttons,
  }: {
    title: string;
    buttons: JSX.Element[];
  }) => {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const open = openSections[title] ?? false;
    const [maxHeight, setMaxHeight] = useState(open ? "500px" : "0px");

    useEffect(() => {
      if (contentRef.current) {
        setMaxHeight(open ? `${contentRef.current.scrollHeight}px` : "0px");
      }
    }, [open, buttons]);

    if (buttons.length === 0) return null;

    return (
      <div className="w-11/12">
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleToggleSection(title)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggleSection(title);
            }
          }}
          className="flex items-center justify-between mb-2 w-full rounded-xl pl-4 pr-2 py-2 cursor-pointer hover:bg-azul-hover"
        >
          <span className="flex items-center gap-2 text-white font-bold">
            {sectionIcons[title]} {title}
          </span>
          {open ? (
            <MdExpandLess color="white" />
          ) : (
            <MdExpandMore color="white" />
          )}
        </div>

        <div
          ref={contentRef}
          className="ml-6 flex flex-col gap-1 overflow-hidden transition-[max-height] duration-300 ease-in-out"
          style={{ maxHeight }}
        >
          {renderButtons(buttons)}
        </div>
      </div>
    );
  };

  const API_URL = import.meta.env.VITE_API_URL;

  const [user, setUser] = useState<{
    name?: string;
    username?: string;
    profile_photo?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({ ...parsedUser, role: parsedUser.role || "desconocido" });
    }
    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) {
        const parsedUser = JSON.parse(updatedUser);
        setUser({ ...parsedUser, role: parsedUser.role || "desconocido" });
      }
    };
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);
 // Bloquear scroll del body mientras el sidebar móvil está abierto
useEffect(() => {
  if (isOpen) {
    // Guardar la posición actual del scroll
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  } else {
    // Restaurar scroll
    const scrollY = -parseInt(document.body.style.top || '0', 10);
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, scrollY);
  }

  // Cleanup cuando se desmonta
  return () => {
    const scrollY = -parseInt(document.body.style.top || '0', 10);
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    window.scrollTo(0, scrollY);
  };
}, [isOpen]);

  // ------------------------------
  // Render Sidebar
  // ------------------------------
  const sidebarContent = (
    <div className="pt-4 flex flex-col items-center gap-4 w-full">
      {/* Perfil */}
      <div
        role="button"
        tabIndex={0}
        className="w-11/12 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-4 cursor-pointer hover:bg-white/20 transition"
        onClick={() => (window.location.href = "/profile")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ")
            window.location.href = "/profile";
        }}
      >
        <div className="bg-white/20 p-2 rounded-full flex items-center justify-center">
          {user?.profile_photo ? (
            <img
              className="w-12 h-12 rounded-full object-cover"
              src={
                user.profile_photo.startsWith("http")
                  ? user.profile_photo
                  : `${API_URL}/${user.profile_photo}`
              }
              alt="Foto de perfil"
            />
          ) : (
            <MdAccountCircle size={40} color="white" />
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-sky-200 font-bold text-sm uppercase tracking-wide">
            Perfil
          </span>
          <span className="text-white font-semibold text-base leading-tight">
            {user?.name || user?.username || "Usuario"}
          </span>
          <span className="text-gray-300 text-xs">
            {user?.role || "Rol desconocido"}
          </span>
        </div>
      </div>
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-3 w-[90%] mx-auto bg-white/10 hover:bg-azul-hover backdrop-blur-sm rounded-xl shadow-md p-3 cursor-pointer transition-all duration-300"
        onClick={() => (window.location.href = "/Dashboard")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ")
            window.location.href = "/Dashboard";
        }}
      >
        <div className="bg-white/20 p-2 rounded-full flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>

        <span className="text-white font-semibold text-base leading-tight">
          Panel de Control
        </span>
      </div>

      {/* Secciones */}
      <div className="w-full flex flex-col items-center gap-2">
        {Object.entries(sections).map(
          ([title, buttons]) =>
            buttons.length > 0 && (
              <Section key={title} title={title} buttons={buttons} />
            )
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar desktop */}
      <section className="bg-azul-oscuro w-1/6 min-w-[200px] min-h-screen flex-col pt-4 hidden lg:flex">
        {sidebarContent}
      </section>

{/* Sidebar mobile */}
{isOpen && (
  <section className="lg:hidden fixed inset-0 z-50 flex overflow-x-hidden">
    {/* Fondo semitransparente */}
    <div className="absolute inset-0 bg-black/30" onClick={onClose} />

    {/* Contenedor del sidebar */}
    <div className="relative w-64 min-h-screen bg-azul-oscuro flex flex-col pt-16 overflow-y-auto">
      {/* Botón de cerrar */}
      <button
        className="absolute top-4 right-4 text-white text-2xl z-20"
        onClick={onClose}
      >
        ✕
      </button>

      {/* Contenido */}
      {sidebarContent}
    </div>
  </section>
)}

</>

  );
}
