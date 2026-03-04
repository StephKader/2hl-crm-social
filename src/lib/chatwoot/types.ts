// Types bruts des réponses Chatwoot (avant transformation)

export interface ChatwootAgent {
  id: number;
  name: string;
  email: string;
  role: 'agent' | 'administrator';
  thumbnail: string;
  availability_status: 'online' | 'offline' | 'busy';
  custom_attributes?: {
    crm_role?: 'patron' | 'admin';
    [key: string]: unknown;
  };
}

export interface ChatwootContact {
  id: number;
  name: string;
  phone_number: string;
  email: string | null;
  thumbnail: string;
  created_at: string;
  last_activity_at: string;
  labels: string[];
  custom_attributes?: {
    company?: string;
    title?: string;
    intention?: string;
    [key: string]: unknown;
  };
}

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: 0 | 1 | 2; // 0=incoming, 1=outgoing, 2=activity
  created_at: number; // epoch Unix
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  private: boolean;
  content_type: string;
  sender: {
    id: number;
    name: string;
    thumbnail: string;
    type: 'contact' | 'agent';
  };
  attachments?: {
    id: number;
    file_type: 'image' | 'audio' | 'video' | 'file';
    data_url: string;
    file_name: string;
    file_size: number;
  }[];
}

export interface ChatwootConversation {
  id: number;
  status: 'open' | 'resolved' | 'pending' | 'snoozed';
  unread_count: number;
  last_activity_at: string;
  waiting_since?: number;
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  inbox_id: number;
  meta: {
    sender: {
      id: number;
      name: string;
      thumbnail: string;
      phone_number: string;
    };
    assignee?: ChatwootAgent;
    channel: string;
  };
  last_non_activity_message?: {
    content: string;
  };
  custom_attributes?: {
    intention?: string;
    ai_summary?: string;
    [key: string]: unknown;
  };
  labels: string[];
}

export interface ChatwootInbox {
  id: number;
  name: string;
  channel_type: string;
  phone_number?: string;
  working_hours_enabled: boolean;
}

export interface ChatwootLabel {
  id: number;
  title: string;
  description: string;
  color?: string;
  show_on_sidebar: boolean;
}

export interface ChatwootAuthResponse {
  data: {
    access_token: string;
    account_id: number;
    pubsub_token: string;
    name: string;
    email: string;
    role: 'agent' | 'administrator';
    thumbnail: string;
    custom_attributes?: {
      crm_role?: 'patron' | 'admin';
    };
  };
}

export interface ChatwootSessionUser {
  id: number;
  name: string;
  email: string;
  role: 'patron' | 'commercial' | 'admin';
  avatarUrl?: string;
  accessToken: string;
  pubsubToken: string;
  accountId: number;
}
