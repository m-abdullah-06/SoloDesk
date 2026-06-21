"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={className}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--border)",
        background: "var(--muted)",
        color: "var(--muted-foreground)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "rgba(245,121,10,0.4)";
        el.style.color = "#F5790A";
        el.style.background = "rgba(245,121,10,0.08)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "var(--border)";
        el.style.color = "var(--muted-foreground)";
        el.style.background = "var(--muted)";
      }}
    >
      {isDark ? (
        <Sun
          size={16}
          style={{
            transition: "transform 0.3s ease, opacity 0.2s ease",
            transform: "rotate(0deg)",
          }}
        />
      ) : (
        <Moon
          size={16}
          style={{
            transition: "transform 0.3s ease, opacity 0.2s ease",
          }}
        />
      )}
    </button>
  );
}
