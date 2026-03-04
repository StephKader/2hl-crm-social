"use client";

import { toast } from "sonner";

export function MessageInput() {
  return (
    <footer className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-2">
          {/* Mobile: single + button */}
          <button onClick={() => toast.info("Fonctionnalité bientôt disponible")} className="sm:hidden p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg shrink-0">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          {/* Desktop: full icon row */}
          <div className="hidden sm:flex gap-1 shrink-0 px-1">
            <button onClick={() => toast.info("Fonctionnalité bientôt disponible")} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <button onClick={() => toast.info("Fonctionnalité bientôt disponible")} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
              <span className="material-symbols-outlined">image</span>
            </button>
            <button onClick={() => toast.info("Fonctionnalité bientôt disponible")} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">
              <span className="material-symbols-outlined">mood</span>
            </button>
          </div>
          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 text-sm max-h-32 min-h-[40px] outline-none"
            placeholder="Écrivez votre message..."
            rows={1}
          />
          <button className="bg-primary text-white px-3 sm:px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shrink-0">
            <span className="hidden sm:inline">Envoyer</span>
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
