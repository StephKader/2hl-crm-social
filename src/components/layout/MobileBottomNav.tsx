"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthorized } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Filtrer les items par rôle (comme le Sidebar desktop)
  const authorizedItems = NAV_ITEMS.filter((item) => isAuthorized(item.roles));

  // Prendre les 3 premiers items pour le nav principal
  const mainItems = authorizedItems.slice(0, 3);

  // Tous les items restants pour le menu "Plus"
  const extraItems = authorizedItems.slice(3);
  const hasMore = extraItems.length > 0;

  // Un des extraItems est actif ?
  const isExtraActive = extraItems.some((item) => pathname.startsWith(item.href));

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fermer le menu quand on navigue
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-2 safe-area-pb">
      {mainItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[60px]",
              isActive ? "text-primary" : "text-slate-400"
            )}
            aria-label={item.label}
          >
            <span className={cn("material-symbols-outlined text-[22px]", isActive && "filled-icon")}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}

      {/* Bouton "Plus" — ouvre un popover avec les items restants */}
      {hasMore && (
        <div ref={moreRef} className="relative">
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[60px]",
              isExtraActive || moreOpen ? "text-primary" : "text-slate-400"
            )}
            aria-label="Plus d'onglets"
            aria-expanded={moreOpen}
          >
            <span className={cn("material-symbols-outlined text-[22px]", isExtraActive && "filled-icon")}>
              more_horiz
            </span>
            <span className="text-[10px] font-medium">Plus</span>
          </button>

          {/* Popover menu */}
          {moreOpen && (
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-150">
              {extraItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800",
                      isActive ? "text-primary font-semibold" : "text-slate-600 dark:text-slate-400"
                    )}
                    aria-label={item.label}
                  >
                    <span className={cn("material-symbols-outlined text-xl", isActive && "filled-icon")}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
