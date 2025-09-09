import { useState } from "react";
import Container from "../ui/Container";
import Button from "../ui/Button";
import { CiFacebook, CiInstagram, CiPhone, CiClock1 } from "react-icons/ci";
import { FaWhatsapp } from "react-icons/fa";
import { MdLogin } from "react-icons/md";

import { RiMoneyDollarCircleFill } from "react-icons/ri";

export default function Homepage() {
  //todo esto es para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("");
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const navProps = {
    button: (
      <Button
        text="Iniciar sesión"
        icon="/img/Profile.png"
        style="flex items-center gap-2 bg-verde-oscuro text-black px-4 py-1 rounded"
        to="/login"
      />
    ),
  };

  // Secciones InformationCards
  const informationCardsProps = [
    {
      title: "Bienvenido a Gestior",
      text: "Control total de tu negocio en una sola plataforma...",
      containerClassName: "bg-sky-700 text-white py-20 px-8 md:px-20",
      alignment: "center",
      buttonText: "Acceder a la app",
      buttonIcon: <MdLogin className="w-10 h-10 text-white" />, // icono dinámico
      onButtonClick: () => {
        const user = localStorage.getItem("user");
        if (user) window.location.href = "/Inventary";
        else window.location.href = "/login";
      },
    },
    {
      title: "¿Qué es Gestior?",
      text: "Gestior es un sistema intuitivo para manejar ventas, inventario y reportes de tu negocio desde cualquier lugar.",
      image: "/img/imagen1.png",
      containerClassName: "bg-sky-50 text-gray-900 py-20 px-8 md:px-20",
      alignment: "center",
      isMiniCard: true,
    },

    {
      title: "Planes Disponibles",
      text: "Elige el plan que mejor se adapte a tu negocio",
      cards: [
        {
          id: "basico",
          title: "Básico",
          description: "Hasta 5GB de almacenamiento\n5 usuarios\nSoporte básico",
          price: "$20/mes",
          bgColor: "bg-sky-300",
          icon: <RiMoneyDollarCircleFill className="w-12 h-12 text-white" />
        },
        {
          id: "estandar",
          title: "Estándar",
          description: "Hasta 50GB de almacenamiento\n15 usuarios\nManejo de sucursales",
          price: "$45/mes",
          bgColor: "bg-sky-600",
          icon: <RiMoneyDollarCircleFill className="w-12 h-12 text-white" />
        },
        {
          id: "avanzado",
          title: "Avanzado",
          description: "Hasta 500GB de almacenamiento\n200 usuarios\nAsistente IA",
          price: "$60/mes",
          bgColor: "bg-sky-800",
          icon: <RiMoneyDollarCircleFill className="w-12 h-12 text-white" />
        },
        {
          id: "corporativo",
          title: "Corporativo",
          description: "Hasta 1TB de almacenamiento\nAnálisis de datos de mercado\nSoporte 24/7",
          price: "$80/mes",
          bgColor: "bg-sky-900",
          icon: <RiMoneyDollarCircleFill className="w-12 h-12 text-white" />
        }
      ],
    

       cardClassName: "flex flex-col items-center w-40 sm:w-44 md:w-48 group bg-white rounded-xl shadow-md p-4",
  cardButtonClassName: "rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-3 transition-transform duration-300 transform group-hover:scale-125 group-hover:shadow-cyan",

  buttonText: "Contáctanos",
  onButtonClick: handleOpenModal,
  buttonIcon: <FaWhatsapp className="w-1 h-10 text-white" />,
  containerClassName: "bg-sky-100 text-gray-900 py-20 px-8 md:px-20",
  buttonClassName: "bg-sky-500 text-black hover:bg-gray-300 text-lg font-semibold py-3 px-6 rounded shadow-md mt-6",
  alignment: "center",
  direction: "row",

    }
  ];

  const miniCardsProps = [
    {
      title: "Contáctanos y Síguenos",
      text: "Mantente conectado con nosotros y descubre todas nuestras novedades",
      button: [
        <a
          key="fb"
          href="https://www.facebook.com/share/1Vhk2M7crA/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center transition-transform duration-300 hover:scale-110"
        >
          <CiFacebook className="w-10 h-10 text-blue-600" />
          <span className="text-sm font-medium mt-1">Facebook</span>
        </a>,
        <a
          key="ig"
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center transition-transform duration-300 hover:scale-110"
        >
          <CiInstagram className="w-10 h-10 text-pink-500" />
          <span className="text-sm font-medium mt-1">Instagram</span>
        </a>,
        <a
          key="phone"
          onClick={() => window.open("https://wa.me/50689098222")}
          className="flex flex-col items-center transition-transform duration-300 hover:scale-110 cursor-pointer"
        >
          <CiPhone className="w-10 h-10 text-green-600" />
          <span className="text-sm font-medium mt-1">+506 8909-8222</span>
        </a>,
        <div
          key="schedule"
          className="flex flex-col items-center transition-transform duration-300 hover:scale-110"
        >
          <CiClock1 className="w-10 h-10 text-gray-700" />
          <span className="text-sm font-medium mt-1">Lun - Vie: 8am - 6pm</span>
        </div>,
      ],
      bgColor: "bg-sky-50",
      textColor: "text-gray-900",
    },
  ];

  return (
    <>
      <Container
        nav={navProps}
        informationCardsProps={informationCardsProps}
        miniCards={miniCardsProps}
      />

      {/* Modal de WhatsApp */}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg p-8 w-80 md:w-96 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Pide Información</h2>
            <p className="mb-4 text-center">
              Completa tus datos y el plan que te interesa. Te responderemos por
              WhatsApp.
            </p>

            {/* Formulario */}
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-3 w-full px-3 py-2 border rounded"
            />
            <input
              type="email"
              placeholder="Tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-3 w-full px-3 py-2 border rounded"
            />
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="mb-4 w-full px-3 py-2 border rounded"
            >
              <option value="">Selecciona un plan</option>
              <option value="Básico">$20/mes - Básico</option>
              <option value="Estándar">$45/mes - Estándar</option>
              <option value="Avanzado">$60/mes - Avanzado</option>
              <option value="Corporativo">$80/mes - Corporativo</option>
            </select>

            {/* Botón WhatsApp con mensaje prellenado */}
            <a
              href={`https://wa.me/50689098222?text=${encodeURIComponent(
                `Hola, me interesa el plan: ${plan}. Mi nombre es ${name} y mi correo es ${email}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded mb-4 w-full text-center"
            >
              Contactar por WhatsApp
            </a>

            <button
              onClick={handleCloseModal}
              className="text-gray-700 hover:text-gray-900 font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
