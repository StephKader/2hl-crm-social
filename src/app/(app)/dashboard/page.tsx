"use client";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { CommercialTable } from "@/components/dashboard/CommercialTable";
import { IntentChart } from "@/components/dashboard/IntentChart";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import {
  MOCK_DASHBOARD_METRICS,
  MOCK_AGENT_PERFORMANCE,
  MOCK_INTENT_DISTRIBUTION,
  MOCK_ACTIVITY_EVENTS,
} from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const metrics = MOCK_DASHBOARD_METRICS;

  return (
    <div className="p-4 lg:p-8 space-y-8 pb-24 lg:pb-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tight">Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Bienvenue, {user.name}. Voici un aperçu de la performance du jour.
        </p>
      </div>

      {/* Section A: Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon="chat_bubble"
          iconBgClass="bg-primary/10"
          iconTextClass="text-primary"
          label="Conversations actives"
          value={metrics.activeConversations.toLocaleString()}
          trend={metrics.activeConversationsTrend}
        />
        <MetricCard
          icon="person_add"
          iconBgClass="bg-blue-500/10"
          iconTextClass="text-blue-500"
          label="Nouveaux contacts"
          value={metrics.newContacts}
          trend={metrics.newContactsTrend}
        />
        <MetricCard
          icon="timer"
          iconBgClass="bg-amber-500/10"
          iconTextClass="text-amber-500"
          label="Temps de réponse moy."
          value={metrics.avgResponseTime}
          trend={metrics.avgResponseTimeTrend}
        />
        <MetricCard
          icon="error"
          iconBgClass="bg-rose-500/10"
          iconTextClass="text-rose-500"
          label="Alertes sans réponse"
          value={metrics.noResponseAlerts}
          isAlert
          alertLabel="Urgent"
        />
      </div>

      {/* Section B + C: Performance Table + Intent Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CommercialTable data={MOCK_AGENT_PERFORMANCE} />
        </div>
        <div>
          <IntentChart data={MOCK_INTENT_DISTRIBUTION} />
        </div>
      </div>

      {/* Section D: Activity Timeline */}
      <ActivityTimeline events={MOCK_ACTIVITY_EVENTS} />
    </div>
  );
}
