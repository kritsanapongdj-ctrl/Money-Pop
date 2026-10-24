import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { theme } from '../../constants/theme';

const CREDIT_TYPES = [
  { id: 'credit_card', label: '💳 บัตรเครดิต (KTC/UOB/KBank)' },
  { id: 'spaylater', label: '🛍️ Shopee SPayLater' },
  { id: 'line_bk', label: '🟢 LINE BK' },
  { id: 'cash_card', label: '🏧 บัตรกดเงินสด' },
  { id: 'pay_next', label: '📱 True Pay Next' },
  { id: 'loan', label: '📄 สินเชื่อบุคคล' },
  { id: 'other', label: '📁 อื่นๆ' }
];

export default function CreditSourceModal({
  show,
  editingSource,
  currentUser,
  members,
  onSave,
  onClose
}) {
  const [formData, setFormData] = useState(() => {
    if (editingSource) {
      return {
        id: editingSource.id,
        name: editingSource.name || '',
        type: editingSource.type || 'credit_card',
        ownerId: editingSource.ownerId || currentUser,
        totalLimit: editingSource.totalLimit || '',
        availableLimit: editingSource.availableLimit || '',
        currentMonthDue: editingSource.currentMonthDue || editingSource.statementDue || '',
        dueDate: editingSource.dueDate || '',
        billingCycleDay: editingSource.billingCycleDay || '',
        pdfPassword: editingSource.pdfPassword || ''
      };
    }
    return {
      name: '',
      type: 'credit_card',
      ownerId: currentUser,
      totalLimit: '',
      availableLimit: '',
      currentMonthDue: '',
      dueDate: '',
      billingCycleDay: '',
      pdfPassword: ''
    };
  });

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...formData,
      id: editingSource ? editingSource.id : `src_${Date.now()}`,
      totalLimit: parseFloat(formData.totalLimit) || 0,
      availableLimit: parseFloat(formData.availableLimit) || 0,
      currentMonthDue: parseFloat(formData.currentMonthDue) || 0,
      billingCycleDay: parseInt(formData.billingCycleDay, 10) || null,
      updatedAt: Date.now()
    });
  };

  return (
    <div className="fixed inset-0 bg-[#12161A]/70 backdrop-blur-sm z-[140] flex items-center justify-center p-4 animate-fadeIn modal-contain">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="credit-source-title"
        className="bg-white border-2 border-[#12161A] shadow-[8px_8px_0px_#12161A] w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] flex items-center justify-center">
              <CreditCard size={18} aria-hidden="true" />
            </div>
            <div>
              <h2 id="credit-source-title" className="text-base sm:text-lg font-black text-[#12161A] tracking-tight">
                {editingSource ? 'แก้ไขสินเชื่อ / บัตร' : 'เพิ่มสินเชื่อ / บัตรเครดิตใหม่'}
              </h2>
              <p className="text-[11px] text-slate-500 font-bold">
                บันทึกเข้าตู้เซฟสินเชื่อส่วนตัว
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            aria-label="ปิดหน้าต่าง"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-[#12161A] flex items-center justify-center text-[#12161A] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2554FF]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black text-[#12161A] mb-1">
              ชื่อบัตร / สินเชื่อ
            </label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              className={theme.input} 
              placeholder="เช่น Shopee SPayLater, KTC Visa, UOB TMRW..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#12161A] mb-1">ประเภท</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({ ...formData, type: e.target.value })} 
                className={theme.input}
              >
                {CREDIT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-[#12161A] mb-1">เจ้าของวงเงิน</label>
              <select 
                value={formData.ownerId} 
                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })} 
                className={theme.input}
                required
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#12161A] mb-1">
                วงเงินทั้งหมด (฿)
              </label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={formData.totalLimit} 
                onChange={(e) => setFormData({ ...formData, totalLimit: e.target.value })} 
                className={`${theme.input} font-mono`} 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#12161A] mb-1">
                วงเงินคงเหลือ (฿)
              </label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={formData.availableLimit} 
                onChange={(e) => setFormData({ ...formData, availableLimit: e.target.value })} 
                className={`${theme.input} font-mono`} 
              />
            </div>
          </div>

          <div className="bg-[#F5F6F0] p-3 rounded-xl border-2 border-[#12161A] space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">
              รอบบิลและการชำระเงิน
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#12161A] mb-1">
                  ยอดเรียกเก็บรอบนี้ (฿)
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={formData.currentMonthDue} 
                  onChange={(e) => setFormData({ ...formData, currentMonthDue: e.target.value })} 
                  className={`${theme.input} font-mono`} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#12161A] mb-1">
                  วันตัดรอบบิล (วันที่)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="31" 
                  placeholder="เช่น 25" 
                  value={formData.billingCycleDay} 
                  onChange={(e) => setFormData({ ...formData, billingCycleDay: e.target.value })} 
                  className={theme.input} 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#12161A] mb-1">
                วันครบกำหนดชำระถัดไป
              </label>
              <input 
                type="date" 
                value={formData.dueDate} 
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} 
                className={theme.input} 
              />
            </div>
          </div>

          <div className="bg-[#EEF2FF] p-3 rounded-xl border-2 border-[#12161A] space-y-2">
            <label className="block text-xs font-black text-[#12161A]">
              รหัสปลดล็อก PDF e-Statement ของบัตรนี้ (ถ้ามี)
            </label>
            <input 
              type="text" 
              placeholder="เช่น วดป.เกิด 25101990 หรือ ปชช. 4 ตัวท้าย" 
              value={formData.pdfPassword || ''} 
              onChange={(e) => setFormData({ ...formData, pdfPassword: e.target.value })} 
              className={`${theme.input} font-mono text-xs`} 
            />
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              ใส่ไว้เพื่อให้ระบบ GAS นำไปปลดล็อกอ่านยอด วงเงินรวม/วงเงินใช้ได้ จากไฟล์ e-Statement ของธนาคารนี้โดยอัตโนมัติ
            </p>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full py-3 bg-[#2554FF] hover:bg-[#1B40DF] text-white font-black border-2 border-[#12161A] shadow-[2.5px_2.5px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none rounded-xl text-xs transition cursor-pointer"
            >
              {editingSource ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มสินเชื่อ/บัตร'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
