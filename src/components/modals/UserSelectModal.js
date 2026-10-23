import React from 'react';
import { Users, Check } from 'lucide-react';

export default function UserSelectModal({ 
  show, 
  members, 
  currentUser, 
  onSelectUser, 
  onClose 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[#12161A]/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border-2 border-[#12161A] shadow-[8px_8px_0px_#12161A] w-full max-w-sm rounded-2xl p-6 text-center">
        
        <div className="mx-auto w-14 h-14 bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl flex items-center justify-center mb-3">
          <Users size={28} />
        </div>
        
        <span className="text-[10px] font-black tracking-widest text-[#2554FF] uppercase bg-[#EEF2FF] border border-[#2554FF]/40 px-2 py-0.5 rounded-full">
          USER PROFILE
        </span>
        <h2 className="text-xl font-black text-[#12161A] tracking-tight mt-1 mb-1">
          เลือกผู้ใช้งานปัจจุบัน
        </h2>
        <p className="text-slate-500 mb-5 text-xs font-semibold">
          ระบุตัวตนของคุณเพื่อบันทึกประวัติการจ่ายและออกสลิป
        </p>

        <div className="space-y-2.5">
          {members.map((m) => {
            const isSelected = currentUser === String(m.id);
            return (
              <button 
                key={m.id} 
                onClick={() => onSelectUser(m.id)} 
                className={`w-full py-3 px-4 rounded-xl font-black transition-all text-sm flex items-center justify-between border-2 border-[#12161A] cursor-pointer ${
                  isSelected 
                    ? 'bg-[#2554FF] text-white shadow-[3px_3px_0px_#12161A] translate-x-[-1px] translate-y-[-1px]' 
                    : 'bg-white hover:bg-slate-50 text-[#12161A] shadow-[2px_2px_0px_#12161A]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border border-[#12161A] ${isSelected ? 'bg-[#10B981]' : 'bg-slate-300'}`} />
                  <span>{m.name}</span>
                </div>
                {isSelected && <Check size={18} className="stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {currentUser && (
          <button 
            onClick={onClose} 
            className="mt-5 text-slate-500 hover:text-[#12161A] font-bold text-xs underline cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        )}
      </div>
    </div>
  );
}

