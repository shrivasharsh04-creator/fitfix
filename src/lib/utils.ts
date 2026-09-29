import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, fmt = "MMM d, yyyy") {
  if (!date) return "N/A";
  try {
    return format(new Date(date), fmt);
  } catch {
    return "Invalid date";
  }
}

export function formatTimeAgo(date: string | Date | null | undefined) {
  if (!date) return "N/A";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "N/A";
  }
}

export function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getStatusBadgeInfo(status: string) {
  switch (status) {
    case "OPERATIONAL":
      return {
        label: "Operational",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        dot: "bg-emerald-500",
      };
    case "DEGRADED":
      return {
        label: "Degraded",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        dot: "bg-amber-500",
      };
    case "UNDER_MAINTENANCE":
      return {
        label: "Under Maintenance",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        dot: "bg-blue-500",
      };
    case "OUT_OF_ORDER":
      return {
        label: "Out of Order",
        color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
        dot: "bg-rose-500",
      };
    case "DECOMMISSIONED":
      return {
        label: "Decommissioned",
        color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
        dot: "bg-slate-500",
      };
    default:
      return {
        label: status,
        color: "bg-slate-500/10 text-slate-600 border-slate-500/30",
        dot: "bg-slate-500",
      };
  }
}

export function getPriorityBadgeInfo(priority: string) {
  switch (priority) {
    case "CRITICAL":
      return {
        label: "Critical",
        color: "bg-rose-600 text-white font-semibold animate-pulse shadow-sm shadow-rose-500/50",
      };
    case "HIGH":
      return {
        label: "High",
        color: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
      };
    case "MEDIUM":
      return {
        label: "Medium",
        color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      };
    case "LOW":
      return {
        label: "Low",
        color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
      };
    default:
      return {
        label: priority,
        color: "bg-slate-500/15 text-slate-600 border-slate-500/30",
      };
  }
}

export function getTicketStatusBadgeInfo(status: string) {
  switch (status) {
    case "REPORTED":
      return {
        label: "Reported",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
        step: 1,
      };
    case "ASSIGNED":
      return {
        label: "Assigned",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
        step: 2,
      };
    case "IN_PROGRESS":
      return {
        label: "In Progress",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        step: 3,
      };
    case "PENDING_PARTS":
      return {
        label: "Pending Parts",
        color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
        step: 3,
      };
    case "COMPLETED":
      return {
        label: "Completed",
        color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
        step: 4,
      };
    case "VERIFIED":
      return {
        label: "Verified & Closed",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        step: 5,
      };
    default:
      return {
        label: status,
        color: "bg-slate-500/10 text-slate-600 border-slate-500/30",
        step: 0,
      };
  }
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  return isPast(new Date(date));
}
