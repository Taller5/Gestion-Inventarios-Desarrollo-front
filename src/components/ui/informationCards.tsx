interface InformationCardsProps {
  title?: string;
  text?: string;
}

export default function InformationCards(props: InformationCardsProps) {
  const user = localStorage.getItem("user");

  const handleAccessApp = () => {
    if (user) {
      window.location.href = "/Inventary";
    } else {
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-azul-oscuro text-white px-4">
      
      {/* Título y subtítulo */}
      <h2 className="text-3xl font-bold mb-2 text-center">{props.title}</h2>
      <p className="text-sm text-center max-w-xl mb-8">{props.text}</p>

      {/* Tarjetas */}
      <div className="flex flex-wrap gap-6 justify-center mb-8">
        <div className="flex flex-col items-center w-20">
          <button className="rounded-full bg-gray-300 w-20 h-20 flex items-center justify-center mb-1">
            <img src="/img/Sale.png" alt="Ventas rápidas y seguras" className="w-10 h-12" />
          </button>
          <span className="text-[10px] font-semibold text-center leading-tight">
            Ventas rápidas y seguras
          </span>
        </div>

        <div className="flex flex-col items-center w-20">
          <button className="rounded-full bg-gray-300 w-20 h-20 flex items-center justify-center mb-1">
            <img src="/img/branch.png" alt="Manejo de sucursales" className="w-10 h-10" />
          </button>
          <span className="text-[10px] font-semibold text-center leading-tight">
            Manejo de sucursales
          </span>
        </div>

        <div className="flex flex-col items-center w-20">
          <button className="rounded-full bg-gray-300 w-20 h-20 flex items-center justify-center mb-1">
            <img src="/img/inventory.png" alt="Control de inventario eficiente" className="w-10 h-12" />
          </button>
          <span className="text-[10px] font-semibold text-center leading-tight">
            Control de inventario eficiente
          </span>
        </div>
      </div>

      {/* Botón para acceder a la app */}
      <button
        onClick={handleAccessApp}
        className="bg-azul-fuerte hover:bg-azul-claro text-white font-bold py-2 px-6 rounded"
      >
        Acceder a la app
      </button>
    </div>
  );
}
