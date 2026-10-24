import React from 'react';
import { Edit2, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { getIconForCategory } from '../../utils/icons';

export default function ExpenseCard({
  expense,
  categories,
  members,
  filters,
  isSelected,
  onTogglePay,
  onUndoPay,
  onPartialPay,
  onEdit,
  onDelete
}) {
  const cat = categories.find((c) => String(c.id) === String(expense.categoryId));
  let amt = parseFloat(expense.totalAmount) || 0;
  let st = expense.status;
  let pMonth = (expense.status === 'paid' && !expense.paidMonth) ? expense.month : expense.paidMonth;

  if (expense.payerType === 'split') {
    if (filters.payer) {
      amt = parseFloat(expense.splitDetails?.[filters.payer]?.amount) || 0;
      st = expense.splitDetails?.[filters.payer]?.paid ? 'paid' : 'pending';
      pMonth = (expense.splitDetails?.[filters.payer]?.paid && !expense.splitDetails?.[filters.payer]?.paidMonth)
        ? expense.month
        : expense.splitDetails?.[filters.payer]?.paidMonth;
    } else if (expense.splitDetails) {
      pMonth = Object.values(expense.splitDetails)
        .map((v) => (v.paid && !v.paidMonth) ? expense.month : v.paidMonth)
        .filter(Boolean)
        .sort()
        .reverse()[0];
    }
  }

  const isPaid = filters.month ? (st === 'paid' && pMonth === filters.month) : (st === 'paid');

  const payerText = expense.payerType === 'split'
    ? (!filters.payer ? `หาร ${Object.keys(expense.splitDetails || {}).length} คน` : members.find((m) => String(m.id) === String(filters.payer))?.name)
    : members.find((m) => String(m.id) === String(expense.payerId))?.name;

  return (
    <div 
      className={`rounded-2xl p-3.5 sm:p-4 flex justify-between items-center transition-all ${
        isPaid 
          ? 'bg-[#FAFBF9] border-2 border-slate-300 shadow-[1.5px_1.5px_0px_#94A3B8] opacity-75' 
          : isSelected 
            ? 'bg-[#EEF2FF] border-2 border-[#2554FF] shadow-[4px_4px_0px_#2554FF]' 
            : 'bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] hover:shadow-[4.5px_4.5px_0px_#12161A] hover:-translate-y-0.5'
      }`}
    >
      <div 
        role={st !== 'paid' ? "button" : undefined}
        tabIndex={st !== 'paid' ? 0 : undefined}
        aria-label={st !== 'paid' ? `เลือกชำระบิล ${expense.title}` : undefined}
        onKeyDown={(e) => {
          if (st !== 'paid' && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onTogglePay(expense);
          }
        }}
        className="flex items-center w-2/3 cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[#2554FF] rounded-xl" 
        onClick={() => { if (st !== 'paid') onTogglePay(expense); }}
      >
        {st !== 'paid' && (
          <input 
            type="checkbox" 
            checked={isSelected} 
            readOnly 
            aria-label={`เลือกชำระ ${expense.title}`}
            className="w-5 h-5 mr-2.5 accent-[#2554FF] rounded border-2 border-[#12161A] cursor-pointer pointer-events-none" 
          />
        )}
        
        {/* Category Icon Square */}
        <div className={`w-10 h-10 rounded-xl mr-3 border-2 border-[#12161A] flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#12161A] ${
          isPaid ? 'bg-slate-200 text-slate-600' : 'bg-[#F5F6F0] text-[#12161A]'
        }`}>
          {getIconForCategory(cat?.name)}
        </div>

        <div className="truncate">
          <h3 className={`font-black text-sm truncate flex items-center flex-wrap gap-1 ${
            isPaid ? 'line-through text-slate-400' : 'text-[#12161A]'
          }`}>
            <span>{expense.title}</span>
            {expense.paymentType === 'installment' && (
              <span className="text-[10px] bg-[#EEF2FF] text-[#2554FF] border border-[#12161A] px-1.5 py-0.2 rounded font-mono font-bold">
                งวด {expense.currentInstallment}/{expense.installmentMonths}
              </span>
            )}
            {filters.month && expense.month < filters.month && !isPaid && (
              <span className="text-[9px] bg-[#FEE2E2] text-[#991B1B] px-1.5 py-0.2 rounded border border-[#DC2626] font-bold">
                ค้างจาก {expense.month}
              </span>
            )}
            {filters.month && expense.month < filters.month && isPaid && (
              <span className="text-[9px] bg-[#D1FAE5] text-[#065F46] px-1.5 py-0.2 rounded border border-[#059669] font-bold">
                เคลียร์แล้ว ({expense.month})
              </span>
            )}
          </h3>
          <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
            {cat?.name || 'ทั่วไป'} • <span className="text-slate-700 font-bold">{payerText || 'ไม่ระบุ'}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end text-right shrink-0 ml-2">
        <span className={`font-mono font-black text-base ${
          isPaid ? 'text-slate-400 line-through' : 'text-[#12161A]'
        }`}>
          {formatCurrency(amt)}
        </span>

        <div className="flex items-center gap-1.5 mt-1">
          {isPaid ? (
            <span className="text-[10px] text-[#065F46] font-bold bg-[#D1FAE5] px-2 py-0.5 rounded-md border border-[#059669] flex items-center gap-0.5">
              <CheckCircle2 size={10} /> จ่ายแล้ว
            </span>
          ) : (
            <span className="text-[10px] text-[#92400E] font-bold bg-[#FEF3C7] px-2 py-0.5 rounded-md border border-[#D97706] flex items-center gap-0.5">
              <Clock size={10} /> รอชำระ
            </span>
          )}

          {isPaid && (
            <button 
              onClick={(ev) => { ev.stopPropagation(); onUndoPay(expense); }} 
              className="text-[10px] text-[#E11D48] font-bold bg-[#FFE4E6] hover:bg-[#FECDD3] px-2 py-0.5 rounded-md border border-[#12161A] transition cursor-pointer"
            >
              ยกเลิก
            </button>
          )}

          {st !== 'paid' && expense.paymentType !== 'installment' && (
            <button 
              onClick={(ev) => { ev.stopPropagation(); onPartialPay(expense); }} 
              className="text-[10px] text-[#92400E] font-bold bg-[#FEF3C7] hover:bg-[#FDE68A] px-2 py-0.5 rounded-md border border-[#12161A] transition cursor-pointer"
            >
              แบ่งจ่าย
            </button>
          )}

          <button 
            onClick={(ev) => { ev.stopPropagation(); onEdit(expense); }} 
            aria-label={`แก้ไขบิล ${expense.title}`}
            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-[#12161A] flex items-center justify-center text-slate-700 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2554FF]"
            title="แก้ไขบิล"
          >
            <Edit2 size={13} aria-hidden="true" />
          </button>
          
          <button 
            onClick={(ev) => { ev.stopPropagation(); onDelete(expense); }} 
            aria-label={`ลบบิล ${expense.title}`}
            className="w-7 h-7 rounded-lg bg-white hover:bg-rose-50 border border-[#12161A] flex items-center justify-center text-[#E11D48] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2554FF]"
            title="ลบบิล"
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

