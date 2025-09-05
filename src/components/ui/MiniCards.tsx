interface MiniCardsProps {
  title?: string;
  text?: string;
  button?: React.ReactNode[];
  image?: string;
}

export default function MiniCards(props: MiniCardsProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-[60vh] bg-white text-black">
      {/* Columna izquierda: contenido centrado */}
      <div className="flex flex-col flex-1 items-center justify-center px-6 md:px-10 py-8">
        {props.title && (
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-center leading-snug">
            {props.title}
          </h2>
        )}
        {props.text && (
          <p className="text-base md:text-xl text-center max-w-md leading-relaxed mb-6">
            {props.text.split('\n').map((line, idx) => (
              <span key={idx}>
                {line}
                <br />
              </span>
            ))}
          </p>
        )}

        {/* Botones */}
        <div className="flex flex-wrap gap-4 justify-center">
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
