"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useChatwootWebSocket } from "@/hooks/useChatwootWebSocket";
import { mutate } from "swr";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isConversationDetail = /^\/conversations\/.+/.test(pathname);
  const { pubsubToken } = useAuth();

  useChatwootWebSocket(pubsubToken, (event) => {
    switch (event.event) {
      case 'message.created':
        mutate(`/api/chatwoot/conversations/${event.data.conversation_id}/messages`);
        mutate((key: string) => typeof key === 'string' && key.startsWith('/api/chatwoot/conversations'), undefined, { revalidate: true });
        break;
      case 'conversation.created':
      case 'conversation.status_changed':
      case 'conversation.read':
        mutate((key: string) => typeof key === 'string' && key.startsWith('/api/chatwoot/conversations'), undefined, { revalidate: true });
        break;
    }
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={isConversationDetail} />
      <div className="flex-1 flex flex-col min-w-0">
        {!isConversationDetail && <Header />}
        <main className="flex-1">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
