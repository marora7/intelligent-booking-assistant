# Dynamic AI-Powered Suggestion System

**Status:** ✅ Production Ready

---

## Overview

The Intelligent Booking Assistant features a **context-aware suggestion system** that uses GPT-5 to generate relevant quick-response options based on the AI's most recent question. This improves user experience by providing click-to-send suggestions that adapt to the conversation flow.

---

## How It Works

### Architecture Flow

```
User receives AI message
         ↓
Frontend calls /api/suggestions
         ↓
GPT-5 analyzes the question
         ↓
Generates 3-4 contextual suggestions
         ↓
Display as clickable chips
         ↓
User clicks → Input populated → Send
```

### Technical Implementation

**API Endpoint:** `POST /api/suggestions`

**Request:**
```json
{
  "sessionId": "uuid",
  "lastAiMessage": "What's your budget for this trip?"
}
```

**Response:**
```json
{
  "suggestions": [
    "Moderate budget (€150-300/day)",
    "Luxury experience (€500+/day)",
    "Budget-friendly (under €100/day)",
    "Flexible, depends on location"
  ]
}
```

---

## GPT-5 Prompt Strategy

**System Prompt:**
```
You are a suggestion generator for a travel booking assistant.

Based on the AI's last message, generate 3-4 SHORT suggestions that help 
the user respond naturally.

RULES:
1. Answer what the AI is asking directly
2. Keep under 60 characters each
3. Make them conversational and natural
4. Return ONLY a JSON array of strings

AI's message: "{lastAiMessage}"

Return format: ["suggestion 1", "suggestion 2", "suggestion 3"]
```

**Configuration:**
- Model: `gpt-5`
- Reasoning effort: `low` (fast responses ~1-2s)
- Context: Last AI message only
- Output: JSON array of strings

---

## Frontend Integration

**Key Functions:**

1. **Generate Suggestions** (after each AI response)
```typescript
const generateSuggestions = async (lastAiMessage: string) => {
  const response = await fetch('/api/suggestions', {
    method: 'POST',
    body: JSON.stringify({ sessionId, lastAiMessage })
  });
  const data = await response.json();
  setDynamicSuggestions(data.suggestions);
};
```

2. **Display Logic**
```typescript
// Hide when user is typing or loading
if (isLoading || input.trim()) return [];

// Show AI-generated suggestions
return dynamicSuggestions;
```

3. **Click Handler**
```typescript
const handleSuggestionClick = (suggestion: string) => {
  setInput(suggestion);
  // User can then click send or edit
};
```

---

## UI Components

### Suggestion Chips

**Design:**
- White background with border
- Hover: Scale up + gradient background
- Staggered fade-in animation (50ms delay between chips)
- Click: Populates input field

**Layout:**
```tsx
<div className="flex flex-wrap gap-2">
  {suggestions.map((suggestion, index) => (
    <button
      key={index}
      onClick={() => handleSuggestionClick(suggestion)}
      className="px-4 py-2.5 bg-white hover:bg-gradient-to-r 
                 hover:from-blue-50 hover:to-indigo-50 
                 border-2 border-gray-200 hover:border-blue-400 
                 rounded-xl transform hover:scale-105 transition-all"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {suggestion}
    </button>
  ))}
</div>
```

### Helper Text

Shows current section and guidance:
```tsx
<div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl">
  <Sparkles className="w-4 h-4 text-blue-600" />
  <div>
    <div className="text-xs font-bold text-blue-700">
      Section {currentSection} of 4
    </div>
    <div className="text-sm text-gray-700">
      {helperText}
    </div>
  </div>
</div>
```

---

## Example Conversation Flows

### Example 1: Budget Question

**AI:** "Great! Now, what's your budget range for this trip?"

**Generated Suggestions:**
- Moderate budget (€150-300/day)
- Luxury experience (€500+/day)
- Budget-friendly (under €100/day)
- Flexible, depends on location

---

### Example 2: Travel Dates

**AI:** "When are you planning to travel?"

**Generated Suggestions:**
- Next summer (June-August)
- Spring (April-May)
- Flexible with dates
- Weekend getaway in fall

---

### Example 3: Destination Selection

**AI:** "Here are your top 5 destinations. Which interests you most?"

**Generated Suggestions:**
- I'd like to book Florence
- Tell me more about Amsterdam
- Compare Paris and Rome
- What's best for art lovers?

---

### Example 4: Pace Preference

**AI:** "Do you prefer a relaxed pace or packing in activities?"

**Generated Suggestions:**
- Relaxed, taking it slow
- Moderate, balanced pace
- Fast-paced, see everything
- Flexible, mix of both

---

## Best Practices

### ✅ Do's

**Keep Suggestions Short:**
- ✅ "Moderate budget (€150-300/day)"
- ✅ "June 15-20"
- ✅ "Relaxed pace"

**Include Context:**
- ✅ "Next summer (June-August)"
- ✅ "Luxury experience (€500+/day)"
- ✅ "I'd like to book Florence"

**Vary Options:**
- Specific: "June 15-20"
- General: "Mid-summer"
- Flexible: "Flexible with dates"

**Natural Language:**
- ✅ "I'd like to book Florence"
- ✅ "Tell me more about Paris"
- ✅ "Relaxed, taking it slow"

---

### ❌ Don'ts

**Too Long:**
- ❌ "I'm looking for a moderate budget experience with comfortable accommodations around €150-300 per day"

**No Context:**
- ❌ "June 15-20" (missing season context)
- ❌ "Moderate" (without price range)

**Too Many Emojis:**
- ❌ "🎨🖼️🏛️ Art galleries, museums, and cultural sites"
- ✅ "Art galleries and museums"

**Not Actionable:**
- ❌ "I'm thinking about it"
- ✅ "Tell me more about Amsterdam"

---

## Performance

**Response Time:**
- GPT-5 API call: ~1-2 seconds
- Suggestions load asynchronously (doesn't block conversation)
- User can continue typing while suggestions load

**Error Handling:**
- Graceful fallback if API fails
- No suggestions shown if error occurs
- User can still type freely

**Token Usage:**
- Average: ~200-300 tokens per request
- Model: gpt-5 with low reasoning effort
- Cost: Minimal (check OpenAI pricing)

---

## Configuration

### Adjust Number of Suggestions

In `src/app/api/suggestions/route.ts`:
```typescript
// Generate 3-4 suggestions (default)
// Change range as needed (2-6 recommended)
```

### Change Reasoning Effort

```typescript
reasoning: { effort: "low" }  
// Options: "low" (fast) | "medium" (better quality)
```

### Customize Prompt

Modify the system prompt in `/api/suggestions/route.ts` to change:
- Suggestion length (currently 60 chars max)
- Number of suggestions (currently 3-4)
- Style and tone
- Format

---

## Implementation Notes

**When Suggestions Appear:**
- After each AI response
- Only when input field is empty
- Not shown while AI is thinking

**When Suggestions Hide:**
- User starts typing
- AI is processing
- No suggestions generated
- API error occurs

**User Interaction:**
- Click suggestion → Populates input
- User can edit before sending
- Or click send immediately

---

## Integration with Sections

### Section 1: Profile Gathering
**Typical Suggestions:**
- Budget ranges
- Travel durations
- Group types
- Pace preferences
- Weather preferences

### Section 2: Destination Exploration
**Typical Suggestions:**
- Destination selections
- Information requests
- Comparison questions
- Exploration queries

### Section 3: Trip Details
**Typical Suggestions:**
- Date ranges
- Package selections
- Activity choices
- Time preferences

### Section 4: Confirmation
**Typical Suggestions:**
- Confirmation phrases
- Modification requests
- Contact information
- Final approval

---

## Summary

The dynamic suggestion system:
- ✅ Uses GPT-5 to analyze context
- ✅ Generates 3-4 relevant quick replies
- ✅ Adapts to conversation flow
- ✅ Improves user experience
- ✅ Reduces typing effort
- ✅ Maintains natural conversation

**Result:** Users can respond with a single click while maintaining conversational feel.

---

**For technical architecture, see:** [SYSTEM-ARCHITECTURE.md](./SYSTEM-ARCHITECTURE.md)