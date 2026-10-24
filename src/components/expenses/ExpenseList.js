import React from 'react';
import { Plus, Inbox, CheckCircle2, Clock, Layers } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import ExpenseCard from './ExpenseCard';

export default function ExpenseList({
  filteredExps,
  categories,
  members,
  filters,
  expenseTab,
  setExpenseTab,
  selectedForPay,
  onTogglePay,
  onBulkPay,
  onUndoPay,
  onPartialPay,
  onOpenCreateModal,
  onEditExpense,
  onDeleteExpense
}) {
  const selectedCount = Object.keys(selectedForPay).length;
  const selectedTotal = Object.values(selectedForPay).reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  // Filter items matching the active Billbox subtab
  const visibleExpenses = filteredExps.filter((e) => {
    let st = e.status;
    let pMonth = (e.status === 'paid' && !e.paidMonth) ? e.month : e.paidMonth;
    
    if (e.payerType === 'split') {
      if (filters.payer) {
        st = e.splitDetails?.[filters.payer]?.paid ? 'paid' : 'pending';
        pMonth = (e.splitDetails?.[filters.payer]?.paid && !e.splitDetails?.[filters.payer]?.paidMonth)
          ? e.month
          : e.splitDetails?.[filters.payer]?.paidMonth;
      }
    }

    const isPaid = filters.month ? (st === 'paid' && pMonth === filters.month) : (st === 'paid');

    if (expenseTab === 'pending' && isPaid) return false;
    if (expenseTab === 'paid' && !isPaid) return false;
    return true;
  });

  return (
    <div className="px-4 sm:px-0">
      {/* Header bar */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] flex items-center justify-center">
            <Layers size={14} />
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#12161A] tracking-tight">
            รายการบิลค่าใช้จ่าย
          </h2>
          <span className="text-[10px] bg-white border border-[#12161A] text-slate-700 font-mono font-bold px-2 py-0.5 rounded-full">
            {visibleExpenses.length} รายการ
          </span>
        </div>

        <button 
          type="button"
          onClick={onOpenCreateModal} 
          className="bg-[#2554FF] hover:bg-[#1B40DF] text-white font-black border-2 border-[#12161A] shadow-[2.5px_2.5px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none px-3.5 py-1.5 rounded-xl flex items-center text-xs transition cursor-pointer"
        >
          <Plus size={15} className="mr-1 stroke-[3]" /> เพิ่มบิล
        </button>
      </div>

      {/* Bank Segmented Tab Toggle (UOB TMRW / K-Plus style) */}
      <div className="flex bg-[#E5E7EB] border-2 border-[#12161A] rounded-xl p-1 mb-4 shadow-[2px_2px_0px_#12161A]" role="tablist" aria-label="สถานะบิลค่าใช้จ่าย">
        <button 
          type="button"
          role="tab"
          aria-selected={expenseTab === 'pending'}
          onClick={() => setExpenseTab('pending')} 
          className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            expenseTab === 'pending' 
              ? 'bg-white text-[#12161A] border-2 border-[#12161A] shadow-[1px_1px_0px_#12161A]' 
              : 'text-slate-600 hover:text-[#12161A]'
          }`}
        >
          <Clock size={13} className="text-[#D97706]" />
          รอชำระ (To Pay)
        </button>
        <button 
          type="button"
          role="tab"
          aria-selected={expenseTab === 'paid'}
          onClick={() => setExpenseTab('paid')} 
          className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            expenseTab === 'paid' 
              ? 'bg-white text-[#12161A] border-2 border-[#12161A] shadow-[1px_1px_0px_#12161A]' 
              : 'text-slate-600 hover:text-[#12161A]'
          }`}
        >
          <CheckCircle2 size={13} className="text-[#059669]" />
          ชำระแล้ว (Paid History)
        </button>
      </div>

      {/* High-Contrast Bulk Payment Bar (K-Plus / SCB floating action bar) */}
      {selectedCount > 0 && expenseTab === 'pending' && (
        <div className="sticky top-16 z-20 bg-[#FEF3C7] border-2 border-[#12161A] shadow-[4px_4px_0px_#12161A] p-3.5 rounded-2xl flex justify-between items-center mb-4 animate-bounce-short" role="region" aria-live="polite" aria-label="แถบชำระเงินหลายรายการ">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D97706] border border-[#12161A]" aria-hidden="true" />
              <span className="text-[#92400E] text-[11px] font-black uppercase">
                เลือกชำระ {selectedCount} บิล
              </span>
            </div>
            <p className="text-[#12161A] text-xl font-mono font-black mt-0.5">
              {formatCurrency(selectedTotal)}
            </p>
          </div>
          <button 
            type="button"
            onClick={onBulkPay} 
            className="bg-[#059669] hover:bg-[#047857] text-white border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer"
          >
            ยืนยันชำระพร้อมกัน
          </button>
        </div>
      )}

      {/* Expense Cards */}
      {visibleExpenses.length === 0 ? (
        <div className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl text-center text-slate-500 py-12 px-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full border-2 border-[#12161A] flex items-center justify-center mx-auto mb-3">
            <Inbox size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-bold text-[#12161A]">
            {expenseTab === 'pending' ? 'ไม่มีบิลที่ค้างชำระในรอบนี้' : 'ยังไม่มีประวัติบิลที่ชำระแล้ว'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {expenseTab === 'pending' ? 'เยี่ยมมาก! ค่าใช้จ่ายทั้งหมดได้รับการเคลียร์แล้ว' : 'เมื่อมีการชำระเงิน ประวัติบิลจะแสดงที่นี่'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              categories={categories}
              members={members}
              filters={filters}
              isSelected={Boolean(selectedForPay[expense.id])}
              onTogglePay={onTogglePay}
              onUndoPay={onUndoPay}
              onPartialPay={onPartialPay}
              onEdit={onEditExpense}
              onDelete={onDeleteExpense}
            />
          ))}
        </div>
      )}
    </div>
  );
}

