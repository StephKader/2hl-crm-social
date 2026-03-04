"use client";

import { useState } from "react";
import { Conversation, ConversationStatus, Channel } from "@/lib/types";
import { CHANNEL_CONFIG, STATUS_CONFIG, DEFAULT_INTENTIONS } from "@/lib/constants";
import { ConversationItem } from "./ConversationItem";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({ conversations, activeConversationId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<Channel | null>(null);
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | null>(null);
  const [intentionFilter, setIntentionFilter] = useState<string | null>(null);

  const hasActiveFilters = channelFilter !== null || statusFilter !== null || intentionFilter !== null;

  const filtered = conversations.filter((c) => {
    const matchesSearch = search === "" || c.contact.name.toLowerCase().includes(search.toLowerCase()) || c.lastMessage.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = !channelFilter || c.channel === channelFilter;
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesIntention = !intentionFilter || c.intention?.id === intentionFilter;
    return matchesSearch && matchesChannel && matchesStatus && matchesIntention;
  });

  const clearFilters = () => {
    setChannelFilter(null);
    setStatusFilter(null);
    setIntentionFilter(null);
  };

  return (
    <aside className="w-full lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Inbox</h2>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-500 outline-none"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {/* Canal Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                channelFilter ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800"
              }`}>
                {channelFilter ? CHANNEL_CONFIG[channelFilter].label : "Canal"}
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Canal</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={!channelFilter}
                onCheckedChange={() => setChannelFilter(null)}
              >
                Tous les canaux
              </DropdownMenuCheckboxItem>
              {(Object.keys(CHANNEL_CONFIG) as Channel[]).map((key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={channelFilter === key}
                  onCheckedChange={() => setChannelFilter(channelFilter === key ? null : key)}
                >
                  <span className="material-symbols-outlined text-sm mr-1" style={{ color: CHANNEL_CONFIG[key].color }}>
                    {CHANNEL_CONFIG[key].icon}
                  </span>
                  {CHANNEL_CONFIG[key].label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Statut Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800"
              }`}>
                {statusFilter ? STATUS_CONFIG[statusFilter].label : "Statut"}
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Statut</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={!statusFilter}
                onCheckedChange={() => setStatusFilter(null)}
              >
                Tous les statuts
              </DropdownMenuCheckboxItem>
              {(Object.keys(STATUS_CONFIG) as ConversationStatus[]).map((key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={statusFilter === key}
                  onCheckedChange={() => setStatusFilter(statusFilter === key ? null : key)}
                >
                  <span className={`size-2 rounded-full mr-1 ${STATUS_CONFIG[key].dotClass}`}></span>
                  {STATUS_CONFIG[key].label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Intention Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                intentionFilter ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800"
              }`}>
                {intentionFilter ? DEFAULT_INTENTIONS.find((i) => i.id === intentionFilter)?.name ?? "Intention" : "Intention"}
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Intention</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={!intentionFilter}
                onCheckedChange={() => setIntentionFilter(null)}
              >
                Toutes les intentions
              </DropdownMenuCheckboxItem>
              {DEFAULT_INTENTIONS.map((intent) => (
                <DropdownMenuCheckboxItem
                  key={intent.id}
                  checked={intentionFilter === intent.id}
                  onCheckedChange={() => setIntentionFilter(intentionFilter === intent.id ? null : intent.id)}
                >
                  <span className="size-2 rounded-full mr-1" style={{ backgroundColor: intent.color }}></span>
                  {intent.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
            onClick={() => onSelect(conv)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            Aucune conversation trouvée
          </div>
        )}
      </div>
    </aside>
  );
}
