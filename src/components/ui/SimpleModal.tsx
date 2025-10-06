import React, { useEffect } from 'react';

interface SimpleModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  isWide?: boolean;
  onReset?: () => void; // <-- callback para resetear estados al cerrar
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
    // Cuando el modal se cierre (open pasa a false), ejecuta onReset
    if (!open && onReset) {
      onReset();
    }
  }, [open, onReset]);

  if (!open) return null;

  const modalWidth = isWide ? 'w-full max-w-4xl' : 'w-full max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo translúcido */}
      <div 
        className="absolute inset-0 bg-transparent backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-lg shadow-xl ${modalWidth} ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
