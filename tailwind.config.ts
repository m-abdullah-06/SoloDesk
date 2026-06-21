import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background:  "var(--background)",
        foreground:  "var(--foreground)",
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        danger:  "#EF4444",
        success: "#10B981",
        border:  "var(--border)",
        input:   "var(--input)",
        ring:    "var(--ring)",
        /* custom semantic colours */
        "accent-light":  "var(--accent-light)",
        "text-primary":  "var(--text-primary)",
        "text-muted":    "var(--text-muted)",
        "text-subtle":   "var(--text-subtle)",
        "sidebar-bg":    "var(--sidebar-bg)",
        "sidebar-border":"var(--sidebar-border)",
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["Montserrat", "system-ui", "sans-serif"],
        sans:    ["Montserrat", "system-ui", "sans-serif"],
      },
      boxShadow: {
        orange: "0 4px 14px var(--accent-glow)",
        card:   "var(--card-shadow)",
      },
      backgroundImage: {
        "hero-gradient": "var(--hero-gradient)",
        "mesh-gradient": `
          radial-gradient(at 0% 0%,   var(--accent-glow) 0, transparent 50%),
          radial-gradient(at 100% 0%, var(--accent-glow) 0, transparent 50%)
        `,
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "spin-slow": "spin 1.5s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
