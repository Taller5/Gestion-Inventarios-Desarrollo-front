interface PerfilNavProps {
    name: string;
    rol: string;
    profilePicture: string;
}

export default function PerfilNav(props: PerfilNavProps) {
  return (
    <nav className="bg-gris-claro flex items-right w-full h-10 shadow perfil-nav" >
        <div className="flex items-center gap-4">
            <div className="text-right">
            <div className="font-medium">{props.name}</div>
            <div className="text-sm text-gray-600">{props.rol}</div>
            </div>
            <img
            src={props.profilePicture}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
            />
        </div>
    </nav>
  );
}