
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DayData, 
  SalaryConfig, 
  Allowance, 
  ShiftType, 
  LeaveType,
  PayrollSummary 
} from './types';
import { 
  calculatePayroll, 
  toDateKey 
} from './utils';
import Calendar from './components/Calendar';
import DayEditModal from './components/DayEditModal';
import AllowanceSection from './components/AllowanceSection';
import StatsSection from './components/StatsSection';
import SalaryHeader from './components/SalaryHeader';
import AuthModal from './components/AuthModal';

const STORAGE_KEY = 'ym_money_data_v2';
const USER_KEY = 'ym_money_user';

const App: React.FC = () => {
  // Logic khởi tạo: Nếu hôm nay > ngày 27, mặc định xem chu kỳ lương tháng tới
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    const d = new Date();
    if (d.getDate() > 27) return new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  
  const [user, setUser] = useState<{ name: string } | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [salaryConfig, setSalaryConfig] = useState<SalaryConfig>({
    baseSalary: 0,
    standardWorkDays: 0,
  });
  
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [daysData, setDaysData] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Persistence Load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.salaryConfig) setSalaryConfig(parsed.salaryConfig);
        if (parsed.allowances) setAllowances(parsed.allowances);
        if (parsed.daysData) setDaysData(parsed.daysData);
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
  }, []);

  // Persistence Save
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ salaryConfig, allowances, daysData }));
    }
  }, [salaryConfig, allowances, daysData, user]);

  const activeAllowancesTotal = useMemo(() => 
    allowances.reduce((acc, curr) => curr.isActive ? acc + curr.amount : acc, 0)
  , [allowances]);

  const summary = useMemo(() => 
    calculatePayroll(
      daysData, 
      salaryConfig, 
      activeAllowancesTotal, 
      currentViewDate.getMonth(), 
      currentViewDate.getFullYear()
    )
  , [daysData, salaryConfig, activeAllowancesTotal, currentViewDate]);

  const handleDayClick = useCallback((date: Date) => {
    const dateStr = toDateKey(date);
    const existing = daysData.find(d => d.date === dateStr);
    setSelectedDay(existing || {
      date: dateStr,
      shift: ShiftType.DAY,
      leave: LeaveType.NONE,
      overtimeHours: 0,
      isHoliday: false
    });
    setIsEditModalOpen(true);
  }, [daysData]);

  const handleSaveDay = useCallback((updated: DayData) => {
    setDaysData(prev => {
      const filtered = prev.filter(d => d.date !== updated.date);
      if (updated.shift === ShiftType.NONE && 
          updated.leave === LeaveType.NONE && 
          updated.overtimeHours === 0 && 
          !updated.notes && !updated.isHoliday) {
        return filtered;
      }
      return [...filtered, updated];
    });
    setIsEditModalOpen(false);
  }, []);

  const handleUpdateSalary = useCallback((field: keyof SalaryConfig, value: number) => {
    setSalaryConfig(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLogin = (name: string) => {
    const newUser = { name };
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <AuthModal 
          onClose={() => {}} 
          onLogin={handleLogin}
          isForced={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-zinc-950 flex flex-col pb-24 relative overflow-x-hidden selection:bg-orange-500/30">
      <SalaryHeader 
        config={salaryConfig} 
        onUpdate={handleUpdateSalary} 
        user={user}
        onAuthClick={() => {}} 
        onLogout={handleLogout}
      />
      
      <main className="animate-in fade-in slide-in-from-bottom-5 duration-700">
        <StatsSection summary={summary} />
        
        <div className="px-5 mt-8 space-y-4">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-sm font-black text-zinc-600 uppercase tracking-[0.2em]">Lịch Chấm Công</h2>
             <div className="w-12 h-px bg-zinc-800 flex-1 ml-4 opacity-50"></div>
          </div>
          <Calendar 
            viewDate={currentViewDate} 
            onViewDateChange={setCurrentViewDate}
            onDayClick={handleDayClick}
            daysData={daysData}
          />
        </div>

        <AllowanceSection 
          allowances={allowances} 
          onToggle={(id) => setAllowances(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a))}
          onAdd={(name, amount) => setAllowances(prev => [...prev, { id: Date.now().toString(), name, amount, isActive: true }])}
          onEdit={(updated) => setAllowances(prev => prev.map(a => a.id === updated.id ? updated : a))}
          onRemove={(id) => setAllowances(prev => prev.filter(a => a.id !== id))}
          onSetAll={(val) => setAllowances(prev => prev.map(a => ({ ...a, isActive: val })))}
        />
      </main>

      <footer className="mt-12 px-8 py-10 border-t border-zinc-900 text-center space-y-4 opacity-40">
        <div className="flex justify-center space-x-6 text-zinc-600">
            <i className="fa-solid fa-shield-halved text-lg"></i>
            <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
            <i className="fa-solid fa-microchip text-lg"></i>
        </div>
        <div>
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em]">YM Money &bull; Personal Finance</p>
            <p className="text-zinc-700 text-[8px] font-bold mt-1 tracking-widest uppercase">Precision Data Processing &copy; 2024</p>
        </div>
      </footer>

      {isEditModalOpen && selectedDay && (
        <DayEditModal 
          day={selectedDay}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveDay}
        />
      )}
      
      {/* Decorative Blur Elements - THÊM pointer-events-none ĐỂ KHÔNG CHẶN CLICK */}
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none rounded-full"></div>
      <div className="fixed bottom-1/4 -right-20 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none rounded-full"></div>
    </div>
  );
};

export default App;
