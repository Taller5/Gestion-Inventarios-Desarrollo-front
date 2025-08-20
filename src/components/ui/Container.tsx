import Form from "./Form";

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
//todo este tema del login es completamente experimental, no sé que estoy haciendo

interface ContainerProps {
    form?: FormProps
}

export default function Container(props: ContainerProps){

    let pageContent;

// if (props.mainCard) {
//     pageContent = <MainCard {...props.mainCard} />;
// } else if (props.form) {
//     pageContent = <Form {...props.form} />;
// } else if (props.detailedCard) {
//     pageContent = <DetailedCard {...props.detailedCard} />;
// } else {
//     pageContent = <div className="bg-white">hola</div>
// }

//esto viene de seekforpaws y lo dejo aquí únicamente como referencia, por si les sirve

    if (props.form) {
        pageContent = <Form {...props.form} />;
    } else {
        pageContent = <div className="bg-white">El error está en el container</div>
    }


    return(
        <div>
            {pageContent}
        </div>
    )
}