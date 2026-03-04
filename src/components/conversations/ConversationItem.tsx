"use client";

import { Conversation } from "@/lib/types";
import { CHANNEL_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick?: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const channel = CHANNEL_CONFIG[conversation.channel];
  const status = STATUS_CONFIG[conversation.status];
  const contact = conversation.contact;
  const initials = contact.name.split(" ").map((n) => n[0]).join("");

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 flex gap-3 cursor-pointer transition-colors relative",
        isActive
          ? "border-l-4 border-primary bg-primary/5 dark:bg-primary/10"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {contact.avatarUrl ? (
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
            {initials}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 border border-slate-100 dark:border-slate-800">
          <span className={cn("material-symbols-outlined text-sm block filled-icon", `text-${conversation.channel === "whatsapp" ? "green" : "blue"}-500`)}>
            {channel.icon}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="font-bold text-sm truncate">{contact.name}</h3>
          <span className="text-[10px] text-slate-400 font-medium uppercase shrink-0 ml-2">
            {conversation.lastMessageAt}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-1">
          {conversation.lastMessage}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {conversation.intention && (
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                style={{
                  backgroundColor: `${conversation.intention.color}15`,
                  color: conversation.intention.color,
                }}
              >
                {conversation.intention.name.split(" ").slice(-1)[0]}
              </span>
            )}
            <span className="flex items-center gap-0.5 text-[10px] font-bold uppercase" style={{ color: status.color }}>
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dotClass)}></span>
              {status.label}
            </span>
          </div>
          {conversation.unreadCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
