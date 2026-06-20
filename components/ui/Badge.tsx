import { cn, getStatusColor } from "@/lib/utils";

interface BadgeProps {
  label: string;
  status?: string;
  className?: string;
}

export function Badge({ label, status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        status ? getStatusColor(status) : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}

interface TagProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export function Tag({ label, onRemove, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-muted text-accent",
        className,
      )}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:text-orange-700 transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}
