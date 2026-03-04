"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  label: string;
  value: string | number;
  trend?: number;
  isAlert?: boolean;
  alertLabel?: string;
}

export function MetricCard({
  icon, iconBgClass, iconTextClass, label, value, trend, isAlert, alertLabel,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm",
        isAlert
          ? "border-rose-100 dark:border-rose-900/30 ring-2 ring-rose-500/5"
          : "border-slate-200 dark:border-slate-800"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={cn("p-2 rounded-lg material-symbols-outlined", iconBgClass, iconTextClass)}>
          {icon}
        </span>
        {trend !== undefined && (
          <span
            className={cn(
              "text-xs font-bold flex items-center gap-1",
              isPositive && "text-emerald-500",
              isNegative && "text-rose-500"
            )}
          >
            {isPositive ? "+" : ""}{trend}%
            <span className="material-symbols-outlined text-[14px]">
              {isPositive ? "trending_up" : "trending_down"}
            </span>
          </span>
        )}
        {alertLabel && (
          <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
            {alertLabel}
          </span>
        )}
      </div>
      <p className={cn("text-sm font-medium", isAlert ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-500")}>
        {label}
      </p>
      <h3 className={cn("text-2xl font-bold mt-1", isAlert && "text-rose-700 dark:text-rose-300")}>{value}</h3>
    </div>
  );
}
