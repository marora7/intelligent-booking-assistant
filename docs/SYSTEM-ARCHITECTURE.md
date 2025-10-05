# System Architecture - Intelligent Booking Assistant

**Technical Architecture Documentation**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layer-by-Layer Breakdown](#layer-by-layer-breakdown)
3. [Data Flow](#data-flow)
4. [Component Details](#component-details)
5. [Database Schema](#database-schema)
6. [Key Algorithms](#key-algorithms)
7. [Technology Stack](#technology-stack)
8. [Performance & Scalability](#performance--scalability)

---

## Architecture Overview

### High-Level System View

```
┌─────────────────────────────────────────────────────────────────┐
│                         👤 USER                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   🎨 CLIENT LAYER                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (React 19 + TypeScript + TailwindCSS)  │  │
│  │  • 2-Column Layout (Journey Sidebar + Chat)              │  │
│  │  • Horizontal Progress Bar (4 sections)                  │  │
│  │  • AI Suggestion Chips                                   │  │
│  │  • Real-time Updates                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/JSON
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   ⚙️  APPLICATION LAYER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  API Routes (Next.js)                                     │  │
│  │  • POST /api/chat         → GPT-5 conversation           │  │
│  │  • GET  /api/recommendations → Destination matching      │  │
│  │  • POST /api/session      → Session initialization       │  │
│  │  • POST /api/suggestions  → AI-powered suggestions       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  State Manager                                            │  │
│  │  • Get/Create Conversation                                │  │
│  │  • Track Current Section (1-4)                            │  │
│  │  • Validate Milestone Completion                          │  │
│  │  • Advance to Next Section                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   🤖 AI AGENT LAYER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Agent Orchestrator (Routes to Section Agent)            │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Section Agents                                           │  │
│  │  1. Profile Agent       → Extract user preferences       │  │
│  │  2. Recommendation Agent→ Match destinations             │  │
│  │  3. Trip Agent          → Finalize dates/activities      │  │
│  │  4. Booking Agent       → Create booking                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  OpenAI GPT-5 (Responses API)                            │  │
│  │  • Natural Language Understanding                         │  │
│  │  • Structured Data Extraction                             │  │
│  │  • Conversational Response Generation                     │  │
│  │  • Reasoning Effort: Medium (S1), Low (S2-4)            │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   💾 DATA LAYER                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  SQLite Database (database.db) - 973 records             │  │
│  │                                                           │  │
│  │  📋 Session Tables                                        │  │
│  │  • conversations  → Session state, current section       │  │
│  │  • messages       → Chat history                         │  │
│  │                                                           │  │
│  │  🌍 Content Tables                                        │  │
│  │  • destinations   → 37 cities with interest scores       │  │
│  │  • attractions    → 320 tourist attractions              │  │
│  │  • activities     → 320 tours and experiences            │  │
│  │  • packages       → 56 pre-built travel packages         │  │
│  │  • restaurants    → 240 dining options                   │  │
│  │                                                           │  │
│  │  📝 Booking Table                                         │  │
│  │  • bookings       → Confirmed booking records            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Diagram (Mermaid)

```mermaid
graph LR
    User([👤 User]) --> ClientLayer
    
    subgraph ClientLayer["CLIENT LAYER"]
        direction TB
        FrontendUI["Next.js 15 Frontend<br/>---<br/>• 2-Column Layout<br/>• Journey Sidebar<br/>• Chat Interface<br/>• Progress Bar"]
    end
    
    subgraph APILayer["APPLICATION LAYER"]
        direction TB
        APIRoutes["API Routes<br/>---<br/>• POST /api/chat<br/>• GET /api/recommendations<br/>• POST /api/session<br/>• POST /api/suggestions"]
        StateManager["State Manager<br/>---<br/>• Section Tracking<br/>• Validation<br/>• Milestone Control"]
    end
    
    subgraph AgentLayer["AI AGENT LAYER"]
        direction TB
        Orchestrator["Agent Orchestrator"]
        Agents["4 Section Agents<br/>---<br/>1. Profile<br/>2. Recommendations<br/>3. Trip Details<br/>4. Booking"]
        LLM["OpenAI GPT-5<br/>---<br/>• NL Understanding<br/>• Data Extraction<br/>• Response Generation"]
    end
    
    subgraph DataLayer["DATA LAYER"]
        direction TB
        Database[("SQLite DB<br/>---<br/>973 records<br/>9 tables")]
    end
    
    ClientLayer -->|HTTP/JSON| APIRoutes
    APIRoutes --> StateManager
    APIRoutes --> Orchestrator
    Orchestrator --> Agents
    Agents --> LLM
    StateManager --> Database
    Agents --> Database
    
    style ClientLayer fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style APILayer fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style AgentLayer fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    style DataLayer fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style User fill:#ffebee,stroke:#c62828,stroke-width:2px
```

---

## Layer-by-Layer Breakdown

### 1️⃣ Client Layer (Next.js 15 + React 19)

**Components:**
```
App Layout (layout.tsx)
└── Chat Page (page.tsx)
    ├── Header
    │   ├── Logo
    │   └── Horizontal Progress Bar
    │       └── 4 Section Steps
    │
    ├── 2-Column Layout
    │   ├── Journey Sidebar (Left, 25-60% adjustable)
    │   │   ├── Journey Header
    │   │   ├── Section Cards (1-4, collapsible)
    │   │   ├── Destination Card
    │   │   └── Trip Summary
    │   │
    │   └── Chat Interface (Right, 40-75% adjustable)
    │       ├── Message List
    │       │   ├── User Messages
    │       │   └── Agent Messages
    │       ├── Suggestion Chips (AI-generated)
    │       ├── Helper Text (context-aware)
    │       └── Input Area
    │           ├── Text Input
    │           ├── Character Counter
    │           └── Send Button
    │
    └── Resize Handle (between panels)
```

**Key Features:**
- Resizable panels with drag handle
- Collapsible section cards
- Real-time journey updates
- Glassmorphism design
- Custom scrollbars
- Responsive layouts

**Tech Stack:**
- Next.js 15 (App Router)
- React 19
- TypeScript 5+
- TailwindCSS 3.4
- Lucide React (icons)
- react-markdown (AI responses)

---

### 2️⃣ Application Layer (Next.js API Routes)

**API Endpoints:**

#### POST /api/chat
Main GPT-5 conversation endpoint

**Request:**
```typescript
{
  sessionId: string,
  message: string
}
```

**Response:**
```typescript
{
  message: string,           // AI response
  section: number,           // Current section (1-4)
  profile?: UserProfile,     // Extracted profile data
  canAdvance: boolean,       // Can advance to next section
  sectionComplete: boolean,  // Current section complete
  metadata?: any            // Additional data
}
```

**Logic:**
1. Get/create conversation from session
2. Log user message
3. Get recent message history (10 messages)
4. Route to appropriate section agent
5. Process with GPT-5
6. Update database
7. Check milestone completion
8. Return response

---

#### GET /api/recommendations
Destination matching endpoint

**Query Params:**
- `sessionId`: string (required)

**Response:**
```typescript
{
  destinations: Array<{
    id: string,
    name: string,
    matchScore: number,      // 0-100
    budget: string,          // e.g., "€800-1200"
    highlights: string[],
    reason: string
  }>
}
```

**Logic:**
1. Get user profile from session
2. Query all destinations from database
3. Calculate match scores using algorithm
4. Sort by score, return top 5

---

#### POST /api/session
Session initialization

**Response:**
```typescript
{
  sessionId: string,        // UUID
  conversationId: string,   // UUID
  currentSection: number    // Default: 1
}
```

---

#### POST /api/suggestions
AI-powered suggestion generation

**Request:**
```typescript
{
  sessionId: string,
  lastAiMessage: string
}
```

**Response:**
```typescript
{
  suggestions: string[]     // 3-4 contextual suggestions
}
```

**Logic:**
1. Get conversation context
2. Ask GPT-5 to analyze last AI message
3. Generate 3-4 relevant quick replies
4. Return suggestions

---

### 3️⃣ AI Agent Layer

**Agent Orchestrator:**
Routes requests to the appropriate section agent based on current section.

```typescript
function routeToAgent(section: number, message: string, profile: any) {
  switch (section) {
    case 1: return profileAgent.process(message, profile);
    case 2: return recommendationAgent.process(message, profile);
    case 3: return tripAgent.process(message, profile);
    case 4: return bookingAgent.process(message, profile);
  }
}
```

---

**Section Agents:**

#### 1. Profile Agent (Section 1)
**Purpose:** Extract user preferences

**Extracts:**
- Interests (art, food, nature, etc.)
- Budget tier (budget/moderate/luxury)
- Group type and size
- Duration
- Travel season
- Pace preference
- Weather preference

**Process:**
1. Call GPT-5 with extraction prompt
2. Parse structured JSON response
3. Update profile in database
4. Validate completeness
5. Generate clarifying questions if incomplete
6. Mark section complete when all fields present

---

#### 2. Recommendation Agent (Section 2)
**Purpose:** Match destinations and handle exploration

**Functions:**
- Calculate destination match scores
- Present top 5 recommendations
- Answer questions about destinations
- Compare destinations
- Detect selection intent

**Scoring Algorithm:**
```typescript
function calculateMatchScore(profile, destination) {
  let score = 0;
  
  // Interest alignment (40%)
  const interestScores = profile.interests.map(interest => 
    destination[`interest_${interest}`] || 50
  );
  const avgInterest = average(interestScores);
  score += avgInterest * 0.4;
  
  // Budget fit (25%)
  if (destination.budget_tier === profile.budget) {
    score += 25;
  } else if (withinOneTier(destination.budget_tier, profile.budget)) {
    score += 15;
  }
  
  // Season match (15%)
  if (destination.best_seasons?.includes(profile.travel_season)) {
    score += 15;
  } else {
    score += 7; // Partial credit
  }
  
  // Pace alignment (20%)
  const paceScore = destination[`pace_${profile.pace}`] || 50;
  score += (paceScore / 100) * 20;
  
  return Math.round(Math.min(score, 100));
}
```

---

#### 3. Trip Agent (Section 3)
**Purpose:** Collect trip details

**Collects:**
- Exact travel dates (start, end)
- Arrival/departure times
- Package selection or custom accommodation
- Activities selection
- Special requests

**Validation:**
- Dates are in future
- End date after start date
- Budget tracking
- Minimum selections met

---

#### 4. Booking Agent (Section 4)
**Purpose:** Finalize and create booking

**Functions:**
- Generate complete trip summary
- Collect contact information
- Validate email and phone
- Create booking record
- Generate confirmation number
- Display success message

---

**GPT-5 Integration:**

**Configuration:**
```typescript
const gptResponse = await openai.responses.create({
  model: "gpt-5",
  input: `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}`,
  reasoning: { 
    effort: section === 1 ? "medium" : "low" 
  }
});
```

**Features:**
- Section 1: Medium reasoning for complex extraction
- Sections 2-4: Low reasoning for faster responses
- Context: Last 10 messages
- Structured outputs for data extraction
- Natural conversational responses

---

### 4️⃣ Data Layer (SQLite)

**Database Configuration:**
```typescript
import Database from 'better-sqlite3';
const db = new Database('./data/database.db');

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB
```

**Tables:** 9 tables, 973 total records

---

## Data Flow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Next.js UI
    participant API as /api/chat
    participant SM as State Manager
    participant AG as Section Agent
    participant GPT as GPT-5
    participant DB as SQLite DB
    
    U->>UI: Types message: "I love art and food"
    UI->>API: POST /api/chat {sessionId, message}
    
    API->>SM: getOrCreateConversation(sessionId)
    SM->>DB: SELECT * FROM conversations
    DB-->>SM: Return conversation state
    SM-->>API: {id, section: 1, profile: {...}}
    
    API->>AG: Process message in Section 1
    AG->>GPT: Extract profile from: "I love art and food"
    GPT-->>AG: {interests: ['art', 'food']}
    
    AG->>DB: UPDATE conversations SET profile = ?
    DB-->>AG: Success
    
    AG->>AG: validateProfileComplete()
    AG-->>AG: Missing: budget, duration, season...
    
    AG->>GPT: Generate clarifying question
    GPT-->>AG: "Great! What's your budget range?"
    
    AG->>DB: INSERT INTO messages (role, content, section)
    DB-->>AG: Success
    
    AG-->>API: {response, canAdvance: false, metadata}
    API-->>UI: JSON response
    UI-->>U: Display: "Great! What's your budget range?"
    
    Note over U,DB: User continues conversation...
    
    U->>UI: "Moderate budget, 4 days in June"
    UI->>API: POST /api/chat
    API->>SM: getCurrentSection() → 1
    API->>AG: Process with Section 1 Agent
    AG->>GPT: Extract: budget, duration, season
    GPT-->>AG: {budget: 'moderate', duration: 4, season: 'summer'}
    AG->>DB: UPDATE profile
    AG->>AG: validateProfileComplete() → ✓ Complete!
    AG->>DB: markSectionComplete(sessionId, 1)
    AG-->>API: {response, canAdvance: true}
    
    Note over API,SM: User signals advancement
    
    API->>SM: advanceSection(sessionId)
    SM->>DB: UPDATE conversations SET current_section = 2
    DB-->>SM: Success
    SM-->>API: New section: 2
    
    Note over U,DB: Now in Section 2 - Recommendations
    
    API->>AG: Section 2 Agent activated
    AG->>DB: SELECT * FROM destinations WHERE type='city'
    DB-->>AG: 37 cities
    AG->>AG: calculateMatchScores(profile, destinations)
    AG-->>AG: Top 5 matches with scores
    AG->>GPT: Format recommendations for user
    GPT-->>AG: Formatted response with top 5
    AG-->>API: {recommendations, scores}
    API-->>UI: Response
    UI-->>U: Displays 5 destination cards
```

---

## Component Details

### State Manager

**Location:** `src/lib/conversation/state.ts`

**Functions:**

```typescript
// Get or create conversation
function getOrCreateConversation(sessionId: string): Conversation {
  let conversation = db.prepare(
    'SELECT * FROM conversations WHERE session_id = ?'
  ).get(sessionId);
  
  if (!conversation) {
    const id = generateId();
    db.prepare(`
      INSERT INTO conversations (id, session_id, current_section, status)
      VALUES (?, ?, 1, 'active')
    `).run(id, sessionId);
    conversation = { id, session_id: sessionId, current_section: 1, status: 'active' };
  }
  
  return conversation;
}

// Get current section
function getCurrentSection(sessionId: string): number {
  const conv = db.prepare(
    'SELECT current_section FROM conversations WHERE session_id = ?'
  ).get(sessionId);
  return conv?.current_section || 1;
}

// Advance to next section
function advanceSection(sessionId: string): void {
  db.prepare(`
    UPDATE conversations 
    SET current_section = current_section + 1,
        updated_at = strftime('%s', 'now')
    WHERE session_id = ?
  `).run(sessionId);
}

// Mark section complete
function markSectionComplete(sessionId: string, section: number): void {
  // Update section status in profile metadata
  const conv = getOrCreateConversation(sessionId);
  const profile = JSON.parse(conv.profile || '{}');
  profile[`section_${section}_complete`] = true;
  
  db.prepare(`
    UPDATE conversations SET profile = ? WHERE session_id = ?
  `).run(JSON.stringify(profile), sessionId);
}
```

---

### Message Logger

**Location:** `src/lib/conversation/messages.ts`

**Functions:**

```typescript
// Log message
function logMessage(
  conversationId: string, 
  role: 'user' | 'assistant', 
  content: string, 
  section: number
): void {
  const id = generateId();
  db.prepare(`
    INSERT INTO messages (id, conversation_id, role, content, section, created_at)
    VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'))
  `).run(id, conversationId, role, content, section);
}

// Get recent messages
function getRecentMessages(conversationId: string, limit: number = 10): Message[] {
  return db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `).all(conversationId, limit).reverse();
}
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    conversations ||--o{ messages : has
    conversations ||--o| bookings : creates
    destinations ||--o{ attractions : contains
    destinations ||--o{ activities : contains
    destinations ||--o{ packages : offers
    destinations ||--o{ restaurants : has
    conversations }o--|| destinations : selects
    
    conversations {
        text id PK
        text session_id UK
        int current_section
        text profile
        text selected_destination
        text trip_details
        text status
        int created_at
        int updated_at
    }
    
    messages {
        text id PK
        text conversation_id FK
        text role
        text content
        int section
        int created_at
    }
    
    destinations {
        text id PK
        text name
        text country
        text type
        text budget_tier
        real avg_cost_per_day
        int interest_art
        int interest_food
        int interest_history
        int interest_nature
        int interest_nightlife
        int interest_relaxation
        int pace_relaxed
        int pace_moderate
        int pace_fast
    }
    
    bookings {
        text id PK
        text confirmation_number UK
        text conversation_id FK
        text destination_id FK
        text start_date
        text end_date
        int num_travelers
        real total_price
        text status
        int created_at
    }
    
    attractions {
        text id PK
        text destination_id FK
        text name
        text category
        real rating
        int duration_hours
        text price_level
    }
    
    activities {
        text id PK
        text destination_id FK
        text name
        text category
        real price
        int duration_hours
        text difficulty
    }
    
    packages {
        text id PK
        text destination_id FK
        text name
        int duration_days
        real price
        text included_items
    }
    
    restaurants {
        text id PK
        text destination_id FK
        text name
        text cuisine_type
        text price_level
        real rating
    }
```

### Table Details

**conversations** (Session tracking)
- Primary table for conversation state
- Stores profile as JSON
- Tracks current section (1-4)
- Status: active, completed, abandoned

**messages** (Chat history)
- All user and agent messages
- Linked to conversation
- Section stamped for context
- Chronological ordering

**destinations** (37 records)
- Enhanced with interest scores (0-100)
- Budget tiers for filtering
- Pace suitability scores
- Base for recommendations

**attractions, activities, packages, restaurants**
- Linked to destinations
- Used in Section 3 for trip planning
- Real pricing data
- Total: 936 records across all tables

---

## Key Algorithms

### 1. Recommendation Scoring Algorithm

```typescript
interface UserProfile {
  interests: string[];      // ['art', 'food']
  budget: BudgetTier;       // 'budget' | 'moderate' | 'luxury'
  travel_season: Season;    // 'spring' | 'summer' | 'fall' | 'winter'
  pace: Pace;              // 'relaxed' | 'moderate' | 'fast'
}

function calculateDestinationScore(
  profile: UserProfile, 
  destination: Destination
): number {
  let score = 0;
  
  // 1. Interest Match (40% weight)
  const interestScores = profile.interests.map(interest => {
    const key = `interest_${interest}` as keyof Destination;
    return (destination[key] as number) || 50;
  });
  const avgInterestScore = interestScores.reduce((a, b) => a + b, 0) / interestScores.length;
  score += avgInterestScore * 0.4;
  
  // 2. Budget Fit (25% weight)
  if (destination.budget_tier === profile.budget) {
    score += 25; // Perfect match
  } else if (isAdjacentTier(destination.budget_tier, profile.budget)) {
    score += 15; // Close match
  } else {
    score += 5;  // Distant match
  }
  
  // 3. Season Match (15% weight)
  // Simplified: all destinations suitable for all seasons
  score += 15;
  
  // 4. Pace Alignment (20% weight)
  const paceKey = `pace_${profile.pace}` as keyof Destination;
  const paceScore = (destination[paceKey] as number) || 50;
  score += (paceScore / 100) * 20;
  
  return Math.round(Math.min(score, 100));
}

function isAdjacentTier(tier1: string, tier2: string): boolean {
  const tiers = ['budget', 'moderate', 'luxury'];
  const index1 = tiers.indexOf(tier1);
  const index2 = tiers.indexOf(tier2);
  return Math.abs(index1 - index2) === 1;
}
```

---

### 2. Profile Extraction (GPT-5)

```typescript
const systemPrompt = `
You are a travel booking assistant. Extract travel preferences from user messages.

Return JSON with these fields (only include if mentioned):
- interests: array of strings from ["art", "food", "nature", "adventure", "nightlife", "shopping", "history", "relaxation"]
- budget: "budget" | "moderate" | "luxury"
- group_type: "solo" | "couple" | "family" | "group"
- group_size: number (1-20)
- duration_days: number (2-30)
- travel_season: "spring" | "summer" | "fall" | "winter"
- pace: "relaxed" | "moderate" | "fast"
- weather_pref: "warm" | "mild" | "cool" | "any"

Only extract explicitly mentioned information. Return empty object if nothing extractable.
`;

async function extractProfile(message: string): Promise<Partial<UserProfile>> {
  const response = await openai.responses.create({
    model: "gpt-5",
    input: `${systemPrompt}\n\nUser message: "${message}"\n\nExtracted JSON:`,
    reasoning: { effort: "medium" }
  });
  
  try {
    const extracted = JSON.parse(response.output_text);
    return extracted;
  } catch (error) {
    console.error('Failed to parse GPT-5 response:', error);
    return {};
  }
}
```

---

### 3. Profile Completeness Validation

```typescript
function validateProfileComplete(profile: Partial<UserProfile>): {
  complete: boolean;
  missing: string[];
} {
  const required = [
    'interests',
    'budget',
    'group_type',
    'group_size',
    'duration_days',
    'travel_season',
    'pace',
    'weather_pref'
  ];
  
  const missing = required.filter(field => {
    const value = profile[field as keyof UserProfile];
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return value === undefined || value === null;
  });
  
  return {
    complete: missing.length === 0,
    missing
  };
}
```

---

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Frontend Framework** | Next.js | 15.0.3 | Server-side rendering, routing, App Router |
| **UI Library** | React | 19.0.0 | Component-based UI |
| **Language** | TypeScript | 5.7.2 | Type safety |
| **Styling** | TailwindCSS | 3.4.15 | Utility-first CSS |
| **Database** | SQLite | - | Embedded database |
| **DB Driver** | better-sqlite3 | 11.7.0 | Synchronous SQLite driver |
| **AI Provider** | OpenAI GPT-5 | - | Natural language processing |
| **OpenAI SDK** | openai | 4.73.0 | API client |
| **Session** | iron-session | 8.0.3 | Secure session management |
| **Validation** | Zod | 3.23.8 | Schema validation |
| **Markdown** | react-markdown | 9.0.1 | Render AI responses |
| **Icons** | lucide-react | 0.469.0 | Icon library |

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # Main GPT-5 endpoint
│   │   ├── recommendations/route.ts   # Destination matching
│   │   ├── session/route.ts          # Session management
│   │   └── suggestions/route.ts       # AI suggestions
│   ├── page.tsx                       # Main chat UI
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Global styles
├── lib/
│   ├── db.ts                          # SQLite connection
│   ├── agents/
│   │   ├── profile-agent.ts           # Section 1 logic
│   │   └── recommendation-agent.ts    # Section 2 logic
│   └── conversation/
│       ├── state.ts                   # State management
│       └── messages.ts                # Message logging
└── types/
    └── index.ts                       # TypeScript types
```

---

## Performance & Scalability

### Current Optimizations

**Database:**
- ✅ WAL mode enabled for better concurrency
- ✅ Foreign keys enforced for data integrity
- ✅ Prepared statements for query reuse
- ✅ Indexes on frequently queried columns
- ✅ Transaction batching for bulk operations

**API:**
- ✅ Synchronous SQLite (no async overhead)
- ✅ Session caching in database
- ✅ Conversation history limited to 10 messages
- ✅ Reasoning effort: Low for Sections 2-4 (faster responses)

**Frontend:**
- ✅ Server-side rendering with Next.js
- ✅ TailwindCSS for small bundle size
- ✅ Component lazy loading
- ✅ Optimized re-renders

### Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| API Response Time (P95) | < 2s | ✅ Met |
| Page Load (Initial) | < 1s | ✅ Met |
| GPT-5 Response Time | < 3s | ✅ Met |
| Database Query Time | < 100ms | ✅ Met |
| Section Completion Rate | > 90% | TBD |
| End-to-End Booking Time | < 15min | ✅ Met |

### Production Deployment

**Current (Development):**
- Local SQLite file
- Single process
- No caching layer

**Recommended (Production):**

**Option 1: Vercel + Turso**
```
Vercel (Next.js Serverless)
├── API Routes (Lambda Functions)
├── Static Assets (CDN)
└── Turso (Hosted SQLite)
    ├── Edge replication
    ├── Global distribution
    └── High availability
```

**Option 2: Traditional Server**
```
VPS (e.g., DigitalOcean)
├── Node.js server (PM2)
├── SQLite with WAL
├── Nginx reverse proxy
└── Automated backups
```

**Scalability Considerations:**

For **< 1000 users**: Current SQLite solution is sufficient

For **> 1000 users**:
- Migrate to Turso (serverless SQLite with edge replication)
- Add Redis for session caching
- Implement rate limiting (100 req/min per IP)
- Add LLM response caching

For **> 10,000 users**:
- Consider PostgreSQL migration
- Implement horizontal scaling
- Add load balancer
- Use dedicated AI caching layer

---

## Monitoring & Observability

**Recommended Tools:**
- **Vercel Analytics**: Page views, performance metrics
- **Sentry**: Error tracking and alerting
- **OpenAI Dashboard**: Token usage, costs monitoring
- **Custom Logging**: SQLite query logs, conversation metrics

**Key Metrics to Track:**
- API response times (P50, P95, P99)
- GPT-5 token usage and costs
- Database query performance
- Section completion rates
- Drop-off points
- Conversion rate (Section 1 → Booking complete)

---

## Security Considerations

**Data Protection:**
- ✅ Session IDs are UUIDs (unpredictable)
- ✅ No sensitive data in URLs
- ✅ SQLite prepared statements (SQL injection protection)
- ✅ Environment variables for API keys
- ⚠️ TODO: Input sanitization for user messages
- ⚠️ TODO: Rate limiting per IP/session

**API Security:**
- ✅ CORS configured for Next.js
- ✅ iron-session for secure session management
- ⚠️ TODO: API key rotation policy
- ⚠️ TODO: Request validation with Zod schemas

**Database Security:**
- ✅ Foreign key constraints
- ✅ Data validation before insert
- ⚠️ TODO: Encryption at rest
- ⚠️ TODO: Regular backup strategy

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database
sqlite3 data/database.db

# Run database migrations
./scripts/run-migrations.sh

# Backup database
cp data/database.db data/backups/backup_$(date +%Y%m%d_%H%M%S).db
```

---

## References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [OpenAI GPT-5 API](https://platform.openai.com/docs)
- [Better-SQLite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

**For user flow and business logic, see:** [USER-FLOW.md](./USER-FLOW.md)
