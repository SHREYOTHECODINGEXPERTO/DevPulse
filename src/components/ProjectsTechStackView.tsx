import React, { useState, useMemo } from 'react';
import { ProjectTechStack, GitHubRealRepo, Developer } from '../types';
import { soundFx } from '../utils/audio';
import { calculateLanguageStats } from '../utils/github';
import { UserAvatar } from './UserAvatar';
import { 
  Layers, 
  Code, 
  GitBranch, 
  Star, 
  GitFork, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  FolderGit2, 
  Sparkles,
  GitCommit,
  Cpu,
  Boxes,
  Terminal,
  Copy,
  Check,
  Github,
  RefreshCw,
  Eye,
  AlertCircle,
  TrendingUp,
  SlidersHorizontal,
  Globe,
  Scale,
  HardDrive,
  CircleDot,
  FileCode,
  Tag,
  Share2
} from 'lucide-react';

interface ProjectsTechStackViewProps {
  projects: ProjectTechStack[];
  realRepos: GitHubRealRepo[];
  currentUser?: Developer;
  onCreateTaskForRepo?: (repoName: string) => void;
  onOpenGitHubSync?: () => void;
  onSyncGitHubUser?: (username: string) => void;
  isGitHubLoading?: boolean;
  onOpenCreateProject?: () => void;
  onSelectProject?: (project: ProjectTechStack) => void;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs)) return 'recently';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 30) return `${diffDay}d ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

function formatRepoSize(sizeKb?: number): string {
  if (!sizeKb || sizeKb <= 0) return '';
  if (sizeKb < 1024) return `${sizeKb} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}

export const ProjectsTechStackView: React.FC<ProjectsTechStackViewProps> = ({
  projects,
  realRepos,
  currentUser,
  onCreateTaskForRepo,
  onOpenGitHubSync,
  onSyncGitHubUser,
  isGitHubLoading,
  onOpenCreateProject,
  onSelectProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sources' | 'forks' | 'has-demo' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'forks' | 'issues' | 'name'>('updated');
  const [copiedCloneUrl, setCopiedCloneUrl] = useState<string | null>(null);
  const [quickUserHandle, setQuickUserHandle] = useState('');

  const activeHandle = currentUser?.githubHandle || currentUser?.githubUsername || currentUser?.handle || '';

  // Collect all unique tech stack badges from real connected repos
  const allTechBadges = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.primaryLanguage) set.add(p.primaryLanguage);
      p.techStackBadges.forEach((b) => set.add(b));
    });
    return Array.from(set).filter(Boolean).sort();
  }, [projects]);

  // Real Language Distribution calculated directly from realRepos
  const languageStats = useMemo(() => {
    if (realRepos.length > 0) {
      return calculateLanguageStats(realRepos);
    }
    const counts: Record<string, number> = {};
    let total = 0;
    projects.forEach((p) => {
      if (p.primaryLanguage) {
        counts[p.primaryLanguage] = (counts[p.primaryLanguage] || 0) + 1;
        total++;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: '#38bdf8',
    })).sort((a, b) => b.count - a.count);
  }, [realRepos, projects]);

  // Filter & Sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = 
          !query ||
          p.repoName.toLowerCase().includes(query) ||
          p.fullName.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.primaryLanguage.toLowerCase().includes(query) ||
          p.techStackBadges.some((t) => t.toLowerCase().includes(query)) ||
          p.defaultBranch.toLowerCase().includes(query);
        
        const matchesTech = 
          selectedTech === 'all' || 
          p.primaryLanguage === selectedTech || 
          p.techStackBadges.includes(selectedTech);

        let matchesType = true;
        if (typeFilter === 'sources') matchesType = !p.isFork;
        else if (typeFilter === 'forks') matchesType = !!p.isFork;
        else if (typeFilter === 'has-demo') matchesType = !!p.homepage;
        else if (typeFilter === 'archived') matchesType = !!p.isArchived;

        return matchesSearch && matchesTech && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return (b.stars || 0) - (a.stars || 0);
        if (sortBy === 'forks') return (b.forks || 0) - (a.forks || 0);
        if (sortBy === 'issues') return (b.openIssues || 0) - (a.openIssues || 0);
        if (sortBy === 'name') return a.repoName.localeCompare(b.repoName);
        // Default 'updated'
        const dateA = new Date(a.lastPushedAt || 0).getTime();
        const dateB = new Date(b.lastPushedAt || 0).getTime();
        return dateB - dateA;
      });
  }, [projects, searchQuery, selectedTech, typeFilter, sortBy]);

  // Aggregate stats strictly from the connected GitHub profile
  const totalStars = projects.reduce((acc, p) => acc + (p.stars || 0), 0);
  const totalForks = projects.reduce((acc, p) => acc + (p.forks || 0), 0);
  const totalOpenIssues = projects.reduce((acc, p) => acc + (p.openIssues || 0), 0);
  const sourceReposCount = projects.filter((p) => !p.isFork).length;
  const forkedReposCount = projects.filter((p) => p.isFork).length;

  const handleCopyClone = (cloneUrl: string) => {
    navigator.clipboard.writeText(cloneUrl);
    setCopiedCloneUrl(cloneUrl);
    soundFx.playClick(900, 0.04);
    setTimeout(() => setCopiedCloneUrl(null), 2000);
  };

  const handleQuickSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickUserHandle.trim() && onSyncGitHubUser) {
      onSyncGitHubUser(quickUserHandle.trim());
      setQuickUserHandle('');
    }
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      TypeScript: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      JavaScript: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      Python: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      Rust: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'Go / Golang': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      Go: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      React: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Next.js': 'bg-white/10 text-white border-white/20',
      'Tailwind CSS': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      'Node.js': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      Docker: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
      PostgreSQL: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      FastAPI: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'AI / LLM': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      HTML: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      CSS: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'C++': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      Java: 'bg-amber-600/20 text-amber-300 border-amber-600/30',
      Vue: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      Shell: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    };
    return colors[lang] || 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div id="projects-github-container" className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Connected GitHub Account HUD */}
      <div id="github-account-hud" className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-white/10 relative overflow-hidden space-y-4 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <UserAvatar
              src={currentUser?.avatar}
              name={currentUser?.name || activeHandle}
              handle={activeHandle || currentUser?.handle}
              size="lg"
              shape="rounded"
              ringColor="ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20"
              showStatus={true}
              status="Live Synced"
              statusColor="bg-emerald-400"
            />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>Connected GitHub Repositories</span>
                </h3>
                {activeHandle && (
                  <a
                    href={`https://github.com/${activeHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 flex items-center gap-1 transition-colors"
                  >
                    <span>@{activeHandle}</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                  </a>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {currentUser?.bio || `Real-time repository sync, topics, stars, and codebases from @${activeHandle || 'connected user'}`}
              </p>
            </div>
          </div>

          {/* Quick Connect / Switch GitHub Account */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {onSyncGitHubUser && (
              <form onSubmit={handleQuickSync} className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <div className="relative flex-1 sm:w-52">
                  <Github className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Switch GitHub handle..."
                    value={quickUserHandle}
                    onChange={(e) => setQuickUserHandle(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isGitHubLoading || !quickUserHandle.trim()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 transition-colors whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGitHubLoading ? 'animate-spin' : ''}`} />
                  <span>{isGitHubLoading ? 'Syncing...' : 'Sync'}</span>
                </button>
              </form>
            )}

            {activeHandle && (
              <a
                href={`https://github.com/${activeHandle}?tab=repositories`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono transition-colors"
                title="Open Repositories on GitHub.com"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>GitHub Tab</span>
              </a>
            )}

            {/* Create Project Workspace Button */}
            {onOpenCreateProject && (
              <button
                onClick={() => {
                  soundFx.playClick(600, 0.04);
                  onOpenCreateProject();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black text-xs font-mono font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
                title="Create a new Project Workspace"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            )}

            {onOpenGitHubSync && (
              <button
                onClick={() => {
                  soundFx.playClick(600, 0.04);
                  onOpenGitHubSync();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono transition-colors cursor-pointer"
                title="Integrations & Settings"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Integrations</span>
              </button>
            )}
          </div>
        </div>

        {/* Real GitHub Account Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
              <span>Public Repositories</span>
              <FolderGit2 className="w-3 h-3 text-purple-400" />
            </span>
            <div className="my-0.5">
              <span className="font-handjet text-3xl font-bold text-purple-300">{projects.length}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">
              {sourceReposCount} sources &middot; {forkedReposCount} forks
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
              <span>Total Stars Earned</span>
              <Star className="w-3 h-3 text-amber-400" />
            </span>
            <div className="my-0.5">
              <span className="font-handjet text-3xl font-bold text-amber-300">{totalStars}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Across all public repos</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
              <span>Total Forks</span>
              <GitFork className="w-3 h-3 text-cyan-400" />
            </span>
            <div className="my-0.5">
              <span className="font-handjet text-3xl font-bold text-cyan-300">{totalForks}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Community derivatives</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between">
              <span>Open Issues / PRs</span>
              <CircleDot className="w-3 h-3 text-emerald-400" />
            </span>
            <div className="my-0.5">
              <span className="font-handjet text-3xl font-bold text-emerald-300">{totalOpenIssues}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Active issue trackers</span>
          </div>
        </div>

        {/* Real Language Breakdown Bar */}
        {languageStats.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300 uppercase font-semibold">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                Primary Language Distribution:
              </span>
              <span>{languageStats.length} Languages Synced</span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-950 border border-white/10">
              {languageStats.map((stat) => (
                <div
                  key={stat.name}
                  style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
                  className="h-full transition-all hover:opacity-80"
                  title={`${stat.name}: ${stat.percentage}% (${stat.count} repos)`}
                />
              ))}
            </div>

            {/* Language Legend Tags */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {languageStats.slice(0, 8).map((stat) => (
                <button
                  key={stat.name}
                  onClick={() => {
                    soundFx.playClick(450, 0.02);
                    setSelectedTech(selectedTech === stat.name ? 'all' : stat.name);
                  }}
                  className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    selectedTech === stat.name
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'text-slate-300 bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span>{stat.name}</span>
                  <span className="text-slate-500">{stat.percentage}%</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Controls: Search, Sorting, Type Filters & Tech Badges */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${projects.length} repositories, topics, languages...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Options */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 font-mono text-xs">
              <span className="text-[10px] text-slate-500 px-1 uppercase flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
              </span>
              <button
                onClick={() => {
                  soundFx.playClick(500, 0.02);
                  setSortBy('updated');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === 'updated' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Sort by latest pushed/updated date"
              >
                Updated
              </button>
              <button
                onClick={() => {
                  soundFx.playClick(500, 0.02);
                  setSortBy('stars');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === 'stars' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Sort by most stars"
              >
                ★ Stars
              </button>
              <button
                onClick={() => {
                  soundFx.playClick(500, 0.02);
                  setSortBy('forks');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === 'forks' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Sort by forks"
              >
                Forks
              </button>
              <button
                onClick={() => {
                  soundFx.playClick(500, 0.02);
                  setSortBy('issues');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === 'issues' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Sort by open issues"
              >
                Issues
              </button>
              <button
                onClick={() => {
                  soundFx.playClick(500, 0.02);
                  setSortBy('name');
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === 'name' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Sort alphabetically A to Z"
              >
                A-Z
              </button>
            </div>

            {/* Type Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto">
              <button
                onClick={() => {
                  soundFx.playClick(500, 0.03);
                  setTypeFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({projects.length})
              </button>
              <button
                onClick={() => {
                  soundFx.playClick(500, 0.03);
                  setTypeFilter('sources');
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  typeFilter === 'sources'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sources ({sourceReposCount})
              </button>
              {forkedReposCount > 0 && (
                <button
                  onClick={() => {
                    soundFx.playClick(500, 0.03);
                    setTypeFilter('forks');
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    typeFilter === 'forks'
                      ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Forks ({forkedReposCount})
                </button>
              )}
              {projects.some((p) => p.homepage) && (
                <button
                  onClick={() => {
                    soundFx.playClick(500, 0.03);
                    setTypeFilter('has-demo');
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    typeFilter === 'has-demo'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Live Demo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tech Stack / Language Filter Pills */}
        {allTechBadges.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-[11px] scrollbar-thin">
            <span className="text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3 h-3" />
              Stack:
            </span>
            <button
              onClick={() => {
                soundFx.playClick(450, 0.02);
                setSelectedTech('all');
              }}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap shrink-0 transition-colors ${
                selectedTech === 'all'
                  ? 'bg-white/20 text-white border-white/30 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              All Tech ({projects.length})
            </button>
            {allTechBadges.map((badge) => (
              <button
                key={badge}
                onClick={() => {
                  soundFx.playClick(500, 0.02);
                  setSelectedTech(selectedTech === badge ? 'all' : badge);
                }}
                className={`px-2.5 py-1 rounded-lg border whitespace-nowrap shrink-0 transition-colors ${
                  selectedTech === badge
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {badge}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Repositories Grid (100% Real GitHub Repos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProjects.map((project) => {
          const cloneUrl = `git clone ${project.htmlUrl}.git`;
          const isCopied = copiedCloneUrl === cloneUrl;
          const relativeTime = formatRelativeTime(project.lastPushedAt);
          const formattedSize = formatRepoSize(project.sizeKb);

          return (
            <div
              key={project.id}
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
            >
              {/* Top Row: Repo Title, Visibility, Default Branch & Badges */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold font-mono text-white truncate">
                          <a 
                            href={project.htmlUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="hover:text-cyan-300 hover:underline flex items-center gap-1.5"
                          >
                            <span className="truncate">{project.repoName}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                          </a>
                        </h4>

                        {project.isFork && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                            Fork
                          </span>
                        )}

                        {project.isArchived && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            Archived
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-0.5">
                        <span className="truncate">{project.fullName}</span>
                        <span>&middot;</span>
                        <span className="text-slate-400 flex items-center gap-0.5 shrink-0">
                          <GitBranch className="w-3 h-3 text-slate-500" />
                          {project.defaultBranch}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Public / Status Pill */}
                  <div className="shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      Public
                    </span>
                  </div>
                </div>

                {/* Description from GitHub */}
                <p className="text-xs font-mono text-slate-300/90 line-clamp-2 leading-relaxed mt-2">
                  {project.description || 'Public repository active in developer workspace.'}
                </p>

                {/* Homepage / Live Site Link if configured on GitHub */}
                {project.homepage && (
                  <div className="mt-2">
                    <a
                      href={project.homepage.startsWith('http') ? project.homepage : `https://${project.homepage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                    >
                      <Globe className="w-3 h-3 text-emerald-400" />
                      <span className="truncate">{project.homepage.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
                    </a>
                  </div>
                )}
              </div>

              {/* Topics & Detected Tech Stack Badges */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
                  <span className="flex items-center gap-1 text-slate-400 font-semibold">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    Languages & Topics:
                  </span>
                  <span>{project.primaryLanguage || 'General'}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {project.primaryLanguage && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${getLanguageColor(
                        project.primaryLanguage
                      )}`}
                    >
                      {project.primaryLanguage}
                    </span>
                  )}

                  {project.techStackBadges
                    .filter((b) => b !== project.primaryLanguage)
                    .slice(0, 6)
                    .map((tech) => (
                      <span
                        key={tech}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${getLanguageColor(tech)}`}
                      >
                        {tech}
                      </span>
                    ))}
                </div>
              </div>

              {/* Clone Command Snippet */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2 truncate pr-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-300 truncate text-[11px] select-all">{cloneUrl}</span>
                </div>
                <button
                  onClick={() => handleCopyClone(cloneUrl)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono shrink-0 transition-colors"
                  title="Copy git clone command"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bottom Metrics & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-amber-300 font-bold" title="GitHub Stars">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    {project.stars || 0}
                  </span>
                  <span className="flex items-center gap-1 text-purple-300 font-bold" title="GitHub Forks">
                    <GitFork className="w-3.5 h-3.5 text-purple-400" />
                    {project.forks || 0}
                  </span>
                  {project.openIssues > 0 && (
                    <span className="flex items-center gap-1 text-emerald-300 font-bold" title="Open Issues">
                      <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
                      {project.openIssues} issues
                    </span>
                  )}
                  {project.license && (
                    <span className="flex items-center gap-1 text-slate-400 text-[10px]" title={`License: ${project.license}`}>
                      <Scale className="w-3 h-3 text-slate-500" />
                      {project.license}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 flex items-center gap-1" title="Last Activity on GitHub">
                    <Clock className="w-3 h-3" />
                    {relativeTime}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <a
                    href={project.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-mono transition-colors"
                    title="Open on GitHub"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {project.openIssues > 0 && (
                    <a
                      href={`${project.htmlUrl}/issues`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono transition-colors"
                      title="Open GitHub Issues"
                    >
                      <span>Issues</span>
                    </a>
                  )}

                  {onSelectProject && (
                    <button
                      onClick={() => {
                        soundFx.playClick(600, 0.03);
                        onSelectProject(project);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-[11px] font-mono transition-colors cursor-pointer"
                      title="View Project Workspace Details & Telemetry"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  )}

                  {onCreateTaskForRepo && (
                    <button
                      onClick={() => {
                        soundFx.playClick(650, 0.04);
                        onCreateTaskForRepo(project.repoName);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-[11px] font-mono transition-colors cursor-pointer"
                      title="Create Sprint Task in Kanban board"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Sprint Task</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Empty State */}
      {filteredProjects.length === 0 && (
        <div className="p-10 text-center bg-slate-900/40 rounded-2xl border border-white/10 font-mono space-y-4 max-w-lg mx-auto">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-16 h-16 mx-auto flex items-center justify-center text-cyan-400">
            <Github className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-base font-bold text-white font-mono">
              {projects.length === 0
                ? `No public repositories found for @${activeHandle || 'connected user'}`
                : 'No repositories match your current filters'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {projects.length === 0
                ? 'Create or push repositories to your GitHub profile, or sync with another GitHub username.'
                : 'Try adjusting your search keywords, clearing language filters, or resetting repo type selections.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {projects.length === 0 ? (
              <>
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create on GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {onSyncGitHubUser && activeHandle && (
                  <button
                    onClick={() => onSyncGitHubUser(activeHandle)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sync Again</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTech('all');
                  setTypeFilter('all');
                  setSortBy('updated');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-mono transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
