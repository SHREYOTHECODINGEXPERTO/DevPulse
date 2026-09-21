import React, { useState } from 'react';
import { Sparkles, Loader2, Check, Plus, AlertCircle, Layers, CheckCircle2, Clock, Zap, ArrowRight, Tag } from 'lucide-react';
import { devPulseApi, GeneratedAITask } from '../utils/api';
import { soundFx } from '../utils/audio';
import { triggerCodeCelebration } from '../utils/celebration';
import { Developer, ProjectTechStack } from '../types';

interface AITaskGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectTechStack[];
  selectedProjectKey?: string;
  currentUser: Developer;
  onTasksImported: (newTasks: any[]) => void;
}

const PRESET_IDEAS = [
  'Build OAuth2 & PKCE Authentication with Refresh Tokens',
  'Implement Real-Time WebSocket Telemetry Channel',
  'Create Stripe Subscription Checkout & Webhook Handler',
  'Design Dark Mode Dashboard with TailwindCSS & Glassmorphism',
  'Add Redis Caching Layer with TTL & Key Invalidation',
];

export const AITaskGeneratorModal: React.FC<AITaskGeneratorModalProps> = ({
  isOpen,
  onClose,
  projects,
  selectedProjectKey,
  currentUser,
  onTasksImported,
}) => {
  const [goal, setGoal] = useState('');
  const [targetProjectKey, setTargetProjectKey] = useState(selectedProjectKey || (projects[0]?.id || 'PULSE'));
  const [taskCount, setTaskCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedAITask[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [sourceEngine, setSourceEngine] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const currentProject = projects.find((p) => p.id === targetProjectKey || p.fullName === targetProjectKey || p.repoName === targetProjectKey);

  const handleGenerate = async (presetPrompt?: string) => {
    const promptToUse = (presetPrompt || goal).trim();
    if (!promptToUse) {
      setErrorMsg('Please specify a feature goal or technical requirement.');
      return;
    }

    if (presetPrompt) setGoal(presetPrompt);

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedTasks([]);
    soundFx.playClick(700, 0.04);

    try {
      const res = await devPulseApi.generateAITasks({
        goal: promptToUse,
        projectKey: targetProjectKey,
        projectName: currentProject?.repoName || targetProjectKey,
        techStack: currentProject?.languages || ['React', 'TypeScript', 'Node.js'],
        taskCount,
      });

      if (res.success && res.data?.tasks && res.data.tasks.length > 0) {
        setGeneratedTasks(res.data.tasks);
        setSourceEngine(res.data.source);
        setSelectedIndices(new Set(res.data.tasks.map((_, i) => i)));
        soundFx.playSuccess();
        triggerCodeCelebration({ particleCount: 40, spread: 60 });
      } else {
        throw new Error(res.error?.message || 'Failed to generate tasks');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with AI service');
      soundFx.playClick(200, 0.08);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelectTask = (index: number) => {
    soundFx.playClick(600, 0.02);
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleImportToBoard = async () => {
    const tasksToImport = generatedTasks.filter((_, idx) => selectedIndices.has(idx));
    if (tasksToImport.length === 0) {
      setErrorMsg('Please select at least one task to import.');
      return;
    }

    setIsImporting(true);
    soundFx.playSuccess();

    try {
      const importedTasksList: any[] = [];

      for (const t of tasksToImport) {
        // Convert to Kanban task model
        const created = {
          id: `task-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          key: `${targetProjectKey.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'TASK'}-${Math.floor(100 + Math.random() * 900)}`,
          title: t.title,
          description: t.description,
          type: t.type,
          priority: t.priority,
          status: 'Todo',
          storyPoints: t.storyPoints || 3,
          estimatedHours: t.estimatedHours || 4,
          timeSpentHours: 0,
          assignee: currentUser,
          reporter: currentUser,
          sprint: 'Sprint 34: Apex Velocity',
          epic: 'AI Generated Feature',
          epicColor: 'border-cyan-500/50 text-cyan-400',
          tags: t.tags || ['ai-generated', 'feature'],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          statusHistory: [
            {
              fromStatus: null,
              toStatus: 'todo',
              changedAt: new Date().toISOString(),
              changedBy: currentUser.id,
              note: 'Created via AI Task Generator',
            },
          ],
        };

        importedTasksList.push(created);

        // Also sync to backend API in background
        devPulseApi.createTask({
          title: t.title,
          description: t.description,
          projectId: currentProject?.id || 'proj-1',
          assigneeId: currentUser.id,
          reporterId: currentUser.id,
          type: t.type,
          priority: t.priority,
          storyPoints: t.storyPoints,
          estimatedHours: t.estimatedHours,
          tags: t.tags,
        }).catch((e) => console.warn('[Backend Sync]', e));
      }

      triggerCodeCelebration({ particleCount: 75, spread: 85 });
      onTasksImported(importedTasksList);
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to import tasks: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  AI-Assisted Task Generator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  GEMINI 2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deconstruct software requirements into structured Jira-style tasks with one click.
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
          {/* Target Project & Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Target Project Workspace
              </label>
              <select
                value={targetProjectKey}
                onChange={(e) => setTargetProjectKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.repoName} ({p.primaryLanguage || 'TypeScript'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Task Breakdown Count
              </label>
              <select
                value={taskCount}
                onChange={(e) => setTaskCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value={3}>3 Tasks (Concise)</option>
                <option value={4}>4 Tasks (Balanced)</option>
                <option value={5}>5 Tasks (Comprehensive)</option>
              </select>
            </div>
          </div>

          {/* Prompt / Goal Input */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1.5">
              Feature Goal / Technical Requirement
            </label>
            <div className="relative">
              <textarea
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. Implement resilient WebSocket connection with automatic reconnect, heartbeat pings, and telemetry packet compression..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-500 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Quick Idea Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              💡 Quick Idea Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_IDEAS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleGenerate(preset)}
                  disabled={isGenerating}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 border border-slate-700 text-[10px] text-slate-300 transition-all cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Tasks List */}
          {generatedTasks.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Generated {generatedTasks.length} Jira Tasks
                  </span>
                  {sourceEngine && (
                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 border border-slate-700">
                      Engine: {sourceEngine}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedIndices.size === generatedTasks.length) {
                      setSelectedIndices(new Set());
                    } else {
                      setSelectedIndices(new Set(generatedTasks.map((_, i) => i)));
                    }
                  }}
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  {selectedIndices.size === generatedTasks.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {generatedTasks.map((task, idx) => {
                  const isSelected = selectedIndices.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelectTask(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-cyan-500 border-cyan-400 text-black font-bold'
                                : 'border-slate-600 bg-slate-900'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-100">{task.title}</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-mono">
                                {task.type}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                                  task.priority === 'Critical'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : task.priority === 'High'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
                              <span>⚡ {task.storyPoints} Story Points</span>
                              <span>⏱️ {task.estimatedHours}h Estimated</span>
                              {task.tags && task.tags.length > 0 && (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Tag className="w-3 h-3" />
                                  {task.tags.slice(0, 3).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            {generatedTasks.length > 0
              ? `${selectedIndices.size} of ${generatedTasks.length} tasks selected`
              : 'AI decomposes requirements in seconds'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
            >
              Cancel
            </button>

            {generatedTasks.length === 0 ? (
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating || !goal.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing & Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Jira Tasks</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleImportToBoard}
                disabled={isImporting || selectedIndices.size === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing to Board...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Import {selectedIndices.size} Tasks to Board</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
