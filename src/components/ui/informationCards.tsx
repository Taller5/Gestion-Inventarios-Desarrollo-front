import { CiLogin } from "react-icons/ci";
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
  onButtonClick?: () => void;
  containerClassName?: string;
  buttonClassName?: string;
  alignment?: "left" | "center" | "right";
  direction?: "row" | "column";
  containerBg?: string;
  cardClassName?: string; // <- para personalizar contenedor de cada card
  cardButtonClassName?: string; // <- para personalizar el botón de cada card
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
  cardClassName = "flex flex-col items-center w-28 group", // default
  cardButtonClassName = "rounded-full w-28 h-28 flex items-center justify-center mb-3 transition-transform duration-300 transform group-hover:scale-125 group-hover:shadow-cyan", // default
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

      {/* Tarjetas */}
      <div className={`flex flex-${direction} flex-wrap gap-8 mb-12 w-full ${justifyClass}`}>
        {displayedCards.map((card, idx) => (
          <div key={idx} className={cardClassName}>
            <button
              className={`${card.bgColor || "bg-sky-300"} ${cardButtonClassName}`}
            >
              {card.imgSrc ? (
                <img src={card.imgSrc} alt={card.title} className="w-12 h-12 md:w-14 md:h-14" />
              ) : (
                card.icon || <IoAddCircle className="w-12 h-12 text-white" />
              )}
            </button>
            <span className="text-sm md:text-base font-semibold text-center leading-tight transition-colors duration-300 group-hover:text-cyan-400">
              {card.title}
            </span>
            {card.price && (
              <span className="text-sm md:text-base font-bold text-center mt-1">{card.price}</span>
            )}
            {card.description && (
              <span className="text-xs md:text-sm text-center mt-1 whitespace-pre-line">{card.description}</span>
            )}
          </div>
        ))}
      </div>

      {/* Botón principal */}
      <button
        onClick={handleAccessApp}
        className={`bg-sky-500 cursor-pointer hover:bg-cyan-950 text-white font-bold py-4 px-10 rounded-xl text-lg md:text-xl transition-colors duration-300 flex items-center gap-3 hover:shadow-cyan ${buttonClassName}`}
      >
        <CiLogin className="w-7 h-7" />
        {buttonText}
      </button>
    </div>
  );
}
