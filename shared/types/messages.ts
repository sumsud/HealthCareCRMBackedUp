export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  subject?: string;
  content: string;
  isRead: boolean;
  isPatientMessage: boolean;
  patientId?: number;
  isEncrypted: boolean;
  createdAt: Date;
  readAt?: Date;
  isArchived: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  threadId?: string;
  
  // Expanded properties
  sender?: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  recipient?: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  patient?: {
    id: number;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  messageId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  isEncrypted: boolean;
  uploadedAt: Date;
  uploadedBy: number;
}

export interface MessageState {
  messages: Message[];
  currentThread: Message[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  totalMessages: number;
  page: number;
  limit: number;
}

export interface CreateMessageRequest {
  recipientId: number;
  subject?: string;
  content: string;
  isPatientMessage?: boolean;
  patientId?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  threadId?: string;
  attachments?: File[];
}

export interface ReplyMessageRequest {
  threadId: string;
  content: string;
  attachments?: File[];
}

export interface MarkMessageAsReadRequest {
  id: number;
}

export interface ArchiveMessageRequest {
  id: number;
}

export interface FilterMessagesRequest {
  senderId?: number;
  recipientId?: number;
  patientId?: number;
  isRead?: boolean;
  isArchived?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  startDate?: Date;
  endDate?: Date;
  search?: string;
  threadId?: string;
  page?: number;
  limit?: number;
}

export interface MessageStats {
  unread: number;
  urgent: number;
  threads: number;
}

export interface Conversation {
  threadId: string;
  participants: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }[];
  lastMessage: {
    content: string;
    createdAt: Date;
    senderId: number;
  };
  unreadCount: number;
  patientId?: number;
  patient?: {
    id: number;
    patientId: string;
    firstName: string;
    lastName: string;
  };
}
