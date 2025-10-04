import { useEffect, useState } from "react";

interface CloudinaryProps {
  onUpload: (url: string) => void;
}

const Cloudinary : React.FC<CloudinaryProps> = ({ onUpload }) => {

    const preset_name = "kKk8UasdJ";
    const cloud_name = "djbcolbpm"  

    const [alert, setAlert] = useState<{
        type: "success" | "error";
        message: string;
      } | null>(null);

      useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [alert]);

    const uploadImage = async (e:any)=>{
        const files = e.target.files
        const MAX_FILE_SIZE = 2 * 1024 * 1024;
        if (files[0].size > MAX_FILE_SIZE) {
            // alert('Su pene es demasiado grande. El tamaño máximo permitido es 2cm.');
          setAlert({
            type: "error",
            message:
              "La imagen es demasiado grande. El tamaño máximo permitido es de 2MB.",
        });
            return;
        };
        const data = new FormData()
        data.append('file', files[0])
        data.append('upload_preset',preset_name)

            try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
                method: 'POST',
                body: data
            });

            const file = await response.json();
            onUpload(file.secure_url);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

  return (
    <div className="flex flex-col items-center">
        <label htmlFor="fileUpload" className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer">
        Cambiar foto
        </label>
        <input
        id="fileUpload"
        type="file"
        name="file"
        accept="image/png, image/jpeg"
        onChange={(e) => uploadImage(e)}
        style={{ display: 'none' }}
        />

        {alert && (
                  <div
                    className={`mt-4 px-4 py-2 rounded w-full text-center font-semibold ${
                      alert.type === "success"
                        ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro border"
                        : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
                    }`}
                  >
                    {alert.message}
                  </div>
                )}

    </div>
  );
}

export default Cloudinary