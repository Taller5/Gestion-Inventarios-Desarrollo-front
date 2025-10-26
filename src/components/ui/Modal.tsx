import React, { useState, useEffect } from "react";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";

const API_URL = import.meta.env.VITE_API_URL;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: (user: any) => void;
  userToEdit?: any; // Puede ser User o null
  onUserEdited?: (user: any) => void;
  users: any[]; // Lista completa de usuarios
}

export default function Modal({
  open,
  onClose,
  onUserAdded,
  userToEdit,
  onUserEdited,
  users,
}: ModalProps) {
  const isEditMode = !!userToEdit;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Mover las validaciones y la función antes de su uso
  const passwordValidations = [
    { test: (pw: string) => pw.length >= 6, message: "Al menos 6 caracteres" },
    { test: (pw: string) => /[A-Z]/.test(pw), message: "Al menos una letra mayúscula" },
    { test: (pw: string) => /[a-z]/.test(pw), message: "Al menos una letra minúscula" },
    { test: (pw: string) => /\d/.test(pw), message: "Al menos un número" },
    { test: (pw: string) => /[^A-Za-z0-9]/.test(pw), message: "Al menos un carácter especial" },
  ];
  const getPasswordErrors = (pw: string) =>
    passwordValidations.filter((v) => !v.test(pw)).map((v) => v.message);

  // Mostrar siempre una sola línea de error dinámico según lo digitado
  const firstPasswordError = getPasswordErrors(form.password)[0] || null;
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Inicializa el formulario con los datos del usuario a editar
  useEffect(() => {
    if (open) {
      if (isEditMode) {
        setForm({
          name: userToEdit.name || "",
          email: userToEdit.email || "",
          phone: userToEdit.phone || "",
          password: "", // No se muestra la contraseña actual
          role: userToEdit.role || "",
          status: userToEdit.status || "",
        });
      } else {
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "",
          status: "",
        });
      }
      setAlert(null);
      setEmailError(null);
    }
  }, [open, userToEdit, isEditMode]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    switch (name) {
      case "name":
        // Solo letras y espacios, max 50
        if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 50) {
          setForm((prev) => ({ ...prev, [name]: value }));
        }
        break;
      case "email":
        // max 100
        if (value.length <= 30) {
          setForm((prev) => ({ ...prev, [name]: value }));
          // limpiar error de email si ahora es válido
          if (emailRegex.test(value)) setEmailError(null);
        }
        break;
      case "phone":
        // Solo números, max 8
        if (/^\d*$/.test(value) && value.length <= 8) {
          setForm((prev) => ({ ...prev, [name]: value }));
        }
        break;
      case "role":
        if (value.length <= 30) setForm((prev) => ({ ...prev, [name]: value }));
        break;
      case "status":
        if (value.length <= 20) setForm((prev) => ({ ...prev, [name]: value }));
        break;
      default:
        setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Función para validar duplicados
  const validateDuplicates = () => {
    const emailExists = users.some(
      (u) =>
        u.email.toLowerCase() === form.email.toLowerCase() &&
        u.id !== userToEdit?.id
    );
    if (emailExists) {
      setAlert({
        type: "error",
        message: "Ya existe un usuario con ese correo electrónico.",
      });
      return false;
    }

    const phoneExists = users.some(
      (u) => u.phone === form.phone && u.id !== userToEdit?.id
    );
    if (phoneExists) {
      setAlert({
        type: "error",
        message: "Ya existe un usuario con ese número de teléfono.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones de mínimos y máximos
    if (form.name.length < 1 || form.name.length > 50) {
      setAlert({
        type: "error",
        message: "El nombre debe tener entre 1 y 50 caracteres.",
      });
      return;
    }

    if (form.email.length < 5 || form.email.length > 100) {
      setAlert({
        type: "error",
        message: "El correo debe tener entre 5 y 100 caracteres.",
      });
      return;
    }

    // Validación email (dominio válido)
    if (!emailRegex.test(form.email)) {
      setEmailError(
        "Debe ingresar un email con dominio válido, por ejemplo: usuario@dominio.com"
      );
      return;
    }

    if (form.phone.length < 8 || form.phone.length > 15) {
      setAlert({
        type: "error",
        message: "El teléfono debe tener entre 8 y 15 dígitos.",
      });
      return;
    }

    const phoneValid = /^\d+$/.test(form.phone);
    if (!phoneValid) {
      setAlert({
        type: "error",
        message: "El teléfono solo puede contener números.",
      });
      return;
    }

    // Validación de duplicados
    if (!validateDuplicates()) return;

    if (!isEditMode) {
      if (form.password.length < 6 || form.password.length > 20) {
        setAlert({
          type: "error",
          message: "La contraseña debe tener entre 6 y 20 caracteres.",
        });
        return;
      }

      const passwordErrors = getPasswordErrors(form.password);
      if (passwordErrors.length > 0) {
        setAlert({
          type: "error",
          message: "Contraseña inválida: " + passwordErrors.join(", "),
        });
        return;
      }
    }

    if (!form.role) {
      setAlert({ type: "error", message: "Debes seleccionar un rol." });
      return;
    }

    if (!form.status) {
      setAlert({ type: "error", message: "Debes seleccionar un estado." });
      return;
    }

    setLoading(true);

    try {
      let res, data;
      if (isEditMode) {
        // Editar usuario
        res = await fetch(`${API_URL}/api/v1/employees/${userToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (res.ok) {
          setAlert({
            type: "success",
            message: "Usuario editado correctamente.",
          });
          onUserEdited && onUserEdited(data);
        } else {
          setAlert({ type: "error", message: "No se pudo editar el usuario." });
        }
      } else {
        // Crear usuario
        res = await fetch(`${API_URL}/api/v1/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (res.ok) {
          setAlert({
            type: "success",
            message: "Usuario agregado correctamente.",
          });
          onUserAdded(data);
        } else {
          setAlert({
            type: "error",
            message: "No se pudo agregar el usuario.",
          });
        }
      }

      // Cierra el modal después de 1.2s
      if (res.ok) {
        setTimeout(() => {
          setAlert(null);
          setEmailError(null);
          onClose();
        }, 1200);
      }
    } catch {
      setAlert({
        type: "error",
        message: "Error de conexión con el servidor.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
      
      <form
        className="relative bg-white p-8 rounded shadow-lg pointer-events-auto animate-modalShow transition-all duration-300 flex flex-col items-center"
        style={{
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          minWidth: "50vw",
          maxWidth: "90vw",
          animation: "modalShow 0.3s ease",
        }}
        onSubmit={handleSubmit}
      >
         {/* Botón de cierre (SVG X personalizado) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-4 rounded-full p-1 bg-[var(--color-rojo-ultra-claro)] hover:bg-[var(--color-rojo-claro)] transition cursor-pointer"
          style={{ zIndex: 10 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[var(--color-rojo-oscuro)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-8 text-center w-full">
          {isEditMode ? "Editar usuario" : "Añadir colaborador"}
        </h2>
        {alert && (
          <div
            className={`mb-4 px-4 py-2 rounded w-full text-center font-semibold ${
              alert.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {alert.message}
          </div>
        )}
        <div className="grid grid-cols-2 gap-6 w-full mb-6">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Nombre</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azul-medio"
              placeholder="Nombre"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Correo</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Correo"
              required
            />
            {emailError && (
              <div className="text-sm text-red-700 mt-2">{emailError}</div>
            )}
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Teléfono</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Teléfono"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">
              Contraseña
            </label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Contraseña"
              required={!isEditMode}
              minLength={isEditMode ? undefined : 6}
            />
            <div
              className="absolute right-11 translate-y-10 text-gray-600 cursor-pointer"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
            >
              {showPassword ? (
                <IoEyeOutline className="w-6 h-6" />
              ) : (
                <IoEyeOffOutline className="w-6 h-6" />
              )}
            </div>
            {form.password.length > 0 && firstPasswordError && (
              <div className="text-sm text-red-700 mt-2">
                {firstPasswordError}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 w-full mb-8">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Selecciona un rol</option>
              <option value="administrador">Administrador</option>
              <option value="supervisor">Supervisor</option>
              <option value="bodeguero">Bodeguero</option>
              <option value="vendedor">Vendedor</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Estado</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Selecciona estado</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 w-full justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer`}
          >
            {loading
              ? "Guardando..."
              : isEditMode
              ? "Guardar cambios"
              : "Guardar"}
          </button>
          <button
            type="button"
            className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </form>
      {/* Animación CSS */}
      <style>
        {`
          @keyframes modalShow {
              0% { opacity: 0; transform: scale(0.95);}
              100% { opacity: 1; transform: scale(1);}
          }
          .animate-modalShow {
              animation: modalShow 0.3s ease;
          }
        `}
      </style>
    </div>
  );
}
