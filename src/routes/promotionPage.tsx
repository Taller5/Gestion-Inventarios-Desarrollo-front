import { createFileRoute } from '@tanstack/react-router'
import PromotionPage from '../components/pages/PromotionPage'
export const Route = createFileRoute('/promotionPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PromotionPage/>
}
