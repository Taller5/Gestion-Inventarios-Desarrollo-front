import { createFileRoute } from '@tanstack/react-router'
import Customer from '../components/pages/Customer'  

export const Route = createFileRoute('/customer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Customer />
}
