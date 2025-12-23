
import React from 'react';
import { getTypeLabel } from '../constants.tsx';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ type: string }> = ({ type }) => (
  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${type === 'tip' ? 'bg-red-100 text-red-700' :
      type === 'peak' ? 'bg-orange-100 text-orange-700' :
        type === 'flat' ? 'bg-green-100 text-green-700' :
          type === 'valley' ? 'bg-blue-100 text-blue-700' :
            'bg-indigo-100 text-indigo-700'
    }`}>
    {getTypeLabel(type)}
  </span>
);

export const LoadingSpinner = () => (
  <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
);

export const Toast: React.FC<{ message: string, onClose: () => void }> = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span className="font-medium">{message}</span>
    </div>
  );
};
