'use client';

import { useEffect, useRef, useState } from 'react';
import ChatwootWebSocket, { type WebSocketEvent } from '@/lib/chatwoot/websocket';

export function useChatwootWebSocket(
  pubsubToken: string | null,
  onEvent: (event: WebSocketEvent) => void
) {
  const wsRef = useRef<ChatwootWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!pubsubToken) return;

    const ws = new ChatwootWebSocket(pubsubToken);
    wsRef.current = ws;

    const unsubscribe = ws.on((event) => {
      setIsConnected(true);
      onEvent(event);
    });

    ws.connect();

    return () => {
      unsubscribe();
      ws.disconnect();
      wsRef.current = null;
    };
  }, [pubsubToken]); // eslint-disable-line react-hooks/exhaustive-deps

  return { isConnected };
}
