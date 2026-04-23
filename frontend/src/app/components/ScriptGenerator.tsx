import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Scroll, FileText, Send, Plus, Trash2, Wand2, RefreshCw, Download, History } from 'lucide-react';
import { generateScript, refineScript, getUserScripts, ScriptCharacter, ScriptCriteria } from '../services/backend';

export const ScriptGenerator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [idea, setIdea] = useState('');
  const [language, setLanguage] = useState('English');
  const [length, setLength] = useState('Medium (3-5 pages)');
  const [style, setStyle] = useState('Hollywood');
  const [genre, setGenre] = useState('');
  const [setting, setSetting] = useState('');
  const [time, setTime] = useState('');
  const [tone, setTone] = useState('');
  const [characters, setCharacters] = useState<ScriptCharacter[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeIteration, setActiveIteration] = useState<'intense' | 'humorous' | 'dialogue' | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'form' | 'script' | 'history'>('form');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId') || 'guest';
    if (userId && isOpen) {
      loadHistory(userId);
    }
  }, [isOpen]);

  const loadHistory = async (userId: string) => {
    const scripts = await getUserScripts(userId);
    setHistory(scripts);
  };

  const handleAddCharacter = () => {
    setCharacters([...characters, { name: '', role: '', traits: '' }]);
  };

  const handleRemoveCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const handleCharacterChange = (index: number, field: keyof ScriptCharacter, value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    setIsGenerating(true);
    const userId = localStorage.getItem('userId') || 'guest';
    const criteria: ScriptCriteria = {
      idea,
      user_id: userId,
      language,
      length,
      style,
      genre,
      setting,
      time,
      tone,
      characters: characters.filter(c => c.name.trim() !== '')
    };

    const result = await generateScript(criteria);
    setGeneratedScript(result.script);
    setIsGenerating(false);
    setActiveView('script');
    loadHistory(userId); // Refresh history
  };

  const handleRefine = async (action: 'intense' | 'humorous' | 'dialogue') => {
    if (!generatedScript) return;
    setIsGenerating(true);
    setActiveIteration(action);
    const result = await refineScript(generatedScript, action);
    setGeneratedScript(result.script);
    setIsGenerating(false);
    setActiveIteration(null);
    const userId = localStorage.getItem('userId') || 'guest';
    loadHistory(userId); // Refresh history
  };

  const handleDownload = () => {
    if (!generatedScript) return;
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setIdea('');
    setGenre('');
    setSetting('');
    setTime('');
    setTone('');
    setCharacters([]);
    setGeneratedScript(null);
    setActiveView('form');
  };

  return (
    <>
      {/* Floating Script Generator Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, boxShadow: '0 12px 32px rgba(229, 9, 20, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-28 w-16 h-16 rounded-full flex items-center justify-center z-50 border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #E50914 0%, #b30000 100%)',
              boxShadow: '0 8px 24px rgba(229, 9, 20, 0.4)',
            }}
          >
            <Scroll size={28} color="#fff" />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle, #E50914 0%, transparent 70%)' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Script Generator Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden"
            style={{
              width: 'min(520px, calc(100vw - 48px))',
              height: 'min(700px, calc(100vh - 100px))',
              background: 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)',
              borderRadius: 20,
              boxShadow: '0 24px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            {/* Header */}
            <div 
              className="px-5 py-4 flex items-center justify-between border-b border-white/10"
              style={{
                background: 'linear-gradient(135deg, #E50914 0%, #b30000 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Wand2 size={20} color="#fff" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base m-0">Script Generator</h3>
                  <p className="text-white/70 text-xs m-0">AI-Powered Screenwriting</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveView(activeView === 'history' ? 'form' : 'history')}
                  className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                  title="Script History"
                >
                  <History size={18} color="#fff" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center border-0 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <X size={18} color="#fff" />
                </motion.button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 text-white">
              {activeView === 'history' ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Recent Scripts</h4>
                    <button 
                      onClick={() => setActiveView('form')}
                      className="text-xs text-[#E50914] font-bold bg-transparent border-0 cursor-pointer"
                    >
                      Close History
                    </button>
                  </div>
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                      <History size={40} className="mb-2" />
                      <p className="text-sm">No scripts saved yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {history.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            setGeneratedScript(item.script);
                            setActiveView('script');
                          }}
                          className="bg-white/5 hover:bg-white/10 p-3 rounded-xl cursor-pointer border border-white/5 transition-colors group"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-[#E50914]">
                              {item.specifications?.style || 'Script'} • {item.specifications?.genre || 'Scene'}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 line-clamp-2 italic m-0">
                            "{item.script.substring(0, 100)}..."
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeView === 'form' ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Scene Idea</label>
                    <textarea 
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="e.g., A confrontation between brothers over a stolen legacy..."
                      className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-[#E50914] transition-colors resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Language</label>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#222] border border-white/10 rounded-lg p-2 text-sm focus:outline-none"
                      >
                        {['English', 'Hindi', 'Hinglish', 'Korean', 'Japanese'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Style</label>
                      <select 
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="bg-[#222] border border-white/10 rounded-lg p-2 text-sm focus:outline-none"
                      >
                        {['Hollywood', 'Bollywood', 'K-Drama', 'Anime/Japanese'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Genre</label>
                      <input 
                        type="text"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        placeholder="Action, Drama, etc."
                        className="bg-[#222] border border-white/10 rounded-lg p-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Length</label>
                      <select 
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="bg-[#222] border border-white/10 rounded-lg p-2 text-sm focus:outline-none"
                      >
                        {['Short (1-2 pages)', 'Medium (3-5 pages)', 'Long (5-10 pages)'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Setting</label>
                      <input 
                        type="text"
                        value={setting}
                        onChange={(e) => setSetting(e.target.value)}
                        className="bg-[#222] border border-white/10 rounded-lg p-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time</label>
                      <input 
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="bg-[#222] border border-white/10 rounded-lg p-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tone</label>
                      <input 
                        type="text"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="bg-[#222] border border-white/10 rounded-lg p-2 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Characters</label>
                      <button 
                        onClick={handleAddCharacter}
                        className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded flex items-center gap-1 border-0 cursor-pointer text-white"
                      >
                        <Plus size={10} /> Add
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {characters.map((char, index) => (
                        <div key={index} className="flex gap-2 items-start bg-white/5 p-2 rounded-lg relative group">
                          <input 
                            placeholder="Name"
                            value={char.name}
                            onChange={(e) => handleCharacterChange(index, 'name', e.target.value)}
                            className="bg-transparent border-b border-white/10 p-1 text-xs w-20 focus:outline-none focus:border-[#E50914]"
                          />
                          <input 
                            placeholder="Role"
                            value={char.role}
                            onChange={(e) => handleCharacterChange(index, 'role', e.target.value)}
                            className="bg-transparent border-b border-white/10 p-1 text-xs flex-1 focus:outline-none focus:border-[#E50914]"
                          />
                          <button 
                            onClick={() => handleRemoveCharacter(index)}
                            className="text-gray-500 hover:text-red-500 bg-transparent border-0 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={isGenerating || !idea.trim()}
                    className="mt-4 bg-[#E50914] hover:bg-[#ff1f1f] text-white font-bold py-3 rounded-xl border-0 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
                    {isGenerating ? 'Generating...' : 'Generate Script'}
                  </motion.button>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => setActiveView('form')}
                      className="bg-transparent border-0 text-[#E50914] text-sm font-bold cursor-pointer flex items-center gap-1"
                    >
                      ← Back to settings
                    </button>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleDownload}
                        className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg border-0 cursor-pointer flex items-center gap-2 text-xs"
                        title="Download as TXT"
                      >
                        <Download size={14} /> Download
                      </button>
                      <button 
                        onClick={handleReset}
                        className="bg-transparent border-0 text-gray-400 text-sm hover:text-white cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {generatedScript}
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Iteration Tools</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleRefine('intense')}
                        disabled={isGenerating}
                        className={`bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold py-2 rounded-lg border-0 cursor-pointer flex flex-col items-center gap-1 transition-all ${activeIteration === 'intense' ? 'ring-2 ring-[#E50914]' : ''}`}
                      >
                        {activeIteration === 'intense' ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                        Intense
                      </button>
                      <button 
                        onClick={() => handleRefine('humorous')}
                        disabled={isGenerating}
                        className={`bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold py-2 rounded-lg border-0 cursor-pointer flex flex-col items-center gap-1 transition-all ${activeIteration === 'humorous' ? 'ring-2 ring-[#E50914]' : ''}`}
                      >
                        {activeIteration === 'humorous' ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} />}
                        Humorous
                      </button>
                      <button 
                        onClick={() => handleRefine('dialogue')}
                        disabled={isGenerating}
                        className={`bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold py-2 rounded-lg border-0 cursor-pointer flex flex-col items-center gap-1 transition-all ${activeIteration === 'dialogue' ? 'ring-2 ring-[#E50914]' : ''}`}
                      >
                        {activeIteration === 'dialogue' ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                        Dialogue
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
