import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations, getDestinationDetails } from '@/lib/agents/recommendation-agent';
import { getProfile } from '@/lib/agents/profile-agent';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, limit } = await req.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }
    
    // Get user profile
    const profile = getProfile(sessionId);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Complete Section 1 first.' },
        { status: 400 }
      );
    }
    
    // Get recommendations
    const recommendations = getRecommendations(profile, limit || 5);
    
    return NextResponse.json({
      recommendations,
      profile
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const destinationId = req.nextUrl.searchParams.get('destinationId');
    
    if (!destinationId) {
      return NextResponse.json(
        { error: 'Missing destinationId parameter' },
        { status: 400 }
      );
    }
    
    const details = getDestinationDetails(parseInt(destinationId));
    
    if (!details) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(details);
  } catch (error) {
    console.error('Error getting destination details:', error);
    return NextResponse.json(
      { error: 'Failed to get destination details' },
      { status: 500 }
    );
  }
}

