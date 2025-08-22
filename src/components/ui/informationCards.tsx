interface InformationCardsProps {

    title?: string;
    text?:  string;
    button?:  React.ReactNode[];

}

export default function InformationCards(props: InformationCardsProps) {
  return (
    
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-azul-oscuro text-white">

      <h2 className="text-3xl font-bold mb-3 text-center">{props.title}</h2>
      <p className="text-base mb-10 text-center">{props.text}</p>
      <div className="flex gap-10 justify-center">
        <div className="flex flex-col items-center">
          <button className="rounded-full bg-gray-300 w-20 h-20 flex items-center justify-center mb-2">
            <img src="/img/Sale.png" alt="Ventas rápidas y seguras" className="w-10 h-12" />
          </button>
          <span className="text-xs font-semibold text-center">Ventas rápidas y seguras</span>
        </div>
        <div className="flex flex-col items-center">
          <button className="rounded-full bg-gray-300 w-20 h-20 flex items-center justify-center mb-2">
            <img src="/img/branch.png" alt="Manejo de sucursales" className="w-10 h-10" />
          </button>
          <span className="text-xs font-semibold text-center">Manejo de sucursales</span>
        </div>
        <div className="flex flex-col items-center">
          <button className="rounded-full bg-gray-300 w-20 h-20 flex items-center justify-center mb-2">
            <img src="/img/inventory.png" alt="Control de inventario eficiente" className="w-10 h-12" />
          </button>
          <span className="text-xs font-semibold text-center">Control de inventario eficiente</span>
        </div>
      </div>
    </div>
    


  );
}