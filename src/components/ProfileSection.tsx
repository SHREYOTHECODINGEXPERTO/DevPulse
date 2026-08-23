import React, { useState, useEffect } from 'react';
import { 
  Developer, 
  JiraIssue, 
  PullRequest 
} from '../types';
import { 
  Flame, 
  Zap, 
  GitMerge, 
  Clock, 
  Target, 
  Award, 
  Code2, 
  Terminal, 
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerCodeCelebration } from '../utils/celebration';
import { FUNNY_STATUSES } from '../utils/memeAvatars';

interface ProfileSectionProps {
  developer: Developer;
  onUpdateStatus: (status: Developer['status']) => void;
  onUpdateRole?: (role: string) => void;
  onUpdateTeam?: (team: string) => void;
  jiraIssues: JiraIssue[];
  pullRequests: PullRequest[];
  onOpenLoginModal?: () => void;
  onFocusTimerChange?: (isActive: boolean) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  developer,
  onUpdateStatus,
  onUpdateRole,
  onUpdateTeam,
  jiraIssues,
  pullRequests,
  onOpenLoginModal,
  onFocusTimerChange,
}) => {
  // Focus Pomodoro Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  
  // Quick inline edit state
  const [isEditingRoleTeam, setIsEditingRoleTeam] = useState(false);
  const [roleInput, setRoleInput] = useState(developer.role);
  const [teamInput, setTeamInput] = useState(developer.team);

  // Sync inputs when developer changes
  useEffect(() => {
    setRoleInput(developer.role);
    setTeamInput(developer.team);
  }, [developer.role, developer.team]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      if (onFocusTimerChange) onFocusTimerChange(false);
      triggerCodeCelebration({ particleCount: 50, spread: 70 });
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft, onFocusTimerChange]);

  const toggleTimer = () => {
    soundFx.playClick(750, 0.05);
    const next = !timerRunning;
    setTimerRunning(next);
    if (onFocusTimerChange) onFocusTimerChange(next);
  };

  const resetTimer = () => {
    soundFx.playClick(400, 0.05);
    setTimerRunning(false);
    setSecondsLeft(25 * 60);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleSaveInlineRoleTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateRole && roleInput.trim()) {
      onUpdateRole(roleInput.trim());
    }
    if (onUpdateTeam && teamInput.trim()) {
      onUpdateTeam(teamInput.trim());
    }
    setIsEditingRoleTeam(false);
    triggerCodeCelebration({ particleCount: 35, spread: 50 });
  };

  // Combine default classic statuses with funny/modern statuses
  const availableStatuses: Developer['status'][] = Array.from(
    new Set([
      'In the Zone',
      'Reviewing Code',
      'Pairing',
      'In Sprint Planning',
      'AFK',
      ...FUNNY_STATUSES,
      developer.status,
    ])
  );

  // Dynamic calculations
  const totalUserStoryPoints = jiraIssues
    .filter((i) => i.assignee.id === developer.id)
    .reduce((acc, curr) => acc + curr.storyPoints, 0);

  const completedUserPoints = jiraIssues
    .filter((i) => i.assignee.id === developer.id && i.status === 'Done')
    .reduce((acc, curr) => acc + curr.storyPoints, 0);

  const sprintProgressPercent = totalUserStoryPoints > 0 
    ? Math.round((completedUserPoints / totalUserStoryPoints) * 100) 
    : 0;

  const fallbackGhAvatar = `https://github.com/${(developer.githubHandle || developer.handle || 'developer').trim().replace(/^@/, '')}.png`;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      
      {/* 1. Developer Profile Card & Holographic ID */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative group cursor-pointer" onClick={onOpenLoginModal} title="Click to edit profile picture">
                <img
                  src={developer.avatar || fallbackGhAvatar}
                  alt={developer.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20 bg-slate-900"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackGhAvatar;
                  }}
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </span>
                <div className="absolute inset-0 bg-slate-950/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Edit2 className="w-4 h-4 text-cyan-300" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-100 tracking-tight">{developer.name}</h3>
                  <button
                    onClick={onOpenLoginModal}
                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 shadow-sm"
                    title="Connect Real GitHub Account or Custom Identity"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                    <span>CONNECT GITHUB / EDIT</span>
                  </button>
                </div>
                <p className="text-xs font-mono text-cyan-300">@{developer.handle}</p>
                
                {/* Role and Team with live editing */}
                {isEditingRoleTeam ? (
                  <form onSubmit={handleSaveInlineRoleTeam} className="mt-1 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      placeholder="Role / Title"
                      className="px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500 text-[10px] font-mono text-cyan-200 w-32"
                    />
                    <span className="text-slate-500 text-[10px]">&middot;</span>
                    <input
                      type="text"
                      value={teamInput}
                      onChange={(e) => setTeamInput(e.target.value)}
                      placeholder="Team / Squad"
                      className="px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500 text-[10px] font-mono text-slate-200 w-28"
                    />
                    <button
                      type="submit"
                      className="p-1 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-[10px]"
                      title="Save"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingRoleTeam(false)}
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px]"
                      title="Cancel"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <div 
                    onClick={() => setIsEditingRoleTeam(true)}
                    className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 cursor-pointer hover:text-cyan-300 transition-colors group"
                    title="Click to edit designation & squad"
                  >
                    <span className="text-slate-300 font-semibold">{developer.role}</span>
                    <span>&middot;</span>
                    <span>{developer.team}</span>
                    <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity ml-0.5" />
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Presence Status Switcher */}
            <div className="relative">
              <button
                id="dev-status-pill-btn"
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill border border-emerald-500/30 text-emerald-300 text-xs font-mono hover:bg-emerald-500/10 transition-colors"
                title="Change presence status"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="max-w-[120px] truncate">{developer.status}</span>
              </button>

              {statusMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 max-h-72 overflow-y-auto rounded-xl glass-panel border border-slate-700 p-1.5 shadow-2xl z-30 animate-in fade-in zoom-in-95">
                  <p className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>Set Presence Status</span>
                    <span className="text-emerald-400 text-[9px]">Live Update</span>
                  </p>
                  {availableStatuses.map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateStatus(st);
                        setStatusMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                        developer.status === st
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{st}</span>
                      {developer.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-300/90 mt-3.5 leading-relaxed font-sans-ui">
            {developer.bio}
          </p>
        </div>

        {/* Real Skill Proficiency & Tech Stack Breakdown */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-cyan-300 font-semibold uppercase text-[10px]">
              <Code2 className="w-3.5 h-3.5" />
              Verified Stack Proficiency:
            </span>
            {developer.peakCodingWindow && (
              <span className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 truncate max-w-[150px]" title={developer.peakCodingWindow}>
                Peak: {developer.peakCodingWindow.split('(')[0]}
              </span>
            )}
          </div>

          {developer.skillProficiencies && developer.skillProficiencies.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5">
              {developer.skillProficiencies.slice(0, 6).map((skill) => (
                <div
                  key={skill.name}
                  className="px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px] font-mono group hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: skill.color || '#38bdf8' }}
                    />
                    <span className="text-slate-200 truncate font-semibold">{skill.name}</span>
                  </div>
                  <span className="font-handjet text-sm font-bold text-cyan-300 ml-1">
                    {skill.percentage}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {developer.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-cyan-500/30 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Sprint Velocity & Core Metrics (Handjet Typography) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 relative flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono uppercase text-slate-300 tracking-wider">
              Sprint 34 Velocity & Progress
            </h4>
          </div>
          <span className="font-handjet text-lg text-cyan-300 font-bold">
            {completedUserPoints}/{totalUserStoryPoints} PTS ({sprintProgressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900/90 rounded-full h-3 p-0.5 border border-slate-800 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-500 shadow-sm shadow-cyan-400/50"
            style={{ width: `${sprintProgressPercent}%` }}
          />
        </div>

        {/* Metric Grid with Handjet numbers */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800/80">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[11px] font-mono text-amber-400 mb-0.5">
              <Flame className="w-3 h-3" />
              <span>STREAK</span>
            </div>
            <span className="font-handjet text-3xl font-extrabold text-amber-300 tracking-wider">
              {developer.streakDays}
            </span>
            <p className="text-[10px] font-mono text-slate-400">days active</p>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[11px] font-mono text-emerald-400 mb-0.5">
              <GitMerge className="w-3 h-3" />
              <span>MERGE SLA</span>
            </div>
            <span className="font-handjet text-3xl font-extrabold text-emerald-300 tracking-wider">
              {developer.prMergeRate}%
            </span>
            <p className="text-[10px] font-mono text-slate-400">PR accuracy</p>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[11px] font-mono text-purple-400 mb-0.5">
              <Zap className="w-3 h-3" />
              <span>VELOCITY</span>
            </div>
            <span className="font-handjet text-3xl font-extrabold text-purple-300 tracking-wider">
              {developer.velocityScore}
            </span>
            <p className="text-[10px] font-mono text-slate-400">pts index</p>
          </div>
        </div>
      </div>

      {/* 3. Deep Work & Focus State Timer (Flow Engine) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 relative flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-mono uppercase text-slate-300 tracking-wider">
                Deep Work Flow Engine
              </h4>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
              timerRunning 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' 
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}>
              {timerRunning ? 'FOCUS BLOCK ACTIVE' : 'READY TO SPRINT'}
            </span>
          </div>

          {/* Handjet Large Countdown */}
          <div className="flex items-center justify-center py-2">
            <span className={`font-handjet text-5xl font-black tracking-widest ${
              timerRunning ? 'text-amber-300' : 'text-slate-200'
            }`}>
              {formatTimer(secondsLeft)}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400">
            <span>Today: </span>
            <span className="font-handjet text-base text-cyan-300 font-bold">{developer.focusMinutesToday}m</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="pomodoro-toggle-btn"
              onClick={toggleTimer}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                timerRunning
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20'
              }`}
            >
              {timerRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{timerRunning ? 'Pause' : 'Start Sprint'}</span>
            </button>

            <button
              id="pomodoro-reset-btn"
              onClick={resetTimer}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
              title="Reset Pomodoro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
