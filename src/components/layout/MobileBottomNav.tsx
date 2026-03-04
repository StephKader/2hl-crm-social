"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthorized } = useAuth();

  // Filtrer les items par rôle (comme le Sidebar desktop)
  const authorizedItems = NAV_ITEMS.filter((item) => isAuthorized(item.roles));

  // Prendre les 3 premiers items pour le nav principal
  const mainItems = authorizedItems.slice(0, 3);

  // Si plus de 3 items autorisés, ajouter un bouton "Plus"
  const hasMore = authorizedItems.length > 3;
  const moreItem = hasMore ? authorizedItems[3] : null;

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
          >
            <span className={cn("material-symbols-outlined text-[22px]", isActive && "filled-icon")}>
              {item.icon}
            </span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
      {moreItem && (
        <Link
          href={moreItem.href}
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[60px]",
            pathname.startsWith(moreItem.href) ? "text-primary" : "text-slate-400"
          )}
        >
          <span className={cn("material-symbols-outlined text-[22px]", pathname.startsWith(moreItem.href) && "filled-icon")}>
            more_horiz
          </span>
          <span className="text-[10px] font-medium">Plus</span>
        </Link>
      )}
    </nav>
  );
}
