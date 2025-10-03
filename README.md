# 🚀 Intelligent Booking Assistant - MVP

AI-powered travel booking system with conversational interface and personalized recommendations.

## ✨ Features

- **GPT-5 Powered**: Uses OpenAI's latest GPT-5 model with Responses API
- **Milestone-Based Flow**: 4-section structured booking process with visual progress tracking
- **Smart Recommendations**: Interest-based destination matching with 973 real data points
- **Modern 2-Column Layout**: Journey sidebar (40%) + Chat interface (60%) for better UX
- **Beautiful Design Language**: Glassmorphism, gradients, shadows, and smooth animations
- **Real-time Progress**: Live journey details update as users make selections
- **No Mock Data**: Real AI processing with GPT-5, no fallback logic

## 🎯 Tech Stack

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **AI**: OpenAI GPT-5 (Responses API)
- **Styling**: TailwindCSS with custom gradients

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example env file:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get your OpenAI API key:**
- Visit https://platform.openai.com/api-keys
- Create a new API key
- Make sure you have access to GPT-5 models

### 3. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database

The SQLite database is already enhanced with:
- ✅ 37 destinations with interest scores (0-100)
- ✅ 320 attractions
- ✅ 320 activities with prices
- ✅ 56 packages
- ✅ 240 restaurants
- ✅ Milestone-based conversation tracking

**View database:**
```bash
sqlite3 data/database.db
```

## 🎨 UI Features

### Resizable 2-Column Layout
**Left Sidebar (25-60% adjustable)** - Journey Details:
- **Drag-to-resize**: Adjust panel width by dragging the handle between sections
- **Collapsible sections**: Click any section header to collapse/expand content
- Real-time progress tracking with animated step cards
- Live data display: interests, budget, group size, travel duration
- Selected destination card with match score badges
- Beautiful trip summary with total budget calculation
- Independent scrolling with custom styled scrollbar
- Glassmorphism background with gradient overlay

**Right Section (40-75% adjustable)** - Chat Interface:
- Scrollable chat history with smooth auto-scroll
- Gradient message bubbles (user: blue→indigo→purple, agent: white)
- **AI-Generated Suggestion Chips**: Context-aware suggestions based on AI's last question
- Helper text showing current section guidance
- Enhanced input area with character counter
- "AI is thinking..." loading state with animations
- Premium send button with hover effects

### Horizontal Step Progress Bar
- Modern design in header with animated progress line
- Shows 4 sections: Preferences → Destination → Trip Details → Confirmation
- Active step has animated pulse effect with ring glow
- Checkmark animations for completed steps
- Color-coded: Blue/Indigo/Purple (active), Emerald/Green (complete), Gray (pending)

### Design Language
- **Glassmorphism**: Backdrop blur effects throughout
- **Gradients**: Multi-color gradients (blue→indigo→purple)
- **Shadows**: Color-tinted shadows for depth
- **Animations**: FadeIn, SlideIn, ScaleIn, PulseSlow
- **Custom Scrollbars**: Thin, styled scrollbars for both panels
- **Hover Effects**: Scale, shadow, and color transitions
- **Responsive**: Mobile-friendly with adaptive layouts

## 🤖 GPT-5 Integration

### Features Used
- **Model**: `gpt-5` (latest reasoning model with enhanced capabilities)
- **Reasoning Effort**: `medium` for Section 1 (profile extraction), `low` for Sections 2-4
- **Smart Prompting**: Concise, markdown-formatted responses enforced via system prompts
- **No Fallbacks**: Pure AI-driven extraction and conversation

### Section 1: Profile Gathering
- GPT-5 asks natural, conversational questions
- Real-time extraction of user preferences (interests, budget, group, duration)
- Validates completeness before section advancement
- Shows extracted data in journey sidebar

### Section 2: Recommendations
- Interest-based matching using database scores
- GPT-5 presents top destinations with compelling reasons
- Detects destination selection from natural language
- Updates journey sidebar with selected destination and match score

### Section 3: Trip Finalization
- Collects trip details (dates, accommodation, activities)
- Maintains context from previous sections
- Advances when user is ready for review

### Section 4: Booking Confirmation
- Presents complete trip summary
- Generates confirmation number on final approval
- Shows booking confirmed status

### Smart Suggestion System
- **Context-Aware**: GPT-5 analyzes the AI's last question to generate relevant suggestions
- **Dynamic Generation**: Suggestions update after each AI response
- **Natural Language**: Conversational phrases that users can click to quickly respond
- **Adaptive**: Changes based on what information is needed (budget, dates, preferences, etc.)
- **Example Flow**:
  - AI asks: "What's your budget?"
  - Suggestions: "Moderate budget (€150-300/day)", "Luxury (€500+/day)", "Budget-friendly (under €100/day)"
  - User clicks → Input populated → Ready to send

## 📁 Project Structure

```
node-booking-system/
├── data/
│   ├── database.db          ← SQLite database (enhanced)
│   └── backups/             ← Automatic backups
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── session/     ← Session management
│   │   │   ├── chat/        ← GPT-5 chat endpoint
│   │   │   ├── suggestions/ ← AI-generated contextual suggestions
│   │   │   └── recommendations/
│   │   ├── page.tsx         ← Modern chat UI
│   │   └── globals.css
│   ├── lib/
│   │   ├── db.ts            ← Database connection
│   │   ├── conversation/    ← State management
│   │   └── agents/          ← Business logic
│   └── types/
│       └── index.ts         ← TypeScript types
└── docs/                    ← Comprehensive documentation
```

## 🧪 Testing the Application

### Complete Conversation Flow

**Section 1: Profile Gathering**
```
You: "We're a couple interested in art and food, 4 days in June, moderate budget"
AI: [Asks follow-up questions using GPT-5]
AI: [Shows extracted profile in journey sidebar]
→ Progress bar advances to Section 2
```

**Section 2: Get Recommendations**
```
You: "Show me destinations"
AI: [Presents top 5 destinations with match scores based on your interests]
You: "I'd like to book Florence"
AI: [Confirms selection and shows destination card in sidebar]
→ Progress bar advances to Section 3
```

**Section 3: Trip Details**
```
You: "June 15-19, prefer boutique hotels, want to see the Uffizi"
AI: [Collects additional trip details]
You: "Ready to review"
→ Progress bar advances to Section 4
```

**Section 4: Confirmation**
```
AI: [Shows complete trip summary]
You: "confirm"
AI: [Generates booking confirmation number]
→ Booking complete! 🎉
```

### Watch the UI Update
- **Journey Sidebar**: Updates in real-time as you provide information
- **Progress Bar**: Advances automatically when sections complete
- **Trip Summary Card**: Appears after destination selection with budget calculation

### Interactive Features
- **Resize Panels**: Hover over the vertical divider between sidebar and chat → Drag left/right to adjust width (25-60%)
- **Collapse Sections**: Click any section header (1-4) to collapse/expand its content
- **Quick Suggestions**: Click any suggestion chip to populate the input box instantly

### Visual Layout Guide
```
┌─────────────────────────────────────────────────────────────────────┐
│  Header: Logo | Progress: ① → ② → ③ → ④ | Status Badges           │
├──────────────────────┬──────────────────────────────────────────────┤
│                      │                                              │
│   JOURNEY DETAILS    │           CHAT INTERFACE                     │
│      (40% width)     │              (60% width)                     │
│                      │                                              │
│  ┌────────────────┐  │  ┌──────────────────────────────────────┐   │
│  │ Your Journey   │  │  │ Agent: Welcome! Tell me about...     │   │
│  │ 🔵 Tracking... │  │  └──────────────────────────────────────┘   │
│  └────────────────┘  │                                              │
│                      │  ┌──────────────────────────────────────┐   │
│  ┌────────────────┐  │  │ User: I want art and food in Italy   │   │
│  │ 1. Preferences │  │  └──────────────────────────────────────┘   │
│  │ ✓ Complete     │  │                                              │
│  │ • Art, Food    │  │  ┌──────────────────────────────────────┐   │
│  │ • Luxury       │  │  │ Agent: Perfect! Here are the top...  │   │
│  │ • 3 travelers  │  │  └──────────────────────────────────────┘   │
│  │ • 5 days       │  │                                              │
│  └────────────────┘  │     [Scrollable chat history]              │
│                      │                                              │
│  ┌────────────────┐  │                                              │
│  │ 2. Destination │  │                                              │
│  │ 🔵 Active      │  │                                              │
│  │ 📍 Florence    │  │                                              │
│  │ 91% match      │  │                                              │
│  └────────────────┘  │                                              │
│                      ├──────────────────────────────────────────────┤
│  [Trip Summary]      │  📝 [Input Area] Type message...    [Send]  │
│  €4,500 total        │                                              │
│                      │                                              │
└──────────────────────┴──────────────────────────────────────────────┘
        ↕                ║                   ↕
  Scrollable      Resize Handle        Scrollable
                  (Drag ↔)
```

**New Interactive Elements:**
- **║** = Draggable resize handle (hover to see tooltip)
- Click section headers to collapse/expand content
- Click suggestion chips to instantly populate input

## ⚙️ Configuration

### GPT-5 Settings

In `src/app/api/chat/route.ts`:

```typescript
// Section 1: More reasoning for complex profile extraction
const gptResponse = await openai.responses.create({
  model: "gpt-5",
  input: `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}`,
  reasoning: { effort: "medium" }
});

// Sections 2-4: Faster responses
const gptResponse = await openai.responses.create({
  model: "gpt-5",
  input: `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}`,
  reasoning: { effort: "low" }
});
```

### Adjust reasoning effort for your needs:
- `"low"`: Faster responses (~1-2s), suitable for straightforward tasks
- `"medium"`: Balanced reasoning (~2-4s), good for complex extraction
- `"high"`: Maximum reasoning capability, for difficult problems

**Note**: Higher effort levels consume more reasoning tokens. Monitor usage in OpenAI dashboard.

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | App URL (for production) | ❌ No |

## 🛠️ Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### View Database
```bash
sqlite3 data/database.db
```

### Useful Queries
```sql
-- View enhanced destinations
SELECT name, budget_tier, interest_art, interest_food 
FROM destinations 
WHERE type='city' 
LIMIT 5;

-- View conversations
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 10;

-- View messages
SELECT role, content FROM messages ORDER BY created_at DESC LIMIT 20;
```

## 🎯 Current Status

### ✅ Completed (MVP Ready)
- [x] **GPT-5 Integration**: Full Responses API implementation with reasoning control
- [x] **2-Column Layout**: Journey sidebar (40%) + Chat interface (60%)
- [x] **Modern UI/UX**: Horizontal progress bar with animations in header
- [x] **Section 1**: Profile gathering with AI extraction and validation
- [x] **Section 2**: Destination recommendations with interest-based matching
- [x] **Section 3**: Trip finalization flow (basic implementation)
- [x] **Section 4**: Booking confirmation with confirmation numbers
- [x] **Journey Sidebar**: Real-time progress tracking with live data updates
- [x] **Beautiful Design**: Glassmorphism, gradients, shadows, and animations
- [x] **Scrolling UX**: Independent scrolling for sidebar and chat with custom scrollbars
- [x] **Database**: Enhanced with interest scores, budget tiers, and conversation tracking
- [x] **Markdown Support**: Properly formatted AI responses with react-markdown
- [x] **Mobile Responsive**: Adaptive layout for all screen sizes

### 🎨 Design Features Implemented
- [x] Custom animations (fadeIn, slideIn, slideUp, scaleIn, pulseSlow)
- [x] Gradient backgrounds and buttons (blue→indigo→purple)
- [x] Color-tinted shadows for depth
- [x] Hover effects with scale and transition
- [x] Loading states with spinner animations
- [x] Status badges (AI Online, message counter)
- [x] Character counter in input area
- [x] Active step pulse effect
- [x] **Dynamic suggestion chips with staggered animations**
- [x] **Context-aware helper text for each section**
- [x] **AI-powered suggestion generation**
- [x] **Resizable panels with drag handle (25-60% range)**
- [x] **Collapsible section cards for compact view**
- [x] **Smart status updates for all 4 sections**

### 🚀 Next Enhancements (Optional)
- [ ] Section 3: Advanced trip customization with package selection UI
- [ ] Section 4: Enhanced booking summary with detailed breakdown
- [ ] Destination images from database
- [ ] Price breakdown calculator
- [ ] Export booking to PDF
- [ ] Email confirmation integration
- [ ] User authentication and saved trips

## 📖 Documentation

See `/docs` directory for:
- **PRD**: Complete product requirements
- **Technical Architecture**: Implementation guide
- **Data Mapping**: Database analysis
- **MVP Status**: Current progress

## 🐛 Troubleshooting

### "API key not found"
Make sure `.env.local` exists with your OpenAI API key.

### "Model not available"
GPT-5 is a new model. Make sure you have access:
- Check OpenAI dashboard
- Try `gpt-4-turbo-preview` as fallback in development

### Database locked
```bash
lsof | grep database.db
kill -9 [PID]
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

Add environment variables in Vercel dashboard.

### Other Platforms
- Ensure Node.js 20+
- Set `OPENAI_API_KEY` environment variable
- Database file will be ephemeral (consider Turso for persistence)

## 💡 Tips

### Performance
- **API Costs**: GPT-5 uses reasoning tokens. Monitor usage in OpenAI dashboard
- **Response Time**: `medium` effort takes ~2-4s, `low` is faster (~1-2s)
- **Conversation Context**: Recent message history (10 messages) is passed to GPT-5
- **Caching**: Database queries are synchronous and fast with better-sqlite3

### UI/UX Best Practices
- **Journey Sidebar**: Always visible showing user's progress and selections
- **Scrolling**: Both sidebar and chat scroll independently for better UX
- **Loading States**: "AI is thinking..." appears while GPT-5 processes
- **Progress Bar**: Advances automatically when section requirements are met
- **Animations**: Smooth transitions make the experience feel polished

### Development
- **Hot Reload**: Changes to UI reflect immediately in dev mode
- **Database**: View live data with `sqlite3 data/database.db`
- **Debugging**: Check browser console for API responses and state changes
- **GPT-5 Prompts**: System prompts enforce concise, markdown-formatted responses

## 📞 Support

Issues? Check:
1. `.env.local` file exists with valid API key
2. Dependencies installed (`npm install`)
3. Database migrations ran (automatic on first run)
4. OpenAI API key has GPT-5 access

---

**Built with ❤️ using Next.js 14, GPT-5, TailwindCSS, and SQLite**

✨ **MVP Status**: Production-ready with beautiful UI and complete 4-section booking flow

*Last updated: October 3, 2025 - v1.0 (MVP Complete)*

