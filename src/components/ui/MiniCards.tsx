interface MiniCardsProps {

    title?: string;
    text?:  string;
    button?:  React.ReactNode[];
    image?: string;

}

export default function MiniCards(props: MiniCardsProps) {
  return (
    <div className="flex flex-row min-h-[60vh] bg-white text-black">
      {/* Columna izquierda: contenido centrado */}
      <div className="flex flex-col flex-1 items-center justify-center px-10">
        <h2 className="text-3xl font-bold mb-3 text-center">{props.title}</h2>
        <p className="text-base mb-10 text-center">
          {props.text &&
            props.text.split('\n').map((line, idx) => (
              <span key={idx}>
                {line}
                <br />
              </span>
            ))}
        </p>
        <div className="flex gap-10 justify-center">
          {props.button && props.button.map((btn, idx) => (
            <div key={idx}>{btn}</div>
          ))}
        </div>
      </div>
      {/* Columna derecha: imagen responsiva */}
      {props.image && (
        <div className="flex-1 flex items-stretch">
          <img
            src={props.image}
            alt="MiniCard"
            className="w-full h-auto max-h-[60vh] object-cover rounded-r-lg"
            style={{ minHeight: 0 }}
          />
        </div>
      )}
    </div>
  );
}