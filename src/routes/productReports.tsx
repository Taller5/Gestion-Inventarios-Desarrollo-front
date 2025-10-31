import { createFileRoute } from '@tanstack/react-router'
import ProductReports from '../components/pages/ProductReports'
export const Route = createFileRoute('/productReports')({
  component: RouteComponent,
})

function RouteComponent() {
  return<ProductReports/>
}
