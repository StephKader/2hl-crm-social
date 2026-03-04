import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getPeriodTimestamps(period: 'today' | 'week' | 'month') {
  const now = new Date();
  const until = Math.floor(now.getTime() / 1000);
  let since: number;

  if (period === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    since = Math.floor(start.getTime() / 1000);
  } else if (period === 'week') {
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);
    since = Math.floor(monday.getTime() / 1000);
  } else {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    since = Math.floor(start.getTime() / 1000);
  }
  return { since, until };
}

export function useDashboardMetrics(period: 'today' | 'week' | 'month' = 'today') {
  const { since, until } = getPeriodTimestamps(period);
  const baseUrl = `/api/chatwoot/reports?since=${since}&until=${until}&type=account`;

  const { data: convs } = useSWR(`${baseUrl}&metric=conversations_count`, fetcher);
  const { data: responseTime } = useSWR(`${baseUrl}&metric=avg_first_response_time`, fetcher);
  const { data: resolutions } = useSWR(`${baseUrl}&metric=resolutions_count`, fetcher);

  const totalConvs = (convs || []).reduce(
    (sum: number, d: { value: string }) => sum + parseInt(d.value || '0'),
    0
  );
  const avgRT = (responseTime || []).reduce(
    (sum: number, d: { value: string }) => sum + parseFloat(d.value || '0'),
    0
  );
  const totalResolutions = (resolutions || []).reduce(
    (sum: number, d: { value: string }) => sum + parseInt(d.value || '0'),
    0
  );

  return {
    activeConversations: totalConvs,
    avgResponseTime: avgRT > 0 ? `${Math.round(avgRT / 60)} min` : '--',
    resolvedToday: totalResolutions,
    conversationsSeries: convs || [],
  };
}
