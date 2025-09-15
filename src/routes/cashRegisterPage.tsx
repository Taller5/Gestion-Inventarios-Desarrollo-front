import { createFileRoute } from '@tanstack/react-router'
import CashRegisterPage from '../components/pages/CashRegisterPage'

export const Route = createFileRoute('/cashRegisterPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CashRegisterPage />
}
