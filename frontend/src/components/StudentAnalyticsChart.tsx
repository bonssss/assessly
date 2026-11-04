import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Target, Award, ArrowUpRight, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { Section, btn } from "@/components/ui-kit";

interface ExamAttempt {
  id: string;
  attemptId?: string;
  examId?: string;
  examTitle?: string;
  exam?: {
    id: string;
    title: string;
    department?: { name: string; code: string };
  };
  startedAt: string | Date;
  submittedAt?: string | Date;
  status: string;
  score?: number;
  percentage?: number | null;
}

interface StudentAnalyticsChartProps {
  examHistory: ExamAttempt[];
}

export function StudentAnalyticsChart({ examHistory }: StudentAnalyticsChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const completedExams = examHistory.filter(
    (h) => h.status === "COMPLETED" || h.status === "TIMED_OUT"
  );

  // Chronological score history (oldest first for line/area chart progression)
  const scoreHistoryData = [...completedExams]
    .reverse()
    .map((att, idx) => {
      const scoreVal =
        typeof att.percentage === "number"
          ? att.percentage
          : Math.round(Number(att.score || 0));
      const dateFormatted = new Date(att.startedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        id: att.id || att.attemptId || String(idx),
        attemptNumber: `Test #${idx + 1}`,
        date: dateFormatted,
        score: scoreVal,
        examTitle: att.exam?.title || att.examTitle || "Timed Exam",
        passed: scoreVal >= 50,
      };
    });

  const passedCount = completedExams.filter((e) => {
    const s = typeof e.percentage === "number" ? e.percentage : Number(e.score || 0);
    return s >= 50;
  }).length;

  const failedCount = completedExams.length - passedCount;
  const passRate =
    completedExams.length > 0 ? Math.round((passedCount / completedExams.length) * 100) : 0;

  const scores = completedExams.map((e) =>
    typeof e.percentage === "number" ? e.percentage : Number(e.score || 0)
  );
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const latestScore = scores.length > 0 ? scores[0] : 0;
  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const outcomeData = [
    { name: "Passed (≥50%)", value: passedCount, color: "#10b981" },
    { name: "Below Benchmark (<50%)", value: failedCount, color: "#f59e0b" },
  ];

  if (!isMounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-[320px] rounded-2xl bg-muted/20 animate-pulse" />
        <div className="h-[320px] rounded-2xl bg-muted/20 animate-pulse" />
      </div>
    );
  }

  if (completedExams.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
          <TrendingUp className="size-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No Exam Analytics Yet</h3>
        <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Take your first randomized practice exam or timed exit assessment. Your score trajectory,
          pass-rate projections, and competency graphs will appear here.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/exams" className={`${btn.brand} inline-flex items-center gap-2 shadow-xs`}>
            <FileText className="size-4" />
            <span>Take Practice Exam</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analytics Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Pass Rate</span>
            <Target className="size-3.5 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-800">{passRate}%</span>
            <span className="text-[11px] text-slate-400">of attempts</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Highest Score</span>
            <Award className="size-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-800">{highestScore}%</span>
            <span className="text-[11px] text-emerald-600 font-medium">Personal Best</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Latest Attempt</span>
            <ArrowUpRight className="size-3.5 text-blue-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-800">{latestScore}%</span>
            <span className="text-[11px] text-slate-400">recent</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Average Score</span>
            <TrendingUp className="size-3.5 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-800">{avgScore}%</span>
            <span className={`text-[11px] font-medium ${avgScore >= 50 ? "text-emerald-600" : "text-amber-600"}`}>
              {avgScore >= 50 ? "Passing" : "Below 50%"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Graphs Grid: Area Chart (Trajectory) + Donut (Pass/Fail) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Score Progression Area Chart */}
        <Section
          title="Exam Score Trajectory"
          className="lg:col-span-2 shadow-xs"
          action={
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" /> Score %
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 bg-amber-500 border-t border-dashed" /> 50% Pass Mark
              </span>
            </div>
          }
        >
          <div className="p-4 pt-2">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={scoreHistoryData}
                  margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="studentScoreGradient" x1="0" y1="0" x2="0" y2="1">
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
                      value: "50% Pass",
                      position: "insideTopRight",
                      fill: "#d97706",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-1">
                            <div className="font-semibold text-slate-800">{data.examTitle}</div>
                            <div className="text-slate-400">
                              {data.attemptNumber} &bull; {data.date}
                            </div>
                            <div className="mt-1 flex items-center gap-2 pt-1 border-t border-slate-100">
                              <span className="font-bold text-slate-900 text-sm">{data.score}%</span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  data.passed
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {data.passed ? "PASSED" : "RETAKE"}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#studentScoreGradient)"
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 6, fill: "#059669", strokeWidth: 2, stroke: "#ffffff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Section>

        {/* Right: Pass/Fail Outcome Donut & Readiness Feedback */}
        <Section title="Assessment Outcomes" className="shadow-xs flex flex-col justify-between">
          <div className="p-4 flex flex-col items-center justify-center flex-1">
            <div className="h-[180px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md">
                            <div className="font-semibold text-slate-800">{item.name}</div>
                            <div className="text-slate-500">{item.value} attempts</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Pass Rate Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-800">{passRate}%</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Pass Rate</span>
              </div>
            </div>

            {/* Outcome Legend & Readiness Hint */}
            <div className="w-full mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-slate-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> Passed (≥50%)
                </span>
                <span className="font-bold text-slate-800">{passedCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-amber-500" /> Needs Review (&lt;50%)
                </span>
                <span className="font-bold text-slate-800">{failedCount}</span>
              </div>
            </div>

            <div className={`mt-4 w-full rounded-xl p-3 text-xs leading-relaxed ${
              passRate >= 70
                ? "bg-emerald-50/80 text-emerald-900 border border-emerald-200/50"
                : passRate >= 50
                ? "bg-blue-50/80 text-blue-900 border border-blue-200/50"
                : "bg-amber-50/80 text-amber-900 border border-amber-200/50"
            }`}>
              {passRate >= 70 ? (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Strong trajectory! Your average score demonstrates high readiness for the university exit exam.</span>
                </div>
              ) : passRate >= 50 ? (
                <div className="flex items-start gap-2">
                  <Award className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Above pass mark. Continue testing randomized question sets to solidify weak topics.</span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Pass mark is 50%. Focus on untimed practice questions with detailed solution reviews.</span>
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
