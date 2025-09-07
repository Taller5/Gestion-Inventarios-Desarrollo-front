
import { IoAddCircle } from "react-icons/io5";

// Define el tipo de tarjeta
interface CardItem {
  imgSrc?: string;
  title: string;
  description?: string;
  price?: string;
  bgColor?: string;
  icon?: React.ReactNode;
}

interface InformationCardsProps {
  title?: string;
  text?: string;
  cards?: CardItem[];
  buttonText?: string;
  buttonIcon?: React.ReactNode | null; // Ahora es opcional y puede ser null
  onButtonClick?: () => void;
  containerClassName?: string;
  buttonClassName?: string;
  alignment?: "left" | "center" | "right";
  direction?: "row" | "column";
  containerBg?: string;
}

export default function InformationCards({
  title,
  text,
  cards = [],
  buttonText = "Acceder a la app",
  onButtonClick,
  containerClassName = "",
  buttonClassName = "",
  alignment = "center",
  direction = "row",
  containerBg = "bg-azul-oscuro",
  buttonIcon = null,
}: InformationCardsProps) {
  const user = localStorage.getItem("user");

  const handleAccessApp = () => {
    if (onButtonClick) onButtonClick();
    else if (user) window.location.href = "/Inventary";
    else window.location.href = "/login";
  };

  const defaultCards: CardItem[] = [
    { imgSrc: "/img/Sale.png", title: "Ventas rápidas y seguras" },
    { imgSrc: "/img/branch.png", title: "Manejo de sucursales" },
    { imgSrc: "/img/inventory.png", title: "Control de inventario eficiente" },
  ];


  const displayedCards = cards.length > 0 ? cards : defaultCards;

  let alignItemsClass = "items-center text-center";
  if (alignment === "left") alignItemsClass = "items-start text-left";
  if (alignment === "right") alignItemsClass = "items-end text-right";

  let justifyClass = "justify-center";
  if (alignment === "left") justifyClass = "justify-start";
  if (alignment === "right") justifyClass = "justify-end";

  return (
    <div className={`flex flex-col ${alignItemsClass} ${containerBg} px-8 py-12 ${containerClassName}`}>
      {/* Título y subtítulo */}
      {title && <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{title}</h2>}
      {text && <p className="text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">{text}</p>}

      {/* Tarjetas  de contenido como el de planes o servicios */}

      <div className={`flex flex-${direction} flex-wrap justify-center gap-8 mb-12 w-full ${justifyClass}`}>
        {displayedCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-md transition-all duration-300 transform hover:scale-105 w-72 p-6 flex flex-col items-center relative group"
          >

            <div className={`rounded-full ${card.bgColor || "bg-sky-300"} w-20 h-20 flex items-center justify-center mb-4`}>
              {card.imgSrc ? (
                <img src={card.imgSrc} alt={card.title} className="w-12 h-12" />
              ) : (
                card.icon || <IoAddCircle className="w-20 h-20 text-white" />
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-800 text-center">{card.title}</h3>

            {card.price && (
              <p className="text-2xl font-extrabold text-cyan-500 mt-2">
                {card.price} <span className="text-sm font-medium text-gray-500"></span>
              </p>
            )}

            {card.description && (
              <p className="text-sm text-gray-600 text-center mt-3 whitespace-pre-line">
                {card.description}
              </p>
            )}

            <button className="mt-6 bg-cyan-400 text-white font-semibold px-6 py-2 rounded-full transition-colors duration-300">
              Elegir Plan
            </button>
          </div>
        ))}
      </div>

      {/* Botón principal */}
      {buttonText && (
        <button
          onClick={handleAccessApp}
          className={`bg-sky-500 cursor-pointer hover:bg-cyan-950 text-white font-bold py-4 px-10 rounded-xl text-lg md:text-xl transition-colors duration-300 flex items-center gap-3 hover:shadow-cyan ${buttonClassName}`}
        >
          {buttonIcon && buttonIcon }
          {buttonText}
        </button>
      )}


    </div>
  );
}