interface MiniCardsProps {

    title?: string;
    text?:  string;
    button?:  React.ReactNode[];
    image?: string;

}

export default function MiniCards(props: MiniCardsProps) {
  return (
    <div className="flex flex-row items-center min-h-[60vh] bg-white text-black px-10">
      {/* Contenido alineado a la izquierda */}
      <div className="flex flex-col flex-1 items-start justify-center">
        <h2 className="text-3xl font-bold mb-3">{props.title}</h2>
        <p className="text-base mb-10">{props.text}</p>
        <div className="flex gap-10 justify-start">
          {props.button && props.button.map((btn, idx) => (
            <div key={idx}>{btn}</div>
          ))}
        </div>
      </div>
      {/* Imagen al lado derecho, no pegada */}
      {props.image && (
        <div className="ml-16">
          <img src={props.image} alt="MiniCard" className="w-150  object-contain" />
        </div>
      )}
    </div>
  );
}