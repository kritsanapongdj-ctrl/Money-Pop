import React from 'react';
import { BellRing } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-white text-[#12161A] border-2 border-[#12161A] shadow-[4px_4px_0px_#12161A] px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 animate-bounce-short select-none">
      <div className="w-5 h-5 rounded-md bg-[#2554FF] text-white flex items-center justify-center shrink-0">
        <BellRing size={12} />
      </div>
      <span>{message}</span>
    </div>
  );
}

