import type {
  ChatwootAgent,
  ChatwootContact,
  ChatwootConversation,
  ChatwootMessage,
  ChatwootInbox,
  ChatwootLabel,
} from './types';
import type { User, Contact, Conversation, Message, Channel, Label } from '@/lib/types';

const LABEL_COLORS: Record<string, string> = {
  vip: '#f59e0b',
  pme: '#2563eb',
  urgent: '#ef4444',
  prospect: '#10b981',
  suivi: '#8b5cf6',
};

// ── Rôle ──
export function mapChatwootRole(agent: ChatwootAgent): 'patron' | 'commercial' | 'admin' {
  if (agent.role === 'administrator') {
    return agent.custom_attributes?.crm_role === 'admin' ? 'admin' : 'patron';
  }
  return 'commercial';
}

// ── Agent → User ──
export function transformAgent(agent: ChatwootAgent): User {
  return {
    id: String(agent.id),
    name: agent.name,
    email: agent.email,
    role: mapChatwootRole(agent),
    avatarUrl: agent.thumbnail || undefined,
    isActive: agent.availability_status !== 'offline',
  };
}

// ── Contact ──
export function transformContact(contact: ChatwootContact, labels: Label[] = []): Contact {
  const labelMap = new Map(labels.map((l) => [l.name.toLowerCase(), l]));
  const resolvedLabels = (contact.labels || [])
    .map((name) => labelMap.get(name.toLowerCase()) || { id: name, name, color: LABEL_COLORS[name.toLowerCase()] || '#6b7280' })
    .filter(Boolean) as Label[];

  return {
    id: String(contact.id),
    name: contact.name,
    phone: contact.phone_number || '',
    email: contact.email || undefined,
    avatarUrl: contact.thumbnail || undefined,
    company: contact.custom_attributes?.company,
    title: contact.custom_attributes?.title,
    channels: [],
    labels: resolvedLabels,
    intention: undefined,
    conversationCount: 0,
    firstContact: formatDate(contact.created_at),
    lastActivity: formatRelative(contact.last_activity_at),
  };
}

// ── Conversation ──
export function transformConversation(
  conv: ChatwootConversation,
  inboxMap: Map<number, Channel>,
  labels: Label[] = []
): Conversation {
  const labelMap = new Map(labels.map((l) => [l.name.toLowerCase(), l]));
  return {
    id: String(conv.id),
    contact: {
      id: String(conv.meta.sender.id),
      name: conv.meta.sender.name,
      phone: conv.meta.sender.phone_number || '',
      avatarUrl: conv.meta.sender.thumbnail || undefined,
      channels: [],
      labels: [],
      conversationCount: 0,
      firstContact: '',
      lastActivity: '',
    },
    channel: inboxMap.get(conv.inbox_id) || 'messenger',
    status: mapConvStatus(conv),
    lastMessage: conv.last_non_activity_message?.content || '',
    lastMessageAt: formatRelative(conv.last_activity_at),
    unreadCount: conv.unread_count,
    assignedTo: conv.meta.assignee ? transformAgent(conv.meta.assignee as ChatwootAgent) : undefined,
    labels: (conv.labels || []).map(
      (name) => labelMap.get(name.toLowerCase()) || { id: name, name, color: LABEL_COLORS[name.toLowerCase()] || '#6b7280' }
    ) as Label[],
    priority: conv.priority === 'none' ? undefined : conv.priority,
  };
}

function mapConvStatus(conv: ChatwootConversation): 'active' | 'pending' | 'resolved' | 'unattended' {
  if (conv.status === 'resolved') return 'resolved';
  if (conv.status === 'pending') return 'pending';
  if (conv.status === 'open' && conv.waiting_since) {
    const waitMinutes = (Date.now() / 1000 - conv.waiting_since) / 60;
    if (waitMinutes > 15) return 'unattended';
  }
  return 'active';
}

// ── Message ──
export function transformMessage(msg: ChatwootMessage): Message {
  const attachment = msg.attachments?.[0];
  return {
    id: String(msg.id),
    type: deriveMessageType(msg),
    content: msg.content || '',
    sender: msg.message_type === 0 ? 'client' : 'commercial',
    senderName: msg.sender?.name || '',
    timestamp: new Date(msg.created_at * 1000).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: msg.status,
    fileUrl: attachment?.data_url,
    fileName: attachment?.file_name,
    fileSize: attachment ? formatFileSize(attachment.file_size) : undefined,
    imageUrl: attachment?.file_type === 'image' ? attachment.data_url : undefined,
  };
}

function deriveMessageType(msg: ChatwootMessage): 'text' | 'image' | 'voice' | 'video' | 'document' {
  if (!msg.attachments?.length) return 'text';
  switch (msg.attachments[0].file_type) {
    case 'image': return 'image';
    case 'audio': return 'voice';
    case 'video': return 'video';
    case 'file': return 'document';
    default: return 'text';
  }
}

// ── Inbox → Channel ──
export function mapInboxToChannel(inbox: ChatwootInbox): Channel {
  switch (inbox.channel_type) {
    case 'Channel::Whatsapp': return 'whatsapp';
    case 'Channel::FacebookPage': return inbox.name?.toLowerCase().includes('messenger') ? 'messenger' : 'facebook';
    default: return 'messenger';
  }
}

// ── Label ──
export function transformLabel(label: ChatwootLabel): Label {
  return {
    id: String(label.id),
    name: label.title,
    color: LABEL_COLORS[label.title.toLowerCase()] || '#6b7280',
  };
}

// ── Helpers ──
function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function formatRelative(iso: string): string {
  if (!iso) return '';
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400)
      return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch { return iso; }
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
}
