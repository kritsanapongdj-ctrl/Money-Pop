import React from 'react';
import { Check, FileText } from 'lucide-react';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';

export default function ReceiptModal({ 
  receiptModal, 
  members, 
  currentUser, 
  onClose, 
  onUndoReceipt 
}) {
  if (!receiptModal.open) return null;

  const authorId = receiptModal.isHistory ? receiptModal.by : currentUser;
  const author = members.find((m) => String(m.id) === String(authorId));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#161C2D] border border-[#f472b6]/60 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_40px_rgba(244,114,182,0.2)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#38bdf8]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#f472b6]/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

        <div className="text-center mb-6 pt-2 relative z-10">
          <div className="mx-auto w-12 h-12 bg-[#f472b6]/20 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(244,114,182,0.4)] border border-[#f472b6]/50">
            {receiptModal.isHistory ? (
              <FileText size={24} className="text-[#f472b6]" />
            ) : (
              <Check size={24} className="text-[#f472b6]" />
            )}
          </div>
          <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#f472b6] to-[#38bdf8] drop-shadow-sm">
            {receiptModal.isHistory ? 'RECEIPT DETAILS' : 'PAYMENT SUCCESS'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(receiptModal.date).toLocaleString('th-TH')}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            ทำรายการโดย: <span className="text-[#f472b6] font-bold">{author ? author.name : 'ไม่ระบุ'}</span>
          </p>
        </div>

        <div className="border-t border-dashed border-slate-700 my-4 relative z-10" />

        <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 relative z-10">
          {(receiptModal.items || []).map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm">
              <span className="font-medium text-slate-300 pr-4">{item.title}</span>
              <span className="font-bold text-slate-100 tabular-nums whitespace-nowrap">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-slate-700 my-4 relative z-10" />

        <div className="flex justify-between items-center text-lg relative z-10">
          <span className="font-black text-slate-200">TOTAL PAID</span>
          <span className="font-black text-[#f472b6] drop-shadow-[0_0_5px_rgba(244,114,182,0.5)]">
            {formatCurrency(receiptModal.total)}
          </span>
        </div>

        <div className="mt-8 relative z-10 flex gap-3">
          <button onClick={onClose} className={`${theme.button} flex-1 py-3`}>
            ปิดหน้าต่าง
          </button>
          {receiptModal.isHistory && (
            <button 
              onClick={() => onUndoReceipt(receiptModal)} 
              className="flex-1 py-3 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-xl font-bold hover:bg-rose-500/30 transition shadow-sm"
            >
              ยกเลิกใบเสร็จ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
