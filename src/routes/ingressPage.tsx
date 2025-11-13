import { createFileRoute } from '@tanstack/react-router'
import IngressPage from '../components/pages/IngressPage'
export const Route = createFileRoute('/ingressPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <IngressPage/>
}
