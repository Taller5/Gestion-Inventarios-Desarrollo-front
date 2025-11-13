import { createFileRoute } from '@tanstack/react-router'
import EgressPage from '../components/pages/EgressPage'

export const Route = createFileRoute('/egressPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EgressPage/>
}
