import { cn } from "@/lib/utils";

interface QuestionItem {
  question: {
    id: string;
  };
}

interface QuestionNavigatorProps {
  questions: QuestionItem[];
  currentIndex: number;
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  onSelectIndex: (index: number) => void;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  flags,
  onSelectIndex,
}: QuestionNavigatorProps) {
  const answeredCount = Object.keys(answers).length;
  const total = questions.length;

  return (
    <div className="w-full rounded-lg border bg-card p-4 md:w-64">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Navigator ({answeredCount}/{total})
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const qId = q.question.id;
          const isAnswered = Boolean(answers[qId]);
          const isFlagged = Boolean(flags[qId]);
          const isCurrent = currentIndex === i;

          return (
            <button
              key={qId}
              onClick={() => onSelectIndex(i)}
              className={cn(
                "relative grid size-9 place-items-center rounded text-xs font-medium transition-colors cursor-pointer",
                isCurrent && "ring-2 ring-primary ring-offset-2",
                isAnswered
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
                isFlagged && "border-2 border-warning",
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
  );
}
