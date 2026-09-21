import React, { useState } from 'react';
import { JiraIssue, IssueStatus, Developer } from '../types';
import { 
  Trello, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  GitPullRequest, 
  Tag, 
  LayoutGrid, 
  List, 
  Flame, 
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Calendar,
  Zap,
  Loader2
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerCodeCelebration } from '../utils/celebration';
import { devPulseApi } from '../utils/api';
import { UserAvatar } from './UserAvatar';

interface JiraKanbanBoardProps {
  issues: JiraIssue[];
  onUpdateIssueStatus: (issueId: string, newStatus: IssueStatus) => void;
  onOpenQuickCreate: () => void;
  onSelectPR?: (prIdOrKey: string) => void;
  teamMembers: Developer[];
  onSelectTask?: (issue: JiraIssue) => void;
  onOpenTaskGenerator?: () => void;
  onReorderIssues?: (reordered: JiraIssue[]) => void;
}

const COLUMNS: { id: IssueStatus; title: string; color: string; border: string }[] = [
  { id: 'Backlog', title: 'Backlog', color: 'text-slate-400', border: 'border-slate-800' },
  { id: 'Todo', title: 'To Do', color: 'text-sky-400', border: 'border-sky-500/30' },
  { id: 'In Progress', title: 'In Progress', color: 'text-amber-400', border: 'border-amber-500/30' },
  { id: 'In Review', title: 'In Review', color: 'text-purple-400', border: 'border-purple-500/30' },
  { id: 'Done', title: 'Done', color: 'text-emerald-400', border: 'border-emerald-500/30' },
];

export const JiraKanbanBoard: React.FC<JiraKanbanBoardProps> = ({
  issues,
  onUpdateIssueStatus,
  onOpenQuickCreate,
  onSelectPR,
  teamMembers,
  onSelectTask,
  onOpenTaskGenerator,
  onReorderIssues,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedSprint, setSelectedSprint] = useState<string>('all');
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [aiPrioritizedNotice, setAiPrioritizedNotice] = useState<string | null>(null);

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAssignee = selectedAssignee === 'all' || issue.assignee.id === selectedAssignee;
    const matchesPriority = selectedPriority === 'all' || issue.priority === selectedPriority;
    const matchesSprint = selectedSprint === 'all' || issue.sprint.includes(selectedSprint);

    return matchesSearch && matchesAssignee && matchesPriority && matchesSprint;
  });

  const handleAIPrioritize = async () => {
    setIsPrioritizing(true);
    soundFx.playClick(700, 0.04);

    try {
      const res = await devPulseApi.prioritizeAITasks(
        issues.map((i) => ({
          id: i.id,
          title: i.title,
          priority: i.priority,
          storyPoints: i.storyPoints,
          status: i.status.toLowerCase().replace(' ', '-') as any,
          dueDate: i.dueDate,
        }))
      );

      if (res.success && res.data?.prioritized) {
        soundFx.playSuccess();
        triggerCodeCelebration({ particleCount: 50, spread: 70 });
        setAiPrioritizedNotice(`AI prioritized ${res.data.prioritized.length} backlog items based on urgency, dependencies & impact.`);

        if (onReorderIssues) {
          const priorityWeight: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          const reordered = [...issues].sort((a, b) => {
            const pA = res.data.prioritized.find((p) => p.taskId === a.id);
            const pB = res.data.prioritized.find((p) => p.taskId === b.id);
            const scoreA = pA ? pA.urgencyScore + pA.impactScore : (priorityWeight[a.priority] || 1) * 20;
            const scoreB = pB ? pB.urgencyScore + pB.impactScore : (priorityWeight[b.priority] || 1) * 20;
            return scoreB - scoreA;
          });
          onReorderIssues(reordered);
        }
      }
    } catch (err) {
      console.warn('[AI Prioritize]', err);
    } finally {
      setIsPrioritizing(false);
    }
  };

  const getPriorityBadge = (priority: JiraIssue['priority']) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">CRITICAL</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">LOW</span>;
    }
  };

  const getTypeBadge = (type: JiraIssue['type']) => {
    switch (type) {
      case 'Bug':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/30">BUG</span>;
      case 'Epic':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">EPIC</span>;
      case 'Story':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">STORY</span>;
      case 'Refactor':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">REFACTOR</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">TASK</span>;
    }
  };

  const advanceStatus = (issue: JiraIssue, direction: 'next' | 'prev') => {
    const statuses: IssueStatus[] = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];
    const currentIndex = statuses.indexOf(issue.status);
    if (direction === 'next' && currentIndex < statuses.length - 1) {
      const next = statuses[currentIndex + 1];
      if (next === 'Done') {
        triggerCodeCelebration({ particleCount: 45, spread: 70 });
      } else {
        soundFx.playClick(500 + currentIndex * 100, 0.04);
      }
      onUpdateIssueStatus(issue.id, next);
    } else if (direction === 'prev' && currentIndex > 0) {
      const prev = statuses[currentIndex - 1];
      soundFx.playClick(400, 0.04);
      onUpdateIssueStatus(issue.id, prev);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      
      {/* Header & Filter Controls */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Trello className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Jira Sprint Board
              <span className="font-handjet text-lg text-cyan-400 font-bold">
                [{filteredIssues.length} ISSUES]
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Sprint 34: Apex Velocity &middot; Closes in 4 days
            </p>
          </div>
        </div>

        {/* Search, Filters, and View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search key, title, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Assignees</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* AI Prioritize Backlog Button */}
          <button
            onClick={handleAIPrioritize}
            disabled={isPrioritizing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="AI-Assisted Task Prioritization"
          >
            {isPrioritizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className="hidden sm:inline">AI Prioritize</span>
          </button>

          {/* AI Task Generator Quick Launcher */}
          {onOpenTaskGenerator && (
            <button
              onClick={onOpenTaskGenerator}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="AI Task Generator"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">AI Tasks</span>
            </button>
          )}

          {/* View Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'board' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Create Issue */}
          <button
            onClick={onOpenQuickCreate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black text-xs font-bold shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue</span>
          </button>
        </div>
      </div>

      {/* AI Prioritized Alert Notice */}
      {aiPrioritizedNotice && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{aiPrioritizedNotice}</span>
          </div>
          <button
            onClick={() => setAiPrioritizedNotice(null)}
            className="text-xs text-indigo-400 hover:text-white px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {COLUMNS.map((col) => {
            const colIssues = filteredIssues.filter((i) => i.status === col.id);
            const totalColPoints = colIssues.reduce((acc, curr) => acc + curr.storyPoints, 0);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl glass-panel border border-slate-800/80 p-3 min-h-[420px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold uppercase ${col.color}`}>
                      {col.title}
                    </span>
                    <span className="font-handjet text-base text-slate-300 font-bold px-1.5 py-0.2 rounded bg-slate-800/90">
                      {colIssues.length}
                    </span>
                  </div>
                  <span className="font-handjet text-sm text-slate-400">
                    {totalColPoints} pts
                  </span>
                </div>

                {/* Issues List inside Column */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {colIssues.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-slate-500 text-xs font-mono">
                      No issues
                    </div>
                  ) : (
                    colIssues.map((issue) => (
                      <div
                        key={issue.id}
                        onClick={() => {
                          soundFx.playClick(600, 0.02);
                          onSelectTask?.(issue);
                        }}
                        className="glass-panel-interactive rounded-xl p-3.5 border border-slate-800 relative group flex flex-col justify-between cursor-pointer hover:border-cyan-500/40 transition-all"
                      >
                        <div>
                          {/* Top row: Key + Type + Priority */}
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-cyan-400 hover:underline">
                                {issue.key}
                              </span>
                              {getTypeBadge(issue.type)}
                            </div>
                            <span className="font-handjet text-sm font-bold text-purple-300 px-1.5 py-0.2 rounded bg-purple-950/40 border border-purple-800/40">
                              {issue.storyPoints} pts
                            </span>
                          </div>

                          {/* Issue Title */}
                          <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-relaxed mb-2">
                            {issue.title}
                          </h4>

                          {/* Tags, Due Date & Linked PR */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            {issue.dueDate && (
                              <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                <Calendar className="w-2.5 h-2.5 text-cyan-400" />
                                <span>{issue.dueDate}</span>
                              </span>
                            )}
                            {issue.linkedPR && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectPR?.(issue.linkedPR || '');
                                }}
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono hover:bg-emerald-500/20 transition-colors"
                                title="Open Linked GitHub Pull Request"
                              >
                                <GitPullRequest className="w-2.5 h-2.5" />
                                <span>{issue.linkedPR}</span>
                              </button>
                            )}
                            {issue.tags.slice(0, 2).map((t) => (
                              <span key={t} className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Bottom: Assignee + Fast Status Transition Buttons */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <UserAvatar
                              src={issue.assignee.avatar}
                              name={issue.assignee.name}
                              handle={issue.assignee.handle}
                              size="xs"
                              shape="circle"
                              title={`Assignee: ${issue.assignee.name}`}
                            />
                            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                              {issue.assignee.name.split(' ')[0]}
                            </span>
                          </div>

                          {/* Quick Advance Controls */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {col.id !== 'Backlog' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  advanceStatus(issue, 'prev');
                                }}
                                className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                                title="Move status back"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {col.id !== 'Done' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  advanceStatus(issue, 'next');
                                }}
                                className="p-1 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-cyan-100 border border-cyan-800/50"
                                title="Advance status forward"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Table View */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Key</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Linked PR</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredIssues.map((issue) => (
                  <tr 
                    key={issue.id} 
                    onClick={() => onSelectTask?.(issue)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-cyan-400">{issue.key}</td>
                    <td className="py-3 px-4 max-w-xs font-sans-ui text-slate-200 font-medium">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(issue.type)}
                        <span className="truncate">{issue.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-900 text-slate-300 border border-slate-700">
                        {issue.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(issue.priority)}</td>
                    <td className="py-3 px-4 text-slate-400">{issue.dueDate || '-'}</td>
                    <td className="py-3 px-4 font-handjet text-base text-purple-300 font-bold">{issue.storyPoints} pts</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <UserAvatar
                          src={issue.assignee.avatar}
                          name={issue.assignee.name}
                          handle={issue.assignee.handle}
                          size="xs"
                          shape="circle"
                        />
                        <span className="text-slate-300">{issue.assignee.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {issue.linkedPR ? (
                        <span className="text-emerald-400 hover:underline">
                          {issue.linkedPR}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            advanceStatus(issue, 'prev');
                          }}
                          disabled={issue.status === 'Backlog'}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30 border border-slate-800"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            advanceStatus(issue, 'next');
                          }}
                          disabled={issue.status === 'Done'}
                          className="p-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 disabled:opacity-30 border border-cyan-800/50"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
