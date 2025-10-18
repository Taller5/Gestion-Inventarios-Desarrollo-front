import { createFileRoute } from '@tanstack/react-router'
import SaleReports from '../components/pages/SaleReports'


export const Route = createFileRoute('/saleReports')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SaleReports/>
}
