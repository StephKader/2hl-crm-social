import { Intention, Label, NavItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard", roles: ["admin", "patron"] },
  { icon: "chat_bubble", label: "Conversations", href: "/conversations", roles: ["admin", "patron", "commercial"] },
  { icon: "group", label: "Contacts", href: "/contacts", roles: ["admin", "patron", "commercial"] },
  { icon: "label", label: "Catégories", href: "/categories", roles: ["admin", "patron"] },
  { icon: "bar_chart", label: "Rapports", href: "/reports", roles: ["admin", "patron"] },
  { icon: "settings", label: "Paramètres", href: "/settings", roles: ["admin"] },
];

export const DEFAULT_INTENTIONS: Intention[] = [
  { id: "1", name: "Création d'entreprise", color: "#10b981", icon: "business", description: "Accompagnement à la création d'entreprise" },
  { id: "2", name: "Conseil fiscal", color: "#3b82f6", icon: "account_balance", description: "Questions fiscales et comptables" },
  { id: "3", name: "Réclamation", color: "#ef4444", icon: "warning", description: "Plainte ou insatisfaction" },
  { id: "4", name: "Audit comptable", color: "#f59e0b", icon: "fact_check", description: "Demande d'audit ou vérification comptable" },
  { id: "5", name: "Partenariat", color: "#8b5cf6", icon: "handshake", description: "Proposition de collaboration" },
  { id: "6", name: "Autre", color: "#6b7280", icon: "more_horiz", description: "Non catégorisé" },
];

export const DEFAULT_LABELS: Label[] = [
  { id: "1", name: "VIP", color: "#f59e0b" },
  { id: "2", name: "PME", color: "#2563eb" },
  { id: "3", name: "Urgent", color: "#ef4444" },
  { id: "4", name: "ONG", color: "#10b981" },
  { id: "5", name: "Entreprise", color: "#8b5cf6" },
  { id: "6", name: "Particulier", color: "#6b7280" },
  { id: "7", name: "Relancer", color: "#f97316" },
];

export const CHANNEL_CONFIG = {
  whatsapp: { label: "WhatsApp", color: "#22c55e", icon: "chat", bgClass: "bg-green-100 dark:bg-green-900/30 text-green-600" },
  messenger: { label: "Messenger", color: "#3b82f6", icon: "message", bgClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  facebook: { label: "Facebook", color: "#1d4ed8", icon: "thumb_up", bgClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-700" },
} as const;

export const STATUS_CONFIG = {
  active: { label: "Active", color: "#22c55e", dotClass: "bg-green-500" },
  pending: { label: "En attente", color: "#94a3b8", dotClass: "bg-slate-400" },
  resolved: { label: "Résolue", color: "#3b82f6", dotClass: "bg-blue-500" },
  unattended: { label: "Sans réponse", color: "#f97316", dotClass: "bg-orange-500" },
} as const;
