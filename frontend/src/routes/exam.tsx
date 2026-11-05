import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Lightbulb,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Logo, btn } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/exam")({
  validateSearch: (search: Record<string, unknown>): { examId?: string } => {
    return {
      examId: (search.examId as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Timed Examination — Assessly" },
      { name: "description", content: "Timed examination with server-side grading." },
      { property: "og:title", content: "Exam — Assessly" },
    ],
  }),
  component: ExamRunner,
});

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function ExamRunner() {
  const { examId } = Route.useSearch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [left, setLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function initExam() {
      let activeExamId = examId;

      if (!activeExamId) {
        // Find first published exam
        const examsRes = await api.exams.list().catch(() => ({ exams: [] }));
        if (examsRes.exams.length === 0) {
          toast.error("No exams are currently available.");
          setLoading(false);
          return;
        }
        activeExamId = examsRes.exams[0].id;
      }

      try {
        const attempt = await api.exams.start(activeExamId);
        setExamData(attempt);
        setLeft(attempt.remainingSeconds || attempt.durationMinutes * 60);

        // Auto-recover saved answers from localStorage if available
        if (attempt.attemptId && typeof window !== "undefined") {
          try {
            const saved = localStorage.getItem(`assessly_attempt_${attempt.attemptId}`);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.answers && Object.keys(parsed.answers).length > 0) {
                setAnswers(parsed.answers);
              }
              if (parsed.flags) {
                setFlags(parsed.flags);
              }
              toast.info("Restored your previous answer selections from this session.");
            }
          } catch {
            // Ignore parse errors
          }
        }
      } catch (err: any) {
        if (err.code === "PAYWALL_REQUIRED") {
          toast.error("An active package subscription is required to take this exam.");
          navigate({ to: "/payments" });
        } else {
          toast.error(err.message || "Failed to start exam");
        }
      } finally {
        setLoading(false);
      }
    }

    initExam();
  }, [examId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!examData || result) return;

    timerRef.current = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examData, result]);

  // Auto-save answers and flags to localStorage on changes
  useEffect(() => {
    if (!examData?.attemptId || result || typeof window === "undefined") return;
    if (Object.keys(answers).length === 0 && Object.keys(flags).length === 0) return;
    try {
      localStorage.setItem(
        `assessly_attempt_${examData.attemptId}`,
        JSON.stringify({ answers, flags })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [examData?.attemptId, answers, flags, result]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlags((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleAutoSubmit = () => {
    toast.warning("Time expired! Submitting your answers now...");
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!examData || submitting || result) return;
    setSubmitting(true);

    try {
      const answerPayload = examData.questions.map((q: any) => ({
        questionId: q.question.id,
        selectedOptionId: answers[q.question.id] || undefined,
      }));

      const res = await api.exams.submitAttempt(examData.attemptId, answerPayload);
      setResult(res);
      if (examData.attemptId && typeof window !== "undefined") {
        try {
          localStorage.removeItem(`assessly_attempt_${examData.attemptId}`);
        } catch {
          // Ignore
        }
      }
      toast.success("Exam submitted and scored successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="text-sm text-muted-foreground">Initializing exam environment...</p>
      </div>
    );
  }

  if (!examData && !loading) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="size-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-semibold">Exam Unavailable</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Could not load this exam attempt.
          </p>
          <Link to="/exams" className={btn.primary}>
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  const questions = examData.questions || [];
  const total = questions.length;
  const currentQ = questions[cur]?.question;
  const answeredCount = Object.keys(answers).length;

  const handleRetake = async () => {
    if (!examData) return;
    setLoading(true);
    setResult(null);
    setCur(0);
    setAnswers({});
    setFlags({});
    try {
      const activeExamId = examId || examData.examId;
      const attempt = await api.exams.start(activeExamId);
      setExamData(attempt);
      setLeft(attempt.remainingSeconds || attempt.durationMinutes * 60);
      toast.success("New exam session started with fresh random questions!");
    } catch (err: any) {
      toast.error(err.message || "Failed to retake exam");
    } finally {
      setLoading(false);
    }
  };

  // Render Result Screen
  if (result) {
    const passed = (result.percentage || 0) >= 50;
    const reviewList = result.review || result.results || [];

    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          
          {/* Header Score & Pass Summary Card */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  Exam Results
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  {examData.examTitle || examData.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Completed & graded on {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <span
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider",
                    passed
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-rose-100 text-rose-800 border border-rose-200"
                  )}
                >
                  {passed ? "Passed" : "Needs Practice"}
                </span>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 mt-2">
                  {result.percentage}%
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Score: {result.obtainedMarks ?? result.score} / {result.totalMarks ?? result.maxPossibleScore} marks
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-center">
              <div className="p-3 rounded-2xl bg-slate-50">
                <div className="text-xs text-slate-500 font-medium">Correct</div>
                <div className="text-xl font-bold text-emerald-600 mt-0.5">
                  {result.correctAnswers ?? 0}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <div className="text-xs text-slate-500 font-medium">Total Questions</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {result.totalQuestions || reviewList.length}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <div className="text-xs text-slate-500 font-medium">Pass Benchmark</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">50%</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <div className="text-xs text-slate-500 font-medium">Outcome</div>
                <div className={cn("text-xl font-bold mt-0.5", passed ? "text-emerald-600" : "text-rose-600")}>
                  {passed ? "Pass" : "Fail"}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="rounded-full bg-[#4ade80] hover:bg-[#22c55e] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="size-4" />
                  <span>Retake Exam (New Random Questions)</span>
                </button>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/exams"
                  className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Return to Exams
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-semibold transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Question-by-Question Review with Explanations */}
          {reviewList.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Question Review & Explanations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review each question, your selected answer, the correct choice, and in-depth explanation.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                  {reviewList.length} Questions
                </span>
              </div>

              {reviewList.map((q: any, idx: number) => {
                const isCorrect = q.isCorrect;
                return (
                  <div
                    key={q.questionId || idx}
                    className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-7 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          Question {idx + 1} of {reviewList.length}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                          isCorrect
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        )}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            <span>Correct (+{q.awardedMarks ?? q.maxMarks} marks)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3.5 text-rose-600" />
                            <span>Incorrect (0 marks)</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Question Body */}
                    <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                      {q.body}
                    </p>

                    {/* Options List */}
                    <div className="space-y-2 pt-2">
                      {q.options?.map((opt: any, optIdx: number) => {
                        const isStudentChoice = q.selectedOptionId === opt.id;
                        const isTheCorrectOption = opt.isCorrect || q.correctOptionId === opt.id;

                        let cardStyle = "border-slate-100 bg-slate-50/50 text-slate-700";
                        if (isTheCorrectOption) {
                          cardStyle = "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500/30";
                        } else if (isStudentChoice && !isTheCorrectOption) {
                          cardStyle = "border-rose-400 bg-rose-50/70 text-rose-950 ring-1 ring-rose-400/30";
                        }

                        return (
                          <div
                            key={opt.id || optIdx}
                            className={cn(
                              "flex items-center justify-between rounded-2xl border p-3.5 text-xs sm:text-sm transition-all",
                              cardStyle
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "grid size-6 place-items-center rounded-full text-xs font-bold",
                                  isTheCorrectOption
                                    ? "bg-emerald-500 text-white"
                                    : isStudentChoice
                                    ? "bg-rose-500 text-white"
                                    : "bg-slate-200 text-slate-600"
                                )}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt.optionText}</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-semibold">
                              {isTheCorrectOption && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                  <Check className="size-3" /> Correct Answer
                                </span>
                              )}
                              {isStudentChoice && !isTheCorrectOption && (
                                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                                  <X className="size-3" /> Your Choice
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {q.explanation && (
                      <div className="mt-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-xs sm:text-sm text-amber-950 leading-relaxed flex items-start gap-3">
                        <Lightbulb className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-amber-900 mb-0.5">Explanation:</div>
                          <p className="text-amber-900/90">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Logo className="hidden sm:flex" />
          <div className="border-l pl-4 leading-tight sm:ml-2">
            <div className="text-sm font-semibold">{examData.examTitle}</div>
            <div className="text-xs text-muted-foreground">
              Question {cur + 1} of {total}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-sm tabular-nums",
                left < 120 ? "border-destructive text-destructive font-bold animate-pulse" : "border-border"
              )}
            >
              <Clock className="size-4" />
              {fmt(left)}
            </span>

            <AlertDialog>
              <AlertDialogTrigger className={btn.primary}>
                {submitting ? "Submitting..." : "Submit Exam"}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit your exam now?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have answered {answeredCount} of {total} questions.
                    {answeredCount < total &&
                      ` The remaining ${total - answeredCount} unanswered questions will be scored as 0.`}
                    Once submitted, you cannot change your answers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Working</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>Confirm Submission</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:flex-row md:p-8">
        {/* Question Area */}
        <div className="flex-1 rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Question {cur + 1}
            </span>
            <button
              onClick={() => handleToggleFlag(currentQ.id)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                flags[currentQ.id] ? "text-warning" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Flag className="size-3.5" />
              {flags[currentQ.id] ? "Flagged for review" : "Flag"}
            </button>
          </div>

          <p className="mt-4 text-base font-medium leading-relaxed">{currentQ.body}</p>

          <div className="mt-6 space-y-2.5">
            {currentQ.options?.map((opt: any) => {
              const selected = answers[currentQ.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md border p-3.5 text-left text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary/5 font-medium text-foreground ring-1 ring-primary"
                      : "hover:bg-muted/60"
                  )}
                >
                  <span>{opt.optionText}</span>
                  {selected && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between border-t pt-4">
            <button
              disabled={cur === 0}
              onClick={() => setCur((c) => Math.max(0, c - 1))}
              className={cn(btn.outline, "gap-1")}
            >
              <ChevronLeft className="size-4" /> Previous
            </button>
            <button
              disabled={cur === total - 1}
              onClick={() => setCur((c) => Math.min(total - 1, c + 1))}
              className={cn(btn.primary, "gap-1")}
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Question Navigator Drawer/Sidebar */}
        <div className="w-full rounded-lg border bg-card p-4 md:w-64">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigator ({answeredCount}/{total})
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {questions.map((q: any, i: number) => {
              const qId = q.question.id;
              const isAnswered = !!answers[qId];
              const isFlagged = !!flags[qId];
              const isCurrent = cur === i;

              return (
                <button
                  key={qId}
                  onClick={() => setCur(i)}
                  className={cn(
                    "relative grid size-9 place-items-center rounded text-xs font-medium transition-colors",
                    isCurrent && "ring-2 ring-primary ring-offset-2",
                    isAnswered ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    isFlagged && "border-2 border-warning"
                  )}
                >
                  {i + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 size-2 rounded-full bg-warning" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
