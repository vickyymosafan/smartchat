'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ChatState, Message } from '@/types/chat';

/**
 * Interface untuk ChatContext
 */
interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

/**
 * Actions untuk ChatReducer
 */
type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { messageId: string; status: Message['status'] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'LOAD_MESSAGES'; payload: Message[] };

/**
 * Initial state untuk chat
 */
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  isOnline: true,
};

/**
 * Reducer untuk mengelola state chat
 */
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };

    case 'UPDATE_MESSAGE_STATUS':
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.messageId
            ? { ...message, status: action.payload.status }
            : message
        ),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      };

    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
        error: null,
      };

    case 'LOAD_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };

    default:
      return state;
  }
}

/**
 * Context untuk chat state
 */
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Props untuk ChatProvider
 */
interface ChatProviderProps {
  children: ReactNode;
  initialMessages?: Message[];
}

/**
 * Provider untuk ChatContext
 * Mengelola state global chat dan local storage persistence
 */
export function ChatProvider({ children, initialMessages = [] }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    messages: initialMessages,
  });

  /**
   * Generate unique ID untuk pesan
   */
  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Load messages dari local storage saat komponen mount
   */
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chat_messages');
      if (savedMessages) {
        const parsedMessages: Message[] = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        dispatch({ type: 'LOAD_MESSAGES', payload: parsedMessages });
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }
  }, []);

  /**
   * Save messages ke local storage setiap kali messages berubah
   */
  useEffect(() => {
    try {
      localStorage.setItem('chat_messages', JSON.stringify(state.messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }, [state.messages]);

  /**
   * Monitor online/offline status
   */
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    dispatch({ type: 'SET_ONLINE_STATUS', payload: navigator.onLine });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Helper function untuk menambah pesan baru
   */
  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
  };

  /**
   * Helper function untuk update status pesan
   */
  const updateMessageStatus = (messageId: string, status: Message['status']) => {
    dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { messageId, status } });
  };

  /**
   * Helper function untuk set loading state
   */
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  /**
   * Helper function untuk set error state
   */
  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  /**
   * Helper function untuk clear semua pesan
   */
  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
    try {
      localStorage.removeItem('chat_messages');
    } catch (error) {
      console.error('Error clearing messages from localStorage:', error);
    }
  };

  const contextValue: ChatContextType = {
    state,
    dispatch,
    addMessage,
    updateMessageStatus,
    setLoading,
    setError,
    clearMessages,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

/**
 * Hook untuk menggunakan ChatContext
 */
export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

/**
 * Hook untuk menggunakan chat state saja
 */
export function useChatState(): ChatState {
  const { state } = useChatContext();
  return state;
}

/**
 * Hook untuk menggunakan chat actions saja
 */
export function useChatActions() {
  const { addMessage, updateMessageStatus, setLoading, setError, clearMessages } = useChatContext();
  return {
    addMessage,
    updateMessageStatus,
    setLoading,
    setError,
    clearMessages,
  };
}