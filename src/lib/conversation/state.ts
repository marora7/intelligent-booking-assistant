import db from '@/lib/db';
import { randomUUID } from 'crypto';
import type { ConversationState } from '@/types';

export function getOrCreateConversation(sessionId: string): ConversationState {
  // Try to get existing conversation
  const stmt = db.prepare(`
    SELECT * FROM conversations WHERE session_id = ?
  `);
  
  let conversation = stmt.get(sessionId) as ConversationState | undefined;
  
  if (!conversation) {
    // Create new conversation
    const id = randomUUID();
    const insertStmt = db.prepare(`
      INSERT INTO conversations (
        id, session_id, current_section, status,
        section_1_complete, section_2_complete, section_3_complete, section_4_complete
      )
      VALUES (?, ?, 1, 'active', 0, 0, 0, 0)
    `);
    
    insertStmt.run(id, sessionId);
    
    // Fetch the newly created conversation
    conversation = stmt.get(sessionId) as ConversationState;
  }
  
  return conversation;
}

export function updateConversation(sessionId: string, updates: Partial<ConversationState>): void {
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'session_id' && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (fields.length === 0) return;
  
  fields.push('updated_at = strftime(\'%s\', \'now\')');
  values.push(sessionId);
  
  const stmt = db.prepare(`
    UPDATE conversations 
    SET ${fields.join(', ')}
    WHERE session_id = ?
  `);
  
  stmt.run(...values);
}

export function advanceSection(sessionId: string): number {
  const conversation = getOrCreateConversation(sessionId);
  const newSection = Math.min(conversation.current_section + 1, 4);
  
  updateConversation(sessionId, {
    current_section: newSection
  });
  
  return newSection;
}

export function markSectionComplete(sessionId: string, section: number): void {
  const field = `section_${section}_complete`;
  
  const stmt = db.prepare(`
    UPDATE conversations 
    SET ${field} = 1, updated_at = strftime('%s', 'now')
    WHERE session_id = ?
  `);
  
  stmt.run(sessionId);
}

export function getCurrentSection(sessionId: string): number {
  const conversation = getOrCreateConversation(sessionId);
  return conversation.current_section;
}

export function getConversationState(sessionId: string): ConversationState {
  return getOrCreateConversation(sessionId);
}

