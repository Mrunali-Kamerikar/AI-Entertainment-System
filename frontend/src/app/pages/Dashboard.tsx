import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Brain, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { SearchBar } from '../components/SearchBar';
import { MovieModal } from '../components/MovieModal';
import { RecommendationsTab } from '../components/tabs/RecommendationsTab';
import { SummaryTab } from '../components/tabs/SummaryTab';
import { ReviewsTab } from '../components/tabs/ReviewsTab';
import { QATab } from '../components/tabs/QATab';
import { TrendingTab } from '../components/tabs/TrendingTab';
import { CategoryTab } from '../components/tabs/CategoryTab';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { DataSourceIndicator } from '../components/DataSourceIndicator';
import { ChatBot } from '../components/ChatBot';
import { ScriptGenerator } from '../components/ScriptGenerator';
import { PlannerAgent } from '../components/PlannerAgent';

type Tab = 'recommendations' | 'summary' | 'reviews' | 'qa' | 'trending' | 'bollywood' | 'hollywood' | 'tollywood' | 'kdrama' | 'anime';

export const Dashboard: React.FC = () => {
  const {
    user, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen,
    selectedMovie, isLoading, fetchRecommendations, searchQuery,
  } = useApp();
  const navigate = useNavigate();

  const sidebarWidth = isSidebarOpen ? 256 : 64;

  return (
    <div style={{ minHeight: '100vh', background: '#141414', display: 'flex' }}>
      {/* Data Source Indicator */}
      <DataSourceIndicator />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        {/* Top Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(20,20,20,0.95)',
          borderBottom: '1px solid #1a1a1a',
          backdropFilter: 'blur(12px)',
          padding: '0 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#888', display: 'flex', padding: 4,
              }}
            >
              <Menu size={20} />
            </button>

            {/* Search bar */}
            <div style={{ flex: 1, maxWidth: 680 }}>
              <SearchBar />
            </div>

            {/* User greeting */}
            <div className="hidden md:flex items-center gap-10 ml-auto">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={14} color="#E50914" />
                <span style={{ color: '#666', fontSize: '0.78rem' }}>
                  AI-powered for <span style={{ color: '#ccc' }}>{user?.username}</span>
                </span>
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E50914, #ff4444)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer',
              }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>

        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: '28px 24px', maxWidth: 1400, width: '100%' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'recommendations' && <RecommendationsTab />}
              {activeTab === 'summary' && <SummaryTab />}
              {activeTab === 'reviews' && <ReviewsTab />}
              {activeTab === 'qa' && <QATab />}
              {activeTab === 'trending' && <TrendingTab />}
              {activeTab === 'bollywood' && <CategoryTab category="bollywood" />}
              {activeTab === 'hollywood' && <CategoryTab category="hollywood" />}
              {activeTab === 'tollywood' && <CategoryTab category="tollywood" />}
              {activeTab === 'kdrama' && <CategoryTab category="kdrama" />}
              {activeTab === 'anime' && <CategoryTab category="anime" />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid #1a1a1a', padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Brain size={13} color="#E50914" />
            <span style={{ color: '#444', fontSize: '0.72rem' }}>
              CineVerse — Explore the World of Cinema
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {['TMDB API', 'Powered by AI', 'v1.0.0'].map(t => (
              <span key={t} style={{ color: '#333', fontSize: '0.68rem' }}>{t}</span>
            ))}
          </div>
        </footer>
      </motion.main>

      {/* Movie Modal - always rendered, uses AnimatePresence internally */}
      <AnimatePresence>
        {selectedMovie && <MovieModal key="modal" />}
      </AnimatePresence>

      {/* Global loading overlay */}
      {isLoading && <LoadingOverlay text="AI is fetching recommendations..." />}
      
      {/* AI ChatBot Assistant */}
      <ChatBot />

      {/* Script Generator Tool */}
      <ScriptGenerator />

      {/* Planner Agent Tool */}
      <PlannerAgent />
    </div>
  );
};