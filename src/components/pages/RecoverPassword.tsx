import { useState } from 'react';
import Container from '../ui/Container';
import { sendPasswordRecoveryEmail } from '../../services/auth.service';

export default function RecoverPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            setError('Por favor ingresa tu correo electrónico');
            return;
        }

        setLoading(true);
        setError(undefined);

        try {
            await sendPasswordRecoveryEmail(email);
            setSuccess(true);
        } catch (err) {
            setError('Error al enviar el correo de recuperación. Por favor intenta de nuevo.');
            console.error('Password recovery error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formProps = {
        email: email,
        password: '',
        onEmailChange: (value: string) => setEmail(value),
        onPasswordChange: () => {},
        onSubmit: handleSubmit,
        loading: loading,
        error: error,
        title: "Recuperar contraseña",
        buttonText: "Enviar enlace de recuperación",
        buttonText2: "Volver",
        hidePasswordField: true,
        successMessage: success ? 'Se ha enviado un enlace de recuperación a tu correo electrónico.' : undefined
    };

    return <Container form={formProps} />;
}