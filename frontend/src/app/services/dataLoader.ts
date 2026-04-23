/**
 * Data Loader Service
 * Loads real movie data from TMDB API for all industries.
 * FALLBACK to sample data if TMDB is unavailable (network restricted environments).
 */

import {
  fetchBollywoodMovies,
  fetchHollywoodMovies,
  fetchTollywoodMovies,
  fetchKDramaMovies,
  fetchAnimeMovies,
  fetchTrendingMovies,
  TMDBMovie,
} from './tmdb';
import { transformTMDBMovies } from './movieTransformer';
import { MovieData } from '../data/mockData';
import { 
  BOLLYWOOD_MOVIES, 
  HOLLYWOOD_MOVIES,
  TOLLYWOOD_MOVIES, 
  ANIME_MOVIES, 
  KDRAMA_MOVIES,
  ALL_INDUSTRY_MOVIES 
} from '../data/industryMovies';

// Helper to extract result from settled promise
const getSettled = (r: PromiseSettledResult<TMDBMovie[]>): TMDBMovie[] =>
  r.status === 'fulfilled' ? r.value : [];

// Load all industry movies from TMDB with AGGRESSIVE retry - NO MOCK FALLBACK
export const loadAllIndustryMovies = async (): Promise<{
  bollywood: MovieData[];
  hollywood: MovieData[];
  tollywood: MovieData[];
  kdrama: MovieData[];
  anime: MovieData[];
  all: MovieData[];
}> => {
  console.log('🎬 Loading movies from TMDB API (with sample data fallback)...');

  // Try a quick test call first to see if TMDB is accessible
  try {
    console.log('🔬 Testing TMDB API connectivity...');
    const testResult = await Promise.race([
      fetchHollywoodMovies(1),
      new Promise<TMDBMovie[]>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000) // Increased from 5s to 15s
      )
    ]);
    
    if (testResult.length === 0) {
      throw new Error('TMDB returned empty results - API key may be invalid');
    }
    
    console.log('✅ TMDB API accessible! Loading full dataset...');
    // TMDB is working, continue with full load
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️ TMDB API unavailable (${errorMsg}). Using sample data for demonstration.`);
    console.log(`📚 Loading ${ALL_INDUSTRY_MOVIES.length} sample movies...`);
    
    // Return sample data immediately
    return {
      bollywood: BOLLYWOOD_MOVIES,
      hollywood: HOLLYWOOD_MOVIES,
      tollywood: TOLLYWOOD_MOVIES,
      kdrama: KDRAMA_MOVIES,
      anime: ANIME_MOVIES,
      all: ALL_INDUSTRY_MOVIES,
    };
  }

  // Fetch movies from all industries - ONE AT A TIME to avoid overwhelming API
  // Retry up to 2 times for each category
  const fetchWithRetry = async (fetchFn: (page: number) => Promise<TMDBMovie[]>, page: number, retries = 2): Promise<TMDBMovie[]> => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`⏳ Attempt ${i + 1}/${retries} for page ${page}...`);
        const result = await fetchFn(page);
        if (result.length > 0) {
          console.log(`✅ Success! Got ${result.length} movies on attempt ${i + 1}`);
          return result;
        }
        // If empty, wait a bit and retry
        console.warn(`⚠️ Empty result on attempt ${i + 1}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Retry ${i + 1}/${retries} failed for page ${page}:`, errorMsg);
        if (i < retries - 1) {
          const waitTime = 2000 * (i + 1);
          console.log(`⏱️ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    console.error(`❌ All retries exhausted for page ${page}`);
    return [];
  };

  // Helper to add delay between requests
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  try {
    console.log('📡 Fetching Hollywood movies (page 1)...');
    const hollywoodPage1 = await fetchWithRetry(fetchHollywoodMovies, 1);
    await delay(300); // 300ms delay between requests

    console.log('📡 Fetching Hollywood movies (page 2)...');
    const hollywoodPage2 = await fetchWithRetry(fetchHollywoodMovies, 2);
    await delay(300);

    console.log('📡 Fetching Bollywood movies (page 1)...');
    const bollywoodPage1 = await fetchWithRetry(fetchBollywoodMovies, 1);
    await delay(300);

    console.log('📡 Fetching Bollywood movies (page 2)...');
    const bollywoodPage2 = await fetchWithRetry(fetchBollywoodMovies, 2);
    await delay(300);

    console.log('📡 Fetching Tollywood movies (page 1)...');
    const tollywoodPage1 = await fetchWithRetry(fetchTollywoodMovies, 1);
    await delay(300);

    console.log('📡 Fetching Tollywood movies (page 2)...');
    const tollywoodPage2 = await fetchWithRetry(fetchTollywoodMovies, 2);
    await delay(300);

    console.log('📡 Fetching K-Drama movies (page 1)...');
    const kdramaPage1 = await fetchWithRetry(fetchKDramaMovies, 1);
    await delay(300);

    console.log('📡 Fetching K-Drama movies (page 2)...');
    const kdramaPage2 = await fetchWithRetry(fetchKDramaMovies, 2);
    await delay(300);

    console.log('📡 Fetching Anime movies (page 1)...');
    const animePage1 = await fetchWithRetry(fetchAnimeMovies, 1);
    await delay(300);

    console.log('📡 Fetching Anime movies (page 2)...');
    const animePage2 = await fetchWithRetry(fetchAnimeMovies, 2);

    const bollywoodRaw = [...bollywoodPage1, ...bollywoodPage2];
    const hollywoodRaw = [...hollywoodPage1, ...hollywoodPage2];
    const tollywoodRaw = [...tollywoodPage1, ...tollywoodPage2];
    const kdramaRaw    = [...kdramaPage1,    ...kdramaPage2];
    const animeRaw     = [...animePage1,     ...animePage2];

    // Transform TMDB data to app format
    const bollywood = transformTMDBMovies(bollywoodRaw.slice(0, 40), 'Bollywood', 100000);
    const hollywood = transformTMDBMovies(hollywoodRaw.slice(0, 40), 'Hollywood', 200000);
    const tollywood = transformTMDBMovies(tollywoodRaw.slice(0, 40), 'Tollywood', 300000);
    const kdrama = transformTMDBMovies(kdramaRaw.slice(0, 40), 'K-Drama', 400000);
    const anime = transformTMDBMovies(animeRaw.slice(0, 40), 'Anime', 500000);

    const all = [...bollywood, ...hollywood, ...tollywood, ...kdrama, ...anime];

    console.log(`✅ Loaded ${all.length} REAL movies from TMDB`);
    console.log(`   Bollywood: ${bollywood.length} | Hollywood: ${hollywood.length} | Tollywood: ${tollywood.length} | K-Drama: ${kdrama.length} | Anime: ${anime.length}`);

    return { bollywood, hollywood, tollywood, kdrama, anime, all };
  } catch (error) {
    console.error('❌ Error loading industry movies:', error);
    console.log('📚 Falling back to sample data...');
    // Return sample data instead
    return {
      bollywood: BOLLYWOOD_MOVIES,
      hollywood: HOLLYWOOD_MOVIES,
      tollywood: TOLLYWOOD_MOVIES,
      kdrama: KDRAMA_MOVIES,
      anime: ANIME_MOVIES,
      all: ALL_INDUSTRY_MOVIES,
    };
  }
};

// Load trending movies from TMDB
export const loadTrendingMovies = async (): Promise<MovieData[]> => {
  try {
    console.log('🔥 Loading trending movies from TMDB API...');
    const trendingRaw = await fetchTrendingMovies();

    if (trendingRaw.length === 0) {
      console.warn('⚠️ No trending movies from TMDB, using sample data');
      // Return top-rated sample movies as "trending"
      return ALL_INDUSTRY_MOVIES
        .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
        .slice(0, 10);
    }

    const trending = transformTMDBMovies(trendingRaw.slice(0, 20), 'Hollywood', 600000);
    console.log(`✅ Loaded ${trending.length} trending movies`);
    return trending;
  } catch (error) {
    console.error('❌ Error loading trending movies, using sample data');
    // Return top-rated sample movies as "trending"
    return ALL_INDUSTRY_MOVIES
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 10);
  }
};