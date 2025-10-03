import type { UserProfile, ValidationResult } from '@/types';
import { getConversationState, updateConversation } from '@/lib/conversation/state';

export function saveProfile(sessionId: string, profile: UserProfile): void {
  updateConversation(sessionId, {
    profile: JSON.stringify(profile)
  });
}

export function getProfile(sessionId: string): UserProfile | null {
  const conversation = getConversationState(sessionId);
  
  if (!conversation.profile) return null;
  
  try {
    return JSON.parse(conversation.profile) as UserProfile;
  } catch (error) {
    console.error('Error parsing profile:', error);
    return null;
  }
}

export function updateProfile(sessionId: string, updates: Partial<UserProfile>): UserProfile {
  const current = getProfile(sessionId) || getEmptyProfile();
  const updated = { ...current, ...updates };
  saveProfile(sessionId, updated);
  return updated;
}

export function validateProfileComplete(profile: UserProfile | null): ValidationResult {
  if (!profile) {
    return {
      isComplete: false,
      missing: ['All profile information'],
      message: 'No profile information collected yet.'
    };
  }
  
  const missing: string[] = [];
  
  if (!profile.interests || profile.interests.length === 0) {
    missing.push('Travel interests');
  }
  if (!profile.budget) {
    missing.push('Budget range');
  }
  if (!profile.group_type) {
    missing.push('Group type');
  }
  if (!profile.group_size || profile.group_size < 1) {
    missing.push('Number of travelers');
  }
  if (!profile.duration_days || profile.duration_days < 1) {
    missing.push('Trip duration');
  }
  if (!profile.travel_season) {
    missing.push('Travel dates or season');
  }
  if (!profile.pace) {
    missing.push('Travel pace');
  }
  if (!profile.weather_pref) {
    missing.push('Weather preference');
  }
  
  return {
    isComplete: missing.length === 0,
    missing,
    message: missing.length > 0 
      ? `I still need to know: ${missing.join(', ')}`
      : 'Profile complete!'
  };
}

export function getEmptyProfile(): UserProfile {
  return {
    interests: [],
    budget: 'moderate',
    group_type: 'couple',
    group_size: 2,
    pace: 'moderate',
    weather_pref: 'any',
    travel_season: '',
    duration_days: 0,
    special_requirements: []
  };
}

export function extractProfileFromText(text: string): Partial<UserProfile> {
  const extracted: Partial<UserProfile> = {};
  const lowerText = text.toLowerCase();
  
  // Extract interests
  const interests: string[] = [];
  if (lowerText.match(/\b(art|museum|gallery|painting|sculpture)\b/)) interests.push('art');
  if (lowerText.match(/\b(food|cuisine|restaurant|dining|culinary|eat)\b/)) interests.push('food');
  if (lowerText.match(/\b(nature|hiking|outdoor|mountain|forest|park)\b/)) interests.push('nature');
  if (lowerText.match(/\b(adventure|thrill|exciting|climbing|rafting)\b/)) interests.push('adventure');
  if (lowerText.match(/\b(nightlife|party|club|bar|dancing)\b/)) interests.push('nightlife');
  if (lowerText.match(/\b(shopping|shop|mall|boutique)\b/)) interests.push('shopping');
  if (lowerText.match(/\b(history|historical|ancient|heritage|castle)\b/)) interests.push('history');
  if (lowerText.match(/\b(relax|relaxation|spa|beach|peaceful)\b/)) interests.push('relaxation');
  
  if (interests.length > 0) extracted.interests = interests;
  
  // Extract budget
  if (lowerText.match(/\b(budget|cheap|affordable|economical)\b/)) {
    extracted.budget = 'budget';
  } else if (lowerText.match(/\b(luxury|luxurious|upscale|premium|expensive)\b/)) {
    extracted.budget = 'luxury';
  } else if (lowerText.match(/\b(moderate|mid-range|medium)\b/)) {
    extracted.budget = 'moderate';
  }
  
  // Extract group type and size
  if (lowerText.match(/\b(solo|alone|by myself|myself)\b/)) {
    extracted.group_type = 'solo';
    extracted.group_size = 1;
  } else if (lowerText.match(/\b(couple|partner|husband|wife|boyfriend|girlfriend)\b/)) {
    extracted.group_type = 'couple';
    extracted.group_size = 2;
  } else if (lowerText.match(/\b(family|kids|children)\b/)) {
    extracted.group_type = 'family';
  } else if (lowerText.match(/\b(group|friends)\b/)) {
    extracted.group_type = 'group';
  }
  
  // Extract duration
  const durationMatch = text.match(/(\d+)\s*(day|night)/i);
  if (durationMatch) {
    extracted.duration_days = parseInt(durationMatch[1]);
  }
  
  // Extract pace
  if (lowerText.match(/\b(relaxed|slow|leisurely|easy)\b/)) {
    extracted.pace = 'relaxed';
  } else if (lowerText.match(/\b(fast|quick|packed|busy)\b/)) {
    extracted.pace = 'fast';
  } else if (lowerText.match(/\b(moderate|balanced|mix)\b/)) {
    extracted.pace = 'moderate';
  }
  
  // Extract weather preference
  if (lowerText.match(/\b(warm|hot|sunny|tropical)\b/)) {
    extracted.weather_pref = 'warm';
  } else if (lowerText.match(/\b(cool|cold|winter)\b/)) {
    extracted.weather_pref = 'cool';
  } else if (lowerText.match(/\b(mild|temperate|spring|fall)\b/)) {
    extracted.weather_pref = 'mild';
  }
  
  // Extract season
  if (lowerText.match(/\b(june|july|august|summer)\b/)) {
    extracted.travel_season = 'summer';
  } else if (lowerText.match(/\b(december|january|february|winter)\b/)) {
    extracted.travel_season = 'winter';
  } else if (lowerText.match(/\b(march|april|may|spring)\b/)) {
    extracted.travel_season = 'spring';
  } else if (lowerText.match(/\b(september|october|november|fall|autumn)\b/)) {
    extracted.travel_season = 'fall';
  }
  
  return extracted;
}

