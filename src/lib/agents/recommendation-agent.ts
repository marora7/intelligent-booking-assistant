import db from '@/lib/db';
import type { Destination, UserProfile, MatchResult } from '@/types';

export function getRecommendations(
  profile: UserProfile,
  limit: number = 5
): MatchResult[] {
  // Get all cities (type='city')
  const stmt = db.prepare(`
    SELECT * FROM destinations 
    WHERE type = 'city'
    AND interest_art IS NOT NULL
  `);
  
  const destinations = stmt.all() as Destination[];
  
  // Calculate match score for each destination
  const results = destinations.map(dest => {
    let score = 0;
    const reasons: string[] = [];
    
    // Interest alignment (40% weight)
    const interestScore = calculateInterestMatch(profile.interests, dest);
    score += interestScore * 0.4;
    if (interestScore > 70) {
      const topInterests = profile.interests.slice(0, 3).join(', ');
      reasons.push(`Perfect match for ${topInterests}`);
    }
    
    // Budget fit (25% weight)
    if (dest.budget_tier === profile.budget) {
      score += 25;
      reasons.push(`Fits your ${profile.budget} budget (€${dest.avg_daily_cost}/day)`);
    } else if (Math.abs(budgetDiff(dest.budget_tier, profile.budget)) === 1) {
      score += 15;
    }
    
    // Season/Weather alignment (15% weight)
    const seasonMatch = checkSeasonMatch(dest.best_seasons, profile.travel_season);
    if (seasonMatch) {
      score += 15;
      reasons.push(`Ideal for ${profile.travel_season} travel`);
    }
    
    // Pace alignment (20% weight)
    const paceScore = getPaceScore(dest, profile.pace);
    score += (paceScore / 100) * 20;
    if (paceScore > 80) {
      reasons.push(`Great for ${profile.pace} travelers`);
    }
    
    return {
      destination: dest,
      score: Math.round(Math.min(score, 100)),
      matchReasons: reasons
    };
  });
  
  // Sort by score and return top N
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function calculateInterestMatch(
  userInterests: string[],
  destination: Destination
): number {
  if (userInterests.length === 0) return 50;
  
  let totalScore = 0;
  
  for (const interest of userInterests) {
    const field = `interest_${interest}` as keyof Destination;
    const score = (destination[field] as number) || 50;
    totalScore += score;
  }
  
  return totalScore / userInterests.length;
}

function budgetDiff(tier1: string, tier2: string): number {
  const tiers = ['budget', 'moderate', 'luxury'];
  const idx1 = tiers.indexOf(tier1);
  const idx2 = tiers.indexOf(tier2);
  if (idx1 === -1 || idx2 === -1) return 0;
  return Math.abs(idx1 - idx2);
}

function checkSeasonMatch(bestSeasons: string, userSeason: string): boolean {
  if (!userSeason || !bestSeasons) return false;
  return bestSeasons.toLowerCase().includes(userSeason.toLowerCase());
}

function getPaceScore(destination: Destination, pace: string): number {
  const field = `pace_${pace}` as keyof Destination;
  return (destination[field] as number) || 50;
}

export function getDestinationById(id: number): Destination | null {
  const stmt = db.prepare(`
    SELECT * FROM destinations WHERE id = ?
  `);
  
  return stmt.get(id) as Destination | null;
}

export function getDestinationDetails(id: number): {
  destination: Destination;
  attractionCount: number;
  activityCount: number;
  packageCount: number;
} | null {
  const destination = getDestinationById(id);
  if (!destination) return null;
  
  const attractionStmt = db.prepare('SELECT COUNT(*) as count FROM attractions WHERE destination_id = ?');
  const activityStmt = db.prepare('SELECT COUNT(*) as count FROM activities WHERE destination_id = ?');
  const packageStmt = db.prepare('SELECT COUNT(*) as count FROM packages WHERE destination_id = ?');
  
  const attractionCount = (attractionStmt.get(id) as { count: number }).count;
  const activityCount = (activityStmt.get(id) as { count: number }).count;
  const packageCount = (packageStmt.get(id) as { count: number }).count;
  
  return {
    destination,
    attractionCount,
    activityCount,
    packageCount
  };
}

