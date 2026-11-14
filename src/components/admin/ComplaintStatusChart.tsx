import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import type { Complaint } from '../../types/campus';
import { computeMonthlyComplaintDistribution } from '../../utils/campusLogic';

interface ComplaintStatusChartProps {
  complaints: Complaint[];
}

const STATUS_COLORS = {
  Pending: '#D97706',
  'In Progress': '#2563EB',
  Resolved: '#16A34A',
} as const;

export function ComplaintStatusChart({ complaints }: ComplaintStatusChartProps) {
  const { isDark } = useTheme();
  const [chartView, setChartView] = useState<'weekly' | 'summary'>('weekly');
  const distribution = computeMonthlyComplaintDistribution(complaints);

  const summaryData = [
    { name: 'Pending', value: distribution.statusTotals.Pending, fill: STATUS_COLORS.Pending },
    { name: 'In Progress', value: distribution.statusTotals['In Progress'], fill: STATUS_COLORS['In Progress'] },
    { name: 'Resolved', value: distribution.statusTotals.Resolved, fill: STATUS_COLORS.Resolved },
  ].filter((d) => d.value > 0);

  const gridStroke = isDark ? '#1E293B' : '#E2E8F0';
  const tickColor = isDark ? '#94A3B8' : '#475569';
  const axisLineColor = isDark ? '#334155' : '#CBD5E1';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
    borderColor: isDark ? '#334155' : '#E2E8F0',
    color: isDark ? '#F1F5F9' : '#0F172A',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: isDark
      ? '0 8px 20px rgba(0, 0, 0, 0.45)'
      : '0 4px 12px rgba(15, 23, 42, 0.08)',
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between"
      data-testid="complaint-status-chart-card"
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Complaint Status Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {distribution.monthLabel} · {distribution.totalInMonth} complaints logged this month
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartView('weekly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                chartView === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Weekly Breakdown
            </button>
            <button
              type="button"
              onClick={() => setChartView('summary')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                chartView === 'summary'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Status Mix
            </button>
          </div>
        </div>

        {/* Clean Unboxed Status Totals Row */}
        <div className="grid grid-cols-3 gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Pending</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-0.5">
              {distribution.statusTotals.Pending}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">In Progress</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-0.5">
              {distribution.statusTotals['In Progress']}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Resolved</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-0.5">
              {distribution.statusTotals.Resolved}
            </p>
          </div>
        </div>
      </div>

      {distribution.totalInMonth === 0 ? (
        <div className="h-[240px] flex items-center justify-center text-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 rounded-xl px-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No complaints submitted in {distribution.monthLabel} yet.
          </p>
        </div>
      ) : (
        <div className="h-[250px] w-full" data-testid="recharts-complaint-container">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'weekly' ? (
              <BarChart
                data={distribution.buckets}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="rangeLabel"
                  tick={{ fill: tickColor, fontSize: 12 }}
                  axisLine={{ stroke: axisLineColor }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: tickColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(30, 41, 59, 0.5)' : '#F8FAFC' }}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: isDark ? '#E2E8F0' : '#0F172A' }}
                  labelStyle={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: 600 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: tickColor }}
                  iconType="circle"
                />
                <Bar
                  dataKey="Pending"
                  stackId="status"
                  fill={STATUS_COLORS.Pending}
                  radius={[0, 0, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="In Progress"
                  stackId="status"
                  fill={STATUS_COLORS['In Progress']}
                  radius={[0, 0, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="Resolved"
                  stackId="status"
                  fill={STATUS_COLORS.Resolved}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={summaryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke={isDark ? '#0F172A' : '#FFFFFF'}
                >
                  {summaryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: isDark ? '#E2E8F0' : '#0F172A' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: tickColor }} iconType="circle" />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
