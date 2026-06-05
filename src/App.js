/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer
} from 'recharts';
import { 
  Home, CreditCard, PiggyBank, Settings, Plus, Check, Trash2, Edit, 
  Filter, X, ShoppingBag, Coffee, Car, Home as HomeIcon, Smartphone,
  Zap, Image as ImageIcon, MessageCircle, ArrowUpRight, ArrowDownRight, Users, Database,
  BookOpen, HeartPulse, ShoppingCart, TrendingUp, Gift, Briefcase, RefreshCw, Cloud, CloudOff,
  MonitorPlay, Gamepad2, Music, Plane, Scissors, Shirt, Baby, FileText, Wrench, Dumbbell, Cat,
  Mail, Send, Undo
} from 'lucide-react';

// ==========================================
// ลิงก์ Web App Google Sheets ที่ถูกต้องของคุณ
// ==========================================
const GAS_URL = "https://script.google.com/macros/s/AKfycbzbO-BbqufnRT6kZ1j8u8PLmhxPM3MSCY_VRZIUOsV6KlGIbGeOAgBVH_7HnVBSvSne/exec"; 

// --- KBank x City-Pop Vibrant Theme Colors ---
const theme = {
  bg: "bg-[#fcfbf7]", // Warm City-Pop Cream Base
  card: "bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100",
  textMain: "text-slate-800",
  textMuted: "text-slate-400",
  primary: "text-[#005a36]", // KBank Dark Green
  primaryBg: "bg-[#00a950]", // KBank Signature Green
  accentPink: "#ff5c93",     // City-Pop Neon Pink
  accentBlue: "#4dabf7",     // City-Pop Sky Blue
  accentOrange: "#ff922b",   // City-Pop Sunset Orange
  button: "bg-[#00a950] hover:bg-[#008f43] text-white shadow-lg shadow-emerald-600/20 rounded-2xl font-bold transition-all active:scale-95 text-sm sm:text-base",
  buttonOutline: "border-2 border-[#00a950] text-[#005a36] hover:bg-emerald-50 rounded-2xl font-bold transition-all text-sm sm:text-base",
  input: "bg-slate-50 border-2 border-slate-100 text-slate-800 focus:border-[#00a950] focus:bg-white rounded-2xl p-3.5 w-full transition-all text-sm sm:text-base outline-none font-medium",
  chartColors: ['#00a950', '#4dabf7', '#ff5c93', '#ff922b', '#7048e8'] 
};

// --- Helper Functions สำหรับจัดการข้อมูลย้อนหลัง (Retroactive Fix) ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
};

// ฟังก์ชันกรองยอดเงินที่แท้จริง (แก้ยอดบวมจากระบบเก่า)
const getDisplayAmount = (exp) => {
  if (exp.paymentType === 'installment' && !exp.isMonthlyAmount) {
    const divisor = parseInt(exp.installmentMonths) || 1;
    return exp.totalAmount / divisor;
  }
  return exp.totalAmount;
};

const getDisplaySplitAmount = (exp, mId) => {
  if (!exp.splitDetails || !exp.splitDetails[mId]) return 0;
  let amt = exp.splitDetails[mId].amount;
  if (exp.paymentType === 'installment' && !exp.isMonthlyAmount) {
    const divisor = parseInt(exp.installmentMonths) || 1;
    return amt / divisor;
  }
  return amt;
};

// Expanded Smart Keywords for City-Pop Icons
const getIconForCategory = (name) => {
  if (!name) return <ImageIcon className="text-slate-300" />;
  const n = name.toLowerCase();
  if (n.includes('shopee') || n.includes('lazada') || n.includes('ช้อป') || n.includes('ออนไลน์') || n.includes('tiktok')) return <ShoppingBag className="text-[#ff922b]" />;
  if (n.includes('line') || n.includes('แชท') || n.includes('ข้อความ')) return <MessageCircle className="text-[#00a950]" />;
  if (n.includes('grab') || n.includes('เดินทาง') || n.includes('รถ') || n.includes('น้ำมัน') || n.includes('taxi') || n.includes('bts') || n.includes('ทางด่วน')) return <Car className="text-[#4dabf7]" />;
  if (n.includes('อาหาร') || n.includes('กิน') || n.includes('ข้าว') || n.includes('เครื่องดื่ม') || n.includes('ขนม') || n.includes('คาเฟ่') || n.includes('กาแฟ')) return <Coffee className="text-[#ff922b]" />;
  if (n.includes('บ้าน') || n.includes('ที่พัก') || n.includes('เช่า') || n.includes('คอนโด') || n.includes('ส่วนกลาง')) return <HomeIcon className="text-[#3b5bdb]" />;
  if (n.includes('เน็ต') || n.includes('โทรศัพท์') || n.includes('มือถือ') || n.includes('รายเดือน') || n.includes('wifi')) return <Smartphone className="text-[#748ffc]" />;
  if (n.includes('ไฟ') || n.includes('น้ำ')) return <Zap className="text-[#fcc419]" />;
  if (n.includes('บัตรเครดิต') || n.includes('บัตร') || n.includes('ผ่อน') || n.includes('หนี้') || n.includes('สินเชื่อ')) return <CreditCard className="text-slate-500" />;
  if (n.includes('ยา') || n.includes('สุขภาพ') || n.includes('พยาบาล') || n.includes('ประกัน') || n.includes('คลินิก')) return <HeartPulse className="text-[#ff6b6b]" />;
  if (n.includes('เรียน') || n.includes('ศึกษา') || n.includes('หนังสือ') || n.includes('คอร์ส')) return <BookOpen className="text-[#15aabf]" />;
  if (n.includes('ของใช้') || n.includes('ซุปเปอร์') || n.includes('ตลาด') || n.includes('โลตัส')) return <ShoppingCart className="text-[#12b886]" />;
  if (n.includes('ลงทุน') || n.includes('ออม') || n.includes('หุ้น') || n.includes('กองทุน')) return <TrendingUp className="text-[#40c057]" />;
  if (n.includes('ของขวัญ') || n.includes('บริจาค') || n.includes('ทำบุญ') || n.includes('วันเกิด')) return <Gift className="text-[#f06595]" />;
  if (n.includes('ทำงาน') || n.includes('ออฟฟิศ') || n.includes('อุปกรณ์') || n.includes('คอม')) return <Briefcase className="text-[#868e96]" />;
  if (n.includes('หนัง') || n.includes('netflix') || n.includes('youtube')) return <MonitorPlay className="text-[#845ef7]" />;
  if (n.includes('เกม') || n.includes('game') || n.includes('เติมเกม')) return <Gamepad2 className="text-[#7048e8]" />;
  if (n.includes('เพลง') || n.includes('spotify')) return <Music className="text-[#ae3ec9]" />;
  if (n.includes('เที่ยว') || n.includes('ทริป') || n.includes('บิน') || n.includes('โรงแรม')) return <Plane className="text-[#22b8cf]" />;
  if (n.includes('สวย') || n.includes('ตัดผม') || n.includes('ทำผม') || n.includes('เครื่องสำอาง')) return <Scissors className="text-[#f783ac]" />;
  if (n.includes('เสื้อ') || n.includes('กางเกง') || n.includes('รองเท้า') || n.includes('กระเป๋า')) return <Shirt className="text-[#da77f2]" />;
  if (n.includes('ลูก') || n.includes('เด็ก') || n.includes('ของเล่น')) return <Baby className="text-[#fcc419]" />;
  if (n.includes('ซ่อม') || n.includes('ล้างรถ') || n.includes('ช่าง')) return <Wrench className="text-[#adb5bd]" />;
  if (n.includes('ฟิตเนส') || n.includes('ออกกำลังกาย') || n.includes('วิ่ง')) return <Dumbbell className="text-[#e8590c]" />;
  if (n.includes('สัตว์เลี้ยง') || n.includes('หมา') || n.includes('แมว')) return <Cat className="text-[#f59f00]" />;
  return <ImageIcon className="text-slate-300" />;
};

// --- Component: Expense Form Modal ---
const ExpenseFormModal = ({ editingExpense, dbData, updateDB, setIsModalOpen, showToast }) => {
  const { expenses, categories, sources, members, savings } = dbData;

  const [formData, setFormData] = useState(editingExpense || {
    title: '', month: new Date().toISOString().slice(0, 7),
    categoryId: categories[0]?.id || '', sourceId: sources[0]?.id || '',
    paymentType: 'normal', totalAmount: '', installmentMonths: '', currentInstallment: '1',
    payerType: 'single', payerId: members[0]?.id || '',
    splitDetails: {}
  });

  const [splitSelection, setSplitSelection] = useState(() => {
    if (editingExpense && editingExpense.payerType === 'split') {
      const sel = {};
      Object.keys(editingExpense.splitDetails).forEach(id => sel[id] = true);
      return sel;
    }
    return {};
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.totalAmount); // นี่คือยอดเต็มที่ผู้ใช้กรอก
    if (isNaN(amount) || amount <= 0) return window.alert("กรุณาใส่จำนวนเงินที่ถูกต้อง");

    let finalData = { ...formData, updatedAt: Date.now() };
    let generatedExpenses = [];
    const groupId = (editingExpense && editingExpense.groupId) ? editingExpense.groupId : Date.now().toString();
    
    let cleanExpenses = expenses;

    if (formData.paymentType === 'installment') {
      const totalMonths = parseInt(formData.installmentMonths);
      if (!totalMonths || totalMonths < 2) return window.alert("จำนวนงวดต้องมากกว่า 1 งวดขึ้นไป");
      
      const monthlyTotalAmount = amount / totalMonths;

      // สร้างข้อมูล Split 
      let splitData = {};
      if (formData.payerType === 'split') {
        const selectedMembers = Object.keys(splitSelection).filter(k => splitSelection[k]);
        if (selectedMembers.length === 0) return window.alert("กรุณาเลือกผู้รับผิดชอบอย่างน้อย 1 คน");
        const monthlyPerPerson = monthlyTotalAmount / selectedMembers.length;
        selectedMembers.forEach(mId => {
          // ถ้ารายการเดิมมีการจ่ายแล้ว ให้จำไว้เฉพาะตอนแก้ไข
          const isPaid = editingExpense?.splitDetails?.[mId]?.paid || false;
          splitData[mId] = { amount: monthlyPerPerson, paid: isPaid };
        });
      }

      if (editingExpense) {
        // [แก้ไขรายการ]: ไม่ออโต้สร้างใหม่ แก้แค่เดือนปัจจุบัน
        cleanExpenses = expenses.filter(e => e.id !== editingExpense.id); // ลบแค่เดือนที่แก้ไข
        finalData.id = editingExpense.id;
        finalData.groupId = editingExpense.groupId || groupId;
        finalData.totalAmount = monthlyTotalAmount;
        finalData.isMonthlyAmount = true;
        finalData.fullTotalAmount = amount;
        finalData.splitDetails = formData.payerType === 'split' ? splitData : undefined;
        finalData.status = editingExpense.status; // คงสถานะการชำระเดิมไว้
        
        if (formData.payerType === 'split') {
           finalData.status = Object.values(splitData).every(v => v.paid) ? 'paid' : 'pending';
        }

        generatedExpenses.push(finalData);
      } else {
        // [สร้างรายการใหม่]: สร้างล่วงหน้าทุกเดือน
        let [editYear, editMonth] = formData.month.split('-').map(Number);
        const currentInst = parseInt(formData.currentInstallment) || 1;
        let baseMonth = editMonth - (currentInst - 1);
        let baseYear = editYear;
        while (baseMonth < 1) { baseMonth += 12; baseYear -= 1; }

        for (let i = 1; i <= totalMonths; i++) {
          let targetMonth = baseMonth + (i - 1);
          let targetYear = baseYear;
          while (targetMonth > 12) { targetMonth -= 12; targetYear += 1; }
          const formattedMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

          // บิลล่วงหน้าต้องรีเซ็ตการจ่ายเป็นยังไม่จ่ายเสมอ
          let futureSplitData = {};
          if (formData.payerType === 'split') {
            Object.keys(splitData).forEach(k => { futureSplitData[k] = { amount: splitData[k].amount, paid: false }; });
          }

          generatedExpenses.push({
            ...finalData,
            id: `${groupId}-${i}`,
            groupId: groupId,
            month: formattedMonth,
            totalAmount: monthlyTotalAmount,
            isMonthlyAmount: true,
            fullTotalAmount: amount,
            installmentMonths: totalMonths,
            currentInstallment: i,
            payerType: formData.payerType,
            payerId: formData.payerType === 'single' ? formData.payerId : undefined,
            splitDetails: formData.payerType === 'split' ? futureSplitData : undefined,
            status: 'pending', 
            createdAt: Date.now() + i
          });
        }
      }
    } else {
      // รายการจ่ายเต็มปกติ
      if (editingExpense) cleanExpenses = expenses.filter(e => e.id !== editingExpense.id);

      delete finalData.installmentMonths;
      delete finalData.currentInstallment;
      finalData.totalAmount = amount;
      
      if (formData.payerType === 'split') {
        const selectedMembers = Object.keys(splitSelection).filter(k => splitSelection[k]);
        if (selectedMembers.length === 0) return window.alert("กรุณาเลือกผู้รับผิดชอบอย่างน้อย 1 คน");
        const amountPerPerson = amount / selectedMembers.length;
        const splitData = {};
        selectedMembers.forEach(mId => {
          splitData[mId] = { amount: amountPerPerson, paid: editingExpense?.splitDetails?.[mId]?.paid || false };
        });
        finalData.splitDetails = splitData;
        finalData.status = Object.values(splitData).every(v => v.paid) ? 'paid' : 'pending';
        delete finalData.payerId;
      } else {
        finalData.status = editingExpense ? editingExpense.status : 'pending';
        delete finalData.splitDetails;
      }
      
      finalData.id = editingExpense ? editingExpense.id : Date.now().toString();
      finalData.createdAt = editingExpense ? editingExpense.createdAt : Date.now();
      generatedExpenses.push(finalData);
    }

    const newExpenses = [...generatedExpenses, ...cleanExpenses];
    showToast(editingExpense ? "อัปเดตรายการเฉพาะเดือนนี้เรียบร้อย" : "เพิ่มรายการและสร้างงวดล่วงหน้าสำเร็จ");

    // --- หักเงินกองกลาง ---
    const newSourceObj = sources.find(s => s.id === formData.sourceId);
    const isNewSourceCentralFund = newSourceObj && newSourceObj.name.includes('กองกลาง');
    let oldAmountDeducted = 0;
    if (editingExpense) {
      const oldSourceObj = sources.find(s => s.id === editingExpense.sourceId);
      if (oldSourceObj && oldSourceObj.name.includes('กองกลาง')) {
        oldAmountDeducted = getDisplayAmount(editingExpense); 
      }
    }
    let newAmountDeducted = 0;
    if (isNewSourceCentralFund) {
      newAmountDeducted = generatedExpenses[0].totalAmount; 
    }

    const netDeduction = newAmountDeducted - oldAmountDeducted;
    let newSavings = savings;

    if (netDeduction !== 0) {
      const newTotal = savings.currentAmount - netDeduction;
      const newTransaction = {
        id: Date.now().toString(),
        type: netDeduction > 0 ? 'deduct' : 'add',
        amount: Math.abs(netDeduction),
        source: `บิล: ${formData.title} ${editingExpense ? '(อัปเดต)' : ''}`,
        date: new Date().toISOString()
      };
      newSavings = { currentAmount: newTotal, transactions: [newTransaction, ...savings.transactions].slice(0, 50) };
    }

    updateDB({ expenses: newExpenses, savings: newSavings });
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className={`bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl p-6 relative max-h-[92dvh] overflow-y-auto custom-scrollbar shadow-2xl animate-slideUp`}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
        <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full"><X size={20} /></button>
        <h2 className={`text-xl sm:text-2xl font-black ${theme.primary} mb-6 border-b-4 border-[#00a950] pb-2 inline-block`}>
          {editingExpense ? 'แก้ไขข้อมูลบิล' : 'บันทึกค่าใช้จ่ายใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">ชื่อรายการ / บิลค่าใช้จ่าย</label>
            <input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className={theme.input} placeholder="เช่น ค่าผ่อนบ้าน, ค่าบัตรเครดิต, ค่าน้ำคู่อาหาร" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                 {formData.paymentType === 'installment' ? 'เดือนประจำรอบของบิลนี้' : 'เดือนประจำรอบ'}
              </label>
              <input type="month" required value={formData.month} onChange={e=>setFormData({...formData, month: e.target.value})} className={theme.input} />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">ยอดรวมเต็มบิล (บาท)</label>
              <input type="number" required 
                value={editingExpense && editingExpense.paymentType === 'installment' && editingExpense.fullTotalAmount ? editingExpense.fullTotalAmount : formData.totalAmount} 
                onChange={e=>setFormData({...formData, totalAmount: e.target.value})} className={theme.input} placeholder="0.00" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">หมวดหมู่</label>
              <select value={formData.categoryId} onChange={e=>setFormData({...formData, categoryId: e.target.value})} className={theme.input} required>
                <option value="">เลือก...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">จ่ายผ่านช่องทาง / บัญชี</label>
              <select value={formData.sourceId} onChange={e=>setFormData({...formData, sourceId: e.target.value})} className={theme.input} required>
                <option value="">เลือก...</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-[#f1f9f6] p-4 rounded-2xl border-2 border-emerald-100/60 space-y-4">
            <div>
              <label className={`block text-xs font-black ${theme.primary} uppercase tracking-wider mb-3`}>ประเภทรูปแบบการจ่าย</label>
              <div className="flex space-x-6">
                <label className="flex items-center text-slate-700 font-bold cursor-pointer text-sm sm:text-base">
                  <input type="radio" name="payType" value="normal" checked={formData.paymentType === 'normal'} onChange={()=>setFormData({...formData, paymentType: 'normal'})} className="mr-2 w-5 h-5 text-[#00a950] focus:ring-[#00a950]" /> จ่ายเต็มจำนวน
                </label>
                <label className="flex items-center text-slate-700 font-bold cursor-pointer text-sm sm:text-base">
                  <input type="radio" name="payType" value="installment" checked={formData.paymentType === 'installment'} onChange={()=>setFormData({...formData, paymentType: 'installment'})} className="mr-2 w-5 h-5 text-[#00a950] focus:ring-[#00a950]" /> ผ่อนชำระรายเดือน
                </label>
              </div>
            </div>
            
            {formData.paymentType === 'installment' && (
              <div className="animate-fadeIn grid grid-cols-2 gap-3 pt-1">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">งวดปัจจุบันที่จ่าย</label>
                    <input type="number" required min="1" max={formData.installmentMonths || "100"} value={formData.currentInstallment || 1} onChange={e=>setFormData({...formData, currentInstallment: e.target.value})} className={theme.input} />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">จำนวนงวดทั้งหมด</label>
                    <input type="number" required min="2" value={formData.installmentMonths} onChange={e=>setFormData({...formData, installmentMonths: e.target.value})} className={theme.input} />
                 </div>
                 {formData.totalAmount && formData.installmentMonths && (
                   <div className="col-span-2 mt-1 bg-white p-3 rounded-xl border border-emerald-100 flex justify-between items-center text-sm font-bold">
                     <span className="text-slate-500">เฉลี่ยตกงวดละ:</span>
                     <span className="text-[#00a950] text-base">{formatCurrency(parseFloat(editingExpense && editingExpense.paymentType === 'installment' && editingExpense.fullTotalAmount ? editingExpense.fullTotalAmount : formData.totalAmount) / parseInt(formData.installmentMonths))} / เดือน</span>
                   </div>
                 )}
              </div>
            )}
          </div>

          <div className="bg-blue-50/40 p-4 rounded-2xl border-2 border-blue-100/60 space-y-4">
             <div>
              <label className={`block text-xs font-black text-blue-900 uppercase tracking-wider mb-3`}>การกระจายความรับผิดชอบ</label>
              <div className="flex space-x-6">
                <label className="flex items-center text-slate-700 font-bold cursor-pointer text-sm sm:text-base">
                  <input type="radio" name="payerType" value="single" checked={formData.payerType === 'single'} onChange={()=>setFormData({...formData, payerType: 'single'})} className="mr-2 w-5 h-5 text-blue-600" /> รับผิดชอบรายบุคคล
                </label>
                <label className="flex items-center text-slate-700 font-bold cursor-pointer text-sm sm:text-base">
                  <input type="radio" name="payerType" value="split" checked={formData.payerType === 'split'} onChange={()=>setFormData({...formData, payerType: 'split'})} className="mr-2 w-5 h-5 text-blue-600" /> แชร์ / หารเท่ากัน
                </label>
              </div>
            </div>

            {formData.payerType === 'single' ? (
              <div className="animate-fadeIn">
                <select value={formData.payerId} onChange={e=>setFormData({...formData, payerId: e.target.value})} className={theme.input} required>
                  <option value="">เลือกผู้จ่ายหลัก...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <p className="text-xs font-black text-slate-500 mb-2">เลือกผู้มีส่วนร่วมหารค่าใช้จ่าย</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {members.map(m => (
                    <label key={m.id} className={`flex items-center p-3 rounded-xl cursor-pointer border-2 transition-all ${splitSelection[m.id] ? 'bg-emerald-50 border-[#00a950] text-[#005a36] font-bold' : 'bg-white border-slate-100 hover:border-emerald-200'}`}>
                      <input type="checkbox" checked={!!splitSelection[m.id]} onChange={(e) => setSplitSelection({...splitSelection, [m.id]: e.target.checked})} className="mr-2 rounded w-4 h-4 text-[#00a950]" /> 
                      <span className="text-sm truncate">{m.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 transition-colors text-sm sm:text-base">ยกเลิก</button>
            <button type="submit" className={theme.button + " px-8"}>บันทึกข้อมูล</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main App Application ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbData, setDbData] = useState({ expenses: [], members: [], categories: [], sources: [], savings: { currentAmount: 0, transactions: [] } });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [filters, setFilters] = useState({ month: new Date().toISOString().slice(0, 7), payer: '', category: '', source: '', paymentType: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedForPay, setSelectedForPay] = useState({});
  const [splitSelectModal, setSplitSelectModal] = useState({ isOpen: false, expId: null, members: [] });

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (!GAS_URL || GAS_URL.includes("ใส่_URL")) {
      const local = localStorage.getItem("moneyPopDB_Sheets");
      if (local) setDbData(JSON.parse(local));
      if (!silent) setIsLoading(false);
      return;
    }
    try {
      if(!silent) setIsSyncing(true);
      // Auto-Sync Cache Buster: บังคับโหลดใหม่ทุกครั้ง ป้องกันมือถือแสดงข้อมูลเก่า
      const res = await fetch(`${GAS_URL}?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data && data.expenses) {
        setDbData(data);
        localStorage.setItem("moneyPopDB_Sheets", JSON.stringify(data)); 
      }
    } catch (e) {
      console.error(e);
      const local = localStorage.getItem("moneyPopDB_Sheets");
      if (local) setDbData(JSON.parse(local));
    }
    setIsLoading(false);
    setIsSyncing(false);
  }, []);

  // ดึงข้อมูลครั้งแรก และตั้งค่า Auto-Sync เมื่อสลับแอปมาใหม่
  useEffect(() => { 
    fetchData(); 
    const handleFocus = () => fetchData(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData]);

  const updateDB = async (newDataFields) => {
    const updatedData = { ...dbData, ...newDataFields };
    setDbData(updatedData); 
    localStorage.setItem("moneyPopDB_Sheets", JSON.stringify(updatedData)); 
    if (!GAS_URL || GAS_URL.includes("ใส่_URL")) return;
    setIsSyncing(true);
    try {
      await fetch(GAS_URL, { method: 'POST', body: JSON.stringify(updatedData), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
    } catch (e) { console.error(e); }
    setIsSyncing(false);
  };

  const { expenses, members, categories, sources, savings } = dbData;

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 3000); };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (filters.month && exp.month !== filters.month) return false;
      if (filters.category && exp.categoryId !== filters.category) return false;
      if (filters.source && exp.sourceId !== filters.source) return false;
      if (filters.paymentType && exp.paymentType !== filters.paymentType) return false;
      if (filters.payer) {
        if (exp.payerType === 'single' && exp.payerId !== filters.payer) return false;
        if (exp.payerType === 'split' && (!exp.splitDetails || !exp.splitDetails[filters.payer])) return false;
      }
      return true;
    });
  }, [expenses, filters]);

  const handleCheckExpense = (expense) => {
    if (selectedForPay[expense.id]) {
      const newSelected = { ...selectedForPay };
      delete newSelected[expense.id];
      setSelectedForPay(newSelected);
    } else {
      const amt = getDisplayAmount(expense);
      if (expense.payerType === 'single') {
        setSelectedForPay({ ...selectedForPay, [expense.id]: { amount: amt, type: 'single' } });
      } else {
        const unpaidMembers = Object.keys(expense.splitDetails).filter(mId => !expense.splitDetails[mId].paid);
        if (unpaidMembers.length === 0) return; 
        setSplitSelectModal({ isOpen: true, expId: expense.id, expenseData: expense, selectedMembers: unpaidMembers.length === 1 ? unpaidMembers : [], availableMembers: unpaidMembers });
      }
    }
  };

  const confirmSplitSelection = () => {
    const { expId, selectedMembers, expenseData } = splitSelectModal;
    if (selectedMembers.length === 0) { setSplitSelectModal({ isOpen: false, expId: null, members: [] }); return; }
    let amountToPay = 0;
    
    selectedMembers.forEach(mId => { 
      amountToPay += getDisplaySplitAmount(expenseData, mId); 
    });

    setSelectedForPay({
      ...selectedForPay,
      [expId]: { amount: amountToPay, type: 'split', memberIds: selectedMembers }
    });
    setSplitSelectModal({ isOpen: false, expId: null, members: [] });
  };

  const processBulkPayment = () => {
    const newExpenses = expenses.map(expense => {
      if (!selectedForPay[expense.id]) return expense; 
      const payData = selectedForPay[expense.id];
      const newExpense = { ...expense };
      if (payData.type === 'single') {
        newExpense.status = 'paid';
      } else if (payData.type === 'split') {
        const newSplitDetails = { ...newExpense.splitDetails };
        payData.memberIds.forEach(mId => { newSplitDetails[mId].paid = true; });
        newExpense.splitDetails = newSplitDetails;
        newExpense.status = Object.values(newSplitDetails).every(v => v.paid) ? 'paid' : 'pending';
      }
      return newExpense;
    });
    updateDB({ expenses: newExpenses });
    setSelectedForPay({});
    showToast("บันทึกการชำระเงินเรียบร้อย");
  };

  const undoPayment = (expense) => {
    if(window.confirm("ต้องการยกเลิกสถานะการจ่ายเงินของบิลนี้ใช่หรือไม่?")) {
      const newExpense = { ...expense };
      if (newExpense.payerType === 'single') {
        newExpense.status = 'pending';
      } else if (newExpense.payerType === 'split') {
        const newSplitDetails = { ...newExpense.splitDetails };
        if (filters.payer) {
          newSplitDetails[filters.payer].paid = false;
        } else {
          Object.keys(newSplitDetails).forEach(mId => { newSplitDetails[mId].paid = false; });
        }
        newExpense.splitDetails = newSplitDetails;
        newExpense.status = 'pending';
      }
      updateDB({ expenses: expenses.map(e => e.id === expense.id ? newExpense : e) });
      
      const newSelected = { ...selectedForPay };
      delete newSelected[expense.id];
      setSelectedForPay(newSelected);
      
      showToast("ย้อนสถานะเป็นรอชำระสำเร็จ");
    }
  };

  const deleteExpense = (id, groupId) => {
    const isGroup = groupId && window.confirm("คุณต้องการลบบิลผ่อนชำระนี้ 'ทุกงวดที่เหลือในอนาคต' ด้วยใช่ไหม? \n(หากเลือก Cancel จะลบแค่บิลของเดือนนี้)");
    let newExpenses = expenses;
    if (isGroup) {
      newExpenses = expenses.filter(e => e.groupId !== groupId);
      showToast("ลบชุดรายการผ่อนชำระล่วงหน้าทั้งหมดเรียบร้อย");
    } else {
      newExpenses = expenses.filter(e => e.id !== id);
      showToast("ลบรายการบิลเดือนนี้สำเร็จ");
    }
    updateDB({ expenses: newExpenses });
  };

  const selectedTotalAmount = Object.values(selectedForPay).reduce((sum, item) => sum + item.amount, 0);

  // --- Views ---
  const renderDashboard = () => {
    let totalPaid = 0;
    let totalPending = 0;
    const categoryDataMap = {};
    const memberDataMap = {};

    filteredExpenses.forEach(exp => {
      const catName = categories.find(c => c.id === exp.categoryId)?.name || 'ทั่วไป';
      let amountConsidered = getDisplayAmount(exp); // ใช้ฟังก์ชัน Retroactive แก้บั๊กยอดบวมแล้ว
      let isPaidConsidered = exp.status === 'paid';

      if (exp.payerType === 'split') {
        if (filters.payer) {
          if (exp.splitDetails && exp.splitDetails[filters.payer]) {
            amountConsidered = getDisplaySplitAmount(exp, filters.payer);
            isPaidConsidered = exp.splitDetails[filters.payer].paid;
          } else { return; } 
        } else {
          let localPaid = 0;
          let localPending = 0;
          Object.keys(exp.splitDetails || {}).forEach(mId => {
            const v = exp.splitDetails[mId];
            const actualAmt = getDisplaySplitAmount(exp, mId);
            if (v.paid) localPaid += actualAmt;
            else localPending += actualAmt;
          });
          totalPaid += localPaid;
          totalPending += localPending;
          if (!categoryDataMap[catName]) categoryDataMap[catName] = 0;
          categoryDataMap[catName] += (localPaid + localPending);
          return;
        }
      }

      if (isPaidConsidered) totalPaid += amountConsidered;
      else totalPending += amountConsidered;

      if (!categoryDataMap[catName]) categoryDataMap[catName] = 0;
      categoryDataMap[catName] += amountConsidered;

      if (!filters.payer) {
        if (exp.payerType === 'single') {
          const mName = members.find(m => m.id === exp.payerId)?.name || 'ไม่ระบุ';
          if (!memberDataMap[mName]) memberDataMap[mName] = 0;
          memberDataMap[mName] += amountConsidered;
        } else {
          Object.keys(exp.splitDetails || {}).forEach(mId => {
            const mName = members.find(m => m.id === mId)?.name || 'ไม่ระบุ';
            if (!memberDataMap[mName]) memberDataMap[mName] = 0;
            memberDataMap[mName] += getDisplaySplitAmount(exp, mId);
          });
        }
      }
    });

    const pieData = [{ name: 'จ่ายแล้วในเดือน', value: totalPaid, color: '#00a950' }, { name: 'ยังไม่จ่ายค้างรอบ', value: totalPending, color: '#ff5c93' }];
    const catData = Object.keys(categoryDataMap).map(k => ({ name: k, value: categoryDataMap[k] }));
    const memData = Object.keys(memberDataMap).map(k => ({ name: k, value: memberDataMap[k] }));
    const grandTotal = totalPaid + totalPending;

    return (
      <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-6">
        {renderFilters()}
        <div className="px-4 sm:px-0 flex flex-col gap-4 sm:gap-5">
          {/* KBank Premium Dashboard Card Banner */}
          <div className={`${theme.card} p-5 sm:p-6 bg-gradient-to-br from-[#005a36] to-[#008f43] text-white shadow-xl relative overflow-hidden rounded-[2rem]`}>
            <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-white/5 blur-xl"></div>
            <div className="absolute right-12 bottom-2 w-32 h-32 rounded-full bg-emerald-400/10 blur-lg"></div>
            
            <div className="w-full md:w-7/12 flex flex-col justify-between relative z-10">
              <div>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">สรุปค่าใช้จ่ายจริงประจำรอบเดือนนี้</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">{formatCurrency(grandTotal)}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/95 text-slate-800 p-3 sm:p-4 rounded-2xl border-b-4 border-[#00a950]">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">ชำระแล้วในเดือน</p>
                  <p className="text-base sm:text-xl font-black text-[#005a36] mt-0.5 truncate">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="bg-white/95 text-slate-800 p-3 sm:p-4 rounded-2xl border-b-4 border-[#ff5c93]">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">ยอดคงเหลือรอจ่าย</p>
                  <p className="text-base sm:text-xl font-black text-[#ff5c93] mt-0.5 truncate">{formatCurrency(totalPending)}</p>
                </div>
              </div>
            </div>

            {/* City-Pop Donut Pie Chart Accent */}
            <div className="w-full md:w-5/12 hidden md:flex items-center justify-center min-h-[180px]">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <RechartsTooltip formatter={(v)=>formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className={`${theme.card} p-5 flex flex-col min-h-[280px]`}>
              <h3 className={`text-sm font-black ${theme.primary} mb-4 flex items-center shrink-0 border-b-2 border-slate-100 pb-2`}><ShoppingBag size={18} className="mr-2 text-[#4dabf7]"/> สัดส่วนตามหมวดหมู่บิล</h3>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} width={80} className="font-bold text-slate-600" />
                    <RechartsTooltip cursor={{fill: '#f8f9fa'}} formatter={(val) => formatCurrency(val)} />
                    <Bar dataKey="value" fill="#00a950" radius={[0, 8, 8, 0]} barSize={16}>
                      {catData.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={theme.chartColors[idx % theme.chartColors.length]} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {!filters.payer && (
              <div className={`${theme.card} p-5 flex flex-col min-h-[280px]`}>
                <h3 className={`text-sm font-black ${theme.primary} mb-2 flex items-center shrink-0 border-b-2 border-slate-100 pb-2`}><Users size={18} className="mr-2 text-[#ff5c93]"/> ยอดรับผิดชอบแยกรายคน</h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={memData} innerRadius={50} outerRadius={75} dataKey="value" stroke="#fff" strokeWidth={3}>
                        {memData.map((entry, index) => (<Cell key={`cell-${index}`} fill={theme.chartColors[index % theme.chartColors.length]} />))}
                      </Pie>
                      <RechartsTooltip formatter={(v)=>formatCurrency(v)} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white px-4 py-3 sm:rounded-2xl border-b-2 border-slate-100 mb-4 sm:mb-6 flex overflow-x-auto custom-scrollbar gap-3 hide-scrollbar snap-x">
      <div className="flex items-center space-x-2 text-[#00a950] font-black shrink-0 snap-start pl-2"><Filter size={20} /></div>
      <div className="shrink-0 snap-start"><input type="month" value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} className="bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#00a950] focus:bg-white outline-none transition-all" /></div>
      <div className="shrink-0 snap-start"><select value={filters.payer} onChange={e => setFilters({...filters, payer: e.target.value})} className="bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#00a950] focus:bg-white outline-none transition-all"><option value="">👤 ทุกคน</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
      <div className="shrink-0 snap-start"><select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#00a950] focus:bg-white outline-none transition-all"><option value="">📁 ทุกหมวด</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="shrink-0 snap-start pr-4 sm:pr-0"><select value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})} className="bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#00a950] focus:bg-white outline-none transition-all"><option value="">💳 ทุกบัญชี</option>{sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
    </div>
  );

  const renderExpensesList = () => {
    return (
      <div className="space-y-4 animate-fadeIn pb-6">
        <div className="px-4 sm:px-0 flex justify-between items-end mb-2 pt-2">
          <div>
            <h2 className={`text-2xl font-black ${theme.primary}`}>รายการบิลทั้งหมด</h2>
            <p className="text-slate-400 text-xs sm:text-sm font-bold">{filteredExpenses.length} รายการในรอบเดือนนี้</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsEmailModalOpen(true)} className="bg-emerald-50 text-[#005a36] hover:bg-emerald-100 px-4 py-2.5 rounded-2xl flex items-center space-x-1.5 transition-all text-sm font-bold border border-emerald-200">
              <Mail size={16} /> <span className="hidden sm:inline">แจ้งเมลสรุปยอด</span>
            </button>
            <button onClick={() => { setEditingExpense(null); setIsModalOpen(true); }} className={`${theme.button} px-4 py-2.5 rounded-2xl flex items-center space-x-1.5`}>
              <Plus size={18} /> <span>เพิ่มบิล</span>
            </button>
          </div>
        </div>

        {renderFilters()}

        {Object.keys(selectedForPay).length > 0 && (
          <div className="sticky top-2 z-40 mx-4 sm:mx-0 bg-white p-4 rounded-2xl border-2 border-[#00a950] shadow-xl flex justify-between items-center mb-4 animate-slideUp">
            <div>
              <span className="text-emerald-600 text-xs font-black uppercase tracking-wide">มัดรวมเพื่อจ่าย ({Object.keys(selectedForPay).length} บิล)</span>
              <p className="text-slate-800 text-xl font-black">{formatCurrency(selectedTotalAmount)}</p>
            </div>
            <button onClick={processBulkPayment} className={`${theme.button} px-6 py-3 rounded-xl`}>ยืนยันชำระเงิน</button>
          </div>
        )}

        <div className="px-4 sm:px-0 grid gap-3.5">
          {filteredExpenses.map(exp => {
            const cat = categories.find(c => c.id === exp.categoryId);
            const source = sources.find(s => s.id === exp.sourceId);
            
            let displayAmount = getDisplayAmount(exp);
            let displayStatus = exp.status;
            let isPartiallyPaid = false;

            if (exp.payerType === 'split') {
               if (filters.payer) {
                 displayAmount = getDisplaySplitAmount(exp, filters.payer);
                 displayStatus = exp.splitDetails[filters.payer].paid ? 'paid' : 'pending';
               } else {
                 const allPaid = Object.values(exp.splitDetails || {}).every(v => v.paid);
                 const somePaid = Object.values(exp.splitDetails || {}).some(v => v.paid);
                 if (somePaid && !allPaid) isPartiallyPaid = true;
               }
            }

            const isChecked = !!selectedForPay[exp.id];
            const showAsPaid = displayStatus === 'paid';

            return (
              <div key={exp.id} className={`${theme.card} p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all duration-300 ${showAsPaid ? 'opacity-60 bg-slate-50 border-dashed shadow-none' : isChecked ? 'ring-2 ring-[#00a950] border-transparent bg-emerald-50/20' : 'hover:border-emerald-200'}`}>
                <div className="flex items-start sm:items-center w-full sm:w-auto">
                  {!showAsPaid && (
                    <div className="mr-3 sm:mr-4 mt-1 sm:mt-0">
                      <input type="checkbox" checked={isChecked} onChange={() => handleCheckExpense(exp)} className="w-5 h-5 rounded-md border-slate-300 text-[#00a950] focus:ring-[#00a950] cursor-pointer" />
                    </div>
                  )}
                  <div className={`p-3.5 rounded-2xl mr-3 sm:mr-4 flex-shrink-0 ${showAsPaid ? 'bg-slate-100' : 'bg-white shadow-sm border border-slate-100'}`}>
                    {getIconForCategory(cat?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`font-black text-base sm:text-lg truncate ${showAsPaid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{exp.title}</h3>
                      {exp.paymentType === 'installment' && (
                        <span className="text-[10px] bg-emerald-50 text-[#005a36] px-2.5 py-0.5 rounded-full font-black border border-emerald-200">
                          งวด {exp.currentInstallment}/{exp.installmentMonths}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap text-xs font-bold text-slate-400 gap-x-2 gap-y-1">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{cat?.name || 'ทั่วไป'}</span>
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">{source?.name || 'เงินสด'}</span>
                      {exp.payerType === 'split' && !filters.payer && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">หารเท่ากัน {Object.keys(exp.splitDetails || {}).length} คน</span>}
                    </div>

                    {exp.payerType === 'split' && !filters.payer && (
                      <div className="mt-3 text-xs space-y-1.5 border-t border-slate-100 pt-2 w-full sm:max-w-xs">
                        {Object.entries(exp.splitDetails || {}).map(([mId, detail]) => {
                          const m = members.find(mbr => mbr.id === mId);
                          return (
                            <div key={mId} className={`flex items-center justify-between ${detail.paid ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}>
                              <span className="truncate pr-2">• {m?.name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span>{formatCurrency(getDisplaySplitAmount(exp, mId))}</span>
                                {detail.paid ? <Check size={14} className="bg-emerald-100 text-[#005a36] rounded-full p-0.5"/> : <span className="text-[9px] bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded font-black">ยังไม่จ่าย</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-end items-center sm:items-end border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                  <div className={`text-lg sm:text-xl font-black ${showAsPaid ? 'text-slate-400' : 'text-slate-800'}`}>
                    {formatCurrency(displayAmount)}
                  </div>
                  <div className="flex items-center space-x-1.5 mt-1 sm:mt-1.5">
                    {showAsPaid ? (
                      <span className="text-[#005a36] text-xs font-black flex items-center bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"><Check size={12} className="mr-1 stroke-[3]"/> ชำระแล้ว</span>
                    ) : isPartiallyPaid ? (
                      <span className="text-amber-700 text-xs font-black bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">ชำระบางส่วน</span>
                    ) : (
                      <span className="text-rose-600 text-xs font-black bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">รอชำระ</span>
                    )}

                    {(showAsPaid || isPartiallyPaid) && (
                      <button onClick={() => undoPayment(exp)} className="p-1.5 text-slate-400 hover:text-amber-600 bg-slate-50 rounded-xl transition-all" title="ดึงกลับเป็นค้างชำระ">
                        <Undo size={15} />
                      </button>
                    )}
                    <button onClick={() => { setEditingExpense(exp); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-[#00a950] bg-slate-50 rounded-xl transition-all"><Edit size={15} /></button>
                    <button onClick={() => deleteExpense(exp.id, exp.groupId)} className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-xl transition-all"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredExpenses.length === 0 && (
             <div className="text-center p-12 text-slate-400 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 mx-4 sm:mx-0 font-medium">
               <ShoppingBag size={32} className="mx-auto mb-3 text-slate-300" />
               ไม่มีบิลค่าใช้จ่ายที่เรียกเก็บในเดือนนี้
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderSavings = () => { 
    const handleSaveFund = (e) => {
      e.preventDefault();
      if (!savingsAmount || isNaN(savingsAmount)) return;
      const val = parseFloat(savingsAmount);
      const newTotal = savingsType === 'add' ? savings.currentAmount + val : savings.currentAmount - val;
      const newTransaction = { id: Date.now().toString(), type: savingsType, amount: val, source: savingsSource || 'ไม่ระบุ', date: new Date().toISOString() };
      updateDB({ savings: { currentAmount: newTotal, transactions: [newTransaction, ...savings.transactions].slice(0, 50) } });
      setSavingsAmount(''); setSavingsSource(''); showToast('บันทึกยอดเงินคลังกองกลางเรียบร้อย');
    };

    return (
      <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-6 px-4 sm:px-0">
        <div className={`${theme.card} p-8 text-center bg-gradient-to-br from-[#005a36] to-[#12b886] text-white rounded-[2rem] shadow-lg relative overflow-hidden`}>
           <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner"><PiggyBank size={32} className="text-white" /></div>
           <h2 className="text-emerald-100 text-xs font-black uppercase tracking-widest mb-0.5">เงินกองกลางครอบครัวคงเหลือ</h2>
           <p className="text-4xl sm:text-5xl font-black tracking-tight">{formatCurrency(savings.currentAmount)}</p>
        </div>
        <div className={`${theme.card} p-5`}>
          <h3 className={`text-base font-black ${theme.primary} mb-4 flex items-center border-b-2 border-slate-50 pb-2`}><Edit size={16} className="mr-2 text-[#00a950]"/> บันทึกความเคลื่อนไหวกองกลาง</h3>
          <form onSubmit={handleSaveFund} className="flex flex-col gap-3.5">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-black transition-colors ${savingsType === 'add' ? 'bg-white shadow-sm text-[#005a36]' : 'text-slate-400 hover:text-slate-600'}`}><input type="radio" name="savType" value="add" checked={savingsType === 'add'} onChange={()=>setSavingsType('add')} className="hidden" /> ฝากเพิ่มเข้าคลัง (+)</label>
              <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-black transition-colors ${savingsType === 'deduct' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-400 hover:text-slate-600'}`}><input type="radio" name="savType" value="deduct" checked={savingsType === 'deduct'} onChange={()=>setSavingsType('deduct')} className="hidden" /> ถอนออกไปใช้ (-)</label>
            </div>
            <div className="relative"><span className="absolute left-4 top-3.5 text-slate-400 font-black">฿</span><input type="number" placeholder="0.00" value={savingsAmount} onChange={e=>setSavingsAmount(e.target.value)} className={`${theme.input} pl-9 text-lg font-black`} required /></div>
            <input type="text" placeholder="ระบุเหตุผล / ที่มาเงินคลัง..." value={savingsSource} onChange={e=>setSavingsSource(e.target.value)} className={theme.input} required />
            <button type="submit" className={theme.button + " py-3.5"}>ยืนยันทำรายการ</button>
          </form>
        </div>
      </div>
    );
  };

  const renderEmailModal = () => {
    if (!isEmailModalOpen) return null;
    return <EmailNotifyModal expenses={expenses} members={members} setIsOpen={setIsEmailModalOpen} showToast={showToast} />;
  };

  const renderNavigation = () => (
    <nav className="bg-white border-t-2 border-slate-100 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 px-4 sticky bottom-0 z-40 shrink-0 sm:top-0 sm:bottom-auto sm:border-b-2 sm:border-t-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
      <div className="flex space-x-2 w-full justify-around max-w-lg mx-auto sm:max-w-none sm:justify-start">
        {[
          { id: 'dashboard', icon: <Home size={22}/>, label: 'ภาพรวม' },
          { id: 'expenses', icon: <CreditCard size={22}/>, label: 'บิล' },
          { id: 'savings', icon: <PiggyBank size={22}/>, label: 'กองกลาง' },
          { id: 'settings', icon: <Settings size={22}/>, label: 'ตั้งค่า' }
        ].map(item => {
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-14 sm:flex-row sm:w-auto sm:px-6 sm:py-2 sm:rounded-2xl transition-all duration-300 ${isActive ? 'text-[#005a36] sm:bg-[#00a950] sm:text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`mb-1 sm:mb-0 sm:mr-2 ${isActive ? 'scale-110 sm:scale-100 transition-transform' : ''}`}>{item.icon}</div>
              <span className={`text-[10px] sm:text-sm font-black tracking-wide ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  );

  const renderSplitPaySelectModal = () => {
    if (!splitSelectModal.isOpen) return null;
    const { expenseData, selectedMembers, availableMembers } = splitSelectModal;

    const toggleMember = (mId) => {
      const isSelected = selectedMembers.includes(mId);
      if (isSelected) {
        setSplitSelectModal({...splitSelectModal, selectedMembers: selectedMembers.filter(id => id !== mId)});
      } else {
        setSplitSelectModal({...splitSelectModal, selectedMembers: [...selectedMembers, mId]});
      }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 text-center shadow-2xl animate-slideUp">
           <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
           <h3 className={`text-lg font-black ${theme.primary} mb-1`}>ระบุสมาชิกที่ต้องการจ่าย</h3>
           <p className="text-slate-400 text-xs font-bold mb-4">บิล: "{expenseData.title}"</p>
           
           <div className="space-y-2 mb-6 text-left">
             {availableMembers.map(mId => {
               const m = members.find(mbr => mbr.id === mId);
               const amount = getDisplaySplitAmount(expenseData, mId);
               const isSelected = selectedMembers.includes(mId);
               return (
                 <div key={mId} onClick={() => toggleMember(mId)} className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'bg-emerald-50 border-[#00a950] shadow-sm' : 'bg-white border-slate-100 hover:border-emerald-200'}`}>
                   <div className="flex items-center gap-2.5">
                     <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-[#00a950] border-[#00a950]' : 'border-slate-300'}`}>
                        {isSelected && <Check size={14} className="text-white stroke-[3]"/>}
                     </div>
                     <span className={`text-sm font-bold ${isSelected ? 'text-[#005a36]' : 'text-slate-700'}`}>{m?.name}</span>
                   </div>
                   <span className="text-sm font-black text-slate-700">{formatCurrency(amount)}</span>
                 </div>
               )
             })}
           </div>

           <div className="flex gap-2.5">
             <button onClick={() => setSplitSelectModal({isOpen: false, expId: null, members: []})} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-600 text-sm">ยกเลิก</button>
             <button onClick={confirmSplitSelection} disabled={selectedMembers.length === 0} className={`flex-1 py-3 font-bold rounded-xl text-sm ${selectedMembers.length > 0 ? theme.button : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>ยืนยันเลือกบิล</button>
           </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="min-h-[100dvh] bg-[#fcfbf7] flex items-center justify-center text-[#005a36] font-black animate-pulse text-lg">MONEY-POP กำลังโหลดข้อมูลคลาวด์...</div>;

  return (
    <div className={`min-h-[100dvh] ${theme.bg} font-sans selection:bg-emerald-100`}>
      <div className="max-w-md sm:max-w-3xl lg:max-w-4xl mx-auto flex flex-col h-[100dvh] overflow-hidden bg-[#fcfbf7] sm:border-x sm:border-slate-200/60 sm:shadow-2xl relative">
        
        {/* KBank Hybrid Header Style with City-Pop Glow Text */}
        <header className="bg-white px-4 sm:px-6 py-4 flex justify-between items-center border-b-2 border-[#00a950] shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="bg-[#005a36] text-white p-1.5 rounded-xl shadow-md"><Zap size={20} className="fill-emerald-400 text-emerald-400" /></div>
            <div className="text-xl sm:text-2xl font-black tracking-tighter text-[#005a36]">MONEY<span className="text-[#ff5c93]">-POP</span></div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => fetchData(true)} className="p-2 text-slate-400 hover:text-[#00a950] hover:bg-slate-50 rounded-full transition-colors"><RefreshCw size={18} className={isSyncing ? "animate-spin text-[#00a950]" : ""} /></button>
             <div className="hidden sm:inline-flex bg-emerald-50 text-[#005a36] text-xs font-black px-3 py-1.5 rounded-full border border-emerald-100">KBank Cloud Synced</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto sm:p-5 pb-24 custom-scrollbar relative">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'expenses' && renderExpensesList()}
          {activeTab === 'savings' && renderSavings()}
          {activeTab === 'settings' && <div className="space-y-5 animate-fadeIn pb-6 px-4 sm:px-0"><h2 className={`text-xl font-black ${theme.primary} pt-2`}>จัดการการตั้งค่าระบบ</h2><MemberManager data={members} updateDB={updateDB} /><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><ListManager title="หมวดหมู่ค่าใช้จ่าย" data={categories} updateDB={updateDB} dataKey="categories" isCategory={true} /><ListManager title="ช่องทางการจ่าย / บัญชี" data={sources} updateDB={updateDB} dataKey="sources" /></div></div>}
        </main>

        {/* Fixed Menu Bar Fix for Mobile Screen Overlapping */}
        {renderNavigation()}
      </div>

      {isModalOpen && <ExpenseFormModal editingExpense={editingExpense} dbData={dbData} updateDB={updateDB} setIsModalOpen={setIsModalOpen} showToast={showToast} />}
      {renderEmailModal()}
      {renderSplitPaySelectModal()}

      {toastMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3.5 rounded-full shadow-2xl font-black text-sm flex items-center border border-slate-700 whitespace-nowrap animate-slideDown">
          <Check size={18} className="mr-2 text-emerald-400" />{toastMessage}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #00a950; border-radius: 10px; } .hide-scrollbar::-webkit-scrollbar { display: none; } .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; } .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`}} />
    </div>
  );
}