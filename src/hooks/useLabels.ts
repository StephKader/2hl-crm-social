import useSWR from 'swr';
import type { Label } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useLabels() {
  const { data, isLoading, mutate } = useSWR<Label[]>('/api/chatwoot/labels', fetcher, {
    revalidateOnFocus: false,
  });

  return { labels: data || [], isLoading, mutate };
}
