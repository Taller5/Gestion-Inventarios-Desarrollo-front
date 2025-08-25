

import Container from '../ui/Container';
import Button from '../ui/Button';

export default function Homepage() {


const navProps = {
  button: (
    <Button
      text="Iniciar sesión"
      icon='/img/Profile.png'
      style="flex items-center gap-2 bg-verde-oscuro  text-black px-4 py-1 rounded "
      to="/login"
    />
  )
};

  const informationCardsProps = {
    title: "Bienvenido a Gestor",
    text: "Control total de tu negocio en una sola plataforma, registrate ahora y disfruta de todas las funciones que tenemos para ti.",

  };
  const miniCardProps={
     title: "¿Qué es Gestor?",
     text: "Gestor es un sistema intuitivo para manejar ventas, inventario y reportes de tu negocio desde cualquier lugar.",
     image:"/img/imagen1.png",
  }

  return (
    <Container  nav={navProps}  informationCardsProps={informationCardsProps} miniCards={miniCardProps}/>
  );
}