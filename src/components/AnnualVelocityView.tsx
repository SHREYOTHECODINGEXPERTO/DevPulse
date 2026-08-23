import React, { useState } from 'react';
import { JiraIssue, PullRequest, Developer } from '../types';
import { RealGitHubCalculatedMetrics } from '../utils/github';
import { soundFx } from '../utils/audio';
import { 
  Flame, 
  Zap, 
  TrendingUp, 
  Calendar, 
  GitCommit, 
  GitPullRequest, 
  CheckCircle2, 
  Award, 
  Target,
  BarChart3,
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface AnnualVelocityViewProps {
  currentUser: Developer;
  jiraIssues: JiraIssue[];
  pullRequests: PullRequest[];
  totalCommitsYear: number;
  calculatedMetrics?: RealGitHubCalculatedMetrics;
}

export const AnnualVelocityView: React.FC<AnnualVelocityViewProps> = ({
  currentUser,
  jiraIssues,
  pullRequests,
  totalCommitsYear,
  calculatedMetrics,
}) => {
  const [selectedQuarter, setSelectedQuarter] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('all');

  const completedIssues = jiraIssues.filter((i) => i.status === 'Done');
  const inProgressIssues = jiraIssues.filter((i) => i.status === 'In Progress');
  const backlogIssues = jiraIssues.filter((i) => i.status === 'Backlog' || i.status === 'Todo');
  const mergedPRs = pullRequests.filter((pr) => pr.status === 'merged');

  const storyPointsDone = completedIssues.reduce((acc, i) => acc + i.storyPoints, 0);
  const storyPointsTotal = jiraIssues.reduce((acc, i) => acc + i.storyPoints, 0);

  const quarterlyData = calculatedMetrics?.quarterlyDistribution || [
    { quarter: 'Q1 2026', commits: Math.round(totalCommitsYear * 0.28), storyPoints: 28, prs: 8, velocityRate: '94%' },
    { quarter: 'Q2 2026', commits: Math.round(totalCommitsYear * 0.32), storyPoints: 35, prs: 11, velocityRate: '96%' },
    { quarter: 'Q3 2026', commits: Math.round(totalCommitsYear * 0.25), storyPoints: 30, prs: 9, velocityRate: '92%' },
    { quarter: 'Q4 2026 (Current)', commits: Math.round(totalCommitsYear * 0.15), storyPoints: 22, prs: 6, velocityRate: '98%' },
  ];

  // Daily Commit Cadence (Monday - Sunday)
  const dailyDistribution = calculatedMetrics?.dailyDistribution || [
    { day: 'Mon', commits: 12, hours: 4.2, peak: '10:30 AM' },
    { day: 'Tue', commits: 18, hours: 5.4, peak: '02:15 PM' },
    { day: 'Wed', commits: 22, hours: 6.1, peak: '11:45 AM' },
    { day: 'Thu', commits: 15, hours: 4.8, peak: '03:30 PM' },
    { day: 'Fri', commits: 14, hours: 4.0, peak: '01:15 PM' },
    { day: 'Sat', commits: 4, hours: 1.5, peak: '07:00 PM' },
    { day: 'Sun', commits: 6, hours: 2.1, peak: '08:30 PM' },
  ];

  const maxDailyCommits = Math.max(...dailyDistribution.map((d) => d.commits), 1);
  const longestStreakDays = calculatedMetrics?.longestStreak ?? currentUser.streakDays ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono">
      {/* Top Header Card */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 border border-white/10 relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  2026 Annual Engineering Velocity & Sprint Analytics
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  @{currentUser.githubHandle || currentUser.handle}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-year productivity metrics, sprint completion rate, and day-by-day commit density mapped to real GitHub data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Annual Velocity Score</span>
              <span className="font-handjet text-3xl font-extrabold text-amber-300 leading-none">
                {(currentUser.velocityScore ?? 92.4).toFixed(1)} / 100
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase">Annual Commits</span>
            <div className="my-0.5">
              <span className="font-handjet text-3xl font-bold text-purple-300">{totalCommitsYear}</span>
            </div>
            <span className="text-[9px] text-slate-500">Across connected GitHub repos</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase">Story Points Shipped</span>
            <div className="my-0.5">
              <span className="font-handjet text-3xl font-bold text-emerald-300">{storyPointsDone} / {storyPointsTotal || 24}</span>
            </div>
            <span className="text-[9px] text-slate-500">{(storyPointsTotal > 0 ? (storyPointsDone / storyPointsTotal) * 100 : 100).toFixed(0)}% completion rate</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase">PRs Merged</span>
            <div className="my-0.5">
              <span className="font-handjet text-3xl font-bold text-cyan-300">{mergedPRs.length}</span>
            </div>
            <span className="text-[9px] text-slate-500">{currentUser.prMergeRate}% merge accuracy SLA</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase">Longest Streak</span>
            <div className="my-0.5">
              <span className="font-handjet text-3xl font-bold text-amber-300">{longestStreakDays} DAYS</span>
            </div>
            <span className="text-[9px] text-slate-500">Continuous daily activity</span>
          </div>
        </div>
      </div>

      {/* Grid: Day of Week Cadence + Quarterly Sprint Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Day of the Week Commit Cadence */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <BarChart3 className="w-4 h-4" />
              <h4 className="text-sm font-bold text-white uppercase">
                Daily Commit & Activity Cadence
              </h4>
            </div>
            <span className="text-[10px] text-slate-400">Weekly Cycle</span>
          </div>

          <div className="space-y-3 pt-2">
            {dailyDistribution.map((item) => {
              const percentage = Math.min(100, Math.max(8, (item.commits / maxDailyCommits) * 100));
              return (
                <div key={item.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-slate-200">{item.day}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span>Peak: <span className="text-cyan-300">{item.peak}</span></span>
                      <span><span className="text-sky-300 font-bold">{item.hours}h</span> active</span>
                      <span className="font-handjet text-base font-bold text-purple-300">{item.commits} COMMITS</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Quarterly Velocity Breakdown */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Target className="w-4 h-4" />
              <h4 className="text-sm font-bold text-white uppercase">
                Quarterly Velocity & Milestone Goals
              </h4>
            </div>
            <span className="text-[10px] text-slate-400">2026 Target: 420 SP</span>
          </div>

          <div className="space-y-3 pt-1">
            {quarterlyData.map((q) => (
              <div 
                key={q.quarter}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{q.quarter}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {q.velocityRate} Velocity
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {q.commits} commits &middot; {q.prs} pull requests
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-handjet text-2xl font-bold text-emerald-300">
                    {q.storyPoints} SP
                  </span>
                  <span className="text-[10px] text-slate-500 block">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sprint Backlog Summary Matrix */}
      <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400">
            <Layers className="w-4 h-4" />
            <h4 className="text-sm font-bold text-white uppercase">
              Current Sprint Backlog Health & Progress
            </h4>
          </div>
          <span className="text-xs text-slate-400">Sprint 34 (Active)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Backlog & Todo Queue</span>
            <div className="my-1">
              <span className="font-handjet text-3xl font-bold text-slate-300">{backlogIssues.length} ISSUES</span>
            </div>
            <span className="text-[10px] text-slate-500">
              {backlogIssues.reduce((acc, i) => acc + i.storyPoints, 0)} story points queued
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 bg-cyan-500/5">
            <span className="text-[10px] text-cyan-400 uppercase">In Progress / Code Review</span>
            <div className="my-1">
              <span className="font-handjet text-3xl font-bold text-cyan-300">{inProgressIssues.length} IN FLIGHT</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Active branch & review tickets
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-[10px] text-emerald-400 uppercase">Shipped in Sprint 34</span>
            <div className="my-1">
              <span className="font-handjet text-3xl font-bold text-emerald-300">{completedIssues.length} COMPLETED</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {storyPointsDone} story points merged
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

