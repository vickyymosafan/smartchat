'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { ChatState, Message } from '@/types/chat';
import { generateMessageId } from '@/lib/utils';
import { saveUIState, loadUIState } from '@/lib/storage';

/**
 * Interface untuk ChatContext
 */
interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  addMessage: (message: Omit<Message, 'id'>) => string;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

/**
 * Actions untuk ChatReducer
 */
type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'LOAD_MESSAGES'; payload: Message[] };

/**
 * Initial state untuk chat
 */
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  isOnline: true, // Note: This is managed by useOnlineStatus hook in components
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
export function ChatProvider({
  children,
  initialMessages = [],
}: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    messages: initialMessages,
  });

  /**
   * Load messages dari storage saat komponen mount
   */
  useEffect(() => {
    const uiState = loadUIState();
    if (uiState.chatMessages) {
      dispatch({ type: 'LOAD_MESSAGES', payload: uiState.chatMessages });
    }
  }, []);

  /**
   * Save messages ke storage setiap kali messages berubah
   */
  useEffect(() => {
    saveUIState({ chatMessages: state.messages });
  }, [state.messages]);

  /**
   * Helper function untuk menambah pesan baru
   * Returns the ID of the newly created message
   */
  const addMessage = (message: Omit<Message, 'id'>): string => {
    const messageId = generateMessageId();
    const newMessage: Message = {
      ...message,
      id: messageId,
    };
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    return messageId;
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
    saveUIState({ chatMessages: [] });
  };

  const contextValue: ChatContextType = {
    state,
    dispatch,
    addMessage,
    setLoading,
    setError,
    clearMessages,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
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
  const { addMessage, setLoading, setError, clearMessages } = useChatContext();
  return {
    addMessage,
    setLoading,
    setError,
    clearMessages,
  };
}
