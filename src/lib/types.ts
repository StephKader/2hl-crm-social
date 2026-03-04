export type Role = "admin" | "patron" | "commercial";

export type Channel = "whatsapp" | "messenger" | "facebook";

export type ConversationStatus = "active" | "pending" | "resolved" | "unattended";

export type MessageType = "text" | "image" | "voice" | "document" | "video";

export type Priority = "low" | "normal" | "high" | "urgent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  isActive: boolean;
}

export interface Intention {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  company?: string;
  title?: string;
  channels: Channel[];
  labels: Label[];
  intention?: Intention;
  assignedTo?: User;
  conversationCount: number;
  firstContact: string;
  lastActivity: string;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  sender: "client" | "commercial";
  senderName: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: string;
  transcription?: string;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  channel: Channel;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  assignedTo?: User;
  intention?: Intention;
  messages: Message[];
  aiSummary?: string;
  priority?: Priority;
}

export interface DashboardMetrics {
  activeConversations: number;
  activeConversationsTrend: number;
  newContacts: number;
  newContactsTrend: number;
  avgResponseTime: string;
  avgResponseTimeTrend: number;
  noResponseAlerts: number;
}

export interface AgentPerformance {
  agent: User;
  activeConversations: number;
  avgResponseTime: string;
  targetProgress: number;
}

export interface IntentDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ActivityEvent {
  id: string;
  type: "broadcast" | "alert" | "team" | "conversation";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export interface InternalNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface NavItem {
  icon: string;
  label: string;
  href: string;
  roles: Role[];
}
