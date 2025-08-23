interface FormProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string;
  title?: string;
  linkText?: string;
  buttonText?: string;
  buttonText2?: string;
}
export default function Form(props: FormProps) {
  return (
    <section className="flex-grow flex items-center justify-center">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit();
      }}
      className="max-w-md mx-auto flex flex-col gap-6"
    >
      <h2 className="text-2xl font-bold text-center text-verde-oscuro">
        {props.title || "Iniciar sesión"}
      </h2>

      {props.error && (
        <p className="text-red-500 text-center font-medium">{props.error}</p>
      )}

      <div className="flex flex-col gap-1">
        <label className="font-medium text-gray-700">Correo:</label>
        <input
          type="email"
          value={props.email}
          onChange={(e) => props.onEmailChange(e.target.value)}
          required
          className="px-20 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-medium text-gray-700">Contraseña:</label>
        <input
          type="password"
          value={props.password}
          onChange={(e) => props.onPasswordChange(e.target.value)}
          required
          className="px-20 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-verde-oscuro"
        />
      </div>

      {props.linkText && (
        <p className="text-center">
          ¿Olvidaste tu contraseña?{" "}
          <a
            href="/recoverPassword"
            className="text-blue-900 font-medium hover:underline"
          >
            {props.linkText}
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={props.loading}
        className="w-full py-3 bg-azul-fuerte text-white font-bold rounded-2xl hover:bg-azul-oscuro transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {props.loading ? "Ingresando..." : props.buttonText || "Ingresar"}
      </button>

      {props.buttonText2 && (
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={props.loading}
          className="w-full py-3 bg-azul-fuerte text-white font-bold rounded-2xl hover:bg-azul-oscuro transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {props.loading ? "Ingresando..." : props.buttonText2 || "Ingresar"}
        </button>
      )}
    </form>
  </section>
  );
}
