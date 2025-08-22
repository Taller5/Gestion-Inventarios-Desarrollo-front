import { createFileRoute } from '@tanstack/react-router';
import Homepage from '../components/pages/Homepage';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Homepage />;
 
}  