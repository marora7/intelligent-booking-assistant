import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOrCreateConversation, getCurrentSection, updateConversation, markSectionComplete, advanceSection } from '@/lib/conversation/state';
import { logMessage, getRecentMessages } from '@/lib/conversation/messages';
import { 
  getProfile, 
  updateProfile, 
  validateProfileComplete
} from '@/lib/agents/profile-agent';
import { getRecommendations } from '@/lib/agents/recommendation-agent';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json();
    
    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Missing sessionId or message' },
        { status: 400 }
      );
    }
    
    // Get conversation state
    const conversation = getOrCreateConversation(sessionId);
    const section = getCurrentSection(sessionId);
    
    // Log user message
    logMessage(conversation.id, 'user', message, section);
    
    // Get recent conversation history
    const recentMessages = getRecentMessages(conversation.id, 10);
    const conversationHistory = recentMessages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    // Process based on current section
    let response: string = '';
    let canAdvance = false;
    let metadata: any = {};
    
    if (section === 1) {
      // Section 1: Profile extraction using GPT-5
      const profile = getProfile(sessionId);
      const systemPrompt = buildSection1Prompt(profile);
      
      const gptResponse = await openai.responses.create({
        model: "gpt-5",
        input: `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}`,
        reasoning: { effort: "medium" }
      });
      
      response = gptResponse.output_text;
      
      // Extract profile data from GPT-5 response
      const extractedProfile = await extractProfileWithGPT5(message, profile);
      if (extractedProfile) {
        updateProfile(sessionId, extractedProfile);
      }
      
      // Check if profile is complete
      const updatedProfile = getProfile(sessionId);
      const validation = validateProfileComplete(updatedProfile);
      
      if (validation.isComplete) {
        markSectionComplete(sessionId, 1);
        canAdvance = true;
        metadata = { profile: updatedProfile, validation };
      } else {
        metadata = { profile: updatedProfile, validation };
      }
      
    } else if (section === 2) {
      // Section 2: Destination recommendations
      const profile = getProfile(sessionId);
      const conversation = getOrCreateConversation(sessionId);
      
      if (!profile) {
        response = 'Please complete your profile first!';
      } else {
        // Check if destination already selected (in case user messages again before section advances)
        if (conversation.selected_destination_id) {
          // Destination already selected, should be in Section 3
          // Treat this as a Section 3 message
          const systemPrompt = buildSection3Prompt(profile, conversation.selected_destination_id);
          
          const gptResponse = await openai.responses.create({
            model: "gpt-5",
            input: `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}`,
            reasoning: { effort: "medium" }
          });
          
          response = gptResponse.output_text;
          
          // Include profile and destination in metadata
          const destination = require('@/lib/db').default.prepare('SELECT * FROM destinations WHERE id = ?').get(conversation.selected_destination_id);
          metadata.profile = profile;
          metadata.selectedDestination = { destination };
          
          // Check if user wants to proceed to review or has provided comprehensive trip details
          const advanceKeywords = ['ready', 'review', 'confirm', 'book', 'looks good', 'sounds perfect', 
                                    'that works', 'all set', 'finalize', 'proceed', 'complete'];
          const hasAdvanceKeyword = advanceKeywords.some(keyword => message.toLowerCase().includes(keyword));
          
          // Also check if message contains substantial trip planning details (dates, hotels, activities)
          const hasDates = /\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}\/|\d{1,2}-)\b/i.test(message);
          const hasAccommodation = /\b(hotel|accommodation|stay|boutique|hostel|airbnb|resort)\b/i.test(message);
          const hasActivities = /\b(tour|visit|see|museum|attraction|experience|activity)\b/i.test(message);
          
          // If user provided multiple trip details, assume they're ready for next step
          const detailsProvided = [hasDates, hasAccommodation, hasActivities].filter(Boolean).length;
          
          if (hasAdvanceKeyword || detailsProvided >= 2) {
            markSectionComplete(sessionId, 3);
            canAdvance = true;
            
            // Add transition message if they haven't explicitly said "ready"
            if (!hasAdvanceKeyword && detailsProvided >= 2) {
              response += `\n\n**Great!** I have your trip details. Let me prepare your complete booking summary...`;
            }
          }
        } else {
          // No destination selected yet, show recommendations
          const recommendations = getRecommendations(profile, 5);
          const systemPrompt = buildSection2Prompt(profile, recommendations);
          
          const gptResponse = await openai.responses.create({
            model: "gpt-5",
            input: `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}`,
            reasoning: { effort: "low" }
          });
          
          response = gptResponse.output_text;
          metadata = { recommendations };
          
          // Detect destination selection - check for city names
          const selectedDestination = detectDestinationSelection(message, recommendations);
          if (selectedDestination) {
            // Store selected destination
            updateConversation(sessionId, {
              selected_destination_id: selectedDestination.destination.id
            });
            
            markSectionComplete(sessionId, 2);
            canAdvance = true;
            
            // Add confirmation and transition
            response += `\n\n**Perfect choice!** Moving to trip planning for ${selectedDestination.destination.name}...`;
            metadata.selectedDestination = selectedDestination;
          }
        }
      }
    } else if (section === 3) {
      // Section 3: Trip finalization
      const profile = getProfile(sessionId);
      const conversation = getOrCreateConversation(sessionId);
      
      if (!conversation.selected_destination_id) {
        response = 'Please select a destination first!';
      } else {
        const systemPrompt = buildSection3Prompt(profile, conversation.selected_destination_id);
        
        const gptResponse = await openai.responses.create({
          model: "gpt-5",
          input: `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}`,
          reasoning: { effort: "medium" }
        });
        
        response = gptResponse.output_text;
        
        // Include profile and destination in metadata
        const destination = require('@/lib/db').default.prepare('SELECT * FROM destinations WHERE id = ?').get(conversation.selected_destination_id);
        metadata.profile = profile;
        metadata.selectedDestination = { destination };
        
        // Check if user wants to proceed to review or has provided comprehensive trip details
        const advanceKeywords = ['ready', 'review', 'confirm', 'book', 'looks good', 'sounds perfect', 
                                  'that works', 'all set', 'finalize', 'proceed', 'complete'];
        const hasAdvanceKeyword = advanceKeywords.some(keyword => message.toLowerCase().includes(keyword));
        
        // Also check if message contains substantial trip planning details (dates, hotels, activities)
        const hasDates = /\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}\/|\d{1,2}-)\b/i.test(message);
        const hasAccommodation = /\b(hotel|accommodation|stay|boutique|hostel|airbnb|resort)\b/i.test(message);
        const hasActivities = /\b(tour|visit|see|museum|attraction|experience|activity)\b/i.test(message);
        
        // If user provided multiple trip details, assume they're ready for next step
        const detailsProvided = [hasDates, hasAccommodation, hasActivities].filter(Boolean).length;
        
        if (hasAdvanceKeyword || detailsProvided >= 2) {
          markSectionComplete(sessionId, 3);
          canAdvance = true;
          
          // Add transition message if they haven't explicitly said "ready"
          if (!hasAdvanceKeyword && detailsProvided >= 2) {
            response += `\n\n**Great!** I have your trip details. Let me prepare your complete booking summary...`;
          }
        }
      }
    } else if (section === 4) {
      // Section 4: Review and confirmation
      const profile = getProfile(sessionId);
      const conversation = getOrCreateConversation(sessionId);
      
      const systemPrompt = buildSection4Prompt(profile, conversation);
      
      const gptResponse = await openai.responses.create({
        model: "gpt-5",
        input: `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nUser: ${message}`,
        reasoning: { effort: "low" }
      });
      
      response = gptResponse.output_text;
      
      // Include profile and destination in metadata
      if (conversation.selected_destination_id) {
        const destination = require('@/lib/db').default.prepare('SELECT * FROM destinations WHERE id = ?').get(conversation.selected_destination_id);
        metadata.profile = profile;
        metadata.selectedDestination = { destination };
      }
      
      // Check if final confirmation
      if (message.toLowerCase().includes('confirm') || 
          message.toLowerCase().includes('yes')) {
        // Create booking (simplified for now)
        const confirmationNumber = `VIK-${Date.now().toString().slice(-8)}`;
        response += `\n\n🎉 **Booking Confirmed!**\n\nConfirmation Number: **${confirmationNumber}**\n\nYou'll receive a confirmation email shortly!`;
        markSectionComplete(sessionId, 4);
        metadata.bookingConfirmed = true;
      }
    }
    
    // Log agent response
    logMessage(conversation.id, 'agent', response, section, metadata);
    
    // Auto-advance if needed
    if (canAdvance) {
      const newSection = advanceSection(sessionId);
      metadata.newSection = newSection;
    }
    
    return NextResponse.json({
      content: response,
      section,
      canAdvance,
      metadata
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

function generateProfileQuestion(profile: any, missing: string): string {
  const questions: Record<string, string> = {
    'Travel interests': 'What interests you most when you travel? (e.g., art, food, nature, history, nightlife)',
    'Budget range': 'What\'s your budget range? (budget/moderate/luxury)',
    'Group type': 'Who will be traveling? (solo/couple/family/group)',
    'Number of travelers': 'How many people will be traveling?',
    'Trip duration': 'How many days are you planning for this trip?',
    'Travel dates or season': 'When are you planning to travel? (specific dates or season)',
    'Travel pace': 'What\'s your preferred travel pace? (relaxed/moderate/fast)',
    'Weather preference': 'What\'s your weather preference? (warm/mild/cool/any)'
  };
  
  return questions[missing] || `Tell me more about: ${missing}`;
}

function buildSection1Prompt(profile: any): string {
  const missing = [];
  if (!profile?.interests?.length) missing.push('interests');
  if (!profile?.budget) missing.push('budget');
  if (!profile?.group_type) missing.push('group type');
  if (!profile?.duration_days) missing.push('duration');
  if (!profile?.travel_season) missing.push('travel season');
  if (!profile?.pace) missing.push('pace');
  if (!profile?.weather_pref) missing.push('weather preference');
  
  return `You are a travel booking assistant. SECTION 1: Profile Gathering.

Current profile: ${JSON.stringify(profile, null, 2)}
Missing: ${missing.join(', ') || 'none'}

CRITICAL FORMATTING RULES:
- Keep responses SHORT (2-4 sentences max)
- Use markdown: **bold** for emphasis, - for bullets
- NO long paragraphs
- If profile complete, show summary in this format:

**Profile Complete!** ✓
- **Interests:** [list]
- **Budget:** [tier] 
- **Travelers:** [count] ([type])
- **Duration:** [days] days
- **Season:** [season]

Ready to see your top destinations?

Your task: Ask ONE question at a time for missing fields. Be warm but concise.`;
}

function buildSection2Prompt(profile: any, recommendations: any[]): string {
  const recText = recommendations.map((rec, idx) => 
    `${idx + 1}) **${rec.destination.name}** (${rec.score}% match) - €${rec.destination.avg_daily_cost}/day
   - ${rec.destination.description}
   - Best for: ${rec.matchReasons.join(', ')}`
  ).join('\n\n');
  
  return `You are a travel booking assistant. SECTION 2: Destination Selection.

User profile: ${profile.interests?.join(', ')} | ${profile.budget} budget | ${profile.group_size} ${profile.group_type} | ${profile.duration_days} days | ${profile.travel_season}

Top recommendations:
${recText}

CRITICAL FORMATTING RULES:
- Use this EXACT format for recommendations:

**Best matches for [their preferences]**

1) **City Name** (X% match) – Short tagline
   - **Why it fits:** 1-2 sentences max
   - **Top experiences:** 3-5 key activities
   - **Food highlights:** 2-3 dining options
   - **Budget estimate:** €X–Y/day

2) **Next City**...

3) **Next City**...

**Quick guidance**
- Want [key feature]? Choose [City].
- Want [other feature]? Choose [Other City].

**Next step**
Tell me which destination interests you, or ask about specific cities.

RULES:
- Keep concise, scannable, organized
- Use **bold** for emphasis
- Use bullet points with dashes
- NO long paragraphs
- Max 3-5 destinations shown at once`;
}

async function extractProfileWithGPT5(message: string, currentProfile: any): Promise<any> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const extractPrompt = `Extract travel preferences from this message and return ONLY a JSON object with any fields you can determine.

Current profile: ${JSON.stringify(currentProfile)}

User message: "${message}"

Extract any of these fields if mentioned:
- interests (array of strings: art, food, nature, adventure, nightlife, shopping, history, relaxation)
- budget (string: "budget" or "moderate" or "luxury")
- group_type (string: "solo" or "couple" or "family" or "group")
- group_size (number)
- duration_days (number)
- travel_season (string: "spring" or "summer" or "fall" or "winter" or specific dates)
- pace (string: "relaxed" or "moderate" or "fast")
- weather_pref (string: "warm" or "mild" or "cool" or "any")

Return ONLY valid JSON, no explanation. If no fields can be extracted, return {}.`;

    const response = await openai.responses.create({
      model: "gpt-5",
      input: extractPrompt,
      reasoning: { effort: "low" }
    });

    // Extract JSON from response
    const text = response.output_text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (error) {
    console.error('Error extracting profile:', error);
    return {};
  }
}

function detectDestinationSelection(message: string, recommendations: any[]): any | null {
  const messageLower = message.toLowerCase();
  
  // Selection keywords that indicate user is choosing a destination
  const selectionKeywords = [
    'book', 'choose', 'select', 'go with', 'pick', 'want', 'take',
    'prefer', 'like', 'interested', 'love', 'sounds good', 'perfect',
    'let\'s do', 'let\'s go', 'that one', 'this one', 'yes to'
  ];
  
  // Check for explicit selection keywords with city names
  for (const rec of recommendations) {
    const cityName = rec.destination.name.toLowerCase();
    
    // Check if message mentions the city
    if (messageLower.includes(cityName)) {
      // Check for selection intent
      for (const keyword of selectionKeywords) {
        if (messageLower.includes(keyword)) {
          return rec;
        }
      }
      
      // Also detect if user is asking for specific destination details after seeing recommendations
      // This handles cases like "Tell me more about Florence" after recommendations
      if (messageLower.includes('tell me more about ' + cityName) ||
          messageLower.includes('more about ' + cityName) ||
          messageLower.includes('details about ' + cityName) ||
          messageLower.includes('information about ' + cityName)) {
        // Don't select yet, but if they follow up with trip details, select it
        return null;
      }
      
      // If message is short and just mentions city name positively, likely a selection
      if (message.trim().split(' ').length <= 5 && 
          (messageLower.includes('yes') || messageLower.includes('ok') || messageLower.includes('sure'))) {
        return rec;
      }
    }
  }
  
  return null;
}

function buildSection3Prompt(profile: any, destinationId: number): string {
  const db = require('@/lib/db').default;
  const destination = db.prepare('SELECT * FROM destinations WHERE id = ?').get(destinationId);
  
  return `You are a travel booking assistant. SECTION 3: Trip Finalization.

User is planning a trip to: **${destination.name}**
User profile: ${JSON.stringify(profile)}

Your goal: Help finalize trip details.

CRITICAL FORMATTING RULES:
- Keep responses SHORT and organized
- Use **bold** for key terms
- Use bullet points for options

Ask about:
1. **Exact dates** (if not already specified)
2. **Accommodation preferences** (hotel star rating, location)
3. **Must-see attractions** (what they want to visit)
4. **Activities** (tours, experiences)
5. **Dining preferences** (any special requests)

When user has answered key questions, ask:
"Ready to review your complete trip plan?"

Format example:
**Let's finalize your ${destination.name} trip!**

What are your exact travel dates? (Currently planning ${profile.duration_days} days in ${profile.travel_season})`;
}

function buildSection4Prompt(profile: any, conversation: any): string {
  const db = require('@/lib/db').default;
  const destination = db.prepare('SELECT * FROM destinations WHERE id = ?').get(conversation.selected_destination_id);
  
  return `You are a travel booking assistant. SECTION 4: Final Review & Confirmation.

Destination: **${destination.name}**
User profile: ${JSON.stringify(profile)}

Your goal: Present a COMPLETE booking summary with all details and get final confirmation.

CRITICAL FORMATTING RULES:
- Show a comprehensive, organized summary
- Use **bold** for section headers
- Include all booking components (flights, hotels, activities)
- Keep it scannable with bullet points
- Include estimated costs

Format:
**🎉 Your Complete ${destination.name} Booking Summary**

**✈️ Travel Details**
- Destination: ${destination.name}
- Dates: [specific dates from conversation]
- Duration: ${profile.duration_days} days, ${profile.duration_days - 1} nights
- Travelers: ${profile.group_size} ${profile.group_type}

**🏨 Accommodation**
- Hotel: [hotel name and type based on preferences]
- Location: [area/neighborhood]
- Room type: [based on group size]
- Check-in/out: [dates]

**🎯 Included Activities & Experiences**
- [List specific activities, tours, attractions mentioned]
- [Include any dining experiences]

**✈️ Transportation Notes**
- Flights: [Recommend booking separately or include estimate]
- Local transport: [suggestions based on destination]

**💰 Budget Breakdown**
- Accommodation: €[estimate per night] × ${profile.duration_days - 1} nights
- Activities & tours: €[estimate]
- Meals: €[daily estimate] × ${profile.duration_days} days
- **Total Estimate: €[total amount]**

**✅ Ready to confirm your booking?**
Reply "yes" or "confirm" to proceed, or let me know if you'd like to adjust anything!`;
}

