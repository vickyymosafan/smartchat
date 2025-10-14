/**
 * Conversation Service
 * Service layer untuk operasi database conversations dan messages
 */

import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Conversation, DBMessage, Database } from '@/types/database';
import type { Message } from '@/types/chat';

// Type helpers untuk insert/update operations
type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
type ConversationUpdate = Database['public']['Tables']['conversations']['Update'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

/**
 * Helper function to get authenticated user
 * Accepts optional user parameter to avoid duplicate auth calls
 */
async function getAuthenticatedUser(providedUser?: User | null): Promise<User> {
  if (providedUser) {
    return providedUser;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  return user;
}

/**
 * Fetch semua conversations milik user yang sedang login
 * @param providedUser - Optional user object from AuthContext to avoid duplicate auth calls
 */
export async function getConversations(
  providedUser?: User | null
): Promise<Conversation[]> {
  try {
    // Get authenticated user (use provided or fetch)
    const user = await getAuthenticatedUser(providedUser);

    // Fetch conversations filtered by user_id
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations from Supabase:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Throw a proper Error object with clear message
      throw new Error(
        `Failed to fetch conversations: ${error.message || 'Unknown database error'}`
      );
    }

    return data || [];
  } catch (error: any) {
    // If it's already our custom error, re-throw it
    if (error.message?.includes('Failed to fetch conversations')) {
      throw error;
    }

    // If it's an authentication error, re-throw with context
    if (error.message?.includes('not authenticated')) {
      throw new Error('User not authenticated. Please login again.');
    }

    // For any other error, wrap it with context
    console.error('Unexpected error in getConversations:', error);
    throw new Error(
      `Failed to load conversations: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Fetch messages dari conversation tertentu
 * @param conversationId - ID of the conversation
 * @param providedUser - Optional user object from AuthContext
 */
export async function getMessages(
  conversationId: string,
  providedUser?: User | null
): Promise<Message[]> {
  try {
    // Get authenticated user (use provided or fetch)
    const user = await getAuthenticatedUser(providedUser);

    // First verify that the conversation belongs to the user
    const { data: conversation, error: convError } = (await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single()) as { data: { user_id: string } | null; error: any };

    if (convError || !conversation) {
      console.error('Error verifying conversation ownership:', {
        conversationId,
        error: convError,
      });
      throw new Error('Conversation not found or access denied');
    }

    if (conversation.user_id !== user.id) {
      throw new Error('Unauthorized: This conversation belongs to another user');
    }

    // Fetch messages for the conversation
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages from Supabase:', {
        conversationId,
        code: error.code,
        message: error.message,
      });
      throw new Error(
        `Failed to fetch messages: ${error.message || 'Unknown database error'}`
      );
    }

    // Convert DBMessage to Message format
    return (data || []).map((msg: DBMessage) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: new Date(msg.created_at).getTime(),
    }));
  } catch (error: any) {
    // Re-throw if it's already our custom error
    if (
      error.message?.includes('Failed to fetch messages') ||
      error.message?.includes('Conversation not found') ||
      error.message?.includes('Unauthorized')
    ) {
      throw error;
    }

    // Wrap unexpected errors
    console.error('Unexpected error in getMessages:', error);
    throw new Error(
      `Failed to load messages: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Buat conversation baru
 * @param title - Title for the new conversation
 * @param providedUser - Optional user object from AuthContext
 */
export async function createConversation(
  title: string,
  providedUser?: User | null
): Promise<Conversation> {
  // Get authenticated user (use provided or fetch)
  const user = await getAuthenticatedUser(providedUser);

  if (!user) {
    throw new Error('User not authenticated. Please login to create conversations.');
  }

  const insertData: ConversationInsert = {
    user_id: user.id,
    title,
  };

  const { data, error } = (await supabase
    .from('conversations')
    .insert(insertData as any)
    .select()
    .single()) as { data: Conversation | null; error: any };

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create conversation: No data returned');
  }

  return data;
}

/**
 * Save message ke database
 * @param conversationId - ID of the conversation
 * @param role - Role of the message sender
 * @param content - Content of the message
 * @param providedUser - Optional user object from AuthContext
 */
export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  providedUser?: User | null
): Promise<DBMessage> {
  // Verify user is authenticated
  const user = await getAuthenticatedUser(providedUser);
  
  if (!user) {
    throw new Error('User not authenticated. Please login to send messages.');
  }
  
  // Verify conversation ownership
  const { data: conversation, error: convError } = (await supabase
    .from('conversations')
    .select('user_id')
    .eq('id', conversationId)
    .single()) as { data: { user_id: string } | null; error: any };

  if (convError || !conversation) {
    console.error('Error verifying conversation ownership:', convError);
    throw new Error('Conversation not found or access denied');
  }

  if (conversation.user_id !== user.id) {
    throw new Error('Unauthorized: Cannot save message to another user\'s conversation');
  }
  const insertData: MessageInsert = {
    conversation_id: conversationId,
    role,
    content,
  };

  const { data, error } = (await supabase
    .from('messages')
    .insert(insertData as any)
    .select()
    .single()) as { data: DBMessage | null; error: any };

  if (error) {
    console.error('Error saving message:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Failed to save message: No data returned');
  }

  return data;
}

/**
 * Delete conversation dan semua messages terkait
 * @param conversationId - ID of the conversation to delete
 * @param providedUser - Optional user object from AuthContext
 */
export async function deleteConversation(
  conversationId: string,
  providedUser?: User | null
): Promise<void> {
  // Get authenticated user (use provided or fetch)
  const user = await getAuthenticatedUser(providedUser);

  // Delete conversation (only if owned by user)
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

/**
 * Update conversation title
 * @param conversationId - ID of the conversation
 * @param title - New title for the conversation
 * @param providedUser - Optional user object from AuthContext
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string,
  providedUser?: User | null
): Promise<void> {
  // Get authenticated user (use provided or fetch)
  const user = await getAuthenticatedUser(providedUser);

  // Update conversation (only if owned by user)
  const { error } = await (supabase as any)
    .from('conversations')
    .update({ title })
    .eq('id', conversationId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
}

/**
 * Get preview dari conversation (last message)
 * @param conversationId - ID of the conversation
 * @param providedUser - Optional user object from AuthContext
 */
export async function getConversationPreview(
  conversationId: string,
  providedUser?: User | null
): Promise<string> {
  // Get authenticated user (use provided or fetch)
  let user: User;
  try {
    user = await getAuthenticatedUser(providedUser);
  } catch {
    return 'Belum ada pesan';
  }

  // Verify conversation ownership first
  const { data: conversation } = (await supabase
    .from('conversations')
    .select('user_id')
    .eq('id', conversationId)
    .single()) as { data: { user_id: string } | null };

  if (!conversation || conversation.user_id !== user.id) {
    return 'Belum ada pesan';
  }

  // Fetch last message
  const { data, error } = (await supabase
    .from('messages')
    .select('content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()) as { data: { content: string } | null; error: any };

  if (error || !data) {
    return 'Belum ada pesan';
  }

  return data.content;
}
