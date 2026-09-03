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
    <div className={`${theme.card} p-5`}>
      <h3 className={`font-bold ${theme.primary} mb-4 flex items-center`}>
        {Icon && <Icon size={18} className="mr-2" />}
        {title}
      </h3>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className={theme.input} 
          placeholder={`ชื่อ${title}...`} 
        />
        {hasEmail && (
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className={theme.input} 
            placeholder="อีเมล..." 
          />
        )}
        <button onClick={handleAdd} className={`${theme.button} px-4 rounded-xl`}>
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {data.map((item) => (
          <div 
            key={item.id} 
            className="flex justify-between items-center bg-[#161824] p-3 rounded-xl border border-[#3f4366]"
          >
            <div>
              <span className="font-bold text-sm text-slate-200">{item.name}</span>
              {item.email && <span className="block text-xs text-slate-500">{item.email}</span>}
            </div>
            <button 
              onClick={() => handleDelete(item.id)} 
              className="text-slate-500 hover:text-[#f472b6] transition-colors"
              title="ลบ"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
