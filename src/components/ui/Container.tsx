import Form from "./Form";
import InformationCards from "./informationCards";
import MiniCards from "./MiniCards";
import { MdOutlineMail } from "react-icons/md";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaRegCopyright } from "react-icons/fa6";
import Nav from "./Nav";

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
  isMiniCard?: boolean; // <-- nueva propiedad
  image?: string; // Para MiniCard
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
  const nav = <Nav {...props.nav} />;

  let pageContent;

  // Normalizar arrays
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

  if (props.form) {
    pageContent = <Form {...props.form} />;
  } else if (informationCardsArray.length) {
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
  } else if (props.page) {
    pageContent = <div>{props.page}</div>;
  } else {
    pageContent = <div className="bg-white">Error</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {nav}

      <div className="flex flex-col flex-grow">{pageContent}</div>

      <footer className="w-full bg-sky-950 text-white py-3 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-2 text-center">
          {/* Logo o nombre */}
          <div className="text-2xl font-bold tracking-wide">Gestior</div>

          {/* Contacto y redes */}
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

          {/* Derechos */}
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <FaRegCopyright />
            <span>2025 Gestior. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
