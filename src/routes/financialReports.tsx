import { createFileRoute } from '@tanstack/react-router'
import FinancialReports  from '../components/pages/FinancialReports'
export const Route = createFileRoute('/financialReports')({
  component: RouteComponent,
})

function RouteComponent() {
  return   <FinancialReports/>;
}
