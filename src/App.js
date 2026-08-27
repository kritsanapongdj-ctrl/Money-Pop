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
  Download, Upload, FileText, Clock
} from 'lucide-react';

const GAS_URL = "https://script.google.com/macros/s/AKfycbzbO-BbqufnRT6kZ1j8u8PLmhxPM3MSCY_VRZIUOsV6KlGIbGeOAgBVH_7HnVBSvSne/exec"; 

const theme = {
  bg: "bg-[#1a1c29] text-[#e2e8f0]", 
  card: "bg-[#25283d]/90 backdrop-blur-md shadow-xl border border-[#3f4366]/50 rounded-3xl",
  primary: "text-[#f472b6] drop-shadow-[0_0_5px_rgba(244,114,182,0.5)]", 
  button: "bg-gradient-to-r from-[#d946ef] to-[#f43f5e] hover:from-[#c026d3] hover:to-[#e11d48] text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] rounded-xl font-bold transition-all active:scale-95",
  input: "bg-[#161824] border border-[#3f4366] text-slate-100 focus:border-[#f472b6] focus:ring-2 focus:ring-[#f472b6]/30 rounded-xl p-3 w-full outline-none placeholder:text-slate-500 transition-colors",
  chartColors: ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399']
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

const ExpenseFormModal = ({ editingExpense, dbData, updateDB, close, showToast, currentUser }) => {
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
    if (!currentUser) {
      showToast("⚠️ กรุณาเลือกชื่อ 'ผู้ทำรายการ' ที่มุมขวาบนก่อนเพิ่มบิล");
      return;
    }
    const amount = parseFloat(formData.totalAmount);
    if (isNaN(amount) || amount <= 0) return alert("ยอดเงินไม่ถูกต้อง");

    let cleanExpenses = editingExpense ? dbData.expenses.filter(exp => editingExpense.groupId ? String(exp.groupId) !== String(editingExpense.groupId) : String(exp.id) !== String(editingExpense.id)) : dbData.expenses;
    let newExpenses = [];
    const groupId = editingExpense?.groupId || Date.now().toString();
    const baseData = { ...formData, updatedAt: Date.now(), createdBy: editingExpense?.createdBy || currentUser };

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
        const isPast = i < parseInt(formData.currentInstallment);
        const thisMonth = `${ty}-${String(tm).padStart(2, '0')}`;
        let splitDataCopy = undefined;
        if (formData.payerType === 'split') {
           splitDataCopy = {};
           Object.keys(splitData).forEach(id => {
               splitDataCopy[id] = { ...splitData[id], paid: isPast, paidMonth: isPast ? thisMonth : null, paidAt: isPast ? Date.now() : null };
           });
        }

        newExpenses.push({
          ...baseData, id: `${groupId}-${i}`, groupId, month: thisMonth,
          totalAmount: mAmount, fullTotalAmount: amount, isMonthlyAmount: true,
          installmentMonths: tMonths, currentInstallment: i,
          splitDetails: splitDataCopy, 
          status: isPast ? 'paid' : 'pending', 
          paidMonth: isPast ? thisMonth : null,
          paidAt: isPast ? Date.now() : null,
          createdAt: Date.now() + i
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
  const [partialPayModal, setPartialPayModal] = useState({ open: false, exp: null, amount: '', payerId: '' });
  const [receiptModal, setReceiptModal] = useState({ open: false, items: [], total: 0, date: null, isHistory: false, rawExp: [] });
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('moneyPopUser') || '');
  const [showUserModal, setShowUserModal] = useState(!localStorage.getItem('moneyPopUser'));
  const [expenseTab, setExpenseTab] = useState('pending');
  const [toast, setToast] = useState('');

  const handleUndoReceipt = (receipt) => {
    if (!currentUser) return showToast("⚠️ กรุณาเลือกชื่อ 'ผู้ทำรายการ' มุมขวาบนก่อน");
    if (!window.confirm("คุณต้องการยกเลิกใบเสร็จนี้ และเปลี่ยนบิลทั้งหมดกลับไปเป็น 'รอชำระ' ใช่หรือไม่?")) return;
    
    const newExps = dbData.expenses.map(e => {
      const ne = {...e};
      const match = receipt.rawExp.filter(re => String(re.id) === String(e.id));
      if (match.length > 0) {
         match.forEach(m => {
            if (m.type === 'single') {
               ne.status = 'pending'; ne.paidMonth = null; ne.paidAt = null; ne.paidBy = null;
            } else if (m.type === 'split') {
               const ns = {...ne.splitDetails};
               if (ns[m.splitId]) {
                  ns[m.splitId].paid = false; ns[m.splitId].paidMonth = null; ns[m.splitId].paidAt = null; ns[m.splitId].paidBy = null;
               }
               ne.splitDetails = ns;
               ne.status = Object.values(ns).every(v=>v.paid) ? 'paid' : 'pending';
            }
         });
      }
      return ne;
    });
    updateDB({ expenses: newExps });
    setReceiptModal({ open: false });
    showToast("ยกเลิกใบเสร็จเรียบร้อย");
  };

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

  const filteredExps = useMemo(() => dbData.expenses.filter(exp => {
    if (filters.category && String(exp.categoryId) !== String(filters.category)) return false;
    if (filters.payer && (exp.payerType === 'single' ? String(exp.payerId) !== String(filters.payer) : !exp.splitDetails?.[filters.payer])) return false;
    
    if (!filters.month || exp.month === filters.month) return true;
    if (exp.month < filters.month) {
      if (exp.month < '2026-06') return false; 
      if (exp.payerType === 'single') {
        const pMonth = (exp.status === 'paid' && !exp.paidMonth) ? exp.month : exp.paidMonth;
        return !pMonth || pMonth >= filters.month;
      } else {
        return Object.values(exp.splitDetails).some(d => {
          const pMonth = (d.paid && !d.paidMonth) ? exp.month : d.paidMonth;
          return !pMonth || pMonth >= filters.month;
        });
      }
    }
    return false;
  }), [dbData.expenses, filters]);

  const receiptHistory = useMemo(() => {
    const receipts = {};
    dbData.expenses.forEach(e => {
      if (e.payerType === 'single' && e.status === 'paid' && e.paidAt) {
        if (!receipts[e.paidAt]) receipts[e.paidAt] = { date: e.paidAt, items: [], total: 0, by: e.paidBy, rawExp: [] };
        receipts[e.paidAt].items.push({ title: e.title, amount: parseFloat(e.totalAmount) || 0 });
        receipts[e.paidAt].total += parseFloat(e.totalAmount) || 0;
        receipts[e.paidAt].rawExp.push({ id: e.id, type: 'single' });
        if (!receipts[e.paidAt].by && e.paidBy) receipts[e.paidAt].by = e.paidBy;
      } else if (e.payerType === 'split') {
        Object.entries(e.splitDetails).forEach(([id, d]) => {
          if (d.paid && d.paidAt) {
            if (!receipts[d.paidAt]) receipts[d.paidAt] = { date: d.paidAt, items: [], total: 0, by: d.paidBy, rawExp: [] };
            const mName = dbData.members.find(m => String(m.id) === String(id))?.name || '';
            receipts[d.paidAt].items.push({ title: `${e.title} (${mName})`, amount: parseFloat(d.amount) || 0 });
            receipts[d.paidAt].total += parseFloat(d.amount) || 0;
            receipts[d.paidAt].rawExp.push({ id: e.id, type: 'split', splitId: id });
            if (!receipts[d.paidAt].by && d.paidBy) receipts[d.paidAt].by = d.paidBy;
          }
        });
      }
    });
    return Object.values(receipts).sort((a, b) => b.date - a.date);
  }, [dbData.expenses, dbData.members]);

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
    if (!currentUser) return showToast("⚠️ กรุณาเลือกชื่อ 'ผู้ทำรายการ' ที่มุมขวาบนก่อนทำรายการ");
    const pMonth = filters.month || new Date().toISOString().slice(0, 7);
    const pAt = Date.now();
    const paidItems = [];
    let totalPaid = 0;

    const newExps = dbData.expenses.map(e => {
      if (!selectedForPay[e.id]) return e;
      const pd = selectedForPay[e.id]; const ne = {...e};
      
      let itemTitle = ne.title;
      if (pd.type === 'single') {
        ne.status = 'paid'; ne.paidMonth = pMonth; ne.paidAt = pAt; ne.paidBy = currentUser;
      } else { 
        const ns = {...ne.splitDetails}; 
        const payerNames = pd.ids.map(id => dbData.members.find(m => String(m.id) === String(id))?.name).join(', ');
        itemTitle = `${ne.title} (${payerNames})`;
        pd.ids.forEach(id => { 
          if (ns[id]) { ns[id].paid = true; ns[id].paidMonth = pMonth; ns[id].paidAt = pAt; ns[id].paidBy = currentUser; }
        }); 
        ne.splitDetails = ns; 
        ne.status = Object.values(ns).every(v=>v.paid) ? 'paid' : 'pending'; 
      }
      paidItems.push({ title: itemTitle, amount: pd.amount });
      totalPaid += pd.amount;
      return ne;
    });
    
    updateDB({ expenses: newExps }); 
    setSelectedForPay({}); 
    setReceiptModal({ open: true, items: paidItems, total: totalPaid, date: pAt });
  };

  const handleUndoPay = (exp) => {
    if (!currentUser) return showToast("⚠️ กรุณาเลือกชื่อ 'ผู้ทำรายการ' ที่มุมขวาบนก่อนทำรายการ");
    if (!window.confirm("คุณต้องการยกเลิกการชำระเงินสำหรับรายการนี้ใช่หรือไม่? (เปลี่ยนกลับเป็น รอชำระ)")) return;
    
    const ne = { ...exp };
    if (ne.payerType === 'single') {
       ne.status = 'pending';
       ne.paidMonth = null;
       ne.paidAt = null;
    } else {
       const ns = { ...ne.splitDetails };
       if (filters.payer) {
         if (ns[filters.payer]) {
           ns[filters.payer].paid = false;
           ns[filters.payer].paidMonth = null;
           ns[filters.payer].paidAt = null;
         }
       } else {
         Object.keys(ns).forEach(id => {
           ns[id].paid = false;
           ns[id].paidMonth = null;
           ns[id].paidAt = null;
         });
       }
       ne.splitDetails = ns;
       ne.status = Object.values(ns).every(v=>v.paid) ? 'paid' : 'pending';
    }
    updateDB({ expenses: dbData.expenses.map(x => String(x.id) === String(ne.id) ? ne : x) });
    showToast("ยกเลิกการชำระเงินแล้ว");
  };

  const confirmPartialPay = (e) => {
    e.preventDefault();
    if (!currentUser) return showToast("⚠️ กรุณาเลือกชื่อ 'ผู้ทำรายการ' ที่มุมขวาบนก่อนทำรายการ");
    const { exp, amount, payerId } = partialPayModal;
    const splitAmount = parseFloat(amount);
    if (!splitAmount || splitAmount <= 0) return alert('ยอดเงินไม่ถูกต้อง');
    
    let originalAmount = 0;
    if (exp.payerType === 'single') originalAmount = parseFloat(exp.totalAmount);
    else originalAmount = parseFloat(exp.splitDetails[payerId]?.amount) || 0;
    
    if (splitAmount >= originalAmount) {
      const pMonth = filters.month || new Date().toISOString().slice(0, 7);
      const pAt = Date.now();
      const ne = {...exp};
      if (ne.payerType === 'single') {
        ne.status = 'paid'; ne.paidMonth = pMonth; ne.paidAt = pAt; ne.paidBy = currentUser;
      } else {
        const ns = {...ne.splitDetails};
        ns[payerId] = { ...ns[payerId], paid: true, paidMonth: pMonth, paidAt: pAt, paidBy: currentUser };
        ne.splitDetails = ns;
        ne.status = Object.values(ns).every(v=>v.paid) ? 'paid' : 'pending';
      }
      updateDB({ expenses: dbData.expenses.map(x => String(x.id) === String(ne.id) ? ne : x) });
    } else {
      const pMonth = filters.month || new Date().toISOString().slice(0, 7);
      const pAt = Date.now();
      const bill1 = { ...exp, updatedAt: Date.now() }; 
      const bill2 = { ...exp, id: Date.now().toString() + '-rem', createdAt: Date.now(), updatedAt: Date.now(), title: exp.title + ' (ยอดคงเหลือ)' }; 
      
      if (exp.payerType === 'single') {
        bill1.totalAmount = splitAmount;
        bill1.status = 'paid'; bill1.paidMonth = pMonth; bill1.paidAt = pAt; bill1.paidBy = currentUser;
        bill2.totalAmount = originalAmount - splitAmount;
        bill2.status = 'pending'; bill2.paidMonth = null; bill2.paidAt = null;
      } else {
        const b1Split = {}; const b2Split = {};
        Object.keys(exp.splitDetails).forEach(id => {
          if (String(id) === String(payerId)) {
            b1Split[id] = { ...exp.splitDetails[id], amount: splitAmount, paid: true, paidMonth: pMonth, paidAt: pAt, paidBy: currentUser };
            b2Split[id] = { ...exp.splitDetails[id], amount: originalAmount - splitAmount, paid: false, paidMonth: null, paidAt: null };
          } else {
            b1Split[id] = { ...exp.splitDetails[id], amount: 0, paid: true, paidMonth: pMonth, paidAt: pAt, paidBy: currentUser }; 
            b2Split[id] = { ...exp.splitDetails[id] }; 
          }
        });
        bill1.splitDetails = b1Split; bill1.status = 'paid';
        bill2.splitDetails = b2Split; bill2.status = 'pending';
      }
      updateDB({ expenses: [...dbData.expenses.filter(x => String(x.id) !== String(exp.id)), bill1, bill2] });
    }
    setPartialPayModal({ open: false, exp: null, amount: '', payerId: '' });
    setReceiptModal({ open: true, items: [{ title: `${exp.title} (แบ่งจ่าย)`, amount: splitAmount }], total: splitAmount, date: Date.now() });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-cyan-400 bg-[#0B0F19]">กำลังโหลด...</div>;

  return (
    <div className={`min-h-[100dvh] ${theme.bg} font-sans`}>
      <div className="max-w-md sm:max-w-3xl lg:max-w-5xl mx-auto flex flex-col h-[100dvh] bg-[#1a1c29] border-x border-[#25283d] shadow-2xl shadow-pink-900/10">
        <header className="bg-[#1a1c29]/90 backdrop-blur-md px-4 py-3 flex justify-between items-center border-b border-[#3f4366]/80 z-30">
          <div className="text-xl font-black text-slate-100 flex items-center tracking-tight"><Zap size={20} className="mr-1 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" /> MONEY<span className="text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">-POP</span></div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setShowUserModal(true)} className="bg-[#f472b6]/20 text-[#f472b6] border border-[#f472b6]/50 px-3 py-1.5 rounded-xl font-bold flex items-center shadow-[0_0_10px_rgba(244,114,182,0.2)] text-xs hover:bg-[#f472b6]/30 transition">
              <Users size={14} className="mr-1.5"/> {currentUser ? (dbData.members.find(m=>String(m.id)===String(currentUser))?.name || 'เลือกผู้ใช้') : 'เลือกผู้ใช้'}
            </button>
            {isSyncing ? <RefreshCw size={18} className="animate-spin text-[#f472b6]" /> : <button onClick={()=>fetchData(true)} className="text-slate-400 hover:text-[#f472b6] transition-colors"><RefreshCw size={18}/></button>}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto sm:p-6 pb-20 custom-scrollbar">
          <div className="sticky top-0 bg-[#1a1c29]/90 backdrop-blur-xl z-10 px-4 py-3 border-b border-[#3f4366]/50 mb-4 flex gap-2 shadow-sm">
            <input type="month" value={filters.month} onChange={e=>setFilters({...filters, month: e.target.value})} className="bg-[#25283d] border border-[#3f4366] text-slate-200 rounded-xl px-3 py-2 text-sm font-medium w-1/3 focus:border-[#f472b6] outline-none transition-colors" />
            <select value={filters.payer} onChange={e=>setFilters({...filters, payer: e.target.value})} className="bg-[#25283d] border border-[#3f4366] text-slate-200 rounded-xl px-2 py-2 text-sm w-1/3 focus:border-[#f472b6] outline-none transition-colors"><option value="">👤 ทุกคน</option>{dbData.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <select value={filters.category} onChange={e=>setFilters({...filters, category: e.target.value})} className="bg-[#25283d] border border-[#3f4366] text-slate-200 rounded-xl px-2 py-2 text-sm w-1/3 focus:border-[#f472b6] outline-none transition-colors"><option value="">📁 หมวด</option>{dbData.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>

          {tab === 'dashboard' && (() => {
            let tPaid = 0, tPend = 0; const cMap = {}, mMap = {};
            filteredExps.forEach(e => {
              const cat = dbData.categories.find(c=>String(c.id)===String(e.categoryId))?.name || 'อื่นๆ';
              if (e.payerType === 'single') {
                if(filters.payer && String(e.payerId) !== String(filters.payer)) return;
                const effectivePaidMonth = (e.status === 'paid' && !e.paidMonth) ? e.month : e.paidMonth;
                let isPaidInView = filters.month ? (effectivePaidMonth === filters.month) : (e.status === 'paid');
                let isPendInView = filters.month ? (!effectivePaidMonth || effectivePaidMonth > filters.month) : (e.status !== 'paid');
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
                  const effectivePaidMonth = (d.paid && !d.paidMonth) ? e.month : d.paidMonth;
                  let isPaidInView = filters.month ? (effectivePaidMonth === filters.month) : d.paid;
                  let isPendInView = filters.month ? (!effectivePaidMonth || effectivePaidMonth > filters.month) : !d.paid;
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
            const barData = Object.keys(cMap).map(k=>({n:k, v:cMap[k]}));
            return (
              <div className="px-4 sm:px-0 space-y-4">
                <div className={`${theme.card} p-5 bg-gradient-to-br from-[#2e1065] via-[#1e1b4b] to-[#4c1d95] text-white border-[#8b5cf6]/30 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#f472b6]/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
                  <p className="text-[#a78bfa] text-sm mb-1 font-medium z-10 relative">ยอดใช้จ่ายรวมเดือนนี้</p>
                  <h2 className="text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#f472b6] to-[#fbbf24] drop-shadow-[0_2px_10px_rgba(244,114,182,0.3)] z-10 relative">{formatCurrency(tPaid + tPend)}</h2>
                  <div className="grid grid-cols-2 gap-3 z-10 relative"><div className="bg-[#1a1c29]/60 backdrop-blur-md p-3 rounded-xl border-l-4 border-[#34d399] shadow-inner"><p className="text-xs font-bold text-slate-400">ชำระแล้ว</p><p className="text-lg font-black text-[#34d399]">{formatCurrency(tPaid)}</p></div><div className="bg-[#1a1c29]/60 backdrop-blur-md p-3 rounded-xl border-l-4 border-[#f472b6] shadow-inner"><p className="text-xs font-bold text-slate-400">รอชำระ</p><p className="text-lg font-black text-[#f472b6]">{formatCurrency(tPend)}</p></div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`${theme.card} p-4 h-64`}><h3 className="text-sm font-bold text-[#f472b6] mb-2">แยกตามหมวดหมู่</h3><ResponsiveContainer><BarChart data={barData} layout="vertical" margin={{left:10}}><XAxis type="number" hide /><YAxis dataKey="n" type="category" width={70} tick={{fontSize:11, fill:'#94a3b8'}}/><RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1a1c29', border: '1px solid #3f4366', borderRadius: '12px', color: '#f1f5f9'}} formatter={v=>formatCurrency(v)}/><Bar dataKey="v" radius={[0,4,4,0]} barSize={20}>{barData.map((entry, index) => <Cell key={`cell-${index}`} fill={theme.chartColors[index % theme.chartColors.length]} />)}</Bar></BarChart></ResponsiveContainer>
                  </div>
                  {!filters.payer && <div className={`${theme.card} p-4 h-64`}><h3 className="text-sm font-bold text-[#f472b6] mb-2">แยกรายบุคคล</h3><ResponsiveContainer><PieChart><Pie data={Object.keys(mMap).map(k=>({n:k, v:mMap[k]}))} dataKey="v" nameKey="n" innerRadius={40} outerRadius={70} stroke="none">{Object.keys(mMap).map((_,i)=><Cell key={i} fill={theme.chartColors[i%5]}/>)}</Pie><RechartsTooltip contentStyle={{backgroundColor: '#1a1c29', border: '1px solid #3f4366', borderRadius: '12px', color: '#f1f5f9'}} formatter={v=>formatCurrency(v)}/><Legend iconType="circle" wrapperStyle={{fontSize:'12px', color:'#cbd5e1'}}/></PieChart></ResponsiveContainer></div>}
                </div>
              </div>
            );
          })()}

          {tab === 'expenses' && (
            <div className="px-4 sm:px-0">
              <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-slate-100 flex items-center"><Zap size={20} className="mr-2 text-[#f472b6]"/> รายการบิลทั้งหมด</h2><button onClick={() => setModal({open:true, edit:null})} className={`${theme.button} px-4 py-2 flex items-center text-sm`}><Plus size={16} className="mr-1"/>เพิ่มบิล</button></div>
              
              <div className="flex bg-[#25283d] rounded-xl p-1 mb-4 shadow-inner border border-[#3f4366]">
                 <button onClick={()=>setExpenseTab('pending')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${expenseTab==='pending'?'bg-[#3f4366] text-[#f472b6] shadow-sm':'text-slate-400 hover:text-slate-200'}`}>รอชำระ (To Pay)</button>
                 <button onClick={()=>setExpenseTab('paid')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${expenseTab==='paid'?'bg-[#3f4366] text-[#34d399] shadow-sm':'text-slate-400 hover:text-slate-200'}`}>ชำระแล้ว (History)</button>
              </div>

              {Object.keys(selectedForPay).length > 0 && expenseTab === 'pending' && <div className="sticky top-16 z-20 bg-[#25283d]/90 backdrop-blur-md p-4 rounded-xl border border-[#f472b6] shadow-[0_0_25px_rgba(244,114,182,0.2)] flex justify-between items-center mb-4 animate-fadeIn"><div><span className="text-[#f472b6] text-xs font-bold">เลือกชำระ {Object.keys(selectedForPay).length} รายการ</span><p className="text-slate-100 text-xl font-black">{formatCurrency(Object.values(selectedForPay).reduce((s,i)=>s+(parseFloat(i.amount)||0),0))}</p></div><button onClick={bulkPay} className={`${theme.button} px-5 py-2`}>ยืนยันชำระ</button></div>}
              <div className="space-y-3">
                {filteredExps.map(e => {
                  const cat = dbData.categories.find(c=>String(c.id)===String(e.categoryId));
                  let amt = parseFloat(e.totalAmount) || 0;
                  let st = e.status, isPart = false, pMonth = (e.status === 'paid' && !e.paidMonth) ? e.month : e.paidMonth;
                  if (e.payerType === 'split') {
                    if (filters.payer) { 
                      amt = parseFloat(e.splitDetails[filters.payer]?.amount) || 0; 
                      st = e.splitDetails[filters.payer]?.paid ? 'paid' : 'pending'; 
                      pMonth = (e.splitDetails[filters.payer]?.paid && !e.splitDetails[filters.payer]?.paidMonth) ? e.month : e.splitDetails[filters.payer]?.paidMonth;
                    } else { 
                      isPart = Object.values(e.splitDetails).some(v=>v.paid) && !Object.values(e.splitDetails).every(v=>v.paid); 
                      pMonth = Object.values(e.splitDetails).map(v=> (v.paid && !v.paidMonth) ? e.month : v.paidMonth).sort().reverse()[0];
                    }
                  }
                  const isPd = filters.month ? (st === 'paid' && pMonth === filters.month) : (st === 'paid');
                  
                  if (expenseTab === 'pending' && isPd) return null;
                  if (expenseTab === 'paid' && !isPd) return null;

                  return (
                    <div key={e.id} className={`${theme.card} p-4 flex justify-between items-center transition-all ${isPd?'opacity-70 bg-[#1a1c29]/50':selectedForPay[e.id]?'ring-2 ring-[#f472b6] bg-[#f472b6]/10 shadow-[0_0_15px_rgba(244,114,182,0.15)]':'hover:border-[#f472b6]/50'}`}>
                      <div className="flex items-center w-2/3 cursor-pointer" onClick={() => { if(st !== 'paid') togglePay(e); }}>
                        {st !== 'paid' && <input type="checkbox" checked={!!selectedForPay[e.id]} readOnly className="w-5 h-5 mr-3 accent-[#f472b6] rounded bg-[#161824] border-[#3f4366] cursor-pointer pointer-events-none" />}
                        <div className={`p-2 rounded-xl mr-3 shadow-inner ${isPd ? 'bg-[#25283d]' : 'bg-[#1a1c29] border border-[#3f4366]'}`}>{getIconForCategory(cat?.name)}</div>
                        <div className="truncate">
                          <h3 className={`font-bold text-sm truncate text-slate-200 ${isPd?'line-through text-slate-500':''}`}>
                            {e.title} {e.paymentType==='installment' && <span className="text-[10px] bg-pink-900/30 text-[#f472b6] border border-[#f472b6]/30 px-2 rounded-full ml-1">{e.currentInstallment}/{e.installmentMonths}</span>}
                            {filters.month && e.month < filters.month && !isPd && <span className="ml-2 text-[10px] bg-rose-900/40 text-rose-400 px-1.5 py-0.5 rounded border border-rose-700/50">ค้างชำระจาก {e.month}</span>}
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
                        <span className={`font-black ${isPd?'text-slate-500':'text-[#67e8f9] drop-shadow-[0_0_5px_rgba(103,232,249,0.3)]'}`}>{formatCurrency(amt)}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {isPd ? <span className="text-[10px] text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-900/50">ชำระแล้ว</span> : <span className="text-[10px] text-[#f472b6] font-bold bg-pink-900/30 px-2 py-0.5 rounded border border-pink-900/50">รอชำระ</span>}
                          {isPd && (
                            <button onClick={(ev) => { ev.stopPropagation(); handleUndoPay(e); }} className="text-[10px] text-rose-400 font-bold bg-rose-900/30 px-2 py-0.5 rounded border border-rose-900/50 hover:bg-rose-900/50 transition-colors mr-1">ยกเลิกชำระ</button>
                          )}
                          {st !== 'paid' && e.paymentType !== 'installment' && (
                            <button onClick={(ev) => { ev.stopPropagation(); setPartialPayModal({open:true, exp:e, amount:'', payerId: (e.payerType === 'split' && filters.payer) ? filters.payer : ''}); }} className="text-[10px] text-amber-400 font-bold bg-amber-900/30 px-2 py-0.5 rounded border border-amber-900/50 hover:bg-amber-900/50 transition-colors mr-1">แบ่งจ่าย</button>
                          )}
                          <button onClick={(ev) => { ev.stopPropagation(); setModal({open:true, edit:e}); }} className="text-slate-400 hover:text-[#38bdf8] transition-colors"><Edit size={14}/></button>
                          <button onClick={(ev) => { ev.stopPropagation(); if(window.confirm('ลบบิลนี้?')) updateDB({expenses: dbData.expenses.filter(x=>e.groupId?String(x.groupId)!==String(e.groupId):String(x.id)!==String(e.id))}); }} className="text-slate-400 hover:text-rose-400 transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'receipts' && (
            <div className="px-4 sm:px-0 space-y-4">
              <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-slate-100 flex items-center"><FileText size={20} className="mr-2 text-[#38bdf8]"/> ประวัติใบเสร็จ</h2></div>
              {receiptHistory.length === 0 ? (
                <div className="text-center text-slate-500 py-10"><Clock size={40} className="mx-auto mb-3 opacity-50"/>ยังไม่มีประวัติใบเสร็จ</div>
              ) : (
                <div className="space-y-4">
                  {receiptHistory.map(r => (
                     <div key={r.date} className={`${theme.card} p-5 bg-gradient-to-br from-[#1a1c29] to-[#25283d] border-[#3f4366] relative overflow-hidden`}>
                       <div className="flex justify-between items-start mb-3 border-b border-[#3f4366] pb-3">
                         <div>
                           <div className="text-xs text-slate-400 flex items-center mb-1"><Clock size={12} className="mr-1"/> {new Date(r.date).toLocaleString('th-TH')}</div>
                           <div className="text-[10px] text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded font-bold border border-[#38bdf8]/30 inline-block mt-1">ทำรายการโดย: {dbData.members.find(m=>String(m.id)===String(r.by))?.name || 'ไม่ระบุ'}</div>
                         </div>
                         <div className="text-right">
                           <div className="text-xs text-slate-500 uppercase font-bold">TOTAL</div>
                           <div className="text-lg font-black text-[#f472b6] drop-shadow-[0_0_5px_rgba(244,114,182,0.3)]">{formatCurrency(r.total)}</div>
                         </div>
                       </div>
                       <div className="mt-3 pt-3 border-t border-[#3f4366]/50 flex justify-between items-center">
                         <span className="text-xs text-slate-400 font-medium">ทำรายการทั้งหมด {r.items.length} บิล</span>
                         <button onClick={() => setReceiptModal({open: true, ...r, isHistory: true})} className="bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/50 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#38bdf8]/30 transition shadow-sm flex items-center"><FileText size={14} className="mr-1"/> ดูใบเสร็จ</button>
                       </div>
                     </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="px-4 sm:px-0 space-y-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center mb-2"><Settings size={20} className="mr-2 text-[#38bdf8]"/> ตั้งค่าแอป</h2>
              <div className={`${theme.card} p-5 bg-gradient-to-r from-[#1a1c29] to-[#25283d] border-[#3f4366]`}>
                <h3 className={`font-bold text-[#38bdf8] mb-3 flex items-center drop-shadow-sm`}><Zap size={18} className="mr-2 text-[#f472b6]"/>ระบบจัดการข้อมูล (Backup)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleExportData} className="flex flex-col items-center justify-center bg-[#161824] p-3 rounded-xl border border-[#3f4366] text-[#38bdf8] hover:bg-[#25283d] transition shadow-sm hover:border-[#38bdf8]/50 hover:shadow-[0_0_10px_rgba(56,189,248,0.2)]">
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

        <nav className="bg-[#1a1c29]/90 backdrop-blur-xl border-t border-[#3f4366] p-2 flex justify-around sticky bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          {[{ id: 'dashboard', icon: <Home size={22}/>, label: 'หน้าแรก' }, { id: 'expenses', icon: <CreditCard size={22}/>, label: 'บิล' }, { id: 'receipts', icon: <FileText size={22}/>, label: 'ใบเสร็จ' }, { id: 'settings', icon: <Settings size={22}/>, label: 'ตั้งค่า' }].map(i => (
            <button key={i.id} onClick={() => setTab(i.id)} className={`flex flex-col items-center p-2 rounded-xl w-16 transition-all ${tab === i.id ? 'text-[#f472b6] bg-[#f472b6]/10 font-bold shadow-[0_0_10px_rgba(244,114,182,0.15)] scale-110' : 'text-slate-500 hover:text-slate-300'}`}>{i.icon}<span className="text-[10px] mt-1">{i.label}</span></button>
          ))}
        </nav>
      </div>

      {modal.open && <ExpenseFormModal editingExpense={modal.edit} dbData={dbData} updateDB={updateDB} close={()=>setModal({open:false, edit:null})} showToast={showToast} currentUser={currentUser} />}
      
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
      {partialPayModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <form onSubmit={confirmPartialPay} className="bg-[#161C2D] border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
             <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center"><Coffee className="mr-2 text-amber-400"/> แบ่งจ่าย (ยอดคงเหลือจะถูกแยกบิลใหม่)</h3>
             {partialPayModal.exp.payerType === 'split' && !filters.payer && (
                <select required value={partialPayModal.payerId} onChange={e=>setPartialPayModal({...partialPayModal, payerId: e.target.value})} className={`${theme.input} mb-3`}>
                  <option value="">เลือกผู้จ่ายที่ต้องการแบ่งชำระ...</option>
                  {Object.keys(partialPayModal.exp.splitDetails).filter(id => !partialPayModal.exp.splitDetails[id].paid).map(id => (
                    <option key={id} value={id}>{dbData.members.find(m=>String(m.id)===String(id))?.name} (ยอด {formatCurrency(partialPayModal.exp.splitDetails[id].amount)})</option>
                  ))}
                </select>
             )}
             <input type="number" required max={partialPayModal.exp.payerType==='single' ? partialPayModal.exp.totalAmount : (partialPayModal.exp.splitDetails?.[partialPayModal.payerId || filters.payer]?.amount || partialPayModal.exp.totalAmount)} step="0.01" placeholder="ระบุจำนวนเงินที่จ่าย..." value={partialPayModal.amount} onChange={e=>setPartialPayModal({...partialPayModal, amount: e.target.value})} className={`${theme.input} mb-5`} />
             <div className="flex gap-3"><button type="button" onClick={()=>setPartialPayModal({open:false, exp:null, amount:'', payerId:''})} className="flex-1 py-3 bg-[#0B0F19] text-slate-300 rounded-xl font-bold border border-slate-800 hover:bg-slate-800 transition">ยกเลิก</button><button type="submit" className={`${theme.button} flex-1 py-3`}>ยืนยัน</button></div>
          </form>
        </div>
      )}
      {receiptModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#161C2D] border border-cyan-500 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
             
             <div className="text-center mb-6 pt-2 relative z-10">
               <div className="mx-auto w-12 h-12 bg-cyan-900/50 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400">
                 {receiptModal.isHistory ? <FileText size={24} className="text-cyan-400" /> : <Check size={24} className="text-cyan-400" />}
               </div>
               <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-400 drop-shadow-sm">{receiptModal.isHistory ? 'RECEIPT DETAILS' : 'PAYMENT SUCCESS'}</h2>
               <p className="text-xs text-slate-400 mt-1">{new Date(receiptModal.date).toLocaleString('th-TH')}</p>
               <p className="text-xs text-slate-500 mt-1">ทำรายการโดย: <span className="text-cyan-400 font-bold">{dbData.members.find(m=>String(m.id)===String(receiptModal.isHistory ? receiptModal.by : currentUser))?.name || 'ไม่ระบุ'}</span></p>
             </div>
             
             <div className="border-t border-dashed border-slate-700 my-4 relative z-10"></div>
             
             <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 relative z-10">
               {receiptModal.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-start text-sm">
                   <span className="font-medium text-slate-300 pr-4">{item.title}</span>
                   <span className="font-bold text-cyan-100 tabular-nums whitespace-nowrap">{formatCurrency(item.amount)}</span>
                 </div>
               ))}
             </div>
             
             <div className="border-t border-dashed border-slate-700 my-4 relative z-10"></div>
             
             <div className="flex justify-between items-center text-lg relative z-10">
               <span className="font-black text-slate-200">TOTAL PAID</span>
               <span className="font-black text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">{formatCurrency(receiptModal.total)}</span>
             </div>
             
             <div className="mt-8 relative z-10 flex gap-3">
               <button onClick={()=>setReceiptModal({open: false})} className={`${theme.button} flex-1 py-3`}>ปิดหน้าต่าง</button>
               {receiptModal.isHistory && (
                 <button onClick={() => handleUndoReceipt(receiptModal)} className="flex-1 py-3 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-xl font-bold hover:bg-rose-500/30 transition shadow-sm">ยกเลิกใบเสร็จ</button>
               )}
             </div>
          </div>
        </div>
      )}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#161C2D] border border-cyan-500 w-full max-w-sm rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
            
            <div className="mx-auto w-16 h-16 bg-cyan-900/50 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-400 relative z-10">
              <Users size={32} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-100 mb-2 relative z-10">ยินดีต้อนรับ!</h2>
            <p className="text-slate-400 mb-6 text-sm relative z-10">กรุณาระบุว่าคุณคือใคร เพื่อใช้บันทึกประวัติการทำรายการ</p>
            
            <div className="space-y-3 relative z-10">
              {dbData.members.map(m => (
                <button key={m.id} onClick={() => { setCurrentUser(m.id); localStorage.setItem('moneyPopUser', m.id); setShowUserModal(false); }} className={`w-full py-4 rounded-xl font-bold transition-all text-lg flex items-center justify-center ${currentUser === String(m.id) ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-[#0B0F19] text-slate-300 border border-slate-800 hover:border-cyan-500 hover:text-cyan-400'}`}>
                  {m.name}
                </button>
              ))}
            </div>
            {currentUser && (
              <button onClick={() => setShowUserModal(false)} className="mt-6 text-slate-500 hover:text-slate-300 underline text-sm relative z-10">ปิดหน้าต่าง</button>
            )}
          </div>
        </div>
      )}
      {toast && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-800 border border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-slate-100 px-6 py-3 rounded-full font-bold text-sm flex items-center"><Zap size={16} className="mr-2 text-cyan-400"/>{toast}</div>}
      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar{width:0px;background:transparent;}`}} />
    </div>
  );
}