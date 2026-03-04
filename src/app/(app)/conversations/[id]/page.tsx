"use client";

import { use, useState } from "react";
import { useConversation } from "@/hooks/useConversation";
import { useConversations } from "@/hooks/useConversations";
import { ConversationList } from "@/components/conversations/ConversationList";
import { ChatPanel } from "@/components/conversations/ChatPanel";
import { CustomerProfile } from "@/components/conversations/CustomerProfile";
import { useRouter } from "next/navigation";
import { Conversation } from "@/lib/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  const { conversation, messages, sendMessage, isSending, isLoading } = useConversation(id);
  const { conversations } = useConversations({ status: "open" });

  const handleSelect = (conv: Conversation) => {
    router.push(`/conversations/${conv.id}`);
  };

  const toggleProfile = () => setShowProfile((prev) => !prev);

  if (isLoading || !conversation) {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <div className="text-slate-400 text-sm">Chargement...</div>
      </div>
    );
  }

  // Ensure conversation has messages for ChatPanel compatibility
  const convWithMessages = { ...conversation, messages };

  return (
    <div className="flex h-[100dvh] overflow-hidden pb-14 lg:pb-0">
      {/* Conversation List (hidden on mobile) */}
      <div className="hidden lg:block">
        <ConversationList
          conversations={conversations}
          activeConversationId={conversation.id}
          onSelect={handleSelect}
        />
      </div>

      {/* Chat Panel */}
      <ChatPanel
        conversation={convWithMessages}
        messages={messages}
        onSendMessage={sendMessage}
        showProfile={showProfile}
        onToggleProfile={toggleProfile}
      />

      {/* Customer Profile — Desktop: inline panel */}
      {isDesktop && showProfile && (
        <div className="w-80 xl:w-96 shrink-0 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-5 duration-200">
          <CustomerProfile conversation={convWithMessages} />
        </div>
      )}

      {/* Customer Profile — Mobile/Tablet: Sheet slide-out */}
      {!isDesktop && (
        <Sheet open={showProfile} onOpenChange={setShowProfile}>
          <SheetContent side="right" className="w-[85vw] sm:w-96 p-0 overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>Profil client</SheetTitle>
            </SheetHeader>
            <CustomerProfile conversation={convWithMessages} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
