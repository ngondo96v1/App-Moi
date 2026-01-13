
import { DayData, SalaryConfig, PayrollSummary, ShiftType, LeaveType } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Math.round(amount));
};

export const formatInputNumber = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseInputNumber = (val: string): number => {
  const cleanStr = val.replace(/\./g, '');
  return parseInt(cleanStr, 10) || 0;
};

export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getPayrollRange = (targetYear: number, targetMonth: number) => {
  // Chu kỳ lương từ ngày 21 tháng trước đến ngày 20 tháng này (Phổ biến tại VN)
  // Hoặc theo logic cũ của bạn: 21 tháng trước đến 27 tháng này
  const startDate = new Date(targetYear, targetMonth - 1, 21, 0, 0, 0);
  const endDate = new Date(targetYear, targetMonth, 27, 23, 59, 59);
  return { startDate, endDate };
};

export const calculatePayroll = (
  days: DayData[],
  config: SalaryConfig,
  allowancesTotal: number,
  targetMonth: number,
  targetYear: number
): PayrollSummary => {
  const { startDate, endDate } = getPayrollRange(targetYear, targetMonth);

  const dailyRate = config.standardWorkDays > 0 ? config.baseSalary / config.standardWorkDays : 0;
  const hourlyRate = dailyRate / 8;

  const relevantDays = days.filter(d => {
    const dDate = new Date(d.date + 'T00:00:00');
    return dDate >= startDate && dDate <= endDate;
  });

  let totalWorkDays = 0;
  let totalOTHours = 0;
  let otAmountNormal = 0, otAmountSunday = 0, otAmountHolidayX2 = 0, otAmountHolidayX3 = 0;
  let otHoursNormal = 0, otHoursSunday = 0, otHoursHolidayX2 = 0, otHoursHolidayX3 = 0;

  relevantDays.forEach(day => {
    const dateObj = new Date(day.date + 'T00:00:00');
    const isSunday = dateObj.getDay() === 0;

    // Tính công
    if (day.leave === LeaveType.PAID) {
      totalWorkDays += 1; // Nghỉ phép vẫn tính công
    } else if (day.shift !== ShiftType.NONE) {
      totalWorkDays += 1;
    }

    // Tính tăng ca
    if (day.overtimeHours > 0) {
      totalOTHours += day.overtimeHours;
      if (day.isHoliday) {
        // Lễ: 8h đầu x200%, từ giờ thứ 9 x300% (theo luật VN tùy cty, ở đây giữ logic của bạn)
        const first8 = Math.min(day.overtimeHours, 8);
        const extra = Math.max(0, day.overtimeHours - 8);
        otHoursHolidayX2 += first8;
        otHoursHolidayX3 += extra;
        otAmountHolidayX2 += (first8 * hourlyRate * 2);
        otAmountHolidayX3 += (extra * hourlyRate * 3);
      } else if (isSunday) {
        otHoursSunday += day.overtimeHours;
        otAmountSunday += (day.overtimeHours * hourlyRate * 2.0);
      } else {
        otHoursNormal += day.overtimeHours;
        otAmountNormal += (day.overtimeHours * hourlyRate * 1.5);
      }
    }
  });

  const baseIncome = totalWorkDays * dailyRate;
  const otIncome = otAmountNormal + otAmountSunday + otAmountHolidayX2 + otAmountHolidayX3;
  const totalIncome = baseIncome + otIncome + allowancesTotal;

  return {
    totalWorkDays: Number(totalWorkDays.toFixed(1)),
    totalOTHours: Number(totalOTHours.toFixed(1)),
    otHoursNormal, otHoursSunday, otHoursHolidayX2, otHoursHolidayX3,
    otAmountNormal: Math.round(otAmountNormal),
    otAmountSunday: Math.round(otAmountSunday),
    otAmountHolidayX2: Math.round(otAmountHolidayX2),
    otAmountHolidayX3: Math.round(otAmountHolidayX3),
    totalAllowances: Math.round(allowancesTotal),
    otIncome: Math.round(otIncome),
    baseIncome: Math.round(baseIncome),
    totalIncome: Math.round(totalIncome),
    dailyRate: Math.round(dailyRate),
    hourlyRate: Math.round(hourlyRate)
  };
};
