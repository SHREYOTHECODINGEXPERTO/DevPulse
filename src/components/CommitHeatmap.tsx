import React, { useState } from 'react';
import { CommitActivity, Developer, GitHubRealRepo } from '../types';
import { GitCommit, Flame, Calendar, BarChart2, Filter, Zap, Code, Github, ExternalLink } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface CommitHeatmapProps {
  heatmapData: CommitActivity[];
  totalCommits: number;
  currentUser?: Developer;
  commitsToday?: number;
  activeRepos?: GitHubRealRepo[];
}

export const CommitHeatmap: React.FC<CommitHeatmapProps> = ({
  heatmapData,
  totalCommits,
  currentUser,
  commitsToday = 4,
  activeRepos = [],
}) => {
  const [hoveredDay, setHoveredDay] = useState<CommitActivity | null>(null);

  const getCellColor = (level: CommitActivity['level']) => {
    switch (level) {
      case 4:
        return 'bg-emerald-400 hover:bg-emerald-300 shadow-sm shadow-emerald-400/50';
      case 3:
        return 'bg-emerald-600 hover:bg-emerald-500';
      case 2:
        return 'bg-emerald-800 hover:bg-emerald-700';
      case 1:
        return 'bg-emerald-950 border border-emerald-800/40 hover:bg-emerald-900';
      default:
        return 'bg-slate-900/80 border border-slate-800 hover:bg-slate-800';
    }
  };

  // Group 365 days into 52/53 weeks (columns of 7)
  const weeks: CommitActivity[][] = [];
  let currentWeek: CommitActivity[] = [];

  heatmapData.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === heatmapData.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const handle = currentUser?.githubHandle || currentUser?.handle || 'developer';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                GitHub Contribution & Velocity Heatmap
              </h3>
              <a
                href={`https://github.com/${handle}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 flex items-center gap-1 transition-colors"
              >
                <span>@{handle}</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              52-Week real continuous integration matrix &bull;{' '}
              <span className="font-handjet text-base text-purple-300 font-bold">
                {totalCommits} COMMITS IN 2026
              </span>
            </p>
          </div>
        </div>

        {/* Quick Highlights with Handjet */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block">CURRENT STREAK</span>
            <span className="font-handjet text-xl font-bold text-amber-300">
              {currentUser?.streakDays ?? 0} DAYS
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 block">COMMITS TODAY</span>
            <span className="font-handjet text-xl font-bold text-emerald-300">
              {commitsToday ?? 0} COMMITS
            </span>
          </div>
        </div>
      </div>

      {/* Main Heatmap Matrix Card */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        
        {/* Tooltip & Status Banner */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 h-6">
          {hoveredDay ? (
            <div className="flex items-center gap-2 text-cyan-300 animate-in fade-in duration-100">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-bold">{hoveredDay.count} contributions</span>
              <span>on {new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          ) : (
            <span className="text-slate-500">Hover over any day node to inspect commit activity</span>
          )}

          {/* Level Legend */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-slate-800" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950 border border-emerald-800/40" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-800" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-xs shadow-emerald-400/50" />
            <span className="text-[10px]">More</span>
          </div>
        </div>

        {/* Matrix Grid Canvas */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex gap-1 min-w-[720px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    onMouseEnter={() => {
                      soundFx.playClick(400 + day.count * 40, 0.02);
                      setHoveredDay(day);
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-3 h-3 rounded-[3px] transition-transform duration-100 hover:scale-125 cursor-pointer ${getCellColor(
                      day.level
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Velocity & Productive Hours Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-bold">Peak Coding Windows</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>09:00 - 12:30 (Morning Flow)</span>
                <span className="font-handjet text-sm text-cyan-300 font-bold">48%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: '48%' }} />
              </div>

              <div className="flex justify-between text-slate-400 pt-1">
                <span>14:00 - 18:00 (Architecture)</span>
                <span className="font-handjet text-sm text-purple-300 font-bold">36%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: '36%' }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-mono">
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="font-bold">Code Churn & Quality</span>
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Lines Added:</span>
                <span className="font-handjet text-base text-emerald-400 font-bold">
                  +{totalCommits * 18 + 240}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lines Removed:</span>
                <span className="font-handjet text-base text-rose-400 font-bold">
                  -{Math.floor((totalCommits * 18 + 240) * 0.42)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Refactor Ratio:</span>
                <span className="font-handjet text-base text-purple-300 font-bold">1:2.4 (Optimal)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-mono">
              <Flame className="w-3.5 h-3.5" />
              <span className="font-bold">Active Repositories</span>
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-300">
              {activeRepos.length > 0 ? (
                activeRepos.slice(0, 3).map((repo, idx) => (
                  <div key={repo.id} className="flex justify-between">
                    <span className="truncate max-w-[180px]">{repo.name}</span>
                    <span className="font-handjet text-sm text-cyan-300">{[42, 28, 18][idx] || 15}%</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="truncate">devpulse/telemetry-core</span>
                    <span className="font-handjet text-sm text-cyan-300">42%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="truncate">devpulse/gateway-proxy</span>
                    <span className="font-handjet text-sm text-cyan-300">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="truncate">devpulse/design-system</span>
                    <span className="font-handjet text-sm text-cyan-300">18%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
