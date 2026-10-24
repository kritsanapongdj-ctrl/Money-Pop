import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip as RechartsTooltip, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { Eye, EyeOff, CheckCircle2, Clock3, TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';

export default function Dashboard({ filteredExps, categories, members, filters }) {
  const [hideAmount, setHideAmount] = useState(false);

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

  const totalAll = totalPaid + totalPending;
  const paidPercent = totalAll > 0 ? Math.round((totalPaid / totalAll) * 100) : 0;

  return (
    <div className="px-4 sm:px-0 space-y-4">
      {/* K-Plus & UOB TMRW Inspired Hero Tile */}
      <div className="bg-white border-2 border-[#12161A] shadow-[4px_4px_0px_#12161A] rounded-2xl p-5 relative overflow-hidden">
        {/* Top bar with Eyeball Toggle (K-Plus style) */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2554FF] border border-[#12161A]" />
            <span className="text-[11px] font-black tracking-wider text-slate-600 uppercase">
              ยอดรวมค่าใช้จ่ายประจำเดือน
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setHideAmount(!hideAmount)}
            aria-label={hideAmount ? "แสดงยอดเงิน" : "ซ่อนยอดเงิน"}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#12161A] font-semibold bg-slate-100 hover:bg-slate-200 border border-[#12161A] rounded-lg px-2 py-0.5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2554FF]"
            title={hideAmount ? "แสดงยอดเงิน" : "ซ่อนยอดเงิน"}
          >
            {hideAmount ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
            <span className="text-[10px]">{hideAmount ? "ซ่อนอยู่" : "ซ่อนยอด"}</span>
          </button>
        </div>

        {/* Big Balance Number */}
        <div className="mb-4">
          <h2 className="text-3xl sm:text-4xl font-mono font-black text-[#12161A] tracking-tight">
            {hideAmount ? '฿ ••••••' : formatCurrency(totalAll)}
          </h2>
        </div>

        {/* UOB TMRW Style Progress Track */}
        <div className="mb-4 bg-[#F5F6F0] border-2 border-[#12161A] rounded-xl p-3">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1 text-[#12161A]">
              <TrendingUp size={13} className="text-[#2554FF]" />
              ความคืบหน้าการชำระบิล
            </span>
            <span className="font-mono text-[#059669] font-black">
              {paidPercent}% ชำระแล้ว
            </span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full border border-[#12161A] overflow-hidden p-[1px]">
            <div 
              className="bg-[#059669] h-full rounded-full transition-all duration-500"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
        </div>

        {/* SCB EASY Segmented Balance Tiles */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#ECFDF5] border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] p-3 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 size={14} className="text-[#059669]" />
              <span className="text-[11px] font-bold text-[#065F46]">ชำระแล้ว</span>
            </div>
            <p className="text-base sm:text-lg font-mono font-black text-[#059669] truncate">
              {hideAmount ? '••••' : formatCurrency(totalPaid)}
            </p>
          </div>

          <div className="bg-[#FFFBEB] border-2 border-[#12161A] shadow-[2px_2px_0px_#12161A] p-3 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock3 size={14} className="text-[#D97706]" />
              <span className="text-[11px] font-bold text-[#92400E]">รอชำระ</span>
            </div>
            <p className="text-base sm:text-lg font-mono font-black text-[#D97706] truncate">
              {hideAmount ? '••••' : formatCurrency(totalPending)}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
            <div className="w-6 h-6 rounded-lg bg-[#2554FF]/10 text-[#2554FF] border border-[#12161A] flex items-center justify-center">
              <BarChart3 size={14} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#12161A]">
              แยกตามหมวดหมู่ค่าใช้จ่าย
            </h3>
          </div>
          
          <div className="h-60">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                ไม่มีรายการในเดือนนี้
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="n" type="category" width={80} tick={{ fontSize: 11, fill: '#12161A', fontWeight: 600 }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(37, 84, 255, 0.06)' }} 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '2px solid #12161A', 
                      borderRadius: '10px', 
                      boxShadow: '3px 3px 0px #12161A',
                      color: '#12161A',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }} 
                    formatter={(v) => formatCurrency(v)} 
                  />
                  <Bar dataKey="v" radius={[0, 6, 6, 0]} barSize={18}>
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={theme.chartColors[index % theme.chartColors.length]} 
                        stroke="#12161A" 
                        strokeWidth={1.5}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Member Breakdown Pie Chart */}
        {!filters.payer && (
          <div className="bg-white border-2 border-[#12161A] shadow-[3px_3px_0px_#12161A] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
              <div className="w-6 h-6 rounded-lg bg-[#059669]/10 text-[#059669] border border-[#12161A] flex items-center justify-center">
                <PieIcon size={14} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#12161A]">
                สัดส่วนยอดใช้จ่ายรายบุคคล
              </h3>
            </div>

            <div className="h-60">
              {memberData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                  ไม่มีรายการในเดือนนี้
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={memberData} 
                      dataKey="v" 
                      nameKey="n" 
                      innerRadius={45} 
                      outerRadius={75} 
                      stroke="#12161A"
                      strokeWidth={2}
                    >
                      {memberData.map((_, i) => (
                        <Cell key={i} fill={theme.chartColors[i % theme.chartColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '2px solid #12161A', 
                        borderRadius: '10px', 
                        boxShadow: '3px 3px 0px #12161A',
                        color: '#12161A',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }} 
                      formatter={(v) => formatCurrency(v)} 
                    />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: '11px', color: '#12161A', fontWeight: 600 }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

