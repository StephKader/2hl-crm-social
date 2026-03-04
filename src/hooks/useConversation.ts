import useSWR from 'swr';
import { useState, useCallback } from 'react';
import type { Conversation, Message } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useConversation(id: string) {
  const { data: conv, isLoading: convLoading } = useSWR<Conversation>(
    id ? `/api/chatwoot/conversations/${id}` : null,
    fetcher
  );

  const {
    data: msgData,
    isLoading: msgsLoading,
    mutate: mutateMessages,
  } = useSWR<{ messages: Message[] }>(
    id ? `/api/chatwoot/conversations/${id}/messages` : null,
    fetcher
  );

  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(
    async (content: string, isPrivate = false) => {
      setIsSending(true);
      try {
        const res = await fetch(`/api/chatwoot/conversations/${id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, private: isPrivate }),
        });
        if (!res.ok) throw new Error('Envoi échoué');
        await mutateMessages();
      } finally {
        setIsSending(false);
      }
    },
    [id, mutateMessages]
  );

  return {
    conversation: conv,
    messages: msgData?.messages || [],
    isLoading: convLoading || msgsLoading,
    sendMessage,
    isSending,
  };
}
