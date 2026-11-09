import { Link } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamResultSummaryProps {
  examTitle: string;
  result: any;
  onRetake: () => void;
}

export function ExamResultSummary({ examTitle, result, onRetake }: ExamResultSummaryProps) {
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
                {examTitle}
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
                    : "bg-rose-100 text-rose-800 border border-rose-200",
                )}
              >
                {passed ? "Passed" : "Needs Practice"}
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 mt-2">
                {result.percentage}%
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Score: {result.obtainedMarks ?? result.score} /{" "}
                {result.totalMarks ?? result.maxPossibleScore} marks
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
              <div
                className={cn(
                  "text-xl font-bold mt-0.5",
                  passed ? "text-emerald-600" : "text-rose-600",
                )}
              >
                {passed ? "Pass" : "Fail"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onRetake}
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
                  Review each question, your selected answer, the correct choice, and in-depth
                  explanation.
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
                          : "bg-rose-50 text-rose-700 border border-rose-200",
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
                        cardStyle =
                          "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-500/30";
                      } else if (isStudentChoice && !isTheCorrectOption) {
                        cardStyle =
                          "border-rose-400 bg-rose-50/70 text-rose-950 ring-1 ring-rose-400/30";
                      }

                      return (
                        <div
                          key={opt.id || optIdx}
                          className={cn(
                            "flex items-center justify-between rounded-2xl border p-3.5 text-xs sm:text-sm transition-all",
                            cardStyle,
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
                                    : "bg-slate-200 text-slate-600",
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

