/**
 * Sentiment Calculator Utility
 * Generates dynamic sentiment ratios (Positive, Mixed, Negative) based on TMDB rating data
 * Each movie gets unique percentages that always add up to 100%
 */

interface SentimentBreakdown {
  positive: number;
  mixed: number;
  negative: number;
}

/**
 * Generates a seeded random number between min and max
 * Uses movie ID and rating as seed to ensure consistency for the same movie
 * but variation between different movies
 */
function seededRandom(movieId: number, rating: number, salt: number): number {
  const seed = movieId * 1000 + Math.floor(rating * 100) + salt;
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Calculates sentiment percentages based on TMDB rating and vote count
 * @param vote_average - TMDB rating (0-10)
 * @param vote_count - Number of votes (used for variance)
 * @param movieId - Movie ID for seeded randomization
 * @returns Object with positive, mixed, and negative percentages that sum to 100
 */
export function calculateSentiment(
  vote_average: number,
  vote_count: number,
  movieId: number
): SentimentBreakdown {
  // Normalize rating to 0-10 scale
  const rating = Math.max(0, Math.min(10, vote_average));
  
  // Use vote_count to add natural variance (more votes = slightly more polarized)
  const voteInfluence = Math.min(vote_count / 1000, 1); // Cap at 1
  
  let positive: number;
  let mixed: number;
  let negative: number;

  if (rating >= 8.0) {
    // High-rated movies: 70-90% positive, 5-20% mixed, 3-10% negative
    const basePositive = 70 + seededRandom(movieId, rating, 1) * 20; // 70-90
    const variance = seededRandom(movieId, rating, 2) * voteInfluence * 5; // Add some variance
    positive = Math.round(basePositive + variance);
    
    // Distribute remaining between mixed and negative
    const remaining = 100 - positive;
    const mixedRatio = 0.5 + seededRandom(movieId, rating, 3) * 0.4; // 50-90% of remaining
    mixed = Math.round(remaining * mixedRatio);
    negative = 100 - positive - mixed;
    
  } else if (rating >= 6.0) {
    // Medium-rated movies: 45-70% positive, 20-40% mixed, 5-20% negative
    const basePositive = 45 + seededRandom(movieId, rating, 1) * 25; // 45-70
    positive = Math.round(basePositive);
    
    // Mixed gets a substantial portion
    const baseMixed = 20 + seededRandom(movieId, rating, 2) * 20; // 20-40
    mixed = Math.round(baseMixed);
    
    // Ensure we don't exceed 100
    const sum = positive + mixed;
    if (sum > 95) {
      mixed = 95 - positive;
    }
    
    negative = 100 - positive - mixed;
    
  } else {
    // Low-rated movies: 20-45% positive, 20-35% mixed, 25-50% negative
    const basePositive = 20 + seededRandom(movieId, rating, 1) * 25; // 20-45
    positive = Math.round(basePositive);
    
    // Negative gets higher percentage
    const baseNegative = 25 + seededRandom(movieId, rating, 2) * 25; // 25-50
    negative = Math.round(baseNegative);
    
    // Ensure we don't exceed 100
    const sum = positive + negative;
    if (sum > 85) {
      negative = 85 - positive;
    }
    
    mixed = 100 - positive - negative;
  }

  // Final validation to ensure sum is exactly 100
  const total = positive + mixed + negative;
  if (total !== 100) {
    // Adjust the largest value to make it exactly 100
    const diff = 100 - total;
    if (positive >= mixed && positive >= negative) {
      positive += diff;
    } else if (mixed >= positive && mixed >= negative) {
      mixed += diff;
    } else {
      negative += diff;
    }
  }

  // Ensure minimum values
  positive = Math.max(1, positive);
  mixed = Math.max(1, mixed);
  negative = Math.max(1, negative);

  // Final normalization to ensure exactly 100%
  const finalTotal = positive + mixed + negative;
  if (finalTotal !== 100) {
    const adjustment = 100 - finalTotal;
    positive += adjustment;
  }

  return {
    positive: Math.max(0, Math.min(100, positive)),
    mixed: Math.max(0, Math.min(100, mixed)),
    negative: Math.max(0, Math.min(100, negative))
  };
}

/**
 * Gets overall sentiment label based on percentages
 */
export function getSentimentLabel(breakdown: SentimentBreakdown): 'Positive' | 'Mixed' | 'Negative' {
  if (breakdown.positive >= 60) return 'Positive';
  if (breakdown.negative >= 40) return 'Negative';
  return 'Mixed';
}

/**
 * Generates mock review sentiments distributed according to the breakdown
 */
export function generateReviewSentiments(breakdown: SentimentBreakdown, reviewCount: number): string[] {
  const sentiments: string[] = [];
  
  const positiveCount = Math.round((breakdown.positive / 100) * reviewCount);
  const negativeCount = Math.round((breakdown.negative / 100) * reviewCount);
  const mixedCount = reviewCount - positiveCount - negativeCount;
  
  for (let i = 0; i < positiveCount; i++) sentiments.push('Positive');
  for (let i = 0; i < mixedCount; i++) sentiments.push('Mixed');
  for (let i = 0; i < negativeCount; i++) sentiments.push('Negative');
  
  // Shuffle array for realistic distribution
  return sentiments.sort(() => Math.random() - 0.5);
}
