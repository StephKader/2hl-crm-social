import useSWR from 'swr';
import type { Conversation } from '@/lib/types';

interface Filters {
  status?: string;
  inbox_id?: string;
  page?: number;
  q?: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useConversations(filters: Filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.inbox_id) params.set('inbox_id', filters.inbox_id);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.q) params.set('q', filters.q);

  const { data, error, isLoading, mutate } = useSWR<{ conversations: Conversation[] }>(
    `/api/chatwoot/conversations?${params}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    conversations: data?.conversations || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
