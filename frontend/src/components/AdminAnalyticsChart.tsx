import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Users, CreditCard, BookOpen, CheckCircle, Clock, XCircle, Award } from "lucide-react";
import { Section } from "@/components/ui-kit";

interface DepartmentReport {
  id: string;
  code: string;
  name: string;
  students: number;
  questions: number;
  exams: number;
  examsTaken: number;
  avgScore: number;
  passRate: number;
}

interface PaymentStatusItem {
  status: string;
  count: number;
  fill: string;
}

interface DailyActivityItem {
  date: string;
  attempts: number;
  completed: number;
}

interface AdminAnalyticsChartProps {
  departmentReports: DepartmentReport[];
  paymentBreakdown?: PaymentStatusItem[];
  recentActivity?: DailyActivityItem[];
  totalRevenue?: number;
}

export function AdminAnalyticsChart({
  departmentReports = [],
  paymentBreakdown = [],
  recentActivity = [],
  totalRevenue = 0,
}: AdminAnalyticsChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[320px] rounded-2xl bg-muted/20 animate-pulse" />
        <div className="h-[320px] rounded-2xl bg-muted/20 animate-pulse" />
      </div>
    );
  }

  const defaultPayments: PaymentStatusItem[] = paymentBreakdown.length > 0
    ? paymentBreakdown
    : [
        { status: "Approved", count: 0, fill: "#10b981" },
        { status: "Pending", count: 0, fill: "#f59e0b" },
        { status: "Rejected", count: 0, fill: "#ef4444" },
      ];

  const totalPaymentsCount = defaultPayments.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6">
      {/* Top Charts Row: Department Performance + 7-Day Activity */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Department Pass Rate & Average Score Comparison (7 cols) */}
        <Section
          title="Department Exit Exam Readiness & Benchmark"
          className="lg:col-span-7 shadow-xs"
          action={
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-xs bg-[#3b82f6]" /> Avg Score
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-xs bg-[#10b981]" /> Pass Rate
              </span>
              <span className="flex items-center gap-1">
                <span className="h-0.5 w-3 bg-amber-500 border-t border-dashed" /> 50% Pass
              </span>
            </div>
          }
        >
          <div className="p-4 pt-2">
            {departmentReports.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-sm text-slate-400">
                No active departments found.
              </div>
            ) : (
              <div className="h-[270px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentReports}
                    margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="code"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      unit="%"
                    />
                    <ReferenceLine
                      y={50}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: "50% Benchmark",
                        position: "insideTopRight",
                        fill: "#d97706",
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as DepartmentReport;
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-1.5">
                              <div className="font-bold text-slate-800">{data.name} ({data.code})</div>
                              <div className="text-slate-500">
                                {data.examsTaken} completed attempts &bull; {data.students} students enrolled
                              </div>
                              <div className="mt-1 flex items-center justify-between gap-4 border-t border-slate-100 pt-1.5 text-xs">
                                <span className="text-blue-600 font-semibold">Average: {data.avgScore}%</span>
                                <span className="text-emerald-600 font-bold">Pass Rate: {data.passRate}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="avgScore"
                      name="Avg Score"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="passRate"
                      name="Pass Rate"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Section>

        {/* Right: 7-Day Exam Activity Telemetry (5 cols) */}
        <Section
          title="Platform Activity Trend (7 Days)"
          className="lg:col-span-5 shadow-xs"
          action={
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-cyan-500" /> Starts
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-emerald-500" /> Completed
              </span>
            </div>
          }
        >
          <div className="p-4 pt-2">
            {recentActivity.length === 0 ? (
              <div className="h-[270px] flex items-center justify-center text-sm text-slate-400">
                No recent activity recorded.
              </div>
            ) : (
              <div className="h-[270px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={recentActivity}
                    margin={{ top: 12, right: 12, left: -22, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="adminStartsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="adminCompletedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as DailyActivityItem;
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg text-xs space-y-1">
                              <div className="font-bold text-slate-800">{data.date}</div>
                              <div className="flex items-center justify-between gap-4 text-cyan-600">
                                <span>Exam Starts:</span>
                                <span className="font-bold">{data.attempts}</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-emerald-600">
                                <span>Completed:</span>
                                <span className="font-bold">{data.completed}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="attempts"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#adminStartsGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#adminCompletedGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Bottom Charts Row: Question Bank Depth + Payment Verification Queue */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Department Curriculum & Question Bank Depth (8 cols) */}
        <Section
          title="Curriculum & Question Bank Distribution"
          className="lg:col-span-8 shadow-xs"
          action={
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-xs bg-[#6366f1]" /> Questions Bank
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2.5 rounded-xs bg-[#f43f5e]" /> Enrolled Students
              </span>
            </div>
          }
        >
          <div className="p-4 pt-2">
            {departmentReports.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-sm text-slate-400">
                No department data available.
              </div>
            ) : (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentReports}
                    margin={{ top: 10, right: 10, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="code"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as DepartmentReport;
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-1.5">
                              <div className="font-bold text-slate-800">{data.name}</div>
                              <div className="flex items-center justify-between gap-4 text-indigo-600 font-medium">
                                <span>Question Bank:</span>
                                <span className="font-bold">{data.questions} Qs</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-rose-600 font-medium">
                                <span>Enrolled Students:</span>
                                <span className="font-bold">{data.students}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="questions"
                      name="Questions"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="students"
                      name="Students"
                      fill="#f43f5e"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Section>

        {/* Monetization & Payment Verification Breakdown (4 cols) */}
        <Section title="Payment Verification Status" className="lg:col-span-4 shadow-xs flex flex-col justify-between">
          <div className="p-4 flex flex-col items-center justify-center flex-1">
            <div className="h-[180px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defaultPayments}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {defaultPayments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md">
                            <div className="font-semibold text-slate-800">{item.name}</div>
                            <div className="text-slate-500">{item.value} payments</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-800">{totalPaymentsCount}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Submissions</span>
              </div>
            </div>

            <div className="w-full mt-2 space-y-1.5 text-xs">
              {defaultPayments.map((p) => (
                <div key={p.status} className="flex items-center justify-between text-slate-600 border-t border-slate-100/80 pt-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                    {p.status}
                  </span>
                  <span className="font-bold text-slate-800">{p.count}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 w-full rounded-xl bg-slate-50 border border-slate-200/60 p-2.5 text-center text-xs">
              <span className="text-slate-400">Total Approved Revenue: </span>
              <span className="font-bold text-slate-900">{totalRevenue.toLocaleString()} ETB</span>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
