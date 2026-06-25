/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, CreditCard, PiggyBank, Settings, Plus, Check, Trash2, Edit, Filter, X, ShoppingBag, Coffee, Car, Home as HomeIcon, Smartphone, Zap, Image as ImageIcon, MessageCircle, Users, BookOpen, HeartPulse, ShoppingCart, TrendingUp, Gift, Briefcase, RefreshCw, MonitorPlay, Gamepad2, Music, Plane, Scissors, Shirt, Baby, FileText, Wrench, Dumbbell, Cat, Mail, Send, Undo } from 'lucide-react';

const GAS_URL = "https://script.google.com/macros/s/AKfycbzbO-BbqufnRT6kZ1j8u8PLmhxPM3MSCY_VRZIUOsV6KlGIbGeOAgBVH_7HnVBSvSne/exec"; 

const theme = {
  bg: "bg-[#fcfbf7]", card: "bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100",
  textMain: "text-slate-800", textMuted: "text-slate-400", primary: "text-[#005a36]", primaryBg: "bg-[#00a950]",
  button: "bg-[#00a950] hover:bg-[#008f43] text-white shadow-lg shadow-emerald-600/20 rounded-2xl font-bold transition-all active:scale-95 text-sm sm:text-base",
  input: "bg-slate-50 border-2 border-slate-100 text-slate-800 focus:border-[#00a950] focus:bg-white rounded-2xl p-3.5 w-full transition-all text-sm sm:text-base outline-none font-medium",
  chartColors: ['#00a950', '#4dabf7', '#ff5c93', '#ff922b', '#7048e8'] 
};

const formatCurrency = (amount) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);

const getDisplayAmount = (exp) => {
  let amt = parseFloat(exp.totalAmount) || 0;
  if (exp.paymentType === 'installment' && !exp.isMonthlyAmount && !exp.fullTotalAmount) return amt / (parseInt(exp.installmentMonths) || 1);
  return amt;
};

const getDisplaySplitAmount = (exp, mId) => {
  if (!exp.splitDetails || !exp.splitDetails[mId]) return 0;
  let amt = parseFloat(exp.splitDetails[mId].amount) || 0;
  if (exp.paymentType === 'installment' && !exp.isMonthlyAmount && !exp.fullTotalAmount) return amt / (parseInt(exp.installmentMonths) || 1);
  return amt;
};

const getIconForCategory = (name) => {
  if (!name) return <ImageIcon className="text-slate-300" />;
  const n = name.toLowerCase();
  if (n.includes('shopee') || n.includes('lazada') || n.includes('ช้อป')) return <ShoppingBag className="text-[#ff922b]" />;
  if (n.includes('เดินทาง') || n.includes('รถ') || n.includes('น้ำมัน') || n.includes('ทางด่วน')) return <Car className="text-[#4dabf7]" />;
  if (n.includes('อาหาร') || n.includes('กิน') || n.includes('กาแฟ')) return <Coffee className="text-[#ff922b]" />;
  if (n.includes('บ้าน') || n.includes('เช่า') || n.includes('คอนโด')) return <HomeIcon className="text-[#3b5bdb]" />;
  if (n.includes('เน็ต') || n.includes('โทรศัพท์')) return <Smartphone className="text-[#748ffc]" />;
  if (n.includes('ไฟ') || n.includes('น้ำ')) return <Zap className="text-[#fcc419]" />;
  if (n.includes('บัตรเครดิต') || n.includes('ผ่อน')) return <CreditCard className="text-slate-500" />;
  if (n.includes('ยา') || n.includes('สุขภาพ') || n.includes('ประกัน')) return <HeartPulse className="text-[#ff6b6b]" />;
  if (n.includes('ของใช้') || n.includes('ซุปเปอร์')) return <ShoppingCart className="text-[#12b886]" />;
  return <ImageIcon className="text-slate-300" />;
};

const ListManager = ({ title, data, updateDB, dataKey, isCategory = false, hasEmail = false }) => {
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  return (
    <div className={`${theme.card} p-6`}>
      <h3 className={`text-base font-black ${theme.primary} mb-4 flex items-center`}>{isCategory ? <ShoppingBag size={20} className="mr-2 text-[#00a950]"/> : (hasEmail ? <Users size={20} className="mr-2 text-[#00a950]"/> : title)}</h3>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input type="text" value={name} onChange={e=>setName(e.target.value)} className={theme.input} placeholder={`เพิ่ม${title}...`} />
        {hasEmail && <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className={theme.input} placeholder="อีเมล..." />}
        <button onClick={() => { if(name.trim()) { updateDB({[dataKey]: [...data, {id: Date.now().toString(), name, email: hasEmail ? email : undefined}]}); setName(''); setEmail('');} }} className={`${theme.button} px-5 py-3 rounded-2xl`}><Plus size={20}/></button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {data.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-[#fdfbf7] border border-slate-100 p-3 rounded-2xl">
            <div className="flex flex-col"><span className="text-slate-800 font-bold text-sm sm:text-base flex items-center">{isCategory && <span className="mr-2 bg-white p-1.5 rounded-lg border border-slate-100/60">{getIconForCategory(item.name)}</span>}{item.name}</span>{item.email && <span className="text-xs text-slate-400 font-medium">{item.email}</span>}</div>
            <button onClick={() => updateDB({ [dataKey]: data.filter(i => i.id !== item.id) })} className="text-slate-300 hover:text-rose-500 p-1"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpenseFormModal = ({ editingExpense, dbData, updateDB, setIsModalOpen, showToast }) => {
  const { expenses, categories, sources, members, savings } = dbData;
  const [formData, setFormData] = useState(() => {
    if (editingExpense) {
      let fullAmt = parseFloat(editingExpense.fullTotalAmount) || parseFloat(editingExpense.totalAmount) || 0;
      if (editingExpense.paymentType === 'installment' && editingExpense.isMonthlyAmount && !editingExpense.fullTotalAmount) {
        fullAmt = parseFloat(editingExpense.totalAmount) * (parseInt(editingExpense.installmentMonths) || 1);
      }
      return { ...editingExpense, totalAmount: fullAmt };
    }
    return { title: '', month: new Date().toISOString().slice(0, 7), categoryId: categories[0]?.id || '', sourceId: sources[0]?.id || '', paymentType: 'normal', totalAmount: '', installmentMonths: '', currentInstallment: '1', payerType: 'single', payerId: members[0]?.id || '', splitDetails: {} };
  });

  const [splitSelection, setSplitSelection] = useState(() => {
    if (editingExpense && editingExpense.payerType === 'split') {
      const sel = {}; Object.keys(editingExpense.splitDetails).forEach(id => sel[id] = true); return sel;
    }
    return {};
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.totalAmount);
    if (isNaN(amount) || amount <= 0) return window.alert("จำนวนเงินไม่ถูกต้อง");

    let finalData = { ...formData, updatedAt: Date.now() };
    let generatedExpenses = [];
    const groupId = (editingExpense && editingExpense.groupId) ? editingExpense.groupId : Date.now().toString();
    let cleanExpenses = editingExpense ? expenses.filter(e => e.id !== editingExpense.id) : expenses;

    if (formData.paymentType === 'installment') {
      const totalMonths = parseInt(formData.installmentMonths);
      if (!totalMonths || totalMonths < 2) return window.alert("ผ่อนชำระต้อง > 1 งวด");
      const monthlyTotalAmount = amount / totalMonths; // ยอดรายเดือน
      let splitData = {};
      
      if (formData.payerType === 'split') {
        const selM = Object.keys(splitSelection).filter(k => splitSelection[k]);
        if (selM.length === 0) return window.alert("เลือกผู้รับผิดชอบอย่างน้อย 1 คน");
        selM.forEach(mId => { splitData[mId] = { amount: monthlyTotalAmount / selM.length, paid: editingExpense?.splitDetails?.[mId]?.paid || false }; });
      }

      if (editingExpense) {
        generatedExpenses.push({ ...finalData, id: editingExpense.id, groupId: editingExpense.groupId || groupId, totalAmount: monthlyTotalAmount, isMonthlyAmount: true, fullTotalAmount: amount, splitDetails: formData.payerType === 'split' ? splitData : undefined, status: formData.payerType === 'split' ? (Object.values(splitData).every(v => v.paid) ? 'paid' : 'pending') : editingExpense.status });
      } else {
        let [editYear, editMonth] = formData.month.split('-').map(Number);
        let baseMonth = editMonth - ((parseInt(formData.currentInstallment) || 1) - 1);
        let baseYear = editYear; while (baseMonth < 1) { baseMonth += 12; baseYear -= 1; }
        
        for (let i = 1; i <= totalMonths; i++) {
          let tm = baseMonth + (i - 1); let ty = baseYear; while (tm > 12) { tm -= 12; ty += 1; }
          let fsData = {}; if (formData.payerType === 'split') Object.keys(splitData).forEach(k => { fsData[k] = { amount: splitData[k].amount, paid: false }; });
          generatedExpenses.push({ ...finalData, id: `${groupId}-${i}`, groupId: groupId, month: `${ty}-${String(tm).padStart(2, '0')}`, totalAmount: monthlyTotalAmount, isMonthlyAmount: true, fullTotalAmount: amount, installmentMonths: totalMonths, currentInstallment: i, splitDetails: formData.payerType === 'split' ? fsData : undefined, status: 'pending', createdAt: Date.now() + i });
        }
      }
    } else {
      delete finalData.installmentMonths; delete finalData.currentInstallment; finalData.totalAmount = amount;
      if (formData.payerType === 'split') {
        const selM = Object.keys(splitSelection).filter(k => splitSelection[k]);
        if (selM.length === 0) return window.alert("เลือกผู้รับผิดชอบอย่างน้อย 1 คน");
        const splitData = {}; selM.forEach(mId => { splitData[mId] = { amount: amount / selM.length, paid: editingExpense?.splitDetails?.[mId]?.paid || false }; });
        finalData.splitDetails = splitData; finalData.status = Object.values(splitData).every(v => v.paid) ? 'paid' : 'pending'; delete finalData.payerId;
      } else { finalData.status = editingExpense ? editingExpense.status : 'pending'; }
      generatedExpenses.push({ ...finalData, id: editingExpense ? editingExpense.id : Date.now().toString(), createdAt: editingExpense ? editingExpense.createdAt : Date.now() });
    }

    const nSrc = sources.find(s => s.id === formData.sourceId);
    let nDeduct = (nSrc && nSrc.name.includes('กองกลาง')) ? generatedExpenses[0].totalAmount : 0;
    let oDeduct = (editingExpense && sources.find(s => s.id === editingExpense.sourceId)?.name.includes('กองกลาง')) ? getDisplayAmount(editingExpense) : 0;
    
    let newSavings = savings;
    if (nDeduct - oDeduct !== 0) {
      const net = nDeduct - oDeduct;
      newSavings = { currentAmount: savings.currentAmount - net, transactions: [{ id: Date.now().toString(), type: net > 0 ? 'deduct' : 'add', amount: Math.abs(net), source: `บิล: ${formData.title}`, date: new Date().toISOString() }, ...savings.transactions].slice(0, 50) };
    }
    updateDB({ expenses: [...generatedExpenses, ...cleanExpenses], savings: newSavings }, true);
    setIsModalOpen(false); showToast(editingExpense ? "อัปเดตเรียบร้อย" : "เพิ่มรายการและสร้างงวดล่วงหน้าสำเร็จ");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className={`bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-3xl p-6 relative max-h-[92dvh] overflow-y-auto custom-scrollbar shadow-2xl animate-slideUp`}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
        <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full"><X size={20} /></button>
        <h2 className={`text-xl sm:text-2xl font-black ${theme.primary} mb-6 border-b-4 border-[#00a950] pb-2 inline-block`}>{editingExpense ? 'แก้ไขข้อมูลบิล' : 'บันทึกค่าใช้จ่ายใหม่'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">ชื่อรายการ / บิลค่าใช้จ่าย</label><input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className={theme.input} placeholder="เช่น ค่าผ่อนบ้าน, ค่าไฟ" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">{formData.paymentType === 'installment' ? (editingExpense ? 'เดือนของบิลนี้' : 'เริ่มผ่อนงวดแรก') : 'เดือนประจำรอบ'}</label><input type="month" required value={formData.month} onChange={e=>setFormData({...formData, month: e.target.value})} className={theme.input} disabled={editingExpense && formData.paymentType === 'installment'} /></div>
            <div><label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">ยอดรวมเต็มบิล (บาท)</label><input type="number" required value={formData.totalAmount} onChange={e=>setFormData({...formData, totalAmount: e.target.value})} className={theme.input} placeholder="0.00" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">หมวดหมู่</label><select value={formData.categoryId} onChange={e=>setFormData({...formData, categoryId: e.target.value})} className={theme.input} required><option value="">เลือก...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">จ่ายผ่านบัญชี</label><select value={formData.sourceId} onChange={e=>setFormData({...formData, sourceId: e.target.value})} className={theme.input} required><option value="">เลือก...</option>{sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="bg-[#f1f9f6] p-4 rounded-2xl border-2 border-emerald-100/60 space-y-4">
            <div><label className={`block text-xs font-black ${theme.primary} uppercase tracking-wider mb-3`}>ประเภทรูปแบบการจ่าย</label><div className="flex space-x-6"><label className="flex items-center text-slate-700 font-bold cursor-pointer text-sm sm:text-base"><input type="radio" value="normal" checked={formData.paymentType === 'normal'} onChange={()=>setFormData({...formData, paymentType: 'normal'})} className="mr-2 w-5 h-5 text-[#00a950]" /> จ่ายเต็ม</label><label className="flex items-center text-slate-700 font-bold cursor-pointer text-sm sm:text-base"><input type="radio" value="installment" checked={formData.paymentType === 'installment'} onChange={()=>setFormData({...formData, paymentType: 'installment'})} className="mr-2 w-5 h-5 text-[#00a950]" /> ผ่อนชำระ</label></div></div>
            {formData.paymentType === 'installment' && (
              <div className="animate-fadeIn grid grid-cols-2 gap-3 pt-1">
                 <div><label className="block text-xs font-bold text-slate-500 mb-1">งวดปัจจุบัน</label><input type="number" required min="1" value={formData.currentInstallment || 1} onChange={e=>setFormData({...formData, currentInstallment: e.target.value})} className={theme.input} /></div>
                 <div><label className="block text-xs font-bold text-slate-500 mb-1">จากทั้งหมด (งวด)</label><input type="number" required min="2" value={formData.installmentMonths} onChange={e=>setFormData({...formData, installmentMonths: e.target.value})} className={theme.input} /></div>
                 {formData.totalAmount && formData.installmentMonths && (<div className="col-span-2 mt-1 bg-white p-3 rounded-xl border border-emerald-100 flex justify-between items-center text-sm font-bold"><span className="text-slate-500">เฉลี่ยตกงวดละ:</span><span className="text-[#00a950] text-base">{formatCurrency(parseFloat(formData.totalAmount) / parseInt(formData.installmentMonths))} / ด.</span></div>)}
              </div>
            )}
          </div>
          <div className="bg-blue-50/40 p-4 rounded-2xl border-2 border-blue-100/60 space-y-4">
             <div><label className={`block text-xs font-black text-blue-900 uppercase tracking-wider mb-3`}>การกระจายความรับผิดชอบ</label><div className="flex space-x-6"><label className="flex items-center text-slate-700 font-bold cursor-pointer text-sm sm:text-base"><input type="radio" value="single" checked={formData.payerType === 'single'} onChange={()=>setFormData({...formData, payerType: 'single'})} className="mr-2 w-5 h-5" /> รายบุคคล</label><label className="flex items-center text-slate-700 font-bold cursor-pointer text-sm sm:text-base"><input type="radio" value="split" checked={formData.payerType === 'split'} onChange={()=>setFormData({...formData, payerType: 'split'})} className="mr-2 w-5 h-5" /> แชร์กัน</label></div></div>
            {formData.payerType === 'single' ? (
              <select value={formData.payerId} onChange={e=>setFormData({...formData, payerId: e.target.value})} className={theme.input} required><option value="">เลือกผู้จ่ายหลัก...</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">{members.map(m => (<label key={m.id} className={`flex items-center p-3 rounded-xl cursor-pointer border-2 transition-all ${splitSelection[m.id] ? 'bg-emerald-50 border-[#00a950] text-[#005a36] font-bold' : 'bg-white border-slate-100 hover:border-emerald-200'}`}><input type="checkbox" checked={!!splitSelection[m.id]} onChange={(e) => setSplitSelection({...splitSelection, [m.id]: e.target.checked})} className="mr-2 w-4 h-4 text-[#00a950]" /> <span className="text-sm truncate">{m.name}</span></label>))}</div>
            )}
          </div>
          <div className="pt-4 flex justify-end space-x-3"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 text-sm">ยกเลิก</button><button type="submit" className={theme.button + " px-8"}>บันทึกข้อมูล</button></div>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbData, setDbData] = useState({ expenses: [], members: [], categories: [], sources: [], savings: { currentAmount: 0, transactions: [] }, lastUpdated: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filters, setFilters] = useState({ month: new Date().toISOString().slice(0, 7), payer: '', category: '', source: '', paymentType: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedForPay, setSelectedForPay] = useState({});
  const [splitSelectModal, setSplitSelectModal] = useState({ isOpen: false, expId: null, members: [] });
  const [savingsAmount, setSavingsAmount] = useState('');
  const [savingsSource, setSavingsSource] = useState('');
  const [savingsType, setSavingsType] = useState('add');

  // ฟังก์ชันดึงข้อมูลจาก Cloud พร้อมระบบป้องกันข้อมูลหาย (Sync Protection)
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    const localStr = localStorage.getItem("moneyPopDB_Sheets");
    const localData = localStr ? JSON.parse(localStr) : null;

    if (!GAS_URL) {
      if (localData) setDbData(localData);
      if (!silent) setIsLoading(false);
      return;
    }
    
    try {
      if(!silent) setIsSyncing(true);
      const res = await fetch(`${GAS_URL}?t=${Date.now()}`, { cache: 'no-store' });
      const cloudData = await res.json();

      // 🛡️ SYNC PROTECTION (ตรวจสอบเวลา) 
      // ถ้าข้อมูลในเครื่องคุณ "ใหม่กว่า" บน Cloud (เช่น เพิ่งบันทึกไปเมื่อกี้แต่เน็ตหลุด/ส่งไม่ติด)
      if (localData && localData.lastUpdated && cloudData.lastUpdated) {
        if (localData.lastUpdated > cloudData.lastUpdated) {
          setDbData(localData); 
          setIsLoading(false); setIsSyncing(false);
          // บังคับยิงข้อมูลชุดใหม่ขึ้นคลาวด์อีกครั้งเงียบๆ
          fetch(GAS_URL, { method: 'POST', redirect: 'follow', body: JSON.stringify(localData), headers: { 'Content-Type': 'text/plain;charset=utf-8' } }).catch(()=>{});
          return;
        }
      }

      // ถ้า Cloud ใหม่กว่า ก็อัปเดตลงเครื่องปกติ
      if (cloudData && cloudData.expenses) {
        setDbData(cloudData);
        localStorage.setItem("moneyPopDB_Sheets", JSON.stringify(cloudData)); 
      } else if (localData) {
        setDbData(localData);
      }
    } catch (e) {
      if (localData) setDbData(localData); // Offline fallback
    }
    setIsLoading(false); setIsSyncing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ฟังก์ชันบันทึกข้อมูลหลัก ที่เอาระบบป้องกัน CORS ออก เพื่อให้ได้ผลลัพธ์การบันทึกที่แท้จริง
  const updateDB = async (newDataFields, showSuccessToast = false) => {
    const ts = Date.now();
    const updatedData = { ...dbData, ...newDataFields, lastUpdated: ts };
    setDbData(updatedData); 
    localStorage.setItem("moneyPopDB_Sheets", JSON.stringify(updatedData)); 
    
    if (!GAS_URL) return;
    setIsSyncing(true);
    try { 
      // นำคำสั่ง mode: 'no-cors' ออก และเปลี่ยนเป็น text/plain แทนเพื่อหลีกเลี่ยงการถูก Block
      const response = await fetch(GAS_URL, { 
        method: 'POST', 
        redirect: 'follow',
        body: JSON.stringify(updatedData), 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' } 
      }); 
      
      if (response.ok && showSuccessToast) {
        showToast("บันทึกข้อมูลขึ้นระบบคลาวด์สำเร็จแล้ว ☁️");
      }
    } catch (e) { 
      console.error(e); 
      showToast("⚠️ ข้อมูลถูกบันทึกไว้ในอุปกรณ์ แต่ส่งขึ้นคลาวด์ไม่สำเร็จ (จะลองใหม่ภายหลัง)");
    }
    setIsSyncing(false);
  };

  const { expenses, members, categories, sources, savings } = dbData;
  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 3500); };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (filters.month && exp.month !== filters.month) return false;
      if (filters.category && exp.categoryId !== filters.category) return false;
      if (filters.source && exp.sourceId !== filters.source) return false;
      if (filters.payer) {
        if (exp.payerType === 'single' && exp.payerId !== filters.payer) return false;
        if (exp.payerType === 'split' && (!exp.splitDetails || !exp.splitDetails[filters.payer])) return false;
      }
      return true;
    });
  }, [expenses, filters]);

  const handleCheckExpense = (expense) => {
    if (selectedForPay[expense.id]) {
      const newSelected = { ...selectedForPay }; delete newSelected[expense.id]; setSelectedForPay(newSelected);
    } else {
      if (expense.payerType === 'single') {
        setSelectedForPay({ ...selectedForPay, [expense.id]: { amount: getDisplayAmount(expense), type: 'single' } });
      } else {
        const unpaidMembers = Object.keys(expense.splitDetails).filter(mId => !expense.splitDetails[mId].paid);
        if (unpaidMembers.length === 0) return; 
        setSplitSelectModal({ isOpen: true, expId: expense.id, expenseData: expense, selectedMembers: unpaidMembers.length === 1 ? unpaidMembers : [], availableMembers: unpaidMembers });
      }
    }
  };

  const processBulkPayment = () => {
    const newExpenses = expenses.map(expense => {
      if (!selectedForPay[expense.id]) return expense; 
      const payData = selectedForPay[expense.id];
      const newExpense = { ...expense };
      if (payData.type === 'single') newExpense.status = 'paid';
      else if (payData.type === 'split') {
        const newSplitDetails = { ...newExpense.splitDetails };
        payData.memberIds.forEach(mId => { newSplitDetails[mId].paid = true; });
        newExpense.splitDetails = newSplitDetails;
        newExpense.status = Object.values(newSplitDetails).every(v => v.paid) ? 'paid' : 'pending';
      }
      return newExpense;
    });
    updateDB({ expenses: newExpenses }, true); setSelectedForPay({});
  };

  const renderDashboard = () => {
    let totalPaid = 0; let totalPending = 0;
    const categoryDataMap = {}; const memberDataMap = {};

    filteredExpenses.forEach(exp => {
      const catName = categories.find(c => c.id === exp.categoryId)?.name || 'ทั่วไป';

      if (exp.payerType === 'single') {
        const amt = getDisplayAmount(exp);
        if (filters.payer && exp.payerId !== filters.payer) return;
        if (exp.status === 'paid') totalPaid += amt; else totalPending += amt;
        categoryDataMap[catName] = (categoryDataMap[catName] || 0) + amt;
        if (!filters.payer) { const mName = members.find(m => m.id === exp.payerId)?.name || 'ไม่ระบุ'; memberDataMap[mName] = (memberDataMap[mName] || 0) + amt; }
      } else if (exp.payerType === 'split') {
        if (filters.payer) {
          const mId = filters.payer;
          if (exp.splitDetails && exp.splitDetails[mId]) {
            const amt = getDisplaySplitAmount(exp, mId);
            if (exp.splitDetails[mId].paid) totalPaid += amt; else totalPending += amt;
            categoryDataMap[catName] = (categoryDataMap[catName] || 0) + amt;
          }
        } else {
          Object.entries(exp.splitDetails || {}).forEach(([mId, detail]) => {
            const amt = getDisplaySplitAmount(exp, mId);
            if (detail.paid) totalPaid += amt; else totalPending += amt;
            categoryDataMap[catName] = (categoryDataMap[catName] || 0) + amt;
            const mName = members.find(m => m.id === mId)?.name || 'ไม่ระบุ';
            memberDataMap[mName] = (memberDataMap[mName] || 0) + amt;
          });
        }
      }
    });

    const pieData = [{ name: 'จ่ายแล้ว', value: totalPaid, color: '#00a950' }, { name: 'รอจ่าย', value: totalPending, color: '#ff5c93' }];
    const catData = Object.keys(categoryDataMap).map(k => ({ name: k, value: categoryDataMap[k] }));
    const memData = Object.keys(memberDataMap).map(k => ({ name: k, value: memberDataMap[k] }));
    const grandTotal = totalPaid + totalPending;

    return (
      <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-6">
        <div className="bg-white px-4 py-3 sm:rounded-2xl border-b-2 border-slate-100 mb-4 sm:mb-6 flex overflow-x-auto custom-scrollbar gap-3 hide-scrollbar snap-x">
          <div className="flex items-center space-x-2 text-[#00a950] font-black shrink-0 snap-start pl-2"><Filter size={20} /></div>
          <input type="month" value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} className="bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#00a950] outline-none" />
          <select value={filters.payer} onChange={e => setFilters({...filters, payer: e.target.value})} className="bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#00a950] outline-none"><option value="">👤 ทุกคน</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
          <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#00a950] outline-none"><option value="">📁 ทุกหมวด</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>

        <div className="px-4 sm:px-0 flex flex-col gap-4 sm:gap-5">
          <div className={`${theme.card} p-5 sm:p-6 bg-gradient-to-br from-[#005a36] to-[#008f43] text-white shadow-xl relative overflow-hidden rounded-[2rem]`}>
            <div className="w-full md:w-7/12 flex flex-col relative z-10">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">ยอดใช้จ่ายจริงเดือนนี้</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">{formatCurrency(grandTotal)}</h2>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/95 text-slate-800 p-3 sm:p-4 rounded-2xl border-b-4 border-[#00a950]">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">ชำระแล้ว</p>
                  <p className="text-base sm:text-xl font-black text-[#005a36] truncate">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="bg-white/95 text-slate-800 p-3 sm:p-4 rounded-2xl border-b-4 border-[#ff5c93]">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">รอจ่าย</p>
                  <p className="text-base sm:text-xl font-black text-[#ff5c93] truncate">{formatCurrency(totalPending)}</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-5/12 hidden md:flex absolute right-0 items-center justify-center h-full">
              <ResponsiveContainer width="90%" height="80%"><PieChart><Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">{pieData.map((e, i) => (<Cell key={`cell-${i}`} fill={e.color} />))}</Pie></PieChart></ResponsiveContainer>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${!filters.payer ? 'md:grid-cols-2' : ''} gap-4 sm:gap-5`}>
            <div className={`${theme.card} p-5 flex flex-col min-h-[280px]`}>
              <h3 className={`text-sm font-black ${theme.primary} mb-4 flex items-center shrink-0 border-b-2 border-slate-100 pb-2`}><ShoppingBag size={18} className="mr-2 text-[#4dabf7]"/> สัดส่วนตามหมวดหมู่</h3>
              <div className="flex-1 min-h-[200px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={catData} layout="vertical" margin={{ left: 10, right: 10 }}><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} width={80} className="font-bold text-slate-600" /><RechartsTooltip cursor={{fill: '#f8f9fa'}} formatter={(val) => formatCurrency(val)} /><Bar dataKey="value" fill="#00a950" radius={[0, 8, 8, 0]} barSize={16}>{catData.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={theme.chartColors[idx % theme.chartColors.length]} />))}</Bar></BarChart></ResponsiveContainer></div>
            </div>
            {!filters.payer && (
              <div className={`${theme.card} p-5 flex flex-col min-h-[280px]`}>
                <h3 className={`text-sm font-black ${theme.primary} mb-2 flex items-center shrink-0 border-b-2 border-slate-100 pb-2`}><Users size={18} className="mr-2 text-[#ff5c93]"/> แยกรายคน</h3>
                <div className="flex-1 min-h-[200px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={memData} innerRadius={50} outerRadius={75} dataKey="value" stroke="#fff" strokeWidth={3}>{memData.map((entry, index) => (<Cell key={`cell-${index}`} fill={theme.chartColors[index % theme.chartColors.length]} />))}</Pie><RechartsTooltip formatter={(v)=>formatCurrency(v)} /><Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} /></PieChart></ResponsiveContainer></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="min-h-[100dvh] bg-[#fcfbf7] flex items-center justify-center text-[#005a36] font-black animate-pulse text-lg">กำลังโหลดข้อมูล...</div>;

  return (
    <div className={`min-h-[100dvh] ${theme.bg} font-sans selection:bg-emerald-100`}>
      <div className="max-w-md sm:max-w-3xl lg:max-w-4xl mx-auto flex flex-col h-[100dvh] overflow-hidden bg-[#fcfbf7] sm:border-x sm:border-slate-200/60 sm:shadow-2xl relative">
        <header className="bg-white px-4 sm:px-6 py-4 flex justify-between items-center border-b-2 border-[#00a950] shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="bg-[#005a36] text-white p-1.5 rounded-xl shadow-md"><Zap size={20} className="text-emerald-400" /></div>
            <div className="text-xl sm:text-2xl font-black tracking-tighter text-[#005a36]">MONEY<span className="text-[#ff5c93]">-POP</span></div>
          </div>
          <div className="flex gap-2 items-center">
            {isSyncing && <span className="text-xs font-bold text-slate-400">Syncing...</span>}
            <button onClick={() => fetchData(true)} className="p-2 text-slate-400 hover:text-[#00a950] transition-colors"><RefreshCw size={18} className={isSyncing ? "animate-spin text-[#00a950]" : ""} /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto sm:p-5 pb-24 custom-scrollbar relative">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'expenses' && (
            <div className="space-y-4 animate-fadeIn pb-6">
              <div className="px-4 sm:px-0 flex justify-between items-end mb-2 pt-2">
                <div><h2 className={`text-2xl font-black ${theme.primary}`}>รายการบิล</h2><p className="text-slate-400 text-xs sm:text-sm font-bold">{filteredExpenses.length} รายการในรอบเดือน</p></div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingExpense(null); setIsModalOpen(true); }} className={`${theme.button} px-4 py-2.5 rounded-2xl flex items-center space-x-1.5`}><Plus size={18} /> <span>เพิ่มบิล</span></button>
                </div>
              </div>
              <div className="bg-white px-4 py-3 sm:rounded-2xl border-b-2 border-slate-100 mb-4 sm:mb-6 flex overflow-x-auto custom-scrollbar gap-3 hide-scrollbar snap-x">
                <div className="flex items-center space-x-2 text-[#00a950] font-black shrink-0 snap-start pl-2"><Filter size={20} /></div>
                <input type="month" value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} className="bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#00a950] outline-none" />
                <select value={filters.payer} onChange={e => setFilters({...filters, payer: e.target.value})} className="bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#00a950] outline-none"><option value="">👤 ทุกคน</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="bg-slate-50 border-2 border-slate-100 text-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#00a950] outline-none"><option value="">📁 ทุกหมวด</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </div>
              {Object.keys(selectedForPay).length > 0 && (
                <div className="sticky top-2 z-40 mx-4 sm:mx-0 bg-white p-4 rounded-2xl border-2 border-[#00a950] shadow-xl flex justify-between items-center mb-4 animate-slideUp">
                  <div><span className="text-emerald-600 text-xs font-black uppercase tracking-wide">รวมชำระ ({Object.keys(selectedForPay).length} บิล)</span><p className="text-slate-800 text-xl font-black">{formatCurrency(Object.values(selectedForPay).reduce((sum, item) => sum + item.amount, 0))}</p></div>
                  <button onClick={processBulkPayment} className={`${theme.button} px-6 py-3 rounded-xl`}>ยืนยันชำระเงิน</button>
                </div>
              )}
              <div className="px-4 sm:px-0 grid gap-3.5">
                {filteredExpenses.map(exp => {
                  const cat = categories.find(c => c.id === exp.categoryId);
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
                  const showAsPaid = displayStatus === 'paid';
                  const isChecked = !!selectedForPay[exp.id];

                  return (
                    <div key={exp.id} className={`${theme.card} p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all duration-300 ${showAsPaid ? 'opacity-60 bg-slate-50 border-dashed' : isChecked ? 'ring-2 ring-[#00a950] bg-emerald-50/20' : 'hover:border-emerald-200'}`}>
                      <div className="flex items-start sm:items-center w-full sm:w-auto">
                        {!showAsPaid && <input type="checkbox" checked={isChecked} onChange={() => handleCheckExpense(exp)} className="w-5 h-5 rounded-md border-slate-300 text-[#00a950] cursor-pointer mr-3 sm:mr-4 mt-1 sm:mt-0" />}
                        <div className={`p-3.5 rounded-2xl mr-3 sm:mr-4 flex-shrink-0 ${showAsPaid ? 'bg-slate-100' : 'bg-white shadow-sm border border-slate-100'}`}>{getIconForCategory(cat?.name)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className={`font-black text-base sm:text-lg truncate ${showAsPaid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{exp.title}</h3>
                            {exp.paymentType === 'installment' && <span className="text-[10px] bg-emerald-50 text-[#005a36] px-2.5 py-0.5 rounded-full font-black border border-emerald-200">งวด {exp.currentInstallment}/{exp.installmentMonths}</span>}
                          </div>
                          {exp.payerType === 'split' && !filters.payer && (
                            <div className="mt-3 text-xs space-y-1.5 border-t border-slate-100 pt-2 w-full sm:max-w-xs">
                              {Object.entries(exp.splitDetails || {}).map(([mId, detail]) => {
                                const m = members.find(mbr => mbr.id === mId);
                                return (
                                  <div key={mId} className={`flex justify-between ${detail.paid ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}>
                                    <span className="truncate pr-2">• {m?.name}</span>
                                    <span>{formatCurrency(getDisplaySplitAmount(exp, mId))} {detail.paid ? '✔️' : ''}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 w-full sm:w-auto flex sm:flex-col justify-between sm:justify-end items-center sm:items-end">
                        <div className={`text-lg sm:text-xl font-black ${showAsPaid ? 'text-slate-400' : 'text-slate-800'}`}>{formatCurrency(displayAmount)}</div>
                        <div className="flex items-center space-x-1.5 mt-1 sm:mt-1.5">
                          {showAsPaid ? <span className="text-[#005a36] text-xs font-black bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">ชำระแล้ว</span> : isPartiallyPaid ? <span className="text-amber-700 text-xs font-black bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">ชำระบางส่วน</span> : <span className="text-rose-600 text-xs font-black bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">รอชำระ</span>}
                          {(showAsPaid || isPartiallyPaid) && <button onClick={() => { if(window.confirm('ยกเลิกสถานะการจ่ายเงิน?')) { const n = {...exp}; if(n.payerType==='single') n.status='pending'; else { Object.keys(n.splitDetails).forEach(k => { if(!filters.payer || filters.payer===k) n.splitDetails[k].paid = false; }); n.status='pending'; } updateDB({expenses: expenses.map(e => e.id===exp.id ? n : e)}, true); } }} className="p-1.5 text-slate-400 hover:text-amber-600 bg-slate-50 rounded-xl"><Undo size={15} /></button>}
                          <button onClick={() => { setEditingExpense(exp); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-[#00a950] bg-slate-50 rounded-xl"><Edit size={15} /></button>
                          <button onClick={() => { const isGroup = exp.groupId && window.confirm("ลบบิลผ่อนชำระ 'ทุกงวดที่เหลือ' ด้วยไหม?\nCancel = ลบเฉพาะเดือนนี้"); updateDB({expenses: expenses.filter(e => isGroup ? e.groupId !== exp.groupId : e.id !== exp.id)}, true); showToast("ลบสำเร็จ"); }} className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-xl"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {activeTab === 'savings' && (
            <div className="space-y-4 sm:space-y-5 animate-fadeIn pb-6 px-4 sm:px-0">
              <div className={`${theme.card} p-8 text-center bg-gradient-to-br from-[#005a36] to-[#12b886] text-white rounded-[2rem] shadow-lg relative overflow-hidden`}><div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"><PiggyBank size={32} /></div><h2 className="text-emerald-100 text-xs font-black uppercase tracking-widest mb-0.5">เงินกองกลางครอบครัวคงเหลือ</h2><p className="text-4xl sm:text-5xl font-black">{formatCurrency(savings.currentAmount)}</p></div>
              <div className={`${theme.card} p-5`}><h3 className={`text-base font-black ${theme.primary} mb-4 flex items-center border-b-2 border-slate-50 pb-2`}><Edit size={16} className="mr-2 text-[#00a950]"/> บันทึกกองกลาง</h3>
                <form onSubmit={e => { e.preventDefault(); const v = parseFloat(savingsAmount); if(isNaN(v)) return; updateDB({savings: {currentAmount: savingsType==='add' ? savings.currentAmount+v : savings.currentAmount-v, transactions: [{id:Date.now().toString(), type:savingsType, amount:v, source:savingsSource, date:new Date().toISOString()}, ...savings.transactions].slice(0,50)}}, true); setSavingsAmount(''); setSavingsSource(''); }} className="flex flex-col gap-3.5">
                  <div className="flex bg-slate-100 p-1 rounded-xl"><label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-black transition-colors ${savingsType === 'add' ? 'bg-white shadow-sm text-[#005a36]' : 'text-slate-400'}`}><input type="radio" checked={savingsType === 'add'} onChange={()=>setSavingsType('add')} className="hidden" /> ฝากเพิ่ม (+)</label><label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-black transition-colors ${savingsType === 'deduct' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-400'}`}><input type="radio" checked={savingsType === 'deduct'} onChange={()=>setSavingsType('deduct')} className="hidden" /> ถอนออก (-)</label></div>
                  <input type="number" placeholder="ยอดเงิน" value={savingsAmount} onChange={e=>setSavingsAmount(e.target.value)} className={theme.input} required />
                  <input type="text" placeholder="ระบุเหตุผล" value={savingsSource} onChange={e=>setSavingsSource(e.target.value)} className={theme.input} required />
                  <button type="submit" className={theme.button + " py-3.5"}>ยืนยัน</button>
                </form>
              </div>
            </div>
          )}
          {activeTab === 'settings' && <div className="space-y-5 animate-fadeIn pb-6 px-4 sm:px-0"><h2 className={`text-xl font-black ${theme.primary} pt-2`}>จัดการการตั้งค่าระบบ</h2><ListManager title="สมาชิกครอบครัว" data={members} updateDB={updateDB} dataKey="members" hasEmail={true}/><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><ListManager title="หมวดหมู่ค่าใช้จ่าย" data={categories} updateDB={updateDB} dataKey="categories" isCategory={true} /><ListManager title="ช่องทางการจ่าย" data={sources} updateDB={updateDB} dataKey="sources" /></div></div>}
        </main>

        <nav className="bg-white border-t-2 border-slate-100 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 px-4 sticky bottom-0 z-40 shrink-0 sm:top-0 sm:bottom-auto sm:border-b-2 sm:border-t-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <div className="flex space-x-2 w-full justify-around max-w-lg mx-auto sm:max-w-none sm:justify-start">
            {[{ id: 'dashboard', icon: <Home size={22}/>, label: 'ภาพรวม' }, { id: 'expenses', icon: <CreditCard size={22}/>, label: 'บิล' }, { id: 'savings', icon: <PiggyBank size={22}/>, label: 'กองกลาง' }, { id: 'settings', icon: <Settings size={22}/>, label: 'ตั้งค่า' }].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center justify-center w-16 h-14 sm:flex-row sm:w-auto sm:px-6 sm:py-2 sm:rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'text-[#005a36] sm:bg-[#00a950] sm:text-white' : 'text-slate-400'}`}>
                <div className={`mb-1 sm:mb-0 sm:mr-2 ${activeTab === item.id ? 'scale-110 sm:scale-100' : ''}`}>{item.icon}</div><span className={`text-[10px] sm:text-sm font-black tracking-wide ${activeTab === item.id ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {isModalOpen && <ExpenseFormModal editingExpense={editingExpense} dbData={dbData} updateDB={updateDB} setIsModalOpen={setIsModalOpen} showToast={showToast} />}
      {splitSelectModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 text-center shadow-2xl animate-slideUp">
             <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div><h3 className={`text-lg font-black ${theme.primary} mb-1`}>ระบุสมาชิกที่ต้องการจ่าย</h3>
             <div className="space-y-2 mb-6 text-left mt-4">
               {splitSelectModal.availableMembers.map(mId => {
                 const m = members.find(mbr => mbr.id === mId);
                 const isSelected = splitSelectModal.selectedMembers.includes(mId);
                 return (
                   <div key={mId} onClick={() => setSplitSelectModal(s => ({...s, selectedMembers: isSelected ? s.selectedMembers.filter(id=>id!==mId) : [...s.selectedMembers, mId]}))} className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${isSelected ? 'bg-emerald-50 border-[#00a950]' : 'bg-white border-slate-100'}`}>
                     <div className="flex items-center gap-2.5"><div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-[#00a950] border-[#00a950]' : 'border-slate-300'}`}>{isSelected && <Check size={14} className="text-white"/>}</div><span className={`text-sm font-bold ${isSelected ? 'text-[#005a36]' : 'text-slate-700'}`}>{m?.name}</span></div>
                     <span className="text-sm font-black text-slate-700">{formatCurrency(getDisplaySplitAmount(splitSelectModal.expenseData, mId))}</span>
                   </div>
                 )
               })}
             </div>
             <div className="flex gap-2.5">
               <button onClick={() => setSplitSelectModal({isOpen: false, expId: null, members: []})} className="flex-1 py-3 bg-slate-100 font-bold rounded-xl text-slate-600 text-sm">ยกเลิก</button>
               <button onClick={() => { let amt=0; splitSelectModal.selectedMembers.forEach(mId => amt+=getDisplaySplitAmount(splitSelectModal.expenseData, mId)); setSelectedForPay({...selectedForPay, [splitSelectModal.expId]: {amount:amt, type:'split', memberIds: splitSelectModal.selectedMembers}}); setSplitSelectModal({isOpen: false, expId: null, members: []}); }} className={`flex-1 py-3 font-bold rounded-xl text-sm ${splitSelectModal.selectedMembers.length > 0 ? theme.button : 'bg-slate-200 text-slate-400'}`}>ยืนยันเลือกบิล</button>
             </div>
          </div>
        </div>
      )}
      
      {toastMessage && <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3.5 rounded-full shadow-2xl font-black text-sm flex items-center animate-slideDown"><Check size={18} className="mr-2 text-emerald-400" />{toastMessage}</div>}
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #00a950; border-radius: 10px; } .hide-scrollbar::-webkit-scrollbar { display: none; } .pb-safe { padding-bottom: env(safe-area-inset-bottom); } .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; } .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`}} />
    </div>
  );
}