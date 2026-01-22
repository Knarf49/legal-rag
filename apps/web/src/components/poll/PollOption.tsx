// components/poll/PollOption.tsx
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PollOptionProps = {
  id: string;
  label: string;
  votes?: number;
  percentage?: number; // 0 - 100
  selected?: boolean;
  disabled?: boolean;
  onSelect?: (id: string) => void;
  showResult?: boolean;
  className?: string;
};

export function PollOption({
  id,
  label,
  votes,
  percentage,
  selected,
  disabled,
  showResult,
  onSelect,
  className,
}: PollOptionProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={() => onSelect?.(id)}
      className={cn(
        "relative h-auto w-full justify-between px-4 py-3 text-left",
        selected && "border-primary",
        className,
      )}
    >
      {/* Background progress */}
      {showResult && typeof percentage === "number" && (
        <div
          className="absolute inset-y-0 left-0 z-0 rounded-md bg-primary/10"
          style={{ width: `${percentage}%` }}
        />
      )}

      <div className="relative z-10 flex w-full items-center justify-between gap-4">
        <span className="font-medium">{label}</span>

        {showResult && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {typeof percentage === "number" && <span>{percentage}%</span>}
            {typeof votes === "number" && <span>({votes})</span>}
          </div>
        )}
      </div>
    </Button>
  );
}
