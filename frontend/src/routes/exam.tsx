import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Clock, Flag, X, AlertCircle } from "lucide-react";
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

  // Render Result Screen
  if (result) {
    const passed = result.percentage >= 50;
    return (
      <div className="grid min-h-screen place-items-center px-4 py-12">
        <div className="w-full max-w-lg rounded-lg border bg-card shadow-sm">
          <div className="border-b p-6">
            <p className="text-sm text-muted-foreground">{examData.examTitle} · Results</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-5xl font-semibold">{result.percentage}%</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Score: {result.obtainedMarks} / {result.totalMarks} marks
                </div>
              </div>
              <span
                className={cn(
                  "rounded px-3 py-1 text-sm font-medium",
                  passed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}
              >
                {passed ? "Passed" : "Not Passed"}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-3 divide-x border-b">
            <div className="p-4">
              <dt className="text-xs text-muted-foreground">Correct Answers</dt>
              <dd className="mt-1 text-lg font-semibold text-success">{result.correctAnswers}</dd>
            </div>
            <div className="p-4">
              <dt className="text-xs text-muted-foreground">Total Questions</dt>
              <dd className="mt-1 text-lg font-semibold">{result.totalQuestions}</dd>
            </div>
            <div className="p-4">
              <dt className="text-xs text-muted-foreground">Pass Mark</dt>
              <dd className="mt-1 text-lg font-semibold">50%</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2 p-6">
            <Link to="/exams" className={btn.primary}>
              Return to Exams List
            </Link>
            <Link to="/dashboard" className={btn.outline}>
              Dashboard
            </Link>
          </div>
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
