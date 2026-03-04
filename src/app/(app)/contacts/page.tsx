"use client";

import { useState } from "react";
import { MOCK_CONTACTS } from "@/lib/mock-data";
import { CHANNEL_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Contact } from "@/lib/types";
import { toast } from "sonner";

export default function ContactsPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");

  const filtered = MOCK_CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Contacts</h2>
          <p className="text-slate-500 mt-1">{MOCK_CONTACTS.length} contacts au total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-sm" onClick={() => toast.info("Fonctionnalité bientôt disponible")}>
            <span className="material-symbols-outlined text-lg mr-1">upload</span>
            Importer
          </Button>
          <Button variant="outline" className="text-sm" onClick={() => toast.info("Fonctionnalité bientôt disponible")}>
            <span className="material-symbols-outlined text-lg mr-1">download</span>
            Exporter
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          placeholder="Rechercher par nom, téléphone, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Téléphone</th>
                <th className="px-6 py-4">Canaux</th>
                <th className="px-6 py-4">Intention</th>
                <th className="px-6 py-4">Labels</th>
                <th className="px-6 py-4">Dernière activité</th>
                <th className="px-6 py-4">Conv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((contact) => {
                const initials = contact.name.split(" ").map((n) => n[0]).join("");
                return (
                  <tr
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <div>
                          <span className="text-sm font-bold block">{contact.name}</span>
                          {contact.company && (
                            <span className="text-xs text-slate-400">{contact.company}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{contact.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {contact.channels.map((ch) => (
                          <span
                            key={ch}
                            className={`material-symbols-outlined text-sm filled-icon ${ch === "whatsapp" ? "text-green-500" : "text-blue-500"}`}
                          >
                            {CHANNEL_CONFIG[ch].icon}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {contact.intention && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          style={{ backgroundColor: `${contact.intention.color}15`, color: contact.intention.color }}
                        >
                          {contact.intention.name.split(" ").slice(-1)[0]}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.labels.slice(0, 2).map((lbl) => (
                          <span key={lbl.id} className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `${lbl.color}15`, color: lbl.color }}>
                            {lbl.name}
                          </span>
                        ))}
                        {contact.labels.length > 2 && (
                          <span className="text-[10px] text-slate-400">+{contact.labels.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{contact.lastActivity}</td>
                    <td className="px-6 py-4 text-sm font-medium">{contact.conversationCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Detail Sheet */}
      <Sheet open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <SheetContent className="overflow-y-auto">
          {selectedContact && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedContact.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Avatar + Info */}
                <div className="text-center">
                  <div className="size-20 rounded-full mx-auto mb-3 bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    {selectedContact.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  {selectedContact.title && selectedContact.company && (
                    <p className="text-sm text-slate-500">{selectedContact.title} @ {selectedContact.company}</p>
                  )}
                  <div className="flex justify-center gap-2 mt-3">
                    {selectedContact.channels.map((ch) => (
                      <span key={ch} className={`px-2 py-1 rounded text-xs font-bold uppercase ${ch === "whatsapp" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-xl">phone</span>
                    {selectedContact.phone}
                  </div>
                  {selectedContact.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-xl">mail</span>
                      {selectedContact.email}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-xl">calendar_today</span>
                    Client depuis le {selectedContact.firstContact}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <span className="material-symbols-outlined text-xl">chat</span>
                    {selectedContact.conversationCount} conversations
                  </div>
                </div>

                {/* Labels */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Labels</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedContact.labels.map((lbl) => (
                      <span key={lbl.id} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${lbl.color}15`, color: lbl.color }}>
                        {lbl.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
