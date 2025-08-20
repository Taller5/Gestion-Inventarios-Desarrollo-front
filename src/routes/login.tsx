import { createFileRoute } from '@tanstack/react-router'
import Login from '../components/pages/Login'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Login/>;
//   de esto ya no hay que tocar nada
}
