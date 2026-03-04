"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { toast } from "sonner";

interface MessageInputProps {
  onSend?: (text: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setText("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 128) + "px";
    }
  };

  return (
    <footer className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-2">
          {/* Mobile: single + button */}
          <button
            onClick={() => toast.info("Fonctionnalité bientôt disponible")}
            className="sm:hidden p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg shrink-0"
            aria-label="Ajouter un fichier"
            title="Ajouter un fichier"
          >
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          {/* Desktop: full icon row */}
          <div className="hidden sm:flex gap-1 shrink-0 px-1">
            <button
              onClick={() => toast.info("Fonctionnalité bientôt disponible")}
              className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              aria-label="Joindre un fichier"
              title="Joindre un fichier"
            >
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <button
              onClick={() => toast.info("Fonctionnalité bientôt disponible")}
              className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              aria-label="Envoyer une image"
              title="Envoyer une image"
            >
              <span className="material-symbols-outlined">image</span>
            </button>
            <button
              onClick={() => toast.info("Fonctionnalité bientôt disponible")}
              className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              aria-label="Insérer un emoji"
              title="Insérer un emoji"
            >
              <span className="material-symbols-outlined">mood</span>
            </button>
          </div>
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 text-sm max-h-32 min-h-[40px] outline-none"
            placeholder="Écrivez votre message..."
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="bg-primary text-white px-3 sm:px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Envoyer le message"
          >
            <span className="hidden sm:inline">Envoyer</span>
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
