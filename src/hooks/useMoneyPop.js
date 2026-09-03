import { useState, useEffect, useMemo, useCallback } from 'react';
import { GAS_URL } from '../constants/theme';
import { filterOutExpense, isInstallmentExpense } from '../utils/expenseUtils';

export function useMoneyPop() {
  const [dbData, setDbData] = useState({ 
    expenses: [], 
    members: [], 
    categories: [], 
    sources: [], 
    savings: { currentAmount: 0, transactions: [] } 
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filters, setFilters] = useState({ 
    month: new Date().toISOString().slice(0, 7), 
    payer: '', 
    category: '' 
  });
  
  const [selectedForPay, setSelectedForPay] = useState({});
  const [splitModal, setSplitModal] = useState({ open: false, expId: null, members: [], sel: [], avail: [] });
  const [partialPayModal, setPartialPayModal] = useState({ open: false, exp: null, amount: '', payerId: '' });
  const [receiptModal, setReceiptModal] = useState({ 
    open: false, 
    items: [], 
    total: 0, 
    date: null, 
    isHistory: false, 
    rawExp: [] 
  });
  
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('moneyPopUser') || '');
  const [showUserModal, setShowUserModal] = useState(!localStorage.getItem('moneyPopUser'));
  const [expenseTab, setExpenseTab] = useState('pending');
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (!GAS_URL) return;
    try {
      if (!silent) setIsSyncing(true);
      const res = await fetch(`${GAS_URL}?t=${Date.now()}`);
      const data = await res.json();
      if (data && Object.keys(data).length > 0) {
        setDbData((prev) => ({ ...prev, ...data }));
        localStorage.setItem("moneyPopDB", JSON.stringify(data));
      }
    } catch (e) {
      const local = localStorage.getItem("moneyPopDB");
      if (local) {
        try {
          setDbData(JSON.parse(local));
        } catch (err) {}
      }
    } finally {
      if (!silent) setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchData]);

  const updateDB = async (newDataFields) => {
    const updated = { ...dbData, ...newDataFields };
    setDbData(updated);
    localStorage.setItem("moneyPopDB", JSON.stringify(updated));
    
    if (!GAS_URL) return;
    setIsSyncing(true);
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error("Failed to sync to GAS:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Delete an expense permanently from the database.
   * If it is an installment bill, purge all installments in the series across all months.
   */
  const deleteExpense = (exp) => {
    if (!exp) return;
    const isInst = isInstallmentExpense(exp);
    const confirmMsg = isInst
      ? `คุณต้องการลบรายการผ่อนชำระ "${exp.title}" ทั้งหมดใช่หรือไม่?\n(ระบบจะลบทุกงวด ทุกเดือนออกจากฐานข้อมูลอย่างถาวร)`
      : `คุณต้องการลบรายการ "${exp.title}" ออกจากฐานข้อมูลใช่หรือไม่?`;

    if (!window.confirm(confirmMsg)) return;

    const newExpenses = filterOutExpense(dbData.expenses, exp);
    updateDB({ expenses: newExpenses });
    showToast(`ลบรายการ "${exp.title}" ออกจากฐานข้อมูลเรียบร้อยแล้ว`);
  };

  // Filtered expenses based on month, payer, category, and rollover
  const filteredExps = useMemo(() => {
    return dbData.expenses.filter((exp) => {
      if (filters.category && String(exp.categoryId) !== String(filters.category)) return false;
      if (filters.payer && (exp.payerType === 'single' ? String(exp.payerId) !== String(filters.payer) : !exp.splitDetails?.[filters.payer])) return false;

      if (!filters.month || exp.month === filters.month) return true;
      if (exp.month < filters.month) {
        if (exp.month < '2026-06') return false; // Ignore before June 2026 for rollover
        if (exp.payerType === 'single') {
          const pMonth = (exp.status === 'paid' && !exp.paidMonth) ? exp.month : exp.paidMonth;
          return !pMonth || pMonth >= filters.month;
        } else if (exp.splitDetails) {
          return Object.values(exp.splitDetails).some((d) => {
            const pMonth = (d.paid && !d.paidMonth) ? exp.month : d.paidMonth;
            return !pMonth || pMonth >= filters.month;
          });
        }
      }
      return false;
    });
  }, [dbData.expenses, filters]);

  // Historical receipts grouping by paid timestamp
  const receiptHistory = useMemo(() => {
    const receipts = {};
    dbData.expenses.forEach((e) => {
      if (e.payerType === 'single' && e.status === 'paid' && e.paidAt) {
        if (!receipts[e.paidAt]) {
          receipts[e.paidAt] = { date: e.paidAt, items: [], total: 0, by: e.paidBy, rawExp: [] };
        }
        receipts[e.paidAt].items.push({ title: e.title, amount: parseFloat(e.totalAmount) || 0 });
        receipts[e.paidAt].total += parseFloat(e.totalAmount) || 0;
        receipts[e.paidAt].rawExp.push({ id: e.id, type: 'single' });
        if (!receipts[e.paidAt].by && e.paidBy) receipts[e.paidAt].by = e.paidBy;
      } else if (e.payerType === 'split' && e.splitDetails) {
        Object.entries(e.splitDetails).forEach(([id, d]) => {
          if (d.paid && d.paidAt) {
            if (!receipts[d.paidAt]) {
              receipts[d.paidAt] = { date: d.paidAt, items: [], total: 0, by: d.paidBy, rawExp: [] };
            }
            const mName = dbData.members.find((m) => String(m.id) === String(id))?.name || '';
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
      const n = { ...selectedForPay };
      delete n[exp.id];
      setSelectedForPay(n);
    } else {
      if (exp.payerType === 'single') {
        setSelectedForPay({ ...selectedForPay, [exp.id]: { amount: parseFloat(exp.totalAmount) || 0, type: 'single' } });
      } else if (exp.splitDetails) {
        if (filters.payer) {
          if (!exp.splitDetails[filters.payer]?.paid) {
            setSelectedForPay({
              ...selectedForPay,
              [exp.id]: { amount: parseFloat(exp.splitDetails[filters.payer].amount) || 0, type: 'split', ids: [filters.payer] }
            });
          }
        } else {
          const unpaid = Object.keys(exp.splitDetails).filter((id) => !exp.splitDetails[id].paid);
          if (unpaid.length > 0) {
            setSplitModal({ open: true, expId: exp.id, exp, sel: unpaid.length === 1 ? unpaid : [], avail: unpaid });
          }
        }
      }
    }
  };

  const confirmSplitPay = () => {
    if (!splitModal.sel || splitModal.sel.length === 0) return;
    const amt = splitModal.sel.reduce(
      (sum, id) => sum + (parseFloat(splitModal.exp.splitDetails[id].amount) || 0),
      0
    );
    setSelectedForPay({
      ...selectedForPay,
      [splitModal.expId]: { amount: amt, type: 'split', ids: splitModal.sel }
    });
    setSplitModal({ open: false, expId: null, members: [], sel: [], avail: [] });
  };

  const bulkPay = () => {
    if (!currentUser) return showToast("⚠️ กรุณาเลือกชื่อ 'ผู้ทำรายการ' ก่อนทำรายการ");
    const pMonth = filters.month || new Date().toISOString().slice(0, 7);
    const pAt = Date.now();
    const paidItems = [];
    let totalPaid = 0;

    const newExps = dbData.expenses.map((e) => {
      if (!selectedForPay[e.id]) return e;
      const pd = selectedForPay[e.id];
      const ne = { ...e };

      let itemTitle = ne.title;
      if (pd.type === 'single') {
        ne.status = 'paid';
        ne.paidMonth = pMonth;
        ne.paidAt = pAt;
        ne.paidBy = currentUser;
      } else {
        const ns = { ...ne.splitDetails };
        const payerNames = pd.ids.map((id) => dbData.members.find((m) => String(m.id) === String(id))?.name).join(', ');
        itemTitle = `${ne.title} (${payerNames})`;
        pd.ids.forEach((id) => {
          if (ns[id]) {
            ns[id].paid = true;
            ns[id].paidMonth = pMonth;
            ns[id].paidAt = pAt;
            ns[id].paidBy = currentUser;
          }
        });
        ne.splitDetails = ns;
        ne.status = Object.values(ns).every((v) => v.paid) ? 'paid' : 'pending';
      }
      paidItems.push({ title: itemTitle, amount: pd.amount });
      totalPaid += pd.amount;
      return ne;
    });

    updateDB({ expenses: newExps });
    setSelectedForPay({});
    setReceiptModal({ open: true, items: paidItems, total: totalPaid, date: pAt, isHistory: false });
  };

  const handleUndoPay = (exp) => {
    if (!currentUser) return showToast("⚠️ กรุณาเลือกชื่อ 'ผู้ทำรายการ' ก่อนทำรายการ");
    if (!window.confirm("คุณต้องการยกเลิกการชำระเงินสำหรับรายการนี้ใช่หรือไม่? (เปลี่ยนกลับเป็น รอชำระ)")) return;

    const ne = { ...exp };
    if (ne.payerType === 'single') {
      ne.status = 'pending';
      ne.paidMonth = null;
      ne.paidAt = null;
      ne.paidBy = null;
    } else {
      const ns = { ...ne.splitDetails };
      if (filters.payer) {
        if (ns[filters.payer]) {
          ns[filters.payer].paid = false;
          ns[filters.payer].paidMonth = null;
          ns[filters.payer].paidAt = null;
          ns[filters.payer].paidBy = null;
        }
      } else {
        Object.keys(ns).forEach((id) => {
          ns[id].paid = false;
          ns[id].paidMonth = null;
          ns[id].paidAt = null;
          ns[id].paidBy = null;
        });
      }
      ne.splitDetails = ns;
      ne.status = Object.values(ns).every((v) => v.paid) ? 'paid' : 'pending';
    }
    updateDB({ expenses: dbData.expenses.map((x) => String(x.id) === String(ne.id) ? ne : x) });
    showToast("ยกเลิกการชำระเงินแล้ว");
  };

  const handleUndoReceipt = (receipt) => {
    if (!currentUser) return showToast("⚠️ กรุณาเลือกชื่อ 'ผู้ทำรายการ' ก่อน");
    if (!window.confirm("คุณต้องการยกเลิกใบเสร็จนี้ และเปลี่ยนบิลทั้งหมดกลับไปเป็น 'รอชำระ' ใช่หรือไม่?")) return;

    const newExps = dbData.expenses.map((e) => {
      const ne = { ...e };
      const match = (receipt.rawExp || []).filter((re) => String(re.id) === String(e.id));
      if (match.length > 0) {
        match.forEach((m) => {
          if (m.type === 'single') {
            ne.status = 'pending';
            ne.paidMonth = null;
            ne.paidAt = null;
            ne.paidBy = null;
          } else if (m.type === 'split') {
            const ns = { ...ne.splitDetails };
            if (ns[m.splitId]) {
              ns[m.splitId].paid = false;
              ns[m.splitId].paidMonth = null;
              ns[m.splitId].paidAt = null;
              ns[m.splitId].paidBy = null;
            }
            ne.splitDetails = ns;
            ne.status = Object.values(ns).every((v) => v.paid) ? 'paid' : 'pending';
          }
        });
      }
      return ne;
    });
    updateDB({ expenses: newExps });
    setReceiptModal({ open: false, items: [], total: 0, date: null });
    showToast("ยกเลิกใบเสร็จเรียบร้อย");
  };

  const confirmPartialPay = (e) => {
    e.preventDefault();
    if (!currentUser) return showToast("⚠️ กรุณาเลือกชื่อ 'ผู้ทำรายการ' ก่อนทำรายการ");
    const { exp, amount, payerId } = partialPayModal;
    const splitAmount = parseFloat(amount);
    if (!splitAmount || splitAmount <= 0) return alert('ยอดเงินไม่ถูกต้อง');

    let originalAmount = 0;
    if (exp.payerType === 'single') {
      originalAmount = parseFloat(exp.totalAmount);
    } else {
      originalAmount = parseFloat(exp.splitDetails?.[payerId]?.amount) || 0;
    }

    const pMonth = filters.month || new Date().toISOString().slice(0, 7);
    const pAt = Date.now();

    if (splitAmount >= originalAmount) {
      const ne = { ...exp };
      if (ne.payerType === 'single') {
        ne.status = 'paid';
        ne.paidMonth = pMonth;
        ne.paidAt = pAt;
        ne.paidBy = currentUser;
      } else {
        const ns = { ...ne.splitDetails };
        ns[payerId] = { ...ns[payerId], paid: true, paidMonth: pMonth, paidAt: pAt, paidBy: currentUser };
        ne.splitDetails = ns;
        ne.status = Object.values(ns).every((v) => v.paid) ? 'paid' : 'pending';
      }
      updateDB({ expenses: dbData.expenses.map((x) => String(x.id) === String(ne.id) ? ne : x) });
    } else {
      const bill1 = { ...exp, updatedAt: Date.now() };
      const bill2 = { 
        ...exp, 
        id: Date.now().toString() + '-rem', 
        createdAt: Date.now(), 
        updatedAt: Date.now(), 
        title: exp.title + ' (ยอดคงเหลือ)' 
      };

      if (exp.payerType === 'single') {
        bill1.totalAmount = splitAmount;
        bill1.status = 'paid';
        bill1.paidMonth = pMonth;
        bill1.paidAt = pAt;
        bill1.paidBy = currentUser;
        
        bill2.totalAmount = originalAmount - splitAmount;
        bill2.status = 'pending';
        bill2.paidMonth = null;
        bill2.paidAt = null;
      } else {
        const b1Split = {};
        const b2Split = {};
        Object.keys(exp.splitDetails).forEach((id) => {
          if (String(id) === String(payerId)) {
            b1Split[id] = { ...exp.splitDetails[id], amount: splitAmount, paid: true, paidMonth: pMonth, paidAt: pAt, paidBy: currentUser };
            b2Split[id] = { ...exp.splitDetails[id], amount: originalAmount - splitAmount, paid: false, paidMonth: null, paidAt: null };
          } else {
            b1Split[id] = { ...exp.splitDetails[id], amount: 0, paid: true, paidMonth: pMonth, paidAt: pAt, paidBy: currentUser };
            b2Split[id] = { ...exp.splitDetails[id] };
          }
        });
        bill1.splitDetails = b1Split;
        bill1.status = 'paid';
        bill2.splitDetails = b2Split;
        bill2.status = 'pending';
      }
      updateDB({ expenses: [...dbData.expenses.filter((x) => String(x.id) !== String(exp.id)), bill1, bill2] });
    }

    setPartialPayModal({ open: false, exp: null, amount: '', payerId: '' });
    setReceiptModal({ 
      open: true, 
      items: [{ title: `${exp.title} (แบ่งจ่าย)`, amount: splitAmount }], 
      total: splitAmount, 
      date: pAt, 
      isHistory: false 
    });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(dbData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MoneyPop_Backup_${new Date().toISOString().slice(0, 10)}.json`;
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

  const handleSelectUser = (userId) => {
    setCurrentUser(String(userId));
    localStorage.setItem('moneyPopUser', String(userId));
    setShowUserModal(false);
  };

  return {
    dbData,
    isLoading,
    isSyncing,
    filters,
    setFilters,
    filteredExps,
    expenseTab,
    setExpenseTab,
    selectedForPay,
    splitModal,
    setSplitModal,
    partialPayModal,
    setPartialPayModal,
    receiptModal,
    setReceiptModal,
    receiptHistory,
    currentUser,
    showUserModal,
    setShowUserModal,
    toast,
    showToast,
    fetchData,
    updateDB,
    deleteExpense,
    togglePay,
    confirmSplitPay,
    bulkPay,
    handleUndoPay,
    handleUndoReceipt,
    confirmPartialPay,
    handleExportData,
    handleImportData,
    handleSelectUser
  };
}
