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
  MonitorPlay, Gamepad2, Music, Plane, Scissors, Shirt, Baby, FileText, Wrench, Dumbbell, Cat
} from 'lucide-react';

// ==========================================
// 1. นำ URL Web App ของ Google Sheet มาใส่ตรงนี้
// ==========================================
const GAS_URL = "ใส่_URL_WEB_APP_ของ_GOOGLE_SHEET_ที่นี่"; 

// --- Modern Banking Theme Colors (Light Theme) ---
const theme = {
  bg: "bg-slate-50", 
  card: "bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100",
  textMain: "text-slate-800",
  textMuted: "text-slate-500",
  primary: "text-blue-800",
  primaryBg: "bg-blue-800",
  accent: "text-blue-600",
  button: "bg-blue-800 hover:bg-blue-900 text-white shadow-md rounded-xl font-bold transition-all active:scale-95",
  buttonOutline: "border border-blue-200 text-blue-800 hover:bg-blue-50 rounded-xl font-bold transition-all",
  input: "bg-slate-50 border border-slate-200 text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl p-3 w-full transition-all text-sm sm:text-base outline-none",
  chartColors: ['#1e40af', '#3b82f6', '#f59e0b', '#ec4899', '#10b981'] 
};

// --- Helper Functions ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
};

// Map keywords to specific icons (Expanded Database)
const getIconForCategory = (name) => {
  const n = name.toLowerCase();
  
  // ซื้อของ / ช้อปปิ้งออนไลน์
  if (n.includes('shopee') || n.includes('lazada') || n.includes('ช้อป') || n.includes('ออนไลน์') || n.includes('tiktok')) return <ShoppingBag className="text-orange-500" />;
  // การสื่อสาร
  if (n.includes('line') || n.includes('แชท') || n.includes('ข้อความ')) return <MessageCircle className="text-green-500" />;
  // เดินทาง
  if (n.includes('grab') || n.includes('เดินทาง') || n.includes('รถ') || n.includes('น้ำมัน') || n.includes('taxi') || n.includes('bts') || n.includes('mrt') || n.includes('ทางด่วน') || n.includes('วิน')) return <Car className="text-emerald-500" />;
  // อาหาร
  if (n.includes('อาหาร') || n.includes('กิน') || n.includes('ข้าว') || n.includes('เครื่องดื่ม') || n.includes('ขนม') || n.includes('บุฟเฟ่ต์') || n.includes('คาเฟ่') || n.includes('กาแฟ')) return <Coffee className="text-amber-500" />;
  // บ้าน / ที่พักอาศัย
  if (n.includes('บ้าน') || n.includes('ที่พัก') || n.includes('เช่า') || n.includes('คอนโด') || n.includes('ส่วนกลาง') || n.includes('เฟอร์นิเจอร์')) return <HomeIcon className="text-blue-500" />;
  // เทคโนโลยี / โทรศัพท์
  if (n.includes('เน็ต') || n.includes('โทรศัพท์') || n.includes('มือถือ') || n.includes('รายเดือน') || n.includes('wifi') || n.includes('อินเทอร์เน็ต')) return <Smartphone className="text-indigo-500" />;
  // สาธารณูปโภค
  if (n.includes('ไฟ') || n.includes('น้ำ') || n.includes('แก๊ส')) return <Zap className="text-yellow-500" />;
  // การเงิน / สินเชื่อ
  if (n.includes('บัตรเครดิต') || n.includes('บัตร') || n.includes('ผ่อน') || n.includes('หนี้') || n.includes('สินเชื่อ') || n.includes('ดอกเบี้ย')) return <CreditCard className="text-slate-600" />;
  // สุขภาพ / ประกัน
  if (n.includes('ยา') || n.includes('สุขภาพ') || n.includes('พยาบาล') || n.includes('หาหมอ') || n.includes('ประกัน') || n.includes('คลินิก') || n.includes('วิตามิน')) return <HeartPulse className="text-rose-500" />;
  // การศึกษา
  if (n.includes('เรียน') || n.includes('ศึกษา') || n.includes('หนังสือ') || n.includes('โรงเรียน') || n.includes('คอร์ส') || n.includes('อบรม')) return <BookOpen className="text-cyan-500" />;
  // ของใช้ในบ้าน
  if (n.includes('ของใช้') || n.includes('ซุปเปอร์') || n.includes('ตลาด') || n.includes('แม็คโคร') || n.includes('โลตัส') || n.includes('สบู่') || n.includes('แชมพู')) return <ShoppingCart className="text-teal-500" />;
  // การลงทุน
  if (n.includes('ลงทุน') || n.includes('ออม') || n.includes('หุ้น') || n.includes('กองทุน') || n.includes('คริปโต') || n.includes('ทอง')) return <TrendingUp className="text-emerald-600" />;
  // ให้คนอื่น / ทำบุญ
  if (n.includes('ของขวัญ') || n.includes('บริจาค') || n.includes('ทำบุญ') || n.includes('ซอง') || n.includes('งานแต่ง') || n.includes('วันเกิด') || n.includes('ให้พ่อแม่')) return <Gift className="text-pink-500" />;
  // งาน / อาชีพ
  if (n.includes('ทำงาน') || n.includes('ออฟฟิศ') || n.includes('อุปกรณ์') || n.includes('คอมพิวเตอร์')) return <Briefcase className="text-amber-700" />;
  
  // --- เพิ่มเติมฐานข้อมูลไอคอนอัจฉริยะ ---
  // บันเทิง / หนัง
  if (n.includes('หนัง') || n.includes('netflix') || n.includes('youtube') || n.includes('ดูหนัง') || n.includes('โรงหนัง') || n.includes('disney')) return <MonitorPlay className="text-purple-500" />;
  // เกมส์
  if (n.includes('เกม') || n.includes('game') || n.includes('เติมเกม') || n.includes('ps5') || n.includes('nintendo') || n.includes('steam')) return <Gamepad2 className="text-violet-500" />;
  // เพลง / คอนเสิร์ต
  if (n.includes('เพลง') || n.includes('spotify') || n.includes('apple music') || n.includes('คอนเสิร์ต') || n.includes('ดนตรี')) return <Music className="text-fuchsia-500" />;
  // ท่องเที่ยว
  if (n.includes('เที่ยว') || n.includes('ทริป') || n.includes('ตั๋วเครื่องบิน') || n.includes('บิน') || n.includes('โรงแรม') || n.includes('พักผ่อน') || n.includes('ทัวร์')) return <Plane className="text-sky-500" />;
  // ความงาม / สปา
  if (n.includes('สวย') || n.includes('งาม') || n.includes('ตัดผม') || n.includes('ทำผม') || n.includes('เครื่องสำอาง') || n.includes('สกินแคร์') || n.includes('นวด') || n.includes('สปา') || n.includes('เล็บ')) return <Scissors className="text-pink-400" />;
  // แฟชั่น / เสื้อผ้า
  if (n.includes('เสื้อ') || n.includes('กางเกง') || n.includes('รองเท้า') || n.includes('กระเป๋า') || n.includes('ชุด') || n.includes('แฟชั่น') || n.includes('เครื่องประดับ')) return <Shirt className="text-fuchsia-400" />;
  // เด็ก / ครอบครัว
  if (n.includes('ลูก') || n.includes('เด็ก') || n.includes('ของเล่น') || n.includes('แพมเพิส') || n.includes('นมผง') || n.includes('ครอบครัว')) return <Baby className="text-yellow-500" />;
  // ภาษี / ค่าธรรมเนียม
  if (n.includes('ภาษี') || n.includes('ค่าธรรมเนียม') || n.includes('ค่าปรับ') || n.includes('ต่อภาษี')) return <FileText className="text-slate-500" />;
  // ซ่อมแซม / บำรุงรักษา
  if (n.includes('ซ่อม') || n.includes('ยาง') || n.includes('ล้างรถ') || n.includes('อะไหล่') || n.includes('บำรุงรักษา') || n.includes('ช่าง')) return <Wrench className="text-slate-600" />;
  // กีฬา / ฟิตเนส
  if (n.includes('ฟิตเนส') || n.includes('ออกกำลังกาย') || n.includes('กีฬา') || n.includes('แบด') || n.includes('เตะบอล') || n.includes('วิ่ง')) return <Dumbbell className="text-orange-600" />;
  // สัตว์เลี้ยง
  if (n.includes('สัตว์เลี้ยง') || n.includes('หมา') || n.includes('แมว') || n.includes('อาหารสัตว์') || n.includes('สัตวแพทย์') || n.includes('อาบน้ำหมา')) return <Cat className="text-orange-400" />;

  return <ImageIcon className="text-slate-400" />;
};

const ListManager = ({ title, data, updateDB, dataKey, isCategory = false }) => {
  const [newItem, setNewItem] = useState('');
  
  const handleAdd = () => {
    if(!newItem.trim()) return;
    const newItemObj = { id: Date.now().toString(), name: newItem };
    updateDB({ [dataKey]: [...data, newItemObj] });
    setNewItem('');
  };

  const handleDelete = (id) => {
    updateDB({ [dataKey]: data.filter(item => item.id !== id) });
  };

  return (
    <div className={`${theme.card} p-5`}>
      <h3 className={`font-bold ${theme.primary} mb-4`}>{title}</h3>
      <div className="flex gap-2 mb-4">
        <input type="text" value={newItem} onChange={e=>setNewItem(e.target.value)} className={theme.input} placeholder={`เพิ่ม${title}...`} />
        <button onClick={handleAdd} className={`${theme.button} px-4 rounded-xl flex items-center justify-center`}><Plus size={20}/></button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {data.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <span className={`${theme.textMain} flex items-center text-sm font-medium`}>
              {isCategory && <span className="mr-3 bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">{getIconForCategory(item.name)}</span>}
              {item.name}
            </span>
            <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1"><Trash2 size={18}/></button>
          </div>
        ))}
        {data.length === 0 && <div className="text-center text-slate-400 text-sm py-4">ยังไม่มีข้อมูล</div>}
      </div>
    </div>
  );
};

const ExpenseFormModal = ({ editingExpense, dbData, updateDB, setIsModalOpen, showToast, sendLineNotify }) => {
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
    
    const amount = parseFloat(formData.totalAmount);
    if (isNaN(amount) || amount <= 0) return window.alert("กรุณาใส่จำนวนเงินที่ถูกต้อง");

    let finalData = {
      ...formData,
      totalAmount: amount,
      updatedAt: Date.now()
    };

    if (formData.paymentType === 'installment') {
      finalData.installmentMonths = parseInt(formData.installmentMonths);
      finalData.currentInstallment = parseInt(formData.currentInstallment) || 1;
    } else {
      delete finalData.installmentMonths;
      delete finalData.currentInstallment;
    }

    if (formData.payerType === 'split') {
      const selectedMembers = Object.keys(splitSelection).filter(k => splitSelection[k]);
      if (selectedMembers.length === 0) return window.alert("กรุณาเลือกคนที่ต้องหารอย่างน้อย 1 คน");
      
      const amountPerPerson = amount / selectedMembers.length;
      const splitData = {};
      
      selectedMembers.forEach(mId => {
        const alreadyPaid = editingExpense?.splitDetails?.[mId]?.paid || false;
        splitData[mId] = { amount: amountPerPerson, paid: alreadyPaid };
      });
      
      finalData.splitDetails = splitData;
      finalData.status = Object.values(splitData).every(v => v.paid) ? 'paid' : 'pending';
      delete finalData.payerId;
    } else {
      finalData.status = editingExpense ? editingExpense.status : 'pending';
      delete finalData.splitDetails;
    }

    let newExpenses = [];
    if (editingExpense) {
      newExpenses = expenses.map(exp => exp.id === editingExpense.id ? { ...finalData, id: editingExpense.id, createdAt: editingExpense.createdAt } : exp);
      showToast("อัปเดตรายการเรียบร้อย");
    } else {
      finalData.id = Date.now().toString();
      finalData.createdAt = Date.now();
      newExpenses = [finalData, ...expenses];
      showToast("เพิ่มรายการเรียบร้อย");
      sendLineNotify(`มีการเพิ่มบิลใหม่: ${formData.title} ยอด ${formatCurrency(amount)}`);
    }

    // --- หัก/คืน เงินกองกลางอัตโนมัติ ---
    const newSourceObj = sources.find(s => s.id === formData.sourceId);
    const isNewSourceCentralFund = newSourceObj && newSourceObj.name.includes('กองกลาง');

    let oldAmountDeducted = 0;
    if (editingExpense) {
      const oldSourceObj = sources.find(s => s.id === editingExpense.sourceId);
      const isOldSourceCentralFund = oldSourceObj && oldSourceObj.name.includes('กองกลาง');
      if (isOldSourceCentralFund) {
        oldAmountDeducted = editingExpense.totalAmount;
      }
    }

    let newAmountDeducted = 0;
    if (isNewSourceCentralFund) {
      newAmountDeducted = amount;
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

      newSavings = {
        currentAmount: newTotal,
        transactions: [newTransaction, ...savings.transactions].slice(0, 50)
      };
    }

    // เซฟขึ้นคลาวด์
    updateDB({ expenses: newExpenses, savings: newSavings });
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className={`bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-slideUp sm:animate-fadeIn`}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full"><X size={20} /></button>
        <h2 className={`text-2xl font-bold ${theme.primary} mb-6`}>{editingExpense ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-semibold ${theme.textMuted} mb-1.5`}>ชื่อรายการ</label>
            <input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className={theme.input} placeholder="เช่น ค่าเน็ตบ้าน, ค่าไฟ" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold ${theme.textMuted} mb-1.5`}>เดือนประจำรอบ</label>
              <input type="month" required value={formData.month} onChange={e=>setFormData({...formData, month: e.target.value})} className={theme.input} />
            </div>
            <div>
              <label className={`block text-sm font-semibold ${theme.textMuted} mb-1.5`}>ยอดรวม (บาท)</label>
              <input type="number" required value={formData.totalAmount} onChange={e=>setFormData({...formData, totalAmount: e.target.value})} className={theme.input} placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold ${theme.textMuted} mb-1.5`}>หมวดหมู่</label>
              <select value={formData.categoryId} onChange={e=>setFormData({...formData, categoryId: e.target.value})} className={theme.input} required>
                <option value="">เลือก...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-semibold ${theme.textMuted} mb-1.5`}>ที่มา / บัญชี</label>
              <select value={formData.sourceId} onChange={e=>setFormData({...formData, sourceId: e.target.value})} className={theme.input} required>
                <option value="">เลือก...</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <div>
              <label className={`block text-sm font-bold ${theme.primary} mb-3`}>รูปแบบการชำระ</label>
              <div className="flex space-x-6">
                <label className="flex items-center text-slate-700 cursor-pointer">
                  <input type="radio" name="payType" value="normal" checked={formData.paymentType === 'normal'} onChange={()=>setFormData({...formData, paymentType: 'normal'})} className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" /> จ่ายเต็ม
                </label>
                <label className="flex items-center text-slate-700 cursor-pointer">
                  <input type="radio" name="payType" value="installment" checked={formData.paymentType === 'installment'} onChange={()=>setFormData({...formData, paymentType: 'installment'})} className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" /> ผ่อนชำระ
                </label>
              </div>
            </div>
            
            {formData.paymentType === 'installment' && (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className={`block text-sm font-semibold ${theme.textMuted} mb-1.5`}>ชำระงวดที่</label>
                      <input type="number" required min="1" max={formData.installmentMonths || ""} value={formData.currentInstallment || 1} onChange={e=>setFormData({...formData, currentInstallment: e.target.value})} className={theme.input} />
                   </div>
                   <div>
                      <label className={`block text-sm font-semibold ${theme.textMuted} mb-1.5`}>จากทั้งหมด (งวด)</label>
                      <input type="number" required min="2" value={formData.installmentMonths} onChange={e=>setFormData({...formData, installmentMonths: e.target.value})} className={theme.input} />
                   </div>
                </div>
                {formData.totalAmount && formData.installmentMonths && (
                  <p className="text-sm text-blue-600 font-medium mt-3 bg-blue-50 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
                    <span>เฉลี่ยชำระต่อเดือน:</span>
                    <span className="font-black text-lg">{formatCurrency(formData.totalAmount / formData.installmentMonths)}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-4">
             <div>
              <label className={`block text-sm font-bold ${theme.primary} mb-3`}>การรับผิดชอบค่าใช้จ่าย</label>
              <div className="flex space-x-6">
                <label className="flex items-center text-slate-700 cursor-pointer">
                  <input type="radio" name="payerType" value="single" checked={formData.payerType === 'single'} onChange={()=>setFormData({...formData, payerType: 'single'})} className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" /> รายบุคคล
                </label>
                <label className="flex items-center text-slate-700 cursor-pointer">
                  <input type="radio" name="payerType" value="split" checked={formData.payerType === 'split'} onChange={()=>setFormData({...formData, payerType: 'split'})} className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" /> หารกัน
                </label>
              </div>
            </div>

            {formData.payerType === 'single' ? (
              <div className="animate-fadeIn">
                <select value={formData.payerId} onChange={e=>setFormData({...formData, payerId: e.target.value})} className={theme.input} required>
                  <option value="">เลือกผู้จ่าย...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <p className={`text-sm font-semibold ${theme.textMuted} mb-2`}>เลือกผู้มีส่วนร่วม</p>
                <div className="grid grid-cols-2 gap-3">
                  {members.map(m => (
                    <label key={m.id} className={`flex items-center p-3 rounded-xl cursor-pointer border transition-all ${splitSelection[m.id] ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'}`}>
                      <input 
                        type="checkbox" 
                        checked={!!splitSelection[m.id]}
                        onChange={(e) => setSplitSelection({...splitSelection, [m.id]: e.target.checked})}
                        className={`mr-2 rounded w-4 h-4 ${splitSelection[m.id] ? 'text-white border-white' : 'text-blue-600 border-slate-300'} focus:ring-0`} 
                      /> 
                      <span className="font-medium">{m.name}</span>
                    </label>
                  ))}
                </div>
                {formData.totalAmount && Object.values(splitSelection).filter(Boolean).length > 0 && (
                  <div className="mt-4 p-4 bg-white border border-blue-100 rounded-xl text-center shadow-sm">
                    <p className={`text-xs font-semibold ${theme.textMuted} uppercase tracking-wide`}>
                      ยอดแชร์ต่อคน {formData.paymentType === 'installment' ? '(ต่อเดือน)' : ''}
                    </p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">
                      {formatCurrency(
                        (formData.totalAmount / (formData.paymentType === 'installment' && formData.installmentMonths ? parseInt(formData.installmentMonths) || 1 : 1)) / 
                        Object.values(splitSelection).filter(Boolean).length
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className={`px-6 py-3 rounded-xl ${theme.textMuted} font-semibold hover:bg-slate-100 transition-colors`}>ยกเลิก</button>
            <button type="submit" className={`${theme.button} px-8 py-3`}>บันทึกรายการ</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Database State รวมทุกอย่างไว้ในที่เดียวเพื่อให้ส่งไปคลาวด์ง่ายๆ
  const [dbData, setDbData] = useState({
    expenses: [], members: [], categories: [], sources: [], savings: { currentAmount: 0, transactions: [] }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // ฟังก์ชันดึงข้อมูลจาก Google Sheets (หรือ Local Storage ถ้าลืมใส่ URL)
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    
    // ตรวจสอบว่าใส่ URL หรือยัง
    if (!GAS_URL || GAS_URL.includes("ใส่_URL")) {
      const local = localStorage.getItem("moneyPopDB_Sheets");
      if (local) setDbData(JSON.parse(local));
      if (!silent) setIsLoading(false);
      return;
    }

    try {
      if(!silent) setIsSyncing(true);
      const res = await fetch(GAS_URL);
      const data = await res.json();
      if (data && data.expenses) {
        setDbData(data);
        localStorage.setItem("moneyPopDB_Sheets", JSON.stringify(data)); // สำรองไว้ในเครื่องด้วย
      }
    } catch (e) {
      console.error("Fetch error:", e);
      // ถ้าเน็ตหลุด ดึงจาก Local Storage แทน
      const local = localStorage.getItem("moneyPopDB_Sheets");
      if (local) setDbData(JSON.parse(local));
    }
    
    if (!silent) setIsLoading(false);
    setIsSyncing(false);
  }, []);

  // ดึงข้อมูลครั้งแรกเมื่อโหลดแอป
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ฟังก์ชันอัปเดตข้อมูล (บันทึกลง Local และส่งไปคลาวด์ Google Sheets)
  const updateDB = async (newDataFields) => {
    const updatedData = { ...dbData, ...newDataFields };
    setDbData(updatedData); // อัปเดตหน้าจอทันที ไม่ต้องรอคลาวด์
    localStorage.setItem("moneyPopDB_Sheets", JSON.stringify(updatedData)); // เซฟลงเครื่อง

    if (!GAS_URL || GAS_URL.includes("ใส่_URL")) return;

    setIsSyncing(true);
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify(updatedData),
        // สำคัญมาก: ใช้ text/plain เพื่อป้องกันปัญหา CORS Policy ของ Google Apps Script
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
    } catch (e) {
      console.error("Save to cloud error:", e);
    }
    setIsSyncing(false);
  };

  const { expenses, members, categories, sources, savings } = dbData;

  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    payer: '',
    category: '',
    source: '',
    paymentType: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  const [selectedForPay, setSelectedForPay] = useState({});
  const [splitSelectModal, setSplitSelectModal] = useState({ isOpen: false, expId: null, members: [] });

  const [savingsAmount, setSavingsAmount] = useState('');
  const [savingsSource, setSavingsSource] = useState('');
  const [savingsType, setSavingsType] = useState('add');

  const sendLineMessage = async (message) => {
    const gasUrl = "ใส่_WEB_APP_URL_จาก_GOOGLE_APPS_SCRIPT_ที่นี่"; 
    if (gasUrl === "ใส่_WEB_APP_URL_จาก_GOOGLE_APPS_SCRIPT_ที่นี่" || !gasUrl) return;
    try {
      await fetch(gasUrl, { method: 'POST', body: JSON.stringify({ message: message }) });
    } catch (error) { console.error("LINE API Error:", error); }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

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
      const monthlyDivisor = (expense.paymentType === 'installment' && expense.installmentMonths) ? expense.installmentMonths : 1;
      
      if (expense.payerType === 'single') {
        setSelectedForPay({ ...selectedForPay, [expense.id]: { amount: expense.totalAmount / monthlyDivisor, type: 'single' } });
      } else {
        const unpaidMembers = Object.keys(expense.splitDetails).filter(mId => !expense.splitDetails[mId].paid);
        if (unpaidMembers.length === 0) return; 

        setSplitSelectModal({
          isOpen: true,
          expId: expense.id,
          expenseData: expense,
          selectedMembers: unpaidMembers.length === 1 ? unpaidMembers : [], 
          availableMembers: unpaidMembers
        });
      }
    }
  };

  const confirmSplitSelection = () => {
    const { expId, selectedMembers, expenseData } = splitSelectModal;
    if (selectedMembers.length === 0) {
       setSplitSelectModal({ isOpen: false, expId: null, members: [] });
       return;
    }

    let amountToPay = 0;
    const monthlyDivisor = (expenseData.paymentType === 'installment' && expenseData.installmentMonths) ? expenseData.installmentMonths : 1;

    selectedMembers.forEach(mId => {
      amountToPay += (expenseData.splitDetails[mId].amount / monthlyDivisor);
    });

    setSelectedForPay({
      ...selectedForPay,
      [expId]: { amount: amountToPay, type: 'split', memberIds: selectedMembers }
    });
    setSplitSelectModal({ isOpen: false, expId: null, members: [] });
  };

  const processBulkPayment = () => {
    let totalPaid = 0;
    
    const newExpenses = expenses.map(expense => {
      if (!selectedForPay[expense.id]) return expense; 

      const payData = selectedForPay[expense.id];
      const newExpense = { ...expense };
      const monthlyDivisor = (newExpense.paymentType === 'installment' && newExpense.installmentMonths) ? newExpense.installmentMonths : 1;

      if (payData.type === 'single') {
        newExpense.status = 'paid';
        totalPaid += (newExpense.totalAmount / monthlyDivisor);
      } else if (payData.type === 'split') {
        const newSplitDetails = { ...newExpense.splitDetails };
        payData.memberIds.forEach(mId => {
          newSplitDetails[mId].paid = true;
          totalPaid += (newSplitDetails[mId].amount / monthlyDivisor);
        });
        
        const allPaid = Object.values(newSplitDetails).every(v => v.paid);
        newExpense.splitDetails = newSplitDetails;
        newExpense.status = allPaid ? 'paid' : 'pending';
      }
      return newExpense;
    });

    updateDB({ expenses: newExpenses });
    setSelectedForPay({});
    showToast(`ชำระเรียบร้อย ยอดรวม ${formatCurrency(totalPaid)}`);
    sendLineMessage(`💸 ชำระรายการเรียบร้อย\nยอดรวม: ${formatCurrency(totalPaid)}`);
  };

  const deleteExpense = (id) => {
    if(window.confirm("ยืนยันการลบรายการนี้?")) {
      const exp = expenses.find(e => e.id === id);
      const newExpenses = expenses.filter(e => e.id !== id);
      let newSavings = savings;
      
      if (exp) {
        const sourceObj = sources.find(s => s.id === exp.sourceId);
        if (sourceObj && sourceObj.name.includes('กองกลาง')) {
          newSavings = {
            currentAmount: savings.currentAmount + exp.totalAmount,
            transactions: [{
              id: Date.now().toString(),
              type: 'add',
              amount: exp.totalAmount,
              source: `คืนเงิน (ลบบิล: ${exp.title})`,
              date: new Date().toISOString()
            }, ...savings.transactions].slice(0, 50)
          };
        }
      }

      updateDB({ expenses: newExpenses, savings: newSavings });
      showToast("ลบรายการสำเร็จ");
    }
  };

  const selectedTotalAmount = Object.values(selectedForPay).reduce((sum, item) => sum + item.amount, 0);

  const renderNavigation = () => (
    <nav className="bg-white border-t border-slate-200 pb-safe pt-2 px-4 sticky bottom-0 z-40 sm:top-0 sm:bottom-auto sm:border-b sm:border-t-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
      <div className="flex space-x-2 w-full justify-around max-w-lg mx-auto sm:max-w-none sm:justify-start">
        {[
          { id: 'dashboard', icon: <Home size={22}/>, label: 'ภาพรวม' },
          { id: 'expenses', icon: <CreditCard size={22}/>, label: 'บิล' },
          { id: 'savings', icon: <PiggyBank size={22}/>, label: 'กองกลาง' },
          { id: 'settings', icon: <Settings size={22}/>, label: 'ตั้งค่า' }
        ].map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-14 sm:flex-row sm:w-auto sm:px-6 sm:py-2 sm:rounded-xl transition-colors duration-200 ${
                isActive 
                  ? 'text-blue-800 sm:bg-blue-50 sm:text-blue-800' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`mb-1 sm:mb-0 sm:mr-2 ${isActive ? 'scale-110 transition-transform' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] sm:text-sm font-semibold tracking-wide ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  );

  const renderFilters = () => (
    <div className="bg-white px-4 py-3 sm:rounded-2xl border-b sm:border border-slate-200 mb-4 sm:mb-6 flex overflow-x-auto custom-scrollbar gap-3 hide-scrollbar snap-x">
      <div className="flex items-center space-x-2 text-slate-700 font-bold shrink-0 snap-start pl-2">
        <Filter size={18} />
      </div>
      <div className="shrink-0 snap-start">
        <input 
          type="month" 
          value={filters.month} 
          onChange={e => setFilters({...filters, month: e.target.value})}
          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
        />
      </div>
      <div className="shrink-0 snap-start">
        <select value={filters.payer} onChange={e => setFilters({...filters, payer: e.target.value})} className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none">
          <option value="">👤 ทุกคน</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div className="shrink-0 snap-start">
        <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none">
          <option value="">📁 ทุกหมวด</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="shrink-0 snap-start pr-4 sm:pr-0">
        <select value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})} className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-medium outline-none">
          <option value="">💳 ทุกบัญชี</option>
          {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
    </div>
  );

  const renderDashboard = () => {
    let totalPaid = 0;
    let totalPending = 0;
    const categoryDataMap = {};
    const memberDataMap = {};

    filteredExpenses.forEach(exp => {
      const catName = categories.find(c => c.id === exp.categoryId)?.name || 'ไม่ระบุ';
      
      // หาตัวหาร (ถ้าจ่ายเต็ม หารด้วย 1, ถ้าผ่อน ให้หารด้วยจำนวนเดือน เพื่อหายอดต่อเดือน)
      const monthlyDivisor = (exp.paymentType === 'installment' && exp.installmentMonths) ? exp.installmentMonths : 1;

      let amountConsidered = 0;
      let isPaidConsidered = false;

      if (exp.payerType === 'single') {
        amountConsidered = exp.totalAmount / monthlyDivisor;
        isPaidConsidered = exp.status === 'paid';
      } else {
        if (filters.payer) {
          amountConsidered = exp.splitDetails[filters.payer].amount / monthlyDivisor;
          isPaidConsidered = exp.splitDetails[filters.payer].paid;
        } else {
          amountConsidered = exp.totalAmount / monthlyDivisor;
          let localPaid = 0;
          let localPending = 0;
          Object.values(exp.splitDetails).forEach(v => {
            if(v.paid) localPaid += (v.amount / monthlyDivisor);
            else localPending += (v.amount / monthlyDivisor);
          });
          totalPaid += localPaid;
          totalPending += localPending;
          
          if (!categoryDataMap[catName]) categoryDataMap[catName] = 0;
          categoryDataMap[catName] += amountConsidered;
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
          memberDataMap[mName] += (exp.totalAmount / monthlyDivisor);
        } else {
          Object.entries(exp.splitDetails).forEach(([mId, details]) => {
            const mName = members.find(m => m.id === mId)?.name || 'ไม่ระบุ';
            if (!memberDataMap[mName]) memberDataMap[mName] = 0;
            memberDataMap[mName] += (details.amount / monthlyDivisor);
          });
        }
      }
    });

    const pieData = [
      { name: 'ชำระแล้ว', value: totalPaid, color: '#3b82f6' }, 
      { name: 'รอชำระ', value: totalPending, color: '#f43f5e' } 
    ];

    const catData = Object.keys(categoryDataMap).map(k => ({ name: k, value: categoryDataMap[k] }));
    const memData = Object.keys(memberDataMap).map(k => ({ name: k, value: memberDataMap[k] }));
    const grandTotal = totalPaid + totalPending;

    return (
      <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-6">
        {renderFilters()}

        <div className="px-4 sm:px-0 flex flex-col gap-4 sm:gap-5">
          <div className={`${theme.card} p-5 sm:p-6 bg-gradient-to-br from-blue-900 to-blue-800 text-white shadow-xl flex flex-col md:flex-row gap-5 sm:gap-6`}>
            
            <div className="w-full md:w-5/12 lg:w-1/2 flex flex-col justify-between">
              <div className="mb-4 md:mb-0">
                <p className="text-blue-200 text-sm font-medium mb-1">ยอดใช้จ่ายจริงเดือนนี้ (เฉลี่ยผ่อนชำระแล้ว)</p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">{formatCurrency(grandTotal)}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="bg-white/95 text-slate-800 p-3 sm:p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                  <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wide">ชำระแล้ว</p>
                  <p className="text-base sm:text-lg lg:text-xl font-black text-blue-700 mt-1 truncate">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="bg-white/95 text-slate-800 p-3 sm:p-4 rounded-xl shadow-sm border-l-4 border-rose-500">
                  <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wide">รอชำระ</p>
                  <p className="text-base sm:text-lg lg:text-xl font-black text-rose-600 mt-1 truncate">{formatCurrency(totalPending)}</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-7/12 lg:w-1/2 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10 flex items-center justify-center min-h-[180px] sm:min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: '#1e293b' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${!filters.payer ? 'md:grid-cols-2' : ''} gap-4 sm:gap-5`}>
            
            <div className={`${theme.card} p-4 sm:p-5 flex flex-col min-h-[260px] sm:min-h-[280px]`}>
              <h3 className={`text-sm font-bold ${theme.primary} mb-4 flex items-center shrink-0`}><ShoppingBag size={16} className="mr-2"/> แยกตามหมวดหมู่</h3>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} fill="#64748b" width={75} />
                    <RechartsTooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                      formatter={(val) => formatCurrency(val)}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                      {catData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={theme.chartColors[index % theme.chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {!filters.payer && (
              <div className={`${theme.card} p-4 sm:p-5 flex flex-col min-h-[260px] sm:min-h-[280px]`}>
                <h3 className={`text-sm font-bold ${theme.primary} mb-2 flex items-center shrink-0`}><Users size={16} className="mr-2"/> แยกตามบุคคล</h3>
                <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={memData} innerRadius={45} outerRadius={75} dataKey="value" stroke="#fff" strokeWidth={2}>
                        {memData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={theme.chartColors[index % theme.chartColors.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(val) => formatCurrency(val)}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
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

  const renderExpensesList = () => {
    return (
      <div className="space-y-4 animate-fadeIn pb-6">
        <div className="px-4 sm:px-0 flex justify-between items-end mb-2 pt-2">
          <div>
            <h2 className={`text-2xl font-black ${theme.primary}`}>รายการบิล</h2>
            <p className="text-slate-500 text-sm font-medium">{filteredExpenses.length} รายการในเดือนนี้</p>
          </div>
          <button 
            onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
            className={`${theme.button} px-4 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center space-x-1.5 shadow-blue-500/20`}
          >
            <Plus size={18} /> <span className="hidden sm:inline">เพิ่มรายการ</span>
          </button>
        </div>

        {renderFilters()}

        {Object.keys(selectedForPay).length > 0 && (
          <div className="sticky top-2 z-40 mx-4 sm:mx-0 bg-white p-4 rounded-2xl border border-blue-200 shadow-[0_10px_25px_rgba(37,99,235,0.15)] flex justify-between items-center mb-4 animate-slideUp">
            <div>
              <span className="text-blue-600 text-xs font-bold uppercase tracking-wide">เลือก {Object.keys(selectedForPay).length} รายการ</span>
              <p className="text-blue-900 text-xl font-black">{formatCurrency(selectedTotalAmount)}</p>
            </div>
            <button 
              onClick={processBulkPayment}
              className={`${theme.button} px-5 py-2.5 rounded-xl font-bold shadow-blue-600/30`}
            >
              ชำระเงิน
            </button>
          </div>
        )}

        <div className="px-4 sm:px-0 grid gap-3 sm:gap-4">
          {filteredExpenses.map(exp => {
            const cat = categories.find(c => c.id === exp.categoryId);
            const source = sources.find(s => s.id === exp.sourceId);
            
            const monthlyDivisor = (exp.paymentType === 'installment' && exp.installmentMonths) ? exp.installmentMonths : 1;
            let displayAmount = exp.totalAmount / monthlyDivisor;
            let displayStatus = exp.status;
            let isPartiallyPaid = false;

            if (exp.payerType === 'split') {
               if (filters.payer) {
                 displayAmount = exp.splitDetails[filters.payer].amount / monthlyDivisor;
                 displayStatus = exp.splitDetails[filters.payer].paid ? 'paid' : 'pending';
               } else {
                 const allPaid = Object.values(exp.splitDetails).every(v => v.paid);
                 const somePaid = Object.values(exp.splitDetails).some(v => v.paid);
                 if (somePaid && !allPaid) isPartiallyPaid = true;
               }
            }

            const isChecked = !!selectedForPay[exp.id];
            const showAsPaid = displayStatus === 'paid';

            return (
              <div 
                key={exp.id} 
                className={`${theme.card} p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all duration-200
                  ${showAsPaid ? 'opacity-70 bg-slate-50 shadow-none border-dashed' : isChecked ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/30' : 'hover:border-blue-200 hover:shadow-md'}`}
              >
                <div className="flex items-start sm:items-center w-full sm:w-auto">
                  {!showAsPaid && (
                    <div className="mr-3 sm:mr-4 mt-1 sm:mt-0">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleCheckExpense(exp)}
                        className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl mr-3 sm:mr-4 flex-shrink-0 ${showAsPaid ? 'bg-slate-200 grayscale' : 'bg-slate-100 shadow-sm'}`}>
                    {cat ? getIconForCategory(cat.name) : <CreditCard className="text-slate-400" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h3 className={`font-bold text-base sm:text-lg truncate ${showAsPaid ? 'text-slate-400 line-through' : theme.textMain}`}>
                        {exp.title}
                      </h3>
                      {exp.paymentType === 'installment' && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                          ผ่อนชำระ {exp.currentInstallment && exp.installmentMonths ? `(งวดที่ ${exp.currentInstallment}/${exp.installmentMonths})` : ''}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap text-xs text-slate-500 font-medium gap-x-2 gap-y-1 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">{cat?.name || 'ไม่ระบุ'}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">{source?.name || 'ไม่ระบุ'}</span>
                      {exp.payerType === 'split' && !filters.payer && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">หาร {Object.keys(exp.splitDetails).length} คน</span>
                      )}
                    </div>

                    {exp.payerType === 'split' && !filters.payer && (
                      <div className="mt-3 text-xs space-y-1.5 border-t border-slate-100 pt-2 w-full sm:max-w-xs">
                        {Object.entries(exp.splitDetails).map(([mId, detail]) => {
                          const m = members.find(mbr => mbr.id === mId);
                          return (
                            <div key={mId} className={`flex items-center justify-between ${detail.paid ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                              <span className="truncate pr-2">• {m?.name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span>{formatCurrency(detail.amount / monthlyDivisor)}</span>
                                {detail.paid ? <Check size={14} className="bg-emerald-100 rounded-full p-0.5"/> : <span className="text-[10px] bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded font-bold">รอชำระ</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-end items-center sm:items-end border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                  <div className={`text-lg sm:text-xl font-black flex items-baseline ${showAsPaid ? 'text-slate-400' : 'text-blue-800'}`}>
                    {formatCurrency(displayAmount)}
                    {exp.paymentType === 'installment' && <span className="text-sm font-medium text-slate-500 ml-1">/ด.</span>}
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2 mt-1 sm:mt-2">
                    {showAsPaid ? (
                      <span className="text-emerald-700 text-xs font-bold flex items-center bg-emerald-100 px-2.5 py-1 rounded-full"><Check size={12} className="mr-1 stroke-[3]"/> ชำระแล้ว</span>
                    ) : isPartiallyPaid ? (
                      <span className="text-amber-700 text-xs font-bold bg-amber-100 px-2.5 py-1 rounded-full">ชำระบางส่วน</span>
                    ) : (
                      <span className="text-rose-600 text-xs font-bold bg-rose-50 px-2.5 py-1 rounded-full">รอชำระ</span>
                    )}
                    
                    <button onClick={() => { setEditingExpense(exp); setIsModalOpen(true); }} className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteExpense(exp.id)} className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredExpenses.length === 0 && (
             <div className="text-center p-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300 mx-4 sm:mx-0">
               <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                 <ShoppingBag size={24} className="text-slate-300" />
               </div>
               <p className="font-medium">ไม่มีรายการบิลในเดือนนี้</p>
               <p className="text-sm mt-1 text-slate-400">กดเพิ่มรายการเพื่อเริ่มต้น</p>
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
      
      const newTransaction = {
        id: Date.now().toString(),
        type: savingsType,
        amount: val,
        source: savingsSource || 'ไม่ระบุ',
        date: new Date().toISOString()
      };

      const newSavings = {
        currentAmount: newTotal,
        transactions: [newTransaction, ...savings.transactions].slice(0, 50) 
      };

      updateDB({ savings: newSavings });

      const typeText = savingsType === 'add' ? 'รับเงินเข้ากองกลาง' : 'ใช้จ่ายจากกองกลาง';
      sendLineMessage(`💰 ${typeText}\nยอดเงิน: ${formatCurrency(val)}\nรายการ: ${savingsSource || 'ไม่ระบุ'}\nยอดคงเหลือ: ${formatCurrency(newTotal)}`);

      setSavingsAmount(''); setSavingsSource('');
      showToast('บันทึกข้อมูลกองกลางเรียบร้อย');
    };

    return (
      <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-6 px-4 sm:px-0">
        <div className={`${theme.card} p-8 text-center bg-gradient-to-br from-indigo-500 to-blue-600 text-white relative overflow-hidden shadow-lg`}>
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
           <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner">
             <PiggyBank size={32} className="text-white" />
           </div>
           <h2 className="text-blue-100 text-sm font-medium uppercase tracking-widest mb-1">ยอดเงินกองกลางคงเหลือ</h2>
           <p className="text-4xl sm:text-5xl font-black drop-shadow-md">{formatCurrency(savings.currentAmount)}</p>
        </div>

        <div className={`${theme.card} p-6`}>
          <h3 className={`font-bold ${theme.primary} mb-4 flex items-center`}><Edit size={18} className="mr-2"/> บันทึกรายการ</h3>
          <form onSubmit={handleSaveFund} className="flex flex-col gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-bold transition-colors ${savingsType === 'add' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
                <input type="radio" name="savType" value="add" checked={savingsType === 'add'} onChange={()=>setSavingsType('add')} className="hidden" /> รับเงินเข้า (+)
              </label>
              <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-bold transition-colors ${savingsType === 'deduct' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}>
                <input type="radio" name="savType" value="deduct" checked={savingsType === 'deduct'} onChange={()=>setSavingsType('deduct')} className="hidden" /> นำไปใช้ (-)
              </label>
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-bold">฿</span>
              <input type="number" placeholder="0.00" value={savingsAmount} onChange={e=>setSavingsAmount(e.target.value)} className={`${theme.input} pl-9 text-lg font-bold`} required />
            </div>
            <input type="text" placeholder="ระบุที่มา / หมายเหตุการใช้จ่าย" value={savingsSource} onChange={e=>setSavingsSource(e.target.value)} className={theme.input} required />
            <button type="submit" className={`${theme.button} py-3.5 mt-2`}>ยืนยันการบันทึก</button>
          </form>
        </div>

        <div className={`${theme.card} p-6`}>
          <h3 className={`font-bold ${theme.primary} mb-4`}>ประวัติการทำรายการล่าสุด</h3>
          <div className="space-y-3">
            {savings.transactions.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">ยังไม่มีประวัติ</p>
            ) : (
              savings.transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === 'add' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {t.type === 'add' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="text-slate-800 font-bold text-sm sm:text-base">{t.source}</p>
                      <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className={`font-black ${t.type === 'add' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'add' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    const handleClearData = () => {
      if (window.confirm("⚠️ คำเตือน: คุณแน่ใจหรือไม่ที่จะล้างข้อมูล 'รายการบิล' และ 'ประวัติกองกลาง' ทั้งหมด?\n\n(การกระทำนี้ไม่สามารถกู้คืนได้ แต่รายชื่อ, หมวดหมู่ และบัญชี จะยังคงอยู่)")) {
        updateDB({ expenses: [], savings: { currentAmount: 0, transactions: [] } });
        showToast("ล้างข้อมูลธุรกรรมเรียบร้อยแล้ว");
      }
    };

    return (
      <div className="space-y-6 animate-fadeIn px-4 sm:px-0 pb-6">
        <h2 className={`text-2xl font-black ${theme.primary} pt-2`}>ตั้งค่าระบบ (เชื่อมต่อ Google Sheets)</h2>
        
        {(!GAS_URL || GAS_URL.includes("ใส่_URL")) ? (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl border border-amber-200 text-sm font-medium">
            ⚠️ <b>โหมดออฟไลน์:</b> คุณยังไม่ได้ใส่ URL ของ Google Sheets ข้อมูลตอนนี้ถูกเก็บไว้ในเครื่องของคุณเท่านั้น (คนอื่นจะไม่เห็น)
          </div>
        ) : (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-sm font-medium flex items-center">
            <Cloud size={18} className="mr-2 shrink-0"/> <b>เชื่อมต่อคลาวด์แล้ว:</b> ข้อมูลของคุณจะถูกซิงค์กับ Google Sheets อัตโนมัติและแชร์ให้คนอื่นดูได้
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <ListManager title="รายชื่อสมาชิกครอบครัว" data={members} updateDB={updateDB} dataKey="members" />
          <ListManager title="หมวดหมู่ค่าใช้จ่าย" data={categories} updateDB={updateDB} dataKey="categories" isCategory={true} />
          <ListManager title="แหล่งที่มา/บัญชีการเงิน" data={sources} updateDB={updateDB} dataKey="sources" />
          
          <div className={`${theme.card} p-5 md:col-span-2 lg:col-span-3`}>
            <h3 className={`font-bold ${theme.primary} mb-4 flex items-center`}><Database size={18} className="mr-2"/> การจัดการข้อมูล</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                 <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                   หากต้องการเริ่มต้นใหม่ (เช่น เริ่มรอบปีใหม่) คุณสามารถกด <b>"ล้างข้อมูล"</b> เพื่อลบประวัติ <b>"บิล"</b> และ <b>"กองกลาง"</b> ทั้งหมดทิ้งได้ (รายชื่อและหมวดหมู่จะไม่ถูกลบ)
                 </p>
                 <button 
                   onClick={handleClearData}
                   className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-sm hover:bg-rose-100 hover:shadow-sm transition-all shrink-0 flex items-center justify-center"
                 >
                   <Trash2 size={16} className="mr-2"/> ล้างข้อมูลธุรกรรม
                 </button>
              </div>
            </div>
          </div>

        </div>
        <div className="text-center text-slate-400 text-xs mt-8">
          Money-Pop Family Expenses v4.1 (Smart Icons)
        </div>
      </div>
    );
  };

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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center sm:p-4">
        <div className={`bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 text-center shadow-2xl animate-slideUp`}>
           <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
           <h3 className={`text-xl font-bold ${theme.primary} mb-1`}>ระบุผู้ชำระเงิน</h3>
           <p className="text-slate-500 text-sm mb-6 bg-slate-50 p-2 rounded-lg border border-slate-100">สำหรับ "{expenseData.title}"</p>
           
           <div className="space-y-2.5 mb-8 text-left">
             {availableMembers.map(mId => {
               const m = members.find(mbr => mbr.id === mId);
               
               const monthlyDivisor = (expenseData.paymentType === 'installment' && expenseData.installmentMonths) ? expenseData.installmentMonths : 1;
               const amount = expenseData.splitDetails[mId].amount / monthlyDivisor;
               
               const isSelected = selectedMembers.includes(mId);
               return (
                 <div 
                   key={mId} 
                   onClick={() => toggleMember(mId)}
                   className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center
                     ${isSelected ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                 >
                   <div className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                        {isSelected && <Check size={14} className="text-white stroke-[3]"/>}
                     </div>
                     <span className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{m?.name}</span>
                   </div>
                   <span className={`font-bold ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>{formatCurrency(amount)}</span>
                 </div>
               )
             })}
           </div>

           <div className="flex gap-3">
             <button onClick={() => setSplitSelectModal({isOpen: false, expId: null, members: []})} className="flex-1 py-3.5 rounded-xl text-slate-600 bg-slate-100 font-bold hover:bg-slate-200 transition-colors">ยกเลิก</button>
             <button 
               onClick={confirmSplitSelection} 
               disabled={selectedMembers.length === 0}
               className={`flex-1 py-3.5 rounded-xl font-bold transition-colors ${selectedMembers.length > 0 ? theme.button : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
             >
               ยืนยัน
             </button>
           </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-blue-800 font-bold animate-pulse">กำลังโหลดข้อมูล...</div>;

  return (
    <div className={`min-h-screen ${theme.bg} font-sans selection:bg-blue-200`}>
      <div className="max-w-md sm:max-w-3xl lg:max-w-5xl mx-auto flex flex-col h-screen overflow-hidden bg-slate-50/50 sm:border-x border-slate-200 shadow-sm">
        
        <header className="bg-white px-4 sm:px-6 py-3 flex justify-between items-center border-b border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-30">
          <div className="flex items-center gap-2">
            <div className="bg-blue-800 text-white p-1.5 rounded-lg shadow-sm">
              <Zap size={20} className="fill-white" />
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-blue-900">
              MONEY<span className="text-blue-500">-POP</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => fetchData(true)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="ดึงข้อมูลล่าสุดจาก Google Sheets"
             >
                <RefreshCw size={18} className={isSyncing ? "animate-spin text-blue-500" : ""} />
             </button>
             <div className={`px-3 py-1.5 rounded-full border flex items-center ${GAS_URL && !GAS_URL.includes("ใส่_URL") ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-100 border-slate-200'}`}>
               {GAS_URL && !GAS_URL.includes("ใส่_URL") ? (
                 <>
                  <Cloud size={12} className="text-emerald-500 mr-2" />
                  <span className="text-xs font-bold text-emerald-700">{isSyncing ? 'Syncing...' : 'Synced'}</span>
                 </>
               ) : (
                 <>
                  <CloudOff size={12} className="text-slate-400 mr-2" />
                  <span className="text-xs font-bold text-slate-500">Offline</span>
                 </>
               )}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto sm:p-6 custom-scrollbar relative">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'expenses' && renderExpensesList()}
          {activeTab === 'savings' && renderSavings()}
          {activeTab === 'settings' && renderSettings()}
        </main>

        {renderNavigation()}
      </div>

      {isModalOpen && (
        <ExpenseFormModal 
          editingExpense={editingExpense}
          dbData={dbData}
          updateDB={updateDB}
          setIsModalOpen={setIsModalOpen}
          showToast={showToast}
          sendLineNotify={sendLineMessage}
        />
      )}
      {renderSplitPaySelectModal()}

      {toastMessage && (
        <div className="fixed top-20 sm:top-6 left-1/2 transform -translate-x-1/2 z-[200] bg-slate-800 text-white px-6 py-3.5 rounded-full shadow-2xl font-medium animate-slideDown text-sm flex items-center border border-slate-700 whitespace-nowrap">
          <Check size={18} className="mr-2 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideDown { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } }
      `}} />
    </div>
  );
}