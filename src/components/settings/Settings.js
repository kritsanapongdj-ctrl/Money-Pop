import React, { useState } from 'react';
import { SlidersHorizontal, ShieldCheck, Download, Upload, Users, ShoppingBag, CreditCard, Smartphone } from 'lucide-react';
import ListManager from './ListManager';
import SetupGuideModal from '../modals/SetupGuideModal';

export default function Settings({ dbData, updateDB, onExportData, onImportData, currentUser }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const currentMember = dbData.members.find(m => String(m.id) === String(currentUser));

  return (
    <div className="px-4 sm:px-0 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] flex items-center justify-center">
          <SlidersHorizontal size={14} />
        </div>
        <h2 className="text-base sm:text-lg font-black text-[#12161A] tracking-tight">
          ตั้งค่าระบบและการจัดการข้อมูล
        </h2>
      </div>

      {/* Android Sync Setup Card */}
      <div className="bg-[#EEF2FF] border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black uppercase text-[#2554FF] tracking-wider block">
            ANDROID INTEGRATION
          </span>
          <h3 className="text-sm font-black text-[#12161A] mt-0.5">
            คู่มือเชื่อมต่อมือถือ Android (MacroDroid)
          </h3>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
            วิธีดักบิล Shopee, Line BK, KTC และตั้งค่ากันระบบปิดแอป 4 จุด
          </p>
        </div>
        <button 
          onClick={() => setGuideOpen(true)}
          className="bg-[#2554FF] hover:bg-[#1B40DF] text-white border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none px-3.5 py-2 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Smartphone size={14} />
          เปิดคู่มือ
        </button>
      </div>

      {/* Backup & Restore Card */}
      <div className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-100">
          <div className="w-6 h-6 rounded-md bg-[#059669]/10 text-[#059669] border border-[#12161A] flex items-center justify-center">
            <ShieldCheck size={14} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-wider text-[#12161A]">
            ระบบสำรองข้อมูล (Data Vault Backup)
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onExportData} 
            className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 p-3 rounded-xl border-2 border-[#12161A] text-[#12161A] shadow-[2.5px_2.5px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
          >
            <Download size={20} className="mb-1 text-[#2554FF]" />
            <span className="text-xs font-black">ดาวน์โหลด Backup</span>
          </button>
          
          <label className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 p-3 rounded-xl border-2 border-[#12161A] text-[#12161A] shadow-[2.5px_2.5px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer">
            <Upload size={20} className="mb-1 text-[#059669]" />
            <span className="text-xs font-black">นำเข้าไฟล์ข้อมูล</span>
            <input type="file" accept=".json" onChange={onImportData} className="hidden" />
          </label>
        </div>
        
        <p className="text-[10px] text-slate-500 font-semibold mt-3 text-center leading-normal">
          แนะนำให้ดาวน์โหลดไฟล์สำรองข้อมูล (.json) สม่ำเสมอเพื่อความปลอดภัยของข้อมูล
        </p>
      </div>

      {/* Members */}
      <ListManager 
        title="รายชื่อสมาชิก" 
        data={dbData.members} 
        updateDB={updateDB} 
        dataKey="members" 
        icon={Users} 
        hasEmail 
      />

      {/* Categories & Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListManager 
          title="หมวดหมู่ค่าใช้จ่าย" 
          data={dbData.categories} 
          updateDB={updateDB} 
          dataKey="categories" 
          icon={ShoppingBag} 
        />
        <ListManager 
          title="ช่องทางชำระเงิน" 
          data={dbData.sources} 
          updateDB={updateDB} 
          dataKey="sources" 
          icon={CreditCard} 
        />
      </div>

      <SetupGuideModal 
        show={guideOpen}
        onClose={() => setGuideOpen(false)}
        currentUser={currentUser}
        currentMemberName={currentMember ? currentMember.name : ''}
      />
    </div>
  );
}

