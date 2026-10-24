import React from 'react';
import { Check, FileText } from 'lucide-react';
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
    <div className="fixed inset-0 bg-[#12161A]/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
      {/* Bank Slip Voucher Card */}
      <div className="bg-white border-2 border-[#12161A] shadow-[8px_8px_0px_#12161A] w-full max-w-sm rounded-2xl p-6 relative overflow-visible modal-contain overscroll-contain">
        
        {/* Top Header */}
        <div className="text-center mb-4 pt-1">
          <div className="mx-auto w-12 h-12 bg-[#059669] text-white border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] rounded-full flex items-center justify-center mb-3" aria-hidden="true">
            {receiptModal.isHistory ? (
              <FileText size={22} className="stroke-[2.5]" />
            ) : (
              <Check size={26} className="stroke-[3]" />
            )}
          </div>
          <span className="text-[10px] font-black tracking-widest text-[#059669] uppercase bg-[#D1FAE5] border border-[#059669] px-2 py-0.5 rounded-full">
            OFFICIAL E-SLIP VOUCHER
          </span>
          <h2 id="receipt-title" className="text-xl font-black tracking-tight text-[#12161A] mt-2">
            {receiptModal.isHistory ? 'รายละเอียดใบเสร็จ' : 'ทำรายการสำเร็จแล้ว'}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {new Date(receiptModal.date).toLocaleString('th-TH', {
              dateStyle: 'medium',
              timeStyle: 'medium'
            })}
          </p>
          <div className="mt-2 inline-block bg-[#F5F6F0] border border-[#12161A] px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-700">
            ทำรายการโดย: <span className="text-[#2554FF] font-black">{author ? author.name : 'ไม่ระบุ'}</span>
          </div>
        </div>

        {/* Perforated Voucher Notch Line */}
        <div className="relative my-4">
          <div className="border-t-2 border-dashed border-[#12161A]/40 w-full" />
        </div>

        {/* Items List */}
        <div className="space-y-2.5 max-h-[35vh] overflow-y-auto custom-scrollbar pr-1">
          {(receiptModal.items || []).map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm">
              <span className="font-bold text-slate-700 pr-3 text-xs leading-snug">{item.title}</span>
              <span className="font-mono font-bold text-[#12161A] tabular-nums whitespace-nowrap text-xs">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Perforated Voucher Bottom Line */}
        <div className="relative my-4">
          <div className="border-t-2 border-dashed border-[#12161A]/40 w-full" />
        </div>

        {/* Total Summary */}
        <div className="flex justify-between items-center text-base bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3">
          <span className="font-black text-xs uppercase tracking-wider text-slate-600">ยอดเงินรวม</span>
          <span className="font-mono font-black text-xl text-[#12161A]">
            {formatCurrency(receiptModal.total)}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2.5">
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 py-2.5 bg-[#2554FF] hover:bg-[#1B40DF] text-white border-2 border-[#12161A] shadow-[2.5px_2.5px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none rounded-xl font-black text-xs transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
          {receiptModal.isHistory && (
            <button 
              type="button"
              onClick={() => onUndoReceipt(receiptModal)} 
              className="py-2.5 px-4 bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#E11D48] border-2 border-[#12161A] shadow-[2.5px_2.5px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none rounded-xl font-black text-xs transition cursor-pointer"
            >
              ยกเลิกสลิปนี้
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

