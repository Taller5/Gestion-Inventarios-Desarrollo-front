import { useEffect, useState } from "react";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { LoginService } from "../services/LoginService";


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
  // Extraer el usuario del localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // Extraer el rol del usuario
  const userRole = user.role || "";


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");     
  const [status, setStatus] = useState(""); 
  const [saving, setSaving] = useState(false);

//Contraseña 
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [changing, setChanging] = useState(false);

const handleChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setChanging(true);
  const token = localStorage.getItem("authToken");
  const user = LoginService.getUser();
  if (!token || !user) {
    setChanging(false);
    return;
  }

  const response = await fetch(`http://localhost:8000/api/v1/employees/${user.id}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword
    })
  });

  const data = await response.json();
  if (response.ok) {
    alert(data.message);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } else {
    alert(data.message || "Error al cambiar la contraseña");
  }
  setChanging(false);
};

//Profile picture
const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");

const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setProfilePhotoUrl(URL.createObjectURL(file));

    const token = localStorage.getItem("authToken");
    const user = LoginService.getUser();
    if (!token || !user) return;

    const formData = new FormData();
    formData.append("profile_photo", file);

    const response = await fetch(`http://localhost:8000/api/v1/employees/${user.id}/profile-photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      body: formData
    });

    const data = await response.json();
    if (response.ok) {
      setProfilePhotoUrl(`http://localhost:8000/${data.profile_photo}`);
      alert(data.message);
    } else {
      alert(data.message || "Error al subir la foto");
    }
  }
};

useEffect(() => {
  const user = LoginService.getUser();
  if (user) {
    setName(user.name || "");
    setEmail(user.email || "");
    setRole(user.role || "");
    setStatus(user.status || "");
    if (user.profile_photo) {
      setProfilePhotoUrl(`http://localhost:8000/${user.profile_photo}`);
    }
  }

  // Intenta actualizar desde la API solo si hay token
  const token = localStorage.getItem("authToken");
  if (token) {
    fetch("http://localhost:8000/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.name && data.email && data.role && data.status) {
          setName(data.name);
          setEmail(data.email);
          setRole(data.role);
          setStatus(data.status);
          if (data && data.profile_photo) {
  setProfilePhotoUrl(`http://localhost:8000/${data.profile_photo}`);
} else {
  setProfilePhotoUrl("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png");
}
        }
      })
      .catch(() => {});
  }
}, []);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("authToken");
    const user = LoginService.getUser();
    if (!token || !user) {
      setSaving(false);
      return;
    }

   const response = await fetch(`http://localhost:8000/api/v1/employees/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        role,    // se envía pero no se edita
        status   // se envía pero no se edita
      })
    });

    if (response.ok) {
      alert("¡Datos actualizados correctamente!");
      const updatedUser = await response.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      const errorData = await response.json();
      alert("Error al actualizar los datos: " + (errorData.message || response.statusText));
    }
    setSaving(false);
  };

  return (
    <Container page={
      <div className="flex flex-1">
        <SideBar role={userRole}></SideBar>
        <div className="w-full flex-1 ">
          <section className="m-10">
            {/*Header Section*/}
            <section className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-2xl font-bold">{props.titleSection}</h1>
                <p>{props.textSection}</p>
              </div>
              <button
               className="bg-azul-fuerte hover:bg-azul-oscuro cursortext-white px-4 py-2 rounded ml-2 text-white cursor-pointer"
                onClick={handleSave}
                disabled={saving}>
                {saving ? "Guardando..." : "Guardar configuración"}
              </button>
            </section>
            {/*End header section*/}
            <section className="grid grid-cols-2 gap-4">
              {/*Personal info section*/}
              <article className="bg-gris-claro p-4">
                <h2 className="text-lg font-bold ml-4 mb-10 mt-2">{props.labelPersonalInfo}</h2>
                {/*Profile Picture Section*/}
                <div className="flex flex-col items-center mb-2">
                  <div className="mb-4 flex flex-col items-center">

                     <img
                      className="w-32 h-32 rounded-full mx-auto mb-2"
                      src={profilePhotoUrl}
                      alt="Profile"
                    />
                    <label className="bg-azul-fuerte hover:bg-azul-oscuro text-white  py-2 px-4 rounded cursor-pointer">
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
                {/*Form section*/}
                <form className="flex flex-col gap-4 px-8 mb-6" onSubmit={e => e.preventDefault()}>
                  <div>
                    <label className="flex flex-col text-lg font-bold">
                      {props.labelName}
                      <input
                        className="bg-gris-oscuro pl-2 py-1 mt-2 font-normal text-base"
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="flex flex-col text-lg font-bold">
                      {props.labelEmail}
                      <input
                        className="bg-gris-oscuro pl-2 py-1 mt-2 font-normal text-base "
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </label>
                  </div>
                </form>
                {/*End form section*/}
              </article>
              {/*Change password section*/}
              <article className="bg-gris-claro p-4">
                <h2 className="text-lg font-bold ml-4 mb-10 mt-2">{props.labelChangePassword}</h2>
                <form className="flex flex-col gap-4 px-8 mb-6" onSubmit={handleChangePassword}>
  <div>
    <label className="flex flex-col text-lg font-bold">{props.labelCurrentPassword}
      <input 
        className="bg-gris-oscuro pl-2 py-1 mt-2 font-normal text-base"
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
        className="bg-gris-oscuro pl-2 py-1 mt-2 font-normal text-base"
        type="password"
        required 
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />
    </label>
  </div>
  <ul className="text-sm text-red-700 list-disc pl-5">
    <li>Al menos 8 caracteres</li>
    <li>Al menos una letra mayúscula</li>
    <li>Al menos una letra minúscula</li>
    <li>Al menos un número</li>
    <li>Al menos un carácter especial</li>
  </ul>
  <div>
    <label className="flex flex-col text-lg font-bold">{props.labelConfirmPassword}
      <input 
        className="bg-gris-oscuro pl-2 py-1 mt-2 font-normal text-base"
        type="password"
        required 
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
      />
    </label>
  </div>
  <button
    type="submit"
    className="bg-azul-fuerte hover:bg-azul-oscuro cursortext-white px-4 py-2 rounded ml-2 text-white cursor-pointer"
    disabled={changing}
  >
    {changing ? "Cambiando..." : "Cambiar contraseña"}
  </button>
</form>
              </article>
              {/*End change password section*/}
            </section>
          </section>
        </div>
      </div>
    }/>
  );
}