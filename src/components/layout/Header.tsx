"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { Role } from "@/lib/types";
import { MOCK_CONVERSATIONS, MOCK_CONTACTS } from "@/lib/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchResult {
  type: "conversation" | "contact";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
}

export function Header() {
  const router = useRouter();
  const { user, setRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const roleLabels: Record<Role, string> = {
    admin: "Administrateur",
    patron: "Patron",
    commercial: "Commercial",
  };

  // Search results
  const results: SearchResult[] = searchQuery.trim().length >= 2
    ? [
        ...MOCK_CONVERSATIONS
          .filter((c) =>
            c.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 3)
          .map((c) => ({
            type: "conversation" as const,
            id: c.id,
            title: c.contact.name,
            subtitle: c.lastMessage.substring(0, 50) + (c.lastMessage.length > 50 ? "..." : ""),
            href: `/conversations/${c.id}`,
            icon: "chat_bubble",
          })),
        ...MOCK_CONTACTS
          .filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery) ||
            (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .slice(0, 3)
          .map((c) => ({
            type: "contact" as const,
            id: c.id,
            title: c.name,
            subtitle: c.phone + (c.company ? ` · ${c.company}` : ""),
            href: "/contacts",
            icon: "person",
          })),
      ]
    : [];

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = useCallback((href: string) => {
    setSearchQuery("");
    setShowResults(false);
    router.push(href);
  }, [router]);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div ref={searchRef} className="relative w-full max-w-md hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            ref={inputRef}
            className="w-full pl-10 pr-16 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder="Rechercher..."
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            onKeyDown={(e) => { if (e.key === "Escape") { setShowResults(false); inputRef.current?.blur(); } }}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-mono">
            ⌘K
          </kbd>

          {/* Search Results Dropdown */}
          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-lg text-slate-400">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">
                    {result.type === "conversation" ? "Conv." : "Contact"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {showResults && searchQuery.trim().length >= 2 && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 p-6 text-center">
              <span className="material-symbols-outlined text-3xl text-slate-300 mb-2 block">search_off</span>
              <p className="text-sm text-slate-500">Aucun résultat pour &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
          title={theme === "dark" ? "Mode clair" : "Mode sombre"}
        >
          <span className="material-symbols-outlined">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Notifications"
              title="Notifications"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <p className="text-sm font-medium">Nouveau message de Issouf Kaboré</p>
              <p className="text-xs text-slate-500">il y a 5 min</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <p className="text-sm font-medium">12 tickets en attente depuis 15 min</p>
              <p className="text-xs text-slate-500">il y a 45 min</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <p className="text-sm font-medium">Moussa Traoré — réclamation urgente</p>
              <p className="text-xs text-slate-500">il y a 30 min</p>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-primary text-sm font-medium justify-center">
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{user.name}</p>
                <p className="text-xs text-slate-500">{roleLabels[user.role]}</p>
              </div>
              <div className="size-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-sm">
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <span className="material-symbols-outlined text-lg mr-2">person</span>
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Changer de rôle (démo)
            </DropdownMenuLabel>
            {(["patron", "commercial", "admin"] as Role[]).map((role) => (
              <DropdownMenuItem key={role} onClick={() => setRole(role)}>
                <span className={`size-2 rounded-full mr-2 ${user.role === role ? "bg-primary" : "bg-slate-300"}`}></span>
                {roleLabels[role]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={() => router.push("/login")}>
              <span className="material-symbols-outlined text-lg mr-2">logout</span>
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
