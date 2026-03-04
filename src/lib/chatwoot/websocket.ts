// Client WebSocket ActionCable pour Chatwoot — CÔTÉ CLIENT uniquement

export type WebSocketEvent = {
  event: string;
  data: Record<string, unknown>;
};

type EventHandler = (event: WebSocketEvent) => void;

class ChatwootWebSocket {
  private ws: WebSocket | null = null;
  private pubsubToken: string;
  private wsUrl: string;
  private handlers: Set<EventHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private isDestroyed = false;

  constructor(pubsubToken: string) {
    this.pubsubToken = pubsubToken;
    this.wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${pubsubToken}`;
  }

  connect() {
    if (this.isDestroyed) return;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 Chatwoot WebSocket connecté');
        this.reconnectDelay = 1000;
        this.ws?.send(
          JSON.stringify({
            command: 'subscribe',
            identifier: JSON.stringify({
              channel: 'RoomChannel',
              pubsub_token: this.pubsubToken,
            }),
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'ping' || parsed.type === 'welcome' || parsed.type === 'confirm_subscription') return;
          if (parsed.message?.event) {
            this.handlers.forEach((h) =>
              h({ event: parsed.message.event, data: parsed.message.data || {} })
            );
          }
        } catch {
          /* ignore parse errors */
        }
      };

      this.ws.onclose = () => {
        if (!this.isDestroyed) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
            this.connect();
          }, this.reconnectDelay);
        }
      };

      this.ws.onerror = (err) => console.error('WebSocket error:', err);
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  }

  on(handler: EventHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect() {
    this.isDestroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}

export default ChatwootWebSocket;
