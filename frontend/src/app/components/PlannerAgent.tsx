import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LayoutList, ListChecks, Calendar, ShieldCheck, Play, ArrowRight, Loader2, BrainCircuit, Download, History, ChevronRight, FileText, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { createExecutionPlan, ExecutionSchedule, PlannerStep, getUserPlans } from '../services/backend';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';

export const PlannerAgent: React.FC = () => {
  const { user, trialUsage, refreshTrialUsage, activeTool, setActiveTool } = useApp();
  const navigate = useNavigate();
  const isOpen = activeTool === 'plannerAgent';
  const setIsOpen = (open: boolean) => setActiveTool(open ? 'plannerAgent' : null);
  const [goal, setGoal] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [plan, setPlan] = useState<ExecutionSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ExecutionSchedule[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const trialLimit = 2;
  const currentUsage = trialUsage.planner;
  const isLimitReached = user?.isDemo && currentUsage >= trialLimit;

  useEffect(() => {
    if (showHistory && isOpen) {
      loadHistory();
    }
  }, [showHistory, isOpen]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await getUserPlans();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!goal.trim()) return;
    
    if (isLimitReached) {
      setShowUpgrade(true);
      return;
    }

    setIsPlanning(true);
    setError(null);
    try {
      const result = await createExecutionPlan(goal);
      setPlan(result);
      
      // Update trial usage counter
      if (user?.isDemo) {
        await refreshTrialUsage();
      }

      // Refresh history if it's being shown
      if (showHistory) loadHistory();
    } catch (err: any) {
      if (err.message?.includes('demo attempts')) {
        setShowUpgrade(true);
      } else {
        setError(err instanceof Error ? err.message : 'The Agent Reasoning Loop encountered an error. Please check the backend connection.');
      }
    } finally {
      setIsPlanning(false);
    }
  };

  const handleDownloadPlan = (planToDownload: ExecutionSchedule) => {
    const content = planToDownload.full_text_plan || JSON.stringify(planToDownload, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-${planToDownload.goal.slice(0, 20).replace(/\s+/g, '-')}-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setGoal('');
    setPlan(null);
    setError(null);
    setShowHistory(false);
  };

  const selectFromHistory = (item: ExecutionSchedule) => {
    setPlan(item);
    setShowHistory(false);
  };

  return (
    <>
      {/* Floating Planner Button */}
      <AnimatePresence>
        {activeTool === null && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1, boxShadow: '0 12px 32px rgba(229, 9, 20, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-40 md:right-52 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center z-50 border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #E50914 0%, #B20710 100%)',
              boxShadow: '0 8px 24px rgba(229, 9, 20, 0.4)',
            }}
          >
            <BrainCircuit size={24} className="md:w-7 md:h-7 text-white" />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle, #E50914 0%, transparent 70%)' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Planner Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden"
            style={{
              width: 'min(560px, calc(100vw - 48px))',
              height: 'min(750px, calc(100vh - 100px))',
              background: 'linear-gradient(180deg, #141414 0%, #000000 100%)',
              borderRadius: 24,
              boxShadow: '0 24px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            {/* Header */}
            <div 
              className="px-6 py-5 flex items-center justify-between border-b border-white/5"
              style={{
                background: 'linear-gradient(135deg, #1f1f1f 0%, #141414 100%)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-600/20">
                  <BrainCircuit size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg m-0">Planner Agent</h3>
                  <p className="text-red-500/70 text-xs m-0 font-medium tracking-wide uppercase">Multi-Step Reasoning Loop</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHistory(!showHistory)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-0 cursor-pointer transition-colors ${showHistory ? 'bg-red-600/20 text-red-500' : 'bg-white/5 text-white hover:bg-white/10'}`}
                  title="View History"
                >
                  <History size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center border-0 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} color="#fff" />
                </motion.button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 text-white custom-scrollbar">
              {showUpgrade ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center border border-red-600/30">
                    <Sparkles size={40} className="text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-white">Trial Limit Reached</h4>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                      You've used your {trialLimit} free demo attempts for the Planner Agent. 
                      Sign in or create an account to unlock unlimited access.
                    </p>
                  </div>
                  <div className="flex flex-col w-full gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: '#E50914' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/signup')}
                      className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl border-0 cursor-pointer shadow-xl"
                    >
                      Create Free Account
                    </motion.button>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-transparent text-slate-300 font-bold py-3 border-0 cursor-pointer hover:text-white transition-colors"
                    >
                      Already have an account? Sign In
                    </button>
                    <button
                      onClick={() => setShowUpgrade(false)}
                      className="text-slate-500 text-xs hover:text-slate-400 underline pt-2 bg-transparent border-0 cursor-pointer"
                    >
                      Maybe later
                    </button>
                  </div>
                </motion.div>
              ) : showHistory ? (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-white">Recent Plans</h4>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="text-red-500 text-xs font-bold bg-transparent border-0 cursor-pointer hover:text-red-400 transition-colors"
                    >
                      Back to Planner
                    </button>
                  </div>

                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="animate-spin text-red-500" size={32} />
                      <p className="text-slate-400 text-sm">Retrieving your history...</p>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                        <History size={32} className="text-slate-600" />
                      </div>
                      <p className="text-slate-400 text-sm">No plans generated yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                          onClick={() => selectFromHistory(item)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <h5 className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-red-500 transition-colors">{item.goal}</h5>
                              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Clock size={10} /> {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</span>
                                <span className="flex items-center gap-1"><FileText size={10} /> {item.steps.length} Steps</span>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-red-500 transition-colors mt-1" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : !plan ? (
                <div className="flex flex-col gap-8 py-4">
                  <div className="space-y-4 text-center">
                    <h4 className="text-xl font-semibold text-slate-200">What do you want to achieve?</h4>
                    {user?.isDemo && (
                      <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 w-fit mx-auto">
                        <Sparkles size={12} className="text-red-500" />
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                          Demo Limit: {currentUsage}/{trialLimit} Attempts Used
                        </span>
                      </div>
                    )}
                    <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                      Enter a high-level entertainment goal, and the agent will decompose it into actionable steps.
                    </p>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                    <textarea 
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g., Plan a 3-day promotion campaign for a new Sci-Fi movie release..."
                      className="relative w-full bg-black/90 border border-white/10 rounded-2xl p-5 text-sm text-slate-200 focus:outline-none focus:border-red-500/50 transition-all resize-none shadow-2xl"
                      rows={4}
                    />
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3"
                    >
                      <X size={16} />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-red-500">
                        <ListChecks size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Step Decomposition</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">Agent identifies every micro-task required to hit your target.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-red-700">
                        <ShieldCheck size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Resource Validation</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">Checks API and tool availability before confirming the plan.</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#ff1f1f' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreatePlan}
                    disabled={isPlanning || !goal.trim()}
                    className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl border-0 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  >
                    {isPlanning ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                    {isPlanning ? 'Orchestrating Reasoning Loop...' : 'Generate Execution Plan'}
                  </motion.button>
                </div>
              ) : (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setPlan(null)}
                      className="text-red-500 text-sm font-bold bg-transparent border-0 cursor-pointer hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      ← New Plan
                    </button>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownloadPlan(plan)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Download Plan"
                      >
                        <Download size={14} />
                      </motion.button>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                        plan.validation_status === 'At Risk' 
                          ? 'bg-red-500/10 border-red-500/20' 
                          : 'bg-green-500/10 border-green-500/20'
                      }`}>
                        {plan.validation_status === 'At Risk' ? (
                          <X size={14} className="text-red-500" />
                        ) : (
                          <ShieldCheck size={14} className="text-green-500" />
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                          plan.validation_status === 'At Risk' ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {plan.validation_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">High-Level Goal</label>
                    <h4 className="text-lg font-bold text-white leading-tight">{plan.goal}</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Execution Steps</label>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-[10px] font-medium italic">Est: {plan.total_estimated_time}</span>
                      </div>
                    </div>

                    {/* New: Display Full Text Plan for compliance with "formatted plan" requirement */}
                    {plan.full_text_plan && (
                      <div className="p-4 rounded-2xl bg-red-600/5 border border-red-600/10 mb-4">
                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 block">AI Formatted Plan</label>
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                          {plan.full_text_plan}
                        </pre>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {plan.steps.map((step, idx) => (
                        <motion.div 
                          key={step.step_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="relative flex gap-4"
                        >
                          {/* Timeline Line */}
                          {idx !== plan.steps.length - 1 && (
                            <div className="absolute left-[15px] top-8 bottom-[-20px] w-0.5 bg-white/10"></div>
                          )}
                          
                          {/* Step Number Circle */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600/20 border border-red-600/20 flex items-center justify-center text-xs font-bold text-red-500 z-10 shadow-lg">
                            {step.step_id}
                          </div>
                          
                          {/* Step Content Card */}
                          <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 hover:bg-white/10 transition-colors">
                            <p className="text-sm text-slate-200 font-medium leading-relaxed">{step.action}</p>
                            
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/5 border border-red-500/10">
                                <LayoutList size={10} className="text-red-500" />
                                <span className="text-[9px] font-bold text-red-500 uppercase">{step.resource_required}</span>
                              </div>
                              {step.dependency && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/5 border border-amber-500/10">
                                  <ArrowRight size={10} className="text-amber-400" />
                                  <span className="text-[9px] font-bold text-amber-400 uppercase">Wait for #{step.dependency}</span>
                                </div>
                              )}
                              <span className="text-[10px] text-slate-500 ml-auto">{step.estimated_time}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="mt-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 rounded-2xl border-0 cursor-pointer text-xs uppercase tracking-widest transition-all"
                  >
                    Clear and start over
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
