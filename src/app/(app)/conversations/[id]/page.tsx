"use client";

import { use, useState, useCallback } from "react";
import { MOCK_CONVERSATIONS } from "@/lib/mock-data";
import { ConversationList } from "@/components/conversations/ConversationList";
import { ChatPanel } from "@/components/conversations/ChatPanel";
import { CustomerProfile } from "@/components/conversations/CustomerProfile";
import { useRouter } from "next/navigation";
import { Conversation, Message } from "@/lib/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const AUTO_REPLIES = [
  "Merci pour votre message, je reviens vers vous dans un instant.",
  "Bien reçu ! Je vérifie cela tout de suite.",
  "D'accord, je prends note de votre demande.",
  "Merci, je vous envoie les informations sous peu.",
  "Parfait, c'est noté. Un moment s'il vous plaît.",
];

export default function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  const conversation = MOCK_CONVERSATIONS.find((c) => c.id === id) || MOCK_CONVERSATIONS[0];
  const [messages, setMessages] = useState<Message[]>(conversation.messages);

  const handleSendMessage = useCallback((text: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    // Add user message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "text",
      content: text,
      sender: "commercial",
      senderName: user.name,
      timestamp,
      status: "sent",
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate delivery after 500ms
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: "delivered" } : m))
      );
    }, 500);

    // Simulate read after 1s
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: "read" } : m))
      );
    }, 1000);

    // Auto-reply from contact after 1.5-3s
    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const reply: Message = {
        id: `msg-${Date.now()}-reply`,
        type: "text",
        content: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        sender: "client",
        senderName: conversation.contact.name,
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, reply]);
    }, delay);
  }, [user.name, conversation.contact.name]);

  const handleSelect = (conv: Conversation) => {
    router.push(`/conversations/${conv.id}`);
  };

  const toggleProfile = () => setShowProfile((prev) => !prev);

  return (
    <div className="flex h-[100dvh] overflow-hidden pb-14 lg:pb-0">
      {/* Conversation List (hidden on mobile) */}
      <div className="hidden lg:block">
        <ConversationList
          conversations={MOCK_CONVERSATIONS}
          activeConversationId={conversation.id}
          onSelect={handleSelect}
        />
      </div>

      {/* Chat Panel */}
      <ChatPanel
        conversation={conversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        showProfile={showProfile}
        onToggleProfile={toggleProfile}
      />

      {/* Customer Profile — Desktop: inline panel */}
      {isDesktop && showProfile && (
        <div className="w-80 xl:w-96 shrink-0 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-5 duration-200">
          <CustomerProfile conversation={conversation} />
        </div>
      )}

      {/* Customer Profile — Mobile/Tablet: Sheet slide-out */}
      {!isDesktop && (
        <Sheet open={showProfile} onOpenChange={setShowProfile}>
          <SheetContent side="right" className="w-[85vw] sm:w-96 p-0 overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>Profil client</SheetTitle>
            </SheetHeader>
            <CustomerProfile conversation={conversation} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
