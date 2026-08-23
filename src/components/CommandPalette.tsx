import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trello, 
  GitPullRequest, 
  Activity, 
  GitCommit, 
  PlayCircle, 
  Flame, 
  Volume2, 
  RefreshCw, 
  Plus, 
  Terminal,
  ArrowRight
} from 'lucide-react';
import { JiraIssue, PullRequest } from '../types';
import { NavTab } from './Navbar';
import { soundFx } from '../utils/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenQuickCreate: () => void;
  onManualSync: () => void;
  onToggleSound: () => void;
  onToggleFocusMode: () => void;
  jiraIssues: JiraIssue[];
  pullRequests: PullRequest[];
  onSelectJiraKey: (key: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenQuickCreate,
  onManualSync,
  onToggleSound,
  onToggleFocusMode,
  jiraIssues,
  pullRequests,
  onSelectJiraKey,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredIssues = jiraIssues.filter(
    (i) => i.title.toLowerCase().includes(query.toLowerCase()) || i.key.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPRs = pullRequests.filter(
    (p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.repo.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl glass-panel rounded-2xl border border-slate-700/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <Search className="w-4 h-4 text-cyan-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, Jira key (DEV-1024), PR #, or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results / Command Items */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3 font-mono text-xs">
          
          {/* Quick Actions */}
          <div>
            <span className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Navigation & Actions
            </span>
            <div className="mt-1 space-y-1">
              <button
                onClick={() => {
                  onNavigateTab('dashboard');
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Go to Overview Dashboard</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  onNavigateTab('jira');
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-blue-500/20 hover:text-blue-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Trello className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open Jira Sprint Kanban Board</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  onNavigateTab('prs');
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inspect GitHub Pull Requests & Diffs</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  onOpenQuickCreate();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-purple-500/20 hover:text-purple-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-purple-400" />
                  <span>Create New Jira Issue or Pull Request</span>
                </div>
                <span className="text-[10px] text-purple-400 font-bold">+ New</span>
              </button>

              <button
                onClick={() => {
                  onManualSync();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Trigger Realtime Webhook Sync</span>
                </div>
                <span className="text-[10px] text-slate-500">Instant</span>
              </button>
            </div>
          </div>

          {/* Jira Tickets Found */}
          {filteredIssues.length > 0 && (
            <div>
              <span className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Jira Issues ({filteredIssues.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredIssues.slice(0, 4).map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => {
                      onSelectJiraKey(issue.key);
                      onNavigateTab('jira');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-blue-500/20 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-cyan-400">{issue.key}</span>
                      <span className="truncate">{issue.title}</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-400 whitespace-nowrap ml-2">
                      {issue.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pull Requests Found */}
          {filteredPRs.length > 0 && (
            <div>
              <span className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Pull Requests ({filteredPRs.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredPRs.slice(0, 4).map((pr) => (
                  <button
                    key={pr.id}
                    onClick={() => {
                      onNavigateTab('prs');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-emerald-500/20 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-emerald-400">PR #{pr.number}</span>
                      <span className="truncate">{pr.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                      +{pr.additions} -{pr.deletions}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span>Navigate with ↵ Enter &middot; Dismiss with ESC</span>
          <span className="text-cyan-400">DevPulse Search Index</span>
        </div>
      </div>
    </div>
  );
};
