import React from 'react';
import { SlidersHorizontal, ShieldCheck, Download, Upload, Users, ShoppingBag, CreditCard } from 'lucide-react';
import ListManager from './ListManager';

export default function Settings({ dbData, updateDB, onExportData, onImportData }) {
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
    </div>
  );
}

