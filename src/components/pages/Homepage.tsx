

import Container from '../ui/Container';
import Button from '../ui/Button';

export default function Login() {


const navProps = {
  button: (
    <Button
      text="Iniciar sesión"
      style="flex items-center gap-2 bg-verde-oscuro  text-black px-4 py-2 rounded"
      to="/login"
    />
  )
};

  const informationCardsProps = {
    title: "Gestor brinda",
    text: "Control total de tu negocio en una sola plataforma",

  };
  const miniCardProps={
     title: "Gestor brinda",
     text: "Control total de tu negocio en una sola plataforma",
     image:"/img/imagen1.png",
  }

  return (
    <Container  nav={navProps}  informationCardsProps={informationCardsProps} miniCards={miniCardProps}/>
  );
}