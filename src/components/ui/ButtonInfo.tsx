import { useState } from "react";

interface ButtonInfoProps {
  textInfo: string;
  children: React.ReactNode;
  position?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
}

export default function ButtonInfo({
  textInfo,
  children,
  position = "top",
}: ButtonInfoProps) {
  const [show, setShow] = useState(false);

  // Posicionamiento avanzado
  let posClasses = "left-1/2 -translate-x-1/2 bottom-full mb-2";
  if (position === "bottom") posClasses = "left-1/2 -translate-x-1/2 top-full mt-2";
  if (position === "left") posClasses = "right-full mr-2 top-1/2 -translate-y-1/2";
  if (position === "right") posClasses = "left-full ml-2 top-1/2 -translate-y-1/2";
  if (position === "top-left") posClasses = "right-0 bottom-full mb-2";
  if (position === "top-right") posClasses = "left-0 bottom-full mb-2";
  if (position === "bottom-left") posClasses = "right-0 top-full mt-2";
  if (position === "bottom-right") posClasses = "left-0 top-full mt-2";

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      <div
        className={`absolute ${posClasses} z-50 min-w-[120px] max-w-xs px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 shadow-lg text-gray-600 text-sm font-medium transition-all duration-200
          ${show ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}
        `}
        style={{ whiteSpace: "pre-line" }}
      >
        {textInfo}
      </div>
    </div>
  );
}
