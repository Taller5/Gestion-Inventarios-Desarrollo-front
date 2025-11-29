import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

interface InfoIconProps {
  title: string;
  description: string;
  containerClassName?: string;
}

export default function InfoIcon({ title, description, containerClassName }: InfoIconProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative inline-block">
      <FaInfoCircle
        className="w-6 h-6 ml-2 text-azul-medio cursor-pointer"
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
      />
      <div
        className={`
          absolute top-1/2 -translate-y-1/2 mt-6
          p-3 rounded-md shadow-lg bg-white text-sm text-gray-700 border border-gray-200
          transition-opacity duration-200 z-10 cursor-default
          ${showInfo ? "opacity-100" : "opacity-0 pointer-events-none"}
          w-full max-w-xs sm:max-w-sm md:max-w-md
          left-1/2 -translate-x-1/2

          /* En escritorio mantener posicion original */
          sm:left-8 sm:-translate-x-0
          ${containerClassName ?? ""}
        `}
        style={{ minWidth: "16rem" }}
      >
        <h4 className="text-center pb-2 font-bold">{title}</h4>
        <p className="font-normal">{description}</p>
      </div>
    </div>
  );
}
