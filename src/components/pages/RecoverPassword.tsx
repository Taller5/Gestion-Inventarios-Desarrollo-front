import { useState } from 'react';
import emailjs from '@emailjs/browser';
import Container from '../ui/Container';

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
            const templateParams = {
                to_email: email,
                from_name: 'Soporte del Sistema',
                message: `Hola, has solicitado recuperar tu contraseña.`,
                reply_to: email
            };

            await emailjs.send(
                'service_vl273ce',
                'template_x678a3b',
                templateParams,
                '1rHCHqTG4NTv_3j6C'
            );
            
            setSuccess(true);
            setEmail('');
        } catch (err) {
            setError('Error al enviar el correo de recuperación. Por favor intenta de nuevo.');
            console.error('Email sending error:', err);
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
        buttonText: loading ? "Enviando..." : "Recuperar",
        buttonText2: "Volver",
        hidePasswordField: true,
        successMessage: success ? '¡Hola! Te hemos enviado un mensaje a tu correo electrónico.' : undefined
    };

    return <Container form={formProps} />;
}