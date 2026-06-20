import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({
  value,
  className,
  showLabel,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span className="font-medium text-accent">{clamped}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-bg-elevated rounded-full overflow-hidden",
          size === "sm" ? "h-1.5" : "h-2",
        )}
      >
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
