"use client";

import { AgentPerformance } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CommercialTableProps {
  data: AgentPerformance[];
}

export function CommercialTable({ data }: CommercialTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">analytics</span>
          Performance Commerciale
        </h3>
        <button className="text-sm font-semibold text-primary hover:underline">Voir tout</button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Agent</th>
              <th className="px-6 py-4">Conv. actives</th>
              <th className="px-6 py-4">Temps moy.</th>
              <th className="px-6 py-4">Progression</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row) => (
              <tr key={row.agent.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {row.agent.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-sm font-bold">{row.agent.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{row.activeConversations}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{row.avgResponseTime}</td>
                <td className="px-6 py-4">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        row.targetProgress >= 60 ? "bg-primary" : "bg-amber-500"
                      )}
                      style={{ width: `${row.targetProgress}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
