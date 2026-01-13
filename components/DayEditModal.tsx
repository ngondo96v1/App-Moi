
import React, { useState } from 'react';
import { DayData, ShiftType, LeaveType } from '../types';

interface Props {
  day: DayData;
  onClose: () => void;
  onSave: (data: DayData) => void;
}

const DayEditModal: React.FC<Props> = ({ day, onClose, onSave }) => {
  const [data, setData] = useState<DayData>({ ...day });

  const dateObj = new Date(day.date + 'T00:00:00');
  const dateFormatted = dateObj.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });

  const handleToggleHoliday = () => setData(prev => ({ ...prev, isHoliday: !prev.isHoliday }));
  const adjustOT = (val: number) => {
    setData(prev => ({ ...prev, overtimeHours: Math.max(0, prev.overtimeHours + val) }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-zinc-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 border-t border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden"></div>
        
        <header className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight first-letter:uppercase">{dateFormatted}</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Cập nhật công & tăng ca</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div className="space-y-8">
          {/* Shift Selection */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: ShiftType.DAY, label: 'Ca Ngày', icon: 'fa-sun', color: 'bg-orange-500' },
              { type: ShiftType.NIGHT, label: 'Ca Đêm', icon: 'fa-moon', color: 'bg-indigo-500' },
              { type: ShiftType.NONE, label: 'Nghỉ', icon: 'fa-bed', color: 'bg-zinc-800' }
            ].map(opt => (
              <button 
                key={opt.type}
                onClick={() => setData(prev => ({ ...prev, shift: opt.type, leave: LeaveType.NONE }))}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${data.shift === opt.type ? `${opt.color} text-zinc-950 border-white/20 scale-105 shadow-lg` : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
              >
                <i className={`fa-solid ${opt.icon} text-lg`}></i>
                <span className="text-[9px] font-black uppercase">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Leave Selection */}
          <div className="flex gap-3">
             {[
               { type: LeaveType.PAID, label: 'Nghỉ phép', color: 'bg-emerald-600' },
               { type: LeaveType.SICK, label: 'Nghỉ bệnh', color: 'bg-rose-600' }
             ].map(opt => (
               <button 
                 key={opt.type}
                 onClick={() => setData(prev => ({ ...prev, leave: prev.leave === opt.type ? LeaveType.NONE : opt.type, shift: ShiftType.NONE }))}
                 className={`flex-1 py-3 rounded-2xl border text-[10px] font-black uppercase transition-all ${data.leave === opt.type ? `${opt.color} text-white border-white/10 shadow-lg` : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
               >
                 {opt.label}
               </button>
             ))}
          </div>

          {/* OT Control */}
          <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800">
            <div className="flex justify-between items-center mb-4">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Giờ tăng ca</span>
               <button 
                onClick={handleToggleHoliday}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${data.isHoliday ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-800 text-zinc-600'}`}
               >
                 {data.isHoliday ? 'Ngày Lễ (X2/X3)' : 'Đặt là Ngày Lễ'}
               </button>
            </div>
            
            <div className="flex items-center justify-between">
               <button onClick={() => adjustOT(-0.5)} className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-white active:scale-90">-</button>
               <div className="text-4xl font-black text-white">{data.overtimeHours}<span className="text-sm text-zinc-600 ml-1">H</span></div>
               <button onClick={() => adjustOT(0.5)} className="w-12 h-12 rounded-xl bg-orange-500 text-zinc-950 active:scale-90">+</button>
            </div>
          </div>

          <button 
            onClick={() => onSave(data)}
            className="w-full py-5 rounded-2xl bg-orange-500 text-zinc-950 font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-500/10 active:scale-[0.98] transition-all"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayEditModal;
