"use client";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useAuth } from "@/contexts/AuthContext";
import type { ActivityEvent } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const metrics = useDashboardMetrics('today');

  return (
    <div className="p-4 lg:p-8 space-y-8 pb-24 lg:pb-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tight">Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Bienvenue, {user?.name || 'utilisateur'}. Voici un aperçu de la performance du jour.
        </p>
      </div>

      {/* Section A: Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          icon="chat_bubble"
          iconBgClass="bg-primary/10"
          iconTextClass="text-primary"
          label="Conversations actives"
          value={metrics.activeConversations.toLocaleString()}
          trend={0}
        />
        <MetricCard
          icon="timer"
          iconBgClass="bg-amber-500/10"
          iconTextClass="text-amber-500"
          label="Temps de réponse moy."
          value={metrics.avgResponseTime}
          trend={0}
        />
        <MetricCard
          icon="check_circle"
          iconBgClass="bg-emerald-500/10"
          iconTextClass="text-emerald-500"
          label="Résolues aujourd'hui"
          value={metrics.resolvedToday}
          trend={0}
        />
      </div>

      {/* Section D: Activity Timeline */}
      <ActivityTimeline events={[] as ActivityEvent[]} />
    </div>
  );
}
