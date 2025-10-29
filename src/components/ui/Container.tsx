import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import SideBar from "./SideBar";
import Form from "./Form";
import InformationCards from "./informationCards";
import MiniCards from "./MiniCards";
import SimpleModal from "./SimpleModal";
import { LoginService } from "../services/LoginService";
import { MdOutlineMail } from "react-icons/md";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaRegCopyright } from "react-icons/fa6";

interface NavProps {
  logo?: string;
  button?: React.ReactNode;
  title?: string;
  inputs?: React.ReactNode[];
  text?: string;
}
interface FormProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string;
  title?: string;
  buttonText?: string;
}
interface CardItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
}
interface InformationCardsProps {
  title?: string;
  text?: string;
  cards?: CardItem[];
  buttonText?: string;
  onButtonClick?: () => void;
  containerClassName?: string;
  buttonClassName?: string;
  isMiniCard?: boolean;
  image?: string;
}
interface MiniCardsProps {
  title?: string;
  text?: string;
  button?: React.ReactNode[];
  image?: string;
}
interface ContainerProps {
  form?: FormProps;
  nav?: NavProps;
  informationCardsProps?: InformationCardsProps | InformationCardsProps[];
  miniCards?: MiniCardsProps | MiniCardsProps[];
  page?: any;
}

export default function Container(props: ContainerProps) {
  const [user, setUser] = useState<any>(null);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Manejar usuario loggeado ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleUserUpdate = () => {
      const updated = localStorage.getItem("user");
      setUser(updated ? JSON.parse(updated) : null);
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  // --- Modal por inactividad ---
  useEffect(() => {
    LoginService.setInactivityCallback(() => setShowInactivityModal(true));
  }, []);

  const handleCloseModal = () => {
    setShowInactivityModal(false);
    window.location.href = "/login";
  };

  const handleOpenSidebar = () => setIsSidebarOpen(true);
  const handleCloseSidebar = () => setIsSidebarOpen(false);

  // --- Normalizar arrays ---
  const informationCardsArray = Array.isArray(props.informationCardsProps)
    ? props.informationCardsProps
    : props.informationCardsProps
    ? [props.informationCardsProps]
    : [];

  const miniCardsArray = Array.isArray(props.miniCards)
    ? props.miniCards
    : props.miniCards
    ? [props.miniCards]
    : [];

  // --- Contenido de página ---
  let pageContent;
  if (props.form) pageContent = <Form {...props.form} />;
  else if (informationCardsArray.length) {
    pageContent = (
      <>
        {informationCardsArray.map((infoCard, idx) =>
          infoCard.isMiniCard ? (
            <MiniCards key={idx} {...infoCard} />
          ) : (
            <InformationCards key={idx} {...infoCard} />
          )
        )}
        {miniCardsArray.map((miniCard, idx) => (
          <MiniCards key={idx} {...miniCard} />
        ))}
      </>
    );
  } else if (props.page) pageContent = <div>{props.page}</div>;
  else pageContent = <div className="bg-white">Error</div>;

  // --- Mostrar sidebar solo si hay usuario y no estamos en login/home ---
  const showSidebar =
    user &&
    window.location.pathname !== "/" &&
    window.location.pathname !== "/login";
useEffect(() => {
  if (isSidebarOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
  return () => {
    document.body.style.overflow = "auto";
  };
}, [isSidebarOpen]);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav siempre visible, ahora recibe función para abrir sidebar */}
      <Nav {...props.nav} onHamburgerClick={handleOpenSidebar} />

      {/* Contenedor principal */}
      <div className="flex flex-1 w-full">
        {showSidebar && (
          <SideBar
            role={user.role}
            isOpen={isSidebarOpen} // Para mobile
            onClose={handleCloseSidebar} // Cerrar al dar click fuera o ✕
          />
        )}
        <main className="flex flex-col flex-grow p-4">{pageContent}</main>
      </div>







      {/* Modal de inactividad */}
      {showInactivityModal && (
        <SimpleModal
          open={showInactivityModal}
          onClose={handleCloseModal}
          title="Sesión finalizada"
        >
          <p>Tu sesión ha sido cerrada por inactividad.</p>
          <button
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
            onClick={handleCloseModal}
          >
            Ir a login
          </button>
        </SimpleModal>
      )}

      {/* Footer */}
      <footer className="w-full bg-sky-950 text-white py-3 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-2 text-center">
          <div className="text-2xl font-bold tracking-wide">Gestior</div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <a
              href="mailto:tallermultimedia50@gmail.com"
              className="flex items-center gap-2 hover:underline hover:text-sky-300 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MdOutlineMail className="text-xl" />
              tallermultimedia50@gmail.com
            </a>
            <a
              href="https://www.facebook.com/share/1Vhk2M7crA/"
              className="flex items-center gap-2 hover:underline hover:text-sky-300 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook className="text-xl" />
              Facebook
            </a>
            <a
              href="https://www.instagram.com/"
              className="flex items-center gap-2 hover:underline hover:text-sky-300 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className="text-xl" />
              Instagram
            </a>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-400">
            <FaRegCopyright />
            <span>2025 Gestior. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
