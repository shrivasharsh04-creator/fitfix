import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: "emerald" | "rose" | "blue" | "amber" | "purple";
  badge?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = "emerald",
  badge,
}: StatCardProps) {
  const colorStyles = {
    emerald: "from-emerald-500/10 to-transparent text-emerald-400 border-emerald-500/20",
    rose: "from-rose-500/10 to-transparent text-rose-400 border-rose-500/20",
    blue: "from-blue-500/10 to-transparent text-blue-400 border-blue-500/20",
    amber: "from-amber-500/10 to-transparent text-amber-400 border-amber-500/20",
    purple: "from-purple-500/10 to-transparent text-purple-400 border-purple-500/20",
  }[colorScheme];

  const iconBgStyles = {
    emerald: "bg-emerald-500/15 text-emerald-400",
    rose: "bg-rose-500/15 text-rose-400",
    blue: "bg-blue-500/15 text-blue-400",
    amber: "bg-amber-500/15 text-amber-400",
    purple: "bg-purple-500/15 text-purple-400",
  }[colorScheme];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-slate-900/60 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-slate-700 hover:shadow-xl bg-gradient-to-b",
        colorStyles
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>

        <div className={cn("rounded-xl p-3 shadow-inner", iconBgStyles)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {(trend || badge) && (
        <div className="mt-4 flex items-center gap-2 border-t border-slate-800/80 pt-3 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-medium",
                trend.isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
          {badge && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
