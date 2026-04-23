/**
 * Mock Data — Used as fallback when TMDB API key is not configured
 * All poster paths are real TMDB image CDN paths
 */

export type Industry = 'Hollywood' | 'Bollywood' | 'Tollywood' | 'Anime' | 'K-Drama';

export interface MovieData {
  id: number;
  tmdbId: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count?: number; // Number of votes from TMDB
  genre_ids: number[];
  genres: string[];
  runtime: number;
  tagline: string;
  aiScore: number;
  aiExplanation: string;
  aiScoreBreakdown: {
    similarityScore: number;
    ratingBoost: number;
    genreBoost: number;
    historyPenalty: number;
  };
  userRating?: number;
  industry?: Industry; // New field for industry categorization
  popularity?: number; // For dynamic trending
  cast?: string[]; // Cast details
  trendingScore?: number; // Calculated trending score
}

export const MOCK_MOVIES: MovieData[] = [
  {
    id: 1, tmdbId: 27205,
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    release_date: '2010-07-16', vote_average: 8.4,
    genre_ids: [28, 878, 9648], genres: ['Action', 'Sci-Fi', 'Mystery'],
    runtime: 148, tagline: 'Your mind is the scene of the crime.',
    aiScore: 9.6,
    aiExplanation: 'Matches your preference for mind-bending sci-fi with layered narratives and psychological depth.',
    aiScoreBreakdown: { similarityScore: 8.9, ratingBoost: 0.5, genreBoost: 0.4, historyPenalty: 0.2 },
    industry: 'Hollywood',
    popularity: 100,
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
  },
  {
    id: 2, tmdbId: 155,
    title: 'The Dark Knight',
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/hqkIcbrOHL86UncnHIsHVcVqzCm.jpg',
    release_date: '2008-07-18', vote_average: 9.0,
    genre_ids: [28, 80, 18], genres: ['Action', 'Crime', 'Drama'],
    runtime: 152, tagline: "Why So Serious?",
    aiScore: 9.4,
    aiExplanation: 'Perfect match for your love of complex moral dilemmas and iconic villain narratives.',
    aiScoreBreakdown: { similarityScore: 9.1, ratingBoost: 0.6, genreBoost: 0.3, historyPenalty: 0.6 },
    industry: 'Hollywood',
    popularity: 95,
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
  },
  {
    id: 3, tmdbId: 157336,
    title: 'Interstellar',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
    release_date: '2014-11-05', vote_average: 8.6,
    genre_ids: [12, 18, 878], genres: ['Adventure', 'Drama', 'Sci-Fi'],
    runtime: 169, tagline: 'Mankind was born on Earth. It was never meant to die here.',
    aiScore: 9.5,
    aiExplanation: 'Strong alignment with your cosmic exploration and emotional sci-fi preferences.',
    aiScoreBreakdown: { similarityScore: 9.2, ratingBoost: 0.5, genreBoost: 0.2, historyPenalty: 0.4 },
    industry: 'Hollywood',
    popularity: 90,
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
  },
  {
    id: 4, tmdbId: 496243,
    title: 'Parasite',
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Park family.",
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: '/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    release_date: '2019-05-30', vote_average: 8.5,
    genre_ids: [35, 18, 53], genres: ['Comedy', 'Drama', 'Thriller'],
    runtime: 132, tagline: "Act like you own the place.",
    aiScore: 9.1,
    aiExplanation: 'Bong Joon-ho\'s social satire aligns perfectly with your taste for intelligent, layered storytelling.',
    aiScoreBreakdown: { similarityScore: 8.7, ratingBoost: 0.4, genreBoost: 0.3, historyPenalty: 0.3 },
    industry: 'K-Drama',
    popularity: 85,
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
  },
  {
    id: 5, tmdbId: 329865,
    title: 'Arrival',
    overview: 'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.',
    poster_path: '/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
    backdrop_path: '/pfRBqHz1i4sqbeYQmPsF5bABFGQ.jpg',
    release_date: '2016-11-11', vote_average: 7.9,
    genre_ids: [18, 878, 9648], genres: ['Drama', 'Sci-Fi', 'Mystery'],
    runtime: 116, tagline: 'Why are they here?',
    aiScore: 9.0,
    aiExplanation: 'Denis Villeneuve\'s cerebral sci-fi masterpiece fits your affinity for time-bending narratives.',
    aiScoreBreakdown: { similarityScore: 8.8, ratingBoost: 0.3, genreBoost: 0.2, historyPenalty: 0.3 },
    industry: 'Hollywood',
    popularity: 80,
    cast: ['Amy Adams', 'Jeremy Renner', 'Forest Whitaker'],
  },
  {
    id: 6, tmdbId: 76341,
    title: 'Mad Max: Fury Road',
    overview: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners.',
    poster_path: '/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
    backdrop_path: '/phszHPFMBCYDCyRKFfuvnOr9BO6.jpg',
    release_date: '2015-05-15', vote_average: 8.1,
    genre_ids: [28, 12, 878], genres: ['Action', 'Adventure', 'Sci-Fi'],
    runtime: 120, tagline: 'What a Lovely Day!',
    aiScore: 8.8,
    aiExplanation: 'Non-stop visceral action with deep thematic undertones matches your high-energy viewing profile.',
    aiScoreBreakdown: { similarityScore: 8.4, ratingBoost: 0.3, genreBoost: 0.4, historyPenalty: 0.3 },
    industry: 'Hollywood',
    popularity: 75,
    cast: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult'],
  },
  {
    id: 7, tmdbId: 603,
    title: 'The Matrix',
    overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop_path: '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
    release_date: '1999-03-31', vote_average: 8.7,
    genre_ids: [28, 878], genres: ['Action', 'Sci-Fi'],
    runtime: 136, tagline: 'Free your mind.',
    aiScore: 9.2,
    aiExplanation: 'A defining sci-fi landmark that perfectly matches your philosophical exploration preferences.',
    aiScoreBreakdown: { similarityScore: 9.0, ratingBoost: 0.5, genreBoost: 0.1, historyPenalty: 0.4 },
    industry: 'Hollywood',
    popularity: 70,
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
  },
  {
    id: 8, tmdbId: 244786,
    title: 'Whiplash',
    overview: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\'s potential.',
    poster_path: '/vik9bLoDhfo4iLyFo3BwqkMiXe6.jpg',
    backdrop_path: '/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg',
    release_date: '2014-10-10', vote_average: 8.5,
    genre_ids: [18, 10402], genres: ['Drama', 'Music'],
    runtime: 107, tagline: 'The road to greatness can take you to the edge.',
    aiScore: 8.9,
    aiExplanation: 'Damien Chazelle\'s intense drama aligns with your appreciation for character-driven excellence.',
    aiScoreBreakdown: { similarityScore: 8.5, ratingBoost: 0.4, genreBoost: 0.3, historyPenalty: 0.3 },
    industry: 'Hollywood',
    popularity: 65,
    cast: ['Miles Teller', 'J.K. Simmons'],
  },
  {
    id: 9, tmdbId: 313369,
    title: 'La La Land',
    overview: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
    poster_path: '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
    backdrop_path: '/dpNeXLEnuKzOvNiCxVwWU4s7a97.jpg',
    release_date: '2016-12-09', vote_average: 8.0,
    genre_ids: [10402, 18, 10749], genres: ['Music', 'Drama', 'Romance'],
    runtime: 128, tagline: 'Here\'s to the fools who dream.',
    aiScore: 8.7,
    aiExplanation: 'A love letter to dreamers that matches your appreciation for bittersweet emotional storytelling.',
    aiScoreBreakdown: { similarityScore: 8.3, ratingBoost: 0.4, genreBoost: 0.2, historyPenalty: 0.2 },
    industry: 'Hollywood',
    popularity: 60,
    cast: ['Ryan Gosling', 'Emma Stone'],
  },
  {
    id: 10, tmdbId: 335984,
    title: 'Blade Runner 2049',
    overview: 'A young blade runner\'s discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.',
    poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdrop_path: '/ilRyazdMJNRmrCqNBtApUNwIlRb.jpg',
    release_date: '2017-10-06', vote_average: 7.9,
    genre_ids: [18, 878, 9648], genres: ['Drama', 'Sci-Fi', 'Mystery'],
    runtime: 164, tagline: 'The key to the future is finally unearthed.',
    aiScore: 9.0,
    aiExplanation: 'Denis Villeneuve\'s atmospheric neo-noir aligns with your taste for visually immersive sci-fi.',
    aiScoreBreakdown: { similarityScore: 8.8, ratingBoost: 0.3, genreBoost: 0.2, historyPenalty: 0.3 },
    industry: 'Hollywood',
    popularity: 55,
    cast: ['Ryan Gosling', 'Harrison Ford'],
  },
  {
    id: 11, tmdbId: 438631,
    title: 'Dune',
    overview: 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe.',
    poster_path: '/d5NXSklXo0qyIYkgV61RobFKCge.jpg',
    backdrop_path: '/eeicovYBnTgK7L7sPMY5e9e7T5Z.jpg',
    release_date: '2021-09-15', vote_average: 8.0,
    genre_ids: [12, 878, 18], genres: ['Adventure', 'Sci-Fi', 'Drama'],
    runtime: 155, tagline: 'Beyond fear, destiny awaits.',
    aiScore: 9.1,
    aiExplanation: 'Epic world-building that matches your appetite for grand-scale immersive sci-fi adventures.',
    aiScoreBreakdown: { similarityScore: 8.9, ratingBoost: 0.3, genreBoost: 0.3, historyPenalty: 0.4 },
    industry: 'Hollywood',
    popularity: 50,
    cast: ['Timothée Chalamet', 'Zendaya'],
  },
  {
    id: 12, tmdbId: 419430,
    title: 'Get Out',
    overview: 'A young African-American visits his white girlfriend\'s parents for the weekend, where his simmering uneasiness about their behavior is proven to be entirely justified.',
    poster_path: '/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg',
    backdrop_path: '/ay2IMU7bOg3TBRiP6jTMHfVHUJd.jpg',
    release_date: '2017-02-24', vote_average: 7.7,
    genre_ids: [27, 9648, 53], genres: ['Horror', 'Mystery', 'Thriller'],
    runtime: 104, tagline: 'Just because you\'re invited, doesn\'t mean you\'re welcome.',
    aiScore: 8.6,
    aiExplanation: 'Jordan Peele\'s genre-bending social horror is a perfect match for your intelligent thriller preferences.',
    aiScoreBreakdown: { similarityScore: 8.2, ratingBoost: 0.4, genreBoost: 0.3, historyPenalty: 0.3 },
    industry: 'Hollywood',
    popularity: 45,
    cast: ['Daniel Kaluuya', 'Lupita Nyong\'o'],
  },
  {
    id: 13, tmdbId: 299534,
    title: 'Avengers: Endgame',
    overview: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. The Avengers assemble once more to reverse the damage and restore balance.',
    poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    release_date: '2019-04-26', vote_average: 8.4,
    genre_ids: [12, 28, 878], genres: ['Adventure', 'Action', 'Sci-Fi'],
    runtime: 181, tagline: 'Part of the journey is the end.',
    aiScore: 8.7,
    aiExplanation: 'A culmination of epic storytelling that matches your preference for emotionally satisfying narratives.',
    aiScoreBreakdown: { similarityScore: 8.3, ratingBoost: 0.5, genreBoost: 0.2, historyPenalty: 0.3 },
    industry: 'Hollywood',
    popularity: 40,
    cast: ['Robert Downey Jr.', 'Chris Evans'],
  },
  {
    id: 14, tmdbId: 324857,
    title: 'Spider-Man: Into the Spider-Verse',
    overview: 'Miles Morales becomes the Spider-Man of his reality and crosses the Multiverse to meet five spider-powered individuals.',
    poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    backdrop_path: '/5zYKjlBGFTVL5OaJQrAfaFBb0JX.jpg',
    release_date: '2018-12-14', vote_average: 8.4,
    genre_ids: [16, 28, 12], genres: ['Animation', 'Action', 'Adventure'],
    runtime: 117, tagline: 'More than one wears the mask.',
    aiScore: 9.0,
    aiExplanation: 'Groundbreaking animation style and heartfelt story perfectly match your appreciation for innovative filmmaking.',
    aiScoreBreakdown: { similarityScore: 8.7, ratingBoost: 0.4, genreBoost: 0.2, historyPenalty: 0.3 },
    industry: 'Hollywood',
    popularity: 35,
    cast: ['Shameik Moore', 'Jake Johnson'],
  },
  {
    id: 15, tmdbId: 597,
    title: 'Titanic',
    overview: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
    poster_path: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    backdrop_path: '/kGzFbGhp99zva6oZODW5atUtnqi.jpg',
    release_date: '1997-12-19', vote_average: 8.0,
    genre_ids: [18, 10749], genres: ['Drama', 'Romance'],
    runtime: 194, tagline: 'Nothing on Earth could come between them.',
    aiScore: 8.4,
    aiExplanation: 'James Cameron\'s epic romance aligns with your emotional drama preference scores.',
    aiScoreBreakdown: { similarityScore: 8.0, ratingBoost: 0.4, genreBoost: 0.3, historyPenalty: 0.3 },
    industry: 'Hollywood',
    popularity: 30,
    cast: ['Leonardo DiCaprio', 'Kate Winslet'],
  },
  {
    id: 16, tmdbId: 680,
    title: 'Pulp Fiction',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    release_date: '1994-10-14', vote_average: 8.9,
    genre_ids: [53, 80], genres: ['Thriller', 'Crime'],
    runtime: 154, tagline: 'You won\'t know the facts until you\'ve seen the fiction.',
    aiScore: 9.3,
    aiExplanation: 'Tarantino\'s nonlinear storytelling masterpiece is a strong match for your appreciation of bold cinematic choices.',
    aiScoreBreakdown: { similarityScore: 9.0, ratingBoost: 0.5, genreBoost: 0.2, historyPenalty: 0.4 },
    industry: 'Hollywood',
    popularity: 25,
    cast: ['John Travolta', 'Uma Thurman'],
  },
];

// Import industry-specific movies
import {
  ALL_INDUSTRY_MOVIES,
  BOLLYWOOD_MOVIES,
  TOLLYWOOD_MOVIES,
  ANIME_MOVIES,
  KDRAMA_MOVIES,
} from './industryMovies';

// Combine Hollywood with all other industries
export const ALL_MOVIES = [...MOCK_MOVIES, ...ALL_INDUSTRY_MOVIES];

// Export industry-specific collections
export { BOLLYWOOD_MOVIES, TOLLYWOOD_MOVIES, ANIME_MOVIES, KDRAMA_MOVIES };

// Dynamic trending calculation based on popularity and recent dates
export const calculateTrendingMovies = (movies: MovieData[]): MovieData[] => {
  const now = new Date();
  return movies
    .map(movie => {
      const releaseDate = new Date(movie.release_date);
      const daysSinceRelease = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
      // Newer movies and higher popularity get higher trending scores
      const recencyScore = Math.max(0, 100 - (daysSinceRelease / 365) * 10);
      const trendingScore = (movie.popularity || 0) * 0.7 + recencyScore * 0.3;
      return { ...movie, trendingScore };
    })
    .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
    .slice(0, 15);
};

// Mock trending movies - now dynamic
export const MOCK_TRENDING = calculateTrendingMovies(ALL_MOVIES);

// Mock genre preference data for chart
export const MOCK_GENRE_PREFERENCES = [
  { id: 'scifi', genre: 'Sci-Fi', count: 24, color: '#E50914' },
  { id: 'thriller', genre: 'Thriller', count: 18, color: '#FF6B35' },
  { id: 'action', genre: 'Action', count: 15, color: '#F7B731' },
  { id: 'drama', genre: 'Drama', count: 13, color: '#26de81' },
  { id: 'mystery', genre: 'Mystery', count: 11, color: '#4BCBEB' },
  { id: 'crime', genre: 'Crime', count: 8, color: '#a55eea' },
  { id: 'horror', genre: 'Horror', count: 6, color: '#fc5c65' },
  { id: 'romance', genre: 'Romance', count: 5, color: '#fd9644' },
];

// Mock watch history
export const MOCK_HISTORY = [
  { id: 1, title: 'Inception', date: '2 days ago', rating: 9 },
  { id: 2, title: 'The Matrix', date: '5 days ago', rating: 10 },
  { id: 3, title: 'Parasite', date: '1 week ago', rating: 8 },
  { id: 4, title: 'Interstellar', date: '2 weeks ago', rating: 9 },
  { id: 5, title: 'Arrival', date: '3 weeks ago', rating: 8 },
];