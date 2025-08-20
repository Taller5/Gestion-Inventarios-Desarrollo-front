import Container from '../components/ui/Container'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Container />
  //aqui debería retornar el container, el cuál a su vez debería tener los componentes pertinentes
  //para poder mostrar el homepage, yo propongo que haya un botón que redirige al login y que luego el login
  //redirige al landing
}
 