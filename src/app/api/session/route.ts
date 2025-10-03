import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateConversation } from '@/lib/conversation/state';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const sessionId = randomUUID();
    
    // Create conversation in database
    const conversation = getOrCreateConversation(sessionId);
    
    return NextResponse.json({
      sessionId,
      conversationId: conversation.id,
      currentSection: conversation.current_section
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
        { status: 400 }
      );
    }
    
    const conversation = getOrCreateConversation(sessionId);
    
    return NextResponse.json({
      sessionId,
      conversationId: conversation.id,
      currentSection: conversation.current_section,
      status: conversation.status,
      profile: conversation.profile ? JSON.parse(conversation.profile) : null,
      selectedDestinationId: conversation.selected_destination_id
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

