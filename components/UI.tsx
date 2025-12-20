
import React from 'react';
import { getTypeLabel } from '../constants.tsx';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ type: string }> = ({ type }) => (
  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
    type === 'tip' ? 'bg-red-100 text-red-700' :
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
