export type Locale = 'id' | 'en';

export interface Dictionary {
  common: {
    send: string;
    cancel: string;
    close: string;
    save: string;
    delete: string;
    edit: string;
    copy: string;
    copied: string;
    loading: string;
    error: string;
    retry: string;
    online: string;
    offline: string;
  };
  chat: {
    emptyState: {
      title: string;
      description: string;
      keyboardHint: string;
    };
    composer: {
      placeholder: string;
      send: string;
      enterToSend: string;
      shiftEnterNewLine: string;
      characterCount: string;
      offlineMessage: string;
      maxLengthError: string;
    };
    message: {
      copy: string;
      regenerate: string;
      thumbsUp: string;
      thumbsDown: string;
      sending: string;
      sent: string;
      failed: string;
      retry: string;
    };
    typing: string;
    scrollToBottom: string;
    newMessages: string;
  };
  topBar: {
    title: string;
    settings: string;
    toggleSidebar: string;
    status: {
      online: string;
      offline: string;
    };
  };
  theme: {
    toggle: string;
    light: string;
    dark: string;
    system: string;
  };
  sidebar: {
    title: string;
    search: string;
    newChat: string;
    pinned: string;
    recent: string;
    noChats: string;
  };
  settings: {
    title: string;
    language: string;
    theme: string;
    notifications: string;
    about: string;
  };
  errors: {
    networkError: string;
    apiError: string;
    validationError: string;
    rateLimitError: string;
    unknownError: string;
  };
  toast: {
    messageCopied: string;
    messageSent: string;
    messageFailed: string;
    connectionRestored: string;
    connectionLost: string;
  };
}
