"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Conversation } from "@/lib/types";
import { MOCK_CONVERSATIONS } from "@/lib/mock-data";
import { ConversationList } from "@/components/conversations/ConversationList";
import { EmptyState } from "@/components/conversations/EmptyState";

export default function ConversationsPage() {
  const router = useRouter();

  const handleSelect = (conversation: Conversation) => {
    router.push(`/conversations/${conversation.id}`);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <div className="flex flex-1">
        <ConversationList
          conversations={MOCK_CONVERSATIONS}
          onSelect={handleSelect}
        />
        <div className="hidden lg:flex flex-1 flex-col">
          <EmptyState />
        </div>
      </div>
    </div>
  );
}
