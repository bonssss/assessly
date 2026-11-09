import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { ExamResultSummary } from "@/components/exam/ExamResultSummary";
import { QuestionNavigator } from "@/components/exam/QuestionNavigator";
import { QuestionViewer } from "@/components/exam/QuestionViewer";
import { btn } from "@/components/ui-kit";
import { api } from "@/lib/api";

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

function ExamRunner() {
  const { examId } = Route.useSearch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function initExam() {
      let activeExamId = examId;

      if (!activeExamId) {
        const examsRes = await api.exams.list().catch(() => ({ exams: [] }));
        if (!examsRes.exams || examsRes.exams.length === 0) {
          toast.error("No exams are currently available.");
          setLoading(false);
          return;
        }
        activeExamId = examsRes.exams[0].id;
      }

      try {
        const attempt = await api.exams.start(activeExamId);
        setExamData(attempt);
        setRemainingSeconds(attempt.remainingSeconds || attempt.durationMinutes * 60);

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

  useEffect(() => {
    if (!examData || result) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          toast.warning("Time expired! Submitting your answers now...");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examData, result]);

  useEffect(() => {
    if (!examData?.attemptId || result || typeof window === "undefined") return;
    if (Object.keys(answers).length === 0 && Object.keys(flags).length === 0) return;
    try {
      localStorage.setItem(
        `assessly_attempt_${examData.attemptId}`,
        JSON.stringify({ answers, flags }),
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

  const handleRetake = async () => {
    if (!examData) return;
    setLoading(true);
    setResult(null);
    setCurrentIndex(0);
    setAnswers({});
    setFlags({});
    try {
      const activeExamId = examId || examData.examId;
      const attempt = await api.exams.start(activeExamId);
      setExamData(attempt);
      setRemainingSeconds(attempt.remainingSeconds || attempt.durationMinutes * 60);
      toast.success("New exam session started with fresh random questions!");
    } catch (err: any) {
      toast.error(err.message || "Failed to retake exam");
    } finally {
      setLoading(false);
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

  if (result) {
    return (
      <ExamResultSummary
        examTitle={examData.examTitle || examData.title}
        result={result}
        onRetake={handleRetake}
      />
    );
  }

  const questions = examData.questions || [];
  const total = questions.length;
  const currentQ = questions[currentIndex]?.question;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen flex flex-col">
      <ExamHeader
        examTitle={examData.examTitle || examData.title}
        currentIndex={currentIndex}
        totalQuestions={total}
        remainingSeconds={remainingSeconds}
        answeredCount={answeredCount}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:flex-row md:p-8">
        <QuestionViewer
          currentIndex={currentIndex}
          totalQuestions={total}
          question={currentQ}
          selectedOptionId={answers[currentQ.id]}
          isFlagged={flags[currentQ.id]}
          onSelectOption={handleSelectOption}
          onToggleFlag={handleToggleFlag}
          onPrevious={() => setCurrentIndex((c) => Math.max(0, c - 1))}
          onNext={() => setCurrentIndex((c) => Math.min(total - 1, c + 1))}
        />

        <QuestionNavigator
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          flags={flags}
          onSelectIndex={setCurrentIndex}
        />
      </main>
    </div>
  );
}
