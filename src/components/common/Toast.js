import React from 'react';
import { Zap } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-800 border border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-slate-100 px-6 py-3 rounded-full font-bold text-sm flex items-center animate-fadeIn">
      <Zap size={16} className="mr-2 text-[#f472b6]" />
      {message}
    </div>
  );
}
