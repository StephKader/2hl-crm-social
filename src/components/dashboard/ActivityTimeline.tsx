"use client";

import { ActivityEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">history</span>
        Activité récente
      </h3>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {events.map((event) => (
            <div key={event.id} className="p-6 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="relative">
                <div className={cn("size-10 rounded-full flex items-center justify-center", event.iconBgColor, event.iconColor)}>
                  <span className="material-symbols-outlined">{event.icon}</span>
                </div>
                {event.type === "broadcast" && (
                  <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "text-sm font-bold",
                    event.type === "alert" && "text-rose-600 dark:text-rose-400"
                  )}>
                    {event.title}
                  </p>
                  <span className="text-xs text-slate-400">{event.timestamp}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
          <button className="text-sm font-bold text-primary hover:text-primary/80">
            Voir tout l&apos;historique
          </button>
        </div>
      </div>
    </div>
  );
}
