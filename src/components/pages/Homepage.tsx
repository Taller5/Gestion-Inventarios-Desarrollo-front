import { useState } from "react";
import Container from '../ui/Container';
import Button from '../ui/Button';
import { CiFacebook, CiInstagram, CiPhone, CiClock1 } from "react-icons/ci";

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
        icon='/img/Profile.png'
        style="flex items-center gap-2 bg-verde-oscuro text-black px-4 py-1 rounded"
        to="/login"
      />
    )
  };

  // Secciones InformationCards
  const informationCardsProps = [
    {
      title: "Bienvenido a Gestior",
      text: "Control total de tu negocio en una sola plataforma...",
      containerClassName: "bg-sky-700 text-white py-20 px-8 md:px-20",
      alignment: "center",
    },
    {
      title: "¿Qué es Gestior?",
      text: "Gestior es un sistema intuitivo para manejar ventas, inventario y reportes de tu negocio desde cualquier lugar.",
      image: "/img/imagen1.png",
      containerClassName: "bg-sky-50 text-gray-900 py-20 px-8 md:px-20",
      alignment: "center",
      isMiniCard: true,
    },

    //informacion de los planes aquí, son datos de prueba
    {
      title: "Planes Disponibles",
      text: "Elige el plan que mejor se adapte a tu negocio",
      cards: [
        { id: "basico", title: "Básico", description: "Hasta 50 ventas\n1 usuario\nSoporte básico", price: "$10/mes", bgColor: "bg-sky-400", icon: <RiMoneyDollarCircleFill className="w-12 h-12 text-white"  />},
        { id: "pro", title: "Profesional", description: "Ventas ilimitadas\nUsuarios ilimitados\nSoporte premium", price: "$25/mes", bgColor: "bg-sky-600", icon: <RiMoneyDollarCircleFill className="w-12 h-12 text-white" />  },
        { id: "enterprise", title: "Enterprise", description: "Todo incluido\nCapacitación personalizada\nSoporte 24/7", price: "$50/mes", bgColor: "bg-sky-800" , icon: <RiMoneyDollarCircleFill className="w-12 h-12 text-white" /> },
      ],
      buttonText: "Contáctanos",
      onButtonClick: handleOpenModal,
      containerClassName: "bg-sky-100 text-gray-900 py-20 px-8 md:px-20",
      buttonClassName: "bg-sky-500 text-black hover:bg-gray-300 text-lg font-semibold py-3 px-6 rounded shadow-md mt-6",
      alignment: "center",
      direction: "row",
    }
  ];

  // Minicards de redes sociales 
const miniCardsProps = [
  {
    title: "Contáctanos y Síguenos",
    text: "Mantente conectado con nosotros y descubre todas nuestras novedades",
    button: [
      <a
        key="fb"
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center transition-transform duration-300 hover:scale-110"
      >
        <CiFacebook className="w-10 h-10 text-blue-600" />
        <span className="text-sm font-medium mt-1">Facebook</span>
      </a>,
      <a
        key="ig"
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center transition-transform duration-300 hover:scale-110"
      >
        <CiInstagram className="w-10 h-10 text-pink-500" />
        <span className="text-sm font-medium mt-1">Instagram</span>
      </a>,
      <div
        key="phone"
        className="flex flex-col items-center transition-transform duration-300 hover:scale-110"
      >
        <CiPhone className="w-10 h-10 text-green-600" />
        <span className="text-sm font-medium mt-1">+506 8909-8222</span>
      </div>,
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
        Completa tus datos y el plan que te interesa. Te responderemos por WhatsApp.
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
        <option value="Básico">$10/mes - Básico</option>
        <option value="Profesional">$25/mes - Profesional</option>
        <option value="Enterprise">$50/mes - Enterprise</option>
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
