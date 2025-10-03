-- Data Enhancement: Interest Scores and Budget Tiers
-- Date: 2025-10-03
-- Purpose: Add curated interest scores and budget classifications to destinations

-- ================================================================
-- Amsterdam (Netherlands)
-- ================================================================
UPDATE destinations SET
  interest_art = 95,
  interest_food = 80,
  interest_nature = 40,
  interest_adventure = 30,
  interest_nightlife = 85,
  interest_shopping = 70,
  interest_history = 80,
  interest_relaxation = 60,
  budget_tier = 'moderate',
  avg_daily_cost = 120,
  pace_relaxed = 85,
  pace_moderate = 90,
  pace_fast = 65
WHERE name = 'Amsterdam' AND type = 'city';

-- ================================================================
-- Paris (France)
-- ================================================================
UPDATE destinations SET
  interest_art = 100,
  interest_food = 100,
  interest_nature = 45,
  interest_adventure = 30,
  interest_nightlife = 90,
  interest_shopping = 95,
  interest_history = 95,
  interest_relaxation = 50,
  budget_tier = 'moderate',
  avg_daily_cost = 140,
  pace_relaxed = 70,
  pace_moderate = 90,
  pace_fast = 80
WHERE name = 'Paris' AND type = 'city';

-- ================================================================
-- London (United Kingdom)
-- ================================================================
UPDATE destinations SET
  interest_art = 95,
  interest_food = 85,
  interest_nature = 50,
  interest_adventure = 35,
  interest_nightlife = 85,
  interest_shopping = 90,
  interest_history = 100,
  interest_relaxation = 50,
  budget_tier = 'moderate',
  avg_daily_cost = 150,
  pace_relaxed = 60,
  pace_moderate = 85,
  pace_fast = 90
WHERE name = 'London' AND type = 'city';

-- ================================================================
-- Brussels (Belgium)
-- ================================================================
UPDATE destinations SET
  interest_art = 75,
  interest_food = 90,
  interest_nature = 40,
  interest_adventure = 25,
  interest_nightlife = 65,
  interest_shopping = 70,
  interest_history = 80,
  interest_relaxation = 70,
  budget_tier = 'moderate',
  avg_daily_cost = 110,
  pace_relaxed = 80,
  pace_moderate = 85,
  pace_fast = 60
WHERE name = 'Brussels' AND type = 'city';

-- ================================================================
-- Lisbon (Portugal)
-- ================================================================
UPDATE destinations SET
  interest_art = 70,
  interest_food = 85,
  interest_nature = 60,
  interest_adventure = 55,
  interest_nightlife = 80,
  interest_shopping = 65,
  interest_history = 85,
  interest_relaxation = 75,
  budget_tier = 'budget',
  avg_daily_cost = 70,
  pace_relaxed = 90,
  pace_moderate = 85,
  pace_fast = 60
WHERE name = 'Lisbon' AND type = 'city';

-- ================================================================
-- Barcelona (Spain)
-- ================================================================
UPDATE destinations SET
  interest_art = 90,
  interest_food = 90,
  interest_nature = 65,
  interest_adventure = 60,
  interest_nightlife = 95,
  interest_shopping = 80,
  interest_history = 85,
  interest_relaxation = 70,
  budget_tier = 'moderate',
  avg_daily_cost = 115,
  pace_relaxed = 75,
  pace_moderate = 90,
  pace_fast = 85
WHERE name = 'Barcelona' AND type = 'city';

-- ================================================================
-- Madrid (Spain)
-- ================================================================
UPDATE destinations SET
  interest_art = 95,
  interest_food = 85,
  interest_nature = 50,
  interest_adventure = 40,
  interest_nightlife = 90,
  interest_shopping = 85,
  interest_history = 90,
  interest_relaxation = 60,
  budget_tier = 'moderate',
  avg_daily_cost = 105,
  pace_relaxed = 70,
  pace_moderate = 85,
  pace_fast = 80
WHERE name = 'Madrid' AND type = 'city';

-- ================================================================
-- Rome (Italy)
-- ================================================================
UPDATE destinations SET
  interest_art = 100,
  interest_food = 95,
  interest_nature = 45,
  interest_adventure = 35,
  interest_nightlife = 75,
  interest_shopping = 75,
  interest_history = 100,
  interest_relaxation = 55,
  budget_tier = 'moderate',
  avg_daily_cost = 125,
  pace_relaxed = 65,
  pace_moderate = 85,
  pace_fast = 80
WHERE name = 'Rome' AND type = 'city';

-- ================================================================
-- Florence (Italy)
-- ================================================================
UPDATE destinations SET
  interest_art = 100,
  interest_food = 90,
  interest_nature = 55,
  interest_adventure = 40,
  interest_nightlife = 60,
  interest_shopping = 80,
  interest_history = 100,
  interest_relaxation = 75,
  budget_tier = 'moderate',
  avg_daily_cost = 115,
  pace_relaxed = 85,
  pace_moderate = 90,
  pace_fast = 65
WHERE name = 'Florence' AND type = 'city';

-- ================================================================
-- Athens (Greece)
-- ================================================================
UPDATE destinations SET
  interest_art = 85,
  interest_food = 80,
  interest_nature = 60,
  interest_adventure = 55,
  interest_nightlife = 75,
  interest_shopping = 60,
  interest_history = 100,
  interest_relaxation = 70,
  budget_tier = 'budget',
  avg_daily_cost = 75,
  pace_relaxed = 80,
  pace_moderate = 85,
  pace_fast = 70
WHERE name = 'Athens' AND type = 'city';

-- ================================================================
-- Vienna (Austria)
-- ================================================================
UPDATE destinations SET
  interest_art = 95,
  interest_food = 85,
  interest_nature = 50,
  interest_adventure = 35,
  interest_nightlife = 70,
  interest_shopping = 75,
  interest_history = 95,
  interest_relaxation = 80,
  budget_tier = 'moderate',
  avg_daily_cost = 130,
  pace_relaxed = 85,
  pace_moderate = 90,
  pace_fast = 60
WHERE name = 'Vienna' AND type = 'city';

-- ================================================================
-- Prague (Czech Republic)
-- ================================================================
UPDATE destinations SET
  interest_art = 80,
  interest_food = 75,
  interest_nature = 45,
  interest_adventure = 40,
  interest_nightlife = 85,
  interest_shopping = 70,
  interest_history = 95,
  interest_relaxation = 70,
  budget_tier = 'budget',
  avg_daily_cost = 65,
  pace_relaxed = 80,
  pace_moderate = 90,
  pace_fast = 75
WHERE name = 'Prague' AND type = 'city';

-- ================================================================
-- Berlin (Germany)
-- ================================================================
UPDATE destinations SET
  interest_art = 85,
  interest_food = 80,
  interest_nature = 55,
  interest_adventure = 45,
  interest_nightlife = 95,
  interest_shopping = 80,
  interest_history = 90,
  interest_relaxation = 60,
  budget_tier = 'moderate',
  avg_daily_cost = 110,
  pace_relaxed = 65,
  pace_moderate = 85,
  pace_fast = 90
WHERE name = 'Berlin' AND type = 'city';

-- ================================================================
-- Munich (Germany)
-- ================================================================
UPDATE destinations SET
  interest_art = 80,
  interest_food = 85,
  interest_nature = 70,
  interest_adventure = 60,
  interest_nightlife = 80,
  interest_shopping = 75,
  interest_history = 85,
  interest_relaxation = 70,
  budget_tier = 'moderate',
  avg_daily_cost = 125,
  pace_relaxed = 75,
  pace_moderate = 90,
  pace_fast = 70
WHERE name = 'Munich' AND type = 'city';

-- ================================================================
-- Budapest (Hungary)
-- ================================================================
UPDATE destinations SET
  interest_art = 75,
  interest_food = 80,
  interest_nature = 50,
  interest_adventure = 45,
  interest_nightlife = 85,
  interest_shopping = 65,
  interest_history = 90,
  interest_relaxation = 85,
  budget_tier = 'budget',
  avg_daily_cost = 60,
  pace_relaxed = 85,
  pace_moderate = 90,
  pace_fast = 70
WHERE name = 'Budapest' AND type = 'city';

-- ================================================================
-- Copenhagen (Denmark)
-- ================================================================
UPDATE destinations SET
  interest_art = 75,
  interest_food = 85,
  interest_nature = 60,
  interest_adventure = 55,
  interest_nightlife = 75,
  interest_shopping = 85,
  interest_history = 70,
  interest_relaxation = 80,
  budget_tier = 'luxury',
  avg_daily_cost = 180,
  pace_relaxed = 85,
  pace_moderate = 90,
  pace_fast = 65
WHERE name = 'Copenhagen' AND type = 'city';

-- ================================================================
-- Stockholm (Sweden)
-- ================================================================
UPDATE destinations SET
  interest_art = 80,
  interest_food = 80,
  interest_nature = 75,
  interest_adventure = 65,
  interest_nightlife = 75,
  interest_shopping = 85,
  interest_history = 75,
  interest_relaxation = 75,
  budget_tier = 'luxury',
  avg_daily_cost = 170,
  pace_relaxed = 80,
  pace_moderate = 90,
  pace_fast = 70
WHERE name = 'Stockholm' AND type = 'city';

-- ================================================================
-- Oslo (Norway)
-- ================================================================
UPDATE destinations SET
  interest_art = 70,
  interest_food = 75,
  interest_nature = 90,
  interest_adventure = 80,
  interest_nightlife = 65,
  interest_shopping = 70,
  interest_history = 70,
  interest_relaxation = 75,
  budget_tier = 'luxury',
  avg_daily_cost = 190,
  pace_relaxed = 80,
  pace_moderate = 85,
  pace_fast = 70
WHERE name = 'Oslo' AND type = 'city';

-- ================================================================
-- Helsinki (Finland)
-- ================================================================
UPDATE destinations SET
  interest_art = 70,
  interest_food = 75,
  interest_nature = 75,
  interest_adventure = 65,
  interest_nightlife = 70,
  interest_shopping = 80,
  interest_history = 65,
  interest_relaxation = 80,
  budget_tier = 'luxury',
  avg_daily_cost = 160,
  pace_relaxed = 85,
  pace_moderate = 85,
  pace_fast = 60
WHERE name = 'Helsinki' AND type = 'city';

-- ================================================================
-- Zurich (Switzerland)
-- ================================================================
UPDATE destinations SET
  interest_art = 75,
  interest_food = 85,
  interest_nature = 85,
  interest_adventure = 75,
  interest_nightlife = 65,
  interest_shopping = 90,
  interest_history = 70,
  interest_relaxation = 80,
  budget_tier = 'luxury',
  avg_daily_cost = 250,
  pace_relaxed = 80,
  pace_moderate = 90,
  pace_fast = 70
WHERE name = 'Zurich' AND type = 'city';

-- ================================================================
-- Verification: Show all updated destinations
-- ================================================================

SELECT 
  name,
  budget_tier,
  avg_daily_cost,
  interest_art,
  interest_food,
  interest_history,
  interest_nightlife
FROM destinations 
WHERE type = 'city'
ORDER BY name;

SELECT 'Interest scores populated successfully!' as status;

