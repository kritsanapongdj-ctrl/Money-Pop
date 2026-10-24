import React, { useState } from 'react';
import { X, Copy, Check, Smartphone } from 'lucide-react';
import { GAS_URL } from '../../constants/theme';

export default function SetupGuideModal({ show, onClose, currentUser, currentMemberName }) {
  const [copied, setCopied] = useState(false);

  if (!show) return null;

  const syncUrl = `${GAS_URL || 'https://script.google.com/...'}&action=syncCredit&memberId=${currentUser || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-[#12161A]/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border-2 border-[#12161A] shadow-[8px_8px_0px_#12161A] w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] flex items-center justify-center">
              <Smartphone size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#12161A] tracking-tight">
                คู่มือเชื่อมต่อมือถือ Android
              </h2>
              <p className="text-[11px] text-slate-500 font-bold">
                โปรไฟล์: <span className="text-[#2554FF]">{currentMemberName || 'ไม่ระบุ'}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-[#12161A] flex items-center justify-center text-[#12161A] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sync URL Box */}
        <div className="bg-[#EEF2FF] border-2 border-[#12161A] rounded-xl p-3.5 mb-5 shadow-[2px_2px_0px_#12161A]">
          <span className="text-[10px] font-black uppercase text-[#2554FF] tracking-wider block mb-1">
            Personal Webhook URL ของคุณ
          </span>
          <div className="flex gap-2 items-center">
            <input 
              type="text" 
              readOnly 
              value={syncUrl} 
              className="bg-white border border-[#12161A] text-slate-700 text-xs font-mono font-bold rounded-lg p-2 w-full select-all outline-none" 
            />
            <button 
              onClick={handleCopy} 
              className="bg-[#2554FF] hover:bg-[#1B40DF] text-white border-2 border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] px-3 py-2 rounded-lg text-xs font-black shrink-0 flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
            >
              {copied ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} />}
              {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
            นำลิงก์นี้ไปวางใน MacroDroid เครื่องของคุณ เพื่อยิงข้อมูลเข้า Profile อัตโนมัติ
          </p>
        </div>

        {/* 3 Step Guide */}
        <div className="space-y-3.5 text-xs">
          <div className="bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3 shadow-[1.5px_1.5px_0px_#12161A]">
            <h4 className="font-black text-[#12161A] flex items-center gap-1.5 mb-1 text-sm">
              <span className="w-5 h-5 rounded-full bg-[#12161A] text-white text-xs flex items-center justify-center font-bold">1</span>
              ติดตั้งแอป MacroDroid
            </h4>
            <p className="text-slate-600 font-medium ml-6 leading-relaxed">
              เปิด Google Play Store บนมือถือ ค้นหาแอป <b>"MacroDroid"</b> (ฟรี) แล้วกดติดตั้ง
            </p>
          </div>

          <div className="bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3 shadow-[1.5px_1.5px_0px_#12161A]">
            <h4 className="font-black text-[#12161A] flex items-center gap-1.5 mb-1 text-sm">
              <span className="w-5 h-5 rounded-full bg-[#12161A] text-white text-xs flex items-center justify-center font-bold">2</span>
              ตั้งค่า 4 จุดป้องกันระบบปิดแอป
            </h4>
            <ul className="text-slate-600 font-medium ml-6 space-y-1 list-disc pl-2 leading-relaxed">
              <li><b>แบตเตอรี่:</b> ไปที่ตั้งค่าแอป MacroDroid เลือกแบตเตอรี่เป็น <i>"ไม่จำกัด (Unrestricted)"</i></li>
              <li><b>ล็อคแม่กุญแจ:</b> ในหน้าสลับแอป (Recents) กดค้างแล้วแตะ <i>"รูปแม่กุญแจ 🔒"</i></li>
              <li><b>เปิด Autostart:</b> <i>(สำหรับ Xiaomi/Oppo/Vivo)</i> เปิดสิทธิ์เริ่มทำงานอัตโนมัติ</li>
              <li><b>เปิดการแจ้งเตือนถาวร:</b> ในการตั้งค่า MacroDroid ติ๊กเปิด <i>"Persistent Notification"</i></li>
            </ul>
          </div>

          <div className="bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3 shadow-[1.5px_1.5px_0px_#12161A]">
            <h4 className="font-black text-[#12161A] flex items-center gap-1.5 mb-1 text-sm">
              <span className="w-5 h-5 rounded-full bg-[#12161A] text-white text-xs flex items-center justify-center font-bold">3</span>
              วาง Sync URL ใน MacroDroid
            </h4>
            <p className="text-slate-600 font-medium ml-6 leading-relaxed">
              ใน MacroDroid ให้สร้าง Action ยิง HTTP Post โดยวาง <b>Personal Webhook URL</b> จากด้านบนนี้ลงไป เมื่อมีแจ้งเตือนบิล Shopee, Line BK, UOB หรือ KTC ตัวเลขจะซิงค์เข้า Money-Pop ทันที
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t-2 border-slate-100 flex justify-end">
          <button 
            onClick={onClose} 
            className="w-full py-2.5 bg-[#12161A] hover:bg-slate-800 text-white rounded-xl font-black text-xs transition cursor-pointer"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
