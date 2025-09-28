import React, { useState, useEffect } from "react";
import { IoEyeOutline } from 'react-icons/io5';
import { IoEyeOffOutline } from 'react-icons/io5';

const API_URL = import.meta.env.VITE_API_URL;

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onUserAdded: (user: any) => void;
    userToEdit?: any; // Puede ser User o null
    onUserEdited?: (user: any) => void;
}

export default function Modal({
    open,
    onClose,
    onUserAdded,
    userToEdit,
    onUserEdited
}: ModalProps) {
    const isEditMode = !!userToEdit;
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
        status: ""
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const [newPasswordFocused, setNewPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
                    status: userToEdit.status || ""
                });
            } else {
                setForm({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    role: "",
                    status: ""
                });
            }
            setAlert(null);
        }
    }, [open, userToEdit, isEditMode]);

    if (!open) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        
        const { name, value } = e.target;
        
        switch(name){

            case "name":
                if (/^[a-zA-Z\s]*$/.test(value)) setForm((prev) => ({ ...prev, [name]: value }));
                break;
            case "email":
                setForm((prev) => ({ ...prev, [name]: value }));
                break;
            case "phone":
                if (/^\+?\d*$/.test(value)) setForm((prev) => ({ ...prev, [name]: value }));
                break;
            default:
                setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const invalidPhone = /^\d+$/.test(form.phone);

        if (!invalidPhone) {
        setAlert({ type: "error", message: "El teléfono solo puede contener números" });
        return;
  }

        if (!isEditMode && form.password.length < 6) {
            setAlert({ type: "error", message: "La contraseña debe tener al menos 6 caracteres." });
            return;
        }
        setLoading(true);
        try {
            if (isEditMode) {
                // Editar usuario
                const res = await fetch(`${API_URL}/api/v1/employees/${userToEdit.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form)
                });
                const data = await res.json();
                if (res.ok) {
                    setAlert({ type: "success", message: "Usuario editado correctamente." });
                    if (onUserEdited) onUserEdited(data);
                    setTimeout(() => {
                        setAlert(null);
                        onClose();
                    }, 1200);
                } else {
                    setAlert({ type: "error", message: "No se pudo editar el usuario." });
                }
            } else {
                // Crear usuario
                const res = await fetch(`${API_URL}/api/v1/employees`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form)
                });
                const data = await res.json();
                if (res.ok) {
                    setAlert({ type: "success", message: "Usuario agregado correctamente." });
                    onUserAdded(data);
                    setTimeout(() => {
                        setAlert(null);
                        onClose();
                    }, 1200);
                } else {
                    setAlert({ type: "error", message: "No se pudo agregar el usuario." });
                }
            }
        } catch {
            setAlert({ type: "error", message: "Error de conexión con el servidor." });
        } finally {
            setLoading(false);
        }
    };

    // Reemplaza tu función getPasswordErrors por una igual a la de Profile:
    const passwordValidations = [
        {
            test: (pw: string) => pw.length >= 6,
            message: "Al menos 6 caracteres"
        },
        {
            test: (pw: string) => /[A-Z]/.test(pw),
            message: "Al menos una letra mayúscula"
        },
        {
            test: (pw: string) => /[a-z]/.test(pw),
            message: "Al menos una letra minúscula"
        },
        {
            test: (pw: string) => /\d/.test(pw),
            message: "Al menos un número"
        },
        {
            test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
            message: "Al menos un carácter especial"
        }
    ];
    const getPasswordErrors = (pw: string) =>
        passwordValidations.filter(v => !v.test(pw)).map(v => v.message);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-transparent backdrop-blur-sm"></div>
            <form
                className="relative bg-white p-8 rounded shadow-lg pointer-events-auto animate-modalShow transition-all duration-300 flex flex-col items-center"
                style={{
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                    minWidth: "50vw",
                    maxWidth: "90vw",
                    animation: "modalShow 0.3s ease"
                }}
                onSubmit={handleSubmit}
            >
                <h2 className="text-2xl font-bold mb-8 text-center w-full">
                    {isEditMode ? "Editar usuario" : "Añadir empleado"}
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
                        <label className="mb-2 font-semibold text-gray-700">Contraseña</label>
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={handleChange}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Contraseña"
                            required={!isEditMode}
                            minLength={isEditMode ? undefined : 6}
                            onFocus={() => setNewPasswordFocused(true)}
                            onBlur={() => setNewPasswordFocused(false)}
                        />
                        <div className="absolute right-11 translate-y-10 text-gray-600 cursor-pointer" onMouseDown={() => setShowPassword(true)} onMouseUp={() => setShowPassword(false)}>{showPassword ? <IoEyeOutline className="w-6 h-6" /> :  <IoEyeOffOutline className="w-6 h-6"/> }</div>
                        {newPasswordFocused && (
                            <ul className="text-sm text-red-700 list-disc pl-5 mt-2">
                                {getPasswordErrors(form.password).slice(0, 1).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
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
                        {loading ? "Guardando..." : isEditMode ? "Guardar cambios" : "Guardar"}
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