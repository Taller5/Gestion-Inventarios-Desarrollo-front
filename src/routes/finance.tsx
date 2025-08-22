import Finance from "../components/pages/Finance";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/finance')({
    component: Finance,
});

