/**
 * AI Summary Generator Service
 * 
 * Generates intelligent movie analysis based on TMDB data
 * without requiring external AI API calls
 */

import { TMDBMovieDetail } from './tmdb';

interface AISummary {
  summary: string;
  themes: string[];
  aiInsight: string;
}

/**
 * Generate an AI-style summary based on movie metadata
 */
export const generateAISummary = (movie: TMDBMovieDetail): AISummary => {
  const genres = movie.genres.map(g => g.name);
  const primaryGenre = genres[0] || 'Drama';
  const secondaryGenre = genres[1] || '';
  const runtime = movie.runtime || 120;
  const rating = movie.vote_average || 7.0;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 2020;
  const overview = movie.overview || '';
  const tagline = movie.tagline || '';

  // Generate summary based on genre and plot
  let summary = '';
  let themes: string[] = [];
  let aiInsight = '';

  // Use overview keywords for more specific summaries
  const hasFamily = overview.toLowerCase().includes('family') || overview.toLowerCase().includes('father') || overview.toLowerCase().includes('mother');
  const hasLove = overview.toLowerCase().includes('love') || overview.toLowerCase().includes('romance');
  const hasCrime = overview.toLowerCase().includes('crime') || overview.toLowerCase().includes('murder') || overview.toLowerCase().includes('detective');
  const hasSpace = overview.toLowerCase().includes('space') || overview.toLowerCase().includes('alien') || overview.toLowerCase().includes('planet');
  const hasWar = overview.toLowerCase().includes('war') || overview.toLowerCase().includes('battle') || overview.toLowerCase().includes('soldier');
  const hasHero = overview.toLowerCase().includes('hero') || overview.toLowerCase().includes('save') || overview.toLowerCase().includes('rescue');

  // Analyze based on genre combinations with more variety
  if (genres.includes('Sci-Fi') || genres.includes('Science Fiction')) {
    if (hasSpace) {
      summary = `This visionary ${primaryGenre.toLowerCase()} epic transports audiences to distant worlds and alien civilizations. ${tagline ? `"${tagline}" -` : ''} The film masterfully explores humanity's place in the cosmos through ${runtime > 150 ? 'an expansive, thought-provoking narrative' : 'a tightly crafted story'}. With stunning visuals and ${rating >= 7.5 ? 'critically acclaimed' : 'compelling'} performances, it challenges our understanding of existence itself.`;
      themes = ['Space Exploration', 'Alien Life', 'Cosmic Wonder', 'Human Destiny'];
    } else {
      summary = `This ${rating >= 8 ? 'groundbreaking' : 'innovative'} ${primaryGenre.toLowerCase()} film delves into the implications of ${overview.includes('time') ? 'temporal manipulation' : 'technological advancement'} on human society. ${secondaryGenre ? `Blending ${secondaryGenre.toLowerCase()} elements,` : ''} the narrative ${runtime > 150 ? 'extensively explores' : 'efficiently examines'} philosophical questions about ${overview.includes('artificial') || overview.includes('robot') ? 'artificial intelligence and consciousness' : 'progress and its consequences'}.`;
      themes = ['Technology', 'Future', 'Innovation', 'Ethics'];
    }
  } else if (genres.includes('Thriller') || genres.includes('Mystery')) {
    if (hasCrime) {
      summary = `This pulse-pounding ${primaryGenre.toLowerCase()} ${secondaryGenre ? `${secondaryGenre.toLowerCase()}` : 'thriller'} weaves an intricate web of deception and investigation. ${tagline ? `"${tagline}" -` : ''} Following ${overview.includes('detective') ? 'a determined detective' : 'complex characters'} through ${runtime > 140 ? 'a labyrinthine plot' : 'twisting turns'}, the film builds ${rating >= 7.5 ? 'masterful' : 'gripping'} tension as dark secrets emerge and nothing is as it seems.`;
      themes = ['Crime', 'Investigation', 'Deception', 'Justice'];
    } else {
      summary = `This ${rating >= 7.5 ? 'expertly crafted' : 'intensely engaging'} psychological ${primaryGenre.toLowerCase()} keeps viewers on edge through ${overview.includes('mind') ? 'mind-bending revelations' : 'escalating suspense'}. The ${runtime > 130 ? 'elaborate' : 'tight'} narrative explores ${hasCrime ? 'moral ambiguity' : 'psychological depths'} with ${rating >= 8 ? 'exceptional' : 'notable'} precision, delivering ${overview.includes('twist') ? 'shocking twists' : 'powerful revelations'}.`;
      themes = ['Suspense', 'Psychology', 'Truth', 'Mystery'];
    }
  } else if (genres.includes('Drama')) {
    if (hasFamily) {
      summary = `This ${rating >= 8 ? 'deeply moving' : 'emotionally powerful'} ${primaryGenre.toLowerCase()} explores the intricate bonds of family across ${runtime > 140 ? 'multiple generations and storylines' : 'intimate moments of connection and conflict'}. ${tagline ? `"${tagline}" -` : ''} Through ${rating >= 7.5 ? 'masterful' : 'authentic'} performances and ${secondaryGenre ? `${secondaryGenre.toLowerCase()} undertones` : 'nuanced storytelling'}, it reveals universal truths about love, sacrifice, and belonging.`;
      themes = ['Family', 'Heritage', 'Sacrifice', 'Love'];
    } else if (hasWar) {
      summary = `This ${rating >= 8 ? 'harrowing' : 'powerful'} wartime ${primaryGenre.toLowerCase()} examines ${runtime > 150 ? 'the full spectrum of human experience' : 'profound human struggles'} against the backdrop of conflict. The narrative ${secondaryGenre ? `combines ${secondaryGenre.toLowerCase()} elements with` : 'delivers'} ${rating >= 7.5 ? 'devastating emotional impact' : 'compelling character journeys'}, exploring themes of courage, loss, and survival.`;
      themes = ['War', 'Survival', 'Courage', 'Loss'];
    } else {
      summary = `This ${rating >= 7.5 ? 'profoundly affecting' : 'emotionally resonant'} ${primaryGenre.toLowerCase()} film delves into ${overview.includes('life') ? 'life-changing transformations' : 'complex human relationships'} with ${secondaryGenre ? `${secondaryGenre.toLowerCase()} sensibilities` : 'raw authenticity'}. Through ${runtime > 140 ? 'an expansive character study' : 'intimate storytelling'}, it offers ${rating >= 8 ? 'an unforgettable exploration' : 'a compelling examination'} of ${hasLove ? 'love and identity' : 'personal growth and redemption'}.`;
      themes = ['Emotion', 'Character', 'Transformation', 'Identity'];
    }
  } else if (genres.includes('Action') || genres.includes('Adventure')) {
    if (hasHero) {
      summary = `This ${rating >= 7.5 ? 'spectacular' : 'adrenaline-fueled'} ${primaryGenre.toLowerCase()} ${secondaryGenre ? `${secondaryGenre.toLowerCase()}` : 'adventure'} delivers ${rating >= 8 ? 'breathtaking' : 'explosive'} action sequences while maintaining compelling character development. ${tagline ? `"${tagline}" -` : ''} Following ${overview.includes('superhero') ? 'extraordinary heroes' : 'determined protagonists'} through ${runtime > 140 ? 'an epic journey' : 'intense challenges'}, the film balances spectacle with ${rating >= 7 ? 'emotional depth' : 'engaging storytelling'}.`;
      themes = ['Heroism', 'Adventure', 'Courage', 'Victory'];
    } else {
      summary = `This high-octane ${primaryGenre.toLowerCase()} ${secondaryGenre ? `with ${secondaryGenre.toLowerCase()} elements` : 'thrill ride'} pushes the boundaries of action cinema with ${rating >= 7.5 ? 'innovative' : 'intense'} set pieces. The ${runtime > 130 ? 'ambitious' : 'efficient'} narrative ${hasWar ? 'combines large-scale warfare' : 'delivers personal stakes'} alongside ${rating >= 7 ? 'widely praised' : 'entertaining'} character dynamics.`;
      themes = ['Action', 'Intensity', 'Challenge', 'Triumph'];
    }
  } else if (genres.includes('Horror')) {
    summary = `This ${rating >= 7.5 ? 'terrifying' : 'chilling'} ${primaryGenre.toLowerCase()} experience ${secondaryGenre ? `infused with ${secondaryGenre.toLowerCase()} elements` : ''} constructs ${rating >= 7 ? 'masterful atmosphere' : 'effective dread'} through ${overview.includes('supernatural') ? 'supernatural terror' : 'psychological horror'}. ${tagline ? `"${tagline}" -` : ''} The film ${runtime > 110 ? 'relentlessly builds tension' : 'delivers concentrated scares'} while exploring ${hasFamily ? 'familial nightmares' : 'primal fears'}, creating ${rating >= 7.5 ? 'an unforgettable nightmare' : 'genuine unease'}.`;
    themes = ['Fear', 'Terror', 'Survival', overview.includes('supernatural') ? 'Supernatural' : 'Psychology'];
  } else if (genres.includes('Comedy')) {
    summary = `This ${rating >= 7.5 ? 'hilarious' : 'entertaining'} ${primaryGenre.toLowerCase()} ${secondaryGenre ? `${secondaryGenre.toLowerCase()}` : 'romp'} delivers ${rating >= 8 ? 'razor-sharp wit' : 'consistent laughs'} while ${hasLove ? 'exploring romantic entanglements' : hasFamily ? 'examining family dynamics' : 'satirizing modern life'}. ${tagline ? `"${tagline}" -` : ''} The ${runtime > 110 ? 'generously paced' : 'briskly told'} narrative balances humor with ${rating >= 7.5 ? 'surprising emotional depth' : 'genuine heart'}.`;
    themes = ['Humor', hasLove ? 'Romance' : 'Joy', 'Wit', 'Entertainment'];
  } else if (genres.includes('Romance')) {
    summary = `This ${rating >= 8 ? 'swoonworthy' : 'touching'} ${primaryGenre.toLowerCase()} film ${secondaryGenre ? `with ${secondaryGenre.toLowerCase()} elements` : ''} explores ${overview.includes('tragic') || overview.includes('lost') ? 'the bittersweet nature of love' : 'the transformative power of connection'} through ${rating >= 7.5 ? 'exceptional' : 'heartfelt'} performances. ${tagline ? `"${tagline}" -` : ''} The ${runtime > 120 ? 'sweeping' : 'intimate'} narrative captures ${hasFamily ? 'love against familial expectations' : 'the complexities of the heart'} with ${rating >= 7 ? 'acclaimed authenticity' : 'genuine emotion'}.`;
    themes = ['Love', 'Connection', overview.includes('tragic') ? 'Sacrifice' : 'Passion', 'Emotion'];
  } else if (genres.includes('Fantasy')) {
    summary = `This ${rating >= 7.5 ? 'enchanting' : 'imaginative'} ${primaryGenre.toLowerCase()} ${secondaryGenre ? `${secondaryGenre.toLowerCase()}` : 'adventure'} transports audiences to ${overview.includes('world') ? 'richly detailed fantastical realms' : 'magical dimensions'}. ${tagline ? `"${tagline}" -` : ''} With ${rating >= 7.5 ? 'stunning visual artistry' : 'creative worldbuilding'}, the ${runtime > 150 ? 'epic tale' : 'focused story'} weaves ${overview.includes('quest') ? 'heroic quests' : 'magical wonder'} into ${rating >= 8 ? 'cinematic legend' : 'captivating entertainment'}.`;
    themes = ['Magic', 'Wonder', overview.includes('quest') ? 'Quest' : 'Mythology', 'Imagination'];
  } else if (genres.includes('Animation')) {
    summary = `This ${rating >= 8 ? 'visually stunning' : 'beautifully animated'} ${primaryGenre.toLowerCase()} film ${secondaryGenre ? `blends ${secondaryGenre.toLowerCase()} themes` : 'captivates all ages'} through ${rating >= 7.5 ? 'exceptional artistry' : 'creative animation'}. ${tagline ? `"${tagline}" -` : ''} The ${runtime > 100 ? 'richly developed' : 'precisely crafted'} story explores ${hasFamily ? 'family bonds' : 'universal themes'} with ${rating >= 7 ? 'acclaimed depth' : 'genuine heart'} and spectacular visuals.`;
    themes = ['Animation', hasFamily ? 'Family' : 'Adventure', 'Creativity', 'Wonder'];
  } else {
    summary = `This ${rating >= 7.5 ? 'critically acclaimed' : 'compelling'} ${primaryGenre.toLowerCase()} film ${secondaryGenre ? `blends ${secondaryGenre.toLowerCase()} elements` : 'presents a unique vision'} through ${runtime > 130 ? 'expansive storytelling' : 'focused narrative craft'}. ${tagline ? `"${tagline}" -` : ''} Exploring ${overview.includes('life') || overview.includes('world') ? 'universal human experiences' : 'distinctive perspectives'}, it delivers ${rating >= 7 ? 'exceptional cinema' : 'notable entertainment'} that resonates with audiences.`;
    themes = ['Story', 'Character', 'Journey', 'Discovery'];
  }

  // Generate AI insight based on rating, runtime, and year
  if (rating >= 8.5) {
    aiInsight = `Released in ${year}, this film demonstrates exceptional narrative mastery and ${overview.includes('based on') || overview.includes('true') ? 'remarkable adaptation prowess' : 'original storytelling brilliance'}. The ${runtime > 150 ? `ambitious ${Math.floor(runtime / 60)}-hour runtime allows for` : 'precise pacing enables'} comprehensive thematic exploration and character depth that ${rating >= 9 ? "places it among cinema's greatest achievements" : 'earned widespread critical acclaim and audience adoration'}. ${genres.length > 2 ? 'Its masterful genre-blending' : `The ${primaryGenre.toLowerCase()} execution`} creates a timeless cinematic experience.`;
  } else if (rating >= 7.5) {
    aiInsight = `This ${year} ${primaryGenre.toLowerCase()} showcases strong directorial vision and ${overview.includes('cast') || rating >= 8 ? 'outstanding ensemble performances' : 'engaging character work'} that ${hasFamily || hasLove ? 'connects emotionally with diverse audiences' : 'challenges viewers intellectually'}. Its ${genres.length > 2 ? 'multi-layered genre approach' : `focused ${primaryGenre.toLowerCase()} foundation`} combined with ${runtime > 130 ? `a substantial ${Math.floor(runtime / 60)}-hour runtime` : 'efficient storytelling'} appeals to viewers seeking ${rating >= 8 ? 'profound cinematic artistry' : 'well-crafted entertainment'}.`;
  } else if (rating >= 6.5) {
    aiInsight = `Released in ${year}, this ${primaryGenre.toLowerCase()} offering delivers ${secondaryGenre ? `a balanced fusion of ${primaryGenre.toLowerCase()} and ${secondaryGenre.toLowerCase()} elements` : 'solid genre entertainment'} with ${runtime > 120 ? `a generous ${Math.floor(runtime / 60)}-hour presentation` : 'efficient pacing'}. It appeals to ${genres[0]?.toLowerCase() || 'genre'} enthusiasts seeking ${hasAction ? 'excitement and spectacle' : 'accessible narratives'} with ${hasFamily ? 'family-friendly themes' : 'broad appeal'}.`;
  } else {
    aiInsight = `This ${year} ${primaryGenre.toLowerCase()} film presents ${secondaryGenre ? `${secondaryGenre.toLowerCase()} influences` : 'distinctive elements'} across ${runtime > 110 ? `its ${Math.floor(runtime / 60)}-hour narrative` : 'a focused runtime'}. While offering ${hasLove || hasFamily ? 'heartfelt moments' : 'genre-specific entertainment'}, it provides an experience for audiences interested in ${genres[0]?.toLowerCase() || 'contemporary'} cinema and ${overview.includes('star') ? 'star-powered performances' : 'emerging storytelling voices'}.`;
  }

  return {
    summary,
    themes: themes.slice(0, 4),
    aiInsight,
  };
};