
import React, { useState } from 'react';
import { PayrollSummary } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  summary: PayrollSummary;
}

const StatsSection: React.FC<Props> = ({ summary }) => {
  const [isDetailed, setIsDetailed] = useState(false);

  return (
    <div className="px-5 mt-6 space-y-4">
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-8 rounded-[2.5rem] shadow-2xl shadow-orange-500/20 relative overflow-hidden group active:scale-[0.98] transition-transform">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
            <p className="text-orange-100 font-black text-[10px] uppercase tracking-[0.2em] opacity-80 mb-1">Tổng thu nhập dự kiến</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">{formatCurrency(summary.totalIncome)}</h3>
            
            <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-4">
               <div>
                  <p className="text-orange-100 text-[9px] uppercase font-black opacity-60">Lương công ({summary.totalWorkDays} ngày)</p>
                  <p className="text-white text-lg font-black">{formatCurrency(summary.baseIncome)}</p>
               </div>
               <div className="text-right">
                  <p className="text-orange-100 text-[9px] uppercase font-black opacity-60">Tăng ca ({summary.totalOTHours}h)</p>
                  <p className="text-white text-lg font-black">{formatCurrency(summary.otIncome)}</p>
               </div>
            </div>
        </div>
      </div>

      <div 
        className={`bg-zinc-900 rounded-[2rem] border transition-all duration-300 overflow-hidden ${isDetailed ? 'border-orange-500/30 ring-1 ring-orange-500/10' : 'border-zinc-800'}`}
      >
          <button 
            onClick={() => setIsDetailed(!isDetailed)}
            className="w-full p-5 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-orange-500 border border-zinc-800">
                  <i className="fa-solid fa-chart-line text-sm"></i>
              </div>
              <div className="text-left">
                  <p className="text-white font-black text-xs uppercase tracking-wider">Chi tiết lương</p>
                  <p className="text-zinc-500 text-[10px] font-bold">Xem bảng kê tăng ca & đơn giá</p>
              </div>
            </div>
            <i className={`fa-solid fa-chevron-down text-zinc-600 text-xs transition-transform ${isDetailed ? 'rotate-180' : ''}`}></i>
          </button>
          
          <div className={`transition-all duration-300 ${isDetailed ? 'max-h-[500px] opacity-100 p-5 pt-0' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800">
                        <p className="text-[9px] text-zinc-500 font-black uppercase">Đơn giá ngày</p>
                        <p className="text-sm font-black text-white">{formatCurrency(summary.dailyRate)}</p>
                    </div>
                    <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800">
                        <p className="text-[9px] text-zinc-500 font-black uppercase">Đơn giá giờ</p>
                        <p className="text-sm font-black text-white">{formatCurrency(summary.hourlyRate)}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {[
                        { label: 'Ngày thường (x1.5)', hours: summary.otHoursNormal, amount: summary.otAmountNormal },
                        { label: 'Chủ nhật (x2.0)', hours: summary.otHoursSunday, amount: summary.otAmountSunday },
                        { label: 'Ngày Lễ (x2.0/x3.0)', hours: summary.otHoursHolidayX2 + summary.otHoursHolidayX3, amount: summary.otAmountHolidayX2 + summary.otAmountHolidayX3 }
                    ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center px-2 py-1">
                            <div className="text-[10px] font-bold text-zinc-400">{item.label}: <span className="text-zinc-200">{item.hours}h</span></div>
                            <div className="text-xs font-black text-white">{formatCurrency(item.amount)}</div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default StatsSection;
