import { createFileRoute } from '@tanstack/react-router'


import SalesPage from '../components/pages/SalesPage'

export const Route = createFileRoute('/salesPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SalesPage/>
}
