import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, CheckCircle, XCircle, ArrowRight, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { StudentShell } from "@/components/StudentShell";
import { PageHeader, Section, btn } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice Questions — Assessly" },
      { name: "description", content: "Department practice questions and self-assessment." },
      { property: "og:title", content: "Practice Questions — Assessly" },
    ],
  }),
  component: PracticeComponent,
});

function PracticeComponent() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trialQuota, setTrialQuota] = useState<{ used: number; limit: number; isPaid: boolean }>({
    used: 0,
    limit: 5,
    isPaid: false,
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setSelectedOptions({});
      setResults({});
    }
    try {
      const [qData, entData] = await Promise.all([
        api.questions.list({ limit: 5, random: true }).catch(() => ({ questions: [] })),
        api.entitlements.getStatus().catch(() => null),
      ]);

      const rawQuestions = qData?.questions || [];
      // Ensure exactly 5 dynamic questions are selected
      const sampled = [...rawQuestions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

      setQuestions(sampled);

      if (entData?.trialUsage) {
        setTrialQuota({
          used: entData.trialUsage.usedCount,
          limit: entData.trialUsage.quotaLimit,
          isPaid: entData.hasActiveEntitlement,
        });
      }
      if (isRefresh) {
        toast.success("Loaded 5 new dynamic questions from the question bank!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelect = (questionId: string, optionId: string) => {
    if (results[questionId]) return; // already submitted
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (questionId: string) => {
    const selectedOptionId = selectedOptions[questionId];
    if (!selectedOptionId) {
      toast.error("Please select an answer first");
      return;
    }

    setSubmitting(questionId);
    try {
      const res = await api.questions.submitPractice(questionId, selectedOptionId);
      setResults((prev) => ({ ...prev, [questionId]: res }));

      if (res.isCorrect) {
        toast.success("Correct answer!");
      } else {
        toast.error("Incorrect answer.");
      }

      setTrialQuota((prev) => ({
        ...prev,
        used: prev.used + 1,
      }));
    } catch (err: any) {
      if (err.code === "PAYWALL_REQUIRED") {
        toast.error("Free trial quota exhausted! Please purchase an access package to continue.");
      } else {
        toast.error(err.message || "Submission failed");
      }
    } finally {
      setSubmitting(null);
    }
  };

  const isQuotaExhausted = !trialQuota.isPaid && trialQuota.used >= trialQuota.limit;

  return (
    <StudentShell>
      <PageHeader
        title="Practice Arena"
        description="Dynamic 5-question practice set sampled from your department's question bank."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className={`${btn.secondary} text-xs flex items-center gap-1.5`}
              title="Draw 5 new random questions from the department bank"
            >
              <Shuffle className="size-3.5" /> Shuffle New 5 Questions
            </button>
            <Link to="/exams" className={btn.primary}>
              Take Full Timed Exam <ArrowRight className="size-4 ml-1 inline" />
            </Link>
          </div>
        }
      />

      {isQuotaExhausted && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
          <div>
            <strong className="block font-semibold">
              Free Trial Quota Exhausted ({trialQuota.used}/{trialQuota.limit})
            </strong>
            <span>
              You have completed all 5 free practice questions. Purchase an access package to unlock
              unlimited question access.
            </span>
          </div>
          <Link to="/payments" className={btn.primary}>
            Purchase Access Pass
          </Link>
        </div>
      )}

      <Section
        title={`Practice Set (5 Dynamic Questions)`}
        action={
          <span className="text-xs font-normal text-muted-foreground">
            {trialQuota.isPaid
              ? "All-Access Active"
              : `Trial Balance: ${Math.max(0, trialQuota.limit - trialQuota.used)} free answers remaining`}
          </span>
        }
      >
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Drawing 5 questions from the bank...</p>
        ) : questions.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No questions found for your enrolled departments.
          </p>
        ) : (
          <div className="divide-y">
            {questions.map((q, i) => {
              const res = results[q.id];
              const isLocked = isQuotaExhausted && !res;

              return (
                <div key={q.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-semibold text-sm text-muted-foreground">
                      Question {i + 1} of 5
                    </span>
                    <span className="text-xs rounded bg-muted px-2 py-0.5 text-muted-foreground font-medium">
                      {q.topic || "General"} · {q.difficulty}
                    </span>
                  </div>

                  <p className="mt-2 text-base font-medium text-foreground">{q.body}</p>

                  <div className="mt-4 space-y-2">
                    {q.options?.map((opt: any) => {
                      const isSelected = selectedOptions[q.id] === opt.id;
                      const isSubmitted = !!res;
                      const isCorrectOption = res?.correctOptionId === opt.id;

                      let optionStyle = "border bg-card hover:bg-muted/50";
                      if (isSelected)
                        optionStyle = "border-primary bg-primary/5 ring-1 ring-primary";
                      if (isSubmitted) {
                        if (isCorrectOption)
                          optionStyle = "border-success bg-success/10 text-success font-medium";
                        else if (isSelected && !res.isCorrect)
                          optionStyle = "border-destructive bg-destructive/10 text-destructive";
                      }

                      return (
                        <button
                          key={opt.id}
                          disabled={isSubmitted || isLocked}
                          onClick={() => handleSelect(q.id, opt.id)}
                          className={`w-full text-left rounded-lg p-3 text-sm transition-colors flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt.optionText}</span>
                          {isSubmitted && isCorrectOption && (
                            <CheckCircle className="size-4 text-success" />
                          )}
                          {isSubmitted && isSelected && !res.isCorrect && (
                            <XCircle className="size-4 text-destructive" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {res?.explanation && (
                    <div className="mt-3 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground border">
                      <strong>Explanation:</strong> {res.explanation}
                    </div>
                  )}

                  {!res && (
                    <div className="mt-4 flex justify-end">
                      {isLocked ? (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Lock className="size-3.5" /> Locked (Quota Reached)
                        </span>
                      ) : (
                        <button
                          disabled={!selectedOptions[q.id] || submitting === q.id}
                          onClick={() => handleSubmit(q.id)}
                          className={`${btn.primary} text-xs px-3 py-1.5`}
                        >
                          {submitting === q.id ? "Scoring..." : "Check Answer"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </StudentShell>
  );
}
