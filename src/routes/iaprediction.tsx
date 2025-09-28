import { createFileRoute } from '@tanstack/react-router'
import IAPrediction from '../components/pages/IAPrediction'

export const Route = createFileRoute('/iaprediction')({
  component: RouteComponent,
})

function RouteComponent() {
  return <IAPrediction />
}
