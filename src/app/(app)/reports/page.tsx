"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { MOCK_AGENT_PERFORMANCE } from "@/lib/mock-data";
import { toast } from "sonner";

const BASE_CONVERSATION_DATA = [
  { day: "Lun", conversations: 45 },
  { day: "Mar", conversations: 62 },
  { day: "Mer", conversations: 58 },
  { day: "Jeu", conversations: 73 },
  { day: "Ven", conversations: 55 },
  { day: "Sam", conversations: 28 },
  { day: "Dim", conversations: 15 },
];

const BASE_RESPONSE_TIME = [
  { day: "Lun", time: 4.5 },
  { day: "Mar", time: 3.8 },
  { day: "Mer", time: 5.2 },
  { day: "Jeu", time: 3.1 },
  { day: "Ven", time: 4.0 },
  { day: "Sam", time: 6.5 },
  { day: "Dim", time: 8.0 },
];

const CHANNEL_DATA_BY_PERIOD: Record<string, { name: string; value: number; color: string }[]> = {
  today: [
    { name: "WhatsApp", value: 60, color: "#22c55e" },
    { name: "Messenger", value: 30, color: "#3b82f6" },
    { name: "Facebook", value: 10, color: "#1d4ed8" },
  ],
  week: [
    { name: "WhatsApp", value: 55, color: "#22c55e" },
    { name: "Messenger", value: 35, color: "#3b82f6" },
    { name: "Facebook", value: 10, color: "#1d4ed8" },
  ],
  month: [
    { name: "WhatsApp", value: 50, color: "#22c55e" },
    { name: "Messenger", value: 38, color: "#3b82f6" },
    { name: "Facebook", value: 12, color: "#1d4ed8" },
  ],
  custom: [
    { name: "WhatsApp", value: 52, color: "#22c55e" },
    { name: "Messenger", value: 36, color: "#3b82f6" },
    { name: "Facebook", value: 12, color: "#1d4ed8" },
  ],
};

const PERIOD_MULTIPLIER: Record<string, number> = {
  today: 0.15,
  week: 1,
  month: 4.2,
  custom: 2.5,
};

type Period = "today" | "week" | "month" | "custom";

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("week");

  const conversationData = useMemo(() => {
    const mult = PERIOD_MULTIPLIER[period];
    return BASE_CONVERSATION_DATA.map((d) => ({
      ...d,
      conversations: Math.round(d.conversations * mult),
    }));
  }, [period]);

  const responseTimeData = useMemo(() => {
    const offsets: Record<string, number> = { today: -1.5, week: 0, month: 0.8, custom: 0.3 };
    const offset = offsets[period];
    return BASE_RESPONSE_TIME.map((d) => ({
      ...d,
      time: Math.max(1, +(d.time + offset).toFixed(1)),
    }));
  }, [period]);

  const channelData = CHANNEL_DATA_BY_PERIOD[period];

  const periods: { label: string; value: Period }[] = [
    { label: "Aujourd'hui", value: "today" },
    { label: "Cette semaine", value: "week" },
    { label: "Ce mois", value: "month" },
    { label: "Personnalisé", value: "custom" },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Rapports</h2>
          <p className="text-slate-500 mt-1">Statistiques et performances de vos conversations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm" onClick={() => toast.info("Export — fonctionnalité bientôt disponible")}>
            <span className="material-symbols-outlined text-lg mr-1">picture_as_pdf</span>
            PDF
          </Button>
          <Button variant="outline" className="text-sm" onClick={() => toast.info("Export — fonctionnalité bientôt disponible")}>
            <span className="material-symbols-outlined text-lg mr-1">download</span>
            CSV
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 flex-wrap">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              period === p.value
                ? "bg-primary text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversations over time */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bar_chart</span>
            Volume de conversations
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="conversations" fill="#2563eb" radius={[4, 4, 0, 0]} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">pie_chart</span>
            Répartition par canal
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" isAnimationActive>
                  {channelData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {channelData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-xs font-semibold">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">timer</span>
            Temps de réponse moyen (min)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="time" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb" }} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Ranking */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">leaderboard</span>
            Classement agents
          </h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3">#</th>
                <th className="pb-3">Agent</th>
                <th className="pb-3">Conv.</th>
                <th className="pb-3">Temps moy.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_AGENT_PERFORMANCE.map((row, i) => (
                <tr key={row.agent.id}>
                  <td className="py-3">
                    <span className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-bold">{row.agent.name}</td>
                  <td className="py-3 text-sm">{row.activeConversations}</td>
                  <td className="py-3 text-sm text-slate-500">{row.avgResponseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
