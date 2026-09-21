import React, { useState } from 'react';
import { Developer, MemeAvatar } from '../types';
import { TEAM_MEMBERS, CURRENT_DEV } from '../data/mockData';
import { GENZ_MEME_AVATARS, FUNNY_GENZ_DESIGNATIONS, FUNNY_STATUSES } from '../utils/memeAvatars';
import { soundFx } from '../utils/audio';
import { fetchGitHubUser } from '../utils/github';
import { triggerCodeCelebration } from '../utils/celebration';
import { devPulseApi } from '../utils/api';
import { 
  Terminal, 
  Github, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Loader2, 
  Layers, 
  Zap, 
  UserPlus, 
  Cpu, 
  Globe, 
  Code2, 
  KeyRound,
  Radio
} from 'lucide-react';

interface SignInPortalProps {
  onSignInSuccess: (user: Developer, token?: string) => Promise<void> | void;
}

const PRESET_GITHUB_USERS = [
  { handle: 'shadcn', name: 'shadcn', role: 'Creator of shadcn/ui', avatar: 'https://github.com/shadcn.png' },
  { handle: 'torvalds', name: 'Linus Torvalds', role: 'Creator of Linux & Git', avatar: 'https://github.com/torvalds.png' },
  { handle: 'gaearon', name: 'Dan Abramov', role: 'React Core & Redux', avatar: 'https://github.com/gaearon.png' },
  { handle: 'antfu', name: 'Anthony Fu', role: 'Vue / Vite / Nuxt Core', avatar: 'https://github.com/antfu.png' },
  { handle: 'yyx990803', name: 'Evan You', role: 'Creator of Vue & Vite', avatar: 'https://github.com/yyx990803.png' },
];

export const SignInPortal: React.FC<SignInPortalProps> = ({ onSignInSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'github' | 'team' | 'custom'>('github');
  
  // GitHub Sign-In Form State
  const [ghUsername, setGhUsername] = useState('shadcn');
  const [ghToken, setGhToken] = useState('');
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);

  // Custom Account Form State
  const [customName, setCustomName] = useState('Alex Vance');
  const [customHandle, setCustomHandle] = useState('alex_dev');
  const [customEmail, setCustomEmail] = useState('alex@devpulse.io');
  const [customRole, setCustomRole] = useState('Staff Platform & Systems Engineer');
  const [customTeam, setCustomTeam] = useState('Core Platform & Architecture');
  const [customStatus, setCustomStatus] = useState<Developer['status']>('In the Zone');
  const [customBio, setCustomBio] = useState('Architecting low-latency developer observability platforms.');
  const [customAvatar, setCustomAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [selectedMeme, setSelectedMeme] = useState('gigachad_dev');
  const [avatarMode, setAvatarMode] = useState<'memes' | 'url'>('memes');
  const [customAvatarUrlInput, setCustomAvatarUrlInput] = useState('');

  // Handle GitHub Sign-In
  const handleGitHubSubmit = async (e?: React.FormEvent, customPreset?: string) => {
    if (e) e.preventDefault();
    const handleToUse = (customPreset || ghUsername).trim().replace(/^@/, '');
    if (!handleToUse) {
      setGhError('Please enter a GitHub username.');
      return;
    }

    if (customPreset) setGhUsername(customPreset);

    setIsSyncingGithub(true);
    setGhError(null);
    soundFx.playClick(600, 0.04);

    try {
      const userProfile = await fetchGitHubUser(handleToUse, ghToken.trim() || undefined);
      
      const newDevUser: Developer = {
        ...CURRENT_DEV,
        id: `dev_${userProfile.login}`,
        name: userProfile.name || userProfile.login,
        handle: userProfile.login,
        avatar: userProfile.avatar_url || `https://github.com/${userProfile.login}.png`,
        bio: userProfile.bio || 'Open-source software developer & systems architect.',
        team: userProfile.company ? userProfile.company.replace(/^@/, '') : 'Verified Contributor Team',
        role: 'Full-Stack Software Engineer',
        status: 'In the Zone',
        githubUsername: userProfile.login,
        githubHandle: userProfile.login,
        githubToken: ghToken.trim() || undefined,
      };

      triggerCodeCelebration({ particleCount: 65, spread: 80 });
      await onSignInSuccess(newDevUser, ghToken.trim() || undefined);
    } catch (err: any) {
      console.error(err);
      setGhError(err.message || 'Could not verify GitHub account. Please try again.');
      soundFx.playClick(200, 0.08);
    } finally {
      setIsSyncingGithub(false);
    }
  };

  // Handle Team Member Quick Sign-In
  const handleTeamMemberSelect = async (member: Developer) => {
    triggerCodeCelebration({ particleCount: 50, spread: 60 });
    await onSignInSuccess(member);
  };

  // Handle Custom Profile Submit
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerCodeCelebration({ particleCount: 60, spread: 75 });

    const cleanHandle = customHandle.trim().replace(/^@/, '') || 'dev_user';
    const newDev: Developer = {
      ...CURRENT_DEV,
      id: `dev_${cleanHandle}_${Date.now()}`,
      name: customName.trim() || 'Software Engineer',
      handle: cleanHandle,
      role: customRole.trim() || 'Full-Stack Developer',
      team: customTeam.trim() || 'Engineering Squad',
      status: customStatus,
      bio: customBio.trim() || 'Building software and shipping features.',
      avatar: customAvatar || `https://github.com/${cleanHandle}.png`,
      githubUsername: cleanHandle,
      githubHandle: cleanHandle,
    };

    // Register & persist user in backend MongoDB / store
    devPulseApi.createUser({
      name: newDev.name,
      handle: newDev.handle,
      email: customEmail.trim() || `${cleanHandle}@devpulse.io`,
      role: newDev.role,
      team: newDev.team,
      status: newDev.status,
      bio: newDev.bio,
      avatar: newDev.avatar,
    }).catch((err) => console.warn('[Backend User Registration]', err));

    await onSignInSuccess(newDev);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 relative font-mono flex flex-col justify-center items-center px-4 py-8 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background ambient glowing grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Container */}
      <div className="relative w-full max-w-3xl z-10 space-y-6">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs shadow-lg shadow-cyan-500/10">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-bold tracking-widest uppercase">Secure Developer Portal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-emerald-500 p-[1.5px] shadow-xl shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <h1 className="font-handjet text-4xl sm:text-5xl font-bold tracking-widest bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              DEVPULSE
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Please authenticate your developer account to access your live GitHub telemetry, Jira sprint board, commit heatmaps, and CI/CD pipelines.
          </p>
        </div>

        {/* Security Shield Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex items-center justify-between text-xs text-slate-300 shadow-xl">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white">Data Protection Active:</strong> Live telemetry & workspace data are locked until identity is confirmed.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
            UNAUTHENTICATED
          </span>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick(600, 0.03);
                setAuthMethod('github');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all font-bold ${
                authMethod === 'github'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Github className="w-4 h-4 text-cyan-400" />
              <span className="truncate">Sign in with GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick(600, 0.03);
                setAuthMethod('team');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all font-bold ${
                authMethod === 'team'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span className="truncate">Team Quick-Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick(600, 0.03);
                setAuthMethod('custom');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg transition-all font-bold ${
                authMethod === 'custom'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span className="truncate">Custom Profile</span>
            </button>
          </div>

          {/* METHOD 1: REAL GITHUB SIGN-IN */}
          {authMethod === 'github' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Info banner */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Live GitHub REST Data Ingestion
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    5,000 REQ/HR SUPPORTS PAT
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Connect your real GitHub account. Your public repositories, commit activity, language stats, and open PRs will automatically populate the dashboard.
                </p>
              </div>

              {/* Preset Quick Selectors */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                  Or One-Click Connect Open-Source Profiles:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_GITHUB_USERS.map((preset) => (
                    <button
                      key={preset.handle}
                      type="button"
                      onClick={() => handleGitHubSubmit(undefined, preset.handle)}
                      disabled={isSyncingGithub}
                      className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-left transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      <img
                        src={preset.avatar}
                        alt={preset.handle}
                        className="w-7 h-7 rounded-full ring-1 ring-cyan-500/40 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate">
                        <div className="text-xs text-white font-bold group-hover:text-cyan-300 truncate">
                          @{preset.handle}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          {preset.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* GitHub Credentials Form */}
              <form onSubmit={(e) => handleGitHubSubmit(e)} className="space-y-4 pt-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1.5 font-bold">
                    GitHub Username / Organization Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-cyan-400 font-bold">@</span>
                    <input
                      type="text"
                      value={ghUsername}
                      onChange={(e) => {
                        setGhUsername(e.target.value);
                        setGhError(null);
                      }}
                      placeholder="e.g. your_username or torvalds"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center justify-between">
                    <span className="font-bold">Personal Access Token (PAT)</span>
                    <span className="text-slate-500 text-[10px]">(Optional - unlocks private repos)</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={ghToken}
                      onChange={(e) => setGhToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                {ghError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{ghError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSyncingGithub || !ghUsername.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                >
                  {isSyncingGithub ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating & Syncing GitHub...</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4 fill-slate-950" />
                      <span>Sign In & Ingest GitHub Telemetry</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* METHOD 2: TEAM QUICK-LOGIN */}
          {authMethod === 'team' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-xs text-slate-400">
                Select an active DevPulse squad engineer to load their profile, active sprint tasks, and review queues:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEAM_MEMBERS.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleTeamMemberSelect(member)}
                    className="p-3.5 rounded-xl bg-slate-950/80 hover:bg-purple-500/10 border border-slate-800 hover:border-purple-500/40 text-left transition-all flex items-center gap-3.5 group cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/40 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                    </div>

                    <div className="truncate flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-cyan-400 truncate font-mono">
                        @{member.handle}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {member.role}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* METHOD 3: CUSTOM PROFILE REGISTRATION */}
          {authMethod === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4 animate-in fade-in duration-200 text-xs">
              
              {/* Avatar Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Choose Developer Avatar
                  </span>
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setAvatarMode('memes')}
                      className={`px-2 py-0.5 rounded ${avatarMode === 'memes' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
                    >
                      Meme Avatars
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarMode('url')}
                      className={`px-2 py-0.5 rounded ${avatarMode === 'url' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
                    >
                      Custom URL
                    </button>
                  </div>
                </div>

                {avatarMode === 'memes' && (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {GENZ_MEME_AVATARS.map((meme) => (
                      <button
                        key={meme.id}
                        type="button"
                        onClick={() => {
                          soundFx.playPacmanDot();
                          setSelectedMeme(meme.id);
                          setCustomAvatar(meme.url);
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-square border transition-all ${
                          customAvatar === meme.url
                            ? 'border-cyan-400 ring-2 ring-cyan-400/40 scale-105'
                            : 'border-white/10 opacity-70 hover:opacity-100'
                        }`}
                        title={meme.name}
                      >
                        <img
                          src={meme.url}
                          alt={meme.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {avatarMode === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste avatar URL (https://...)"
                      value={customAvatarUrlInput}
                      onChange={(e) => setCustomAvatarUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAvatarUrlInput.trim()) {
                          setCustomAvatar(customAvatarUrlInput.trim());
                          soundFx.playClick(800, 0.05);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Developer Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={customHandle}
                    onChange={(e) => setCustomHandle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-cyan-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Squad / Team
                  </label>
                  <input
                    type="text"
                    value={customTeam}
                    onChange={(e) => setCustomTeam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Create & Enter Dashboard</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
