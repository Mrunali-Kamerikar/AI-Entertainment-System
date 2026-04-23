/**
 * CineVerse — AI-Powered Entertainment Recommendation System
 *
 * Tech Stack: React + TypeScript + Tailwind CSS + Motion
 * APIs: TMDB API (movie data), Backend REST API (/login, /recommend, /summary, /review, /rate)
 *
 * Setup:
 *   1. Get a TMDB API key at https://www.themoviedb.org/settings/api
 *   2. Set it in /src/app/services/tmdb.ts (TMDB_API_KEY)
 *   3. Set your backend URL in /src/app/services/backend.ts (BACKEND_URL)
 *   4. The app works with full mock data without any API keys
 */
import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { APP_CONFIG, TMDB_CONFIG, GEMINI_CONFIG, isDevelopment } from './config/env';
import '../styles/fonts.css';

// Global dark theme styles
const globalStyle = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #141414;
    color: #ffffff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #E50914; }
  input::placeholder { color: #555; }
  button { font-family: inherit; }
  a { color: inherit; text-decoration: none; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .animate-spin { animation: spin 0.8s linear infinite; }
`;

export default function App() {
  useEffect(() => {
    // Display initialization message (only in development)
    if (isDevelopment) {
      console.log(
        '%c🎬 CineVerse %cv' + APP_CONFIG.version + ' %c🌐 PRODUCTION READY',
        'background: #E50914; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold; font-size: 14px;',
        'background: #333; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px; margin-left: 4px;',
        'background: #4CAF50; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold; font-size: 14px; margin-left: 4px;'
      );

      console.log(
        '%c✅ Environment: ' + APP_CONFIG.environment,
        'color: #4CAF50; font-size: 12px; font-weight: bold;'
      );

      console.log(
        '%c📡 API Status:',
        'color: #03A9F4; font-size: 12px; font-weight: bold;'
      );
      console.log('  TMDB:', TMDB_CONFIG.apiKey ? '✅ Configured' : '⚠️ Missing');
      console.log('  Gemini:', GEMINI_CONFIG.apiKey ? '✅ Configured' : '⚠️ Missing');

      console.log(
        '%c🌍 This app is globally accessible - works on any domain, IP, or URL!',
        'color: #03A9F4; font-size: 11px; font-weight: bold;'
      );
      
      console.log(
        '%c💡 Troubleshooting Help:',
        'color: #FF9800; font-size: 11px; font-weight: bold;'
      );
      console.log('  • Check top-right indicator for connection status');
      console.log('  • Green = Live TMDB data | Orange = Sample data');
      console.log('  • See /TMDB_TROUBLESHOOTING.md for detailed help');
      console.log('  • Quick test: Run this command in console:');
      console.log('    fetch("https://api.themoviedb.org/3/configuration?api_key=' + TMDB_CONFIG.apiKey + '").then(r => r.ok ? console.log("✅ TMDB OK") : console.error("❌ TMDB Error"))');
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyle }} />
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </>
  );
}