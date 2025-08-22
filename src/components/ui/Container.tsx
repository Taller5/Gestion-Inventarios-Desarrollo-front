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
interface InformationCardsProps {
    title: string;
    text: string;
    buttons?: React.ReactNode[];
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
    informationCardsProps?: InformationCardsProps;
    miniCards?: MiniCardsProps;
}

export default function Container(props: ContainerProps) {
    const nav = <Nav {...props.nav} />;

    let pageContent;
    let secondContent;

if (props.form) {
    pageContent= <Form {...props.form} />;
} else if (props.informationCardsProps) {
    if (props.miniCards){
secondContent = <MiniCards {...props.miniCards} />;

    }
    pageContent = <InformationCards {...props.informationCardsProps} />;
} else if (props.miniCards) {
    pageContent = <MiniCards {...props.miniCards} />;
} else {
    pageContent = <div className="bg-white">Error</div>
    // return null
}

    return (
        <div className="bg-gray-400">
            {nav}
            {pageContent}
            {secondContent} 
            <footer className="flex items-center justify-center gap-8 px-7 h-20 bg-black text-white">
                <a
                    href="mailto:tallermultimedia50@gmail.com"
                    className="flex items-center gap-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {/* Email Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12l-4-4-4 4m8 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16-2a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6z" />
                    </svg>
                    tallermultimedia50@gmail.com
                </a>
                <a
                    href="https://github.com/tallermultimedia5"
                    className="flex items-center gap-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {/* GitHub Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.484 2 12.012c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.088 2.91.832.091-.646.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.274.098-2.656 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.338 1.909-1.295 2.748-1.025 2.748-1.025.546 1.382.202 2.402.1 2.656.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.579.688.481C19.138 20.175 22 16.427 22 12.012 22 6.484 17.523 2 12 2z"/>
                    </svg>
                    tallermultimedia5
                </a>
            </footer>
        </div>
    );
}