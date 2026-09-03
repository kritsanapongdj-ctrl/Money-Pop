import React from 'react';
import { Home, CreditCard, FileText, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', icon: <Home size={22} />, label: 'หน้าแรก' },
  { id: 'expenses', icon: <CreditCard size={22} />, label: 'บิล' },
  { id: 'receipts', icon: <FileText size={22} />, label: 'ใบเสร็จ' },
  { id: 'settings', icon: <Settings size={22} />, label: 'ตั้งค่า' }
];

export default function BottomNav({ activeTab, onSelectTab }) {
  return (
    <nav className="bg-[#1a1c29]/90 backdrop-blur-xl border-t border-[#3f4366] p-2 flex justify-around sticky bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button 
            key={item.id} 
            onClick={() => onSelectTab(item.id)} 
            className={`flex flex-col items-center p-2 rounded-xl w-16 transition-all ${
              isActive 
                ? 'text-[#f472b6] bg-[#f472b6]/10 font-bold shadow-[0_0_10px_rgba(244,114,182,0.15)] scale-110' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
