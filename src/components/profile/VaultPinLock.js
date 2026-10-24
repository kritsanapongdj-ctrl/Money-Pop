import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Delete, ShieldAlert, KeyRound } from 'lucide-react';

export default function VaultPinLock({ 
  member, 
  members, 
  onUnlock, 
  updateDB, 
  showToast,
  onOpenUserModal 
}) {
  const hasPin = Boolean(member?.pin);
  const [mode, setMode] = useState(hasPin ? 'unlock' : 'create'); // 'unlock' | 'create' | 'confirm'
  const [pin, setPin] = useState('');
  const [tempPin, setTempPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setShake(true);
    setPin('');
    setTimeout(() => setShake(false), 500);
  };

  const handleKeyPress = useCallback((digit) => {
    setErrorMsg('');
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);

      // When 4 digits are completed
      if (nextPin.length === 4) {
        if (mode === 'unlock') {
          if (nextPin === String(member.pin)) {
            onUnlock();
          } else {
            triggerError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่');
          }
        } else if (mode === 'create') {
          setTempPin(nextPin);
          setPin('');
          setMode('confirm');
        } else if (mode === 'confirm') {
          if (nextPin === tempPin) {
            // Save PIN to member
            const updatedMembers = members.map((m) => 
              String(m.id) === String(member.id) ? { ...m, pin: nextPin } : m
            );
            updateDB({ members: updatedMembers });
            showToast('ตั้งรหัส PIN 4 หลักเรียบร้อยแล้ว');
            onUnlock();
          } else {
            triggerError('รหัสยืนยันไม่ตรงกัน กรุณาเริ่มตั้งใหม่');
            setTempPin('');
            setMode('create');
          }
        }
      }
    }
  }, [pin, mode, tempPin, member, members, onUnlock, updateDB, showToast]);

  const handleDelete = useCallback(() => {
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  }, []);

  // Listen to physical keyboard events (for desktop users)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete]);

  return (
    <div className="bg-white border-2 border-[#12161A] shadow-[6px_6px_0px_#12161A] rounded-3xl p-6 sm:p-8 max-w-sm mx-auto my-6 text-center animate-fadeIn select-none">
      {/* Top Lock Badge */}
      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EEF2FF] border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] flex items-center justify-center text-[#2554FF] mb-4">
        {mode === 'unlock' ? <Lock size={28} /> : <KeyRound size={28} />}
      </div>

      <div className="inline-block bg-[#F5F6F0] border border-[#12161A] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1.5">
        ตู้เซฟสินเชื่อส่วนตัว • {member ? member.name : 'ไม่ระบุ'}
      </div>

      <h3 className="text-lg font-black text-[#12161A] tracking-tight">
        {mode === 'unlock' && 'กรุณากรอกรหัส PIN 4 หลัก'}
        {mode === 'create' && 'ตั้งรหัส PIN 4 หลักใหม่'}
        {mode === 'confirm' && 'ยืนยันรหัส PIN 4 หลักอีกครั้ง'}
      </h3>

      <p className="text-xs text-slate-500 font-medium mt-1 mb-6">
        {mode === 'unlock' && 'เพื่อความเป็นส่วนตัวของข้อมูลบัตรและวงเงินสินเชื่อ'}
        {mode === 'create' && 'ใช้สำหรับปลดล็อกดูหนี้และวงเงินบัตรของคุณ'}
        {mode === 'confirm' && 'กดตัวเลข 4 หลักเดิมอีกครั้งเพื่อยืนยัน'}
      </p>

      {/* 4 Pin Indicator Dots */}
      <div className={`flex justify-center items-center gap-4 mb-6 ${shake ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((index) => {
          const isFilled = pin.length > index;
          return (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 border-[#12161A] transition-all duration-200 ${
                isFilled
                  ? 'bg-[#2554FF] scale-125 shadow-[1.5px_1.5px_0px_#12161A]'
                  : 'bg-white'
              }`}
            />
          );
        })}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 text-xs font-bold text-[#E11D48] bg-[#FFE4E6] border border-[#E11D48] py-1 px-3 rounded-lg flex items-center justify-center gap-1.5 animate-fadeIn">
          <ShieldAlert size={14} />
          {errorMsg}
        </div>
      )}

      {/* 3x4 Number Keypad */}
      <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(String(num))}
            className="h-14 rounded-2xl bg-white hover:bg-slate-50 active:bg-[#EEF2FF] border-2 border-[#12161A] shadow-[2.5px_2.5px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xl font-mono font-black text-[#12161A] transition-all flex items-center justify-center cursor-pointer"
          >
            {num}
          </button>
        ))}

        {/* Bottom Row: Clear / 0 / Backspace */}
        <button
          type="button"
          onClick={() => { setPin(''); setErrorMsg(''); }}
          className="h-14 rounded-2xl bg-[#F5F6F0] hover:bg-slate-200 border-2 border-[#12161A] shadow-[2.5px_2.5px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-black text-slate-600 transition-all flex items-center justify-center cursor-pointer"
        >
          ล้าง
        </button>

        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="h-14 rounded-2xl bg-white hover:bg-slate-50 active:bg-[#EEF2FF] border-2 border-[#12161A] shadow-[2.5px_2.5px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xl font-mono font-black text-[#12161A] transition-all flex items-center justify-center cursor-pointer"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleDelete}
          aria-label="ลบตัวเลข"
          className="h-14 rounded-2xl bg-[#FFE4E6] hover:bg-[#FECDD3] border-2 border-[#12161A] shadow-[2.5px_2.5px_0px_#12161A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-[#E11D48] transition-all flex items-center justify-center cursor-pointer"
        >
          <Delete size={20} />
        </button>
      </div>

      {/* Switch User Link */}
      <div className="pt-2 border-t border-slate-100 flex justify-center">
        <button
          type="button"
          onClick={onOpenUserModal}
          className="text-xs text-slate-500 hover:text-[#2554FF] font-bold underline transition cursor-pointer"
        >
          ไม่ใช่ {member ? member.name : 'คุณ'}? สลับโปรไฟล์
        </button>
      </div>
    </div>
  );
}
