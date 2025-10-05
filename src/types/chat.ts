// Interface untuk pesan chat
export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant' | 'system';
  status: 'sending' | 'sent' | 'error';
}

// Interface untuk state chat global
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
}

// Interface untuk response API
export interface ChatResponse {
  success: boolean;
  message?: string;
  data?: {
    response: string;
    timestamp: string;
  };
  error?: string;
}

// Interface untuk request ke n8n webhook
export interface WebhookRequest {
  message: string;
  timestamp: string;
  sessionId?: string;
  metadata?: {
    userAgent: string;
    platform: string;
  };
}

// Interface untuk error response
export interface ErrorResponse {
  error: string;
  code: string;
  details?: string;
  timestamp: string;
}

// Interface untuk props komponen
export interface ChatInterfaceProps {
  initialMessages?: Message[];
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

// Interface untuk PWA
export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Interface untuk Error Boundary
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
