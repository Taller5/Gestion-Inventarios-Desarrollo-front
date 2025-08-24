import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";

  useEffect(() => {
    if (!allowedRoles.includes(userRole)) {
      navigate({ to: "/homepage" });
    }
  }, [userRole, allowedRoles, navigate]);

  return allowedRoles.includes(userRole) ? <>{children}</> : null;
}