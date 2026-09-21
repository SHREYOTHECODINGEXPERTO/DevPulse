import React, { useState, useEffect } from 'react';
import { 
  Trello, 
  Sparkles, 
  Loader2, 
  Check, 
  Trash2, 
  Clock, 
  Tag, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  GitPullRequest,
  Calendar,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';
import { devPulseApi, TaskSummaryData } from '../utils/api';
import { soundFx } from '../utils/audio';
import { triggerCodeCelebration } from '../utils/celebration';
import { JiraIssue, IssueStatus, IssuePriority, IssueType, Developer } from '../types';

interface TaskDetailModalProps {
  issue: JiraIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (updatedIssue: JiraIssue) => void;
  onDeleteTask: (issueId: string) => void;
  teamMembers: Developer[];
  currentUser: Developer;
}

const STATUSES: IssueStatus[] = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];
const PRIORITIES: IssuePriority[] = ['Low', 'Medium', 'High', 'Critical'];
const TYPES: IssueType[] = ['Story', 'Bug', 'Task', 'Epic', 'Refactor'];

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  issue,
  isOpen,
  onClose,
  onSaveTask,
  onDeleteTask,
  teamMembers,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus>('Todo');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [type, setType] = useState<IssueType>('Task');
  const [storyPoints, setStoryPoints] = useState(3);
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [timeSpentHours, setTimeSpentHours] = useState(0);
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [transitionNote, setTransitionNote] = useState('');

  // AI Summarization state
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<TaskSummaryData | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (issue) {
      setTitle(issue.title || '');
      setDescription(issue.description || '');
      setStatus(issue.status || 'Todo');
      setPriority(issue.priority || 'Medium');
      setType(issue.type || 'Task');
      setStoryPoints(issue.storyPoints || 3);
      setEstimatedHours(issue.estimatedHours || 4);
      setTimeSpentHours(issue.timeSpentHours || 0);
      setAssigneeId(issue.assignee?.id || currentUser.id);
      setDueDate(issue.dueDate || new Date().toISOString().split('T')[0]);
      setTagsInput(issue.tags?.join(', ') || '');
      setSummaryData(null);
      setTransitionNote('');
    }
  }, [issue, currentUser, isOpen]);

  if (!isOpen || !issue) return null;

  // Dedicated AI Summarization
  const handleAISummarize = async () => {
    setIsSummarizing(true);
    setSummaryError(null);
    soundFx.playClick(600, 0.04);

    try {
      const res = await devPulseApi.summarizeAITask({
        title,
        description,
        status: status.toLowerCase().replace(' ', '-'),
        priority,
        storyPoints,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      });

      if (res.success && res.data) {
        setSummaryData(res.data);
        soundFx.playSuccess();
        triggerCodeCelebration({ particleCount: 35, spread: 50 });
      } else {
        throw new Error(res.error?.message || 'Failed to summarize task');
      }
    } catch (err: any) {
      setSummaryError(err.message || 'Error generating summary');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Status transition with audit trail
  const handleStatusChange = (newStatus: IssueStatus) => {
    soundFx.playClick(800, 0.03);
    setStatus(newStatus);
    if (newStatus === 'Done') {
      triggerCodeCelebration({ particleCount: 50, spread: 60 });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedMember = teamMembers.find((m) => m.id === assigneeId) || currentUser;
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const updated: JiraIssue = {
      ...issue,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      type,
      storyPoints: Number(storyPoints),
      estimatedHours: Number(estimatedHours),
      timeSpentHours: Number(timeSpentHours),
      assignee: assignedMember,
      dueDate,
      tags,
    };

    // Update backend status & task if needed
    const backendStatus = status.toLowerCase().replace(' ', '-') as any;
    devPulseApi.updateTaskStatus(issue.id, backendStatus, currentUser.id, transitionNote || undefined)
      .catch((e) => console.warn('[Backend Status Sync]', e));

    devPulseApi.updateTask(issue.id, {
      title: updated.title,
      description: updated.description,
      priority: updated.priority,
      storyPoints: updated.storyPoints,
      estimatedHours: updated.estimatedHours,
      timeSpentHours: updated.timeSpentHours,
      assigneeId: assignedMember.id,
      dueDate: updated.dueDate,
      tags: updated.tags,
    }).catch((e) => console.warn('[Backend Task Sync]', e));

    soundFx.playSuccess();
    onSaveTask(updated);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete task "${issue.key}: ${issue.title}"?`)) {
      soundFx.playSuccess();
      devPulseApi.deleteTask(issue.id).catch((e) => console.warn('[Backend Delete]', e));
      onDeleteTask(issue.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Trello className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold text-sm tracking-wider">{issue.key}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {issue.sprint || 'Active Sprint'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Task Lifecycle & Status Management</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDelete}
              title="Delete Task"
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
            {/* Dedicated Status Transition Pills */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Status Lifecycle State Machine
              </label>
              <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                {STATUSES.map((st) => {
                  const isActive = status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`py-2 px-1 text-center rounded-lg transition-all font-bold text-[11px] cursor-pointer ${
                        isActive
                          ? st === 'Done'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                            : st === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                            : st === 'In Review'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            {/* Description + AI Summarize Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Description & Implementation Context
                </label>
                <button
                  type="button"
                  onClick={handleAISummarize}
                  disabled={isSummarizing || !title.trim()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Generating AI Summary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>⚡ AI Summarize Task</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detailed task description, edge cases, and acceptance criteria..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />
            </div>

            {/* AI Executive Digest Card (If Generated) */}
            {summaryData && (
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Executive Summary
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-mono">
                    Complexity: {summaryData.estimatedComplexity}
                  </span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed">{summaryData.summary}</p>

                {summaryData.keyPoints?.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Key Deliverables:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 mt-0.5">
                      {summaryData.keyPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summaryData.potentialRisks?.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-rose-400 font-bold block uppercase">Potential Risks:</span>
                    <ul className="list-disc list-inside text-[11px] text-rose-300/80 space-y-0.5 mt-0.5">
                      {summaryData.potentialRisks.map((risk, i) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Priority, Type, Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Issue Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (@{m.handle})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Story Points, Hours, Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Story Points (Fibonacci)
                </label>
                <select
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {[1, 2, 3, 5, 8, 13].map((pt) => (
                    <option key={pt} value={pt}>
                      {pt} Points
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="architecture, backend, security, api"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Transition Note */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Audit Transition Note (Optional)
              </label>
              <input
                type="text"
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                placeholder="e.g. Moved to In-Progress after local branch checkout..."
                className="w-full px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Task Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
