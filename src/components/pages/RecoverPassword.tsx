import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import Container from "../ui/Container";

const API_URL = import.meta.env.VITE_API_URL;

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRecover = async () => {
    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      // Llamada al endpoint del backend
      const res = await fetch(`${API_URL}/v1/recover-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.message || "No se pudo generar la clave temporal"
        );
      }

      const data = await res.json();
      console.log("Respuesta backend:", data);

      setSuccess(true);
      setEmail("");

      // Redirigir a login después de éxito
      setTimeout(() => {
        router.navigate({ to: "/login" });
      }, 2000);
    } catch (err: any) {
      console.error("Recover error:", err);
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const formProps = {
    email,
    password: "",
    onEmailChange: (v: string) => setEmail(v),
    onPasswordChange: () => {},
    onSubmit: handleRecover,
    loading,
    error,
    title: "Recuperar contraseña",
    buttonText: loading ? "Enviando..." : "Recuperar",
    buttonText2: "Volver",
    hidePasswordField: true,
    successMessage: success
      ? `¡Listo! Hemos enviado una contraseña temporal a tu correo electrónico. Por favor revisa tu bandeja de entrada y vuelve a la página de inicio de sesión.`
      : undefined,
  };

  return <Container form={formProps} />;
}
