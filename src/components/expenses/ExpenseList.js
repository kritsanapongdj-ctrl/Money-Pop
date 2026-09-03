import React from 'react';
import { Zap, Plus, Inbox } from 'lucide-react';
import { theme } from '../../constants/theme';
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center">
          <Zap size={20} className="mr-2 text-[#f472b6]" /> รายการบิลทั้งหมด
        </h2>
        <button 
          onClick={onOpenCreateModal} 
          className={`${theme.button} px-4 py-2 flex items-center text-sm`}
        >
          <Plus size={16} className="mr-1" /> เพิ่มบิล
        </button>
      </div>

      {/* Billbox Tab Toggle */}
      <div className="flex bg-[#25283d] rounded-xl p-1 mb-4 shadow-inner border border-[#3f4366]">
        <button 
          onClick={() => setExpenseTab('pending')} 
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            expenseTab === 'pending' 
              ? 'bg-[#3f4366] text-[#f472b6] shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          รอชำระ (To Pay)
        </button>
        <button 
          onClick={() => setExpenseTab('paid')} 
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            expenseTab === 'paid' 
              ? 'bg-[#3f4366] text-[#34d399] shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ชำระแล้ว (History)
        </button>
      </div>

      {/* Bulk Payment Bar */}
      {selectedCount > 0 && expenseTab === 'pending' && (
        <div className="sticky top-16 z-20 bg-[#25283d]/90 backdrop-blur-md p-4 rounded-xl border border-[#f472b6] shadow-[0_0_25px_rgba(244,114,182,0.2)] flex justify-between items-center mb-4 animate-fadeIn">
          <div>
            <span className="text-[#f472b6] text-xs font-bold">
              เลือกชำระ {selectedCount} รายการ
            </span>
            <p className="text-slate-100 text-xl font-black">
              {formatCurrency(selectedTotal)}
            </p>
          </div>
          <button onClick={onBulkPay} className={`${theme.button} px-5 py-2`}>
            ยืนยันชำระ
          </button>
        </div>
      )}

      {/* Expense Cards */}
      {visibleExpenses.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          <Inbox size={44} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {expenseTab === 'pending' ? 'ไม่มีบิลที่ต้องชำระในรอบนี้' : 'ยังไม่มีประวัติบิลที่ชำระแล้ว'}
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
