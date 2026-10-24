import React from 'react';
import { Users2 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function SplitPayModal({ 
  splitModal, 
  setSplitModal, 
  members, 
  onConfirm 
}) {
  if (!splitModal.open) return null;

  return (
    <div className="fixed inset-0 bg-[#12161A]/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="split-pay-title">
      <div className="bg-white border-2 border-[#12161A] shadow-[8px_8px_0px_#12161A] w-full max-w-sm rounded-2xl p-6 modal-contain overscroll-contain">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] flex items-center justify-center" aria-hidden="true">
            <Users2 size={16} />
          </div>
          <div>
            <h3 id="split-pay-title" className="text-base font-black text-[#12161A]">
              เลือกผู้จ่ายเงิน (Split Pay)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">ระบุคนที่ต้องการชำระในรอบนี้</p>
          </div>
        </div>

        <div className="space-y-2 mb-5 max-h-[45vh] overflow-y-auto custom-scrollbar pr-1">
          {(splitModal.avail || []).map((id) => {
            const member = members.find((m) => String(m.id) === String(id));
            const isChecked = splitModal.sel.includes(id);
            const amount = parseFloat(splitModal.exp?.splitDetails?.[id]?.amount) || 0;

            return (
              <label 
                key={id} 
                className={`flex justify-between items-center p-3 border-2 border-[#12161A] rounded-xl transition-all cursor-pointer ${
                  isChecked 
                    ? 'bg-[#EEF2FF] shadow-[2px_2px_0px_#12161A]' 
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center text-[#12161A]">
                  <input 
                    type="checkbox" 
                    checked={isChecked} 
                    onChange={(e) => setSplitModal((s) => ({
                      ...s,
                      sel: e.target.checked ? [...s.sel, id] : s.sel.filter((i) => i !== id)
                    }))} 
                    className="mr-2.5 accent-[#2554FF] w-4 h-4 cursor-pointer" 
                  />
                  <span className="font-bold text-xs">{member?.name || id}</span>
                </div>
                <span className="font-mono font-black text-xs text-[#2554FF]">
                  {formatCurrency(amount)}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex gap-2.5">
          <button 
            type="button"
            onClick={() => setSplitModal({ open: false, expId: null, members: [], sel: [], avail: [] })} 
            className="flex-1 py-2.5 bg-white hover:bg-slate-100 text-[#12161A] rounded-xl font-black text-xs border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
          >
            ยกเลิก
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            className="flex-1 py-2.5 bg-[#2554FF] hover:bg-[#1B40DF] text-white rounded-xl font-black text-xs border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
          >
            ยืนยัน ({splitModal.sel.length} คน)
          </button>
        </div>
      </div>
    </div>
  );
}

