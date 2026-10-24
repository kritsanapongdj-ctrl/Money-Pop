import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { theme } from '../../constants/theme';

export default function ListManager({ title, data, updateDB, dataKey, icon: Icon, hasEmail }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    const newItem = { id: Date.now().toString(), name: name.trim() };
    if (hasEmail) newItem.email = email.trim();

    updateDB({ [dataKey]: [...data, newItem] });
    setName('');
    setEmail('');
  };

  const handleDelete = (id) => {
    updateDB({ [dataKey]: data.filter((i) => String(i.id) !== String(id)) });
  };

  return (
    <div className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-100">
        {Icon && (
          <div className="w-6 h-6 rounded-md bg-[#2554FF]/10 text-[#2554FF] border border-[#12161A] flex items-center justify-center">
            <Icon size={14} />
          </div>
        )}
        <h3 className="text-xs font-black uppercase tracking-wider text-[#12161A]">
          {title} ({data.length})
        </h3>
      </div>
      
      <div className="flex gap-2 mb-3">
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          aria-label={`ชื่อ${title}`}
          className={`${theme.input} text-xs py-2`} 
          placeholder={`ชื่อ${title}…`} 
        />
        {hasEmail && (
          <input 
            type="text" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            aria-label="อีเมลสมาชิก (ใส่ได้หลายอีเมล คั่นด้วยเครื่องหมายจุลภาค , )"
            spellCheck={false}
            autoComplete="off"
            className={`${theme.input} text-xs py-2`} 
            placeholder="อีเมล (ใส่ได้หลายอีเมล คั่นด้วย , )…" 
          />
        )}
        <button 
          type="button"
          onClick={handleAdd} 
          aria-label={`เพิ่ม${title}`}
          className="bg-[#2554FF] hover:bg-[#1B40DF] text-white border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none px-3 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
        >
          <Plus size={18} className="stroke-[3]" />
        </button>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
        {data.map((item) => (
          <div 
            key={item.id} 
            className="flex justify-between items-center bg-[#F5F6F0] p-2.5 rounded-xl border border-[#12161A]"
          >
            <div>
              <span className="font-bold text-xs text-[#12161A]">{item.name}</span>
              {item.email && <span className="block text-[10px] text-slate-500 font-medium">{item.email}</span>}
            </div>
            <button 
              type="button"
              onClick={() => handleDelete(item.id)} 
              aria-label={`ลบ ${item.name}`}
              className="w-7 h-7 rounded-md bg-white hover:bg-rose-50 border border-[#12161A] flex items-center justify-center text-[#E11D48] transition cursor-pointer"
              title="ลบรายการ"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

