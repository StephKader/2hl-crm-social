"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import { Conversation, Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatPanelProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage?: (text: string) => void;
  showProfile?: boolean;
  onToggleProfile?: () => void;
}

export function ChatPanel({ conversation, messages, onSendMessage, showProfile, onToggleProfile }: ChatPanelProps) {
  const router = useRouter();
  const contact = conversation.contact;
  const initials = contact.name.split(" ").map((n) => n[0]).join("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <main className="flex-1 flex flex-col bg-[#f6f6f8] dark:bg-[#111621] overflow-hidden min-w-0">
      {/* Chat Header */}
      <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/conversations")}
            className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Retour aux conversations"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-sm font-bold">{contact.name}</h2>
            <p className="text-xs text-green-500">En ligne</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => toast.info("Appel vocal — fonctionnalité bientôt disponible")}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Appel vocal"
            title="Appel vocal"
          >
            <span className="material-symbols-outlined">call</span>
          </button>
          <button
            onClick={() => toast.info("Appel vidéo — fonctionnalité bientôt disponible")}
            className="hidden sm:block p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Appel vidéo"
            title="Appel vidéo"
          >
            <span className="material-symbols-outlined">videocam</span>
          </button>
          {onToggleProfile && (
            <button
              onClick={onToggleProfile}
              className={`p-2 rounded-lg transition-colors ${
                showProfile
                  ? "text-primary bg-primary/10"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              aria-label={showProfile ? "Masquer le profil" : "Afficher le profil"}
              title={showProfile ? "Masquer le profil" : "Afficher le profil"}
            >
              <span className="material-symbols-outlined">contact_page</span>
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                aria-label="Plus d'options"
                title="Plus d'options"
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onToggleProfile}>
                <span className="material-symbols-outlined text-lg mr-2">person</span>
                Voir le profil client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.success("Conversation marquée comme résolue")}>
                <span className="material-symbols-outlined text-lg mr-2">check_circle</span>
                Marquer résolu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Transfert — fonctionnalité bientôt disponible")}>
                <span className="material-symbols-outlined text-lg mr-2">swap_horiz</span>
                Transférer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onClick={() => toast.info("Archivage — fonctionnalité bientôt disponible")}>
                <span className="material-symbols-outlined text-lg mr-2">archive</span>
                Archiver
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 custom-scrollbar">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
            <span className="material-symbols-outlined text-5xl">chat</span>
            <p className="text-sm">Aucun message pour l&apos;instant</p>
            <p className="text-xs">Envoyez un premier message pour démarrer la conversation</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={onSendMessage} />
    </main>
  );
}
