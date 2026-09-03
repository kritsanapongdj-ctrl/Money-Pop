import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip as RechartsTooltip, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';

export default function Dashboard({ filteredExps, categories, members, filters }) {
  const { totalPaid, totalPending, categoryData, memberData } = useMemo(() => {
    let tPaid = 0;
    let tPend = 0;
    const cMap = {};
    const mMap = {};

    filteredExps.forEach((e) => {
      const cat = categories.find((c) => String(c.id) === String(e.categoryId))?.name || 'อื่นๆ';
      
      if (e.payerType === 'single') {
        if (filters.payer && String(e.payerId) !== String(filters.payer)) return;
        
        const effectivePaidMonth = (e.status === 'paid' && !e.paidMonth) ? e.month : e.paidMonth;
        const isPaidInView = filters.month ? (effectivePaidMonth === filters.month) : (e.status === 'paid');
        const isPendInView = filters.month ? (!effectivePaidMonth || effectivePaidMonth > filters.month) : (e.status !== 'paid');
        const a = parseFloat(e.totalAmount) || 0;

        if (isPaidInView) {
          tPaid += a;
          cMap[cat] = (cMap[cat] || 0) + a;
        } else if (isPendInView) {
          tPend += a;
          cMap[cat] = (cMap[cat] || 0) + a;
        }

        if (!filters.payer && (isPaidInView || isPendInView)) {
          const mName = members.find((m) => String(m.id) === String(e.payerId))?.name || 'ไม่ระบุ';
          mMap[mName] = (mMap[mName] || 0) + a;
        }
      } else {
        Object.entries(e.splitDetails || {}).forEach(([id, d]) => {
          if (filters.payer && String(id) !== String(filters.payer)) return;
          
          const effectivePaidMonth = (d.paid && !d.paidMonth) ? e.month : d.paidMonth;
          const isPaidInView = filters.month ? (effectivePaidMonth === filters.month) : d.paid;
          const isPendInView = filters.month ? (!effectivePaidMonth || effectivePaidMonth > filters.month) : !d.paid;
          const a = parseFloat(d.amount) || 0;

          if (isPaidInView) {
            tPaid += a;
            cMap[cat] = (cMap[cat] || 0) + a;
          } else if (isPendInView) {
            tPend += a;
            cMap[cat] = (cMap[cat] || 0) + a;
          }

          if (!filters.payer && (isPaidInView || isPendInView)) {
            const mName = members.find((m) => String(m.id) === String(id))?.name || 'ไม่ระบุ';
            mMap[mName] = (mMap[mName] || 0) + a;
          }
        });
      }
    });

    return {
      totalPaid: tPaid,
      totalPending: tPend,
      categoryData: Object.keys(cMap).map((k) => ({ n: k, v: cMap[k] })),
      memberData: Object.keys(mMap).map((k) => ({ n: k, v: mMap[k] }))
    };
  }, [filteredExps, categories, members, filters]);

  return (
    <div className="px-4 sm:px-0 space-y-4">
      {/* Summary Hero Card */}
      <div className={`${theme.card} p-5 bg-gradient-to-br from-[#2e1065] via-[#1e1b4b] to-[#4c1d95] text-white border-[#8b5cf6]/30 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#f472b6]/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
        <p className="text-[#a78bfa] text-sm mb-1 font-medium z-10 relative">ยอดใช้จ่ายรวมเดือนนี้</p>
        <h2 className="text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#f472b6] to-[#fbbf24] drop-shadow-[0_2px_10px_rgba(244,114,182,0.3)] z-10 relative">
          {formatCurrency(totalPaid + totalPending)}
        </h2>
        <div className="grid grid-cols-2 gap-3 z-10 relative">
          <div className="bg-[#1a1c29]/60 backdrop-blur-md p-3 rounded-xl border-l-4 border-[#34d399] shadow-inner">
            <p className="text-xs font-bold text-slate-400">ชำระแล้ว</p>
            <p className="text-lg font-black text-[#34d399]">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-[#1a1c29]/60 backdrop-blur-md p-3 rounded-xl border-l-4 border-[#f472b6] shadow-inner">
            <p className="text-xs font-bold text-slate-400">รอชำระ</p>
            <p className="text-lg font-black text-[#f472b6]">{formatCurrency(totalPending)}</p>
          </div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${theme.card} p-4 h-64`}>
          <h3 className="text-sm font-bold text-[#f472b6] mb-2">แยกตามหมวดหมู่</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="n" type="category" width={70} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <RechartsTooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                contentStyle={{ backgroundColor: '#1a1c29', border: '1px solid #3f4366', borderRadius: '12px', color: '#f1f5f9' }} 
                formatter={(v) => formatCurrency(v)} 
              />
              <Bar dataKey="v" radius={[0, 4, 4, 0]} barSize={20}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={theme.chartColors[index % theme.chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {!filters.payer && (
          <div className={`${theme.card} p-4 h-64`}>
            <h3 className="text-sm font-bold text-[#f472b6] mb-2">แยกรายบุคคล</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={memberData} 
                  dataKey="v" 
                  nameKey="n" 
                  innerRadius={40} 
                  outerRadius={70} 
                  stroke="none"
                >
                  {memberData.map((_, i) => (
                    <Cell key={i} fill={theme.chartColors[i % theme.chartColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1a1c29', border: '1px solid #3f4366', borderRadius: '12px', color: '#f1f5f9' }} 
                  formatter={(v) => formatCurrency(v)} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
