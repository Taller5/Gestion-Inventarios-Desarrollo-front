import { createFileRoute } from '@tanstack/react-router'
import Profile from '../components/pages/Profile'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Profile
      titleSection="Perfil de Usuario"
      textSection="Gestione su información personal y configuración de cuenta."
      labelPersonalInfo="Información Personal"
      labelName="Nombre"
      labelEmail="Correo Electrónico"
      labelChangePassword="Cambiar Contraseña"
      labelCurrentPassword="Contraseña Actual"
      labelNewPassword="Nueva Contraseña"
      labelConfirmPassword="Confirmar Contraseña"
    />
  );
}
