"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { IntentDistribution } from "@/lib/types";

interface IntentChartProps {
  data: IntentDistribution[];
}

export function IntentChart({ data }: IntentChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">pie_chart</span>
        Répartition Intentions
      </h3>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="h-[200px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, ""]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mb-4">
          <p className="text-2xl font-black">{total}%</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Total classifié</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ backgroundColor: d.color }}></span>
              <span className="text-xs font-semibold">{d.name} ({d.value}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
