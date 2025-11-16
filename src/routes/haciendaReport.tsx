import { createFileRoute } from '@tanstack/react-router'
import HaciendaReport  from '../components/pages/HaciendaReports'
export const Route = createFileRoute('/haciendaReport')({
  component: RouteComponent,
})

function RouteComponent() {
  return   <HaciendaReport/>;
}
