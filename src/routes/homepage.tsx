import { createFileRoute } from '@tanstack/react-router'
import Homepage from '../components/pages/Homepage'

export const Route = createFileRoute('/homepage')({
  component: RouteComponent,
})

function RouteComponent() {
  return   <Homepage/>;
}
