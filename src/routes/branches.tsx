import { createFileRoute } from '@tanstack/react-router';
import Branches from '../components/pages/Branches';

export const Route = createFileRoute('/branches')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Branches />;
}
