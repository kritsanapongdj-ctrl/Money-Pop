/* eslint-disable */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer
} from 'recharts';
import { 
  Home, CreditCard, PiggyBank, Settings, Plus, Check, Trash2, Edit, 
  Filter, X, ShoppingBag, Coffee, Car, Home as HomeIcon, Smartphone,
  Zap, Image as ImageIcon, Users, HeartPulse, ShoppingCart, RefreshCw,
  Download, Upload
} from 'lucide-react';

const GAS_URL = "https://script.google.com/macros/s/AKfycbzbO-BbqufnRT6kZ1j8u8PLmhxPM3MSCY_VRZIUOsV6KlGIbGeOAgBVH_7HnVBSvSne/exec"; 

const theme = {
  bg: "bg-[#0B0F19] text-slate-100", card: "bg-[#161C2D]/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-slate-800/60 rounded-3xl",
  primary: "text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.4)]", button: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] rounded-xl font-bold transition-all active:scale-95",
  input: "bg-[#0B0F19] border border-slate-800 text-slate-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 rounded-xl p-3 w-full outline-none placeholder:text-slate-500",
  chartColors: ['#06b6d4', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'] 
};

const formatCurrency = (amount) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(parseFloat(amount) || 0);

const getIconForCategory = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('ช้อป') || n.includes('shopee') || n.includes('lazada')) return <ShoppingBag className="text-orange-500" />;
  if (n.includes('อาหาร') || n.includes('กิน') || n.includes('กาแฟ')) return <Coffee className="text-amber-500" />;
  if (n.includes('รถ') || n.includes('เดินทาง') || n.includes('น้ำมัน')) return <Car className="text-emerald-500" />;
  if (n.includes('บ้าน') || n.includes('เช่า')) return <HomeIcon className="text-blue-500" />;
  if (n.includes('เน็ต') || n.includes('โทรศัพท์')) return <Smartphone className="text-indigo-500" />;
  if (n.includes('ไฟ') || n.includes('น้ำ')) return <Zap className="text-yellow-500" />;
  if (n.includes('ยา') || n.includes('สุขภาพ')) return <HeartPulse className="text-rose-500" />;
  if (n.includes('ของใช้')) return <ShoppingCart className="text-teal-500" />;
  return <CreditCard className="text-slate-400" />;
};

const ListManager = ({ title, data, updateDB, dataKey, icon: Icon, hasEmail }) => {
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  return (
    <div className={`${theme.card} p-5`}>
      <h3 className={`font-bold ${theme.primary} mb-4 flex items-center`}>{Icon && <Icon size={18} className="mr-2"/>}{title}</h3>
      <div className="flex gap-2 mb-4">
        <input type="text" value={name} onChange={e=>setName(e.target.value)} className={theme.input} placeholder={`ชื่อ${title}...`} />
        {hasEmail && <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className={theme.input} placeholder="อีเมล..." />}
        <button onClick={() => { if(name.trim()) { updateDB({ [dataKey]: [...data, { id: Date.now().toString(), name, email }] }); setName(''); setEmail(''); } }} className={`${theme.button} px-4 rounded-xl`}><Plus size={20}/></button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {data.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-[#0B0F19]/50 p-3 rounded-xl border border-slate-800/50">
            <div><span className="font-bold text-sm text-slate-200">{item.name}</span> {item.email && <span className="block text-xs text-slate-500">{item.email}</span>}</div>
            <button onClick={() => updateDB({ [dataKey]: data.filter(i => String(i.id) !== String(item.id)) })} className="text-slate-500 hover:text-pink-500 transition-colors"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpenseFormModal = ({ editingExpense, dbData, updateDB, close, showToast }) => {
  const [formData, setFormData] = useState(() => {
    if (editingExpense) {
      // ป้องกันยอดเต็มบิลหายเมื่อแก้ไขรายการ
      let fullAmt = parseFloat(editingExpense.fullTotalAmount) || parseFloat(editingExpense.totalAmount) || 0;
      if (editingExpense.paymentType === 'installment' && editingExpense.isMonthlyAmount && !editingExpense.fullTotalAmount) {
        fullAmt = parseFloat(editingExpense.totalAmount) * (parseInt(editingExpense.installmentMonths) || 1);
      }
      return { ...editingExpense, totalAmount: fullAmt };
    }
    return {
      title: '', month: new Date().toISOString().slice(0, 7), categoryId: dbData.categories[0]?.id || '', sourceId: dbData.sources[0]?.id || '',
      paymentType: 'normal', totalAmount: '', installmentMonths: '', currentInstallment: '1', payerType: 'single', payerId: dbData.members[0]?.id || '', splitDetails: {}
    };
  });
  
  const [splitSelection, setSplitSelection] = useState(() => editingExpense?.payerType === 'split' ? Object.keys(editingExpense.splitDetails).reduce((acc, id) => ({...acc, [id]: true}), {}) : {});

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.totalAmount);
    if (isNaN(amount) || amount <= 0) return alert("ยอดเงินไม่ถูกต้อง");

    let cleanExpenses = editingExpense ? dbData.expenses.filter(exp => editingExpense.groupId ? String(exp.groupId) !== String(editingExpense.groupId) : String(exp.id) !== String(editingExpense.id)) : dbData.expenses;
    let newExpenses = [];
    const groupId = editingExpense?.groupId || Date.now().toString();
    const baseData = { ...formData, updatedAt: Date.now() };

    if (formData.paymentType === 'installment') {
      const tMonths = parseInt(formData.installmentMonths);
      if (tMonths < 2) return alert("ผ่อนชำระต้อง > 1 งวด");
      const mAmount = amount / tMonths; // ยอดรายเดือน
      let [y, m] = formData.month.split('-').map(Number);
      let bMonth = m - (parseInt(formData.currentInstallment) || 1) + 1; let bYear = y;
      while (bMonth < 1) { bMonth += 12; bYear -= 1; }

      let splitData = {};
      if (formData.payerType === 'split') {
        const sel = Object.keys(splitSelection).filter(k => splitSelection[k]);
        if (sel.length === 0) return alert("เลือกผู้จ่ายอย่างน้อย 1 คน");
        sel.forEach(id => splitData[id] = { amount: mAmount / sel.length, paid: false });
      }

      for (let i = 1; i <= tMonths; i++) {
        let tm = bMonth + i - 1; let ty = bYear; while (tm > 12) { tm -= 12; ty += 1; }
        newExpenses.push({
          ...baseData, id: `${groupId}-${i}`, groupId, month: `${ty}-${String(tm).padStart(2, '0')}`,
          totalAmount: mAmount, fullTotalAmount: amount, isMonthlyAmount: true,
          installmentMonths: tMonths, currentInstallment: i,
          splitDetails: formData.payerType === 'split' ? splitData : undefined, status: 'pending', createdAt: Date.now() + i
        });
      }
    } else {
      baseData.totalAmount = amount; delete baseData.installmentMonths; delete baseData.currentInstallment;
      if (formData.payerType === 'split') {
        const sel = Object.keys(splitSelection).filter(k => splitSelection[k]);
        if (sel.length === 0) return alert("เลือกผู้จ่ายอย่างน้อย 1 คน");
        const splitData = {}; sel.forEach(id => splitData[id] = { amount: amount / sel.length, paid: editingExpense?.splitDetails?.[id]?.paid || false, paidMonth: editingExpense?.splitDetails?.[id]?.paidMonth || null, paidAt: editingExpense?.splitDetails?.[id]?.paidAt || null });
        baseData.splitDetails = splitData; baseData.status = Object.values(splitData).every(v => v.paid) ? 'paid' : 'pending'; delete baseData.payerId;
      } else { 
        baseData.status = editingExpense?.status || 'pending'; 
        baseData.paidMonth = editingExpense?.paidMonth || null;
        baseData.paidAt = editingExpense?.paidAt || null;
        delete baseData.splitDetails; 
      }
      baseData.id = editingExpense?.id || Date.now().toString(); baseData.createdAt = editingExpense?.createdAt || Date.now();
      newExpenses.push(baseData);
    }

    updateDB({ expenses: [...newExpenses, ...cleanExpenses] });
    close(); showToast(editingExpense ? "อัปเดตเรียบร้อย" : "เพิ่มบิลสำเร็จ");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161C2D] border border-slate-800/80 w-full max-w-md rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-5"><h2 className={`text-xl font-bold ${theme.primary}`}>{editingExpense ? 'แก้ไขบิล' : 'เพิ่มบิลใหม่'}</h2><button onClick={close} className="text-slate-500 hover:text-slate-300"><X/></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className={theme.input} placeholder="ชื่อรายการ" />
          <div className="grid grid-cols-2 gap-3">
            <input type="month" required value={formData.month} onChange={e=>setFormData({...formData, month: e.target.value})} className={theme.input} />
            <input type="number" required placeholder="ยอดรวมบิล" value={formData.totalAmount} onChange={e=>setFormData({...formData, totalAmount: e.target.value})} className={theme.input} />
          </div>
          <div className="grid grid-cols-2 gap-3"><select value={formData.categoryId} onChange={e=>setFormData({...formData, categoryId: e.target.value})} className={theme.input} required><option value="">หมวดหมู่...</option>{dbData.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={formData.sourceId} onChange={e=>setFormData({...formData, sourceId: e.target.value})} className={theme.input} required><option value="">จ่ายจาก...</option>{dbData.sources.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
            <div className="flex gap-4 mb-2"><label className="flex items-center text-sm font-medium text-slate-300"><input type="radio" value="normal" checked={formData.paymentType==='normal'} onChange={()=>setFormData({...formData, paymentType:'normal'})} className="mr-2 accent-cyan-500"/> จ่ายเต็ม</label><label className="flex items-center text-sm font-medium text-slate-300"><input type="radio" value="installment" checked={formData.paymentType==='installment'} onChange={()=>setFormData({...formData, paymentType:'installment'})} className="mr-2 accent-cyan-500"/> ผ่อนชำระ</label></div>
            {formData.paymentType === 'installment' && <div className="grid grid-cols-2 gap-3 mt-2"><input type="number" placeholder="งวดปัจจุบัน" required min="1" value={formData.currentInstallment||1} onChange={e=>setFormData({...formData, currentInstallment: e.target.value})} className={theme.input} /><input type="number" placeholder="รวมกี่งวด" required min="2" value={formData.installmentMonths} onChange={e=>setFormData({...formData, installmentMonths: e.target.value})} className={theme.input} /></div>}
          </div>
          <div className="bg-cyan-950/20 p-3 rounded-xl border border-cyan-900/30">
            <div className="flex gap-4 mb-2"><label className="flex items-center text-sm font-medium text-cyan-100"><input type="radio" value="single" checked={formData.payerType==='single'} onChange={()=>setFormData({...formData, payerType:'single'})} className="mr-2 accent-cyan-500"/> จ่ายคนเดียว</label><label className="flex items-center text-sm font-medium text-cyan-100"><input type="radio" value="split" checked={formData.payerType==='split'} onChange={()=>setFormData({...formData, payerType:'split'})} className="mr-2 accent-cyan-500"/> หารกัน</label></div>
            {formData.payerType === 'single' ? <select value={formData.payerId} onChange={e=>setFormData({...formData, payerId: e.target.value})} className={theme.input} required><option value="">ผู้รับผิดชอบ...</option>{dbData.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select> : <div className="grid grid-cols-2 gap-2">{dbData.members.map(m=><label key={m.id} className="flex items-center text-sm text-slate-300"><input type="checkbox" checked={!!splitSelection[m.id]} onChange={e=>setSplitSelection({...splitSelection, [m.id]: e.target.checked})} className="mr-2 accent-cyan-500" /> {m.name}</label>)}</div>}
          </div>
          <button type="submit" className={`${theme.button} w-full py-3 mt-2 text-shadow-sm`}>บันทึกบิล</button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [dbData, setDbData] = useState({ expenses: [], members: [], categories: [], sources: [], savings: { currentAmount: 0, transactions: [] } });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filters, setFilters] = useState({ month: new Date().toISOString().slice(0, 7), payer: '', category: '' });
  const [modal, setModal] = useState({ open: false, edit: null });
  const [selectedForPay, setSelectedForPay] = useState({});
  const [splitModal, setSplitModal] = useState({ open: false, expId: null, members: [] });
  const [toast, setToast] = useState('');

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (!GAS_URL) return;
    try {
      if(!silent) setIsSyncing(true);
      const res = await fetch(`${GAS_URL}?t=${Date.now()}`);
      const data = await res.json();
      if (data && Object.keys(data).length > 0) { setDbData(prev => ({...prev, ...data})); localStorage.setItem("moneyPopDB", JSON.stringify(data)); }
    } catch (e) { const local = localStorage.getItem("moneyPopDB"); if (local) setDbData(JSON.parse(local)); }
    if (!silent) setIsLoading(false); setIsSyncing(false);
  }, []);

  useEffect(() => { 
    fetchData(); 
    const onFocus = () => fetchData(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchData]);

  const updateDB = async (newDataFields) => {
    const updated = { ...dbData, ...newDataFields };
    setDbData(updated); localStorage.setItem("moneyPopDB", JSON.stringify(updated));
    if (!GAS_URL) return; setIsSyncing(true);
    try { await fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(updated) }); } catch (e) {}
    setIsSyncing(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleExportData = () => {
    const dataStr = JSON.stringify(dbData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MoneyPop_Backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("ดาวน์โหลดข้อมูล Backup สำเร็จ");
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData && typeof importedData === 'object' && ('expenses' in importedData || 'categories' in importedData)) {
          if (window.confirm("คุณต้องการนำเข้าข้อมูลนี้มาแทนที่ข้อมูลปัจจุบันใช่หรือไม่? ข้อมูลเดิมจะถูกเขียนทับ")) {
             updateDB(importedData);
             showToast("นำเข้าข้อมูลและอัปเดตระบบสำเร็จ");
          }
        } else {
          alert("รูปแบบไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์ JSON ที่ได้จากการ Backup ของ Money-Pop");
        }
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์: " + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = null; 
  };

  // กรองข้อมูลโดยเปรียบเทียบเป็น String เสมอ เพื่อป้องกันข้อผิดพลาดจากประเภทข้อมูล
  const filteredExps = useMemo(() => dbData.expenses.filter(exp => {
    if (filters.category && String(exp.categoryId) !== String(filters.category)) return false;
    if (filters.payer && (exp.payerType === 'single' ? String(exp.payerId) !== String(filters.payer) : !exp.splitDetails?.[filters.payer])) return false;
    
    if (!filters.month || exp.month === filters.month) return true;
    if (exp.month < filters.month) {
      if (exp.month < '2026-06') return false; // ป้องกันการยกยอดข้อมูลเก่าก่อนเดือน 06/2026
      if (exp.payerType === 'single') {
        return !exp.paidMonth || exp.paidMonth >= filters.month;
      } else {
        return Object.values(exp.splitDetails).some(d => !d.paidMonth || d.paidMonth >= filters.month);
      }
    }
    return false;
  }), [dbData.expenses, filters]);

  const togglePay = (exp) => {
    if (selectedForPay[exp.id]) { 
      const n = {...selectedForPay}; delete n[exp.id]; setSelectedForPay(n); 
    }
    else {
      if (exp.payerType === 'single') setSelectedForPay({...selectedForPay, [exp.id]: { amount: parseFloat(exp.totalAmount) || 0, type: 'single' }});
      else {
        if (filters.payer) {
           // ถ้าระบุตัวผู้จ่ายไว้แล้ว ให้ติ๊กเลือกจ่ายได้เลย ไม่ต้องเด้ง Modal ควานหา
           if (!exp.splitDetails[filters.payer]?.paid) {
             setSelectedForPay({...selectedForPay, [exp.id]: { amount: parseFloat(exp.splitDetails[filters.payer].amount) || 0, type: 'split', ids: [filters.payer] }});
           }
        } else {
          const unpaid = Object.keys(exp.splitDetails).filter(id => !exp.splitDetails[id].paid);
          if (unpaid.length > 0) setSplitModal({ open: true, expId: exp.id, exp, sel: unpaid.length === 1 ? unpaid : [], avail: unpaid });
        }
      }
    }
  };

  const confirmSplitPay = () => {
    if(splitModal.sel.length === 0) return;
    const amt = splitModal.sel.reduce((sum, id) => sum + (parseFloat(splitModal.exp.splitDetails[id].amount) || 0), 0);
    setSelectedForPay({...selectedForPay, [splitModal.expId]: { amount: amt, type: 'split', ids: splitModal.sel }});
    setSplitModal({ open: false });
  };

  const bulkPay = () => {
    const pMonth = filters.month || new Date().toISOString().slice(0, 7);
    const pAt = Date.now();
    const newExps = dbData.expenses.map(e => {
      if (!selectedForPay[e.id]) return e;
      const pd = selectedForPay[e.id]; const ne = {...e};
      if (pd.type === 'single') {
        ne.status = 'paid'; ne.paidMonth = pMonth; ne.paidAt = pAt;
      } else { 
        const ns = {...ne.splitDetails}; 
        pd.ids.forEach(id => { 
          if (ns[id]) { ns[id].paid = true; ns[id].paidMonth = pMonth; ns[id].paidAt = pAt; }
        }); 
        ne.splitDetails = ns; 
        ne.status = Object.values(ns).every(v=>v.paid) ? 'paid' : 'pending'; 
      }
      return ne;
    });
    updateDB({ expenses: newExps }); setSelectedForPay({}); showToast("ชำระเงินเรียบร้อย");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-cyan-400 bg-[#0B0F19]">กำลังโหลด...</div>;

  return (
    <div className={`min-h-[100dvh] ${theme.bg}`}>
      <div className="max-w-md sm:max-w-3xl lg:max-w-5xl mx-auto flex flex-col h-[100dvh] bg-[#0B0F19] border-x border-slate-800 shadow-2xl shadow-cyan-900/10">
        <header className="bg-[#161C2D]/90 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-slate-800/80 z-30">
          <div className="text-xl font-black text-slate-100 flex items-center tracking-tight"><Zap size={20} className="mr-1 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" /> MONEY<span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">-POP</span></div>
          {isSyncing ? <RefreshCw size={18} className="animate-spin text-cyan-500" /> : <button onClick={()=>fetchData(true)} className="text-slate-400 hover:text-cyan-400 transition-colors"><RefreshCw size={18}/></button>}
        </header>

        <main className="flex-1 overflow-y-auto sm:p-6 pb-20 custom-scrollbar">
          <div className="sticky top-0 bg-[#0B0F19]/80 backdrop-blur-xl z-10 px-4 py-3 border-b border-slate-800/50 mb-4 flex gap-2 shadow-sm">
            <input type="month" value={filters.month} onChange={e=>setFilters({...filters, month: e.target.value})} className="bg-[#161C2D] border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm font-medium w-1/3 focus:border-cyan-500 outline-none" />
            <select value={filters.payer} onChange={e=>setFilters({...filters, payer: e.target.value})} className="bg-[#161C2D] border border-slate-700 text-slate-200 rounded-lg px-2 py-2 text-sm w-1/3 focus:border-cyan-500 outline-none"><option value="">👤 ทุกคน</option>{dbData.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <select value={filters.category} onChange={e=>setFilters({...filters, category: e.target.value})} className="bg-[#161C2D] border border-slate-700 text-slate-200 rounded-lg px-2 py-2 text-sm w-1/3 focus:border-cyan-500 outline-none"><option value="">📁 หมวด</option>{dbData.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>

          {tab === 'dashboard' && (() => {
            let tPaid = 0, tPend = 0; const cMap = {}, mMap = {};
            filteredExps.forEach(e => {
              const cat = dbData.categories.find(c=>String(c.id)===String(e.categoryId))?.name || 'อื่นๆ';
              if (e.payerType === 'single') {
                if(filters.payer && String(e.payerId) !== String(filters.payer)) return;
                let isPaidInView = filters.month ? (e.paidMonth === filters.month) : (e.status === 'paid');
                let isPendInView = filters.month ? (!e.paidMonth || e.paidMonth > filters.month) : (e.status !== 'paid');
                const a = parseFloat(e.totalAmount) || 0; 
                if (isPaidInView) { tPaid += a; cMap[cat] = (cMap[cat]||0)+a; }
                else if (isPendInView) { tPend += a; cMap[cat] = (cMap[cat]||0)+a; }
                if(!filters.payer && (isPaidInView || isPendInView)) {
                  const mName = dbData.members.find(m=>String(m.id)===String(e.payerId))?.name||'ไม่ระบุ';
                  mMap[mName] = (mMap[mName]||0)+a;
                }
              } else {
                Object.entries(e.splitDetails).forEach(([id, d]) => {
                  if(filters.payer && String(id) !== String(filters.payer)) return;
                  let isPaidInView = filters.month ? (d.paidMonth === filters.month) : d.paid;
                  let isPendInView = filters.month ? (!d.paidMonth || d.paidMonth > filters.month) : !d.paid;
                  const a = parseFloat(d.amount) || 0; 
                  if (isPaidInView) { tPaid += a; cMap[cat] = (cMap[cat]||0)+a; }
                  else if (isPendInView) { tPend += a; cMap[cat] = (cMap[cat]||0)+a; }
                  if(!filters.payer && (isPaidInView || isPendInView)) {
                    const mName = dbData.members.find(m=>String(m.id)===String(id))?.name||'ไม่ระบุ';
                    mMap[mName] = (mMap[mName]||0)+a;
                  }
                });
              }
            });
            return (
              <div className="px-4 sm:px-0 space-y-4">
                <div className={`${theme.card} p-5 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#082f49] text-white border-cyan-500/30 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
                  <p className="text-cyan-100/80 text-sm mb-1 font-medium z-10 relative">ยอดใช้จ่ายรวมเดือนนี้</p>
                  <h2 className="text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)] z-10 relative">{formatCurrency(tPaid + tPend)}</h2>
                  <div className="grid grid-cols-2 gap-3 z-10 relative"><div className="bg-[#0B0F19]/60 backdrop-blur-md p-3 rounded-xl border-l-4 border-cyan-500 shadow-inner"><p className="text-xs font-bold text-slate-400">ชำระแล้ว</p><p className="text-lg font-black text-cyan-400">{formatCurrency(tPaid)}</p></div><div className="bg-[#0B0F19]/60 backdrop-blur-md p-3 rounded-xl border-l-4 border-pink-500 shadow-inner"><p className="text-xs font-bold text-slate-400">รอชำระ</p><p className="text-lg font-black text-pink-400">{formatCurrency(tPend)}</p></div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`${theme.card} p-4 h-64`}><h3 className="text-sm font-bold text-cyan-400 mb-2">แยกตามหมวดหมู่</h3><ResponsiveContainer><BarChart data={Object.keys(cMap).map(k=>({n:k, v:cMap[k]}))} layout="vertical" margin={{left:10}}><XAxis type="number" hide /><YAxis dataKey="n" type="category" width={70} tick={{fontSize:11, fill:'#94a3b8'}}/><RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9'}} formatter={v=>formatCurrency(v)}/><Bar dataKey="v" fill="#06b6d4" radius={[0,4,4,0]} barSize={20}><Cell fill="url(#colorCyan)"/></Bar></BarChart></ResponsiveContainer>
                    <svg width="0" height="0"><defs><linearGradient id="colorCyan" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs></svg>
                  </div>
                  {!filters.payer && <div className={`${theme.card} p-4 h-64`}><h3 className="text-sm font-bold text-cyan-400 mb-2">แยกรายบุคคล</h3><ResponsiveContainer><PieChart><Pie data={Object.keys(mMap).map(k=>({n:k, v:mMap[k]}))} dataKey="v" nameKey="n" innerRadius={40} outerRadius={70} stroke="none">{Object.keys(mMap).map((_,i)=><Cell key={i} fill={theme.chartColors[i%5]}/>)}</Pie><RechartsTooltip contentStyle={{backgroundColor: '#0B0F19', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9'}} formatter={v=>formatCurrency(v)}/><Legend iconType="circle" wrapperStyle={{fontSize:'12px', color:'#cbd5e1'}}/></PieChart></ResponsiveContainer></div>}
                </div>
              </div>
            );
          })()}

          {tab === 'expenses' && (
            <div className="px-4 sm:px-0">
              <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-slate-100 flex items-center"><Zap size={20} className="mr-2 text-cyan-400"/> รายการบิลทั้งหมด</h2><button onClick={() => setModal({open:true, edit:null})} className={`${theme.button} px-4 py-2 flex items-center text-sm`}><Plus size={16} className="mr-1"/>เพิ่มบิล</button></div>
              {Object.keys(selectedForPay).length > 0 && <div className="sticky top-16 z-20 bg-[#161C2D]/90 backdrop-blur-md p-4 rounded-xl border border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.2)] flex justify-between items-center mb-4 animate-fadeIn"><div><span className="text-cyan-400 text-xs font-bold">เลือกชำระ {Object.keys(selectedForPay).length} รายการ</span><p className="text-slate-100 text-xl font-black">{formatCurrency(Object.values(selectedForPay).reduce((s,i)=>s+(parseFloat(i.amount)||0),0))}</p></div><button onClick={bulkPay} className={`${theme.button} px-5 py-2`}>ยืนยันชำระ</button></div>}
              <div className="space-y-3">
                {filteredExps.map(e => {
                  const cat = dbData.categories.find(c=>String(c.id)===String(e.categoryId));
                  let amt = parseFloat(e.totalAmount) || 0;
                  let st = e.status, isPart = false, pMonth = e.paidMonth;
                  if (e.payerType === 'split') {
                    if (filters.payer) { 
                      amt = parseFloat(e.splitDetails[filters.payer]?.amount) || 0; 
                      st = e.splitDetails[filters.payer]?.paid ? 'paid' : 'pending'; 
                      pMonth = e.splitDetails[filters.payer]?.paidMonth;
                    } else { 
                      isPart = Object.values(e.splitDetails).some(v=>v.paid) && !Object.values(e.splitDetails).every(v=>v.paid); 
                      pMonth = Object.values(e.splitDetails).map(v=>v.paidMonth).sort().reverse()[0];
                    }
                  }
                  const isPd = filters.month ? (st === 'paid' && pMonth === filters.month) : (st === 'paid');
                  return (
                    <div key={e.id} className={`${theme.card} p-4 flex justify-between items-center transition-all ${isPd?'opacity-50 grayscale-[50%]':selectedForPay[e.id]?'ring-2 ring-cyan-400 bg-cyan-900/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]':'hover:border-slate-700'}`}>
                      <div className="flex items-center w-2/3">
                        {st !== 'paid' && <input type="checkbox" checked={!!selectedForPay[e.id]} onChange={()=>togglePay(e)} className="w-5 h-5 mr-3 accent-cyan-500 rounded bg-[#0B0F19] border-slate-700" />}
                        <div className={`p-2 rounded-xl mr-3 shadow-inner ${isPd ? 'bg-slate-800/50' : 'bg-[#0B0F19] border border-slate-800'}`}>{getIconForCategory(cat?.name)}</div>
                        <div className="truncate">
                          <h3 className={`font-bold text-sm truncate text-slate-200 ${isPd?'line-through text-slate-500':''}`}>
                            {e.title} {e.paymentType==='installment' && <span className="text-[10px] bg-pink-950/50 text-pink-400 border border-pink-900/50 px-2 rounded-full ml-1">{e.currentInstallment}/{e.installmentMonths}</span>}
                            {filters.month && e.month < filters.month && !isPd && <span className="ml-2 text-[10px] bg-pink-900/40 text-pink-400 px-1.5 py-0.5 rounded border border-pink-700/50">ค้างชำระจาก {e.month}</span>}
                            {filters.month && e.month < filters.month && isPd && <span className="ml-2 text-[10px] bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-700/50">ชำระแล้ว (จาก {e.month})</span>}
                            {filters.month && e.month === filters.month && pMonth && pMonth > filters.month && <span className="ml-2 text-[10px] bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded border border-amber-700/50">ชำระล่าช้า ({pMonth})</span>}
                          </h3>
                          <p className="text-xs text-slate-500 truncate">
                            {cat?.name} • {
                              e.payerType === 'split' 
                                ? (!filters.payer ? `หาร ${Object.keys(e.splitDetails).length} คน` : dbData.members.find(m => String(m.id) === String(filters.payer))?.name)
                                : dbData.members.find(m => String(m.id) === String(e.payerId))?.name
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className={`font-black ${isPd?'text-slate-500':'text-cyan-300 drop-shadow-[0_0_5px_rgba(103,232,249,0.3)]'}`}>{formatCurrency(amt)}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {isPd ? <span className="text-[10px] text-emerald-500 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50">ชำระแล้ว</span> : <span className="text-[10px] text-pink-500 font-bold bg-pink-950/30 px-2 py-0.5 rounded border border-pink-900/50">รอชำระ</span>}
                          <button onClick={() => setModal({open:true, edit:e})} className="text-slate-500 hover:text-cyan-400 transition-colors"><Edit size={14}/></button>
                          <button onClick={() => { if(window.confirm('ลบบิลนี้?')) updateDB({expenses: dbData.expenses.filter(x=>e.groupId?String(x.groupId)!==String(e.groupId):String(x.id)!==String(e.id))}); }} className="text-slate-500 hover:text-pink-500 transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="px-4 sm:px-0 space-y-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center mb-2"><Settings size={20} className="mr-2 text-cyan-400"/> ตั้งค่าแอป</h2>
              <div className={`${theme.card} p-5 bg-gradient-to-r from-[#0B0F19] to-[#161C2D] border-slate-800`}>
                <h3 className={`font-bold text-cyan-400 mb-3 flex items-center drop-shadow-sm`}><Zap size={18} className="mr-2 text-pink-500"/>ระบบจัดการข้อมูล (Backup)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleExportData} className="flex flex-col items-center justify-center bg-[#0B0F19] p-3 rounded-xl border border-slate-700 text-cyan-400 hover:bg-slate-800 transition shadow-sm hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    <Download size={24} className="mb-1" />
                    <span className="text-sm font-bold">ดาวน์โหลด Backup</span>
                  </button>
                  <label className="flex flex-col items-center justify-center bg-[#0B0F19] p-3 rounded-xl border border-slate-700 text-emerald-400 hover:bg-slate-800 transition shadow-sm cursor-pointer hover:border-emerald-500/50 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <Upload size={24} className="mb-1" />
                    <span className="text-sm font-bold">นำเข้าข้อมูล</span>
                    <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                  </label>
                </div>
                <p className="text-[10px] text-slate-500 mt-3 text-center leading-tight">
                  แนะนำให้ดาวน์โหลด Backup เก็บไว้ทุกสัปดาห์<br/>เพื่อป้องกันข้อมูลสูญหายกรณีระบบคลาวด์ขัดข้อง
                </p>
              </div>

              <ListManager title="สมาชิก" data={dbData.members} updateDB={updateDB} dataKey="members" icon={Users} hasEmail />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><ListManager title="หมวดหมู่" data={dbData.categories} updateDB={updateDB} dataKey="categories" icon={ShoppingBag} /><ListManager title="ช่องทางจ่าย" data={dbData.sources} updateDB={updateDB} dataKey="sources" icon={CreditCard} /></div>
            </div>
          )}
        </main>

        <nav className="bg-[#161C2D]/80 backdrop-blur-xl border-t border-slate-800 p-2 flex justify-around sticky bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          {[{ id: 'dashboard', icon: <Home size={22}/>, label: 'หน้าแรก' }, { id: 'expenses', icon: <CreditCard size={22}/>, label: 'บิล' }, { id: 'settings', icon: <Settings size={22}/>, label: 'ตั้งค่า' }].map(i => (
            <button key={i.id} onClick={() => setTab(i.id)} className={`flex flex-col items-center p-2 rounded-xl w-16 transition-all ${tab === i.id ? 'text-cyan-400 bg-cyan-950/40 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'text-slate-500 hover:text-slate-300'}`}>{i.icon}<span className="text-[10px] mt-1">{i.label}</span></button>
          ))}
        </nav>
      </div>

      {modal.open && <ExpenseFormModal editingExpense={modal.edit} dbData={dbData} updateDB={updateDB} close={()=>setModal({open:false, edit:null})} showToast={showToast} />}
      
      {splitModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-[#161C2D] border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
             <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center"><Zap className="mr-2 text-cyan-400"/> เลือกผู้จ่าย</h3>
             <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
               {splitModal.avail.map(id => 
                 <label key={id} className="flex justify-between items-center p-3 border border-slate-800 bg-[#0B0F19] rounded-xl hover:border-slate-600 transition-colors cursor-pointer">
                   <div className="flex items-center text-slate-200">
                     <input type="checkbox" checked={splitModal.sel.includes(id)} onChange={e=>setSplitModal(s=>({...s, sel: e.target.checked?[...s.sel, id]:s.sel.filter(i=>i!==id)}))} className="mr-3 accent-cyan-500 w-4 h-4" />
                     <span className="font-medium">{dbData.members.find(m=>String(m.id)===String(id))?.name}</span>
                   </div>
                   <span className="font-bold text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.3)]">{formatCurrency(parseFloat(splitModal.exp.splitDetails[id].amount) || 0)}</span>
                 </label>
               )}
             </div>
             <div className="flex gap-3"><button onClick={()=>setSplitModal({open:false})} className="flex-1 py-3 bg-[#0B0F19] text-slate-300 rounded-xl font-bold border border-slate-800 hover:bg-slate-800 transition">ยกเลิก</button><button onClick={confirmSplitPay} className={`${theme.button} flex-1 py-3`}>ยืนยัน</button></div>
          </div>
        </div>
      )}
      {toast && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-800 border border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-slate-100 px-6 py-3 rounded-full font-bold text-sm flex items-center"><Zap size={16} className="mr-2 text-cyan-400"/>{toast}</div>}
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar{width:0px;background:transparent;}`}} />
    </div>
  );
}