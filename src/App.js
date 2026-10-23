import React, { useState } from 'react';
import { theme } from './constants/theme';
import { useMoneyPop } from './hooks/useMoneyPop';

// Components
import Header from './components/navigation/Header';
import BottomNav from './components/navigation/BottomNav';
import Toast from './components/common/Toast';
import Dashboard from './components/dashboard/Dashboard';
import ExpenseList from './components/expenses/ExpenseList';
import ReceiptList from './components/receipts/ReceiptList';
import Settings from './components/settings/Settings';

// Modals
import ExpenseFormModal from './components/modals/ExpenseFormModal';
import SplitPayModal from './components/modals/SplitPayModal';
import PartialPayModal from './components/modals/PartialPayModal';
import ReceiptModal from './components/modals/ReceiptModal';
import UserSelectModal from './components/modals/UserSelectModal';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [modal, setModal] = useState({ open: false, edit: null });

  const {
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
  } = useMoneyPop();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6F0] p-4 font-sans">
        <div className="bg-white border-2 border-[#12161A] shadow-[5px_5px_0px_#12161A] rounded-2xl p-6 flex flex-col items-center max-w-xs text-center">
          <div className="w-14 h-14 bg-[#2554FF] text-white rounded-2xl border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] flex items-center justify-center mb-3 animate-pulse">
            <span className="font-mono font-black text-2xl">฿</span>
          </div>
          <p className="font-black text-lg text-[#12161A] tracking-tight">กำลังเปิดตู้เซฟข้อมูล...</p>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Money-Pop Vault • Gen-Y Fintech</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] ${theme.bg} font-sans`}>
      <div className="max-w-md sm:max-w-3xl lg:max-w-4xl mx-auto flex flex-col h-[100dvh] bg-[#F5F6F0] sm:border-x-2 sm:border-[#12161A] shadow-[0_10px_40px_rgba(18,22,26,0.06)]">
        
        {/* Top Header */}
        <Header 
          currentUser={currentUser} 
          members={dbData.members} 
          onOpenUserModal={() => setShowUserModal(true)} 
          isSyncing={isSyncing} 
          onRefresh={fetchData} 
        />

        <main className="flex-1 overflow-y-auto sm:p-5 pb-20 custom-scrollbar">
          {/* Sticky Bank Filter Dock */}
          <div className="sticky top-0 bg-[#F5F6F0]/95 backdrop-blur-md z-10 px-4 py-2.5 border-b-2 border-[#12161A] mb-4 flex gap-2 items-center">
            <div className="flex-1 min-w-0">
              <input 
                type="month" 
                value={filters.month} 
                onChange={(e) => setFilters({ ...filters, month: e.target.value })} 
                className="w-full bg-white border-2 border-[#12161A] text-[#12161A] font-bold rounded-xl px-2.5 py-1.5 text-xs shadow-[2px_2px_0px_#12161A] focus:outline-none focus:ring-2 focus:ring-[#2554FF] transition-all" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <select 
                value={filters.payer} 
                onChange={(e) => setFilters({ ...filters, payer: e.target.value })} 
                className="w-full bg-white border-2 border-[#12161A] text-[#12161A] font-bold rounded-xl px-2 py-1.5 text-xs shadow-[2px_2px_0px_#12161A] focus:outline-none focus:ring-2 focus:ring-[#2554FF] transition-all truncate"
              >
                <option value="">👤 ทุกคน</option>
                {dbData.members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-0">
              <select 
                value={filters.category} 
                onChange={(e) => setFilters({ ...filters, category: e.target.value })} 
                className="w-full bg-white border-2 border-[#12161A] text-[#12161A] font-bold rounded-xl px-2 py-1.5 text-xs shadow-[2px_2px_0px_#12161A] focus:outline-none focus:ring-2 focus:ring-[#2554FF] transition-all truncate"
              >
                <option value="">📁 ทุกหมวด</option>
                {dbData.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Views */}
          {tab === 'dashboard' && (
            <Dashboard 
              filteredExps={filteredExps} 
              categories={dbData.categories} 
              members={dbData.members} 
              filters={filters} 
            />
          )}

          {tab === 'expenses' && (
            <ExpenseList
              filteredExps={filteredExps}
              categories={dbData.categories}
              members={dbData.members}
              filters={filters}
              expenseTab={expenseTab}
              setExpenseTab={setExpenseTab}
              selectedForPay={selectedForPay}
              onTogglePay={togglePay}
              onBulkPay={bulkPay}
              onUndoPay={handleUndoPay}
              onPartialPay={(exp) => setPartialPayModal({ 
                open: true, 
                exp, 
                amount: '', 
                payerId: (exp.payerType === 'split' && filters.payer) ? filters.payer : '' 
              })}
              onOpenCreateModal={() => setModal({ open: true, edit: null })}
              onEditExpense={(exp) => setModal({ open: true, edit: exp })}
              onDeleteExpense={deleteExpense}
            />
          )}

          {tab === 'receipts' && (
            <ReceiptList 
              receiptHistory={receiptHistory} 
              members={dbData.members} 
              onViewReceipt={(r) => setReceiptModal({ open: true, ...r, isHistory: true })} 
            />
          )}

          {tab === 'settings' && (
            <Settings 
              dbData={dbData} 
              updateDB={updateDB} 
              onExportData={handleExportData} 
              onImportData={handleImportData} 
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={tab} onSelectTab={setTab} />
      </div>

      {/* Modals */}
      {modal.open && (
        <ExpenseFormModal 
          editingExpense={modal.edit} 
          dbData={dbData} 
          updateDB={updateDB} 
          close={() => setModal({ open: false, edit: null })} 
          showToast={showToast} 
          currentUser={currentUser} 
        />
      )}

      <SplitPayModal 
        splitModal={splitModal} 
        setSplitModal={setSplitModal} 
        members={dbData.members} 
        onConfirm={confirmSplitPay} 
      />

      <PartialPayModal 
        partialPayModal={partialPayModal} 
        setPartialPayModal={setPartialPayModal} 
        members={dbData.members} 
        filters={filters} 
        onConfirm={confirmPartialPay} 
      />

      <ReceiptModal 
        receiptModal={receiptModal} 
        members={dbData.members} 
        currentUser={currentUser} 
        onClose={() => setReceiptModal({ open: false, items: [], total: 0, date: null })} 
        onUndoReceipt={handleUndoReceipt} 
      />

      <UserSelectModal 
        show={showUserModal} 
        members={dbData.members} 
        currentUser={currentUser} 
        onSelectUser={handleSelectUser} 
        onClose={() => setShowUserModal(false)} 
      />

      {/* Global Toast */}
      <Toast message={toast} />

      <style dangerouslySetInnerHTML={{
        __html: `.custom-scrollbar::-webkit-scrollbar{width:0px;background:transparent;}`
      }} />
    </div>
  );
}