"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { isAuthorized } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => isAuthorized(item.roles));

  return (
    <aside
      className={cn(
        "border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col sticky top-0 h-screen shrink-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3", collapsed ? "p-4 justify-center" : "p-6")}>
        <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white shrink-0">
          <span className="material-symbols-outlined">hub</span>
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-lg leading-tight">NEXIA CRM</h1>
            <p className="text-xs text-slate-500 font-medium">Social</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1", collapsed ? "px-2 py-4" : "px-4 py-4")}>
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg transition-colors",
                collapsed ? "p-3 justify-center" : "px-3 py-2",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <span className={cn("material-symbols-outlined text-[24px]", isActive && "filled-icon")}>
                {item.icon}
              </span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Channel Status (bottom) */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 text-sm text-slate-500">
            <span className="size-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-medium">WhatsApp</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 text-sm text-slate-500">
            <span className="size-2 rounded-full bg-blue-500"></span>
            <span className="text-xs font-medium">Messenger</span>
          </div>
        </div>
      )}
    </aside>
  );
}
