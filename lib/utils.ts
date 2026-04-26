import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: "PKR" | "USD" | "GBP") {
  const symbols = { PKR: "Rs", USD: "$", GBP: "£" };
  const symbol = symbols[currency];
  return `${symbol} ${amount.toLocaleString()}`;
}

export function formatDate(date: string | null) {
  if (!date) return "—";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatRelative(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: string | null) {
  if (!date) return false;
  return isBefore(new Date(date), new Date());
}

export function isDueSoon(date: string | null, days = 3) {
  if (!date) return false;
  const d = new Date(date);
  return isAfter(d, new Date()) && isBefore(d, addDays(new Date(), days));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getMilestoneProgress(milestones: { status: string }[]) {
  if (!milestones.length) return 0;
  const done = milestones.filter(
    (m) => m.status === "done" || m.status === "approved"
  ).length;
  return Math.round((done / milestones.length) * 100);
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    inquiry: "bg-gray-100 text-gray-600",
    proposal_sent: "bg-blue-50 text-blue-600",
    negotiating: "bg-yellow-50 text-yellow-700",
    active: "bg-green-50 text-green-700",
    in_review: "bg-purple-50 text-purple-700",
    completed: "bg-emerald-50 text-emerald-700",
    archived: "bg-gray-100 text-gray-500",
    pending: "bg-gray-100 text-gray-600",
    in_progress: "bg-accent-light text-accent",
    done: "bg-green-50 text-green-700",
    approved: "bg-emerald-50 text-emerald-700",
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-50 text-blue-600",
    partial: "bg-yellow-50 text-yellow-700",
    paid: "bg-green-50 text-green-700",
    overdue: "bg-red-50 text-red-600",
    unpaid: "bg-red-50 text-red-600",
    accepted: "bg-green-50 text-green-700",
    declined: "bg-red-50 text-red-600",
    changes_requested: "bg-yellow-50 text-yellow-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
}

export function getPlatformLabel(platform: string) {
  const map: Record<string, string> = {
    upwork: "Upwork",
    fiverr: "Fiverr",
    local: "Local",
    direct: "Direct",
    other: "Other",
  };
  return map[platform] || platform;
}

export function getScenarioLabel(scenario: string) {
  const map: Record<string, string> = {
    late_payment: "Late Payment Follow-up",
    scope_creep: "Scope Creep / Extra Work",
    project_delivery: "Project Delivery",
    revision_limit: "Revision Limit Reached",
    rate_increase: "Rate Increase Notice",
    project_delay: "Project Delay Update",
    client_ghosting: "Client Ghosting Follow-up",
    contract_reminder: "Contract Reminder",
    milestone_approval: "Milestone Approval Request",
    project_completion: "Project Completion",
  };
  return map[scenario] || scenario;
}

export function generatePortalToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 24 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}
