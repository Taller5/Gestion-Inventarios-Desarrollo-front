import React from 'react';

interface SimpleModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function SimpleModal({ 
  open, 
  onClose, 
  children, 
  title,
  className = '' 
}: SimpleModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-lg shadow-xl w-full max-w-md ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
