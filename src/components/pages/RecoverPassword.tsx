import { useState } from "react";
import Container from "../ui/Container";
import emailjs from "@emailjs/browser";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

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
      const res = await fetch("http://localhost:8000/api/v1/employees/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "No se pudo generar la clave temporal");
      }

      const data = await res.json();
      console.log("Respuesta backend:", data);

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
        "service_vl273ce",   // service ID
        "template_x678a3b",  // template ID
        templateParams,
        "1rHCHqTG4NTv_3j6C"  // public key
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
