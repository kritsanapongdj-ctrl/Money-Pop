import React, { useState } from 'react';
import { X, Copy, Check, Smartphone, Mail, ShieldCheck, ExternalLink } from 'lucide-react';
import { GAS_URL } from '../../constants/theme';

export default function SetupGuideModal({ show, onClose, currentUser, currentMemberName }) {
  const [activeTab, setActiveTab] = useState('macrodroid'); // 'macrodroid' | 'email'
  const [copied, setCopied] = useState(false);
  const [copiedDomains, setCopiedDomains] = useState(false);

  if (!show) return null;

  const syncUrl = `${GAS_URL || 'https://script.google.com/...'}&action=syncCredit&memberId=${currentUser || ''}`;
  const bankDomains = '@ktc.co.th OR @linebk.com OR @uob.co.th OR @kasikornbank.com OR @ttbbank.com OR @cardx.co.th OR @scb.co.th';

  const handleCopySyncUrl = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyDomains = () => {
    navigator.clipboard.writeText(bankDomains);
    setCopiedDomains(true);
    setTimeout(() => setCopiedDomains(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-[#12161A]/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="setup-guide-title">
      <div className="bg-white border-2 border-[#12161A] shadow-[8px_8px_0px_#12161A] w-full max-w-xl rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto custom-scrollbar modal-contain overscroll-contain">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] flex items-center justify-center" aria-hidden="true">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 id="setup-guide-title" className="text-base sm:text-lg font-black text-[#12161A] tracking-tight">
                คู่มือเชื่อมต่อระบบอัตโนมัติ (Money-Pop Sync)
              </h2>
              <p className="text-[11px] text-slate-500 font-bold">
                โปรไฟล์ปัจจุบัน: <span className="text-[#2554FF]">{currentMemberName || 'ไม่ระบุ'}</span>
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="ปิดคู่มือ"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-[#12161A] flex items-center justify-center text-[#12161A] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#E5E7EB] border-2 border-[#12161A] rounded-xl p-1 mb-5 shadow-[2px_2px_0px_#12161A]" role="tablist">
          <button 
            type="button"
            role="tab"
            aria-selected={activeTab === 'macrodroid'}
            onClick={() => setActiveTab('macrodroid')}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'macrodroid'
                ? 'bg-white text-[#12161A] border-2 border-[#12161A] shadow-[1px_1px_0px_#12161A]'
                : 'text-slate-600 hover:text-[#12161A]'
            }`}
          >
            <Smartphone size={14} className="text-[#2554FF]" />
            1. แจ้งเตือนมือถือ (MacroDroid)
          </button>

          <button 
            type="button"
            role="tab"
            aria-selected={activeTab === 'email'}
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white text-[#12161A] border-2 border-[#12161A] shadow-[1px_1px_0px_#12161A]'
                : 'text-slate-600 hover:text-[#12161A]'
            }`}
          >
            <Mail size={14} className="text-[#059669]" />
            2. อีเมลใบแจ้งหนี้ (e-Statement)
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: MACRODROID PUSH NOTIFICATION GUIDE */}
        {/* ========================================================================= */}
        {activeTab === 'macrodroid' && (
          <div className="space-y-4 text-xs animate-fadeIn">
            {/* Sync URL Box */}
            <div className="bg-[#EEF2FF] border-2 border-[#12161A] rounded-xl p-3.5 shadow-[2px_2px_0px_#12161A]">
              <span className="text-[10px] font-black uppercase text-[#2554FF] tracking-wider block mb-1">
                Personal Webhook URL ของคุณ (ใช้ใน MacroDroid)
              </span>
              <div className="flex gap-2 items-center">
                <input 
                  type="text" 
                  readOnly 
                  aria-label="Personal Webhook URL"
                  value={syncUrl} 
                  className="bg-white border border-[#12161A] text-slate-700 text-xs font-mono font-bold rounded-lg p-2 w-full select-all outline-none" 
                />
                <button 
                  type="button"
                  onClick={handleCopySyncUrl} 
                  className="bg-[#2554FF] hover:bg-[#1B40DF] text-white border-2 border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] px-3 py-2 rounded-lg text-xs font-black shrink-0 flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
                >
                  {copied ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} />}
                  {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                ลิงก์นี้ผูกกับโปรไฟล์ของคุณโดยเฉพาะ ข้อมูลบิลที่ดักได้จะส่งเข้าตู้เซฟของคุณทันที
              </p>
            </div>

            {/* Step 1: Install & Permissions */}
            <div className="bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3.5 shadow-[1.5px_1.5px_0px_#12161A]">
              <h4 className="font-black text-[#12161A] flex items-center gap-1.5 mb-1.5 text-sm">
                <span className="w-5 h-5 rounded-full bg-[#12161A] text-white text-xs flex items-center justify-center font-bold">1</span>
                ติดตั้งแอปและเปิดสิทธิ์การอ่านการแจ้งเตือน
              </h4>
              <p className="text-slate-600 font-medium ml-6 leading-relaxed">
                เปิด Google Play Store ติดตั้งแอป <b>"MacroDroid"</b> (ฟรี) เมื่อเปิดแอปครั้งแรก ให้กดอนุญาตสิทธิ์ <b>"การเข้าถึงการแจ้งเตือน (Notification Access)"</b>
              </p>
            </div>

            {/* Step 2: Prevent System Sleep */}
            <div className="bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3.5 shadow-[1.5px_1.5px_0px_#12161A]">
              <h4 className="font-black text-[#12161A] flex items-center gap-1.5 mb-1.5 text-sm">
                <span className="w-5 h-5 rounded-full bg-[#12161A] text-white text-xs flex items-center justify-center font-bold">2</span>
                ตั้งค่า 4 จุดป้องกันระบบปิดแอปเบื้องหลัง (สำคัญมาก)
              </h4>
              <ul className="text-slate-600 font-medium ml-6 space-y-1.5 list-disc pl-2 leading-relaxed">
                <li><b>แบตเตอรี่:</b> ไปที่ตั้งค่ามือถือ ➔ แอป ➔ MacroDroid ➔ แบตเตอรี่ เลือก <i>"ไม่จำกัด (Unrestricted)"</i></li>
                <li><b>ล็อคแม่กุญแจ:</b> ในหน้าต่างสลับแอป (Recent Apps) แตะค้างที่ MacroDroid แล้วเลือก <i>"รูปแม่กุญแจ 🔒"</i></li>
                <li><b>เปิด Autostart:</b> <i>(Xiaomi/Oppo/Vivo/Realme)</i> เปิดสิทธิ์ <i>"เริ่มทำงานอัตโนมัติ"</i> และ <i>"ทำงานเบื้องหลัง"</i></li>
                <li><b>เปิดการแจ้งเตือนถาวร:</b> ในการตั้งค่าแอป MacroDroid ติ๊กเปิด <i>"Persistent Notification"</i></li>
              </ul>
            </div>

            {/* Step 3: Detailed Macro Creation */}
            <div className="bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3.5 shadow-[1.5px_1.5px_0px_#12161A]">
              <h4 className="font-black text-[#12161A] flex items-center gap-1.5 mb-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-[#12161A] text-white text-xs flex items-center justify-center font-bold">3</span>
                วิธีสร้าง Macro ใน MacroDroid ทีละปุ่ม
              </h4>

              <div className="ml-6 space-y-3">
                {/* 3A: Trigger */}
                <div className="bg-white border border-[#12161A] rounded-xl p-3">
                  <span className="font-black text-[#E11D48] text-xs block mb-1">
                    🔴 ฝั่ง Triggers (ตัวกระตุ้นสีแดง):
                  </span>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-700">
                    <li>กดเครื่องหมาย <b>+</b> สีแดง ➔ เลือกหมวด <b>"📱 เหตุการณ์ของอุปกรณ์ (Device Events)"</b> <i>(อยู่เหนือหมวดแอปพลิเคชัน)</i> หรือแตะที่ <b>รูปแว่นขยาย 🔍</b> ด้านบนแล้วค้นหาคำว่า <code>แจ้งเตือน</code></li>
                    <li>แตะเลือก <b>"การแจ้งเตือน (Notification)"</b> ➔ เลือก <b>"ได้รับการแจ้งเตือน (Notification Received)"</b></li>
                    <li>เลือก <b>"เลือกแอปพลิเคชัน"</b> ➔ ติ๊กเลือกแอป: <b>LINE</b> (สำหรับ LINE BK), <b>Shopee</b>, <b>K PLUS</b>, <b>UOB</b>, <b>KTC</b></li>
                    <li>
                      <b>ตัวกรองความปลอดภัย (ไม่ให้ดักแชทส่วนตัว):</b><br />
                      ในช่อง <b>หัวข้อ (Notification Title)</b> ให้พิมพ์: <code>*LINE BK*</code><br />
                      ในช่อง <b>ข้อความประกอบด้วย (Text Contains)</b> ให้พิมพ์: <code>*บาท*</code>
                    </li>
                  </ol>
                </div>

                {/* 3B: Action */}
                <div className="bg-white border border-[#12161A] rounded-xl p-3">
                  <span className="font-black text-[#2554FF] text-xs block mb-1">
                    🔵 ฝั่ง Actions (การกระทำสีฟ้า):
                  </span>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                    <li>กดเครื่องหมาย <b>+</b> สีฟ้า ➔ เลือกหมวด <b>"การเชื่อมต่อ (Connectivity)"</b></li>
                    <li>เลือก <b>"คำขอ HTTP (HTTP Request)"</b> ➔ เลือก Request Method เป็น <b>`GET`</b></li>
                    <li>ในช่อง <b>URL</b> ให้วาง <b>Personal Webhook URL</b> จากด้านบน แล้วพิมพ์ต่อท้าย:
                      <div className="mt-1 bg-slate-100 p-2 rounded-lg font-mono text-[10px] break-all border border-slate-300">
                        &source=&#123;notification_title&#125;&amount=&#123;notification_text&#125;
                      </div>
                    </li>
                    <li>กด <b>ตกลง (OK)</b> ➔ ตั้งชื่อมาโครว่า <b>`Money-Pop Sync`</b> ➔ กดเครื่องหมาย <b>+</b> สีขาวเพื่อบันทึก</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EMAIL E-STATEMENT FORWARDING GUIDE */}
        {/* ========================================================================= */}
        {activeTab === 'email' && (
          <div className="space-y-4 text-xs animate-fadeIn">
            {/* Overview Banner */}
            <div className="bg-[#ECFDF5] border-2 border-[#12161A] rounded-xl p-3.5 shadow-[2px_2px_0px_#12161A]">
              <span className="text-[10px] font-black uppercase text-[#065F46] tracking-wider block mb-0.5">
                💡 สะดวก ปลอดภัย ไม่ต้องมีเมลกลาง & ไม่ต้องให้รหัสผ่าน
              </span>
              <p className="text-slate-700 font-semibold leading-relaxed">
                สมาชิกแต่ละคนเพียงตั้งค่าใน Gmail ของตัวเองครั้งเดียว ให้<b>ส่งต่อเฉพาะอีเมลใบแจ้งหนี้จากธนาคาร</b>มาที่ Gmail ของเจ้าของบ้าน ระบบจะตรวจยอดและแยกบิลเข้าตู้เซฟของแต่ละคนให้อัตโนมัติ
              </p>
            </div>

            {/* Step 1: Add Forwarding in Member's Gmail */}
            <div className="bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3.5 shadow-[1.5px_1.5px_0px_#12161A]">
              <h4 className="font-black text-[#12161A] flex items-center gap-1.5 mb-1.5 text-sm">
                <span className="w-5 h-5 rounded-full bg-[#12161A] text-white text-xs flex items-center justify-center font-bold">1</span>
                เพิ่มที่อยู่การส่งต่อใน Gmail ของสมาชิก
              </h4>
              <ol className="list-decimal pl-6 space-y-1.5 text-slate-700 leading-relaxed">
                <li>เปิด Gmail บนคอมพิวเตอร์ หรือเปิดผ่านเบราว์เซอร์มือถือ (เปิดโหมด Desktop Site)</li>
                <li>กดไอคอน <b>การตั้งค่า (รูปฟันเฟือง ⚙️)</b> มุมขวาบน ➔ เลือก <b>"ดูการตั้งค่าทั้งหมด (See all settings)"</b></li>
                <li>เลือกแท็บ <b>"การส่งต่อและ POP/IMAP (Forwarding and POP/IMAP)"</b></li>
                <li>กดปุ่ม <b>"เพิ่มที่อยู่การส่งต่อ (Add a forwarding address)"</b> แล้วใส่ <b>Gmail ของเจ้าของบ้าน</b></li>
                <li className="bg-white border border-[#12161A] rounded-lg p-2 font-bold text-slate-800">
                  ⚠️ <b>จุดสำคัญ:</b> Google จะส่งรหัสยืนยัน 6 หลักไปที่ Gmail ของเจ้าของบ้าน ให้นำรหัสนั้นมากรอกยืนยันในหน้านี้
                </li>
              </ol>
            </div>

            {/* Step 2: Create Bank Filter */}
            <div className="bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3.5 shadow-[1.5px_1.5px_0px_#12161A]">
              <h4 className="font-black text-[#12161A] flex items-center gap-1.5 mb-1.5 text-sm">
                <span className="w-5 h-5 rounded-full bg-[#12161A] text-white text-xs flex items-center justify-center font-bold">2</span>
                สร้างตัวกรองเฉพาะอีเมลธนาคาร (Bank Filter)
              </h4>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700 leading-relaxed">
                <li>ในหน้าการตั้งค่า Gmail คลิกแท็บ <b>"ตัวกรองและที่อยู่ที่บล็อกไว้ (Filters and Blocked Addresses)"</b></li>
                <li>คลิกปุ่ม <b>"สร้างตัวกรองใหม่ (Create a new filter)"</b></li>
                <li>
                  ในช่อง <b>จาก (From):</b> ให้วางรายชื่อโดเมนธนาคารด้านล่างนี้:
                  <div className="flex gap-2 items-center mt-1">
                    <input 
                      type="text" 
                      readOnly 
                      value={bankDomains}
                      className="bg-white border border-[#12161A] text-slate-700 text-[10px] font-mono font-bold rounded-lg p-2 w-full select-all outline-none"
                    />
                    <button 
                      type="button"
                      onClick={handleCopyDomains}
                      className="bg-[#059669] hover:bg-[#047857] text-white border border-[#12161A] px-2.5 py-2 rounded-lg text-xs font-black shrink-0 flex items-center gap-1"
                    >
                      {copiedDomains ? <Check size={12} className="stroke-[3]" /> : <Copy size={12} />}
                      {copiedDomains ? 'คัดลอกแล้ว' : 'คัดลอก'}
                    </button>
                  </div>
                </li>
                <li>กด <b>"สร้างตัวกรอง (Create filter)"</b> ➔ ติ๊กถูกที่ช่อง <b>"ส่งต่อไปยัง: (Forward it to:)"</b> เลือกอีเมลเจ้าของบ้าน ➔ กดสร้างตัวกรอง เป็นอันเสร็จสิ้น!</li>
              </ol>
            </div>

            {/* Step 3: Enter Card PDF Passcode */}
            <div className="bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3.5 shadow-[1.5px_1.5px_0px_#12161A]">
              <h4 className="font-black text-[#12161A] flex items-center gap-1.5 mb-1.5 text-sm">
                <span className="w-5 h-5 rounded-full bg-[#12161A] text-white text-xs flex items-center justify-center font-bold">3</span>
                ใส่รหัสปลดล็อก PDF ของแต่ละบัตร (ในหน้าตู้เซฟสินเชื่อ)
              </h4>
              <p className="text-slate-600 font-medium ml-6 mb-2 leading-relaxed">
                ในหน้า <b>"สินเชื่อ/บัตร"</b> ของ Money-Pop สมาชิกสามารถกดแก้ไขการ์ดบัตรแต่ละใบ แล้วกรอกรหัสปลดล็อกของธนาคารนั้นเก็บไว้:
              </p>
              <div className="ml-6 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-white p-2 rounded-lg border border-slate-300">
                  <span className="font-bold text-slate-800 block">KTC:</span>
                  <span className="text-slate-500">วดป. เกิด ค.ศ. 8 หลัก (DDMMYYYY)</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-300">
                  <span className="font-bold text-slate-800 block">UOB / TMRW:</span>
                  <span className="text-slate-500">วดป. เกิด พ.ศ. 6 หลัก (DDMMYY)</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-300">
                  <span className="font-bold text-slate-800 block">LINE BK / KBank:</span>
                  <span className="text-slate-500">เลข ปชช. 4 ตัวท้าย หรือ วดป.เกิด</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-300">
                  <span className="font-bold text-slate-800 block">TTB / Shopee:</span>
                  <span className="text-slate-500">เลข ปชช. 4 ตัวท้าย</span>
                </div>
              </div>
            </div>

            {/* Step 4: Testing Manual Scan */}
            <div className="bg-[#EEF2FF] border-2 border-[#12161A] rounded-xl p-3 shadow-[1.5px_1.5px_0px_#12161A]">
              <span className="text-[10px] font-black uppercase text-[#2554FF] tracking-wider block mb-1">
                🧪 วิธีทดสอบการอ่านอีเมล (สำหรับเจ้าของระบบ)
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">
                คุณสามารถทดสอบสแกนอีเมลได้ทันทีโดยไม่ต้องรอรอบ 6 ชั่วโมง โดยเปิดลิงก์นี้ในเบราว์เซอร์:
              </p>
              <a 
                href={`${GAS_URL}&action=scanEmail`} 
                target="_blank" 
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[#2554FF] font-mono font-bold text-[11px] underline break-all hover:text-[#1B40DF]"
              >
                กดทดสอบอ่านอีเมลทันที <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t-2 border-slate-100 flex justify-end">
          <button 
            type="button"
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
