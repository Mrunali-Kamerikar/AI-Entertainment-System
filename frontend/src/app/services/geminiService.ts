import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchMovies, fetchMovieDetail } from './tmdb';
import { GEMINI_CONFIG } from '../config/env';

// ============================================
// Gemini AI Configuration
// ============================================
// All configuration is centralized in /src/app/config/env.ts
// Set VITE_GEMINI_API_KEY environment variable for your API key
//
// Get a FREE API key from: https://aistudio.google.com/app/apikey
// Just sign in with Google, click "Create API Key"
//
// For production: Set VITE_GEMINI_API_KEY in your environment
// ============================================

const API_KEY = GEMINI_CONFIG.apiKey;

const genAI = new GoogleGenerativeAI(API_KEY);

// Configure the model with movie-focused system instructions
const model = genAI.getGenerativeModel({
  model: GEMINI_CONFIG.model,
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 500,
  },
});

// System prompt to guide Gemini's responses
const SYSTEM_CONTEXT = `You are CineVerse Assistant, an expert AI movie recommendation assistant. You must provide accurate, concise, and helpful movie recommendations.

STRICT RULES:
- ONLY recommend REAL movies that actually exist
- Keep responses under 100 words
- Be conversational and helpful, not robotic
- Provide 5-7 movie suggestions when asked about genres/actors
- Include release years when mentioning movies
- Never hallucinate fake movie titles
- If unsure, say "I'm not fully sure, but here are some related suggestions..."

RESPONSE STYLE:
- Natural and friendly (like ChatGPT)
- Use emojis sparingly (1-2 max)
- Short sentences
- Direct answers, no filler

KNOWLEDGE AREAS:
- Bollywood, Hollywood, Tollywood, K-Drama, Anime
- Actors, directors, genres
- Movie ratings, plots, and recommendations
- Trending and classic films

When users ask about actors, provide their actual popular movies with years. When asked about genres, mix recent and classic films. Always be accurate.`;

// Chat history to maintain context
let chatHistory: { role: string; parts: string }[] = [];

// ============================================
// COMPREHENSIVE ACTOR DATABASE
// ============================================

interface ActorFilmography {
  [key: string]: {
    variations: string[];
    movies: string[];
  };
}

const BOLLYWOOD_ACTORS: ActorFilmography = {
  'alia bhatt': {
    variations: ['alia', 'alia bhat', 'aliya bhatt', 'alia bhut'],
    movies: [
      'Raazi (2018)',
      'Gangubai Kathiawadi (2022)',
      'Gully Boy (2019)',
      'Dear Zindagi (2016)',
      'Highway (2014)',
      '2 States (2014)',
      'Brahmastra (2022)',
      'Rocky Aur Rani Kii Prem Kahaani (2023)',
      'Udta Punjab (2016)',
    ],
  },
  'ranbir kapoor': {
    variations: ['ranbir', 'ranbeer kapoor', 'ranbir kapor'],
    movies: [
      'Brahmastra (2022)',
      'Sanju (2018)',
      'Rockstar (2011)',
      'Barfi! (2012)',
      'Yeh Jawaani Hai Deewani (2013)',
      'Tamasha (2015)',
      'Animal (2023)',
      'Ae Dil Hai Mushkil (2016)',
      'Wake Up Sid (2009)',
    ],
  },
  'shah rukh khan': {
    variations: ['srk', 'shahrukh khan', 'shah rukh', 'shahrukh', 'sharukh khan'],
    movies: [
      'Pathaan (2023)',
      'Jawan (2023)',
      'Dunki (2023)',
      'Dilwale Dulhania Le Jayenge (1995)',
      'Chennai Express (2013)',
      'My Name Is Khan (2010)',
      'Raees (2017)',
      'Fan (2016)',
      'Chak De! India (2007)',
    ],
  },
  'salman khan': {
    variations: ['salman', 'salman kahn'],
    movies: [
      'Tiger 3 (2023)',
      'Bajrangi Bhaijaan (2015)',
      'Sultan (2016)',
      'Ek Tha Tiger (2012)',
      'Dabangg (2010)',
      'Kick (2014)',
      'Tiger Zinda Hai (2017)',
      'Bharat (2019)',
    ],
  },
  'deepika padukone': {
    variations: ['deepika', 'dipika padukone', 'deepika padukon'],
    movies: [
      'Pathaan (2023)',
      'Padmaavat (2018)',
      'Chennai Express (2013)',
      'Piku (2015)',
      'Bajirao Mastani (2015)',
      'Yeh Jawaani Hai Deewani (2013)',
      'Om Shanti Om (2007)',
      'Jawan (2023)',
      'Fighter (2024)',
    ],
  },
  'ranveer singh': {
    variations: ['ranveer', 'ranvir singh'],
    movies: [
      'Padmaavat (2018)',
      'Gully Boy (2019)',
      'Bajirao Mastani (2015)',
      'Simmba (2018)',
      'Rocky Aur Rani Kii Prem Kahaani (2023)',
      '83 (2021)',
      'Ram-Leela (2013)',
      'Dil Dhadakne Do (2015)',
    ],
  },
  'katrina kaif': {
    variations: ['katrina', 'ketrina kaif'],
    movies: [
      'Tiger 3 (2023)',
      'Sooryavanshi (2021)',
      'Zindagi Na Milegi Dobara (2011)',
      'Ek Tha Tiger (2012)',
      'Tiger Zinda Hai (2017)',
      'Jab Tak Hai Jaan (2012)',
      'Bharat (2019)',
    ],
  },
  'hrithik roshan': {
    variations: ['hrithik', 'ritik roshan', 'hrithik roshan'],
    movies: [
      'War (2019)',
      'Super 30 (2019)',
      'Zindagi Na Milegi Dobara (2011)',
      'Koi... Mil Gaya (2003)',
      'Krrish series (2006-2013)',
      'Jodhaa Akbar (2008)',
      'Vikram Vedha (2022)',
      'Fighter (2024)',
    ],
  },
  'aamir khan': {
    variations: ['aamir', 'amir khan'],
    movies: [
      '3 Idiots (2009)',
      'Dangal (2016)',
      'PK (2014)',
      'Taare Zameen Par (2007)',
      'Lagaan (2001)',
      'Rang De Basanti (2006)',
      'Laal Singh Chaddha (2022)',
    ],
  },
  'akshay kumar': {
    variations: ['akshay', 'akshy kumar'],
    movies: [
      'Sooryavanshi (2021)',
      'Pad Man (2018)',
      'Toilet: Ek Prem Katha (2017)',
      'Airlift (2016)',
      'Special 26 (2013)',
      'Kesari (2019)',
      'Mission Mangal (2019)',
      'Baby (2015)',
    ],
  },
  'priyanka chopra': {
    variations: ['priyanka', 'prianka chopra'],
    movies: [
      'Barfi! (2012)',
      'Mary Kom (2014)',
      'Fashion (2008)',
      'Don series (2006-2011)',
      'Bajirao Mastani (2015)',
      'The Sky Is Pink (2019)',
      'Dil Dhadakne Do (2015)',
    ],
  },
  'kareena kapoor': {
    variations: ['kareena', 'karina kapoor', 'kareena khan'],
    movies: [
      'Jab We Met (2007)',
      '3 Idiots (2009)',
      'Bajrangi Bhaijaan (2015)',
      'Udta Punjab (2016)',
      'Good Newwz (2019)',
      'Kabhi Khushi Kabhie Gham (2001)',
      'Talaash (2012)',
    ],
  },
  'anushka sharma': {
    variations: ['anushka', 'anushka sharme'],
    movies: [
      'PK (2014)',
      'Sultan (2016)',
      'Ae Dil Hai Mushkil (2016)',
      'Jab Tak Hai Jaan (2012)',
      'NH10 (2015)',
      'Pari (2018)',
      'Zero (2018)',
    ],
  },
  'kangana ranaut': {
    variations: ['kangana', 'kangna ranaut'],
    movies: [
      'Queen (2014)',
      'Tanu Weds Manu series (2011-2015)',
      'Manikarnika (2019)',
      'Thalaivii (2021)',
      'Fashion (2008)',
      'Gangster (2006)',
    ],
  },
  'varun dhawan': {
    variations: ['varun', 'varun dawan'],
    movies: [
      'October (2018)',
      'Badlapur (2015)',
      'Badrinath Ki Dulhania (2017)',
      'ABCD 2 (2015)',
      'Sui Dhaaga (2018)',
      'Humpty Sharma Ki Dulhania (2014)',
      'Bhediya (2022)',
    ],
  },
  'vicky kaushal': {
    variations: ['vicky', 'viky kaushal'],
    movies: [
      'Uri: The Surgical Strike (2019)',
      'Masaan (2015)',
      'Raazi (2018)',
      'Sanju (2018)',
      'Sardar Udham (2021)',
      'The Great Indian Family (2023)',
      'Sam Bahadur (2023)',
    ],
  },
  'rajkummar rao': {
    variations: ['rajkumar rao', 'rajkumar', 'rajkummar'],
    movies: [
      'Stree (2018)',
      'Bareilly Ki Barfi (2017)',
      'Newton (2017)',
      'Kai Po Che! (2013)',
      'The White Tiger (2021)',
      'Bhediya (2022)',
      'Srikanth (2024)',
    ],
  },
  'ayushmann khurrana': {
    variations: ['ayushmann', 'ayushman khurrana', 'ayushmaan'],
    movies: [
      'Andhadhun (2018)',
      'Article 15 (2019)',
      'Badhaai Ho (2018)',
      'Vicky Donor (2012)',
      'Dream Girl (2019)',
      'Bala (2019)',
      'Dum Laga Ke Haisha (2015)',
    ],
  },
  'shraddha kapoor': {
    variations: ['shraddha', 'shradha kapoor'],
    movies: [
      'Stree (2018)',
      'Aashiqui 2 (2013)',
      'Saaho (2019)',
      'Chhichhore (2019)',
      'Ek Villain (2014)',
      'Half Girlfriend (2017)',
      'Tu Jhoothi Main Makkaar (2023)',
    ],
  },
  'kriti sanon': {
    variations: ['kriti', 'krti sanon'],
    movies: [
      'Mimi (2021)',
      'Bareilly Ki Barfi (2017)',
      'Luka Chuppi (2019)',
      'Dilwale (2015)',
      'Heropanti (2014)',
      'Bhediya (2022)',
      'Crew (2024)',
    ],
  },
};

const HOLLYWOOD_ACTORS: ActorFilmography = {
  'leonardo dicaprio': {
    variations: ['dicaprio', 'leo dicaprio', 'leonardo'],
    movies: [
      'Inception (2010)',
      'The Wolf of Wall Street (2013)',
      'Titanic (1997)',
      'The Revenant (2015)',
      'Shutter Island (2010)',
      'Django Unchained (2012)',
      'Catch Me If You Can (2002)',
      'The Departed (2006)',
    ],
  },
  'tom cruise': {
    variations: ['tom', 'cruise'],
    movies: [
      'Top Gun: Maverick (2022)',
      'Mission: Impossible series',
      'Edge of Tomorrow (2014)',
      'Jerry Maguire (1996)',
      'A Few Good Men (1992)',
      'Rain Man (1988)',
      'The Last Samurai (2003)',
    ],
  },
  'brad pitt': {
    variations: ['brad', 'pitt'],
    movies: [
      'Fight Club (1999)',
      'Once Upon a Time in Hollywood (2019)',
      'Inglourious Basterds (2009)',
      'Se7en (1995)',
      '12 Monkeys (1995)',
      'Ocean\'s Eleven (2001)',
      'Bullet Train (2022)',
    ],
  },
  'robert downey jr': {
    variations: ['rdj', 'robert downey', 'downey'],
    movies: [
      'Iron Man series (2008-2013)',
      'Avengers series',
      'Sherlock Holmes (2009)',
      'Oppenheimer (2023)',
      'Tropic Thunder (2008)',
      'The Judge (2014)',
    ],
  },
  'scarlett johansson': {
    variations: ['scarlett', 'johansson'],
    movies: [
      'Black Widow (2021)',
      'Avengers series',
      'Marriage Story (2019)',
      'Lucy (2014)',
      'Jojo Rabbit (2019)',
      'Lost in Translation (2003)',
      'Her (2013)',
    ],
  },
  'chris hemsworth': {
    variations: ['chris', 'hemsworth'],
    movies: [
      'Thor series (2011-2022)',
      'Avengers series',
      'Extraction (2020)',
      'Rush (2013)',
      'In the Heart of the Sea (2015)',
    ],
  },
  'dwayne johnson': {
    variations: ['dwayne', 'the rock', 'rock'],
    movies: [
      'Black Adam (2022)',
      'Jumanji series (2017-2019)',
      'Fast & Furious series',
      'Moana (2016)',
      'Red Notice (2021)',
      'San Andreas (2015)',
      'Rampage (2018)',
    ],
  },
  'margot robbie': {
    variations: ['margot', 'robbie'],
    movies: [
      'Barbie (2023)',
      'Once Upon a Time in Hollywood (2019)',
      'I, Tonya (2017)',
      'Suicide Squad (2016)',
      'The Wolf of Wall Street (2013)',
      'Birds of Prey (2020)',
    ],
  },
};

// ============================================
// SMART QUERY MATCHING
// ============================================

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

function findActorMatch(query: string): { actor: string; movies: string[] } | null {
  const normalizedQuery = normalizeText(query);
  
  // Check Bollywood actors
  for (const [actor, data] of Object.entries(BOLLYWOOD_ACTORS)) {
    if (normalizedQuery.includes(normalizeText(actor))) {
      return { actor, movies: data.movies };
    }
    for (const variation of data.variations) {
      if (normalizedQuery.includes(normalizeText(variation))) {
        return { actor, movies: data.movies };
      }
    }
  }
  
  // Check Hollywood actors
  for (const [actor, data] of Object.entries(HOLLYWOOD_ACTORS)) {
    if (normalizedQuery.includes(normalizeText(actor))) {
      return { actor, movies: data.movies };
    }
    for (const variation of data.variations) {
      if (normalizedQuery.includes(normalizeText(variation))) {
        return { actor, movies: data.movies };
      }
    }
  }
  
  return null;
}

// ============================================
// MOVIE SUMMARY DETECTION
// ============================================

function detectMovieSummaryQuery(query: string): string | null {
  const lowerQ = query.toLowerCase().trim();
  
  // Common patterns for asking about movie summaries
  const summaryPatterns = [
    /(?:what|tell me|give me|whats|what's)\s+(?:is|the)?\s*(?:summary|plot|story|storyline|overview|about)\s+(?:of|for)?\s*(.+)/i,
    /(?:summary|plot|story|storyline|overview)\s+(?:of|for)\s+(.+)/i,
    /(.+)\s+(?:summary|plot|story|storyline|overview)/i,
    /(?:explain|describe)\s+(.+?)(?:\s+movie)?$/i,
  ];
  
  for (const pattern of summaryPatterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      // Extract movie name
      let movieName = match[1].trim();
      // Clean up common words
      movieName = movieName.replace(/\s+(movie|film|the movie|the film)$/i, '').trim();
      return movieName;
    }
  }
  
  return null;
}

async function fetchMovieSummary(movieName: string): Promise<string | null> {
  try {
    console.log('🔍 Searching TMDB for movie:', movieName);
    
    // Search for the movie
    const searchResults = await searchMovies(movieName);
    
    if (!searchResults || searchResults.length === 0) {
      return null;
    }
    
    // Get the first (most relevant) result
    const movie = searchResults[0];
    console.log('✅ Found movie:', movie.title);
    
    // Fetch detailed information
    const details = await fetchMovieDetail(movie.id);
    
    if (!details || !details.overview) {
      // Return basic overview from search if details fail
      return movie.overview || null;
    }
    
    // Format the response
    const year = details.release_date ? new Date(details.release_date).getFullYear() : '';
    const genres = details.genres?.map(g => g.name).join(', ') || '';
    const rating = details.vote_average ? details.vote_average.toFixed(1) : '';
    const runtime = details.runtime ? `${details.runtime} min` : '';
    
    let response = `**${details.title}** ${year ? `(${year})` : ''}\n\n`;
    
    if (genres) response += `**Genres:** ${genres}\n`;
    if (rating) response += `**Rating:** ⭐ ${rating}/10\n`;
    if (runtime) response += `**Duration:** ${runtime}\n`;
    if (details.tagline) response += `**Tagline:** "${details.tagline}"\n`;
    
    response += `\n**Summary:**\n${details.overview}`;
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching movie summary:', error);
    return null;
  }
}

export const askGemini = async (question: string): Promise<string> => {
  try {
    // Check if user is asking for a movie summary
    const movieName = detectMovieSummaryQuery(question);
    if (movieName) {
      console.log('🎬 Detected movie summary request for:', movieName);
      const summary = await fetchMovieSummary(movieName);
      if (summary) {
        return summary;
      }
      // If not found, continue to Gemini/fallback
    }

    // Check for quick suggestions first
    const quickResponse = getQuickSuggestion(question);
    if (quickResponse) {
      return quickResponse;
    }

    console.log('🤖 Sending to Gemini:', question);

    // Create chat session with history
    const chat = model.startChat({
      history: chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
    });

    // Send message with system context prepended for first message
    const prompt = chatHistory.length === 0 
      ? `${SYSTEM_CONTEXT}\n\nUser: ${question}`
      : question;

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    console.log('✅ Gemini response:', text);

    // Update chat history
    chatHistory.push(
      { role: 'user', parts: question },
      { role: 'model', parts: text }
    );

    // Keep history limited to last 10 exchanges (20 messages)
    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20);
    }

    return text;
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    // Use smart fallback instead of error messages
    console.log('💡 Using smart fallback for:', question);
    return getSmartFallback(question);
  }
};

// Reset chat history (useful for new conversations)
export const resetChatHistory = () => {
  chatHistory = [];
};

// ============================================
// MOVIE-SPECIFIC AI SUMMARY GENERATOR
// ============================================

interface MovieSummaryResult {
  summary: string;
  themes: string[];
  aiInsight: string;
}

// Cache to avoid repeated Gemini calls for the same movie
const summaryCache = new Map<number, MovieSummaryResult>();

export const generateMovieSummaryWithGemini = async (
  movieId: number,
  movieInfo: {
    title: string;
    year: number;
    genres: string[];
    overview: string;
    tagline?: string;
    vote_average: number;
    runtime: number;
    industry?: string;
    cast?: string[];
  }
): Promise<MovieSummaryResult | null> => {
  // Return cached result if available
  if (summaryCache.has(movieId)) {
    return summaryCache.get(movieId)!;
  }

  const { title, year, genres, overview, tagline, vote_average, runtime, industry, cast } = movieInfo;

  // Build a rich, movie-specific prompt
  const castInfo = cast && cast.length > 0 ? `Cast: ${cast.join(', ')}` : '';
  const prompt = `You are a world-class film critic. Write a unique, insightful AI analysis specifically for the movie "${title}" (${year}).

Movie Details:
- Genres: ${genres.join(', ')}
- Rating: ${vote_average}/10
- Runtime: ${runtime} minutes
- Industry: ${industry || 'Cinema'}
${tagline ? `- Tagline: "${tagline}"` : ''}
${castInfo}
- Overview: ${overview}

Respond with ONLY a valid JSON object (no markdown, no code blocks) with exactly these fields:
{
  "summary": "A unique 90-100 word film analysis specific to THIS movie, highlighting what makes it distinctive — its themes, style, cultural impact, and why audiences love it",
  "themes": ["theme1", "theme2", "theme3", "theme4"],
  "aiInsight": "A 70-80 word paragraph about this film's cultural significance, critical reception, and what type of viewer would most appreciate it"
}`;

  try {
    console.log(`🤖 Generating AI summary for: ${title}`);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const summaryResult: MovieSummaryResult = {
        summary: parsed.summary || `${title} is a compelling ${genres[0]?.toLowerCase() || 'cinema'} experience.`,
        themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 4) : [genres[0] || 'Drama', 'Story', 'Character', 'Journey'],
        aiInsight: parsed.aiInsight || `${title} (${year}) is a noteworthy ${genres.join(', ')} film rated ${vote_average}/10 by audiences worldwide.`,
      };
      summaryCache.set(movieId, summaryResult);
      console.log(`✅ AI summary generated for: ${title}`);
      return summaryResult;
    }
  } catch (error) {
    console.warn(`⚠️ Gemini summary failed for "${title}":`, (error as Error).message);
  }

  return null;
};

// Get quick movie suggestions (preset responses for common queries)
export const getQuickSuggestion = (query: string): string | null => {
  const lowerQ = query.toLowerCase().trim();
  
  // Greetings - varied and natural
  if (lowerQ === 'hello' || lowerQ === 'hi' || lowerQ === 'hey' || lowerQ === 'hii' || lowerQ === 'hiii') {
    const greetings = [
      "Hey! 👋 What kind of movies are you looking for today?",
      "Hi there! Ready to find your next favorite film?",
      "Hello! Looking for movie recommendations? I'm here to help!",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Thank you responses
  if (lowerQ.includes('thank') || lowerQ.includes('thanks')) {
    const thanks = [
      "You're welcome! Happy watching! 🍿",
      "Anytime! Enjoy! 🎬",
      "My pleasure! ✨",
    ];
    return thanks[Math.floor(Math.random() * thanks.length)];
  }
  
  return null; // Return null to use Gemini API or smart fallback
};

// Enhanced fallback response system
export const getSmartFallback = (query: string): string => {
  const lowerQ = query.toLowerCase();
  
  // ============================================
  // ACTOR-BASED QUERIES (PRIORITY)
  // ============================================
  const actorMatch = findActorMatch(query);
  if (actorMatch) {
    const actorName = actorMatch.actor
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const movieList = actorMatch.movies.slice(0, 7).map(movie => `• ${movie}`).join('\n');
    return `Here are popular movies of ${actorName}:\n\n${movieList}`;
  }
  
  // ============================================
  // GENRE-BASED QUERIES
  // ============================================
  
  // Action movies
  if (lowerQ.includes('action')) {
    if (lowerQ.includes('bollywood') || lowerQ.includes('hindi')) {
      return `Top Bollywood Action Movies:\n\n• Pathaan (2023)\n• War (2019)\n• Tiger 3 (2023)\n• Jawan (2023)\n• Sooryavanshi (2021)\n• Tiger Zinda Hai (2017)\n• Extraction (2020)`;
    }
    return `Top Action Movies:\n\n• Mad Max: Fury Road (2015)\n• John Wick series (2014-2023)\n• Mission: Impossible - Fallout (2018)\n• The Dark Knight (2008)\n• Extraction (2020)\n• Top Gun: Maverick (2022)`;
  }
  
  // Thriller
  if (lowerQ.includes('thriller') || lowerQ.includes('suspense')) {
    return `Must-Watch Thrillers:\n\n• Gone Girl (2014)\n• Shutter Island (2010)\n• Parasite (2019)\n• Prisoners (2013)\n• The Girl with the Dragon Tattoo (2011)\n• Se7en (1995)`;
  }
  
  // Comedy
  if (lowerQ.includes('comedy') || lowerQ.includes('funny')) {
    if (lowerQ.includes('bollywood') || lowerQ.includes('hindi')) {
      return `Bollywood Comedy Films:\n\n• 3 Idiots (2009)\n• Hera Pheri (2000)\n• Andaz Apna Apna (1994)\n• Munna Bhai M.B.B.S. (2003)\n• Golmaal series\n• Dream Girl (2019)`;
    }
    return `Comedy Hits:\n\n• The Hangover (2009)\n• Superbad (2007)\n• 21 Jump Street (2012)\n• Bridesmaids (2011)\n• Barbie (2023)\n• Everything Everywhere All at Once (2022)`;
  }
  
  // Romance
  if (lowerQ.includes('romance') || lowerQ.includes('romantic') || lowerQ.includes('love')) {
    if (lowerQ.includes('bollywood') || lowerQ.includes('hindi')) {
      return `Bollywood Romantic Movies:\n\n• Dilwale Dulhania Le Jayenge (1995)\n• Jab We Met (2007)\n• Yeh Jawaani Hai Deewani (2013)\n• Dil To Pagal Hai (1997)\n• Veer-Zaara (2004)\n• Kabhi Khushi Kabhie Gham (2001)`;
    }
    return `Romantic Films:\n\n• La La Land (2016)\n• The Notebook (2004)\n• Pride and Prejudice (2005)\n• Crazy, Stupid, Love (2011)\n• About Time (2013)\n• Past Lives (2023)`;
  }
  
  // Horror
  if (lowerQ.includes('horror') || lowerQ.includes('scary')) {
    return `Horror Recommendations:\n\n• The Conjuring series\n• Hereditary (2018)\n• A Quiet Place (2018)\n• Get Out (2017)\n• The Shining (1980)\n• It (2017)\n• Midsommar (2019)`;
  }
  
  // Sci-Fi
  if (lowerQ.includes('sci-fi') || lowerQ.includes('science fiction')) {
    return `Sci-Fi Masterpieces:\n\n• Interstellar (2014)\n• Inception (2010)\n• Blade Runner 2049 (2017)\n• The Matrix (1999)\n• Arrival (2016)\n• Dune (2021)\n• Ex Machina (2014)`;
  }
  
  // ============================================
  // DIRECTOR-BASED QUERIES
  // ============================================
  
  if (lowerQ.includes('nolan') || lowerQ.includes('christopher nolan')) {
    return `Christopher Nolan Films:\n\n• Oppenheimer (2023)\n• Interstellar (2014)\n• Inception (2010)\n• The Dark Knight Trilogy (2005-2012)\n• Dunkirk (2017)\n• Tenet (2020)\n• The Prestige (2006)`;
  }
  
  if (lowerQ.includes('spielberg')) {
    return `Steven Spielberg Classics:\n\n• Schindler's List (1993)\n• Saving Private Ryan (1998)\n• Jurassic Park (1993)\n• E.T. (1982)\n• Jaws (1975)\n• The Fabelmans (2022)\n• Ready Player One (2018)`;
  }
  
  if (lowerQ.includes('tarantino')) {
    return `Quentin Tarantino Films:\n\n• Pulp Fiction (1994)\n• Django Unchained (2012)\n• Inglourious Basterds (2009)\n• Kill Bill Vol. 1 & 2 (2003-2004)\n• Once Upon a Time in Hollywood (2019)\n• Reservoir Dogs (1992)`;
  }
  
  // ============================================
  // REGIONAL CINEMA
  // ============================================
  
  if (lowerQ.includes('bollywood') && !lowerQ.includes('action') && !lowerQ.includes('romance')) {
    return `Trending Bollywood:\n\n• Pathaan (2023)\n• Jawan (2023)\n• Animal (2023)\n• Dunki (2023)\n• Gadar 2 (2023)\n• 12th Fail (2023)\n\nClassics: 3 Idiots, DDLJ, Lagaan`;
  }
  
  if (lowerQ.includes('anime')) {
    return `Top Anime Films:\n\n• Your Name (2016)\n• Spirited Away (2001)\n• A Silent Voice (2016)\n• Weathering with You (2019)\n• Demon Slayer: Mugen Train (2020)\n• Howl's Moving Castle (2004)\n• Princess Mononoke (1997)`;
  }
  
  if (lowerQ.includes('k-drama') || lowerQ.includes('kdrama') || lowerQ.includes('korean')) {
    return `Must-Watch Korean:\n\n• Parasite (2019)\n• Train to Busan (2016)\n• Oldboy (2003)\n• The Handmaiden (2016)\n• Squid Game (Netflix)\n• Crash Landing on You (Netflix)\n• Extraordinary Attorney Woo (Netflix)`;
  }
  
  // ============================================
  // TRENDING & POPULAR
  // ============================================
  
  if (lowerQ.includes('trending') || lowerQ.includes('popular') || lowerQ.includes('latest')) {
    return `Trending Now:\n\n• Oppenheimer (2023)\n• Barbie (2023)\n• Dune: Part Two (2024)\n• Poor Things (2023)\n• The Holdovers (2023)\n• Past Lives (2023)\n• Killers of the Flower Moon (2023)`;
  }
  
  // ============================================
  // AWARDS & CLASSICS
  // ============================================
  
  if (lowerQ.includes('oscar') || lowerQ.includes('academy award')) {
    return `Recent Oscar Winners:\n\n• Oppenheimer (2024 - Best Picture)\n• Everything Everywhere All at Once (2023)\n• CODA (2022)\n• Parasite (2020)\n• Green Book (2019)\n• The Shape of Water (2018)`;
  }
  
  if (lowerQ.includes('classic')) {
    return `Timeless Classics:\n\n• The Godfather (1972)\n• Shawshank Redemption (1994)\n• 12 Angry Men (1957)\n• Schindler's List (1993)\n• Casablanca (1942)\n• Citizen Kane (1941)`;
  }
  
  // ============================================
  // SUPERHERO & FRANCHISES
  // ============================================
  
  if (lowerQ.includes('marvel') || lowerQ.includes('mcu')) {
    return `Marvel Must-Watch:\n\n• Avengers: Endgame (2019)\n• Spider-Man: No Way Home (2021)\n• Black Panther (2018)\n• Guardians of the Galaxy (2014)\n• Thor: Ragnarok (2017)\n• Iron Man (2008)`;
  }
  
  // ============================================
  // DEFAULT RESPONSE
  // ============================================
  
  return "Sorry, I didn't understand that. Can you rephrase your question?\n\nTry asking about:\n• Specific actors (e.g., 'Alia Bhatt movies')\n• Genres (e.g., 'best action movies')\n• Regions (e.g., 'Bollywood romantic movies')\n• Directors (e.g., 'Nolan films')";
};