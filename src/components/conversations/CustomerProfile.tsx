"use client";

import { Conversation } from "@/lib/types";
import { DEFAULT_INTENTIONS } from "@/lib/constants";
import { AISummary } from "./AISummary";
import { InternalNotes } from "./InternalNotes";
import type { InternalNote } from "@/lib/types";

interface CustomerProfileProps {
  conversation: Conversation;
}

export function CustomerProfile({ conversation }: CustomerProfileProps) {
  const contact = conversation.contact;
  const initials = contact.name.split(" ").map((n) => n[0]).join("");

  return (
    <aside className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Profile Header */}
      <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800">
        <div className="size-24 rounded-full mx-auto mb-4 border-4 border-slate-50 dark:border-slate-800 shadow-sm bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
          {initials}
        </div>
        <h3 className="text-lg font-bold">{contact.name}</h3>
        {contact.title && contact.company && (
          <p className="text-sm text-slate-500">{contact.title} @ {contact.company}</p>
        )}
        <div className="flex justify-center gap-2 mt-4">
          {contact.channels.map((ch) => (
            <div
              key={ch}
              className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                ch === "whatsapp"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
              }`}
            >
              {ch === "whatsapp" ? "WhatsApp" : ch === "messenger" ? "Messenger" : "Facebook"}
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="p-6 pb-16 flex flex-col gap-6">
        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined text-xl">phone</span>
            <span className="text-sm">{contact.phone}</span>
          </div>
          {contact.email && (
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined text-xl">mail</span>
              <span className="text-sm">{contact.email}</span>
            </div>
          )}
        </div>

        {/* Intention */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Intention</label>
            <select
              defaultValue={conversation.intention?.id || ""}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm py-2 px-3"
            >
              <option value="">— Sélectionner —</option>
              {DEFAULT_INTENTIONS.map((intent) => (
                <option key={intent.id} value={intent.id}>
                  {intent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Labels</label>
            <div className="flex flex-wrap gap-2">
              {contact.labels.map((lbl) => (
                <span
                  key={lbl.id}
                  className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{ backgroundColor: `${lbl.color}15`, color: lbl.color }}
                >
                  {lbl.name}
                  <button className="material-symbols-outlined text-[14px]">close</button>
                </span>
              ))}
              <button className="px-3 py-1 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 rounded-full text-xs font-medium hover:border-primary hover:text-primary transition-all">
                + Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {conversation.aiSummary && (
          <AISummary summary={conversation.aiSummary} />
        )}

        {/* Internal Notes */}
        <InternalNotes notes={[] as InternalNote[]} />
      </div>
    </aside>
  );
}
