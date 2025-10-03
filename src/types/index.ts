// User Profile (Section 1)
export interface UserProfile {
  interests: string[];
  budget: 'budget' | 'moderate' | 'luxury';
  group_type: 'solo' | 'couple' | 'family' | 'group';
  group_size: number;
  pace: 'relaxed' | 'moderate' | 'fast';
  weather_pref: 'any' | 'warm' | 'mild' | 'cool';
  travel_season: string;
  duration_days: number;
  special_requirements: string[];
}

// Destination (Section 2)
export interface Destination {
  id: number;
  name: string;
  country: string;
  type: string;
  description: string;
  climate: string;
  best_seasons: string;
  popular_activities: string;
  interest_art: number;
  interest_food: number;
  interest_nature: number;
  interest_adventure: number;
  interest_nightlife: number;
  interest_shopping: number;
  interest_history: number;
  interest_relaxation: number;
  budget_tier: string;
  avg_daily_cost: number;
  pace_relaxed: number;
  pace_moderate: number;
  pace_fast: number;
}

// Package
export interface Package {
  id: number;
  destination_id: number;
  name: string;
  description: string;
  duration_days: number;
  base_price: number;
  currency: string;
  included_attractions: string;
  included_activities: string;
  included_meals: string;
  accommodation_type: string;
  suitable_for: string;
  availability: string;
  rating: number;
}

// Activity
export interface Activity {
  id: number;
  destination_id: number;
  name: string;
  type: string;
  description: string;
  price: number;
  currency: string;
  duration_hours: number;
  difficulty: string;
  interests: string;
  suitable_for: string;
  weather_dependent: number;
  requirements: string;
  rating: number;
}

// Attraction
export interface Attraction {
  id: number;
  destination_id: number;
  name: string;
  category: string;
  description: string;
  rating: number;
  price_level: string;
  duration_hours: number;
  interests: string;
  suitable_for: string;
  weather_dependent: number;
  address: string;
}

// Trip Details (Section 3)
export interface TripDetails {
  start_date: string;
  end_date: string;
  arrival_time: 'morning' | 'afternoon' | 'evening';
  departure_time: 'morning' | 'afternoon' | 'evening';
  package_id: number | null;
  selected_attractions: number[];
  selected_activities: number[];
  special_requests: string[];
}

// Contact Info (Section 4)
export interface ContactInfo {
  email: string;
  phone: string;
  emergency_contact?: {
    name: string;
    phone: string;
  };
}

// Conversation State
export interface ConversationState {
  id: string;
  session_id: string;
  current_section: number;
  section_1_complete: number;
  section_2_complete: number;
  section_3_complete: number;
  section_4_complete: number;
  profile: string | null; // JSON
  selected_destination_id: number | null;
  explored_destinations: string | null; // JSON
  trip_details: string | null; // JSON
  contact_info: string | null; // JSON
  booking_id: number | null;
  status: 'active' | 'completed' | 'abandoned';
  created_at: number;
  updated_at: number;
}

// Message
export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  section: number;
  metadata: string | null; // JSON
  created_at: number;
}

// Match Result
export interface MatchResult {
  destination: Destination;
  score: number;
  matchReasons: string[];
}

// API Response Types
export interface ChatResponse {
  content: string;
  section: number;
  canAdvance: boolean;
  metadata?: any;
}

export interface SessionResponse {
  sessionId: string;
  conversationId: string;
  currentSection: number;
}

export interface ValidationResult {
  isComplete: boolean;
  missing: string[];
  message?: string;
}

