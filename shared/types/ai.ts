export interface AIState {
  chatSessions: AIChatSession[];
  currentSession: AIChatSession | null;
  messages: AIChatMessage[];
  loading: boolean;
  error: string | null;
}

export interface AIChatSession {
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: AIChatMessage[];
}

export interface AIChatMessage {
  id: number;
  sessionId: number;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export interface CreateChatSessionRequest {
  title: string;
}

export interface UpdateChatSessionRequest {
  id: number;
  title: string;
}

export interface DeleteChatSessionRequest {
  id: number;
}

export interface SendChatMessageRequest {
  sessionId: number;
  content: string;
}

export interface AIAssistantResponse {
  message: string;
  sources?: {
    title: string;
    url: string;
  }[];
  intent?: string;
  suggestions?: string[];
}

export interface ClinicalQueryRequest {
  query: string;
  patientId?: number;
  patientContext?: boolean;
}

export interface CodeAssistanceRequest {
  query: string;
  codeType: 'icd' | 'cpt' | 'diagnosis' | 'procedure';
}

export interface CodeAssistanceResponse {
  code: string;
  description: string;
  confidenceScore: number;
  alternatives?: {
    code: string;
    description: string;
    confidenceScore: number;
  }[];
}

export interface NoteGenerationRequest {
  appointmentId: number;
  patientId: number;
  noteType: string;
  symptoms?: string[];
  observations?: string;
  diagnosis?: string[];
  treatments?: string[];
}

export interface NoteGenerationResponse {
  title: string;
  content: string;
  suggestedCodes: {
    type: 'icd' | 'cpt';
    code: string;
    description: string;
  }[];
}
