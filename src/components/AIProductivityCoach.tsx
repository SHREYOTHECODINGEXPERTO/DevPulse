import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, AlertTriangle, TrendingUp, CheckCircle2, RefreshCw, Loader2, ArrowRight, ShieldCheck, Flame, Compass } from 'lucide-react';
import { devPulseApi, ProductivityCoachSuggestion } from '../utils/api';
import { soundFx } from '../utils/audio';
import { triggerCodeCelebration } from '../utils/celebration';
import { JiraIssue, Developer } from '../types';

interface AIProductivityCoachProps {
  issues: JiraIssue[];
  currentUser: Developer;
  velocityScore?: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenTaskGenerator?: () => void;
}

export const AIProductivityCoach: React.FC<AIProductivityCoachProps> = ({
  issues,
  currentUser,
  velocityScore = 88,
  isOpen,
  onClose,
  onOpenTaskGenerator,
}) => {
  const [suggestions, setSuggestions] = useState<ProductivityCoachSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  const inProgressCount = issues.filter((i) => i.status === 'In Progress').length;
  const inReviewCount = issues.filter((i) => i.status === 'In Review').length;
  const doneCount = issues.filter((i) => i.status === 'Done').length;
  const totalPoints = issues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
  const donePoints = issues.filter((i) => i.status === 'Done').reduce((acc, i) => acc + (i.storyPoints || 0), 0);
  const completionRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  const fetchSuggestions = async () => {
    setIsLoading(true);
    soundFx.playClick(600, 0.03);

    try {
      const res = await devPulseApi.getAIProductivitySuggestions({
        tasks: issues.map((i) => ({
          id: i.id,
          title: i.title,
          status: i.status.toLowerCase().replace(' ', '-') as any,
          priority: i.priority,
          storyPoints: i.storyPoints,
        })),
        velocityScore,
        userName: currentUser.name,
      });

      if (res.success && res.data?.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      console.warn('[AI Coach] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAcknowledge = (id: string) => {
    soundFx.playSuccess();
    triggerCodeCelebration({ particleCount: 30, spread: 45 });
    setAcknowledgedIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-[1.5px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  AI Sprint Productivity Coach
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  REAL-TIME TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Workload bottleneck analysis, WIP optimization, and sprint acceleration guidance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Telemetry Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Developer Velocity</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-lg font-bold text-white">{velocityScore}/100</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Sprint Delivery</span>
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-lg font-bold text-white">{completionRate}%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Active In-Progress</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-lg font-bold text-white">{inProgressCount} Tasks</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">PR Review Queue</span>
              <div className="flex items-center gap-1.5 mt-1">
                <AlertTriangle className={`w-4 h-4 ${inReviewCount > 2 ? 'text-rose-400' : 'text-purple-400'}`} />
                <span className="text-lg font-bold text-white">{inReviewCount} PRs</span>
              </div>
            </div>
          </div>

          {/* AI Suggestions Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  AI Sprint Guidance & Optimization
                </span>
              </div>
              <button
                type="button"
                onClick={fetchSuggestions}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Insights</span>
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                <span className="text-xs">Analyzing sprint telemetry and workload patterns...</span>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                No active bottlenecks detected. Sprint execution is running smoothly.
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((sug) => {
                  const isDone = acknowledgedIds.has(sug.id);
                  return (
                    <div
                      key={sug.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 opacity-70'
                          : sug.impactLevel === 'High'
                          ? 'bg-slate-950/90 border-rose-500/30'
                          : 'bg-slate-950/90 border-indigo-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100">{sug.title}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                                sug.impactLevel === 'High'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-indigo-500/20 text-indigo-300'
                              }`}
                            >
                              {sug.impactLevel} IMPACT
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {sug.description}
                          </p>

                          <div className="mt-2.5 p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-start gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span className="text-[11px] text-cyan-200">
                              <strong className="text-white">Recommended Action:</strong> {sug.actionableStep}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAcknowledge(sug.id)}
                          className={`shrink-0 p-2 rounded-xl text-xs font-bold transition-all ${
                            isDone
                              ? 'bg-emerald-500 text-black'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : 'Apply'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Sprint cycle telemetry refreshed in real-time
          </div>

          <div className="flex items-center gap-2">
            {onOpenTaskGenerator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTaskGenerator();
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Task Generator</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
