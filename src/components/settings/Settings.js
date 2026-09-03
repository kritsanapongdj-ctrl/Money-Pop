import React from 'react';
import { Settings as SettingsIcon, Zap, Download, Upload, Users, ShoppingBag, CreditCard } from 'lucide-react';
import { theme } from '../../constants/theme';
import ListManager from './ListManager';

export default function Settings({ dbData, updateDB, onExportData, onImportData }) {
  return (
    <div className="px-4 sm:px-0 space-y-4">
      <h2 className="text-xl font-bold text-slate-100 flex items-center mb-2">
        <SettingsIcon size={20} className="mr-2 text-[#38bdf8]" /> ตั้งค่าแอป
      </h2>

      {/* Backup & Restore Card */}
      <div className={`${theme.card} p-5 bg-gradient-to-r from-[#1a1c29] to-[#25283d] border-[#3f4366]`}>
        <h3 className="font-bold text-[#38bdf8] mb-3 flex items-center drop-shadow-sm">
          <Zap size={18} className="mr-2 text-[#f472b6]" /> ระบบจัดการข้อมูล (Backup)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onExportData} 
            className="flex flex-col items-center justify-center bg-[#161824] p-3 rounded-xl border border-[#3f4366] text-[#38bdf8] hover:bg-[#25283d] transition shadow-sm hover:border-[#38bdf8]/50 hover:shadow-[0_0_10px_rgba(56,189,248,0.2)]"
          >
            <Download size={24} className="mb-1" />
            <span className="text-sm font-bold">ดาวน์โหลด Backup</span>
          </button>
          
          <label className="flex flex-col items-center justify-center bg-[#161824] p-3 rounded-xl border border-[#3f4366] text-[#34d399] hover:bg-[#25283d] transition shadow-sm cursor-pointer hover:border-[#34d399]/50 hover:shadow-[0_0_10px_rgba(52,211,153,0.2)]">
            <Upload size={24} className="mb-1" />
            <span className="text-sm font-bold">นำเข้าข้อมูล</span>
            <input type="file" accept=".json" onChange={onImportData} className="hidden" />
          </label>
        </div>
        <p className="text-[10px] text-slate-500 mt-3 text-center leading-tight">
          แนะนำให้ดาวน์โหลด Backup เก็บไว้สม่ำเสมอ<br />เพื่อป้องกันข้อมูลสูญหายกรณีระบบคลาวด์ขัดข้อง
        </p>
      </div>

      {/* Members */}
      <ListManager 
        title="สมาชิก" 
        data={dbData.members} 
        updateDB={updateDB} 
        dataKey="members" 
        icon={Users} 
        hasEmail 
      />

      {/* Categories & Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListManager 
          title="หมวดหมู่" 
          data={dbData.categories} 
          updateDB={updateDB} 
          dataKey="categories" 
          icon={ShoppingBag} 
        />
        <ListManager 
          title="ช่องทางจ่าย" 
          data={dbData.sources} 
          updateDB={updateDB} 
          dataKey="sources" 
          icon={CreditCard} 
        />
      </div>
    </div>
  );
}
