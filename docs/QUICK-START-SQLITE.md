# Quick Start Guide: SQLite + Next.js Booking Assistant

**Ready to code in 30 minutes!** ⚡

---

## Current Status ✅

Your project is **80% set up**:

- ✅ SQLite database created (`data/database.db`)
- ✅ 973 records imported (destinations, attractions, activities, packages, restaurants)
- ✅ Schema with proper indexes and foreign keys
- ✅ Comprehensive SQLite rules documented

**What's needed:**
- 🔨 Run migrations (add interest scores)
- 🔨 Set up Next.js project
- 🔨 Build conversation agents

---

## Step 1: Run Database Migrations (5 minutes)

### Make migration script executable
```bash
cd /Users/manaliarora/Documents/node-booking-system
chmod +x scripts/run-migrations.sh
```

### Run migrations
```bash
./scripts/run-migrations.sh
```

**What this does:**
1. ✅ Backs up current database
2. ✅ Adds interest score fields to destinations
3. ✅ Restructures conversations table for milestone tracking
4. ✅ Creates messages table for chat history
5. ✅ Populates interest scores for all 20 cities
6. ✅ Adds budget tiers and pace suitability

**Expected output:**
```
🔧 SQLite Database Migration Tool
==================================

📦 Creating backup...
✅ Backup created: data/backups/database_backup_20251003_120000.db

🚀 Running Migration 001: Add milestone fields...
✅ Migration 001 completed successfully

🚀 Running Migration 002: Populate interest scores...
✅ Migration 002 completed successfully

🎉 All migrations completed successfully!
```

---

## Step 2: Verify Database (2 minutes)

### Check enhanced data
```bash
sqlite3 data/database.db "
SELECT 
  name,
  budget_tier,
  avg_daily_cost,
  interest_art,
  interest_food
FROM destinations 
WHERE type='city' 
LIMIT 5;
"
```

**Expected output:**
```
Amsterdam|moderate|120|95|80
Paris|moderate|140|100|100
London|moderate|150|95|85
Lisbon|budget|70|70|85
Florence|moderate|115|100|90
```

### Check tables
```bash
sqlite3 data/database.db ".tables"
```

**Expected output:**
```
activities     conversations  messages       restaurants
attractions    destinations   packages       user_profiles
bookings
```

---

## Step 3: Initialize Next.js Project (10 minutes)

### Create Next.js app
```bash
npx create-next-app@latest . --typescript --tailwind --app --use-npm
```

**Choose these options:**
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ `src/` directory: Yes
- ✅ App Router: Yes
- ✅ Import alias: Yes (@/*)

### Install dependencies
```bash
npm install better-sqlite3 zod iron-session
npm install -D @types/better-sqlite3

# AI dependencies
npm install openai ai

# UI dependencies
npm install @radix-ui/react-dialog @radix-ui/react-progress
npm install lucide-react
```

---

## Step 4: Create Database Connection (5 minutes)

### Create `src/lib/db.ts`
```typescript
// src/lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'database.db');
const db = new Database(dbPath);

// Enable best practices from SQLite rules
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');
db.pragma('temp_store = MEMORY');

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

export default db;
```

### Test the connection
Create `scripts/test-db.ts`:
```typescript
import db from '../src/lib/db';

// Test query
const destinations = db.prepare(`
  SELECT name, budget_tier, interest_art, interest_food 
  FROM destinations 
  WHERE type = 'city' 
  LIMIT 3
`).all();

console.log('✅ Database connected successfully!');
console.log('📍 Sample destinations:', destinations);

db.close();
```

Run test:
```bash
npx tsx scripts/test-db.ts
```

---

## Step 5: Create Type Definitions (5 minutes)

### Create `src/types/index.ts`
```typescript
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

// Conversation State
export interface ConversationState {
  id: string;
  session_id: string;
  current_section: number;
  section_1_complete: boolean;
  section_2_complete: boolean;
  section_3_complete: boolean;
  section_4_complete: boolean;
  profile: UserProfile | null;
  selected_destination_id: number | null;
  trip_details: TripDetails | null;
  contact_info: any | null;
  status: 'active' | 'completed' | 'abandoned';
}
```

---

## Step 6: Project Structure

```
node-booking-system/
├── data/
│   ├── database.db          ← Your SQLite database
│   ├── backups/             ← Automatic backups
│   └── *.json              ← Original data files
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts      ← Main chat endpoint
│   │   │   ├── recommendations/
│   │   │   │   └── route.ts      ← Get recommendations
│   │   │   └── bookings/
│   │   │       └── route.ts      ← Create booking
│   │   ├── page.tsx              ← Landing page
│   │   └── chat/
│   │       └── page.tsx          ← Chat interface
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── ui/                   ← Shadcn components
│   ├── lib/
│   │   ├── db.ts                 ← Database connection
│   │   ├── agents/
│   │   │   ├── profile-agent.ts  ← Section 1
│   │   │   ├── recommendation-agent.ts  ← Section 2
│   │   │   ├── trip-agent.ts     ← Section 3
│   │   │   └── booking-agent.ts  ← Section 4
│   │   └── conversation/
│   │       ├── state.ts          ← State management
│   │       └── messages.ts       ← Message logging
│   └── types/
│       └── index.ts              ← TypeScript types
├── scripts/
│   ├── 001_add_milestone_fields.sql
│   ├── 002_populate_interest_scores.sql
│   └── run-migrations.sh
└── docs/
    ├── PRD-Intelligent-Booking-Assistant.md
    ├── TECHNICAL-ARCHITECTURE-SQLITE.md
    └── DATA-MAPPING-ANALYSIS.md
```

---

## Step 7: Create First API Route (5 minutes)

### Create `src/app/api/session/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const sessionId = randomUUID();
  const conversationId = randomUUID();
  
  // Create conversation
  const stmt = db.prepare(`
    INSERT INTO conversations (id, session_id, current_section, status)
    VALUES (?, ?, 1, 'active')
  `);
  
  stmt.run(conversationId, sessionId);
  
  return NextResponse.json({
    sessionId,
    conversationId,
    currentSection: 1
  });
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }
  
  const stmt = db.prepare(`
    SELECT * FROM conversations WHERE session_id = ?
  `);
  
  const conversation = stmt.get(sessionId);
  
  if (!conversation) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  
  return NextResponse.json(conversation);
}
```

### Test it
```bash
# Start dev server
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/session
```

**Expected response:**
```json
{
  "sessionId": "abc-123-...",
  "conversationId": "def-456-...",
  "currentSection": 1
}
```

---

## What You Have Now ✅

1. ✅ SQLite database with 973 records
2. ✅ Enhanced schema with interest scores
3. ✅ Next.js project structure
4. ✅ Database connection module
5. ✅ Type definitions
6. ✅ First working API route

---

## Next Steps (Week 1-2)

### Week 1: Core Backend
- [ ] Implement Section 1 Agent (profile extraction)
- [ ] Implement Section 2 Agent (recommendations)
- [ ] Implement Section 3 Agent (trip finalization)
- [ ] Implement Section 4 Agent (booking creation)
- [ ] Set up OpenAI integration
- [ ] Create validation logic

### Week 2: Frontend
- [ ] Build chat interface
- [ ] Add progress bar component
- [ ] Create message bubbles
- [ ] Add section transitions
- [ ] Build destination cards
- [ ] Add booking summary view

---

## Development Commands

```bash
# Run dev server
npm run dev

# Run migrations
./scripts/run-migrations.sh

# Query database
sqlite3 data/database.db

# View database in GUI (optional)
# Install: brew install --cask db-browser-for-sqlite
open data/database.db
```

---

## Environment Variables

Create `.env.local`:
```bash
# OpenAI API Key
OPENAI_API_KEY=sk-...

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Secret
SESSION_SECRET=generate-a-random-32-char-string
```

---

## Troubleshooting

### Database locked error
```bash
# Stop all processes using the database
lsof | grep database.db
# Kill processes if needed

# Or disable WAL mode temporarily
sqlite3 data/database.db "PRAGMA journal_mode = DELETE;"
```

### TypeScript errors with better-sqlite3
```bash
npm install -D @types/better-sqlite3
```

### Migration failed
```bash
# Restore from backup
cp data/backups/database_backup_TIMESTAMP.db data/database.db
```

---

## Useful SQLite Commands

```bash
# Open database
sqlite3 data/database.db

# List tables
.tables

# Show schema
.schema destinations

# Query with formatting
.mode column
.headers on
SELECT * FROM destinations WHERE type='city' LIMIT 3;

# Export to CSV
.mode csv
.output destinations.csv
SELECT * FROM destinations;
.output stdout

# Exit
.quit
```

---

## Resources

- **SQLite Rules**: `.cursor/rules/db-rules.mdc`
- **PRD**: `docs/PRD-Intelligent-Booking-Assistant.md`
- **Architecture**: `docs/TECHNICAL-ARCHITECTURE-SQLITE.md`
- **Data Mapping**: `docs/DATA-MAPPING-ANALYSIS.md`

---

## Ready to Code! 🚀

You now have:
- ✅ Database ready
- ✅ Migrations complete
- ✅ Next.js project initialized
- ✅ Database connection working
- ✅ First API route created

**Start with implementing Section 1 (Profile Agent)!**

See `docs/TECHNICAL-ARCHITECTURE-SQLITE.md` for detailed implementation examples.

