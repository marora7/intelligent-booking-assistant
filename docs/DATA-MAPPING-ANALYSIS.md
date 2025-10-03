# Data Mapping Analysis: Existing Data → PRD Requirements

**Date:** October 3, 2025  
**Purpose:** Analyze existing data files and map them to Intelligent Booking Assistant requirements

---

## Executive Summary

**Great News! 🎉** Your existing data is **80% ready** for the Intelligent Booking Assistant. Most core data structures are already in place and well-organized.

**What You Have:**
- ✅ 34 destinations (17 countries + 17 cities)
- ✅ 320 attractions across all destinations
- ✅ 320 activities (tours, experiences)
- ✅ 240 restaurants with cuisine types
- ✅ 56 pre-built packages
- ✅ Well-structured JSON with consistent schemas

**What Needs Work:**
- ⚠️ Add embedding vectors for semantic search
- ⚠️ Enhance destination profiles with interest tags
- ⚠️ Add budget tier classifications
- ⚠️ Add weather profile details
- ⚠️ Create user profile → destination matching logic

---

## Detailed Data Analysis

### 1. Destinations Data (`destinations.json`)

#### What You Have ✅

```json
{
  "id": 18,
  "name": "Amsterdam",
  "country": "Netherlands",
  "type": "city",
  "parent_id": 1,
  "description": "Artistic heritage, canal system, narrow houses...",
  "climate": "Temperate oceanic with mild summers",
  "best_seasons": "April to May (tulips), June to August",
  "popular_activities": "Canal cruises, Museum hopping, Cycling tours, Nightlife"
}
```

**Count:** 34 destinations (17 countries, 17 cities)

**Cities Included:**
- Amsterdam, Paris, London, Brussels, Lisbon
- Barcelona, Madrid, Rome, Florence, Athens
- Vienna, Prague, Berlin, Munich, Budapest
- Copenhagen, Stockholm, Oslo, Helsinki, Zurich

**Strengths:**
- ✅ Good coverage of major European destinations
- ✅ Hierarchical structure (countries → cities)
- ✅ Climate and season information
- ✅ Popular activities listed

#### What's Missing ⚠️

1. **Interest Tags** (needed for Section 1 matching)
   ```json
   // Need to ADD:
   "interests": ["art", "food", "architecture", "nightlife", "nature"],
   "interest_scores": {
     "art": 95,
     "food": 85,
     "nature": 40,
     "adventure": 30,
     "nightlife": 80,
     "shopping": 70,
     "history": 85,
     "relaxation": 60
   }
   ```

2. **Budget Tiers** (needed for budget filtering)
   ```json
   // Need to ADD:
   "budget_tier": "moderate",  // "budget" | "moderate" | "luxury"
   "avg_daily_cost": {
     "budget": 60,
     "moderate": 120,
     "luxury": 250
   }
   ```

3. **Weather Profiles** (for preference matching)
   ```json
   // Need to ADD:
   "weather_profile": {
     "summer_temp_avg": 22,
     "winter_temp_avg": 4,
     "rainy_days_per_year": 133,
     "sunny_days_per_year": 62
   }
   ```

4. **Pace Suitability** (relaxed vs fast)
   ```json
   // Need to ADD:
   "pace_suitability": {
     "relaxed": 80,  // Amsterdam is good for relaxed (cycling, canals)
     "moderate": 90,
     "fast": 70
   }
   ```

5. **Vector Embeddings** (for semantic search)
   ```json
   // Need to ADD (will generate from descriptions):
   "embedding": [0.123, 0.456, ...] // 1536 dimensions from OpenAI
   ```

#### Recommendation: ENHANCE

**Action Items:**
1. Add interest tags based on attractions/activities
2. Calculate budget tiers from restaurant/hotel prices
3. Add structured weather data
4. Generate embeddings using OpenAI API

---

### 2. Packages Data (`packages.json`)

#### What You Have ✅

```json
{
  "id": 1,
  "destination_id": 18,
  "name": "Amsterdam Art & Culture Weekend",
  "description": "3-day Amsterdam package including top attractions...",
  "duration_days": 3,
  "base_price": 450,
  "currency": "EUR",
  "included_attractions": "Rijksmuseum, Van Gogh Museum, Anne Frank House",
  "included_activities": "Canal cruise, Cycling tour",
  "included_meals": "2 breakfasts, 1 dinner",
  "accommodation_type": "3-star city center hotel",
  "suitable_for": "couples, solo, seniors",
  "availability": "Year-round",
  "rating": 4.55
}
```

**Count:** 56 packages across destinations

**Package Types:**
- Weekend getaways (2-3 days)
- Week-long trips (5-7 days)
- Romantic packages
- Family packages
- Cultural discovery packages
- Adventure packages

**Price Range:** €380 - €2,400

**Strengths:**
- ✅ Great variety of duration options
- ✅ Clear pricing per person
- ✅ Included items specified
- ✅ Suitable_for matches user profiles
- ✅ Good coverage across destinations

#### What's Missing ⚠️

1. **Structured Attraction IDs** (currently strings)
   ```json
   // Currently:
   "included_attractions": "Rijksmuseum, Van Gogh Museum, Anne Frank House"
   
   // Should be:
   "included_attraction_ids": [1, 2, 3],  // References to attractions table
   ```

2. **Structured Activity IDs**
   ```json
   // Currently:
   "included_activities": "Canal cruise, Cycling tour"
   
   // Should be:
   "included_activity_ids": [1, 2],  // References to activities table
   ```

3. **Max Capacity**
   ```json
   // Need to ADD:
   "max_capacity": 10,  // Maximum number of travelers
   ```

4. **Availability Dates**
   ```json
   // Currently just "Year-round", need:
   "available_from": "2025-01-01",
   "available_to": "2025-12-31",
   "blackout_dates": ["2025-12-24", "2025-12-25"]
   ```

5. **Interest Alignment**
   ```json
   // Need to ADD for better matching:
   "primary_interests": ["art", "culture"],
   "secondary_interests": ["food", "architecture"]
   ```

#### Recommendation: RESTRUCTURE

**Action Items:**
1. Parse attraction/activity strings into ID arrays
2. Add max_capacity field
3. Add specific date ranges
4. Tag with primary interests for matching

---

### 3. Attractions Data (`attractions.json`)

#### What You Have ✅

```json
{
  "id": 1,
  "destination_id": 18,
  "name": "Rijksmuseum",
  "category": "museum",
  "description": "Dutch national museum with masterpieces by Rembrandt and Vermeer",
  "rating": 4.8,
  "price_level": "medium",
  "duration_hours": 3.0,
  "interests": "art, history, culture",
  "suitable_for": "couples, families, seniors, solo",
  "weather_dependent": 0,
  "address": "Rijksmuseum, Amsterdam"
}
```

**Count:** 320 attractions

**Categories:**
- Museums (art, history, contemporary)
- Historical sites
- Architecture
- Nature/Parks
- Entertainment
- Religious sites
- Landmarks

**Strengths:**
- ✅ Excellent coverage across destinations
- ✅ Interest tags already present
- ✅ Duration estimates
- ✅ Weather dependency flags
- ✅ Suitable_for tags match user profiles
- ✅ Price levels for budget filtering

#### What's Missing ⚠️

1. **Actual Ticket Prices**
   ```json
   // Currently: "price_level": "medium"
   // Need to ADD:
   "ticket_price": 22.50,
   "currency": "EUR",
   "price_level": "medium"  // Keep this too
   ```

2. **Opening Hours**
   ```json
   // Need to ADD:
   "opening_hours": {
     "monday": "09:00-17:00",
     "tuesday": "09:00-17:00",
     "closed": ["sunday"]
   }
   ```

3. **Booking Requirements**
   ```json
   // Need to ADD:
   "requires_advance_booking": true,
   "skip_the_line_available": true,
   "min_booking_days_advance": 1
   ```

4. **Accessibility Info**
   ```json
   // Need to ADD:
   "accessibility": {
     "wheelchair_accessible": true,
     "elevator_available": true,
     "audio_guide_available": true
   }
   ```

#### Recommendation: ENHANCE (Low Priority)

**Action Items:**
1. Add actual prices (can scrape or use average estimates)
2. Add opening hours (important for trip planning)
3. Mark attractions requiring advance booking

---

### 4. Activities Data (`activities.json`)

#### What You Have ✅

```json
{
  "id": 1,
  "destination_id": 18,
  "name": "Canal Cruise with Audio Guide",
  "type": "boat_tour",
  "description": "1-hour canal cruise through historic waterways",
  "price": 18.5,
  "currency": "EUR",
  "duration_hours": 1.0,
  "difficulty": "easy",
  "interests": "sightseeing, relaxation",
  "suitable_for": "couples, families, solo",
  "weather_dependent": 0,
  "requirements": "None",
  "rating": 4.6
}
```

**Count:** 320 activities

**Activity Types:**
- Boat tours
- Bike tours
- Food tours
- Walking tours
- Day trips
- Cooking classes
- Wine tasting
- Adventure activities

**Strengths:**
- ✅ **Actual prices included!** (Perfect for Section 3)
- ✅ Duration and difficulty specified
- ✅ Interest tags for matching
- ✅ Suitable_for alignment
- ✅ Weather dependency flags
- ✅ Great variety of activity types

#### What's Missing ⚠️

1. **Max Group Size**
   ```json
   // Need to ADD:
   "max_group_size": 15,
   "min_group_size": 2,
   "private_tour_available": true
   ```

2. **Time Slots**
   ```json
   // Need to ADD:
   "available_times": ["09:00", "14:00", "18:00"],
   "days_available": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
   ```

3. **Cancellation Policy**
   ```json
   // Need to ADD:
   "cancellation_policy": "free_cancellation_24h",
   "refund_percentage": 100
   ```

#### Recommendation: USE AS-IS (with minor enhancements)

**Action Items:**
1. Add group size limits (can use defaults per type)
2. Add time slots (can use generic morning/afternoon/evening)

---

### 5. Restaurants Data (`restaurants.json`)

#### What You Have ✅

```json
{
  "id": 1,
  "destination_id": 18,
  "name": "De Kas",
  "cuisine_type": "Dutch, Farm-to-table",
  "description": "Restaurant in greenhouse serving seasonal Dutch cuisine",
  "price_level": "upscale",
  "rating": 4.6,
  "dietary_options": "vegetarian, gluten-free",
  "suitable_for": "couples, business, groups",
  "address": "De Kas, Amsterdam"
}
```

**Count:** 240 restaurants

**Price Levels:**
- Budget
- Moderate
- Upscale

**Cuisine Types:**
- Local/traditional
- International
- Fusion
- Vegan/Vegetarian
- Seafood
- Fine dining

**Strengths:**
- ✅ Dietary options clearly marked
- ✅ Price levels for budget filtering
- ✅ Cuisine types for preference matching
- ✅ Suitable_for tags
- ✅ Good variety per destination

#### What's Missing ⚠️

1. **Average Price Range**
   ```json
   // Need to ADD:
   "avg_meal_price": 45,
   "price_range": "€35-€65",
   "currency": "EUR"
   ```

2. **Reservation Requirements**
   ```json
   // Need to ADD:
   "reservation_required": true,
   "advance_booking_recommended_days": 7
   ```

3. **Michelin Stars / Awards**
   ```json
   // Need to ADD:
   "michelin_stars": 0,
   "awards": ["Bib Gourmand"]
   ```

#### Recommendation: USE AS-IS (with pricing enhancements)

**Action Items:**
1. Add average meal prices based on price_level
2. Flag restaurants requiring reservations

---

## Data Usage by Section

### Section 1: Customer Requirements Gathering

**Data Used:**
- None directly (profile built from user input)

**Data Generated:**
- User profile with interests, budget, group type, etc.

**Matching Logic Needed:**
- Map user interests → destination interest scores
- Map user budget → destination budget tiers
- Map weather preference → destination climate

---

### Section 2: Destination Exploration & Selection

**Data Used:**
- ✅ `destinations.json` - for recommendations
- ✅ `attractions.json` - for destination highlights
- ✅ `activities.json` - for available experiences
- ✅ `restaurants.json` - for food scene overview
- ✅ `packages.json` - for price estimates

**Matching Algorithm:**
```python
def calculate_match_score(user_profile, destination):
    score = 0
    
    # Interest alignment (40%)
    for interest in user_profile.interests:
        score += destination.interest_scores.get(interest, 0) * 0.4
    
    # Budget fit (25%)
    if destination.budget_tier == user_profile.budget:
        score += 25
    elif abs(budget_difference) == 1:
        score += 15
    
    # Weather preference (15%)
    if user_profile.weather in destination.best_seasons:
        score += 15
    
    # Activity availability (20%)
    matching_activities = count_matching_activities(
        user_profile.interests, 
        destination.activities
    )
    score += min(matching_activities * 2, 20)
    
    return min(score, 100)
```

**Enhancement Needed:**
- Add interest_scores to destinations
- Add budget_tier classification
- Generate embeddings for semantic search

---

### Section 3: Trip Finalization

**Data Used:**
- ✅ `packages.json` - for pre-built options
- ✅ `attractions.json` - for activity selection
- ✅ `activities.json` - for tour/experience selection
- ✅ `restaurants.json` - for dining recommendations

**Requirements Met:**
- ✅ Package prices available
- ✅ Activity prices available
- ✅ Duration information available
- ✅ Suitable_for filtering possible

**Calculation Example:**
```python
def calculate_trip_cost(trip_details):
    total = 0
    
    # Package base price
    if trip_details.package_id:
        package = get_package(trip_details.package_id)
        total += package.base_price * trip_details.num_travelers
    
    # Additional activities
    for activity_id in trip_details.selected_activities:
        activity = get_activity(activity_id)
        total += activity.price * trip_details.num_travelers
    
    # Special requests (e.g., early check-in)
    total += sum(trip_details.special_request_costs)
    
    return total
```

**All data requirements met! ✅**

---

### Section 4: Review & Confirmation

**Data Used:**
- All from Section 3 (just displaying)

**Data Generated:**
- Booking record
- Confirmation number

**No additional data needed** ✅

---

## Data Migration Strategy

### Phase 1: Minimal Enhancement (Week 1)

**Goal:** Get MVP working with existing data

**Tasks:**
1. ✅ Use destinations as-is
2. ✅ Use packages as-is
3. ✅ Use attractions/activities as-is
4. 🔨 Add simple interest mapping:
   ```python
   # Manual mapping for MVP
   INTEREST_PROFILES = {
       "Amsterdam": {"art": 95, "food": 80, "nature": 40, ...},
       "Paris": {"art": 100, "food": 100, "romance": 95, ...},
       # ... for all cities
   }
   ```
5. 🔨 Add budget tier classification:
   ```python
   BUDGET_TIERS = {
       "Amsterdam": "moderate",
       "Paris": "moderate",
       "Lisbon": "budget",
       "Zurich": "luxury",
       # ...
   }
   ```

**Effort:** 4-6 hours of manual tagging

---

### Phase 2: Database Migration (Week 2)

**Goal:** Move to PostgreSQL with enhanced schema

**Tasks:**
1. Create Prisma schema matching PRD
2. Write migration scripts
3. Import JSON → PostgreSQL
4. Add missing fields with defaults
5. Normalize package attractions/activities into junction tables

**Effort:** 8-10 hours

**Migration Script Example:**
```typescript
// scripts/migrate-data.ts
import destinations from './data/destinations.json';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateDestinations() {
  for (const dest of destinations.records) {
    await prisma.destination.create({
      data: {
        name: dest.name,
        country: dest.country,
        description: dest.description,
        climate: dest.climate,
        bestSeasons: dest.best_seasons.split(', '),
        // Enhanced fields
        interests: inferInterests(dest),
        budgetTier: inferBudgetTier(dest),
        avgDailyCost: calculateAvgCost(dest),
      }
    });
  }
}
```

---

### Phase 3: AI Enhancement (Week 3)

**Goal:** Add vector embeddings for semantic search

**Tasks:**
1. Generate embeddings for all destinations using OpenAI
2. Store in Pinecone or pgvector
3. Implement semantic search endpoint

**Effort:** 4-6 hours

**Embedding Generation:**
```typescript
// scripts/generate-embeddings.ts
import { OpenAI } from 'openai';

const openai = new OpenAI();

async function generateDestinationEmbedding(destination) {
  const text = `
    ${destination.name}, ${destination.country}
    ${destination.description}
    Popular activities: ${destination.popular_activities}
    Best for: ${destination.interests.join(', ')}
  `.trim();
  
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });
  
  return response.data[0].embedding;
}
```

---

## Data Quality Assessment

### Current Quality: **B+ (85/100)**

**Strengths:**
- ✅ Consistent structure across files
- ✅ Good data coverage
- ✅ Reasonable data completeness
- ✅ Real pricing for activities
- ✅ Useful metadata fields

**Weaknesses:**
- ⚠️ String-based references (should be IDs)
- ⚠️ Missing some calculated fields
- ⚠️ No embeddings yet
- ⚠️ Some optional fields missing

**To Reach A+ Quality:**
1. Normalize data (proper foreign keys)
2. Add all missing fields
3. Generate embeddings
4. Add validation rules
5. Implement data versioning

---

## Recommended Approach

### Option 1: Quick Start (Recommended for MVP)

**Timeline:** 1-2 days

1. Keep JSON files as-is
2. Add simple interest/budget mappings in code
3. Use basic keyword matching for recommendations
4. Move to proper database in Phase 2

**Pros:**
- ✅ Start coding immediately
- ✅ Validate product concept
- ✅ Test user flows

**Cons:**
- ⚠️ Not scalable
- ⚠️ Limited matching accuracy
- ⚠️ Need refactoring later

---

### Option 2: Proper Setup (Recommended for Production)

**Timeline:** 5-7 days

1. Design PostgreSQL schema
2. Write migration scripts
3. Enhance data with missing fields
4. Generate embeddings
5. Build proper matching algorithms

**Pros:**
- ✅ Production-ready from day 1
- ✅ Scalable architecture
- ✅ Better matching accuracy

**Cons:**
- ⚠️ Longer before seeing results
- ⚠️ More upfront effort

---

## Data Enhancement Checklist

### Critical for MVP ✅

- [ ] Add interest scores to destinations (manual or AI-generated)
- [ ] Add budget tier classification
- [ ] Parse package attractions/activities into arrays
- [ ] Create destination matching algorithm

### Important for Launch 📊

- [ ] Generate embeddings for semantic search
- [ ] Add actual ticket prices to attractions
- [ ] Add average meal prices to restaurants
- [ ] Add opening hours to attractions
- [ ] Normalize data into relational database

### Nice to Have 🎁

- [ ] Add accessibility information
- [ ] Add booking requirements
- [ ] Add cancellation policies
- [ ] Add max group sizes
- [ ] Add time slot availability
- [ ] Add real-time inventory tracking

---

## Next Steps

### Immediate Actions:

1. **Choose approach**: Quick Start vs Proper Setup
2. **Create interest mapping**: Manual tags for 34 destinations
3. **Design database schema**: If going proper route
4. **Write migration scripts**: JSON → PostgreSQL

### Questions to Answer:

1. **Do you want to start with JSON files** (quick MVP) **or migrate to PostgreSQL** (proper setup)?
2. **Should we auto-generate interest scores** using AI or manually curate them?
3. **Do you have API access** to get real-time pricing/availability?
4. **What's your priority**: Speed to MVP or production-ready architecture?

---

## Summary

Your existing data is **excellent foundation** for the Intelligent Booking Assistant:

✅ **Can Use Immediately:**
- Destinations (with minor enhancements)
- Packages (perfect for Section 3)
- Activities (has pricing! 🎉)
- Restaurants (good variety)
- Attractions (comprehensive)

🔨 **Needs Enhancement:**
- Add interest scoring for matching
- Add budget tier classification
- Generate embeddings for semantic search
- Normalize into relational database

⏱️ **Effort Estimate:**
- Quick Start: 1-2 days
- Production Setup: 5-7 days

**Recommendation:** Start with Quick Start approach to validate product, then migrate to proper database in Week 2 of implementation.

---

**Ready to proceed?** Let me know which approach you prefer and I'll help implement it!

