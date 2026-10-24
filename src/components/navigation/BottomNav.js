import React from 'react';
import { LayoutDashboard, Receipt, CreditCard, FileCheck2, SlidersHorizontal } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'ภาพรวม' },
  { id: 'expenses', icon: <Receipt size={18} />, label: 'รายการบิล' },
  { id: 'vault', icon: <CreditCard size={18} />, label: 'สินเชื่อ/บัตร' },
  { id: 'receipts', icon: <FileCheck2 size={18} />, label: 'สลิปใบเสร็จ' },
  { id: 'settings', icon: <SlidersHorizontal size={18} />, label: 'ตั้งค่า' }
];

export default function BottomNav({ activeTab, onSelectTab }) {
  return (
    <nav className="bg-white border-t-2 border-[#12161A] px-2 py-2 flex justify-around items-center sticky bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] select-none">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button 
            type="button"
            key={item.id} 
            onClick={() => onSelectTab(item.id)} 
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2554FF] ${
              isActive 
                ? 'bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] font-black scale-105' 
                : 'text-slate-600 hover:text-[#12161A] hover:bg-slate-100 font-semibold'
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}


