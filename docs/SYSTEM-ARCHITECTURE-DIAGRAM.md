# System Architecture Diagram

## Intelligent Booking Assistant - Technical Architecture

### Architecture Overview (Text)

```
┌─────────────────────────────────────────────────────────────────┐
│                         👤 USER                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   🎨 CLIENT LAYER                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (React + TypeScript + TailwindCSS)     │  │
│  │  • Chat Interface (message input/output)                 │  │
│  │  • Progress Tracker (Section 1-4 indicator)              │  │
│  │  • Recommendation Cards (destination display)            │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/JSON
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   ⚙️  APPLICATION LAYER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  API Routes (Next.js)                                     │  │
│  │  • POST /api/chat         → Main conversation handler    │  │
│  │  • GET  /api/recommendations → Fetch destinations        │  │
│  │  • POST /api/session      → Session management           │  │
│  │  • POST /api/suggestions  → Dynamic suggestions          │  │
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
│  │  OpenAI GPT-5                                             │  │
│  │  • Natural Language Understanding                         │  │
│  │  • Structured Data Extraction                             │  │
│  │  • Response Generation                                    │  │
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

### High-Level System Architecture

```mermaid
graph LR
    User([👤 User]) --> ClientLayer
    
    subgraph ClientLayer["CLIENT LAYER"]
        direction TB
        FrontendUI["Next.js Frontend<br/>---<br/>• Chat Interface<br/>• Progress Tracker<br/>• Recommendation Cards"]
    end
    
    subgraph APILayer["APPLICATION LAYER"]
        direction TB
        APIRoutes["API Routes<br/>---<br/>• POST /api/chat<br/>• GET /api/recommendations<br/>• GET/POST /api/session"]
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
        Database[("SQLite DB<br/>---<br/>973 records<br/>8 tables")]
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

### Detailed Component Architecture

```mermaid
graph TB
    subgraph UIComponents["🎨 UI COMPONENTS"]
        direction LR
        Chat["Chat Component"]
        Progress["Progress Bar"]
        Cards["Destination Cards"]
    end
    
    subgraph APIEndpoints["🔌 API ENDPOINTS"]
        direction LR
        ChatAPI["/api/chat"]
        RecAPI["/api/recommendations"]
        SessionAPI["/api/session"]
        SuggestAPI["/api/suggestions"]
    end
    
    subgraph AIAgents["🤖 AI AGENTS"]
        direction LR
        Agent1["Section 1<br/>Profile"]
        Agent2["Section 2<br/>Recommendations"]
        Agent3["Section 3<br/>Trip Details"]
        Agent4["Section 4<br/>Booking"]
    end
    
    subgraph DBTables["💾 DATABASE TABLES"]
        direction LR
        Conv["conversations"]
        Msg["messages"]
        Dest["destinations"]
        Attr["attractions"]
        Act["activities"]
        Pkg["packages"]
        Book["bookings"]
    end
    
    Chat --> ChatAPI
    Cards --> RecAPI
    Progress --> SessionAPI
    
    ChatAPI --> Agent1
    ChatAPI --> Agent2
    ChatAPI --> Agent3
    ChatAPI --> Agent4
    
    RecAPI --> Agent2
    
    Agent1 -.-> Conv
    Agent1 -.-> Msg
    Agent2 -.-> Dest
    Agent2 -.-> Attr
    Agent3 -.-> Act
    Agent3 -.-> Pkg
    Agent4 -.-> Book
    
    style UIComponents fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style APIEndpoints fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style AIAgents fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style DBTables fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
```

### Data Flow Sequence

```mermaid
sequenceDiagram
    participant User
    participant UI as Next.js UI
    participant API as /api/chat
    participant Agent as Section Agent
    participant GPT as GPT-5
    participant DB as SQLite
    
    User->>UI: Types message
    UI->>API: POST /api/chat
    API->>DB: Get conversation state
    DB-->>API: Current section & profile
    API->>Agent: Route to section agent
    Agent->>GPT: Extract data from message
    GPT-->>Agent: Structured data
    Agent->>DB: Update profile/state
    DB-->>Agent: Success
    Agent->>GPT: Generate response
    GPT-->>Agent: Conversational reply
    Agent-->>API: Response + metadata
    API-->>UI: JSON response
    UI-->>User: Display message
```

## Component Descriptions

### Client Layer
- **Next.js Frontend**: React components with TailwindCSS styling
- **Chat Interface**: Message input/output with streaming responses
- **Progress Tracker**: Visual indicator of current section (1-4) and completion %
- **Recommendation Cards**: Interactive cards displaying destination options

### Application Layer
- **API Routes**: RESTful endpoints handling client requests
  - `/api/chat`: Main conversational endpoint using GPT-5
  - `/api/recommendations`: Fetch personalized destination matches
  - `/api/session`: Initialize or retrieve user session
  - `/api/suggestions`: Dynamic context-aware suggestions

- **State Manager**: Orchestrates conversation flow
  - Tracks current section (1-4)
  - Manages milestone completion
  - Advances users through sections
  - Persists state to database

### AI Agent Layer
- **Agent Orchestrator**: Routes requests to appropriate section agent
- **Section Agents**: Specialized handlers for each milestone
  - **Profile Agent**: Extracts preferences (interests, budget, group type, etc.)
  - **Recommendation Agent**: Matches user profile to destinations using scoring algorithm
  - **Trip Agent**: Collects dates, activities, packages
  - **Booking Agent**: Generates summary and creates booking

- **GPT-5 Integration**: 
  - Structured data extraction from natural language
  - Conversational response generation
  - Field validation and completeness checking

### Data Layer (SQLite)
- **conversations**: Session state and current progress
- **messages**: Full conversation history
- **destinations**: 37 European cities with interest scores
- **attractions**: 320 tourist attractions
- **activities**: 320 tours and experiences
- **packages**: 56 pre-built travel packages
- **restaurants**: 240 dining options
- **bookings**: Confirmed booking records

### Database Schema

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
        int selected_destination_id FK
        text trip_details
        text status
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
        int id PK
        text name
        text country
        text type
        int interest_art
        int interest_food
        text budget_tier
        real avg_daily_cost
    }
    
    bookings {
        int id PK
        text confirmation_number UK
        text session_id
        int destination_id FK
        int package_id FK
        text start_date
        text end_date
        int num_travelers
        real total_price
        text status
    }
    
    attractions {
        int id PK
        int destination_id FK
        text name
        text category
        real price
    }
    
    activities {
        int id PK
        int destination_id FK
        text name
        text type
        real price
    }
    
    packages {
        int id PK
        int destination_id FK
        text name
        real base_price
        int duration_days
    }
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | Server-side rendering, routing |
| UI | React + TypeScript | Component-based UI |
| Styling | TailwindCSS | Responsive design |
| Backend | Next.js API Routes | RESTful API endpoints |
| Database | SQLite + better-sqlite3 | Local persistent storage |
| AI | OpenAI GPT-5 | Natural language understanding |
| Session | iron-session | Secure session management |
| Validation | Zod | Schema validation |

## Data Flow Example

1. **User sends message**: "I want art and food in Europe"
2. **Chat API** receives POST to `/api/chat`
3. **State Manager** retrieves current section (Section 1)
4. **Orchestrator** routes to Profile Agent
5. **Profile Agent** calls GPT-5 to extract: `interests: ['art', 'food']`
6. **Database** updates conversation profile
7. **Profile Agent** validates completeness (still missing budget, duration, etc.)
8. **GPT-5** generates response: "Great! What's your budget range?"
9. **Response** streamed back to client
10. **UI** displays agent message in chat

## Scalability & Performance

### Current Optimizations
- **SQLite WAL Mode**: Better concurrency for read/write operations
- **Prepared Statements**: Reusable SQL queries for performance
- **Transaction Batching**: Multiple operations in single transaction
- **Session Caching**: Active sessions kept in memory
- **Index Optimization**: Indexes on frequently queried columns

### Production Considerations
- **Database**: Migrate to Turso (hosted SQLite) for serverless deployment
- **Caching**: Add Redis for LLM response caching
- **Monitoring**: Vercel Analytics + Sentry for error tracking
- **Rate Limiting**: 100 req/min per IP, 30 LLM calls/min per session

