/**
 * Calculates a dynamic health score (0-100) for a piece of gym equipment
 * based on open tickets, priority of issues, age, and PM status.
 */
export function calculateEquipmentHealth(params: {
  status: string;
  openCriticalTicketsCount?: number;
  openHighTicketsCount?: number;
  openMediumTicketsCount?: number;
  isPMOverdue?: boolean;
}): number {
  if (params.status === "OUT_OF_ORDER") {
    return Math.min(45, 30 - (params.openCriticalTicketsCount || 0) * 10);
  }
  if (params.status === "DECOMMISSIONED") {
    return 0;
  }

  let score = 100;

  // Deduct for tickets
  score -= (params.openCriticalTicketsCount || 0) * 40;
  score -= (params.openHighTicketsCount || 0) * 20;
  score -= (params.openMediumTicketsCount || 0) * 10;

  // Deduct for overdue PM
  if (params.isPMOverdue) {
    score -= 15;
  }

  if (params.status === "UNDER_MAINTENANCE" && score > 65) {
    score = 60;
  } else if (params.status === "DEGRADED" && score > 75) {
    score = 72;
  }

  return Math.max(5, Math.min(100, score));
}

export function getHealthColorClass(score: number): {
  text: string;
  bg: string;
  stroke: string;
  label: string;
} {
  if (score >= 90) {
    return {
      text: "text-emerald-500",
      bg: "bg-emerald-500/10",
      stroke: "#10b981",
      label: "Optimal",
    };
  }
  if (score >= 75) {
    return {
      text: "text-blue-500",
      bg: "bg-blue-500/10",
      stroke: "#3b82f6",
      label: "Good",
    };
  }
  if (score >= 50) {
    return {
      text: "text-amber-500",
      bg: "bg-amber-500/10",
      stroke: "#f59e0b",
      label: "Degraded",
    };
  }
  return {
    text: "text-rose-500",
    bg: "bg-rose-500/10",
    stroke: "#ef4444",
    label: "Critical",
  };
}
