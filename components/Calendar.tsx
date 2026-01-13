
import React, { useMemo } from 'react';
import { DayData, ShiftType, LeaveType } from '../types';
import { toDateKey, getPayrollRange } from '../utils';

interface Props {
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
  onDayClick: (date: Date) => void;
  daysData: DayData[];
}

const Calendar: React.FC<Props> = ({ viewDate, onViewDateChange, onDayClick, daysData }) => {
  const targetYear = viewDate.getFullYear();
  const targetMonth = viewDate.getMonth();

  const { calendarDays, startDate, endDate } = useMemo(() => {
    const range = getPayrollRange(targetYear, targetMonth);
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    
    const days: (Date | null)[] = [];
    
    // Tối ưu Padding để lịch cân đối
    const startDayOfWeek = start.getDay(); 
    const paddingCount = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    for (let i = 0; i < paddingCount; i++) {
      days.push(null);
    }
    
    let curr = new Date(start);
    while (curr <= end) {
      days.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    
    return { calendarDays: days, startDate: range.startDate, endDate: range.endDate };
  }, [targetYear, targetMonth]);

  const changeCycle = (offset: number) => {
    const nextDate = new Date(targetYear, targetMonth + offset, 1);
    onViewDateChange(nextDate);
  };

  const getDayStatus = (date: Date) => {
    const key = toDateKey(date);
    return daysData.find(d => d.date === key);
  };

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-800 shadow-2xl relative overflow-hidden group/calendar">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] rounded-full pointer-events-none group-hover/calendar:bg-orange-500/10 transition-colors duration-700"></div>
      
      <header className="flex items-center justify-between mb-8 relative z-10">
        <button 
          onClick={() => changeCycle(-1)} 
          className="w-11 h-11 rounded-2xl bg-zinc-950 flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all border border-zinc-800 text-zinc-500 hover:text-orange-500"
        >
          <i className="fa-solid fa-chevron-left text-xs"></i>
        </button>
        
        <div className="text-center">
            <h3 className="font-black text-white text-base tracking-tight uppercase">Tháng {targetMonth + 1} / {targetYear}</h3>
            <p className="text-[9px] text-zinc-500 font-bold mt-1 tracking-widest bg-zinc-950/50 py-1 px-3 rounded-full border border-zinc-800/50 inline-block">
               {startDate.getDate()}/{startDate.getMonth() + 1} — {endDate.getDate()}/{endDate.getMonth() + 1}
            </p>
        </div>

        <button 
          onClick={() => changeCycle(1)} 
          className="w-11 h-11 rounded-2xl bg-zinc-950 flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all border border-zinc-800 text-zinc-500 hover:text-orange-500"
        >
          <i className="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </header>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map(d => (
          <div key={d} className={`text-center text-[9px] font-black tracking-widest ${d === 'CN' ? 'text-red-500/40' : 'text-zinc-600'}`}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="aspect-square opacity-0" />;
          
          const status = getDayStatus(date);
          const isToday = new Date().toDateString() === date.toDateString();
          const isSunday = date.getDay() === 0;
          
          return (
            <div 
              key={date.getTime()}
              onClick={() => onDayClick(date)}
              className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative
                ${isToday 
                  ? 'bg-orange-500 text-zinc-950 shadow-lg shadow-orange-500/20' 
                  : 'bg-zinc-950/40 border border-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800/50'}
              `}
            >
              <span className={`text-[11px] font-black ${isToday ? 'text-zinc-950' : isSunday ? 'text-red-500' : 'text-zinc-300'}`}>
                {date.getDate()}
              </span>
              
              <div className="flex gap-[2px] mt-1.5 h-1">
                {status?.shift === ShiftType.DAY && <div className="w-1 h-1 rounded-full bg-orange-400"></div>}
                {status?.shift === ShiftType.NIGHT && <div className="w-1 h-1 rounded-full bg-indigo-400"></div>}
                {status?.leave === LeaveType.PAID && <div className="w-1 h-1 rounded-full bg-emerald-500"></div>}
                {status?.leave === LeaveType.SICK && <div className="w-1 h-1 rounded-full bg-rose-500"></div>}
              </div>

              {status?.overtimeHours > 0 && (
                <div className={`absolute -top-1 -right-1 px-1 rounded-md text-[7px] font-black py-0.5 border ${isToday ? 'bg-zinc-900 text-orange-400 border-zinc-800' : 'bg-amber-500/20 text-amber-500 border-amber-500/20'}`}>
                  +{status.overtimeHours}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
