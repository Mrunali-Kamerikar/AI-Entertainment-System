/**
 * Movie Transformer Service
 * Transforms TMDB API data into app's MovieData format with AI scoring
 */

import { TMDBMovie, GENRE_MAP } from './tmdb';
import { MovieData, Industry } from '../data/mockData';

// Generate AI score based on movie metrics
const generateAIScore = (movie: TMDBMovie): number => {
  const baseScore = movie.vote_average || 0;
  const popularityBonus = Math.min((movie.popularity || 0) / 100, 1);
  const voteCountBonus = Math.min((movie.vote_count || 0) / 1000, 0.5);
  
  const aiScore = baseScore + popularityBonus + voteCountBonus;
  return Math.min(Math.max(aiScore, 0), 10);
};

// Generate AI explanation based on genres and ratings
const generateAIExplanation = (movie: TMDBMovie, industry: Industry): string => {
  const genres = movie.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean).join(', ') || 'Various genres';
  const rating = movie.vote_average || 0;
  
  const explanations = [
    `Highly rated ${industry} film featuring ${genres.toLowerCase()} elements that align with your preferences.`,
    `Popular ${industry} movie combining ${genres.toLowerCase()} with compelling storytelling.`,
    `Acclaimed ${industry} production with strong ${genres.toLowerCase()} themes and excellent reviews.`,
    `Trending ${industry} film that showcases ${genres.toLowerCase()} in an engaging narrative.`,
    `Well-received ${industry} movie with ${genres.toLowerCase()} elements that match your taste.`,
  ];
  
  if (rating >= 8) {
    return explanations[0];
  } else if (rating >= 7) {
    return explanations[1];
  } else if (rating >= 6) {
    return explanations[2];
  } else {
    return explanations[3];
  }
};

// Generate AI score breakdown
const generateAIScoreBreakdown = (movie: TMDBMovie) => {
  const similarityScore = Math.min((movie.vote_average || 0), 9);
  const ratingBoost = Math.min((movie.vote_count || 0) / 2000, 0.6);
  const genreBoost = Math.min((movie.popularity || 0) / 500, 0.4);
  const historyPenalty = 0.4;
  
  return {
    similarityScore: Number(similarityScore.toFixed(1)),
    ratingBoost: Number(ratingBoost.toFixed(1)),
    genreBoost: Number(genreBoost.toFixed(1)),
    historyPenalty: Number(historyPenalty.toFixed(1)),
  };
};

// Transform TMDB movie to app's MovieData format
export const transformTMDBToMovieData = (
  movie: TMDBMovie,
  industry: Industry,
  idOffset = 0
): MovieData => {
  const genres = movie.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean) || [];
  const aiScore = generateAIScore(movie);
  
  return {
    id: idOffset + movie.id,
    tmdbId: movie.id,
    title: movie.title,
    overview: movie.overview || 'No overview available.',
    poster_path: movie.poster_path || '',
    backdrop_path: movie.backdrop_path || movie.poster_path || '',
    release_date: movie.release_date || '2020-01-01',
    vote_average: movie.vote_average || 0,
    genre_ids: movie.genre_ids || [],
    genres,
    runtime: 120, // Default runtime, can be fetched separately if needed
    tagline: '', // Will be populated when fetching details
    aiScore: Number(aiScore.toFixed(1)),
    aiExplanation: generateAIExplanation(movie, industry),
    aiScoreBreakdown: generateAIScoreBreakdown(movie),
    industry,
    popularity: movie.popularity || 0,
    cast: [], // Will be populated when fetching credits
  };
};

// Transform multiple TMDB movies
export const transformTMDBMovies = (
  movies: TMDBMovie[],
  industry: Industry,
  idOffset = 0
): MovieData[] => {
  return movies.map((movie, index) => 
    transformTMDBToMovieData(movie, industry, idOffset + (index * 10000))
  );
};

// Determine industry based on language
export const getIndustryFromLanguage = (language: string): Industry => {
  const industryMap: Record<string, Industry> = {
    'hi': 'Bollywood',
    'en': 'Hollywood',
    'te': 'Tollywood',
    'ko': 'K-Drama',
    'ja': 'Anime',
  };
  
  return industryMap[language] || 'Hollywood';
};
