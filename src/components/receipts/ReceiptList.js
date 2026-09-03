import React from 'react';
import { FileText, Clock } from 'lucide-react';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';

export default function ReceiptList({ receiptHistory, members, onViewReceipt }) {
  return (
    <div className="px-4 sm:px-0 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center">
          <FileText size={20} className="mr-2 text-[#38bdf8]" /> ประวัติใบเสร็จ
        </h2>
      </div>

      {receiptHistory.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          <Clock size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">ยังไม่มีประวัติใบเสร็จ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {receiptHistory.map((r) => {
            const author = members.find((m) => String(m.id) === String(r.by));
            return (
              <div 
                key={r.date} 
                className={`${theme.card} p-5 bg-gradient-to-br from-[#1a1c29] to-[#25283d] border-[#3f4366] relative overflow-hidden`}
              >
                <div className="flex justify-between items-start mb-3 border-b border-[#3f4366] pb-3">
                  <div>
                    <div className="text-xs text-slate-400 flex items-center mb-1">
                      <Clock size={12} className="mr-1" /> 
                      {new Date(r.date).toLocaleString('th-TH')}
                    </div>
                    <div className="text-[10px] text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded font-bold border border-[#38bdf8]/30 inline-block mt-1">
                      ทำรายการโดย: {author ? author.name : 'ไม่ระบุ'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-bold">TOTAL</div>
                    <div className="text-lg font-black text-[#f472b6] drop-shadow-[0_0_5px_rgba(244,114,182,0.3)]">
                      {formatCurrency(r.total)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#3f4366]/50 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">
                    ทำรายการทั้งหมด {r.items.length} บิล
                  </span>
                  <button 
                    onClick={() => onViewReceipt(r)} 
                    className="bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/50 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#38bdf8]/30 transition shadow-sm flex items-center"
                  >
                    <FileText size={14} className="mr-1" /> ดูใบเสร็จ
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
