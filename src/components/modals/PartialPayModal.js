import React from 'react';
import { Coffee } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <form onSubmit={onConfirm} className="bg-[#161C2D] border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
          <Coffee className="mr-2 text-amber-400" /> แบ่งจ่าย (ยอดคงเหลือจะถูกแยกบิลใหม่)
        </h3>

        {exp.payerType === 'split' && !filters.payer && (
          <select 
            required 
            value={payerId} 
            onChange={(e) => setPartialPayModal({ ...partialPayModal, payerId: e.target.value })} 
            className={`${theme.input} mb-3`}
          >
            <option value="">เลือกผู้จ่ายที่ต้องการแบ่งชำระ...</option>
            {Object.keys(exp.splitDetails || {})
              .filter((id) => !exp.splitDetails[id].paid)
              .map((id) => (
                <option key={id} value={id}>
                  {members.find((m) => String(m.id) === String(id))?.name} (ยอด {formatCurrency(exp.splitDetails[id].amount)})
                </option>
              ))}
          </select>
        )}

        <input 
          type="number" 
          required 
          min="0.01"
          max={maxAmount} 
          step="0.01" 
          placeholder="ระบุจำนวนเงินที่จ่าย..." 
          value={amount} 
          onChange={(e) => setPartialPayModal({ ...partialPayModal, amount: e.target.value })} 
          className={`${theme.input} mb-5`} 
        />

        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => setPartialPayModal({ open: false, exp: null, amount: '', payerId: '' })} 
            className="flex-1 py-3 bg-[#0B0F19] text-slate-300 rounded-xl font-bold border border-slate-800 hover:bg-slate-800 transition"
          >
            ยกเลิก
          </button>
          <button type="submit" className={`${theme.button} flex-1 py-3`}>
            ยืนยัน
          </button>
        </div>
      </form>
    </div>
  );
}
