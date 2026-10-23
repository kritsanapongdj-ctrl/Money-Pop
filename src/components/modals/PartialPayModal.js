import React from 'react';
import { DollarSign } from 'lucide-react';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';

export default function PartialPayModal({
  partialPayModal,
  setPartialPayModal,
  members,
  filters,
  onConfirm
}) {
  if (!partialPayModal.open || !partialPayModal.exp) return null;

  const { exp, amount, payerId } = partialPayModal;
  const maxAmount = exp.payerType === 'single'
    ? exp.totalAmount
    : (exp.splitDetails?.[payerId || filters.payer]?.amount || exp.totalAmount);

  return (
    <div className="fixed inset-0 bg-[#12161A]/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn">
      <form onSubmit={onConfirm} className="bg-white border-2 border-[#12161A] shadow-[8px_8px_0px_#12161A] w-full max-w-sm rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-[#D97706] text-white border-2 border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] flex items-center justify-center">
            <DollarSign size={16} />
          </div>
          <div>
            <h3 className="text-base font-black text-[#12161A]">
              แบ่งจ่ายยอดบิล (Partial Pay)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">ยอดคงเหลือจะถูกตัดเป็นบิลใหม่</p>
          </div>
        </div>

        {exp.payerType === 'split' && !filters.payer && (
          <div className="mb-3">
            <label className="block text-xs font-black text-[#12161A] mb-1">เลือกผู้ที่แบ่งจ่าย</label>
            <select 
              required 
              value={payerId} 
              onChange={(e) => setPartialPayModal({ ...partialPayModal, payerId: e.target.value })} 
              className={theme.input}
            >
              <option value="">เลือกสมาชิก...</option>
              {Object.keys(exp.splitDetails || {})
                .filter((id) => !exp.splitDetails[id].paid)
                .map((id) => (
                  <option key={id} value={id}>
                    {members.find((m) => String(m.id) === String(id))?.name} (ยอด {formatCurrency(exp.splitDetails[id].amount)})
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-xs font-black text-[#12161A] mb-1">
            จำนวนเงินที่ต้องการจ่าย (ไม่เกิน {formatCurrency(maxAmount)})
          </label>
          <input 
            type="number" 
            required 
            min="0.01"
            max={maxAmount} 
            step="0.01" 
            placeholder="0.00" 
            value={amount} 
            onChange={(e) => setPartialPayModal({ ...partialPayModal, amount: e.target.value })} 
            className={`${theme.input} font-mono`} 
          />
        </div>

        <div className="flex gap-2.5">
          <button 
            type="button" 
            onClick={() => setPartialPayModal({ open: false, exp: null, amount: '', payerId: '' })} 
            className="flex-1 py-2.5 bg-white hover:bg-slate-100 text-[#12161A] rounded-xl font-black text-xs border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
          >
            ยกเลิก
          </button>
          <button 
            type="submit" 
            className="flex-1 py-2.5 bg-[#2554FF] hover:bg-[#1B40DF] text-white rounded-xl font-black text-xs border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
          >
            ยืนยันแบ่งจ่าย
          </button>
        </div>
      </form>
    </div>
  );
}

