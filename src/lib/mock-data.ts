import {
  User, Contact, Conversation, Message, DashboardMetrics,
  AgentPerformance, IntentDistribution, ActivityEvent, InternalNote,
} from "./types";
import { DEFAULT_INTENTIONS, DEFAULT_LABELS } from "./constants";

// ── Users ──
export const MOCK_USERS: User[] = [
  { id: "u1", name: "Aminata Diallo", email: "aminata@2hlgroup.com", role: "patron", avatarUrl: "/avatars/aminata.jpg", isActive: true },
  { id: "u2", name: "Ousmane Kaboré", email: "ousmane@2hlgroup.com", role: "commercial", avatarUrl: "/avatars/ousmane.jpg", isActive: true },
  { id: "u3", name: "Mariam Sanou", email: "mariam@2hlgroup.com", role: "commercial", avatarUrl: "/avatars/mariam.jpg", isActive: true },
  { id: "u4", name: "Abdoulaye Ouédraogo", email: "abdoulaye@2hlgroup.com", role: "commercial", avatarUrl: "/avatars/abdoulaye.jpg", isActive: true },
  { id: "u5", name: "Fatoumata Compaoré", email: "fatoumata@2hlgroup.com", role: "admin", avatarUrl: "/avatars/fatoumata.jpg", isActive: true },
];

export const CURRENT_USER = MOCK_USERS[0]; // Aminata (Patron)

// ── Contacts ──
export const MOCK_CONTACTS: Contact[] = [
  {
    id: "c1", name: "Issouf Kaboré", phone: "+226 70 11 22 33", email: "issouf@kabore-fils.bf",
    avatarUrl: "/avatars/contact-issouf.jpg", company: "Kaboré & Fils SARL", title: "Gérant",
    channels: ["whatsapp", "messenger"], labels: [DEFAULT_LABELS[1], DEFAULT_LABELS[2]],
    intention: DEFAULT_INTENTIONS[0], assignedTo: MOCK_USERS[1],
    conversationCount: 5, firstContact: "2024-01-15", lastActivity: "il y a 5 min",
  },
  {
    id: "c2", name: "Adama Zongo", phone: "+226 76 22 33 44", email: "adama@zongo-consulting.bf",
    avatarUrl: "/avatars/contact-adama.jpg", company: "Zongo Consulting", title: "Directrice",
    channels: ["messenger"], labels: [DEFAULT_LABELS[0]],
    intention: DEFAULT_INTENTIONS[1], assignedTo: MOCK_USERS[2],
    conversationCount: 3, firstContact: "2024-03-20", lastActivity: "Hier",
  },
  {
    id: "c3", name: "Boukary Sawadogo", phone: "+226 78 33 44 55",
    avatarUrl: "/avatars/contact-boukary.jpg", company: "Sawadogo Import-Export", title: "Responsable Comptable",
    channels: ["whatsapp"], labels: [DEFAULT_LABELS[4]],
    intention: DEFAULT_INTENTIONS[3], assignedTo: MOCK_USERS[3],
    conversationCount: 8, firstContact: "2023-11-05", lastActivity: "08:22",
  },
  {
    id: "c4", name: "Rasmata Tiendrebéogo", phone: "+226 70 44 55 66", email: "rasmata@tiendrebeogo-ent.bf",
    avatarUrl: "/avatars/contact-rasmata.jpg", company: "Tiendrebéogo Enterprise", title: "Directrice Générale",
    channels: ["whatsapp", "messenger"], labels: [DEFAULT_LABELS[1]],
    intention: DEFAULT_INTENTIONS[0], assignedTo: MOCK_USERS[1],
    conversationCount: 2, firstContact: "2024-06-01", lastActivity: "14:32",
  },
  {
    id: "c5", name: "Hamidou Diallo", phone: "+226 76 55 66 77", email: "hamidou@diallo-services.bf",
    avatarUrl: "/avatars/contact-hamidou.jpg", company: "Diallo Services BF", title: "Fondateur",
    channels: ["messenger"], labels: [],
    intention: DEFAULT_INTENTIONS[3], assignedTo: MOCK_USERS[2],
    conversationCount: 1, firstContact: "2024-07-10", lastActivity: "10:15",
  },
  {
    id: "c6", name: "Fatou Ouédraogo", phone: "+226 70 12 34 56", email: "fatou@ongafrique.org",
    avatarUrl: "/avatars/contact-fatou.jpg", company: "ONG Afrique Solidaire", title: "Coordinatrice",
    channels: ["whatsapp"], labels: [DEFAULT_LABELS[3], DEFAULT_LABELS[0]],
    intention: DEFAULT_INTENTIONS[4], assignedTo: MOCK_USERS[3],
    conversationCount: 4, firstContact: "2024-02-14", lastActivity: "il y a 2h",
  },
  {
    id: "c7", name: "Salif Bamba", phone: "+226 78 66 77 88",
    company: "Consultant Indépendant", title: "Consultant Fiscal",
    channels: ["whatsapp"], labels: [DEFAULT_LABELS[5]],
    intention: DEFAULT_INTENTIONS[1],
    conversationCount: 1, firstContact: "2024-07-20", lastActivity: "Hier",
  },
  {
    id: "c8", name: "Aïssata Ouattara", phone: "+226 70 77 88 99", email: "aissata@ouattara-distrib.bf",
    avatarUrl: "/avatars/contact-aissata.jpg", company: "Ouattara Distribution", title: "Resp. Marketing",
    channels: ["messenger", "facebook"], labels: [DEFAULT_LABELS[4]],
    intention: DEFAULT_INTENTIONS[1], assignedTo: MOCK_USERS[1],
    conversationCount: 6, firstContact: "2023-09-01", lastActivity: "Mar",
  },
  {
    id: "c9", name: "Ibrahim Traoré", phone: "+226 71 08 09 10", email: "ibrahim@traore-tech.bf",
    avatarUrl: "/avatars/contact-ibrahim.jpg", company: "Traoré Technologies", title: "Directeur Technique",
    channels: ["whatsapp", "messenger"], labels: [DEFAULT_LABELS[1], DEFAULT_LABELS[6]],
    intention: DEFAULT_INTENTIONS[0], assignedTo: MOCK_USERS[2],
    conversationCount: 3, firstContact: "2024-04-18", lastActivity: "il y a 3h",
  },
  {
    id: "c10", name: "Moussa Traoré", phone: "+226 76 12 34 56",
    company: "Traoré Import-Export", title: "Gérant",
    channels: ["whatsapp"], labels: [DEFAULT_LABELS[4], DEFAULT_LABELS[2]],
    intention: DEFAULT_INTENTIONS[2], assignedTo: MOCK_USERS[3],
    conversationCount: 7, firstContact: "2023-06-12", lastActivity: "il y a 30 min",
  },
];

// ── Messages pour la conversation d'Issouf Kaboré ──
const ISSOUF_MESSAGES: Message[] = [
  {
    id: "m1", type: "text", content: "Bonjour, je souhaiterais avoir des informations sur la création d'entreprise au Burkina Faso.",
    sender: "client", senderName: "Issouf Kaboré", timestamp: "10:45", status: "read",
  },
  {
    id: "m2", type: "text", content: "Bonjour Issouf ! Bien sûr, je vous envoie notre grille tarifaire pour les services de création d'entreprise.",
    sender: "commercial", senderName: "Aminata Diallo", timestamp: "10:46", status: "read",
  },
  {
    id: "m3", type: "document", content: "", sender: "commercial", senderName: "Aminata Diallo",
    timestamp: "10:47", status: "delivered",
    fileName: "Tarifs_2HL_2025.pdf", fileSize: "1.2 MB",
  },
  {
    id: "m4", type: "image", content: "C'est ce type d'agrément qui nous intéresse particulièrement.",
    sender: "client", senderName: "Issouf Kaboré", timestamp: "10:50", status: "read",
    imageUrl: "/mock/screenshot-module.jpg",
  },
  {
    id: "m5", type: "voice", content: "", sender: "commercial", senderName: "Aminata Diallo",
    timestamp: "10:52", status: "delivered", duration: "0:24",
  },
];

// ── Conversations ──
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1", contact: MOCK_CONTACTS[0], channel: "whatsapp", status: "active",
    lastMessage: "C'est ce type d'agrément qui nous intéresse particulièrement.",
    lastMessageAt: "10:50", unreadCount: 0, assignedTo: MOCK_USERS[1],
    intention: DEFAULT_INTENTIONS[0], messages: ISSOUF_MESSAGES,
    aiSummary: "Le client est le gérant de Kaboré & Fils SARL. Intérêt marqué pour la création d'une filiale. A déjà reçu la grille tarifaire. Point bloquant : besoin de clarification sur les agréments nécessaires.",
    priority: "high",
  },
  {
    id: "conv2", contact: MOCK_CONTACTS[3], channel: "whatsapp", status: "active",
    lastMessage: "Est-ce que vos services incluent l'immatriculation au RCCM ?",
    lastMessageAt: "14:32", unreadCount: 3, assignedTo: MOCK_USERS[1],
    intention: DEFAULT_INTENTIONS[0], messages: [],
    aiSummary: "La cliente souhaite créer une nouvelle entreprise et s'intéresse aux formalités RCCM. Potentiel élevé.",
  },
  {
    id: "conv3", contact: MOCK_CONTACTS[4], channel: "messenger", status: "unattended",
    lastMessage: "Pouvez-vous m'aider avec ma déclaration fiscale annuelle ?",
    lastMessageAt: "10:15", unreadCount: 0, assignedTo: MOCK_USERS[2],
    intention: DEFAULT_INTENTIONS[3], messages: [],
  },
  {
    id: "conv4", contact: MOCK_CONTACTS[6], channel: "whatsapp", status: "pending",
    lastMessage: "En attente des documents pour finaliser le dossier...",
    lastMessageAt: "Hier", unreadCount: 0,
    intention: DEFAULT_INTENTIONS[1], messages: [],
  },
  {
    id: "conv5", contact: MOCK_CONTACTS[7], channel: "messenger", status: "resolved",
    lastMessage: "Merci pour la rapidité du traitement de notre dossier !",
    lastMessageAt: "Mar", unreadCount: 0, assignedTo: MOCK_USERS[1],
    intention: DEFAULT_INTENTIONS[1], messages: [],
  },
  {
    id: "conv6", contact: MOCK_CONTACTS[1], channel: "messenger", status: "active",
    lastMessage: "Merci pour votre retour rapide sur notre situation fiscale !",
    lastMessageAt: "Hier", unreadCount: 0, assignedTo: MOCK_USERS[2],
    intention: DEFAULT_INTENTIONS[1], messages: [],
  },
  {
    id: "conv7", contact: MOCK_CONTACTS[2], channel: "whatsapp", status: "active",
    lastMessage: "Vocal envoyé • 0:15",
    lastMessageAt: "08:22", unreadCount: 1, assignedTo: MOCK_USERS[3],
    intention: DEFAULT_INTENTIONS[3], messages: [],
  },
  {
    id: "conv8", contact: MOCK_CONTACTS[9], channel: "whatsapp", status: "unattended",
    lastMessage: "Je n'ai toujours pas reçu mon attestation fiscale !",
    lastMessageAt: "il y a 30 min", unreadCount: 2, assignedTo: MOCK_USERS[3],
    intention: DEFAULT_INTENTIONS[2], messages: [],
    priority: "urgent",
  },
  {
    id: "conv9", contact: MOCK_CONTACTS[5], channel: "whatsapp", status: "active",
    lastMessage: "Nous souhaitons discuter d'un partenariat pour l'Afrique de l'Ouest.",
    lastMessageAt: "il y a 2h", unreadCount: 0, assignedTo: MOCK_USERS[3],
    intention: DEFAULT_INTENTIONS[4], messages: [],
  },
  {
    id: "conv10", contact: MOCK_CONTACTS[8], channel: "messenger", status: "active",
    lastMessage: "Merci, je vous envoie les documents comptables du trimestre.",
    lastMessageAt: "il y a 3h", unreadCount: 0, assignedTo: MOCK_USERS[2],
    intention: DEFAULT_INTENTIONS[0], messages: [],
  },
];

// ── Dashboard ──
export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  activeConversations: 1284,
  activeConversationsTrend: 12.5,
  newContacts: 156,
  newContactsTrend: -5.2,
  avgResponseTime: "4m 32s",
  avgResponseTimeTrend: 8.1,
  noResponseAlerts: 12,
};

export const MOCK_AGENT_PERFORMANCE: AgentPerformance[] = [
  { agent: MOCK_USERS[1], activeConversations: 42, avgResponseTime: "2m 15s", targetProgress: 85 },
  { agent: MOCK_USERS[2], activeConversations: 38, avgResponseTime: "3m 45s", targetProgress: 72 },
  { agent: MOCK_USERS[3], activeConversations: 31, avgResponseTime: "4m 02s", targetProgress: 60 },
  { agent: MOCK_USERS[4], activeConversations: 25, avgResponseTime: "5m 30s", targetProgress: 45 },
];

export const MOCK_INTENT_DISTRIBUTION: IntentDistribution[] = [
  { name: "Création", value: 45, color: "#2563eb" },
  { name: "Fiscal", value: 30, color: "#10b981" },
  { name: "Réclamation", value: 15, color: "#f59e0b" },
  { name: "Audit", value: 10, color: "#ef4444" },
];

export const MOCK_ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: "e1", type: "broadcast", title: "Nouvelle diffusion programmée",
    description: "Campagne \"Offre Création Entreprise 2025\" mise en file pour 5 000 destinataires.",
    timestamp: "il y a 2 min", icon: "campaign",
    iconBgColor: "bg-primary/10", iconColor: "text-primary",
  },
  {
    id: "e2", type: "alert", title: "Seuil de réponse dépassé",
    description: "Le service Conseil Fiscal a 12 tickets en attente depuis plus de 15 minutes.",
    timestamp: "il y a 45 min", icon: "warning",
    iconBgColor: "bg-rose-500/10", iconColor: "text-rose-500",
  },
  {
    id: "e3", type: "team", title: "Nouvel administrateur ajouté",
    description: "Fatoumata Compaoré a été ajoutée comme Administratrice dans l'équipe 2HL Group.",
    timestamp: "il y a 2h", icon: "person",
    iconBgColor: "bg-blue-500/10", iconColor: "text-blue-500",
  },
];

export const MOCK_INTERNAL_NOTES: InternalNote[] = [
  { id: "n1", content: "Vérifier les documents RCCM avant le prochain appel.", author: "Mariam", createdAt: "Hier" },
];
