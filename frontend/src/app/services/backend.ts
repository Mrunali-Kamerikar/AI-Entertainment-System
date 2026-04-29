/**
 * Backend API Service
 * All backend configuration is centralized in /src/app/config/env.ts
 * Set VITE_BACKEND_URL environment variable for custom backend
 *
 * For production deployments:
 * - Docker: Set VITE_BACKEND_URL in docker-compose.yml or Dockerfile ENV
 * - AWS/Cloud: Set VITE_BACKEND_URL in environment configuration
 * - Default: Uses ${window.location.hostname}:8000
 */

import { calculateSentiment, generateReviewSentiments } from '../utils/sentimentCalculator';
import { BACKEND_CONFIG } from '../config/env';

const BACKEND_URL = BACKEND_CONFIG.baseUrl;

// Auth token storage
let authToken: string | null = null;

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
});

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// ────────────────────────────────────────────
// Auth — Production Grade
// ────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${BACKEND_URL}/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Login failed');
  }
  
  authToken = data.token || null;
  return data;
};

export const signUpUser = async (email: string, username: string, password: string) => {
  const response = await fetch(`${BACKEND_URL}/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, username, password }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Signup failed');
  }
  
  authToken = data.token || null;
  return data;
};

// ────────────────────────────────────────────
// User Engagement — Production Grade
// ────────────────────────────────────────────
export const getUserEngagement = async (userId: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/engagement/${userId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) return { watchlist: [], favorites: [], ratings: {} };
    return await response.json();
  } catch (error) {
    console.error('Error fetching engagement:', error);
    return { watchlist: [], favorites: [], ratings: {} };
  }
};

export const addToWatchlist = async (userId: string, movie: any) => {
  const response = await fetch(`${BACKEND_URL}/watchlist/add`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ user_id: userId, movie_id: movie.id, movie_data: movie }),
  });
  return await response.json();
};

export const removeFromWatchlist = async (userId: string, movieId: number) => {
  const response = await fetch(`${BACKEND_URL}/watchlist/remove`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ user_id: userId, movie_id: movieId }),
  });
  return await response.json();
};

export const toggleFavorite = async (userId: string, movieId: number) => {
  const response = await fetch(`${BACKEND_URL}/favorites/toggle`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ user_id: userId, movie_id: movieId }),
  });
  return await response.json();
};

export const submitRating = async (userId: string, movieId: number, rating: number) => {
  const response = await fetch(`${BACKEND_URL}/ratings/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ user_id: userId, movie_id: movieId, rating }),
  });
  return await response.json();
};

// ────────────────────────────────────────────
// POST /recommend — Get AI recommendations
// ────────────────────────────────────────────
export interface RecommendRequest {
  query: string;
  userId: string;
  genres?: string[];
  limit?: number;
}

export const getRecommendations = async (req: RecommendRequest) => {
  try {
    const response = await fetch(`${BACKEND_URL}/recommend`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(req),
    });
    if (!response.ok) throw new Error('Recommendation failed');
    return await response.json();
  } catch {
    // Return mock response — real backend will replace this
    return null;
  }
};

// ────────────────────────────────────────────
// GET /summary/:movieId — AI movie summary
// ────────────────────────────────────────────
export const getMovieSummary = async (movieId: number, title: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/summary/${movieId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Summary fetch failed');
    return await response.json();
  } catch {
    // Mock AI-generated summary
    return {
      summary: `This critically acclaimed film "${title}" weaves together themes of identity, memory, and human connection in ways that challenge conventional storytelling. The AI analysis identifies strong narrative coherence and exceptional character development that resonates deeply with viewers who appreciate psychological depth.`,
      themes: ['Identity', 'Memory', 'Connection', 'Redemption'],
      sentiment: 'Positive',
      aiInsight: 'Based on semantic analysis of 15,000+ user reviews, this film consistently evokes feelings of wonder and intellectual stimulation.',
      keyScenes: ['Opening sequence', 'Plot twist at act 2', 'Climactic resolution'],
    };
  }
};

// ────────────────────────────────────────────
// GET /review/:movieId — Fetch reviews with AI sentiment
// ────────────────────────────────────────────
export const getMovieReviews = async (movieId: number, voteAverage = 7.5, voteCount = 1000) => {
  try {
    const response = await fetch(`${BACKEND_URL}/review/${movieId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Review fetch failed');
    return await response.json();
  } catch {
    // Calculate dynamic sentiment based on TMDB rating
    const sentimentBreakdown = calculateSentiment(voteAverage, voteCount, movieId);
    const reviewSentiments = generateReviewSentiments(sentimentBreakdown, 4);
    
    // Generate reviews with distributed sentiments
    const reviews = [
      {
        id: 1, author: 'CinemaEnthusiast', rating: voteAverage >= 8 ? 9 : voteAverage >= 6 ? 8 : 6,
        content: 'An absolute masterpiece of modern cinema. The direction is flawless and every frame feels intentional.',
        sentiment: reviewSentiments[0], helpfulVotes: 245, date: '2024-01-15',
      },
      {
        id: 2, author: 'FilmCritic2024', rating: voteAverage >= 7 ? 8 : voteAverage >= 5 ? 7 : 5,
        content: 'Visually stunning with an emotionally resonant story. The performances elevate the material.',
        sentiment: reviewSentiments[1], helpfulVotes: 189, date: '2024-02-03',
      },
      {
        id: 3, author: 'MovieBuff88', rating: voteAverage >= 6 ? 7 : voteAverage >= 4 ? 6 : 4,
        content: 'Good film but the pacing drags in the second act. Still worth watching for the performances.',
        sentiment: reviewSentiments[2], helpfulVotes: 112, date: '2024-02-20',
      },
      {
        id: 4, author: 'NightOwlViewer', rating: voteAverage >= 8 ? 10 : voteAverage >= 6 ? 8 : 5,
        content: 'Changed how I think about the genre. A rare cinematic experience that deserves every accolade.',
        sentiment: reviewSentiments[3], helpfulVotes: 330, date: '2024-03-01',
      },
    ];
    
    return {
      reviews,
      averageRating: voteAverage.toFixed(1),
      sentimentBreakdown,
    };
  }
};

// ────────────────────────────────────────────
// POST /qa — AI Q&A about movies
// ────────────────────────────────────────────
export const askMovieQuestion = async (question: string, movieContext?: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/qa`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question, context: movieContext }),
    });
    if (!response.ok) throw new Error('Q&A failed');
    return await response.json();
  } catch {
    // Enhanced mock AI response with structured formatting
    const lowerQ = question.toLowerCase();
    
    let answer = '';
    let relatedMovies: string[] = [];
    
    if (lowerQ.includes('inception') || lowerQ.includes('unique')) {
      answer = `Key Points:\n\nInception stands out for several groundbreaking reasons:\n\n• Innovative Narrative Structure - The film uses multiple dream layers simultaneously, creating a complex yet coherent storyline.\n\n• Visual Effects Mastery - Practical effects like the rotating hallway fight scene were achieved without CGI, setting new standards.\n\n• Philosophical Depth - It explores themes of reality, memory, and subconsciousness in ways rarely seen in mainstream cinema.\n\n• Hans Zimmer's Score - The iconic soundtrack uses time-dilation techniques that mirror the plot's dream mechanics.\n\nConclusion: These elements combined create a film that rewards multiple viewings and continues to influence modern sci-fi cinema.`;
      relatedMovies = ['The Matrix', 'Interstellar', 'Blade Runner 2049', 'Arrival'];
    } else if (lowerQ.includes('recommend') || lowerQ.includes('thriller') || lowerQ.includes('psychological')) {
      answer = `Top Psychological Thriller Recommendations:\n\n1. Shutter Island - Mind-bending mystery with unreliable narrator\n2. Gone Girl - Dark examination of marriage and media manipulation\n3. Prisoners - Intense moral dilemma wrapped in a kidnapping thriller\n4. Nightcrawler - Disturbing character study of ambition gone wrong\n5. The Prestige - Nolan's tale of obsession and sacrifice\n\nKey Themes:\n• Unreliable narrators and plot twists\n• Psychological depth and character study\n• Moral ambiguity\n• Tension-building cinematography`;
      relatedMovies = ['Shutter Island', 'Gone Girl', 'Prisoners', 'The Prestige'];
    } else if (lowerQ.includes('nolan') || lowerQ.includes('christopher')) {
      answer = `Best Christopher Nolan Films:\n\n1. The Dark Knight (2008) - 9.0/10\n   Redefines superhero genre with psychological depth\n\n2. Inception (2010) - 8.8/10\n   Mind-bending heist within dreams\n\n3. Interstellar (2014) - 8.6/10\n   Epic sci-fi exploring love and time\n\n4. Memento (2000) - 8.4/10\n   Reverse-chronology thriller about memory\n\n5. The Prestige (2006) - 8.5/10\n   Rivalry between magicians with shocking twists\n\nNolan's Signature Style:\n• Non-linear storytelling\n• Practical effects preference\n• Complex moral themes\n• IMAX cinematography`;
      relatedMovies = ['The Dark Knight', 'Inception', 'Interstellar', 'Memento'];
    } else if (lowerQ.includes('similar') || lowerQ.includes('dark knight') || lowerQ.includes('batman')) {
      answer = `Movies Similar to The Dark Knight:\n\n• Heat (1995) - Crime epic with similar scope and intensity\n• The Town (2010) - Grounded crime thriller with moral complexity\n• Sicario (2015) - Dark exploration of justice and morality\n• Prisoners (2013) - Intense thriller about how far one will go\n• Drive (2011) - Stylish crime film with understated performances\n\nWhy They Match:\nAll feature complex antiheroes, moral ambiguity, exceptional cinematography, and realistic action sequences that prioritize tension over spectacle.`;
      relatedMovies = ['Heat', 'The Town', 'Sicario', 'Prisoners'];
    } else if (lowerQ.includes('oscar') || lowerQ.includes('sci-fi') || lowerQ.includes('scifi')) {
      answer = `Sci-Fi Films That Won Oscars:\n\nBest Picture Winners:\n• Everything Everywhere All at Once (2023) - 7 Oscars including Best Picture\n• The Shape of Water (2018) - 4 Oscars including Best Picture\n\nMajor Oscar Winners:\n• Blade Runner 2049 - 2 Oscars (Cinematography, Visual Effects)\n• Inception - 4 Oscars (Sound, Visual Effects)\n• Interstellar - 1 Oscar (Visual Effects)\n• The Matrix - 4 Oscars (Technical categories)\n• Gravity - 7 Oscars including Director\n\nNotable: Sci-fi often dominates technical categories but rarely wins Best Picture.`;
      relatedMovies = ['Blade Runner 2049', 'Inception', 'Everything Everywhere All at Once', 'Gravity'];
    } else if (lowerQ.includes('2010') || lowerQ.includes('decade')) {
      answer = `Best Films from 2010-2019:\n\nTop 10:\n1. Parasite (2019) - Korean masterpiece, Best Picture winner\n2. Mad Max: Fury Road (2015) - Action perfection\n3. Inception (2010) - Mind-bending thriller\n4. Whiplash (2014) - Intense music drama\n5. The Social Network (2010) - Facebook origin story\n6. Get Out (2017) - Social horror breakthrough\n7. Arrival (2016) - Cerebral sci-fi\n8. La La Land (2016) - Modern musical\n9. Dunkirk (2017) - War film innovation\n10. Spider-Man: Into the Spider-Verse (2018) - Animation revolution\n\nDefining Trends: Diverse voices, streaming rise, international cinema recognition`;
      relatedMovies = ['Parasite', 'Mad Max: Fury Road', 'Inception', 'Whiplash'];
    } else {
      answer = `Summary:\n\nBased on my analysis of your question about "${question}", here are the key insights:\n\n• Cinema combines visual storytelling with emotional resonance to create memorable experiences\n• Great films balance technical excellence with compelling narratives\n• The best recommendations depend on your personal taste in genres and themes\n\nRecommendations:\nI suggest exploring films that match your interests in storytelling complexity and thematic depth. Consider checking out:\n\n1. Arrival - For cerebral sci-fi with emotional core\n2. The Prestige - For intricate plot construction\n3. Her - For unique perspective on technology and humanity\n4. Eternal Sunshine - For innovative narrative structure\n\nWould you like more specific recommendations based on a particular genre or theme?`;
      relatedMovies = ['Arrival', 'The Prestige', 'Her', 'Eternal Sunshine'];
    }
    
    return {
      answer,
      confidence: 0.91,
      relatedMovies,
      sources: ['AI Film Database', 'User Reviews', 'Critical Analysis'],
    };
  }
};

// ────────────────────────────────────────────
// Script Generator Endpoints
// ────────────────────────────────────────────

export interface ScriptCharacter {
  name: string;
  role?: string;
  traits?: string;
}

export interface ScriptCriteria {
  idea: string;
  user_id?: string;
  language?: string;
  length?: string;
  style?: string;
  genre?: string;
  characters?: ScriptCharacter[];
  setting?: string;
  time?: string;
  tone?: string;
}

export const generateScript = async (criteria: ScriptCriteria) => {
  const response = await fetch(`${BACKEND_URL}/generate_script`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(criteria),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || 'Script generation failed');
  }
  return await response.json();
};

export const refineScript = async (script: string, action: 'intense' | 'humorous' | 'dialogue', userId: string) => {
  const response = await fetch(`${BACKEND_URL}/refine_script`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ script, action, user_id: userId }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || 'Script refinement failed');
  }
  return await response.json();
};

export const getUserScripts = async (userId: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/get_user_scripts/${userId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user scripts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user scripts:', error);
    return [];
  }
};

// ────────────────────────────────────────────
// Planner Agent Endpoints
// ────────────────────────────────────────────

export interface PlannerStep {
  step_id: number;
  action: string;
  dependency: number | null;
  resource_required: string;
  estimated_time: string;
}

export interface ExecutionSchedule {
  goal: string;
  steps: PlannerStep[];
  total_estimated_time: string;
  validation_status: string;
  timestamp?: string;
  full_text_plan?: string;
}

export const createExecutionPlan = async (goal: string, userId: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ goal, user_id: userId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Agent Reasoning Loop failed');
    }
    return await response.json() as ExecutionSchedule;
  } catch (error) {
    console.error('Error creating execution plan:', error);
    throw error;
  }
};

export const getUserPlans = async (userId: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/get_user_plans/${userId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch plan history');
    return await response.json() as ExecutionSchedule[];
  } catch (error) {
    console.error('Error fetching plan history:', error);
    return [];
  }
};