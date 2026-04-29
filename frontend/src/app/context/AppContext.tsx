/**
 * AppContext — Global state management for the AI Recommendation System
 * Handles: authentication, movie data, ratings, UI state
 * NOW USES ONLY REAL-TIME TMDB DATA - NO MOCK FALLBACKS
 */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { MovieData } from '../data/mockData';
import { searchMovies, fetchTrendingMovies, GENRE_MAP } from '../services/tmdb';
import { getRecommendations, submitRating as apiSubmitRating, loginUser, signUpUser, setAuthToken, getUserEngagement, addToWatchlist as apiAddToWatchlist, removeFromWatchlist as apiRemoveFromWatchlist, toggleFavorite as apiToggleFavorite } from '../services/backend';
import { loadAllIndustryMovies, loadTrendingMovies } from '../services/dataLoader';
import { performLogout, clearSession } from '../utils/authStorage';

type ActiveTab = 'recommendations' | 'summary' | 'reviews' | 'qa' | 'trending' | 'bollywood' | 'hollywood' | 'tollywood' | 'kdrama' | 'anime';
export type ToolType = 'chatbot' | 'scriptGenerator' | 'plannerAgent' | null;

export interface HistoryItem {
  id: number;
  title: string;
  date: string;
  rating: number;
  viewedAt: number; // timestamp for sorting
}

interface AppContextType {
  // Auth
  user: { username: string; userId: string; email?: string; isDemo?: boolean } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  enterDemoMode: () => void;
  logout: () => void;

  // Engagement
  watchlist: MovieData[];
  favorites: number[];
  userRatings: Record<number, number>;
  toggleWatchlist: (movie: MovieData) => Promise<void>;
  toggleFavorite: (movieId: number) => Promise<void>;
  submitRating: (movieId: number, rating: number) => Promise<void>;
  isInWatchlist: (movieId: number) => boolean;
  isFavorite: (movieId: number) => boolean;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: MovieData[];
  isSearching: boolean;
  doSearch: (query: string) => Promise<void>;

  // Data
  trendingMovies: MovieData[];
  recommendations: MovieData[];
  allMovies: MovieData[];
  selectedMovie: MovieData | null;
  setSelectedMovie: (movie: MovieData | null) => void;
  fetchRecommendations: (query: string) => Promise<void>;
  fetchTrending: () => Promise<void>;
  reloadMovies: () => Promise<void>;
  isLoading: boolean;
  activeGenreFilter: string;
  setActiveGenreFilter: (genre: string) => void;
  recentHistory: HistoryItem[];
  addToHistory: (movie: MovieData) => void;

  // UI/Engagement Notification
  engagementError: string | null;
  clearEngagementError: () => void;

  // Trial Usage
  trialUsage: { planner: number; generator: number };
  refreshTrialUsage: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    // During HMR (Hot Module Replacement), components might temporarily lose context
    // Log warning but provide a fallback to prevent crashes
    if (typeof window !== 'undefined' && (window as any).__DEV_MODE__) {
      console.warn('⚠️ useApp called before AppProvider is ready (possible HMR issue)');
    } else {
      console.error('❌ useApp called outside AppProvider! Make sure AppProvider wraps all routes.');
    }
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
};

// Helper to get relative time (e.g., "2 days ago")
const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  return `${Math.floor(weeks / 4)} month${Math.floor(weeks / 4) !== 1 ? 's' : ''} ago`;
};

// Convert TMDB raw movie to MovieData format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tmdbToMovieData = (raw: any): MovieData => ({
  id: raw.id as number,
  tmdbId: raw.id as number,
  title: raw.title as string,
  overview: raw.overview as string,
  poster_path: raw.poster_path as string || '',
  backdrop_path: raw.backdrop_path as string || '',
  release_date: raw.release_date as string || '',
  vote_average: raw.vote_average as number || 0,
  genre_ids: raw.genre_ids as number[] || [],
  genres: (raw.genre_ids as number[] || []).map((id: number) => GENRE_MAP[id] || '').filter(Boolean),
  runtime: 120,
  tagline: '',
  aiScore: parseFloat(Math.min(10, (raw.vote_average as number || 0) * 1.05).toFixed(1)),
  aiExplanation: 'AI-curated match based on your viewing preferences and genre affinity.',
  aiScoreBreakdown: {
    similarityScore: parseFloat(((raw.vote_average as number || 0) * 0.95).toFixed(1)),
    ratingBoost: 0.3,
    genreBoost: 0.2,
    historyPenalty: 0.1,
  },
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ username: string; userId: string; email?: string; isDemo?: boolean } | null>(null);
  const [recommendations, setRecommendations] = useState<MovieData[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MovieData[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);
  const [searchResults, setSearchResults] = useState<MovieData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('trending');
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenreFilter, setActiveGenreFilter] = useState('All');
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [allMovies, setAllMovies] = useState<MovieData[]>([]);
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('cineverse-history');
    return saved ? JSON.parse(saved) : [];
  });

  // Engagement State
  const [watchlist, setWatchlist] = useState<MovieData[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [engagementError, setEngagementError] = useState<string | null>(null);
  const [trialUsage, setTrialUsage] = useState({ planner: 0, generator: 0 });

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      const userData = {
        username: result.username,
        userId: result.userId,
        email: email,
        isDemo: false
      };
      
      // Update state
      setUser(userData);
      
      // Load engagement from login response
      if (result.engagement) {
        setWatchlist(result.engagement.watchlist || []);
        setFavorites(result.engagement.favorites || []);
        setUserRatings(result.engagement.ratings || {});
      }

      if (result.trial_usage) {
        setTrialUsage(result.trial_usage);
      }
      
      // Store in session storage for persistence
      localStorage.setItem('cineverse-user', JSON.stringify(userData));
      localStorage.setItem('cineverse-token', result.token);
      setAuthToken(result.token);
      
      console.log('✅ User authenticated:', userData);
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, username: string, password: string) => {
    try {
      const result = await signUpUser(email, username, password);
      const userData = {
        username: result.username,
        userId: result.userId,
        email: email,
        isDemo: false
      };
      
      setUser(userData);
      localStorage.setItem('cineverse-user', JSON.stringify(userData));
      localStorage.setItem('cineverse-token', result.token);
      setAuthToken(result.token);
      
      console.log('✅ User registered:', userData);
    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw error;
    }
  }, []);

  const enterDemoMode = useCallback(() => {
    // Generate or retrieve a persistent guest ID for this browser
    let guestId = localStorage.getItem('cineverse-guest-id');
    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('cineverse-guest-id', guestId);
    }

    const demoUser = {
      username: 'Demo User',
      userId: guestId,
      email: 'demo@cineverse.ai',
      isDemo: true
    };
    setUser(demoUser);
    setWatchlist([]);
    setFavorites([]);
    setUserRatings({});
    
    // Fetch current demo usage from backend
    getUserEngagement(demoUser.userId).then(data => {
      if (data.trial_usage) {
        setTrialUsage(data.trial_usage);
      }
    });

    localStorage.setItem('cineverse-user', JSON.stringify(demoUser));
    console.log('🎮 Entered Demo Mode with ID:', guestId);
  }, []);

  const refreshTrialUsage = useCallback(async () => {
    if (!user) return;
    const data = await getUserEngagement(user.userId);
    if (data.trial_usage) {
      setTrialUsage(data.trial_usage);
    }
  }, [user]);

  // Sync user and engagement on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('cineverse-user');
    const savedToken = localStorage.getItem('cineverse-token');
    
    if (savedUser && !user) {
      try {
        const parsed = JSON.parse(savedUser);
        
        // Migrate old global demo user or generic "guest" to new session-scoped guest ID
        if (parsed.userId === 'user_demo' || parsed.userId === 'guest') {
          enterDemoMode();
          return;
        }

        setUser(parsed);
        if (savedToken) {
          setAuthToken(savedToken);
        }
        
        // Fetch fresh engagement and trial data
        getUserEngagement(parsed.userId).then(data => {
          if (data.engagement) {
            setWatchlist(data.engagement.watchlist || []);
            setFavorites(data.engagement.favorites || []);
            setUserRatings(data.engagement.ratings || {});
          }
          if (data.trial_usage) {
            setTrialUsage(data.trial_usage);
          }
        });
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }
  }, [user]);

  // Engagement Actions
  const toggleWatchlist = useCallback(async (movie: MovieData) => {
    if (!user) return;
    if (user.isDemo) {
      setEngagementError('Sign in or sign up to use this feature, or continue browsing in demo mode.');
      return;
    }

    const inWatchlist = watchlist.some(m => m.id === movie.id);
    
    // Optimistic Update
    if (inWatchlist) {
      setWatchlist(prev => prev.filter(m => m.id !== movie.id));
      await apiRemoveFromWatchlist(user.userId, movie.id);
    } else {
      setWatchlist(prev => [...prev, movie]);
      await apiAddToWatchlist(user.userId, movie);
    }
  }, [user, watchlist]);

  const toggleFavorite = useCallback(async (movieId: number) => {
    if (!user) return;
    if (user.isDemo) {
      setEngagementError('Sign in or sign up to use this feature, or continue browsing in demo mode.');
      return;
    }

    // Optimistic Update
    setFavorites(prev => 
      prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]
    );
    await apiToggleFavorite(user.userId, movieId);
  }, [user]);

  const submitRating = useCallback(async (movieId: number, rating: number) => {
    if (!user) return;
    if (user.isDemo) {
      setEngagementError('Sign in or sign up to use this feature, or continue browsing in demo mode.');
      return;
    }

    // Optimistic Update
    setUserRatings(prev => ({ ...prev, [movieId]: rating }));
    await apiSubmitRating(user.userId, movieId, rating);
  }, [user]);

  const isInWatchlist = useCallback((movieId: number) => {
    return watchlist.some(m => m.id === movieId);
  }, [watchlist]);

  const isFavorite = useCallback((movieId: number) => {
    return favorites.includes(movieId);
  }, [favorites]);

  const clearEngagementError = () => setEngagementError(null);

  const logout = useCallback(() => {
    setUser(null);
    setRecommendations([]);
    setUserRatings({});
    performLogout();
    clearSession();
    localStorage.removeItem('cineverse-user');
    localStorage.removeItem('cineverse-token');
    setAuthToken(null);
  }, []);

  const fetchRecommendations = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      // Try backend first
      const backendResult = await getRecommendations({ query, userId: user?.userId || 'anonymous', limit: 12 });
      if (backendResult?.movies) {
        setRecommendations(backendResult.movies);
      } else {
        // Fallback: search TMDB directly
        const tmdbResults = await searchMovies(query);
        if (tmdbResults.length > 0) {
          setRecommendations(tmdbResults.slice(0, 12).map(tmdbToMovieData));
        } else {
          setRecommendations([]);
          console.warn('⚠️ No results found for query:', query);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    try {
      const tmdbResults = await fetchTrendingMovies();
      if (tmdbResults.length > 0) {
        setTrendingMovies(tmdbResults.map(tmdbToMovieData));
      } else {
        setTrendingMovies([]);
        console.warn('⚠️ No trending movies available');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search with TMDB fallback to local search
  const doSearch = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    return new Promise((resolve) => {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          // Try TMDB API search first with timeout
          const tmdbResults = await Promise.race([
            searchMovies(query),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Search timeout')), 2000)
            )
          ]);

          if (tmdbResults.length > 0) {
            const mapped = tmdbResults.slice(0, 12).map(tmdbToMovieData);
            setSearchResults(mapped);
            console.log(`🔍 TMDB search "${query}" → ${mapped.length} results`);
          } else {
            throw new Error('No TMDB results');
          }
        } catch (err) {
          // Fallback to local search when TMDB fails
          if (allMovies.length > 0) {
            const queryLower = query.toLowerCase().trim();
            // More flexible search - matches anywhere in title or partial words
            const filtered = allMovies.filter(m => {
              const titleLower = m.title.toLowerCase();
              const overviewLower = m.overview.toLowerCase();
              
              // Check if title contains the query (handles "3 idiots", "idiots", etc.)
              if (titleLower.includes(queryLower)) return true;
              
              // Check individual words in the query
              const queryWords = queryLower.split(/\s+/);
              if (queryWords.every(word => titleLower.includes(word))) return true;
              
              // Check overview
              if (overviewLower.includes(queryLower)) return true;
              
              // Check genres
              if (m.genres.some(g => g.toLowerCase().includes(queryLower))) return true;
              
              // Check industry
              if (m.industry && m.industry.toLowerCase().includes(queryLower)) return true;
              
              return false;
            });
            
            setSearchResults(filtered.slice(0, 12));
            if (filtered.length > 0) {
              console.log(`✅ Local search "${query}" → ${filtered.length} results`);
            }
          } else {
            setSearchResults([]);
          }
        } finally {
          setIsSearching(false);
          resolve();
        }
      }, 350);
    });
  }, [allMovies]);



  // Add movie to recent history
  const addToHistory = useCallback((movie: MovieData) => {
    const now = Date.now();
    const newItem: HistoryItem = {
      id: movie.id,
      title: movie.title,
      date: getRelativeTime(now),
      rating: userRatings[movie.id] || Math.round(movie.vote_average),
      viewedAt: now,
    };

    setRecentHistory(prev => {
      // Remove duplicates and add to front
      const filtered = prev.filter(item => item.id !== movie.id);
      const updated = [newItem, ...filtered].slice(0, 10); // Keep only 10 most recent
      // Save to localStorage
      localStorage.setItem('cineverse-history', JSON.stringify(updated));
      return updated;
    });
  }, [userRatings]);

  // Custom setSelectedMovie that adds to history
  const handleSetSelectedMovie = useCallback((movie: MovieData | null) => {
    setSelectedMovie(movie);
    if (movie) {
      addToHistory(movie);
    }
  }, [addToHistory]);

  // Function to reload all movies from TMDB
  const reloadMovies = useCallback(async () => {
    console.log('🔄 Reloading all movies from TMDB...');
    setIsLoading(true);
    try {
      const allMovies = await loadAllIndustryMovies();
      if (allMovies.all.length > 0) {
        setRecommendations(allMovies.all);
        setAllMovies(allMovies.all);
        console.log(`✅ Reload successful: ${allMovies.all.length} movies loaded`);
      } else {
        console.warn('⚠️ Reload failed - no movies loaded from TMDB');
        setRecommendations([]);
        setAllMovies([]);
      }
    } catch (error) {
      console.error('❌ Error reloading movies:', error);
      setRecommendations([]);
      setAllMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      setIsLoading(true);
      try {
        const allMovies = await loadAllIndustryMovies();
        if (allMovies.all.length > 0) {
          setRecommendations(allMovies.all);
          setAllMovies(allMovies.all);
          console.log(`✅ Context loaded ${allMovies.all.length} movies (sample data)`);
        } else {
          console.warn('⚠️ No movies loaded - check API availability');
          setRecommendations([]);
          setAllMovies([]);
        }
      } catch (error) {
        console.error('❌ Error in loadMovies:', error);
        setRecommendations([]);
        setAllMovies([]);
      } finally {
        setIsLoading(false);
      }
    };
    const loadTrending = async () => {
      try {
        const trending = await loadTrendingMovies();
        if (trending.length > 0) {
          setTrendingMovies(trending);
          console.log(`✅ Context loaded ${trending.length} trending movies (sample data)`);
        } else {
          console.warn('⚠️ No trending movies available');
          setTrendingMovies([]);
        }
      } catch (error) {
        console.error('❌ Error loading trending:', error);
        setTrendingMovies([]);
      }
    };
    loadMovies();
    loadTrending();
  }, []);

  // Update relative time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentHistory(prev => {
        if (prev.length === 0) return prev;
        // Update the date strings
        const updated = prev.map(item => ({
          ...item,
          date: getRelativeTime(item.viewedAt),
        }));
        // Save to localStorage
        localStorage.setItem('cineverse-history', JSON.stringify(updated));
        return updated;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{
      user, login, signup, enterDemoMode, logout,
      recommendations, trendingMovies, selectedMovie, setSelectedMovie: handleSetSelectedMovie,
      searchResults, isSearching, allMovies, recentHistory, addToHistory,
      activeTab, setActiveTab, activeTool, setActiveTool, isSidebarOpen, setIsSidebarOpen,
      isLoading, searchQuery, setSearchQuery, activeGenreFilter, setActiveGenreFilter,
      userRatings, submitRating,
      watchlist, favorites, toggleWatchlist, toggleFavorite,
       isInWatchlist, isFavorite, engagementError, clearEngagementError,
       trialUsage, refreshTrialUsage,
       fetchRecommendations, fetchTrending, doSearch, reloadMovies,
    }}>
      {children}
    </AppContext.Provider>
  );
};