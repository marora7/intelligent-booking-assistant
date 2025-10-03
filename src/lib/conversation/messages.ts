import db from '@/lib/db';
import { randomUUID } from 'crypto';
import type { Message } from '@/types';

export function logMessage(
  conversationId: string,
  role: 'user' | 'agent' | 'system',
  content: string,
  section: number,
  metadata?: any
): void {
  const stmt = db.prepare(`
    INSERT INTO messages (id, conversation_id, role, content, section, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    randomUUID(),
    conversationId,
    role,
    content,
    section,
    metadata ? JSON.stringify(metadata) : null
  );
}

export function getConversationHistory(conversationId: string): Message[] {
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `);
  
  return stmt.all(conversationId) as Message[];
}

export function getMessagesBySection(conversationId: string, section: number): Message[] {
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ? AND section = ?
    ORDER BY created_at ASC
  `);
  
  return stmt.all(conversationId, section) as Message[];
}

export function getRecentMessages(conversationId: string, limit: number = 10): Message[] {
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);
  
  const messages = stmt.all(conversationId, limit) as Message[];
  return messages.reverse(); // Return in chronological order
}

