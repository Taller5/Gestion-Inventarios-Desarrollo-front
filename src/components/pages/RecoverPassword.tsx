import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import Container from "../ui/Container";
import emailjs from "@emailjs/browser";

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
      // 1️⃣ Llamar al endpoint de Laravel que genera la contraseña temporal
      const res = await fetch(`${API_URL}/api/v1/employees/recover-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        // Si el correo no existe, Laravel debería retornar un mensaje apropiado
        throw new Error(
          errData.message || "El correo electrónico no está registrado"
        );
      }

      const data = await res.json();
      
      router.navigate({ to: "/login" });

      const tempPassword = data.temporaryPassword;
      const userName = data.name;

      if (!tempPassword) throw new Error("No se recibió la clave temporal");

      // Enviar correo con EmailJS
      const templateParams = {
        to_email: email,
        user_name: userName,
        password: tempPassword,
      };

      await emailjs.send(
        "service_vl273ce",
        "template_x678a3b",
        templateParams,
        "1rHCHqTG4NTv_3j6C"
      );

      setSuccess(true);
      setEmail("");
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
    onEmailChange: (v: string) => {
      setEmail(v);
      if (error) setError(undefined); // Limpiar error al cambiar input
    },
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
