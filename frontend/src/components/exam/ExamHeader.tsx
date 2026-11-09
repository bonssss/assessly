import { Clock } from "lucide-react";
import { Logo, btn } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
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

export const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

interface ExamHeaderProps {
  examTitle: string;
  currentIndex: number;
  totalQuestions: number;
  remainingSeconds: number;
  answeredCount: number;
  submitting: boolean;
  onSubmit: () => void;
}

export function ExamHeader({
  examTitle,
  currentIndex,
  totalQuestions,
  remainingSeconds,
  answeredCount,
  submitting,
  onSubmit,
}: ExamHeaderProps) {
  const isDanger = remainingSeconds < 300;

  return (
    <header className="sticky top-0 z-10 border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Logo className="hidden sm:flex" />
        <div className="border-l pl-4 leading-tight sm:ml-2">
          <div className="text-sm font-semibold">{examTitle}</div>
          <div className="text-xs text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div
            className={cn(
              "flex items-center gap-1.5 font-mono text-sm font-semibold",
              isDanger && "text-destructive animate-pulse",
            )}
          >
            <Clock className="size-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button disabled={submitting} className={btn.primary}>
                {submitting ? "Submitting..." : "Finish Exam"}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit your exam now?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have answered {answeredCount} of {totalQuestions} questions.
                  {answeredCount < totalQuestions &&
                    ` The remaining ${totalQuestions - answeredCount} unanswered questions will be scored as 0.`}
                  Once submitted, you cannot change your answers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Working</AlertDialogCancel>
                <AlertDialogAction onClick={onSubmit}>Confirm Submission</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
}

