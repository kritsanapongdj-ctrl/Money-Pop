import React from 'react';
import { LayoutDashboard, Receipt, FileCheck2, SlidersHorizontal } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: <LayoutDashboard size={19} />, label: 'ภาพรวม' },
  { id: 'expenses', icon: <Receipt size={19} />, label: 'รายการบิล' },
  { id: 'receipts', icon: <FileCheck2 size={19} />, label: 'สลิปใบเสร็จ' },
  { id: 'settings', icon: <SlidersHorizontal size={19} />, label: 'ตั้งค่า' }
];

export default function BottomNav({ activeTab, onSelectTab }) {
  return (
    <nav className="bg-white border-t-2 border-[#12161A] px-3 py-2 flex justify-around items-center sticky bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] select-none">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button 
            key={item.id} 
            onClick={() => onSelectTab(item.id)} 
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              isActive 
                ? 'bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] font-black scale-105' 
                : 'text-slate-600 hover:text-[#12161A] hover:bg-slate-100 font-semibold'
            }`}
          >
            {item.icon}
            <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

