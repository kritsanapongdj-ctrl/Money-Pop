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
      <div className="min-h-screen flex items-center justify-center font-bold text-[#f472b6] bg-[#1a1c29]">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] ${theme.bg} font-sans`}>
      <div className="max-w-md sm:max-w-3xl lg:max-w-5xl mx-auto flex flex-col h-[100dvh] bg-[#1a1c29] border-x border-[#25283d] shadow-2xl shadow-pink-900/10">
        
        {/* Top Header */}
        <Header 
          currentUser={currentUser} 
          members={dbData.members} 
          onOpenUserModal={() => setShowUserModal(true)} 
          isSyncing={isSyncing} 
          onRefresh={fetchData} 
        />

        <main className="flex-1 overflow-y-auto sm:p-6 pb-20 custom-scrollbar">
          {/* Sticky Filters Bar */}
          <div className="sticky top-0 bg-[#1a1c29]/90 backdrop-blur-xl z-10 px-4 py-3 border-b border-[#3f4366]/50 mb-4 flex gap-2 shadow-sm">
            <input 
              type="month" 
              value={filters.month} 
              onChange={(e) => setFilters({ ...filters, month: e.target.value })} 
              className="bg-[#25283d] border border-[#3f4366] text-slate-200 rounded-xl px-3 py-2 text-sm font-medium w-1/3 focus:border-[#f472b6] outline-none transition-colors" 
            />
            <select 
              value={filters.payer} 
              onChange={(e) => setFilters({ ...filters, payer: e.target.value })} 
              className="bg-[#25283d] border border-[#3f4366] text-slate-200 rounded-xl px-2 py-2 text-sm w-1/3 focus:border-[#f472b6] outline-none transition-colors"
            >
              <option value="">👤 ทุกคน</option>
              {dbData.members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({ ...filters, category: e.target.value })} 
              className="bg-[#25283d] border border-[#3f4366] text-slate-200 rounded-xl px-2 py-2 text-sm w-1/3 focus:border-[#f472b6] outline-none transition-colors"
            >
              <option value="">📁 หมวด</option>
              {dbData.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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