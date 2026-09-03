import React from 'react';
import { Users } from 'lucide-react';

export default function UserSelectModal({ 
  show, 
  members, 
  currentUser, 
  onSelectUser, 
  onClose 
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#161C2D] border border-[#f472b6]/60 w-full max-w-sm rounded-3xl p-8 shadow-[0_0_50px_rgba(244,114,182,0.3)] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#38bdf8]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#f472b6]/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

        <div className="mx-auto w-16 h-16 bg-[#f472b6]/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(244,114,182,0.4)] border border-[#f472b6]/50 relative z-10">
          <Users size={32} className="text-[#f472b6]" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-100 mb-2 relative z-10">ยินดีต้อนรับ!</h2>
        <p className="text-slate-400 mb-6 text-sm relative z-10">
          กรุณาระบุว่าคุณคือใคร เพื่อใช้บันทึกประวัติการทำรายการ
        </p>

        <div className="space-y-3 relative z-10">
          {members.map((m) => {
            const isSelected = currentUser === String(m.id);
            return (
              <button 
                key={m.id} 
                onClick={() => onSelectUser(m.id)} 
                className={`w-full py-4 rounded-xl font-bold transition-all text-lg flex items-center justify-center ${
                  isSelected 
                    ? 'bg-[#f472b6] text-white shadow-[0_0_15px_rgba(244,114,182,0.5)]' 
                    : 'bg-[#161824] text-slate-300 border border-[#3f4366] hover:border-[#f472b6] hover:text-[#f472b6]'
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>

        {currentUser && (
          <button 
            onClick={onClose} 
            className="mt-6 text-slate-500 hover:text-slate-300 underline text-sm relative z-10"
          >
            ปิดหน้าต่าง
          </button>
        )}
      </div>
    </div>
  );
}
