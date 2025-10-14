/**
 * localStorage utilities for persisting UI state
 * Handles theme, sidebar state, input drafts, and last read message
 */

export interface UIState {
  theme?: 'light' | 'dark' | 'system';
  sidebarOpen?: boolean;
  inputDraft?: string;
  lastReadMessageId?: string | null;
}

const STORAGE_KEY = 'smartchat-ui-state';
const STORAGE_VERSION = 1;

interface StorageData {
  version: number;
  state: UIState;
  timestamp: number;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save UI state to localStorage
 * @param state - Partial UI state to save
 * @returns boolean indicating success
 */
export function saveUIState(state: Partial<UIState>): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    // Load existing state
    const existing = loadUIState();

    // Merge with new state
    const merged: UIState = {
      ...existing,
      ...state,
    };

    const data: StorageData = {
      version: STORAGE_VERSION,
      state: merged,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Clearing old data...');
      try {
        // Try to clear and save again
        localStorage.removeItem(STORAGE_KEY);
        const data: StorageData = {
          version: STORAGE_VERSION,
          state,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch {
        console.error('Failed to save UI state after clearing');
        return false;
      }
    }

    console.error('Failed to save UI state:', error);
    return false;
  }
}

/**
 * Load UI state from localStorage
 * @returns UI state object (empty if not found or invalid)
 */
export function loadUIState(): UIState {
  if (!isLocalStorageAvailable()) {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {};
    }

    const data: StorageData = JSON.parse(stored);

    // Validate version
    if (data.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, clearing old data');
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }

    // Validate state structure
    if (!data.state || typeof data.state !== 'object') {
      return {};
    }

    return data.state;
  } catch (error) {
    console.error('Failed to load UI state:', error);
    return {};
  }
}

/**
 * Save sidebar open/closed state
 * @param isOpen - Whether sidebar is open
 */
export function saveSidebarState(isOpen: boolean): boolean {
  return saveUIState({ sidebarOpen: isOpen });
}

/**
 * Load sidebar state
 * @returns Sidebar open state or undefined if not set
 */
export function loadSidebarState(): boolean | undefined {
  const state = loadUIState();
  return state.sidebarOpen;
}

/**
 * Save input draft
 * @param draft - Draft text to save
 */
export function saveInputDraft(draft: string): boolean {
  return saveUIState({ inputDraft: draft });
}

/**
 * Load input draft
 * @returns Draft text or undefined if not set
 */
export function loadInputDraft(): string | undefined {
  const state = loadUIState();
  return state.inputDraft;
}

/**
 * Clear input draft
 */
export function clearInputDraft(): boolean {
  return saveUIState({ inputDraft: '' });
}

/**
 * Save last read message ID
 * @param messageId - ID of last read message
 */
export function saveLastReadMessageId(messageId: string | null): boolean {
  return saveUIState({ lastReadMessageId: messageId });
}

/**
 * Load last read message ID
 * @returns Last read message ID or undefined if not set
 */
export function loadLastReadMessageId(): string | null | undefined {
  const state = loadUIState();
  return state.lastReadMessageId;
}

// Removed unused functions: clearUIState() and getStorageSize()
// These functions were not used anywhere in the codebase
