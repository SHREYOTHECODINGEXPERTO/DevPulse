import React, { useState } from 'react';
import { 
  Activity, 
  Trello, 
  GitPullRequest, 
  GitCommit, 
  PlayCircle, 
  Search, 
  Plus, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Terminal, 
  Layers, 
  ChevronDown, 
  Boxes, 
  TrendingUp, 
  Github,
  LogOut
} from 'lucide-react';
import { Developer } from '../types';
import { soundFx } from '../utils/audio';
import { UserAvatar } from './UserAvatar';

export type NavTab = 'dashboard' | 'projects' | 'jira' | 'prs' | 'heatmap' | 'velocity' | 'integrations' | 'cicd';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: Developer;
  onOpenCommandPalette: () => void;
  onOpenQuickCreate: () => void;
  onOpenLoginModal: () => void;
  onSignOut?: () => void;
  isSyncing: boolean;
  onManualSync: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  openJiraCount: number;
  openPRCount: number;
  projectsCount?: number;
  onOpenAICopilot?: () => void;
  onOpenTaskGenerator?: () => void;
  onOpenProductivityCoach?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenCommandPalette,
  onOpenQuickCreate,
  onOpenLoginModal,
  onSignOut,
  isSyncing,
  onManualSync,
  soundEnabled,
  onToggleSound,
  focusMode,
  onToggleFocusMode,
  openJiraCount,
  openPRCount,
  projectsCount = 6,
  onOpenAICopilot,
  onOpenTaskGenerator,
  onOpenProductivityCoach,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleTabChange = (tab: NavTab) => {
    soundFx.playSwitch();
    setActiveTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 glass-panel backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Platform Name with Handjet Typography */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => handleTabChange('dashboard')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-emerald-500 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-shadow">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
              </div>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-handjet text-2xl font-bold tracking-widest bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                    DEVPULSE
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono uppercase rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    v3.4.0
                  </span>
                </div>
                <span className="hidden md:inline-block text-[10px] font-mono text-slate-400 tracking-tight -mt-1">
                  Real-time Developer Engine
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Wayfinding Tabs */}
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
            <button
              id="nav-tab-dashboard"
              onClick={() => handleTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              id="nav-tab-projects"
              onClick={() => handleTabChange('projects')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'projects'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-purple-400" />
              <span>Projects & Stacks</span>
            </button>

            <button
              id="nav-tab-jira"
              onClick={() => handleTabChange('jira')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'jira'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Trello className="w-3.5 h-3.5 text-blue-400" />
              <span>Jira Board</span>
              {openJiraCount > 0 && (
                <span className="font-handjet text-sm px-1.5 rounded-full bg-blue-500/30 text-blue-200">
                  {openJiraCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-prs"
              onClick={() => handleTabChange('prs')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'prs'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
              <span>PRs</span>
              {openPRCount > 0 && (
                <span className="font-handjet text-sm px-1.5 rounded-full bg-emerald-500/30 text-emerald-200">
                  {openPRCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-heatmap"
              onClick={() => handleTabChange('heatmap')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'heatmap'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5 text-purple-400" />
              <span>Heatmap</span>
            </button>

            <button
              id="nav-tab-velocity"
              onClick={() => handleTabChange('velocity')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'velocity'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Velocity</span>
            </button>

            <button
              id="nav-tab-integrations"
              onClick={() => handleTabChange('integrations')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'integrations'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cloud & Git</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              id="nav-tab-cicd"
              onClick={() => handleTabChange('cicd')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'cicd'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Fleet</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            
            {/* Quick Command Palette Search Button */}
            <button
              id="cmd-search-btn"
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs transition-all hover:border-cyan-500/40"
              title="Search Jira tickets, PRs, and commands (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">Quick search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Sync Live State Button */}
            <button
              id="sync-live-btn"
              onClick={onManualSync}
              disabled={isSyncing}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition-all hover:text-cyan-300 disabled:opacity-50"
              title="Poll latest Jira & GitHub webhook changes"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline font-mono text-[11px]">
                {isSyncing ? 'Syncing...' : 'Sync'}
              </span>
            </button>

            {/* Focus Mode Flow Toggle */}
            <button
              id="focus-mode-toggle-btn"
              onClick={onToggleFocusMode}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                focusMode 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/20' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={focusMode ? 'Exit Flow Mode' : 'Enter Focus Flow Mode'}
            >
              <Flame className={`w-3.5 h-3.5 ${focusMode ? 'text-amber-400 fill-amber-400' : ''}`} />
              <span className="hidden md:inline font-mono text-[11px]">
                {focusMode ? 'Flow ON' : 'Flow'}
              </span>
            </button>

            {/* Sound FX Toggle */}
            <button
              id="sound-toggle-btn"
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title={soundEnabled ? 'Disable UI sound blips' : 'Enable UI sound blips'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* AI Task Generator Quick Launcher */}
            {onOpenTaskGenerator && (
              <button
                id="ai-task-gen-btn"
                onClick={() => {
                  soundFx.playClick(600, 0.03);
                  onOpenTaskGenerator();
                }}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                title="AI-Assisted Task Generator"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>AI Tasks</span>
              </button>
            )}

            {/* AI Copilot Trigger */}
            {onOpenAICopilot && (
              <button
                id="ai-copilot-btn"
                onClick={() => {
                  soundFx.playClick(750, 0.04);
                  onOpenAICopilot();
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-200 text-xs font-mono font-bold transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
                title="Open DevPulse AI Copilot"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">AI Copilot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {/* Quick Create Button */}
            <button
              id="quick-create-btn"
              onClick={onOpenQuickCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline font-mono">Create</span>
            </button>

            {/* Profile Avatar Pill */}
            <div className="relative">
              <button
                id="user-profile-header-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full glass-pill hover:border-cyan-500/40 transition-all focus:outline-none cursor-pointer"
              >
                <UserAvatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  handle={currentUser.githubHandle || currentUser.handle}
                  size="xs"
                  shape="circle"
                  ringColor="ring-1 ring-cyan-500/40"
                  showStatus={true}
                  status={currentUser.status}
                  statusColor="bg-emerald-400"
                />
                <span className="hidden xl:inline text-xs font-mono text-slate-200">
                  {currentUser.name ? currentUser.name.split(' ')[0] : 'Developer'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl glass-panel border border-slate-700/80 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                    <UserAvatar
                      src={currentUser.avatar}
                      name={currentUser.name}
                      handle={currentUser.githubHandle || currentUser.handle}
                      size="md"
                      shape="circle"
                      ringColor="ring-1 ring-cyan-400"
                      showStatus={true}
                      status={currentUser.status}
                      statusColor="bg-emerald-400"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-100">{currentUser.name}</h4>
                      <p className="text-[11px] font-mono text-cyan-400">@{currentUser.handle}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] text-slate-300 font-mono">{currentUser.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Sprint Velocity:</span>
                      <span className="font-handjet text-base text-cyan-300 font-bold">{currentUser.storyPointsCompleted} pts</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Streak:</span>
                      <span className="font-handjet text-base text-amber-300 font-bold">{currentUser.streakDays} days 🔥</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>PR Merge Rate:</span>
                      <span className="font-handjet text-base text-emerald-300 font-bold">{currentUser.prMergeRate}%</span>
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-slate-800 space-y-1.5">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenLoginModal();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors border border-cyan-500/30 cursor-pointer"
                    >
                      <Github className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Edit Profile & GitHub</span>
                    </button>

                    {onSignOut && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          soundFx.playClick(400, 0.05);
                          onSignOut();
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors border border-rose-500/30 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sign Out of Account</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex xl:hidden overflow-x-auto py-2 gap-1.5 no-scrollbar border-t border-slate-800/60 font-mono">
          {[
            { id: 'dashboard', label: 'Overview', icon: Activity },
            { id: 'projects', label: 'Projects', icon: Boxes },
            { id: 'jira', label: `Jira (${openJiraCount})`, icon: Trello },
            { id: 'prs', label: `PRs (${openPRCount})`, icon: GitPullRequest },
            { id: 'heatmap', label: 'Heatmap', icon: GitCommit },
            { id: 'velocity', label: 'Velocity', icon: TrendingUp },
            { id: 'integrations', label: 'Cloud & Git', icon: Layers },
            { id: 'cicd', label: 'Fleet', icon: PlayCircle },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as NavTab)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
