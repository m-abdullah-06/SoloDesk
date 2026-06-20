import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  showThemeToggle?: boolean;
}

export function PageHeader({
  title,
  description,
  action,
  className,
  showThemeToggle = false,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {showThemeToggle && <ThemeToggle />}
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
