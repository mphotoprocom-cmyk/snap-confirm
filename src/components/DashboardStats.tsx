import { useMemo } from 'react';
import { Booking, JOB_TYPE_LABELS, JobType } from '@/types/booking';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { th } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  bookings: Booking[];
}

const JOB_TYPE_COLORS: Record<JobType, string> = {
  wedding: 'hsl(var(--chart-1))',
  event: 'hsl(var(--chart-2))',
  corporate: 'hsl(var(--chart-3))',
  portrait: 'hsl(var(--chart-4))',
  other: 'hsl(var(--chart-5))',
};

export function DashboardStats({ bookings }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Filter confirmed bookings (booked or completed)
    const confirmedBookings = bookings.filter(b => b.status === 'booked' || b.status === 'completed');

    // This month's revenue
    const thisMonthBookings = confirmedBookings.filter(b =>
      isWithinInterval(new Date(b.event_date), { start: thisMonthStart, end: thisMonthEnd })
    );
    const thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + Number(b.total_price), 0);

    // Last month's revenue
    const lastMonthBookings = confirmedBookings.filter(b =>
      isWithinInterval(new Date(b.event_date), { start: lastMonthStart, end: lastMonthEnd })
    );
    const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + Number(b.total_price), 0);

    // Revenue change percentage
    const revenueChange = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0;

    // Monthly revenue for last 6 months
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

    // Job type distribution
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">รายได้เดือนนี้</p>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {formatCurrency(stats.thisMonthRevenue)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {stats.revenueChange > 0 ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : stats.revenueChange < 0 ? (
              <TrendingDown className="w-3 h-3 text-destructive" />
            ) : (
              <Minus className="w-3 h-3 text-muted-foreground" />
            )}
            <span className={cn(
              "text-xs",
              stats.revenueChange > 0 ? "text-success" : stats.revenueChange < 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange.toFixed(0)}% จากเดือนก่อน
            </span>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">การจองทั้งหมด</p>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground mt-1">{stats.totalBookings}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.thisMonthCount} งานเดือนนี้
          </p>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">ยืนยันแล้ว</p>
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-semibold text-success mt-1">{stats.confirmedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(stats.thisMonthRevenue + stats.lastMonthRevenue)} (2 เดือน)
          </p>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">รอมัดจำ</p>
            <Clock className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-semibold text-warning mt-1">{stats.pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            รอการยืนยัน
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="card-elevated p-4 sm:p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">รายได้ 6 เดือนล่าสุด</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyRevenue}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'รายได้']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Type Distribution */}
        <div className="card-elevated p-4 sm:p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">ประเภทงาน</h3>
          {stats.jobTypeData.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.jobTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
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
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} งาน`, '']}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              ยังไม่มีข้อมูล
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
