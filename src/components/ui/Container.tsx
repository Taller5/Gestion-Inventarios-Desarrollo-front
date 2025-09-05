import Form from "./Form";
import InformationCards from "./informationCards";
import MiniCards from "./MiniCards";

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
  image?: string;       // Para MiniCard
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

            <div className="flex flex-col flex-grow">
                {pageContent}
            </div>

            <footer className="flex items-center justify-center gap-8 px-7 h-20 bg-sky-950 text-white">
                <a
                    href="mailto:tallermultimedia50@gmail.com"
                    className="flex items-center gap-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    tallermultimedia50@gmail.com
                </a>
                <a
                    href="https://github.com/Taller5/Gestion-Inventarios-Desarrollo-front.git"
                    className="flex items-center gap-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    tallermultimedia5
                </a>
            </footer>
        </div>
    );
}
