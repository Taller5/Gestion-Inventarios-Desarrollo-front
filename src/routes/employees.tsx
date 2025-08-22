import { createFileRoute } from '@tanstack/react-router'
import Employees from '../components/pages/Employees'

export const Route = createFileRoute('/employees')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Employees />
}
