import { createFileRoute } from '@tanstack/react-router'
import Provider from '../components/pages/Provider'

export const Route = createFileRoute('/provider')({
  component: RouteComponent,
})

function RouteComponent() {
  return  <Provider/>
}
