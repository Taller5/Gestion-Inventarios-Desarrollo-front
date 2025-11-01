import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
/*import Form from '../ui/Form';*/
import { LoginService } from '../services/LoginService';
import Container from '../ui/Container';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError(undefined);
    try {
      await LoginService.login({ email, password });
      router.navigate({ to: '/dashboard' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    const form = {
        email,
        password,
        onEmailChange: setEmail,
        onPasswordChange: setPassword,
        onSubmit: handleLogin, 
        loading,
        error,
        title: "Iniciar sesión",
        linkText: "Recuperar contraseña",
        buttonText: "Acceder",
        buttonText2: "Volver",
      }
  
  return (
    <Container form={form}/>
  );
}
