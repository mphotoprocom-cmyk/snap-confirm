import { useMemo } from 'react';
import { Booking, JOB_TYPE_LABELS, JobType } from '@/types/booking';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { th } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface DashboardStatsProps {
  bookings: Booking[];
}

const JOB_TYPE_COLORS: Record<JobType, string> = {
  wedding: '#22c55e',
  event: '#8b5cf6',
  corporate: '#3b82f6',
  portrait: '#f59e0b',
  other: '#6b7280',
};

export function DashboardStats({ bookings }: DashboardStatsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const confirmedBookings = bookings.filter(b => b.status === 'booked' || b.status === 'completed');

    const thisMonthBookings = confirmedBookings.filter(b =>
      isWithinInterval(new Date(b.event_date), { start: thisMonthStart, end: thisMonthEnd })
    );
    const thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + Number(b.total_price), 0);

    const lastMonthBookings = confirmedBookings.filter(b =>
      isWithinInterval(new Date(b.event_date), { start: lastMonthStart, end: lastMonthEnd })
    );
    const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + Number(b.total_price), 0);

    const revenueChange = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0;

    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthBookings = confirmedBookings.filter(b =>
        isWithinInterval(new Date(b.event_date), { start: monthStart, end: monthEnd })
      );
      return {
        month: format(monthDate, 'MMM', { locale: th }),
        revenue: monthBookings.reduce((sum, b) => sum + Number(b.total_price), 0),
        count: monthBookings.length,
      };
    });

    const jobTypeCount = bookings.reduce((acc, b) => {
      acc[b.job_type] = (acc[b.job_type] || 0) + 1;
      return acc;
    }, {} as Record<JobType, number>);

    const jobTypeData = Object.entries(jobTypeCount).map(([type, count]) => ({
      name: JOB_TYPE_LABELS[type as JobType],
      value: count,
      type: type as JobType,
    }));

    return {
      thisMonthRevenue,
      lastMonthRevenue,
      revenueChange,
      thisMonthCount: thisMonthBookings.length,
      totalBookings: bookings.length,
      confirmedCount: confirmedBookings.length,
      pendingCount: bookings.filter(b => b.status === 'waiting_deposit').length,
      monthlyRevenue,
      jobTypeData,
    };
  }, [bookings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const summaryCards = [
    {
      label: 'รายได้เดือนนี้',
      value: formatCurrency(stats.thisMonthRevenue),
      icon: DollarSign,
      change: stats.revenueChange,
      changeText: `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange.toFixed(0)}% จากเดือนก่อน`,
      accent: true,
    },
    {
      label: 'การจองทั้งหมด',
      value: stats.totalBookings.toString(),
      icon: Calendar,
      sub: `${stats.thisMonthCount} งานเดือนนี้`,
    },
    {
      label: 'ยืนยันแล้ว',
      value: stats.confirmedCount.toString(),
      icon: CheckCircle,
      sub: formatCurrency(stats.thisMonthRevenue + stats.lastMonthRevenue) + ' (2 เดือน)',
      valueColor: 'text-emerald-400',
    },
    {
      label: 'รอมัดจำ',
      value: stats.pendingCount.toString(),
      icon: Clock,
      sub: 'รอการยืนยัน',
      valueColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={
              card.accent
                ? isDark ? 'glass-card-accent p-4' : 'light-glass-card-accent p-4'
                : isDark ? 'glass-card p-4' : 'light-glass-card p-4'
            }
          >
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                {card.label}
              </p>
              <card.icon className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
            </div>
            <p className={cn('text-2xl font-bold', card.valueColor || (isDark ? 'text-white' : 'text-gray-900'))}>
              {card.value}
            </p>
            {card.change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {card.change > 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : card.change < 0 ? (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                ) : (
                  <Minus className={`w-3 h-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                )}
                <span className={cn(
                  'text-[10px]',
                  card.change > 0 ? 'text-emerald-400' : card.change < 0 ? 'text-red-400' : (isDark ? 'text-white/40' : 'text-gray-400')
                )}>
                  {card.changeText}
                </span>
              </div>
            )}
            {card.sub && (
              <p className={`text-[10px] mt-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 sm:p-6`}>
          <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
            รายได้ 6 เดือนล่าสุด
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}
                  tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? 'rgba(15,20,25,0.95)' : 'rgba(255,255,255,0.95)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '12px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                  itemStyle={{ color: '#22c55e' }}
                  labelStyle={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                  formatter={(value: number) => [formatCurrency(value), 'รายได้']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Type Distribution */}
        <div className={`${isDark ? 'glass-card' : 'light-glass-card'} p-4 sm:p-6`}>
          <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
            ประเภทงาน
          </h3>
          {stats.jobTypeData.length > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.jobTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.jobTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={JOB_TYPE_COLORS[entry.type]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? 'rgba(15,20,25,0.95)' : 'rgba(255,255,255,0.95)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: '12px',
                      backdropFilter: 'blur(12px)',
                    }}
                    itemStyle={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}
                    formatter={(value: number) => [`${value} งาน`, '']}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '11px' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`h-[220px] flex items-center justify-center text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
              ยังไม่มีข้อมูล
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
