
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface ReportChartProps {
  data: ChartDataPoint[];
  title: string;
}

export const ReportChart: React.FC<ReportChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow text-center text-slate-500">
        <h3 className="text-lg font-semibold mb-2 text-slate-700">{title}</h3>
        <p>No data available for this period.</p>
      </div>
    );
  }
  
  return (
    <div className="p-2 sm:p-4 bg-white rounded-xl shadow-xl mb-6">
      <h3 className="text-xl font-semibold mb-4 text-slate-700 text-center">{title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="calories" fill="#ef4444" name="Calories (kcal)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fat" fill="#eab308" name="Fat (g)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sugar" fill="#0ea5e9" name="Sugar (g)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
