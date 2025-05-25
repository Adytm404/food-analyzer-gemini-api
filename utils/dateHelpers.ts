
import { ChartDataPoint, FoodEntry } from '../types';

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStartOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfDay = (date: Date): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getStartOfWeek = (date: Date): Date => { // Monday as start of week
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust if Sunday is 0
  start.setDate(diff);
  return getStartOfDay(start);
};

export const getStartOfMonth = (date: Date): Date => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  return getStartOfDay(start);
};

export const aggregateDataForPeriod = (
  entries: FoodEntry[],
  periodStartDate: Date,
  periodEndDate: Date,
  periodLabel: string
): ChartDataPoint => {
  const filteredEntries = entries.filter(entry => {
    const entryDate = entry.timestamp;
    return entryDate >= periodStartDate.getTime() && entryDate <= periodEndDate.getTime();
  });

  const totals = filteredEntries.reduce(
    (acc, entry) => {
      acc.calories += entry.calories;
      acc.fat += entry.fat;
      acc.sugar += entry.sugar;
      return acc;
    },
    { calories: 0, fat: 0, sugar: 0 }
  );

  return {
    name: periodLabel,
    ...totals,
  };
};

export const getDailyReportData = (entries: FoodEntry[], days: number = 7): ChartDataPoint[] => {
  const today = new Date();
  const reportData: ChartDataPoint[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const start = getStartOfDay(date);
    const end = getEndOfDay(date);
    reportData.push(
      aggregateDataForPeriod(entries, start, end, date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }))
    );
  }
  return reportData.reverse();
};

export const getWeeklyReportData = (entries: FoodEntry[], weeks: number = 4): ChartDataPoint[] => {
  const today = new Date();
  const reportData: ChartDataPoint[] = [];
  for (let i = 0; i < weeks; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endOfDay = getEndOfDay(end);
    
    const weekLabel = `${start.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}`;
    const aggregated = aggregateDataForPeriod(entries, start, endOfDay, weekLabel);
    // Calculate averages if needed, or show totals. For now, using totals.
    // const daysInPeriod = filteredEntries.length > 0 ? new Set(filteredEntries.map(e => getStartOfDay(new Date(e.timestamp)).getTime())).size : 1;
    // aggregated.calories /= daysInPeriod; // etc for average
    reportData.push(aggregated);
  }
  return reportData.reverse();
};

export const getMonthlyReportData = (entries: FoodEntry[], months: number = 6): ChartDataPoint[] => {
  const today = new Date();
  const reportData: ChartDataPoint[] = [];
  for (let i = 0; i < months; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const start = getStartOfMonth(date);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of month
    const endOfDay = getEndOfDay(end);

    const monthLabel = start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    reportData.push(aggregateDataForPeriod(entries, start, endOfDay, monthLabel));
  }
  return reportData.reverse();
};

