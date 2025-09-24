import ProtectedRoute from "../services/ProtectedRoute";
import { useEffect, useState } from "react";
import SideBar from "../ui/SideBar";
import Container from "../ui/Container";
import { LoginService } from "../services/LoginService";

const API_URL = import.meta.env.VITE_API_URL;

interface ProfileProps {
  titleSection: string;
  textSection: string;
  labelPersonalInfo: string;
  labelName: string;
  labelEmail: string;
  labelChangePassword: string;
  labelCurrentPassword: string;
  labelNewPassword: string;
  labelConfirmPassword: string; 
}

export default function Profile(props: ProfileProps) {
  const userFromStorage = LoginService.getUser() || {};

  const [name, setName] = useState(userFromStorage.name || "");
  const [email, setEmail] = useState(userFromStorage.email || "");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    userFromStorage.profile_photo
      ? `${API_URL}/${userFromStorage.profile_photo}`
      : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  );
  const [saving, setSaving] = useState(false);

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);

  // Validaciones de contraseña
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

  // Mensaje visual tipo alerta (igual que en Modal)
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Cambiar contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChanging(true);
    const token = localStorage.getItem("authToken");
    const user = LoginService.getUser();
    if (!token || !user) {
      setChanging(false);
      return;
    }

    const response = await fetch(
      `${API_URL}/api/v1/employees/${user.id}/password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      }
    );

    const data = await response.json();
    setAlert({
      type: response.ok ? "success" : "error",
      message: data.message || "Error al cambiar la contraseña"
    });
    if (response.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChanging(false);
  };

  // Cambiar foto de perfil
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_FILE_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        setAlert({ type: "error", message: "La imagen es demasiado grande. El tamaño máximo permitido es de 2MB." });
        return;
      }
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validImageTypes.includes(file.type)) {
        setAlert({ type: "error", message: "Por favor, sube una imagen en formato JPG, PNG o GIF." });
        return;
      }
      try {
        setSaving(true);
        setProfilePhotoUrl(URL.createObjectURL(file));
        const token = localStorage.getItem("authToken");
        const user = LoginService.getUser();
        if (!token || !user) {
          throw new Error("No se pudo verificar la autenticación");
        }
        const formData = new FormData();
        formData.append("profile_photo", file);
        const response = await fetch(
          `${API_URL}/api/v1/employees/${user.id}/profile-photo`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: formData,
          }
        );
        const data = await response.json();
        if (response.ok) {
          const updatedUser = { ...user, profile_photo: data.profile_photo };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          window.dispatchEvent(new Event("userUpdated"));
          setProfilePhotoUrl(`${API_URL}/${data.profile_photo}`);
          setAlert({ type: "success", message: "Foto de perfil actualizada correctamente" });
        } else {
          throw new Error(data.message || "Error al subir la foto");
        }
      } catch (error: any) {
        setAlert({ type: "error", message: error.message || "Ocurrió un error al actualizar la foto de perfil" });
        setProfilePhotoUrl(
          userFromStorage.profile_photo
            ? `${API_URL}/${userFromStorage.profile_photo}`
            : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        );
      } finally {
        setSaving(false);
      }
    }
  };

  // Guardar cambios en datos
  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("authToken");
    const user = LoginService.getUser();
    if (!token || !user) {
      setSaving(false);
      return;
    }
    const response = await fetch(`${API_URL}/api/v1/employees/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        role: userFromStorage.role,
        status: userFromStorage.status,
      }),
    });
    if (response.ok) {
      const updatedUser = await response.json();
      const userWithPhoto = {
        ...updatedUser,
        profile_photo: updatedUser.profile_photo || userFromStorage.profile_photo,
      };
      localStorage.setItem("user", JSON.stringify(userWithPhoto));
      window.dispatchEvent(new Event("userUpdated"));
      setAlert({ type: "success", message: "¡Datos actualizados correctamente!" });
    } else {
      const errorData = await response.json();
      setAlert({ type: "error", message: "Error al actualizar los datos: " + (errorData.message || response.statusText) });
    }
    setSaving(false);
  };

  // Ocultar alerta después de unos segundos
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "vendedor", "bodeguero"]}>
      <Container
        page={
          <div className="flex">
            <SideBar role={userFromStorage.role}></SideBar>
            <div className="w-full  max-h-[100vh] overflow-y-auto">
              <section className="m-10">
                {/* Alerta visual */}
                {alert && (
                  <div
                    className={`mb-4 px-4 py-2 rounded w-full text-center font-semibold ${
                      alert.type === "success"
                        ? "bg-verde-ultra-claro text-verde-claro"
                        : "bg-rojo-ultra-claro text-rojo-claro"
                    }`}
                  >
                    {alert.message}
                  </div>
                )}
                <section className="flex justify-between items-center mb-10">
                  <div>
                    <h1 className="text-2xl font-bold">{props.titleSection}</h1>
                    <p>{props.textSection}</p>
                  </div>
                  <button
                    className="bg-azul-medio hover:bg-azul-hover text-white px-4 py-2 rounded ml-2 cursor-pointer"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar configuración"}
                  </button>
                </section>

                <section className="grid grid-cols-2 gap-4">
                  <article className="bg-sky-50 p-4">
                    <h2 className="text-lg font-bold ml-4 mb-10 mt-2">{props.labelPersonalInfo}</h2>
                    <div className="flex flex-col items-center mb-2">
                      <div className="mb-4 flex flex-col items-center">
                        <img
                          className="w-32 h-32 rounded-full mx-auto mb-2"
                          src={profilePhotoUrl}
                          alt="Profile"
                        />
                        <label className="bg-azul-medio hover:bg-azul-hover text-white py-2 px-4 rounded cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoChange}
                          />
                          Cambiar Foto
                        </label>
                      </div>
                    </div>

                    <form className="flex flex-col gap-4 px-8 mb-6" onSubmit={(e) => e.preventDefault()}>
                      <div>
                        <label className="flex flex-col text-lg font-bold">
                          {props.labelName}
                          <input
                            className="bg-white pl-2 py-1 mt-2 font-normal text-base"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </label>
                      </div>
                      <div>
                        <label className="flex flex-col text-lg font-bold">
                          {props.labelEmail}
                          <input
                            className="bg-white pl-2 py-1 mt-2 font-normal text-base"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </label>
                      </div>
                    </form>
                  </article>

                  <article className="bg-sky-50 p-4">
                    <h2 className="text-lg font-bold ml-4 mb-10 mt-2">{props.labelChangePassword}</h2>
                    <form className="flex flex-col gap-4 px-8 mb-6" onSubmit={handleChangePassword}>
                      <div>
                        <label className="flex flex-col text-lg font-bold">{props.labelCurrentPassword}
                          <input 
                            className="bg-white pl-2 py-1 mt-2 font-normal text-base"
                            type="password" 
                            required
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                          />
                        </label>
                      </div>
                      <div>
                        <label className="flex flex-col text-lg font-bold">{props.labelNewPassword}
                          <input 
                            className="bg-white pl-2 py-1 mt-2 font-normal text-base"
                            type="password"
                            required 
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            onFocus={() => setNewPasswordFocused(true)}
                            onBlur={() => setNewPasswordFocused(false)}
                          />
                        </label>
                        {newPasswordFocused && (
                          <ul className="text-sm text-rojo-oscuro list-disc pl-5 mt-2">
                            {getPasswordErrors(newPassword).slice(0, 1).map((error, index) => (
                              <li
                                key={index}
                                className="transition-opacity duration-500 opacity-100"
                              >
                                {error}
                              </li>
                            ))}
                            {confirmPassword && confirmPassword !== newPassword && (
                              <li className="transition-opacity duration-500 opacity-100">Las contraseñas no coinciden</li>
                            )}
                          </ul>
                        )}
                      </div>
                      <div>
                        <label className="flex flex-col text-lg font-bold">{props.labelConfirmPassword}
                          <input 
                            className="bg-white pl-2 py-1 mt-2 font-normal text-base"
                            type="password"
                            required 
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            onFocus={() => setNewPasswordFocused(true)}
                            onBlur={() => setNewPasswordFocused(false)}
                          />
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="bg-azul-medio hover:bg-azul-hover text-white px-4 py-2 rounded ml-2 cursor-pointer"
                        disabled={changing}
                      >
                        {changing ? "Cambiando..." : "Cambiar contraseña"}
                      </button>
                    </form>
                  </article>
                </section>
              </section>
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
