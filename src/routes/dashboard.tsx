import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '../components/pages/Dashboard'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Dashboard/>
}
