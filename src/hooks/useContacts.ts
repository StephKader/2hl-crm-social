import useSWR from 'swr';
import type { Contact } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useContacts(search?: string, page = 1) {
  const endpoint = search
    ? `/api/chatwoot/contacts/search?q=${encodeURIComponent(search)}`
    : `/api/chatwoot/contacts?page=${page}`;

  const { data, isLoading, isValidating, mutate } = useSWR<{ contacts: Contact[] }>(
    endpoint,
    fetcher,
    { keepPreviousData: true }
  );

  return { contacts: data?.contacts || [], isLoading, isValidating, mutate };
}
