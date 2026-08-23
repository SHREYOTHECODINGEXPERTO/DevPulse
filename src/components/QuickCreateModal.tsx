import React, { useState } from 'react';
import { JiraIssue, PullRequest, Developer, IssueType, IssuePriority } from '../types';
import { Trello, GitPullRequest, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerCodeCelebration } from '../utils/celebration';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateJiraIssue: (issue: Partial<JiraIssue>) => void;
  onCreatePR: (pr: Partial<PullRequest>) => void;
  currentUser: Developer;
  teamMembers: Developer[];
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateJiraIssue,
  onCreatePR,
  currentUser,
  teamMembers,
}) => {
  const [activeType, setActiveType] = useState<'jira' | 'pr'>('jira');
  
  // Jira Form State
  const [jiraTitle, setJiraTitle] = useState('');
  const [jiraType, setJiraType] = useState<IssueType>('Story');
  const [jiraPriority, setJiraPriority] = useState<IssuePriority>('High');
  const [jiraPoints, setJiraPoints] = useState(5);
  const [jiraAssigneeId, setJiraAssigneeId] = useState(currentUser.id);
  const [jiraTags, setJiraTags] = useState('performance, architecture');
  const [jiraDesc, setJiraDesc] = useState('');

  // PR Form State
  const [prTitle, setPrTitle] = useState('');
  const [prRepo, setPrRepo] = useState('devpulse/telemetry-core');
  const [prBranch, setPrBranch] = useState('feat/apex-latency-opt');
  const [prJiraKey, setPrJiraKey] = useState('DEV-1024');

  if (!isOpen) return null;

  const handleJiraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jiraTitle.trim()) return;

    const assignee = teamMembers.find((m) => m.id === jiraAssigneeId) || currentUser;
    onCreateJiraIssue({
      title: jiraTitle,
      type: jiraType,
      priority: jiraPriority,
      storyPoints: Number(jiraPoints),
      assignee,
      reporter: currentUser,
      sprint: 'Sprint 34: Apex Velocity',
      tags: jiraTags.split(',').map((t) => t.trim()).filter(Boolean),
      description: jiraDesc || 'Task scoped for Apex Velocity sprint cycle.',
      status: 'Todo',
    });

    triggerCodeCelebration({ particleCount: 45, spread: 65 });
    onClose();
  };

  const handlePRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prTitle.trim()) return;

    onCreatePR({
      title: prTitle,
      repo: prRepo,
      branch: prBranch,
      baseBranch: 'main',
      author: currentUser,
      reviewers: teamMembers.filter((m) => m.id !== currentUser.id).slice(0, 2),
      status: 'open',
      checks: { passed: 14, total: 14, status: 'success' },
      additions: 180,
      deletions: 24,
      changedFiles: 4,
      commentsCount: 0,
      jiraKey: prJiraKey || undefined,
    });

    triggerCodeCelebration({ particleCount: 50, spread: 75 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl glass-panel rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Type Selector */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => {
                soundFx.playClick(500, 0.03);
                setActiveType('jira');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeType === 'jira'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trello className="w-3.5 h-3.5" />
              <span>Create Jira Issue</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick(600, 0.03);
                setActiveType('pr');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeType === 'pr'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Open GitHub PR</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        {activeType === 'jira' ? (
          <form onSubmit={handleJiraSubmit} className="p-5 space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">Issue Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Implement distributed rate-limiting ring buffer..."
                value={jiraTitle}
                onChange={(e) => setJiraTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Issue Type</label>
                <select
                  value={jiraType}
                  onChange={(e) => setJiraType(e.target.value as IssueType)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Story">Story</option>
                  <option value="Bug">Bug</option>
                  <option value="Task">Task</option>
                  <option value="Epic">Epic</option>
                  <option value="Refactor">Refactor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Priority</label>
                <select
                  value={jiraPriority}
                  onChange={(e) => setJiraPriority(e.target.value as IssuePriority)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Story Points</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={jiraPoints}
                  onChange={(e) => setJiraPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Assignee</label>
                <select
                  value={jiraAssigneeId}
                  onChange={(e) => setJiraAssigneeId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={jiraTags}
                  onChange={(e) => setJiraTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Description / Spec</label>
              <textarea
                rows={3}
                placeholder="Technical requirements and acceptance criteria..."
                value={jiraDesc}
                onChange={(e) => setJiraDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Issue</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePRSubmit} className="p-5 space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-bold">Pull Request Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. feat(gateway): token rotation singleflight cache"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Target Repository</label>
                <select
                  value={prRepo}
                  onChange={(e) => setPrRepo(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="devpulse/telemetry-core">devpulse/telemetry-core</option>
                  <option value="devpulse/gateway-proxy">devpulse/gateway-proxy</option>
                  <option value="devpulse/design-system">devpulse/design-system</option>
                  <option value="devpulse/web-client">devpulse/web-client</option>
                  <option value="devpulse/api-service">devpulse/api-service</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={prBranch}
                  onChange={(e) => setPrBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Link to Jira Issue Key (optional)</label>
              <input
                type="text"
                placeholder="e.g. DEV-1024"
                value={prJiraKey}
                onChange={(e) => setPrJiraKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Open Pull Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
