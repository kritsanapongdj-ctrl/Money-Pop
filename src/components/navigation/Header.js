import React from 'react';
import { Zap, Users, RefreshCw } from 'lucide-react';

export default function Header({ 
  currentUser, 
  members, 
  onOpenUserModal, 
  isSyncing, 
  onRefresh 
}) {
  const currentMember = members.find(m => String(m.id) === String(currentUser));

  return (
    <header className="bg-[#1a1c29]/90 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-[#3f4366]/80 z-30">
      <div className="text-xl font-black text-slate-100 flex items-center tracking-tight">
        <Zap size={20} className="mr-1 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" /> 
        MONEY<span className="text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">-POP</span>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenUserModal} 
          className="bg-[#f472b6]/20 text-[#f472b6] border border-[#f472b6]/50 px-3 py-1.5 rounded-xl font-bold flex items-center shadow-[0_0_10px_rgba(244,114,182,0.2)] text-xs hover:bg-[#f472b6]/30 transition"
        >
          <Users size={14} className="mr-1.5" /> 
          {currentMember ? currentMember.name : 'เลือกผู้ใช้'}
        </button>
        {isSyncing ? (
          <RefreshCw size={18} className="animate-spin text-[#f472b6]" />
        ) : (
          <button 
            onClick={() => onRefresh(true)} 
            className="text-slate-400 hover:text-[#f472b6] transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={18} />
          </button>
        )}
      </div>
    </header>
  );
}
