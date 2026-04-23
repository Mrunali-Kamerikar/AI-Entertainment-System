/**
 * TMDB API Service
 * Direct API calls with aggressive retry and better error handling.
 * Optimized for reliable poster image URLs.
 *
 * All configuration is now centralized in /src/app/config/env.ts
 */

import { TMDB_CONFIG, isDevelopment } from '../config/env';

export const TMDB_API_KEY = TMDB_CONFIG.apiKey;
const TMDB_BASE_URL = TMDB_CONFIG.baseUrl;
export const TMDB_IMAGE_BASE_URL = `${TMDB_CONFIG.imageBaseUrl}/w500`;
export const TMDB_IMAGE_ORIGINAL = `${TMDB_CONFIG.imageBaseUrl}/original`;
export const TMDB_IMAGE_W300 = `${TMDB_CONFIG.imageBaseUrl}/w300`;

// TMDB API Bearer Token (alternative to API key)
const TMDB_BEARER_TOKEN = TMDB_CONFIG.bearerToken;

// Log TMDB setup on load (only in development)
if (isDevelopment) {
  console.log('🎬 CineVerse TMDB Service initialized - Using REAL-TIME data only');
  console.log('📡 API Key configured:', TMDB_API_KEY ? '✅ Valid' : '❌ Missing');
  console.log('🚫 Mock data fallback: DISABLED');
}

// Genre mapping
export const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western', 10770: 'TV Movie',
};

// Simple in-memory cache with TTL
const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const failureCache = new Map<string, number>(); // Track recent failures per endpoint
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for successful responses
const FAILURE_TTL = 30 * 1000; // 30 seconds before retrying failed endpoints (reduced from 3 minutes)

const getBaseKey = (url: string) => {
  try { return new URL(url).pathname; } catch { return url; }
};

const cachedFetch = async (url: string): Promise<unknown> => {
  const baseKey = getBaseKey(url);

  // Check failure cache — don't hammer failed endpoints
  const lastFailure = failureCache.get(baseKey);
  if (lastFailure && Date.now() - lastFailure < FAILURE_TTL) {
    // Silent fail - already logged on first failure
    throw new Error(`Endpoint unavailable`);
  }

  // Check success cache
  const cached = apiCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced to 10s timeout (was 30s)

  try {
    // Try with Bearer token first (more reliable for CORS)
    const response = await fetch(url, { 
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      failureCache.set(baseKey, Date.now());
      throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    apiCache.set(url, { data, timestamp: Date.now() });
    failureCache.delete(baseKey); // Clear failure on success
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    // Log detailed error information for debugging
    if (!failureCache.has(baseKey)) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn(`⚠️ TMDB API timeout (10s) for ${baseKey}`);
        } else {
          console.warn(`⚠️ TMDB API error for ${baseKey}:`, error.message);
        }
      }
      failureCache.set(baseKey, Date.now());
    }
    throw error;
  }
};

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  original_language: string;
}

export interface TMDBMovieDetail extends TMDBMovie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  budget: number;
  revenue: number;
  status: string;
}

// Fetch trending movies (week)
export const fetchTrendingMovies = async (): Promise<TMDBMovie[]> => {
  try {
    const data = await cachedFetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`) as { results: TMDBMovie[] };
    return data.results || [];
  } catch (error) {
    console.warn('⚠️ Could not fetch trending movies:', (error as Error).message);
    return [];
  }
};

// Search movies — no gate, direct call
export const searchMovies = async (query: string): Promise<TMDBMovie[]> => {
  if (!query.trim()) return [];
  try {
    const data = await cachedFetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
    ) as { results: TMDBMovie[] };
    console.log(`🔍 Search "${query}" → ${data.results?.length || 0} results`);
    return data.results || [];
  } catch (error) {
    console.warn('⚠️ TMDB search unavailable:', (error as Error).message);
    return [];
  }
};

// Fetch movie detail
export const fetchMovieDetail = async (movieId: number): Promise<TMDBMovieDetail | null> => {
  if (!movieId || movieId <= 0) return null;
  try {
    const data = await cachedFetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`) as TMDBMovieDetail;
    return data;
  } catch (error) {
    console.warn('⚠️ Could not fetch movie detail:', (error as Error).message);
    return null;
  }
};

// Fetch movies by genre
export const fetchMoviesByGenre = async (genreId: number): Promise<TMDBMovie[]> => {
  try {
    const data = await cachedFetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
    ) as { results: TMDBMovie[] };
    return data.results || [];
  } catch (error) {
    console.warn('⚠️ Could not fetch movies by genre:', (error as Error).message);
    return [];
  }
};

// Fetch similar movies
export const fetchSimilarMovies = async (movieId: number): Promise<TMDBMovie[]> => {
  if (!movieId || movieId <= 0) return [];
  try {
    const data = await cachedFetch(
      `${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}`
    ) as { results: TMDBMovie[] };
    return data.results?.slice(0, 6) || [];
  } catch (error) {
    console.warn('⚠️ Could not fetch similar movies:', (error as Error).message);
    return [];
  }
};

// Get full image URL with better fallback handling
// This ensures images work globally regardless of deployment location
export const getImageUrl = (path: string | null, size: 'w300' | 'w500' | 'original' = 'w500'): string => {
  if (!path) return '';
  // If already a full URL, return as-is
  if (path.startsWith('http')) return path;
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Use centralized image base URL
  return `${TMDB_CONFIG.imageBaseUrl}/${size}${cleanPath}`;
};

export const getBackdropUrl = (path: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Use centralized image base URL
  return `${TMDB_CONFIG.imageBaseUrl}/original${cleanPath}`;
};

// Industry-specific movie fetching functions (all direct, no global gate)

export const fetchBollywoodMovies = async (page = 1): Promise<TMDBMovie[]> => {
  try {
    const data = await cachedFetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=${page}&vote_count.gte=10`
    ) as { results: TMDBMovie[] };
    return data.results || [];
  } catch (error) {
    console.warn('⚠️ Bollywood fetch failed:', (error as Error).message);
    return [];
  }
};

export const fetchHollywoodMovies = async (page = 1): Promise<TMDBMovie[]> => {
  try {
    const data = await cachedFetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&sort_by=popularity.desc&page=${page}&vote_count.gte=100`
    ) as { results: TMDBMovie[] };
    return data.results || [];
  } catch (error) {
    console.warn('⚠️ Hollywood fetch failed:', (error as Error).message);
    return [];
  }
};

export const fetchTollywoodMovies = async (page = 1): Promise<TMDBMovie[]> => {
  try {
    const data = await cachedFetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=te&sort_by=popularity.desc&page=${page}&vote_count.gte=5`
    ) as { results: TMDBMovie[] };
    return data.results || [];
  } catch (error) {
    console.warn('⚠️ Tollywood fetch failed:', (error as Error).message);
    return [];
  }
};

export const fetchKDramaMovies = async (page = 1): Promise<TMDBMovie[]> => {
  try {
    const data = await cachedFetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ko&sort_by=popularity.desc&page=${page}&vote_count.gte=10`
    ) as { results: TMDBMovie[] };
    return data.results || [];
  } catch (error) {
    console.warn('⚠️ K-Drama fetch failed:', (error as Error).message);
    return [];
  }
};

export const fetchAnimeMovies = async (page = 1): Promise<TMDBMovie[]> => {
  try {
    const data = await cachedFetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&page=${page}&vote_count.gte=10`
    ) as { results: TMDBMovie[] };
    return data.results || [];
  } catch (error) {
    console.warn('⚠️ Anime fetch failed:', (error as Error).message);
    return [];
  }
};

// Fetch all industry movies at once
export const fetchAllIndustryMovies = async () => {
  try {
    const [bollywood, hollywood, tollywood, kdrama, anime] = await Promise.all([
      fetchBollywoodMovies(1),
      fetchHollywoodMovies(1),
      fetchTollywoodMovies(1),
      fetchKDramaMovies(1),
      fetchAnimeMovies(1),
    ]);
    return {
      bollywood: bollywood.slice(0, 20),
      hollywood: hollywood.slice(0, 20),
      tollywood: tollywood.slice(0, 20),
      kdrama: kdrama.slice(0, 20),
      anime: anime.slice(0, 20),
    };
  } catch (error) {
    console.error('Error fetching industry movies:', error);
    return { bollywood: [], hollywood: [], tollywood: [], kdrama: [], anime: [] };
  }
};

// Fetch movie credits (cast information)
export const fetchMovieCredits = async (movieId: number): Promise<string[]> => {
  if (!movieId || movieId <= 0) return [];
  try {
    const data = await cachedFetch(
      `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
    ) as { cast: Array<{ name: string; order: number }> };
    return data.cast?.slice(0, 5).map(c => c.name) || [];
  } catch {
    return [];
  }
};

// Clear all caches (for retry functionality)
export const clearAllCaches = () => {
  apiCache.clear();
  failureCache.clear();
  console.log('🔄 All TMDB caches cleared - ready for fresh requests');
};