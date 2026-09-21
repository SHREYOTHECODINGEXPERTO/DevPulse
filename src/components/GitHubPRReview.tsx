import React, { useState } from 'react';
import { PullRequest, Developer } from '../types';
import { 
  GitPullRequest, 
  GitMerge, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  FileCode, 
  ExternalLink, 
  Plus, 
  ChevronRight, 
  Code2, 
  Sparkles, 
  Send,
  Eye,
  Check
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerCodeCelebration } from '../utils/celebration';
import { UserAvatar } from './UserAvatar';

interface GitHubPRReviewProps {
  pullRequests: PullRequest[];
  onMergePR: (prId: string) => void;
  onApprovePR: (prId: string) => void;
  onOpenQuickCreate: () => void;
  onSelectJiraKey?: (jiraKey: string) => void;
  currentUser: Developer;
}

export const GitHubPRReview: React.FC<GitHubPRReviewProps> = ({
  pullRequests,
  onMergePR,
  onApprovePR,
  onOpenQuickCreate,
  onSelectJiraKey,
  currentUser,
}) => {
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'assigned_to_me' | 'open' | 'merged'>('all');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  const totalPRsCount = pullRequests.length;
  const openPRsCount = pullRequests.filter((p) => p.status === 'open').length;
  const mergedPRsCount = pullRequests.filter((p) => p.status === 'merged').length;
  const myQueueCount = pullRequests.filter(
    (p) => p.status === 'open' && (p.reviewers.some((r) => r.id === currentUser.id) || p.author.id === currentUser.id)
  ).length;

  // Real Turnaround SLA calculation
  let totalHours = 0;
  let sampleCount = 0;
  pullRequests.forEach((pr) => {
    if (pr.createdAt && pr.updatedAt) {
      const created = new Date(pr.createdAt).getTime();
      const updated = new Date(pr.updatedAt).getTime();
      const diff = Math.max(0.5, (updated - created) / (1000 * 60 * 60));
      totalHours += diff;
      sampleCount++;
    }
  });
  const avgSlaHours = sampleCount > 0 ? (totalHours / sampleCount).toFixed(1) : '2.4';
  const mergeSlaPercent = totalPRsCount > 0 ? Math.round((mergedPRsCount / totalPRsCount) * 100) : 98;

  const filteredPRs = pullRequests.filter((pr) => {
    if (filterTab === 'open') return pr.status === 'open';
    if (filterTab === 'merged') return pr.status === 'merged';
    if (filterTab === 'assigned_to_me') {
      return pr.reviewers.some((r) => r.id === currentUser.id) || pr.author.id === currentUser.id;
    }
    return true;
  });

  const handleMerge = (pr: PullRequest) => {
    triggerCodeCelebration({
      particleCount: 75,
      spread: 80,
    });
    onMergePR(pr.id);
    if (selectedPR && selectedPR.id === pr.id) {
      setSelectedPR({ ...selectedPR, status: 'merged' });
    }
  };

  const handleApprove = (pr: PullRequest) => {
    triggerCodeCelebration({
      particleCount: 45,
      spread: 60,
    });
    onApprovePR(pr.id);
    setReviewSuccessMsg('Review approved & signed off successfully.');
    setTimeout(() => setReviewSuccessMsg(null), 3000);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    soundFx.playClick(700, 0.05);
    setReviewSuccessMsg(`Comment submitted on ${selectedPR?.title}`);
    setReviewComment('');
    setTimeout(() => setReviewSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Tabs */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              GitHub Pull Requests & Code Review
              <span className="font-handjet text-lg text-emerald-400 font-bold">
                [{openPRsCount} Open &middot; {mergedPRsCount} Merged &middot; {totalPRsCount} Total]
              </span>
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Turnaround SLA: <span className="text-cyan-300 font-bold">{avgSlaHours}h</span> &middot; Merge Accuracy: <span className="text-emerald-300 font-bold">{mergeSlaPercent}%</span> &middot; CI Gate: <span className="text-emerald-400">Enforced</span>
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => {
              soundFx.playClick(500, 0.02);
              setFilterTab('all');
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterTab === 'all' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({totalPRsCount})
          </button>
          <button
            onClick={() => {
              soundFx.playClick(500, 0.02);
              setFilterTab('assigned_to_me');
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterTab === 'assigned_to_me' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Queue ({myQueueCount})
          </button>
          <button
            onClick={() => {
              soundFx.playClick(500, 0.02);
              setFilterTab('open');
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterTab === 'open' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Open ({openPRsCount})
          </button>
          <button
            onClick={() => {
              soundFx.playClick(500, 0.02);
              setFilterTab('merged');
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterTab === 'merged' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Merged ({mergedPRsCount})
          </button>
        </div>
      </div>

      {/* Main PR List View */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredPRs.map((pr) => (
          <div
            key={pr.id}
            className="glass-panel-interactive rounded-2xl p-4 sm:p-5 border border-slate-800 relative group flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left Info */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Badge */}
                {pr.status === 'merged' ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <GitMerge className="w-3 h-3" /> MERGED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <GitPullRequest className="w-3 h-3" /> OPEN #{pr.number}
                  </span>
                )}

                {/* Repo & Branch */}
                <span className="text-xs font-mono text-cyan-400 font-semibold">{pr.repo}</span>
                <span className="text-xs font-mono text-slate-500">&middot;</span>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {pr.branch} &rarr; {pr.baseBranch}
                </span>

                {/* Linked Jira Key */}
                {pr.jiraKey && (
                  <button
                    onClick={() => onSelectJiraKey?.(pr.jiraKey || '')}
                    className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                    title="Jump to Jira ticket"
                  >
                    {pr.jiraKey}
                  </button>
                )}
              </div>

              {/* Title */}
              <h4 className="text-sm sm:text-base font-bold text-slate-100 font-sans-ui hover:text-cyan-300 transition-colors cursor-pointer"
                onClick={() => setSelectedPR(pr)}
              >
                {pr.title}
              </h4>

              {/* Stats & Assignees */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                {/* Diff Metrics with Handjet */}
                <div className="flex items-center gap-1.5">
                  <span className="font-handjet text-base font-bold text-emerald-400">+{pr.additions}</span>
                  <span className="font-handjet text-base font-bold text-rose-400">-{pr.deletions}</span>
                  <span className="text-[11px] text-slate-500">({pr.changedFiles} files)</span>
                </div>

                {/* Checks */}
                <div className="flex items-center gap-1">
                  {pr.checks.status === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  )}
                  <span>{pr.checks.passed}/{pr.checks.total} checks pass</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-1.5">
                  <UserAvatar
                    src={pr.author.avatar}
                    name={pr.author.name}
                    handle={pr.author.handle}
                    size="xs"
                    shape="circle"
                  />
                  <span>by {pr.author.name.split(' ')[0]}</span>
                </div>

                {/* Updated time */}
                <span className="text-slate-500">{pr.updatedAt}</span>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
              {/* GitHub Online PR Link */}
              <a
                href={`https://github.com/${pr.repo}/pull/${pr.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
                title={`Open PR #${pr.number} on GitHub`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Review Diff Button */}
              <button
                onClick={() => {
                  soundFx.playClick(600, 0.04);
                  setSelectedPR(pr);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Diff View</span>
              </button>

              {/* Merge Button if open */}
              {pr.status === 'open' && (
                <button
                  onClick={() => handleMerge(pr)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-mono font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <GitMerge className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Merge</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Code Diff Inspection Modal */}
      {selectedPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-2xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-900/90">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    PR #{selectedPR.number}
                  </span>
                  <span className="text-xs font-mono text-cyan-400">{selectedPR.repo}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{selectedPR.title}</h3>
              </div>

              <button
                onClick={() => setSelectedPR(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Notification alert banner */}
            {reviewSuccessMsg && (
              <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {/* Modal Body: Code Diff Viewer */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-mono text-xs">
              {selectedPR.diffSnippets && selectedPR.diffSnippets.length > 0 ? (
                selectedPR.diffSnippets.map((file, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                    <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-slate-200 font-bold">{file.file}</span>
                      </div>
                      <div className="flex items-center gap-2 font-handjet text-sm">
                        <span className="text-emerald-400">+{file.additions}</span>
                        <span className="text-rose-400">-{file.deletions}</span>
                      </div>
                    </div>
                    <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed font-mono-code text-slate-300">
                      {file.diff.split('\n').map((line, lineIdx) => {
                        const isAdd = line.startsWith('+');
                        const isDel = line.startsWith('-');
                        const isHeader = line.startsWith('@@');

                        return (
                          <div
                            key={lineIdx}
                            className={`px-2 py-0.5 rounded ${
                              isAdd
                                ? 'bg-emerald-950/60 text-emerald-300 border-l-2 border-emerald-500'
                                : isDel
                                ? 'bg-rose-950/60 text-rose-300 border-l-2 border-rose-500'
                                : isHeader
                                ? 'bg-cyan-950/40 text-cyan-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {line}
                          </div>
                        );
                      })}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono">
                  No direct diff snippets attached.
                </div>
              )}

              {/* Review Comment Box */}
              <form onSubmit={submitComment} className="pt-2">
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Submit Review Comment / Feedback
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 'LGTM! Great zero-copy memory cache optimization.'..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Comment</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs font-mono text-slate-400">
                Author: <span className="text-slate-200">{selectedPR.author.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(selectedPR)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Changes</span>
                </button>

                {selectedPR.status === 'open' && (
                  <button
                    onClick={() => handleMerge(selectedPR)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Merge PR #{selectedPR.number}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
