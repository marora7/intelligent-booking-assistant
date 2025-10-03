# Technical Architecture: SQLite Edition

**Date:** October 3, 2025  
**Database:** SQLite with better-sqlite3  
**Status:** Ready to Implement

---

## Executive Summary

The Intelligent Booking Assistant will use **SQLite with better-sqlite3** as the primary database. Your database is **already set up and populated** with 973 records:

- ✅ 37 destinations
- ✅ 320 attractions  
- ✅ 320 activities
- ✅ 56 packages
- ✅ 240 restaurants

**Why SQLite?**
- ✅ Simple deployment (single file)
- ✅ Zero configuration
- ✅ Fast for read-heavy workloads
- ✅ Perfect for < 100,000 concurrent users
- ✅ No separate database server needed
- ✅ Excellent for Next.js API routes

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5+
- **Styling:** TailwindCSS 3+
- **UI Components:** Shadcn/ui
- **State Management:** Zustand
- **Real-time:** Server-Sent Events (SSE)

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Next.js API Routes
- **Database:** SQLite 3.4+ with better-sqlite3
- **Validation:** Zod schemas
- **Session:** iron-session

### AI Layer
- **LLM:** OpenAI GPT-4 Turbo
- **Embeddings:** OpenAI text-embedding-3-large
- **Vector Search:** sqlite-vss (SQLite Vector Search)
- **Structured Output:** JSON mode with Zod validation

---

## Database Architecture

### Current Schema (Already Implemented)

Your SQLite database has the following tables:

```sql
-- Core data tables (READ-MOSTLY)
├── destinations (37 records)
│   ├── countries (17)
│   └── cities (20)
├── attractions (320 records)
├── activities (320 records)
├── restaurants (240 records)
└── packages (56 records)

-- Session/conversation tables (READ-WRITE)
├── user_profiles
├── conversations
└── bookings
```

### Schema Enhancements Needed for PRD

Based on the PRD requirements, we need to **add these fields** to existing tables:

#### 1. Destinations Table - ADD interest scoring

```sql
-- Add new columns for Section 2 matching
ALTER TABLE destinations ADD COLUMN interest_art INTEGER DEFAULT 50;
ALTER TABLE destinations ADD COLUMN interest_food INTEGER DEFAULT 50;
ALTER TABLE destinations ADD COLUMN interest_nature INTEGER DEFAULT 50;
ALTER TABLE destinations ADD COLUMN interest_adventure INTEGER DEFAULT 50;
ALTER TABLE destinations ADD COLUMN interest_nightlife INTEGER DEFAULT 50;
ALTER TABLE destinations ADD COLUMN interest_shopping INTEGER DEFAULT 50;
ALTER TABLE destinations ADD COLUMN interest_history INTEGER DEFAULT 50;
ALTER TABLE destinations ADD COLUMN interest_relaxation INTEGER DEFAULT 50;
ALTER TABLE destinations ADD COLUMN budget_tier TEXT CHECK(budget_tier IN ('budget', 'moderate', 'luxury'));
ALTER TABLE destinations ADD COLUMN avg_daily_cost REAL;
ALTER TABLE destinations ADD COLUMN pace_relaxed INTEGER DEFAULT 50;
ALTER TABLE destinations ADD COLUMN pace_moderate INTEGER DEFAULT 50;
ALTER TABLE destinations ADD COLUMN pace_fast INTEGER DEFAULT 50;

-- Add index for budget filtering
CREATE INDEX idx_destinations_budget ON destinations(budget_tier);
```

#### 2. Conversations Table - RESTRUCTURE for milestone tracking

```sql
-- Current schema is too simple, need to replace
DROP TABLE conversations;

CREATE TABLE conversations (
    id TEXT PRIMARY KEY,  -- UUID
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
    profile TEXT,  -- JSON: {interests, budget, group_type, etc.}
    
    -- Section 2: Destination Selection
    selected_destination_id INTEGER,
    explored_destinations TEXT,  -- JSON array of destination IDs
    
    -- Section 3: Trip Details (JSON)
    trip_details TEXT,  -- JSON: {start_date, end_date, package_id, activities, etc.}
    
    -- Section 4: Contact Info (JSON)
    contact_info TEXT,  -- JSON: {email, phone, emergency_contact}
    
    -- Booking
    booking_id INTEGER,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'abandoned')),
    
    FOREIGN KEY (selected_destination_id) REFERENCES destinations(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_section ON conversations(current_section);
```

#### 3. Messages Table - NEW for conversation history

```sql
CREATE TABLE messages (
    id TEXT PRIMARY KEY,  -- UUID
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    section INTEGER NOT NULL CHECK(section BETWEEN 1 AND 4),
    
    -- Metadata (JSON)
    metadata TEXT,  -- {intent, entities, confidence, timestamp}
    
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_section ON messages(section);
```

#### 4. Bookings Table - ENHANCE with more details

```sql
-- Add missing fields
ALTER TABLE bookings ADD COLUMN num_travelers INTEGER CHECK(num_travelers > 0 AND num_travelers <= 20);
ALTER TABLE bookings ADD COLUMN arrival_time TEXT;
ALTER TABLE bookings ADD COLUMN departure_time TEXT;
ALTER TABLE bookings ADD COLUMN selected_attractions TEXT;  -- JSON array
ALTER TABLE bookings ADD COLUMN selected_activities TEXT;  -- JSON array
ALTER TABLE bookings ADD COLUMN special_requests TEXT;  -- JSON array
ALTER TABLE bookings ADD COLUMN contact_email TEXT NOT NULL;
ALTER TABLE bookings ADD COLUMN contact_phone TEXT;
ALTER TABLE bookings ADD COLUMN emergency_contact TEXT;  -- JSON
```

---

## Database Connection Setup

### Connection Module (Following SQLite Rules)

```typescript
// lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';

// Single shared connection instance
const dbPath = path.join(process.cwd(), 'data', 'database.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB cache
db.pragma('temp_store = MEMORY');

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

export default db;
```

**Key Points (from SQLite rules):**
- ✅ Single connection instance (better-sqlite3 is synchronous)
- ✅ WAL mode enabled for better concurrency
- ✅ Foreign keys enabled (critical!)
- ✅ Performance pragmas set
- ✅ Graceful shutdown handlers

---

## Data Access Layer

### Section 1: Profile Agent

```typescript
// lib/agents/profile-agent.ts
import db from '@/lib/db';

interface UserProfile {
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

export function saveProfile(sessionId: string, profile: UserProfile) {
  const stmt = db.prepare(`
    UPDATE conversations 
    SET profile = ?, updated_at = strftime('%s', 'now')
    WHERE session_id = ?
  `);
  
  stmt.run(JSON.stringify(profile), sessionId);
}

export function getProfile(sessionId: string): UserProfile | null {
  const stmt = db.prepare(`
    SELECT profile FROM conversations WHERE session_id = ?
  `);
  
  const row = stmt.get(sessionId) as { profile: string } | undefined;
  return row ? JSON.parse(row.profile) : null;
}

export function validateProfileComplete(profile: UserProfile): {
  isComplete: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  
  if (!profile.interests?.length) missing.push('interests');
  if (!profile.budget) missing.push('budget');
  if (!profile.group_type) missing.push('group_type');
  if (!profile.duration_days) missing.push('duration_days');
  if (!profile.travel_season) missing.push('travel_season');
  
  return {
    isComplete: missing.length === 0,
    missing
  };
}
```

---

### Section 2: Recommendation Agent

```typescript
// lib/agents/recommendation-agent.ts
import db from '@/lib/db';

interface Destination {
  id: number;
  name: string;
  country: string;
  description: string;
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
  best_seasons: string;
}

interface MatchResult {
  destination: Destination;
  score: number;
  matchReasons: string[];
}

export function getRecommendations(
  profile: UserProfile,
  limit: number = 5
): MatchResult[] {
  // Get all cities (type='city')
  const stmt = db.prepare(`
    SELECT * FROM destinations 
    WHERE type = 'city'
  `);
  
  const destinations = stmt.all() as Destination[];
  
  // Calculate match score for each destination
  const results = destinations.map(dest => {
    let score = 0;
    const reasons: string[] = [];
    
    // Interest alignment (40% weight)
    const interestScore = calculateInterestMatch(profile.interests, dest);
    score += interestScore * 0.4;
    if (interestScore > 70) {
      reasons.push(`Perfect match for ${profile.interests.join(', ')}`);
    }
    
    // Budget fit (25% weight)
    if (dest.budget_tier === profile.budget) {
      score += 25;
      reasons.push(`Fits your ${profile.budget} budget`);
    } else if (Math.abs(budgetDiff(dest.budget_tier, profile.budget)) === 1) {
      score += 15;
    }
    
    // Season/Weather (15% weight)
    if (dest.best_seasons?.includes(profile.travel_season)) {
      score += 15;
      reasons.push(`Ideal for ${profile.travel_season} travel`);
    }
    
    // Pace alignment (20% weight)
    const paceField = `pace_${profile.pace}` as keyof Destination;
    const paceScore = (dest[paceField] as number) || 50;
    score += (paceScore / 100) * 20;
    if (paceScore > 80) {
      reasons.push(`Great for ${profile.pace} travelers`);
    }
    
    return {
      destination: dest,
      score: Math.min(score, 100),
      matchReasons: reasons
    };
  });
  
  // Sort by score and return top N
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function calculateInterestMatch(
  userInterests: string[],
  destination: Destination
): number {
  let totalScore = 0;
  
  for (const interest of userInterests) {
    const field = `interest_${interest}` as keyof Destination;
    const score = (destination[field] as number) || 50;
    totalScore += score;
  }
  
  return userInterests.length > 0 
    ? totalScore / userInterests.length 
    : 50;
}

function budgetDiff(tier1: string, tier2: string): number {
  const tiers = ['budget', 'moderate', 'luxury'];
  return Math.abs(tiers.indexOf(tier1) - tiers.indexOf(tier2));
}
```

---

### Section 3: Trip Finalization

```typescript
// lib/agents/trip-agent.ts
import db from '@/lib/db';

interface TripDetails {
  start_date: string;
  end_date: string;
  arrival_time: 'morning' | 'afternoon' | 'evening';
  departure_time: 'morning' | 'afternoon' | 'evening';
  package_id: number | null;
  accommodation: any | null;
  selected_attractions: number[];
  selected_activities: number[];
  restaurant_prefs: string[];
  special_requests: string[];
}

export function getPackagesByDestination(destinationId: number) {
  const stmt = db.prepare(`
    SELECT * FROM packages 
    WHERE destination_id = ?
    ORDER BY rating DESC, base_price ASC
  `);
  
  return stmt.all(destinationId);
}

export function getActivitiesByDestination(destinationId: number) {
  const stmt = db.prepare(`
    SELECT * FROM activities 
    WHERE destination_id = ?
    ORDER BY rating DESC
  `);
  
  return stmt.all(destinationId);
}

export function getAttractionsByDestination(destinationId: number) {
  const stmt = db.prepare(`
    SELECT * FROM attractions 
    WHERE destination_id = ?
    ORDER BY rating DESC
  `);
  
  return stmt.all(destinationId);
}

export function calculateTripCost(
  tripDetails: TripDetails,
  numTravelers: number
): number {
  let total = 0;
  
  // Package cost
  if (tripDetails.package_id) {
    const stmt = db.prepare('SELECT base_price FROM packages WHERE id = ?');
    const pkg = stmt.get(tripDetails.package_id) as { base_price: number };
    total += pkg.base_price * numTravelers;
  }
  
  // Additional activities
  if (tripDetails.selected_activities.length > 0) {
    const placeholders = tripDetails.selected_activities.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT SUM(price) as total FROM activities 
      WHERE id IN (${placeholders})
    `);
    const result = stmt.get(...tripDetails.selected_activities) as { total: number };
    total += (result.total || 0) * numTravelers;
  }
  
  return total;
}

export function saveTripDetails(sessionId: string, details: TripDetails) {
  const stmt = db.prepare(`
    UPDATE conversations 
    SET trip_details = ?, updated_at = strftime('%s', 'now')
    WHERE session_id = ?
  `);
  
  stmt.run(JSON.stringify(details), sessionId);
}
```

---

### Section 4: Booking Creation

```typescript
// lib/agents/booking-agent.ts
import db from '@/lib/db';
import { randomBytes } from 'crypto';

export function createBooking(
  sessionId: string,
  destinationId: number,
  packageId: number,
  tripDetails: TripDetails,
  contactInfo: {
    email: string;
    phone: string;
    emergency_contact?: any;
  },
  totalPrice: number,
  numTravelers: number
): string {
  // Generate confirmation number
  const confirmationNumber = `VIK-${new Date().getFullYear()}-${
    randomBytes(3).toString('hex').toUpperCase()
  }`;
  
  // Create booking in transaction
  const createBooking = db.transaction(() => {
    // Insert booking
    const stmt = db.prepare(`
      INSERT INTO bookings (
        session_id,
        confirmation_number,
        package_id,
        destination_id,
        start_date,
        end_date,
        num_travelers,
        arrival_time,
        departure_time,
        selected_attractions,
        selected_activities,
        special_requests,
        total_price,
        contact_email,
        contact_phone,
        emergency_contact,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `);
    
    const info = stmt.run(
      sessionId,
      confirmationNumber,
      packageId,
      destinationId,
      tripDetails.start_date,
      tripDetails.end_date,
      numTravelers,
      tripDetails.arrival_time,
      tripDetails.departure_time,
      JSON.stringify(tripDetails.selected_attractions),
      JSON.stringify(tripDetails.selected_activities),
      JSON.stringify(tripDetails.special_requests),
      totalPrice,
      contactInfo.email,
      contactInfo.phone,
      JSON.stringify(contactInfo.emergency_contact || null),
    );
    
    // Update conversation with booking_id
    const updateConv = db.prepare(`
      UPDATE conversations 
      SET booking_id = ?, 
          status = 'completed',
          section_4_complete = 1,
          updated_at = strftime('%s', 'now')
      WHERE session_id = ?
    `);
    
    updateConv.run(info.lastInsertRowid, sessionId);
    
    return confirmationNumber;
  });
  
  return createBooking();
}

export function getBookingByConfirmation(confirmationNumber: string) {
  const stmt = db.prepare(`
    SELECT 
      b.*,
      d.name as destination_name,
      d.country,
      p.name as package_name,
      p.description as package_description
    FROM bookings b
    JOIN destinations d ON b.destination_id = d.id
    JOIN packages p ON b.package_id = p.id
    WHERE b.confirmation_number = ?
  `);
  
  return stmt.get(confirmationNumber);
}
```

---

## Conversation State Management

```typescript
// lib/conversation/state.ts
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export function getOrCreateConversation(sessionId: string) {
  // Try to get existing
  let stmt = db.prepare(`
    SELECT * FROM conversations WHERE session_id = ?
  `);
  
  let conversation = stmt.get(sessionId);
  
  if (!conversation) {
    // Create new
    stmt = db.prepare(`
      INSERT INTO conversations (id, session_id, current_section, status)
      VALUES (?, ?, 1, 'active')
    `);
    
    const id = randomUUID();
    stmt.run(id, sessionId);
    
    conversation = { id, session_id: sessionId, current_section: 1, status: 'active' };
  }
  
  return conversation;
}

export function advanceSection(sessionId: string) {
  const stmt = db.prepare(`
    UPDATE conversations 
    SET current_section = current_section + 1,
        updated_at = strftime('%s', 'now')
    WHERE session_id = ?
  `);
  
  stmt.run(sessionId);
}

export function markSectionComplete(sessionId: string, section: number) {
  const stmt = db.prepare(`
    UPDATE conversations 
    SET section_${section}_complete = 1,
        updated_at = strftime('%s', 'now')
    WHERE session_id = ?
  `);
  
  stmt.run(sessionId);
}

export function getCurrentSection(sessionId: string): number {
  const stmt = db.prepare(`
    SELECT current_section FROM conversations WHERE session_id = ?
  `);
  
  const result = stmt.get(sessionId) as { current_section: number };
  return result?.current_section || 1;
}
```

---

## Message Logging

```typescript
// lib/conversation/messages.ts
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export function logMessage(
  conversationId: string,
  role: 'user' | 'agent' | 'system',
  content: string,
  section: number,
  metadata?: any
) {
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

export function getConversationHistory(conversationId: string) {
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `);
  
  return stmt.all(conversationId);
}

export function getMessagesBySection(conversationId: string, section: number) {
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ? AND section = ?
    ORDER BY created_at ASC
  `);
  
  return stmt.all(conversationId, section);
}
```

---

## API Routes Structure

```
app/api/
├── chat/
│   └── route.ts              # Main chat endpoint (SSE stream)
├── recommendations/
│   └── route.ts              # Get destination recommendations
├── destinations/
│   └── [id]/
│       ├── route.ts          # Get destination details
│       ├── packages/route.ts # Get packages for destination
│       └── activities/route.ts # Get activities
├── validate/
│   └── route.ts              # Validate section completion
├── bookings/
│   ├── route.ts              # Create booking
│   └── [confirmation]/route.ts # Get booking details
└── session/
    └── route.ts              # Initialize/get session
```

### Example: Chat API Route

```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { getOrCreateConversation, getCurrentSection } from '@/lib/conversation/state';
import { logMessage } from '@/lib/conversation/messages';
import { processMessage } from '@/lib/agents/orchestrator';

export async function POST(req: NextRequest) {
  const { sessionId, message } = await req.json();
  
  // Get conversation state
  const conversation = getOrCreateConversation(sessionId);
  const section = getCurrentSection(sessionId);
  
  // Log user message
  logMessage(conversation.id, 'user', message, section);
  
  // Process with appropriate agent
  const response = await processMessage(sessionId, message, section);
  
  // Log agent response
  logMessage(conversation.id, 'agent', response.content, section, response.metadata);
  
  return Response.json({
    content: response.content,
    section,
    metadata: response.metadata
  });
}
```

---

## Performance Optimizations

### 1. Prepared Statements (Always!)

```typescript
// ✅ GOOD - Reusable prepared statement
const getDestinationStmt = db.prepare('SELECT * FROM destinations WHERE id = ?');
const dest1 = getDestinationStmt.get(18);
const dest2 = getDestinationStmt.get(19);

// ❌ BAD - New statement each time
const dest1 = db.prepare('SELECT * FROM destinations WHERE id = ?').get(18);
const dest2 = db.prepare('SELECT * FROM destinations WHERE id = ?').get(19);
```

### 2. Transactions for Multiple Operations

```typescript
// ✅ GOOD - Single transaction
const createBookingTx = db.transaction((data) => {
  db.prepare('INSERT INTO bookings ...').run(data.booking);
  db.prepare('UPDATE conversations ...').run(data.sessionId);
  db.prepare('INSERT INTO messages ...').run(data.message);
});

createBookingTx(data);

// ❌ BAD - Separate operations
db.prepare('INSERT INTO bookings ...').run(data.booking);
db.prepare('UPDATE conversations ...').run(data.sessionId);
db.prepare('INSERT INTO messages ...').run(data.message);
```

### 3. Batch Inserts

```typescript
// ✅ GOOD - Batch insert in transaction
const insertMany = db.transaction((items) => {
  const stmt = db.prepare('INSERT INTO items VALUES (?, ?)');
  for (const item of items) {
    stmt.run(item.id, item.name);
  }
});

insertMany(largeArray);
```

### 4. Index Usage

```typescript
// Already created indexes for common queries:
// - idx_destinations_budget (budget filtering)
// - idx_attractions_destination (join optimization)
// - idx_activities_destination (join optimization)
// - idx_conversations_session (session lookups)
```

---

## Data Enhancement Scripts

### Script 1: Add Interest Scores to Destinations

```typescript
// scripts/enhance-destinations.ts
import db from '../lib/db';

// Manual curation based on destination knowledge
const INTEREST_SCORES = {
  Amsterdam: {
    art: 95, food: 80, nature: 40, adventure: 30,
    nightlife: 85, shopping: 70, history: 80, relaxation: 60
  },
  Paris: {
    art: 100, food: 100, nature: 45, adventure: 30,
    nightlife: 90, shopping: 95, history: 95, relaxation: 50
  },
  Florence: {
    art: 100, food: 90, nature: 50, adventure: 35,
    nightlife: 60, shopping: 70, history: 100, relaxation: 60
  },
  // ... add all 20 cities
};

const BUDGET_TIERS = {
  Amsterdam: { tier: 'moderate', dailyCost: 120 },
  Paris: { tier: 'moderate', dailyCost: 140 },
  Lisbon: { tier: 'budget', dailyCost: 70 },
  Zurich: { tier: 'luxury', dailyCost: 250 },
  // ... add all 20 cities
};

function enhanceDestinations() {
  const update = db.prepare(`
    UPDATE destinations 
    SET 
      interest_art = ?,
      interest_food = ?,
      interest_nature = ?,
      interest_adventure = ?,
      interest_nightlife = ?,
      interest_shopping = ?,
      interest_history = ?,
      interest_relaxation = ?,
      budget_tier = ?,
      avg_daily_cost = ?
    WHERE name = ?
  `);
  
  const enhanceAll = db.transaction(() => {
    for (const [city, scores] of Object.entries(INTEREST_SCORES)) {
      const budget = BUDGET_TIERS[city];
      update.run(
        scores.art, scores.food, scores.nature, scores.adventure,
        scores.nightlife, scores.shopping, scores.history, scores.relaxation,
        budget.tier, budget.dailyCost,
        city
      );
    }
  });
  
  enhanceAll();
  console.log('✅ Destinations enhanced with interest scores and budget tiers');
}

enhanceDestinations();
```

---

## Migration Checklist

### Phase 1: Schema Updates (1-2 hours)

- [ ] Run ALTER TABLE statements to add new fields
- [ ] Create new conversations table structure
- [ ] Create messages table
- [ ] Add indexes for new fields
- [ ] Test schema with queries

### Phase 2: Data Enhancement (2-3 hours)

- [ ] Create interest score mapping for all cities
- [ ] Add budget tier classifications
- [ ] Add pace suitability scores
- [ ] Run enhancement script
- [ ] Verify data quality

### Phase 3: Code Implementation (Week 1-2 per PRD)

- [ ] Set up Next.js project
- [ ] Create database connection module
- [ ] Build data access layer (agents)
- [ ] Implement API routes
- [ ] Build chat UI components
- [ ] Integrate LLM (OpenAI)

---

## Deployment Considerations

### Local Development
```bash
# Database is already at: data/database.db
# Just npm install better-sqlite3 and start coding
```

### Production (Vercel)
```bash
# SQLite file needs to be in /tmp (ephemeral on Vercel)
# OR use Turso (hosted SQLite) for persistence
# OR use LiteFS for distributed SQLite
```

**Recommended for Production:** Use **Turso** (managed SQLite)
- ✅ Compatible with better-sqlite3
- ✅ Distributed globally
- ✅ Still uses SQLite syntax
- ✅ Free tier: 500MB storage

---

## Summary

**You're in great shape! 🎉**

✅ **Database:** Already created with proper schema  
✅ **Data:** All 973 records imported  
✅ **Indexes:** Already optimized for common queries  
✅ **Foreign Keys:** Already configured  

**Next Steps:**
1. Add interest scores to destinations (2-3 hours)
2. Restructure conversations table for milestones (30 min)
3. Create data access layer following SQLite rules (1 week)
4. Build Next.js frontend and API routes (1 week)

**Ready to start coding!** 🚀

