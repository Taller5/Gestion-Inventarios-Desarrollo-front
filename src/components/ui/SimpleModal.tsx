import React, { useEffect } from 'react';

interface SimpleModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  isWide?: boolean;
  onReset?: () => void; // callback para resetear estados al cerrar
}

export default function SimpleModal({ 
  open, 
  onClose, 
  children, 
  title,
  className = '',
  isWide = false,
  onReset
}: SimpleModalProps) {
  useEffect(() => {
    if (!open && onReset) {
      onReset();
    }
  }, [open, onReset]);

  if (!open) return null;

  // Define el ancho del modal aquí, sin variables externas
  const modalWidth = isWide ? 'w-full max-w-4xl' : 'w-full max-w-md';

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 

  {/* Modal */}
  <div
    className="relative bg-white rounded-lg shadow-lg pointer-events-auto overflow-y-auto"
    style={{
      width: "32rem",
      maxHeight: "90vh",
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    }}
  >
      {/* Fondo translúcido */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-lg shadow-xl ${modalWidth} ${className}`}>
        {/* Botón de cierre */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-4 rounded-full p-1 bg-[var(--color-rojo-ultra-claro)] hover:bg-[var(--color-rojo-claro)] transition cursor-pointer"
          style={{ zIndex: 10 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[var(--color-rojo-oscuro)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  </div>
  );
}
