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
    <div className="fixed inset-0 bg-[#12161A]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn modal-contain">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="expense-form-title"
        className="bg-white border-2 border-[#12161A] shadow-[8px_8px_0px_#12161A] w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b-2 border-slate-100">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#2554FF] uppercase bg-[#EEF2FF] border border-[#2554FF]/40 px-2 py-0.5 rounded-full">
              EXPENSE FORM
            </span>
            <h2 id="expense-form-title" className="text-xl font-black text-[#12161A] tracking-tight mt-1">
              {editingExpense ? 'แก้ไขรายการบิล' : 'สร้างรายการบิลใหม่'}
            </h2>
          </div>
          <button 
            onClick={close} 
            aria-label="ปิดหน้าต่าง"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-[#12161A] flex items-center justify-center text-[#12161A] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2554FF]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#12161A] mb-1">ชื่อรายการบิล</label>
            <input 
              type="text" 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              className={theme.input} 
              placeholder="เช่น ค่าไฟ คอนโด, Netflix, อาหารเย็น..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#12161A] mb-1">ประจำเดือน</label>
              <input 
                type="month" 
                required 
                value={formData.month} 
                onChange={(e) => setFormData({ ...formData, month: e.target.value })} 
                className={theme.input} 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#12161A] mb-1">ยอดรวมบิล (฿)</label>
              <input 
                type="number" 
                required 
                step="0.01" 
                placeholder="0.00" 
                value={formData.totalAmount} 
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })} 
                className={`${theme.input} font-mono`} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#12161A] mb-1">หมวดหมู่</label>
              <select 
                value={formData.categoryId} 
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} 
                className={theme.input} 
                required
              >
                <option value="">เลือกหมวดหมู่...</option>
                {dbData.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-[#12161A] mb-1">ช่องทางจ่าย</label>
              <select 
                value={formData.sourceId} 
                onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })} 
                className={theme.input} 
                required
              >
                <option value="">เลือกช่องทาง...</option>
                {dbData.sources.map((s) => {
                  const owner = s.ownerId ? dbData.members.find(m => String(m.id) === String(s.ownerId)) : null;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} {owner ? `(เครดิต: ${owner.name})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Credit Source Ownership Badge */}
          {(() => {
            const selectedSource = dbData.sources.find(s => String(s.id) === String(formData.sourceId));
            const owner = selectedSource?.ownerId ? dbData.members.find(m => String(m.id) === String(selectedSource.ownerId)) : null;
            if (!owner) return null;

            const isBorrowing = formData.payerType === 'single' 
              ? (String(formData.payerId) !== String(owner.id))
              : true;

            return (
              <div className="bg-[#EEF2FF] border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] rounded-xl p-2.5 text-xs text-[#12161A] font-bold flex items-center justify-between">
                <span>💳 บิลนี้ใช้เครดิตของ: <span className="text-[#2554FF] font-black">{owner.name}</span></span>
                {isBorrowing && (
                  <span className="text-[10px] text-[#92400E] bg-[#FEF3C7] border border-[#D97706] px-1.5 py-0.5 rounded-md font-black">
                    ยืมวงเงิน (บันทึกทวงคืน)
                  </span>
                )}
              </div>
            );
          })()}

          {/* Payment Type */}
          <div className="bg-[#F5F6F0] p-3.5 rounded-xl border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A]">
            <label className="block text-xs font-black text-[#12161A] mb-2 uppercase tracking-wide">
              ประเภทการชำระ
            </label>
            <div className="flex gap-4">
              <label className="flex items-center text-sm font-bold text-[#12161A] cursor-pointer">
                <input 
                  type="radio" 
                  value="normal" 
                  checked={formData.paymentType === 'normal'} 
                  onChange={() => setFormData({ ...formData, paymentType: 'normal' })} 
                  className="mr-2 accent-[#2554FF] w-4 h-4 cursor-pointer" 
                /> 
                จ่ายเต็มรอบเดียว
              </label>
              <label className="flex items-center text-sm font-bold text-[#12161A] cursor-pointer">
                <input 
                  type="radio" 
                  value="installment" 
                  checked={formData.paymentType === 'installment'} 
                  onChange={() => setFormData({ ...formData, paymentType: 'installment' })} 
                  className="mr-2 accent-[#2554FF] w-4 h-4 cursor-pointer" 
                /> 
                ผ่อนชำระหลายงวด
              </label>
            </div>
            {formData.paymentType === 'installment' && (
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-300">
                <div>
                  <span className="block text-[11px] font-bold text-slate-600 mb-1">งวดปัจจุบัน</span>
                  <input 
                    type="number" 
                    placeholder="1" 
                    required 
                    min="1" 
                    value={formData.currentInstallment || 1} 
                    onChange={(e) => setFormData({ ...formData, currentInstallment: e.target.value })} 
                    className={theme.input} 
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-600 mb-1">รวมจำนวนงวด</span>
                  <input 
                    type="number" 
                    placeholder="เช่น 10" 
                    required 
                    min="2" 
                    value={formData.installmentMonths} 
                    onChange={(e) => setFormData({ ...formData, installmentMonths: e.target.value })} 
                    className={theme.input} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payer Type */}
          <div className="bg-[#EEF2FF] p-3.5 rounded-xl border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A]">
            <label className="block text-xs font-black text-[#12161A] mb-2 uppercase tracking-wide">
              ผู้รับผิดชอบค่าใช้จ่าย
            </label>
            <div className="flex gap-4 mb-2.5">
              <label className="flex items-center text-sm font-bold text-[#12161A] cursor-pointer">
                <input 
                  type="radio" 
                  value="single" 
                  checked={formData.payerType === 'single'} 
                  onChange={() => setFormData({ ...formData, payerType: 'single' })} 
                  className="mr-2 accent-[#2554FF] w-4 h-4 cursor-pointer" 
                /> 
                จ่ายคนเดียว
              </label>
              <label className="flex items-center text-sm font-bold text-[#12161A] cursor-pointer">
                <input 
                  type="radio" 
                  value="split" 
                  checked={formData.payerType === 'split'} 
                  onChange={() => setFormData({ ...formData, payerType: 'split' })} 
                  className="mr-2 accent-[#2554FF] w-4 h-4 cursor-pointer" 
                /> 
                หารกัน (Split)
              </label>
            </div>
            {formData.payerType === 'single' ? (
              <select 
                value={formData.payerId} 
                onChange={(e) => setFormData({ ...formData, payerId: e.target.value })} 
                className={theme.input} 
                required
              >
                <option value="">เลือกสมาชิกที่ต้องจ่าย...</option>
                {dbData.members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {dbData.members.map((m) => (
                  <label key={m.id} className="flex items-center text-xs font-bold text-[#12161A] bg-white border border-[#12161A] p-2 rounded-lg cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={Boolean(splitSelection[m.id])} 
                      onChange={(e) => setSplitSelection({ ...splitSelection, [m.id]: e.target.checked })} 
                      className="mr-2 accent-[#2554FF] w-4 h-4 cursor-pointer" 
                    /> 
                    {m.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-[#2554FF] hover:bg-[#1B40DF] text-white font-black border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none rounded-xl text-sm transition cursor-pointer"
          >
            {editingExpense ? 'บันทึกการแก้ไขบิล' : 'ยืนยันเพิ่มบิลใหม่'}
          </button>
        </form>
      </div>
    </div>
  );
}
