"use client";

import { InternalNote } from "@/lib/types";

interface InternalNotesProps {
  notes: InternalNote[];
}

export function InternalNotes({ notes }: InternalNotesProps) {
  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        Notes Internes
      </label>
      <textarea
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[80px] placeholder:text-slate-400 p-3 outline-none focus:ring-2 focus:ring-primary/20"
        placeholder="Ajouter une note pour l'équipe..."
      />
      <div className="mt-2 space-y-2">
        {notes.map((note) => (
          <div key={note.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs border-l-2 border-slate-300">
            <p className="text-slate-600 dark:text-slate-400">{note.content}</p>
            <span className="text-[10px] text-slate-400 block mt-1">
              Par {note.author} • {note.createdAt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
