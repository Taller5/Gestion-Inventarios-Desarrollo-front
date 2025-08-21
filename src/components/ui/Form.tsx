interface FormProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string;
  title?: string;
  buttonText?: string;
}

export default function Form(props: FormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit();
      }}
      style={{ maxWidth: 400, margin: '0 auto' }}
    >
      <h2>{props.title || 'Iniciar sesión'}</h2>
      {props.error && <p style={{ color: 'red' }}>{props.error}</p>}

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={props.email}
          onChange={(e) => props.onEmailChange(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          value={props.password}
          onChange={(e) => props.onPasswordChange(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={props.loading}>
        {props.loading ? 'Ingresando...' : props.buttonText || 'Ingresar'}
      </button>
    </form>
  );
}
