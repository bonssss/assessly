import { Check, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { btn } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  optionText: string;
}

interface Question {
  id: string;
  body: string;
  options?: Option[];
}

interface QuestionViewerProps {
  currentIndex: number;
  totalQuestions: number;
  question: Question;
  selectedOptionId?: string;
  isFlagged?: boolean;
  onSelectOption: (questionId: string, optionId: string) => void;
  onToggleFlag: (questionId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function QuestionViewer({
  currentIndex,
  totalQuestions,
  question,
  selectedOptionId,
  isFlagged,
  onSelectOption,
  onToggleFlag,
  onPrevious,
  onNext,
}: QuestionViewerProps) {
  return (
    <div className="flex-1 rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Question {currentIndex + 1}
        </span>
        <button
          onClick={() => onToggleFlag(question.id)}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium cursor-pointer",
            isFlagged ? "text-warning" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Flag className="size-3.5" />
          {isFlagged ? "Flagged for review" : "Flag"}
        </button>
      </div>

      <p className="mt-4 text-base font-medium leading-relaxed">{question.body}</p>

      <div className="mt-6 space-y-2.5">
        {question.options?.map((opt) => {
          const selected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectOption(question.id, opt.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-md border p-3.5 text-left text-sm transition-colors cursor-pointer",
                selected
                  ? "border-primary bg-primary/5 font-medium text-foreground ring-1 ring-primary"
                  : "hover:bg-muted/60",
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
          disabled={currentIndex === 0}
          onClick={onPrevious}
          className={cn(btn.outline, "gap-1")}
        >
          <ChevronLeft className="size-4" /> Previous
        </button>
        <button
          disabled={currentIndex === totalQuestions - 1}
          onClick={onNext}
          className={cn(btn.primary, "gap-1")}
        >
          Next <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

