"use client";

import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isClient = message.sender === "client";

  return (
    <div className={cn("flex", isClient ? "justify-start" : "justify-end")}>
      <div className="max-w-[70%]">
        {/* Text message */}
        {message.type === "text" && (
          <div
            className={cn(
              "p-4 rounded-xl shadow-sm",
              isClient
                ? "bg-white dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-slate-700"
                : "bg-primary text-white rounded-tr-none"
            )}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        )}

        {/* Document message */}
        {message.type === "document" && (
          <div
            className={cn(
              "p-3 rounded-xl shadow-sm flex items-center gap-3",
              isClient
                ? "bg-white dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-slate-700"
                : "bg-primary text-white rounded-tr-none"
            )}
          >
            <div className={cn("size-10 rounded flex items-center justify-center", isClient ? "bg-slate-100 dark:bg-slate-700" : "bg-white/20")}>
              <span className="material-symbols-outlined">description</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{message.fileName}</p>
              <p className={cn("text-[10px]", isClient ? "text-slate-400" : "text-white/70")}>{message.fileSize}</p>
            </div>
            <button className={cn("size-8 rounded-full flex items-center justify-center", isClient ? "hover:bg-slate-100" : "hover:bg-white/10")}>
              <span className="material-symbols-outlined text-xl">download</span>
            </button>
          </div>
        )}

        {/* Image message */}
        {message.type === "image" && (
          <div
            className={cn(
              "p-2 rounded-xl shadow-sm",
              isClient
                ? "bg-white dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-slate-700"
                : "bg-primary text-white rounded-tr-none"
            )}
          >
            <div className="rounded-lg overflow-hidden h-40 w-64 bg-slate-100 dark:bg-slate-700"></div>
            {message.content && <p className="text-sm mt-2 px-2">{message.content}</p>}
          </div>
        )}

        {/* Voice message */}
        {message.type === "voice" && (
          <div
            className={cn(
              "p-3 rounded-xl shadow-sm w-64",
              isClient
                ? "bg-white dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-slate-700"
                : "bg-primary text-white rounded-tr-none"
            )}
          >
            <div className="flex items-center gap-3">
              <button className={cn("size-8 rounded-full flex items-center justify-center shrink-0", isClient ? "bg-slate-100 dark:bg-slate-700" : "bg-white/20")}>
                <span className="material-symbols-outlined text-lg">play_arrow</span>
              </button>
              <div className="flex-1 flex items-center gap-0.5">
                {[4, 6, 2, 8, 5, 3, 6, 4, 2].map((h, i) => (
                  <div
                    key={i}
                    className={cn("w-1 rounded-full", isClient ? "bg-slate-300" : i % 2 === 0 ? "bg-white/40" : "bg-white")}
                    style={{ height: `${h * 4}px` }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium">{message.duration}</span>
            </div>
          </div>
        )}

        {/* Timestamp */}
        <span className={cn("text-[10px] text-slate-400 mt-1 block px-1", !isClient && "text-right")}>
          {message.timestamp}
          {message.status === "read" && !isClient && " • Lu"}
        </span>
      </div>
    </div>
  );
}
