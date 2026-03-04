"use client";

import { useRouter } from "next/navigation";
import { Conversation } from "@/lib/types";
import { useConversations } from "@/hooks/useConversations";
import { ConversationList } from "@/components/conversations/ConversationList";
import { EmptyState } from "@/components/conversations/EmptyState";

export default function ConversationsPage() {
  const router = useRouter();
  const { conversations, isLoading } = useConversations({ status: "open" });

  const handleSelect = (conversation: Conversation) => {
    router.push(`/conversations/${conversation.id}`);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <div className="flex flex-1">
        <ConversationList
          conversations={conversations}
          onSelect={handleSelect}
        />
        <div className="hidden lg:flex flex-1 flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-slate-400 text-sm">Chargement...</div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
