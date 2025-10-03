import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message, section } = await request.json();

    const systemPrompt = `You are a suggestion generator for a travel booking assistant.

Based on the AI assistant's last message, generate 5-6 SHORT, ACTIONABLE suggestions that would help the user respond naturally.

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

Examples of GOOD suggestions:
- If AI asks about budget: ["Moderate budget (€150-300/day)", "Luxury experience (€500+/day)", "Budget-friendly (under €100/day)"]
- If AI asks about interests: ["🎨 Art galleries and museums", "🍷 Wine tasting and local cuisine", "⛰️ Hiking and nature"]
- If AI asks about dates: ["June 15-20 (5 nights)", "First week of July", "Flexible, mid-summer", "Weekend getaway"]

Return format: ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5", "suggestion 6"]`;

    const response = await openai.responses.create({
      model: "gpt-5",
      input: systemPrompt,
      reasoning: { effort: "low" }
    });

    const text = response.output_text.trim();
    
    // Try to extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      
      // Validate and limit to 6 suggestions
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        const validSuggestions = suggestions
          .filter(s => typeof s === 'string' && s.length > 0)
          .slice(0, 6);
        
        return NextResponse.json({ 
          suggestions: validSuggestions 
        });
      }
    }

    // Fallback if parsing fails
    return NextResponse.json({ 
      suggestions: [] 
    });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', suggestions: [] },
      { status: 500 }
    );
  }
}

