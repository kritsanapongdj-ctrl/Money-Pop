import React from 'react';
import { Zap } from 'lucide-react';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';

export default function SplitPayModal({ 
  splitModal, 
  setSplitModal, 
  members, 
  onConfirm 
}) {
  if (!splitModal.open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-[#161C2D] border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
          <Zap className="mr-2 text-[#f472b6]" /> เลือกผู้จ่าย
        </h3>
        <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {(splitModal.avail || []).map((id) => {
            const member = members.find((m) => String(m.id) === String(id));
            const isChecked = splitModal.sel.includes(id);
            const amount = parseFloat(splitModal.exp?.splitDetails?.[id]?.amount) || 0;

            return (
              <label 
                key={id} 
                className="flex justify-between items-center p-3 border border-[#3f4366] bg-[#161824] rounded-xl hover:border-[#f472b6]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center text-slate-200">
                  <input 
                    type="checkbox" 
                    checked={isChecked} 
                    onChange={(e) => setSplitModal((s) => ({
                      ...s,
                      sel: e.target.checked ? [...s.sel, id] : s.sel.filter((i) => i !== id)
                    }))} 
                    className="mr-3 accent-[#f472b6] w-4 h-4" 
                  />
                  <span className="font-medium">{member?.name || id}</span>
                </div>
                <span className="font-bold text-[#67e8f9] drop-shadow-[0_0_3px_rgba(103,232,249,0.3)]">
                  {formatCurrency(amount)}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => setSplitModal({ open: false, expId: null, members: [], sel: [], avail: [] })} 
            className="flex-1 py-3 bg-[#0B0F19] text-slate-300 rounded-xl font-bold border border-slate-800 hover:bg-slate-800 transition"
          >
            ยกเลิก
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            className={`${theme.button} flex-1 py-3`}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}
