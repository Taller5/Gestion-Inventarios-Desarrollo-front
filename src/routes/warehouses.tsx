import { createFileRoute } from '@tanstack/react-router';
import Warehouses from '../components/pages/Warehouses';

export const Route = createFileRoute('/warehouses')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Warehouses />;
}
