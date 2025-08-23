const API_URL = 'https://api.maileroo.com/api/v1';
const API_KEY = import.meta.env.VITE_MAILEROO_API_KEY; // Set this in your .env file

export const sendPasswordRecoveryEmail = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        from: 'no-reply@yourdomain.com', // Replace with your verified sender email
        to: email,
        subject: 'Recuperación de contraseña',
        text: 'Aquí está tu enlace para restablecer la contraseña: [LINK]',
        html: `
          <h1>Recuperación de contraseña</h1>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${window.location.origin}/reset-password?token=[TOKEN]">Restablecer contraseña</a>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        `
      })
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo de recuperación');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// This function is reserved for future implementation of password reset
// It will be used when the user clicks the reset link in their email
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  // Implementation will be added when the reset password functionality is developed
  console.log('Resetting password with token:', token);
  // TODO: Implement password reset API call
  throw new Error('Password reset functionality not yet implemented');
};
