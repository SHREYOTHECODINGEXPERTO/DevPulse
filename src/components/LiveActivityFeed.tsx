import React from 'react';
import { ActivityEvent, ActivityActionLink } from '../types';
import { 
  Activity, 
  GitPullRequest, 
  GitMerge, 
  GitCommit, 
  Trello, 
  ShieldCheck, 
  Flame, 
  Clock, 
  Sparkles, 
  Radio,
  ExternalLink,
  FolderGit2,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface LiveActivityFeedProps {
  events: ActivityEvent[];
  onSimulateEvent: () => void;
  onSelectKey?: (key: string) => void;
  onSelectAction?: (action: ActivityActionLink) => void;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  events,
  onSimulateEvent,
  onSelectKey,
  onSelectAction,
}) => {
  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'pr_merge':
        return <GitMerge className="w-3.5 h-3.5 text-purple-400" />;
      case 'pr_open':
      case 'pr_review':
        return <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />;
      case 'jira_status':
      case 'jira_create':
        return <Trello className="w-3.5 h-3.5 text-blue-400" />;
      case 'commit_push':
        return <GitCommit className="w-3.5 h-3.5 text-cyan-400" />;
      case 'deploy_success':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const handleActionClick = (evt: ActivityEvent) => {
    soundFx.playClick(600, 0.03);
    if (evt.actionLink) {
      if (onSelectAction) {
        onSelectAction(evt.actionLink);
        return;
      }
      if (evt.actionLink.url && evt.actionLink.type === 'github_url') {
        window.open(evt.actionLink.url, '_blank', 'noopener,noreferrer');
        return;
      }
      if (onSelectKey) {
        onSelectKey(evt.actionLink.target);
        return;
      }
    }
    if (evt.linkKey && onSelectKey) {
      onSelectKey(evt.linkKey);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Live Activity Stream & Webhooks
            </h4>
            <p className="text-[10px] font-mono text-slate-500">Realtime Jira & GitHub event sink</p>
          </div>
        </div>

        {/* Trigger Simulate Event */}
        <button
          onClick={() => {
            soundFx.playClick(650, 0.04);
            onSimulateEvent();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 transition-colors"
          title="Simulate incoming GitHub/Jira webhook event"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Simulate Event</span>
        </button>
      </div>

      {/* Events Stream List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {events.map((evt, idx) => (
          <div
            key={`act-item-${evt.id || 'evt'}-${idx}`}
            className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 mt-0.5 shrink-0">
              {getEventIcon(evt.type)}
            </div>

            <div className="flex-1 space-y-1 font-mono text-xs min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-200 truncate">{evt.title}</span>
                <span className="text-[10px] text-slate-500 shrink-0">{evt.timestamp}</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans-ui line-clamp-2">
                {evt.description}
              </p>

              {/* Actionable Link Badge */}
              {(evt.actionLink || evt.linkKey) && (
                <div className="pt-0.5">
                  <button
                    onClick={() => handleActionClick(evt)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-medium transition-all group shadow-sm"
                  >
                    {evt.actionLink?.type === 'pr' ? (
                      <GitPullRequest className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                    ) : evt.actionLink?.type === 'jira' ? (
                      <Trello className="w-3 h-3 text-blue-400 group-hover:scale-110 transition-transform" />
                    ) : evt.actionLink?.type === 'github_url' ? (
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:scale-110 transition-transform" />
                    ) : (
                      <FolderGit2 className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                    )}
                    <span>{evt.actionLink?.label || `Inspect ${evt.linkKey}`}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

