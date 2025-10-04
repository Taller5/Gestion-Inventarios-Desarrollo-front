import ProtectedRoute from "../services/ProtectedRoute";
import { useEffect, useState } from "react";
import SideBar from "../ui/SideBar";
import Container from "../ui/Container";
import { LoginService } from "../services/LoginService";
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import Cloudinary from "../services/Cloudinary";

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
      ? `${userFromStorage.profile_photo}`
      : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  );
  const [saving, setSaving] = useState(false);

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones de contraseña
  const passwordValidations = [
    {
      test: (pw: string) => pw.length >= 6,
      message: "Al menos 6 caracteres",
    },
    {
      test: (pw: string) => /[A-Z]/.test(pw),
      message: "Al menos una letra mayúscula",
    },
    {
      test: (pw: string) => /[a-z]/.test(pw),
      message: "Al menos una letra minúscula",
    },
    {
      test: (pw: string) => /\d/.test(pw),
      message: "Al menos un número",
    },
    {
      test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
      message: "Al menos un carácter especial",
    },
  ];

  const getPasswordErrors = (pw: string) =>
    passwordValidations.filter((v) => !v.test(pw)).map((v) => v.message);

  // Mensaje visual tipo alerta (igual que en Modal)
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
      message: data.message || "Error al cambiar la contraseña",
    });
    if (response.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChanging(false);
  };

  // Cambiar foto de perfil
  const handlePhotoChange = async (url: string) => {
    localStorage.setItem('profilePhotoUrl', url);
    console.log(url);
    console.log('fromstor',userFromStorage.profile_photo);

    try {
      setSaving(true);
      setProfilePhotoUrl(url);
      const token = localStorage.getItem('authToken');
      const user = LoginService.getUser();

      if (!token || !user) {
          throw new Error("No se pudo verificar la autenticación");
        }

      const response = await fetch(`${API_URL}/api/v1/employees/${user.id}/profile-photo`, {
        method: 'POST', //decía put
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          // Accept: "application/json",
        },
        body: JSON.stringify({ profile_photo: url }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la foto de perfil');
      }

      // Actualiza el usuario en localStorage
      const updatedUser = { ...user, profile_photo: url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));
      setAlert({
            type: "success",
            message: "Foto de perfil actualizada correctamente",
      });
    } catch (error: any) {
      setAlert({
          type: "error",
          message:
            error.message || "Ocurrió un error al actualizar la foto de perfil",
        });
        setProfilePhotoUrl(
          userFromStorage.profile_photo
            ? `${userFromStorage.profile_photo}`
            : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        );
    }finally {
        setSaving(false);
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
        profile_photo:
          updatedUser.profile_photo || userFromStorage.profile_photo,
      };
      localStorage.setItem("user", JSON.stringify(userWithPhoto));
      window.dispatchEvent(new Event("userUpdated"));
      setAlert({
        type: "success",
        message: "¡Datos actualizados correctamente!",
      });
    } else {
      const errorData = await response.json();
      setAlert({
        type: "error",
        message:
          "Error al actualizar los datos: " +
          (errorData.message || response.statusText),
      });
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
    <ProtectedRoute
      allowedRoles={["administrador", "supervisor", "vendedor", "bodeguero"]}
    >
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
                        ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro border"
                        : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
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
                    className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar configuración"}
                  </button>
                </section>

                <section className="grid grid-cols-2 gap-4">
                  <article className="bg-sky-50 p-4">
                    <h2 className="text-lg font-bold ml-4 mb-10 mt-2">
                      {props.labelPersonalInfo}
                    </h2>
                    <div className="flex flex-col items-center mb-2">
                      <div className="mb-4 flex flex-col items-center">
                        <img
                          className="w-32 h-32 rounded-full mx-auto mb-7"
                          src={profilePhotoUrl}
                        />
                        <Cloudinary onUpload={handlePhotoChange}/>
                      </div>
                    </div>

                    <form
                      className="flex flex-col gap-4 px-8 mb-6"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div>
                        <label className="flex flex-col text-lg font-bold">
                          {props.labelName}
                          <input
                            className="bg-white pl-2 py-1 mt-2 font-normal text-base"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => {
                              const onlyLetters = e.target.value.replace(
                                /[^A-Za-zÁÉÍÓÚáéíóúñÑ\s]/g,
                                ""
                              );
                              setName(onlyLetters);
                            }}
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
                    <h2 className="text-lg font-bold ml-4 mb-10 mt-2">
                      {props.labelChangePassword}
                    </h2>
                    <form
                      className="flex flex-col gap-4 px-8 mb-6"
                      onSubmit={handleChangePassword}
                    >
                      <div>
                        <label className="flex flex-col text-lg font-bold relative">
                          {props.labelCurrentPassword}
                          <input
                            className="bg-white pl-2 py-1 mt-2 font-normal text-base"
                            type={showCurrentPassword ? "text" : "password"}
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                          <div
                            className="absolute right-3 bottom-1 text-gray-600 cursor-pointer"
                            onMouseDown={() => setShowCurrentPassword(true)}
                            onMouseUp={() => setShowCurrentPassword(false)}
                          >
                            {showCurrentPassword ? (
                              <IoEyeOutline className="w-6 h-6" />
                            ) : (
                              <IoEyeOffOutline className="w-6 h-6" />
                            )}
                          </div>
                        </label>
                      </div>
                      <div>
                        <label className="flex flex-col text-lg font-bold relative">
                          {props.labelNewPassword}
                          <input
                            className="bg-white pl-2 py-1 mt-2 font-normal text-base"
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onFocus={() => setNewPasswordFocused(true)}
                            onBlur={() => setNewPasswordFocused(false)}
                          />
                          <div
                            className="absolute right-3 bottom-1 text-gray-600 cursor-pointer"
                            onMouseDown={() => setShowNewPassword(true)}
                            onMouseUp={() => setShowNewPassword(false)}
                          >
                            {showNewPassword ? (
                              <IoEyeOutline className="w-6 h-6" />
                            ) : (
                              <IoEyeOffOutline className="w-6 h-6" />
                            )}
                          </div>
                        </label>
                        {newPasswordFocused && (
                          <ul className="text-sm text-rojo-oscuro list-disc pl-5 mt-2">
                            {getPasswordErrors(newPassword)
                              .slice(0, 1)
                              .map((error, index) => (
                                <li
                                  key={index}
                                  className="transition-opacity duration-500 opacity-100"
                                >
                                  {error}
                                </li>
                              ))}
                            {confirmPassword &&
                              confirmPassword !== newPassword && (
                                <li className="transition-opacity duration-500 opacity-100">
                                  Las contraseñas no coinciden
                                </li>
                              )}
                          </ul>
                        )}
                      </div>
                      <div>
                        <label className="flex flex-col text-lg font-bold relative">
                          {props.labelConfirmPassword}
                          <input
                            className="bg-white pl-2 py-1 mt-2 font-normal text-base"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setNewPasswordFocused(true)}
                            onBlur={() => setNewPasswordFocused(false)}
                          />
                          <div
                            className="absolute right-3 bottom-1 text-gray-600 cursor-pointer"
                            onMouseDown={() => setShowConfirmPassword(true)}
                            onMouseUp={() => setShowConfirmPassword(false)}
                          >
                            {showConfirmPassword ? (
                              <IoEyeOutline className="w-6 h-6" />
                            ) : (
                              <IoEyeOffOutline className="w-6 h-6" />
                            )}
                          </div>
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
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
