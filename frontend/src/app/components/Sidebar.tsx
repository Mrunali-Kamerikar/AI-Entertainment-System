import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Film, TrendingUp, History, LogOut, ChevronLeft, ChevronRight,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { CineVerseLogo } from './CineVerseLogo';

export const Sidebar: React.FC = () => {
  const { user, logout, isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, recentHistory } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: TrendingUp, label: 'Trending', tab: 'trending' as const },
  ];

  const categoryItems = [
    { label: 'Bollywood', tab: 'bollywood' as const },
    { label: 'Hollywood', tab: 'hollywood' as const },
    { label: 'Tollywood', tab: 'tollywood' as const },
    { label: 'K-Drama', tab: 'kdrama' as const },
    { label: 'Anime', tab: 'anime' as const },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 256 : 64 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 30,
          background: '#0d0d0d',
          borderRight: '1px solid #1a1a1a',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: isSidebarOpen ? '20px 20px 16px' : '20px 0 16px',
          display: 'flex', alignItems: 'center',
          justifyContent: isSidebarOpen ? 'space-between' : 'center',
          borderBottom: '1px solid #1a1a1a',
          flexShrink: 0,
        }}>
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <CineVerseLogo size={40} variant="full" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <CineVerseLogo size={32} variant="icon" />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid #222',
              borderRadius: 8, width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#888', flexShrink: 0,
            }}
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </motion.button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'thin', scrollbarColor: '#1a1a1a transparent' }}>
          {/* User Profile */}
          <div style={{
            padding: isSidebarOpen ? '16px 20px' : '16px 0',
            display: 'flex', alignItems: 'center', gap: 10,
            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
            borderBottom: '1px solid #1a1a1a',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #E50914, #ff4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem',
              flexShrink: 0,
            }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  <p style={{ color: '#fff', margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>
                    {user?.username || 'User'}
                  </p>
                  <p style={{ color: '#555', margin: 0, fontSize: '0.72rem' }}>Premium Member</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <nav style={{ padding: isSidebarOpen ? '12px 12px' : '12px 8px' }}>
            <p style={{
              color: '#333', fontSize: '0.65rem', textTransform: 'uppercase',
              letterSpacing: '0.08em', padding: '4px 8px', margin: '0 0 4px',
              display: isSidebarOpen ? 'block' : 'none',
            }}>
              Navigation
            </p>
            {navItems.map(item => {
              const isActive = activeTab === item.tab;
              return (
                <motion.button
                  key={item.tab}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(item.tab)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 10, padding: isSidebarOpen ? '10px 12px' : '10px 0',
                    justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                    background: isActive ? 'rgba(229,9,20,0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(229,9,20,0.2)' : '1px solid transparent',
                    borderRadius: 8, cursor: 'pointer',
                    marginBottom: 2, transition: 'all 0.15s',
                  }}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <item.icon
                    size={16}
                    color={isActive ? '#E50914' : '#666'}
                    style={{ flexShrink: 0 }}
                  />
                  <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                          color: isActive ? '#fff' : '#888',
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}

            {/* Entertainment Categories */}
            <div style={{ marginTop: 8 }}>
              {/* Heading */}
              <p style={{
                color: '#333', fontSize: '0.65rem', textTransform: 'uppercase',
                letterSpacing: '0.08em', padding: '4px 8px', margin: '8px 0 4px',
                display: isSidebarOpen ? 'block' : 'none',
              }}>
                Entertainment Categories
              </p>

              {/* Category Navigation Links - Always Visible */}
              {categoryItems.map(item => {
                const isActive = activeTab === item.tab;
                return (
                  <motion.button
                    key={item.tab}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(item.tab)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      gap: 10, padding: isSidebarOpen ? '10px 12px' : '10px 0',
                      justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                      background: isActive ? 'rgba(229,9,20,0.12)' : 'transparent',
                      border: isActive ? '1px solid rgba(229,9,20,0.2)' : '1px solid transparent',
                      borderRadius: 8, cursor: 'pointer',
                      marginBottom: 2, transition: 'all 0.15s',
                    }}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    <Film
                      size={16}
                      color={isActive ? '#E50914' : '#666'}
                      style={{ flexShrink: 0 }}
                    />
                    <AnimatePresence mode="wait">
                      {isSidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{
                            color: isActive ? '#fff' : '#888',
                            fontSize: '0.85rem',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* Watch History */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ padding: '0 20px 16px', borderTop: '1px solid #1a1a1a', paddingTop: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <History size={13} color="#555" />
                  <p style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    Recent History
                  </p>
                </div>
                {recentHistory.length > 0 ? (
                  recentHistory.slice(0, 4).map(item => (
                    <div key={`${item.id}-${item.viewedAt}`} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: 8,
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          color: '#ccc', margin: 0, fontSize: '0.78rem',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140,
                        }}>
                          {item.title}
                        </p>
                        <p style={{ color: '#444', margin: 0, fontSize: '0.68rem' }}>{item.date}</p>
                      </div>
                      <span style={{ color: '#F5C518', fontSize: '0.72rem', flexShrink: 0 }}>
                        ★ {item.rating}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#444', fontSize: '0.75rem', textAlign: 'center', margin: '10px 0' }}>
                    No viewing history yet
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom actions */}
        <div style={{
          padding: isSidebarOpen ? '12px 12px' : '12px 8px',
          borderTop: '1px solid #1a1a1a', flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <motion.button
            whileHover={{ x: 2 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: isSidebarOpen ? '10px 12px' : '10px 0',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              background: 'transparent', border: '1px solid transparent',
              borderRadius: 8, cursor: 'pointer',
            }}
            title={!isSidebarOpen ? 'Settings' : undefined}
          >
            <Settings size={16} color="#555" style={{ flexShrink: 0 }} />
            {isSidebarOpen && <span style={{ color: '#666', fontSize: '0.85rem' }}>Settings</span>}
          </motion.button>
          <motion.button
            whileHover={{ x: 2, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: isSidebarOpen ? '10px 12px' : '10px 0',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              background: 'rgba(229,9,20,0.05)', border: '1px solid rgba(229,9,20,0.12)',
              borderRadius: 8, cursor: 'pointer',
            }}
            title={!isSidebarOpen ? 'Logout' : undefined}
          >
            <LogOut size={16} color="#E50914" style={{ flexShrink: 0 }} />
            {isSidebarOpen && <span style={{ color: '#E50914', fontSize: '0.85rem' }}>Logout</span>}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};