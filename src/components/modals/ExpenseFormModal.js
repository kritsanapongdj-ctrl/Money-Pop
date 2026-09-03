import React, { useState } from 'react';
import { X } from 'lucide-react';
import { theme } from '../../constants/theme';
import { filterOutExpense, getExpenseGroupId } from '../../utils/expenseUtils';

export default function ExpenseFormModal({ 
  editingExpense, 
  dbData, 
  updateDB, 
  close, 
  showToast, 
  currentUser 
}) {
  const [formData, setFormData] = useState(() => {
    if (editingExpense) {
      let fullAmt = parseFloat(editingExpense.fullTotalAmount) || parseFloat(editingExpense.totalAmount) || 0;
      if (editingExpense.paymentType === 'installment' && editingExpense.isMonthlyAmount && !editingExpense.fullTotalAmount) {
        fullAmt = parseFloat(editingExpense.totalAmount) * (parseInt(editingExpense.installmentMonths, 10) || 1);
      }
      return { ...editingExpense, totalAmount: fullAmt };
    }
    return {
      title: '',
      month: new Date().toISOString().slice(0, 7),
      categoryId: dbData.categories[0]?.id || '',
      sourceId: dbData.sources[0]?.id || '',
      paymentType: 'normal',
      totalAmount: '',
      installmentMonths: '',
      currentInstallment: '1',
      payerType: 'single',
      payerId: dbData.members[0]?.id || '',
      splitDetails: {}
    };
  });

  const [splitSelection, setSplitSelection] = useState(() => {
    if (editingExpense?.payerType === 'split' && editingExpense.splitDetails) {
      return Object.keys(editingExpense.splitDetails).reduce((acc, id) => ({ ...acc, [id]: true }), {});
    }
    return {};
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("⚠️ กรุณาเลือกชื่อ 'ผู้ทำรายการ' ก่อนเพิ่มบิล");
      return;
    }

    const amount = parseFloat(formData.totalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("ยอดเงินไม่ถูกต้อง");
      return;
    }

    // Clean existing records if editing (using robust filterOutExpense)
    const cleanExpenses = editingExpense 
      ? filterOutExpense(dbData.expenses, editingExpense) 
      : dbData.expenses;

    const newExpenses = [];
    const groupId = getExpenseGroupId(editingExpense) || editingExpense?.groupId || Date.now().toString();
    const baseData = { 
      ...formData, 
      updatedAt: Date.now(), 
      createdBy: editingExpense?.createdBy || currentUser 
    };

    if (formData.paymentType === 'installment') {
      const tMonths = parseInt(formData.installmentMonths, 10);
      if (tMonths < 2) {
        alert("ผ่อนชำระต้องมากกว่า 1 งวด");
        return;
      }
      const mAmount = amount / tMonths;
      const [y, m] = formData.month.split('-').map(Number);
      let bMonth = m - (parseInt(formData.currentInstallment, 10) || 1) + 1;
      let bYear = y;
      while (bMonth < 1) { 
        bMonth += 12; 
        bYear -= 1; 
      }

      let splitData = {};
      if (formData.payerType === 'split') {
        const sel = Object.keys(splitSelection).filter((k) => splitSelection[k]);
        if (sel.length === 0) {
          alert("เลือกผู้จ่ายอย่างน้อย 1 คน");
          return;
        }
        sel.forEach((id) => {
          splitData[id] = { amount: mAmount / sel.length, paid: false };
        });
      }

      for (let i = 1; i <= tMonths; i++) {
        let tm = bMonth + i - 1;
        let ty = bYear;
        while (tm > 12) { 
          tm -= 12; 
          ty += 1; 
        }
        const isPast = i < parseInt(formData.currentInstallment, 10);
        const thisMonth = `${ty}-${String(tm).padStart(2, '0')}`;
        
        let splitDataCopy = undefined;
        if (formData.payerType === 'split') {
          splitDataCopy = {};
          Object.keys(splitData).forEach((id) => {
            splitDataCopy[id] = { 
              ...splitData[id], 
              paid: isPast, 
              paidMonth: isPast ? thisMonth : null, 
              paidAt: isPast ? Date.now() : null 
            };
          });
        }

        newExpenses.push({
          ...baseData,
          id: `${groupId}-${i}`,
          groupId,
          installmentGroupId: groupId, // Support both fields for backwards compatibility
          month: thisMonth,
          totalAmount: mAmount,
          fullTotalAmount: amount,
          isMonthlyAmount: true,
          installmentMonths: tMonths,
          currentInstallment: i,
          splitDetails: splitDataCopy,
          status: isPast ? 'paid' : 'pending',
          paidMonth: isPast ? thisMonth : null,
          paidAt: isPast ? Date.now() : null,
          createdAt: Date.now() + i
        });
      }
    } else {
      baseData.totalAmount = amount;
      delete baseData.installmentMonths;
      delete baseData.currentInstallment;
      delete baseData.groupId;
      delete baseData.installmentGroupId;

      if (formData.payerType === 'split') {
        const sel = Object.keys(splitSelection).filter((k) => splitSelection[k]);
        if (sel.length === 0) {
          alert("เลือกผู้จ่ายอย่างน้อย 1 คน");
          return;
        }
        const splitData = {};
        sel.forEach((id) => {
          splitData[id] = { 
            amount: amount / sel.length, 
            paid: editingExpense?.splitDetails?.[id]?.paid || false, 
            paidMonth: editingExpense?.splitDetails?.[id]?.paidMonth || null, 
            paidAt: editingExpense?.splitDetails?.[id]?.paidAt || null 
          };
        });
        baseData.splitDetails = splitData;
        baseData.status = Object.values(splitData).every((v) => v.paid) ? 'paid' : 'pending';
        delete baseData.payerId;
      } else {
        baseData.status = editingExpense?.status || 'pending';
        baseData.paidMonth = editingExpense?.paidMonth || null;
        baseData.paidAt = editingExpense?.paidAt || null;
        delete baseData.splitDetails;
      }

      baseData.id = editingExpense?.id || Date.now().toString();
      baseData.createdAt = editingExpense?.createdAt || Date.now();
      newExpenses.push(baseData);
    }

    updateDB({ expenses: [...newExpenses, ...cleanExpenses] });
    close();
    showToast(editingExpense ? "อัปเดตเรียบร้อย" : "เพิ่มบิลสำเร็จ");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161C2D] border border-slate-800/80 w-full max-w-md rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-5">
          <h2 className={`text-xl font-bold ${theme.primary}`}>
            {editingExpense ? 'แก้ไขบิล' : 'เพิ่มบิลใหม่'}
          </h2>
          <button onClick={close} className="text-slate-500 hover:text-slate-300">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            required 
            value={formData.title} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
            className={theme.input} 
            placeholder="ชื่อรายการ" 
          />

          <div className="grid grid-cols-2 gap-3">
            <input 
              type="month" 
              required 
              value={formData.month} 
              onChange={(e) => setFormData({ ...formData, month: e.target.value })} 
              className={theme.input} 
            />
            <input 
              type="number" 
              required 
              step="0.01" 
              placeholder="ยอดรวมบิล" 
              value={formData.totalAmount} 
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })} 
              className={theme.input} 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select 
              value={formData.categoryId} 
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} 
              className={theme.input} 
              required
            >
              <option value="">หมวดหมู่...</option>
              {dbData.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select 
              value={formData.sourceId} 
              onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })} 
              className={theme.input} 
              required
            >
              <option value="">จ่ายจาก...</option>
              {dbData.sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Type */}
          <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
            <div className="flex gap-4 mb-2">
              <label className="flex items-center text-sm font-medium text-slate-300">
                <input 
                  type="radio" 
                  value="normal" 
                  checked={formData.paymentType === 'normal'} 
                  onChange={() => setFormData({ ...formData, paymentType: 'normal' })} 
                  className="mr-2 accent-[#f472b6]" 
                /> 
                จ่ายเต็ม
              </label>
              <label className="flex items-center text-sm font-medium text-slate-300">
                <input 
                  type="radio" 
                  value="installment" 
                  checked={formData.paymentType === 'installment'} 
                  onChange={() => setFormData({ ...formData, paymentType: 'installment' })} 
                  className="mr-2 accent-[#f472b6]" 
                /> 
                ผ่อนชำระ
              </label>
            </div>
            {formData.paymentType === 'installment' && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <input 
                  type="number" 
                  placeholder="งวดปัจจุบัน" 
                  required 
                  min="1" 
                  value={formData.currentInstallment || 1} 
                  onChange={(e) => setFormData({ ...formData, currentInstallment: e.target.value })} 
                  className={theme.input} 
                />
                <input 
                  type="number" 
                  placeholder="รวมกี่งวด" 
                  required 
                  min="2" 
                  value={formData.installmentMonths} 
                  onChange={(e) => setFormData({ ...formData, installmentMonths: e.target.value })} 
                  className={theme.input} 
                />
              </div>
            )}
          </div>

          {/* Payer Type */}
          <div className="bg-[#f472b6]/10 p-3 rounded-xl border border-[#f472b6]/20">
            <div className="flex gap-4 mb-2">
              <label className="flex items-center text-sm font-medium text-slate-200">
                <input 
                  type="radio" 
                  value="single" 
                  checked={formData.payerType === 'single'} 
                  onChange={() => setFormData({ ...formData, payerType: 'single' })} 
                  className="mr-2 accent-[#f472b6]" 
                /> 
                จ่ายคนเดียว
              </label>
              <label className="flex items-center text-sm font-medium text-slate-200">
                <input 
                  type="radio" 
                  value="split" 
                  checked={formData.payerType === 'split'} 
                  onChange={() => setFormData({ ...formData, payerType: 'split' })} 
                  className="mr-2 accent-[#f472b6]" 
                /> 
                หารกัน
              </label>
            </div>
            {formData.payerType === 'single' ? (
              <select 
                value={formData.payerId} 
                onChange={(e) => setFormData({ ...formData, payerId: e.target.value })} 
                className={theme.input} 
                required
              >
                <option value="">ผู้รับผิดชอบ...</option>
                {dbData.members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {dbData.members.map((m) => (
                  <label key={m.id} className="flex items-center text-sm text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={Boolean(splitSelection[m.id])} 
                      onChange={(e) => setSplitSelection({ ...splitSelection, [m.id]: e.target.checked })} 
                      className="mr-2 accent-[#f472b6]" 
                    /> 
                    {m.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className={`${theme.button} w-full py-3 mt-2 text-shadow-sm`}>
            บันทึกบิล
          </button>
        </form>
      </div>
    </div>
  );
}
