/**
 * Environment Configuration
 *
 * This file handles all environment variables for the CineVerse application.
 * All API keys and URLs should be configured through environment variables.
 *
 * For development: Create a .env file in the project root
 * For production: Set these variables in your deployment platform (Docker, AWS, etc.)
 */

// Environment variable helper with fallback
const getEnvVar = (key: string, fallback: string = ''): string => {
  // In Vite, environment variables are exposed via import.meta.env
  // and must be prefixed with VITE_ to be exposed to the client
  return import.meta.env[key] || fallback;
};

// TMDB Configuration
export const TMDB_CONFIG = {
  apiKey: getEnvVar('VITE_TMDB_API_KEY', '67923eabc51ef1632e02ab9b5d6c710e'),
  bearerToken: getEnvVar('VITE_TMDB_BEARER_TOKEN', 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NzkyM2VhYmM1MWVmMTYzMmUwMmFiOWI1ZDZjNzEwZSIsInN1YiI6IjVmNWQ0ZjdjNGNhNjc2MDAzNWY3MzZmOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.n7KxFQ0WXVm4Fqr4jE7VYqJH4qN8X0uOuYKOy8P8dGo'),
  baseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p',
};

// Backend API Configuration
export const BACKEND_CONFIG = {
  // Use /api proxy for development, and VITE_BACKEND_URL for production
  baseUrl: getEnvVar('VITE_BACKEND_URL', '/api'),
};

// Gemini AI Configuration
export const GEMINI_CONFIG = {
  apiKey: getEnvVar('VITE_GEMINI_API_KEY', 'AIzaSyBMxvDxm-zjg4MPNowaKNTpbpPQWKmN1HU'),
  model: 'gemini-1.5-flash-latest',
};

// App Configuration
export const APP_CONFIG = {
  name: 'CineVerse',
  version: '2.0.0',
  environment: getEnvVar('VITE_APP_ENV', 'production'),
  // Use environment variable to determine if we're in production
  isProduction: getEnvVar('VITE_APP_ENV', 'production') === 'production',
};

// Image Fallback Configuration
export const IMAGE_CONFIG = {
  placeholderService: 'https://placehold.co',
  fallbackColor: '181818',
  fallbackTextColor: '666666',
};

// Development mode detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Log configuration on initialization (only in development)
if (isDevelopment) {
  console.log('%c🔧 CineVerse Configuration', 'background: #E50914; color: white; padding: 8px; font-weight: bold;');
  console.log('Environment:', APP_CONFIG.environment);
  console.log('TMDB API Key:', TMDB_CONFIG.apiKey ? '✅ Configured' : '❌ Missing');
  console.log('Gemini API Key:', GEMINI_CONFIG.apiKey ? '✅ Configured' : '❌ Missing');
  console.log('Backend URL:', BACKEND_CONFIG.baseUrl);
  
  // Test TMDB API connectivity with a simple ping
  console.log('🔬 Testing TMDB API connectivity...');
  fetch(`${TMDB_CONFIG.baseUrl}/configuration?api_key=${TMDB_CONFIG.apiKey}`)
    .then(response => {
      if (response.ok) {
        console.log('%c✅ TMDB API: Connected successfully!', 'color: #4CAF50; font-weight: bold;');
      } else {
        console.warn(`%c⚠️ TMDB API: Status ${response.status}`, 'color: #FF9800; font-weight: bold;');
      }
    })
    .catch(() => {
      console.log('%cℹ️ TMDB API: Connectivity test skipped (offline or blocked)', 'color: #888;');
    });
}

export default {
  TMDB_CONFIG,
  BACKEND_CONFIG,
  GEMINI_CONFIG,
  APP_CONFIG,
  IMAGE_CONFIG,
};