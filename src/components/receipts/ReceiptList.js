import React from 'react';
import { FileCheck2, Clock, Eye, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function ReceiptList({ receiptHistory, members, onViewReceipt }) {
  return (
    <div className="px-4 sm:px-0 space-y-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#059669] text-white border-2 border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] flex items-center justify-center">
            <FileCheck2 size={14} />
          </div>
          <h2 className="text-base sm:text-lg font-black text-[#12161A] tracking-tight">
            ประวัติการชำระเงินและสลิป (E-Slips)
          </h2>
        </div>
        <span className="text-[10px] bg-white border border-[#12161A] text-slate-700 font-mono font-bold px-2 py-0.5 rounded-full">
          {receiptHistory.length} สลิป
        </span>
      </div>

      {receiptHistory.length === 0 ? (
        <div className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl text-center text-slate-500 py-12 px-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full border-2 border-[#12161A] flex items-center justify-center mx-auto mb-3">
            <Clock size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-bold text-[#12161A]">ยังไม่มีประวัติสลิปใบเสร็จ</p>
          <p className="text-xs text-slate-400 mt-1">
            เมื่อคุณทำการชำระบิล ระบบจะสร้างสลิปบันทึกยอดไว้ที่นี่โดยอัตโนมัติ
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {receiptHistory.map((r) => {
            const author = members.find((m) => String(m.id) === String(r.by));
            return (
              <div 
                key={r.date} 
                className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4 hover:shadow-[4.5px_4.5px_0px_#12161A] transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3 pb-3 border-b-2 border-slate-100">
                  <div>
                    <div className="text-xs text-slate-500 flex items-center mb-1 font-semibold">
                      <Clock size={12} className="mr-1 text-slate-400" /> 
                      {new Date(r.date).toLocaleString('th-TH', { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                    </div>
                    <div className="text-[10px] text-[#2554FF] bg-[#EEF2FF] px-2 py-0.5 rounded font-black border border-[#2554FF]/30 inline-block">
                      ผู้ทำรายการ: {author ? author.name : 'ไม่ระบุ'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                      TOTAL PAID
                    </div>
                    <div className="text-lg font-mono font-black text-[#12161A]">
                      {formatCurrency(r.total)}
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-semibold">
                    รวม {r.items.length} รายการ
                  </span>
                  <button 
                    type="button"
                    onClick={() => onViewReceipt(r)} 
                    className="bg-white hover:bg-slate-100 text-[#12161A] border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={13} className="text-[#2554FF]" /> ดูสลิป
                    <ArrowUpRight size={12} className="text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

