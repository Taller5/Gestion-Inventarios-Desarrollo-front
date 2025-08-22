import { createFileRoute } from '@tanstack/react-router'
import Inventary from '../components/pages/Inventary'

export const Route = createFileRoute('/inventary')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Inventary />;
}
