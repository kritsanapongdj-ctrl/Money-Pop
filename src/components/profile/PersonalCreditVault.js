import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Plus, HelpCircle, Users, AlertCircle, 
  Calendar, CheckCircle2, Edit2, Trash2, ShieldCheck, Lock, KeyRound 
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { calculateCreditUsage } from '../../utils/creditUtils';
import CreditSourceModal from '../modals/CreditSourceModal';
import SetupGuideModal from '../modals/SetupGuideModal';
import VaultPinLock from './VaultPinLock';

export default function PersonalCreditVault({
  currentUser,
  members,
  sources,
  expenses,
  updateDB,
  showToast,
  onOpenUserModal
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [unlockedUser, setUnlockedUser] = useState(null);
  const [resettingPin, setResettingPin] = useState(false);

  const currentMember = members.find((m) => String(m.id) === String(currentUser));
  const isUnlocked = unlockedUser === String(currentUser) && !resettingPin;

  // Filter sources owned by current member
  const myCreditSources = useMemo(() => {
    return sources.filter((s) => String(s.ownerId) === String(currentUser));
  }, [sources, currentUser]);

  // Aggregate stats across all personal credit sources
  const { totalDue, totalPersonal, totalBorrowed, allBorrowers } = useMemo(() => {
    let tDue = 0;
    let tPersonal = 0;
    let tBorrowed = 0;
    const borrowersList = [];

    myCreditSources.forEach((src) => {
      const usage = calculateCreditUsage(src, expenses, currentUser, members);
      tDue += usage.statementDue;
      tPersonal += usage.personalDue;
      tBorrowed += usage.borrowedByFamily;
      borrowersList.push(...usage.familyBorrowers);
    });

    return {
      totalDue: tDue,
      totalPersonal: tPersonal,
      totalBorrowed: tBorrowed,
      allBorrowers: borrowersList
    };
  }, [myCreditSources, expenses, currentUser, members]);

  const handleSaveSource = (savedSource) => {
    let updatedSources;
    if (editingSource) {
      updatedSources = sources.map((s) => s.id === savedSource.id ? savedSource : s);
      showToast(`อัปเดต "${savedSource.name}" เรียบร้อยแล้ว`);
    } else {
      updatedSources = [...sources, savedSource];
      showToast(`เพิ่ม "${savedSource.name}" เข้าตู้เซฟเรียบร้อย`);
    }
    updateDB({ sources: updatedSources });
    setModalOpen(false);
    setEditingSource(null);
  };

  const handleDeleteSource = (sourceToDelete) => {
    if (!window.confirm(`คุณต้องการลบ "${sourceToDelete.name}" ออกจากระบบใช่หรือไม่?`)) return;
    const updatedSources = sources.filter((s) => s.id !== sourceToDelete.id);
    updateDB({ sources: updatedSources });
    showToast(`ลบ "${sourceToDelete.name}" เรียบร้อยแล้ว`);
  };

  if (!currentUser) {
    return (
      <div className="bg-white border-2 border-[#12161A] shadow-[4px_4px_0px_#12161A] rounded-2xl p-8 text-center max-w-sm mx-auto my-6">
        <div className="w-12 h-12 bg-[#EEF2FF] rounded-2xl border-2 border-[#12161A] flex items-center justify-center mx-auto mb-3 text-[#2554FF]">
          <Users size={24} />
        </div>
        <h3 className="font-black text-base text-[#12161A]">กรุณาระบุผู้ใช้งานก่อน</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4 font-medium">เพื่อเปิดตู้เซฟสินเชื่อและบัตรส่วนตัวของคุณ</p>
        <button 
          type="button"
          onClick={onOpenUserModal}
          className="bg-[#2554FF] text-white px-4 py-2 rounded-xl font-black text-xs border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
        >
          เลือกผู้ใช้งาน
        </button>
      </div>
    );
  }

  // If locked, render Secure PIN Keypad only (No credit data rendered in DOM)
  if (!isUnlocked) {
    return (
      <VaultPinLock
        member={currentMember}
        members={members}
        onUnlock={() => {
          setUnlockedUser(String(currentUser));
          setResettingPin(false);
        }}
        updateDB={updateDB}
        showToast={showToast}
        onOpenUserModal={onOpenUserModal}
      />
    );
  }

  return (
    <div className="px-4 sm:px-0 space-y-4">
      {/* Header Profile Strip */}
      <div className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#2554FF] text-white border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] flex items-center justify-center font-black">
            <CreditCard size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-widest text-[#2554FF] uppercase bg-[#EEF2FF] border border-[#2554FF]/30 px-2 py-0.2 rounded-full">
                MY CREDIT VAULT 🔒
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#12161A] tracking-tight">
              ตู้เซฟสินเชื่อของ: <span className="text-[#2554FF]">{currentMember ? currentMember.name : 'กรุณาเลือกผู้ใช้'}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button 
            type="button"
            onClick={() => setUnlockedUser(null)}
            className="bg-[#F5F6F0] hover:bg-slate-200 text-slate-700 border border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
            title="ล็อคตู้เซฟทันที"
          >
            <Lock size={12} className="text-[#E11D48]" /> ล็อค
          </button>

          <button 
            type="button"
            onClick={() => setResettingPin(true)}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
            title="เปลี่ยนรหัส PIN"
          >
            <KeyRound size={12} className="text-[#2554FF]" /> รหัส PIN
          </button>

          <button 
            type="button"
            onClick={() => setGuideOpen(true)}
            className="bg-white hover:bg-slate-100 text-[#12161A] border border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
          >
            <HelpCircle size={13} className="text-[#2554FF]" />
            คู่มือ
          </button>

          <button 
            type="button"
            onClick={() => { setEditingSource(null); setModalOpen(true); }}
            className="bg-[#2554FF] hover:bg-[#1B40DF] text-white border border-[#12161A] shadow-[1.5px_1.5px_0px_#12161A] px-3 py-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
          >
            <Plus size={14} className="stroke-[3]" />
            เพิ่มบัตร
          </button>
        </div>
      </div>

      {/* 3 KPI Summary Cards (Segregated to prevent Double-Counting) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Statement Due */}
        <div className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1 text-slate-500 font-bold text-xs">
            <CreditCard size={14} className="text-slate-600" />
            <span>ยอดเรียกเก็บรอบนี้รวม</span>
          </div>
          <p className="text-2xl font-mono font-black text-[#12161A]">
            {formatCurrency(totalDue)}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">รวมทุกบัตรและสินเชื่อ</span>
        </div>

        {/* True Personal Debt */}
        <div className="bg-[#ECFDF5] border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1 text-[#065F46] font-bold text-xs">
            <CheckCircle2 size={14} className="text-[#059669]" />
            <span>หนี้ส่วนตัวแท้จริง</span>
          </div>
          <p className="text-2xl font-mono font-black text-[#059669]">
            {formatCurrency(totalPersonal)}
          </p>
          <span className="text-[10px] text-[#065F46] font-medium">หักส่วนที่คนในบ้านยืมออกแล้ว</span>
        </div>

        {/* Borrowed by Family */}
        <div className="bg-[#FFFBEB] border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1 text-[#92400E] font-bold text-xs">
            <Users size={14} className="text-[#D97706]" />
            <span>คนในบ้านยืมใช้อยู่</span>
          </div>
          <p className="text-2xl font-mono font-black text-[#D97706]">
            {formatCurrency(totalBorrowed)}
          </p>
          <span className="text-[10px] text-[#92400E] font-medium">
            {allBorrowers.length > 0 ? `${allBorrowers.length} รายการที่ต้องเคลียร์คืน` : 'ไม่มีคนยืมค้างชำระ'}
          </span>
        </div>
      </div>

      {/* Reimbursement Due Callout Banner */}
      {allBorrowers.length > 0 && (
        <div className="bg-[#FEF3C7] border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#D97706]/30">
            <AlertCircle size={16} className="text-[#D97706]" />
            <h3 className="text-xs font-black uppercase text-[#92400E] tracking-wider">
              รายการที่คนในบ้านต้องชำระคืนเราในรอบบิลนี้ ({allBorrowers.length} บิล)
            </h3>
          </div>
          <div className="space-y-2 mt-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {allBorrowers.map((b, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-[#12161A] rounded-xl p-2.5 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-bold text-[#12161A]">{b.title}</span>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    ผู้รับผิดชอบ: <span className="text-[#2554FF] font-bold">{b.borrowerName}</span> • รอบเดือน {b.month}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-xs text-[#D97706]">
                    {formatCurrency(b.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Sources List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#12161A] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#2554FF]" />
            บัตรเครดิตและสินเชื่อส่วนบุคคล ({myCreditSources.length})
          </h3>
        </div>

        {myCreditSources.length === 0 ? (
          <div className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl text-center py-10 px-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full border-2 border-[#12161A] flex items-center justify-center mx-auto mb-3">
              <CreditCard size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-bold text-[#12161A]">ยังไม่มีข้อมูลสินเชื่อในโปรไฟล์ของคุณ</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              กดปุ่ม "เพิ่มสินเชื่อ/บัตร" ด้านบน เพื่อระบุวงเงิน Shopee SPayLater, Line BK หรือบัตรเครดิตของคุณ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myCreditSources.map((src) => {
              const usage = calculateCreditUsage(src, expenses, currentUser, members);
              const totalLimit = parseFloat(src.totalLimit) || 0;
              const availLimit = parseFloat(src.availableLimit) || 0;

              return (
                <div 
                  key={src.id} 
                  className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] hover:shadow-[4.5px_4.5px_0px_#12161A] rounded-2xl p-4 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3 pb-2.5 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase bg-[#F5F6F0] border border-[#12161A] px-2 py-0.2 rounded-md">
                          {src.type || 'credit_line'}
                        </span>
                        {src.dueDate && (
                          <span className="text-[10px] font-bold text-[#2554FF] bg-[#EEF2FF] border border-[#2554FF]/30 px-2 py-0.2 rounded-md flex items-center gap-0.5">
                            <Calendar size={10} /> ครบกำหนด {new Date(src.dueDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-[#12161A] mt-1">{src.name}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        type="button"
                        onClick={() => { setEditingSource(src); setModalOpen(true); }}
                        aria-label={`แก้ไข ${src.name}`}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 border border-[#12161A] flex items-center justify-center text-slate-700 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2554FF]"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit2 size={13} aria-hidden="true" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteSource(src)}
                        aria-label={`ลบ ${src.name}`}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-rose-50 border border-[#12161A] flex items-center justify-center text-[#E11D48] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2554FF]"
                        title="ลบ"
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Limit Progress Bar */}
                  {totalLimit > 0 && (
                    <div className="mb-3 bg-[#F5F6F0] p-2.5 rounded-xl border border-[#12161A]">
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <span className="text-slate-600">
                          วงเงินคงเหลือ: <span className="font-mono text-[#059669] font-black">{formatCurrency(availLimit)}</span>
                        </span>
                        <span className="text-slate-500 font-mono">
                          วงเงินรวม: {formatCurrency(totalLimit)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full border border-[#12161A] overflow-hidden p-[1px]">
                        <div 
                          className="bg-[#2554FF] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, 100 - usage.utilizationRate))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Metrics Footer */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-[#F5F6F0] border border-[#12161A] rounded-xl p-2">
                      <span className="text-[10px] text-slate-500 block font-bold">ยอดเรียกเก็บรอบนี้</span>
                      <span className="font-mono font-black text-sm text-[#12161A]">
                        {formatCurrency(usage.statementDue)}
                      </span>
                    </div>

                    <div className="bg-[#FFFBEB] border border-[#12161A] rounded-xl p-2">
                      <span className="text-[10px] text-[#92400E] block font-bold">คนในบ้านยืมใช้อยู่</span>
                      <span className="font-mono font-black text-sm text-[#D97706]">
                        {formatCurrency(usage.borrowedByFamily)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Credit Source Add/Edit Modal */}
      <CreditSourceModal 
        show={modalOpen}
        editingSource={editingSource}
        currentUser={currentUser}
        members={members}
        onSave={handleSaveSource}
        onClose={() => { setModalOpen(false); setEditingSource(null); }}
      />

      {/* Android Setup Guide Modal */}
      <SetupGuideModal 
        show={guideOpen}
        onClose={() => setGuideOpen(false)}
        currentUser={currentUser}
        currentMemberName={currentMember ? currentMember.name : ''}
      />
    </div>
  );
}
