-- Migration: Add Milestone-Based Booking Fields
-- Date: 2025-10-03
-- Purpose: Enhance database schema for Section 1-4 milestone tracking

-- ================================================================
-- DESTINATIONS: Add Interest Scores and Budget Classification
-- ================================================================

-- Interest scoring (0-100 scale)
ALTER TABLE destinations ADD COLUMN interest_art INTEGER DEFAULT 50 CHECK(interest_art >= 0 AND interest_art <= 100);
ALTER TABLE destinations ADD COLUMN interest_food INTEGER DEFAULT 50 CHECK(interest_food >= 0 AND interest_food <= 100);
ALTER TABLE destinations ADD COLUMN interest_nature INTEGER DEFAULT 50 CHECK(interest_nature >= 0 AND interest_nature <= 100);
ALTER TABLE destinations ADD COLUMN interest_adventure INTEGER DEFAULT 50 CHECK(interest_adventure >= 0 AND interest_adventure <= 100);
ALTER TABLE destinations ADD COLUMN interest_nightlife INTEGER DEFAULT 50 CHECK(interest_nightlife >= 0 AND interest_nightlife <= 100);
ALTER TABLE destinations ADD COLUMN interest_shopping INTEGER DEFAULT 50 CHECK(interest_shopping >= 0 AND interest_shopping <= 100);
ALTER TABLE destinations ADD COLUMN interest_history INTEGER DEFAULT 50 CHECK(interest_history >= 0 AND interest_history <= 100);
ALTER TABLE destinations ADD COLUMN interest_relaxation INTEGER DEFAULT 50 CHECK(interest_relaxation >= 0 AND interest_relaxation <= 100);

-- Budget classification
ALTER TABLE destinations ADD COLUMN budget_tier TEXT CHECK(budget_tier IN ('budget', 'moderate', 'luxury'));
ALTER TABLE destinations ADD COLUMN avg_daily_cost REAL;

-- Pace suitability (0-100 scale)
ALTER TABLE destinations ADD COLUMN pace_relaxed INTEGER DEFAULT 50 CHECK(pace_relaxed >= 0 AND pace_relaxed <= 100);
ALTER TABLE destinations ADD COLUMN pace_moderate INTEGER DEFAULT 50 CHECK(pace_moderate >= 0 AND pace_moderate <= 100);
ALTER TABLE destinations ADD COLUMN pace_fast INTEGER DEFAULT 50 CHECK(pace_fast >= 0 AND pace_fast <= 100);

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_destinations_budget ON destinations(budget_tier);
CREATE INDEX IF NOT EXISTS idx_destinations_interest_art ON destinations(interest_art);
CREATE INDEX IF NOT EXISTS idx_destinations_interest_food ON destinations(interest_food);

-- ================================================================
-- CONVERSATIONS: Restructure for Milestone Tracking
-- ================================================================

-- Drop old conversations table (if it had wrong structure)
DROP TABLE IF EXISTS conversations;

-- Create new conversations table with milestone tracking
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    
    -- Milestone tracking (Section 1-4)
    current_section INTEGER DEFAULT 1 CHECK(current_section BETWEEN 1 AND 4),
    section_1_complete INTEGER DEFAULT 0,
    section_2_complete INTEGER DEFAULT 0,
    section_3_complete INTEGER DEFAULT 0,
    section_4_complete INTEGER DEFAULT 0,
    
    -- Section 1: User Profile (JSON)
    profile TEXT,
    
    -- Section 2: Destination Selection
    selected_destination_id INTEGER,
    explored_destinations TEXT,
    
    -- Section 3: Trip Details (JSON)
    trip_details TEXT,
    
    -- Section 4: Contact Info (JSON)
    contact_info TEXT,
    
    -- Booking reference
    booking_id INTEGER,
    
    -- Status tracking
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'abandoned')),
    
    FOREIGN KEY (selected_destination_id) REFERENCES destinations(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_section ON conversations(current_section);

-- ================================================================
-- MESSAGES: New table for conversation history
-- ================================================================

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    section INTEGER NOT NULL CHECK(section BETWEEN 1 AND 4),
    
    -- Metadata (JSON: intent, entities, confidence, etc.)
    metadata TEXT,
    
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_section ON messages(section);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ================================================================
-- BOOKINGS: Add missing fields for trip details
-- ================================================================

-- Add trip-specific fields
ALTER TABLE bookings ADD COLUMN num_travelers INTEGER CHECK(num_travelers > 0 AND num_travelers <= 20);
ALTER TABLE bookings ADD COLUMN arrival_time TEXT;
ALTER TABLE bookings ADD COLUMN departure_time TEXT;
ALTER TABLE bookings ADD COLUMN selected_attractions TEXT;
ALTER TABLE bookings ADD COLUMN selected_activities TEXT;
ALTER TABLE bookings ADD COLUMN special_requests TEXT;
ALTER TABLE bookings ADD COLUMN contact_email TEXT;
ALTER TABLE bookings ADD COLUMN contact_phone TEXT;
ALTER TABLE bookings ADD COLUMN emergency_contact TEXT;

-- ================================================================
-- ATTRACTIONS: Add missing fields
-- ================================================================

ALTER TABLE attractions ADD COLUMN ticket_price REAL;
ALTER TABLE attractions ADD COLUMN opening_hours TEXT;
ALTER TABLE attractions ADD COLUMN requires_booking INTEGER DEFAULT 0;

-- ================================================================
-- ACTIVITIES: Add group size limits
-- ================================================================

ALTER TABLE activities ADD COLUMN max_group_size INTEGER DEFAULT 15;
ALTER TABLE activities ADD COLUMN min_group_size INTEGER DEFAULT 1;
ALTER TABLE activities ADD COLUMN available_days TEXT;

-- ================================================================
-- RESTAURANTS: Add price range
-- ================================================================

ALTER TABLE restaurants ADD COLUMN avg_meal_price REAL;
ALTER TABLE restaurants ADD COLUMN reservation_required INTEGER DEFAULT 0;

-- ================================================================
-- Verification
-- ================================================================

-- Show updated schema
SELECT 'Migration completed successfully!' as status;

