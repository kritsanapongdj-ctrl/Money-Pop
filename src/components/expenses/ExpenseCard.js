import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { theme } from '../../constants/theme';
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
      className={`${theme.card} p-4 flex justify-between items-center transition-all ${
        isPaid 
          ? 'opacity-70 bg-[#1a1c29]/50' 
          : isSelected 
            ? 'ring-2 ring-[#f472b6] bg-[#f472b6]/10 shadow-[0_0_15px_rgba(244,114,182,0.15)]' 
            : 'hover:border-[#f472b6]/50'
      }`}
    >
      <div 
        className="flex items-center w-2/3 cursor-pointer" 
        onClick={() => { if (st !== 'paid') onTogglePay(expense); }}
      >
        {st !== 'paid' && (
          <input 
            type="checkbox" 
            checked={isSelected} 
            readOnly 
            className="w-5 h-5 mr-3 accent-[#f472b6] rounded bg-[#161824] border-[#3f4366] cursor-pointer pointer-events-none" 
          />
        )}
        <div className={`p-2 rounded-xl mr-3 shadow-inner ${isPaid ? 'bg-[#25283d]' : 'bg-[#1a1c29] border border-[#3f4366]'}`}>
          {getIconForCategory(cat?.name)}
        </div>
        <div className="truncate">
          <h3 className={`font-bold text-sm truncate text-slate-200 ${isPaid ? 'line-through text-slate-500' : ''}`}>
            {expense.title} 
            {expense.paymentType === 'installment' && (
              <span className="text-[10px] bg-pink-900/30 text-[#f472b6] border border-[#f472b6]/30 px-2 rounded-full ml-1 font-mono">
                {expense.currentInstallment}/{expense.installmentMonths}
              </span>
            )}
            {filters.month && expense.month < filters.month && !isPaid && (
              <span className="ml-2 text-[10px] bg-rose-900/40 text-rose-400 px-1.5 py-0.5 rounded border border-rose-700/50">
                ค้างชำระจาก {expense.month}
              </span>
            )}
            {filters.month && expense.month < filters.month && isPaid && (
              <span className="ml-2 text-[10px] bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-700/50">
                ชำระแล้ว (จาก {expense.month})
              </span>
            )}
            {filters.month && expense.month === filters.month && pMonth && pMonth > filters.month && (
              <span className="ml-2 text-[10px] bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded border border-amber-700/50">
                ชำระล่าช้า ({pMonth})
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {cat?.name} • {payerText}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end text-right">
        <span className={`font-black ${isPaid ? 'text-slate-500' : 'text-[#67e8f9] drop-shadow-[0_0_5px_rgba(103,232,249,0.3)]'}`}>
          {formatCurrency(amt)}
        </span>
        <div className="flex items-center gap-2 mt-1">
          {isPaid ? (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-900/50">
              ชำระแล้ว
            </span>
          ) : (
            <span className="text-[10px] text-[#f472b6] font-bold bg-pink-900/30 px-2 py-0.5 rounded border border-pink-900/50">
              รอชำระ
            </span>
          )}

          {isPaid && (
            <button 
              onClick={(ev) => { ev.stopPropagation(); onUndoPay(expense); }} 
              className="text-[10px] text-rose-400 font-bold bg-rose-900/30 px-2 py-0.5 rounded border border-rose-900/50 hover:bg-rose-900/50 transition-colors mr-1"
            >
              ยกเลิกชำระ
            </button>
          )}

          {st !== 'paid' && expense.paymentType !== 'installment' && (
            <button 
              onClick={(ev) => { ev.stopPropagation(); onPartialPay(expense); }} 
              className="text-[10px] text-amber-400 font-bold bg-amber-900/30 px-2 py-0.5 rounded border border-amber-900/50 hover:bg-amber-900/50 transition-colors mr-1"
            >
              แบ่งจ่าย
            </button>
          )}

          <button 
            onClick={(ev) => { ev.stopPropagation(); onEdit(expense); }} 
            className="text-slate-400 hover:text-[#38bdf8] transition-colors"
            title="แก้ไขบิล"
          >
            <Edit size={14} />
          </button>
          
          <button 
            onClick={(ev) => { ev.stopPropagation(); onDelete(expense); }} 
            className="text-slate-400 hover:text-rose-400 transition-colors"
            title="ลบบิลออกจากฐานข้อมูล"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
