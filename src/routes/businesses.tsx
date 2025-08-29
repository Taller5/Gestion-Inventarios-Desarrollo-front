import { createFileRoute } from '@tanstack/react-router';
import Businesses from '../components/pages/Businesses';

export const Route = createFileRoute('/businesses')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Businesses />;
}
