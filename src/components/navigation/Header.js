import React from 'react';
import { Users, RefreshCw, WalletCards } from 'lucide-react';

export default function Header({ 
  currentUser, 
  members, 
  onOpenUserModal, 
  isSyncing, 
  onRefresh 
}) {
  const currentMember = members.find(m => String(m.id) === String(currentUser));

  return (
    <header className="bg-white px-4 py-3 flex justify-between items-center border-b-2 border-[#12161A] z-30 select-none">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] rounded-lg flex items-center justify-center font-mono font-black text-base">
          ฿
        </div>
        <div>
          <div className="text-lg font-black text-[#12161A] leading-none tracking-tight flex items-center gap-1">
            MONEY<span className="text-[#2554FF]">POP</span>
            <span className="text-[9px] bg-[#FEF3C7] text-[#92400E] border border-[#12161A] font-extrabold px-1.5 py-0.2 rounded-full uppercase ml-1">
              Vault
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-semibold tracking-wide flex items-center gap-1 mt-0.5">
            <WalletCards size={10} className="text-[#059669]" />
            Smart Expense & Split
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onOpenUserModal} 
          className="bg-white hover:bg-[#EEF2FF] text-[#12161A] border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] px-2.5 py-1.5 rounded-xl font-bold flex items-center text-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
        >
          <div className="w-2 h-2 rounded-full bg-[#10B981] mr-1.5 border border-[#12161A]" />
          <Users size={13} className="mr-1 text-[#2554FF]" /> 
          <span className="truncate max-w-[80px] sm:max-w-none">
            {currentMember ? currentMember.name : 'เลือกผู้ใช้'}
          </span>
        </button>

        <button 
          onClick={() => onRefresh(true)} 
          disabled={isSyncing}
          className="w-8 h-8 bg-white hover:bg-slate-100 text-[#12161A] border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] rounded-xl flex items-center justify-center active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-60"
          title="รีเฟรชข้อมูลคลาวด์"
        >
          <RefreshCw size={14} className={isSyncing ? "animate-spin text-[#2554FF]" : "text-[#12161A]"} />
        </button>
      </div>
    </header>
  );
}

