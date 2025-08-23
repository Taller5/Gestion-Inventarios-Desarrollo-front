import { createFileRoute } from '@tanstack/react-router'
import RecoverPassword from '../components/pages/RecoverPassword'
export const Route = createFileRoute('/recoverPassword')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RecoverPassword/>
}
