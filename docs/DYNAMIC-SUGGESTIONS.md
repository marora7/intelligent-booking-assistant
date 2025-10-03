# Dynamic AI-Powered Suggestion System

## Overview

The Intelligent Booking Assistant features a **context-aware suggestion system** that uses GPT-5 to generate relevant response options based on the AI's most recent question. This dramatically improves user experience by providing quick-tap suggestions that adapt to the conversation flow.

## How It Works

### 1. **User-AI Conversation Flow**

```
AI: "What's your budget for this trip?"
   ↓ (GPT-5 analyzes question)
Suggestions Generated:
- "Moderate budget (€150-300/day)"
- "Luxury experience (€500+/day)"
- "Budget-friendly (under €100/day)"
- "Flexible, depends on location"
```

### 2. **Technical Architecture**

```typescript
┌─────────────────┐
│  User receives  │
│  AI message     │
└────────┬────────┘
         │
         v
┌─────────────────────────────────┐
│ Frontend: generateSuggestions() │
│ POST /api/suggestions           │
└────────┬────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ Backend: GPT-5 Responses API    │
│ Analyzes AI's question          │
│ Generates 5-6 contextual opts   │
└────────┬────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ Frontend: Display suggestions   │
│ User clicks → Input populated   │
└─────────────────────────────────┘
```

### 3. **API Endpoint: `/api/suggestions`**

**Location**: `src/app/api/suggestions/route.ts`

**Input**:
```json
{
  "message": "What's your budget for this trip?",
  "section": 1
}
```

**GPT-5 Prompt**:
```typescript
const systemPrompt = `You are a suggestion generator for a travel booking assistant.

Based on the AI assistant's last message, generate 5-6 SHORT, ACTIONABLE suggestions 
that would help the user respond naturally.

RULES:
1. Suggestions should directly answer what the AI is asking
2. Keep them SHORT (under 60 characters each)
3. Make them conversational and natural
4. Include relevant emojis where appropriate
5. Vary the options (budget/luxury, specific/general, etc.)
6. Return ONLY a JSON array of strings, nothing else

CONTEXT:
- Current Section: ${section}
- AI's last message: "${message}"

Return format: ["suggestion 1", "suggestion 2", ...]`
```

**Output**:
```json
{
  "suggestions": [
    "Moderate budget (€150-300/day)",
    "Luxury experience (€500+/day)",
    "Budget-friendly (under €100/day)",
    "Flexible, depends on location",
    "Mid-range comfort (€200-400/day)"
  ]
}
```

### 4. **Frontend Integration**

**File**: `src/app/page.tsx`

**Key Components**:

1. **State Management**:
```typescript
const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
```

2. **Suggestion Generation**:
```typescript
const generateSuggestions = async (lastAIMessage: string) => {
  const response = await fetch('/api/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: lastAIMessage,
      section: currentSection 
    })
  });
  
  const data = await response.json();
  setDynamicSuggestions(data.suggestions);
};
```

3. **Triggered After AI Response**:
```typescript
// In sendMessage() function
const data = await response.json();
setMessages(prev => [...prev, { role: 'agent', content: data.content }]);

// Generate contextual suggestions
generateSuggestions(data.content);
```

4. **Display Logic**:
```typescript
const getSuggestions = () => {
  if (isLoading || input.trim()) return []; // Hide when typing
  
  // Use AI-generated suggestions if available
  if (dynamicSuggestions.length > 0) {
    return dynamicSuggestions;
  }
  
  // Fallback to section-based defaults
  return defaultSuggestionsForSection(currentSection);
};
```

## UI Components

### Helper Text Box
```tsx
<div className="flex items-start gap-3 mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
    <Sparkles className="w-4 h-4 text-white" />
  </div>
  <div>
    <div className="text-xs font-bold text-blue-700">Section {currentSection} of 4</div>
    <div className="text-sm text-gray-700">{helperText}</div>
  </div>
</div>
```

### Suggestion Chips
```tsx
<div className="flex flex-wrap gap-2">
  {suggestions.map((suggestion, index) => (
    <button
      onClick={() => handleSuggestionClick(suggestion)}
      className="group relative px-4 py-2.5 bg-white hover:bg-gradient-to-r 
                 hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 
                 hover:border-blue-400 rounded-xl transform hover:scale-105"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {suggestion}
    </button>
  ))}
</div>
```

## Example Flows

### Example 1: Budget Question

**AI Message**: "Great! Now, what's your budget range for this trip?"

**Generated Suggestions**:
- 💰 Moderate budget (€150-300/day)
- ✨ Luxury experience (€500+/day)
- 🎒 Budget-friendly (under €100/day)
- 📊 Mid-range comfort (€200-400/day)
- 🤷 Flexible, depends on location

### Example 2: Travel Dates

**AI Message**: "When are you planning to travel?"

**Generated Suggestions**:
- 📅 June 15-20 (summer)
- 🌸 Late spring (May)
- 🍂 Early fall (September)
- 🗓️ Flexible, mid-year
- 🎄 Winter holidays

### Example 3: Destination Selection

**AI Message**: "Here are your top destinations. Which one interests you?"

**Generated Suggestions**:
- I'd like to book Florence
- Tell me more about Paris
- What's best for families in Barcelona?
- Show me luxury options in Rome
- Compare Florence and Venice

## Performance Considerations

### Response Time
- **GPT-5 API Call**: ~1-2 seconds (low reasoning effort)
- **User Experience**: Suggestions load asynchronously, doesn't block conversation
- **Fallback**: Default suggestions show immediately if API is slow

### Caching Strategy
Currently **no caching** - each AI response generates fresh suggestions.

**Future Enhancement**: Cache suggestions for common questions (e.g., budget, dates) to reduce API calls.

### Error Handling
```typescript
try {
  const response = await fetch('/api/suggestions', { ... });
  const data = await response.json();
  setDynamicSuggestions(data.suggestions);
} catch (error) {
  console.error('Error generating suggestions:', error);
  // Gracefully falls back to section-based defaults
  setDynamicSuggestions([]);
}
```

## Animation Details

### Staggered Entrance
```css
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}

/* Each suggestion chip has a delay */
style={{ animationDelay: `${index * 50}ms` }}
```

### Slide Up Effect
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Hover Effects
- **Scale**: `hover:scale-105`
- **Translate**: `hover:-translate-y-0.5`
- **Gradient Background**: Smooth color transition
- **Border Color**: Gray → Blue

## Best Practices

### 1. Keep Suggestions Short
✅ "Moderate budget (€150-300/day)"
❌ "I'm looking for a moderate budget experience with comfortable accommodations around €150-300 per day"

### 2. Include Context
✅ "June 15-20 (summer)"
❌ "June 15-20"

### 3. Use Emojis Sparingly
✅ "🎨 Art galleries and museums"
✅ "Luxury experience"
❌ "🎨🖼️🏛️ Art galleries, museums, and cultural sites"

### 4. Vary Options
Provide different types of responses:
- Specific: "June 15-20"
- General: "Mid-summer"
- Flexible: "Flexible with dates"
- Alternative: "Weekend getaway instead"

## Configuration

### Adjust Suggestion Count
In `src/app/api/suggestions/route.ts`:
```typescript
.slice(0, 6)  // Change to 4-8 for more/fewer suggestions
```

### Change GPT-5 Reasoning Effort
```typescript
reasoning: { effort: "low" }  // "minimal" for faster, "medium" for better quality
```

### Customize System Prompt
Modify the prompt in `route.ts` to change suggestion style, length, or format.

## Monitoring & Debugging

### Check Browser Console
```javascript
// Logs when suggestions are generated
console.log('Generating suggestions for:', lastAIMessage);
console.log('Received suggestions:', data.suggestions);
```

### Test API Directly
```bash
curl -X POST http://localhost:3000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is your budget?",
    "section": 1
  }'
```

### Monitor GPT-5 Usage
Track token usage in OpenAI dashboard:
- Model: `gpt-5`
- Average tokens per request: ~200-300
- Cost: Check current GPT-5 pricing

## Future Enhancements

### 1. **Suggestion History**
Store previously used suggestions to avoid repetition

### 2. **User Learning**
Adapt suggestions based on user's previous choices

### 3. **Multi-Language**
Generate suggestions in user's preferred language

### 4. **Smart Caching**
Cache common question patterns to reduce API calls

### 5. **Confidence Scores**
Display most relevant suggestions first based on AI's confidence

---

**Last Updated**: October 3, 2025 - v1.0
**Status**: ✅ Production Ready

